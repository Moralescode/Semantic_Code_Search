# -*- coding: utf-8 -*-
"""
Tests unitaires pour le parseur de fichiers de CodeMind.
"""

from services.parser import CodeParser

def test_parse_python():
    code_content = """def my_func(a, b):
    \"\"\"This is a test function\"\"\"
    return a + b
"""
    funcs = CodeParser.parse_python(code_content)
    assert len(funcs) == 1
    assert funcs[0]["name"] == "my_func"
    assert funcs[0]["docstring"] == "This is a test function"
    assert "a" in funcs[0]["arguments"]

def test_parse_javascript():
    code_content = """// Check user status
function checkUser(user) {
  return user.active;
}
"""
    funcs = CodeParser.parse_javascript(code_content)
    assert len(funcs) == 1
    assert funcs[0]["name"] == "checkUser"
    assert "active" in funcs[0]["code"]

def test_parse_file(tmp_path):
    p = tmp_path / "hello.py"
    p.write_text("def hello():\n    return 'world'")
    funcs = CodeParser.parse_file(str(p))
    assert len(funcs) == 1
    assert funcs[0]["name"] == "hello"
