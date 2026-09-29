import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, ArrowRight, Search, Shield, Zap, RefreshCw, CheckCircle2 } from 'lucide-react';

export const Hero: React.FC = () => {
  const navigate = useNavigate();
  const [aiQuery, setAiQuery] = useState<string>('');

  const suggestions = [
    "Furnish my 1BHK for 6 months",
    "Find an outfit for an interview tomorrow",
    "I need a camera for a weekend",
    "Set up my temporary workspace"
  ];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiQuery.trim()) return;
    navigate(`/setup-builder?q=${encodeURIComponent(aiQuery)}`);
  };

  const selectSuggestion = (text: string) => {
    setAiQuery(text);
    navigate(`/setup-builder?q=${encodeURIComponent(text)}`);
  };

  return (
    <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-28">
      {/* Background ambient lighting effects */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-radial-gradient-hero pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Brand Philosophy Pill */}
        <div className="flex justify-center mb-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-panel border border-emerald-500/20 shadow-glow-emerald animate-fade-in">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
            <span className="text-xs font-bold tracking-wide uppercase text-slate-800 dark:text-emerald-300">
              The Hyperlocal Temporary-Ownership Movement
            </span>
          </div>
        </div>

        {/* Hero Headings */}
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="font-display font-extrabold text-5xl sm:text-7xl lg:text-8xl tracking-tight leading-[1.05] text-slate-900 dark:text-white">
            Own Less. <br />
            <span className="text-gradient-emerald">Live More.</span>
          </h1>

          <p className="mt-6 text-lg sm:text-2xl font-normal text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Rent what you need. Earn from what you don't.
          </p>
          <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 mt-2">
            Why buy something you only need temporarily?
          </p>
        </div>

        {/* Main AI Natural-Language Search Box */}
        <div className="mt-10 sm:mt-12 max-w-3xl mx-auto">
          <form
            onSubmit={handleSearchSubmit}
            className="p-2 sm:p-3 rounded-2xl sm:rounded-3xl glass-panel shadow-glow-violet border border-violet-500/30 transition-all duration-300 focus-within:ring-2 focus-within:ring-violet-500/50"
          >
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <div className="flex items-center gap-3 px-3 sm:px-4 py-2 flex-1">
                <Sparkles className="w-6 h-6 text-violet-500 shrink-0 animate-pulse" />
                <input
                  type="text"
                  value={aiQuery}
                  onChange={(e) => setAiQuery(e.target.value)}
                  placeholder="What do you need temporarily? (e.g. Furnish my 1BHK under ₹4,000)"
                  className="w-full bg-transparent border-none text-slate-900 dark:text-white placeholder:text-slate-400 text-base sm:text-lg focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="px-6 py-4 rounded-xl sm:rounded-2xl font-bold text-sm sm:text-base text-white bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 shadow-glow-violet transition-all duration-200 flex items-center justify-center gap-2 shrink-0 group"
              >
                <span>Build My Setup</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </form>

          {/* Quick Suggestions Chips */}
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 mr-1">
              Try asking:
            </span>
            {suggestions.map((s, idx) => (
              <button
                key={idx}
                onClick={() => selectSuggestion(s)}
                className="text-xs font-medium px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 hover:bg-violet-50 dark:hover:bg-violet-950/50 hover:text-violet-600 dark:hover:text-violet-400 border border-slate-200 dark:border-slate-700 transition"
              >
                "{s}"
              </button>
            ))}
          </div>
        </div>

        {/* Primary CTAs */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <button
            onClick={() => navigate('/search')}
            className="px-8 py-4 rounded-2xl font-extrabold text-base text-white bg-emerald-600 hover:bg-emerald-500 shadow-glow-emerald transition-all duration-200 flex items-center gap-3"
          >
            <Search className="w-5 h-5" />
            <span>Find Something</span>
          </button>

          <button
            onClick={() => navigate('/add-listing')}
            className="px-8 py-4 rounded-2xl font-extrabold text-base text-slate-800 dark:text-white glass-panel border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-all duration-200 flex items-center gap-3"
          >
            <span>List Something & Earn</span>
          </button>
        </div>

        {/* Real-time marketplace trust metrics banner */}
        <div className="mt-16 pt-12 border-t border-slate-200/60 dark:border-slate-800/60 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div className="p-4 rounded-2xl glass-panel">
            <p className="font-display font-black text-3xl sm:text-4xl text-emerald-600 dark:text-emerald-400">100%</p>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1">Deposit Guarantee</p>
          </div>
          <div className="p-4 rounded-2xl glass-panel">
            <p className="font-display font-black text-3xl sm:text-4xl text-slate-900 dark:text-white">₹45,000+</p>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1">Avg. Yearly Renter Savings</p>
          </div>
          <div className="p-4 rounded-2xl glass-panel">
            <p className="font-display font-black text-3xl sm:text-4xl text-violet-600 dark:text-violet-400">&lt; 45 Mins</p>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1">Hyperlocal Doorstep Delivery</p>
          </div>
          <div className="p-4 rounded-2xl glass-panel">
            <p className="font-display font-black text-3xl sm:text-4xl text-amber-500">94 / 100</p>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1">Avg. Community Trust Score</p>
          </div>
        </div>

      </div>
    </section>
  );
};
