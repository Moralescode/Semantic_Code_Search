'use client';

import React, { useState, useEffect } from 'react';
import PageLayout from '../../components/PageLayout';
import { Trash2 } from 'lucide-react';

interface HistoryEntry {
  timestamp: string;
  query: string;
  language: string;
  results_count: number;
  latency: number;
}

export default function HistoryPage() {
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem('searchHistory');
    if (stored) {
      try { setHistory(JSON.parse(stored)); } catch { setHistory([]); }
    }
  }, []);

  const clearHistory = () => {
    localStorage.removeItem('searchHistory');
    setHistory([]);
  };

  return (
    <PageLayout title="Historique" subtitle="Consultez vos recherches passées et leur pertinence.">
      <div className="mck-section">
        <div className="mck-container">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold text-[#0b1f33]">Recherches récentes</h2>
            {history.length > 0 && (
              <button onClick={clearHistory} className="mck-btn-secondary !px-4 !py-2 text-red-600 border-red-200 hover:border-red-300">
                <Trash2 className="w-4 h-4" />
                <span>Effacer</span>
              </button>
            )}
          </div>

          <div className="mck-card overflow-hidden">
            {history.length === 0 ? (
              <div className="p-8 text-center text-[#5b6b7a]">Aucun historique pour le moment.</div>
            ) : (
              <table className="mck-table">
                <thead>
                  <tr>
                    <th>Date / Heure</th>
                    <th>Requête</th>
                    <th>Langage</th>
                    <th>Résultats</th>
                    <th>Latence</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((entry, idx) => (
                    <tr key={idx} className="hover:bg-[#f6f8fb]">
                      <td className="text-[#5b6b7a]">{entry.timestamp}</td>
                      <td className="font-medium text-[#142938]">{entry.query}</td>
                      <td>{entry.language}</td>
                      <td>{entry.results_count}</td>
                      <td>{entry.latency.toFixed(2)} ms</td>
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