'use client';

import React, { useState, useEffect } from 'react';
import PageLayout from '../../components/PageLayout';
import { Trash2 } from 'lucide-react';

interface Favorite {
  name: string;
  language: string;
  docstring: string;
  code: string;
  score: number;
}

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState<Favorite[]>([]);

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

  return (
    <PageLayout title="Favoris" subtitle="Retrouvez rapidement vos fonctions sauvegardées.">
      <div className="mck-section">
        <div className="mck-container">
          {favorites.length === 0 ? (
            <div className="mck-card p-8 text-center text-[#5b6b7a]">Aucun favori pour le moment.</div>
          ) : (
            <div className="space-y-4">
              {favorites.map((fav, idx) => (
                <div key={idx} className="mck-card p-6">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <span className="text-lg font-semibold text-[#0b1f33]">{fav.name}</span>
                      <span className="ml-2 text-xs font-semibold text-[#c5a55a] bg-[#f6f8fb] px-2 py-1 rounded-full">{fav.language.toUpperCase()}</span>
                    </div>
                    <button onClick={() => removeFavorite(fav.name)} className="text-red-600 hover:text-red-700">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-sm text-[#5b6b7a] italic mb-3">&quot;{fav.docstring}&quot;</p>
                  <pre className="bg-[#0b1f33] text-gray-100 p-4 rounded-xl text-xs overflow-x-auto whitespace-pre">
                    {fav.code}
                  </pre>
                  <div className="mt-3 text-xs text-[#5b6b7a] font-medium">Score FAISS : {fav.score.toFixed(4)}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </PageLayout>
  );
}