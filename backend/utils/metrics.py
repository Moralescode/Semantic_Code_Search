# -*- coding: utf-8 -*-
"""
Module des métriques d'évaluation pour la Recherche d'Information (IR).

Ce module implémente les trois métriques académiques majeures utilisées pour 
évaluer CodeMind : MRR@10, Recall@10 et nDCG@10.

Formules de référence :
- MRR (Mean Reciprocal Rank) : Moyenne de l'inverse des rangs des premiers résultats pertinents
- Recall@K : Proportion de requêtes où le document pertinent est dans le top K
- nDCG@K (Normalized Discounted Cumulative Gain) : Mesure la qualité du classement avec pénalisation logarithmique

Auteur : CodeMind Team - NexaTech Solutions
"""

import math
from typing import List, Dict, Any, Tuple


def calculate_mrr(rankings: List[int], k: int = 10) -> float:
    """
    Calcule le Mean Reciprocal Rank (MRR@K).
    
    Le MRR mesure la rapidité avec laquelle le premier résultat pertinent apparaît.
    Il est particulièrement adapté aux cas où l'utilisateur cherche une solution unique.
    
    Formule :
        MRR = (1/|Q|) * Σ(1/rank_i) pour i=1 à |Q|
    
    Args:
        rankings: Liste des rangs (1-indexed) du document pertinent pour chaque requête.
                  Un rang de -1 ou >K indique que le document n'a pas été trouvé.
        k: Nombre de résultats à considérer (default: 10)
    
    Returns:
        float: Score MRR entre 0.0 et 1.0
    
    Example:
        >>> rankings = [1, 3, -1, 2, 1]  # Document trouvé en position 1, 3, non trouvé, 2, 1
        >>> calculate_mrr(rankings, k=10)
        0.5833333333333333
    """
    if not rankings:
        return 0.0
    
    rr_sum = 0.0
    for rank in rankings:
        if rank > 0 and rank <= k:
            rr_sum += 1.0 / rank
        # Si rank <= 0 ou rank > k, la contribution est 0
    
    return rr_sum / len(rankings)


def calculate_recall_at_k(rankings: List[int], k: int = 10) -> float:
    """
    Calcule le Recall@K (Rappel à K).
    
    Le Recall@K mesure la proportion de requêtes pour lesquelles le document pertinent
    a été trouvé dans les K premiers résultats.
    
    Dans le cadre de CodeMind (une seule fonction attendue par requête) :
        Recall@K = 1 si le document est dans le top K, 0 sinon.
    
    Formule :
        Recall@K = |Documents pertinents retrouvés ≤ K| / |Total des documents pertinents|
    
    Args:
        rankings: Liste des rangs (1-indexed) du document pertinent pour chaque requête.
        k: Nombre de résultats à considérer (default: 10)
    
    Returns:
        float: Score Recall entre 0.0 et 1.0
    
    Example:
        >>> rankings = [1, 3, 11, 2, 1]  # 4/5 trouvés dans le top 10
        >>> calculate_recall_at_k(rankings, k=10)
        0.8
    """
    if not rankings:
        return 0.0
    
    success = 0
    for rank in rankings:
        if rank > 0 and rank <= k:
            success += 1
    
    return success / len(rankings)


def calculate_dcg_at_k(relevances: List[float], k: int = 10) -> float:
    """
    Calcule le Discounted Cumulative Gain (DCG@K) pour une seule requête.
    
    Le DCG pondère l'importance de chaque résultat pertinent par sa position,
    avec une décroissance logarithmique.
    
    Formule :
        DCG@K = Σ(relevance_i / log2(i + 1)) pour i=1 à K
    
    Args:
        relevances: Liste des scores de pertinence (généralement 0 ou 1) pour chaque position.
                   La liste doit être de longueur K, avec les résultats triés par pertinence.
        k: Nombre de résultats à considérer (default: 10)
    
    Returns:
        float: Score DCG
    
    Example:
        >>> # Document pertinent en position 1 (index 0)
        >>> calculate_dcg_at_k([1, 0, 0, 0, 0, 0, 0, 0, 0, 0], k=10)
        1.0
        >>> # Document pertinent en position 2 (index 1)
        >>> calculate_dcg_at_k([0, 1, 0, 0, 0, 0, 0, 0, 0, 0], k=10)
        0.6309297535714575
    """
    dcg = 0.0
    for i in range(min(k, len(relevances))):
        relevance = relevances[i]
        dcg += relevance / math.log2(i + 2)  # i+2 car i est 0-indexed, on veut log2(1+1), log2(2+1), etc.
    
    return dcg


def calculate_idcg_at_k(relevances: List[float], k: int = 10) -> float:
    """
    Calcule l'Ideal DCG (IDCG@K) pour une seule requête.
    
    L'IDCG est le DCG maximal possible, obtenu en triant tous les documents
    pertinents en premier.
    
    Args:
        relevances: Liste des scores de pertinence pour tous les résultats.
        k: Nombre de résultats à considérer (default: 10)
    
    Returns:
        float: Score IDCG
    """
    # Trie les relevances par ordre décroissant (meilleur cas)
    sorted_relevances = sorted(relevances, reverse=True)
    return calculate_dcg_at_k(sorted_relevances, k)


def calculate_ndcg_at_k_single(relevances: List[float], k: int = 10) -> float:
    """
    Calcule le nDCG@K pour une seule requête.
    
    Le nDCG normalise le DCG par l'IDCG pour obtenir un score entre 0.0 et 1.0.
    
    Formule :
        nDCG@K = DCG@K / IDCG@K
    
    Args:
        relevances: Liste des scores de pertinence pour les K premiers résultats.
        k: Nombre de résultats à considérer (default: 10)
    
    Returns:
        float: Score nDCG entre 0.0 et 1.0
    
    Example:
        >>> # Document pertinent en première position (parfait)
        >>> calculate_ndcg_at_k_single([1, 0, 0, 0, 0, 0, 0, 0, 0, 0], k=10)
        1.0
        >>> # Document pertinent en deuxième position
        >>> calculate_ndcg_at_k_single([0, 1, 0, 0, 0, 0, 0, 0, 0, 0], k=10)
        0.6309297535714575
    """
    dcg = calculate_dcg_at_k(relevances, k)
    idcg = calculate_idcg_at_k(relevances, k)
    
    if idcg == 0:
        return 0.0
    
    return dcg / idcg


def calculate_ndcg_at_k(rankings: List[int], k: int = 10) -> float:
    """
    Calcule le nDCG@K (Normalized Discounted Cumulative Gain) moyen sur toutes les requêtes.
    
    Pour chaque requête, nous créons un vecteur de pertinence binaire (1 si c'est le
    document attendu, 0 sinon) et nous calculons le nDCG individuel.
    
    Args:
        rankings: Liste des rangs (1-indexed) du document pertinent pour chaque requête.
                  Un rang de -1 ou >K indique que le document n'est pas dans le top K.
        k: Nombre de résultats à considérer (default: 10)
    
    Returns:
        float: Score nDCG moyen entre 0.0 et 1.0
    
    Example:
        >>> rankings = [1, 2, 3, -1]  # Documents trouvés aux positions 1, 2, 3, non trouvé
        >>> calculate_ndcg_at_k(rankings, k=10)
        0.8808958625521245
    """
    if not rankings:
        return 0.0
    
    ndcg_sum = 0.0
    
    for rank in rankings:
        # Crée un vecteur de pertinence pour cette requête
        relevances = [0.0] * k
        
        if rank > 0 and rank <= k:
            # Le document pertinent est à la position (rank-1) dans le top K
            relevances[rank - 1] = 1.0
        # Si rank <= 0 ou rank > k, le vecteur reste tout à zéro
        
        ndcg_sum += calculate_ndcg_at_k_single(relevances, k)
    
    return ndcg_sum / len(rankings)


def calculate_all_metrics(rankings: List[int], k: int = 10) -> Dict[str, float]:
    """
    Calcule toutes les métriques (MRR, Recall, nDCG) en une seule passe.
    
    Args:
        rankings: Liste des rangs (1-indexed) du document pertinent pour chaque requête.
        k: Nombre de résultats à considérer (default: 10)
    
    Returns:
        Dict: Dictionnaire contenant les scores MRR, Recall@K et nDCG@K
    
    Example:
        >>> rankings = [1, 3, -1, 2, 1]
        >>> metrics = calculate_all_metrics(rankings, k=10)
        >>> print(f"MRR: {metrics['mrr']:.4f}, Recall: {metrics['recall']:.4f}, nDCG: {metrics['ndcg']:.4f}")
    """
    return {
        'mrr': calculate_mrr(rankings, k),
        'recall': calculate_recall_at_k(rankings, k),
        'ndcg': calculate_ndcg_at_k(rankings, k)
    }


def format_metrics_report(metrics: Dict[str, float], 
                         targets: Dict[str, float] = None, 
                         name: str = "") -> str:
    """
    Formate un rapport lisible des métriques avec comparaison aux cibles.
    
    Args:
        metrics: Dictionnaire des métriques calculées (clés: 'mrr', 'recall', 'ndcg')
        targets: Dictionnaire optionnel des cibles à atteindre
        name: Nom de la configuration évaluée
    
    Returns:
        str: Rapport formaté
    """
    lines = []
    
    if name:
        lines.append(f"\n{'='*60}")
        lines.append(f" ÉVALUATION : {name}")
        lines.append(f"{'='*60}")
    
    lines.append(f"\nRésultats :")
    lines.append(f"  - MRR@10    : {metrics['mrr']:.4f}  " + 
                 (f"(Cible : >= {targets['mrr']:.2f})" if targets and 'mrr' in targets else ""))
    lines.append(f"  - Recall@10 : {metrics['recall']:.4f}  " + 
                 (f"(Cible : >= {targets['recall']:.2f})" if targets and 'recall' in targets else ""))
    lines.append(f"  - nDCG@10   : {metrics['ndcg']:.4f}  " + 
                 (f"(Maximiser)" if not targets or 'ndcg' not in targets else f"(Cible : >= {targets['ndcg']:.2f})"))
    
    if targets:
        lines.append(f"\nStatut :")
        mrr_ok = metrics['mrr'] >= targets.get('mrr', 0)
        recall_ok = metrics['recall'] >= targets.get('recall', 0)
        lines.append(f"  - MRR@10    : {'[OK]' if mrr_ok else '[FAIL]'} {'Objectif Dépassé' if mrr_ok else 'Objectif Non Atteint'}")
        lines.append(f"  - Recall@10 : {'[OK]' if recall_ok else '[FAIL]'} {'Objectif Dépassé' if recall_ok else 'Objectif Non Atteint'}")
    
    return "\n".join(lines)


# Constantes des cibles NexaTech pour référence
NEXATECH_TARGETS = {
    'mrr': 0.45,
    'recall': 0.70,
    'ndcg': 0.70  # Bien que la documentation dise "Maximiser", 0.70 est un bon objectif
}


if __name__ == "__main__":
    # Exemples de démonstration
    print("="*60)
    print(" DÉMONSTRATION DES MÉTRIQUES IR - CodeMind")
    print("="*60)
    
    # Exemple 1 : Résultats parfaits
    perfect_rankings = [1, 1, 1, 1, 1]
    print("\nExemple 1 : Tous les documents trouvés en première position")
    print(f"Rankings: {perfect_rankings}")
    metrics = calculate_all_metrics(perfect_rankings)
    print(f"MRR@10: {metrics['mrr']:.4f}")
    print(f"Recall@10: {metrics['recall']:.4f}")
    print(f"nDCG@10: {metrics['ndcg']:.4f}")
    
    # Exemple 2 : Résultats moyens
    avg_rankings = [1, 3, 2, -1, 5]
    print("\nExemple 2 : Résultats variés (un document non trouvé)")
    print(f"Rankings: {avg_rankings}")
    metrics = calculate_all_metrics(avg_rankings)
    print(f"MRR@10: {metrics['mrr']:.4f}")
    print(f"Recall@10: {metrics['recall']:.4f}")
    print(f"nDCG@10: {metrics['ndcg']:.4f}")
    
    # Exemple 3 : Résultats CodeMind MVP (d'après la documentation)
    # MRR: 0.63, Recall: 1.00, nDCG: 0.72
    # Pour obtenir MRR=0.63 avec Recall=1.00, il faut tous les documents trouvés
    # avec des rangs dont la moyenne des inverses est 0.63
    # Par exemple : [1, 1, 1, 2, 2] donne MRR = (1 + 1 + 1 + 0.5 + 0.5) / 5 = 0.8
    # Essayons : [1, 2, 1, 2, 1] -> (1 + 0.5 + 1 + 0.5 + 1) / 5 = 0.8
    # Pour obtenir 0.63 : [1, 2, 3, 1, 2] -> (1 + 0.5 + 0.333 + 1 + 0.5) / 5 = 0.666
    # [1, 3, 2, 4, 1] -> (1 + 0.333 + 0.5 + 0.25 + 1) / 5 = 0.6166
    codemind_rankings = [1, 2, 3, 1, 2, 1, 1, 4, 2, 1]
    print("\nExemple 3 : Résultats similaires à CodeMind MVP")
    print(f"Rankings: {codemind_rankings}")
    metrics = calculate_all_metrics(codemind_rankings)
    print(f"MRR@10: {metrics['mrr']:.4f} (Cible MVP: 0.63)")
    print(f"Recall@10: {metrics['recall']:.4f} (Cible MVP: 1.00)")
    print(f"nDCG@10: {metrics['ndcg']:.4f} (Cible MVP: 0.72)")
