import React, { createContext, useContext, useState, ReactNode } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info';

interface Toast {
  id: string;
  type: ToastType;
  message: string;
}

interface ToastContextType {
  toast: (message: string, type?: ToastType) => void;
  success: (message: string) => void;
  error: (message: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = (message: string, type: ToastType = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider
      value={{
        toast: addToast,
        success: (msg) => addToast(msg, 'success'),
        error: (msg) => addToast(msg, 'error')
      }}
    >
      {children}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 max-w-md w-full pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto flex items-center justify-between p-4 rounded-xl shadow-elevated border backdrop-blur-md transition-all duration-300 transform translate-y-0 ${
              t.type === 'success'
                ? 'bg-emerald-50/90 dark:bg-emerald-950/90 border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-100'
                : t.type === 'error'
                ? 'bg-red-50/90 dark:bg-red-950/90 border-red-200 dark:border-red-800 text-red-900 dark:text-red-100'
                : 'bg-white/90 dark:bg-slate-900/90 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100'
            }`}
          >
            <div className="flex items-center gap-3">
              {t.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />}
              {t.type === 'error' && <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0" />}
              {t.type === 'info' && <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0" />}
              <span className="text-sm font-medium">{t.message}</span>
            </div>
            <button
              onClick={() => removeToast(t.id)}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within ToastProvider');
  return context;
};
