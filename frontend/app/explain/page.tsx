'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Lightbulb, Loader2, Code2, BookOpen, Copy, Check, Sparkles, Volume2, VolumeX } from 'lucide-react';
import PageLayout from '@/components/PageLayout';
import {
  speakExplanation,
  getSpeakingStatus,
  cancelSpeaking,
  getStoredVoiceId,
} from '@/lib/ElevenLabsService';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export default function ExplainPage() {
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('python');
  const [name, setName] = useState('');
  const [docstring, setDocstring] = useState('');
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleExplain = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch(`${BASE_URL}/explain`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name || 'function', language, code, docstring }),
      });
      const data = await res.json();
      setResult(data.explanation);
    } catch (err) {
      console.error(err);
      setResult('❌ Erreur de connexion au backend. Vérifiez que le serveur FastAPI est lancé.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (result) {
      navigator.clipboard.writeText(result);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const examples = [
    { name: 'validate_phone', lang: 'python', code: 'def validate_ci_phone(phone: str) -> bool:\n    import re\n    cleaned = re.sub(r\'\\s+|-|\', \'\', phone)\n    pattern = r\'^(?:\\+225|225)?(01|05|07)\\d{8}$\'\n    return bool(re.match(pattern, cleaned))', desc: 'Valider un numéro téléphone CI' },
    { name: 'format_xof', lang: 'python', code: 'def format_xof(amount: float) -> str:\n    """Formate un montant en Franc CFA."""\n    return f"{amount:,.0f} XOF".replace(",", " ")', desc: 'Formater un montant XOF' },
  ];

  return (
    <PageLayout title="Explain" subtitle="Explication de code par IA">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left : Input */}
          <div className="bd-card p-6 space-y-5">
            <div className="flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-[var(--gold)]" />
              <h3 className="font-semibold text-[var(--text-primary)]">Code à expliquer</h3>
            </div>

            <form onSubmit={handleExplain} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-[var(--text-secondary)] mb-1 block">Nom fonction</label>
                  <input type="text" className="bd-input" placeholder="ma_fonction" value={name} onChange={(e) => setName(e.target.value)} />
                </div>
                <div>
                  <label className="text-xs font-medium text-[var(--text-secondary)] mb-1 block">Langage</label>
                  <select className="bd-select" value={language} onChange={(e) => setLanguage(e.target.value)}>
                    {['python', 'javascript', 'java', 'go', 'php', 'ruby'].map(l => <option key={l} value={l}>{l}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-[var(--text-secondary)] mb-1 block">Docstring (optionnel)</label>
                <input type="text" className="bd-input" placeholder="Description courte..." value={docstring} onChange={(e) => setDocstring(e.target.value)} />
              </div>

              <div>
                <label className="text-xs font-medium text-[var(--text-secondary)] mb-1 block">Code source</label>
                <textarea className="bd-input font-mono text-xs min-h-[200px] resize-y" placeholder="Collez votre code ici..." value={code} onChange={(e) => setCode(e.target.value)} />
              </div>

              <button type="submit" disabled={loading || !code.trim()} className="bd-btn-primary w-full justify-center py-3">
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Lightbulb className="w-5 h-5" />}
                {loading ? 'Analyse en cours...' : 'Expliquer le code'}
              </button>
            </form>

            {/* Exemples */}
            <div className="pt-4 border-t border-[var(--border)]">
              <p className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-3">Exemples rapides</p>
              <div className="space-y-2">
                {examples.map((ex, i) => (
                  <button key={i} onClick={() => { setCode(ex.code); setLanguage(ex.lang); setName(ex.name); setDocstring(ex.desc); }}
                    className="w-full flex items-center gap-3 p-3 rounded-[var(--radius-md)] bg-[var(--surface-alt)] hover:bg-[var(--surface-hover)] border border-[var(--border)] transition-all text-left group">
                    <Code2 className="w-4 h-4 text-[var(--gold)] shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[var(--text-primary)] truncate">{ex.name}</p>
                      <p className="text-xs text-[var(--text-secondary)]">{ex.desc}</p>
                    </div>
                    <Sparkles className="w-3.5 h-3.5 text-[var(--text-muted)] group-hover:text-[var(--gold)] transition-colors" />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right : Result */}
          <div className="bd-card p-6 space-y-5">
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-[var(--gold)]" />
              <h3 className="font-semibold text-[var(--text-primary)]">Explication</h3>
            </div>

            {loading ? (
              <div className="space-y-4">
                {[...Array(4)].map((_, i) => <div key={i} className="h-6 rounded-[var(--radius-md)] bd-skeleton" style={{ width: `${60 + i * 10}%` }} />)}
                <div className="flex items-center gap-2 mt-4 text-sm text-[var(--text-muted)]">
                  <Loader2 className="w-4 h-4 animate-spin text-[var(--gold)]" />
                  Analyse sémantique du code...
                </div>
              </div>
            ) : result ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">Explication générée par l'IA</span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        if (getSpeakingStatus()) {
                          cancelSpeaking();
                        } else {
                          speakExplanation(result, getStoredVoiceId());
                        }
                      }}
                      className={`flex items-center gap-1 text-xs transition-colors rounded-[var(--radius-sm)] px-2 py-1 ${
                        getSpeakingStatus()
                          ? 'bg-[var(--gold)]/10 text-[var(--gold)] animate-pulse-soft'
                          : 'text-[var(--text-secondary)] hover:text-[var(--gold)] hover:bg-[var(--gold)]/5'
                      }`}
                      title={getSpeakingStatus() ? 'Arrêter la lecture' : 'Écouter l\'explication'}
                    >
                      {getSpeakingStatus() ? (
                        <><Volume2 className="w-3 h-3" /> Lecture...</>
                      ) : (
                        <><Volume2 className="w-3 h-3" /> Écouter</>
                      )}
                    </button>
                    <span className="text-[var(--border)] mx-1">|</span>
                    <button onClick={handleCopy} className="flex items-center gap-1 text-xs text-[var(--text-secondary)] hover:text-[var(--gold)] transition-colors">
                      {copied ? <><Check className="w-3 h-3 text-[var(--success)]" /> Copié</> : <><Copy className="w-3 h-3" /> Copier</>}
                    </button>
                  </div>
                </div>
                <div className="prose prose-sm max-w-none">
                  <div className="bd-prose">
                    {result.split('\n').map((line, i) => {
                      if (line.trim().startsWith('**') && line.trim().endsWith('**')) {
                        return <h3 key={i} className="text-[var(--text-primary)] font-semibold mt-4 mb-2">{line.replace(/\*\*/g, '')}</h3>;
                      }
                      if (line.trim().startsWith('- ')) {
                        return <li key={i} className="text-sm text-[var(--text-secondary)] ml-4">{line.replace('- ', '')}</li>;
                      }
                      if (line.trim() === '') return <br key={i} />;
                      return <p key={i} className="text-sm text-[var(--text-secondary)]">{line}</p>;
                    })}
                  </div>
                </div>
              </div>
            ) : (
              <div className="bd-empty !py-16">
                <div className="bd-empty-icon"><Lightbulb className="w-7 h-7 text-[var(--gold)]" /></div>
                <h3>En attente d'explication</h3>
                <p>Collez du code dans le panneau de gauche et cliquez sur "Expliquer le code".</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </PageLayout>
  );
}

