# CodeMind — Semantic Code Search

Plateforme sémantique de recherche et d’assistance code pour le référentiel NexaTech.

## Stack
- Frontend : Next.js (App Router), Tailwind CSS, Plotly.js, Playwright
- Backend : FastAPI, FAISS, Transformers (bi-encoder), Cross-encoder, DeepSeek API
- Recherche : embeddings sémantiques + reranking + baseline index
- Services : Recherche sémantique, explication IA, audit sécurité, traduction, docstring, optimisation, génération OpenAPI, CoPilot

## Lancement
```bash
# Backend (from backend/ directory)
cd backend
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload

# Frontend
cd frontend
npm install
npm run dev
```

## URLs utiles
- Frontend : http://localhost:8501
- Backend : http://localhost:8000
- Health : http://localhost:8000/health
- API Docs : http://localhost:8000/docs

## Pages
- `/` : Accueil / login
- `/dashboard` : Dashboard + carrousel
- `/search` : Recherche sémantique + vocal
- `/analytics` : Métriques recherche
- `/techlead` : Interface Tech Lead
- `/copilot` : Chat assistant référentiel
- `/generate` : Générateur de code IA

## Configuration
- `backend/configs/config.yaml` : modèle, index FAISS, LLM provider, sécurité

## Auteur
- NexaTech Solutions — Abidjan, Côte d'Ivoire
