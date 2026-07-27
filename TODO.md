# TODO - Amélioration de la génération de code (Onglet "Générer")

## Objectif
Remplacer `_mock_generate_code()` par une version intelligente qui parse la description naturelle et génère du code correct selon le langage sélectionné.

## Étapes
- [x] Analyser le code existant (`llm_explainer.py`, `main.py`, `generate/page.tsx`)
- [x] Comprendre la structure de `_mock_generate_code()` 
- [ ] Implémenter un parser de description naturelle:
  - Extraire le nom de fonction (ex: `calculer_moyenne()`)
  - Détecter les paramètres d'entrée et types
  - Détecter le type de retour
  - Comprendre la logique métier décrite
- [ ] Implémenter des générateurs de code par langage (Python, JS, Go, Java, PHP, Ruby)
- [ ] Ajouter des catégories: math/statistiques, validation, formatage, parsing, manipulation chaînes, calculs date
- [ ] Tester avec l'exemple "calculer_moyenne()" en Python
- [ ] Redémarrer le backend et vérifier

