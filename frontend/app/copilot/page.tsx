'use client';

import React, { useState, useEffect } from 'react';
import PageLayout from '../../components/PageLayout';
import { Send, Bot, User, Loader2 } from 'lucide-react';
import axios from 'axios';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export default function CopilotPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'assistant', content: "Bonjour ! Je suis CodeMind CoPilot. Je connais l'ensemble de notre référentiel de code (CFA, TVA, ARTCI, HMAC). Posez-moi vos questions !" }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage: ChatMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const history = messages.map(m => ({ role: m.role, content: m.content }));
      const res = await axios.post(`${BASE_URL}/copilot_chat`, {
        message: input,
        history: history
      });
      const assistantMessage: ChatMessage = { role: 'assistant', content: res.data.response };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (err) {
      const errorMessage: ChatMessage = { role: 'assistant', content: 'Erreur de connexion à l\'assistant. Veuillez réessayer.' };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageLayout title="CodeMind CoPilot" subtitle="Discutez en direct avec votre référentiel de code.">
      <div className="mck-section">
        <div className="mck-container">
          <div className="mck-card flex flex-col h-[calc(100vh-200px)]">
            <div className="flex-1 overflow-y-auto p-6 space-y-4 mck-scrollbar">
              {messages.map((msg, idx) => (
                <div key={idx} className={`flex items-start gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`flex items-start gap-3 max-w-[80%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                    <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${msg.role === 'user' ? 'bg-[#0b1f33] text-white' : 'bg-[#f6f8fb] text-[#c5a55a]'}`}>
                      {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                    </div>
                    <div className={`p-4 rounded-xl text-sm whitespace-pre-wrap ${msg.role === 'user' ? 'bg-[#0b1f33] text-white' : 'bg-[#f6f8fb] text-[#142938]'}`}>
                      {msg.content}
                    </div>
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex items-start gap-3">
                  <div className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-[#f6f8fb] text-[#c5a55a]">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div className="p-4 rounded-xl text-sm bg-[#f6f8fb] text-[#142938]">
                    <Loader2 className="w-4 h-4 animate-spin inline mr-2" />
                    Réflexion de CoPilot...
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="p-4 border-t border-[#e3e8ee]">
              <div className="flex gap-3">
                <input
                  type="text"
                  className="mck-input flex-1"
                  placeholder="Posez votre question..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                />
                <button onClick={handleSend} disabled={loading} className="mck-btn-primary">
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