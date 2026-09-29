import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Clock, ShieldCheck, Sparkles, Heart, Package,
  ArrowRight, CheckCircle2, AlertCircle, RefreshCw, Calendar
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Booking, Listing } from '../types';
import { ListingCard } from '../components/listing/ListingCard';
import { useToast } from '../context/ToastContext';

export const CustomerDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { success } = useToast();
  const [searchParams] = useSearchParams();
  const defaultTab = searchParams.get('tab') || 'rentals';

  const [activeTab, setActiveTab] = useState<string>(defaultTab);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [recommended, setRecommended] = useState<Listing[]>([]);
  const [wishlist, setWishlist] = useState<Listing[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    setIsLoading(true);
    Promise.all([
      api.getBookings('renter').catch(() => []),
      api.getListings({ limit: 4 }).catch(() => []),
      api.getWishlist().catch(() => [])
    ])
      .then(([bData, rData, wData]) => {
        setBookings(bData);
        setRecommended(rData);
        setWishlist(wData);
      })
      .finally(() => setIsLoading(false));
  }, []);

  const handleReturnItem = (bookingId: string) => {
    success("Return inspection pickup scheduled! Dispatch arriving within 45 mins.");
  };

  const activeRentals = bookings.filter(b => b.status === 'ACTIVE' || b.status === 'CONFIRMED');
  const pastRentals = bookings.filter(b => b.status === 'COMPLETED');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      
      {/* User Welcome Banner */}
      <div className="p-8 rounded-3xl glass-panel border border-slate-200 dark:border-slate-800 shadow-sm mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <img
            src={user?.profile_image || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400"}
            alt={user?.name || "User"}
            className="w-16 h-16 rounded-2xl object-cover ring-4 ring-emerald-500/30"
          />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-slate-900 dark:text-white">
                Welcome back, {user?.name}
              </h1>
              <span className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" /> Verified Member
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Active Member • Trust Score: <strong className="text-emerald-600 dark:text-emerald-400">{user?.trust_score || 94}/100</strong>
            </p>
          </div>
        </div>

        {/* Quick Stats Pill */}
        <div className="flex items-center gap-4 border-t md:border-t-0 md:border-l border-slate-200 dark:border-slate-800 pt-4 md:pt-0 md:pl-8">
          <div>
            <span className="text-xs text-slate-400">Active Rentals</span>
            <p className="font-display font-black text-2xl text-slate-900 dark:text-white">
              {activeRentals.length}
            </p>
          </div>
          <div>
            <span className="text-xs text-slate-400">Saved Wishlist</span>
            <p className="font-display font-black text-2xl text-slate-900 dark:text-white">
              {wishlist.length}
            </p>
          </div>
          <div>
            <span className="text-xs text-slate-400">Security Deposit Escrow</span>
            <p className="font-display font-black text-2xl text-emerald-600 dark:text-emerald-400">
              ₹4,000
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200 dark:border-slate-800 pb-3 mb-8">
        <button
          onClick={() => setActiveTab('rentals')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            activeTab === 'rentals'
              ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>Active Rentals & Upcoming Returns</span>
          <span className="bg-emerald-500 text-white text-[10px] px-1.5 py-0.2 rounded-full">
            {activeRentals.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('recommended')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            activeTab === 'recommended'
              ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Sparkles className="w-4 h-4 text-violet-500" />
          <span>AI Recommendations</span>
        </button>

        <button
          onClick={() => setActiveTab('wishlist')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            activeTab === 'wishlist'
              ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Heart className="w-4 h-4 text-rose-500" />
          <span>Saved Collections</span>
        </button>
      </div>

      {/* TAB CONTENT 1: ACTIVE RENTALS */}
      {activeTab === 'rentals' && (
        <div className="space-y-8 animate-fade-in">
          {activeRentals.length === 0 ? (
            <div className="text-center py-16 glass-panel rounded-3xl p-8">
              <Package className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="font-display font-bold text-lg text-slate-900 dark:text-white">
                No active rentals yet
              </h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto mb-6">
                Explore local gear or let the AI Setup Builder assemble your temporary room or workspace.
              </p>
              <button
                onClick={() => navigate('/search')}
                className="px-6 py-3 rounded-2xl bg-emerald-600 text-white font-bold text-xs"
              >
                Browse Marketplace
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {activeRentals.map((b) => (
                <div
                  key={b.id}
                  className="p-6 rounded-3xl glass-panel border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6"
                >
                  <div className="flex items-center gap-5">
                    <img
                      src={b.listing?.images[0]?.image_url || "https://images.unsplash.com/photo-1505797149-43b0069ec26b?w=300"}
                      alt={b.listing?.title || "Item"}
                      className="w-24 h-24 rounded-2xl object-cover shrink-0"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">
                          {b.delivery_type === 'DELIVERY' ? 'Doorstep Delivery' : 'Self Pickup'}
                        </span>
                        <span className="text-xs text-slate-300">•</span>
                        <span className="text-[11px] font-semibold text-slate-500">
                          Booking ID: TMP-{b.id.substring(0, 8).toUpperCase()}
                        </span>
                      </div>
                      <h4 className="font-display font-extrabold text-lg text-slate-900 dark:text-white mt-1">
                        {b.listing?.title}
                      </h4>
                      <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>Duration: {b.rental_days} Days ({new Date(b.start_date).toLocaleDateString()} - {new Date(b.end_date).toLocaleDateString()})</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col sm:items-end gap-3 self-stretch sm:self-auto pt-4 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800">
                    <div className="text-left sm:text-right">
                      <span className="text-xs text-slate-400">Total Paid</span>
                      <p className="font-display font-black text-xl text-slate-900 dark:text-white">
                        ₹{b.total_amount.toLocaleString()}
                      </p>
                      <p className="text-[10px] text-emerald-600 font-semibold">Deposit: ₹{b.security_deposit} in escrow</p>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => navigate(`/inspect?listing=${b.listing_id}&booking=${b.id}`)}
                        className="px-4 py-2 rounded-xl text-xs font-bold border border-slate-200 dark:border-slate-700 hover:bg-slate-100 transition"
                      >
                        AI Condition Check
                      </button>
                      <button
                        onClick={() => handleReturnItem(b.id)}
                        className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-500 transition shadow-sm"
                      >
                        Schedule Return
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT 2: AI RECOMMENDATIONS */}
      {activeTab === 'recommended' && (
        <div className="space-y-6 animate-fade-in">
          <div className="flex items-center justify-between">
            <h3 className="font-display font-bold text-lg text-slate-900 dark:text-white">
              Recommended for your lifestyle in Chennai
            </h3>
            <button
              onClick={() => navigate('/setup-builder')}
              className="text-xs font-bold text-violet-600 hover:underline flex items-center gap-1"
            >
              <span>Custom AI Bundle Generator</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {recommended.map((item) => (
              <ListingCard key={item.id} listing={item} />
            ))}
          </div>
        </div>
      )}

      {/* TAB CONTENT 3: WISHLIST */}
      {activeTab === 'wishlist' && (
        <div className="space-y-6 animate-fade-in">
          {wishlist.length === 0 ? (
            <div className="text-center py-16 glass-panel rounded-3xl p-8">
              <Heart className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="font-display font-bold text-lg text-slate-900 dark:text-white">
                No items saved to wishlist yet
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Tap the heart on any listing to track availability and price.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {wishlist.map((item) => (
                <ListingCard key={item.id} listing={item} />
              ))}
            </div>
          )}
        </div>
      )}

    </div>
  );
};
