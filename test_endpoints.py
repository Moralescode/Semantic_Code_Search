#!/usr/bin/env python3
"""Script pour tester les endpoints /generate et /copilot"""

import requests
import json

# Test 1 : Génération de code
print("=" * 60)
print("TEST 1 : Endpoint /generate")
print("=" * 60)

try:
    response = requests.post(
        "http://localhost:8000/generate",
        json={
            "description": "Créer une fonction qui valide un numéro de téléphone ivoirien",
            "language": "python"
        },
        timeout=30
    )
    print(f"Status Code: {response.status_code}")
    if response.status_code == 200:
        data = response.json()
        print(f"✓ Génération réussie !")
        print(f"  Nom: {data.get('name', 'N/A')}")
        print(f"  Docstring: {data.get('docstring', 'N/A')[:100]}...")
        print(f"  Code: {data.get('code', 'N/A')[:100]}...")
    else:
        print(f"✗ Erreur: {response.text}")
except Exception as e:
    print(f"✗ Exception: {str(e)}")

print("\n" + "=" * 60)
print("TEST 2 : Endpoint /copilot_chat")
print("=" * 60)

# Test 2 : Copilot chat
try:
    response = requests.post(
        "http://localhost:8000/copilot_chat",
        json={
            "message": "Comment formater un montant en CFA ?",
            "history": []
        },
        timeout=30
    )
    print(f"Status Code: {response.status_code}")
    if response.status_code == 200:
        data = response.json()
        print(f"✓ Réponse du CoPilot reçue !")
        print(f"  Réponse: {data.get('response', 'N/A')[:200]}...")
    else:
        print(f"✗ Erreur: {response.text}")
except Exception as e:
    print(f"✗ Exception: {str(e)}")

print("\n" + "=" * 60)
print("TEST 3 : Endpoint /health (pour vérifier le backend)")
print("=" * 60)

try:
    response = requests.get("http://localhost:8000/health", timeout=30)
    print(f"Status Code: {response.status_code}")
    if response.status_code == 200:
        data = response.json()
        print(f"✓ Backend en bonne santé !")
        print(f"  Statut: {data.get('status', 'N/A')}")
        print(f"  Index info: {json.dumps(data.get('index_info', {}), indent=2)}")
    else:
        print(f"✗ Erreur: {response.text}")
except Exception as e:
    print(f"✗ Exception: {str(e)}")
