import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Sparkles, ArrowRight, ShieldCheck, MapPin, Truck, Check, RefreshCw, Star, Trash2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { api } from '../services/api';
import { AISetupBundleResponse, AISetupBundleItem } from '../types';
import { useToast } from '../context/ToastContext';

export const AISetupBuilderPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast, success } = useToast();

  const initialQuery = searchParams.get('q') || "I am moving to Chennai for 8 months and need a bed, study table and office chair under ₹4000/month within 5 km";
  const [prompt, setPrompt] = useState<string>(initialQuery);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [bundle, setBundle] = useState<AISetupBundleResponse | null>(null);
  const [isBooked, setIsBooked] = useState<boolean>(false);

  const samplePresets = [
    "I am moving to Chennai for 8 months and need a bed, study table and office chair under ₹4000/month within 5 km",
    "Furnish my 1BHK apartment with bed, sofa and refrigerator for 6 months under ₹6,000",
    "Weekend commercial shoot in Chennai: Sony FX3, 24-70mm lens and gimbal stabilizer under ₹3,500/day",
    "Setting up temporary workstation for 3 months: Herman Miller Aeron, 5K display and solid teak desk"
  ];

  const handleGenerateBundle = async (queryText: string) => {
    setIsLoading(true);
    setIsBooked(false);
    try {
      const res = await api.getAIRecommendationBundle(queryText);
      setBundle(res);
    } catch (err: any) {
      toast("AI synthesis failed, check network", "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    handleGenerateBundle(initialQuery);
  }, []);

  const handleBuildSetup = () => {
    setIsBooked(true);
    success("AI Bundle scheduled for white-glove doorstep delivery & assembly!");
    confetti({
      particleCount: 120,
      spread: 80,
      origin: { y: 0.5 }
    });
  };

  const removeItem = (id: string) => {
    if (!bundle) return;
    const updatedItems = bundle.items.filter((it) => it.listing.id !== id);
    const newTotal = updatedItems.reduce((acc, it) => acc + it.monthly_price, 0);
    setBundle({
      ...bundle,
      items: updatedItems,
      total_monthly_cost: newTotal
    });
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      
      {/* Header Banner */}
      <div className="text-center max-w-3xl mx-auto mb-10">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-violet-100 dark:bg-violet-950/60 border border-violet-300 dark:border-violet-700/60 text-xs font-extrabold uppercase tracking-wider text-violet-700 dark:text-violet-300 mb-3 shadow-glow-violet">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Signature AI Experience</span>
        </div>
        <h1 className="font-display font-black text-4xl sm:text-5xl text-slate-900 dark:text-white tracking-tight">
          "Tell Us What You Need."
        </h1>
        <p className="mt-3 text-slate-600 dark:text-slate-400 text-sm sm:text-base leading-relaxed">
          Describe your scenario in plain English. TEMPORA extracts your budget, dates, and essential categories,
          assembling the optimal hyperlocal setup with zero wasted purchases.
        </p>
      </div>

      {/* Natural Language Search Prompt Input */}
      <div className="glass-panel p-4 sm:p-6 rounded-3xl border border-violet-500/30 shadow-glow-violet mb-8">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleGenerateBundle(prompt);
          }}
          className="flex flex-col sm:flex-row gap-3"
        >
          <div className="flex-1 relative">
            <textarea
              rows={2}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g. I am moving to Chennai for 8 months and need a bed, study table and office chair under ₹3000/month within 5 km"
              className="w-full p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm sm:text-base font-medium resize-none focus:ring-2 focus:ring-violet-500 focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="px-8 py-4 rounded-2xl font-black text-base text-white bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 shadow-glow-violet transition self-stretch sm:self-auto flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin" />
                <span>Synthesizing...</span>
              </>
            ) : (
              <>
                <span>Synthesize Setup</span>
                <Sparkles className="w-5 h-5" />
              </>
            )}
          </button>
        </form>

        {/* Preset Prompt Buttons */}
        <div className="mt-4 flex flex-wrap gap-2 items-center">
          <span className="text-xs font-bold text-slate-500">Presets:</span>
          {samplePresets.map((pr, idx) => (
            <button
              key={idx}
              onClick={() => {
                setPrompt(pr);
                handleGenerateBundle(pr);
              }}
              className="text-xs font-medium px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-violet-50 dark:hover:bg-violet-950 text-slate-600 dark:text-slate-300 transition"
            >
              {pr.substring(0, 48)}...
            </button>
          ))}
        </div>
      </div>

      {/* AI Results Synthesis Container */}
      {isLoading ? (
        <div className="p-12 text-center glass-panel rounded-3xl space-y-4">
          <RefreshCw className="w-10 h-10 text-violet-500 animate-spin mx-auto" />
          <p className="font-display font-bold text-lg text-slate-800 dark:text-slate-200">
            Scanning 50+ local listings across Chennai...
          </p>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Matching categories, calculating haversine radius, and minimizing total monthly rental overhead.
          </p>
        </div>
      ) : bundle ? (
        <div className="space-y-8 animate-fade-in">
          
          {/* Bundle Header Summary Bar */}
          <div className="p-6 rounded-3xl bg-slate-900 text-white shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-6 border border-slate-800">
            <div>
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold">
                  {bundle.match_score}% OPTIMAL MATCH
                </span>
                <span className="text-xs text-slate-400">
                  {bundle.extracted_needs.city} • Within {bundle.extracted_needs.radius_km} km
                </span>
              </div>
              <h2 className="font-display font-extrabold text-2xl sm:text-3xl mt-2 tracking-tight">
                {bundle.title}
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
                {bundle.summary}
              </p>
            </div>

            {/* Total Cost & CTA */}
            <div className="bg-slate-800/80 p-5 rounded-2xl border border-slate-700/80 flex flex-col items-end shrink-0">
              <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
                Total Monthly Investment
              </span>
              <div className="text-3xl font-display font-black text-emerald-400 mt-0.5">
                ₹{bundle.total_monthly_cost.toLocaleString()}
                <span className="text-xs font-medium text-slate-400"> / month</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Security Deposit: ₹{bundle.total_deposit.toLocaleString()} (Refundable)
              </p>

              {isBooked ? (
                <div className="mt-4 px-6 py-2.5 rounded-xl bg-emerald-500 text-white font-extrabold text-xs flex items-center gap-2">
                  <Check className="w-4 h-4" />
                  <span>Setup Booked & Dispatched!</span>
                </div>
              ) : (
                <button
                  onClick={handleBuildSetup}
                  className="mt-4 px-6 py-3 rounded-xl font-extrabold text-xs text-white bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 shadow-glow-emerald transition active:scale-95 flex items-center gap-2"
                >
                  <span>BUILD MY SETUP</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Curated Items List */}
          <div className="space-y-4">
            <h3 className="font-display font-bold text-lg text-slate-900 dark:text-white">
              Curated Items in Your Bundle ({bundle.items.length})
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {bundle.items.map((it, idx) => (
                <div
                  key={it.listing.id || idx}
                  className="glass-panel p-4 rounded-3xl border border-slate-200 dark:border-slate-800 flex gap-4 items-center justify-between"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <img
                      src={it.listing.images[0]?.image_url || "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=300"}
                      alt={it.listing.title}
                      className="w-20 h-20 rounded-2xl object-cover shrink-0"
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 text-[11px] font-bold">
                        <span className="text-violet-600 dark:text-violet-400 uppercase tracking-wide">
                          {it.listing.category}
                        </span>
                        <span className="text-slate-300">•</span>
                        <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                          {it.match_percentage}% Match
                        </span>
                      </div>

                      <h4 className="font-display font-bold text-sm text-slate-900 dark:text-white truncate mt-0.5">
                        {it.listing.title}
                      </h4>

                      <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          {it.distance_km} km away
                        </span>
                        <span className="flex items-center gap-1 font-semibold text-slate-700 dark:text-slate-300">
                          <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                          {it.listing.rating.toFixed(1)}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1 line-clamp-1 italic">
                        "{it.reason}"
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col items-end shrink-0 pl-3">
                    <span className="font-display font-extrabold text-base text-slate-900 dark:text-white">
                      ₹{it.monthly_price.toLocaleString()}
                    </span>
                    <span className="text-[10px] text-slate-400">/ month</span>

                    <button
                      onClick={() => removeItem(it.listing.id)}
                      className="mt-3 p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition"
                      title="Remove from bundle"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Value comparison table */}
          <div className="p-6 rounded-3xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200/60 dark:border-emerald-800/60 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <p className="font-display font-extrabold text-base text-emerald-950 dark:text-emerald-200">
                You save ~₹38,500 compared to buying brand-new items
              </p>
              <p className="text-xs text-emerald-800/80 dark:text-emerald-300/80 mt-0.5">
                Zero moving hassles at end-of-lease. Free pickup and zero resale depreciation.
              </p>
            </div>
            <button
              onClick={handleBuildSetup}
              className="px-6 py-3 rounded-2xl font-extrabold text-xs text-white bg-emerald-600 hover:bg-emerald-500 shadow-glow-emerald transition shrink-0"
            >
              Order Turnkey Delivery
            </button>
          </div>

        </div>
      ) : null}

    </div>
  );
};
