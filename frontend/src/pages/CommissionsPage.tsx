import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Commission } from '../types';
import { DollarSign, CheckCircle2, Clock } from 'lucide-react';

export const CommissionsPage: React.FC = () => {
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [summary, setSummary] = useState<any>(null);

  useEffect(() => {
    fetchCommissions();
  }, []);

  const fetchCommissions = async () => {
    try {
      const [listRes, sumRes] = await Promise.all([
        api.get('/commissions'),
        api.get('/commissions/summary')
      ]);
      setCommissions(listRes.data);
      setSummary(sumRes.data);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-extrabold text-[#F8FAFC]">Differential Commission Ledger</h2>
          <p className="text-xs text-[#94A3B8] mt-1">Multi-tier commission distribution logs generated from plot sales</p>
        </div>
      </div>

      {summary && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="glass-card p-5 rounded-2xl border border-[#1F2937] flex items-center justify-between">
            <div>
              <p className="text-xs text-[#94A3B8]">Total Commissions Paid</p>
              <h3 className="text-2xl font-extrabold text-[#22C55E] mt-1">₹{summary.totalPaid.toLocaleString()}</h3>
            </div>
            <CheckCircle2 className="w-8 h-8 text-[#22C55E]" />
          </div>

          <div className="glass-card p-5 rounded-2xl border border-[#1F2937] flex items-center justify-between">
            <div>
              <p className="text-xs text-[#94A3B8]">Commissions Pending Payout</p>
              <h3 className="text-2xl font-extrabold text-[#FACC15] mt-1">₹{summary.totalPending.toLocaleString()}</h3>
            </div>
            <Clock className="w-8 h-8 text-[#FACC15]" />
          </div>
        </div>
      )}

      <div className="glass-card p-6 rounded-2xl border border-[#1F2937]">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-white">
            <thead className="bg-[#0F172A] text-[#94A3B8] uppercase text-[10px]">
              <tr>
                <th className="p-3">Agent</th>
                <th className="p-3">Rank at Sale</th>
                <th className="p-3">Plot</th>
                <th className="p-3">Sale Amount</th>
                <th className="p-3">Rank Rate</th>
                <th className="p-3">Diff Rate</th>
                <th className="p-3">Commission Earned</th>
                <th className="p-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1F2937]">
              {commissions.map((comm) => (
                <tr key={comm._id} className="hover:bg-[#111827]">
                  <td className="p-3 font-bold">{comm.employeeId?.userId?.fullName || 'Agent'}</td>
                  <td className="p-3 text-[#3B82F6]">{comm.rankAtSale}</td>
                  <td className="p-3 font-mono">{comm.plotId ? comm.plotId.plotNo : 'Plot'}</td>
                  <td className="p-3">₹{comm.saleAmount.toLocaleString()}</td>
                  <td className="p-3">{comm.commissionRate}%</td>
                  <td className="p-3 font-bold text-[#F97316]">{comm.differentialRate}%</td>
                  <td className="p-3 font-extrabold text-[#22C55E]">₹{comm.commissionAmount.toLocaleString()}</td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      comm.status === 'PAID' ? 'bg-[#22C55E]/20 text-[#22C55E]' : 'bg-[#FACC15]/20 text-[#FACC15]'
                    }`}>
                      {comm.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
