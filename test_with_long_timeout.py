#!/usr/bin/env python3
import requests
import time

print("Testing /generate with very long timeout (120 seconds)...")
start = time.time()

try:
    response = requests.post(
        "http://localhost:8000/generate",
        json={
            "description": "Créer une fonction simple",
            "language": "python"
        },
        timeout=120
    )
    elapsed = time.time() - start
    print(f"Status Code: {response.status_code}")
    print(f"Time taken: {elapsed:.2f} seconds")
    print(f"Response: {response.text[:500]}")
except Exception as e:
    elapsed = time.time() - start
    print(f"Error after {elapsed:.2f} seconds: {type(e).__name__}: {str(e)[:200]}")
