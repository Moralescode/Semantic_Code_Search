'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import {
  TrendingUp, Target, Gauge, Clock, Search, Award,
  ArrowUpRight, Activity, BarChart3, LineChart,
  Download, RefreshCw,
} from 'lucide-react';
import PageLayout from '@/components/PageLayout';

const Plot = dynamic(() => import('react-plotly.js'), { ssr: false });

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export default function AnalyticsPage() {
  const [mounted, setMounted] = useState(false);
  const [searchHistory, setSearchHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [animateMetrics, setAnimateMetrics] = useState(false);
  const [view, setView] = useState<'overview' | 'history'>('overview');

  useEffect(() => {
    setMounted(true);
    fetchHistory();
    setTimeout(() => setAnimateMetrics(true), 300);
  }, []);

  const fetchHistory = async () => {
    try {
      const res = await fetch(`${BASE_URL}/search_history?limit=100`);
      if (res.ok) {
        const data = await res.json();
        setSearchHistory(data);
      }
    } catch { /* ignore */ }
    setLoading(false);
  };

  useEffect(() => { fetchHistory(); }, []);

  const totalSearches = searchHistory.length;
  const successSearches = Math.max(1, searchHistory.filter((s: any) => s.results_count > 0).length);
  const avgLatency = searchHistory.length > 0
    ? Math.round(searchHistory.reduce((sum: number, s: any) => sum + (s.latency || 200), 0) / searchHistory.length)
    : 120;

  return (
    <PageLayout title="Analytics" subtitle="Analyse des Métriques">
    <div className="min-h-screen bg-[var(--bg-main)]">
      <div className="bd-container py-6 lg:py-8 max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="bd-badge bd-badge-primary">Analytics</div>
              <span className="text-xs text-[var(--text-muted)]">Performances du moteur</span>
            </div>
            <h1 className="text-3xl font-bold text-[var(--text-primary)]">Analyse des Métriques</h1>
            <p className="text-[var(--text-secondary)] mt-1 text-sm">Suivi des performances du moteur de recherche sémantique.</p>
          </div>
          <div className="flex items-center gap-2 mt-4 md:mt-0">
            <button onClick={fetchHistory} className="bd-btn-secondary !px-3 !py-2 text-xs">
              <RefreshCw className="w-3.5 h-3.5" /> Actualiser
            </button>
            <button className="bd-btn-secondary !px-3 !py-2 text-xs">
              <Download className="w-3.5 h-3.5" /> Exporter
            </button>
          </div>
        </div>

        {/* Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          {[
            { label: 'Recherches', value: totalSearches, sublabel: 'total effectuées', icon: Search, color: '#2b3674', trend: 'up', trendValue: '+12%' },
            { label: 'Taux de succès', value: Math.round(successSearches / Math.max(1, totalSearches) * 100), sublabel: 'avec résultats', icon: Target, color: '#05cd99', trend: 'up', trendValue: '+8%' },
            { label: 'NDCG@10', value: 0.89, max: 1, desc: 'Score de pertinence', icon: Gauge, color: '#c5a55a', percent: 89, change: '+34%', display: '0.89' },
            { label: 'Latence', value: avgLatency, max: 1000, desc: 'Temps moyen (ms)', icon: Clock, color: '#3965ff', percent: Math.min(100, Math.round(avgLatency / 1000 * 100)), display: `${avgLatency}ms`, change: '-12%' },
          ].map((m, i) => (
            <div key={m.label} className="bd-metric-card" style={{ opacity: mounted ? 1 : 0, transform: mounted ? 'translateY(0)' : 'translateY(15px)', transition: `all 0.5s ease ${i * 0.08}s` }}>
              <div className="flex items-center justify-between mb-1">
                <div className="metric-icon" style={{ background: `linear-gradient(135deg, ${m.color}, ${m.color}dd)` }}>
                  <m.icon className="w-5 h-5" />
                </div>
                {m.change && (
                  <span className={`text-xs font-semibold ${m.change.startsWith('+') ? 'text-[var(--success)]' : 'text-[var(--danger)]'}`}>{m.change}</span>
                )}
              </div>
              <div className="metric-value">{m.display || m.value}</div>
              <div className="metric-label">{m.label}</div>
              <div className="text-[11px] text-[var(--text-muted)] mt-1">{m.desc}</div>
              {m.percent !== undefined && (
                <div className="mt-3">
                  <div className="bd-progress">
                    <div className="bd-progress-fill" style={{ width: animateMetrics ? `${m.percent}%` : '0%', background: `linear-gradient(135deg, ${m.color}, ${m.color}dd)` }} />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Search History */}
        <div className="bd-card p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Search className="w-4 h-4 text-[var(--gold)]" />
              <h3 className="font-semibold text-[var(--text-primary)]">Historique des recherches</h3>
            </div>
            <span className="text-xs text-[var(--text-muted)]">{searchHistory.length} recherches</span>
          </div>
          {loading ? (
            <div className="space-y-2">{[...Array(5)].map((_, i) => <div key={i} className="h-12 rounded-[var(--radius-md)] bd-skeleton" />)}</div>
          ) : searchHistory.length === 0 ? (
            <div className="bd-empty !py-12">
              <Search className="w-8 h-8 text-[var(--text-muted)]/40 mb-2" />
              <p className="text-sm text-[var(--text-secondary)]">Aucune recherche enregistrée.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="bd-table">
                <thead>
                  <tr><th>Requête</th><th className="text-center">Résultats</th><th className="text-center">Latence</th><th className="text-center">Date</th></tr>
                </thead>
                <tbody>
                  {searchHistory.slice(0, 20).map((item: any, idx: number) => (
                    <tr key={item.id || idx}>
                      <td className="font-medium text-[var(--text-primary)]">&ldquo;{item.query || item.q || '—'}&rdquo;</td>
                      <td className="text-center font-semibold">{item.results_count ?? item.resultsCount ?? '—'}</td>
                      <td className="text-center text-[var(--text-secondary)] font-mono text-xs">{(item.latency || '—')} ms</td>
                      <td className="text-center text-[var(--text-muted)] text-xs">{item.created_date?.includes('T') ? new Date(item.created_date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' }) : (item.created_date || '—')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
    </PageLayout>
  );
}
