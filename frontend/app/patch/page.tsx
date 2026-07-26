'use client';

import React, { useState } from 'react';
import { Shield, Loader2, Code2, AlertTriangle, CheckCircle, Copy, Check, BookOpen } from 'lucide-react';
import PageLayout from '@/components/PageLayout';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export default function PatchPage() {
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('python');
  const [result, setResult] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handlePatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch(`${BASE_URL}/patch_security`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, language }),
      });
      const data = await res.json();
      setResult(data);
    } catch (err) {
      console.error(err);
      setResult({ patched_code: '# Erreur de connexion', fixed_vulnerabilities: 'Impossible de contacter le backend', new_grade: 'N/A' });
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (result?.patched_code) {
      navigator.clipboard.writeText(result.patched_code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <PageLayout title="Patch" subtitle="Correction automatique de vulnérabilités">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left */}
          <div className="bd-card p-6 space-y-5">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-[var(--gold)]" />
              <h3 className="font-semibold text-[var(--text-primary)]">Code vulnérable</h3>
            </div>
            <form onSubmit={handlePatch} className="space-y-4">
              <div>
                <label className="text-xs font-medium text-[var(--text-secondary)] mb-1 block">Langage</label>
                <select className="bd-select" value={language} onChange={(e) => setLanguage(e.target.value)}>
                  {['python', 'javascript', 'java', 'go', 'php', 'ruby'].map(l => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
              <textarea className="bd-input font-mono text-xs min-h-[200px] resize-y" placeholder="Collez le code vulnérable..." value={code} onChange={(e) => setCode(e.target.value)} />
              <button type="submit" disabled={loading || !code.trim()} className="bd-btn-primary w-full justify-center py-3">
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Shield className="w-5 h-5" />}
                {loading ? 'Correction...' : 'Corriger les vulnérabilités'}
              </button>
            </form>
          </div>

          {/* Right */}
          <div className="bd-card p-6 space-y-5">
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-[var(--gold)]" />
              <h3 className="font-semibold text-[var(--text-primary)]">Code corrigé</h3>
            </div>

            {loading ? (
              <div className="space-y-3">{[...Array(6)].map((_, i) => <div key={i} className="h-6 rounded-[var(--radius-md)] bd-skeleton" />)}</div>
            ) : result ? (
              <div className="space-y-5">
                {/* Grade */}
                <div className="flex items-center gap-4 p-4 rounded-[var(--radius-md)] bg-[var(--surface-alt)]">
                  <div className="text-4xl font-bold text-[var(--success)]">{result.new_grade}</div>
                  <div>
                    <p className="text-sm font-semibold text-[var(--text-primary)]">Nouvelle note de sécurité</p>
                    <p className="text-xs text-[var(--text-secondary)]">Après correction des vulnérabilités</p>
                  </div>
                  <CheckCircle className="w-6 h-6 text-[var(--success)] ml-auto" />
                </div>

                {/* Vulnérabilités corrigées */}
                <div className="p-4 rounded-[var(--radius-md)] bg-[var(--success)]/5 border border-[var(--success)]/10">
                  <p className="text-xs font-semibold text-[var(--success)] uppercase tracking-wider mb-1">Vulnérabilités corrigées</p>
                  <p className="text-sm text-[var(--text-secondary)]">{result.fixed_vulnerabilities}</p>
                </div>

                {/* Code patché */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">Code patché</span>
                    <button onClick={handleCopy} className="flex items-center gap-1 text-xs text-[var(--text-secondary)] hover:text-[var(--gold)]">
                      {copied ? <><Check className="w-3 h-3 text-[var(--success)]" /> Copié</> : <><Copy className="w-3 h-3" /> Copier</>}
                    </button>
                  </div>
                  <div className="code-block">
                    <div className="code-block-header"><span>{language}</span></div>
                    <div className="code-block-content"><pre><code>{result.patched_code}</code></pre></div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bd-empty !py-16">
                <div className="bd-empty-icon"><Shield className="w-7 h-7 text-[var(--gold)]" /></div>
                <h3>En attente de correction</h3>
                <p>Collez du code vulnérable à gauche pour générer une version sécurisée.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </PageLayout>
  );
}

