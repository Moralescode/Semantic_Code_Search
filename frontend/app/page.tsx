'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Key, ShieldCheck, UserPlus, LogIn, User, Brain, Code } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('Junior Dev');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    console.log('Login attempt', email, password);
    if (email === 'diallo@nexatech.ci' && password === 'diallo2026') {
      localStorage.setItem('user', JSON.stringify({ name: 'M. Diallo', role: 'Tech Lead', email }));
      router.push('/dashboard');
      console.log('Redirecting to /dashboard');
    } else if (email === 'kofi@nexatech.ci' && password === 'kofi2026') {
      localStorage.setItem('user', JSON.stringify({ name: 'Kofi', role: 'Python Dev', email }));
      router.push('/search');
    } else if (email === 'amina@nexatech.ci' && password === 'amina2026') {
      localStorage.setItem('user', JSON.stringify({ name: 'Amina', role: 'Junior Dev', email }));
      router.push('/onboarding');
    } else {
      setError('Identifiants incorrects.');
    }
  };

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!name || !email || !password) {
      setError('Tous les champs sont obligatoires.');
      return;
    }
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    if (users.find((u: any) => u.email === email)) {
      setError('Cette adresse email possède déjà un compte CodeMind.');
      return;
    }
    const newUser = { name, email, password, role };
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    localStorage.setItem('user', JSON.stringify({ name, role, email }));
    router.push('/search');
  };

  const handleQuickLogin = (emailStr: string, passStr: string) => {
    setEmail(emailStr);
    setPassword(passStr);
    setMode('login');
    setError('');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f6f8fb] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-semibold text-[#0b1f33] tracking-tight">🧠 CodeMind</h1>
          <p className="mt-2 text-sm text-[#5b6b7a]">Plateforme Sémantique & IA — NexaTech Solutions</p>
        </div>

        <div className="mck-card p-8">
          <div className="flex mb-6 border-b border-[#e3e8ee]">
            <button
              onClick={() => { setMode('login'); setError(''); }}
              className={`flex-1 pb-3 text-sm font-medium transition ${mode === 'login' ? 'text-[#0b1f33] border-b-2 border-[#c5a55a]' : 'text-[#5b6b7a]'}`}
            >
              <LogIn className="w-4 h-4 inline mr-1" /> Connexion
            </button>
            <button
              onClick={() => { setMode('signup'); setError(''); }}
              className={`flex-1 pb-3 text-sm font-medium transition ${mode === 'signup' ? 'text-[#0b1f33] border-b-2 border-[#c5a55a]' : 'text-[#5b6b7a]'}`}
            >
              <UserPlus className="w-4 h-4 inline mr-1" /> Inscription
            </button>
          </div>

          {mode === 'login' ? (
            <form className="space-y-6" onSubmit={handleLogin}>
              {error && <div className="text-red-600 text-sm text-center font-medium">{error}</div>}
              <div className="space-y-4">
                <input
                  type="email"
                  required
                  className="mck-input"
                  placeholder="Adresse email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <input
                  type="password"
                  required
                  className="mck-input"
                  placeholder="Mot de passe"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <button type="submit" className="mck-btn-primary w-full">
                <LogIn className="w-4 h-4" />
                <span>Se Connecter</span>
              </button>

              <div className="mt-6 p-4 bg-[#f6f8fb] rounded-xl border border-[#e3e8ee]">
                <h4 className="text-xs font-semibold text-[#5b6b7a] uppercase tracking-wide mb-3">💡 Connexion Rapide :</h4>
                <div className="space-y-2">
                  <button type="button" onClick={() => handleQuickLogin('diallo@nexatech.ci', 'diallo2026')} className="w-full text-left px-3 py-2 bg-white rounded-lg text-xs border border-[#e3e8ee] hover:border-[#0b1f33] transition">
                    👨‍💼 <strong>M. Diallo</strong> (Tech Lead)
                  </button>
                  <button type="button" onClick={() => handleQuickLogin('kofi@nexatech.ci', 'kofi2026')} className="w-full text-left px-3 py-2 bg-white rounded-lg text-xs border border-[#e3e8ee] hover:border-[#0b1f33] transition">
                    🐍 <strong>Kofi</strong> (Python Dev)
                  </button>
                  <button type="button" onClick={() => handleQuickLogin('amina@nexatech.ci', 'amina2026')} className="w-full text-left px-3 py-2 bg-white rounded-lg text-xs border border-[#e3e8ee] hover:border-[#0b1f33] transition">
                    🎓 <strong>Amina</strong> (Junior Dev)
                  </button>
                </div>
              </div>
            </form>
          ) : (
            <form className="mt-8 space-y-6" onSubmit={handleSignup}>
              {error && <div className="text-red-600 text-sm text-center font-medium">{error}</div>}
              <div className="space-y-4">
                <input
                  type="text"
                  required
                  className="mck-input"
                  placeholder="Nom complet"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
                <input
                  type="email"
                  required
                  className="mck-input"
                  placeholder="Email professionnel"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <select
                  className="mck-input"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                >
                  <option value="Junior Dev">Junior Dev</option>
                  <option value="Python Dev">Python Dev</option>
                  <option value="Tech Lead">Tech Lead</option>
                </select>
                <input
                  type="password"
                  required
                  className="mck-input"
                  placeholder="Mot de passe"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <button type="submit" className="mck-btn-primary w-full">
                <UserPlus className="w-4 h-4" />
                <span>Créer un compte</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}