import React, { useState } from 'react';
import { AlertTriangle, CheckCircle, Cpu, Table, FileSpreadsheet } from 'lucide-react';
import api from '../../services/api';

interface ExtractedPlot {
  plotNo: string;
  status: string;
  sellableSqYrd?: number;
  carpetSqYrd?: number;
  plc12mtr?: number;
  plc9mtr?: number;
  plcCorner?: number;
  plcParkFacing?: number;
  totalPlc?: number;
  discountedPlc?: number;
  otmc?: number;
  gstOnOtherCharges?: number;
  totalCost?: number;
  sizeSqft?: number;
  dimensions?: string;
  confidence: number;
}

interface OcrValidationViewerProps {
  mapData: {
    mapId: string;
    mapName: string;
    imageUrl: string;
    confidenceScore: number;
    requiresHumanReview: boolean;
    extractedPlots: ExtractedPlot[];
  };
  onComplete: () => void;
}

export const OcrValidationViewer: React.FC<OcrValidationViewerProps> = ({ mapData, onComplete }) => {
  const [plots, setPlots] = useState<ExtractedPlot[]>(mapData.extractedPlots);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const handleFieldChange = (index: number, field: keyof ExtractedPlot, value: any) => {
    const updated = [...plots];
    updated[index] = { ...updated[index], [field]: value };
    setPlots(updated);
  };

  const handleApprove = async () => {
    try {
      setIsProcessing(true);
      await api.post(`/ocr/approve/${mapData.mapId}`, {
        updatedVectorOverlayData: plots
      });
      alert('Naksa layout map overlay approved successfully and synced into Plot Database!');
      onComplete();
    } catch (error) {
      console.error(error);
      alert('Failed to approve map overlay');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    try {
      setIsProcessing(true);
      await api.post(`/ocr/reject/${mapData.mapId}`);
      alert('Map overlay rejected.');
      onComplete();
    } catch (error) {
      console.error(error);
    } finally {
      setIsProcessing(false);
    }
  };

  const isLowConfidence = mapData.confidenceScore < 0.90;

  return (
    <div className="glass-panel p-6 rounded-2xl border border-[#1F2937] space-y-6">
      {/* AI Confidence Banner */}
      <div className={`p-4 rounded-xl border flex items-center justify-between ${
        isLowConfidence
          ? 'bg-[#FACC15]/10 border-[#FACC15]/40 text-[#FACC15]'
          : 'bg-[#22C55E]/10 border-[#22C55E]/40 text-[#22C55E]'
      }`}>
        <div className="flex items-center gap-3">
          {isLowConfidence ? <AlertTriangle className="w-6 h-6" /> : <CheckCircle className="w-6 h-6" />}
          <div>
            <h4 className="font-bold text-sm">
              Naksa AI Extraction Confidence: {(mapData.confidenceScore * 100).toFixed(1)}%
            </h4>
            <p className="text-xs opacity-90 mt-0.5">
              {isLowConfidence
                ? 'Confidence < 90%. Review extracted plot columns below before committing to database.'
                : 'High confidence layout extraction! Ready for automated catalog synchronization.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleReject}
            disabled={isProcessing}
            className="px-3 py-1.5 rounded-lg bg-[#EF4444]/20 border border-[#EF4444]/40 text-[#EF4444] hover:bg-[#EF4444] hover:text-white text-xs font-bold transition-all"
          >
            Reject
          </button>
          <button
            onClick={handleApprove}
            disabled={isProcessing}
            className="px-4 py-1.5 rounded-lg bg-gradient-to-r from-[#22C55E] to-emerald-600 text-white text-xs font-bold shadow-md hover:opacity-90 transition-all flex items-center gap-2"
          >
            <FileSpreadsheet className="w-4 h-4" /> Approve & Sync to Plot Ledger
          </button>
        </div>
      </div>

      {/* Top Split View: Map Overlay + extracted metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 bg-[#0B1120] p-4 rounded-xl border border-[#1F2937] flex flex-col items-center">
          <h4 className="text-xs font-bold text-[#94A3B8] mb-3 uppercase tracking-wider self-start flex items-center gap-2">
            <Cpu className="w-4 h-4 text-[#3B82F6]" /> Uploaded Naksa (Layout Plan)
          </h4>
          <div className="relative rounded-lg overflow-hidden border border-[#1F2937] w-full max-h-72">
            <img src={mapData.imageUrl} alt="Naksa Layout" className="w-full object-cover opacity-80" />
            <div className="absolute inset-0 bg-blue-900/10 pointer-events-none"></div>
          </div>
        </div>

        {/* Extracted Extracted Summary & Field Instructions */}
        <div className="lg:col-span-2 bg-[#0B1120] p-4 rounded-xl border border-[#1F2937] flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Table className="w-4 h-4 text-[#3B82F6]" /> Extracted Client Inventory Report ({plots.length} Plots Extracted)
            </h4>
            <span className="text-[10px] text-[#3B82F6] font-mono">15-Column Report Standard</span>
          </div>

          {/* Full Client Report Format Table */}
          <div className="overflow-x-auto border border-[#1F2937] rounded-xl max-h-72">
            <table className="w-full text-left text-xs whitespace-nowrap">
              <thead className="bg-[#111827] text-[#94A3B8] uppercase text-[10px] sticky top-0 font-bold border-b border-[#1F2937]">
                <tr>
                  <th className="p-2">S.No</th>
                  <th className="p-2">Plot No</th>
                  <th className="p-2">Sellable Sq Yrd</th>
                  <th className="p-2">Carpet Sq Yrd</th>
                  <th className="p-2">12mtr</th>
                  <th className="p-2">9Mtr</th>
                  <th className="p-2">Corner</th>
                  <th className="p-2">Park Facing</th>
                  <th className="p-2">Total PLC</th>
                  <th className="p-2">Discounted PLC</th>
                  <th className="p-2">OTMC</th>
                  <th className="p-2">GST on other charges</th>
                  <th className="p-2">Total Cost</th>
                  <th className="p-2">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1F2937]">
                {plots.map((p, idx) => (
                  <tr key={idx} className="hover:bg-[#111827]/50 text-white font-mono text-[11px]">
                    <td className="p-2 text-[#94A3B8]">{idx + 1}</td>
                    <td className="p-2 font-bold text-[#3B82F6]">
                      <input
                        type="text"
                        value={p.plotNo}
                        onChange={(e) => handleFieldChange(idx, 'plotNo', e.target.value)}
                        className="bg-[#0F172A] border border-[#1F2937] rounded px-1.5 py-0.5 text-white w-20"
                      />
                    </td>
                    <td className="p-2">
                      <input
                        type="number"
                        value={p.sellableSqYrd || ''}
                        onChange={(e) => handleFieldChange(idx, 'sellableSqYrd', parseFloat(e.target.value))}
                        className="bg-[#0F172A] border border-[#1F2937] rounded px-1.5 py-0.5 text-white w-20"
                      />
                    </td>
                    <td className="p-2">
                      <input
                        type="number"
                        value={p.carpetSqYrd || ''}
                        onChange={(e) => handleFieldChange(idx, 'carpetSqYrd', parseFloat(e.target.value))}
                        className="bg-[#0F172A] border border-[#1F2937] rounded px-1.5 py-0.5 text-white w-20"
                      />
                    </td>
                    <td className="p-2">{p.plc12mtr || '-'}</td>
                    <td className="p-2">{p.plc9mtr || '-'}</td>
                    <td className="p-2">{p.plcCorner || '-'}</td>
                    <td className="p-2">{p.plcParkFacing || '-'}</td>
                    <td className="p-2 font-semibold text-emerald-400">₹{p.totalPlc || 0}</td>
                    <td className="p-2 text-yellow-400">₹{p.discountedPlc || 0}</td>
                    <td className="p-2">₹{p.otmc || 0}</td>
                    <td className="p-2">₹{p.gstOnOtherCharges || 0}</td>
                    <td className="p-2 font-bold text-[#22C55E]">₹{(p.totalCost || 0).toLocaleString('en-IN')}</td>
                    <td className="p-2">
                      <select
                        value={p.status}
                        onChange={(e) => handleFieldChange(idx, 'status', e.target.value)}
                        className="bg-[#0F172A] border border-[#1F2937] rounded px-1.5 py-0.5 text-xs text-white"
                      >
                        <option value="AVAILABLE">AVAILABLE</option>
                        <option value="BOOKED">BOOKED</option>
                        <option value="PENDING">PENDING</option>
                        <option value="SOLD">SOLD</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
