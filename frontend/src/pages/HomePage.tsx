import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Hero } from '../components/home/Hero';
import { CategoryGrid } from '../components/home/CategoryGrid';
import { ListingCard } from '../components/listing/ListingCard';
import { BookingModal } from '../components/booking/BookingModal';
import { Listing } from '../types';
import { api } from '../services/api';
import { Sparkles, Shield, Clock, Award, ArrowRight } from 'lucide-react';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [featuredListings, setFeaturedListings] = useState<Listing[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedListingForBooking, setSelectedListingForBooking] = useState<Listing | null>(null);

  useEffect(() => {
    api.getListings({ limit: 8 })
      .then((data) => setFeaturedListings(data))
      .catch((err) => console.error("Error loading listings:", err))
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <Hero />

      {/* Category Grid Section */}
      <CategoryGrid />

      {/* Signature AI Setup Banner */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative rounded-3xl p-8 sm:p-12 overflow-hidden bg-gradient-to-r from-violet-900 via-indigo-900 to-slate-900 text-white shadow-2xl">
            <div className="absolute top-0 right-0 w-96 h-96 bg-violet-500/20 rounded-full blur-3xl pointer-events-none" />
            
            <div className="relative z-10 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-violet-500/30 border border-violet-400/30 text-xs font-bold uppercase tracking-wider mb-4">
                <Sparkles className="w-3.5 h-3.5 text-violet-300" />
                <span>The Signature TEMPORA Feature</span>
              </div>

              <h2 className="font-display font-extrabold text-3xl sm:text-5xl tracking-tight leading-tight">
                "Tell Us What You Need."
              </h2>
              
              <p className="mt-4 text-base sm:text-lg text-slate-300 leading-relaxed">
                You don't need to know every single product item. Simply tell us your stay duration, budget, and city.
                Our AI instantly synthesizes a complete, turnkey temporary setup with white-glove doorstep assembly.
              </p>

              <div className="mt-8 flex flex-wrap gap-4">
                <button
                  onClick={() => navigate('/setup-builder')}
                  className="px-6 py-3.5 rounded-2xl font-extrabold text-sm text-slate-950 bg-white hover:bg-slate-100 transition shadow-glow-violet flex items-center gap-2"
                >
                  <span>Build My Setup Now</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  onClick={() => navigate('/furniture-mode')}
                  className="px-6 py-3.5 rounded-2xl font-bold text-sm text-white bg-white/10 hover:bg-white/20 border border-white/20 transition backdrop-blur-sm"
                >
                  Explore 1BHK / Studio Suites
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Verified Rentals */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                Verified Hyperlocal Gear
              </span>
              <h2 className="font-display font-black text-3xl sm:text-4xl text-slate-900 dark:text-white mt-1">
                Trending Rentals Nearby
              </h2>
            </div>
            <button
              onClick={() => navigate('/search')}
              className="mt-3 sm:mt-0 text-sm font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
            >
              View all 50+ listings →
            </button>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-80 rounded-3xl bg-slate-200 dark:bg-slate-800 animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredListings.map((item) => (
                <ListingCard
                  key={item.id}
                  listing={item}
                  onBookClick={(listing) => setSelectedListingForBooking(listing)}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Value Propositions: Why Buy Something You Only Need Temporarily? */}
      <section className="py-20 border-t border-slate-200 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-slate-900 dark:text-white">
              Why Buy Something You Only Need Temporarily?
            </h2>
            <p className="mt-3 text-slate-600 dark:text-slate-400 text-sm sm:text-base">
              Rethink ownership with zero commitments, effortless return pickup, and AI condition verification.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 rounded-3xl glass-panel border border-slate-200 dark:border-slate-800">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center text-emerald-600 mb-6">
                <Shield className="w-6 h-6" />
              </div>
              <h3 className="font-display font-bold text-xl text-slate-900 dark:text-white mb-2">
                100% Escrow Protection
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Security deposits are held in smart escrow. Our AI scans Before & After condition scans
                to ensure you are never penalized for pre-existing micro-scratches.
              </p>
            </div>

            <div className="p-8 rounded-3xl glass-panel border border-slate-200 dark:border-slate-800">
              <div className="w-12 h-12 rounded-2xl bg-violet-100 dark:bg-violet-950 flex items-center justify-center text-violet-600 mb-6">
                <Clock className="w-6 h-6" />
              </div>
              <h3 className="font-display font-bold text-xl text-slate-900 dark:text-white mb-2">
                Doorstep Delivery & Assembly
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Hyperlocal couriers dispatch within 45 minutes. For heavy furniture and appliances,
                certified teams handle white-glove room assembly and placement.
              </p>
            </div>

            <div className="p-8 rounded-3xl glass-panel border border-slate-200 dark:border-slate-800">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-950 flex items-center justify-center text-amber-600 mb-6">
                <Award className="w-6 h-6" />
              </div>
              <h3 className="font-display font-bold text-xl text-slate-900 dark:text-white mb-2">
                TEMPORA Trust Score
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Every renter and owner maintains a verified algorithmic Trust Score based on ID verification,
                on-time returns, and peer reviews. Rent with total peace of mind.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Booking Modal */}
      {selectedListingForBooking && (
        <BookingModal
          listing={selectedListingForBooking}
          isOpen={!!selectedListingForBooking}
          onClose={() => setSelectedListingForBooking(null)}
        />
      )}
    </div>
  );
};
