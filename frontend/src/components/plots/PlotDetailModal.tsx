import React, { useState, useEffect } from 'react';
import { Plot, Employee, PaymentMilestone } from '../../types';
import { X, DollarSign, UserCheck, CreditCard, ShoppingBag, FileText, CheckCircle2, Mail, Phone, User, Calendar, Plus, Trash2, Clock, AlertCircle } from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

interface PlotDetailModalProps {
  plot: Plot | null;
  onClose: () => void;
  onRefresh: () => void;
}

export const PlotDetailModal: React.FC<PlotDetailModalProps> = ({ plot, onClose, onRefresh }) => {
  if (!plot) return null;

  const { employee: loggedInEmployee } = useAuth();

  const [status, setStatus] = useState<string>(plot.status);
  const [ownerName, setOwnerName] = useState<string>(plot.ownerName || '');
  const [ownerPhone, setOwnerPhone] = useState<string>(plot.ownerPhone || '');
  const [ownerEmail, setOwnerEmail] = useState<string>(plot.ownerEmail || '');
  const [sellerEmployeeId, setSellerEmployeeId] = useState<string>(loggedInEmployee ? loggedInEmployee.id : '');
  const [paymentMode, setPaymentMode] = useState<string>('NET_BANKING');
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Part Payment & Milestone Schedule State
  const totalCost = plot.totalCost || plot.price || 0;
  const [paidAmount, setPaidAmount] = useState<number>(plot.paidAmount || 0);
  const [registryDate, setRegistryDate] = useState<string>(
    plot.registryDate ? new Date(plot.registryDate).toISOString().slice(0, 10) : ''
  );
  const [registryStatus, setRegistryStatus] = useState<'NOT_REGISTERED' | 'PENDING' | 'REGISTERED'>(
    plot.registryStatus || 'NOT_REGISTERED'
  );
  const [paymentMilestones, setPaymentMilestones] = useState<PaymentMilestone[]>(plot.paymentMilestones || []);

  // New Milestone Form State
  const [mTitle, setMTitle] = useState<string>('');
  const [mAmount, setMAmount] = useState<string>('');
  const [mDueDate, setMDueDate] = useState<string>('');
  const [mStatus, setMStatus] = useState<'PENDING' | 'RECEIVED'>('PENDING');

  useEffect(() => {
    fetchAgents();
  }, []);

  const fetchAgents = async () => {
    try {
      const res = await api.get('/employees');
      setEmployees(res.data);
      if (!sellerEmployeeId && res.data.length > 0) {
        setSellerEmployeeId(res.data[0].id);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const dueBalance = Math.max(0, totalCost - (Number(paidAmount) || 0));

  const handleAddMilestone = () => {
    if (!mTitle || !mAmount || !mDueDate) {
      alert('Please enter installment title, amount, and due date.');
      return;
    }
    const newM: PaymentMilestone = {
      title: mTitle,
      amount: Number(mAmount),
      dueDate: mDueDate,
      status: mStatus,
      paymentMode,
      receivedDate: mStatus === 'RECEIVED' ? new Date().toISOString() : undefined
    };
    setPaymentMilestones([...paymentMilestones, newM]);
    setMTitle('');
    setMAmount('');
    setMDueDate('');
  };

  const handleRemoveMilestone = (index: number) => {
    setPaymentMilestones(paymentMilestones.filter((_, i) => i !== index));
  };

  const handleToggleMilestoneStatus = (index: number) => {
    const updated = [...paymentMilestones];
    const current = updated[index].status;
    updated[index].status = current === 'RECEIVED' ? 'PENDING' : 'RECEIVED';
    updated[index].receivedDate = updated[index].status === 'RECEIVED' ? new Date().toISOString() : undefined;
    setPaymentMilestones(updated);

    // Auto recalculate paid total from received milestones!
    const newPaidTotal = updated
      .filter(m => m.status === 'RECEIVED')
      .reduce((sum, m) => sum + Number(m.amount), 0);
    if (newPaidTotal > 0) {
      setPaidAmount(newPaidTotal);
    }
  };

  const handleUpdateStatus = async () => {
    try {
      setIsSubmitting(true);
      await api.put(`/plots/${plot._id}/status`, {
        status,
        ownerName,
        ownerPhone,
        ownerEmail,
        paidAmount: Number(paidAmount) || 0,
        registryDate: registryDate || null,
        registryStatus,
        paymentMilestones,
        sellerEmployeeId: status === 'SOLD' ? (sellerEmployeeId || (loggedInEmployee ? loggedInEmployee.id : null)) : null,
        paymentMode
      });
      alert(status === 'SOLD' 
        ? 'Plot SOLD successfully! Part payment details saved & Differential commissions calculated!' 
        : 'Plot details & Part Payment Schedule updated successfully!');
      onRefresh();
      onClose();
    } catch (error) {
      console.error(error);
      alert('Failed to update plot details');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (st: string) => {
    switch (st) {
      case 'AVAILABLE': return 'bg-[#22C55E]/20 text-[#22C55E] border-[#22C55E]/40';
      case 'BOOKED': return 'bg-[#3B82F6]/20 text-[#3B82F6] border-[#3B82F6]/40';
      case 'PENDING': return 'bg-[#FACC15]/20 text-[#FACC15] border-[#FACC15]/40';
      case 'SOLD': return 'bg-[#EF4444]/20 text-[#EF4444] border-[#EF4444]/40';
      default: return 'bg-slate-800 text-slate-300';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-[#111827] border border-[#1F2937] w-full max-w-md h-full rounded-2xl p-6 flex flex-col justify-between shadow-2xl overflow-y-auto space-y-4">
        <div>
          {/* Header */}
          <div className="flex items-center justify-between border-b border-[#1F2937] pb-4">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-extrabold text-white">Plot {plot.plotNo}</h3>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${getStatusBadge(plot.status)}`}>
                  {plot.status}
                </span>
              </div>
              <p className="text-xs text-[#94A3B8] mt-1">Block {plot.block} • {plot.sizeSqft} sq.ft</p>
            </div>
            <button onClick={onClose} className="p-2 rounded-xl bg-[#0F172A] text-[#94A3B8] hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Pricing Details */}
          <div className="mt-4 glass-card p-4 rounded-xl border border-[#1F2937] flex items-center justify-between">
            <div>
              <p className="text-xs text-[#94A3B8]">Plot Total Cost</p>
              <h4 className="text-2xl font-extrabold text-[#22C55E] mt-1">₹{totalCost.toLocaleString('en-IN')}</h4>
            </div>
            <div className="text-right">
              <p className="text-xs text-[#94A3B8]">Rate / Sqft</p>
              <p className="text-sm font-bold text-white mt-1">₹{Math.round(totalCost / plot.sizeSqft)}</p>
            </div>
          </div>

          {/* Current Purchaser / Owner Info Display Card */}
          {plot.status !== 'AVAILABLE' && (plot.ownerName || plot.ownerPhone || plot.ownerEmail) && (
            <div className="mt-4 p-4 rounded-xl bg-[#0F172A] border border-[#1E40AF]/40 space-y-2.5 shadow-lg">
              <h5 className="font-bold text-[#3B82F6] flex items-center gap-2 text-xs">
                <UserCheck className="w-4 h-4 text-[#22C55E]" /> Purchaser / Owner Information:
              </h5>
              <div className="grid grid-cols-2 gap-2 text-[11px] text-[#94A3B8]">
                <div>
                  <span className="block text-[10px] uppercase font-bold text-slate-500">Name</span>
                  <span className="text-white font-bold flex items-center gap-1">
                    <User className="w-3 h-3 text-[#3B82F6]" /> {plot.ownerName || 'N/A'}
                  </span>
                </div>
                <div>
                  <span className="block text-[10px] uppercase font-bold text-slate-500">Phone</span>
                  <span className="text-white font-bold flex items-center gap-1">
                    <Phone className="w-3 h-3 text-[#22C55E]" /> {plot.ownerPhone || 'N/A'}
                  </span>
                </div>
                <div className="col-span-2">
                  <span className="block text-[10px] uppercase font-bold text-slate-500">Email</span>
                  <span className="text-white font-bold flex items-center gap-1">
                    <Mail className="w-3 h-3 text-[#FACC15]" /> {plot.ownerEmail || 'N/A'}
                  </span>
                </div>
                {plot.bookingDate && (
                  <div className="col-span-2 border-t border-[#1F2937] pt-2">
                    <span className="block text-[10px] uppercase font-bold text-slate-500">Booking / Sale Date</span>
                    <span className="text-emerald-400 font-bold">
                      {new Date(plot.bookingDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Part Payment & Balance Summary Card */}
          {status !== 'AVAILABLE' && (
            <div className="mt-4 p-4 rounded-xl bg-[#0F172A] border border-[#1F2937] space-y-3">
              <div className="flex items-center justify-between">
                <h5 className="font-bold text-white flex items-center gap-2 text-xs">
                  <CreditCard className="w-4 h-4 text-[#FACC15]" /> Part Payment & Dues Summary
                </h5>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-900/40 text-blue-300 border border-blue-800">
                  {Math.round((paidAmount / (totalCost || 1)) * 100)}% Paid
                </span>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-[#111827] h-2 rounded-full overflow-hidden border border-[#1F2937]">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-emerald-500 h-full transition-all duration-300"
                  style={{ width: `${Math.min(100, (paidAmount / (totalCost || 1)) * 100)}%` }}
                />
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                <div className="bg-[#111827] p-2.5 rounded-lg border border-[#1F2937]">
                  <span className="text-[#94A3B8] text-[10px] block">Advance / Paid Amount</span>
                  <span className="text-emerald-400 font-extrabold text-sm">₹{paidAmount.toLocaleString('en-IN')}</span>
                </div>
                <div className="bg-[#111827] p-2.5 rounded-lg border border-[#1F2937]">
                  <span className="text-[#94A3B8] text-[10px] block">Remaining Due Balance</span>
                  <span className="text-red-400 font-extrabold text-sm">₹{dueBalance.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>
          )}

          {/* Status & Booking Form */}
          <div className="mt-6 space-y-4 text-xs">
            <h4 className="font-bold text-[#94A3B8] uppercase tracking-wider flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-[#F97316]" /> Plot Status & Customer Details
            </h4>
            
            <div>
              <label className="text-[#94A3B8]">Plot Status Action</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full mt-1 bg-[#0F172A] border border-[#1F2937] rounded-xl px-3 py-2 text-white font-bold focus:outline-none focus:border-[#1E40AF]"
              >
                <option value="AVAILABLE">🟢 AVAILABLE (Green)</option>
                <option value="BOOKED">🔵 BOOKED (Blue)</option>
                <option value="PENDING">🟡 PENDING (Yellow)</option>
                <option value="SOLD">🔴 SOLD (Triggers Commission Engine!)</option>
              </select>
            </div>

            <div>
              <label className="text-[#94A3B8]">Buyer / Customer Full Name</label>
              <input
                type="text"
                placeholder="Enter customer name..."
                value={ownerName}
                onChange={(e) => setOwnerName(e.target.value)}
                className="w-full mt-1 bg-[#0F172A] border border-[#1F2937] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#1E40AF]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[#94A3B8]">Buyer Phone Number</label>
                <input
                  type="text"
                  placeholder="+91 9876543210"
                  value={ownerPhone}
                  onChange={(e) => setOwnerPhone(e.target.value)}
                  className="w-full mt-1 bg-[#0F172A] border border-[#1F2937] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#1E40AF]"
                />
              </div>
              <div>
                <label className="text-[#94A3B8]">Buyer Email Address</label>
                <input
                  type="email"
                  placeholder="customer@hippo.com"
                  value={ownerEmail}
                  onChange={(e) => setOwnerEmail(e.target.value)}
                  className="w-full mt-1 bg-[#0F172A] border border-[#1F2937] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#1E40AF]"
                />
              </div>
            </div>

            {/* Part Payment & Registry Schedule Controls */}
            {status !== 'AVAILABLE' && (
              <div className="p-3.5 bg-[#0F172A] rounded-xl border border-[#1F2937] space-y-4">
                <h5 className="font-bold text-white flex items-center gap-2 text-xs">
                  <Calendar className="w-4 h-4 text-[#3B82F6]" /> Part Payment & Registry Management
                </h5>

                {/* Amount Paid Input & Registry Date */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[#94A3B8]">Total Amount Paid Till Date (₹)</label>
                    <input
                      type="number"
                      placeholder="e.g. 200000"
                      value={paidAmount}
                      onChange={(e) => setPaidAmount(Number(e.target.value))}
                      className="w-full mt-1 bg-[#111827] border border-[#1F2937] rounded-xl px-3 py-2 text-emerald-400 font-bold focus:outline-none focus:border-[#1E40AF]"
                    />
                  </div>

                  <div>
                    <label className="text-[#94A3B8]">Government Registry Status</label>
                    <select
                      value={registryStatus}
                      onChange={(e) => setRegistryStatus(e.target.value as any)}
                      className="w-full mt-1 bg-[#111827] border border-[#1F2937] rounded-xl px-3 py-2 text-white font-bold focus:outline-none focus:border-[#1E40AF]"
                    >
                      <option value="NOT_REGISTERED">Not Registered</option>
                      <option value="PENDING">Registration Scheduled</option>
                      <option value="REGISTERED">Registry Completed</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-[#94A3B8]">Expected Registry Date</label>
                  <input
                    type="date"
                    value={registryDate}
                    onChange={(e) => setRegistryDate(e.target.value)}
                    className="w-full mt-1 bg-[#111827] border border-[#1F2937] rounded-xl px-3 py-2 text-white font-bold focus:outline-none focus:border-[#1E40AF]"
                  />
                </div>

                {/* Payment Milestones Schedule */}
                <div className="border-t border-[#1F2937] pt-3 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-white font-bold flex items-center gap-1.5 text-xs">
                      <Clock className="w-3.5 h-3.5 text-[#FACC15]" /> Installment Milestone Schedule
                    </label>
                    <span className="text-[10px] text-[#94A3B8]">{paymentMilestones.length} Milestones</span>
                  </div>

                  {/* List of Milestones */}
                  {paymentMilestones.length > 0 ? (
                    <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                      {paymentMilestones.map((m, idx) => (
                        <div key={idx} className="p-2.5 bg-[#111827] rounded-xl border border-[#1F2937] flex items-center justify-between text-xs">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-white">{m.title}</span>
                              <span 
                                onClick={() => handleToggleMilestoneStatus(idx)}
                                className={`cursor-pointer px-2 py-0.5 rounded text-[9px] font-extrabold border ${
                                  m.status === 'RECEIVED' 
                                    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40' 
                                    : 'bg-yellow-500/20 text-yellow-400 border-yellow-500/40'
                                }`}
                              >
                                {m.status} (Click to toggle)
                              </span>
                            </div>
                            <p className="text-[10px] text-[#94A3B8] mt-0.5">
                              Due: {new Date(m.dueDate).toLocaleDateString()}
                            </p>
                          </div>

                          <div className="flex items-center gap-3">
                            <span className="font-extrabold text-emerald-400">₹{Number(m.amount).toLocaleString('en-IN')}</span>
                            <button
                              type="button"
                              onClick={() => handleRemoveMilestone(idx)}
                              className="text-red-400 hover:text-red-300 p-1"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[11px] text-[#94A3B8] italic bg-[#111827] p-2.5 rounded-xl border border-[#1F2937] text-center">
                      No part payment milestones added yet. Add below!
                    </p>
                  )}

                  {/* Add New Milestone Inputs */}
                  <div className="p-3 bg-[#111827] rounded-xl border border-[#1F2937] space-y-2">
                    <p className="font-bold text-[#3B82F6] text-[11px]">Add Upcoming Installment / Payment Date:</p>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        placeholder="e.g. 2nd Installment"
                        value={mTitle}
                        onChange={(e) => setMTitle(e.target.value)}
                        className="bg-[#0F172A] border border-[#1F2937] rounded-lg px-2.5 py-1.5 text-white text-xs focus:outline-none"
                      />
                      <input
                        type="number"
                        placeholder="Amount (₹)"
                        value={mAmount}
                        onChange={(e) => setMAmount(e.target.value)}
                        className="bg-[#0F172A] border border-[#1F2937] rounded-lg px-2.5 py-1.5 text-white text-xs focus:outline-none"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="date"
                        value={mDueDate}
                        onChange={(e) => setMDueDate(e.target.value)}
                        className="bg-[#0F172A] border border-[#1F2937] rounded-lg px-2.5 py-1.5 text-white text-xs focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={handleAddMilestone}
                        className="py-1.5 bg-[#1E40AF] hover:bg-blue-700 text-white font-bold rounded-lg text-xs flex items-center justify-center gap-1"
                      >
                        <Plus className="w-3.5 h-3.5" /> Add Milestone
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {status === 'SOLD' && (
              <div className="p-3 bg-[#0F172A] rounded-xl border border-[#1E40AF]/40 space-y-3">
                <p className="font-bold text-[#F97316] text-[11px]">MLM Commission Distribution Settings:</p>

                <div>
                  <label className="text-[#94A3B8]">Selling Agent (Defaults to Logged-in Agent)</label>
                  <select
                    value={sellerEmployeeId}
                    onChange={(e) => setSellerEmployeeId(e.target.value)}
                    className="w-full mt-1 bg-[#111827] border border-[#1F2937] rounded-xl px-3 py-2 text-white font-bold focus:outline-none focus:border-[#1E40AF]"
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
                  <label className="text-[#94A3B8]">Payment Mode</label>
                  <select
                    value={paymentMode}
                    onChange={(e) => setPaymentMode(e.target.value)}
                    className="w-full mt-1 bg-[#111827] border border-[#1F2937] rounded-xl px-3 py-2 text-white font-bold focus:outline-none focus:border-[#1E40AF]"
                  >
                    <option value="NET_BANKING">Net Banking / RTGS</option>
                    <option value="UPI">UPI Payment</option>
                    <option value="CHEQUE">Bank Cheque</option>
                    <option value="CASH">Cash</option>
                    <option value="DEMAND_DRAFT">Demand Draft</option>
                  </select>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-4 border-t border-[#1F2937] flex items-center gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl bg-[#0F172A] text-xs font-bold text-[#94A3B8] hover:text-white border border-[#1F2937]"
          >
            Cancel
          </button>
          <button
            onClick={handleUpdateStatus}
            disabled={isSubmitting}
            className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-[#1E40AF] to-blue-900 text-xs font-bold text-white shadow-lg shadow-blue-900/40 hover:opacity-90"
          >
            {isSubmitting ? 'Processing...' : status === 'SOLD' ? 'Sell Plot & Credit Upline' : 'Save Plot & Payment Schedule'}
          </button>
        </div>
      </div>
    </div>
  );
};
