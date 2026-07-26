'use client';

import React from 'react';
import { Loader2, Search, Bot, Sparkles } from 'lucide-react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'default' | 'gold' | 'primary' | 'success';
  message?: string;
  fullPage?: boolean;
}

const SIZE_MAP: Record<string, string> = {
  sm: 'w-4 h-4',
  md: 'w-6 h-6',
  lg: 'w-8 h-8',
  xl: 'w-12 h-12',
};

const VARS: Record<string, string> = {
  default: 'text-[var(--primary)]',
  gold: 'text-[var(--gold)]',
  primary: 'text-[var(--primary)]',
  success: 'text-[var(--success)]',
};

export default function LoadingSpinner(props: LoadingSpinnerProps) {
  const { size = 'md', variant = 'gold', message, fullPage = false } = props;
  const sz = SIZE_MAP[size] || 'w-6 h-6';
  const clr = VARS[variant] || 'text-[var(--gold)]';

  const inner = (
    <div className="flex flex-col items-center justify-center gap-3">
      <div className="relative">
        <Loader2 className={sz + ' animate-spin ' + clr} />
        <div className="absolute inset-0 flex items-center justify-center animate-ping opacity-40" style={{ animationDuration: '1.5s' }}>
          <div className={((size === 'sm') ? 'w-1 h-1' : 'w-1.5 h-1.5') + ' rounded-full ' + clr} style={{ backgroundColor: 'currentColor' }} />
        </div>
      </div>
      {message && <p className="text-sm text-[var(--text-secondary)] animate-pulse-soft">{message}</p>}
    </div>
  );

  if (fullPage) {
    return <div className="min-h-screen bg-[var(--bg-main)] flex items-center justify-center">{inner}</div>;
  }
  return inner;
}

export function SpinnerIcon() {
  return (
    <svg className="animate-spin h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
    </svg>
  );
}

export function LoadingState(props: { message?: string }) {
  const message = props.message || 'Chargement en cours...';
  return (
    <div className="flex flex-col items-center justify-center py-12 gap-3">
      <div className="relative">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--gold)]" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-2 h-2 rounded-full bg-[var(--gold)] animate-ping" />
        </div>
      </div>
      <p className="text-sm text-[var(--text-secondary)] animate-pulse-soft">{message}</p>
    </div>
  );
}

export function SearchLoadingState() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-center gap-6 mb-6">
        <div className="flex flex-col items-center gap-1.5">
          <div className="w-10 h-10 rounded-[var(--radius-md)] flex items-center justify-center animate-pulse-soft" style={{ backgroundColor: 'rgba(43, 54, 116, 0.08)' }}>
            <Search className="w-5 h-5" style={{ color: 'var(--primary)' }} />
          </div>
          <span className="text-[10px] text-[var(--text-muted)] font-medium">Analyse</span>
        </div>
        <div className="w-10 h-px bg-gradient-to-r from-[var(--gold)]/30 to-[var(--gold)]/10" />
        <div className="flex flex-col items-center gap-1.5">
          <div className="w-10 h-10 rounded-[var(--radius-md)] flex items-center justify-center animate-pulse-soft" style={{ backgroundColor: 'rgba(197, 165, 90, 0.08)' }}>
            <Bot className="w-5 h-5" style={{ color: 'var(--gold)' }} />
          </div>
          <span className="text-[10px] text-[var(--text-muted)] font-medium">Recherche</span>
        </div>
        <div className="w-10 h-px bg-gradient-to-r from-[var(--gold)]/30 to-[var(--gold)]/10" />
        <div className="flex flex-col items-center gap-1.5">
          <div className="w-10 h-10 rounded-[var(--radius-md)] flex items-center justify-center animate-pulse-soft" style={{ backgroundColor: 'rgba(5, 205, 153, 0.08)' }}>
            <Sparkles className="w-5 h-5" style={{ color: 'var(--success)' }} />
          </div>
          <span className="text-[10px] text-[var(--text-muted)] font-medium">Resultats</span>
        </div>
      </div>
      <div className="space-y-3">
        {Array.from({ length: 3 }, (_, i) => (
          <div key={i} className="animate-fadeIn rounded-[var(--radius-lg)] bg-[var(--bg-card)] border border-[var(--border)] p-5" style={{ animationDelay: i * 100 + 'ms', boxShadow: 'var(--shadow-card)' }}>
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-[var(--radius-md)] shimmer shrink-0" />
              <div className="flex-1 space-y-2.5">
                <div className="h-4 shimmer w-3/4 rounded" />
                <div className="h-3 shimmer w-full rounded" />
                <div className="flex gap-2">
                  <div className="h-5 shimmer w-16 rounded-md" />
                  <div className="h-5 shimmer w-20 rounded-md" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function CopilotLoadingState(props: { stage: 'searching' | 'generating' }) {
  const stage = props.stage;
  return (
    <div className="flex items-start gap-3">
      <div className="shrink-0 w-9 h-9 rounded-full flex items-center justify-center bg-gradient-to-br from-[var(--gold)]/20 to-[var(--gold)]/5 text-[var(--gold)] border border-[var(--gold)]/20">
        <Bot className="w-4 h-4" />
      </div>
      <div className="p-4 rounded-[var(--radius-lg)] bg-[var(--bg-card)] border border-[var(--border)] min-w-[280px]" style={{ boxShadow: 'var(--shadow-sm)' }}>
        <div className="flex items-center gap-3 mb-3">
          <div className="relative">
            <Loader2 className="w-5 h-5 animate-spin text-[var(--gold)]" />
          </div>
          <div>
            <p className="text-sm font-medium text-[var(--text-primary)]">
              {stage === 'searching' ? 'Recherche dans FAISS' : 'Generation de la reponse'}
            </p>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">
              {stage === 'searching' ? "Parcours de l'index vectoriel..." : 'Assemblage du contexte RAG...'}
            </p>
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-[var(--gold)] animate-pulse-soft" />
            <div className="h-2 rounded-full shimmer flex-1" style={{ width: '80%' }} />
          </div>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-[var(--primary)] animate-pulse-soft" />
            <div className="h-2 rounded-full shimmer flex-1" style={{ width: '60%' }} />
          </div>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-[var(--success)] animate-pulse-soft" />
            <div className="h-2 rounded-full shimmer flex-1" style={{ width: '40%' }} />
          </div>
        </div>
      </div>
    </div>
  );
}

export function PageLoadingState() {
  return (
    <div className="min-h-screen bg-[var(--bg-main)] p-6 lg:p-8">
      <div className="max-w-5xl mx-auto">
        <div className="space-y-6">
          <div className="space-y-3 mb-8">
            <div className="h-4 shimmer w-24 rounded" />
            <div className="h-8 shimmer w-64 rounded" />
            <div className="h-4 shimmer w-96 rounded" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {Array.from({ length: 4 }, (_, i) => (
              <div key={i} className="h-32 rounded-[var(--radius-lg)] shimmer" />
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {Array.from({ length: 2 }, (_, i) => (
              <div key={i} className="h-80 rounded-[var(--radius-lg)] shimmer" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}