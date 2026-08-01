import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  color?: string;
  trend?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  color = 'from-[#1E40AF] to-blue-900',
  trend
}) => {
  return (
    <div className="glass-card p-5 rounded-2xl border border-[#1F2937] hover:border-[#334155] transition-all duration-300 shadow-xl relative overflow-hidden group">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium text-[#94A3B8] uppercase tracking-wider">{title}</p>
          <h3 className="text-2xl font-extrabold text-[#F8FAFC] mt-2 tracking-tight">{value}</h3>
          {subtitle && <p className="text-xs text-[#94A3B8] mt-1">{subtitle}</p>}
          {trend && (
            <span className="inline-block mt-2 text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#22C55E]/10 text-[#22C55E] border border-[#22C55E]/30">
              {trend}
            </span>
          )}
        </div>
        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform duration-300`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
};
