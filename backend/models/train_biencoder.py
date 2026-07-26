# -*- coding: utf-8 -*-
"""
Script d'entraînement supervisé du Bi-Encoder CodeMind par apprentissage contrastif (InfoNCE).
Optimise l'alignement sémantique entre les docstrings et le code source des fonctions.
"""

import os
import yaml
import torch
import torch.nn as nn
from torch.utils.data import DataLoader, random_split
from torch.optim import AdamW
from models.bi_encoder import BiEncoder
from services.dataset import CodeSearchDataset

# Définition de la perte InfoNCE (Contrastive Loss)
class InfoNCELoss(nn.Module):
    def __init__(self, temperature: float = 0.07):
        super().__init__()
        self.temperature = temperature
        self.cross_entropy = nn.CrossEntropyLoss()

    def forward(self, text_embeddings, code_embeddings):
        """
        Calcule la perte contrastive bidirectionnelle (texte -> code et code -> texte).
        """
        batch_size = text_embeddings.size(0)
        # Similarité cosinus entre tous les couples (texte, code)
        # Comme les vecteurs sont déjà normalisés L2, le produit matriciel donne la similarité cosinus
        similarity_matrix = torch.matmul(text_embeddings, code_embeddings.T) / self.temperature
        
        # Les cibles sont les éléments de la diagonale (chaque texte correspond au code de même indice)
        labels = torch.arange(batch_size, device=text_embeddings.device)
        
        # Perte dans les deux sens
        loss_text_to_code = self.cross_entropy(similarity_matrix, labels)
        loss_code_to_text = self.cross_entropy(similarity_matrix.T, labels)
        
        return (loss_text_to_code + loss_code_to_text) / 2.0

def train_model():
    print("Chargement de la configuration...")
    with open("configs/config.yaml", "r", encoding="utf-8") as f:
        config = yaml.safe_load(f)

    # Paramètres d'entraînement
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    print(f"Utilisation du périphérique : {device}")

    base_model_name = config["model"]["base_model_name"]
    max_seq_length = config["training"]["max_seq_length"]
    batch_size = config["training"]["batch_size"]
    epochs = config["training"]["epochs"]
    learning_rate = float(config["training"]["learning_rate"])
    save_path = config["model"]["finetuned_model_path"]

    # Initialisation du dataset
    corpus_path = config["dataset"]["processed_jsonl"]
    if not os.path.exists(corpus_path):
        print("Erreur : Le corpus traité n'existe pas. Lancement de prepare_codesearchnet...")
        from services.prepare_codesearchnet import prepare_corpus
        prepare_corpus()

    print("Chargement et tokenisation du jeu de données...")
    full_dataset = CodeSearchDataset(
        jsonl_path=corpus_path,
        tokenizer_name=base_model_name,
        max_seq_length=max_seq_length
    )

    # Split train/val
    train_size = int(0.8 * len(full_dataset))
    val_size = len(full_dataset) - train_size
    train_dataset, val_dataset = random_split(
        full_dataset, 
        [train_size, val_size],
        generator=torch.Generator().manual_seed(42)
    )

    train_loader = DataLoader(train_dataset, batch_size=batch_size, shuffle=True)
    val_loader = DataLoader(val_dataset, batch_size=batch_size, shuffle=False)

    print(f"Échantillons d'entraînement : {len(train_dataset)}, de validation : {len(val_dataset)}")

    # Initialisation du modèle
    model = BiEncoder(
        model_name=base_model_name,
        use_lora=config["model"]["use_lora"],
        lora_r=config["model"]["lora_r"],
        lora_alpha=config["model"]["lora_alpha"],
        lora_dropout=config["model"]["lora_dropout"]
    ).to(device)

    # Optimiseur et perte
    optimizer = AdamW(model.parameters(), lr=learning_rate, weight_decay=0.01)
    criterion = InfoNCELoss(temperature=0.07)

    best_val_loss = float("inf")

    print("Début de l'entraînement...")
    for epoch in range(epochs):
        model.train()
        total_train_loss = 0.0
        
        for batch in train_loader:
            optimizer.zero_grad()
            
            # Transfert sur device
            text_ids = batch["text_input_ids"].to(device)
            text_mask = batch["text_attention_mask"].to(device)
            code_ids = batch["code_input_ids"].to(device)
            code_mask = batch["code_attention_mask"].to(device)
            
            # Passage avant
            text_embeds, code_embeds = model(text_ids, text_mask, code_ids, code_mask)
            
            # Perte
            loss = criterion(text_embeds, code_embeds)
            
            # Rétropropagation
            loss.backward()
            optimizer.step()
            
            total_train_loss += loss.item()

        # Évaluation sur l'ensemble de validation
        model.eval()
        total_val_loss = 0.0
        with torch.no_grad():
            for batch in val_loader:
                text_ids = batch["text_input_ids"].to(device)
                text_mask = batch["text_attention_mask"].to(device)
                code_ids = batch["code_input_ids"].to(device)
                code_mask = batch["code_attention_mask"].to(device)
                
                text_embeds, code_embeds = model(text_ids, text_mask, code_ids, code_mask)
                loss = criterion(text_embeds, code_embeds)
                total_val_loss += loss.item()

        avg_train_loss = total_train_loss / len(train_loader)
        avg_val_loss = total_val_loss / len(val_loader) if len(val_loader) > 0 else 0.0

        print(f"Époque {epoch+1}/{epochs} | Train Loss: {avg_train_loss:.4f} | Val Loss: {avg_val_loss:.4f}")

        # Sauvegarde du meilleur modèle (surapprentissage évité)
        if avg_val_loss < best_val_loss:
            best_val_loss = avg_val_loss
            model.save_pretrained(save_path)
            print("=> Meilleur modèle sauvegardé (amélioration de la perte de validation)")

    print("Entraînement terminé avec succès !")

if __name__ == "__main__":
    train_model()
