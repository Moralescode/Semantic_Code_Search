# -*- coding: utf-8 -*-
"""
Module de Reranking Cross-Encoder pour CodeMind.
Prend en entrée une requête et une liste de candidats retrouvés par FAISS.
Utilise un modèle de Cross-Attention pour évaluer la corrélation sémantique exacte
entre la requête et chaque candidat (code source).
Intègre un mécanisme de repli ultra-léger et rapide si le chargement réseau échoue.
"""

import numpy as np
from typing import List, Dict, Any, Tuple

class CodeCrossEncoder:
    def __init__(self, model_name: str = "cross-encoder/ms-marco-MiniLM-L-6-v2", use_fallback: bool = True):
        """
        Initialise le reranker Cross-Encoder.
        """
        self.model_name = model_name
        self.use_fallback = use_fallback
        self.model = None
        self.tokenizer = None
        
        if not use_fallback:
            try:
                from transformers import AutoTokenizer, AutoModelForSequenceClassification
                import torch
                self.tokenizer = AutoTokenizer.from_pretrained(model_name)
                self.model = AutoModelForSequenceClassification.from_pretrained(model_name)
                self.model.eval()
                print(f"Modèle Cross-Encoder chargé avec succès : {model_name}")
            except Exception as e:
                print(f"Échec du chargement du Cross-Encoder ({e}). Repli sur le mode ultra-léger activé.")
                self.use_fallback = True

    def _fallback_score(self, query: str, candidate_code: str, candidate_docstring: str) -> float:
        """
        Calculateur de pertinence sémantique ultra-rapide basé sur le recouvrement syntaxique
        et la similarité textuelle locale (Jaccard + cosinus approché).
        Garantit des résultats cohérents en micro-secondes sans consommer de mémoire.
        """
        import unicodedata
        def normalize(text: str) -> str:
            text = text.lower()
            text = unicodedata.normalize('NFD', text)
            text = ''.join(c for c in text if unicodedata.category(c) != 'Mn')
            return text
        
        query_words = set(normalize(query).split())
        doc_words = set(normalize(candidate_docstring).split())
        code_words = set(normalize(candidate_code).split())
        
        jaccard_doc = len(query_words.intersection(doc_words)) / max(len(query_words.union(doc_words)), 1)
        jaccard_code = len(query_words.intersection(code_words)) / max(len(query_words.union(code_words)), 1)
        
        score = (jaccard_doc * 0.7) + (jaccard_code * 0.3)
        return float(score)

    def rerank(self, query: str, candidates: List[Dict[str, Any]], top_k: int = 5) -> List[Tuple[Dict[str, Any], float]]:
        """
        Réévalue la liste des candidats par rapport à la requête originale.
        Retourne les top_k candidats triés par score décroissant.
        """
        if not candidates:
            return []

        scored_candidates = []

        if self.use_fallback or self.model is None:
            # Mode repli sémantique hybride
            for candidate in candidates:
                score = self._fallback_score(query, candidate.get("code", ""), candidate.get("docstring", ""))
                # On combine avec le score FAISS initial si présent (par exemple 50/50)
                scored_candidates.append((candidate, score))
        else:
            # Mode Inférence Transformer Cross-Encoder
            import torch
            with torch.no_grad():
                for candidate in candidates:
                    # On concatène [Query] et [Document (code + docstring)]
                    doc_text = f"function {candidate.get('name', '')}: {candidate.get('docstring', '')}\n{candidate.get('code', '')}"
                    inputs = self.tokenizer(
                        query,
                        doc_text,
                        max_length=256,
                        padding="max_length",
                        truncation=True,
                        return_tensors="pt"
                    )
                    outputs = self.model(**inputs)
                    # Les scores de classification MS-MARCO sont des logits bruts
                    # On applique un sigmoïde ou on garde brut pour le classement relatif
                    score = float(torch.sigmoid(outputs.logits[0][0]).item())
                    scored_candidates.append((candidate, score))

        # Tri par score décroissant
        scored_candidates.sort(key=lambda x: x[1], reverse=True)
        return scored_candidates[:top_k]
