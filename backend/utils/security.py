# -*- coding: utf-8 -*-
"""
Module de sécurité pour CodeMind.
Valide les entrées utilisateur pour empêcher les injections, le code malveillant
ou les requêtes trop volumineuses.
"""

class InputValidator:
    def __init__(self, allowed_languages=None, max_code_length=5000):
        self.allowed_languages = allowed_languages or ["python", "javascript", "go", "java", "php", "ruby"]
        self.max_code_length = max_code_length

    def validate_language(self, language: str) -> bool:
        """
        Vérifie si le langage est supporté par l'application.
        """
        if not language:
            return False
        return language.lower() in self.allowed_languages

    def validate_code_length(self, code: str) -> bool:
        """
        Vérifie que la taille du code ne dépasse pas la limite configurée.
        """
        if not code:
            return True
        return len(code) <= self.max_code_length

    def is_safe_query(self, query: str) -> bool:
        """
        Filtre basique pour bloquer des patterns potentiellement dangereux ou abusifs.
        """
        if not query:
            return False
        if len(query) > 500:  # Une requête sémantique ne devrait pas dépasser 500 caractères
            return False
        # Exemple de motifs suspects dans une requête en langage naturel
        dangerous_patterns = [
            r"rm\s+-rf", r"drop\s+database", r"delete\s+from",
            r"<script>", r"exec\("
        ]
        import re
        for pattern in dangerous_patterns:
            if re.search(pattern, query, re.IGNORECASE):
                return False
        return True
