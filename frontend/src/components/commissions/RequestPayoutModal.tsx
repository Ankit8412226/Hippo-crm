import React, { useState } from 'react';
import { X, CreditCard, DollarSign } from 'lucide-react';
import api from '../../services/api';
import { Employee } from '../../types';
import { useAuth } from '../../context/AuthContext';

interface RequestPayoutModalProps {
  employees: Employee[];
  onClose: () => void;
  onSuccess: () => void;
}

export const RequestPayoutModal: React.FC<RequestPayoutModalProps> = ({
  employees,
  onClose,
  onSuccess
}) => {
  const { employee: loggedInEmployee } = useAuth();

  const [employeeId, setEmployeeId] = useState<string>(loggedInEmployee ? loggedInEmployee.id : '');
  const [amount, setAmount] = useState<number>(50000);
  const [accountNumber, setAccountNumber] = useState<string>('918273645019');
  const [ifscCode, setIfscCode] = useState<string>('HDFC0001234');
  const [bankName, setBankName] = useState<string>('HDFC Bank');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      await api.post('/payouts/request', {
        employeeId: employeeId || (loggedInEmployee ? loggedInEmployee.id : null),
        amount,
        bankDetails: {
          accountNumber,
          ifscCode,
          bankName
        }
      });

      alert('Payout request submitted successfully! Pending admin approval.');
      onSuccess();
      onClose();
    } catch (error) {
      console.error(error);
      alert('Failed to submit payout request');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-[#111827] border border-[#1F2937] w-full max-w-md rounded-2xl p-6 space-y-6 shadow-2xl">
        <div className="flex items-center justify-between border-b border-[#1F2937] pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#22C55E]/20 border border-[#22C55E]/40 text-[#22C55E] flex items-center justify-center">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Request Commission Payout</h3>
              <p className="text-xs text-[#94A3B8]">Disburse earned MLM sales commissions to bank account</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl bg-[#0F172A] text-[#94A3B8] hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="text-[#94A3B8]">Select Beneficiary Agent</label>
            <select
              value={employeeId}
              onChange={(e) => setEmployeeId(e.target.value)}
              className="w-full mt-1 bg-[#0F172A] border border-[#1F2937] rounded-xl px-3 py-2 text-white font-bold focus:outline-none focus:border-[#1E40AF]"
            >
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.userId ? emp.userId.fullName : emp.employeeCode} ({emp.employeeCode} - {emp.currentRank})
                  {loggedInEmployee && emp.id === loggedInEmployee.id ? ' [YOU]' : ''}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[#94A3B8]">Payout Amount (₹)</label>
            <input
              type="number"
              required
              min={1000}
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="w-full mt-1 bg-[#0F172A] border border-[#1F2937] rounded-xl px-3 py-2 text-white font-extrabold text-sm focus:outline-none focus:border-[#1E40AF]"
            />
          </div>

          <div className="p-3 bg-[#0F172A] rounded-xl border border-[#1F2937] space-y-3">
            <p className="font-bold text-white text-[11px]">Bank Account Details:</p>
            
            <div>
              <label className="text-[#94A3B8]">Bank Name</label>
              <input
                type="text"
                required
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                className="w-full mt-1 bg-[#111827] border border-[#1F2937] rounded-xl px-3 py-1.5 text-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[#94A3B8]">Account Number</label>
                <input
                  type="text"
                  required
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  className="w-full mt-1 bg-[#111827] border border-[#1F2937] rounded-xl px-3 py-1.5 text-white font-mono"
                />
              </div>
              <div>
                <label className="text-[#94A3B8]">IFSC Code</label>
                <input
                  type="text"
                  required
                  value={ifscCode}
                  onChange={(e) => setIfscCode(e.target.value)}
                  className="w-full mt-1 bg-[#111827] border border-[#1F2937] rounded-xl px-3 py-1.5 text-white font-mono"
                />
              </div>
            </div>
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
              className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-[#22C55E] to-emerald-600 font-bold text-xs text-white shadow-lg hover:opacity-90"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
