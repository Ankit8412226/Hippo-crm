import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Payout, Employee } from '../types';
import { RequestPayoutModal } from '../components/commissions/RequestPayoutModal';
import { CreditCard, Plus, RefreshCw, CheckCircle2 } from 'lucide-react';

export const PayoutsPage: React.FC = () => {
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRequestModalOpen, setIsRequestModalOpen] = useState<boolean>(false);

  useEffect(() => {
    fetchPayoutsAndAgents();
  }, []);

  const fetchPayoutsAndAgents = async () => {
    try {
      setIsLoading(true);
      const [payRes, empRes] = await Promise.all([
        api.get('/payouts'),
        api.get('/employees')
      ]);
      setPayouts(payRes.data);
      setEmployees(empRes.data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      await api.post(`/payouts/${id}/approve`);
      alert('Payout approved & processed! Multi-channel WhatsApp notification sent to agent.');
      fetchPayoutsAndAgents();
    } catch (e) {
      console.error(e);
      alert('Failed to approve payout');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-extrabold text-[#F8FAFC]">Agent Earnings Payouts & Disbursements</h2>
          <p className="text-xs text-[#94A3B8] mt-1">Disburse calculated commissions and send multi-channel notifications</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchPayoutsAndAgents}
            className="p-2.5 rounded-xl bg-[#111827] border border-[#1F2937] text-[#94A3B8] hover:text-white transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={() => setIsRequestModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#22C55E] to-emerald-600 text-white font-bold text-xs shadow-lg hover:opacity-90 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Request Payout
          </button>
        </div>
      </div>

      {/* Payouts Directory Table */}
      <div className="glass-card p-6 rounded-2xl border border-[#1F2937]">
        {isLoading ? (
          <div className="flex justify-center p-8">
            <div className="w-8 h-8 border-4 border-[#1E40AF] border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-white">
              <thead className="bg-[#0F172A] text-[#94A3B8] uppercase text-[10px]">
                <tr>
                  <th className="p-3">Reference No</th>
                  <th className="p-3">Agent</th>
                  <th className="p-3">Payout Amount</th>
                  <th className="p-3">Request Date</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1F2937]">
                {payouts.map((p) => (
                  <tr key={p._id} className="hover:bg-[#111827]">
                    <td className="p-3 font-mono font-bold text-[#F97316]">{p.referenceNo}</td>
                    <td className="p-3 font-bold">{p.employeeId?.userId?.fullName || 'Agent'}</td>
                    <td className="p-3 font-extrabold text-[#22C55E]">₹{p.amount.toLocaleString()}</td>
                    <td className="p-3 text-[#94A3B8]">{new Date(p.payoutDate).toLocaleDateString()}</td>
                    <td className="p-3">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        p.status === 'COMPLETED' ? 'bg-[#22C55E]/20 text-[#22C55E]' : 'bg-[#FACC15]/20 text-[#FACC15]'
                      }`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="p-3">
                      {p.status === 'PENDING' ? (
                        <button
                          onClick={() => handleApprove(p._id)}
                          className="px-3 py-1 bg-gradient-to-r from-[#22C55E] to-emerald-600 text-white font-bold rounded-lg text-xs hover:opacity-90 shadow-md flex items-center gap-1"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" /> Approve & Pay
                        </button>
                      ) : (
                        <span className="text-[#22C55E] text-[10px] font-bold">✔ Disbursed</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Request Payout Modal */}
      {isRequestModalOpen && (
        <RequestPayoutModal
          employees={employees}
          onClose={() => setIsRequestModalOpen(false)}
          onSuccess={fetchPayoutsAndAgents}
        />
      )}
    </div>
  );
};
