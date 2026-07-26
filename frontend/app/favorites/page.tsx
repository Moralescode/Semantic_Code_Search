'use client';

import React, { useState, useEffect } from 'react';
import { Trash2, Star, Code2, FileCode, Copy, Check, Search } from 'lucide-react';
import PageLayout from '@/components/PageLayout';

interface Favorite {
  name: string;
  language: string;
  docstring: string;
  code: string;
  score: number;
}

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem('favorites');
    if (stored) {
      try { setFavorites(JSON.parse(stored)); } catch { setFavorites([]); }
    }
  }, []);

  const removeFavorite = (name: string) => {
    const updated = favorites.filter(f => f.name !== name);
    setFavorites(updated);
    localStorage.setItem('favorites', JSON.stringify(updated));
  };

  const handleCopy = (code: string, idx: number) => {
    navigator.clipboard.writeText(code);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <PageLayout title="Favoris" subtitle="Mes Favoris">
    <div className="min-h-screen bg-[var(--bg-main)]">
      <div className="bd-container py-6 lg:py-8 max-w-5xl mx-auto">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-1">
            <div className="bd-badge bd-badge-gold">Favoris</div>
          </div>
          <h1 className="text-3xl font-bold text-[var(--text-primary)]">Mes Favoris</h1>
          <p className="text-[var(--text-secondary)] mt-1 text-sm">
            Retrouvez rapidement vos fonctions sauvegardées.
          </p>
        </div>

        {favorites.length === 0 ? (
          <div className="bd-card p-12">
            <div className="bd-empty">
              <div className="bd-empty-icon">
                <Star className="w-7 h-7 text-[var(--gold)]" />
              </div>
              <h3>Aucun favori</h3>
              <p>Vous n&apos;avez pas encore ajouté de fonction à vos favoris.</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)] mb-2">
              <Star className="w-4 h-4 text-[var(--gold)]" />
              <span>{favorites.length} fonction{favorites.length > 1 ? 's' : ''} sauvegardée{favorites.length > 1 ? 's' : ''}</span>
            </div>

            {favorites.map((fav, idx) => (
              <div key={idx} className="bd-card overflow-hidden">
                {/* Header */}
                <div className="p-5 pb-4 border-b border-[var(--border)]">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-[var(--radius-md)] bg-[var(--gold)]/10 flex items-center justify-center shrink-0">
                        <Code2 className="w-5 h-5 text-[var(--gold)]" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-[var(--text-primary)] font-mono">{fav.name}</h3>
                        <p className="text-sm text-[var(--text-secondary)] italic mt-1 line-clamp-2">
                          &ldquo;{fav.docstring}&rdquo;
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="bd-badge bd-badge-primary text-[10px] font-mono">
                        {fav.language.toUpperCase()}
                      </span>
                      <button
                        onClick={() => removeFavorite(fav.name)}
                        className="w-8 h-8 rounded-[var(--radius-md)] flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--danger)] hover:bg-[var(--danger)]/5 transition-colors"
                        title="Retirer des favoris"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Code */}
                <div className="p-5 pt-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">Code</span>
                    <button
                      onClick={() => handleCopy(fav.code, idx)}
                      className="flex items-center gap-1 text-xs text-[var(--text-secondary)] hover:text-[var(--gold)] transition-colors"
                    >
                      {copiedIndex === idx ? (
                        <><Check className="w-3 h-3 text-[var(--success)]" /> Copié</>
                      ) : (
                        <><Copy className="w-3 h-3" /> Copier</>
                      )}
                    </button>
                  </div>
                  <div className="code-block">
                    <div className="code-block-header">
                      <span>{fav.language.toLowerCase()}</span>
                    </div>
                    <div className="code-block-content">
                      <pre><code>{fav.code}</code></pre>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center gap-2 text-xs text-[var(--text-muted)]">
                    <span>Score FAISS :</span>
                    <span className="font-mono font-semibold text-[var(--gold)]">{fav.score.toFixed(4)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
    </PageLayout>
  );
}
