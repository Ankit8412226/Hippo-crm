import React, { useState } from 'react';
import { X, UserPlus, ShieldCheck, Award } from 'lucide-react';
import api from '../../services/api';
import { Employee } from '../../types';
import { useAuth } from '../../context/AuthContext';

interface AddEmployeeModalProps {
  existingEmployees: Employee[];
  onClose: () => void;
  onSuccess: () => void;
}

export const AddEmployeeModal: React.FC<AddEmployeeModalProps> = ({
  existingEmployees,
  onClose,
  onSuccess
}) => {
  const { user: currentUser, employee: loggedInEmployee } = useAuth();

  const isAdmin = currentUser?.role === 'ADMIN';

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('Password123!');
  const [parentId, setParentId] = useState(loggedInEmployee ? loggedInEmployee.id : '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      setError('');

      await api.post('/employees', {
        fullName,
        email,
        phone,
        password,
        role: 'AGENT', // Downline team members are AGENT role by default
        parentId: parentId || (loggedInEmployee ? loggedInEmployee.id : null)
      });

      alert('Agent created successfully and automatically attached to your downline leg!');
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to create agent');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-[#111827] border border-[#1F2937] w-full max-w-lg rounded-2xl p-6 space-y-6 shadow-2xl">
        <div className="flex items-center justify-between border-b border-[#1F2937] pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#1E40AF]/20 border border-[#1E40AF]/40 text-[#3B82F6] flex items-center justify-center">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Add New Downline Agent</h3>
              <p className="text-xs text-[#94A3B8]">Register employee directly to your MLM downline network</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl bg-[#0F172A] text-[#94A3B8] hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-[#EF4444]/10 border border-[#EF4444]/30 text-[#EF4444] text-xs font-bold">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="text-[#94A3B8]">Full Name</label>
            <input
              type="text"
              required
              placeholder="e.g. Vikram Malhotra"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full mt-1 bg-[#0F172A] border border-[#1F2937] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#1E40AF]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[#94A3B8]">Email Address</label>
              <input
                type="email"
                required
                placeholder="vikram@hippo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full mt-1 bg-[#0F172A] border border-[#1F2937] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#1E40AF]"
              />
            </div>
            <div>
              <label className="text-[#94A3B8]">Phone Number</label>
              <input
                type="text"
                required
                placeholder="+91 9876543210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full mt-1 bg-[#0F172A] border border-[#1F2937] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#1E40AF]"
              />
            </div>
          </div>

          <div>
            <label className="text-[#94A3B8]">Account Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full mt-1 bg-[#0F172A] border border-[#1F2937] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#1E40AF]"
            />
          </div>

          {/* Auto Sponsor & MLM Rank Badge */}
          <div className="p-3 bg-[#0F172A] border border-[#1F2937] rounded-xl space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[#94A3B8] flex items-center gap-1.5 font-medium">
                <ShieldCheck className="w-4 h-4 text-[#22C55E]" /> Direct Sponsor Leg:
              </span>
              <span className="text-white font-bold">
                {loggedInEmployee ? (loggedInEmployee.userId?.fullName || loggedInEmployee.employeeCode) : (currentUser?.fullName || 'Logged-in Account')} (YOU)
              </span>
            </div>

            <div className="flex items-center justify-between text-xs border-t border-[#1F2937] pt-2">
              <span className="text-[#94A3B8] flex items-center gap-1.5 font-medium">
                <Award className="w-4 h-4 text-[#FACC15]" /> Initial Position & Commission Rate:
              </span>
              <span className="text-[#FACC15] font-bold">
                Business Executive (5%)
              </span>
            </div>
          </div>

          {isAdmin && (
            <div>
              <label className="text-[#94A3B8]">Override Sponsor Leg (Admin Option)</label>
              <select
                value={parentId}
                onChange={(e) => setParentId(e.target.value)}
                className="w-full mt-1 bg-[#0F172A] border border-[#1F2937] rounded-xl px-3 py-2 text-white font-bold focus:outline-none focus:border-[#1E40AF]"
              >
                <option value={loggedInEmployee ? loggedInEmployee.id : ''}>Directly under YOU ({currentUser?.fullName})</option>
                {existingEmployees
                  .filter(emp => !loggedInEmployee || emp.id !== loggedInEmployee.id)
                  .map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.userId ? emp.userId.fullName : emp.employeeCode} ({emp.employeeCode} - {emp.currentRank})
                    </option>
                  ))}
              </select>
            </div>
          )}

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
              {isSubmitting ? 'Adding...' : 'Add Downline Agent'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
