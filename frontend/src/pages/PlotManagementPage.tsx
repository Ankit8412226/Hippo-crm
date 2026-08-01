import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Plot, Project } from '../types';
import { PlotMapCanvas } from '../components/plots/PlotMapCanvas';
import { PlotDetailModal } from '../components/plots/PlotDetailModal';
import { useAuth } from '../context/AuthContext';
import { LayoutGrid, Table, Download, Upload, RefreshCw, Filter, Search, CheckCircle2, ShieldAlert } from 'lucide-react';

export const PlotManagementPage: React.FC = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN' || user?.role === 'DIRECTOR';
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [plots, setPlots] = useState<Plot[]>([]);
  const [selectedPlot, setSelectedPlot] = useState<Plot | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [viewMode, setViewMode] = useState<'MAP' | 'REPORT_TABLE'>(isAdmin ? 'REPORT_TABLE' : 'MAP');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [isImporting, setIsImporting] = useState<boolean>(false);

  useEffect(() => {
    fetchProjectsAndPlots();
  }, []);

  const fetchProjectsAndPlots = async () => {
    try {
      setIsLoading(true);
      const [projRes, plotRes] = await Promise.all([
        api.get('/projects'),
        api.get('/plots')
      ]);

      setProjects(projRes.data);
      if (projRes.data.length > 0 && !selectedProjectId) {
        setSelectedProjectId(projRes.data[0]._id);
      }
      setPlots(plotRes.data);
    } catch (error) {
      console.error('Failed to load plot management data', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportCSV = () => {
    const filtered = filteredPlots;
    const headers = [
      'S.No', 'Plot No', 'Sellable Sq Yrd', 'Carpet Sq Yrd',
      '12mtr', '9Mtr', 'Corner', 'Park Facing',
      'Total PLC', 'Discounted PLC', 'OTMC',
      'GST on other cahrges', 'Total Cost', 'Status', 'Owner'
    ];

    const rows = filtered.map((p, idx) => [
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
    link.setAttribute('download', `Plot_Inventory_Report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImportCSVFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        setIsImporting(true);
        const text = evt.target?.result as string;
        const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
        if (lines.length <= 1) {
          alert('CSV file is empty or invalid');
          return;
        }

        const headers = lines[0].split(',').map(h => h.replace(/"/g, '').trim());
        const plotsData = lines.slice(1).map(line => {
          const cols = line.split(',').map(c => c.replace(/"/g, '').trim());
          const obj: any = {};
          headers.forEach((h, idx) => {
            obj[h] = cols[idx] || '';
          });
          return obj;
        });

        await api.post('/plots/import-csv', {
          projectId: selectedProjectId || projects[0]?._id,
          plotsData
        });

        alert(`Successfully imported ${plotsData.length} plots into database!`);
        fetchProjectsAndPlots();
      } catch (error) {
        console.error(error);
        alert('Failed to import CSV file');
      } finally {
        setIsImporting(false);
      }
    };
    reader.readAsText(file);
  };

  const filteredPlots = plots.filter(p => {
    const matchesProject = !selectedProjectId || (typeof p.projectId === 'string' ? p.projectId === selectedProjectId : p.projectId?._id === selectedProjectId);
    const matchesSearch = !searchQuery || p.plotNo.toLowerCase().includes(searchQuery.toLowerCase()) || (p.ownerName && p.ownerName.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesStatus = statusFilter === 'ALL' || p.status === statusFilter;
    return matchesProject && matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-[#F8FAFC]">Project Plot Management & Naksa Canvas</h2>
          <p className="text-xs text-[#94A3B8] mt-1">Interactive layout map canvas & plot inventory management</p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          {isAdmin && (
            <div className="bg-[#111827] border border-[#1F2937] p-1 rounded-xl flex items-center gap-1">
              <button
                onClick={() => setViewMode('REPORT_TABLE')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
                  viewMode === 'REPORT_TABLE'
                    ? 'bg-[#1E40AF] text-white shadow-md'
                    : 'text-[#94A3B8] hover:text-white'
                }`}
              >
                <Table className="w-4 h-4" /> Client Report Ledger
              </button>
              <button
                onClick={() => setViewMode('MAP')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
                  viewMode === 'MAP'
                    ? 'bg-[#1E40AF] text-white shadow-md'
                    : 'text-[#94A3B8] hover:text-white'
                }`}
              >
                <LayoutGrid className="w-4 h-4" /> Map Canvas
              </button>
            </div>
          )}

          {isAdmin && (
            <>
              <button
                onClick={handleExportCSV}
                className="px-3.5 py-2 rounded-xl bg-emerald-600/20 border border-emerald-500/40 text-emerald-400 hover:bg-emerald-600 hover:text-white transition-all flex items-center gap-2 text-xs font-bold shadow-lg"
              >
                <Download className="w-4 h-4" /> Export CSV Report
              </button>

              <label className="px-3.5 py-2 rounded-xl bg-[#1E40AF]/20 border border-[#1E40AF]/40 text-[#3B82F6] hover:bg-[#1E40AF] hover:text-white transition-all cursor-pointer flex items-center gap-2 text-xs font-bold shadow-lg">
                <Upload className="w-4 h-4" /> {isImporting ? 'Importing...' : 'Import CSV'}
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleImportCSVFile}
                  className="hidden"
                  disabled={isImporting}
                />
              </label>
            </>
          )}

          <button
            onClick={fetchProjectsAndPlots}
            className="p-2 rounded-xl bg-[#111827] border border-[#1F2937] text-[#94A3B8] hover:text-white transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Filters Toolbar */}
      <div className="glass-panel p-4 rounded-2xl border border-[#1F2937] flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          {/* Project Selector */}
          <div>
            <select
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className="bg-[#0F172A] border border-[#1F2937] text-white text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-[#1E40AF]"
            >
              <option value="">All Projects</option>
              {projects.map((proj) => (
                <option key={proj._id} value={proj._id}>
                  {proj.name} ({proj.code})
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1 bg-[#0F172A] border border-[#1F2937] p-1 rounded-xl">
            {['ALL', 'AVAILABLE', 'BOOKED', 'PENDING', 'SOLD'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors ${
                  statusFilter === st
                    ? 'bg-[#1F2937] text-white'
                    : 'text-[#94A3B8] hover:text-white'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 text-[#94A3B8] absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search Plot No or Owner..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 pr-4 py-2 bg-[#0F172A] border border-[#1F2937] rounded-xl text-xs text-white focus:outline-none focus:border-[#1E40AF] w-64"
          />
        </div>
      </div>

      {/* Main View Area */}
      {isLoading ? (
        <div className="flex justify-center p-12">
          <div className="w-8 h-8 border-4 border-[#1E40AF] border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : viewMode === 'MAP' ? (
        <PlotMapCanvas
          projects={projects}
          selectedProjectId={selectedProjectId}
          onSelectProject={(projId) => setSelectedProjectId(projId)}
          plots={plots}
          onSelectPlot={(plot) => setSelectedPlot(plot)}
        />
      ) : (
        /* Client Report Format Table View (Identical to Google Sheet screenshot) */
        <div className="glass-panel p-4 rounded-2xl border border-[#1F2937] space-y-4">
          <div className="overflow-x-auto rounded-xl border border-[#1F2937]">
            <table className="w-full text-left text-xs whitespace-nowrap">
              <thead className="bg-[#111827] text-[#94A3B8] uppercase text-[10px] font-bold border-b border-[#1F2937]">
                <tr>
                  <th className="p-3 bg-[#111827]">S.No</th>
                  <th className="p-3 bg-[#FACC15]/20 text-[#FACC15] font-extrabold">Plot No</th>
                  <th className="p-3 bg-[#1E40AF]/20 text-[#3B82F6]">Sellable Sq Yrd</th>
                  <th className="p-3 bg-[#1E40AF]/20 text-[#3B82F6]">Carpet Sq Yrd</th>
                  <th className="p-3 bg-[#FACC15]/10 text-yellow-300">12mtr</th>
                  <th className="p-3 bg-[#FACC15]/10 text-yellow-300">9Mtr</th>
                  <th className="p-3 bg-[#FACC15]/10 text-yellow-300">Corner</th>
                  <th className="p-3 bg-[#FACC15]/10 text-yellow-300">Park Facing</th>
                  <th className="p-3 bg-emerald-950/40 text-emerald-400">Total PLC</th>
                  <th className="p-3 bg-emerald-950/40 text-emerald-400">Discounted PLC</th>
                  <th className="p-3 bg-blue-950/40 text-blue-300">OTMC</th>
                  <th className="p-3 bg-orange-950/40 text-orange-300">GST on other cahrges</th>
                  <th className="p-3 bg-emerald-600/20 text-emerald-300 font-extrabold">Total Cost</th>
                  <th className="p-3 bg-[#111827]">Status</th>
                  <th className="p-3 bg-[#111827]">Owner / Remarks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1F2937]">
                {filteredPlots.map((p, idx) => {
                  const sellable = p.sellableSqYrd || (p.sizeSqft ? (p.sizeSqft / 9).toFixed(2) : '201.28');
                  const carpet = p.carpetSqYrd || (p.sizeSqft ? (p.sizeSqft / 18).toFixed(2) : '104.48');
                  const totalCost = p.totalCost || p.price || 1367510;

                  return (
                    <tr
                      key={p._id}
                      onClick={() => setSelectedPlot(p)}
                      className="hover:bg-[#1E40AF]/10 cursor-pointer transition-colors text-white font-mono text-[11px]"
                    >
                      <td className="p-3 text-[#94A3B8]">{idx + 1}</td>
                      <td className="p-3 font-bold text-[#3B82F6]">{p.plotNo}</td>
                      <td className="p-3">{sellable}</td>
                      <td className="p-3">{carpet}</td>
                      <td className="p-3 text-center">{p.plc12mtr || '-'}</td>
                      <td className="p-3 text-center">{p.plc9mtr || '-'}</td>
                      <td className="p-3 text-center">{p.plcCorner || '-'}</td>
                      <td className="p-3 text-center">{p.plcParkFacing || '-'}</td>
                      <td className="p-3 font-bold text-emerald-400">₹{(p.totalPlc || 0).toLocaleString('en-IN')}</td>
                      <td className="p-3 text-yellow-400">₹{(p.discountedPlc || 0).toLocaleString('en-IN')}</td>
                      <td className="p-3 text-blue-300">₹{(p.otmc || 250).toLocaleString('en-IN')}</td>
                      <td className="p-3 text-orange-300">₹{(p.gstOnOtherCharges || 9057.69).toLocaleString('en-IN')}</td>
                      <td className="p-3 font-bold text-[#22C55E]">₹{totalCost.toLocaleString('en-IN')}</td>
                      <td className="p-3 font-sans">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold ${
                          p.status === 'AVAILABLE' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' :
                          p.status === 'BOOKED' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/40' :
                          p.status === 'PENDING' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/40' :
                          'bg-red-500/20 text-red-400 border border-red-500/40'
                        }`}>
                          {p.status}
                        </span>
                      </td>
                      <td className="p-3 text-[#94A3B8] font-sans">{p.ownerName || '-'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Plot Detail Modal */}
      <PlotDetailModal
        plot={selectedPlot}
        onClose={() => setSelectedPlot(null)}
        onRefresh={fetchProjectsAndPlots}
      />
    </div>
  );
};
