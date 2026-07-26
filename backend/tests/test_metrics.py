# -*- coding: utf-8 -*-
"""
Tests unitaires pour le module des métriques d'évaluation IR.

Teste les fonctions de calcul de MRR, Recall@K et nDCG@K.
"""

import pytest
from utils.metrics import (
    calculate_mrr,
    calculate_recall_at_k,
    calculate_dcg_at_k,
    calculate_idcg_at_k,
    calculate_ndcg_at_k_single,
    calculate_ndcg_at_k,
    calculate_all_metrics,
    format_metrics_report,
    NEXATECH_TARGETS
)


class TestMRR:
    """Tests pour le Mean Reciprocal Rank (MRR)."""
    
    def test_mrr_perfect(self):
        """Test MRR avec tous les documents en première position."""
        rankings = [1, 1, 1, 1]
        assert calculate_mrr(rankings) == 1.0
    
    def test_mrr_empty(self):
        """Test MRR avec une liste vide."""
        assert calculate_mrr([]) == 0.0
    
    def test_mrr_all_not_found(self):
        """Test MRR avec aucun document trouvé."""
        rankings = [-1, -1, -1]
        assert calculate_mrr(rankings) == 0.0
    
    def test_mrr_mixed(self):
        """Test MRR avec des rangs variés."""
        # (1/1 + 1/2 + 1/3 + 0) / 4 = (1 + 0.5 + 0.333 + 0) / 4 = 0.4583
        rankings = [1, 2, 3, -1]
        expected = (1.0 + 0.5 + 0.3333333333333333 + 0) / 4
        assert abs(calculate_mrr(rankings) - expected) < 1e-10
    
    def test_mrr_single_query(self):
        """Test MRR avec une seule requête."""
        assert calculate_mrr([1]) == 1.0
        assert calculate_mrr([2]) == 0.5
        assert calculate_mrr([-1]) == 0.0


class TestRecall:
    """Tests pour le Recall@K."""
    
    def test_recall_perfect(self):
        """Test Recall avec tous les documents dans le top K."""
        rankings = [1, 2, 3, 4]
        assert calculate_recall_at_k(rankings, k=10) == 1.0
    
    def test_recall_empty(self):
        """Test Recall avec une liste vide."""
        assert calculate_recall_at_k([], k=10) == 0.0
    
    def test_recall_all_not_found(self):
        """Test Recall avec aucun document trouvé."""
        rankings = [-1, -1, -1]
        assert calculate_recall_at_k(rankings, k=10) == 0.0
    
    def test_recall_mixed(self):
        """Test Recall avec certains documents trouvés."""
        # 3/5 documents trouvés dans le top 10
        rankings = [1, 2, 11, 3, -1]
        assert calculate_recall_at_k(rankings, k=10) == 0.6
    
    def test_recall_at_k_boundary(self):
        """Test Recall avec K comme boundary."""
        # Document à la position exactement K
        rankings = [10]
        assert calculate_recall_at_k(rankings, k=10) == 1.0
        
        # Document juste après K
        rankings = [11]
        assert calculate_recall_at_k(rankings, k=10) == 0.0


class TestDCG:
    """Tests pour le Discounted Cumulative Gain (DCG)."""
    
    def test_dcg_single_relevant_first(self):
        """Test DCG avec un document pertinent en première position."""
        relevances = [1, 0, 0, 0]
        # DCG = 1 / log2(2) = 1 / 1 = 1.0
        assert calculate_dcg_at_k(relevances, k=4) == 1.0
    
    def test_dcg_single_relevant_second(self):
        """Test DCG avec un document pertinent en deuxième position."""
        relevances = [0, 1, 0, 0]
        # DCG = 0 + 1 / log2(3) = 1 / 1.58496 = 0.6309
        expected = 1.0 / math.log2(3)
        assert abs(calculate_dcg_at_k(relevances, k=4) - expected) < 1e-10
    
    def test_dcg_multiple_relevant(self):
        """Test DCG avec plusieurs documents pertinents."""
        relevances = [1, 1, 0, 0]
        # DCG = 1/log2(2) + 1/log2(3) = 1 + 0.6309 = 1.6309
        expected = 1.0 + 1.0 / math.log2(3)
        assert abs(calculate_dcg_at_k(relevances, k=4) - expected) < 1e-10


class TestIDCG:
    """Tests pour l'Ideal DCG."""
    
    def test_idcg_single_relevant(self):
        """Test IDCG avec un seul document pertinent."""
        relevances = [0, 1, 0, 0]
        # IDCG = DCG des relevances triées = [1, 0, 0, 0]
        expected = calculate_dcg_at_k([1, 0, 0, 0], k=4)
        assert calculate_idcg_at_k(relevances, k=4) == expected
    
    def test_idcg_multiple_relevant(self):
        """Test IDCG avec plusieurs documents pertinents."""
        relevances = [0, 1, 0, 1]
        # IDCG = DCG de [1, 1, 0, 0]
        expected = calculate_dcg_at_k([1, 1, 0, 0], k=4)
        assert calculate_idcg_at_k(relevances, k=4) == expected


class TestNDCG:
    """Tests pour le Normalized DCG."""
    
    def test_ndcg_single_perfect(self):
        """Test nDCG avec un document pertinent en première position."""
        relevances = [1, 0, 0, 0]
        assert calculate_ndcg_at_k_single(relevances, k=4) == 1.0
    
    def test_ndcg_single_second(self):
        """Test nDCG avec un document pertinent en deuxième position."""
        relevances = [0, 1, 0, 0]
        dcg = 1.0 / math.log2(3)
        idcg = 1.0  # [1, 0, 0, 0] -> DCG = 1.0
        expected = dcg / idcg
        assert abs(calculate_ndcg_at_k_single(relevances, k=4) - expected) < 1e-10
    
    def test_ndcg_all_zero(self):
        """Test nDCG avec aucun document pertinent."""
        relevances = [0, 0, 0, 0]
        assert calculate_ndcg_at_k_single(relevances, k=4) == 0.0
    
    def test_ndcg_at_k_from_rankings(self):
        """Test nDCG calculé à partir des rankings."""
        # Tous les documents en première position
        rankings = [1, 1, 1]
        assert calculate_ndcg_at_k(rankings, k=10) == 1.0
        
        # Documents à différentes positions
        rankings = [1, 2, -1]
        # Pour rank=1: [1, 0, 0, ...] -> nDCG = 1.0
        # Pour rank=2: [0, 1, 0, ...] -> nDCG = 1/log2(3) / 1 = 0.6309
        # Pour rank=-1: [0, 0, 0, ...] -> nDCG = 0.0
        # Moyenne: (1.0 + 0.6309 + 0.0) / 3 = 0.5436
        expected = (1.0 + (1.0 / math.log2(3)) + 0.0) / 3
        assert abs(calculate_ndcg_at_k(rankings, k=10) - expected) < 1e-10


class TestCalculateAllMetrics:
    """Tests pour le calcul combiné de toutes les métriques."""
    
    def test_all_metrics_perfect(self):
        """Test toutes les métriques avec des résultats parfaits."""
        rankings = [1, 1, 1, 1]
        metrics = calculate_all_metrics(rankings)
        assert metrics['mrr'] == 1.0
        assert metrics['recall'] == 1.0
        assert metrics['ndcg'] == 1.0
    
    def test_all_metrics_empty(self):
        """Test toutes les métriques avec une liste vide."""
        rankings = []
        metrics = calculate_all_metrics(rankings)
        assert metrics['mrr'] == 0.0
        assert metrics['recall'] == 0.0
        assert metrics['ndcg'] == 0.0
    
    def test_all_metrics_mixed(self):
        """Test toutes les métriques avec des résultats variés."""
        rankings = [1, 2, 3, -1]
        metrics = calculate_all_metrics(rankings)
        
        # Vérifier que toutes les métriques sont calculées
        assert metrics['mrr'] > 0
        assert metrics['recall'] == 0.75  # 3/4 dans le top 10
        assert metrics['ndcg'] > 0


class TestFormatMetricsReport:
    """Tests pour le formatage du rapport des métriques."""
    
    def test_format_report_basic(self):
        """Test formatage de base du rapport."""
        metrics = {'mrr': 0.63, 'recall': 1.0, 'ndcg': 0.72}
        report = format_metrics_report(metrics)
        
        assert "MRR@10" in report
        assert "Recall@10" in report
        assert "nDCG@10" in report
        assert "0.6300" in report
        assert "1.0000" in report
    
    def test_format_report_with_targets(self):
        """Test formatage avec comparaison aux cibles."""
        metrics = {'mrr': 0.63, 'recall': 1.0, 'ndcg': 0.72}
        report = format_metrics_report(metrics, NEXATECH_TARGETS, "Test")
        
        assert "Test" in report
        assert "Cible" in report
        assert "[OK]" in report  # Au moins une cible devrait être atteinte
    
    def test_format_report_with_name(self):
        """Test formatage avec un nom personnalisé."""
        metrics = {'mrr': 0.5, 'recall': 0.8, 'ndcg': 0.65}
        report = format_metrics_report(metrics, name="CodeMind MVP")
        
        assert "CodeMind MVP" in report


class TestNexaTechTargets:
    """Tests pour les cibles NexaTech."""
    
    def test_targets_exist(self):
        """Test que les cibles NexaTech sont définies."""
        assert 'mrr' in NEXATECH_TARGETS
        assert 'recall' in NEXATECH_TARGETS
        assert 'ndcg' in NEXATECH_TARGETS
    
    def test_targets_values(self):
        """Test les valeurs des cibles NexaTech."""
        assert NEXATECH_TARGETS['mrr'] == 0.45
        assert NEXATECH_TARGETS['recall'] == 0.70
        assert NEXATECH_TARGETS['ndcg'] >= 0.70


# Import math for the tests
import math


if __name__ == "__main__":
    # Exécuter les tests
    pytest.main([__file__, "-v"])
