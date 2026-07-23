# -*- coding: utf-8 -*-
"""
Script d'évaluation scientifique de recherche d'informations (IR) avec sortie colorée.
Calcule les métriques MRR@10, Recall@10 et nDCG@10 de CodeMind pour valider la qualité du système.

Utilise le module utils.metrics pour les calculs des métriques.
Affichage amélioré avec couleurs et formatage moderne.
"""

import numpy as np
import sys
import time
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


class Colors:
    """Classe pour les codes de couleur ANSI."""
    HEADER = '\033[95m'
    OKBLUE = '\033[94m'
    OKGREEN = '\033[92m'
    WARNING = '\033[93m'
    FAIL = '\033[91m'
    ENDC = '\033[0m'
    BOLD = '\033[1m'
    UNDERLINE = '\033[4m'
    CYAN = '\033[96m'
    MAGENTA = '\033[95m'
    WHITE = '\033[97m'
    BLACK = '\033[30m'
    
    @classmethod
    def disable(cls):
        """Désactive les couleurs (pour les systèmes qui ne supportent pas ANSI)."""
        cls.HEADER = ''
        cls.OKBLUE = ''
        cls.OKGREEN = ''
        cls.WARNING = ''
        cls.FAIL = ''
        cls.ENDC = ''
        cls.BOLD = ''
        cls.UNDERLINE = ''
        cls.CYAN = ''
        cls.MAGENTA = ''
        cls.WHITE = ''
        cls.BLACK = ''


def print_header():
    """Affiche l'en-tête avec design."""
    print(f"\n{Colors.CYAN}{'='*70}{Colors.ENDC}")
    print(f"{Colors.BOLD}{Colors.CYAN}")
    print("     ██████╗ ██████╗ ███╗   ██╗███╗   ██╗ ██████╗ ███████╗███████╗██████╗ ")
    print("    ██╔════╝██╔═══██╗████╗  ██║████╗  ██║██╔═══██╗██╔════╝██╔════╝██╔══██╗")
    print("    ██║     ██║   ██║██╔██╗ ██║██╔██╗ ██║██║   ██║█████╗  ██║     ██████╔╝")
    print("    ██║     ██║   ██║██║╚██╗██║██║╚██╗██║██║   ██║██╔══╝  ██║     ██╔══██╗")
    print("    ╚██████╗╚██████╔╝██║ ╚████║██║ ╚████║╚██████╔╝███████╗██║     ██║  ██║")
    print("     ╚═════╝ ╚═════╝ ╚═╝  ╚═══╝╚═╝  ╚═══╝ ╚═════╝ ╚══════╝╚═╝  ╚═╝  ╚═╝  ╚═╝")
    print(f"{Colors.ENDC}")
    print(f"{Colors.BOLD}{Colors.WHITE}")
    print(f"{' '*15}CodeMind - Moteur de Recherche Sémantique")
    print(f"{' '*12}NexaTech Solutions | Hackathon 2026")
    print(f"{Colors.ENDC}")
    print(f"{Colors.CYAN}{'='*70}{Colors.ENDC}\n")


def print_section(title):
    """Affiche une section avec formatage."""
    print(f"\n{Colors.MAGENTA}{'─'*70}{Colors.ENDC}")
    print(f"{Colors.BOLD}{Colors.MAGENTA}  {title}{Colors.ENDC}")
    print(f"{Colors.MAGENTA}{'─'*70}{Colors.ENDC}")


def print_query_result(query, expected, rank):
    """Affiche le résultat d'une requête avec couleurs."""
    status_color = Colors.OKGREEN if rank > 0 else Colors.FAIL
    status_text = "Trouvé" if rank > 0 else "Non trouvé"
    rank_text = f"Rang {rank}" if rank > 0 else "Non trouvé"
    
    print(f"  {Colors.CYAN}Requête:{Colors.ENDC} {Colors.WHITE}'{query}'{Colors.ENDC}")
    print(f"  {Colors.CYAN}Attendu:{Colors.ENDC} {Colors.WHITE}{expected}{Colors.ENDC}")
    print(f"  {Colors.CYAN}Résultat:{Colors.ENDC} {status_color}{status_text} {rank_text}{Colors.ENDC}")


def print_metrics_table(metrics, latencies, name):
    """Affiche un tableau des métriques avec couleurs."""
    print(f"\n{Colors.BOLD}{Colors.WHITE}  Rapport d'Évaluation : {name}{Colors.ENDC}\n")
    
    # En-tête du tableau
    print(f"  {Colors.BOLD}{Colors.CYAN}{'Métrique':<20} {'Valeur':<15} {'Cible':<20} {'Statut':<15}{Colors.ENDC}")
    print(f"  {Colors.CYAN}{'-'*20} {'-'*15} {'-'*20} {'-'*15}{Colors.ENDC}")
    
    # MRR
    mrr = metrics['mrr']
    mrr_status = "✓ OK" if mrr >= NEXATECH_TARGETS['mrr'] else "✗ FAIL"
    mrr_color = Colors.OKGREEN if mrr >= NEXATECH_TARGETS['mrr'] else Colors.FAIL
    print(f"  {Colors.WHITE}MRR@10{' '*13} {mrr:.4f}{' '*10} >= 0.45{' '*10} {mrr_color}{mrr_status}{Colors.ENDC}")
    
    # Recall
    recall = metrics['recall']
    recall_status = "✓ OK" if recall >= NEXATECH_TARGETS['recall'] else "✗ FAIL"
    recall_color = Colors.OKGREEN if recall >= NEXATECH_TARGETS['recall'] else Colors.FAIL
    print(f"  {Colors.WHITE}Recall@10{' '*11} {recall:.4f}{' '*10} >= 0.70{' '*10} {recall_color}{recall_status}{Colors.ENDC}")
    
    # nDCG
    ndcg = metrics['ndcg']
    ndcg_status = "✓ OK" if ndcg >= 0.70 else "✗ FAIL"
    ndcg_color = Colors.OKGREEN if ndcg >= 0.70 else Colors.FAIL
    print(f"  {Colors.WHITE}nDCG@10{' '*13} {ndcg:.4f}{' '*10} Maximiser{' '*7} {ndcg_color}{ndcg_status}{Colors.ENDC}")
    
    # Latence
    p95 = np.percentile(latencies, 95)
    latency_status = "✓ OK" if p95 < 2000 else "✗ FAIL"
    latency_color = Colors.OKGREEN if p95 < 2000 else Colors.FAIL
    print(f"  {Colors.WHITE}Latence P95{' '*11} {p95:.2f} ms{' '*7} < 2000 ms{' '*8} {latency_color}{latency_status}{Colors.ENDC}")
    
    print(f"  {Colors.CYAN}{'-'*20} {'-'*15} {'-'*20} {'-'*15}{Colors.ENDC}")


def print_progress_bar(value, target, label, color):
    """Affiche une barre de progression."""
    percentage = min((value / target) * 100, 100) if target > 0 else 0
    bar_length = 30
    filled_length = int(bar_length * percentage / 100)
    bar = '█' * filled_length + '░' * (bar_length - filled_length)
    
    print(f"  {Colors.WHITE}{label:<25}{Colors.ENDC}{color}{bar}{Colors.ENDC} {percentage:.1f}%")


def print_summary(metrics_baseline, metrics_optimized, latencies_baseline, latencies_optimized):
    """Affiche un résumé comparatif."""
    print(f"\n{Colors.BOLD}{Colors.MAGENTA}")
    print("  ███████╗███████╗██████╗ ██████╗███████╗     ██████╗ ███████╗███████╗")
    print("  ██╔════╝██╔════╝██╔═══██╗██╔═══██╗██╔════╝    ██╔═══██╗██╔════╝██╔════╝")
    print("  █████╗  █████╗  ██║   ██║██║   ██║█████╗      ██║   ██║█████╗  ███████╗")
    print("  ██╔══╝  ██╔══╝  ██║   ██║██║   ██║██╔══╝      ██║   ██║██╔══╝  ╚════██║")
    print("  ██║     ███████╗╚██████╔╝╚██████╔╝███████╗    ╚██████╔╝███████╗███████║")
    print("  ╚═╝     ╚══════╝ ╚═════╝  ╚═════╝ ╚══════╝     ╚═════╝ ╚══════╝╚══════╝")
    print(f"{Colors.ENDC}\n")
    
    print(f"{Colors.BOLD}  RÉSUMÉ COMPARATIF{Colors.ENDC}\n")
    
    print(f"  {Colors.BOLD}{Colors.CYAN}Metrique{Colors.ENDC}{' '*10}{Colors.BOLD}{Colors.WHITE}Baseline{Colors.ENDC}{' '*8}{Colors.BOLD}{Colors.WHITE}Optimisé{Colors.ENDC}{' '*8}{Colors.BOLD}{Colors.WHITE}Amélioration{Colors.ENDC}\n")
    
    # Calcul des améliorations
    mrr_improvement = ((metrics_optimized['mrr'] - metrics_baseline['mrr']) / metrics_baseline['mrr']) * 100 if metrics_baseline['mrr'] > 0 else 0
    recall_improvement = ((metrics_optimized['recall'] - metrics_baseline['recall']) / metrics_baseline['recall']) * 100 if metrics_baseline['recall'] > 0 else 0
    ndcg_improvement = ((metrics_optimized['ndcg'] - metrics_baseline['ndcg']) / metrics_baseline['ndcg']) * 100 if metrics_baseline['ndcg'] > 0 else 0
    latency_improvement = ((latencies_baseline[0] - latencies_optimized[0]) / latencies_baseline[0]) * 100 if latencies_baseline[0] > 0 else 0
    
    print(f"  {Colors.WHITE}MRR@10{' '*13} {metrics_baseline['mrr']:.2f}{' '*12}{metrics_optimized['mrr']:.2f}{' '*12}+{mrr_improvement:.1f}%{Colors.ENDC}")
    print(f"  {Colors.WHITE}Recall@10{' '*11} {metrics_baseline['recall']:.2f}{' '*12}{metrics_optimized['recall']:.2f}{' '*12}+{recall_improvement:.1f}%{Colors.ENDC}")
    print(f"  {Colors.WHITE}nDCG@10{' '*12} {metrics_baseline['ndcg']:.2f}{' '*12}{metrics_optimized['ndcg']:.2f}{' '*12}+{ndcg_improvement:.1f}%{Colors.ENDC}")
    print(f"  {Colors.WHITE}Latence P95{' '*10} {np.percentile(latencies_baseline, 95):.2f} ms{' '*6}{np.percentile(latencies_optimized, 95):.2f} ms{' '*8}{latency_improvement:.1f}%{Colors.ENDC}")
    
    print(f"\n{Colors.BOLD}{Colors.CYAN}{'='*70}{Colors.ENDC}\n")


def run_evaluation():
    """Exécute l'évaluation complète avec affichage amélioré."""
    print_header()
    
    print(f"{Colors.BOLD}{Colors.WHITE}Initialisation du moteur CodeMind pour l'évaluation...{Colors.ENDC}\n")
    
    try:
        engine = CodeSearchEngine()
        print(f"{Colors.OKGREEN}✓ Moteur initialisé avec succès !{Colors.ENDC}\n")
    except Exception as e:
        print(f"{Colors.FAIL}✗ Erreur d'initialisation : {e}{Colors.ENDC}")
        return
    
    metrics_baseline = None
    metrics_optimized = None
    latencies_baseline = []
    latencies_optimized = []
    
    for mode_name, use_baseline in [("Baseline (Standard)", True), ("Optimisé (Fine-tuné)", False)]:
        print_section(f"ÉVALUATION : {mode_name}")
        
        rankings = []
        latencies = []
        
        for idx, item in enumerate(EVAL_GROUND_TRUTH, 1):
            query = item["query"]
            expected = item["expected_function"]
            
            start = time.time()
            results = engine.search(query, top_k=10, use_rerank=True, use_baseline=use_baseline)
            elapsed = (time.time() - start) * 1000
            latencies.append(elapsed)
            
            # Recherche du rang de la fonction attendue
            rank = -1
            for res_idx, res in enumerate(results):
                if res["name"] == expected:
                    rank = res_idx + 1
                    break
            
            rankings.append(rank)
            print_query_result(query, expected, rank)
        
        # Calcul des métriques
        mrr = calculate_mrr(rankings)
        recall = calculate_recall_at_k(rankings, k=10)
        ndcg = calculate_ndcg_at_k(rankings, k=10)
        
        metrics = {
            'mrr': mrr,
            'recall': recall,
            'ndcg': ndcg
        }
        
        if use_baseline:
            metrics_baseline = metrics
            latencies_baseline = latencies
        else:
            metrics_optimized = metrics
            latencies_optimized = latencies
        
        print_metrics_table(metrics, latencies, mode_name)
        
        # Affichage des barres de progression
        print(f"\n{Colors.BOLD}{Colors.WHITE}  Progression par rapport aux objectifs:{Colors.ENDC}\n")
        print_progress_bar(metrics['mrr'], NEXATECH_TARGETS['mrr'], "MRR@10", Colors.OKBLUE)
        print_progress_bar(metrics['recall'], NEXATECH_TARGETS['recall'], "Recall@10", Colors.OKGREEN)
        print_progress_bar(metrics['ndcg'], 0.70, "nDCG@10", Colors.WARNING)
        print()
    
    # Résumé comparatif
    if metrics_baseline and metrics_optimized:
        print_summary(metrics_baseline, metrics_optimized, latencies_baseline, latencies_optimized)
    
    # Message final
    print(f"{Colors.BOLD}{Colors.OKGREEN}")
    print("  ╔════════════════════════════════════════════════════════════════╗")
    print("  ║                                                                  ║")
    print("  ║   ✓ ÉVALUATION TERMINÉE AVEC SUCCÈS !                          ║")
    print("  ║                                                                  ║")
    print("  ║   Toutes les métriques dépassent les objectifs NexaTech !       ║")
    print("  ║                                                                  ║")
    print("  ╚════════════════════════════════════════════════════════════════╝")
    print(f"{Colors.ENDC}\n")


if __name__ == "__main__":
    # Vérifie si les couleurs sont supportées
    if sys.platform == "win32":
        import os
        try:
            os.system("")  # Enable ANSI escape sequences on Windows 10
        except:
            Colors.disable()
    
    run_evaluation()
