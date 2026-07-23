# -*- coding: utf-8 -*-
"""
Script d'évaluation scientifique de recherche d'informations (IR).
Calcule les métriques MRR@10, Recall@10 et nDCG@10 de CodeMind pour valider la qualité du système.

Utilise le module utils.metrics pour les calculs des métriques.
"""

import numpy as np
from retrieval.search import CodeSearchEngine
from utils.metrics import (
    calculate_mrr,
    calculate_recall_at_k,
    calculate_ndcg_at_k,
    format_metrics_report,
    NEXATECH_TARGETS
)

# Définition d'un jeu d'évaluation (requête naturelle -> fonction attendue)
EVAL_GROUND_TRUTH = [
    {
        "query": "validate phone number",
        "expected_function": "validate_ci_phone_number"
    },
    {
        "query": "format CFA currency",
        "expected_function": "format_currency_xof"
    },
    {
        "query": "calculate TVA tax",
        "expected_function": "calculate_ci_tva"
    },
    {
        "query": "parse transactions CSV",
        "expected_function": "parse_csv_transactions"
    },
    {
        "query": "generate hmac signature",
        "expected_function": "generate_hmac_signature"
    }
]


def run_evaluation():
    print("Initialisation du moteur CodeMind pour l'évaluation...")
    try:
        engine = CodeSearchEngine()
    except Exception as e:
        print(f"Erreur d'initialisation : {e}")
        return

    for mode_name, use_baseline in [("Baseline (Standard)", True), ("Optimisé (Fine-tuné)", False)]:
        print(f"\n--- ÉVALUATION : {mode_name} ---")
        
        rankings = []
        latencies = []
        
        import time
        
        for item in EVAL_GROUND_TRUTH:
            query = item["query"]
            expected = item["expected_function"]
            
            start = time.time()
            results = engine.search(query, top_k=10, use_rerank=True, use_baseline=use_baseline)
            latencies.append((time.time() - start) * 1000)
            
            # Recherche du rang de la fonction attendue
            rank = -1
            for idx, res in enumerate(results):
                if res["name"] == expected:
                    rank = idx + 1
                    break
                    
            rankings.append(rank)
            print(f"Requête: '{query}' | Attendu: '{expected}' | Rang obtenu: {rank if rank > 0 else 'Non trouvé'}")

        # Calcul des métriques globales en utilisant le module dédié
        mrr = calculate_mrr(rankings)
        recall = calculate_recall_at_k(rankings, k=10)
        ndcg = calculate_ndcg_at_k(rankings, k=10)
        p95_latency = np.percentile(latencies, 95)
        
        # Affichage des résultats avec formatage amélioré
        metrics = {
            'mrr': mrr,
            'recall': recall,
            'ndcg': ndcg
        }
        
        print(format_metrics_report(metrics, NEXATECH_TARGETS, mode_name))
        print(f"  - Latence P95 : {p95_latency:.2f} ms (Cible : < 2000 ms)")

if __name__ == "__main__":
    run_evaluation()
