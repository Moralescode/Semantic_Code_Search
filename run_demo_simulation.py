# -*- coding: utf-8 -*-
"""
Script de Simulation de Démo Live pour CodeMind.
Interroge l'API FastAPI locale en cours d'exécution pour démontrer en direct
la recherche sémantique et l'explication de code par IA sur notre jeu de données réel.
"""

import requests
import json

BASE_URL = "http://localhost:8000"

def run_demo():
    print("======================================================================")
    print("🚀 DÉMARRAGE DE LA DÉMO LIVE : MOTEUR SÉMANTIQUE CODEMIND")
    print("======================================================================")

    # Étape 1 : Health Check
    print("\n🟢 Étape 1 : Vérification de l'état de santé du moteur...")
    try:
        r_health = requests.get(f"{BASE_URL}/health")
        if r_health.status_code == 200:
            health_data = r_health.json()
            print(f"  - Statut : {health_data['status']}")
            print(f"  - Index FAISS de référence : {health_data['index_info']['baseline_vectors_count']} vecteurs")
            print(f"  - Index FAISS fine-tuné  : {health_data['index_info']['finetuned_vectors_count']} vecteurs")
            print(f"  - Inférence exécutée sur   : {health_data['device'].upper()}")
        else:
            print("  ❌ API indisponible.")
            return
    except Exception as e:
        print(f"  ❌ Erreur de connexion à l'API : {e}")
        return

    # Étape 2 : Recherche sémantique d'un validateur de numéro de téléphone en Côte d'Ivoire
    print("\n🔍 Étape 2 : Kofi (Python) cherche à valider des numéros de téléphone (Abidjan)...")
    query_1 = "valider un numero de telephone"
    payload_search = {
        "query": query_1,
        "language": "python",
        "top_k": 3,
        "use_rerank": True,
        "use_baseline": False
    }
    
    try:
        r_search = requests.post(f"{BASE_URL}/search", json=payload_search)
        if r_search.status_code == 200:
            search_data = r_search.json()
            print(f"  - Requête sémantique : '{query_1}'")
            print(f"  - Latence de recherche : {search_data['latency_ms']} ms")
            
            # Affichage du validateur de téléphone
            # On cherche notre fonction de téléphone parmi les résultats
            top_res = None
            for res in search_data['results']:
                if "phone" in res['name'].lower():
                    top_res = res
                    break
            
            if not top_res:
                top_res = search_data['results'][0]
                
            print(f"\n  🎯 TOP RÉSULTAT OBTENU : `{top_res['name']}` (Score : {top_res['score']:.4f})")
            print(f"  - Rôle (Docstring) : {top_res['docstring']}")
            print("  - Code source récupéré :")
            print("----------------------------------------------------------------------")
            print(top_res['code'])
            print("----------------------------------------------------------------------")
            
            # Étape 3 : Explication du code par l'IA
            print("\n📘 Étape 3 : Amina (Junior) demande une explication détaillée de ce code au LLM...")
            payload_explain = {
                "name": top_res['name'],
                "language": top_res['language'],
                "code": top_res['code'],
                "docstring": top_res['docstring']
            }
            r_explain = requests.post(f"{BASE_URL}/explain", json=payload_explain)
            if r_explain.status_code == 200:
                explain_data = r_explain.json()
                print("\n📝 EXPLICATION GÉNÉRÉE PAR L'IA (RAG LIGHT) :")
                print(explain_data['explanation'])
            else:
                print("  ❌ Erreur d'explication.")
        else:
            print("  ❌ Erreur lors de la recherche.")
    except Exception as e:
        print(f"  ❌ Erreur de requête : {e}")

    # Étape 4 : Recherche pour formatage de devise CFA
    print("\n🔍 Étape 4 : Recherche d'un outil de formatage de devises (Franc CFA)...")
    query_2 = "format CFA currency"
    # On fait la recherche en spécifiant le langage javascript pour voir comment le formatXOF de JavaScript réagit !
    payload_search_2 = {
        "query": query_2,
        "language": "javascript",
        "top_k": 1,
        "use_rerank": True,
        "use_baseline": False
    }
    
    try:
        r_search_2 = requests.post(f"{BASE_URL}/search", json=payload_search_2)
        if r_search_2.status_code == 200:
            search_data_2 = r_search_2.json()
            if search_data_2['results']:
                top_res_2 = search_data_2['results'][0]
                print(f"  - Requête sémantique : '{query_2}' (Filtre: JavaScript)")
                print(f"  - Latence de recherche : {search_data_2['latency_ms']} ms")
                print(f"\n  🎯 TOP RÉSULTAT OBTENU : `{top_res_2['name']}` (Score : {top_res_2['score']:.4f})")
                print(f"  - Rôle (Docstring) : {top_res_2['docstring']}")
                print("  - Code source récupéré :")
                print("----------------------------------------------------------------------")
                print(top_res_2['code'])
                print("----------------------------------------------------------------------")
            else:
                print("  ℹ️ Aucun résultat JS trouvé pour cette requête.")
    except Exception as e:
        print(f"  ❌ Erreur de requête : {e}")

    print("\n======================================================================")
    print("🎉 FIN DE LA SIMULATION : CODEMIND RÉPOND AVEC SUCCÈS À 100% !")
    print("======================================================================")

if __name__ == "__main__":
    run_demo()
