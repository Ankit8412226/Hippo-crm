import React, { useState } from 'react';
import api from '../services/api';
import { OcrValidationViewer } from '../components/ocr/OcrValidationViewer';
import { useAuth } from '../context/AuthContext';
import { UploadCloud, ScanText, Lock } from 'lucide-react';

export const OCRAnalyzerPage: React.FC = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN' || user?.role === 'DIRECTOR';
  const [file, setFile] = useState<File | null>(null);
  const [mapName, setMapName] = useState<string>('Sector 82 Masterplan');
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [ocrResult, setOcrResult] = useState<any>(null);

  const handleAnalyze = async () => {
    try {
      setIsAnalyzing(true);
      const formData = new FormData();
      if (file) formData.append('file', file);
      formData.append('mapName', mapName);

      const response = await api.post('/ocr/analyze', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setOcrResult(response.data);
    } catch (error) {
      console.error(error);
      alert('Failed to analyze site map layout');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-extrabold text-[#F8FAFC]">AI Plot Map & Document Analyzer</h2>
          <p className="text-xs text-[#94A3B8] mt-1">PyMuPDF + OpenCV + Google Gemini 1.5 Pro Vision OCR layout extraction pipeline</p>
        </div>
      </div>

      {!isAdmin ? (
        <div className="glass-panel p-12 rounded-2xl border border-[#1F2937] max-w-xl mx-auto text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center mx-auto">
            <Lock className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-white">Administrator Access Required</h3>
          <p className="text-xs text-[#94A3B8]">
            Architectural Naksa map upload & Vision AI OCR analysis is restricted to Administrators and Directors.
          </p>
        </div>
      ) : !ocrResult ? (
        <div className="glass-panel p-8 rounded-2xl border border-[#1F2937] max-w-2xl mx-auto space-y-6 text-center">
          <div className="w-16 h-16 rounded-2xl bg-[#1E40AF]/20 border border-[#1E40AF]/40 text-[#3B82F6] flex items-center justify-center mx-auto shadow-lg">
            <ScanText className="w-8 h-8" />
          </div>

          <div>
            <h3 className="text-lg font-bold text-white">Upload Architectural Site Plan / Layout</h3>
            <p className="text-xs text-[#94A3B8] mt-1">Supports PDF, PNG, and JPG layout blueprints up to 50MB</p>
          </div>

          <div className="space-y-4 text-left">
            <div>
              <label className="text-xs text-[#94A3B8]">Layout Map Title</label>
              <input
                type="text"
                value={mapName}
                onChange={(e) => setMapName(e.target.value)}
                className="w-full mt-1 bg-[#0F172A] border border-[#1F2937] rounded-xl px-4 py-2 text-xs text-white focus:outline-none"
              />
            </div>

            <div className="border-2 border-dashed border-[#1F2937] hover:border-[#1E40AF] rounded-2xl p-8 text-center cursor-pointer transition-colors">
              <input
                type="file"
                accept=".pdf,.png,.jpg,.jpeg"
                onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)}
                className="hidden"
                id="file-upload"
              />
              <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center">
                <UploadCloud className="w-8 h-8 text-[#94A3B8] mb-2" />
                <span className="text-xs font-bold text-white">
                  {file ? file.name : 'Click to select or drag blueprint file here'}
                </span>
                <span className="text-[10px] text-[#94A3B8] mt-1">Automated Plot No, Dimension & Status Detection</span>
              </label>
            </div>
          </div>

          <button
            onClick={handleAnalyze}
            disabled={isAnalyzing}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-[#1E40AF] to-blue-900 text-white font-bold text-xs shadow-lg shadow-blue-900/40 hover:opacity-90 transition-all flex items-center justify-center gap-2"
          >
            {isAnalyzing ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Analyzing Layout OCR & Vector Geometry...
              </>
            ) : (
              'Run AI OCR Extraction Pipeline'
            )}
          </button>
        </div>
      ) : (
        <OcrValidationViewer
          mapData={ocrResult}
          onComplete={() => setOcrResult(null)}
        />
      )}
    </div>
  );
};
