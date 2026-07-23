# **🎨 CodeMind - Guide de Design & Branding**

**Version 2.0** | Hackathon 2026 - NexaTech Solutions

---

## **📋 Sommaire**

1. [Identité Visuelle](#-identité-visuelle)
2. [Palettes de Couleurs](#-palettes-de-couleurs)
3. [Typographie](#-typographie)
4. [Composants UI](#-composants-ui)
5. [Design System](#-design-system)
6. [Applications](#-applications)
7. [Bonnes Pratiques](#-bonnes-pratiques)

---

## **🎯 Identité Visuelle**

### **Logo & Branding**

```
CodeMind
╔═══════════════════════════════════════════════════════════════╗
║                                                               ║
║     ██████╗ ██████╗ ███╗   ██╗███╗   ██╗ ██████╗               ║
║    ██╔════╝██╔═══██╗████╗  ██║████╗  ██║██╔═══██╗              ║
║    ██║     ██║   ██║██╔██╗ ██║██╔██╗ ██║██║   ██║              ║
║    ██║     ██║   ██║██║╚██╗██║██║╚██╗██║██║   ██║              ║
║    ╚██████╗╚██████╔╝██║ ╚████║██║ ╚████║╚██████╔╝              ║
║     ╚═════╝ ╚═════╝ ╚═╝  ╚═══╝╚═╝  ╚═══╝ ╚═════╝               ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝
```

### **Valeurs de la Marque**

| Élément | Description |
|---------|-------------|
| **Nom** | CodeMind |
| **Tagline** | Moteur de Recherche Sémantique de Code |
| **Entreprise** | NexaTech Solutions |
| **Localisation** | Abidjan, Côte d'Ivoire |
| **Année** | 2026 |
| **Événement** | Hackathon - Certification Projet |

---

## **🎨 Palettes de Couleurs**

### **Couleurs Primaires**

| Nom | Code Hex | Usage |
|-----|----------|-------|
| **Primary Blue** | `#2563EB` | Boutons principaux, liens, accents |
| **Primary Dark** | `#1E40AF` | Survol des boutons |
| **Primary Light** | `#DBEAFE` | Arrière-plans légers |
| **Secondary Purple** | `#7C3AED` | Accents secondaires |
| **Success Green** | `#10B981` | Statuts de succès |
| **Warning Orange** | `#F59E0B` | Avertissements |
| **Danger Red** | `#EF4444` | Erreurs, échecs |

### **Couleurs Neutres**

| Nom | Code Hex | Usage |
|-----|----------|-------|
| **Dark Gray** | `#1F2937` | Texte principal |
| **Medium Gray** | `#4B5563` | Texte secondaire |
| **Light Gray** | `#9CA3AF` | Texte tertiaire |
| **Border Gray** | `#E5E7EB` | Bordures |
| **Background** | `#F9FAFB` | Arrière-plans |
| **White** | `#FFFFFF` | Arrière-plans principaux |

### **Dégradés**

```css
/* Dégradé principal (header, logo) */
background: linear-gradient(135deg, #2563EB, #7C3AED);

/* Dégradé de fond (body) */
background: linear-gradient(135deg, #667EEA 0%, #764BA2 100%);

/* Dégradé pour les cartes métriques */
background: linear-gradient(90deg, #DBEAFE, #2563EB);
background: linear-gradient(90deg, #D1FAE5, #065F46);
background: linear-gradient(90deg, #FEF3C7, #D97706);
background: linear-gradient(90deg, #F3E8FF, #7C3AED);
```

### **Exemples d'Utilisation**

```css
/* Bouton primaire */
.background { background: #2563EB; color: white; }
.background:hover { background: #1E40AF; }

/* Bouton secondaire */
.background { background: white; color: #2563EB; border: 2px solid #2563EB; }
.background:hover { background: #DBEAFE; }

/* Carte de statistique */
.background { background: white; }
.border-top { background: linear-gradient(90deg, #2563EB, #7C3AED); }

/* Texte de succès */
.color { color: #10B981; }

/* Texte d'avertissement */
.color { color: #F59E0B; }

/* Texte d'erreur */
.color { color: #EF4444; }
```

---

## **📝 Typographie**

### **Polices**

| Nom | Famille | Usage |
|-----|---------|-------|
| **Primary** | Inter | Texte principal |
| **Fallback** | -apple-system, BlinkMacSystemFont, Segoe UI | Polynomes |
| **Code** | 'Fira Code', 'Courier New' | Blocs de code |

### **Tailles de Texte**

| Classe | Taille | Poids | Usage |
|--------|--------|-------|-------|
| `h1` | 3rem (48px) | 800 | Titres principaux |
| `h2` | 2rem (32px) | 700 | Sous-titres |
| `h3` | 1.5rem (24px) | 700 | Section titles |
| `h4` | 1.25rem (20px) | 600 | Card titles |
| `body` | 1rem (16px) | 400 | Texte normal |
| `small` | 0.875rem (14px) | 400 | Texte secondaire |
| `caption` | 0.75rem (12px) | 400 | Légendes |

### **Exemple CSS**

```css
body {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    font-size: 1rem;
    line-height: 1.6;
    color: #1F2937;
}

h1, h2, h3, h4 {
    font-weight: 700;
    line-height: 1.2;
}

code {
    font-family: 'Fira Code', 'Courier New', monospace;
    font-size: 0.9rem;
}
```

---

## **🧩 Composants UI**

### **1. Boutons**

#### **Bouton Primaire**

```css
.btn {
    padding: 0.75rem 1.5rem;
    border: none;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
    font-size: 0.9rem;
}

.btn-primary {
    background: #2563EB;
    color: white;
}

.btn-primary:hover {
    background: #1E40AF;
    transform: translateY(-2px);
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 
                0 4px 6px -2px rgba(0, 0, 0, 0.05);
}
```

#### **Bouton Secondaire**

```css
.btn-secondary {
    background: white;
    color: #2563EB;
    border: 2px solid #2563EB;
}

.btn-secondary:hover {
    background: #DBEAFE;
}
```

### **2. Cartes de Statistiques**

```css
.stat-card {
    background: white;
    padding: 2rem;
    border-radius: 12px;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 
                0 2px 4px -1px rgba(0, 0, 0, 0.06);
    transition: all 0.3s ease;
    position: relative;
    overflow: hidden;
}

.stat-card::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg, #2563EB, #7C3AED);
}

.stat-card:hover {
    transform: translateY(-8px);
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 
                0 4px 6px -2px rgba(0, 0, 0, 0.05);
}
```

### **3. Barres de Progression**

```css
.progress-container {
    margin-bottom: 1.5rem;
}

.progress-header {
    display: flex;
    justify-content: space-between;
    margin-bottom: 0.5rem;
}

.progress-bar {
    height: 8px;
    background: #E5E7EB;
    border-radius: 4px;
    overflow: hidden;
}

.progress-fill {
    height: 100%;
    border-radius: 4px;
    transition: width 1s ease-in-out;
}

.progress-fill.mrr {
    background: linear-gradient(90deg, #DBEAFE, #2563EB);
}

.progress-fill.recall {
    background: linear-gradient(90deg, #D1FAE5, #065F46);
}

.progress-fill.ndcg {
    background: linear-gradient(90deg, #FEF3C7, #D97706);
}
```

### **4. Badges**

```css
.badge {
    display: inline-block;
    padding: 0.25rem 0.75rem;
    border-radius: 9999px;
    font-size: 0.75rem;
    font-weight: 600;
}

.badge-success {
    background: #D1FAE5;
    color: #065F46;
}

.badge-warning {
    background: #FEF3C7;
    color: #92400E;
}

.badge-danger {
    background: #FEE2E2;
    color: #991B1B;
}
```

### **5. Tableaux**

```css
.comparison-table {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 1.5rem;
}

.comparison-table th,
.comparison-table td {
    padding: 1rem;
    text-align: left;
    border-bottom: 1px solid #E5E7EB;
}

.comparison-table th {
    background: #F9FAFB;
    font-weight: 700;
    font-size: 0.875rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: #4B5563;
}

.comparison-table tr:hover {
    background: #F9FAFB;
}
```

### **6. Timeline**

```css
.timeline {
    position: relative;
    padding-left: 2rem;
}

.timeline::before {
    content: '';
    position: absolute;
    left: 0.5rem;
    top: 0;
    bottom: 0;
    width: 2px;
    background: #E5E7EB;
}

.timeline-item {
    position: relative;
    padding-bottom: 1.5rem;
}

.timeline-item::before {
    content: '';
    position: absolute;
    left: -1.5rem;
    top: 0.25rem;
    width: 12px;
    height: 12px;
    background: #2563EB;
    border-radius: 50%;
    border: 2px solid white;
}

.timeline-content {
    background: white;
    padding: 1rem;
    border-radius: 8px;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 
                0 2px 4px -1px rgba(0, 0, 0, 0.06);
}
```

### **7. Header & Navigation**

```css
.header {
    background: white;
    padding: 1.5rem 2rem;
    border-radius: 12px;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 
                0 2px 4px -1px rgba(0, 0, 0, 0.06);
    margin-bottom: 2rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.header h1 {
    font-size: 1.75rem;
    font-weight: 800;
    color: #1F2937;
    display: flex;
    align-items: center;
    gap: 0.75rem;
}

.header .logo {
    background: linear-gradient(135deg, #2563EB, #7C3AED);
    color: white;
    padding: 0.5rem 1rem;
    border-radius: 8px;
    font-weight: 700;
}
```

---

## **🎯 Design System**

### **Espacement**

| Nom | Valeur | Usage |
|-----|--------|-------|
| `xs` | 0.25rem (4px) | Espacement interne très petit |
| `sm` | 0.5rem (8px) | Espacement interne petit |
| `md` | 1rem (16px) | Espacement par défaut |
| `lg` | 1.5rem (24px) | Espacement interne grand |
| `xl` | 2rem (32px) | Espacement externe |
| `2xl` | 3rem (48px) | Espacement section |

### **Ombres**

```css
--shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
--shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 
          0 2px 4px -1px rgba(0, 0, 0, 0.06);
--shadow-md: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 
            0 4px 6px -2px rgba(0, 0, 0, 0.05);
--shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 
            0 4px 6px -2px rgba(0, 0, 0, 0.05);
--shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 
            0 10px 10px -5px rgba(0, 0, 0, 0.04);
```

### **Bordures**

```css
--border-sm: 1px solid #E5E7EB;
--border: 2px solid #E5E7EB;
--border-lg: 4px solid #E5E7EB;
--border-radius-sm: 4px;
--border-radius: 8px;
--border-radius-lg: 12px;
--border-radius-full: 9999px;
```

---

## **📱 Applications**

### **1. Dashboard HTML** (`frontend/metrics_dashboard.html`)

**Fonctionnalités :**
- ✅ Design moderne avec dégradé violet
- ✅ Cartes de statistiques interactives
- ✅ Barres de progression animées
- ✅ Graphiques Chart.js intégrés
- ✅ Tableau comparatif Baseline vs Optimisé
- ✅ Timeline des requêtes évaluées
- ✅ Formules mathématiques affichées
- ✅ Responsive (mobile-friendly)
- ✅ Animations au scroll
- ✅ Boutons interactifs (Rafraîchir, Exporter)

**Technologies :**
- HTML5 Semantique
- CSS3 (Flexbox, Grid, Variables CSS)
- Chart.js pour les graphiques
- Feather Icons pour les icônes
- Google Fonts (Inter)

### **2. Script d'Évaluation Coloré** (`scripts/evaluate_pretty.py`)

**Fonctionnalités :**
- ✅ Sortie console colorée avec codes ANSI
- ✅ Logo ASCII CodeMind
- ✅ Barres de progression en ASCII
- ✅ Tableaux formatés
- ✅ Messages de statut colorés (✓ OK / ✗ FAIL)
- ✅ Résumé comparatif visuel
- ✅ Support Windows 10 (ANSI activé)

**Couleurs :**
- Bleu (#2563EB) : En-têtes, informations
- Vert (#10B981) : Succès, OK
- Orange (#F59E0B) : Avertissements
- Rouge (#EF4444) : Erreurs, échecs
- Cyan (#00BCD4) : Accents
- Magenta (#7C3AED) : Sections

### **3. Intégration Streamlit**

Pour intégrer le design dans Streamlit, utiliser :

```python
st.markdown("""
<style>
    .main-title { color: #1E3A8A; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-weight: 700; }
    .stat-card { background: white; padding: 20px; border-radius: 8px; border: 1px solid #E5E7EB; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
</style>
""", unsafe_allow_html=True)
```

---

## **💡 Bonnes Pratiques**

### **1. Accessibilité**

- ✅ **Contraste des couleurs** : Vérifier que le contraste texte/arrière-plan est ≥ 4.5:1
- ✅ **Textes alternatifs** : Toujours fournir des attributs `alt` pour les images
- ✅ **Navigation clavier** : Tous les éléments interactifs doivent être accessibles au clavier
- ✅ **Focus visible** : Toujours afficher le focus pour les éléments interactifs

### **2. Performance**

- ✅ **Images optimisées** : Compresser les images avec TinyPNG ou Squoosh
- ✅ **Lazy Loading** : Utiliser `loading="lazy"` pour les images
- ✅ **CSS minifié** : Minifier le CSS pour la production
- ✅ **JavaScript différé** : Utiliser `defer` pour les scripts non critiques

### **3. Responsive Design**

- ✅ **Mobile-first** : Concevoir d'abord pour mobile, puis adapter
- ✅ **Points de rupture** : Utiliser les media queries pour différentes tailles d'écran
- ✅ **Test multi-appareils** : Tester sur mobile, tablette et desktop

```css
/* Exemple de media queries */
@media (max-width: 768px) {
    .container { padding: 1rem; }
    .stats-grid { grid-template-columns: 1fr; }
}

@media (max-width: 1024px) {
    .charts-grid { grid-template-columns: 1fr; }
}
```

### **4. Cohérence**

- ✅ **Utiliser les couleurs de la palette** : Ne pas introduire de nouvelles couleurs
- ✅ **Respecter les tailles de texte** : Utiliser les tailles définies dans la typographie
- ✅ **Espacement uniforme** : Utiliser les valeurs d'espacement du design system
- ✅ **Noms de classes cohérents** : Utiliser la convention BEM (Block__Element--Modifier)

---

## **📁 Structure des Fichiers**

```
frontend/
├── metrics_dashboard.html    # Dashboard principal
├── app/
│   ├── globals.css           # Styles globaux Next.js
│   ├── layout.tsx           # Layout principal
│   └── page.tsx            # Page d'accueil
└── streamlit_app.py        # Application Streamlit

scripts/
├── evaluate.py              # Script original
└── evaluate_pretty.py       # Script avec couleurs

utils/
└── metrics.py              # Module des métriques

tests/
└── test_metrics.py         # Tests unitaires

DESIGN_GUIDE.md             # Ce document
```

---

## **🎉 Ressources**

### **Outils Recommandés**

| Outil | Usage |
|-------|-------|
| [Figma](https://figma.com) | Design et prototypage |
| [Coolors](https://coolors.co) | Génération de palettes |
| [Google Fonts](https://fonts.google.com) | Sélection de polices |
| [Feather Icons](https://feathericons.com) | Icônes |
| [Chart.js](https://chartjs.org) | Graphiques |
| [Tailwind CSS](https://tailwindcss.com) | Framework CSS (optionnel) |

### **Inspirations**

- [Tailwind UI](https://tailwindui.com) - Composants de qualité professionnelle
- [Dribbble](https://dribbble.com) - Inspiration design
- [Awwwards](https://awwwards.com) - Sites web primés
- [CollectUI](https://collectui.com) - Inspiration quotidienne

---

## **📞 Support & Contacts**

Pour toute question concernant le design de CodeMind :

- **Équipe Technique** : tech@nexatech.ci
- **Design Lead** : À désigner
- **Documentation** : [README.md](README.md)
- **Métriques** : [METRICS.md](METRICS.md)

---

**Dernière mise à jour** : 23 juillet 2026
**Version** : 2.0
**Auteurs** : CodeMind Team - NexaTech Solutions

© 2026 NexaTech Solutions. Tous droits réservés.
