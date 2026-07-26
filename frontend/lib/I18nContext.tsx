'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';

type Lang = 'fr' | 'en';

interface I18nContextType {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (key: string) => string;
}

const translations: Record<string, Record<Lang, string>> = {
  // Common
  'common.fr': { fr: 'Français', en: 'French' },
  'common.en': { fr: 'Anglais', en: 'English' },
  'common.theme_light': { fr: 'Mode clair', en: 'Light mode' },
  'common.theme_dark': { fr: 'Mode sombre', en: 'Dark mode' },
  'common.dashboard': { fr: 'Dashboard', en: 'Dashboard' },
  'common.copilot': { fr: 'CoPilot', en: 'CoPilot' },
  'common.search': { fr: 'Recherche', en: 'Search' },
  'common.generate': { fr: 'Générateur', en: 'Generator' },
  'common.settings': { fr: 'Paramètres', en: 'Settings' },
  'common.logout': { fr: 'Déconnexion', en: 'Logout' },

  // Dashboard
  'dashboard.label': { fr: 'TABLEAU DE BORD', en: 'DASHBOARD' },
  'dashboard.title': { fr: 'Vue d\'ensemble', en: 'Overview' },
  'dashboard.subtitle': { fr: 'Statistiques et accès rapides à votre espace de développement.', en: 'Statistics and quick access to your development workspace.' },
  'dashboard.snippets_indexed': { fr: 'Snippets indexés', en: 'Snippets indexed' },
  'dashboard.lines_code': { fr: 'lignes de code', en: 'lines of code' },
  'dashboard.languages': { fr: 'Langages', en: 'Languages' },
  'dashboard.cat_dist': { fr: 'Catégories', en: 'Categories' },
  'dashboard.recent_searches': { fr: 'Recherches récentes', en: 'Recent searches' },
  'dashboard.modules': { fr: 'modules', en: 'modules' },
  'dashboard.queries': { fr: 'requêtes', en: 'queries' },
  'dashboard.qa_search': { fr: 'Recherche', en: 'Search' },
  'dashboard.qa_search_desc': { fr: 'Recherche sémantique de code', en: 'Semantic code search' },
  'dashboard.qa_copilot': { fr: 'CoPilot', en: 'CoPilot' },
  'dashboard.qa_copilot_desc': { fr: 'Assistant RAG intelligent', en: 'Smart RAG assistant' },
  'dashboard.qa_generate': { fr: 'Générer', en: 'Generate' },
  'dashboard.qa_generate_desc': { fr: 'Code IA sur mesure', en: 'Custom AI code' },
  'dashboard.qa_techlead': { fr: 'Tech Lead', en: 'Tech Lead' },
  'dashboard.qa_techlead_desc': { fr: 'Architecture & revue', en: 'Architecture & review' },
  'dashboard.lang_dist': { fr: 'Répartition par langage', en: 'Language distribution' },
  'dashboard.lang_dist_desc': { fr: 'Distribution des snippets par langage de programmation', en: 'Snippet distribution by programming language' },
  'dashboard.cat_dist_desc': { fr: 'Répartition par catégorie métier', en: 'Distribution by business category' },
  'dashboard.recent_snippets': { fr: 'Snippets récents', en: 'Recent snippets' },
  'dashboard.see_all': { fr: 'Voir tout', en: 'See all' },
  'dashboard.metrics': { fr: 'Métriques', en: 'Metrics' },
  'dashboard.no_searches': { fr: 'Aucune recherche pour le moment', en: 'No searches yet' },
  'dashboard.results': { fr: 'résultats', en: 'results' },

  // Search page
  'search.label': { fr: 'RECHERCHE', en: 'SEARCH' },
  'search.title': { fr: 'Recherche Sémantique', en: 'Semantic Search' },
  'search.subtitle': { fr: 'Trouvez du code réutilisable en langage naturel parmi notre index.', en: 'Find reusable code using natural language from our index.' },
  'search.placeholder': { fr: 'Rechercher une fonction, un concept...', en: 'Search for a function, concept...' },
  'search.voice_title': { fr: 'Recherche vocale', en: 'Voice search' },
  'search.filters': { fr: 'Filtres', en: 'Filters' },
  'search.button': { fr: 'Rechercher', en: 'Search' },
  'search.searching': { fr: 'Analyse en cours...', en: 'Searching...' },
  'search.language': { fr: 'Langage', en: 'Language' },
  'search.category': { fr: 'Catégorie', en: 'Category' },
  'search.all': { fr: 'Tous', en: 'All' },
  'search.all_fem': { fr: 'Toutes', en: 'All' },
  'search.reset': { fr: 'Réinitialiser', en: 'Reset' },
  'search.analyzing': { fr: 'Analyse sémantique en cours via IA...', en: 'Semantic analysis in progress via AI...' },
  'search.results_prefix': { fr: 'résultat', en: 'result' },
  'search.results_for': { fr: 'pour', en: 'for' },
  'search.score': { fr: 'score', en: 'score' },
  'search.lines': { fr: 'lignes', en: 'lines' },
  'search.voice_unsupported': { fr: 'Reconnaissance vocale non supportée par ce navigateur.', en: 'Speech recognition not supported by this browser.' },
  'search.no_results': { fr: 'Aucun résultat trouvé pour cette recherche.', en: 'No results found for this search.' },
  'search.empty_title': { fr: 'Prêt à chercher ?', en: 'Ready to search?' },
  'search.empty_desc': { fr: 'Tapez une requête en langage naturel pour trouver du code réutilisable dans notre index sémantique.', en: 'Type a natural language query to find reusable code in our semantic index.' },
  'search.suggestion1': { fr: 'valider numéro téléphone CI', en: 'validate CI phone number' },
  'search.suggestion2': { fr: 'calculer TVA 18%', en: 'calculate 18% VAT' },
  'search.suggestion3': { fr: 'formater montant XOF', en: 'format XOF amount' },
  'search.suggestion4': { fr: 'générer signature HMAC', en: 'generate HMAC signature' },
};

const I18nContext = createContext<I18nContextType>({
  lang: 'fr',
  setLang: () => {},
  t: (key: string) => key,
});

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>('fr');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const t = useCallback(
    (key: string): string => {
      const entry = translations[key];
      if (!entry) return key;
      return entry[lang] || key;
    },
    [lang]
  );

  return (
    <I18nContext.Provider value={{ lang, setLang, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  return useContext(I18nContext);
}

