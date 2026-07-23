# 🐳 CodeMind - Guide de Déploiement Production (Docker)

Ce guide décrit la procédure pour déployer l'application **CodeMind** en environnement de production ou de démonstration à l'aide de **Docker** et **Docker Compose**.

---

## 🏗️ Architecture Dockerisé

La solution est divisée en deux services indépendants et isolés :

1. **`backend` (FastAPI)** : Gère le moteur sémantique, charge les index FAISS et les modèles en mémoire RAM, et expose l'API sur le port `8000`.
2. **`frontend` (Streamlit)** : Offre l'interface utilisateur multi-pages et communique avec le backend, exposé sur le port `8501`.

---

## ⚡ Prérequis

- **Docker** (version 20.10.0 ou supérieure)
- **Docker Compose** (version 1.29.0 ou supérieure)
- **Ressources Système Recommandées** :
  - CPU : 2 Cores ou plus
  - RAM : 4 Go (pour accueillir les modèles transformateurs légers)
  - Espace Disque : 2 Go libres

---

## 🚀 Lancement Rapide (One-Command Deployment)

### Sur Linux/Mac
Exécutez le script d'automatisation qui prépare l'environnement, crée les index FAISS et démarre les conteneurs :

```bash
chmod +x deploy.sh
./deploy.sh
```

### Sur Windows
Ouvrez votre terminal et exécutez le script batch équivalent :

```cmd
deploy.bat
```

---

## 🛠️ Déploiement Manuel par Étapes

Si vous préférez exécuter les commandes manuellement, suivez ces étapes :

### Étape 1 : Préparer les données locales
Créez les dossiers requis pour la persistance des volumes Docker :
```bash
mkdir -p data data/raw embeddings models/saved_biencoder
```

### Étape 2 : Préparer le corpus de code
Générez le corpus de code de démonstration NexaTech Solutions :
```bash
python services/prepare_codesearchnet.py
```

### Étape 3 : Construire les index vectoriels FAISS
Calculez les embeddings pour la baseline et pour le modèle fine-tuné :
```bash
PYTHONPATH=. python scripts/build_baseline_index.py
PYTHONPATH=. python scripts/build_index.py
```

### Étape 4 : Lancer Docker Compose
Construisez les images Docker et lancez les conteneurs en tâche de fond (detached mode) :
```bash
docker-compose up --build -d
```

---

## 📡 Accès aux Services

Une fois déployés, les services sont accessibles aux URL suivantes :

- **Interface Streamlit (Frontend)** : [http://localhost:8501](http://localhost:8501)
- **API FastAPI (Backend)** : [http://localhost:8000](http://localhost:8000)
- **Documentation Swagger Auto-générée** : [http://localhost:8000/docs](http://localhost:8000/docs)

---

## 🔒 Variables d'Environnement (Optionnel)

Pour activer le module d'explication sémantique de code avancé par un LLM commercial (comme OpenAI), vous pouvez configurer vos clés API dans un fichier `.env` à la racine du projet ou les passer en ligne de commande :

```env
OPENAI_API_KEY=votre_cle_api_openai_ici
```

Le fichier `docker-compose.yml` injectera automatiquement cette variable dans le conteneur du backend FastAPI.
