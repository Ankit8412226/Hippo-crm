import React, { useState } from 'react';
import { Settings, Shield, Key, Bell, Database, Save, CheckCircle } from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const [companyName, setCompanyName] = useState('Hippo RealEstate CRM');
  const [currency, setCurrency] = useState('INR (₹)');
  const [enableWhatsapp, setEnableWhatsapp] = useState(true);
  const [enableEmail, setEnableEmail] = useState(true);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-extrabold text-[#F8FAFC]">System & Security Settings</h2>
          <p className="text-xs text-[#94A3B8] mt-1">SaaS organization preferences, API keys, and RBAC permissions</p>
        </div>
        {savedSuccess && (
          <div className="flex items-center gap-2 text-xs font-bold text-[#22C55E] bg-[#22C55E]/10 px-3 py-1.5 rounded-xl border border-[#22C55E]/30">
            <CheckCircle className="w-4 h-4" /> Settings saved successfully!
          </div>
        )}
      </div>

      <form onSubmit={handleSave} className="glass-card p-6 rounded-2xl border border-[#1F2937] space-y-6 max-w-3xl">
        <div className="space-y-4">
          <h3 className="font-bold text-white text-base border-b border-[#1F2937] pb-2 flex items-center gap-2">
            <Settings className="w-4 h-4 text-[#3B82F6]" /> Organization Identity
          </h3>
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <label className="text-[#94A3B8]">Company Name</label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="w-full mt-1 bg-[#0F172A] border border-[#1F2937] rounded-xl px-3 py-2 text-white font-bold"
              />
            </div>
            <div>
              <label className="text-[#94A3B8]">Default Currency</label>
              <input
                type="text"
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full mt-1 bg-[#0F172A] border border-[#1F2937] rounded-xl px-3 py-2 text-white font-bold"
              />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="font-bold text-white text-base border-b border-[#1F2937] pb-2 flex items-center gap-2">
            <Bell className="w-4 h-4 text-[#F97316]" /> Multi-Channel Dispatch Options
          </h3>
          <div className="space-y-3 text-xs text-[#94A3B8]">
            <div className="flex items-center justify-between">
              <span>Enable Automated WhatsApp Payout Alerts</span>
              <input
                type="checkbox"
                checked={enableWhatsapp}
                onChange={(e) => setEnableWhatsapp(e.target.checked)}
                className="w-4 h-4 accent-[#1E40AF]"
              />
            </div>
            <div className="flex items-center justify-between">
              <span>Enable Email Payout Alerts & Invoices</span>
              <input
                type="checkbox"
                checked={enableEmail}
                onChange={(e) => setEnableEmail(e.target.checked)}
                className="w-4 h-4 accent-[#1E40AF]"
              />
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-[#1F2937] flex justify-end">
          <button
            type="submit"
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#1E40AF] to-blue-900 text-white font-bold text-xs shadow-lg flex items-center gap-2 hover:opacity-90"
          >
            <Save className="w-4 h-4" /> Save System Settings
          </button>
        </div>
      </form>
    </div>
  );
};
