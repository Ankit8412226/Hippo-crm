import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Search, Bell, LogOut, ShieldCheck, Award } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ROLE_LABEL: Record<string, string> = {
  ADMIN: 'Company Owner',
  DIRECTOR: 'Director',
  MANAGER: 'Manager',
  AGENT: 'Agent',
  EMPLOYEE: 'Employee'
};

export const Header: React.FC = () => {
  const { user, employee, logout } = useAuth();
  const navigate = useNavigate();

  const isAdmin = !!user && ['ADMIN', 'DIRECTOR'].includes(user.role);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="h-16 bg-[#111827]/80 backdrop-blur-md border-b border-[#1F2937] px-6 flex items-center justify-between sticky top-0 z-20">
      {/* Search Input */}
      <div className="relative w-72">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
        <input
          type="text"
          placeholder="Search plots, agents, projects..."
          className="w-full bg-[#0F172A] border border-[#1F2937] rounded-xl pl-9 pr-4 py-2 text-xs text-[#F8FAFC] placeholder-[#94A3B8] focus:outline-none focus:border-[#1E40AF]"
        />
      </div>

      {/* User Actions */}
      <div className="flex items-center gap-4">
        {/* Notification Bell Badge */}
        <button
          onClick={() => navigate('/notifications')}
          className="relative p-2 rounded-xl bg-[#0F172A] border border-[#1F2937] text-[#94A3B8] hover:text-white transition-colors"
        >
          <Bell className="w-5 h-5" />
          <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#F97316]"></span>
        </button>

        {/* Access-role Badge (Owner vs Agent) */}
        {user && (
          <div
            className={`px-3 py-1.5 rounded-full flex items-center gap-1.5 text-xs font-semibold border ${
              isAdmin
                ? 'bg-[#F97316]/15 border-[#F97316]/40 text-[#F97316]'
                : 'bg-[#22C55E]/15 border-[#22C55E]/40 text-[#22C55E]'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>{ROLE_LABEL[user.role] || user.role}</span>
          </div>
        )}

        {/* Current MLM Rank Badge */}
        {employee && (
          <div className="px-3 py-1.5 rounded-full bg-[#1E40AF]/20 border border-[#1E40AF]/40 flex items-center gap-1.5 text-xs text-[#3B82F6] font-semibold">
            <Award className="w-3.5 h-3.5" />
            <span>{employee.currentRank}</span>
          </div>
        )}

        {/* Profile Dropdown / User Details */}
        <div className="flex items-center gap-3 pl-2 border-l border-[#1F2937]">
          <div className="w-9 h-9 rounded-full bg-[#1E40AF] flex items-center justify-center font-bold text-sm text-white shadow-md">
            {user ? user.fullName.charAt(0) : 'A'}
          </div>
          <div className="hidden md:block">
            <p className="text-xs font-bold text-[#F8FAFC] leading-none">{user ? user.fullName : 'Ankit Kumar'}</p>
            <p className="text-[10px] text-[#94A3B8] font-medium mt-0.5">{user ? user.role : 'ADMIN'}</p>
          </div>
          <button
            onClick={handleLogout}
            title="Logout"
            className="p-2 text-[#94A3B8] hover:text-[#EF4444] transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
