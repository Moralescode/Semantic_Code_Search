'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import PageLayout from '../../components/PageLayout';

const Plot = dynamic(() => import('react-plotly.js'), { ssr: false });

export default function AnalyticsPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <PageLayout title="Analytics" subtitle="Suivi et évaluation de la pertinence de recherche par rapport à l'index de référence.">
      <div className="mck-section bg-white border-b border-[#e3e8ee]">
        <div className="mck-container">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { label: 'MRR@10', baseline: '0.20', target: '0.45', value: '0.63' },
              { label: 'Recall@10', baseline: '0.20', target: '0.70', value: '1.00' },
              { label: 'nDCG@10', baseline: '0.20', target: 'Maximiser', value: '0.72' },
              { label: 'Latence P95', baseline: '~2400 ms', target: '< 2000 ms', value: '6.35 ms' }
            ].map((metric, i) => (
              <div key={i} className="mck-card p-6 text-center">
                <div className="text-xs font-semibold text-[#5b6b7a] uppercase tracking-wider mb-2">{metric.label}</div>
                <div className="text-3xl font-semibold text-[#0b1f33] mb-1">{metric.value}</div>
                <div className="text-xs text-[#5b6b7a]">Baseline: {metric.baseline}</div>
                <div className="text-xs text-[#c5a55a]">Cible: {metric.target}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mck-section">
        <div className="mck-container">
          <div className="mck-card p-6">
            <h2 className="text-lg font-semibold text-[#0b1f33] mb-4">Impact du Fine-Tuning LoRA</h2>
            {mounted && (
              <Plot
                data={[
                  { x: ['MRR@10', 'Recall@10', 'nDCG@10'], y: [0.20, 0.20, 0.20], name: 'Baseline', type: 'bar', marker: { color: '#9ca3af' } },
                  { x: ['MRR@10', 'Recall@10', 'nDCG@10'], y: [0.45, 0.70, 0.50], name: 'Cible', type: 'bar', marker: { color: '#c5a55a' } },
                  { x: ['MRR@10', 'Recall@10', 'nDCG@10'], y: [0.63, 1.00, 0.72], name: 'CodeMind', type: 'bar', marker: { color: '#0b1f33' } }
                ]}
                layout={{ barmode: 'group', paper_bgcolor: 'rgba(0,0,0,0)', plot_bgcolor: 'rgba(0,0,0,0)', autosize: true }}
                style={{ width: '100%', height: '400px' }}
              />
            )}
          </div>
        </div>
      </div>
    </PageLayout>
  );
}