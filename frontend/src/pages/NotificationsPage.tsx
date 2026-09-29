import React, { useState, useEffect } from 'react';
import { Bell, CheckCheck, Package, DollarSign, ShieldAlert, Sparkles } from 'lucide-react';
import { api } from '../services/api';
import { NotificationItem } from '../types';
import { useToast } from '../context/ToastContext';

export const NotificationsPage: React.FC = () => {
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchNotifs = async () => {
    setIsLoading(true);
    try {
      const data = await api.getNotifications();
      setNotifications(data);
    } catch {
      // Fallback
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifs();
  }, []);

  const handleMarkAllRead = async () => {
    try {
      await api.markAllNotificationsRead();
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      toast("All notifications marked as read", "info");
    } catch {
      // Fallback
    }
  };

  const getIcon = (type: string) => {
    if (type.includes('BOOKING')) return <Package className="w-5 h-5 text-emerald-500" />;
    if (type.includes('PAYMENT')) return <DollarSign className="w-5 h-5 text-emerald-500" />;
    if (type.includes('DISPUTE')) return <ShieldAlert className="w-5 h-5 text-red-500" />;
    return <Sparkles className="w-5 h-5 text-violet-500" />;
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display font-black text-3xl text-slate-900 dark:text-white">
            Notifications Center
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time updates on rentals, returns, payouts, and AI discovery.
          </p>
        </div>

        <button
          onClick={handleMarkAllRead}
          className="text-xs font-bold text-emerald-600 hover:underline flex items-center gap-1.5"
        >
          <CheckCheck className="w-4 h-4" />
          <span>Mark all read</span>
        </button>
      </div>

      <div className="divide-y divide-slate-100 dark:divide-slate-800 glass-panel rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
        {notifications.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400">
            You're all caught up! No new notifications.
          </div>
        ) : (
          notifications.map((n) => (
            <div
              key={n.id}
              className={`p-4 sm:p-5 flex items-start gap-4 transition ${
                !n.is_read ? 'bg-emerald-50/40 dark:bg-emerald-950/20' : ''
              }`}
            >
              <div className="p-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 shrink-0">
                {getIcon(n.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                    {n.title}
                  </h4>
                  <span className="text-[10px] text-slate-400">
                    {new Date(n.created_at || Date.now()).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                  {n.message}
                </p>
              </div>
              {!n.is_read && (
                <span className="w-2 h-2 rounded-full bg-emerald-500 mt-2 shrink-0" />
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
