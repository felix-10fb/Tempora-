import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Lock, Mail, User as UserIcon, Phone, Eye, EyeOff,
  ArrowRight, ShieldCheck, Star, Zap, Check, ChevronRight,
  Package, Clock, MapPin
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const FEATURES = [
  { icon: Package, title: 'Rent Anything', desc: 'Cameras, furniture, power tools — rent what you need, when you need it.' },
  { icon: Clock, title: 'Flexible Duration', desc: 'Hourly, daily, weekly — pick the rental period that fits your life.' },
  { icon: MapPin, title: 'Hyperlocal', desc: 'Find items near you across Tamil Nadu with pincode-based search.' },
  { icon: ShieldCheck, title: 'Trust Verified', desc: 'Every user is verified with trust scores and review history.' },
];

const TESTIMONIALS = [
  { name: 'Priya M.', role: 'Host', text: 'I earned ₹12,000 last month renting out my camera gear!', rating: 5, avatar: 'PM' },
  { name: 'Arjun R.', role: 'Renter', text: 'Saved ₹8,000 by renting furniture for my 3-month internship.', rating: 5, avatar: 'AR' },
  { name: 'Deepa S.', role: 'Host', text: 'The trust system makes me feel safe sharing my belongings.', rating: 5, avatar: 'DS' },
];

export const AuthPage: React.FC = () => {
  const { login, register, user } = useAuth();
  const { success, error: showError } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialMode = searchParams.get('mode') === 'register' ? 'register' : 'login';

  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<'CUSTOMER' | 'OWNER'>('CUSTOMER');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  // Auto-rotate testimonials
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % TESTIMONIALS.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  // Redirect if already authenticated with a real token
  useEffect(() => {
    const token = localStorage.getItem('tempora_token');
    if (token && user && user.id !== 'demo-customer-uuid') {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const passwordStrength = (p: string): { score: number; label: string; color: string } => {
    let score = 0;
    if (p.length >= 8) score++;
    if (/[A-Z]/.test(p)) score++;
    if (/[0-9]/.test(p)) score++;
    if (/[^A-Za-z0-9]/.test(p)) score++;
    if (p.length >= 12) score++;
    const labels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong'];
    const colors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-emerald-400', 'bg-emerald-600'];
    const idx = Math.min(score, 4);
    return { score, label: labels[idx], color: colors[idx] };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    // Basic validation
    if (mode === 'register' && password.length < 6) {
      showError('Password must be at least 6 characters.');
      return;
    }

    setIsSubmitting(true);
    try {
      if (mode === 'login') {
        await login(email, password);
        success('Welcome back to TEMPORA!');
      } else {
        await register(name, email, password, role, phone);
        success('Account created! Welcome to TEMPORA!');
      }
      navigate('/dashboard');
    } catch (err: any) {
      showError(err.message || 'Authentication failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDemoLogin = async (demoEmail: string, demoPass: string, label: string) => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      await login(demoEmail, demoPass);
      success(`Logged in as demo ${label}!`);
      if (label === 'Admin') navigate('/admin');
      else if (label === 'Host') navigate('/owner');
      else navigate('/dashboard');
    } catch (err: any) {
      showError(err.message || 'Demo login failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const pStr = passwordStrength(password);

  return (
    <div className="min-h-screen auth-bg flex">
      {/* ━━━ LEFT PANEL — BRAND SHOWCASE ━━━ */}
      <div className="hidden lg:flex lg:w-[45%] xl:w-[42%] relative overflow-hidden flex-col justify-between p-10 xl:p-14">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-600 via-teal-600 to-emerald-800" />
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.4\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }} />
        
        {/* Content */}
        <div className="relative z-10">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-12">
            <img src="/tempora-logo.jpg" alt="Tempora" className="w-12 h-12 rounded-2xl shadow-lg" />
            <div>
              <h1 className="font-display font-extrabold text-2xl text-white tracking-tight">TEMPORA</h1>
              <p className="text-xs font-semibold text-emerald-200 tracking-widest uppercase">Own Less. Live More.</p>
            </div>
          </div>

          {/* Hero text */}
          <h2 className="font-display font-black text-4xl xl:text-5xl text-white leading-tight mb-4">
            The Smarter Way<br />to Own Things.
          </h2>
          <p className="text-emerald-100 text-base max-w-md leading-relaxed mb-10">
            Join thousands of people across Tamil Nadu who rent instead of buy. 
            Save money, reduce waste, and access premium products when you need them.
          </p>

          {/* Feature Cards */}
          <div className="grid grid-cols-2 gap-3">
            {FEATURES.map((feat, i) => (
              <div key={i} className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/15 hover:bg-white/15 transition-colors">
                <feat.icon className="w-5 h-5 text-emerald-300 mb-2" />
                <h3 className="text-sm font-bold text-white mb-0.5">{feat.title}</h3>
                <p className="text-xs text-emerald-200 leading-relaxed">{feat.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Testimonials */}
        <div className="relative z-10">
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-5 border border-white/15">
            <div className="flex items-center gap-1 mb-3">
              {[...Array(TESTIMONIALS[activeTestimonial].rating)].map((_, i) => (
                <Star key={i} className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
              ))}
            </div>
            <p className="text-sm text-white/90 italic mb-4">"{TESTIMONIALS[activeTestimonial].text}"</p>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-emerald-400/30 flex items-center justify-center text-white text-xs font-bold">
                  {TESTIMONIALS[activeTestimonial].avatar}
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">{TESTIMONIALS[activeTestimonial].name}</p>
                  <p className="text-xs text-emerald-300">{TESTIMONIALS[activeTestimonial].role}</p>
                </div>
              </div>
              <div className="flex gap-1.5">
                {TESTIMONIALS.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveTestimonial(i)}
                    className={`w-2 h-2 rounded-full transition-all ${i === activeTestimonial ? 'bg-white w-5' : 'bg-white/30 hover:bg-white/50'}`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Stats bar */}
          <div className="mt-5 flex items-center gap-6 text-emerald-200 text-xs">
            <div><span className="text-lg font-extrabold text-white font-display">2,400+</span><br />Active Items</div>
            <div className="w-px h-8 bg-white/20" />
            <div><span className="text-lg font-extrabold text-white font-display">1,200+</span><br />Happy Users</div>
            <div className="w-px h-8 bg-white/20" />
            <div><span className="text-lg font-extrabold text-white font-display">₹8.5L+</span><br />Saved</div>
          </div>
        </div>
      </div>

      {/* ━━━ RIGHT PANEL — AUTH FORM ━━━ */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-md animate-slide-up">
          
          {/* Mobile Logo */}
          <div className="flex lg:hidden items-center gap-3 mb-8">
            <img src="/tempora-logo.jpg" alt="Tempora" className="w-10 h-10 rounded-xl shadow-md" />
            <div>
              <h1 className="font-display font-extrabold text-xl text-slate-900 dark:text-white">TEMPORA</h1>
              <p className="text-[10px] font-bold text-emerald-600 tracking-widest uppercase">Own Less. Live More.</p>
            </div>
          </div>

          {/* Title */}
          <h2 className="font-display font-black text-3xl text-slate-900 dark:text-white mb-1">
            {mode === 'login' ? 'Welcome back' : 'Create your account'}
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-7">
            {mode === 'login'
              ? 'Enter your credentials to access your dashboard.'
              : 'Start renting or listing products in minutes.'}
          </p>

          {/* Mode Toggle */}
          <div className="grid grid-cols-2 p-1 rounded-2xl bg-slate-100 dark:bg-slate-800/80 mb-7">
            <button
              onClick={() => setMode('login')}
              className={`py-2.5 text-sm font-bold rounded-xl transition-all duration-200 ${
                mode === 'login'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              Log In
            </button>
            <button
              onClick={() => setMode('register')}
              className={`py-2.5 text-sm font-bold rounded-xl transition-all duration-200 ${
                mode === 'register'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              Sign Up
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <>
                {/* Full Name */}
                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wide">Full Name</label>
                  <div className="relative">
                    <UserIcon className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Rahul Sundaram"
                      className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/60 text-sm font-medium text-slate-900 dark:text-white placeholder-slate-400 focus:border-emerald-500 transition"
                    />
                  </div>
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wide">Phone Number</label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 98840 12345"
                      className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/60 text-sm font-medium text-slate-900 dark:text-white placeholder-slate-400 focus:border-emerald-500 transition"
                    />
                  </div>
                </div>

                {/* Role Selector */}
                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wide">I want to</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setRole('CUSTOMER')}
                      className={`p-3.5 rounded-xl border-2 text-left transition-all ${
                        role === 'CUSTOMER'
                          ? 'border-emerald-500 bg-emerald-50/60 dark:bg-emerald-950/30'
                          : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
                      }`}
                    >
                      <Package className={`w-5 h-5 mb-1.5 ${role === 'CUSTOMER' ? 'text-emerald-600' : 'text-slate-400'}`} />
                      <p className={`text-sm font-bold ${role === 'CUSTOMER' ? 'text-emerald-700 dark:text-emerald-300' : 'text-slate-700 dark:text-slate-300'}`}>Rent Products</p>
                      <p className="text-xs text-slate-500 mt-0.5">Find & rent nearby</p>
                    </button>
                    <button
                      type="button"
                      onClick={() => setRole('OWNER')}
                      className={`p-3.5 rounded-xl border-2 text-left transition-all ${
                        role === 'OWNER'
                          ? 'border-emerald-500 bg-emerald-50/60 dark:bg-emerald-950/30'
                          : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
                      }`}
                    >
                      <Zap className={`w-5 h-5 mb-1.5 ${role === 'OWNER' ? 'text-emerald-600' : 'text-slate-400'}`} />
                      <p className={`text-sm font-bold ${role === 'OWNER' ? 'text-emerald-700 dark:text-emerald-300' : 'text-slate-700 dark:text-slate-300'}`}>List & Earn</p>
                      <p className="text-xs text-slate-500 mt-0.5">Monetize your stuff</p>
                    </button>
                  </div>
                </div>
              </>
            )}

            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wide">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/60 text-sm font-medium text-slate-900 dark:text-white placeholder-slate-400 focus:border-emerald-500 transition"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Password</label>
                {mode === 'login' && (
                  <button type="button" className="text-xs font-semibold text-emerald-600 hover:text-emerald-500 transition">
                    Forgot password?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-11 pr-12 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/60 text-sm font-medium text-slate-900 dark:text-white placeholder-slate-400 focus:border-emerald-500 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Password Strength Meter */}
              {mode === 'register' && password.length > 0 && (
                <div className="mt-2 space-y-1.5">
                  <div className="flex gap-1">
                    {[0, 1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className={`h-1 flex-1 rounded-full transition-all ${
                          i < pStr.score ? pStr.color : 'bg-slate-200 dark:bg-slate-700'
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-slate-500">{pStr.label}</p>
                </div>
              )}
            </div>

            {/* Terms */}
            {mode === 'register' && (
              <p className="text-xs text-slate-500 leading-relaxed">
                By creating an account, you agree to our{' '}
                <span className="text-emerald-600 font-semibold cursor-pointer hover:underline">Terms of Service</span>
                {' '}and{' '}
                <span className="text-emerald-600 font-semibold cursor-pointer hover:underline">Privacy Policy</span>.
              </p>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 transition-all duration-300 shadow-glow-emerald disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Processing...
                </span>
              ) : (
                <>
                  <span>{mode === 'login' ? 'Sign In to Dashboard' : 'Create Account'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
            <span className="text-xs font-semibold text-slate-400 uppercase">Or continue with</span>
            <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
          </div>

          {/* Social / Demo Logins */}
          <div className="space-y-3">
            {/* Google button placeholder */}
            <button
              type="button"
              className="w-full py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/60 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition flex items-center justify-center gap-3"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              Continue with Google
            </button>

            {/* Demo Logins */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-700/50">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-500" />
                Quick Demo Access
              </p>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => handleDemoLogin('customer@tempora.io', 'customer123', 'Renter')}
                  disabled={isSubmitting}
                  className="py-2.5 px-2 rounded-xl bg-white dark:bg-slate-700/60 border border-slate-200 dark:border-slate-600 text-xs font-bold text-slate-700 dark:text-slate-200 hover:border-emerald-400 hover:shadow-sm transition disabled:opacity-50"
                >
                  <span className="block text-lg mb-0.5">🛒</span>
                  Renter
                </button>
                <button
                  type="button"
                  onClick={() => handleDemoLogin('owner@tempora.io', 'owner123', 'Host')}
                  disabled={isSubmitting}
                  className="py-2.5 px-2 rounded-xl bg-white dark:bg-slate-700/60 border border-slate-200 dark:border-slate-600 text-xs font-bold text-slate-700 dark:text-slate-200 hover:border-emerald-400 hover:shadow-sm transition disabled:opacity-50"
                >
                  <span className="block text-lg mb-0.5">🏪</span>
                  Host
                </button>
                <button
                  type="button"
                  onClick={() => handleDemoLogin('admin@tempora.io', 'admin123', 'Admin')}
                  disabled={isSubmitting}
                  className="py-2.5 px-2 rounded-xl bg-white dark:bg-slate-700/60 border border-slate-200 dark:border-slate-600 text-xs font-bold text-violet-700 dark:text-violet-300 hover:border-violet-400 hover:shadow-sm transition disabled:opacity-50"
                >
                  <span className="block text-lg mb-0.5">🛡️</span>
                  Admin
                </button>
              </div>
            </div>
          </div>

          {/* Bottom info */}
          <p className="text-center text-xs text-slate-400 mt-6">
            {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
            <button
              onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
              className="font-bold text-emerald-600 hover:text-emerald-500 transition"
            >
              {mode === 'login' ? 'Sign up free' : 'Sign in'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};
