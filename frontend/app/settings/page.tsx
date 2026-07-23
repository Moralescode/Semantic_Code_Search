'use client';

import React, { useState } from 'react';
import PageLayout from '../../components/PageLayout';
import { Save } from 'lucide-react';

export default function SettingsPage() {
  const [apiUrl, setApiUrl] = useState('http://localhost:8000');
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    localStorage.setItem('apiUrl', apiUrl);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <PageLayout title="Paramètres" subtitle="Configurez votre environnement CodeMind.">
      <div className="mck-section">
        <div className="mck-container">
          <div className="mck-card p-6 space-y-6">
            <div>
              <label className="block text-sm font-medium text-[#142938] mb-2">URL de l'API Backend</label>
              <input
                type="text"
                className="mck-input"
                value={apiUrl}
                onChange={(e) => setApiUrl(e.target.value)}
                placeholder="http://localhost:8000"
              />
              <p className="text-xs text-[#5b6b7a] mt-1">Laissez la valeur par défaut si le backend tourne localement.</p>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-[#142938]">Notifications</h3>
                <p className="text-xs text-[#5b6b7a]">Recevoir les alertes de nouveaux index FAISS</p>
              </div>
              <input type="checkbox" defaultChecked className="h-4 w-4 rounded border-[#e3e8ee] text-[#0b1f33] focus:ring-[#0b1f33]" />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-[#142938]">Mode Comparaison</h3>
                <p className="text-xs text-[#5b6b7a]">Afficher systématiquement Baseline vs Fine-tuné</p>
              </div>
              <input type="checkbox" className="h-4 w-4 rounded border-[#e3e8ee] text-[#0b1f33] focus:ring-[#0b1f33]" />
            </div>

            <button onClick={handleSave} className="mck-btn-primary">
              <Save className="w-4 h-4" />
              <span>{saved ? 'Enregistré !' : 'Enregistrer'}</span>
            </button>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}