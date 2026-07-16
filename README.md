# Semantic_Code_Search
Semantic_Code_Search est un classique très fort pour une certification GenAI ML/IR/NLP : il combine embeddings multilingues code/texte, retrieval dense (FAISS), reranking, évaluation IR, LLM explicatif, et garde-fous. Il est parfaitement cadré pour scorer haut sur la grille (embeddings + contrastive + FAISS + Transformers + IR metrics + produit).

1. Contexte (Situation réelle)
Entreprise : NexaTech Solutions (nom fictif mais réaliste)
Siège : Abidjan (Plateau / Cocody), Côte d’Ivoire
Activité : Entreprise de services numériques spécialisée dans le développement d’applications pour les banques, fintechs (Mobile Money, microfinance) et opérateurs télécoms en Afrique de l’Ouest.
Situation actuelle :

* L’entreprise possède un monorepo de plus de 4 ans contenant des centaines de milliers de lignes de code.
* Stack principale : Python (backend, data engineering, APIs, scripts d’intégration Mobile Money) + JavaScript/TypeScript (frontend React, Node.js, scripts d’automatisation).
* Équipe : 35 développeurs (mix junior/mid/senior), dont beaucoup de nouveaux recrutés chaque année.
* Outils actuels de recherche de code : GitHub Search classique + `grep` + recherche manuelle + StackOverflow.
2. Problème concret (Pain point)
Les développeurs perdent en moyenne 1h30 à 2h par jour à chercher des fonctions déjà existantes dans le codebase.
Conséquences mesurables :

* Forte duplication de code (plusieurs versions de la même logique de validation de numéro de téléphone, de parsing de CSV mobile money, de gestion de tokens, etc.).
* Onboarding des juniors très long (3 à 4 semaines avant d’être productif).
* Bugs récurrents car les devs réécrivent des fonctions déjà corrigées et testées.
* Perte de productivité estimée à 18-22 % du temps de développement.
* Frustration élevée des devs seniors qui répondent sans cesse aux mêmes questions.
Le management a fixé comme objectif 2025 : réduire le temps de recherche de code de 60 % et diminuer la duplication de code.
3. Solution proposée (notre projet)
Développer un Moteur de Recherche Sémantique de Code interne appelé CodeMind (nom de code).
Fonctionnalités principales :

* L’utilisateur écrit son intention en langage naturel (français ou anglais) :
→ « fonction qui valide un numéro Orange Money et retourne le format international »
→ « parser un fichier CSV de transactions et filtrer les doublons »
* Le système retrouve les fonctions les plus pertinentes en Python et JavaScript.
* Affiche : code + docstring + licence + score de pertinence + explication claire générée.
* Détecte les requêtes ambiguës et propose des clarifications.
* Fonctionne en cross-language (requête en français → code Python ou JS).
4. Personas principaux

1. Kofi – Développeur mid-level Python (2 ans d’expérience) – veut retrouver rapidement des utilitaires déjà validés.
2. Amina – Junior JavaScript / React – en onboarding, a besoin de comprendre et réutiliser le code existant.
3. M. Diallo – Tech Lead – veut réduire la duplication et améliorer la qualité globale du code.
5. Indicateurs de succès (métriques business + techniques)

* MRR@10 ≥ 0.45
* Recall@10 ≥ 0.70
* nDCG@10
* Latence p95 < 2 secondes
* Diversité des résultats
* Temps moyen de recherche perçu par les devs (objectif : < 30 secondes)
* Taux d’adoption interne après 1 mois
6. Périmètre du MVP (ce que nous livrons)

* 250 000 fonctions (Python + JavaScript) issues de CodeSearchNet (comme proxy réaliste du monorepo)
* Bi-encodeur fine-tuné avec contrastive loss + LoRA
* Index FAISS
* Reranker cross-encoder
* API FastAPI + Interface Streamlit
* Explication des résultats (RAG light)
* Gestion des licences + scan de secrets + garde-fous
* Détection d’ambiguïté
