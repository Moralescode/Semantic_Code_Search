'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, Loader2, Code2, AlertTriangle, CheckCircle, Lightbulb, Copy, Check, Sparkles, BookOpen } from 'lucide-react';
import PageLayout from '@/components/PageLayout';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

const GRADE_COLORS: Record<string, string> = {
  'A': 'text-[var(--success)]',
  'B': 'text-[var(--gold)]',
  'C': 'text-[var(--warning)]',
  'D': 'text-[var(--danger)]',
  'F': 'text-[var(--danger)]',
};

export default function AuditPage() {
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('python');
  const [result, setResult] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);

  const handleAudit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch(`${BASE_URL}/audit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, language }),
      });
      const data = await res.json();
      setResult(data);
    } catch (err) {
      console.error(err);
      setResult({ grade: 'N/A', vulnerabilities: ['Erreur de connexion au backend'], recommendations: ['Vérifiez que le serveur FastAPI tourne sur le port 8000'], efficiency_tip: '' });
    } finally {
      setLoading(false);
    }
  };

  const examples = [
    { lang: 'python', code: 'def get_user(id):\n    query = f"SELECT * FROM users WHERE id = {id}"\n    return db.execute(query)' },
    { lang: 'javascript', code: 'function saveUser(data) {\n  const sql = `INSERT INTO users VALUES(${data})`;\n  db.query(sql);\n}' },
  ];

  return (
    <PageLayout title="Audit" subtitle="Audit sécurité & qualité de code">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left : Input */}
          <div className="bd-card p-6 space-y-5">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-[var(--gold)]" />
              <h3 className="font-semibold text-[var(--text-primary)]">Code à auditer</h3>
            </div>

            <form onSubmit={handleAudit} className="space-y-4">
              <div>
                <label className="text-xs font-medium text-[var(--text-secondary)] mb-1 block">Langage</label>
                <select className="bd-select" value={language} onChange={(e) => setLanguage(e.target.value)}>
                  {['python', 'javascript', 'java', 'go', 'php', 'ruby'].map(l => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-[var(--text-secondary)] mb-1 block">Code à auditer</label>
                <textarea className="bd-input font-mono text-xs min-h-[200px] resize-y" placeholder="Collez le code à auditer..." value={code} onChange={(e) => setCode(e.target.value)} />
              </div>
              <button type="submit" disabled={loading || !code.trim()} className="bd-btn-primary w-full justify-center py-3">
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Shield className="w-5 h-5" />}
                {loading ? 'Audit en cours...' : 'Lancer l\'audit'}
              </button>
            </form>

            <div className="pt-4 border-t border-[var(--border)]">
              <p className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-3">Exemples vulnérables</p>
              <div className="space-y-2">
                {examples.map((ex, i) => (
                  <button key={i} onClick={() => { setCode(ex.code); setLanguage(ex.lang); }}
                    className="w-full flex items-center gap-3 p-3 rounded-[var(--radius-md)] bg-[var(--surface-alt)] hover:bg-[var(--surface-hover)] border border-[var(--border)] transition-all text-left group">
                    <AlertTriangle className="w-4 h-4 text-[var(--danger)] shrink-0" />
                    <span className="text-sm text-[var(--text-primary)]">SQL Injection ({ex.lang})</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right : Results */}
          <div className="bd-card p-6 space-y-5">
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-[var(--gold)]" />
              <h3 className="font-semibold text-[var(--text-primary)]">Rapport d'audit</h3>
            </div>

            {loading ? (
              <div className="space-y-3">
                {[...Array(6)].map((_, i) => <div key={i} className="h-6 rounded-[var(--radius-md)] bd-skeleton" />)}
              </div>
            ) : result ? (
              <div className="space-y-6">
                {/* Grade */}
                <div className="flex items-center gap-4 p-4 rounded-[var(--radius-md)] bg-[var(--surface-alt)] border border-[var(--border)]">
                  <div className={`text-5xl font-bold ${GRADE_COLORS[result.grade] || 'text-[var(--text-muted)]'}`}>{result.grade}</div>
                  <div>
                    <p className="text-sm font-semibold text-[var(--text-primary)]">Note de sécurité</p>
                    <p className="text-xs text-[var(--text-secondary)]">Évaluation globale du code</p>
                  </div>
                </div>

                {/* Vulnérabilités */}
                {result.vulnerabilities?.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-[var(--danger)] flex items-center gap-2 mb-3">
                      <AlertTriangle className="w-4 h-4" /> Vulnérabilités détectées
                    </h4>
                    <ul className="space-y-2">
                      {result.vulnerabilities.map((v: string, i: number) => (
                        <li key={i} className="flex items-start gap-2 p-3 rounded-[var(--radius-md)] bg-[var(--danger)]/5 border border-[var(--danger)]/10">
                          <AlertTriangle className="w-4 h-4 text-[var(--danger)] mt-0.5 shrink-0" />
                          <span className="text-sm text-[var(--text-secondary)]">{v}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Recommandations */}
                {result.recommendations?.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-[var(--success)] flex items-center gap-2 mb-3">
                      <CheckCircle className="w-4 h-4" /> Recommandations
                    </h4>
                    <ul className="space-y-2">
                      {result.recommendations.map((r: string, i: number) => (
                        <li key={i} className="flex items-start gap-2 p-3 rounded-[var(--radius-md)] bg-[var(--success)]/5 border border-[var(--success)]/10">
                          <CheckCircle className="w-4 h-4 text-[var(--success)] mt-0.5 shrink-0" />
                          <span className="text-sm text-[var(--text-secondary)]">{r}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Efficiency Tip */}
                {result.efficiency_tip && (
                  <div className="flex items-start gap-3 p-4 rounded-[var(--radius-md)] bg-[var(--gold)]/5 border border-[var(--gold)]/10">
                    <Lightbulb className="w-5 h-5 text-[var(--gold)] shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-semibold text-[var(--gold)] uppercase tracking-wider mb-1">Astuce performance</p>
                      <p className="text-sm text-[var(--text-secondary)]">{result.efficiency_tip}</p>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="bd-empty !py-16">
                <div className="bd-empty-icon"><Shield className="w-7 h-7 text-[var(--gold)]" /></div>
                <h3>En attente d'audit</h3>
                <p>Collez du code à gauche et lancez un audit sécurité.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </PageLayout>
  );
}

