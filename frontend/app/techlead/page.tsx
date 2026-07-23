'use client';

import React, { useState, useEffect } from 'react';
import PageLayout from '../../components/PageLayout';
import { AlertTriangle, Sparkles, CheckCircle } from 'lucide-react';
import axios from 'axios';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export default function TechLeadPage() {
  const [loading, setLoading] = useState(false);
  const [refactored, setRefactored] = useState<any | null>(null);
  const [activeTab, setActiveTab] = useState<'duplicate' | 'gaps'>('duplicate');

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

  const gapsData = [
    { query: 'encrypt file with AES-256', frequency: 12, score: 0.12, status: 'Lacune critique' },
    { query: 'Moov USSD gateway push payment', frequency: 8, score: 0.08, status: 'Lacune critique' },
    { query: 'parse telecom SMS logs', frequency: 5, score: 0.15, status: 'Fiche manquante' },
    { query: 'connect to SQLite with pool', frequency: 4, score: 0.22, status: 'Pertinence faible' }
  ];

  const handleMerge = async () => {
    setLoading(true);
    try {
      const res = await axios.post(`${BASE_URL}/refactor_duplicate`, { code1, code2, language: 'python' });
      setRefactored(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageLayout title="Espace Tech Lead" subtitle="Détection et fusion sémantique intelligente de doublons de code">
      <div className="mck-section">
        <div className="mck-container">
          <div className="flex gap-4 mb-8">
            <button
              onClick={() => setActiveTab('duplicate')}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition ${activeTab === 'duplicate' ? 'bg-[#0b1f33] text-white' : 'bg-white border border-[#e3e8ee] text-[#5b6b7a]'}`}
            >
              Détection de Duplications
            </button>
            <button
              onClick={() => setActiveTab('gaps')}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition ${activeTab === 'gaps' ? 'bg-[#0b1f33] text-white' : 'bg-white border border-[#e3e8ee] text-[#5b6b7a]'}`}
            >
              Analyse des Lacunes
            </button>
          </div>

          {activeTab === 'duplicate' && !refactored && (
            <div className="space-y-6">
              <div className="mck-card p-6 border-l-4 border-[#c5a55a]">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-[#c5a55a] shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-[#0b1f33]">Alerte Redondance Détectée</h4>
                    <p className="text-sm text-[#5b6b7a] mt-1">Le système a localisé 2 fonctions quasiment identiques avec un score de similarité de <strong>92%</strong> !</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="mck-card p-6">
                  <h3 className="text-sm font-semibold text-[#5b6b7a] uppercase tracking-wider mb-2">Code de Référence</h3>
                  <p className="text-xs text-[#5b6b7a] mb-4">Auteur : Kofi (Python Dev) - Validé</p>
                  <pre className="bg-[#0b1f33] text-gray-100 p-4 rounded-xl text-xs overflow-x-auto whitespace-pre">
                    {code1}
                  </pre>
                </div>

                <div className="mck-card p-6">
                  <h3 className="text-sm font-semibold text-[#5b6b7a] uppercase tracking-wider mb-2">Code Redondant</h3>
                  <p className="text-xs text-[#5b6b7a] mb-4">Auteur : Ex-développeur - Doublon</p>
                  <pre className="bg-[#0b1f33] text-gray-100 p-4 rounded-xl text-xs overflow-x-auto whitespace-pre">
                    {code2}
                  </pre>
                </div>
              </div>

              <button onClick={handleMerge} disabled={loading} className="mck-btn-primary w-full">
                <Sparkles className="w-5 h-5" />
                <span>{loading ? 'Calcul de la fusion...' : 'Demander un Refactoring de fusion par l\'IA'}</span>
              </button>
            </div>
          )}

          {activeTab === 'duplicate' && refactored && (
            <div className="mck-card p-8 space-y-6">
              <div className="flex items-center gap-3 text-green-600">
                <CheckCircle className="w-8 h-8" />
                <h3 className="text-xl font-semibold">Unification sémantique accomplie par l'IA !</h3>
              </div>

              <div>
                <span className="text-xs font-semibold text-[#5b6b7a] uppercase tracking-wider">Nom unifié recommandé :</span>
                <div className="text-lg font-semibold text-[#0b1f33] mt-1">{refactored.unified_name}</div>
              </div>

              <div>
                <span className="text-xs font-semibold text-[#5b6b7a] uppercase tracking-wider">Explication de la fusion :</span>
                <p className="text-sm text-[#5b6b7a] leading-relaxed mt-1">{refactored.refactor_explanation}</p>
              </div>

              <div>
                <span className="text-xs font-semibold text-[#5b6b7a] uppercase tracking-wider">Code unifié proposé :</span>
                <pre className="bg-[#0b1f33] text-gray-100 p-4 rounded-xl text-xs overflow-x-auto whitespace-pre mt-2">
                  {refactored.unified_code}
                </pre>
              </div>

              <button onClick={() => setRefactored(null)} className="mck-btn-secondary">
                ↩️ Recommencer l'analyse
              </button>
            </div>
          )}

          {activeTab === 'gaps' && (
            <div className="mck-card p-6">
              <h3 className="text-lg font-semibold text-[#0b1f33] mb-4">Analyse des Lacunes Sémantiques</h3>
              <p className="text-sm text-[#5b6b7a] mb-4">Requêtes de recherche qui n'ont retourné aucun résultat ou des scores inférieurs à 30%.</p>
              <div className="overflow-x-auto">
                <table className="mck-table">
                  <thead>
                    <tr>
                      <th>Requête</th>
                      <th>Fréquence</th>
                      <th>Meilleur Score</th>
                      <th>Statut</th>
                    </tr>
                  </thead>
                  <tbody>
                    {gapsData.map((gap, idx) => (
                      <tr key={idx} className="hover:bg-[#f6f8fb]">
                        <td className="font-medium text-[#142938]">{gap.query}</td>
                        <td>{gap.frequency}</td>
                        <td>{gap.score.toFixed(2)}</td>
                        <td className="text-red-600 font-medium">{gap.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-4 p-4 bg-[#f6f8fb] rounded-xl border border-[#e3e8ee]">
                <p className="text-sm text-[#5b6b7a]">💡 <strong>Recommandation :</strong> Utilisez le <strong>Générateur de Code IA</strong> pour concevoir ces modules manquants et les indexer dans FAISS.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </PageLayout>
  );
}