import React, { useState, useEffect } from 'react';
import { Sparkles, Shirt, Calendar, Check, ArrowRight, ShieldCheck } from 'lucide-react';
import confetti from 'canvas-confetti';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';

export const ClothingModePage: React.FC = () => {
  const { success } = useToast();
  const [occasion, setOccasion] = useState<string>("Job Interview");
  const [gender, setGender] = useState<string>("Unisex");
  const [budget, setBudget] = useState<number>(1500);
  const [size, setSize] = useState<string>("M");
  const [lookData, setLookData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isOrdered, setIsOrdered] = useState<boolean>(false);

  const occasions = [
    "Job Interview",
    "Wedding & Reception",
    "Gala & Black Tie",
    "Cocktail Party",
    "Weekend Photoshoot"
  ];

  const sizes = ["XS", "S", "M", "L", "XL", "XXL"];

  const buildDemoLook = () => {
    const occasionMap: Record<string, { title: string; note: string; total: number; items: any[] }> = {
      "Job Interview": {
        title: "Executive Confidence Edit",
        note: "Sharp tailoring, premium fabric texture, and understated polish for a high-impact first impression.",
        total: 1480,
        items: [
          { category: 'Suit', title: 'Charcoal Slim Fit Blazer', price_per_day: 620, image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=900&q=80' },
          { category: 'Shirt', title: 'Cotton White Structured Shirt', price_per_day: 260, image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=900&q=80' },
          { category: 'Accessories', title: 'Leather Oxford Shoes', price_per_day: 600, image: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=900&q=80' }
        ]
      },
      "Wedding & Reception": {
        title: "Royal Celebration Look",
        note: "Elegant layering, rich jewel tones, and statement detailing designed for a festive evening.",
        total: 2120,
        items: [
          { category: 'Ensemble', title: 'Ivory Bandhgala Jacket', price_per_day: 820, image: 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=900&q=80' },
          { category: 'Bottom', title: 'Tailored Satin Trouser', price_per_day: 510, image: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=900&q=80' },
          { category: 'Accessories', title: 'Gold Statement Set', price_per_day: 790, image: 'https://images.unsplash.com/photo-1617038220319-276d3cfab638?auto=format&fit=crop&w=900&q=80' }
        ]
      },
      "Gala & Black Tie": {
        title: "Black Tie Signature",
        note: "A polished silhouette with luxe textures and a dramatic finish for evening occasions.",
        total: 2400,
        items: [
          { category: 'Suit', title: 'Midnight Tuxedo Set', price_per_day: 930, image: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=900&q=80' },
          { category: 'Dress Shirt', title: 'Crisp Pleated Dress Shirt', price_per_day: 320, image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=900&q=80' },
          { category: 'Accessories', title: 'Patent Leather Formal Shoes', price_per_day: 1150, image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=80' }
        ]
      },
      "Cocktail Party": {
        title: "After Dark Edit",
        note: "Modern styling with texture contrast and a little extra shine for social evenings.",
        total: 1680,
        items: [
          { category: 'Co-ord', title: 'Deep Velvet Co-ord Set', price_per_day: 700, image: 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=900&q=80' },
          { category: 'Footwear', title: 'Statement Heels', price_per_day: 420, image: 'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?auto=format&fit=crop&w=900&q=80' },
          { category: 'Accessories', title: 'Metallic Evening Clutch', price_per_day: 560, image: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=900&q=80' }
        ]
      },
      "Weekend Photoshoot": {
        title: "Content Creator Capsule",
        note: "Lightweight, camera-ready layering that looks premium in every frame and still feels effortless.",
        total: 1360,
        items: [
          { category: 'Dress', title: 'Structured Satin Midi Dress', price_per_day: 620, image: 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=900&q=80' },
          { category: 'Layer', title: 'Neutral Overshirt', price_per_day: 290, image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=900&q=80' },
          { category: 'Accessories', title: 'Minimalist Heels', price_per_day: 450, image: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=900&q=900&q=80' }
        ]
      }
    };

    const preset = occasionMap[occasion] || occasionMap['Job Interview'];
    const adjustedTotal = Math.max(900, Math.min(4000, Math.round(preset.total + (budget - 1500) / 12)));

    return {
      look_title: preset.title,
      ai_stylist_notes: preset.note,
      total_day_rate: adjustedTotal,
      items: preset.items.map((item, idx) => ({
        ...item,
        category: item.category,
        title: item.title,
        price_per_day: idx === 0 ? Math.round(item.price_per_day * (1 + (budget - 1200) / 8000)) : item.price_per_day
      }))
    };
  };

  const generateLook = async () => {
    setIsLoading(true);
    setIsOrdered(false);
    try {
      const data = await api.getClothingLook(occasion, gender, budget);
      setLookData(data);
    } catch {
      setLookData(buildDemoLook());
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    generateLook();
  }, [occasion, gender]);

  const handleOrderLook = () => {
    setIsOrdered(true);
    success("Ensemble booked! Dry-cleaned, steamed and packed in garment bag.");
    confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      
      {/* Title */}
      <div className="text-center max-w-2xl mx-auto mb-10">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-pink-100 dark:bg-pink-950/60 text-pink-700 dark:text-pink-300 text-xs font-bold uppercase tracking-wider mb-2">
          <Shirt className="w-3.5 h-3.5" />
          <span>Occasion Rental Mode</span>
        </div>
        <h1 className="font-display font-black text-4xl sm:text-5xl text-slate-900 dark:text-white tracking-tight">
          BUILD MY LOOK
        </h1>
        <p className="mt-2 text-slate-600 dark:text-slate-400 text-sm">
          Why buy a designer suit or couture lehenga you'll only wear once?
          Let TEMPORA AI coordinate your high-impact outfit with certified dry-cleaning.
        </p>
      </div>

      {/* Control Filters */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm mb-10 space-y-6">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
            Select Occasion
          </label>
          <div className="flex flex-wrap gap-2">
            {occasions.map((occ) => (
              <button
                key={occ}
                onClick={() => setOccasion(occ)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                  occasion === occ
                    ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                }`}
              >
                {occ}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Size
            </label>
            <div className="flex gap-2">
              {sizes.map((sz) => (
                <button
                  key={sz}
                  onClick={() => setSize(sz)}
                  className={`w-10 h-10 rounded-xl text-xs font-bold flex items-center justify-center transition ${
                    size === sz
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  {sz}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Max Daily Budget: ₹{budget}
            </label>
            <input
              type="range"
              min="400"
              max="4000"
              step="100"
              value={budget}
              onChange={(e) => setBudget(Number(e.target.value))}
              className="w-full accent-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Gender Focus
            </label>
            <div className="flex gap-2">
              {['Men', 'Women', 'Unisex'].map((g) => (
                <button
                  key={g}
                  onClick={() => setGender(g)}
                  className={`px-3 py-2 rounded-xl text-xs font-bold transition ${
                    gender === g
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Recommended Look Result */}
      {lookData && (
        <div className="space-y-6 animate-fade-in">
          <div className="p-6 rounded-3xl bg-slate-900 text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border border-slate-800">
            <div>
              <span className="text-xs font-bold text-pink-400 uppercase tracking-wider">
                AI Curated Ensemble
              </span>
              <h2 className="font-display font-extrabold text-2xl sm:text-3xl mt-1">
                {lookData.look_title}
              </h2>
              <p className="text-xs text-slate-300 mt-1 max-w-lg">
                {lookData.ai_stylist_notes}
              </p>
            </div>

            <div className="flex items-center gap-4 self-end md:self-auto">
              <div className="text-right">
                <span className="text-xs text-slate-400">Total Day Rate</span>
                <p className="font-display font-black text-2xl text-emerald-400">
                  ₹{lookData.total_day_rate} / day
                </p>
              </div>

              {isOrdered ? (
                <div className="px-6 py-3 rounded-2xl bg-emerald-500 text-white font-extrabold text-xs flex items-center gap-1.5">
                  <Check className="w-4 h-4" />
                  <span>Ensemble Reserved</span>
                </div>
              ) : (
                <button
                  onClick={handleOrderLook}
                  className="px-6 py-3 rounded-2xl font-extrabold text-xs text-white bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 shadow-glow-emerald transition active:scale-95"
                >
                  Rent Entire Look
                </button>
              )}
            </div>
          </div>

          {/* Outfit Items Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {lookData.items.map((item: any, i: number) => (
              <div key={i} className="glass-panel rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 p-4 space-y-3">
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-56 object-cover rounded-2xl"
                />
                <div>
                  <span className="text-[10px] font-bold uppercase text-emerald-600">
                    {item.category} • Size {size}
                  </span>
                  <h4 className="font-display font-bold text-base text-slate-900 dark:text-white truncate">
                    {item.title}
                  </h4>
                  <p className="text-xs font-extrabold text-slate-700 dark:text-slate-300 mt-1">
                    ₹{item.price_per_day} / day
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-800/60 text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>All items are dry-cleaned, UV-sanitized, and sealed in eco-friendly garment bags before dispatch.</span>
          </div>

          {!isLoading && (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-800 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200">
              Local demo data is active because the backend is not connected on this host. The original Vercel experience is still available when the API is online.
            </div>
          )}
        </div>
      )}

    </div>
  );
};
