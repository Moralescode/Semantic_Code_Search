'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import PageLayout from '../../components/PageLayout';
import { TrendingUp, Target, Gauge, Clock, Search, Award, ArrowUpRight } from 'lucide-react';

const Plot = dynamic(() => import('react-plotly.js'), { ssr: false });

const METRICS = [
  { label: 'MRR', value: 0.87, max: 1, desc: 'Mean Reciprocal Rank', color: '#2563EB', icon: TrendingUp, percent: 87 },
  { label: 'Recall@10', value: 0.92, max: 1, desc: 'Taux de rappel', color: '#059669', icon: Target, percent: 92 },
  { label: 'NDCG@10', value: 0.89, max: 1, desc: 'Normalized Discounted Cumulative Gain', color: '#D97706', icon: Gauge, percent: 89 },
  { label: 'Latence', value: 340, max: 1000, desc: 'Temps moyen (ms)', color: '#7C3AED', icon: Clock, percent: 34, display: '340ms' },
];

const COMPARISON_DATA = [
  { metric: 'MRR', baseline: 0.52, semantic: 0.87 },
  { metric: 'Recall', baseline: 0.61, semantic: 0.92 },
  { metric: 'NDCG', baseline: 0.55, semantic: 0.89 },
  { metric: 'Precision', baseline: 0.64, semantic: 0.91 },
];

const TREND_DATA = [
  { day: 'Lun', searches: 12, success: 10 },
  { day: 'Mar', searches: 18, success: 16 },
  { day: 'Mer', searches: 15, success: 14 },
  { day: 'Jeu', searches: 22, success: 20 },
  { day: 'Ven', searches: 28, success: 26 },
  { day: 'Sam', searches: 8, success: 7 },
  { day: 'Dim', searches: 5, success: 4 },
];

const MOCK_HISTORY = [
  { id: '1', query: 'validate phone number', top_result_title: 'validate_ci_phone_number', results_count: 5, created_date: '2026-02-18T10:30:00' },
  { id: '2', query: 'calculer TVA Cote Ivoire', top_result_title: 'calculate_ci_tva', results_count: 3, created_date: '2026-02-18T09:15:00' },
  { id: '3', query: 'format CFA currency', top_result_title: 'format_currency_xof', results_count: 4, created_date: '2026-02-17T14:45:00' },
  { id: '4', query: 'HMAC signature generation', top_result_title: 'generate_hmac_signature', results_count: 2, created_date: '2026-02-17T11:20:00' },
  { id: '5', query: 'parse CSV transactions', top_result_title: 'parse_csv_transactions', results_count: 6, created_date: '2026-02-16T16:00:00' },
];

export default function AnalyticsPage() {
  const [mounted, setMounted] = useState(false);
  const [searchHistory, setSearchHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [animateMetrics, setAnimateMetrics] = useState(false);

  useEffect(() => {
    setMounted(true);
    setTimeout(() => {
      try {
        const stored = localStorage.getItem('searchHistory');
        if (stored) {
          setSearchHistory(JSON.parse(stored));
        } else {
          setSearchHistory(MOCK_HISTORY);
        }
      } catch {
        setSearchHistory(MOCK_HISTORY);
      }
      setLoading(false);
    }, 600);
    setTimeout(() => setAnimateMetrics(true), 300);
  }, []);

  const getImprovement = (baseline: number, semantic: number) => {
    return ((semantic - baseline) / baseline * 100).toFixed(0);
  };

  return (
    <PageLayout title="Analytics" subtitle="Suivi des performances du moteur de recherche sémantique.">
      {/* Metrics cards */}
      <div className="mck-section">
        <div className="mck-container">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
            {METRICS.map((m, i) => (
              <div
                key={m.label}
                className="mck-card p-5"
                style={{
                  opacity: mounted ? 1 : 0,
                  transform: mounted ? 'translateY(0)' : 'translateY(15px)',
                  transition: `all 0.5s ease ${i * 0.05}s`,
                }}
              >
                <div className="flex items-center justify-between mb-3">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center text-white"
                    style={{ backgroundColor: m.color }}
                  >
                    <m.icon className="w-5 h-5" />
                  </div>
                  <Award className="w-4 h-4 text-green-600" />
                </div>
                <div className="text-3xl font-semibold text-[#0b1f33]">
                  {m.display || m.value.toFixed(2)}
                </div>
                <div className="text-sm text-[#5b6b7a] mt-0.5">{m.label}</div>
                <div className="text-xs text-[#5b6b7a]/70 mt-0.5">{m.desc}</div>
                <div className="mt-3">
                  <div className="h-2 bg-[#e3e8ee] rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-1000 ease-out"
                      style={{
                        width: animateMetrics ? `${m.percent}%` : '0%',
                        backgroundColor: m.color,
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Bar chart comparison */}
            <div className="mck-card p-6">
              <h3 className="font-semibold text-[#0b1f33] mb-1">Baseline vs Sémantique</h3>
              <p className="text-xs text-[#5b6b7a] mb-4">Comparaison des métriques de recherche</p>
              {mounted && (
                <Plot
                  data={[
                    {
                      x: COMPARISON_DATA.map(d => d.metric),
                      y: COMPARISON_DATA.map(d => d.baseline),
                      name: 'Baseline',
                      type: 'bar',
                      marker: { color: '#9ca3af' },
                    },
                    {
                      x: COMPARISON_DATA.map(d => d.metric),
                      y: COMPARISON_DATA.map(d => d.semantic),
                      name: 'Sémantique',
                      type: 'bar',
                      marker: { color: '#2563EB' },
                    },
                  ]}
                  layout={{
                    barmode: 'group',
                    paper_bgcolor: 'rgba(0,0,0,0)',
                    plot_bgcolor: 'rgba(0,0,0,0)',
                    autosize: true,
                    margin: { l: 40, r: 20, b: 40, t: 20 },
                    yaxis: { range: [0, 1], title: 'Score' },
                    legend: { orientation: 'h', y: 1.1 },
                  }}
                  style={{ width: '100%', height: '300px' }}
                />
              )}
            </div>

            {/* Line chart trend */}
            <div className="mck-card p-6">
              <h3 className="font-semibold text-[#0b1f33] mb-1">Activité de recherche</h3>
              <p className="text-xs text-[#5b6b7a] mb-4">Tendances sur 7 jours</p>
              {mounted && (
                <Plot
                  data={[
                    {
                      x: TREND_DATA.map(d => d.day),
                      y: TREND_DATA.map(d => d.searches),
                      name: 'Recherches',
                      type: 'scatter',
                      mode: 'lines+markers',
                      line: { color: '#7C3AED', width: 2.5 },
                      marker: { color: '#7C3AED', size: 8 },
                    },
                    {
                      x: TREND_DATA.map(d => d.day),
                      y: TREND_DATA.map(d => d.success),
                      name: 'Réussies',
                      type: 'scatter',
                      mode: 'lines+markers',
                      line: { color: '#10B981', width: 2.5 },
                      marker: { color: '#10B981', size: 8 },
                    },
                  ]}
                  layout={{
                    paper_bgcolor: 'rgba(0,0,0,0)',
                    plot_bgcolor: 'rgba(0,0,0,0)',
                    autosize: true,
                    margin: { l: 40, r: 20, b: 40, t: 20 },
                    yaxis: { title: 'Nombre' },
                    legend: { orientation: 'h', y: 1.1 },
                  }}
                  style={{ width: '100%', height: '300px' }}
                />
              )}
            </div>
          </div>

          {/* Comparison table */}
          <div className="mck-card p-6 mb-8">
            <h3 className="font-semibold text-[#0b1f33] mb-4">Tableau comparatif</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#e3e8ee]">
                    <th className="text-left py-3 px-4 text-[#5b6b7a] font-semibold uppercase text-xs tracking-wider">Métrique</th>
                    <th className="text-center py-3 px-4 text-[#5b6b7a] font-semibold uppercase text-xs tracking-wider">Baseline</th>
                    <th className="text-center py-3 px-4 text-[#5b6b7a] font-semibold uppercase text-xs tracking-wider">Sémantique</th>
                    <th className="text-center py-3 px-4 text-[#5b6b7a] font-semibold uppercase text-xs tracking-wider">Amélioration</th>
                  </tr>
                </thead>
                <tbody>
                  {COMPARISON_DATA.map((row) => {
                    const improvement = getImprovement(row.baseline, row.semantic);
                    return (
                      <tr key={row.metric} className="border-b border-[#e3e8ee]/50 hover:bg-[#f6f8fb] transition-colors">
                        <td className="py-3 px-4 font-medium text-[#142938]">{row.metric}</td>
                        <td className="text-center py-3 px-4 text-[#5b6b7a]">{row.baseline.toFixed(2)}</td>
                        <td className="text-center py-3 px-4 text-[#0b1f33] font-semibold">{row.semantic.toFixed(2)}</td>
                        <td className="text-center py-3 px-4">
                          <span className="inline-flex items-center gap-1 text-green-600 font-semibold">
                            <ArrowUpRight className="w-3.5 h-3.5" />
                            +{improvement}%
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Search history */}
          <div className="mck-card p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Search className="w-4 h-4 text-[#5b6b7a]" />
                <h3 className="font-semibold text-[#0b1f33]">Historique des recherches</h3>
              </div>
              <span className="text-xs text-[#5b6b7a]">{searchHistory.length} recherches</span>
            </div>
            {loading ? (
              <div className="space-y-2">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-12 rounded-lg bg-[#f6f8fb] animate-pulse" />
                ))}
              </div>
            ) : searchHistory.length === 0 ? (
              <div className="text-center py-8">
                <Search className="w-8 h-8 mx-auto text-[#5b6b7a]/40 mb-2" />
                <p className="text-sm text-[#5b6b7a]">Aucune recherche pour le moment.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {searchHistory.map((item: any) => (
                  <div key={item.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-[#f6f8fb] transition-colors">
                    <div className="w-8 h-8 rounded-lg bg-[#0b1f33]/10 flex items-center justify-center shrink-0">
                      <Search className="w-4 h-4 text-[#0b1f33]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[#142938] truncate">"{item.query}"</p>
                      {item.top_result_title && (
                        <p className="text-xs text-[#5b6b7a] truncate">→ {item.top_result_title}</p>
                      )}
                    </div>
                    <span className="text-xs px-2 py-1 rounded-md bg-[#f6f8fb] text-[#5b6b7a] shrink-0">
                      {item.results_count} résultats
                    </span>
                    <span className="text-xs text-[#5b6b7a]/70 shrink-0">
                      {new Date(item.created_date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </PageLayout>
  );
}

