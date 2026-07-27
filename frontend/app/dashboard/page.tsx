'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  FileCode2, Languages, FolderTree, Search,
  TrendingUp, ArrowRight, Bot, Sparkles,
  ShieldCheck, Clock, Activity, Github,
  ChevronRight, Code2, Users, BookOpen,
  Lightbulb, Shield, Zap, BookText, FileJson, AlertTriangle,
} from 'lucide-react';
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis,
  Tooltip, ResponsiveContainer, CartesianGrid, AreaChart, Area,
} from 'recharts';
import StatCard from '@/components/StatCard';
import { useI18n } from '@/lib/I18nContext';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

const CHART_COLORS = ['#2b3674', '#c5a55a', '#05cd99', '#ffb547', '#ee5d50', '#3965ff', '#8b5cf6', '#ec4899'];

const QUICK_ACTIONS = [
  { title: 'Recherche Sémantique', desc: 'Trouvez du code par langage naturel', path: '/search', icon: Search, color: '#3965ff', gradient: 'from-[#3965ff] to-[#2a4fd6]' },
  { title: 'CoPilot Assistant', desc: 'Chat RAG connecté à FAISS', path: '/copilot', icon: Bot, color: '#c5a55a', gradient: 'from-[#c5a55a] to-[#a88a42]' },
  { title: 'Générateur IA', desc: 'Code sur mesure en un clic', path: '/generate', icon: Sparkles, color: '#05cd99', gradient: 'from-[#05cd99] to-[#02b984]' },
  { title: 'Tech Lead', desc: 'Revue & architecture', path: '/techlead', icon: ShieldCheck, color: '#ffb547', gradient: 'from-[#ffb547] to-[#f59e0b]' },
];

const IA_SERVICES = [
  { title: 'Explain', desc: 'Explication de code', path: '/explain', icon: Lightbulb, color: '#8b5cf6', gradient: 'from-[#8b5cf6] to-[#7c3aed]' },
  { title: 'Translate', desc: 'Traduction de code', path: '/translate', icon: Languages, color: '#ec4899', gradient: 'from-[#ec4899] to-[#db2777]' },
  { title: 'Audit', desc: 'Sécurité & conformité', path: '/audit', icon: Shield, color: '#ee5d50', gradient: 'from-[#ee5d50] to-[#dc3a30]' },
  { title: 'Optimize', desc: 'Optimisation IA', path: '/optimize', icon: Zap, color: '#f59e0b', gradient: 'from-[#f59e0b] to-[#d97706]' },
  { title: 'Docstring', desc: 'Génération docstring', path: '/docstring', icon: BookText, color: '#06b6d4', gradient: 'from-[#06b6d4] to-[#0891b2]' },
  { title: 'Patch', desc: 'Correction sécurité', path: '/patch', icon: AlertTriangle, color: '#ef4444', gradient: 'from-[#ef4444] to-[#dc2626]' },
  { title: 'OpenAPI', desc: 'Spec API REST', path: '/openapi', icon: FileJson, color: '#10b981', gradient: 'from-[#10b981] to-[#059669]' },
];

export default function Dashboard() {
  const { t } = useI18n();
  const [snippets, setSnippets] = useState<any[]>([]);
  const [searches, setSearches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<{ name: string; role: string } | null>(null);

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('user');
      if (storedUser) setUser(JSON.parse(storedUser));
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [corpusRes, historyRes] = await Promise.all([
          fetch(`${BASE_URL}/corpus`).then(r => r.json()).catch(() => ({ entries: [] })),
          fetch(`${BASE_URL}/search_history?limit=100`).then(r => r.json()).catch(() => []),
        ]);
        setSnippets(corpusRes.entries || []);
        setSearches(historyRes || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const languages = [...new Set(snippets.map((s: any) => s.language))];
  const langData = languages.map((lang) => ({
    name: lang,
    value: snippets.filter((s: any) => s.language === lang).length,
  }));
  const totalLines = snippets.reduce((sum: number, s: any) => sum + (s.line_count || 0), 0);

  const trendData = searches.length > 0
    ? Array.from({ length: 7 }, (_, i) => {
        const dayNames = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
        const dayIdx = (new Date().getDay() + i - 1 + 7) % 7 || 7;
        const dayName = dayNames[dayIdx - 1];
        const daySearches = searches.filter((s: any) => {
          if (!s.created_date) return false;
          const d = new Date(s.created_date);
          return d.getDay() === dayIdx;
        });
        return {
          day: dayName,
          searches: daySearches.length,
          success: daySearches.filter((s: any) => (s.results_count || 0) > 0).length,
        };
      })
    : Array.from({ length: 7 }, (_, i) => ({
        day: ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'][i],
        searches: 0,
        success: 0,
      }));

  const KPI_DATA = [
    { label: 'Snippets indexés', value: snippets.length, sublabel: `${totalLines} lignes de code`, icon: FileCode2, color: '#2b3674', trend: 'up' as const, trendValue: '+12%', tooltip: 'Nombre total de fonctions indexées dans FAISS' },
    { label: 'Langages', value: languages.length, sublabel: 'programmes différents', icon: Languages, color: '#3965ff', trend: 'up' as const, trendValue: '+3', tooltip: 'Langages de programmation détectés dans le corpus' },
    { label: 'Catégories', value: Math.min(snippets.length, 8), sublabel: 'modules métier', icon: FolderTree, color: '#05cd99', tooltip: 'Modules métier identifiés' },
    { label: 'Recherches', value: searches.length, sublabel: 'requêtes effectuées', icon: Search, color: '#ffb547', trend: 'up' as const, trendValue: '+28%', tooltip: 'Nombre total de recherches effectuées' },
  ];

  return (
    <div className="min-h-screen bg-[var(--bg-main)]">
      <div className="bd-container py-6 lg:py-8 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="bd-badge bd-badge-gold">v3.0</div>
              <span className="text-xs text-[var(--text-muted)]">Tableau de bord</span>
            </div>
            <h1 className="text-3xl font-bold text-[var(--text-primary)]">
              Bon retour{user ? `, ${user.name.split(' ')[0]}` : ''} 👋
            </h1>
            <p className="text-[var(--text-secondary)] mt-1 text-sm">
              {user?.role === 'Tech Lead'
                ? 'Supervisez la qualité et la performance du code de votre équipe.'
                : user?.role === 'Python Dev'
                ? 'Explorez et contribuez à la base de code sémantique.'
                : 'Apprenez et maîtrisez les outils CodeMind.'}
            </p>
          </div>
          <div className="flex items-center gap-3 mt-4 md:mt-0">
            <Link href="/search" className="bd-btn-primary">
              <Search className="w-4 h-4" /> Rechercher
            </Link>
            <Link href="/copilot" className="bd-btn-secondary">
              <Bot className="w-4 h-4" /> CoPilot
            </Link>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 rounded-[var(--radius-lg)] bd-skeleton" />
            ))}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
              {KPI_DATA.map((m, i) => (
                <StatCard key={i} icon={m.icon} label={m.label} value={m.value} sublabel={m.sublabel} color={m.color} delay={i} trend={m.trend} trendValue={m.trendValue} tooltip={m.tooltip} />
              ))}
            </div>

            {/* Quick Actions */}
            <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Accès Rapide</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {QUICK_ACTIONS.map((action, i) => (
                <Link
                  key={action.path}
                  href={action.path}
                  className="group bd-card p-5 hover:-translate-y-0.5 transition-all duration-200"
                  style={{ animationDelay: `${i * 0.1}s` }}
                >
                  <div className={`w-11 h-11 rounded-[var(--radius-md)] bg-gradient-to-br ${action.gradient} flex items-center justify-center text-white mb-4 shadow-lg`}>
                    <action.icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-semibold text-sm text-[var(--text-primary)]">{action.title}</h3>
                  <p className="text-xs text-[var(--text-secondary)] mt-1 mb-3">{action.desc}</p>
                  <div className="flex items-center gap-1 text-xs font-medium text-[var(--gold)] group-hover:gap-2 transition-all">
                    Accéder <ChevronRight className="w-3 h-3" />
                  </div>
                </Link>
              ))}
            </div>

            {/* IA Services */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-[var(--text-primary)]">Services IA</h2>
                <span className="text-xs text-[var(--text-muted)]">7 outils disponibles</span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
                {IA_SERVICES.map((service) => (
                  <Link
                    key={service.path}
                    href={service.path}
                    className="group bd-card p-4 flex flex-col items-center text-center hover:-translate-y-0.5 transition-all duration-200"
                  >
                    <div className={`w-10 h-10 rounded-[var(--radius-md)] bg-gradient-to-br ${service.gradient} flex items-center justify-center text-white mb-3 shadow-md`}>
                      <service.icon className="w-5 h-5" />
                    </div>
                    <h4 className="font-semibold text-xs text-[var(--text-primary)]">{service.title}</h4>
                    <p className="text-[10px] text-[var(--text-secondary)] mt-0.5">{service.desc}</p>
                  </Link>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <div className="bd-card p-6">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-semibold text-[var(--text-primary)]">Répartition par langage</h3>
                  <Code2 className="w-4 h-4 text-[var(--text-muted)]" />
                </div>
                <p className="text-xs text-[var(--text-secondary)] mb-4">Distribution des snippets</p>
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie data={langData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} innerRadius={55} paddingAngle={4}>
                      {langData.map((_, i) => (
                        <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} stroke="transparent" />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        background: 'var(--bg-card)',
                        border: '1px solid var(--border)',
                        borderRadius: 'var(--radius-md)',
                        fontSize: '13px',
                        color: 'var(--text-primary)',
                        boxShadow: 'var(--shadow-dropdown)',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex flex-wrap gap-2 mt-2 justify-center">
                  {langData.slice(0, 6).map((entry, i) => (
                    <div key={entry.name} className="flex items-center gap-1.5 text-xs">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ background: CHART_COLORS[i % CHART_COLORS.length] }} />
                      <span className="text-[var(--text-secondary)] capitalize">{entry.name}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bd-card p-6">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-semibold text-[var(--text-primary)]">Activité de recherche</h3>
                  <Activity className="w-4 h-4 text-[var(--text-muted)]" />
                </div>
                <p className="text-xs text-[var(--text-secondary)] mb-4">Tendance sur 7 jours</p>
                <ResponsiveContainer width="100%" height={280}>
                  <AreaChart data={trendData}>
                    <defs>
                      <linearGradient id="dSearches" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#2b3674" stopOpacity={0.12} />
                        <stop offset="95%" stopColor="#2b3674" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="dSuccess" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#05cd99" stopOpacity={0.12} />
                        <stop offset="95%" stopColor="#05cd99" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
                    <XAxis dataKey="day" stroke="var(--text-muted)" fontSize={12} />
                    <YAxis stroke="var(--text-muted)" fontSize={12} />
                    <Tooltip
                      contentStyle={{
                        background: 'var(--bg-card)',
                        border: '1px solid var(--border)',
                        borderRadius: 'var(--radius-md)',
                        fontSize: '13px',
                        color: 'var(--text-primary)',
                        boxShadow: 'var(--shadow-dropdown)',
                      }}
                    />
                    <Area type="monotone" dataKey="searches" stroke="#2b3674" strokeWidth={2.5} fillOpacity={1} fill="url(#dSearches)" name="Recherches" dot={false} />
                    <Area type="monotone" dataKey="success" stroke="#05cd99" strokeWidth={2.5} fillOpacity={1} fill="url(#dSuccess)" name="Réussies" dot={false} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bd-card p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <FileCode2 className="w-4 h-4 text-[var(--gold)]" />
                    <h3 className="font-semibold text-[var(--text-primary)]">Snippets récents</h3>
                  </div>
                  <Link href="/search" className="text-xs font-medium text-[var(--gold)] hover:underline flex items-center gap-1">
                    Tout voir <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
                <div className="space-y-2">
                  {snippets.slice(0, 5).map((snippet: any) => (
                    <div key={snippet.id} className="flex items-center gap-3 p-3 rounded-[var(--radius-md)] hover:bg-[var(--surface-hover)] transition-colors cursor-pointer">
                      <div className="w-8 h-8 rounded-[var(--radius-sm)] bg-[var(--primary)]/10 flex items-center justify-center shrink-0">
                        <FileCode2 className="w-4 h-4 text-[var(--primary)]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate text-[var(--text-primary)]">{snippet.name || snippet.title}</p>
                        <p className="text-xs text-[var(--text-secondary)] truncate">{snippet.docstring?.substring(0, 60) || snippet.file_path || ''}</p>
                      </div>
                      <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-md bg-[var(--surface-alt)] text-[var(--text-muted)]">{snippet.language}</span>
                    </div>
                  ))}
                  {snippets.length === 0 && (
                    <div className="bd-empty !py-8">
                      <FileCode2 className="w-8 h-8 text-[var(--text-muted)]/40 mb-2" />
                      <p className="text-sm text-[var(--text-secondary)]">Aucun snippet indexé pour le moment.</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="bd-card p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Search className="w-4 h-4 text-[var(--gold)]" />
                    <h3 className="font-semibold text-[var(--text-primary)]">Recherches récentes</h3>
                  </div>
                  <Link href="/analytics" className="text-xs font-medium text-[var(--gold)] hover:underline flex items-center gap-1">
                    Métriques <TrendingUp className="w-3 h-3" />
                  </Link>
                </div>
                <div className="space-y-2">
                  {searches.length === 0 ? (
                    <div className="bd-empty !py-8">
                      <Search className="w-8 h-8 text-[var(--text-muted)]/40 mb-2" />
                      <p className="text-sm text-[var(--text-secondary)]">Aucune recherche pour le moment.</p>
                    </div>
                  ) : (
                    searches.slice(0, 5).map((search: any) => (
                      <div key={search.id || search.created_date} className="flex items-center gap-3 p-3 rounded-[var(--radius-md)] hover:bg-[var(--surface-hover)] transition-colors cursor-pointer">
                        <div className="w-8 h-8 rounded-[var(--radius-sm)] bg-[var(--gold)]/10 flex items-center justify-center shrink-0">
                          <Search className="w-4 h-4 text-[var(--gold)]" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate text-[var(--text-primary)]">&ldquo;{search.query || '—'}&rdquo;</p>
                          <p className="text-xs text-[var(--text-secondary)]">{search.results_count ?? 0} résultats</p>
                        </div>
                        <span className="text-xs text-[var(--text-muted)] shrink-0">
                          {search.results_count ?? 0} résultats
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
