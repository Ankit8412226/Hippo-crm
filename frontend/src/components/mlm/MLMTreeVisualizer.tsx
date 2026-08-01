import React, { useState } from 'react';
import { MLMTreeNode } from '../../types';
import { Award, ChevronDown, ChevronRight, Users, ShoppingBag, Target } from 'lucide-react';

interface MLMTreeVisualizerProps {
  treeData: MLMTreeNode;
}

const TreeNodeCard: React.FC<{ node: MLMTreeNode; level: number }> = ({ node, level }) => {
  const [isExpanded, setIsExpanded] = useState(true);

  const getRankColor = (rank: string) => {
    switch (rank) {
      case 'Director Sales': return 'from-purple-600 to-indigo-700 text-purple-200 border-purple-500/40';
      case 'Associate Sales Director': return 'from-blue-600 to-indigo-600 text-blue-200 border-blue-500/40';
      case 'Business Development Manager': return 'from-cyan-600 to-blue-700 text-cyan-200 border-cyan-500/40';
      case 'Sr Team Leader': return 'from-emerald-600 to-teal-700 text-emerald-200 border-emerald-500/40';
      case 'Team Leader': return 'from-green-600 to-emerald-700 text-green-200 border-green-500/40';
      case 'Sr Business Executive': return 'from-amber-600 to-orange-700 text-amber-200 border-amber-500/40';
      default: return 'from-slate-700 to-slate-800 text-slate-200 border-slate-600/40';
    }
  };

  return (
    <div className="flex flex-col items-center">
      {/* Node Card */}
      <div className="glass-card p-4 rounded-2xl border border-[#1F2937] hover:border-[#1E40AF] transition-all w-72 shadow-2xl relative z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#1E40AF] to-[#F97316] flex items-center justify-center font-bold text-white shadow-md">
              {node.name.charAt(0)}
            </div>
            <div>
              <h4 className="font-bold text-sm text-[#F8FAFC] leading-none">{node.name}</h4>
              <p className="text-[10px] text-[#94A3B8] font-mono mt-1">{node.employeeCode}</p>
            </div>
          </div>
          {node.children && node.children.length > 0 && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1 rounded-lg bg-[#0F172A] text-[#94A3B8] hover:text-white"
            >
              {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </button>
          )}
        </div>

        {/* Rank Badge */}
        <div className="mt-3 flex items-center justify-between">
          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold bg-gradient-to-r ${getRankColor(node.currentRank)} border`}>
            <Award className="w-3 h-3 inline mr-1" />
            {node.currentRank}
          </span>
          <span className="text-xs font-extrabold text-[#F97316]">
            {node.commissionPercent}% Comm
          </span>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-[#1F2937] text-center text-[10px]">
          <div className="bg-[#0F172A] p-1.5 rounded-lg border border-[#1F2937]">
            <p className="text-[#94A3B8]">Self Sales</p>
            <p className="font-bold text-white text-xs mt-0.5">{node.selfSalesCount}</p>
          </div>
          <div className="bg-[#0F172A] p-1.5 rounded-lg border border-[#1F2937]">
            <p className="text-[#94A3B8]">Team Sales</p>
            <p className="font-bold text-[#3B82F6] text-xs mt-0.5">{node.teamSalesCount}</p>
          </div>
          <div className="bg-[#0F172A] p-1.5 rounded-lg border border-[#1F2937]">
            <p className="text-[#94A3B8]">Active Legs</p>
            <p className="font-bold text-[#22C55E] text-xs mt-0.5">{node.activeLegsCount}</p>
          </div>
        </div>
      </div>

      {/* Vertical Connecting Line */}
      {isExpanded && node.children && node.children.length > 0 && (
        <div className="w-0.5 h-6 bg-[#334155]"></div>
      )}

      {/* Children Nodes Horizontal Tree */}
      {isExpanded && node.children && node.children.length > 0 && (
        <div className="flex gap-8 relative pt-4 before:content-[''] before:absolute before:top-0 before:left-1/2 before:-translate-x-1/2 before:w-[calc(100%-18rem)] before:h-0.5 before:bg-[#334155]">
          {node.children.map((child) => (
            <div key={child.id} className="relative before:content-[''] before:absolute before:-top-4 before:left-1/2 before:-translate-x-1/2 before:w-0.5 before:h-4 before:bg-[#334155]">
              <TreeNodeCard node={child} level={level + 1} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export const MLMTreeVisualizer: React.FC<MLMTreeVisualizerProps> = ({ treeData }) => {
  return (
    <div className="w-full overflow-x-auto p-8 glass-panel rounded-2xl border border-[#1F2937] min-h-[500px] flex justify-center">
      {treeData ? (
        <TreeNodeCard node={treeData} level={0} />
      ) : (
        <p className="text-[#94A3B8]">Loading MLM Tree structure...</p>
      )}
    </div>
  );
};
