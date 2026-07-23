# -*- coding: utf-8 -*-
"""
Script de construction de l'index FAISS de référence (Baseline).
Utilise le modèle de base pré-entraîné non fine-tuné pour générer les embeddings du corpus.
"""

import os
import json
import yaml
import torch
import numpy as np
from transformers import BertTokenizer, BertModel
from retrieval.faiss_index import FAISSIndexManager
from models.bi_encoder import BiEncoder

def build_baseline():
    print("Chargement de la configuration...")
    with open("configs/config.yaml", "r", encoding="utf-8") as f:
        config = yaml.safe_load(f)

    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    base_model_name = config["model"]["base_model_name"]
    corpus_path = config["dataset"]["processed_jsonl"]
    index_path = config["retrieval"]["baseline_index_path"]
    mapping_path = config["retrieval"]["mapping_path"]

    if not os.path.exists(corpus_path):
        print("Erreur : Le corpus n'existe pas. Lancement de prepare_codesearchnet...")
        from services.prepare_codesearchnet import prepare_corpus
        prepare_corpus()

    # Chargement du corpus complet
    corpus = []
    with open(corpus_path, 'r', encoding='utf-8') as f:
        for line in f:
            if line.strip():
                corpus.append(json.loads(line))

    print(f"Chargement du modèle de base : {base_model_name}")
    # Initialisation du bi-encodeur non fine-tuné
    encoder = BiEncoder(model_name=base_model_name, use_lora=False).to(device)
    encoder.eval()

    # Détermination de la dimension d'embedding
    embedding_dim = encoder.config.hidden_size

    print(f"Initialisation de l'index FAISS Baseline (Dim : {embedding_dim})...")
    # Pour la baseline, on peut réutiliser le mapping global
    manager = FAISSIndexManager(index_path=index_path, mapping_path=mapping_path.replace(".json", "_baseline.json"), embedding_dim=embedding_dim)

    tokenizer = BertTokenizer.from_pretrained(base_model_name)
    max_seq_length = config["training"]["max_seq_length"]

    print("Génération des embeddings pour la baseline (Mean Pooling)...")
    all_embeddings = []
    
    with torch.no_grad():
        for i, entry in enumerate(corpus):
            # On combine la docstring et le nom de la fonction pour créer une entrée riche (Feature engineering)
            text_to_encode = f"function {entry['name']}: {entry['docstring']}"
            
            inputs = tokenizer(
                text_to_encode,
                max_length=max_seq_length,
                padding="max_length",
                truncation=True,
                return_tensors="pt"
            ).to(device)
            
            embedding = encoder.encode(inputs["input_ids"], inputs["attention_mask"])
            all_embeddings.append(embedding.cpu().numpy()[0])
            
            if (i + 1) % 20 == 0:
                print(f"Indexation de {i + 1}/{len(corpus)} fonctions...")

    all_embeddings = np.array(all_embeddings)
    manager.add_vectors(all_embeddings, corpus)
    manager.save()
    print("Index FAISS de référence (Baseline) créé avec succès !")

if __name__ == "__main__":
    build_baseline()
