import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, Star, MapPin, ShieldCheck, Truck, Sparkles } from 'lucide-react';
import { Listing } from '../../types';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';

interface ListingCardProps {
  listing: Listing;
  onBookClick?: (listing: Listing) => void;
}

export const ListingCard: React.FC<ListingCardProps> = ({ listing, onBookClick }) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSaved, setIsSaved] = useState<boolean>(false);
  const [isHovered, setIsHovered] = useState<boolean>(false);

  const handleToggleWishlist = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const res = await api.toggleWishlist(listing.id);
      setIsSaved(res.saved);
      toast(res.message, res.saved ? 'success' : 'info');
    } catch {
      setIsSaved(!isSaved);
      toast(isSaved ? "Removed from wishlist" : "Added to wishlist", 'info');
    }
  };

  const primaryImage = listing.images && listing.images.length > 0
    ? listing.images[0].image_url
    : "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800";

  return (
    <div
      onClick={() => navigate(`/listing/${listing.id}`)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-sm hover:shadow-elevated transition-all duration-300 cursor-pointer flex flex-col justify-between"
    >
      <div>
        {/* Image Container with Badges */}
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
          <img
            src={primaryImage}
            alt={listing.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
          />

          {/* Condition Badge */}
          <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full text-[11px] font-bold text-white border border-white/10">
            {listing.condition || "Excellent"}
          </div>

          {/* Heart Save Button */}
          <button
            onClick={handleToggleWishlist}
            className="absolute top-3 right-3 p-2 rounded-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-md text-slate-700 dark:text-slate-200 hover:text-rose-500 hover:scale-110 transition shadow-sm"
          >
            <Heart className={`w-4 h-4 ${isSaved ? 'text-rose-500 fill-rose-500' : ''}`} />
          </button>

          {/* Delivery Available Badge */}
          {listing.delivery_available && (
            <div className="absolute bottom-3 left-3 bg-emerald-500/90 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] font-bold text-white flex items-center gap-1 shadow-sm">
              <Truck className="w-3 h-3" />
              <span>Doorstep Delivery</span>
            </div>
          )}
        </div>

        {/* Card Body */}
        <div className="p-4 sm:p-5">
          {/* Category & Trust Score */}
          <div className="flex items-center justify-between gap-2 text-xs mb-1.5">
            <span className="font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 truncate">
              {listing.category}
            </span>
            <span className="flex items-center gap-1 font-bold text-slate-700 dark:text-slate-300">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span>{listing.owner?.trust_score || 94} Trust</span>
            </span>
          </div>

          {/* Title */}
          <h3 className="font-display font-bold text-base sm:text-lg text-slate-900 dark:text-white line-clamp-1 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
            {listing.title}
          </h3>

          {/* Location & Rating */}
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mt-2">
            <div className="flex items-center gap-1 truncate max-w-[70%]">
              <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="truncate">{listing.location || listing.city}</span>
            </div>

            <div className="flex items-center gap-1 font-bold text-slate-900 dark:text-white shrink-0">
              <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
              <span>{listing.rating.toFixed(1)}</span>
              <span className="text-slate-400 font-normal">({listing.review_count || 12})</span>
            </div>
          </div>
        </div>
      </div>

      {/* Pricing & Rent CTA */}
      <div className="px-4 sm:px-5 pb-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
        <div>
          <div className="flex items-baseline gap-1">
            <span className="text-xs font-semibold text-slate-500">₹</span>
            <span className="font-display font-extrabold text-xl text-slate-900 dark:text-white">
              {listing.price_per_day.toLocaleString()}
            </span>
            <span className="text-xs text-slate-500 font-medium">/ day</span>
          </div>
          {listing.price_per_month && (
            <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
              ₹{listing.price_per_month.toLocaleString()} / mo (Best value)
            </p>
          )}
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            if (onBookClick) onBookClick(listing);
            else navigate(`/listing/${listing.id}`);
          }}
          className="px-4 py-2 rounded-xl text-xs font-extrabold text-white bg-emerald-600 hover:bg-emerald-500 transition shadow-sm active:scale-95"
        >
          Rent
        </button>
      </div>
    </div>
  );
};
