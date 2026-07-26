# PLAN D'ACTION — CodeMind Backend + Frontend Synergy

## 1. Backend (backend/)
### 1.1 Config LLM (config.yaml)
- [ ] Activer un provider réel (deepseek/ollama) au lieu de "mock"
- [ ] Ajouter la configuration CORS pour Next.js (port 8501)
- [ ] Ajouter clé API ElevenLabs

### 1.2 main.py
- [ ] Fixer les endpoints IA : traductions mock manquantes (optimize, docstring avec LLM réel)
- [ ] Ajouter endpoint `/voices` pour lister les voix ElevenLabs
- [ ] Ajouter endpoint `/test_elevenlabs` pour tester la connexion API
- [ ] Ajouter endpoint `/speak` pour TTS via ElevenLabs
- [ ] Améliorer le RAG CoPilot avec meilleur formatage des résultats FAISS

### 1.3 Tests backend
- [ ] Ajouter tests pour les nouveaux endpoints (voices, speak, elevenlabs)
- [ ] Ajouter tests d'intégration frontend → backend

## 2. Config Build (next.config.js)
- [ ] Ajouter les rewrites API manquants
- [ ] Optimiser les images/remotePatterns

## 3. base44Client.ts
- [ ] Ajouter les endpoints manquants (voices, speak, elevenlabs)
- [ ] Ajouter le typage TypeScript strict pour les réponses

## 4. Composants partagés (components/)
### 4.1 PageLayout.tsx
- [ ] Ajouter support du titre vocal (lecture à haute voix via ElevenLabs)
- [ ] Ajouter prop `speakTitle` pour activer la synthèse vocale du titre

### 4.2 Header.tsx
- [ ] Ajouter bouton paramètres vocaux (sélection de voix)
- [ ] Ajouter indicateur de statut de connexion ElevenLabs

### 4.3 CodeBlock.tsx
- [ ] Ajouter bouton "Écouter le code" (lecture du code commenté)
- [ ] Ajouter support de la lecture vocale du code sélectionné

### 4.4 Sidebar.tsx / BottomNav.tsx
- [ ] Ajouter lien "Paramètres vocaux" dans le menu
- [ ] Ajouter badge "ElevenLabs 🎤" si connecté

## 5. Pages IA
### 5.1 explain/page.tsx
- [ ] Ajouter bouton "Écouter l'explication" (speakExplanation)

### 5.2 copilot/page.tsx
- [ ] Ajouter bouton "Écouter la réponse" (speakCopilotResponse)

### 5.3 settings/page.tsx
- [ ] Ajouter section "Configuration vocale ElevenLabs"
  - Champ API Key
  - Test connexion
  - Sélection de voix
  - Volume et vitesse

## 6. Nettoyage
- [ ] Supprimer les fichiers temporaires (fix_*.py, diag*.py, gen_*.py, build_*.py)
- [ ] Nettoyer les imports inutilisés
- [ ] Vérifier qu'il n'y a pas de `chr(` dans le code (remplacer par les vrais émojis)

