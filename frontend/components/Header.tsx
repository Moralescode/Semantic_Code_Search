'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Search, Moon, Sun, Globe, LogOut, Bell,
  ChevronDown, Menu, X, Settings, User,
} from 'lucide-react';
import { useTheme } from '@/lib/ThemeContext';
import { useI18n } from '@/lib/I18nContext';

interface HeaderProps {
  title?: string;
  subtitle?: string;
}

export default function Header({ title, subtitle }: HeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const { lang, setLang, t } = useI18n();
  const [user, setUser] = useState<{ name: string; role: string; email: string } | null>(null);
  const [showProfile, setShowProfile] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('user');
      if (storedUser) setUser(JSON.parse(storedUser));
    } catch { /* ignore */ }
  }, []);

  // Don't render header on login page
  if (pathname === '/') return null;

  const handleLogout = () => {
    localStorage.removeItem('user');
    router.push('/');
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <header className="app-main-header">
      <div className="flex items-center justify-between w-full">
        {/* Left: Page Title */}
        <div className="flex items-center gap-4">
          {title && (
            <div>
              <h1 className="text-xl font-bold text-[var(--text-primary)]">{title}</h1>
              {subtitle && (
                <p className="text-xs text-[var(--text-secondary)] mt-0.5">{subtitle}</p>
              )}
            </div>
          )}
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          {/* Global Search */}
          <form onSubmit={handleSearch} className="hidden md:flex items-center gap-2 px-3.5 py-2 bg-[var(--surface-alt)] border border-[var(--border)] rounded-[var(--radius-md)] min-w-[240px]">
            <Search className="w-4 h-4 text-[var(--text-muted)] shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Recherche rapide..."
              className="bd-search-input"
            />
          </form>

          <div className="bd-divider hidden md:block" />

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="bd-btn-icon"
            title={theme === 'dark' ? 'Mode clair' : 'Mode sombre'}
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Language */}
          <button
            onClick={() => setLang(lang === 'fr' ? 'en' : 'fr')}
            className="bd-btn-icon text-xs font-semibold"
            title={lang === 'fr' ? 'EN' : 'FR'}
          >
            <Globe className="w-3.5 h-3.5" />
            <span className="text-[10px]">{lang === 'fr' ? 'FR' : 'EN'}</span>
          </button>

          {/* Notifications */}
          <button className="bd-btn-icon relative">
            <Bell className="w-4 h-4" />
            <span className="bd-notif-dot" />
          </button>

          {/* Profile */}
          {user && (
            <div className="relative">
              <button
                onClick={() => setShowProfile(!showProfile)}
                className="flex items-center gap-2 pl-2 pr-1 py-1 rounded-[var(--radius-md)] hover:bg-[var(--surface-hover)] transition-colors"
              >
                <div className="bd-avatar bg-gradient-to-br from-[var(--primary)] to-[var(--primary-dark)] text-white w-8 h-8 text-[10px]">
                  {getInitials(user.name)}
                </div>
                <div className="hidden lg:block text-left">
                  <div className="text-sm font-medium text-[var(--text-primary)] leading-tight">{user.name}</div>
                  <div className="text-[9px] uppercase tracking-wider font-semibold text-[var(--gold)]">{user.role}</div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-[var(--text-muted)] hidden lg:block" />
              </button>

              {/* Profile Dropdown */}
              {showProfile && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowProfile(false)} />
                  <div className="absolute right-0 top-full mt-2 w-56 bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius-lg)] shadow-[var(--shadow-dropdown)] z-50 animate-scaleIn">
                    <div className="p-4 border-b border-[var(--border)]">
                      <div className="flex items-center gap-3">
                        <div className="bd-avatar bg-gradient-to-br from-[var(--primary)] to-[var(--primary-dark)] text-white w-10 h-10 text-sm">
                          {getInitials(user.name)}
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-[var(--text-primary)]">{user.name}</div>
                          <div className="text-xs text-[var(--text-secondary)]">{user.email}</div>
                        </div>
                      </div>
                    </div>
                    <div className="p-2">
                      <Link
                        href="/settings"
                        onClick={() => setShowProfile(false)}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-[var(--radius-md)] text-sm text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)] transition-colors"
                      >
                        <Settings className="w-4 h-4" />
                        Paramètres
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-[var(--radius-md)] text-sm text-[var(--danger)] hover:bg-[var(--danger)]/5 transition-colors w-full"
                      >
                        <LogOut className="w-4 h-4" />
                        Déconnexion
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
