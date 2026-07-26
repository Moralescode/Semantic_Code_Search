import React from 'react';
import { motion } from 'framer-motion';
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  sublabel?: string;
  color: string;
  delay?: number;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
}

const TREND_COLORS = {
  up: 'text-[var(--success)]',
  down: 'text-[var(--danger)]',
  neutral: 'text-[var(--text-muted)]',
};

export default function StatCard({
  icon: Icon,
  label,
  value,
  sublabel,
  color,
  delay = 0,
  trend,
  trendValue,
}: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: delay * 0.08, duration: 0.5, ease: 'easeOut' }}
      className="bd-metric-card"
    >
      <div className="flex items-center justify-between mb-1">
        <div
          className="metric-icon"
          style={{ background: `linear-gradient(135deg, ${color}, ${color}dd)` }}
        >
          <Icon className="w-5 h-5" />
        </div>
        {trend && (
          <div className={`flex items-center gap-1 text-xs font-medium ${TREND_COLORS[trend]}`}>
            {trend === 'up' && <TrendingUp className="w-3.5 h-3.5" />}
            {trend === 'down' && <TrendingDown className="w-3.5 h-3.5" />}
            {trendValue && <span>{trendValue}</span>}
          </div>
        )}
      </div>
      <div className="metric-value">{value}</div>
      <div className="metric-label">{label}</div>
      {sublabel && (
        <div className="text-[11px] text-[var(--text-muted)] mt-1.5">{sublabel}</div>
      )}
    </motion.div>
  );
}
