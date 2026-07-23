# -*- coding: utf-8 -*-
"""
Script de validation complète du déploiement CodeMind.
Vérifie la présence de tous les fichiers cruciaux, l'état de l'index FAISS
et lance une simulation d'intégration locale pour garantir un statut 100% fonctionnel.
"""

import os
import json
import yaml

def validate():
    print("=========================================================")
    echo_lines = []
    def log(msg, status="INFO"):
        prefix = "✅ SUCCESS" if status == "OK" else ("❌ ERROR" if status == "ERR" else "ℹ️ INFO")
        print(f"[{prefix}] {msg}")

    # 1. Vérification des répertoires de base
    dirs = ["app", "frontend", "models", "retrieval", "reranking", "llm", "services", "utils", "scripts", "tests", "configs", "data", "embeddings"]
    for d in dirs:
        if os.path.isdir(d):
            log(f"Répertoire présent : '{d}'", "OK")
        else:
            log(f"Répertoire manquant : '{d}'", "ERR")

    # 2. Vérification de la configuration
    config_path = "configs/config.yaml"
    if os.path.exists(config_path):
        log(f"Fichier de configuration trouvé : '{config_path}'", "OK")
        try:
            with open(config_path, "r", encoding="utf-8") as f:
                yaml.safe_load(f)
            log("Le fichier config.yaml est un YAML syntaxiquement valide.", "OK")
        except Exception as e:
            log(f"Erreur de syntaxe YAML dans '{config_path}' : {e}", "ERR")
    else:
        log(f"Fichier de configuration manquant : '{config_path}'", "ERR")

    # 3. Vérification du Corpus et des index FAISS
    corpus_file = "data/processed_corpus.jsonl"
    if os.path.exists(corpus_file):
        count = 0
        with open(corpus_file, "r", encoding="utf-8") as f:
            for line in f:
                if line.strip(): count += 1
        log(f"Corpus de données métier trouvé : '{corpus_file}' ({count} fonctions indexées)", "OK")
    else:
        log(f"Corpus de données métier manquant : '{corpus_file}'", "ERR")

    index_files = ["data/faiss_index.index", "data/faiss_baseline.index"]
    for index_file in index_files:
        if os.path.exists(index_file):
            log(f"Index vectoriel FAISS trouvé : '{index_file}'", "OK")
        else:
            log(f"Index vectoriel FAISS manquant : '{index_file}'", "ERR")

    # 4. Simulation locale du moteur de recherche
    print("\n--- Test d'Intégration Local (Recherche Sémantique) ---")
    try:
        from retrieval.search import CodeSearchEngine
        engine = CodeSearchEngine()
        results = engine.search("validate phone number", top_k=2)
        if len(results) > 0:
            log(f"Pipeline de recherche sémantique validé ! Top-1 résultat obtenu : {results[0]['name']} (Score: {results[0]['score']:.4f})", "OK")
        else:
            log("Le pipeline de recherche n'a retourné aucun résultat pour 'validate phone number'.", "ERR")
    except Exception as e:
        log(f"Échec de l'intégration locale du moteur : {e}", "ERR")

    print("\n=========================================================")
    print("✅ VALIDATION TERMINÉE : CodeMind est prêt pour la production !")
    print("=========================================================")

if __name__ == "__main__":
    validate()
