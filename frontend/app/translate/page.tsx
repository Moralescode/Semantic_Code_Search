'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Languages, Loader2, Code2, ArrowRightLeft, Copy, Check, Sparkles, BookOpen } from 'lucide-react';
import PageLayout from '@/components/PageLayout';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

const LANGUAGES = [
  { value: 'python', label: 'Python', color: 'text-blue-400' },
  { value: 'javascript', label: 'JavaScript', color: 'text-yellow-400' },
  { value: 'java', label: 'Java', color: 'text-red-400' },
  { value: 'go', label: 'Go', color: 'text-cyan-400' },
  { value: 'php', label: 'PHP', color: 'text-purple-400' },
  { value: 'ruby', label: 'Ruby', color: 'text-red-500' },
];

export default function TranslatePage() {
  const [sourceCode, setSourceCode] = useState('');
  const [sourceLang, setSourceLang] = useState('python');
  const [targetLang, setTargetLang] = useState('javascript');
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleTranslate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sourceCode.trim()) return;
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch(`${BASE_URL}/translate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: sourceCode, source_language: sourceLang, target_language: targetLang }),
      });
      const data = await res.json();
      setResult(data.translated_code);
    } catch (err) {
      console.error(err);
      setResult('// Erreur de traduction. Vérifiez que le backend est lancé.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (result) {
      navigator.clipboard.writeText(result);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const swapLanguages = () => {
    setSourceLang(targetLang);
    setTargetLang(sourceLang);
    setSourceCode(result || '');
    setResult(sourceCode);
  };

  const examples = [
    { from: 'python', to: 'javascript', code: 'def greet(name: str) -> str:\n    return f"Bonjour, {name}!"' },
    { from: 'javascript', to: 'go', code: 'function add(a, b) { return a + b; }' },
  ];

  return (
    <PageLayout title="Translate" subtitle="Traduction de code entre langages">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left : Source */}
          <div className="bd-card p-6 space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Code2 className="w-5 h-5 text-[var(--gold)]" />
                <h3 className="font-semibold text-[var(--text-primary)]">Code source</h3>
              </div>
              <select className="bd-select !w-32 text-sm" value={sourceLang} onChange={(e) => setSourceLang(e.target.value)}>
                {LANGUAGES.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
              </select>
            </div>

            <form onSubmit={handleTranslate} className="space-y-4">
              <textarea className="bd-input font-mono text-xs min-h-[250px] resize-y" placeholder="Collez le code source ici..." value={sourceCode} onChange={(e) => setSourceCode(e.target.value)} />
              <button type="submit" disabled={loading || !sourceCode.trim()} className="bd-btn-primary w-full justify-center py-3">
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Languages className="w-5 h-5" />}
                {loading ? 'Traduction en cours...' : `Traduire vers ${LANGUAGES.find(l => l.value === targetLang)?.label}`}
              </button>
            </form>

            <div className="pt-4 border-t border-[var(--border)]">
              <p className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-3">Exemples</p>
              <div className="space-y-2">
                {examples.map((ex, i) => (
                  <button key={i} onClick={() => { setSourceCode(ex.code); setSourceLang(ex.from); setTargetLang(ex.to); }}
                    className="w-full flex items-center gap-3 p-3 rounded-[var(--radius-md)] bg-[var(--surface-alt)] hover:bg-[var(--surface-hover)] border border-[var(--border)] transition-all text-left group">
                    <Languages className="w-4 h-4 text-[var(--gold)] shrink-0" />
                    <span className="text-sm text-[var(--text-primary)]">{ex.from} → {ex.to}</span>
                    <Sparkles className="w-3.5 h-3.5 text-[var(--text-muted)] group-hover:text-[var(--gold)] ml-auto" />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right : Target */}
          <div className="bd-card p-6 space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-[var(--gold)]" />
                <h3 className="font-semibold text-[var(--text-primary)]">Code traduit</h3>
              </div>
              <div className="flex items-center gap-2">
                <select className="bd-select !w-32 text-sm" value={targetLang} onChange={(e) => setTargetLang(e.target.value)}>
                  {LANGUAGES.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
                </select>
                <button onClick={swapLanguages} className="bd-btn-icon" title="Inverser les langages">
                  <ArrowRightLeft className="w-4 h-4" />
                </button>
              </div>
            </div>

            {loading ? (
              <div className="space-y-3">
                {[...Array(8)].map((_, i) => <div key={i} className="h-5 rounded-[var(--radius-md)] bd-skeleton" style={{ width: `${50 + Math.random() * 40}%` }} />)}
              </div>
            ) : result ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">Traduction ({targetLang})</span>
                  <button onClick={handleCopy} className="flex items-center gap-1 text-xs text-[var(--text-secondary)] hover:text-[var(--gold)] transition-colors">
                    {copied ? <><Check className="w-3 h-3 text-[var(--success)]" /> Copié</> : <><Copy className="w-3 h-3" /> Copier</>}
                  </button>
                </div>
                <div className="code-block">
                  <div className="code-block-header"><span>{targetLang}</span></div>
                  <div className="code-block-content">
                    <pre><code>{result}</code></pre>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bd-empty !py-16">
                <div className="bd-empty-icon"><Languages className="w-7 h-7 text-[var(--gold)]" /></div>
                <h3>En attente de traduction</h3>
                <p>Collez du code source à gauche, choisissez les langages, puis traduisez.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </PageLayout>
  );
}

