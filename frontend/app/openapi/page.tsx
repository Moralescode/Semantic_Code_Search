'use client';

import React, { useState } from 'react';
import { FileJson, Loader2, Code2, Copy, Check, BookOpen, Globe } from 'lucide-react';
import PageLayout from '@/components/PageLayout';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export default function OpenApiPage() {
  const [code, setCode] = useState('');
  const [name, setName] = useState('users_api');
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
      const res = await fetch(`${BASE_URL}/openapi_spec`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, code, language }),
      });
      const data = await res.json();
      setResult(data.openapi_spec);
    } catch (err) {
      console.error(err);
      setResult('{\n  "error": "Erreur de connexion au backend"\n}');
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

  const tryFormatJson = () => {
    if (result) {
      try {
        const parsed = JSON.parse(result);
        setResult(JSON.stringify(parsed, null, 2));
      } catch {}
    }
  };

  return (
    <PageLayout title="OpenAPI" subtitle="Génération de spécifications OpenAPI 3.0">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left */}
          <div className="bd-card p-6 space-y-5">
            <div className="flex items-center gap-2">
              <Globe className="w-5 h-5 text-[var(--gold)]" />
              <h3 className="font-semibold text-[var(--text-primary)]">Configuration API</h3>
            </div>
            <form onSubmit={handleGenerate} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-[var(--text-secondary)] mb-1 block">Nom API</label>
                  <input type="text" className="bd-input" value={name} onChange={(e) => setName(e.target.value)} placeholder="users_api" />
                </div>
                <div>
                  <label className="text-xs font-medium text-[var(--text-secondary)] mb-1 block">Langage</label>
                  <select className="bd-select" value={language} onChange={(e) => setLanguage(e.target.value)}>
                    {['python', 'javascript', 'java', 'go', 'php', 'ruby'].map(l => <option key={l} value={l}>{l}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-[var(--text-secondary)] mb-1 block">Code de l'API</label>
                <textarea className="bd-input font-mono text-xs min-h-[200px] resize-y" placeholder="Collez le code de votre endpoint API..." value={code} onChange={(e) => setCode(e.target.value)} />
              </div>
              <button type="submit" disabled={loading || !code.trim()} className="bd-btn-primary w-full justify-center py-3">
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <FileJson className="w-5 h-5" />}
                {loading ? 'Génération spec...' : 'Générer la spec OpenAPI'}
              </button>
            </form>
          </div>

          {/* Right */}
          <div className="bd-card p-6 space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-[var(--gold)]" />
                <h3 className="font-semibold text-[var(--text-primary)]">Spécification OpenAPI</h3>
              </div>
              {result && (
                <button onClick={tryFormatJson} className="text-xs text-[var(--text-secondary)] hover:text-[var(--gold)]">Formatter JSON</button>
              )}
            </div>

            {loading ? (
              <div className="space-y-2">{[...Array(10)].map((_, i) => <div key={i} className="h-4 rounded-[var(--radius-md)] bd-skeleton" />)}</div>
            ) : result ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">Spec OpenAPI 3.0</span>
                  <button onClick={handleCopy} className="flex items-center gap-1 text-xs text-[var(--text-secondary)] hover:text-[var(--gold)]">
                    {copied ? <><Check className="w-3 h-3 text-[var(--success)]" /> Copié</> : <><Copy className="w-3 h-3" /> Copier</>}
                  </button>
                </div>
                <div className="code-block max-h-[500px] overflow-auto">
                  <div className="code-block-header"><span>JSON</span></div>
                  <div className="code-block-content"><pre><code>{result}</code></pre></div>
                </div>
              </div>
            ) : (
              <div className="bd-empty !py-16">
                <div className="bd-empty-icon"><FileJson className="w-7 h-7 text-[var(--gold)]" /></div>
                <h3>En attente de spécification</h3>
                <p>Configurez votre API à gauche pour générer la spec OpenAPI 3.0.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </PageLayout>
  );
}

