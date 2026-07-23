# -*- coding: utf-8 -*-
"""
Module de prétraitement pour CodeMind.
Permet de nettoyer, formater et préparer le code et les docstrings pour la tokenisation.
"""

import re

class CodePreprocessor:
    @staticmethod
    def clean_docstring(docstring: str) -> str:
        """
        Nettoie la docstring en supprimant les sauts de ligne inutiles, les espaces en trop
        et les balises spéciales.
        """
        if not docstring:
            return ""
        # Supprime les triples guillemets
        docstring = re.sub(r'"""|\'\'\'', '', docstring)
        # Remplace les retours à la ligne par des espaces
        docstring = docstring.replace('\n', ' ').replace('\r', ' ')
        # Remplace plusieurs espaces par un seul
        docstring = re.sub(r'\s+', ' ', docstring)
        return docstring.strip()

    @staticmethod
    def clean_code(code: str) -> str:
        """
        Nettoie le code source pour la vectorisation en retirant les lignes vides
        et en normalisant les espaces.
        """
        if not code:
            return ""
        # Supprime les lignes de commentaires simples (#)
        lines = code.split('\n')
        cleaned_lines = []
        for line in lines:
            stripped = line.strip()
            if stripped.startswith('#') or stripped.startswith('//'):
                continue
            if stripped == "":
                continue
            cleaned_lines.append(line)
        return "\n".join(cleaned_lines)

    @staticmethod
    def preprocess_query(query: str) -> str:
        """
        Prépare la requête de recherche de l'utilisateur (nettoyage simple).
        """
        if not query:
            return ""
        query = query.strip().lower()
        # Conserve uniquement les caractères alphanumériques, les tirets et les espaces
        query = re.sub(r'[^\w\s\-]', ' ', query)
        query = re.sub(r'\s+', ' ', query)
        return query.strip()
