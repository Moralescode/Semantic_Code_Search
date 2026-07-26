'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send, Bot, User, Loader2, Search, Sparkles,
  ThumbsUp, Copy, Volume2, VolumeX,
} from 'lucide-react';
import axios from 'axios';
import PageLayout from '@/components/PageLayout';
import {
  speakCopilotResponse,
  getSpeakingStatus,
  cancelSpeaking,
  getStoredVoiceId,
} from '@/lib/ElevenLabsService';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

function renderMarkdown(text: string): React.ReactNode[] {
  const lines = text.split('\n');
  const elements: React.ReactNode[] = [];
  let inCodeBlock = false;
  let codeContent = '';
  let codeLang = '';
  let codeKey = 0;

  const flushCodeBlock = () => {
    if (codeContent) {
      elements.push(
        <div key={`code-${codeKey++}`} className="code-block my-3">
          {codeLang && (
            <div className="code-block-header">
              <span>{codeLang}</span>
              <button className="flex items-center gap-1 text-white/40 hover:text-white/70 text-xs">
                <Copy className="w-3 h-3" /> Copier
              </button>
            </div>
          )}
          <div className="code-block-content">
            <pre><code>{codeContent}</code></pre>
          </div>
        </div>
      );
      codeContent = '';
      codeLang = '';
    }
  };

  lines.forEach((line, i) => {
    if (line.trim().startsWith('```')) {
      if (inCodeBlock) {
        flushCodeBlock();
        inCodeBlock = false;
      } else {
        flushCodeBlock();
        inCodeBlock = true;
        codeLang = line.trim().slice(3).trim();
      }
      return;
    }

    if (inCodeBlock) {
      codeContent += line + '\n';
      return;
    }

    const headingMatch = line.match(/^###\s+(.+)/);
    if (headingMatch) {
      elements.push(
        <h3 key={i} className="text-md font-semibold text-[var(--text-primary)] mt-5 mb-2">{headingMatch[1]}</h3>
      );
      return;
    }

    if (line.trim() === '---') {
      elements.push(<hr key={i} className="my-4 border-[var(--border)]" />);
      return;
    }

    const listMatch = line.match(/^(\s*)[*-]\s+(.+)/);
    if (listMatch) {
      const indent = listMatch[1].length;
      elements.push(
        <div key={i} className={`flex items-start gap-2 my-1.5 ${indent > 0 ? 'ml-6' : ''}`}>
          <span className="text-[var(--gold)] mt-1 shrink-0">•</span>
          <span className="text-sm text-[var(--text-secondary)]">{renderInline(listMatch[2])}</span>
        </div>
      );
      return;
    }

    if (line.trim()) {
      elements.push(
        <p key={i} className="text-sm text-[var(--text-secondary)] my-1.5 leading-relaxed">{renderInline(line)}</p>
      );
    } else {
      elements.push(<div key={i} className="h-2" />);
    }
  });

  flushCodeBlock();
  return elements;
}

function renderInline(text: string): React.ReactNode {
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  const regex = /(\*\*(.+?)\*\*|\*(.+?)\*|`([^`]+)`)/g;
  let match;
  let key = 0;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(<span key={key++}>{text.slice(lastIndex, match.index)}</span>);
    }
    if (match[2]) {
      parts.push(<strong key={key++} className="font-semibold text-[var(--text-primary)]">{match[2]}</strong>);
    } else if (match[3]) {
      parts.push(<em key={key++} className="italic">{match[3]}</em>);
    } else if (match[4]) {
      parts.push(
        <code key={key++} className="bg-[var(--surface-alt)] text-[var(--gold)] px-1.5 py-0.5 rounded text-xs font-mono">
          {match[4]}
        </code>
      );
    }
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    parts.push(<span key={key++}>{text.slice(lastIndex)}</span>);
  }

  return <>{parts}</>;
}

const SUGGESTED_QUESTIONS = [
  { label: '📱 Valider téléphone CI', text: 'Comment valider un numéro de téléphone en Côte d\'Ivoire ?' },
  { label: '💰 Calculer TVA 18%', text: 'Comment calculer la TVA au taux de 18% ?' },
  { label: '💵 Formater Franc CFA', text: 'Comment formater un montant en Franc CFA (XOF) ?' },
  { label: '🔐 Signature HMAC', text: 'Comment générer une signature HMAC sécurisée ?' },
  { label: '📊 Parser CSV', text: 'Comment parser un fichier CSV de transactions ?' },
];

export default function CopilotPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content: `🤖 **CodeMind CoPilot — RAG Actif**

Bonjour ! Je suis votre assistant intelligent connecté à l'index FAISS du dépôt NexaTech.

🔍 **Je peux vous aider à :**
- Retrouver les fonctions pertinentes dans notre base de code
- Expliquer comment utiliser les utilitaires
- Vous donner des extraits de code avec leur contexte métier

💡 *Posez votre question ou cliquez sur une suggestion ci-dessous.*`
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingStage, setLoadingStage] = useState<'idle' | 'searching' | 'generating'>('idle');
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, loadingStage, scrollToBottom]);

  const handleSend = async (messageText?: string) => {
    const text = (messageText || input).trim();
    if (!text || loading) return;

    const userMessage: ChatMessage = { role: 'user', content: text };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);
    setLoadingStage('searching');

    try {
      const history = messages.map(m => ({ role: m.role, content: m.content }));
      const res = await axios.post(`${BASE_URL}/copilot_chat`, {
        message: text,
        history: history
      });
      const assistantMessage: ChatMessage = { role: 'assistant', content: res.data.response };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (err) {
      const errorMessage: ChatMessage = {
        role: 'assistant',
        content: '❌ **Erreur de connexion** à l\'assistant. Vérifiez que le backend FastAPI est lancé.'
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
      setLoadingStage('idle');
    }
  };

  const handleSuggested = (text: string) => {
    handleSend(text);
  };

  return (
    <PageLayout title="CoPilot" subtitle="Assistant RAG">
    <div className="min-h-screen bg-[var(--bg-main)] flex">
      <div className="flex-1 flex flex-col max-w-5xl mx-auto w-full px-4 py-6 lg:py-8">
        {/* Page Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-1">
            <div className="bd-badge bd-badge-gold">CoPilot</div>
          </div>
          <h1 className="text-3xl font-bold text-[var(--text-primary)]">CodeMind CoPilot</h1>
          <p className="text-[var(--text-secondary)] mt-1 text-sm">
            Assistant RAG connecté à l&apos;index FAISS du dépôt de code.
          </p>
        </div>

        {/* Chat Card */}
        <div className="bd-card flex flex-col flex-1 min-h-[600px]">
          {/* Status bar */}
          <div className="px-6 py-3 border-b border-[var(--border)] bg-[var(--surface-hover)]/50 flex items-center gap-2 text-xs text-[var(--text-secondary)]">
            <Search className="w-3 h-3 text-[var(--gold)]" />
            <span>Recherche contextuelle dans <strong className="text-[var(--text-primary)]">100+</strong> fonctions indexées par <strong className="text-[var(--text-primary)]">FAISS</strong></span>
            <span className="ml-auto flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--success)] animate-pulse-soft" />
              <span className="text-[10px] text-[var(--text-muted)]">En ligne</span>
            </span>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4 bd-scrollbar">
            {messages.map((msg, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className={`flex items-start gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex items-start gap-3 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                  {/* Avatar */}
                  <div className={`shrink-0 w-9 h-9 rounded-full flex items-center justify-center ${
                    msg.role === 'user'
                      ? 'bg-gradient-to-br from-[var(--primary)] to-[var(--primary-dark)] text-white'
                      : 'bg-gradient-to-br from-[var(--gold)]/20 to-[var(--gold)]/5 text-[var(--gold)] border border-[var(--gold)]/20'
                  }`}>
                    {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                  </div>

                  {/* Bubble */}
                  <div className={`p-4 rounded-[var(--radius-lg)] text-sm ${
                    msg.role === 'user'
                      ? 'bg-gradient-to-br from-[var(--primary)] to-[var(--primary-dark)] text-white shadow-lg'
                      : 'bg-[var(--bg-card)] border border-[var(--border)] shadow-sm'
                  }`}>
                    {msg.role === 'assistant' ? (
                      <div className="bd-prose">{renderMarkdown(msg.content)}</div>
                    ) : (
                      <p>{msg.content}</p>
                    )}

                    {/* Message actions */}
                    {msg.role === 'assistant' && idx > 0 && (
                      <div className="flex items-center gap-3 mt-3 pt-3 border-t border-[var(--border)]">
                        <button
                          onClick={() => {
                            if (getSpeakingStatus()) {
                              cancelSpeaking();
                            } else {
                              speakCopilotResponse(msg.content, getStoredVoiceId());
                            }
                          }}
                          className={`flex items-center gap-1 text-[10px] transition-colors ${
                            getSpeakingStatus()
                              ? 'text-[var(--gold)]'
                              : 'text-[var(--text-muted)] hover:text-[var(--gold)]'
                          }`}
                          title={getSpeakingStatus() ? 'Arrêter la lecture' : 'Écouter la réponse'}
                        >
                          {getSpeakingStatus() ? (
                            <><Volume2 className="w-3 h-3 animate-pulse-soft" /> Lecture...</>
                          ) : (
                            <><Volume2 className="w-3 h-3" /> Écouter</>
                          )}
                        </button>
                        <button className="flex items-center gap-1 text-[10px] text-[var(--text-muted)] hover:text-[var(--gold)] transition-colors">
                          <ThumbsUp className="w-3 h-3" /> Utile
                        </button>
                        <button className="flex items-center gap-1 text-[10px] text-[var(--text-muted)] hover:text-[var(--gold)] transition-colors">
                          <Copy className="w-3 h-3" /> Copier
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}

            {/* Loading indicator */}
            {loading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-start gap-3"
              >
                <div className="shrink-0 w-9 h-9 rounded-full flex items-center justify-center bg-gradient-to-br from-[var(--gold)]/20 to-[var(--gold)]/5 text-[var(--gold)] border border-[var(--gold)]/20">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="p-4 rounded-[var(--radius-lg)] bg-[var(--bg-card)] border border-[var(--border)] shadow-sm min-w-[250px]">
                  <div className="flex items-center gap-2.5">
                    <Loader2 className="w-4 h-4 animate-spin text-[var(--gold)]" />
                    <span className="text-sm text-[var(--text-secondary)]">
                      {loadingStage === 'searching' ? (
                        <>Recherche dans l&apos;index <strong>FAISS</strong>...</>
                      ) : (
                        <>Génération de la réponse <strong>CoPilot</strong>...</>
                      )}
                    </span>
                  </div>
                  <div className="mt-3 h-1.5 bg-[var(--surface-alt)] rounded-full overflow-hidden">
                    <motion.div
                      className="h-full rounded-full gradient-gold"
                      animate={{ width: loadingStage === 'searching' ? '33%' : '66%' }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>
                </div>
              </motion.div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Suggested questions */}
          {messages.length <= 2 && !loading && (
            <div className="px-6 py-4 border-t border-[var(--border)] bg-[var(--surface-hover)]/30">
              <p className="text-xs font-medium text-[var(--text-secondary)] mb-2.5 flex items-center gap-1.5">
                <Sparkles className="w-3 h-3 text-[var(--gold)]" />
                Questions suggérées
              </p>
              <div className="flex flex-wrap gap-2">
                {SUGGESTED_QUESTIONS.map((q, i) => (
                  <button
                    key={i}
                    onClick={() => handleSuggested(q.text)}
                    className="px-3.5 py-2 bg-[var(--bg-card)] hover:bg-[var(--surface-hover)] border border-[var(--border)] rounded-full text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--gold)]/30 transition-all"
                  >
                    {q.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div className="p-4 border-t border-[var(--border)] bg-[var(--bg-card)]">
            <div className="flex gap-3">
              <input
                type="text"
                className="bd-input"
                placeholder="Posez votre question sur le code du dépôt..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
              />
              <button
                onClick={() => handleSend()}
                disabled={loading || !input.trim()}
                className="bd-btn-primary px-6"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
                <span className="hidden sm:inline">Envoyer</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
    </PageLayout>
  );
}
