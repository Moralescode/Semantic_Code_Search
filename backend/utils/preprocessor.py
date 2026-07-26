# -*- coding: utf-8 -*-
"""
Module de prétraitement pour CodeMind.
Permet de nettoyer, formater et préparer le code et les docstrings pour la tokenisation.
Support multi-langages : Python, JavaScript, Go, Java, PHP, Ruby.
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
        Nettoie le code source pour la vectorisation en retirant les lignes vides,
        les commentaires et en normalisant les espaces. Supporte Python, JavaScript,
        Go, Java, PHP, Ruby.
        """
        if not code:
            return ""
        lines = code.split('\n')
        cleaned_lines = []
        in_multiline_comment = False
        for line in lines:
            stripped = line.strip()

            # Gestion des commentaires multi-lignes /* ... */ (JS, Go, Java, PHP, CSS)
            if in_multiline_comment:
                if '*/' in stripped:
                    in_multiline_comment = False
                    # Si la ligne contient aussi du code après */, on la garde
                    after_comment = stripped.split('*/', 1)[1].strip()
                    if after_comment:
                        cleaned_lines.append(line)
                continue
            if stripped.startswith('/*'):
                if '*/' in stripped:
                    # Commentaire sur une seule ligne
                    after_comment = stripped.split('*/', 1)[1].strip()
                    if after_comment:
                        cleaned_lines.append(line)
                else:
                    in_multiline_comment = True
                continue

            # Commentaires Ruby =begin/=end
            if stripped == '=begin':
                in_multiline_comment = True
                continue
            if stripped == '=end':
                in_multiline_comment = False
                continue

            # Commentaires simples: # (Python, Ruby, PHP, Bash), // (JS, Go, Java, PHP)
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

