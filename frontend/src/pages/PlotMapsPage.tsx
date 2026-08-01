import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Map, Layers, CheckCircle, Upload, ScanText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const PlotMapsPage: React.FC = () => {
  const [maps, setMaps] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchMaps();
  }, []);

  const fetchMaps = async () => {
    try {
      setIsLoading(true);
      const res = await api.get('/plot-maps');
      setMaps(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-extrabold text-[#F8FAFC]">Masterplan Layout & Map Catalog</h2>
          <p className="text-xs text-[#94A3B8] mt-1">Uploaded project layout blueprints and vectorized map layers</p>
        </div>
        <button
          onClick={() => navigate('/ocr-analyzer')}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#1E40AF] to-blue-900 text-white font-bold text-xs shadow-lg flex items-center gap-2 hover:opacity-90"
        >
          <ScanText className="w-4 h-4" /> Run AI Map OCR & Upload Blueprint
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center p-12">
          <div className="w-8 h-8 border-4 border-[#1E40AF] border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {maps.map((m) => (
            <div key={m._id} className="glass-card p-6 rounded-2xl border border-[#1F2937] space-y-4 hover:border-[#1E40AF] transition-all">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-white text-base">{m.mapName}</h3>
                <span className="px-2.5 py-0.5 rounded-full bg-[#22C55E]/20 text-[#22C55E] text-[10px] font-bold border border-[#22C55E]/40">
                  {m.status}
                </span>
              </div>
              <div className="rounded-xl overflow-hidden border border-[#1F2937] max-h-56 relative group">
                <img src={m.imageUrl} alt={m.mapName} className="w-full object-cover group-hover:scale-105 transition-transform duration-300" />
                <div className="absolute inset-0 bg-blue-900/10 pointer-events-none"></div>
              </div>
              <div className="flex items-center justify-between text-xs text-[#94A3B8] pt-2 border-t border-[#1F2937]">
                <span>Confidence Score: <strong className="text-[#22C55E]">{(m.confidenceScore * 100).toFixed(0)}%</strong></span>
                <span>Detected Vector Plots: <strong className="text-[#3B82F6]">{m.vectorOverlayData ? m.vectorOverlayData.length : 0} plots</strong></span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
