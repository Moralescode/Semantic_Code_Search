#!/bin/bash
# Script de déploiement automatique de CodeMind pour NexaTech Solutions

echo "========================================================="
echo "🧠 CodeMind - Démarrage du Déploiement (Hackathon 2026)"
echo "========================================================="

# 1. Vérification des prérequis
if ! [ -x "$(command -v docker-compose)" ]; then
  echo 'Erreur : docker-compose est requis pour ce déploiement.' >&2
  exit 1
fi

# 2. Préparation locale de l'environnement de données
echo "🔄 Préparation des dossiers de données..."
mkdir -p data data/raw embeddings models/saved_biencoder

# 3. Lancement du corpus de démonstration et des index
echo "📦 Génération du corpus et construction des index FAISS..."
PYTHONPATH=. python services/prepare_codesearchnet.py
PYTHONPATH=. python scripts/build_baseline_index.py
PYTHONPATH=. python scripts/build_index.py

# 4. Lancement des conteneurs Docker
echo "🚀 Lancement des conteneurs Docker (FastAPI + Streamlit)..."
docker-compose up --build -d

echo "========================================================="
echo "✅ Déploiement Terminé !"
echo "FastAPI : http://localhost:8000"
echo "Streamlit : http://localhost:8501"
echo "========================================================="
