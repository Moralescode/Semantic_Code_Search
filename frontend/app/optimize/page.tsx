'use client';

import React, { useState } from 'react';
import { Zap, Loader2, Code2, TrendingDown, ArrowRight, Copy, Check, BookOpen } from 'lucide-react';
import PageLayout from '@/components/PageLayout';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export default function OptimizePage() {
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('python');
  const [result, setResult] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleOptimize = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch(`${BASE_URL}/optimize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, language }),
      });
      const data = await res.json();
      setResult(data);
    } catch (err) {
      console.error(err);
      setResult({ optimized_code: '# Erreur de connexion', complexity_before: 'N/A', complexity_after: 'N/A', explanation: 'Vérifiez que le backend FastAPI est lancé.' });
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (result?.optimized_code) {
      navigator.clipboard.writeText(result.optimized_code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <PageLayout title="Optimize" subtitle="Optimisation algorithmique par IA">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left */}
          <div className="bd-card p-6 space-y-5">
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-[var(--gold)]" />
              <h3 className="font-semibold text-[var(--text-primary)]">Code à optimiser</h3>
            </div>
            <form onSubmit={handleOptimize} className="space-y-4">
              <div>
                <label className="text-xs font-medium text-[var(--text-secondary)] mb-1 block">Langage</label>
                <select className="bd-select" value={language} onChange={(e) => setLanguage(e.target.value)}>
                  {['python', 'javascript', 'java', 'go', 'php', 'ruby'].map(l => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
              <textarea className="bd-input font-mono text-xs min-h-[200px] resize-y" placeholder="Collez le code à optimiser..." value={code} onChange={(e) => setCode(e.target.value)} />
              <button type="submit" disabled={loading || !code.trim()} className="bd-btn-primary w-full justify-center py-3">
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <TrendingDown className="w-5 h-5" />}
                {loading ? 'Optimisation...' : 'Optimiser le code'}
              </button>
            </form>
          </div>

          {/* Right */}
          <div className="bd-card p-6 space-y-5">
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-[var(--gold)]" />
              <h3 className="font-semibold text-[var(--text-primary)]">Code optimisé</h3>
            </div>

            {loading ? (
              <div className="space-y-3">{[...Array(6)].map((_, i) => <div key={i} className="h-6 rounded-[var(--radius-md)] bd-skeleton" />)}</div>
            ) : result ? (
              <div className="space-y-5">
                {/* Complexité */}
                <div className="flex items-center gap-4 p-4 rounded-[var(--radius-md)] bg-[var(--surface-alt)] border border-[var(--border)]">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-[var(--text-secondary)]">Avant:</span>
                    <code className="text-[var(--danger)] font-mono font-semibold">{result.complexity_before}</code>
                  </div>
                  <ArrowRight className="w-4 h-4 text-[var(--gold)]" />
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-[var(--text-secondary)]">Après:</span>
                    <code className="text-[var(--success)] font-mono font-semibold">{result.complexity_after}</code>
                  </div>
                </div>

                {/* Code optimisé */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">Code optimisé</span>
                    <button onClick={handleCopy} className="flex items-center gap-1 text-xs text-[var(--text-secondary)] hover:text-[var(--gold)]">
                      {copied ? <><Check className="w-3 h-3 text-[var(--success)]" /> Copié</> : <><Copy className="w-3 h-3" /> Copier</>}
                    </button>
                  </div>
                  <div className="code-block">
                    <div className="code-block-header"><span>{language}</span></div>
                    <div className="code-block-content"><pre><code>{result.optimized_code}</code></pre></div>
                  </div>
                </div>

                {/* Explication */}
                {result.explanation && (
                  <div className="p-4 rounded-[var(--radius-md)] bg-[var(--gold)]/5 border border-[var(--gold)]/10">
                    <p className="text-xs font-semibold text-[var(--gold)] uppercase tracking-wider mb-1">Explication</p>
                    <p className="text-sm text-[var(--text-secondary)]">{result.explanation}</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="bd-empty !py-16">
                <div className="bd-empty-icon"><Zap className="w-7 h-7 text-[var(--gold)]" /></div>
                <h3>En attente d'optimisation</h3>
                <p>Collez du code à gauche pour améliorer ses performances.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </PageLayout>
  );
}

