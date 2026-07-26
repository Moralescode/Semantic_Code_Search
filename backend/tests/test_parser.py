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

def test_parse_go():
    code_content = """// ValidateCIPhone checks Ivorian phone format
func ValidateCIPhone(phoneStr string) bool {
    re := regexp.MustCompile(`^(?:\\+225|225)?(01|05|07)\\d{8}$`)
    cleaned := strings.NewReplacer(" ", "", "-", "").Replace(phoneStr)
    return re.MatchString(cleaned)
}
"""
    funcs = CodeParser.parse_go(code_content)
    assert len(funcs) == 1
    assert funcs[0]["name"] == "ValidateCIPhone"
    assert funcs[0]["language"] == "go"
    assert "phoneStr" in funcs[0]["arguments"]
    assert "regexp" in funcs[0]["code"]

def test_parse_java():
    code_content = """/**
 * Validates an Ivorian mobile phone number
 */
public boolean validateCIPhone(String phoneStr) {
    String cleaned = phoneStr.replaceAll("\\\\s+|-", "");
    String pattern = "^(?:\\\\+225|225)?(01|05|07)\\\\d{8}$";
    return cleaned.matches(pattern);
}
"""
    funcs = CodeParser.parse_java(code_content)
    assert len(funcs) == 1
    assert funcs[0]["name"] == "validateCIPhone"
    assert funcs[0]["language"] == "java"
    assert "phoneStr" in funcs[0]["arguments"]

def test_parse_php():
    code_content = """<?php
/**
 * Valide un numéro de téléphone mobile ivoirien
 */
function validateCIPhone(string $phoneStr): bool {
    $cleaned = preg_replace('/\\s+|-/', '', $phoneStr);
    return preg_match('/^(?:\\+225|225)?(01|05|07)\\d{8}$/', $cleaned) === 1;
}
"""
    funcs = CodeParser.parse_php(code_content)
    assert len(funcs) == 1
    assert funcs[0]["name"] == "validateCIPhone"
    assert funcs[0]["language"] == "php"
    assert "phoneStr" in funcs[0]["arguments"]

def test_parse_ruby():
    code_content = """# Validates an Ivorian mobile phone number
def validate_ci_phone(phone_str)
    cleaned = phone_str.gsub(/\\s+|-/, '')
    pattern = /^(?:\\+225|225)?(01|05|07)\\d{8}$/
    cleaned.match?(pattern)
end
"""
    funcs = CodeParser.parse_ruby(code_content)
    assert len(funcs) == 1
    assert funcs[0]["name"] == "validate_ci_phone"
    assert funcs[0]["language"] == "ruby"
    assert "phone_str" in funcs[0]["arguments"]

def test_parse_go_multiple_functions():
    code_content = """func CalculateCIVAT(amountHT float64) float64 {
    const vatRate = 0.18
    return math.Round(amountHT*vatRate*100) / 100
}

func FormatCurrencyXOF(amount float64) string {
    rounded := int64(math.Round(amount))
    return fmt.Sprintf("%d FCFA", rounded)
}
"""
    funcs = CodeParser.parse_go(code_content)
    assert len(funcs) == 2
    names = [f["name"] for f in funcs]
    assert "CalculateCIVAT" in names
    assert "FormatCurrencyXOF" in names

def test_parse_file(tmp_path):
    p = tmp_path / "hello.py"
    p.write_text("def hello():\n    return 'world'")
    funcs = CodeParser.parse_file(str(p))
    assert len(funcs) == 1
    assert funcs[0]["name"] == "hello"

def test_parse_file_go(tmp_path):
    p = tmp_path / "main.go"
    p.write_text("""package main

// Hello returns a greeting
func Hello(name string) string {
    return "Hello " + name
}
""")
    funcs = CodeParser.parse_file(str(p))
    assert len(funcs) == 1
    assert funcs[0]["name"] == "Hello"
    assert funcs[0]["language"] == "go"

def test_parse_file_java(tmp_path):
    p = tmp_path / "Main.java"
    p.write_text("""public class Main {
    // Add adds two numbers
    public int add(int a, int b) {
        return a + b;
    }
}
""")
    funcs = CodeParser.parse_file(str(p))
    assert len(funcs) == 1
    assert funcs[0]["name"] == "add"
    assert funcs[0]["language"] == "java"

def test_parse_file_php(tmp_path):
    p = tmp_path / "utils.php"
    p.write_text("""<?php
/**
 * Returns a greeting
 */
function greet($name) {
    return "Hello " . $name;
}
""")
    funcs = CodeParser.parse_file(str(p))
    assert len(funcs) == 1
    assert funcs[0]["name"] == "greet"
    assert funcs[0]["language"] == "php"

def test_parse_file_ruby(tmp_path):
    p = tmp_path / "utils.rb"
    p.write_text("""# Returns a greeting
def greet(name)
    "Hello #{name}"
end
""")
    funcs = CodeParser.parse_file(str(p))
    assert len(funcs) == 1
    assert funcs[0]["name"] == "greet"
    assert funcs[0]["language"] == "ruby"

