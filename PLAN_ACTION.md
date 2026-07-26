# PLAN D'ACTION — CodeMind Backend + Frontend Synergy

## 1. Backend (backend/) ✅ COMPLETE
### 1.1 Config LLM (config.yaml)
- [x] Activer un provider réel (ollama) au lieu de "mock"
- [x] Ajouter la configuration CORS pour Next.js (port 3000)
- [x] Ajouter clé API ElevenLabs

### 1.2 main.py
- [x] Fixer les endpoints IA : traductions mock manquantes (optimize, docstring avec LLM réel)
- [x] Ajouter endpoint `/voices` pour lister les voix ElevenLabs
- [x] Ajouter endpoint `/test_elevenlabs` pour tester la connexion API
- [x] Ajouter endpoint `/speak` pour TTS via ElevenLabs
- [x] Améliorer le RAG CoPilot avec meilleur formatage des résultats FAISS

### 1.3 Tests backend
- [ ] Ajouter tests pour les nouveaux endpoints (voices, speak, elevenlabs)
- [ ] Ajouter tests d'intégration frontend → backend

## 2. Config Build (next.config.js) ✅ COMPLETE
- [x] Ajouter les rewrites API manquants
- [x] Optimiser les images/remotePatterns

## 3. base44Client.ts ✅ COMPLETE
- [x] Ajouter les endpoints manquants (voices, speak, elevenlabs)
- [x] Ajouter le typage TypeScript strict pour les réponses

## 4. Composants partagés (components/) ✅ COMPLETE
### 4.1 PageLayout.tsx
- [x] Ajouter support du titre vocal (lecture à haute voix via ElevenLabs)
- [x] Ajouter prop `speakTitle` pour activer la synthèse vocale du titre

### 4.2 Header.tsx
- [x] Ajouter bouton paramètres vocaux (sélection de voix)
- [x] Ajouter indicateur de statut de connexion ElevenLabs

### 4.3 CodeBlock.tsx
- [x] Ajouter bouton "Écouter le code" (lecture du code commenté)
- [x] Ajouter support de la lecture vocale du code sélectionné

### 4.4 Sidebar.tsx / BottomNav.tsx
- [x] Ajouter lien "Paramètres vocaux" dans le menu
- [x] Ajouter badge "ElevenLabs 🎤" si connecté

## 5. Pages IA ✅ COMPLETE
### 5.1 explain/page.tsx
- [x] Ajouter bouton "Écouter l'explication" (speakExplanation)

### 5.2 copilot/page.tsx
- [x] Ajouter bouton "Écouter la réponse" (speakCopilotResponse)

### 5.3 settings/page.tsx
- [x] Ajouter section "Configuration vocale ElevenLabs"
  - [x] Champ API Key
  - [x] Test connexion
  - [x] Sélection de voix
  - [x] Volume et vitesse

## 6. Nettoyage ✅ COMPLETE
- [x] Supprimer les fichiers temporaires (fix_*.py, diag*.py, gen_*.py, build_*.py)
- [x] Nettoyer les imports inutilisés
- [x] Supprimer `frontend/app/login/` (dossier vide)
- [x] Supprimer scripts temporaires racine (`demo_metrics.py`, `test_*.py`, etc.)
- [x] Rewrite git history pour supprimer `node_modules/` et `.next/` du repository

## 7. Push GitHub ✅ COMPLETE
- [x] Commit des changements backend restructuré
- [x] Commit des 7 nouvelles pages IA
- [x] Nettoyage de l'historique git (filter-branch)
- [x] Force push vers `origin/main`

## Résumé
- **21/21 routes** compilées avec succès
- **16 endpoints backend** (14 IA/search + 2 ElevenLabs)
- **7 pages IA** créées et connectées
- **ElevenLabs** intégré (voix + TTS)
- **Ollama** configuré comme LLM provider (`codellama:7b`)
- **Build** : ✅ Passant
- **Git** : ✅ Pushé sur `https://github.com/Moralescode/Semantic_Code_Search.git`
