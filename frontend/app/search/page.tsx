'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Mic, Loader2, ChevronDown, FileCode2, Filter, X,
  Sparkles, Clock, ChevronRight, BookmarkPlus, Volume2, VolumeX,
  Copy, Check, MessageCircle, Star,
} from 'lucide-react';
import CodeBlock, { LanguageBadge } from '@/components/CodeBlock';
import { useI18n } from '@/lib/I18nContext';
import { cn } from '@/lib/utils';
import PageLayout from '@/components/PageLayout';
import {
  speakText,
  speakSearchResults,
  getSpeakingStatus,
  cancelSpeaking,
  getStoredVoiceId,
} from '@/lib/ElevenLabsService';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export default function SearchPage() {
  const { t, lang } = useI18n();
  const [query, setQuery] = useState('');
  const [snippets, setSnippets] = useState<any[]>([]);
  const [results, setResults] = useState<any[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const [expandedId, setExpandedId] = useState<string | number | null>(null);
  const [filters, setFilters] = useState({ language: '', category: '' });
  const [showFilters, setShowFilters] = useState(false);
  const [copiedId, setCopiedId] = useState<string | number | null>(null);
  const [savedFavId, setSavedFavId] = useState<string | number | null>(null);
  const [favorites, setFavorites] = useState<any[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem('favorites');
    if (stored) {
      try { setFavorites(JSON.parse(stored)); } catch { setFavorites([]); }
    }
  }, []);

  useEffect(() => {
    fetch(`${BASE_URL}/corpus`)
      .then(r => r.json())
      .then(data => setSnippets(data.entries || []))
      .catch(console.error);
  }, []);

  const saveSearch = useCallback(async (q: string, resultsCount: number) => {
    try {
      await fetch(`${BASE_URL}/save_search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: q, language: '', results_count: resultsCount }),
      });
    } catch { /* ignore */ }
  }, []);

  const handleSearch = useCallback(async (overrideQuery?: string) => {
    const searchQuery = (overrideQuery ?? query).trim();
    if (!searchQuery) return;
    setLoading(true);
    setResults(null);
    setExpandedId(null);

    try {
      const res = await fetch(`${BASE_URL}/search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: searchQuery,
          language: '',
          top_k: 20,
          use_rerank: true,
        }),
      });
      if (!res.ok) throw new Error('Search failed');
      const data = await res.json();
      setResults(data.results || []);
      saveSearch(searchQuery, (data.results || []).length);
    } catch (e) {
      console.error(e);
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, [query, saveSearch]);

  const toggleVoice = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert(t('search.voice_unsupported'));
      return;
    }
    if (listening) {
      setListening(false);
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = lang === 'fr' ? 'fr-FR' : 'en-US';
    recognition.interimResults = false;
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setQuery(transcript);
      setListening(false);
      handleSearch(transcript);
    };
    recognition.onerror = () => setListening(false);
    recognition.onend = () => setListening(false);
    recognition.start();
    setListening(true);
  };

  const handleCopyCode = (code: string, id: string | number) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleShareWhatsApp = (result: any) => {
    const search_text = ['\u{1F50D} *CodeMind*', '', '\u{1F4CC} Fonction: ' + (result.name || result.title), '\u{1F4BB} Langage: ' + result.language, '\u{1F4DD} Description: ' + (result.docstring || result.description || ''), '', '```' + (result.language || ''), result.code || '', '```', '', 'CodeMind - Recherche Semantique'].join('\n');
    const url = 'https://wa.me/?text=' + encodeURIComponent(search_text);
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleSaveFavorite = (result: any) => {
    const fav = {
      name: result.name || result.title || 'unknown',
      language: result.language || 'unknown',
      docstring: result.docstring || result.description || '',
      code: result.code || '',
      score: result.score || result._score || 0,
    };
    const updated = [...favorites.filter((f: any) => f.name !== fav.name), fav];
    setFavorites(updated);
    localStorage.setItem('favorites', JSON.stringify(updated));
    setSavedFavId(result.id || result.name);
    setTimeout(() => setSavedFavId(null), 2000);
  };

  const languages = [...new Set(snippets.map((s: any) => s.language))];
  const categories = [...new Set(snippets.map((s: any) => s.category))];

  const filteredResults = (results || []).filter((r: any) => {
    if (filters.language && r.language !== filters.language) return false;
    if (filters.category && r.category !== filters.category) return false;
    return true;
  });

  const suggestions = [
    'valider numero telephone CI',
    'calculer TVA 18%',
    'formater montant XOF',
    'generer signature HMAC',
    'parser fichier CSV transactions',
  ];

  return (
    <PageLayout title="Recherche" subtitle="Recherche Semantique">
      <div className="min-h-screen bg-[var(--bg-main)]">
        <div className="max-w-5xl mx-auto px-4 py-6 lg:py-8">
          <div className="mb-6">
            <div className="bd-badge bd-badge-primary">Recherche</div>
            <h1 className="text-3xl font-bold text-[var(--text-primary)]">Recherche Semantique</h1>
            <p className="text-[var(--text-secondary)] mt-1 text-sm">
              Trouvez du code reusable en langage naturel parmi notre index FAISS.
            </p>
          </div>

          <div className="bd-card !p-1 mb-6 flex items-center gap-1">
            <div className="flex-1 flex items-center gap-3 px-4">
              <Search className="w-5 h-5 text-[var(--text-muted)] shrink-0" />
              <input type="text" value={query} onChange={(e) => setQuery(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSearch()} placeholder="Rechercher une fonction, un concept..." className="bd-search-input py-3.5" />
            </div>
            <button onClick={toggleVoice} className={cn('w-10 h-10 rounded-[var(--radius-md)] flex items-center justify-center transition-colors', listening ? 'bg-[var(--danger)]/10 text-[var(--danger)] animate-pulse-soft' : 'hover:bg-[var(--surface-hover)] text-[var(--text-muted)]')} title="Recherche vocale">
              <Mic className="w-4 h-4" />
            </button>
            <button onClick={() => setShowFilters(!showFilters)} className={cn('w-10 h-10 rounded-[var(--radius-md)] flex items-center justify-center transition-colors', showFilters || filters.language || filters.category ? 'bg-[var(--gold)]/10 text-[var(--gold)]' : 'hover:bg-[var(--surface-hover)] text-[var(--text-muted)]')} title="Filtres">
              <Filter className="w-4 h-4" />
            </button>
            <button onClick={() => handleSearch()} disabled={loading || !query.trim()} className="bd-btn-primary h-10 px-5 mx-1">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              {loading ? 'Analyse...' : 'Rechercher'}
            </button>
          </div>

          <AnimatePresence>
            {showFilters && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden mb-6">
                <div className="bd-card p-4">
                  <div className="flex flex-wrap items-end gap-4">
                    <div>
                      <label className="text-xs font-medium text-[var(--text-secondary)] mb-1.5 block">Langage</label>
                      <select value={filters.language} onChange={(e) => setFilters({ ...filters, language: e.target.value })} className="bd-select !w-40">
                        <option value="">Tous</option>
                        {languages.map((l) => <option key={l} value={l}>{l}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-[var(--text-secondary)] mb-1.5 block">Categorie</label>
                      <select value={filters.category} onChange={(e) => setFilters({ ...filters, category: e.target.value })} className="bd-select !w-40">
                        <option value="">Toutes</option>
                        {categories.map((c) => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                    {(filters.language || filters.category) && (
                      <button onClick={() => setFilters({ language: '', category: '' })} className="flex items-center gap-1.5 px-3 py-2.5 text-sm text-[var(--text-muted)] hover:text-[var(--danger)] transition-colors rounded-[var(--radius-md)] hover:bg-[var(--danger)]/5">
                        <X className="w-4 h-4" /> Reinitialiser
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {loading && (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => <div key={i} className="h-28 rounded-[var(--radius-lg)] bd-skeleton" />)}
              <div className="flex items-center justify-center gap-2 mt-4">
                <Loader2 className="w-4 h-4 animate-spin text-[var(--gold)]" />
                <p className="text-sm text-[var(--text-muted)]">Analyse semantique en cours via IA...</p>
              </div>
            </div>
          )}

          {!loading && results !== null && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-[var(--text-secondary)]">
                  <span className="font-semibold text-[var(--text-primary)]">{filteredResults.length}</span>{' '}
                  {filteredResults.length > 1 ? 'resultats' : 'resultat'} pour
                  <span className="font-medium text-[var(--text-primary)]"> {query}</span>
                </p>
                <div className="flex items-center gap-2">
                  <button onClick={() => { if (getSpeakingStatus()) { cancelSpeaking(); } else { speakSearchResults(query, filteredResults.length, getStoredVoiceId()); } }} className={cn('w-9 h-9 rounded-[var(--radius-md)] flex items-center justify-center transition-all', getSpeakingStatus() ? 'bg-[var(--gold)]/10 text-[var(--gold)] animate-pulse-soft' : 'hover:bg-[var(--surface-hover)] text-[var(--text-muted)]')} title={getSpeakingStatus() ? 'Arreter la lecture' : 'Ecouter les resultats'}>
                    {getSpeakingStatus() ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                  </button>
                  <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
                    <Clock className="w-3 h-3" />
                    <span>Trie par pertinence</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <AnimatePresence>
                  {filteredResults.map((result: any, i: number) => (
                    <motion.div key={result.id || i} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04, duration: 0.3 }} className="bd-card overflow-hidden">
                      <button onClick={() => setExpandedId(expandedId === result.id ? null : result.id)} className="w-full flex items-start gap-4 p-5 text-left hover:bg-[var(--surface-hover)] transition-colors">
                        <div className="shrink-0 flex flex-col items-center">
                          <div className="w-12 h-12 rounded-[var(--radius-md)] bg-gradient-to-br from-[var(--primary)]/10 to-[var(--gold)]/5 flex items-center justify-center border border-[var(--border)]">
                            <span className="text-lg font-bold text-[var(--primary)]">{Math.round(result.score || result._score || 0)}</span>
                          </div>
                          <span className="text-[10px] text-[var(--text-muted)] mt-1">score</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <FileCode2 className="w-4 h-4 text-[var(--text-muted)] shrink-0" />
                            <h3 className="font-semibold truncate text-[var(--text-primary)]">{result.name || result.title}</h3>
                            <LanguageBadge language={result.language} />
                          </div>
                          <p className="text-sm text-[var(--text-secondary)] line-clamp-1">{result.docstring || result.description || ''}</p>
                          <div className="flex items-center gap-2 mt-2 flex-wrap">
                            <span className="text-[11px] px-2 py-0.5 rounded-md bg-[var(--surface-alt)] text-[var(--text-muted)] capitalize">{result.language}</span>
                            {result.arguments && <span className="text-[11px] px-2 py-0.5 rounded-md bg-[var(--surface-alt)] text-[var(--text-muted)]">{result.arguments.length} parametres</span>}
                          </div>
                        </div>
                        <ChevronDown className={cn('w-5 h-5 text-[var(--text-muted)] transition-transform shrink-0', expandedId === result.id && 'rotate-180')} />
                      </button>

                      <AnimatePresence>
                        {expandedId === result.id && (
                          <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden border-t border-[var(--border)]">
                            <div className="p-5">
                              <div className="mb-5 p-4 rounded-[var(--radius-md)] bg-gradient-to-r from-[var(--primary)]/5 to-[var(--gold)]/5 border border-[var(--primary)]/10">
                                <div className="flex items-center gap-2 mb-2">
                                  <Sparkles className="w-4 h-4 text-[var(--gold)]" />
                                  <span className="text-xs font-semibold text-[var(--gold)] uppercase tracking-wider">A quoi ca sert ?</span>
                                </div>
                                <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                                  {result.docstring
                                    ? <>{result.docstring} - Cette fonction repond a un besoin metier specifique.</>
                                    : <>Cette fonction <strong className="text-[var(--text-primary)]">{result.name || ''}</strong> a ete trouvee par similarite semantique.</>
                                  }
                                </p>
                              </div>

                              {result.docstring && <p className="text-sm text-[var(--text-secondary)] mb-4 italic border-l-2 border-[var(--gold)] pl-3">{result.docstring}</p>}
                              <CodeBlock code={result.code} language={result.language} />

                              <div className="flex flex-wrap items-center gap-2 mt-5 pt-4 border-t border-[var(--border)]">
                                <button onClick={() => handleCopyCode(result.code, result.id || i)} className={cn('flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium border rounded-[var(--radius-sm)] transition-all', copiedId === (result.id || i) ? 'bg-[var(--success)]/10 text-[var(--success)] border-[var(--success)]/30' : 'bg-[var(--surface-alt)] hover:bg-[var(--gold)]/10 text-[var(--text-secondary)] hover:text-[var(--gold)] border-[var(--border)] hover:border-[var(--gold)]/30')}>
                                  {copiedId === (result.id || i) ? <><Check className="w-3.5 h-3.5" /> Copie !</> : <><Copy className="w-3.5 h-3.5" /> Copier</>}
                                </button>

                                <button onClick={() => handleShareWhatsApp(result)} className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium bg-[#25D366]/10 hover:bg-[#25D366]/20 text-[#25D366] border border-[#25D366]/20 hover:border-[#25D366]/40 rounded-[var(--radius-sm)] transition-all">
                                  <MessageCircle className="w-3.5 h-3.5" /> WhatsApp
                                </button>

                                <button onClick={() => handleSaveFavorite(result)} className={cn('flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium border rounded-[var(--radius-sm)] transition-all', savedFavId === (result.id || result.name) ? 'bg-[var(--warning)]/10 text-[var(--warning)] border-[var(--warning)]/30' : 'bg-[var(--surface-alt)] hover:bg-[var(--warning)]/10 text-[var(--text-secondary)] hover:text-[var(--warning)] border-[var(--border)] hover:border-[var(--warning)]/30')}>
                                  {savedFavId === (result.id || result.name) ? <><Star className="w-3.5 h-3.5 fill-current" /> Sauvegarde {'\u2713'}</> : <><BookmarkPlus className="w-3.5 h-3.5" /> Sauvegarder</>}
                                </button>

                                <a href="/favorites" className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium bg-[var(--surface-alt)] hover:bg-[var(--primary)]/10 text-[var(--text-secondary)] hover:text-[var(--primary)] border border-[var(--border)] hover:border-[var(--primary)]/30 rounded-[var(--radius-sm)] transition-all">
                                  <Star className="w-3.5 h-3.5" /> Favoris
                                </a>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              {filteredResults.length === 0 && (
                <div className="bd-empty">
                  <div className="bd-empty-icon"><Search className="w-7 h-7 text-[var(--primary)]" /></div>
                  <h3>Aucun resultat trouve</h3>
                  <p>Essayez de reformuler votre requete ou d&apos;utiliser des termes plus generiques.</p>
                </div>
              )}
            </div>
          )}

          {!loading && results === null && (
            <div className="bd-empty">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[var(--primary)]/10 to-[var(--gold)]/5 flex items-center justify-center mx-auto mb-5 border border-[var(--border)]">
                <Sparkles className="w-8 h-8 text-[var(--gold)]" />
              </div>
              <h3>Pret a chercher ?</h3>
              <p className="max-w-md mx-auto">Tapez une requete en langage naturel pour trouver du code reusable dans notre index semantique.</p>
              <div className="flex flex-wrap gap-2 justify-center mt-6">
                {suggestions.map((suggestion) => (
                  <button key={suggestion} onClick={() => { setQuery(suggestion); handleSearch(suggestion); }} className="group px-4 py-2 rounded-full bg-[var(--bg-card)] border border-[var(--border)] text-xs text-[var(--text-secondary)] hover:text-[var(--gold)] hover:border-[var(--gold)]/30 transition-all flex items-center gap-1.5">
                    <Search className="w-3 h-3" /> {suggestion}
                    <ChevronRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-all -ml-1" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </PageLayout>
  );
}
