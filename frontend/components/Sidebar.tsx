'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home, Search, Bot, TrendingUp, Cpu,
  ShieldCheck, GraduationCap, History, Star,
  Settings, Menu, X, ChevronDown, LogOut,
  Moon, Sun, Globe, Lightbulb, Languages, Shield,
  Zap, BookText, FileJson, AlertTriangle,
} from 'lucide-react';
import { useTheme } from '@/lib/ThemeContext';
import { useI18n } from '@/lib/I18nContext';

interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
  roles: string[];
  badge?: string;
}

const NAV_SECTIONS: { title: string; items: NavItem[] }[] = [
  {
    title: 'Menu Principal',
    items: [
      { href: '/dashboard', label: 'Dashboard', icon: Home, roles: ['Tech Lead', 'Python Dev', 'Junior Dev'] },
      { href: '/search', label: 'Recherche', icon: Search, roles: ['Tech Lead', 'Python Dev', 'Junior Dev'] },
      { href: '/copilot', label: 'CoPilot', icon: Bot, roles: ['Tech Lead', 'Python Dev', 'Junior Dev'] },
      { href: '/analytics', label: 'Analytics', icon: TrendingUp, roles: ['Tech Lead', 'Python Dev', 'Junior Dev'] },
    ],
  },
  {
    title: 'Services IA',
    items: [
      { href: '/explain', label: 'Explain', icon: Lightbulb, roles: ['Tech Lead', 'Python Dev', 'Junior Dev'], badge: 'IA' },
      { href: '/translate', label: 'Translate', icon: Languages, roles: ['Tech Lead', 'Python Dev'], badge: 'IA' },
      { href: '/audit', label: 'Audit', icon: Shield, roles: ['Tech Lead'], badge: 'Sec' },
      { href: '/optimize', label: 'Optimize', icon: Zap, roles: ['Tech Lead', 'Python Dev'], badge: 'IA' },
      { href: '/docstring', label: 'Docstring', icon: BookText, roles: ['Tech Lead', 'Python Dev', 'Junior Dev'], badge: 'IA' },
      { href: '/patch', label: 'Patch', icon: AlertTriangle, roles: ['Tech Lead'], badge: 'Fix' },
      { href: '/openapi', label: 'OpenAPI', icon: FileJson, roles: ['Tech Lead', 'Python Dev'], badge: 'API' },
    ],
  },
  {
    title: 'Outils',
    items: [
      { href: '/generate', label: 'Générer', icon: Cpu, roles: ['Tech Lead', 'Python Dev'] },
      { href: '/techlead', label: 'Tech Lead', icon: ShieldCheck, roles: ['Tech Lead'], badge: 'Lead' },
      { href: '/onboarding', label: 'Onboarding', icon: GraduationCap, roles: ['Tech Lead', 'Junior Dev'] },
    ],
  },
  {
    title: 'Espace Personnel',
    items: [
      { href: '/history', label: 'Historique', icon: History, roles: ['Tech Lead', 'Python Dev', 'Junior Dev'] },
      { href: '/favorites', label: 'Favoris', icon: Star, roles: ['Tech Lead', 'Python Dev', 'Junior Dev'] },
      { href: '/settings', label: 'Paramètres', icon: Settings, roles: ['Tech Lead'] },
    ],
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const { t, lang, setLang } = useI18n();
  const [user, setUser] = React.useState<{ name: string; role: string; email: string } | null>(null);

  React.useEffect(() => {
    try {
      const stored = localStorage.getItem('user');
      if (stored) setUser(JSON.parse(stored));
    } catch { /* ignore */ }
  }, []);

  const isActive = (href: string) => pathname === href;

  const canShow = (roles: string[]) => {
    if (!user) return false;
    return roles.includes(user.role);
  };

  return (
    <>
      {/* Mobile overlay */}
      <div
        className={`fixed inset-0 bg-black/50 z-40 md:hidden transition-opacity duration-300 ${
          open ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setOpen(false)}
      />

      {/* Sidebar */}
      <aside
        className={`app-sidebar ${open ? 'open' : ''}`}
      >
        {/* Logo */}
        <div className="app-sidebar-header">
          <div className="flex items-center justify-between">
            <Link href="/dashboard" className="flex items-center gap-3" onClick={() => setOpen(false)}>
              <div className="w-9 h-9 rounded-[var(--radius-md)] gradient-gold flex items-center justify-center text-white font-bold text-sm">
                CM
              </div>
              <div>
                <span className="text-base font-bold text-white tracking-tight block leading-tight">CodeMind</span>
                <span className="text-[9px] text-white/40 font-medium uppercase tracking-[0.1em]">NexaTech</span>
              </div>
            </Link>
            <button
              onClick={() => setOpen(false)}
              className="md:hidden w-8 h-8 rounded-lg flex items-center justify-center text-white/40 hover:text-white hover:bg-white/5"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="app-sidebar-nav bd-scrollbar">
          {NAV_SECTIONS.map((section) => {
            const visibleItems = section.items.filter((item) => canShow(item.roles));
            if (visibleItems.length === 0) return null;

            return (
              <div key={section.title} className="app-sidebar-nav-section">
                <div className="app-sidebar-nav-section-title">{section.title}</div>
                {visibleItems.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.href);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setOpen(false)}
                      className={`bd-nav-item ${active ? 'active' : 'inactive'}`}
                    >
                      <Icon className="nav-icon" />
                      <span className="truncate">{item.label}</span>
                      {item.badge && (
                        <span className="nav-badge bg-[var(--gold)]/20 text-[var(--gold)]">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="app-sidebar-footer">
          {/* User info */}
          {user && (
            <div className="flex items-center gap-3 px-3 py-2 mb-3">
              <div className="bd-avatar bg-[var(--gold)]/20 text-[var(--gold)] w-9 h-9 text-xs">
                {user.name.split(' ').map(n => n[0]).join('')}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-white truncate">{user.name}</div>
                <div className="text-[10px] uppercase tracking-wider font-semibold text-[var(--gold)]">{user.role}</div>
              </div>
            </div>
          )}

          {/* Controls */}
          <div className="flex items-center gap-1 px-1">
            <button
              onClick={toggleTheme}
              className="flex items-center gap-2 px-3 py-2 rounded-[var(--radius-md)] text-white/40 hover:text-white hover:bg-white/5 transition-colors text-xs flex-1"
              title={theme === 'dark' ? 'Light mode' : 'Dark mode'}
            >
              {theme === 'dark' ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
              <span>{theme === 'dark' ? 'Clair' : 'Sombre'}</span>
            </button>
            <button
              onClick={() => setLang(lang === 'fr' ? 'en' : 'fr')}
              className="flex items-center gap-2 px-3 py-2 rounded-[var(--radius-md)] text-white/40 hover:text-white hover:bg-white/5 transition-colors text-xs"
            >
              <Globe className="w-3.5 h-3.5" />
              <span>{lang === 'fr' ? 'FR' : 'EN'}</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile hamburger */}
      <button
        className="fixed top-3 left-3 z-50 md:hidden w-9 h-9 rounded-[var(--radius-md)] bg-[var(--primary)] text-white shadow-lg flex items-center justify-center"
        onClick={() => setOpen(true)}
      >
        <Menu className="w-4 h-4" />
      </button>
    </>
  );
}
