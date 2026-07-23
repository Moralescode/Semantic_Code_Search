# -*- coding: utf-8 -*-
"""
Module PyTorch Dataset pour l'entraînement contrastif du Bi-Encoder de CodeMind.
Permet de charger les paires (docstring, code) pour l'entraînement.
"""

import json
import torch
from torch.utils.data import Dataset
from transformers import BertTokenizer

class CodeSearchDataset(Dataset):
    def __init__(self, jsonl_path: str, tokenizer_name: str, max_seq_length: int = 128):
        """
        Initialise le Dataset en chargeant le corpus JSONL et le tokeniseur HuggingFace.
        """
        self.samples = []
        self.tokenizer = BertTokenizer.from_pretrained(tokenizer_name)
        self.max_seq_length = max_seq_length
        
        # Chargement des données
        with open(jsonl_path, 'r', encoding='utf-8') as f:
            for line in f:
                if line.strip():
                    self.samples.append(json.loads(line))

    def __len__(self):
        return len(self.samples)

    def __getitem__(self, idx: int):
        """
        Retourne les entrées tokenisées pour la docstring et le code.
        """
        sample = self.samples[idx]
        docstring = sample.get("docstring", "")
        code = sample.get("code", "")
        
        # Tokenisation du texte (docstring / query)
        text_inputs = self.tokenizer(
            docstring,
            max_length=self.max_seq_length,
            padding="max_length",
            truncation=True,
            return_tensors="pt"
        )
        
        # Tokenisation du code
        code_inputs = self.tokenizer(
            code,
            max_length=self.max_seq_length,
            padding="max_length",
            truncation=True,
            return_tensors="pt"
        )
        
        # On supprime la dimension batch ajoutée par le tokenizer avec return_tensors="pt"
        item = {
            "text_input_ids": text_inputs["input_ids"].squeeze(0),
            "text_attention_mask": text_inputs["attention_mask"].squeeze(0),
            "code_input_ids": code_inputs["input_ids"].squeeze(0),
            "code_attention_mask": code_inputs["attention_mask"].squeeze(0)
        }
        
        return item
