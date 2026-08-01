import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Employee } from '../types';
import { AddEmployeeModal } from '../components/employees/AddEmployeeModal';
import { Users, UserPlus, Trash2, Edit, RefreshCw } from 'lucide-react';

export const EmployeesPage: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      setIsLoading(true);
      const response = await api.get('/employees');
      setEmployees(response.data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this agent?')) return;
    try {
      await api.delete(`/employees/${id}`);
      fetchEmployees();
    } catch (error) {
      console.error(error);
      alert('Failed to delete agent');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Page Title & Add Action */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-extrabold text-[#F8FAFC]">MLM Sales Executives & Directory</h2>
          <p className="text-xs text-[#94A3B8] mt-1">Manage team members, downline sponsors, and rank promotions</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchEmployees}
            className="p-2.5 rounded-xl bg-[#111827] border border-[#1F2937] text-[#94A3B8] hover:text-white"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#1E40AF] to-blue-900 text-white font-bold text-xs shadow-lg shadow-blue-900/40 hover:opacity-90 flex items-center gap-2"
          >
            <UserPlus className="w-4 h-4" /> Add New Agent
          </button>
        </div>
      </div>

      {/* Directory Table */}
      <div className="glass-card p-6 rounded-2xl border border-[#1F2937]">
        {isLoading ? (
          <div className="flex justify-center p-8">
            <div className="w-8 h-8 border-4 border-[#1E40AF] border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-white">
              <thead className="bg-[#0F172A] text-[#94A3B8] uppercase text-[10px]">
                <tr>
                  <th className="p-3">Code</th>
                  <th className="p-3">Full Name</th>
                  <th className="p-3">Sponsor Upline</th>
                  <th className="p-3">Current Rank</th>
                  <th className="p-3">Self Sales</th>
                  <th className="p-3">Team Sales</th>
                  <th className="p-3">Active Legs</th>
                  <th className="p-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1F2937]">
                {employees.map((emp) => (
                  <tr key={emp.id} className="hover:bg-[#111827]">
                    <td className="p-3 font-mono font-bold text-[#F97316]">{emp.employeeCode}</td>
                    <td className="p-3 font-bold">
                      {emp.userId ? emp.userId.fullName : 'Executive'}
                      <p className="text-[10px] text-[#94A3B8] font-normal">{emp.userId ? emp.userId.email : ''}</p>
                    </td>
                    <td className="p-3 text-[#94A3B8]">
                      {emp.parentId && typeof emp.parentId === 'object' && (emp.parentId as any).userId
                        ? (emp.parentId as any).userId.fullName
                        : 'Root / CEO'}
                    </td>
                    <td className="p-3">
                      <span className="px-2.5 py-0.5 rounded-full bg-[#1E40AF]/20 text-[#3B82F6] font-bold text-[10px] border border-[#1E40AF]/40">
                        {emp.currentRank}
                      </span>
                    </td>
                    <td className="p-3 font-bold text-white">{emp.selfSalesCount}</td>
                    <td className="p-3 font-bold text-[#22C55E]">{emp.teamSalesCount}</td>
                    <td className="p-3 font-bold text-[#3B82F6]">{emp.activeLegsCount}</td>
                    <td className="p-3">
                      <button
                        onClick={() => handleDelete(emp.id)}
                        className="p-1.5 rounded-lg text-[#EF4444] hover:bg-[#EF4444]/20 transition-colors"
                        title="Delete Agent"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Agent Modal */}
      {isAddModalOpen && (
        <AddEmployeeModal
          existingEmployees={employees}
          onClose={() => setIsAddModalOpen(false)}
          onSuccess={fetchEmployees}
        />
      )}
    </div>
  );
};
