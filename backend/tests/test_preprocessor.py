# -*- coding: utf-8 -*-
"""
Tests unitaires pour le préprocesseur CodeMind.
"""

from utils.preprocessor import CodePreprocessor

def test_clean_docstring():
    raw_doc = '"""  Hello   \n World  """'
    cleaned = CodePreprocessor.clean_docstring(raw_doc)
    assert cleaned == "Hello World"

def test_clean_code():
    raw_code = """def foo():
    # comment
    return 42
"""
    cleaned = CodePreprocessor.clean_code(raw_code)
    assert "# comment" not in cleaned
    assert "return 42" in cleaned

def test_preprocess_query():
    raw_query = "Validate!!!  phone-number;;"
    processed = CodePreprocessor.preprocess_query(raw_query)
    assert "validate" in processed
    assert "!" not in processed
