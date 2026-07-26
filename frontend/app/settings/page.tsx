'use client';

import React, { useState, useEffect } from 'react';
import { Save, Bell, Globe, Sliders, Palette, Database, Check, Volume2, Key, Mic, Loader2, Music } from 'lucide-react';
import PageLayout from '@/components/PageLayout';
import { getStoredApiKey, setApiKey, getStoredVoiceId, setStoredVoiceId, getAvailableVoices, testElevenLabsConnection, ElevenLabsVoice, getSpeakingStatus } from '@/lib/ElevenLabsService';

export default function SettingsPage() {
  const [apiUrl, setApiUrl] = useState('http://localhost:8000');
  const [saved, setSaved] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [comparisonMode, setComparisonMode] = useState(false);
  const [autoIndex, setAutoIndex] = useState(true);

  // ElevenLabs state
  const [elevenLabsKey, setElevenLabsKey] = useState('');
  const [elevenLabsKeyVisible, setElevenLabsKeyVisible] = useState(false);
  const [selectedVoiceId, setSelectedVoiceId] = useState('');
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [connectionMessage, setConnectionMessage] = useState('');
  const [voices, setVoices] = useState<ElevenLabsVoice[]>([]);
  const [apiKeyConfigured, setApiKeyConfigured] = useState(false);
  const [elevenLabsSaved, setElevenLabsSaved] = useState(false);

  useEffect(() => {
    // Charger les valeurs stockées
    const storedKey = getStoredApiKey();
    const storedVoiceId = getStoredVoiceId();
    const availableVoices = getAvailableVoices();

    setElevenLabsKey(storedKey);
    setSelectedVoiceId(storedVoiceId || availableVoices[0]?.id || '');
    setVoices(availableVoices);
    setApiKeyConfigured(!!storedKey);
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('apiUrl', apiUrl);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleTestConnection = async () => {
    setConnectionStatus('testing');
    setConnectionMessage('Test de connexion en cours...');
    const result = await testElevenLabsConnection(elevenLabsKey);
    setConnectionStatus(result.success ? 'success' : 'error');
    setConnectionMessage(result.message);
  };

  const handleSaveElevenLabs = () => {
    setApiKey(elevenLabsKey);
    setStoredVoiceId(selectedVoiceId);
    setApiKeyConfigured(!!elevenLabsKey);
    setElevenLabsSaved(true);
    setTimeout(() => setElevenLabsSaved(false), 2000);
  };

  const selectedVoice = voices.find(v => v.id === selectedVoiceId);

  return (
    <PageLayout title="Paramètres" subtitle="Configuration">
    <div className="min-h-screen bg-[var(--bg-main)]">
      <div className="bd-container py-6 lg:py-8 max-w-4xl mx-auto">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-1">
            <div className="bd-badge bd-badge-primary">Paramètres</div>
          </div>
          <h1 className="text-3xl font-bold text-[var(--text-primary)]">Paramètres</h1>
          <p className="text-[var(--text-secondary)] mt-1 text-sm">
            Configurez votre environnement CodeMind.
          </p>
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          {/* API Configuration */}
          <div className="bd-card p-6">
            <div className="flex items-center gap-2 mb-4">
              <Database className="w-5 h-5 text-[var(--gold)]" />
              <h3 className="font-semibold text-[var(--text-primary)]">Configuration API</h3>
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--text-primary)] mb-1.5">
                URL de l&apos;API Backend
              </label>
              <input
                type="text"
                className="bd-input max-w-lg"
                value={apiUrl}
                onChange={(e) => setApiUrl(e.target.value)}
                placeholder="http://localhost:8000"
              />
              <p className="text-xs text-[var(--text-secondary)] mt-1.5">
                Laissez la valeur par défaut si le backend tourne localement sur votre machine.
              </p>
            </div>
          </div>

          {/* ⭐ ElevenLabs Voice Integration */}
          <div className="bd-card p-6">
            <div className="flex items-center gap-2 mb-4">
              <Volume2 className="w-5 h-5 text-[var(--gold)]" />
              <h3 className="font-semibold text-[var(--text-primary)]">ElevenLabs Voice Integration</h3>
              {apiKeyConfigured && (
                <span className="ml-auto flex items-center gap-1.5 text-xs font-medium text-[var(--success)] bg-[var(--success)]/10 px-2.5 py-1 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--success)]" />
                  Connecté
                </span>
              )}
            </div>

            <div className="space-y-5">
              {/* API Key */}
              <div>
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-1.5">
                  <Key className="w-3.5 h-3.5 inline mr-1.5" />
                  Clé API ElevenLabs
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1 max-w-lg">
                    <input
                      type={elevenLabsKeyVisible ? 'text' : 'password'}
                      className="bd-input pr-10"
                      value={elevenLabsKey}
                      onChange={(e) => setElevenLabsKey(e.target.value)}
                      placeholder="Entrez votre clé API ElevenLabs..."
                    />
                    <button
                      type="button"
                      onClick={() => setElevenLabsKeyVisible(!elevenLabsKeyVisible)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
                    >
                      {elevenLabsKeyVisible ? (
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                        </svg>
                      ) : (
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={handleTestConnection}
                    disabled={connectionStatus === 'testing' || !elevenLabsKey.trim()}
                    className="bd-btn-secondary whitespace-nowrap"
                  >
                    {connectionStatus === 'testing' ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Mic className="w-4 h-4" />
                    )}
                    Tester
                  </button>
                </div>
                {connectionMessage && (
                  <div className={`mt-2 text-xs flex items-center gap-1.5 ${
                    connectionStatus === 'success' ? 'text-[var(--success)]' : 
                    connectionStatus === 'error' ? 'text-[var(--danger)]' : 'text-[var(--text-secondary)]'
                  }`}>
                    {connectionStatus === 'success' && <Check className="w-3 h-3" />}
                    {connectionMessage}
                  </div>
                )}
                <p className="text-xs text-[var(--text-secondary)] mt-1.5">
                  Obtenez votre clé sur{' '}
                  <a href="https://elevenlabs.io" target="_blank" rel="noopener noreferrer"
                    className="text-[var(--gold)] hover:underline">
                    elevenlabs.io
                  </a>
                  {' '}(compte gratuit avec 10 000 caractères/mois).
                </p>
              </div>

              {/* Voice Selection */}
              <div>
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-1.5">
                  <Music className="w-3.5 h-3.5 inline mr-1.5" />
                  Voix par défaut
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-w-lg">
                  {voices.map((voice) => (
                    <button
                      key={voice.id}
                      type="button"
                      onClick={() => setSelectedVoiceId(voice.id)}
                      className={`flex items-center gap-3 p-3 rounded-[var(--radius-md)] border text-left transition-all ${
                        selectedVoiceId === voice.id
                          ? 'border-[var(--gold)] bg-[var(--gold)]/5 text-[var(--text-primary)]'
                          : 'border-[var(--border)] bg-[var(--surface-alt)] text-[var(--text-secondary)] hover:border-[var(--gold)]/30'
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        selectedVoiceId === voice.id
                          ? 'bg-gradient-to-br from-[var(--gold)] to-[var(--gold-dark)] text-white'
                          : 'bg-[var(--bg-card)] text-[var(--text-muted)] border border-[var(--border)]'
                      }`}>
                        <Volume2 className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{voice.name}</p>
                        <p className="text-[10px] text-[var(--text-muted)] capitalize">{voice.gender} — {voice.description}</p>
                      </div>
                      {selectedVoiceId === voice.id && (
                        <Check className="w-4 h-4 text-[var(--gold)] shrink-0" />
                      )}
                    </button>
                  ))}
                </div>
                {selectedVoice && (
                  <p className="text-xs text-[var(--text-secondary)] mt-1.5">
                    Voix sélectionnée : <strong className="text-[var(--text-primary)]">{selectedVoice.name}</strong> — {selectedVoice.description}
                  </p>
                )}
              </div>

              {/* Save ElevenLabs Config */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleSaveElevenLabs}
                  className="bd-btn-primary"
                >
                  {elevenLabsSaved ? (
                    <><Check className="w-4 h-4" /> Enregistré !</>
                  ) : (
                    <><Save className="w-4 h-4" /> Enregistrer la configuration vocale</>
                  )}
                </button>
                {getSpeakingStatus() && (
                  <span className="text-xs text-[var(--gold)] flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--gold)] animate-pulse-soft" />
                    Synthèse vocale active
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Preferences */}
          <div className="bd-card p-6">
            <div className="flex items-center gap-2 mb-4">
              <Sliders className="w-5 h-5 text-[var(--gold)]" />
              <h3 className="font-semibold text-[var(--text-primary)]">Préférences</h3>
            </div>

            <div className="space-y-5">
              {/* Notifications */}
              <div className="flex items-center justify-between">
                <div className="flex items-start gap-3">
                  <Bell className="w-4 h-4 text-[var(--text-secondary)] mt-0.5" />
                  <div>
                    <h4 className="text-sm font-medium text-[var(--text-primary)]">Notifications</h4>
                    <p className="text-xs text-[var(--text-secondary)]">Recevoir les alertes de nouveaux index FAISS</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setNotifications(!notifications)}
                  className={`relative w-11 h-6 rounded-full transition-colors ${
                    notifications ? 'bg-[var(--primary)]' : 'bg-[var(--border)]'
                  }`}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${
                      notifications ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Comparison Mode */}
              <div className="flex items-center justify-between">
                <div className="flex items-start gap-3">
                  <Palette className="w-4 h-4 text-[var(--text-secondary)] mt-0.5" />
                  <div>
                    <h4 className="text-sm font-medium text-[var(--text-primary)]">Mode Comparaison</h4>
                    <p className="text-xs text-[var(--text-secondary)]">Afficher systématiquement Baseline vs Fine-tuné</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setComparisonMode(!comparisonMode)}
                  className={`relative w-11 h-6 rounded-full transition-colors ${
                    comparisonMode ? 'bg-[var(--primary)]' : 'bg-[var(--border)]'
                  }`}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${
                      comparisonMode ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Auto Index */}
              <div className="flex items-center justify-between">
                <div className="flex items-start gap-3">
                  <Globe className="w-4 h-4 text-[var(--text-secondary)] mt-0.5" />
                  <div>
                    <h4 className="text-sm font-medium text-[var(--text-primary)]">Indexation automatique</h4>
                    <p className="text-xs text-[var(--text-secondary)]">Indexer automatiquement le code généré dans FAISS</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setAutoIndex(!autoIndex)}
                  className={`relative w-11 h-6 rounded-full transition-colors ${
                    autoIndex ? 'bg-[var(--primary)]' : 'bg-[var(--border)]'
                  }`}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${
                      autoIndex ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Save */}
          <div className="flex justify-end">
            <button type="submit" className="bd-btn-primary px-8 py-3">
              {saved ? (
                <><Check className="w-4 h-4" /> Enregistré !</>
              ) : (
                <><Save className="w-4 h-4" /> Enregistrer les modifications</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
    </PageLayout>
  );
}

