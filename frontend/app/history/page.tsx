'use client';

import React, { useState, useEffect } from 'react';
import { Trash2, Search, Clock, ChevronRight, X, RefreshCw } from 'lucide-react';
import PageLayout from '@/components/PageLayout';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export default function HistoryPage() {
  const [history, setHistory] = useState<any[]>([]);
  const [filterQuery, setFilterQuery] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchHistory = async () => {
    try {
      const res = await fetch(`${BASE_URL}/search_history?limit=100`);
      if (res.ok) {
        const data = await res.json();
        setHistory(data);
      }
    } catch { /* ignore */ }
    setLoading(false);
  };

  useEffect(() => { fetchHistory(); }, []);

  const clearHistory = async () => {
    // Clear the backend history by writing an empty file is not supported
    // Instead, we just clear local display and localStorage
    try {
      localStorage.removeItem('searchHistory');
    } catch { /* ignore */ }
    setHistory([]);
  };

  const filteredHistory = history.filter(
    (h: any) => (h.query || '').toLowerCase().includes(filterQuery.toLowerCase())
  );

  return (
    <PageLayout title="Historique" subtitle="Historique des recherches">
    <div className="min-h-screen bg-[var(--bg-main)]">
      <div className="bd-container py-6 lg:py-8 max-w-5xl mx-auto">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="bd-badge bd-badge-primary">Historique</div>
            </div>
            <h1 className="text-3xl font-bold text-[var(--text-primary)]">Historique des recherches</h1>
            <p className="text-[var(--text-secondary)] mt-1 text-sm">Consultez vos recherches passées et leur pertinence.</p>
          </div>
          <div className="flex items-center gap-2 mt-4 md:mt-0">
            <button onClick={fetchHistory} className="bd-btn-secondary !px-3 !py-2 text-xs">
              <RefreshCw className="w-3.5 h-3.5" /> Actualiser
            </button>
            {history.length > 0 && (
              <button onClick={clearHistory} className="bd-btn-secondary !px-4 !py-2.5 text-[var(--danger)] border-[var(--danger)]/20 hover:bg-[var(--danger)]/5 text-xs">
                <Trash2 className="w-4 h-4" /> Effacer
              </button>
            )}
          </div>
        </div>

        {/* Filter */}
        {history.length > 0 && (
          <div className="mb-6">
            <div className="relative max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
              <input type="text" value={filterQuery} onChange={(e) => setFilterQuery(e.target.value)} placeholder="Filtrer les recherches..." className="bd-input !pl-9 !pr-9" />
              {filterQuery && (<button onClick={() => setFilterQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)]"><X className="w-3.5 h-3.5" /></button>)}
            </div>
          </div>
        )}

        {/* List */}
        <div className="bd-card overflow-hidden">
          {loading ? (
            <div className="space-y-2 p-5">{[...Array(5)].map((_, i) => <div key={i} className="h-12 rounded-[var(--radius-md)] bd-skeleton" />)}</div>
          ) : filteredHistory.length === 0 ? (
            <div className="bd-empty !py-16">
              <div className="bd-empty-icon"><Clock className="w-7 h-7 text-[var(--primary)]" /></div>
              <h3>Aucun historique</h3>
              <p>Vous n&apos;avez pas encore effectué de recherche. Lancez-vous !</p>
            </div>
          ) : (
            <table className="bd-table">
              <thead>
                <tr><th>Date / Heure</th><th>Requête</th><th className="text-center">Langage</th><th className="text-center">Résultats</th><th className="text-center">Latence</th></tr>
              </thead>
              <tbody>
                {filteredHistory.map((entry: any, idx: number) => (
                  <tr key={entry.id || idx} className="hover:bg-[var(--surface-hover)] cursor-pointer">
                    <td className="text-[var(--text-secondary)] text-xs"><div className="flex items-center gap-1.5"><Clock className="w-3 h-3" />{entry.created_date?.includes('T') ? new Date(entry.created_date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : (entry.created_date || '—')}</div></td>
                    <td className="font-medium text-[var(--text-primary)]">&ldquo;{entry.query || '&mdash;'}&rdquo;</td>
                    <td className="text-center"><span className="bd-badge bd-badge-primary text-[10px]">{(entry.language || '—')}</span></td>
                    <td className="text-center font-semibold">{entry.results_count ?? '&mdash;'}</td>
                    <td className="text-center text-[var(--text-secondary)] font-mono text-xs">{(entry.latency != null ? `${entry.latency} ms` : '&mdash;')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
    </PageLayout>
  );
}
