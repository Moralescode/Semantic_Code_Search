'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

type Slide = {
  id: number;
  title: string;
  subtitle: string;
  heading: React.ReactNode;
  description: string;
  cta: string;
  href: string;
  visual: React.ReactNode;
};

const Visual1 = () => (
  <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="xMidYMid slice" viewBox="0 0 1600 900">
    <defs>
      <radialGradient id="g1" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#c5a55a" stopOpacity="0.25" />
        <stop offset="100%" stopColor="#0b1f33" stopOpacity="0" />
      </radialGradient>
      <filter id="glow">
        <feGaussianBlur stdDeviation="6" result="coloredBlur" />
        <feMerge>
          <feMergeNode in="coloredBlur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    </defs>
    <rect width="1600" height="900" fill="url(#g1)" />
    {[...Array(18)].map((_, i) => (
      <circle
        key={i}
        cx={200 + (i % 6) * 260 + (i % 2) * 80}
        cy={150 + Math.floor(i / 6) * 250 + (i % 3) * 60}
        r={8 + (i % 4) * 6}
        fill="#c5a55a"
        opacity={0.35 + (i % 3) * 0.15}
        filter="url(#glow)"
      >
        <animate attributeName="opacity" values={`${0.35 + (i % 3) * 0.15};${0.5 + (i % 3) * 0.2};${0.35 + (i % 3) * 0.15}`} dur={`${3 + (i % 4)}s`} repeatCount="indefinite" />
      </circle>
    ))}
    {[...Array(22)].map((_, i) => (
      <line
        key={i}
        x1={200 + (i % 6) * 260 + (i % 2) * 80}
        y1={150 + Math.floor(i / 6) * 250 + (i % 3) * 60}
        x2={200 + ((i + 1) % 6) * 260 + ((i + 1) % 2) * 80}
        y2={150 + Math.floor((i + 1) / 6) * 250 + ((i + 1) % 3) * 60}
        stroke="#ffffff"
        strokeOpacity="0.12"
        strokeWidth="1"
      />
    ))}
  </svg>
);

const Visual2 = () => (
  <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="xMidYMid slice" viewBox="0 0 1600 900">
    <defs>
      <radialGradient id="g2" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#0b1f33" stopOpacity="0" />
        <stop offset="100%" stopColor="#0b1f33" stopOpacity="0.85" />
      </radialGradient>
      <filter id="glow2">
        <feGaussianBlur stdDeviation="5" result="coloredBlur" />
        <feMerge>
          <feMergeNode in="coloredBlur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    </defs>
    <rect width="1600" height="900" fill="url(#g2)" />
    {[...Array(35)].map((_, i) => (
      <circle
        key={i}
        cx={150 + ((i * 137) % 1300)}
        cy={120 + ((i * 97) % 660)}
        r={3 + (i % 7)}
        fill={i % 3 === 0 ? '#c5a55a' : '#ffffff'}
        opacity={0.25 + (i % 5) * 0.07}
        filter="url(#glow2)"
      />
    ))}
    {[...Array(10)].map((_, i) => (
      <circle
        key={i}
        cx={250 + i * 120}
        cy={300 + (i % 2) * 180}
        r={18 + (i % 4) * 10}
        fill="none"
        stroke="#c5a55a"
        strokeOpacity="0.18"
        strokeWidth="1"
      />
    ))}
  </svg>
);

const Visual3 = () => (
  <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="xMidYMid slice" viewBox="0 0 1600 900">
    <defs>
      <radialGradient id="g3" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#c5a55a" stopOpacity="0.18" />
        <stop offset="100%" stopColor="#0b1f33" stopOpacity="0" />
      </radialGradient>
      <filter id="glow3">
        <feGaussianBlur stdDeviation="7" result="coloredBlur" />
        <feMerge>
          <feMergeNode in="coloredBlur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    </defs>
    <rect width="1600" height="900" fill="url(#g3)" />
    {[...Array(9)].map((_, i) => (
      <rect
        key={i}
        x={180 + (i % 3) * 420}
        y={180 + Math.floor(i / 3) * 260}
        width="180"
        height="140"
        rx="16"
        fill="#0b1f33"
        fillOpacity="0.35"
        stroke="#c5a55a"
        strokeOpacity="0.25"
        strokeWidth="1"
        filter="url(#glow3)"
      />
    ))}
    {[...Array(12)].map((_, i) => (
      <line
        key={i}
        x1={270 + (i % 3) * 420}
        y1={320 + Math.floor(i / 3) * 260}
        x2={270 + ((i + 1) % 3) * 420}
        y2={320 + Math.floor((i + 1) / 3) * 260}
        stroke="#c5a55a"
        strokeOpacity="0.25"
        strokeWidth="1"
      />
    ))}
  </svg>
);

const slides: Slide[] = [
  {
    id: 1,
    title: 'CodeMind',
    subtitle: 'Moteur de Recherche Sémantique & IA',
    heading: <>Explorer le code avec une <span className="text-[#c5a55a]">couche sémantique</span> nouvelle génération</>,
    description: 'Recherche, génération, audit et optimisation de code reposant sur FAISS, CoPilot et fine-tuning LoRA.',
    cta: 'Voir la recherche sémantique',
    href: '/search',
    visual: <Visual1 />,
  },
  {
    id: 2,
    title: 'Embeddings & IA',
    subtitle: 'Projections vectorielles',
    heading: <>Des <span className="text-[#c5a55a]">clusters</span> et des embeddings au service de la pertinence</>,
    description: 'Cartographie des fonctions NexaTech par similarité, latence CPU réduite et gains mesurables sur le recall.',
    cta: 'Ouvrir le dashboard analytics',
    href: '/analytics',
    visual: <Visual2 />,
  },
  {
    id: 3,
    title: 'NexaTech',
    subtitle: 'Architecture bancaire & fintech',
    heading: <>Accélérer la transformation <span className="text-[#c5a55a]">digitale</span> en zone UEMOA</>,
    description: 'De la validation téléphonique au formatage XOF, en passant par HMAC et TVA, tout le référentiel est unifié.',
    cta: 'Découvrir le générateur de code',
    href: '/generate',
    visual: <Visual3 />,
  },
];

export default function HeroCarousel() {
  const router = useRouter();
  const [active, setActive] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActive((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative w-full overflow-hidden" style={{ height: '80vh' }}>
      <div
        className="flex h-full transition-transform duration-700 ease-in-out"
        style={{ width: '300%', transform: `translateX(-${(active / slides.length) * 100}%)` }}
      >
        {slides.map((slide) => (
          <div
            key={slide.id}
            className="h-full w-1/3 relative overflow-hidden bg-[#0b1f33]"
          >
            {slide.visual}
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm z-[1]" />

            <div className="relative z-[2] flex flex-col justify-center max-w-[1200px] mx-auto h-full px-6 md:px-12 text-white">
              <div className="text-2xl md:text-3xl font-bold tracking-tight text-[#c5a55a] mb-1">{slide.title}</div>
              <div className="text-xs md:text-sm font-medium tracking-[0.2em] uppercase text-[#e8d5b5] mb-4 md:mb-6">{slide.subtitle}</div>
              <h1 className="text-3xl md:text-5xl font-bold leading-tight mb-3 md:mb-4">
                {slide.heading}
              </h1>
              <p className="text-sm md:text-base max-w-xl leading-relaxed opacity-90 mb-6 md:mb-8">
                {slide.description}
              </p>
              <Link
                href={slide.href}
                onClick={(e) => {
                  e.preventDefault();
                  router.push(slide.href);
                }}
                className="inline-flex items-center rounded-full bg-[#c5a55a] text-[#0b1f33] px-5 py-2.5 md:px-6 md:py-3 text-sm font-semibold transition hover:bg-[#ffd75e]"
              >
                {slide.cta}
              </Link>
            </div>
          </div>
        ))}
      </div>

      <div className="absolute bottom-6 left-1/2 z-10 flex -translate-x-1/2 gap-2">
        {slides.map((_, idx) => (
          <span
            key={idx}
            className={`h-2 rounded-full transition-all duration-300 ${active === idx ? 'w-8 bg-[#c5a55a]' : 'w-2 bg-white/40'}`}
          />
        ))}
      </div>
    </div>
  );
}
