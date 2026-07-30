# 🗃️ Fiche de Données (Dataset Card) - CodeMind Corpus

Cette fiche présente les détails du jeu de données utilisé pour l'entraînement, l'évaluation et l'indexation sémantique du projet **CodeMind**.

---

## 1. Description du Jeu de Données
Le jeu de données de CodeMind est un corpus hybride combinant des fonctions issues de **CodeSearchNet** (splits Python et JavaScript) et des fonctions utilitaires métier écrites sur-mesure pour correspondre au contexte de **NexaTech Solutions** (Abidjan, Côte d'Ivoire).

- **Langages pris en charge** : Python (30%), JavaScript (15%), Java (20%), Go (15%), Ruby (10%), PHP (10%)
- **Taille totale** : 100 fonctions de démonstration hautement représentatives (MVP)
- **Format** : Fichiers JSON Lines (`.jsonl`) stockés dans `data/processed_corpus.jsonl`

---

## 2. Structure d'un Échantillon (Schéma JSON)
Chaque fonction est stockée sous forme de dictionnaire JSON structuré comme suit :

```json
{
  "name": "validate_ci_phone_number",
  "language": "python",
  "docstring": "Valide un numéro de téléphone mobile en Côte d'Ivoire selon le plan de numérotation à 10 chiffres (Orange: 07, MTN: 05, Moov: 01).",
  "code": "def validate_ci_phone_number(phone_str: str) -> bool:\n    import re\n    cleaned = re.sub(r'\\s+|-', '', phone_str)\n    pattern = r'^(?:\\+225|225)?(01|05|07)\\d{8}$'\n    return bool(re.match(pattern, cleaned))",
  "arguments": ["phone_str"]
}
```

---

## 3. Détails des Thématiques Métier (NexaTech Solutions)

Le dataset se concentre sur les cas d'usage réels des développeurs de NexaTech :
- **Fintech & Mobile Money** : Validation des numéros à 10 chiffres (ARTCI Côte d'Ivoire), calculs de TVA fiscale locale (18%), formatage des devises de l'UEMOA (Franc CFA - XOF).
- **Intégration d'API** : Signatures cryptographiques HMAC-SHA256, décodeurs de Tokens JWT pour l'authentification sécurisée des passerelles de paiement.
- **Utilitaires généraux** : Formateurs de dates ISO, filtres d'injection XSS, parsers de transactions bancaires CSV (format Wave/Orange Money).

---

## 4. Préparation et Nettoyage
Le pipeline de preprocessing (`utils/preprocessor.py`) effectue les actions suivantes sur le corpus brut :
1. **Nettoyage des Docstrings** : Retrait des triples guillemets, élimination des retours à la ligne superflus et normalisation des espaces pour optimiser l'encodage textuel.
2. **Nettoyage du Code** : Suppression des lignes de commentaires redondantes et des lignes vides pour réduire le bruit de tokenisation.
3. **Analyse syntaxique (AST)** : Validation de la conformité du code Python via l'arbre de syntaxe abstraite afin de garantir qu'aucun code syntaxiquement invalide n'est indexé.
