# -*- coding: utf-8 -*-
"""
Module Bi-Encoder pour CodeMind.
Définit l'architecture du bi-encodeur basée sur CodeBERT (ou BERT léger)
et intègre LoRA pour un fine-tuning efficace.
"""

import os
import torch
import torch.nn as nn
from transformers import BertModel, BertConfig
from peft import get_peft_model, LoraConfig, TaskType

class BiEncoder(nn.Module):
    def __init__(self, model_name: str = "prajjwal1/bert-tiny", use_lora: bool = True, lora_r: int = 8, lora_alpha: int = 16, lora_dropout: float = 0.1):
        """
        Initialise le Bi-Encoder. Le modèle de base encode à la fois les requêtes textuelles
        et le code source dans le même espace vectoriel (partage de paramètres).
        """
        super().__init__()
        self.config = BertConfig.from_pretrained(model_name)
        self.base_model = BertModel.from_pretrained(model_name)
        
        self.use_lora = use_lora
        if use_lora:
            # Configuration de LoRA pour un modèle de type Sequence Classification / Feature Extraction
            peft_config = LoraConfig(
                task_type=TaskType.FEATURE_EXTRACTION,
                r=lora_r,
                lora_alpha=lora_alpha,
                lora_dropout=lora_dropout,
                target_modules=["query", "value"]  # Cible standard pour BERT
            )
            # Récupération du modèle adapté avec LoRA
            self.base_model = get_peft_model(self.base_model, peft_config)
            print("LoRA configuré avec succès sur le modèle de base !")

    def mean_pooling(self, model_output, attention_mask):
        """
        Effectue un mean pooling pondéré par le masque d'attention pour obtenir un vecteur fixe.
        """
        token_embeddings = model_output[0] # Premier élément contient les embeddings de tous les tokens
        input_mask_expanded = attention_mask.unsqueeze(-1).expand(token_embeddings.size()).float()
        sum_embeddings = torch.sum(token_embeddings * input_mask_expanded, 1)
        sum_mask = torch.clamp(input_mask_expanded.sum(1), min=1e-9)
        return sum_embeddings / sum_mask

    def encode(self, input_ids, attention_mask) -> torch.Tensor:
        """
        Passe avant générique pour encoder une séquence d'entrée (texte ou code).
        """
        outputs = self.base_model(input_ids=input_ids, attention_mask=attention_mask)
        # Utilisation du Mean Pooling pour des embeddings robustes
        embeddings = self.mean_pooling(outputs, attention_mask)
        # Normalisation L2 optionnelle pour faciliter la similarité cosinus (FAISS FlatIP utilise le produit scalaire sur vecteurs normalisés)
        embeddings = nn.functional.normalize(embeddings, p=2, dim=1)
        return embeddings

    def forward(self, text_input_ids, text_attention_mask, code_input_ids, code_attention_mask):
        """
        Retourne les vecteurs de la docstring et du code pour l'entraînement contrastif.
        """
        text_embeddings = self.encode(text_input_ids, text_attention_mask)
        code_embeddings = self.encode(code_input_ids, code_attention_mask)
        return text_embeddings, code_embeddings

    def save_pretrained(self, save_directory: str):
        """
        Sauvegarde le modèle complet (modèle de base + adaptateurs PEFT).
        """
        os.makedirs(save_directory, exist_ok=True)
        # Sauvegarde du modèle de base
        self.base_model.save_pretrained(save_directory)
        print(f"Modèle sauvegardé dans : {save_directory}")

    @classmethod
    def from_pretrained(cls, save_directory: str, base_model_name: str = "prajjwal1/bert-tiny", use_lora: bool = True):
        """
        Charge un modèle préalablement entraîné.
        """
        instance = cls(model_name=base_model_name, use_lora=False) # On crée sans LoRA pour charger
        from peft import PeftModel
        if use_lora and os.path.exists(save_directory):
            instance.base_model = PeftModel.from_pretrained(instance.base_model, save_directory)
            print(f"Modèle avec adaptateurs LoRA chargé depuis : {save_directory}")
        else:
            instance.base_model = BertModel.from_pretrained(save_directory)
            print(f"Modèle complet chargé depuis : {save_directory}")
        return instance
