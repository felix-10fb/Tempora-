import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Lock, Mail, User as UserIcon, Phone, Eye, EyeOff, ArrowRight, Zap, Package } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'register';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'login'
}) => {
  const { login, register } = useAuth();
  const { success, error } = useToast();
  const navigate = useNavigate();

  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [name, setName] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [role, setRole] = useState<'CUSTOMER' | 'OWNER'>('CUSTOMER');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      if (mode === 'login') {
        await login(email, password);
        success("Welcome back to TEMPORA!");
      } else {
        await register(name, email, password, role, phone);
        success("Account created successfully!");
      }
      onClose();
    } catch (err: any) {
      error(err.message || "Authentication failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickDemoLogin = async (demoEmail: string, demoPass: string, label: string) => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      await login(demoEmail, demoPass);
      success(`Logged in as demo ${label}!`);
      onClose();
      if (label === 'Admin') navigate('/admin');
      else if (label === 'Host') navigate('/owner');
      else navigate('/dashboard');
    } catch (err: any) {
      error(err.message || "Failed to log in");
    } finally {
      setIsSubmitting(false);
    }
  };

  const goToFullPage = () => {
    onClose();
    navigate(`/auth?mode=${mode}`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={onClose}>
      <div
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-md w-full overflow-hidden shadow-2xl relative animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="p-6 sm:p-8 pb-4">
          <div className="flex items-center gap-2.5 mb-3">
            <img src="/tempora-logo.jpg" alt="Tempora" className="w-8 h-8 rounded-xl shadow-sm object-cover" />
            <span className="font-display font-extrabold text-lg text-slate-900 dark:text-white">TEMPORA</span>
          </div>

          <h2 className="font-display font-black text-2xl text-slate-900 dark:text-white">
            {mode === 'login' ? 'Welcome Back' : 'Create Account'}
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            {mode === 'login'
              ? 'Sign in to access your rentals, wishlist, and dashboard.'
              : 'Join the hyperlocal movement — own less, live more.'}
          </p>

          {/* Mode Switch */}
          <div className="mt-5 grid grid-cols-2 p-1 rounded-xl bg-slate-100 dark:bg-slate-800">
            <button
              onClick={() => setMode('login')}
              className={`py-2 text-xs font-bold rounded-lg transition-all ${
                mode === 'login'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >Log In</button>
            <button
              onClick={() => setMode('register')}
              className={`py-2 text-xs font-bold rounded-lg transition-all ${
                mode === 'register'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >Sign Up</button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 sm:px-8 pb-5 space-y-3.5">
          {mode === 'register' && (
            <>
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">Full Name</label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text" required value={name} onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Rahul Sundaram"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/60 text-xs font-medium text-slate-900 dark:text-white focus:border-emerald-500 transition"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">Phone</label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel" value={phone} onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98840 12345"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/60 text-xs font-medium text-slate-900 dark:text-white focus:border-emerald-500 transition"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">I want to</label>
                <div className="grid grid-cols-2 gap-2">
                  <button type="button" onClick={() => setRole('CUSTOMER')}
                    className={`p-2.5 rounded-xl border-2 text-xs font-bold transition ${
                      role === 'CUSTOMER'
                        ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                    }`}>
                    <Package className={`w-4 h-4 mb-1 ${role === 'CUSTOMER' ? 'text-emerald-600' : 'text-slate-400'}`} />
                    Rent Products
                  </button>
                  <button type="button" onClick={() => setRole('OWNER')}
                    className={`p-2.5 rounded-xl border-2 text-xs font-bold transition ${
                      role === 'OWNER'
                        ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                    }`}>
                    <Zap className={`w-4 h-4 mb-1 ${role === 'OWNER' ? 'text-emerald-600' : 'text-slate-400'}`} />
                    List & Earn
                  </button>
                </div>
              </div>
            </>
          )}

          <div>
            <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">Email</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/60 text-xs font-medium text-slate-900 dark:text-white focus:border-emerald-500 transition"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold uppercase text-slate-400">Password</label>
              {mode === 'login' && (
                <button type="button" className="text-[11px] font-semibold text-emerald-600 hover:text-emerald-500">Forgot?</button>
              )}
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'} required value={password} onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/60 text-xs font-medium text-slate-900 dark:text-white focus:border-emerald-500 transition"
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit" disabled={isSubmitting}
            className="w-full py-3 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 transition-all shadow-glow-emerald disabled:opacity-50 flex items-center justify-center gap-1.5"
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/></svg>
                Processing...
              </span>
            ) : (
              <>
                <span>{mode === 'login' ? 'Sign In' : 'Create Account'}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Demo Logins + Full page link */}
        <div className="px-6 sm:px-8 py-4 bg-slate-50 dark:bg-slate-800/60 border-t border-slate-100 dark:border-slate-800 space-y-3">
          <span className="text-[10px] font-bold uppercase text-slate-400 block tracking-wider flex items-center gap-1">
            <Zap className="w-3 h-3 text-amber-500" /> Quick Demo Access
          </span>
          <div className="grid grid-cols-3 gap-2">
            <button type="button" onClick={() => handleQuickDemoLogin('customer@tempora.io', 'customer123', 'Renter')} disabled={isSubmitting}
              className="py-2 px-2 rounded-xl bg-white dark:bg-slate-700/60 border border-slate-200 dark:border-slate-600 text-[10px] font-bold text-slate-700 dark:text-slate-200 hover:border-emerald-400 transition disabled:opacity-50">
              <span className="block text-base mb-0.5">🛒</span> Renter
            </button>
            <button type="button" onClick={() => handleQuickDemoLogin('owner@tempora.io', 'owner123', 'Host')} disabled={isSubmitting}
              className="py-2 px-2 rounded-xl bg-white dark:bg-slate-700/60 border border-slate-200 dark:border-slate-600 text-[10px] font-bold text-slate-700 dark:text-slate-200 hover:border-emerald-400 transition disabled:opacity-50">
              <span className="block text-base mb-0.5">🏪</span> Host
            </button>
            <button type="button" onClick={() => handleQuickDemoLogin('admin@tempora.io', 'admin123', 'Admin')} disabled={isSubmitting}
              className="py-2 px-2 rounded-xl bg-white dark:bg-slate-700/60 border border-slate-200 dark:border-slate-600 text-[10px] font-bold text-violet-700 dark:text-violet-300 hover:border-violet-400 transition disabled:opacity-50">
              <span className="block text-base mb-0.5">🛡️</span> Admin
            </button>
          </div>

          <button onClick={goToFullPage} className="w-full text-center text-[11px] font-semibold text-emerald-600 hover:text-emerald-500 transition pt-1">
            Open full sign-in page →
          </button>
        </div>
      </div>
    </div>
  );
};
