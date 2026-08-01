import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Project } from '../types';
import { AddProjectModal } from '../components/projects/AddProjectModal';
import { EditProjectModal } from '../components/projects/EditProjectModal';
import { Building2, MapPin, Plus, Trash2, Edit, RefreshCw } from 'lucide-react';

export const ProjectsPage: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setIsLoading(true);
      const res = await api.get('/projects');
      setProjects(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this project and all associated plots?')) return;
    try {
      await api.delete(`/projects/${id}`);
      fetchProjects();
    } catch (e) {
      console.error(e);
      alert('Failed to delete project');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header & Add Project Action */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-extrabold text-[#F8FAFC]">Real Estate Projects & Settings</h2>
          <p className="text-xs text-[#94A3B8] mt-1">Active townships, masterplan settings, and project-specific commission overrides</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchProjects}
            className="p-2.5 rounded-xl bg-[#111827] border border-[#1F2937] text-[#94A3B8] hover:text-white"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#1E40AF] to-blue-900 text-white font-bold text-xs shadow-lg shadow-blue-900/40 hover:opacity-90 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Create New Project
          </button>
        </div>
      </div>

      {/* Projects Cards Grid */}
      {isLoading ? (
        <div className="flex justify-center p-12">
          <div className="w-8 h-8 border-4 border-[#1E40AF] border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((p) => (
            <div key={p._id} className="glass-card p-6 rounded-2xl border border-[#1F2937] hover:border-[#1E40AF] transition-all space-y-4 relative group">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded-full bg-[#22C55E]/10 text-[#22C55E] text-[10px] font-bold border border-[#22C55E]/30">
                  {p.status}
                </span>
                <div className="flex items-center gap-1">
                  <span className="font-mono text-xs text-[#94A3B8] mr-2">{p.code}</span>
                  <button
                    onClick={() => setEditingProject(p)}
                    className="p-1.5 rounded-lg text-[#3B82F6] hover:bg-[#3B82F6]/20 transition-colors"
                    title="Edit Project"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(p._id)}
                    className="p-1.5 rounded-lg text-[#EF4444] hover:bg-[#EF4444]/20 transition-colors"
                    title="Delete Project"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-bold text-white">{p.name}</h3>
                <p className="text-xs text-[#94A3B8] flex items-center gap-1 mt-1">
                  <MapPin className="w-3.5 h-3.5 text-[#F97316]" /> {p.location}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-3 border-t border-[#1F2937] text-xs">
                <div className="bg-[#0F172A] p-2 rounded-xl border border-[#1F2937]">
                  <p className="text-[#94A3B8]">Total Plots</p>
                  <p className="font-bold text-white text-sm mt-0.5">{p.totalPlots}</p>
                </div>
                <div className="bg-[#0F172A] p-2 rounded-xl border border-[#1F2937]">
                  <p className="text-[#94A3B8]">Base Price / Sqft</p>
                  <p className="font-bold text-[#22C55E] text-sm mt-0.5">₹{p.basePricePerSqft}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Project Modal */}
      {isAddModalOpen && (
        <AddProjectModal
          onClose={() => setIsAddModalOpen(false)}
          onSuccess={fetchProjects}
        />
      )}

      {/* Edit Project Modal */}
      {editingProject && (
        <EditProjectModal
          project={editingProject}
          onClose={() => setEditingProject(null)}
          onSuccess={fetchProjects}
        />
      )}
    </div>
  );
};
