import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';

interface CategoryItem {
  name: string;
  count: string;
  image: string;
  tagline: string;
}

export const CategoryGrid: React.FC = () => {
  const navigate = useNavigate();

  const categories: CategoryItem[] = [
    {
      name: "Furniture",
      count: "180+ Items",
      image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800",
      tagline: "Ergonomics, Living Suites & Beds"
    },
    {
      name: "Clothing",
      count: "95+ Outfits",
      image: "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=800",
      tagline: "Tailored Suits, Lehengas & Tuxedos"
    },
    {
      name: "Cameras & Creator Equipment",
      count: "60+ Rigs",
      image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800",
      tagline: "Sony FX3, Primes, Gimbals & Sound"
    },
    {
      name: "Electronics",
      count: "120+ Devices",
      image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800",
      tagline: "MacBooks, 5K Displays & PS5"
    },
    {
      name: "Appliances",
      count: "75+ Units",
      image: "https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?w=800",
      tagline: "Double Door Fridges, Washers & ACs"
    },
    {
      name: "Sports Equipment",
      count: "45+ Kits",
      image: "https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=800",
      tagline: "Mountain Bikes, Trekking & Golf"
    },
    {
      name: "Event Equipment",
      count: "35+ Systems",
      image: "https://images.unsplash.com/photo-1545454675-3531b543be5d?w=800",
      tagline: "PartyBox Sound, Fog & Stage Lights"
    },
    {
      name: "Study/Office Equipment",
      count: "50+ Setups",
      image: "https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=800",
      tagline: "Standing Desks, Whiteboards & Chairs"
    }
  ];

  return (
    <section className="py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10">
          <div>
            <h2 className="font-display font-black text-3xl sm:text-4xl text-slate-900 dark:text-white">
              Curated Hyperlocal Categories
            </h2>
            <p className="mt-2 text-slate-600 dark:text-slate-400 text-sm sm:text-base">
              Why purchase when you can temporarily access verified top-tier items nearby?
            </p>
          </div>
          <button
            onClick={() => navigate('/search')}
            className="mt-4 md:mt-0 text-sm font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1.5 self-start md:self-auto"
          >
            <span>Explore All Categories</span>
            <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((c, i) => (
            <div
              key={i}
              onClick={() => navigate(`/search?category=${encodeURIComponent(c.name)}`)}
              className="group relative h-80 rounded-3xl overflow-hidden cursor-pointer shadow-elevated transition-transform duration-300 hover:-translate-y-1.5"
            >
              <img
                src={c.image}
                alt={c.name}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent" />

              <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-md rounded-full px-3 py-1 text-[11px] font-bold text-white border border-white/20">
                {c.count}
              </div>

              <div className="absolute bottom-6 left-6 right-6 text-white">
                <p className="text-xs font-semibold text-emerald-300 uppercase tracking-wider mb-1">
                  {c.tagline}
                </p>
                <h3 className="font-display font-extrabold text-2xl tracking-tight leading-snug">
                  {c.name}
                </h3>
                <div className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-white/90 group-hover:text-emerald-300 transition-colors">
                  <span>Browse Category</span>
                  <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
