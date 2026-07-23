#!/usr/bin/env python3
"""Test simple des endpoints"""

import requests

# Test health endpoint (GET)
print("Testing /health endpoint...")
try:
    response = requests.get("http://localhost:8000/health", timeout=60)
    print(f"Status: {response.status_code}")
    print(f"Response: {response.text[:500]}")
except Exception as e:
    print(f"Error: {str(e)}")

print("\n" + "="*60)

# Test generate endpoint (POST)
print("Testing /generate endpoint...")
try:
    response = requests.post(
        "http://localhost:8000/generate",
        json={
            "description": "Créer une fonction qui additionne deux nombres",
            "language": "python"
        },
        timeout=60
    )
    print(f"Status: {response.status_code}")
    if response.status_code == 200:
        print("Success!")
    print(f"Response: {response.text[:500]}")
except Exception as e:
    print(f"Error: {str(e)}")
