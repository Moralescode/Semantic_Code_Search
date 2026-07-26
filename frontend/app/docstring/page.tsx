'use client';

import React, { useState } from 'react';
import { BookText, Loader2, Code2, FileText, Copy, Check, BookOpen } from 'lucide-react';
import PageLayout from '@/components/PageLayout';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export default function DocstringPage() {
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('python');
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch(`${BASE_URL}/docstring`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, language }),
      });
      const data = await res.json();
      setResult(data.documented_code);
    } catch (err) {
      console.error(err);
      setResult('# Erreur de connexion au backend');
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

  return (
    <PageLayout title="Docstring" subtitle="Génération automatique de documentation">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left */}
          <div className="bd-card p-6 space-y-5">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-[var(--gold)]" />
              <h3 className="font-semibold text-[var(--text-primary)]">Code source</h3>
            </div>
            <form onSubmit={handleGenerate} className="space-y-4">
              <div>
                <label className="text-xs font-medium text-[var(--text-secondary)] mb-1 block">Langage</label>
                <select className="bd-select" value={language} onChange={(e) => setLanguage(e.target.value)}>
                  {['python', 'javascript', 'java', 'go', 'php', 'ruby'].map(l => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
              <textarea className="bd-input font-mono text-xs min-h-[200px] resize-y" placeholder="Collez votre fonction sans documentation..." value={code} onChange={(e) => setCode(e.target.value)} />
              <button type="submit" disabled={loading || !code.trim()} className="bd-btn-primary w-full justify-center py-3">
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <BookText className="w-5 h-5" />}
                {loading ? 'Génération...' : 'Générer la docstring'}
              </button>
            </form>
          </div>

          {/* Right */}
          <div className="bd-card p-6 space-y-5">
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-[var(--gold)]" />
              <h3 className="font-semibold text-[var(--text-primary)]">Code documenté</h3>
            </div>

            {loading ? (
              <div className="space-y-3">{[...Array(8)].map((_, i) => <div key={i} className="h-5 rounded-[var(--radius-md)] bd-skeleton" />)}</div>
            ) : result ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">Avec documentation</span>
                  <button onClick={handleCopy} className="flex items-center gap-1 text-xs text-[var(--text-secondary)] hover:text-[var(--gold)]">
                    {copied ? <><Check className="w-3 h-3 text-[var(--success)]" /> Copié</> : <><Copy className="w-3 h-3" /> Copier</>}
                  </button>
                </div>
                <div className="code-block">
                  <div className="code-block-header"><span>{language}</span></div>
                  <div className="code-block-content"><pre><code>{result}</code></pre></div>
                </div>
              </div>
            ) : (
              <div className="bd-empty !py-16">
                <div className="bd-empty-icon"><BookText className="w-7 h-7 text-[var(--gold)]" /></div>
                <h3>En attente de documentation</h3>
                <p>Collez du code sans docstring à gauche pour générer la documentation automatiquement.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </PageLayout>
  );
}

