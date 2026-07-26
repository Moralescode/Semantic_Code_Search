# -*- coding: utf-8 -*-
"""
Tests unitaires pour l'API REST FastAPI v2.3 de CodeMind (avec services IA avancés).
"""

from fastapi.testclient import TestClient
from app.main import app, search_engine, explainer
from retrieval.search import CodeSearchEngine
from llm.llm_explainer import CodeExplainer

client = TestClient(app)

def test_health_check():
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert "status" in data
    assert "index_info" in data

def test_search_endpoint():
    payload = {
        "query": "valider un numero de telephone",
        "language": "python",
        "top_k": 2,
        "use_rerank": True,
        "use_baseline": False
    }
    response = client.post("/search", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "query" in data
    assert "results" in data
    assert "latency_ms" in data

def test_explain_endpoint():
    payload = {
        "name": "validate_ci_phone",
        "language": "python",
        "code": "def validate_ci_phone(): pass",
        "docstring": "Valide un numéro de téléphone"
    }
    response = client.post("/explain", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "explanation" in data

def test_translate_endpoint():
    payload = {
        "code": "def double(x): return x * 2",
        "source_language": "python",
        "target_language": "javascript"
    }
    response = client.post("/translate", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "translated_code" in data

def test_generate_endpoint():
    payload = {
        "description": "générer un code OTP numérique aléatoire",
        "language": "python"
    }
    response = client.post("/generate", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "name" in data
    assert "code" in data
    assert "docstring" in data

def test_audit_endpoint():
    payload = {
        "code": "def login(u, p): db.execute('SELECT * FROM users WHERE u = ' + u)",
        "language": "python"
    }
    response = client.post("/audit", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "grade" in data
    assert "vulnerabilities" in data
    assert len(data["vulnerabilities"]) > 0

def test_optimize_endpoint():
    payload = {
        "code": "def search(x): return [item for item in lst if item == x]",
        "language": "python"
    }
    response = client.post("/optimize", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "optimized_code" in data
    assert "complexity_before" in data

def test_docstring_endpoint():
    payload = {
        "code": "def add(a, b): return a + b",
        "language": "python"
    }
    response = client.post("/docstring", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "documented_code" in data

def test_refactor_duplicate_endpoint():
    payload = {
        "code1": "def is_adult(age): return age >= 18",
        "code2": "def check_age(x): return x >= 18",
        "language": "python"
    }
    response = client.post("/refactor_duplicate", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "unified_name" in data
    assert "unified_code" in data
    assert "refactor_explanation" in data

def test_patch_security_endpoint():
    payload = {
        "code": "def login(u, p): db.execute('SELECT * FROM users WHERE u = ' + u)",
        "language": "python"
    }
    response = client.post("/patch_security", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "patched_code" in data
    assert "fixed_vulnerabilities" in data
    assert data["new_grade"] == "A"

def test_openapi_spec_endpoint():
    payload = {
        "name": "calculate_tva",
        "code": "def calculate_tva(amount): return amount * 0.18",
        "language": "python"
    }
    response = client.post("/openapi_spec", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "openapi_spec" in data

def test_copilot_chat_endpoint():
    payload = {
        "message": "Comment valider un numéro de téléphone ?",
        "history": [
            {"role": "user", "content": "Bonjour"},
            {"role": "assistant", "content": "Bonjour ! Comment puis-je vous aider ?"}
        ]
    }
    response = client.post("/copilot_chat", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "response" in data
