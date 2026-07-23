'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Menu, X, Search, BarChart2, TrendingUp, Cpu, History, Star, GraduationCap, Settings, LogOut, Bot, ChevronDown, ArrowRight } from 'lucide-react';

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<{ name: string; role: string; email: string } | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('user');
      console.log('Header useEffect storedUser', storedUser);
      if (storedUser) {
        setUser(JSON.parse(storedUser));
        console.log('Header user set', JSON.parse(storedUser));
      }
    } catch (e) {
      console.log('Header useEffect error', e);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user');
    router.push('/');
  };

  const navItems = [
    { href: '/search', label: 'Recherche', icon: Search, roles: ['Tech Lead', 'Python Dev', 'Junior Dev'] },
    { href: '/copilot', label: 'CoPilot', icon: Bot, roles: ['Tech Lead', 'Python Dev', 'Junior Dev'] },
    { href: '/dashboard', label: 'Dashboard', icon: BarChart2, roles: ['Tech Lead', 'Python Dev', 'Junior Dev'] },
    { href: '/analytics', label: 'Analytics', icon: TrendingUp, roles: ['Tech Lead', 'Python Dev', 'Junior Dev'] },
    { href: '/generate', label: 'Générateur', icon: Cpu, roles: ['Tech Lead', 'Python Dev'] },
    { href: '/techlead', label: 'Tech Lead', icon: Cpu, roles: ['Tech Lead'] },
    { href: '/onboarding', label: 'Onboarding', icon: GraduationCap, roles: ['Tech Lead', 'Junior Dev'] },
    { href: '/history', label: 'Historique', icon: History, roles: ['Tech Lead', 'Python Dev', 'Junior Dev'] },
    { href: '/favorites', label: 'Favoris', icon: Star, roles: ['Tech Lead', 'Python Dev', 'Junior Dev'] },
    { href: '/settings', label: 'Paramètres', icon: Settings, roles: ['Tech Lead'] },
  ];

  const filteredItems = user ? navItems.filter(item => item.roles.includes(user.role)) : [];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#e3e8ee] bg-white/90 backdrop-blur">
      <div className="mck-container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-xl font-semibold tracking-tight text-[#0b1f33]">🧠 CodeMind</span>
        </Link>

        <nav className="hidden md:flex items-center gap-6 text-sm">
          {filteredItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`relative inline-flex items-center gap-2 transition ${
                  isActive ? 'text-[#0b1f33]' : 'text-[#5b6b7a] hover:text-[#0b1f33]'
                }`}
              >
                <Icon className="w-4 h-4" />
                {item.label}
                {isActive && <span className="absolute -bottom-5 left-0 h-[2px] w-full bg-[#c5a55a]" />}
              </Link>
            );
          })}
        </nav>

        <div className="hidden md:flex items-center gap-4">
          {user && (
            <>
              <div className="text-right">
                <div className="text-sm font-medium text-[#142938]">{user.name}</div>
                <div className="text-xs text-[#c5a55a]">{user.role}</div>
              </div>
              <button
                onClick={handleLogout}
                className="mck-btn-secondary !px-4 !py-2"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden lg:inline">Déconnexion</span>
              </button>
            </>
          )}
        </div>

        <button className="md:hidden p-2" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t border-[#e3e8ee] bg-white">
          <div className="mck-container py-4 space-y-3">
            {filteredItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition ${
                  pathname === item.href ? 'bg-[#f6f8fb] text-[#0b1f33]' : 'text-[#5b6b7a] hover:bg-[#f6f8fb]'
                }`}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </Link>
            ))}
            {user && (
              <button
                onClick={() => { handleLogout(); setMobileOpen(false); }}
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-600 hover:bg-red-50"
              >
                <LogOut className="w-4 h-4" />
                Déconnexion
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}