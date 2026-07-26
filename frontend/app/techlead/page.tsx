'use client';

import React, { useState, useEffect } from 'react';
import {
  AlertTriangle, Sparkles, CheckCircle, Code2,
  GitMerge, Search, FileCode, Shield,
  ChevronRight,
} from 'lucide-react';
import PageLayout from '@/components/PageLayout';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export default function TechLeadPage() {
  const [loading, setLoading] = useState(false);
  const [refactored, setRefactored] = useState<any | null>(null);
  const [activeTab, setActiveTab] = useState<'duplicate' | 'gaps'>('duplicate');
  const [gapsData, setGapsData] = useState<any[]>([]);
  const [gapsLoading, setGapsLoading] = useState(true);

  const code1 = `def validate_ci_phone_number(phone_str: str) -> bool:
    import re
    cleaned = re.sub(r'\\s+|-', '', phone_str)
    pattern = r'^(?:\\+225|225)?(01|05|07)\\d{8}$'
    return bool(re.match(pattern, cleaned))`;

  const code2 = `def check_phone_number_valid(num):
    import re
    num_clean = str(num).replace(' ', '').replace('-', '')
    if len(num_clean) == 10 and num_clean[:2] in ['01', '05', '07']:
        return True
    return False`;

  useEffect(() => {
    fetch(`${BASE_URL}/search_history?limit=200`)
      .then(r => r.json())
      .then((data: any[]) => {
        const scoreMap = new Map<string, { total: number; count: number }>();
        data.forEach((s: any) => {
          if (!s.query) return;
          const key = s.query.toLowerCase();
          const existing = scoreMap.get(key) || { total: 0, count: 0 };
          existing.total += s.results_count || 0;
          existing.count += 1;
          scoreMap.set(key, existing);
        });
        const gaps = Array.from(scoreMap.entries())
          .map(([query, stats]: [string, any]) => {
            const avgScore = stats.total / Math.max(1, stats.count);
            let status = 'Pertinence faible';
            if (avgScore < 0.1) status = 'Lacune critique';
            else if (avgScore < 0.3) status = 'Fiche manquante';
            return { query, frequency: stats.count, score: Math.round(avgScore * 100) / 100, status };
          })
          .filter((g: any) => g.score <= 0.3)
          .sort((a: any, b: any) => a.score - b.score)
          .slice(0, 6);
        setGapsData(gaps);
      })
      .catch(() => setGapsData([]))
      .finally(() => setGapsLoading(false));
  }, []);


  const handleMerge = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/refactor_duplicate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code1, code2, language: 'python' }),
      });
      const data = await res.json();
      setRefactored(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageLayout title="Tech Lead" subtitle="Espace Tech Lead">
    <div className="min-h-screen bg-[var(--bg-main)]">
      <div className="bd-container py-6 lg:py-8 max-w-6xl mx-auto">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-1">
            <div className="bd-badge bd-badge-primary">Tech Lead</div>
          </div>
          <h1 className="text-3xl font-bold text-[var(--text-primary)]">Espace Tech Lead</h1>
          <p className="text-[var(--text-secondary)] mt-1 text-sm">
            Détection et fusion sémantique intelligente de doublons de code.
          </p>
        </div>

        {/* Tabs */}
        <div className="bd-tabs mb-8">
          <button
            onClick={() => setActiveTab('duplicate')}
            className={`bd-tab ${activeTab === 'duplicate' ? 'active' : ''}`}
          >
            <GitMerge className="w-3.5 h-3.5 inline mr-1.5" />
            Détection de Duplications
          </button>
          <button
            onClick={() => setActiveTab('gaps')}
            className={`bd-tab ${activeTab === 'gaps' ? 'active' : ''}`}
          >
            <Search className="w-3.5 h-3.5 inline mr-1.5" />
            Analyse des Lacunes
          </button>
        </div>

        {activeTab === 'duplicate' && !refactored && (
          <div className="space-y-6">
            {/* Alert */}
            <div className="bd-card p-5 border-l-4 border-l-[var(--gold)]">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-[var(--radius-md)] bg-[var(--gold)]/10 flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-5 h-5 text-[var(--gold)]" />
                </div>
                <div>
                  <h4 className="font-semibold text-[var(--text-primary)]">Alerte Redondance Détectée</h4>
                  <p className="text-sm text-[var(--text-secondary)] mt-1">
                    Le système a localisé 2 fonctions quasiment identiques avec un score de similarité de{' '}
                    <strong className="text-[var(--primary)]">92%</strong> !
                  </p>
                </div>
              </div>
            </div>

            {/* Code comparison */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="bd-card p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <FileCode className="w-4 h-4 text-[var(--success)]" />
                    <h3 className="text-sm font-semibold text-[var(--text-primary)]">Code de Référence</h3>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--success)]/10 text-[var(--success)] font-medium">Validé</span>
                </div>
                <p className="text-xs text-[var(--text-secondary)] mb-3">Auteur : Kofi (Python Dev)</p>
                <div className="code-block">
                  <div className="code-block-content">
                    <pre><code>{code1}</code></pre>
                  </div>
                </div>
              </div>

              <div className="bd-card p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <FileCode className="w-4 h-4 text-[var(--danger)]" />
                    <h3 className="text-sm font-semibold text-[var(--text-primary)]">Code Redondant</h3>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--danger)]/10 text-[var(--danger)] font-medium">Doublon</span>
                </div>
                <p className="text-xs text-[var(--text-secondary)] mb-3">Auteur : Ex-développeur</p>
                <div className="code-block">
                  <div className="code-block-content">
                    <pre><code>{code2}</code></pre>
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={handleMerge}
              disabled={loading}
              className="bd-btn-primary w-full justify-center py-3 text-base"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Calcul de la fusion...
                </div>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  Demander un Refactoring par l&apos;IA
                </>
              )}
            </button>
          </div>
        )}

        {activeTab === 'duplicate' && refactored && (
          <div className="bd-card p-8 space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-[var(--success)]/10 flex items-center justify-center">
                <CheckCircle className="w-7 h-7 text-[var(--success)]" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-[var(--text-primary)]">Unification accomplie !</h3>
                <p className="text-sm text-[var(--text-secondary)]">Fusion sémantique réalisée par l&apos;IA</p>
              </div>
            </div>

            <div>
              <span className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">Nom unifié recommandé</span>
              <div className="text-xl font-bold text-[var(--primary)] mt-1 font-mono">{refactored.unified_name}</div>
            </div>

            <div>
              <span className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">Explication de la fusion</span>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed mt-1">{refactored.refactor_explanation}</p>
            </div>

            <div>
              <span className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">Code unifié proposé</span>
              <div className="code-block mt-2">
                <div className="code-block-content">
                  <pre><code>{refactored.unified_code}</code></pre>
                </div>
              </div>
            </div>

            <button
              onClick={() => setRefactored(null)}
              className="bd-btn-secondary"
            >
              ↩️ Recommencer l&apos;analyse
            </button>
          </div>
        )}

        {activeTab === 'gaps' && (
          <div className="bd-card p-6">
            <div className="flex items-center gap-2 mb-1">
              <Shield className="w-5 h-5 text-[var(--gold)]" />
              <h3 className="font-semibold text-[var(--text-primary)]">Analyse des Lacunes Sémantiques</h3>
            </div>
            <p className="text-sm text-[var(--text-secondary)] mb-6">
              Requêtes de recherche qui n&apos;ont retourné aucun résultat ou des scores inférieurs à 30%.
            </p>

            <div className="overflow-x-auto">
              <table className="bd-table">
                <thead>
                  <tr>
                    <th>Requête</th>
                    <th className="text-center">Fréquence</th>
                    <th className="text-center">Meilleur Score</th>
                    <th className="text-center">Statut</th>
                    <th className="text-center">Priorité</th>
                  </tr>
                </thead>
                <tbody>
                  {gapsData.map((gap, idx) => (
                    <tr key={idx}>
                      <td className="font-medium">{gap.query}</td>
                      <td className="text-center">{gap.frequency}</td>
                      <td className="text-center">
                        <span className="font-mono text-[var(--text-secondary)]">{gap.score.toFixed(2)}</span>
                      </td>
                      <td className="text-center">
                        <span className="bd-badge bd-badge-danger">{gap.status}</span>
                      </td>
                      <td className="text-center">
                        <div className="flex justify-center">
                          <div className="bd-progress max-w-[100px]">
                            <div
                              className="bd-progress-fill"
                              style={{
                                width: `${Math.max(10, Math.min(100, 100 - gap.score * 100))}%`,
                                background: 'linear-gradient(135deg, #ee5d50, #dc3a30)',
                              }}
                            />
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-6 p-4 rounded-[var(--radius-md)] bg-[var(--surface-alt)] border border-[var(--border)] flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-[var(--gold)] shrink-0 mt-0.5" />
              <p className="text-sm text-[var(--text-secondary)]">
                <strong className="text-[var(--text-primary)]">Recommandation :</strong> Utilisez le{' '}
                <strong className="text-[var(--gold)]">Générateur de Code IA</strong> pour concevoir ces modules manquants
                et les indexer dans FAISS.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
    </PageLayout>
  );
}
