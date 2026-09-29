import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, Star, MapPin, ShieldCheck, Truck, Clock, Eye } from 'lucide-react';
import { Listing } from '../../types';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';

interface ListingCardProps {
  listing: Listing;
  onBookClick?: (listing: Listing) => void;
  layout?: 'grid' | 'list';
}

const CONDITION_COLORS: Record<string, string> = {
  'New': 'bg-emerald-500 text-white',
  'Like New': 'bg-emerald-500 text-white',
  'Excellent': 'bg-teal-500 text-white',
  'Good': 'bg-blue-500 text-white',
  'Fair': 'bg-amber-500 text-white',
};

export const ListingCard: React.FC<ListingCardProps> = ({ listing, onBookClick, layout = 'grid' }) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSaved, setIsSaved] = useState<boolean>(false);
  const [imageLoaded, setImageLoaded] = useState<boolean>(false);

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

  const conditionClass = CONDITION_COLORS[listing.condition || 'Excellent'] || 'bg-slate-600 text-white';

  const discount = listing.price_per_month
    ? Math.round(100 - (listing.price_per_month / (listing.price_per_day * 30)) * 100)
    : 0;

  if (layout === 'list') {
    return (
      <div
        onClick={() => navigate(`/listing/${listing.id}`)}
        className="listing-card group bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 overflow-hidden cursor-pointer flex"
      >
        {/* Image */}
        <div className="relative w-56 shrink-0 overflow-hidden bg-slate-100 dark:bg-slate-800">
          <img src={primaryImage} alt={listing.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          <div className={`absolute top-2.5 left-2.5 px-2 py-0.5 rounded-md text-[10px] font-bold ${conditionClass}`}>
            {listing.condition || 'Excellent'}
          </div>
          <button onClick={handleToggleWishlist} className="absolute top-2.5 right-2.5 p-1.5 rounded-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm hover:scale-110 transition">
            <Heart className={`w-4 h-4 ${isSaved ? 'text-rose-500 fill-rose-500' : 'text-slate-600 dark:text-slate-300'}`} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-md">{listing.category}</span>
              {listing.delivery_available && (
                <span className="text-[10px] font-bold text-teal-600 dark:text-teal-400 flex items-center gap-0.5"><Truck className="w-3 h-3" /> Free Delivery</span>
              )}
            </div>
            <h3 className="font-display font-bold text-lg text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors line-clamp-1">{listing.title}</h3>
            <p className="text-xs text-slate-500 mt-1 line-clamp-2">{listing.description}</p>
          </div>
          <div className="flex items-center justify-between mt-3">
            <div className="flex items-center gap-4 text-xs text-slate-500">
              <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{listing.location || listing.city}</span>
              <span className="flex items-center gap-1 font-bold text-slate-800 dark:text-white"><Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />{listing.rating.toFixed(1)}</span>
              <span className="flex items-center gap-1"><ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />{listing.owner?.trust_score || 94}</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <span className="font-display font-extrabold text-lg text-slate-900 dark:text-white">₹{listing.price_per_day.toLocaleString()}</span>
                <span className="text-xs text-slate-500 ml-1">/day</span>
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); onBookClick ? onBookClick(listing) : navigate(`/listing/${listing.id}`); }}
                className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 shadow-sm transition active:scale-95"
              >
                Rent Now
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={() => navigate(`/listing/${listing.id}`)}
      className="listing-card group bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 overflow-hidden cursor-pointer flex flex-col"
    >
      {/* Image Container */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
        {/* Skeleton */}
        {!imageLoaded && (
          <div className="absolute inset-0 bg-slate-200 dark:bg-slate-800 animate-pulse" />
        )}
        <img
          src={primaryImage}
          alt={listing.title}
          onLoad={() => setImageLoaded(true)}
          className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
        />

        {/* Top row badges */}
        <div className="absolute top-3 left-3 right-3 flex items-start justify-between">
          <div className="flex flex-col gap-1.5">
            <span className={`inline-flex px-2.5 py-1 rounded-lg text-[10px] font-bold ${conditionClass} shadow-sm`}>
              {listing.condition || 'Excellent'}
            </span>
            {discount > 15 && (
              <span className="inline-flex px-2 py-0.5 rounded-md bg-rose-500 text-white text-[10px] font-bold shadow-sm">
                {discount}% OFF monthly
              </span>
            )}
          </div>
          <button
            onClick={handleToggleWishlist}
            className={`p-2 rounded-full backdrop-blur-md shadow-sm transition-all hover:scale-110 ${
              isSaved
                ? 'bg-rose-500 text-white'
                : 'bg-white/85 dark:bg-slate-900/85 text-slate-700 dark:text-slate-200 hover:text-rose-500'
            }`}
          >
            <Heart className={`w-4 h-4 ${isSaved ? 'fill-white' : ''}`} />
          </button>
        </div>

        {/* Bottom badges */}
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
          {listing.delivery_available && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-black/55 backdrop-blur-md text-white text-[10px] font-bold">
              <Truck className="w-3 h-3" /> Free Delivery
            </span>
          )}
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-black/55 backdrop-blur-md text-white text-[10px] font-medium ml-auto">
            <Eye className="w-3 h-3" /> {Math.floor(Math.random() * 50 + 10)} views
          </span>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-4 flex-1 flex flex-col">
        {/* Category + Trust */}
        <div className="flex items-center justify-between gap-2 text-xs mb-1">
          <span className="font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 truncate">
            {listing.category}
          </span>
          <span className="flex items-center gap-1 font-semibold text-slate-600 dark:text-slate-400 shrink-0">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>{listing.owner?.trust_score || 94}</span>
          </span>
        </div>

        {/* Title */}
        <h3 className="font-display font-bold text-base text-slate-900 dark:text-white line-clamp-1 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
          {listing.title}
        </h3>

        {/* Location + Rating */}
        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mt-1.5">
          <div className="flex items-center gap-1 truncate max-w-[60%]">
            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="truncate">{listing.location || listing.city}</span>
          </div>
          <div className="flex items-center gap-1 font-bold text-slate-800 dark:text-white shrink-0">
            <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
            <span>{listing.rating.toFixed(1)}</span>
            <span className="text-slate-400 font-normal">({listing.review_count || 12})</span>
          </div>
        </div>
      </div>

      {/* Pricing Footer */}
      <div className="px-4 pb-4 pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
        <div>
          <div className="flex items-baseline gap-0.5">
            <span className="text-xs font-semibold text-slate-400">₹</span>
            <span className="font-display font-extrabold text-xl text-slate-900 dark:text-white">
              {listing.price_per_day.toLocaleString()}
            </span>
            <span className="text-xs text-slate-500 font-medium">/day</span>
          </div>
          {listing.price_per_month && (
            <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-0.5">
              <Clock className="w-3 h-3" />
              ₹{listing.price_per_month.toLocaleString()}/mo
            </p>
          )}
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); onBookClick ? onBookClick(listing) : navigate(`/listing/${listing.id}`); }}
          className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 shadow-sm transition active:scale-95"
        >
          Rent Now
        </button>
      </div>
    </div>
  );
};
