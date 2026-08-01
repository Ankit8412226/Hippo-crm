import React, { useState } from 'react';
import { Plot, Project } from '../../types';
import { ZoomIn, ZoomOut, RotateCcw, Filter, Search, Building2, MapPin, Image as ImageIcon } from 'lucide-react';

interface PlotMapCanvasProps {
  projects: Project[];
  selectedProjectId: string;
  onSelectProject: (projectId: string) => void;
  plots: Plot[];
  onSelectPlot: (plot: Plot) => void;
}

export const PlotMapCanvas: React.FC<PlotMapCanvasProps> = ({
  projects,
  selectedProjectId,
  onSelectProject,
  plots,
  onSelectPlot
}) => {
  const [zoom, setZoom] = useState<number>(1);
  const [activeFilter, setActiveFilter] = useState<string>('ALL');
  const [activeBlock, setActiveBlock] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showMapBackground, setShowMapBackground] = useState<boolean>(true);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'AVAILABLE': return '#22C55E';
      case 'BOOKED': return '#3B82F6';
      case 'PENDING': return '#FACC15';
      case 'SOLD': return '#EF4444';
      default: return '#64748B';
    }
  };

  const selectedProject = projects.find((p) => p._id === selectedProjectId) || projects[0];

  const filteredPlots = plots.filter((plot) => {
    const matchesProject = !selectedProjectId || (
      typeof plot.projectId === 'string'
        ? plot.projectId === selectedProjectId
        : plot.projectId?._id === selectedProjectId
    );
    const matchesStatus = activeFilter === 'ALL' || plot.status === activeFilter;
    const matchesBlock = activeBlock === 'ALL' || plot.block === activeBlock;
    const matchesSearch =
      plot.plotNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      plot.block.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesProject && matchesStatus && matchesBlock && matchesSearch;
  });

  const projectMapImage = (selectedProject as any)?.bannerImage || 'https://images.unsplash.com/photo-1524813686514-a57563d77965?auto=format&fit=crop&w=1200&q=80';

  return (
    <div className="glass-panel rounded-2xl border border-[#1F2937] p-5 flex flex-col gap-4 shadow-2xl">
      {/* Top Project Selector & Title Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#1F2937] pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#1E40AF]/20 border border-[#1E40AF]/40 text-[#3B82F6] flex items-center justify-center">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <label className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider">Select Project / Township</label>
            <select
              value={selectedProjectId}
              onChange={(e) => onSelectProject(e.target.value)}
              className="bg-[#0F172A] border border-[#1E40AF]/40 rounded-xl px-3 py-1.5 text-sm font-extrabold text-white focus:outline-none focus:border-[#1E40AF] block mt-0.5"
            >
              {projects.map((proj) => (
                <option key={proj._id} value={proj._id}>
                  {proj.name} ({proj.code}) - {proj.location}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Selected Project Summary & Blueprint Overlay Toggle */}
        {selectedProject && (
          <div className="flex items-center gap-4 bg-[#0F172A] px-4 py-2 rounded-xl border border-[#1F2937] text-xs">
            <button
              onClick={() => setShowMapBackground(!showMapBackground)}
              className={`px-3 py-1 rounded-lg font-bold flex items-center gap-1.5 transition-all ${
                showMapBackground
                  ? 'bg-[#1E40AF] text-white shadow'
                  : 'bg-[#111827] text-[#94A3B8] border border-[#1F2937]'
              }`}
            >
              <ImageIcon className="w-3.5 h-3.5" />
              {showMapBackground ? 'Blueprint Image Active' : 'Show Blueprint Background'}
            </button>
            <div className="border-l border-[#1F2937] pl-4">
              <p className="text-[#94A3B8]">Rate / Sqft</p>
              <p className="font-bold text-[#22C55E]">₹{selectedProject.basePricePerSqft}</p>
            </div>
            <div className="border-l border-[#1F2937] pl-4">
              <p className="text-[#94A3B8]">Plots in View</p>
              <p className="font-bold text-white">{filteredPlots.length} Plots</p>
            </div>
          </div>
        )}
      </div>

      {/* Controls & Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-[#0F172A] p-3 rounded-xl border border-[#1F2937]">
        {/* Status Filters */}
        <div className="flex items-center gap-2 flex-wrap">
          {['ALL', 'AVAILABLE', 'BOOKED', 'PENDING', 'SOLD'].map((status) => (
            <button
              key={status}
              onClick={() => setActiveFilter(status)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeFilter === status
                  ? 'bg-[#1E40AF] text-white shadow-md'
                  : 'bg-[#111827] text-[#94A3B8] hover:text-white border border-[#1F2937]'
              }`}
            >
              {status === 'ALL' && 'All Statuses'}
              {status === 'AVAILABLE' && <span className="text-[#22C55E]">🟢 Available</span>}
              {status === 'BOOKED' && <span className="text-[#3B82F6]">🔵 Booked</span>}
              {status === 'PENDING' && <span className="text-[#FACC15]">🟡 Pending</span>}
              {status === 'SOLD' && <span className="text-[#EF4444]">🔴 Sold</span>}
            </button>
          ))}

          {/* Block Selector */}
          <div className="flex items-center gap-1 ml-2 pl-2 border-l border-[#1F2937]">
            <span className="text-[10px] text-[#94A3B8] font-bold">Block:</span>
            {['ALL', 'A', 'B', 'C', 'D'].map((b) => (
              <button
                key={b}
                onClick={() => setActiveBlock(b)}
                className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  activeBlock === b ? 'bg-[#F97316] text-white' : 'bg-[#111827] text-[#94A3B8]'
                }`}
              >
                {b}
              </button>
            ))}
          </div>
        </div>

        {/* Search & Zoom Controls */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
            <input
              type="text"
              placeholder="Search plot no..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-[#111827] border border-[#1F2937] rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-[#94A3B8] focus:outline-none"
            />
          </div>

          <div className="flex items-center bg-[#111827] rounded-lg border border-[#1F2937] p-1 gap-1">
            <button
              onClick={() => setZoom((z) => Math.max(0.6, z - 0.2))}
              className="p-1 text-[#94A3B8] hover:text-white"
              title="Zoom Out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className="text-[10px] font-bold text-[#94A3B8] px-1">{Math.round(zoom * 100)}%</span>
            <button
              onClick={() => setZoom((z) => Math.min(2.0, z + 0.2))}
              className="p-1 text-[#94A3B8] hover:text-white"
              title="Zoom In"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              onClick={() => setZoom(1)}
              className="p-1 text-[#94A3B8] hover:text-white border-l border-[#1F2937]"
              title="Reset Zoom"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* SVG Canvas Map Render with Blueprint Background Overlay */}
      <div className="w-full h-[520px] bg-[#0B1120] rounded-xl border border-[#1F2937] overflow-auto relative flex items-center justify-center p-6">
        <div
          style={{ transform: `scale(${zoom})`, transformOrigin: 'top left' }}
          className="transition-transform duration-200 relative min-w-[950px] min-h-[500px]"
        >
          {/* Project Blueprint Image Background */}
          {showMapBackground && projectMapImage && (
            <div className="absolute inset-0 z-0 opacity-30 rounded-xl overflow-hidden pointer-events-none">
              <img src={projectMapImage} alt="Masterplan Blueprint" className="w-full h-full object-cover" />
            </div>
          )}

          <svg width="950" height="500" className="w-full h-full relative z-10">
            {/* Background Grid Lines */}
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1F2937" strokeWidth="0.5" />
            </pattern>
            <rect width="100%" height="100%" fill="url(#grid)" fillOpacity="0.4" />

            {/* Plot Rectangles / Polygons */}
            {filteredPlots.map((plot) => {
              const x = plot.coordinates?.x || 50;
              const y = plot.coordinates?.y || 50;
              const width = plot.coordinates?.width || 125;
              const height = plot.coordinates?.height || 90;
              const color = getStatusColor(plot.status);

              return (
                <g
                  key={plot._id}
                  onClick={() => onSelectPlot(plot)}
                  className="cursor-pointer group"
                >
                  <rect
                    x={x}
                    y={y}
                    width={width}
                    height={height}
                    rx="8"
                    fill={color}
                    fillOpacity="0.35"
                    stroke={color}
                    strokeWidth="2.5"
                    className="transition-all duration-200 group-hover:fill-opacity-60 group-hover:stroke-width-4"
                  />
                  <text
                    x={x + width / 2}
                    y={y + height / 2 - 8}
                    textAnchor="middle"
                    fill="#F8FAFC"
                    fontSize="12"
                    fontWeight="bold"
                    className="pointer-events-none select-none"
                  >
                    {plot.plotNo}
                  </text>
                  <text
                    x={x + width / 2}
                    y={y + height / 2 + 10}
                    textAnchor="middle"
                    fill={color}
                    fontSize="10"
                    fontWeight="bold"
                    className="pointer-events-none select-none"
                  >
                    ₹{(plot.price / 100000).toFixed(1)}L
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      </div>
    </div>
  );
};
