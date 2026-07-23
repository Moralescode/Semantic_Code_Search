#!/usr/bin/env python3
import requests
import json

print("Testing /generate endpoint with proper JSON...")

headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
}

data = {
    "description": "Créer une fonction qui additionne deux nombres",
    "language": "python"
}

try:
    response = requests.post(
        "http://localhost:8000/generate",
        headers=headers,
        data=json.dumps(data),
        timeout=10
    )
    print(f"Status Code: {response.status_code}")
    print(f"Response Headers: {response.headers}")
    print(f"Response: {response.text}")
except Exception as e:
    print(f"Error: {type(e).__name__}: {str(e)}")
