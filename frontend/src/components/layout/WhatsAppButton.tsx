import React, { useState } from 'react';
import { MessageCircle, X } from 'lucide-react';

interface WhatsAppButtonProps {
  phoneNumber?: string;
  defaultMessage?: string;
}

export const WhatsAppButton: React.FC<WhatsAppButtonProps> = ({
  phoneNumber = (import.meta as any).env?.VITE_WHATSAPP_NUMBER || '+919876543210',
  defaultMessage = 'Hello Hippo RealEstate! I would like to inquire about plot availability and projects.'
}) => {
  const [showTooltip, setShowTooltip] = useState(true);

  const cleanNumber = phoneNumber.replace(/[^0-9]/g, '');
  const encodedMsg = encodeURIComponent(defaultMessage);
  const whatsappUrl = `https://wa.me/${cleanNumber}?text=${encodedMsg}`;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end group select-none">
      {/* Interactive Tooltip Badge */}
      {showTooltip && (
        <div className="mb-3 mr-1 bg-[#1E293B] text-white text-xs px-3.5 py-2 rounded-2xl shadow-xl border border-[#334155] flex items-center gap-2 animate-bounce">
          <span className="w-2 h-2 rounded-full bg-[#22C55E] animate-ping" />
          <span className="font-medium text-slate-200">Have questions? Chat on WhatsApp!</span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowTooltip(false);
            }}
            className="text-slate-400 hover:text-white transition-colors ml-1"
            title="Close hint"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Floating Button */}
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="relative flex items-center justify-center w-14 h-14 bg-[#22C55E] hover:bg-[#16A34A] text-white rounded-full shadow-2xl shadow-emerald-600/40 transition-all duration-300 transform hover:scale-110 active:scale-95 group-hover:rotate-6"
        aria-label="Contact on WhatsApp"
      >
        <MessageCircle className="w-7 h-7 fill-current" />
        <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-400 rounded-full border-2 border-[#0F172A] animate-pulse" />
      </a>
    </div>
  );
};

export default WhatsAppButton;
