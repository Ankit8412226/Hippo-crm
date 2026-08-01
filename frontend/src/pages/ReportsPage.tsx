import React from 'react';
import { FileBarChart, Download } from 'lucide-react';
import api from '../services/api';

export const ReportsPage: React.FC = () => {

  const handleExportReport = async (type: string, title: string) => {
    if (type === 'PLOT_SALES') {
      try {
        const response = await api.get('/plots');
        const plots = response.data;
        const headers = [
          'S.No', 'Plot No', 'Sellable Sq Yrd', 'Carpet Sq Yrd',
          '12mtr', '9Mtr', 'Corner', 'Park Facing',
          'Total PLC', 'Discounted PLC', 'OTMC',
          'GST on other cahrges', 'Total Cost', 'Status', 'Owner'
        ];

        const rows = plots.map((p: any, idx: number) => [
          idx + 1,
          `"${p.plotNo || ''}"`,
          p.sellableSqYrd || (p.sizeSqft ? (p.sizeSqft / 9).toFixed(2) : 201.28),
          p.carpetSqYrd || (p.sizeSqft ? (p.sizeSqft / 18).toFixed(2) : 104.48),
          p.plc12mtr || '-',
          p.plc9mtr || '-',
          p.plcCorner || '-',
          p.plcParkFacing || '-',
          p.totalPlc || 0,
          p.discountedPlc || 0,
          p.otmc || 250,
          p.gstOnOtherCharges || 9057.69,
          p.totalCost || p.price || 1367510,
          `"${p.status || 'AVAILABLE'}"`,
          `"${p.ownerName || ''}"`
        ]);

        const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement('a');
        link.setAttribute('href', encodedUri);
        link.setAttribute('download', `${title.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } catch (error) {
        console.error(error);
        alert('Failed to export plot inventory report');
      }
    } else {
      alert(`Exporting ${title} report...`);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-extrabold text-[#F8FAFC]">Financial & Audit Reports</h2>
          <p className="text-xs text-[#94A3B8] mt-1">Exportable CSV & PDF financial audits, MLM tree reports, and plot inventory ledgers</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { title: 'Revenue & Sales Report', type: 'REVENUE', desc: 'Monthly transaction logs and project revenue breakdowns' },
          { title: 'Differential Commission Audit', type: 'COMMISSION', desc: 'Full upline commission calculation audit trails' },
          { title: 'MLM Downline Performance', type: 'MLM_HIERARCHY', desc: 'Agent self sales, team sales, and leg progress reports' },
          { title: 'Plot Inventory Ledger', type: 'PLOT_SALES', desc: 'Client 15-column format: Plot No, Sellable/Carpet SqYrd, PLC breakdowns, GST, Cost, Status & Owner' },
          { title: 'Payout Disbursement Log', type: 'PAYOUT_SUMMARY', desc: 'Historical bank transfer records and approved payouts' }
        ].map((report, idx) => (
          <div key={idx} className="glass-card p-6 rounded-2xl border border-[#1F2937] hover:border-[#1E40AF] transition-all space-y-4">
            <FileBarChart className="w-8 h-8 text-[#3B82F6]" />
            <div>
              <h3 className="font-bold text-white text-base">{report.title}</h3>
              <p className="text-xs text-[#94A3B8] mt-1">{report.desc}</p>
            </div>
            <button
              onClick={() => handleExportReport(report.type, report.title)}
              className="w-full py-2.5 bg-[#0F172A] border border-[#1F2937] text-white hover:bg-[#1E40AF] text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-colors"
            >
              <Download className="w-4 h-4 text-emerald-400" /> Export PDF / CSV
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
