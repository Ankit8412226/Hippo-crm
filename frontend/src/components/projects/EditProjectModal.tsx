import React, { useState } from 'react';
import { X, Building2, UploadCloud } from 'lucide-react';
import api from '../../services/api';
import { Project } from '../../types';

interface EditProjectModalProps {
  project: Project;
  onClose: () => void;
  onSuccess: () => void;
}

export const EditProjectModal: React.FC<EditProjectModalProps> = ({ project, onClose, onSuccess }) => {
  const [name, setName] = useState(project.name);
  const [code, setCode] = useState(project.code);
  const [location, setLocation] = useState(project.location);
  const [totalAreaSqft, setTotalAreaSqft] = useState(project.totalAreaSqft);
  const [basePricePerSqft, setBasePricePerSqft] = useState(project.basePricePerSqft);
  const [status, setStatus] = useState(project.status);
  const [mapImageUrl, setMapImageUrl] = useState((project as any).bannerImage || 'https://images.unsplash.com/photo-1524813686514-a57563d77965?auto=format&fit=crop&w=1200&q=80');
  const [fileName, setFileName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      const reader = new FileReader();
      reader.onloadend = () => {
        if (reader.result) {
          setMapImageUrl(reader.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      await api.put(`/projects/${project._id}`, {
        name,
        code,
        location,
        totalAreaSqft,
        basePricePerSqft,
        status,
        bannerImage: mapImageUrl
      });

      alert('Project details & Plot Map blueprint updated successfully!');
      onSuccess();
      onClose();
    } catch (error) {
      console.error(error);
      alert('Failed to update project');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-[#111827] border border-[#1F2937] w-full max-w-lg rounded-2xl p-6 space-y-6 shadow-2xl overflow-y-auto max-h-[90vh]">
        <div className="flex items-center justify-between border-b border-[#1F2937] pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#1E40AF]/20 border border-[#1E40AF]/40 text-[#3B82F6] flex items-center justify-center">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Edit Real Estate Project & Plot Map</h3>
              <p className="text-xs text-[#94A3B8]">Update township details, pricing & site map blueprint</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl bg-[#0F172A] text-[#94A3B8] hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="text-[#94A3B8]">Project Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full mt-1 bg-[#0F172A] border border-[#1F2937] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#1E40AF]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[#94A3B8]">Project Code</label>
              <input
                type="text"
                required
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full mt-1 bg-[#0F172A] border border-[#1F2937] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#1E40AF]"
              />
            </div>
            <div>
              <label className="text-[#94A3B8]">Location</label>
              <input
                type="text"
                required
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full mt-1 bg-[#0F172A] border border-[#1F2937] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#1E40AF]"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-[#94A3B8]">Total Area (sqft)</label>
              <input
                type="number"
                required
                value={totalAreaSqft}
                onChange={(e) => setTotalAreaSqft(Number(e.target.value))}
                className="w-full mt-1 bg-[#0F172A] border border-[#1F2937] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#1E40AF]"
              />
            </div>
            <div>
              <label className="text-[#94A3B8]">Rate / Sqft (₹)</label>
              <input
                type="number"
                required
                value={basePricePerSqft}
                onChange={(e) => setBasePricePerSqft(Number(e.target.value))}
                className="w-full mt-1 bg-[#0F172A] border border-[#1F2937] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#1E40AF]"
              />
            </div>
            <div>
              <label className="text-[#94A3B8]">Project Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full mt-1 bg-[#0F172A] border border-[#1F2937] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#1E40AF]"
              >
                <option value="ACTIVE">ACTIVE</option>
                <option value="UPCOMING">UPCOMING</option>
                <option value="COMPLETED">COMPLETED</option>
              </select>
            </div>
          </div>

          {/* Project Site Map File Upload Box */}
          <div className="p-4 bg-[#0F172A] rounded-xl border border-[#1F2937] space-y-3">
            <label className="font-bold text-white flex items-center gap-1.5 text-[11px]">
              <UploadCloud className="w-4 h-4 text-[#3B82F6]" /> Upload Plot Map Blueprint / Image File
            </label>
            
            <div className="border-2 border-dashed border-[#1F2937] hover:border-[#1E40AF] rounded-xl p-4 text-center cursor-pointer transition-colors">
              <input
                type="file"
                accept="image/*,.pdf"
                onChange={handleFileUpload}
                className="hidden"
                id="edit-project-map-upload"
              />
              <label htmlFor="edit-project-map-upload" className="cursor-pointer flex flex-col items-center">
                <UploadCloud className="w-6 h-6 text-[#94A3B8] mb-1" />
                <span className="text-xs font-bold text-white">
                  {fileName ? `Selected: ${fileName}` : 'Click to Upload Map Blueprint (PNG, JPG, PDF)'}
                </span>
                <span className="text-[10px] text-[#94A3B8] mt-0.5 font-normal">Will render directly on Plot Map Canvas</span>
              </label>
            </div>

            <div className="pt-2 border-t border-[#1F2937]/50">
              <label className="text-[10px] text-[#94A3B8] block mb-1">Or paste Image URL:</label>
              <input
                type="text"
                placeholder="https://..."
                value={mapImageUrl}
                onChange={(e) => setMapImageUrl(e.target.value)}
                className="w-full bg-[#111827] border border-[#1F2937] rounded-lg px-3 py-1.5 text-white font-mono text-[11px]"
              />
            </div>

            {mapImageUrl && (
              <div className="relative rounded-lg overflow-hidden border border-[#1F2937] h-28 mt-2">
                <img src={mapImageUrl} alt="Preview" className="w-full h-full object-cover" />
                <span className="absolute bottom-1 right-1 bg-black/60 px-2 py-0.5 rounded text-[9px] text-white">Preview</span>
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-[#1F2937] flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl bg-[#0F172A] border border-[#1F2937] font-bold text-xs text-[#94A3B8] hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-[#1E40AF] to-blue-900 font-bold text-xs text-white shadow-lg hover:opacity-90"
            >
              {isSubmitting ? 'Saving...' : 'Save Project & Plot Map'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
