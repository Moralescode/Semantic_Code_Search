'use client';

import React, { useState } from 'react';
import PageLayout from '../../components/PageLayout';
import { Sparkles, Loader2 } from 'lucide-react';
import axios from 'axios';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export default function GeneratePage() {
  const [description, setDescription] = useState('');
  const [language, setLanguage] = useState('Python');
  const [result, setResult] = useState<{ name: string; docstring: string; code: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [indexing, setIndexing] = useState(false);
  const [indexed, setIndexed] = useState(false);

  const handleGenerate = async () => {
    if (!description.trim()) return;
    setLoading(true);
    setResult(null);
    setIndexed(false);
    try {
      const res = await axios.post(`${BASE_URL}/generate`, {
        description,
        language: language.toLowerCase()
      });
      setResult(res.data);
    } catch (err) {
      console.error(err);
      alert('Erreur lors de la génération du code.');
    } finally {
      setLoading(false);
    }
  };

  const handleIndex = async () => {
    if (!result) return;
    setIndexing(true);
    try {
      const newEntry = {
        name: result.name,
        language: language.toLowerCase(),
        docstring: result.docstring,
        code: result.code,
        arguments: ['x']
      };

      const res = await axios.post(`${BASE_URL}/index_code`, newEntry);

      if (res.data.success) {
        setIndexed(true);
        alert('Fonction indexée avec succès dans FAISS !');
      } else {
        throw new Error(res.data.message || 'Indexation failed');
      }
    } catch (err) {
      console.error(err);
      alert("Erreur lors de l'indexation.");
    } finally {
      setIndexing(false);
    }
  };

  return (
    <PageLayout title="Générateur de Code IA" subtitle="Générez du code propre à l'aide de l'IA et insérez-le directement dans notre index FAISS.">
      <div className="mck-section">
        <div className="mck-container">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="mck-card p-6 space-y-4">
              <h3 className="text-lg font-semibold text-[#0b1f33]">📝 Spécifications</h3>
              <textarea
                className="mck-input min-h-[120px]"
                placeholder="Décrivez la fonction..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
              <select
                className="mck-input"
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
              >
                <option value="Python">Python</option>
                <option value="JavaScript">JavaScript</option>
              </select>
              <button
                onClick={handleGenerate}
                disabled={loading}
                className="mck-btn-primary w-full"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
                <span>{loading ? 'Génération en cours...' : 'Générer'}</span>
              </button>
            </div>

            <div className="mck-card p-6 space-y-4">
              <h3 className="text-lg font-semibold text-[#0b1f33]">💻 Résultat</h3>
              {result ? (
                <div className="space-y-3">
                  <div>
                    <span className="text-xs font-semibold text-[#5b6b7a] uppercase tracking-wider">Nom :</span>
                    <div className="text-lg font-semibold text-[#0b1f33] mt-1">{result.name}</div>
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-[#5b6b7a] uppercase tracking-wider">Docstring :</span>
                    <p className="text-sm text-[#5b6b7a] mt-1 italic">{result.docstring}</p>
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-[#5b6b7a] uppercase tracking-wider">Code :</span>
                    <pre className="bg-[#0b1f33] text-gray-100 p-4 rounded-xl text-xs overflow-x-auto whitespace-pre mt-1">
                      {result.code}
                    </pre>
                  </div>
                  <button
                    onClick={handleIndex}
                    disabled={indexing || indexed}
                    className="mck-btn-primary w-full"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>{indexing ? 'Indexation...' : indexed ? '✅ Indexé' : '📥 Indexer'}</span>
                  </button>
                </div>
              ) : (
                <p className="text-sm text-[#5b6b7a] italic">Résultat ici.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}