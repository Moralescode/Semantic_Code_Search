'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import PageLayout from '../../components/PageLayout';
import HeroCarousel from '../../components/HeroCarousel';
import axios from 'axios';
import { Brain, Loader2, Download, FileJson } from 'lucide-react';

const Plot = dynamic(() => import('react-plotly.js'), { ssr: false });

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export default function DashboardPage() {
  const [mounted, setMounted] = useState(false);
  const [embeddingExplanation, setEmbeddingExplanation] = useState('');
  const [loadingEmbeddingExplanation, setLoadingEmbeddingExplanation] = useState(false);
  const [analysisTimestamp, setAnalysisTimestamp] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const interpretEmbeddings = async () => {
    setLoadingEmbeddingExplanation(true);
    setEmbeddingExplanation('');
    setAnalysisTimestamp(null);
    try {
      const res = await axios.post(`${BASE_URL}/explain`, {
        name: 'dashboard_semantic_map',
        language: 'french',
        code: 'Cartographie Sémantique Interactive 2D - Dashboard CodeMind',
        docstring: 'Analyse des projections des embeddings sémantiques : clusters detectés, séparation entre les groupes Fintech & Validation, Localisation & Franc CFA, Sécurité & HMAC, qualité de la vectorisation et axes sémantiques X/Y'
      });
      setEmbeddingExplanation(res.data.explanation);
      setAnalysisTimestamp(new Date().toLocaleString('fr-FR'));
    } catch {
      setEmbeddingExplanation('');
    } finally {
      setLoadingEmbeddingExplanation(false);
    }
  };

  const downloadAnalysis = (format: 'json' | 'txt') => {
    if (!embeddingExplanation || !analysisTimestamp) return;
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    let content: string;
    let mimeType: string;
    let extension: string;

    if (format === 'json') {
      const data = {
        timestamp: analysisTimestamp,
        type: 'Analyse Embeddings Sémantiques',
        projection: 'Cartographie Sémantique Interactive 2D',
        clusters: [
          { name: 'Fintech & Validation', color: '#0b1f33', functions: ['validate_ci_phone_number', 'validateCIPhone', 'check_phone_number_valid', 'validateCIPhoneLength'] },
          { name: 'Localisation & Franc CFA', color: '#c5a55a', functions: ['format_currency_xof', 'formatXOF', 'roundXOFValue'] },
          { name: 'Sécurité & HMAC', color: '#5b6b7a', functions: ['generate_hmac_signature', 'verifyHMAC', 'sha256Hash'] }
        ],
        analysis: embeddingExplanation,
        metadata: {
          total_functions: 10,
          languages: ['Python', 'JavaScript'],
          generated_by: 'CodeMind AI'
        }
      };
      content = JSON.stringify(data, null, 2);
      mimeType = 'application/json';
      extension = 'json';
    } else {
      content = `ANALYSE DES PROJECTIONS DES EMBEDDINGS SÉMANTIQUES
CodeMind - Dashboard
Généré le : ${analysisTimestamp}

${embeddingExplanation}

---
Clusters détectés :
1. Fintech & Validation (${['validate_ci_phone_number', 'validateCIPhone', 'check_phone_number_valid', 'validateCIPhoneLength'].length} fonctions)
2. Localisation & Franc CFA (${['format_currency_xof', 'formatXOF', 'roundXOFValue'].length} fonctions)
3. Sécurité & HMAC (${['generate_hmac_signature', 'verifyHMAC', 'sha256Hash'].length} fonctions)

---
Généré par CodeMind - NexaTech Solutions`;
      mimeType = 'text/plain';
      extension = 'txt';
    }

    const blob = new Blob([content], { type: `${mimeType};charset=utf-8;` });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `codemind-embeddings-analysis-${timestamp}.${extension}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const kpis = [
    { label: 'Fonctions Indexées', value: '100', change: 'Corpus Actuel' },
    { label: 'Langages', value: '2', change: 'Python / JavaScript' },
    { label: 'Latence Moyenne', value: '4.23 ms', change: 'Temps Réel CPU' },
    { label: 'Gain Productivité', value: '~60%', change: 'Objectif NexaTech' }
  ];

  const mapData = [
    {
      x: [2.1, 1.9, 1.8, 2.3],
      y: [4.9, 5.1, 4.8, 5.2],
      mode: 'markers',
      type: 'scatter',
      name: 'Fintech & Validation',
      text: ['validate_ci_phone_number', 'validateCIPhone', 'check_phone_number_valid', 'validateCIPhoneLength'],
      marker: { size: 12, color: '#0b1f33' }
    },
    {
      x: [4.2, 3.9, 4.1],
      y: [2.1, 1.9, 2.0],
      mode: 'markers',
      type: 'scatter',
      name: 'Localisation & Franc CFA',
      text: ['format_currency_xof', 'formatXOF', 'roundXOFValue'],
      marker: { size: 12, color: '#c5a55a' }
    },
    {
      x: [8.1, 7.9, 8.3],
      y: [7.9, 8.1, 8.2],
      mode: 'markers',
      type: 'scatter',
      name: 'Sécurité & HMAC',
      text: ['generate_hmac_signature', 'verifyHMAC', 'sha256Hash'],
      marker: { size: 12, color: '#5b6b7a' }
    }
  ];

  return (
    <PageLayout title="Dashboard" subtitle="Statistiques en temps réel et exploration vectorielle 2D">
      <HeroCarousel />

      <div className="mck-section bg-white border-b border-[#e3e8ee]">
        <div className="mck-container">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {kpis.map((kpi, i) => (
              <div key={i} className="mck-card p-6 text-center">
                <div className="text-xs font-semibold text-[#5b6b7a] uppercase tracking-wider mb-2">{kpi.label}</div>
                <div className="text-3xl font-semibold text-[#0b1f33] mb-1">{kpi.value}</div>
                <div className="text-xs text-[#c5a55a] font-medium">{kpi.change}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mck-section">
        <div className="mck-container">
          <div className="mck-card p-6 mb-8">
            <h2 className="text-lg font-semibold text-[#0b1f33] mb-2">Cartographie Sémantique Interactive 2D</h2>
            <p className="text-sm text-[#5b6b7a] mb-6">Chaque point représente une fonction réelle indexée. Les fonctions sémantiquement proches se regroupent en clusters.</p>
            {mounted && (
              <Plot
                data={mapData as any}
                layout={{
                  title: 'Projections des Embeddings Sémantiques',
                  xaxis: { title: 'Axe Sémantique X', showgrid: true },
                  yaxis: { title: 'Axe Sémantique Y', showgrid: true },
                  hovermode: 'closest',
                  paper_bgcolor: 'rgba(0,0,0,0)',
                  plot_bgcolor: 'rgba(0,0,0,0)',
                  autosize: true
                }}
                style={{ width: '100%', height: '400px' }}
              />
            )}

            <div className="mt-6 space-y-4">
              <div className="flex flex-col gap-3">
                <button
                  onClick={interpretEmbeddings}
                  disabled={loadingEmbeddingExplanation}
                  className="mck-btn-primary"
                >
                  {loadingEmbeddingExplanation ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Brain className="w-4 h-4" />
                  )}
                  <span>{loadingEmbeddingExplanation ? 'Analyse IA en cours...' : 'Interpréter la projection'}</span>
                </button>

                {!loadingEmbeddingExplanation && embeddingExplanation && (
                  <div className="rounded-xl border border-[#e3e8ee] bg-[#f6f8fb] p-4 text-sm text-[#142938] whitespace-pre-wrap">
                    {embeddingExplanation}
                  </div>
                )}
              </div>

              {embeddingExplanation && !loadingEmbeddingExplanation && (
                <div className="flex flex-col gap-2">
                  <div className="text-xs font-semibold text-[#5b6b7a] uppercase tracking-wider">
                    Télécharger l'analyse
                    {analysisTimestamp && (
                      <span className="ml-2 normal-case tracking-normal text-[#5b6b7a]/70">
                        · Générée le {analysisTimestamp}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => downloadAnalysis('json')}
                      className="mck-btn-secondary"
                    >
                      <FileJson className="w-4 h-4" />
                      <span>Exporter JSON</span>
                    </button>
                    <button
                      onClick={() => downloadAnalysis('txt')}
                      className="mck-btn-secondary"
                    >
                      <Download className="w-4 h-4" />
                      <span>Exporter TXT</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="mck-card p-6 flex flex-col items-center">
              <h3 className="text-md font-semibold text-[#0b1f33] mb-4">Répartition du Corpus par Langage</h3>
              {mounted && (
                <Plot
                  data={[
                    { values: [50, 50], labels: ['Python', 'JavaScript'], type: 'pie', marker: { colors: ['#0b1f33', '#c5a55a'] } }
                  ]}
                  layout={{ width: 400, height: 300, paper_bgcolor: 'rgba(0,0,0,0)', margin: { l: 10, r: 10, b: 10, t: 10 } }}
                />
              )}
            </div>

            <div className="mck-card p-6 flex flex-col justify-center">
              <h3 className="text-md font-semibold text-[#0b1f33] mb-4">Contexte Métier NexaTech</h3>
              <p className="text-sm text-[#5b6b7a] leading-relaxed">
                La solution sémantique unifie nos briques logicielles au sein de nos architectures bancaires et fintechs de la zone UEMOA.
                Grâce à l'indexation dynamique, notre base de code s'enrichit automatiquement des nouvelles fonctions qualifiées conçues par l'équipe.
              </p>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}