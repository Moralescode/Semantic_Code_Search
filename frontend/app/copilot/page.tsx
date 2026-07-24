'use client';

import React, { useState, useEffect, useCallback } from 'react';
import PageLayout from '../../components/PageLayout';
import { Send, Bot, User, Loader2, Search, Code, FileText, RefreshCw } from 'lucide-react';
import axios from 'axios';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

// Petit renderer Markdown sans dépendance externe
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
        <pre key={`code-${codeKey++}`} className="bg-[#0b1f33] text-gray-100 p-4 rounded-xl text-xs overflow-x-auto whitespace-pre my-2">
          {codeContent}
        </pre>
      );
      codeContent = '';
      codeLang = '';
    }
  };

  lines.forEach((line, i) => {
    // Code blocks ```
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

    // Titres ###
    const headingMatch = line.match(/^###\s+(.+)/);
    if (headingMatch) {
      elements.push(
        <h3 key={i} className="text-md font-semibold text-[#0b1f33] mt-4 mb-2">{headingMatch[1]}</h3>
      );
      return;
    }

    // Ligne de séparation ---
    if (line.trim() === '---') {
      elements.push(<hr key={i} className="my-3 border-[#e3e8ee]" />);
      return;
    }

    // Items de liste avec - ou *
    const listMatch = line.match(/^(\s*)[*-]\s+(.+)/);
    if (listMatch) {
      const indent = listMatch[1].length;
      elements.push(
        <div key={i} className={`flex items-start gap-2 my-1 ${indent > 0 ? 'ml-6' : ''}`}>
          <span className="text-[#c5a55a] mt-1">•</span>
          <span className="text-sm text-[#142938]">{renderInline(listMatch[2])}</span>
        </div>
      );
      return;
    }

    // Ligne normale
    if (line.trim()) {
      elements.push(
        <p key={i} className="text-sm text-[#142938] my-1 leading-relaxed">{renderInline(line)}</p>
      );
    } else {
      elements.push(<div key={i} className="h-2" />);
    }
  });

  flushCodeBlock();
  return elements;
}

function renderInline(text: string): React.ReactNode {
  // Remplacer **gras** et *italique* et `code inline`
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
      parts.push(<strong key={key++} className="font-semibold">{match[2]}</strong>);
    } else if (match[3]) {
      parts.push(<em key={key++} className="italic">{match[3]}</em>);
    } else if (match[4]) {
      parts.push(<code key={key++} className="bg-[#e3e8ee] text-[#0b1f33] px-1.5 py-0.5 rounded text-xs font-mono">{match[4]}</code>);
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
- Retrouver les **fonctions** pertinentes dans notre base de code (100+ fonctions indexées)
- Expliquer comment utiliser les **utilitaires** (validation téléphone, TVA, CFA, HMAC...)
- Vous donner des **extraits de code** avec leur contexte métier

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
        content: '❌ **Erreur de connexion** à l\'assistant. Vérifiez que le backend FastAPI est lancé (`uvicorn app.main:app --reload`).'
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
    <PageLayout title="CodeMind CoPilot" subtitle="Assistant RAG connecté à l'index FAISS du dépôt de code.">
      <div className="mck-section">
        <div className="mck-container">
          <div className="mck-card flex flex-col h-[calc(100vh-200px)]">
            {/* Header info */}
            <div className="px-6 py-3 border-b border-[#e3e8ee] bg-[#f6f8fb]/50 flex items-center gap-2 text-xs text-[#5b6b7a]">
              <Search className="w-3 h-3 text-[#c5a55a]" />
              <span>Recherche contextuelle dans <strong>{'100+'}</strong> fonctions indexées par <strong>FAISS</strong></span>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 mck-scrollbar">
              {messages.map((msg, idx) => (
                <div key={idx} className={`flex items-start gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`flex items-start gap-3 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                    <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                      msg.role === 'user' ? 'bg-[#0b1f33] text-white' : 'bg-[#f6f8fb] text-[#c5a55a]'
                    }`}>
                      {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                    </div>
                    <div className={`p-4 rounded-xl text-sm ${
                      msg.role === 'user'
                        ? 'bg-[#0b1f33] text-white'
                        : 'bg-[#f6f8fb] text-[#142938]'
                    }`}>
                      {msg.role === 'assistant' ? (
                        <div className="prose-custom">{renderMarkdown(msg.content)}</div>
                      ) : (
                        <p>{msg.content}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {/* Loader progressif */}
              {loading && (
                <div className="flex items-start gap-3">
                  <div className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-[#f6f8fb] text-[#c5a55a]">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div className="p-4 rounded-xl text-sm bg-[#f6f8fb] text-[#142938] min-w-[200px]">
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin text-[#c5a55a]" />
                      <span>
                        {loadingStage === 'searching' ? (
                          <>🔍 Recherche dans l'index <strong>FAISS</strong>...</>
                        ) : (
                          <>🧠 Génération de la réponse <strong>CoPilot</strong>...</>
                        )}
                      </span>
                    </div>
                    {/* Barre de progression animée */}
                    <div className="mt-3 h-1 bg-[#e3e8ee] rounded-full overflow-hidden">
                      <div className={`h-full bg-[#c5a55a] rounded-full transition-all duration-1000 ${
                        loadingStage === 'searching' ? 'w-1/3' : 'w-2/3'
                      }`} />
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Suggested questions chips */}
            {messages.length <= 2 && !loading && (
              <div className="px-6 py-3 border-t border-[#e3e8ee] bg-white">
                <p className="text-xs font-medium text-[#5b6b7a] mb-2">💡 Questions suggérées :</p>
                <div className="flex flex-wrap gap-2">
                  {SUGGESTED_QUESTIONS.map((q, i) => (
                    <button
                      key={i}
                      onClick={() => handleSuggested(q.text)}
                      className="px-3 py-1.5 bg-[#f6f8fb] hover:bg-[#e3e8ee] border border-[#e3e8ee] rounded-full text-xs text-[#142938] transition whitespace-nowrap"
                    >
                      {q.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input */}
            <div className="p-4 border-t border-[#e3e8ee] bg-white">
              <div className="flex gap-3">
                <input
                  type="text"
                  className="mck-input flex-1"
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
                  className="mck-btn-primary"
                >
                  <Send className="w-4 h-4" />
                  <span>Envoyer</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}

