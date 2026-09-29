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

  const buildDemoPackage = () => {
    const styleMap: Record<string, { package_name: string; summary: string; total: number; items: any[]; services: string[] }> = {
      Modern: {
        package_name: 'Modern Move-In Suite',
        summary: 'Clean geometry, warm neutrals and compact luxury tailored for a polished day-to-day life.',
        total: 17600,
        items: [
          { category: 'Living', title: 'L-shaped Sofa', price_per_month: 4200, image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=900&q=80' },
          { category: 'Bedroom', title: 'Queen Bed Frame', price_per_month: 3500, image: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=900&q=80' },
          { category: 'Dining', title: 'Compact Dining Set', price_per_month: 2800, image: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=900&q=80' },
          { category: 'Workspace', title: 'Foldable Desk & Chair', price_per_month: 2100, image: 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=900&q=80' }
        ],
        services: ['White-glove delivery', 'Assembly & setup', 'Deep clean before handoff', 'Flexible swap-outs']
      },
      Minimal: {
        package_name: 'Light Minimal Home',
        summary: 'Quiet textures and toned-down pieces create a calming, uncluttered living environment.',
        total: 15200,
        items: [
          { category: 'Living', title: 'Low Profile Lounge Chair', price_per_month: 3100, image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=900&q=80' },
          { category: 'Bedroom', title: 'Minimal Platform Bed', price_per_month: 3300, image: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=900&q=80' },
          { category: 'Storage', title: 'Sliding Wardrobe', price_per_month: 4200, image: 'https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=900&q=80' },
          { category: 'Workspace', title: 'Ergonomic Desk', price_per_month: 2200, image: 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=900&q=80' }
        ],
        services: ['Setup & styling', 'Damage coverage', 'Monthly refresh', 'Pickup coordination']
      },
      Luxury: {
        package_name: 'Boutique Luxury Suite',
        summary: 'Layered premium materials and rich tones for a high-end temporary home experience.',
        total: 22400,
        items: [
          { category: 'Living', title: 'Luxury Sectional Sofa', price_per_month: 6200, image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=900&q=80' },
          { category: 'Bedroom', title: 'Tufted Storage Bed', price_per_month: 5000, image: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=900&q=80' },
          { category: 'Dining', title: 'Marble Dining Table', price_per_month: 4200, image: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=900&q=80' },
          { category: 'Decor', title: 'Accent Lighting Bundle', price_per_month: 2800, image: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=900&q=80' }
        ],
        services: ['Interior styling consult', 'Premium delivery', 'Tension-free assembly', 'Premium care support']
      },
      Scandinavian: {
        package_name: 'Nordic Calm Home',
        summary: 'Bright finishes, function-first storage, and cozy textures for airy, comfortable spaces.',
        total: 16800,
        items: [
          { category: 'Living', title: 'Soft Linen Sofa', price_per_month: 3900, image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=900&q=80' },
          { category: 'Bedroom', title: 'Natural Oak Bed', price_per_month: 3400, image: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=900&q=80' },
          { category: 'Storage', title: 'Oak Console Unit', price_per_month: 2800, image: 'https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=900&q=80' },
          { category: 'Lighting', title: 'Warm Ambient Set', price_per_month: 1900, image: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=900&q=80' }
        ],
        services: ['Compact room optimization', 'Delivery with placement', 'Style-ready decluttering', 'Flexible renewal']
      },
      Industrial: {
        package_name: 'Industrial Loft Kit',
        summary: 'Textured palettes and utility pieces create a durable, urban, and expressive feel.',
        total: 18400,
        items: [
          { category: 'Living', title: 'Metal Frame Sofa', price_per_month: 4700, image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=900&q=80' },
          { category: 'Bedroom', title: 'Industrial Bed Set', price_per_month: 3600, image: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=900&q=80' },
          { category: 'Dining', title: 'Rustic Table Set', price_per_month: 3300, image: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=900&q=80' },
          { category: 'Decor', title: 'Metal Accent Bundle', price_per_month: 2100, image: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=900&q=80' }
        ],
        services: ['Setup with industrial-grade fixtures', 'Damage protection', 'Responsive swap support', 'Fast pickup scheduling']
      }
    };

    const preset = styleMap[style] || styleMap.Modern;
    const monthlyTotal = Math.max(9000, Math.round((preset.total + duration * 800) / 100) * 100);

    return {
      style,
      package_name: preset.package_name,
      total_monthly_rate: monthlyTotal,
      items: preset.items,
      included_services: preset.services,
      summary: preset.summary
    };
  };

  const generatePackage = async () => {
    setIsOrdered(false);
    try {
      const data = await api.getFurnitureHome(homeType, duration, style);
      setPackageData(data);
    } catch {
      setPackageData(buildDemoPackage());
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

          <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-800 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200">
            Local demo data is active because the backend is not connected on this host. The original Vercel version stays cleaner when the API is live.
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
