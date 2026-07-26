'use client';

import React, { useState } from 'react';
import { Sparkles, Loader2, Code2, FileCode, BookOpen, Copy, Check } from 'lucide-react';
import PageLayout from '@/components/PageLayout';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export default function GeneratePage() {
  const [description, setDescription] = useState('');
  const [language, setLanguage] = useState('Python');
  const [result, setResult] = useState<{ name: string; docstring: string; code: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [indexing, setIndexing] = useState(false);
  const [indexed, setIndexed] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleGenerate = async () => {
    if (!description.trim()) return;
    setLoading(true);
    setResult(null);
    setIndexed(false);
    try {
      const res = await fetch(`${BASE_URL}/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description, language: language.toLowerCase() }),
      });
      const data = await res.json();
      setResult(data);
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
        arguments: ['x'],
      };
      const res = await fetch(`${BASE_URL}/index_code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newEntry),
      });
      const data = await res.json();
      if (data.success) {
        setIndexed(true);
      } else {
        throw new Error(data.message || 'Indexation failed');
      }
    } catch (err) {
      console.error(err);
      alert("Erreur lors de l'indexation.");
    } finally {
      setIndexing(false);
    }
  };

  const handleCopy = () => {
    if (result?.code) {
      navigator.clipboard.writeText(result.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const languageOptions = ['Python', 'JavaScript', 'Go', 'Java', 'PHP', 'Ruby'];

  return (
    <PageLayout title="Générer" subtitle="Générateur de Code IA">
    <div className="min-h-screen bg-[var(--bg-main)]">
      <div className="bd-container py-6 lg:py-8 max-w-6xl mx-auto">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-1">
            <div className="bd-badge bd-badge-gold">Générer</div>
          </div>
          <h1 className="text-3xl font-bold text-[var(--text-primary)]">Générateur de Code IA</h1>
          <p className="text-[var(--text-secondary)] mt-1 text-sm">
            Générez du code propre à l&apos;aide de l&apos;IA et insérez-le directement dans notre index FAISS.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: Input */}
          <div className="bd-card p-6 space-y-5">
            <div className="flex items-center gap-2">
              <Code2 className="w-5 h-5 text-[var(--gold)]" />
              <h3 className="font-semibold text-[var(--text-primary)]">Spécifications</h3>
            </div>

            <div>
              <label className="text-xs font-medium text-[var(--text-secondary)] mb-1.5 block">
                Décrivez la fonction à générer
              </label>
              <textarea
                className="bd-input min-h-[140px] resize-y"
                placeholder="Ex: fonction qui valide un numéro de téléphone ivoirien avec regex..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div>
              <label className="text-xs font-medium text-[var(--text-secondary)] mb-1.5 block">
                Langage de programmation
              </label>
              <div className="flex flex-wrap gap-2">
                {languageOptions.map((l) => (
                  <button
                    key={l}
                    onClick={() => setLanguage(l)}
                    className={`px-3.5 py-2 rounded-[var(--radius-md)] text-sm font-medium transition-all border ${
                      language === l
                        ? 'bg-[var(--primary)] text-white border-[var(--primary)] shadow-sm'
                        : 'bg-[var(--bg-card)] text-[var(--text-secondary)] border-[var(--border)] hover:border-[var(--primary)]/30'
                    }`}
                  >
                    {l}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleGenerate}
              disabled={loading || !description.trim()}
              className="bd-btn-primary w-full justify-center py-3"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Sparkles className="w-5 h-5" />
              )}
              <span>{loading ? 'Génération en cours...' : 'Générer le code'}</span>
            </button>

            {/* Tips */}
            <div className="p-4 rounded-[var(--radius-md)] bg-[var(--surface-alt)] border border-[var(--border)]">
              <h4 className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <BookOpen className="w-3 h-3" /> Conseils
              </h4>
              <ul className="space-y-1">
                {[
                  'Soyez précis dans la description de la fonction',
                  'Mentionnez les paramètres d\'entrée et de sortie',
                  'Indiquez le contexte métier (ex: TVA, téléphonie)',
                ].map((tip, i) => (
                  <li key={i} className="text-xs text-[var(--text-secondary)] flex items-start gap-2">
                    <span className="text-[var(--gold)] mt-0.5">•</span>
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Right: Result */}
          <div className="bd-card p-6 space-y-5">
            <div className="flex items-center gap-2">
              <FileCode className="w-5 h-5 text-[var(--gold)]" />
              <h3 className="font-semibold text-[var(--text-primary)]">Résultat</h3>
            </div>

            {result ? (
              <div className="space-y-4">
                {/* Name */}
                <div>
                  <span className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">Nom</span>
                  <div className="text-lg font-semibold text-[var(--text-primary)] mt-1 font-mono">
                    {result.name}
                  </div>
                </div>

                {/* Docstring */}
                <div>
                  <span className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">Description</span>
                  <p className="text-sm text-[var(--text-secondary)] mt-1 italic border-l-2 border-[var(--gold)] pl-3">
                    {result.docstring}
                  </p>
                </div>

                {/* Code */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">Code généré</span>
                    <button
                      onClick={handleCopy}
                      className="flex items-center gap-1 text-xs text-[var(--text-secondary)] hover:text-[var(--gold)] transition-colors"
                    >
                      {copied ? (
                        <><Check className="w-3 h-3 text-[var(--success)]" /> Copié</>
                      ) : (
                        <><Copy className="w-3 h-3" /> Copier</>
                      )}
                    </button>
                  </div>
                  <div className="code-block">
                    <div className="code-block-header">
                      <span>{language.toLowerCase()}</span>
                    </div>
                    <div className="code-block-content">
                      <pre><code>{result.code}</code></pre>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={handleIndex}
                    disabled={indexing || indexed}
                    className="bd-btn-primary flex-1 justify-center"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>
                      {indexing ? 'Indexation...' : indexed ? '✅ Indexé dans FAISS' : '📥 Indexer dans FAISS'}
                    </span>
                  </button>
                  <button
                    onClick={() => setResult(null)}
                    className="bd-btn-secondary"
                  >
                    Nouveau
                  </button>
                </div>
              </div>
            ) : (
              <div className="bd-empty !py-16">
                <div className="bd-empty-icon">
                  <Sparkles className="w-7 h-7 text-[var(--gold)]" />
                </div>
                <h3>En attente de génération</h3>
                <p>Décrivez la fonction souhaitée dans le panneau de gauche, puis cliquez sur Générer.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
    </PageLayout>
  );
}
