import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { MLMTreeNode, Employee } from '../types';
import { MLMTreeVisualizer } from '../components/mlm/MLMTreeVisualizer';
import { Award, Layers, Users, Zap, CheckCircle2, ShieldCheck, Filter } from 'lucide-react';

export const MLMTreePage: React.FC = () => {
  const [treeData, setTreeData] = useState<MLMTreeNode | null>(null);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedRootId, setSelectedRootId] = useState<string>('');
  const [rankRules, setRankRules] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      setIsLoading(true);
      const [treeRes, rulesRes, empRes] = await Promise.all([
        api.get('/mlm/tree'),
        api.get('/mlm/rank-rules'),
        api.get('/employees')
      ]);

      setTreeData(treeRes.data);
      setRankRules(rulesRes.data);
      setEmployees(empRes.data);

      if (treeRes.data && treeRes.data.id) {
        setSelectedRootId(treeRes.data.id);
      }
    } catch (error) {
      console.error('Failed to load MLM network data', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRootChange = async (rootId: string) => {
    if (!rootId) return;
    setSelectedRootId(rootId);
    try {
      setIsLoading(true);
      const treeRes = await api.get(`/mlm/tree?rootId=${rootId}`);
      setTreeData(treeRes.data);
    } catch (error) {
      console.error('Failed to fetch tree for root ID', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Qualified Directors
  const salesDirectors = employees.filter(
    (e) => e.currentRank === 'Director Sales' || e.currentRank === 'Associate Sales Director'
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header & Leader Root Selector */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-[#F8FAFC]">Multi-Level Network Hierarchy</h2>
          <p className="text-xs text-[#94A3B8] mt-1">Unlimited depth downline sponsor visualizer & Sales Director network trees</p>
        </div>

        {/* Tree Root Leader Selector Dropdown */}
        <div className="flex items-center gap-3 bg-[#111827] px-4 py-2 rounded-2xl border border-[#1F2937] shadow-xl">
          <ShieldCheck className="w-5 h-5 text-[#F97316]" />
          <div>
            <label className="text-[10px] text-[#94A3B8] font-bold uppercase tracking-wider block">Focus Tree Root Leader</label>
            <select
              value={selectedRootId}
              onChange={(e) => handleRootChange(e.target.value)}
              className="bg-[#0F172A] border border-[#1E40AF]/40 rounded-xl px-3 py-1 text-xs font-bold text-white focus:outline-none focus:border-[#1E40AF]"
            >
              {employees.map((emp) => {
                const empId = (emp as any)._id || emp.id;
                const empName = emp.userId ? emp.userId.fullName : emp.employeeCode;
                return (
                  <option key={empId} value={empId}>
                    {empName} ({emp.employeeCode} - {emp.currentRank})
                  </option>
                );
              })}
            </select>
          </div>
        </div>
      </div>

      {/* Qualified Sales Directors Highlight Bar */}
      {salesDirectors.length > 0 && (
        <div className="glass-card p-4 rounded-2xl border border-[#1F2937] flex items-center gap-4 flex-wrap">
          <span className="text-xs font-extrabold text-white uppercase tracking-wider flex items-center gap-1.5">
            <Award className="w-4 h-4 text-[#F97316]" /> Top Sales Directors ({salesDirectors.length}):
          </span>
          <div className="flex items-center gap-2 flex-wrap">
            {salesDirectors.map((dir) => {
              const dirId = (dir as any)._id || dir.id;
              const dirName = dir.userId ? dir.userId.fullName : dir.employeeCode;
              return (
                <button
                  key={dirId}
                  onClick={() => handleRootChange(dirId)}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all border ${
                    selectedRootId === dirId
                      ? 'bg-gradient-to-r from-purple-600 to-indigo-700 text-white border-purple-400 shadow-lg'
                      : 'bg-[#0F172A] text-[#94A3B8] hover:text-white border-[#1F2937]'
                  }`}
                >
                  ⭐ {dirName} ({dir.currentRank})
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Rank Qualification Rules Matrix (Hippo Business Plan) */}
      <div className="glass-card p-5 rounded-2xl border border-[#1F2937]">
        <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
          <Award className="w-4 h-4 text-[#F97316]" /> Hippo Business Plan Qualification Matrix
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          {rankRules.map((rule, idx) => (
            <div key={idx} className="bg-[#0F172A] p-3 rounded-xl border border-[#1F2937] hover:border-[#1E40AF]">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white">{rule.rank}</span>
                <span className="text-[#F97316] font-extrabold">{rule.commissionPercent}%</span>
              </div>
              <div className="mt-2 text-[10px] text-[#94A3B8] space-y-1">
                <p>Self Sales: <span className="text-white font-bold">{rule.minSelfSales}</span></p>
                <p>Team Sales: <span className="text-white font-bold">{rule.minTeamSales}</span></p>
                <p>Min Legs: <span className="text-white font-bold">{rule.minLegs}</span></p>
                {rule.timeLimitDays && (
                  <p className="text-[#FACC15] font-semibold">Time Window: 2 Months</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Visual Tree Graph Component */}
      {isLoading ? (
        <div className="flex justify-center p-12">
          <div className="w-8 h-8 border-4 border-[#1E40AF] border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : treeData ? (
        <MLMTreeVisualizer treeData={treeData} />
      ) : (
        <div className="text-center p-8 glass-panel rounded-2xl">No hierarchy data available</div>
      )}
    </div>
  );
};
