import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';
import { Building, Lock, Mail } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState<string>('ankit@hippo.com');
  const [password, setPassword] = useState<string>('Password123!');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      setError('');

      const response = await api.post('/auth/login', { email, password });
      const { token, user, employee } = response.data;

      login(token, user, employee);
      // Admin/Director land on the executive dashboard; agents on their MLM tree.
      const isAdmin = ['ADMIN', 'DIRECTOR'].includes(user.role);
      navigate(isAdmin ? '/dashboard' : '/mlm-tree');
    } catch (err: any) {
      console.error(err);
      setError(err.friendlyMessage || err.response?.data?.message || 'Invalid login credentials');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0F172A] flex items-center justify-center p-4">
      <div className="glass-panel p-8 rounded-3xl border border-[#1F2937] w-full max-w-md space-y-6 shadow-2xl">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#1E40AF] to-[#F97316] flex items-center justify-center mx-auto shadow-lg shadow-blue-900/50">
            <Building className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            HIPPO <span className="text-[#F97316]">CRM</span>
          </h1>
          <p className="text-xs text-[#94A3B8]">Real Estate MLM & Plot Management Platform</p>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-[#EF4444]/10 border border-[#EF4444]/30 text-[#EF4444] text-xs font-bold text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs text-[#94A3B8]">Email Address</label>
            <div className="relative mt-1">
              <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#0F172A] border border-[#1F2937] rounded-xl pl-9 pr-4 py-2.5 text-xs text-white placeholder-[#94A3B8] focus:outline-none focus:border-[#1E40AF]"
              />
            </div>
          </div>

          <div>
            <label className="text-xs text-[#94A3B8]">Password</label>
            <div className="relative mt-1">
              <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#0F172A] border border-[#1F2937] rounded-xl pl-9 pr-4 py-2.5 text-xs text-white placeholder-[#94A3B8] focus:outline-none focus:border-[#1E40AF]"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-[#1E40AF] to-blue-900 text-white font-bold text-xs shadow-lg shadow-blue-900/40 hover:opacity-90 transition-all flex items-center justify-center"
          >
            {isLoading ? 'Authenticating...' : 'Sign In to Dashboard'}
          </button>
        </form>

        <div className="p-3 rounded-xl bg-[#0F172A] border border-[#1F2937] text-[11px] text-[#94A3B8] space-y-1">
          <p className="font-bold text-white">Default Demo Credentials:</p>
          <p>Email: <span className="text-[#3B82F6]">ankit@hippo.com</span></p>
          <p>Password: <span className="text-[#3B82F6]">Password123!</span></p>
        </div>
      </div>
    </div>
  );
};
