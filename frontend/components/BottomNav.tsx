'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home, Search, Bot, TrendingUp, Cpu,
  ShieldCheck, GraduationCap, History, Star,
  Settings, Sparkles, Lightbulb, Languages,
  Shield, Zap, BookText, FileJson, AlertTriangle,
} from 'lucide-react';

interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
  roles: string[];
}

const BOTTOM_NAV_ITEMS: NavItem[] = [
  { href: '/dashboard', label: 'Accueil', icon: Home, roles: ['Tech Lead', 'Python Dev', 'Junior Dev'] },
  { href: '/search', label: 'Recherche', icon: Search, roles: ['Tech Lead', 'Python Dev', 'Junior Dev'] },
  { href: '/copilot', label: 'CoPilot', icon: Bot, roles: ['Tech Lead', 'Python Dev', 'Junior Dev'] },
  { href: '/analytics', label: 'Stats', icon: TrendingUp, roles: ['Tech Lead', 'Python Dev', 'Junior Dev'] },
  { href: '/explain', label: 'Explain', icon: Lightbulb, roles: ['Tech Lead', 'Python Dev', 'Junior Dev'] },
  { href: '/translate', label: 'Trad', icon: Languages, roles: ['Tech Lead', 'Python Dev'] },
  { href: '/audit', label: 'Audit', icon: Shield, roles: ['Tech Lead'] },
  { href: '/optimize', label: 'Opt', icon: Zap, roles: ['Tech Lead', 'Python Dev'] },
  { href: '/docstring', label: 'Docs', icon: BookText, roles: ['Tech Lead', 'Python Dev', 'Junior Dev'] },
  { href: '/patch', label: 'Patch', icon: AlertTriangle, roles: ['Tech Lead'] },
  { href: '/openapi', label: 'API', icon: FileJson, roles: ['Tech Lead', 'Python Dev'] },
  { href: '/generate', label: 'Générer', icon: Sparkles, roles: ['Tech Lead', 'Python Dev'] },
  { href: '/techlead', label: 'Lead', icon: ShieldCheck, roles: ['Tech Lead'] },
  { href: '/onboarding', label: 'Apprendre', icon: GraduationCap, roles: ['Tech Lead', 'Junior Dev'] },
  { href: '/history', label: 'Historique', icon: History, roles: ['Tech Lead', 'Python Dev', 'Junior Dev'] },
  { href: '/favorites', label: 'Favoris', icon: Star, roles: ['Tech Lead', 'Python Dev', 'Junior Dev'] },
  { href: '/settings', label: 'Réglages', icon: Settings, roles: ['Tech Lead'] },
];

export default function BottomNav() {
  const pathname = usePathname();
  const [user, setUser] = useState<{ name: string; role: string } | null>(null);

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('user');
      if (storedUser) setUser(JSON.parse(storedUser));
    } catch { /* ignore */ }
  }, []);

  // Don't show on login page
  if (pathname === '/') return null;

  const filteredItems = user
    ? BOTTOM_NAV_ITEMS.filter((item) => item.roles.includes(user.role))
    : [];

  if (filteredItems.length === 0) return null;

  return (
    <nav className="bd-bottom-nav">
      <div className="bd-bottom-nav-inner">
        {filteredItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`bd-bottom-nav-item ${isActive ? 'active' : ''}`}
              title={item.label}
            >
              <Icon />
              <span className="bd-bottom-nav-label">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

