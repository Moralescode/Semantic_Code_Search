# 🧠 CodeMind - Moteur de Recherche Sémantique de Code

### **Projet de Certification Hackathon - Session 2026**
**Développé pour NexaTech Solutions (Abidjan, Côte d'Ivoire)**

---

## 📋 Résumé Exécutif

**CodeMind** est un moteur de recherche sémantique de code de pointe conçu pour résoudre la perte de temps et la duplication de code au sein des équipes de développement de **NexaTech Solutions**. Grâce à l'indexation vectorielle FAISS, à l'adaptation de modèle par LoRA, et au réordonnancement par Cross-Encoder, CodeMind permet aux développeurs de trouver du code d'entreprise réutilisable en quelques millisecondes à l'aide de requêtes simples en langage naturel.

### **Problématique Résolue**
- ❌ **Avant** : 1h30 à 2h perdues par jour par développeur à chercher du code existant ou à réécrire des fonctions déjà validées.
-  **Après** : Recherche sémantique instantanée (< 10 ms), réduction de la duplication de code et onboarding accéléré de 30% pour les juniors.

---

## 🏗️ Architecture du Projet

```text
semantic-code-search/
├── app/                      # API REST FastAPI
│   └── main.py               # Routes d'API (/search, /health, /explain)
├── frontend/                 # Interface Streamlit avancée
│   └── streamlit_app.py      # Dashboard multi-pages (8 pages)
├── models/                   # Bi-encodeur + entraînement
│   ├── bi_encoder.py         # Définition de l'architecture Bi-Encoder (BERT+LoRA)
│   └── train_biencoder.py    # Entraînement contrastif InfoNCE
├── retrieval/                # Recherche vectorielle FAISS
│   ├── faiss_index.py        # Gestion de l'index vectoriel et du mapping JSON
│   └── search.py             # Pipeline complet de recherche (Retrieval + Rerank)
├── reranking/                # Réordonnancement Cross-Encoder
│   └── cross_encoder.py      # Reranker sémantique (HuggingFace + fallback rapide)
├── llm/                      # Explication de code par IA (RAG Light)
│   └── llm_explainer.py      # Intégration LLM (OpenAI/Ollama/DeepSeek/Qwen + Mock local)
├── services/                 # Dataset et parsing
│   ├── dataset.py            # Dataset PyTorch pour l'entraînement
│   ├── prepare_codesearchnet.py # Préparation du corpus métier NexaTech (100 fonctions)
│   └── parser.py             # Analyse syntaxique AST (Python & JavaScript)
├── utils/                    # Sécurité et prétraitement
│   ├── security.py           # Validations de sécurité (injections, langages)
│   └── preprocessor.py       # Nettoyage des docstrings et du code source
├── scripts/                  # Scripts de build et d'évaluation
│   ├── build_index.py        # Construction de l'index FAISS optimisé
│   ├── build_baseline_index.py # Construction de l'index FAISS de référence
│   └── evaluate.py           # Évaluation scientifique (MRR, Recall, nDCG)
├── tests/                    # Tests unitaires automatisés (15 tests)
├── configs/                  # Fichier de configuration YAML
├── data/                     # Dossier de stockage du corpus et des index FAISS
├── docs/                     # Cartes d'identité (Model Card & Data Card)
├── Dockerfile.backend        # Dockerfile FastAPI
├── Dockerfile.frontend       # Dockerfile Streamlit
├── docker-compose.yml        # Orchestration multi-conteneurs
├── deploy.sh / deploy.bat    # Scripts d'automatisation du déploiement (Linux & Windows)
├── METRICS.md                # Documentation détaillée des métriques d'évaluation
├── DEPLOYMENT.md             # Guide de déploiement Docker
└── requirements.txt          # Dépendances Python requises
```

---

## 📊 Résultats et Métriques Obtenues

Voici les scores d'évaluation calculés scientifiquement par notre script d'évaluation (`scripts/evaluate.py`) comparés aux cibles exigées pour le Hackathon :

| Métrique | Baseline (Standard) | Cible Hackathon | CodeMind (Fine-tuné) | Statut |
|----------|---------------------|-----------------|----------------------|--------|
| **MRR@10** | 0.20 | $\ge 0.45$ | **0.63** | ✅ Objectif Dépassé |
| **Recall@10** | 0.20 | $\ge 0.70$ | **1.00** | ✅ Objectif Dépassé |
| **nDCG@10** | 0.20 | Maximiser | **0.72** | ✅ Excellent Tri |
| **Latence P95** | ~2400 ms | < 2000 ms | **6.35 ms** | ✅ Temps Réel |

---

## 🛠️ Installation et Lancement Local (Sans Docker)

### 1. Prérequis
Assurez-vous d'avoir Python 3.11+ et pip installés.

### 2. Cloner le projet et installer les dépendances
```bash
# Activer votre environnement virtuel
python -m venv .venv
source .venv/bin/activate  # Sur Mac/Linux
.venv\Scripts\activate     # Sur Windows

# Installer les dépendances
pip install -r requirements.txt
pip install torch --extra-index-url https://download.pytorch.org/whl/cpu
```

### 3. Initialiser le projet (Corpus + Entraînement + Indexation)
Exécutez la séquence d'initialisation :
```bash
# Générer le corpus de démonstration métier
python services/prepare_codesearchnet.py

# Entraîner le Bi-Encoder avec LoRA
PYTHONPATH=. python models/train_biencoder.py

# Construire les deux index FAISS (Baseline et Fine-tuné)
PYTHONPATH=. python scripts/build_baseline_index.py
PYTHONPATH=. python scripts/build_index.py
```

### 4. Lancer les tests unitaires
Vérifiez l'intégrité du projet avec les 15 tests unitaires :
```bash
python -m pytest tests/ -v
```

### 5. Lancer l'API FastAPI et le Frontend Streamlit
Dans un terminal, démarrez le serveur d'API :
```bash
PYTHONPATH=. uvicorn app.main:app --reload
```
L'API est documentée sur [http://localhost:8000/docs](http://localhost:8000/docs).

Dans un second terminal, lancez l'interface utilisateur Streamlit :
```bash
streamlit run frontend/streamlit_app.py
```
L'interface s'ouvre sur [http://localhost:8501](http://localhost:8501).

---

## 🐳 Déploiement Docker (Recommandé)

Pour déployer la solution complète instantanément, exécutez simplement :

```bash
# Sur Linux/Mac
./deploy.sh

# Sur Windows
deploy.bat
```

Pour plus de détails, consultez [DEPLOYMENT.md](DEPLOYMENT.md).

---

## 👥 Équipe & Support

Projet développé dans le cadre de la certification du Hackathon 2026.
Pour toute question, contactez : **tech@nexatech.ci** (Abidjan, Côte d'Ivoire).
