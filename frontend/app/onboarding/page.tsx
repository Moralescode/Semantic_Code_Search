'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  Target, Landmark, ArrowRight, Brain, Search,
  Bot, Sparkles, Shield, ChevronRight,
} from 'lucide-react';
import PageLayout from '@/components/PageLayout';

const STEPS = [
  {
    step: '1',
    icon: Search,
    title: 'Recherche Sémantique',
    desc: "Décrivez l'action souhaitée en langage naturel. Le moteur trouve le code correspondant en quelques millisecondes.",
    color: '#3965ff',
    path: '/search',
    gradient: 'from-[#3965ff] to-[#2a4fd6]',
  },
  {
    step: '2',
    icon: Shield,
    title: 'Audit de Sécurité',
    desc: 'Vérifiez si vos fonctions respectent les bonnes pratiques et la conformité RGPD/UEMOA en un clic.',
    color: '#05cd99',
    path: '/search',
    gradient: 'from-[#05cd99] to-[#02b984]',
  },
  {
    step: '3',
    icon: Sparkles,
    title: 'Optimisation',
    desc: "Apprenez à réduire la complexité algorithmique grâce à l'optimiseur IA et améliorez les performances.",
    color: '#c5a55a',
    path: '/generate',
    gradient: 'from-[#c5a55a] to-[#a88a42]',
  },
  {
    step: '4',
    icon: Bot,
    title: 'CoPilot & Vocale',
    desc: 'Discutez avec le CoPilot et utilisez la recherche vocale pour trouver du code sans écrire une seule ligne.',
    color: '#ffb547',
    path: '/copilot',
    gradient: 'from-[#ffb547] to-[#f59e0b]',
  },
];

const QUICK_LINKS = [
  { label: 'Recherche Sémantique', path: '/search', icon: Search, desc: 'Trouvez du code par langage naturel' },
  { label: 'Assistant CoPilot', path: '/copilot', icon: Bot, desc: 'Chat RAG intelligent' },
  { label: 'Générateur IA', path: '/generate', icon: Sparkles, desc: 'Créez du code sur mesure' },
];

export default function OnboardingPage() {
  return (
    <PageLayout title="Onboarding" subtitle="Bienvenue sur CodeMind">
    <div className="min-h-screen bg-[var(--bg-main)]">
      <div className="bd-container py-6 lg:py-8 max-w-6xl mx-auto">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-1">
            <div className="bd-badge bd-badge-success">Onboarding</div>
          </div>
          <h1 className="text-3xl font-bold text-[var(--text-primary)]">Bienvenue sur CodeMind</h1>
          <p className="text-[var(--text-secondary)] mt-1 text-sm">
            Prenez en main la plateforme de recherche sémantique de code — 4 étapes pour devenir expert.
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
          {STEPS.map((item, index) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.4 }}
                className="bd-card p-6 hover:-translate-y-0.5 transition-all duration-200"
              >
                <div className="flex items-start gap-4">
                  <div
                    className="w-12 h-12 rounded-[var(--radius-md)] bg-gradient-to-br flex items-center justify-center text-white text-lg font-bold shrink-0"
                    style={{ background: `linear-gradient(135deg, ${item.color}, ${item.color}dd)` }}
                  >
                    {item.step}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Icon className="w-4 h-4" style={{ color: item.color }} />
                      <h3 className="text-lg font-semibold text-[var(--text-primary)]">{item.title}</h3>
                    </div>
                    <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{item.desc}</p>
                    <Link
                      href={item.path}
                      className="inline-flex items-center gap-1 mt-3 text-xs font-medium"
                      style={{ color: item.color }}
                    >
                      Commencer <ChevronRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Quick Start */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">
          {QUICK_LINKS.map((link) => (
            <Link
              key={link.path}
              href={link.path}
              className="bd-card p-5 flex items-center gap-4 hover:-translate-y-0.5 transition-all"
            >
              <div className="w-10 h-10 rounded-[var(--radius-md)] gradient-brand flex items-center justify-center text-white shrink-0">
                <link.icon className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-semibold text-[var(--text-primary)]">{link.label}</h4>
                <p className="text-xs text-[var(--text-secondary)]">{link.desc}</p>
              </div>
              <ChevronRight className="w-4 h-4 text-[var(--text-muted)]" />
            </Link>
          ))}
        </div>

        {/* Daily Tip */}
        <div className="bd-card p-6 border-l-4 border-l-[var(--gold)]">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-[var(--radius-md)] bg-[var(--gold)]/10 flex items-center justify-center shrink-0">
              <Brain className="w-5 h-5 text-[var(--gold)]" />
            </div>
            <div>
              <h3 className="font-semibold text-[var(--text-primary)]">Conseil du jour</h3>
              <p className="text-sm text-[var(--text-secondary)] mt-1 leading-relaxed">
                Commencez par la page <strong>Recherche Sémantique</strong> et essayez la requête
                &ldquo;valider un numéro de téléphone&rdquo; pour voir le moteur en action.
              </p>
              <Link
                href="/search"
                className="inline-flex items-center gap-1 mt-3 text-sm font-medium text-[var(--gold)] hover:underline"
              >
                Essayer maintenant <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
    </PageLayout>
  );
}
