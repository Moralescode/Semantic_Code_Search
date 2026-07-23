# -*- coding: utf-8 -*-
"""
Tests unitaires pour le validateur de sécurité CodeMind.
"""

from utils.security import InputValidator

def test_validate_language():
    validator = InputValidator(allowed_languages=["python", "javascript"])
    assert validator.validate_language("Python") is True
    assert validator.validate_language("java") is False

def test_validate_code_length():
    validator = InputValidator(max_code_length=10)
    assert validator.validate_code_length("1234567890") is True
    assert validator.validate_code_length("12345678901") is False

def test_is_safe_query():
    validator = InputValidator()
    assert validator.is_safe_query("how to calculate TVA?") is True
    assert validator.is_safe_query("rm -rf /") is False
