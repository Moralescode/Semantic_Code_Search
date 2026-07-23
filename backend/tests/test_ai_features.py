import requests
import json
import time

BASE_URL = "http://localhost:8000"
HEADERS = {"Content-Type": "application/json"}

test_code_py = """def validate_ci_phone_number(phone_str: str) -> bool:
    import re
    cleaned = re.sub(r'\s+|-', '', phone_str)
    pattern = r'^(?:\+225|225)?(01|05|07)\d{8}$'
    return bool(re.match(pattern, cleaned))"""

test_code_js = """function validateCIPhone(phoneStr) {
  const cleaned = phoneStr.replace(/\s+|-/g, '');
  const pattern = /^(?:\+225|225)?(01|05|07)\d{8}$/;
  return pattern.test(cleaned);
}"""

tests = [
    {
        "name": "explain",
        "endpoint": "/explain",
        "payload": {
            "name": "validate_ci_phone_number",
            "language": "python",
            "code": test_code_py,
            "docstring": "Valide un numéro de téléphone mobile en Côte d'Ivoire"
        },
        "expected_key": "explanation"
    },
    {
        "name": "translate",
        "endpoint": "/translate",
        "payload": {
            "code": test_code_py,
            "source_language": "python",
            "target_language": "javascript"
        },
        "expected_key": "translated_code"
    },
    {
        "name": "audit",
        "endpoint": "/audit",
        "payload": {
            "code": test_code_py,
            "language": "python"
        },
        "expected_key": "grade"
    },
    {
        "name": "optimize",
        "endpoint": "/optimize",
        "payload": {
            "code": test_code_py,
            "language": "python"
        },
        "expected_key": "optimized_code"
    },
    {
        "name": "docstring",
        "endpoint": "/docstring",
        "payload": {
            "code": test_code_py,
            "language": "python"
        },
        "expected_key": "documented_code"
    },
    {
        "name": "patch_security",
        "endpoint": "/patch_security",
        "payload": {
            "code": test_code_py,
            "language": "python"
        },
        "expected_key": "patched_code"
    },
    {
        "name": "openapi_spec",
        "endpoint": "/openapi_spec",
        "payload": {
            "name": "validate_ci_phone_number",
            "code": test_code_py,
            "language": "python"
        },
        "expected_key": "openapi_spec"
    },
]

print("=== Testing AI Features ===\n")
results = []

for test in tests:
    print(f"Testing {test['name']}...", end=" ")
    try:
        start = time.time()
        resp = requests.post(
            f"{BASE_URL}{test['endpoint']}",
            json=test["payload"],
            timeout=60,
            headers=HEADERS
        )
        elapsed = time.time() - start
        print(f"{elapsed:.1f}s - ", end="")

        if resp.status_code == 200:
            data = resp.json()
            if test["expected_key"] in data:
                print(f"OK - keys: {list(data.keys())}")
                results.append((test["name"], True, ""))
            else:
                print(f"MISSING KEY '{test['expected_key']}' - keys: {list(data.keys())}")
                results.append((test["name"], False, f"Missing key: {test['expected_key']}"))
        else:
            print(f"HTTP {resp.status_code}")
            results.append((test["name"], False, f"HTTP {resp.status_code}"))

    except requests.exceptions.Timeout:
        print("TIMEOUT")
        results.append((test["name"], False, "Timeout"))
    except Exception as e:
        print(f"ERROR: {str(e)[:100]}")
        results.append((test["name"], False, str(e)[:100]))

print("\n=== Summary ===")
passed = sum(1 for _, ok, _ in results if ok)
failed = sum(1 for _, ok, _ in results if not ok)
print(f"Passed: {passed}/{len(results)}")
print(f"Failed: {failed}/{len(results)}")

if failed > 0:
    print("\nFailed tests:")
    for name, ok, msg in results:
        if not ok:
            print(f"  - {name}: {msg}")
