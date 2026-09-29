import React, { useState, useEffect } from 'react';
import { Home, Sparkles, Check, ArrowRight, ShieldCheck, Truck } from 'lucide-react';
import confetti from 'canvas-confetti';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';

export const FurnitureModePage: React.FC = () => {
  const { success } = useToast();
  const [homeType, setHomeType] = useState<string>("1BHK");
  const [duration, setDuration] = useState<number>(6);
  const [style, setStyle] = useState<string>("Modern");
  const [packageData, setPackageData] = useState<any>(null);
  const [isOrdered, setIsOrdered] = useState<boolean>(false);

  const homeTypes = ["Studio", "1BHK", "2BHK", "PG / Shared", "Private Office"];
  const styles = ["Modern", "Minimal", "Luxury", "Scandinavian", "Industrial"];

  const generatePackage = async () => {
    setIsOrdered(false);
    try {
      const data = await api.getFurnitureHome(homeType, duration, style);
      setPackageData(data);
    } catch {
      // Fallback
    }
  };

  useEffect(() => {
    generatePackage();
  }, [homeType, duration, style]);

  const handleOrder = () => {
    setIsOrdered(true);
    success("Turnkey Temporary Home Suite scheduled with white-glove assembly!");
    confetti({ particleCount: 110, spread: 80, origin: { y: 0.5 } });
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      
      {/* Title */}
      <div className="text-center max-w-2xl mx-auto mb-10">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-xs font-bold uppercase tracking-wider mb-2">
          <Home className="w-3.5 h-3.5" />
          <span>Turnkey Living Suite</span>
        </div>
        <h1 className="font-display font-black text-4xl sm:text-5xl text-slate-900 dark:text-white tracking-tight">
          MY TEMPORARY HOME
        </h1>
        <p className="mt-2 text-slate-600 dark:text-slate-400 text-sm">
          Moving for a new job, college semester, or temporary contract?
          Furnish your entire apartment in 1 click without buying disposable furniture.
        </p>
      </div>

      {/* Selectors */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm mb-10 space-y-6">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
            Home Layout Type
          </label>
          <div className="flex flex-wrap gap-2">
            {homeTypes.map((ht) => (
              <button
                key={ht}
                onClick={() => setHomeType(ht)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                  homeType === ht
                    ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                }`}
              >
                {ht}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Design Aesthetic
            </label>
            <div className="flex flex-wrap gap-2">
              {styles.map((st) => (
                <button
                  key={st}
                  onClick={() => setStyle(st)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition ${
                    style === st
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Lease Duration: {duration} Months
            </label>
            <input
              type="range"
              min="1"
              max="24"
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              className="w-full accent-emerald-500"
            />
          </div>
        </div>
      </div>

      {/* Generated Package */}
      {packageData && (
        <div className="space-y-6 animate-fade-in">
          <div className="p-6 rounded-3xl bg-slate-900 text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border border-slate-800">
            <div>
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                {packageData.style} Style Suite
              </span>
              <h2 className="font-display font-extrabold text-2xl sm:text-3xl mt-1">
                {packageData.package_name}
              </h2>
              <p className="text-xs text-slate-300 mt-1 max-w-lg">
                Includes complete bedroom, living area, and study workspace. Delivered, unpacked, and assembled.
              </p>
            </div>

            <div className="flex items-center gap-4 self-end md:self-auto">
              <div className="text-right">
                <span className="text-xs text-slate-400">Total Monthly Cost</span>
                <p className="font-display font-black text-3xl text-emerald-400">
                  ₹{packageData.total_monthly_rate.toLocaleString()} / mo
                </p>
              </div>

              {isOrdered ? (
                <div className="px-6 py-3.5 rounded-2xl bg-emerald-500 text-white font-extrabold text-xs flex items-center gap-1.5">
                  <Check className="w-4 h-4" />
                  <span>Home Suite Reserved</span>
                </div>
              ) : (
                <button
                  onClick={handleOrder}
                  className="px-6 py-3.5 rounded-2xl font-extrabold text-xs text-white bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 shadow-glow-emerald transition active:scale-95 flex items-center gap-2"
                >
                  <span>Order White-Glove Setup</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Package items */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {packageData.items.map((item: any, i: number) => (
              <div key={i} className="glass-panel p-4 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-3">
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-44 object-cover rounded-2xl"
                />
                <div>
                  <span className="text-[10px] font-bold text-emerald-600 uppercase">
                    {item.category}
                  </span>
                  <h4 className="font-display font-bold text-sm text-slate-900 dark:text-white truncate">
                    {item.title}
                  </h4>
                  <p className="text-xs font-extrabold text-slate-700 dark:text-slate-300 mt-1">
                    ₹{item.price_per_month.toLocaleString()} / mo
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Included Services */}
          <div className="p-6 rounded-3xl glass-panel border border-slate-200 dark:border-slate-800 space-y-3">
            <h4 className="font-display font-bold text-sm text-slate-900 dark:text-white">
              Included White-Glove Services with Every Temporary Home Suite:
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600 dark:text-slate-400">
              {packageData.included_services?.map((svc: string, i: number) => (
                <div key={i} className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>{svc}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
