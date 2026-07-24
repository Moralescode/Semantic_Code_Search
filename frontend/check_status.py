from playwright.sync_api import sync_playwright
import sys
sys.stdout.reconfigure(encoding='utf-8')

with sync_playwright() as p:
    b = p.chromium.launch(headless=False)
    page = b.new_page(viewport={'width': 1280, 'height': 900})
    
    print("=== Checking Frontend ===")
    try:
        page.goto('http://localhost:8501', wait_until='domcontentloaded', timeout=30000)
        page.wait_for_timeout(3000)
        print(f"Frontend URL: {page.url}")
        print(f"Frontend title: {page.title()}")
        body = page.evaluate('() => document.body.innerText')
        print(f"Frontend body length: {len(body)}")
        print(f"Frontend body preview: {body[:200]}")
    except Exception as e:
        print(f"Frontend error: {e}")
    
    print("\n=== Checking Backend ===")
    try:
        page.goto('http://localhost:8000/health', wait_until='domcontentloaded', timeout=30000)
        page.wait_for_timeout(1000)
        print(f"Backend URL: {page.url}")
        body = page.evaluate('() => document.body.innerText')
        print(f"Backend response: {body}")
    except Exception as e:
        print(f"Backend error: {e}")
    
    print("\n=== Checking Dashboard ===")
    try:
        page.goto('http://localhost:8501/dashboard', wait_until='domcontentloaded', timeout=30000)
        page.wait_for_timeout(3000)
        print(f"Dashboard URL: {page.url}")
        body = page.evaluate('() => document.body.innerText')
        print(f"Dashboard body length: {len(body)}")
        print(f"Dashboard body preview: {body[:300]}")
    except Exception as e:
        print(f"Dashboard error: {e}")
    
    print("\nBrowser will stay open for 30 seconds...")
    page.wait_for_timeout(30000)
    b.close()
