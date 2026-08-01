import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

interface PlotStatusDistributionProps {
  data: { name: string; value: number; color: string }[];
}

export const PlotStatusDistribution: React.FC<PlotStatusDistributionProps> = ({ data }) => {
  return (
    <div className="glass-card p-6 rounded-2xl border border-[#1F2937] flex flex-col">
      <h3 className="text-base font-bold text-[#F8FAFC]">Plot Inventory Status</h3>
      <p className="text-xs text-[#94A3B8] mb-4">Real-time status breakdown across inventory</p>

      <div className="h-64 w-full flex-1">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={85}
              paddingAngle={5}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} stroke="#111827" strokeWidth={2} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{ backgroundColor: '#111827', borderColor: '#1F2937', borderRadius: '12px', color: '#F8FAFC' }}
            />
            <Legend verticalAlign="bottom" height={36} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
