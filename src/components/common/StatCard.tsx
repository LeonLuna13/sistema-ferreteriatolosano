import React from 'react';
import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtext?: string;
  icon: LucideIcon;
  variant?: 'primary' | 'amber' | 'emerald' | 'rose' | 'blue';
  onClick?: () => void;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtext,
  icon: Icon,
  variant = 'primary',
  onClick,
}) => {
  const styles = {
    primary: {
      bg: 'bg-white border-slate-200 hover:border-slate-300',
      iconBg: 'bg-slate-900 text-amber-400',
      valueColor: 'text-slate-900',
    },
    amber: {
      bg: 'bg-white border-amber-200 hover:border-amber-300',
      iconBg: 'bg-amber-100 text-amber-600',
      valueColor: 'text-amber-700',
    },
    emerald: {
      bg: 'bg-white border-emerald-200 hover:border-emerald-300',
      iconBg: 'bg-emerald-100 text-emerald-600',
      valueColor: 'text-emerald-700',
    },
    rose: {
      bg: 'bg-white border-rose-200 hover:border-rose-300',
      iconBg: 'bg-rose-100 text-rose-600',
      valueColor: 'text-rose-700',
    },
    blue: {
      bg: 'bg-white border-blue-200 hover:border-blue-300',
      iconBg: 'bg-blue-100 text-blue-700',
      valueColor: 'text-blue-900',
    },
  }[variant];

  return (
    <div
      onClick={onClick}
      className={`rounded-xl border p-5 shadow-sm transition-all duration-200 ${styles.bg} ${
        onClick ? 'cursor-pointer hover:shadow-md hover:-translate-y-0.5' : ''
      }`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{title}</p>
          <h4 className={`text-2xl font-extrabold tracking-tight mt-1.5 ${styles.valueColor}`}>
            {value}
          </h4>
          {subtext && <p className="text-xs text-slate-500 mt-1 font-medium">{subtext}</p>}
        </div>
        <div className={`p-3 rounded-xl shadow-inner ${styles.iconBg}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
};
