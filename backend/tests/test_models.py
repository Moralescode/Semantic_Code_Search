# -*- coding: utf-8 -*-
"""
Tests unitaires pour les modèles d'apprentissage profond de CodeMind.
"""

import torch
import numpy as np
from models.bi_encoder import BiEncoder
from reranking.cross_encoder import CodeCrossEncoder

def test_biencoder_init():
    # Test d'initialisation avec bert-tiny
    encoder = BiEncoder(model_name="prajjwal1/bert-tiny", use_lora=False)
    assert encoder.config is not None
    assert encoder.base_model is not None

def test_mean_pooling():
    encoder = BiEncoder(model_name="prajjwal1/bert-tiny", use_lora=False)
    # Simulation de la sortie d'un modèle (batch_size=1, seq_length=3, hidden_dim=128)
    token_embeddings = torch.randn(1, 3, 128)
    attention_mask = torch.tensor([[1, 1, 0]]) # Le dernier token est masqué
    
    # Appel de mean_pooling
    # Pour simuler model_output, on passe un tuple
    model_output = (token_embeddings,)
    pooled = encoder.mean_pooling(model_output, attention_mask)
    assert pooled.shape == (1, 128)

def test_cross_encoder_fallback():
    reranker = CodeCrossEncoder(use_fallback=True)
    query = "validate phone number"
    code = "def validate_ci_phone_number(x): return True"
    docstring = "Valide un numéro de téléphone mobile en Côte d'Ivoire"
    
    score = reranker._fallback_score(query, code, docstring)
    assert isinstance(score, float)
    assert score >= 0.0
