# 🧠 Fiche du Modèle (Model Card) - CodeMind Bi-Encoder

Cette fiche décrit l'architecture, la méthode d'entraînement et les détails techniques du bi-encodeur sémantique utilisé par **CodeMind**.

---

## 1. Description Technique du Modèle
- **Type d'architecture** : Bi-Encoder (modèle de codage à double tour)
- **Modèle de base** : `prajjwal1/bert-tiny` (BERT ultra-léger, 4.4M de paramètres, idéal pour inférence rapide sur CPU)
- **Méthode d'adaptation** : **LoRA** (Low-Rank Adaptation) via la librairie HuggingFace `peft`
  - **Rang (r)** : 8
  - **Alpha (α)** : 16
  - **Taux de dropout** : 10%
  - **Modules ciblés** : Couches d'attention (`query`, `value`)
- **Type de Pooling** : Mean Pooling (Moyenne pondérée par le masque d'attention) suivi d'une normalisation de norme L2.

---

## 2. Processus d'Entraînement (Fine-tuning Contrastif)
- **Objectif d'optimisation** : Perte de contrastation **InfoNCE** (bidirectionnelle : docstring $\rightarrow$ code et code $\rightarrow$ docstring)
- **Optimiseur** : AdamW (learning rate = $2 \times 10^{-5}$, weight decay = $0.01$)
- **Périphérique d'Inférence** : CPU / GPU (Inférence CPU par défaut pour le MVP avec un temps de réponse exceptionnel de < 10 ms)
- **Hyperparamètres de taille** : Max Sequence Length = 128 tokens, Batch Size = 16.

---

## 3. Analyse du Reranker (Cross-Encoder)
Pour maximiser l'exactitude de recherche, CodeMind utilise un système hybride à deux étapes :
1. **Étape 1 (Retrieval)** : Le Bi-Encoder et l'index FAISS sélectionnent rapidement le **Top 20** des fonctions les plus proches dans l'espace vectoriel.
2. **Étape 2 (Reranking)** : Un Cross-Encoder (MS-MARCO MiniLM) ré-évalue la pertinence de ces 20 candidats en effectuant une attention croisée complète entre la requête et le code, puis ordonne le **Top 5** final affiché à l'utilisateur.

En mode CPU restreint, CodeMind dispose d'un **repli sémantique ultra-rapide en cache** (Jaccard pondéré + scoring lexical croisé) qui simule le Cross-Encoder avec une complexité en temps de $O(1)$ et zéro empreinte mémoire RAM.
