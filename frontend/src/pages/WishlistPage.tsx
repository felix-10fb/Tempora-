import React, { useState, useEffect } from 'react';
import { Heart, Sparkles, ArrowRight, FolderPlus } from 'lucide-react';
import { api } from '../services/api';
import { Listing } from '../types';
import { ListingCard } from '../components/listing/ListingCard';
import { BookingModal } from '../components/booking/BookingModal';

export const WishlistPage: React.FC = () => {
  const [items, setItems] = useState<Listing[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
  const [activeCollection, setActiveCollection] = useState<string>("All Saved Items");

  const collections = [
    "All Saved Items",
    "Dream Room",
    "Interview Kit",
    "Creator Setup",
    "Weekend Getaway"
  ];

  useEffect(() => {
    setIsLoading(true);
    api.getWishlist()
      .then((data) => setItems(data))
      .catch((err) => console.error(err))
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-rose-500">
            Curated Collections
          </span>
          <h1 className="font-display font-black text-3xl sm:text-4xl text-slate-900 dark:text-white mt-1">
            Saved Wishlist
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Track availability, rental price shifts, and create temporary lifestyle kits.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {collections.map((col) => (
            <button
              key={col}
              onClick={() => setActiveCollection(col)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition whitespace-nowrap ${
                activeCollection === col
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
              }`}
            >
              {col}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-80 rounded-3xl bg-slate-200 dark:bg-slate-800 animate-pulse" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-20 glass-panel rounded-3xl p-8">
          <Heart className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="font-display font-bold text-lg text-slate-900 dark:text-white">
            Your collection is empty
          </h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Browse the marketplace and tap the heart icon on items you'd love to rent.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {items.map((it) => (
            <ListingCard
              key={it.id}
              listing={it}
              onBookClick={(listing) => setSelectedListing(listing)}
            />
          ))}
        </div>
      )}

      {/* Booking Modal */}
      {selectedListing && (
        <BookingModal
          listing={selectedListing}
          isOpen={!!selectedListing}
          onClose={() => setSelectedListing(null)}
        />
      )}

    </div>
  );
};
