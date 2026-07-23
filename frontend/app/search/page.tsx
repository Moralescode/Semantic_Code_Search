'use client';

import React, { useState, useEffect } from 'react';
import PageLayout from '../../components/PageLayout';
import { Search, Star, BookOpen, RefreshCw, ShieldAlert, Zap, BookOpenCheck, Shield, FileText, Mic, Square } from 'lucide-react';
import axios from 'axios';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export default function SearchPage() {
  const [query, setQuery] = useState('validate phone number');
  const [results, setResults] = useState<any[]>([]);
  const [latency, setLatency] = useState(0);
  const [loading, setLoading] = useState(false);
  const [language, setLanguage] = useState('Tous');
  const [favorites, setFavorites] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);

  const [explanation, setExplanation] = useState<Record<number, string>>({});
  const [translation, setTranslation] = useState<Record<number, string>>({});
  const [audit, setAudit] = useState<Record<number, any>>({});
  const [optimization, setOptimization] = useState<Record<number, any>>({});
  const [documentedCode, setDocumentedCode] = useState<Record<number, string>>({});
  const [patch, setPatch] = useState<Record<number, any>>({});
  const [openapi, setOpenapi] = useState<Record<number, string>>({});
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [speechError, setSpeechError] = useState('');

  const recognitionRef = { current: null as any };

  useEffect(() => {
    const storedFavs = localStorage.getItem('favorites');
    const storedHistory = localStorage.getItem('searchHistory');
    if (storedFavs) {
      try { setFavorites(JSON.parse(storedFavs)); } catch { setFavorites([]); }
    }
    if (storedHistory) {
      try { setHistory(JSON.parse(storedHistory)); } catch { setHistory([]); }
    }
  }, []);

  const saveHistory = (q: string, lang: string, count: number, lat: number) => {
    const entry = {
      timestamp: new Date().toLocaleString('fr-FR'),
      query: q,
      language: lang,
      results_count: count,
      latency: lat
    };
    const updated = [entry, ...history].slice(0, 50);
    setHistory(updated);
    localStorage.setItem('searchHistory', JSON.stringify(updated));
  };

  const toggleFavorite = (func: any) => {
    const exists = favorites.find((f: any) => f.name === func.name);
    const updated = exists ? favorites.filter((f: any) => f.name !== func.name) : [...favorites, func];
    setFavorites(updated);
    localStorage.setItem('favorites', JSON.stringify(updated));
  };

  const isFavorite = (name: string) => favorites.some((f: any) => f.name === name);

  const handleSearch = async () => {
    if (!query) return;
    setLoading(true);
    try {
      const res = await axios.post(`${BASE_URL}/search`, {
        query,
        language: language === 'Tous' ? null : language.toLowerCase(),
        top_k: 5,
        use_rerank: true,
        use_baseline: false
      });
      setResults(res.data.results);
      setLatency(res.data.latency_ms);
      saveHistory(query, language, res.data.results.length, res.data.latency_ms);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleExplain = async (index: number, name: string, code: string, docstring: string, lang: string) => {
    try {
      const res = await axios.post(`${BASE_URL}/explain`, { name, language: lang.toLowerCase(), code, docstring });
      setExplanation(prev => ({ ...prev, [index]: res.data.explanation }));
    } catch (err) { console.error(err); }
  };

  const handleTranslate = async (index: number, code: string, srcLang: string) => {
    const target = srcLang.toLowerCase() === 'python' ? 'javascript' : 'python';
    try {
      const res = await axios.post(`${BASE_URL}/translate`, { code, source_language: srcLang, target_language: target });
      setTranslation(prev => ({ ...prev, [index]: res.data.translated_code }));
    } catch (err) { console.error(err); }
  };

  const handleAudit = async (index: number, code: string, lang: string) => {
    try {
      const res = await axios.post(`${BASE_URL}/audit`, { code, language: lang });
      setAudit(prev => ({ ...prev, [index]: res.data }));
    } catch (err) { console.error(err); }
  };

  const handleOptimize = async (index: number, code: string, lang: string) => {
    try {
      const res = await axios.post(`${BASE_URL}/optimize`, { code, language: lang });
      setOptimization(prev => ({ ...prev, [index]: res.data }));
    } catch (err) { console.error(err); }
  };

  const handleDocstring = async (index: number, code: string, lang: string) => {
    try {
      const res = await axios.post(`${BASE_URL}/docstring`, { code, language: lang });
      setDocumentedCode(prev => ({ ...prev, [index]: res.data.documented_code }));
    } catch (err) { console.error(err); }
  };

  const handlePatch = async (index: number, code: string, lang: string) => {
    try {
      const res = await axios.post(`${BASE_URL}/patch_security`, { code, language: lang });
      setPatch(prev => ({ ...prev, [index]: res.data }));
    } catch (err) { console.error(err); }
  };

  const handleOpenApi = async (index: number, name: string, code: string, lang: string) => {
    try {
      const res = await axios.post(`${BASE_URL}/openapi_spec`, { name, code, language: lang });
      setOpenapi(prev => ({ ...prev, [index]: res.data.openapi_spec }));
    } catch (err) { console.error(err); }
  };

  const initRecognition = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSpeechError('Reconnaissance vocale non supportée par ce navigateur.');
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = 'fr-FR';
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event: any) => {
      let finalTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        }
      }
      if (finalTranscript) {
        setQuery(prev => prev + ' ' + finalTranscript);
        setTranscript('');
      } else {
        setTranscript(event.results[event.resultIndex][0].transcript);
      }
    };

    recognition.onerror = (event: any) => {
      setSpeechError(event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
      setTranscript('');
    };

    recognitionRef.current = recognition;
  };

  const toggleDictation = () => {
    setSpeechError('');
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      setTranscript('');
      return;
    }

    if (!recognitionRef.current) {
      initRecognition();
    }

    try {
      recognitionRef.current?.start();
      setIsListening(true);
    } catch {
      setSpeechError("Impossible de démarrer l'écoute.");
    }
  };

  return (
    <PageLayout title="Recherche Sémantique" subtitle="Trouvez du code réutilisable en langage naturel.">
      <div className="mck-section">
        <div className="mck-container">
          <div className="mck-card p-6 mb-8">
            <div className="flex flex-col md:flex-row gap-4">
              <input
                type="text"
                className="mck-input flex-1"
                placeholder="Saisissez votre besoin sémantique..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              <select
                className="mck-input md:w-48"
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
              >
                <option value="Tous">Tous les langages</option>
                <option value="Python">Python</option>
                <option value="JavaScript">JavaScript</option>
              </select>
              <button onClick={handleSearch} className="mck-btn-primary">
                <Search className="w-4 h-4" />
                <span>Rechercher</span>
              </button>
              <button
                onClick={toggleDictation}
                className={`mck-btn-secondary !px-3 !py-2 ${isListening ? 'border-red-500 text-red-600' : ''}`}
                title="Recherche vocale"
              >
                {isListening ? <Square className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                <span>{isListening ? 'Stop' : 'Vocal'}</span>
              </button>
            </div>
          </div>

          {(isListening || transcript || speechError) && (
            <div className="mt-3 text-sm text-[#5b6b7a]">
              {isListening && <span className="text-red-600 font-medium">🎤 Écoute en cours...</span>}
              {transcript && <span className="italic">Interprété : "{transcript}"</span>}
              {speechError && <span className="text-red-600">{speechError}</span>}
            </div>
          )}

          {loading && <div className="text-center py-8 font-medium text-[#5b6b7a]">Recherche en cours...</div>}

          {!loading && results.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-[#0b1f33] mb-4">🎯 Résultats ({latency.toFixed(1)} ms)</h3>
              <div className="space-y-6">
                {results.map((func, idx) => (
                  <div key={idx} className="mck-card p-6">
                    <div className="flex justify-between items-center mb-4">
                      <div className="flex items-center gap-3">
                        <span className="text-lg font-semibold text-[#0b1f33]">{func.name}</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${func.language.toLowerCase() === 'python' ? 'bg-[#0b1f33] text-white' : 'bg-[#c5a55a] text-white'}`}>
                          {func.language.toUpperCase()}
                        </span>
                      </div>
                      <span className="text-xs text-[#5b6b7a] font-medium">Score FAISS : {func.score.toFixed(4)}</span>
                    </div>

                    <p className="text-sm text-[#5b6b7a] italic mb-4">&quot;{func.docstring}&quot;</p>
                    <pre className="bg-[#0b1f33] text-gray-100 p-4 rounded-xl text-xs overflow-x-auto whitespace-pre mb-4">
                      {func.code}
                    </pre>

                    <div className="flex flex-wrap gap-2">
                      <button onClick={() => toggleFavorite(func)} className={`mck-btn-secondary !px-3 !py-2 text-xs ${isFavorite(func.name) ? 'border-[#c5a55a] text-[#c5a55a]' : ''}`}>
                        <Star className={`w-4 h-4 ${isFavorite(func.name) ? 'fill-current' : ''}`} />
                        <span>{isFavorite(func.name) ? 'Favori' : 'Favoris'}</span>
                      </button>
                      <button onClick={() => handleExplain(idx, func.name, func.code, func.docstring, func.language)} className="mck-btn-secondary !px-3 !py-2 text-xs">
                        <BookOpen className="w-4 h-4" /> Expliquer
                      </button>
                      <button onClick={() => handleTranslate(idx, func.code, func.language)} className="mck-btn-secondary !px-3 !py-2 text-xs">
                        <RefreshCw className="w-4 h-4" /> Traduire
                      </button>
                      <button onClick={() => handleAudit(idx, func.code, func.language)} className="mck-btn-secondary !px-3 !py-2 text-xs">
                        <ShieldAlert className="w-4 h-4" /> Auditer
                      </button>
                      <button onClick={() => handleOptimize(idx, func.code, func.language)} className="mck-btn-secondary !px-3 !py-2 text-xs">
                        <Zap className="w-4 h-4" /> Optimiser
                      </button>
                      <button onClick={() => handleDocstring(idx, func.code, func.language)} className="mck-btn-secondary !px-3 !py-2 text-xs">
                        <BookOpenCheck className="w-4 h-4" /> Docstring
                      </button>
                      <button onClick={() => handlePatch(idx, func.code, func.language)} className="mck-btn-secondary !px-3 !py-2 text-xs">
                        <Shield className="w-4 h-4" /> Correctif
                      </button>
                      <button onClick={() => handleOpenApi(idx, func.name, func.code, func.language)} className="mck-btn-secondary !px-3 !py-2 text-xs">
                        <FileText className="w-4 h-4" /> OpenAPI
                      </button>
                    </div>

                    {explanation[idx] && (
                      <div className="mt-4 p-4 bg-[#f6f8fb] rounded-xl border-l-4 border-[#0b1f33] text-sm whitespace-pre-wrap">
                        {explanation[idx]}
                      </div>
                    )}
                    {translation[idx] && (
                      <div className="mt-4">
                        <span className="text-xs font-semibold text-[#5b6b7a]">🔄 Traduction IA :</span>
                        <pre className="bg-[#0b1f33] text-gray-100 p-4 rounded-xl text-xs overflow-x-auto whitespace-pre mt-1">
                          {translation[idx]}
                        </pre>
                      </div>
                    )}
                    {audit[idx] && (
                      <div className="mt-4 p-4 bg-[#f6f8fb] rounded-xl border-l-4 border-[#c5a55a] text-sm">
                        <div className="font-semibold text-[#0b1f33]">🛡️ Audit de Sécurité IA : NOTE {audit[idx].grade}</div>
                        <div className="mt-1 text-xs text-red-600 font-medium">Vulnérabilités :</div>
                        <ul className="list-disc pl-5 text-xs text-[#5b6b7a]">
                          {audit[idx].vulnerabilities.map((v: string, i: number) => <li key={i}>{v}</li>)}
                        </ul>
                      </div>
                    )}
                    {optimization[idx] && (
                      <div className="mt-4 p-4 bg-[#f6f8fb] rounded-xl border-l-4 border-[#c5a55a] text-sm">
                        <div className="font-semibold text-[#0b1f33]">⚡ Optimisation de Complexité :</div>
                        <div className="text-xs text-[#5b6b7a]">Avant : {optimization[idx].complexity_before} | Après : {optimization[idx].complexity_after}</div>
                        <pre className="bg-[#0b1f33] text-gray-100 p-4 rounded-xl text-xs overflow-x-auto whitespace-pre mt-2">
                          {optimization[idx].optimized_code}
                        </pre>
                      </div>
                    )}
                    {documentedCode[idx] && (
                      <div className="mt-4">
                        <span className="text-xs font-semibold text-[#5b6b7a]">📝 Code Documenté IA :</span>
                        <pre className="bg-[#0b1f33] text-gray-100 p-4 rounded-xl text-xs overflow-x-auto whitespace-pre mt-1">
                          {documentedCode[idx]}
                        </pre>
                      </div>
                    )}
                    {patch[idx] && (
                      <div className="mt-4 p-4 bg-[#f6f8fb] rounded-xl border-l-4 border-green-500 text-sm">
                        <div className="font-semibold text-green-700">🛡️ Correctif de Sécurité : Nouvelle note {patch[idx].new_grade}</div>
                        <div className="mt-1 text-xs text-[#5b6b7a]">{patch[idx].fixed_vulnerabilities}</div>
                        <pre className="bg-[#0b1f33] text-gray-100 p-4 rounded-xl text-xs overflow-x-auto whitespace-pre mt-2">
                          {patch[idx].patched_code}
                        </pre>
                      </div>
                    )}
                    {openapi[idx] && (
                      <div className="mt-4">
                        <span className="text-xs font-semibold text-[#5b6b7a]">🌐 Spécification OpenAPI 3.0 :</span>
                        <pre className="bg-[#0b1f33] text-gray-100 p-4 rounded-xl text-xs overflow-x-auto whitespace-pre mt-1">
                          {openapi[idx]}
                        </pre>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </PageLayout>
  );
}