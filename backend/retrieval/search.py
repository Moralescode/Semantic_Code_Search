# -*- coding: utf-8 -*-
"""
Module principal de recherche sémantique combinant FAISS (Retrieval) et Cross-Encoder (Reranking).
Propose une recherche sémantique performante et robuste, avec filtrage par langage de programmation.
"""

import os
import yaml
import torch
import numpy as np
from transformers import BertTokenizer
from models.bi_encoder import BiEncoder
from retrieval.faiss_index import FAISSIndexManager
from reranking.cross_encoder import CodeCrossEncoder

class CodeSearchEngine:
    _instance = None

    def __new__(cls, *args, **kwargs):
        """
        Implémentation d'un Singleton pour éviter de recharger les modèles en mémoire
        à chaque nouvelle recherche (ce qui détruirait les performances de l'API).
        """
        if cls._instance is None:
            cls._instance = super(CodeSearchEngine, cls).__new__(cls)
            cls._instance._initialized = False
        return cls._instance

    def __init__(self, config_path: str = None):
        if self._initialized:
            return
        if config_path is None:
            config_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "configs", "config.yaml")
            
        print("Initialisation du moteur de recherche sémantique CodeMind...")
        with open(config_path, "r", encoding="utf-8") as f:
            self.config = yaml.safe_load(f)

        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        self.base_model_name = self.config["model"]["base_model_name"]
        self.max_seq_length = self.config["training"]["max_seq_length"]
        
        # 1. Chargement des Tokenizers et Modèles
        self.tokenizer = BertTokenizer.from_pretrained(self.base_model_name)
        
        # Modèle de base (Baseline)
        print("Chargement du modèle de base (Baseline)...")
        self.baseline_encoder = BiEncoder(model_name=self.base_model_name, use_lora=False).to(self.device)
        self.baseline_encoder.eval()
        
        # Modèle Fine-tuné (si disponible)
        finetuned_path = self.config["model"]["finetuned_model_path"]
        if os.path.exists(finetuned_path):
            print(f"Chargement du modèle optimisé depuis : {finetuned_path}")
            self.finetuned_encoder = BiEncoder.from_pretrained(
                save_directory=finetuned_path,
                base_model_name=self.base_model_name,
                use_lora=self.config["model"]["use_lora"]
            ).to(self.device)
            self.finetuned_encoder.eval()
        else:
            print("ATTENTION : Modèle fine-tuné absent. Utilisation du baseline pour toutes les requêtes.")
            self.finetuned_encoder = self.baseline_encoder

        # 2. Gestionnaires d'Index FAISS
        embedding_dim = self.baseline_encoder.config.hidden_size
        
        self.baseline_index_manager = FAISSIndexManager(
            index_path=self.config["retrieval"]["baseline_index_path"],
            mapping_path=self.config["retrieval"]["mapping_path"].replace(".json", "_baseline.json"),
            embedding_dim=embedding_dim
        )
        self.baseline_index_manager.load()
        
        self.finetuned_index_manager = FAISSIndexManager(
            index_path=self.config["retrieval"]["index_path"],
            mapping_path=self.config["retrieval"]["mapping_path"],
            embedding_dim=embedding_dim
        )
        self.finetuned_index_manager.load()

        # 3. Reranker (Cross-Encoder)
        self.reranker = CodeCrossEncoder(
            model_name=self.config["cross_encoder"]["model_name"],
            use_fallback=True # Repli sémantique ultra-rapide par défaut pour économiser CPU/RAM
        )

        self._initialized = True
        print("Moteur de recherche CodeMind prêt à l'emploi !")

    def search(self, query: str, language: str = None, top_k: int = 5, use_rerank: bool = True, use_baseline: bool = False) -> list:
        """
        Pipeline complet de recherche :
        1. Vectorisation de la requête (Bi-Encoder baseline ou fine-tuné).
        2. Recherche de candidats proches via l'index FAISS sélectionné.
        3. Filtrage par langage de programmation.
        4. Optionnel : Réordonnancement des candidats par le Cross-Encoder (Reranking).
        """
        # Choisir le bon encodeur et index
        encoder = self.baseline_encoder if use_baseline else self.finetuned_encoder
        index_manager = self.baseline_index_manager if use_baseline else self.finetuned_index_manager

        # Si l'index est vide, on retourne une liste vide
        if index_manager.index.ntotal == 0:
            print("Erreur : L'index FAISS est vide. Veuillez exécuter la construction de l'index.")
            return []

        # 1. Encodage de la requête
        with torch.no_grad():
            # Enrichissement de la requête en ajoutant des informations de contexte sémantique si le langage est spécifié
            enriched_query = f"[{language}] {query}" if language else query
            
            inputs = self.tokenizer(
                enriched_query,
                max_length=self.max_seq_length,
                padding="max_length",
                truncation=True,
                return_tensors="pt"
            ).to(self.device)
            
            query_embedding = encoder.encode(inputs["input_ids"], inputs["attention_mask"]).cpu().numpy()[0]

        # 2. Recherche FAISS (on récupère top_k * 3 candidats pour filtrer et réordonner efficacement)
        retrieve_k = top_k * 4 if use_rerank else top_k
        raw_results = index_manager.search(query_embedding, top_k=retrieve_k)

        # 3. Filtrage par langage de programmation
        filtered_candidates = []
        for meta, score in raw_results:
            if language:
                if meta.get("language", "").lower() == language.lower():
                    filtered_candidates.append((meta, score))
            else:
                filtered_candidates.append((meta, score))

        # S'il n'y a pas assez de candidats filtrés, on s'adapte
        if not filtered_candidates:
            return []

        # 4. Reranking (Cross-Encoder)
        if use_rerank:
            # Séparer les dictionnaires pour le reranker
            candidate_dicts = [item[0] for item in filtered_candidates]
            reranked_results = self.reranker.rerank(query, candidate_dicts, top_k=top_k)
            
            # Formatage de retour standardisé
            formatted_results = []
            for idx, (meta, score) in enumerate(reranked_results):
                formatted_results.append({
                    "id": meta.get("name") or f"result_{idx}",
                    "name": meta.get("name"),
                    "language": meta.get("language"),
                    "docstring": meta.get("docstring"),
                    "code": meta.get("code"),
                    "arguments": meta.get("arguments", []),
                    "score": score
                })
            return formatted_results
        else:
            # Sans Reranking : on prend simplement les premiers selon FAISS
            formatted_results = []
            for idx, (meta, score) in enumerate(filtered_candidates[:top_k]):
                formatted_results.append({
                    "id": meta.get("name") or f"result_{idx}",
                    "name": meta.get("name"),
                    "language": meta.get("language"),
                    "docstring": meta.get("docstring"),
                    "code": meta.get("code"),
                    "arguments": meta.get("arguments", []),
                    "score": float(score)
                })
            return formatted_results
