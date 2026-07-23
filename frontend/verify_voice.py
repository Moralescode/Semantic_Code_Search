from playwright.sync_api import sync_playwright
import sys
sys.stdout.reconfigure(encoding='utf-8')

with sync_playwright() as p:
    b = p.chromium.launch(headless=True)
    page = b.new_page(viewport={'width': 1280, 'height': 900})
    page.goto('http://localhost:8501/search', wait_until='domcontentloaded')
    page.wait_for_timeout(3000)
    body = page.evaluate('() => document.body.innerText')
    print('Body:', body[:500])
    print('Has Vocal button:', page.locator('button:has-text("Vocal")').count())
    print('Has Mic button:', page.locator('button[title="Recherche vocale"]').count())
    b.close()
