import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Filter, SlidersHorizontal, Check, RefreshCw, X } from 'lucide-react';
import { Listing } from '../types';
import { api } from '../services/api';
import { ListingCard } from '../components/listing/ListingCard';
import { GoogleMapSplitView } from '../components/maps/GoogleMapSplitView';
import { BookingModal } from '../components/booking/BookingModal';

export const SearchPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCategory = searchParams.get('category') || 'All';
  const initialQuery = searchParams.get('q') || '';

  const [listings, setListings] = useState<Listing[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
  const [bookingModalListing, setBookingModalListing] = useState<Listing | null>(null);

  // Filter States
  const [query, setQuery] = useState<string>(initialQuery);
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [maxPrice, setMaxPrice] = useState<number>(3000);
  const [selectedCondition, setSelectedCondition] = useState<string>('All');
  const [deliveryOnly, setDeliveryOnly] = useState<boolean>(false);
  const [verifiedOnly, setVerifiedOnly] = useState<boolean>(false);

  const categories = [
    'All',
    'Furniture',
    'Clothing',
    'Electronics',
    'Cameras & Creator Equipment',
    'Appliances',
    'Sports Equipment',
    'Event Equipment',
    'Study/Office Equipment'
  ];

  const fetchResults = async () => {
    setIsLoading(true);
    try {
      const params: Record<string, any> = {
        q: query || undefined,
        category: selectedCategory !== 'All' ? selectedCategory : undefined,
        max_price: maxPrice < 3000 ? maxPrice : undefined,
        condition: selectedCondition !== 'All' ? selectedCondition : undefined,
        delivery: deliveryOnly ? true : undefined,
        verified_only: verifiedOnly ? true : undefined
      };
      const data = await api.searchMarketplace(params);
      setListings(data);
      if (data.length > 0 && !selectedListing) {
        setSelectedListing(data[0]);
      }
    } catch (err) {
      console.error("Search error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchResults();
  }, [selectedCategory, maxPrice, selectedCondition, deliveryOnly, verifiedOnly]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchResults();
  };

  return (
    <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
      
      {/* Top Filter Bar */}
      <div className="mb-6 space-y-4">
        {/* Search Input & Quick Controls */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <form onSubmit={handleSearchSubmit} className="flex-1 relative">
            <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search gear, furniture, creator optics, suits, consoles..."
              className="w-full pl-12 pr-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm font-medium focus:ring-2 focus:ring-emerald-500 shadow-sm"
            />
          </form>

          {/* Quick Filter Buttons */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
            <button
              onClick={() => setDeliveryOnly(!deliveryOnly)}
              className={`px-3.5 py-2.5 rounded-xl text-xs font-bold border transition shrink-0 ${
                deliveryOnly
                  ? 'bg-emerald-50 dark:bg-emerald-950 border-emerald-500 text-emerald-700 dark:text-emerald-300'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
              }`}
            >
              Doorstep Delivery Only
            </button>

            <button
              onClick={() => setVerifiedOnly(!verifiedOnly)}
              className={`px-3.5 py-2.5 rounded-xl text-xs font-bold border transition shrink-0 ${
                verifiedOnly
                  ? 'bg-emerald-50 dark:bg-emerald-950 border-emerald-500 text-emerald-700 dark:text-emerald-300'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
              }`}
            >
              Verified Owners Only
            </button>
          </div>
        </div>

        {/* Category Horizontal Scrolling Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setSelectedCategory(c)}
              className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition ${
                selectedCategory === c
                  ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Split Screen Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Col: Listings Results Grid (7 Cols on desktop) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold px-1">
            <span>{listings.length} verified listings found in Chennai</span>
            <span>Sorted by popular</span>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-80 rounded-3xl bg-slate-200 dark:bg-slate-800 animate-pulse" />
              ))}
            </div>
          ) : listings.length === 0 ? (
            <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8">
              <Search className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="font-display font-bold text-lg text-slate-900 dark:text-white">
                No items match your criteria
              </h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Try broadening your category filter or asking the AI Setup Builder to curate a custom bundle.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {listings.map((item) => (
                <ListingCard
                  key={item.id}
                  listing={item}
                  onBookClick={(listing) => setBookingModalListing(listing)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Right Col: Google Map Split View (5 Cols on desktop, sticky) */}
        <div className="lg:col-span-5 sticky top-28 h-[calc(100vh-140px)] min-h-[500px]">
          <GoogleMapSplitView
            listings={listings}
            selectedListing={selectedListing}
            onSelectListing={(item) => setSelectedListing(item)}
          />
        </div>

      </div>

      {/* Booking Modal */}
      {bookingModalListing && (
        <BookingModal
          listing={bookingModalListing}
          isOpen={!!bookingModalListing}
          onClose={() => setBookingModalListing(null)}
        />
      )}

    </div>
  );
};
