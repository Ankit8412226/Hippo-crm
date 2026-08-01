import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { NotificationItem } from '../types';
import { Bell, MessageSquare, Mail, Smartphone } from 'lucide-react';

export const NotificationsPage: React.FC = () => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications');
      setNotifications(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  const getChannelIcon = (ch: string) => {
    switch (ch) {
      case 'WHATSAPP': return <MessageSquare className="w-4 h-4 text-[#22C55E]" />;
      case 'EMAIL': return <Mail className="w-4 h-4 text-[#3B82F6]" />;
      default: return <Bell className="w-4 h-4 text-[#F97316]" />;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-extrabold text-[#F8FAFC]">Multi-Channel Notifications & Dispatch Logs</h2>
          <p className="text-xs text-[#94A3B8] mt-1">In-App, Email, and WhatsApp automated commission alerts</p>
        </div>
      </div>

      <div className="glass-card p-6 rounded-2xl border border-[#1F2937] space-y-3">
        {notifications.map((n) => (
          <div key={n._id} className="bg-[#0F172A] p-4 rounded-xl border border-[#1F2937] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-[#111827] border border-[#1F2937]">
                {getChannelIcon(n.channel)}
              </div>
              <div>
                <h4 className="font-bold text-sm text-white">{n.title}</h4>
                <p className="text-xs text-[#94A3B8] mt-0.5">{n.message}</p>
              </div>
            </div>
            <span className="text-[10px] text-[#94A3B8] font-mono">{new Date(n.sentAt).toLocaleTimeString()}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
