# -*- coding: utf-8 -*-
"""
Script de construction de l'index FAISS optimisé (Fine-tuné).
Utilise le modèle fine-tuné avec LoRA pour générer des embeddings de code sémantiquement enrichis.
Si le modèle fine-tuné n'existe pas encore, propose de lancer l'entraînement de démonstration.
"""

import os
import json
import yaml
import torch
import numpy as np
from transformers import BertTokenizer
from retrieval.faiss_index import FAISSIndexManager
from models.bi_encoder import BiEncoder

def build_finetuned_index():
    print("Chargement de la configuration...")
    with open("configs/config.yaml", "r", encoding="utf-8") as f:
        config = yaml.safe_load(f)

    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    base_model_name = config["model"]["base_model_name"]
    finetuned_model_path = config["model"]["finetuned_model_path"]
    corpus_path = config["dataset"]["processed_jsonl"]
    index_path = config["retrieval"]["index_path"]
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

    # Chargement du modèle fine-tuné si existant, sinon repli sur le baseline
    if os.path.exists(finetuned_model_path):
        print(f"Chargement du modèle optimisé depuis : {finetuned_model_path}")
        encoder = BiEncoder.from_pretrained(
            save_directory=finetuned_model_path,
            base_model_name=base_model_name,
            use_lora=config["model"]["use_lora"]
        ).to(device)
    else:
        print(f"ATTENTION : Modèle fine-tuné introuvable à l'emplacement '{finetuned_model_path}'.")
        print("Lancement d'un entraînement rapide pour générer le modèle fine-tuné...")
        from models.train_biencoder import train_model
        train_model()
        
        # Re-tentative de chargement
        if os.path.exists(finetuned_model_path):
            encoder = BiEncoder.from_pretrained(
                save_directory=finetuned_model_path,
                base_model_name=base_model_name,
                use_lora=config["model"]["use_lora"]
            ).to(device)
        else:
            print("Échec de l'entraînement. Repli sur le modèle de base (Baseline) pour l'index optimisé.")
            encoder = BiEncoder(model_name=base_model_name, use_lora=False).to(device)

    encoder.eval()
    embedding_dim = encoder.config.hidden_size

    print(f"Initialisation de l'index FAISS optimisé (Dim : {embedding_dim})...")
    manager = FAISSIndexManager(index_path=index_path, mapping_path=mapping_path, embedding_dim=embedding_dim)

    tokenizer = BertTokenizer.from_pretrained(base_model_name)
    max_seq_length = config["training"]["max_seq_length"]

    print("Génération des embeddings optimisés par le modèle fine-tuné...")
    all_embeddings = []
    
    with torch.no_grad():
        for i, entry in enumerate(corpus):
            # Feature engineering: combinaison nom de fonction + docstring + langage
            text_to_encode = f"[{entry['language']}] function {entry['name']}: {entry['docstring']}"
            
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
                print(f"Indexation optimisée de {i + 1}/{len(corpus)} fonctions...")

    all_embeddings = np.array(all_embeddings)
    manager.add_vectors(all_embeddings, corpus)
    manager.save()
    print("Index FAISS optimisé (Fine-tuné) créé avec succès !")

if __name__ == "__main__":
    build_finetuned_index()
