'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LogIn, UserPlus, Mail, Lock, User, ChevronRight, Sparkles,
  Eye, EyeOff, Search, Bot, Code2, Globe, BookOpen, Shield,
  ArrowRight, Star, Menu, X, Languages,
} from 'lucide-react';

const IA_FEATURES = [
  { icon: Search, title: 'Recherche Sémantique', desc: 'Trouvez du code en langage naturel grâce à FAISS et BERT.', color: '#3965ff', gradient: 'from-[#3965ff] to-[#2a4fd6]' },
  { icon: Bot, title: 'Assistant CoPilot RAG', desc: 'Assistant IA connecté à votre index FAISS pour des réponses contextuelles.', color: '#c5a55a', gradient: 'from-[#c5a55a] to-[#a88a42]' },
  { icon: Languages, title: 'Traduction de Code', desc: 'Convertissez votre code entre Python, JavaScript, Java, Go et plus.', color: '#05cd99', gradient: 'from-[#05cd99] to-[#02b984]' },
  { icon: Shield, title: 'Audit & Sécurité', desc: 'Analysez la sécurité et la conformité de votre code automatiquement.', color: '#ffb547', gradient: 'from-[#ffb547] to-[#f59e0b]' },
  { icon: Code2, title: 'Génération Automatique', desc: 'Générez du code propre et documenté par IA.', color: '#c5a55a', gradient: 'from-[#c5a55a] to-[#a88a42]' },
  { icon: BookOpen, title: 'Docstring & OpenAPI', desc: 'Générez docstrings et specs OpenAPI automatiquement.', color: '#3965ff', gradient: 'from-[#3965ff] to-[#2a4fd6]' },
];

const STATS = [
  { value: '100+', label: 'Fonctions indexées', icon: Code2 },
  { value: '8', label: 'Langages supportés', icon: Globe },
  { value: '6', label: 'Outils IA', icon: Sparkles },
  { value: 'FAISS', label: 'Base vectorielle', icon: Search },
];

const HOW_IT_WORKS = [
  { step: '1', title: 'Décrivez votre besoin', desc: 'Tapez une requête en langage naturel ou posez une question à l\'IA.', icon: Search },
  { step: '2', title: 'IA analyse & trouve', desc: 'Le moteur FAISS + BERT analyse sémantiquement et trouve le code pertinent.', icon: Bot },
  { step: '3', title: 'Récupérez & optimisez', desc: 'Récupérez le code, générez des variantes, traduisez ou auditez-le en un clic.', icon: Code2 },
];

const TESTIMONIALS = [
  { name: 'M. Diallo', role: 'Tech Lead', text: 'CodeMind a réduit de 40% le temps de recherche de code dans notre équipe.', avatar: 'MD' },
  { name: 'Kofi', role: 'Python Dev', text: 'Le CoPilot RAG est devenu mon outil quotidien. Il comprend parfaitement notre codebase.', avatar: 'K' },
  { name: 'Amina', role: 'Junior Dev', text: 'L\'audit de sécurité m\'a appris à écrire du code plus robuste dès le début.', avatar: 'A' },
];

export default function LandingPage() {
  const router = useRouter();
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('Junior Dev');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    if (users.length === 0) {
      const quick: Record<string, { name: string; role: string; pwd: string }> = {
        'diallo@nexatech.ci': { name: 'M. Diallo', role: 'Tech Lead', pwd: 'diallo2026' },
        'kofi@nexatech.ci': { name: 'Kofi', role: 'Python Dev', pwd: 'kofi2026' },
        'amina@nexatech.ci': { name: 'Amina', role: 'Junior Dev', pwd: 'amina2026' },
      };
      const found = quick[email];
      if (found && password === found.pwd) {
        localStorage.setItem('user', JSON.stringify({ name: found.name, role: found.role, email }));
        router.push('/dashboard');
        return;
      }
    }
    const found = users.find((u: any) => u.email === email && u.password === password);
    if (found) {
      localStorage.setItem('user', JSON.stringify({ name: found.name, role: found.role, email }));
      router.push('/dashboard');
    } else {
      setError('Identifiants incorrects. Veuillez réessayer.');
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
      setError('Cette adresse email possède déjà un compte.');
      return;
    }
    users.push({ name, email, password, role });
    localStorage.setItem('users', JSON.stringify(users));
    localStorage.setItem('user', JSON.stringify({ name, role, email }));
    router.push('/onboarding');
  };

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[var(--bg-main)]">
      {/* NAVBAR */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[var(--bg-main)]/80 backdrop-blur-xl border-b border-[var(--border)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-[var(--radius-md)] gradient-gold flex items-center justify-center text-white font-bold text-sm">CM</div>
              <span className="text-lg font-bold text-[var(--text-primary)]">CodeMind</span>
            </div>
            <div className="hidden md:flex items-center gap-1">
              <button onClick={() => scrollTo('features')} className="bd-btn-ghost text-sm">Fonctionnalités</button>
              <button onClick={() => scrollTo('how-it-works')} className="bd-btn-ghost text-sm">Comment ça marche</button>
              <button onClick={() => scrollTo('testimonials')} className="bd-btn-ghost text-sm">Témoignages</button>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={() => scrollTo('auth-section')} className="hidden md:inline-flex bd-btn-primary text-sm">Commencer</button>
              <button onClick={() => setMobileMenu(!mobileMenu)} className="md:hidden w-9 h-9 flex items-center justify-center rounded-[var(--radius-md)] hover:bg-[var(--surface-hover)]">
                {mobileMenu ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
        {mobileMenu && (
          <div className="md:hidden border-t border-[var(--border)] bg-[var(--bg-card)] p-4 space-y-2">
            <button onClick={() => { scrollTo('features'); setMobileMenu(false); }} className="block w-full text-left px-3 py-2 rounded-[var(--radius-md)] hover:bg-[var(--surface-hover)] text-sm">Fonctionnalités</button>
            <button onClick={() => { scrollTo('how-it-works'); setMobileMenu(false); }} className="block w-full text-left px-3 py-2 rounded-[var(--radius-md)] hover:bg-[var(--surface-hover)] text-sm">Comment ça marche</button>
            <button onClick={() => { scrollTo('testimonials'); setMobileMenu(false); }} className="block w-full text-left px-3 py-2 rounded-[var(--radius-md)] hover:bg-[var(--surface-hover)] text-sm">Témoignages</button>
            <button onClick={() => { scrollTo('auth-section'); setMobileMenu(false); }} className="bd-btn-primary w-full justify-center mt-2">Commencer</button>
          </div>
        )}
      </nav>

      {/* HERO */}
      <section className="min-h-screen flex items-center pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center py-12 lg:py-20">
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--gold)]/10 border border-[var(--gold)]/20 text-xs font-medium text-[var(--gold)] mb-6">
                <Sparkles className="w-3.5 h-3.5" /> Moteur de Recherche Sémantique v3.0
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-[var(--text-primary)] leading-tight mb-6">
                Le Code à la<br /><span className="text-gradient">Vitesse de l&apos;IA</span>
              </h1>
              <p className="text-lg text-[var(--text-secondary)] leading-relaxed mb-8 max-w-lg">
                Plateforme intelligente propulsée par FAISS + BERT — 
                Recherchez, traduisez, auditez et générez du code en langage naturel.
              </p>
              <div className="flex flex-wrap gap-4">
                <button onClick={() => scrollTo('auth-section')} className="bd-btn-primary px-8 py-3.5 text-base">
                  <Sparkles className="w-5 h-5" /> Démarrer gratuitement
                </button>
                <button onClick={() => scrollTo('features')} className="bd-btn-secondary px-8 py-3.5 text-base">
                  Découvrir <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.7, delay: 0.2 }} className="hidden lg:block">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-[var(--gold)]/10 to-[var(--primary)]/10 rounded-[var(--radius-2xl)] blur-3xl" />
                <div className="relative bd-card p-8">
                  <div className="grid grid-cols-2 gap-4">
                    {IA_FEATURES.slice(0, 4).map((f, i) => {
                      const Icon = f.icon;
                      return (
                        <div key={i} className="flex items-start gap-3 p-4 rounded-[var(--radius-md)] hover:bg-[var(--surface-hover)] transition-colors">
                          <div className={`w-10 h-10 rounded-[var(--radius-md)] bg-gradient-to-br ${f.gradient} flex items-center justify-center text-white shrink-0`}>
                            <Icon className="w-5 h-5" />
                          </div>
                          <div>
                            <h4 className="text-sm font-semibold text-[var(--text-primary)]">{f.title}</h4>
                            <p className="text-xs text-[var(--text-secondary)] mt-0.5">{f.desc}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="py-16 bg-[var(--surface-alt)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {STATS.map((stat, i) => {
              const Icon = stat.icon;
              return (
                <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="text-center">
                  <div className="w-12 h-12 rounded-[var(--radius-md)] bg-gradient-to-br from-[var(--primary)]/10 to-[var(--gold)]/10 flex items-center justify-center mx-auto mb-3">
                    <Icon className="w-6 h-6 text-[var(--gold)]" />
                  </div>
                  <div className="text-3xl font-bold text-[var(--text-primary)]">{stat.value}</div>
                  <div className="text-sm text-[var(--text-secondary)] mt-1">{stat.label}</div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-[var(--text-primary)] mb-3">6 Outils IA pour les Développeurs</h2>
            <p className="text-[var(--text-secondary)] max-w-2xl mx-auto">Tout ce dont vous avez besoin pour coder plus vite, mieux et en toute sécurité.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {IA_FEATURES.map((f, i) => {
              const Icon = f.icon;
              return (
                <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="bd-card p-6 hover:-translate-y-1 transition-all duration-200 group cursor-pointer" onClick={() => scrollTo('auth-section')}>
                  <div className={`w-12 h-12 rounded-[var(--radius-md)] bg-gradient-to-br ${f.gradient} flex items-center justify-center text-white mb-4 shadow-lg`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">{f.title}</h3>
                  <p className="text-sm text-[var(--text-secondary)] mb-4">{f.desc}</p>
                  <div className="flex items-center gap-1 text-xs font-medium text-[var(--gold)] group-hover:gap-2 transition-all">
                    En savoir plus <ArrowRight className="w-3 h-3" />
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" className="py-20 bg-[var(--surface-alt)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-[var(--text-primary)] mb-3">Comment ça marche ?</h2>
            <p className="text-[var(--text-secondary)] max-w-2xl mx-auto">3 étapes simples pour booster votre productivité.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {HOW_IT_WORKS.map((step, i) => {
              const Icon = step.icon;
              return (
                <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.2 }} className="relative text-center">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[var(--gold)] to-[var(--gold-dark)] flex items-center justify-center text-white text-2xl font-bold mx-auto mb-5 shadow-xl shadow-[var(--gold)]/20">
                    {step.step}
                  </div>
                  <div className="w-12 h-12 rounded-[var(--radius-md)] bg-[var(--primary)]/10 flex items-center justify-center mx-auto mb-4">
                    <Icon className="w-6 h-6 text-[var(--primary)]" />
                  </div>
                  <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">{step.title}</h3>
                  <p className="text-sm text-[var(--text-secondary)] max-w-xs mx-auto">{step.desc}</p>
                  {i < 2 && <div className="hidden md:block absolute top-8 left-[60%] w-full h-0.5 border-t-2 border-dashed border-[var(--gold)]/30" />}
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section id="testimonials" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-[var(--text-primary)] mb-3">Ils utilisent CodeMind</h2>
            <p className="text-[var(--text-secondary)] max-w-2xl mx-auto">Ce que nos utilisateurs disent de la plateforme.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.15 }} className="bd-card p-6">
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, j) => <Star key={j} className="w-4 h-4 fill-[var(--gold)] text-[var(--gold)]" />)}
                </div>
                <p className="text-sm text-[var(--text-secondary)] mb-6 italic">&ldquo;{t.text}&rdquo;</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--gold)] to-[var(--gold-dark)] flex items-center justify-center text-white text-sm font-bold">{t.avatar}</div>
                  <div>
                    <div className="text-sm font-semibold text-[var(--text-primary)]">{t.name}</div>
                    <div className="text-xs text-[var(--text-secondary)]">{t.role}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* AUTH */}
      <section id="auth-section" className="py-20 bg-gradient-to-b from-transparent to-[var(--surface-alt)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }}>
              <h2 className="text-3xl sm:text-4xl font-bold text-[var(--text-primary)] mb-4">Prêt à transformer votre façon de coder ?</h2>
              <p className="text-lg text-[var(--text-secondary)] mb-8">Rejoignez les développeurs qui utilisent CodeMind au quotidien.</p>
              <div className="space-y-4">
                {[
                  { icon: Search, text: 'Recherche sémantique instantanée' },
                  { icon: Bot, text: 'Assistant CoPilot avec RAG' },
                  { icon: Languages, text: 'Traduction multi-langages' },
                  { icon: Shield, text: 'Audit de sécurité automatisé' },
                ].map((item, i) => {
                  const Icon = item.icon;
                  return (
                    <div key={i} className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-[var(--radius-sm)] bg-[var(--gold)]/10 flex items-center justify-center">
                        <Icon className="w-4 h-4 text-[var(--gold)]" />
                      </div>
                      <span className="text-sm text-[var(--text-secondary)]">{item.text}</span>
                    </div>
                  );
                })}
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} className="bd-card p-8">
              <div className="flex mb-8 border-b border-[var(--border)]">
                <button onClick={() => { setMode('login'); setError(''); }} className={`flex-1 pb-4 text-sm font-semibold transition-all relative ${mode === 'login' ? 'text-[var(--text-primary)]' : 'text-[var(--text-muted)]'}`}>
                  <LogIn className="w-4 h-4 inline mr-2" /> Connexion
                  {mode === 'login' && <motion.div layoutId="tab-indicator-auth" className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--gold)]" />}
                </button>
                <button onClick={() => { setMode('signup'); setError(''); }} className={`flex-1 pb-4 text-sm font-semibold transition-all relative ${mode === 'signup' ? 'text-[var(--text-primary)]' : 'text-[var(--text-muted)]'}`}>
                  <UserPlus className="w-4 h-4 inline mr-2" /> Inscription
                  {mode === 'signup' && <motion.div layoutId="tab-indicator-auth" className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--gold)]" />}
                </button>
              </div>

              <AnimatePresence mode="wait">
                {mode === 'login' ? (
                  <motion.form key="login-form" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-5" onSubmit={handleLogin}>
                    {error && <div className="p-3 rounded-[var(--radius-md)] bg-[var(--danger)]/10 border border-[var(--danger)]/20 text-sm text-[var(--danger)] font-medium text-center">{error}</div>}
                    <div className="space-y-4">
                      <div className="relative">
                        <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
                        <input type="email" required className="bd-input !pl-10" placeholder="Adresse email" value={email} onChange={(e) => setEmail(e.target.value)} />
                      </div>
                      <div className="relative">
                        <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
                        <input type={showPassword ? 'text' : 'password'} required className="bd-input !pl-10 !pr-10" placeholder="Mot de passe" value={password} onChange={(e) => setPassword(e.target.value)} />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)]">
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                    <button type="submit" className="bd-btn-primary w-full justify-center py-3"><LogIn className="w-4 h-4" /> Se Connecter</button>
                    <div className="pt-4 border-t border-[var(--border)]">
                      <p className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-3 text-center">⚡ Accès rapide</p>
                      <div className="space-y-2">
                        {[
                          { label: '👨‍💼 M. Diallo — Tech Lead', e: 'diallo@nexatech.ci', p: 'diallo2026' },
                          { label: '🐍 Kofi — Python Dev', e: 'kofi@nexatech.ci', p: 'kofi2026' },
                          { label: '🎓 Amina — Junior Dev', e: 'amina@nexatech.ci', p: 'amina2026' },
                        ].map((btn) => (
                          <button key={btn.e} type="button" onClick={() => { setEmail(btn.e); setPassword(btn.p); }} className="flex items-center justify-between w-full px-4 py-3 bg-[var(--surface-alt)] rounded-[var(--radius-md)] text-sm border border-[var(--border)] hover:border-[var(--gold)]/50 transition-all group">
                            <span className="font-medium text-[var(--text-primary)]">{btn.label}</span>
                            <ChevronRight className="w-4 h-4 text-[var(--text-muted)] group-hover:text-[var(--gold)] group-hover:translate-x-0.5 transition-all" />
                          </button>
                        ))}
                      </div>
                    </div>
                  </motion.form>
                ) : (
                  <motion.form key="signup-form" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-5" onSubmit={handleSignup}>
                    {error && <div className="p-3 rounded-[var(--radius-md)] bg-[var(--danger)]/10 border border-[var(--danger)]/20 text-sm text-[var(--danger)] font-medium text-center">{error}</div>}
                    <div className="space-y-4">
                      <div className="relative">
                        <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
                        <input type="text" required className="bd-input !pl-10" placeholder="Nom complet" value={name} onChange={(e) => setName(e.target.value)} />
                      </div>
                      <div className="relative">
                        <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
                        <input type="email" required className="bd-input !pl-10" placeholder="Email professionnel" value={email} onChange={(e) => setEmail(e.target.value)} />
                      </div>
                      <select className="bd-select" value={role} onChange={(e) => setRole(e.target.value)}>
                        <option value="Junior Dev">🎓 Junior Dev</option>
                        <option value="Python Dev">🐍 Python Dev</option>
                        <option value="Tech Lead">👨‍💼 Tech Lead</option>
                      </select>
                      <div className="relative">
                        <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
                        <input type={showPassword ? 'text' : 'password'} required className="bd-input !pl-10 !pr-10" placeholder="Mot de passe (min. 6 caractères)" value={password} onChange={(e) => setPassword(e.target.value)} />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)]">
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                    <button type="submit" className="bd-btn-primary w-full justify-center py-3"><Sparkles className="w-4 h-4" /> Créer mon compte</button>
                    <p className="text-xs text-[var(--text-muted)] text-center">En créant un compte, vous acceptez les conditions d&apos;utilisation de CodeMind.</p>
                  </motion.form>
                )}
              </AnimatePresence>
            </motion.div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-12 border-t border-[var(--border)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-[var(--radius-md)] gradient-gold flex items-center justify-center text-white font-bold text-xs">CM</div>
              <span className="text-sm font-semibold text-[var(--text-primary)]">CodeMind</span>
              <span className="text-xs text-[var(--text-muted)]">by NexaTech Solutions</span>
            </div>
            <div className="flex items-center gap-6 text-xs text-[var(--text-muted)]">
              <span>&copy; 2026 NexaTech Solutions</span>
              <span>Abidjan, C&ocirc;te d&apos;Ivoire</span>
              <span>v3.0</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
