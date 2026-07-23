# -*- coding: utf-8 -*-
"""
Script de démonstration des métriques d'évaluation IR pour CodeMind.

Ce script montre comment utiliser le module utils.metrics pour calculer
les métriques MRR@10, Recall@10 et nDCG@10.

Exécution : python demo_metrics.py
"""

import sys
sys.path.insert(0, 'C:/Users/DELL/Downloads/CodeMind')

from utils.metrics import (
    calculate_mrr,
    calculate_recall_at_k,
    calculate_ndcg_at_k,
    calculate_all_metrics,
    format_metrics_report,
    NEXATECH_TARGETS
)


def demo_basic_usage():
    """Démonstration de l'utilisation de base des métriques."""
    print("=" * 70)
    print(" DÉMONSTRATION : Utilisation de base des métriques IR")
    print("=" * 70)
    
    # Exemple 1 : Résultats parfaits
    print("\n1. Résultats parfaits (tous les documents en première position)")
    rankings = [1, 1, 1, 1, 1]
    metrics = calculate_all_metrics(rankings)
    print(f"   Rankings: {rankings}")
    print(f"   -> MRR@10: {metrics['mrr']:.4f}")
    print(f"   -> Recall@10: {metrics['recall']:.4f}")
    print(f"   -> nDCG@10: {metrics['ndcg']:.4f}")
    
    # Exemple 2 : Résultats réels (CodeMind MVP)
    print("\n2. Résultats réalistes (similaires à CodeMind MVP)")
    rankings = [1, 2, 1, 3, 1, 2, 1, 1, 2, 1]
    metrics = calculate_all_metrics(rankings)
    print(f"   Rankings: {rankings}")
    print(f"   -> MRR@10: {metrics['mrr']:.4f} (Cible NexaTech: >= 0.45)")
    print(f"   -> Recall@10: {metrics['recall']:.4f} (Cible NexaTech: >= 0.70)")
    print(f"   -> nDCG@10: {metrics['ndcg']:.4f} (Cible NexaTech: Maximiser)")
    
    # Exemple 3 : Résultats avec échecs
    print("\n3. Résultats avec des échecs (certains documents non trouvés)")
    rankings = [1, 2, -1, 3, -1, 1, 4, -1, 2, 1]
    metrics = calculate_all_metrics(rankings)
    print(f"   Rankings: {rankings} (-1 = non trouvé)")
    print(f"   -> MRR@10: {metrics['mrr']:.4f}")
    print(f"   -> Recall@10: {metrics['recall']:.4f}")
    print(f"   -> nDCG@10: {metrics['ndcg']:.4f}")


def demo_comparison():
    """Démonstration de la comparaison avec les cibles NexaTech."""
    print("\n" + "=" * 70)
    print(" DÉMONSTRATION : Comparaison avec les cibles NexaTech")
    print("=" * 70)
    
    # Résultats Baseline (standard)
    print("\n1. Baseline (Standard)")
    baseline_rankings = [5, 3, 7, -1, 2]
    baseline_metrics = calculate_all_metrics(baseline_rankings)
    print(format_metrics_report(baseline_metrics, NEXATECH_TARGETS, "Baseline"))
    
    # Résultats Optimisés (Fine-tuné)
    print("\n2. Optimisé (Fine-tuné)")
    optimized_rankings = [1, 1, 2, 1, 1]
    optimized_metrics = calculate_all_metrics(optimized_rankings)
    print(format_metrics_report(optimized_metrics, NEXATECH_TARGETS, "Optimisé (Fine-tuné)"))


def demo_individual_metrics():
    """Démonstration du calcul individuel de chaque métrique."""
    print("\n" + "=" * 70)
    print(" DÉMONSTRATION : Calcul individuel des métriques")
    print("=" * 70)
    
    rankings = [1, 3, 2, -1, 4]
    
    print(f"\nRankings: {rankings}")
    
    # MRR
    mrr = calculate_mrr(rankings)
    print(f"\n1. MRR@10 (Mean Reciprocal Rank)")
    print(f"   Formule: (1/|Q|) * sum(1/rank_i)")
    print(f"   Calcul: (1/1 + 1/3 + 1/2 + 0 + 1/4) / 5")
    print(f"   Résultat: {mrr:.4f}")
    
    # Recall@10
    recall = calculate_recall_at_k(rankings, k=10)
    print(f"\n2. Recall@10")
    print(f"   Formule: |Documents trouves <= K| / |Total|")
    print(f"   Calcul: 4/5 (4 documents dans le top 10)")
    print(f"   Résultat: {recall:.4f}")
    
    # nDCG@10
    ndcg = calculate_ndcg_at_k(rankings, k=10)
    print(f"\n3. nDCG@10 (Normalized Discounted Cumulative Gain)")
    print(f"   Formule: DCG@K / IDCG@K")
    print(f"   Résultat: {ndcg:.4f}")


def demo_edge_cases():
    """Démonstration des cas particuliers."""
    print("\n" + "=" * 70)
    print(" DÉMONSTRATION : Cas particuliers")
    print("=" * 70)
    
    # Cas 1 : Liste vide
    print("\n1. Liste vide")
    metrics = calculate_all_metrics([])
    print(f"   Rankings: []")
    print(f"   -> MRR@10: {metrics['mrr']:.4f}")
    print(f"   -> Recall@10: {metrics['recall']:.4f}")
    print(f"   -> nDCG@10: {metrics['ndcg']:.4f}")
    
    # Cas 2 : Tous non trouvés
    print("\n2. Aucun document trouvé")
    metrics = calculate_all_metrics([-1, -1, -1])
    print(f"   Rankings: [-1, -1, -1]")
    print(f"   -> MRR@10: {metrics['mrr']:.4f}")
    print(f"   -> Recall@10: {metrics['recall']:.4f}")
    print(f"   -> nDCG@10: {metrics['ndcg']:.4f}")
    
    # Cas 3 : Tous à la limite de K
    print("\n3. Tous les documents à la position K (10)")
    metrics = calculate_all_metrics([10, 10, 10])
    print(f"   Rankings: [10, 10, 10]")
    print(f"   -> MRR@10: {metrics['mrr']:.4f}")
    print(f"   -> Recall@10: {metrics['recall']:.4f}")
    print(f"   -> nDCG@10: {metrics['ndcg']:.4f}")


def main():
    """Exécute toutes les démonstrations."""
    print("\n")
    print("#" * 70)
    print("#" + " " * 68 + "#")
    print("#" + "  CODEMIND - DÉMONSTRATION DES MÉTRIQUES D'ÉVALUATION IR".center(68) + "#")
    print("#" + " " * 68 + "#")
    print("#" * 70)
    
    demo_basic_usage()
    demo_comparison()
    demo_individual_metrics()
    demo_edge_cases()
    
    print("\n" + "=" * 70)
    print(" DÉMONSTRATION TERMINÉE")
    print("=" * 70)
    print("\nPour plus d'informations, consultez:")
    print("  - docs/METRICS.md : Documentation détaillée des métriques")
    print("  - utils/metrics.py : Implémentation des fonctions de calcul")
    print("  - tests/test_metrics.py : Tests unitaires complets")
    print("  - scripts/evaluate.py : Script d'évaluation complet")
    print()


if __name__ == "__main__":
    main()
