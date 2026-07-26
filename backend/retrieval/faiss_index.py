# -*- coding: utf-8 -*-
"""
Module d'indexation vectorielle FAISS pour CodeMind.
Permet d'indexer les embeddings de code, d'enregistrer l'index et de rechercher
le top-k des fonctions similaires par rapport à une requête.
"""

import os
import json
import faiss
import numpy as np
from typing import List, Dict, Any, Tuple

class FAISSIndexManager:
    def __init__(self, index_path: str, mapping_path: str, embedding_dim: int = 128):
        """
        Initialise le gestionnaire d'index FAISS.
        """
        self.index_path = index_path
        self.mapping_path = mapping_path
        self.embedding_dim = embedding_dim
        
        # IndexFlatIP (Inner Product) convient pour la similarité cosinus sur vecteurs normalisés
        self.index = faiss.IndexFlatIP(embedding_dim)
        self.mapping: Dict[str, Dict[str, Any]] = {}

    def add_vectors(self, embeddings: np.ndarray, metadata_list: List[Dict[str, Any]]):
        """
        Ajoute un ensemble d'embeddings et leurs métadonnées associées à l'index.
        """
        assert len(embeddings) == len(metadata_list), "Le nombre d'embeddings doit égaler le nombre de métadonnées."
        
        # S'assurer que les embeddings sont bien typés float32 et normalisés L2
        embeddings = np.ascontiguousarray(embeddings.astype('float32'))
        
        # Normalisation L2 manuelle au cas où
        norms = np.linalg.norm(embeddings, axis=1, keepdims=True)
        embeddings = embeddings / np.where(norms == 0, 1e-9, norms)
        
        start_id = self.index.ntotal
        self.index.add(embeddings)
        
        # Mise à jour du mapping d'identifiants
        for i, meta in enumerate(metadata_list):
            faiss_id = str(start_id + i)
            self.mapping[faiss_id] = meta

    def save(self):
        """
        Sauvegarde l'index vectoriel et son mapping JSON sur le disque.
        """
        os.makedirs(os.path.dirname(self.index_path), exist_ok=True)
        os.makedirs(os.path.dirname(self.mapping_path), exist_ok=True)
        
        faiss.write_index(self.index, self.index_path)
        with open(self.mapping_path, 'w', encoding='utf-8') as f:
            json.dump(self.mapping, f, ensure_ascii=False, indent=2)
        print(f"Index FAISS sauvegardé ({self.index.ntotal} vecteurs).")

    def load(self) -> bool:
        """
        Charge l'index vectoriel et son mapping JSON depuis le disque.
        """
        if os.path.exists(self.index_path) and os.path.exists(self.mapping_path):
            self.index = faiss.read_index(self.index_path)
            with open(self.mapping_path, 'r', encoding='utf-8') as f:
                self.mapping = json.load(f)
            print(f"Index FAISS chargé avec succès ({self.index.ntotal} vecteurs).")
            return True
        print("Avertissement : Index ou mapping manquant sur le disque.")
        return False

    def search(self, query_embedding: np.ndarray, top_k: int = 5) -> List[Tuple[Dict[str, Any], float]]:
        """
        Recherche les vecteurs les plus proches de l'embedding de requête.
        Retourne une liste de tuples (métadonnées, score de similarité).
        """
        # Formater l'embedding de requête
        query_embedding = np.ascontiguousarray(query_embedding.astype('float32')).reshape(1, -1)
        # Normaliser
        norm = np.linalg.norm(query_embedding)
        if norm > 0:
            query_embedding = query_embedding / norm
            
        # Recherche FAISS
        scores, indices = self.index.search(query_embedding, top_k)
        
        results = []
        for score, idx in zip(scores[0], indices[0]):
            if idx == -1:
                continue
            str_idx = str(idx)
            if str_idx in self.mapping:
                # Retourne une copie des métadonnées de la fonction, avec son score de similarité
                meta_copy = dict(self.mapping[str_idx])
                results.append((meta_copy, float(score)))
                
        return results
