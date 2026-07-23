'use client';

import React from 'react';
import PageLayout from '../../components/PageLayout';
import { Target, Landmark, ArrowRight, Brain } from 'lucide-react';

const iconMap: Record<string, React.ElementType> = {
  '1': Target,
  '2': Landmark,
  '3': ArrowRight,
  '4': Brain,
};

export default function OnboardingPage() {
  return (
    <PageLayout title="Onboarding" subtitle="Espace d'intégration d'Amina — Prenez en main notre base de code sémantique.">
      <div className="mck-section">
        <div className="mck-container">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { step: '1', title: 'Recherche Sémantique', desc: "Décrivez l'action souhaitée en langage naturel. Le moteur trouve le code correspondant en quelques millisecondes." },
              { step: '2', title: 'Audit de Sécurité', desc: 'Vérifiez si vos fonctions respectent les bonnes pratiques et la conformité RGPD/UEMOA en un clic.' },
              { step: '3', title: 'Optimisation', desc: 'Apprenez à réduire la complexité algorithmique grâce à l\'optimiseur IA et améliorez les performances.' },
              { step: '4', title: 'CoPilot & Vocale', desc: 'Discutez avec le CoPilot et utilisez la recherche vocale pour trouver du code sans écrire une seule ligne.' }
            ].map((item) => {
              const Icon = iconMap[item.step];
              return (
                <div key={item.step} className="mck-card p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-[#f6f8fb] text-[#0b1f33] flex items-center justify-center">
                      <Icon className="w-5 h-5" />
                    </div>
                    <h3 className="text-lg font-semibold text-[#0b1f33]">{item.title}</h3>
                  </div>
                  <p className="text-sm text-[#5b6b7a] leading-relaxed">{item.desc}</p>
                </div>
              );
            })}
          </div>

          <div className="mt-8 mck-card p-6">
            <h3 className="text-lg font-semibold text-[#0b1f33] mb-2">Conseil du jour</h3>
            <p className="text-sm text-[#5b6b7a]">Commencez par la page <strong>Recherche Sémantique</strong> et essayez la requête &quot;valider un numéro de téléphone&quot; pour voir le moteur en action.</p>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}