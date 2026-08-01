import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  GitMerge,
  Building2,
  MapPin,
  Map,
  DollarSign,
  CreditCard,
  ScanText,
  FileBarChart,
  Bell,
  Settings,
  ShieldCheck,
  Building
} from 'lucide-react';

const navigationItems = [
  { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { name: 'Employees', path: '/employees', icon: Users },
  { name: 'MLM Tree', path: '/mlm-tree', icon: GitMerge },
  { name: 'Projects', path: '/projects', icon: Building2 },
  { name: 'Plot Management', path: '/plots', icon: MapPin },
  { name: 'Plot Maps', path: '/plot-maps', icon: Map },
  { name: 'Commissions', path: '/commissions', icon: DollarSign },
  { name: 'Payouts', path: '/payouts', icon: CreditCard },
  { name: 'OCR Analyzer', path: '/ocr-analyzer', icon: ScanText },
  { name: 'Reports', path: '/reports', icon: FileBarChart },
  { name: 'Notifications', path: '/notifications', icon: Bell },
  { name: 'Settings', path: '/settings', icon: Settings },
];

export const Sidebar: React.FC = () => {
  return (
    <aside className="w-64 bg-[#111827] border-r border-[#1F2937] flex flex-col h-screen sticky top-0 z-30 select-none">
      {/* Brand Header */}
      <div className="p-5 border-b border-[#1F2937] flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#1E40AF] to-[#F97316] flex items-center justify-center shadow-lg shadow-blue-900/40">
          <Building className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="font-extrabold text-lg text-[#F8FAFC] tracking-tight leading-none">
            HIPPO <span className="text-[#F97316]">CRM</span>
          </h1>
          <p className="text-[10px] text-[#94A3B8] font-medium tracking-wide uppercase mt-1">Real Estate MLM Platform</p>
        </div>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-[#1E40AF] to-blue-900 text-white shadow-md shadow-blue-900/30'
                    : 'text-[#94A3B8] hover:bg-[#1F2937] hover:text-[#F8FAFC]'
                }`
              }
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              <span>{item.name}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Enterprise Footer */}
      <div className="p-4 border-t border-[#1F2937] bg-[#0F172A]/50">
        <div className="flex items-center gap-2 text-xs text-[#94A3B8]">
          <ShieldCheck className="w-4 h-4 text-[#22C55E]" />
          <span>Multi-Tier MLM System v1.0</span>
        </div>
      </div>
    </aside>
  );
};
