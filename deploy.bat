@echo off
:: Script de déploiement automatique de CodeMind sur Windows pour NexaTech Solutions

echo =========================================================
echo 🧠 CodeMind - Démarrage du Déploiement (Hackathon 2026)
echo =========================================================

:: 1. Préparation locale de l'environnement de données
echo 🔄 Préparation des dossiers de données...
if not exist "data" mkdir data
if not exist "data\raw" mkdir data\raw
if not exist "embeddings" mkdir embeddings
if not exist "models\saved_biencoder" mkdir models\saved_biencoder

:: 2. Lancement du corpus de démonstration et des index
echo 📦 Génération du corpus et de l'index...
set PYTHONPATH=.
python services\prepare_codesearchnet.py
python scripts\build_baseline_index.py
python scripts\build_index.py

:: 3. Lancement des conteneurs Docker
echo 🚀 Lancement des conteneurs Docker (FastAPI + Streamlit)...
docker-compose up --build -d

echo =========================================================
echo ✅ Déploiement Terminé !
echo FastAPI : http://localhost:8000
echo Streamlit : http://localhost:8501
echo =========================================================
