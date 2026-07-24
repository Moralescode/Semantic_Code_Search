from playwright.sync_api import sync_playwright
import re

def extract_icons_from_site():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page(viewport={'width': 1280, 'height': 900})
        
        print("Navigating to mcK Africa...")
        page.goto('https://mckafrica.com', wait_until='domcontentloaded')
        page.wait_for_timeout(5000)
        
        print(f"Page title: {page.title()}")
        print(f"Current URL: {page.url}")
        
        # Search for SVG icons in the page
        svg_icons = page.locator('svg').all()
        print(f"\nTotal SVG elements found: {len(svg_icons)}")
        
        # Look for common icon patterns
        icon_descriptions = []
        
        # Check for lucide-style data-lucide attributes
        lucide_icons = page.evaluate("""() => {
            const icons = [];
            document.querySelectorAll('[data-lucide]').forEach(el => {
                icons.push(el.getAttribute('data-lucide'));
            });
            document.querySelectorAll('[data-icon]').forEach(el => {
                icons.push(el.getAttribute('data-icon'));
            });
            return icons;
        }""")
        
        if lucide_icons:
            print(f"\nLucide/data-icon attributes found: {lucide_icons[:20]}")
        
        # Check for font awesome or other icon fonts
        icon_fonts = page.evaluate("""() => {
            const fonts = [];
            document.querySelectorAll('[class*="icon"]').forEach(el => {
                const classes = Array.from(el.classList).filter(c => c.includes('icon'));
                fonts.push(classes.join(' '));
            });
            return fonts.slice(0, 30);
        }""")
        
        if icon_fonts:
            print(f"\nIcon font classes found: {icon_fonts}")
        
        # Check aria-label patterns (common for icon-only buttons)
        aria_labels = page.evaluate("""() => {
            const labels = [];
            document.querySelectorAll('[aria-label]').forEach(el => {
                const label = el.getAttribute('aria-label');
                if (label && label.length < 50) {
                    labels.push(label);
                }
            });
            return labels.slice(0, 30);
        }""")
        
        if aria_labels:
            print(f"\nAria-labels (possible icons): {aria_labels}")
        
        # Check for inline SVG patterns
        svg_patterns = page.evaluate("""() => {
            const patterns = [];
            document.querySelectorAll('svg').forEach(svg => {
                const viewBox = svg.getAttribute('viewBox');
                const className = svg.getAttribute('class');
                const path = svg.querySelector('path');
                if (path) {
                    const d = path.getAttribute('d');
                    if (d) {
                        patterns.push({viewBox, className, d: d.substring(0, 100)});
                    }
                }
            });
            return patterns.slice(0, 20);
        }""")
        
        if svg_patterns:
            print(f"\nSVG patterns found: {len(svg_patterns)}")
            for i, pattern in enumerate(svg_patterns[:10]):
                print(f"  {i+1}: viewBox={pattern['viewBox']}, class={pattern['className']}")
        
        # Check script tags for icon imports
        scripts = page.evaluate("""() => {
            const contents = [];
            document.querySelectorAll('script').forEach(script => {
                const src = script.getAttribute('src');
                if (src && (src.includes('icon') || src.includes('lucide') || src.includes('hero') || src.includes('feather'))) {
                    contents.push(src);
                }
            });
            return contents;
        }""")
        
        if scripts:
            print(f"\nIcon-related scripts: {scripts}")
        
        # Try to find icon components in the page by searching text content
        # mcK Africa likely uses lucide icons so let's look for common ones
        common_icons = ['Menu', 'X', 'Search', 'ChevronDown', 'ChevronRight', 'ArrowRight', 'ArrowLeft', 
                       'Users', 'Briefcase', 'Calendar', 'Mail', 'Phone', 'MapPin', 'Linkedin', 'Twitter',
                       'Facebook', 'Instagram', 'Check', 'Star', 'Heart', 'Home', 'Info', 'AlertCircle']
        
        # Check page content for text that might indicate icons
        body_text = page.evaluate("() => document.body.innerText")
        
        browser.close()

if __name__ == '__main__':
    extract_icons_from_site()
