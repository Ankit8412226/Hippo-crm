import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { DashboardStats } from '../types';
import { StatCard } from '../components/dashboard/StatCard';
import { RevenueChart } from '../components/dashboard/RevenueChart';
import { PlotStatusDistribution } from '../components/dashboard/PlotStatusDistribution';
import { DollarSign, Users, Building2, MapPin, Award, CreditCard, TrendingUp } from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const response = await api.get('/dashboard/stats');
      setStats(response.data);
    } catch (error) {
      console.error('Failed to fetch dashboard stats', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading || !stats) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-8 h-8 border-4 border-[#1E40AF] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const { kpi, charts } = stats;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Page Title */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-extrabold text-[#F8FAFC]">Executive CRM Dashboard</h2>
          <p className="text-xs text-[#94A3B8] mt-1">Real-time financial performance, plot inventory & MLM downline metrics</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full bg-[#22C55E]/10 border border-[#22C55E]/30 text-[#22C55E] text-xs font-bold">
            ● System Active
          </span>
        </div>
      </div>

      {/* KPI Stat Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Total Sales Revenue"
          value={`₹${(kpi.totalRevenue / 10000000).toFixed(2)} Cr`}
          subtitle="Lifetime Gross Transaction Volume"
          icon={DollarSign}
          color="from-[#1E40AF] to-blue-900"
          trend="+18.4% MoM"
        />
        <StatCard
          title="Monthly Revenue"
          value={`₹${(kpi.monthlyRevenue / 100000).toFixed(2)} Lakh`}
          subtitle="Current Billing Cycle"
          icon={TrendingUp}
          color="from-cyan-600 to-blue-800"
          trend="+12.2% vs target"
        />
        <StatCard
          title="Active MLM Agents"
          value={kpi.totalEmployees}
          subtitle="Across 7 Qualification Tiers"
          icon={Users}
          color="from-purple-600 to-indigo-900"
        />
        <StatCard
          title="Total Real Estate Plots"
          value={kpi.totalPlots}
          subtitle={`${kpi.availablePlots} Available • ${kpi.soldPlots} Sold`}
          icon={MapPin}
          color="from-emerald-600 to-teal-900"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RevenueChart data={charts.revenueTrend} />
        </div>
        <div>
          <PlotStatusDistribution data={charts.plotStatusDistribution} />
        </div>
      </div>

      {/* Bottom Performance Leaderboard */}
      <div className="glass-card p-6 rounded-2xl border border-[#1F2937]">
        <h3 className="text-base font-bold text-white mb-4">Top Performing MLM Sales Executives</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[#F8FAFC]">
            <thead className="bg-[#0F172A] text-[#94A3B8] uppercase text-[10px]">
              <tr>
                <th className="p-3">Rank</th>
                <th className="p-3">Executive Name</th>
                <th className="p-3">Current MLM Tier</th>
                <th className="p-3">Self Sales</th>
                <th className="p-3">Team Sales</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1F2937]">
              {charts.topEmployees.map((emp, index) => (
                <tr key={index} className="hover:bg-[#1F2937]/50 transition-colors">
                  <td className="p-3 font-bold text-[#F97316]">#{index + 1}</td>
                  <td className="p-3 font-bold">{emp.name}</td>
                  <td className="p-3">
                    <span className="px-2.5 py-0.5 rounded-full bg-[#1E40AF]/20 text-[#3B82F6] text-[10px] font-bold border border-[#1E40AF]/40">
                      {emp.rank}
                    </span>
                  </td>
                  <td className="p-3 font-bold text-white">{emp.sales}</td>
                  <td className="p-3 font-bold text-[#22C55E]">{emp.teamSales}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
