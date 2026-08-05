import React, { useState } from 'react';
import { FileBarChart, Download, Loader2 } from 'lucide-react';
import api from '../services/api';
import { useToast } from '../context/ToastContext';

// Each report maps to a real backend endpoint that streams a CSV of live data.
const REPORTS = [
  { title: 'Revenue & Sales Report', type: 'REVENUE', endpoint: '/reports/revenue', desc: 'Every completed sale transaction with project, plot, buyer, seller & amount' },
  { title: 'Differential Commission Audit', type: 'COMMISSION', endpoint: '/reports/commission-audit', desc: 'Full upline differential commission calculation audit trail' },
  { title: 'MLM Downline Performance', type: 'MLM_HIERARCHY', endpoint: '/reports/mlm-performance', desc: 'Agent self sales, team sales, active legs, rank & sponsor' },
  { title: 'Plot Inventory Ledger', type: 'PLOT_SALES', endpoint: '/reports/plot-ledger', desc: 'Client 15-column format: Plot No, Sellable/Carpet SqYrd, PLC, GST, Cost, Status & Owner' },
  { title: 'Payout Disbursement Log', type: 'PAYOUT_SUMMARY', endpoint: '/reports/payout-summary', desc: 'Requested & approved payouts with settled commission counts' }
];

export const ReportsPage: React.FC = () => {
  const [loading, setLoading] = useState<string | null>(null);
  const toast = useToast();

  const handleExportReport = async (endpoint: string, title: string) => {
    try {
      setLoading(endpoint);
      const response = await api.get(endpoint, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${title.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success(`${title} exported`);
    } catch (error: any) {
      console.error(error);
      toast.error(error.friendlyMessage || `Failed to export "${title}" (admin only).`);
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-extrabold text-[#F8FAFC]">Financial & Audit Reports</h2>
          <p className="text-xs text-[#94A3B8] mt-1">Exportable CSV financial audits, MLM tree reports, and plot inventory ledgers — generated from live data</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {REPORTS.map((report, idx) => (
          <div key={idx} className="glass-card p-6 rounded-2xl border border-[#1F2937] hover:border-[#1E40AF] transition-all space-y-4">
            <FileBarChart className="w-8 h-8 text-[#3B82F6]" />
            <div>
              <h3 className="font-bold text-white text-base">{report.title}</h3>
              <p className="text-xs text-[#94A3B8] mt-1">{report.desc}</p>
            </div>
            <button
              onClick={() => handleExportReport(report.endpoint, report.title)}
              disabled={loading === report.endpoint}
              className="w-full py-2.5 bg-[#0F172A] border border-[#1F2937] text-white hover:bg-[#1E40AF] text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-colors disabled:opacity-60"
            >
              {loading === report.endpoint ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Generating...</>
              ) : (
                <><Download className="w-4 h-4 text-emerald-400" /> Export CSV</>
              )}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
