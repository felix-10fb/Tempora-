import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Heart, Star, MapPin, ShieldCheck, Truck, Sparkles,
  Calendar, CheckCircle2, AlertTriangle, Share2, MessageSquare, ArrowLeft
} from 'lucide-react';
import { Listing, Review } from '../types';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';
import { BookingModal } from '../components/booking/BookingModal';

export const ListingDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast, success } = useToast();

  const [listing, setListing] = useState<Listing | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [activeImageIdx, setActiveImageIdx] = useState<number>(0);
  const [isSaved, setIsSaved] = useState<boolean>(false);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState<boolean>(false);

  // Review Form
  const [newRating, setNewRating] = useState<number>(5);
  const [newComment, setNewComment] = useState<string>('');
  const [isSubmittingReview, setIsSubmittingReview] = useState<boolean>(false);

  useEffect(() => {
    if (!id) return;
    setIsLoading(true);
    Promise.all([
      api.getListingDetail(id),
      api.getReviews(id).catch(() => [])
    ])
      .then(([listingData, reviewsData]) => {
        setListing(listingData);
        setReviews(reviewsData);
      })
      .catch((err) => {
        toast("Listing not found", "error");
        navigate('/search');
      })
      .finally(() => setIsLoading(false));
  }, [id]);

  const handleToggleWishlist = async () => {
    if (!listing) return;
    try {
      const res = await api.toggleWishlist(listing.id);
      setIsSaved(res.saved);
      toast(res.message, res.saved ? 'success' : 'info');
    } catch {
      setIsSaved(!isSaved);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: listing?.title,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast("Link copied to clipboard", "info");
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!listing || !newComment.trim()) return;
    setIsSubmittingReview(true);
    try {
      const rev = await api.createReview({
        listing_id: listing.id,
        rating: newRating,
        comment: newComment
      });
      setReviews([rev, ...reviews]);
      setNewComment('');
      success("Review posted successfully!");
    } catch (err: any) {
      toast(err.message || "Failed to post review", "error");
    } finally {
      setIsSubmittingReview(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 animate-pulse space-y-6">
        <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded-xl w-1/3" />
        <div className="h-96 bg-slate-200 dark:bg-slate-800 rounded-3xl" />
      </div>
    );
  }

  if (!listing) return null;

  const images = listing.images && listing.images.length > 0
    ? listing.images.map(img => img.image_url)
    : ["https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=1000"];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="mb-6 inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white transition"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to results</span>
      </button>

      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-xs font-bold uppercase tracking-wider">
              {listing.category}
            </span>
            <span className="text-xs font-semibold text-slate-500">
              Condition: <strong className="text-slate-900 dark:text-white">{listing.condition}</strong>
            </span>
          </div>
          <h1 className="font-display font-black text-3xl sm:text-4xl text-slate-900 dark:text-white tracking-tight">
            {listing.title}
          </h1>
          <div className="flex items-center gap-4 text-xs text-slate-500 mt-2">
            <span className="flex items-center gap-1">
              <MapPin className="w-4 h-4 text-slate-400" />
              {listing.location}, {listing.city}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1 font-bold text-slate-900 dark:text-white">
              <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
              {listing.rating.toFixed(1)} ({listing.review_count} verified reviews)
            </span>
          </div>
        </div>

        {/* Action Buttons: Save, Share */}
        <div className="flex items-center gap-2 self-start md:self-auto">
          <button
            onClick={handleToggleWishlist}
            className={`p-3 rounded-2xl border transition shadow-sm flex items-center gap-2 text-xs font-bold ${
              isSaved
                ? 'bg-rose-50 dark:bg-rose-950 border-rose-200 text-rose-600'
                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50'
            }`}
          >
            <Heart className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
            <span>{isSaved ? 'Saved' : 'Save'}</span>
          </button>

          <button
            onClick={handleShare}
            className="p-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-50 transition shadow-sm text-xs font-bold flex items-center gap-2"
          >
            <Share2 className="w-4 h-4" />
            <span>Share</span>
          </button>
        </div>
      </div>

      {/* Image Gallery */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-10">
        <div className="lg:col-span-3 h-[420px] sm:h-[500px] rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-elevated bg-slate-100 dark:bg-slate-800 relative">
          <img
            src={images[activeImageIdx]}
            alt={listing.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-white">
            Photo {activeImageIdx + 1} of {images.length}
          </div>
        </div>

        {/* Thumbnails */}
        <div className="flex lg:flex-col gap-3 overflow-x-auto lg:overflow-visible">
          {images.map((img, idx) => (
            <div
              key={idx}
              onClick={() => setActiveImageIdx(idx)}
              className={`h-28 lg:h-auto flex-1 rounded-2xl overflow-hidden border-2 cursor-pointer transition ${
                activeImageIdx === idx
                  ? 'border-emerald-500 scale-[0.98]'
                  : 'border-transparent opacity-70 hover:opacity-100'
              }`}
            >
              <img src={img} alt="" className="w-full h-full object-cover" />
            </div>
          ))}
        </div>
      </div>

      {/* Main Details & Pricing Booking Sidebar Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        
        {/* Left Column: Details, Specifications, Owner, Reviews */}
        <div className="lg:col-span-8 space-y-10">
          
          {/* Owner & Trust Badge Card */}
          <div className="p-6 rounded-3xl glass-panel border border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <img
                src={listing.owner?.profile_image || "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400"}
                alt={listing.owner?.name || "Owner"}
                className="w-14 h-14 rounded-2xl object-cover ring-2 ring-emerald-500/40"
              />
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-display font-bold text-lg text-slate-900 dark:text-white">
                    Listed by {listing.owner?.name || "Verified Local Owner"}
                  </h3>
                  <span className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Verified Owner
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Hyperlocal Host in {listing.city} • Active since 2024
                </p>
              </div>
            </div>

            {/* Algorithmic Trust Score */}
            <div className="text-right">
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-800">
                <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span className="font-display font-black text-sm text-emerald-800 dark:text-emerald-300">
                  {listing.owner?.trust_score || 96} / 100
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-semibold mt-1">TEMPORA Trust Score</p>
            </div>
          </div>

          {/* Description */}
          <div>
            <h3 className="font-display font-bold text-xl text-slate-900 dark:text-white mb-3">
              About this item
            </h3>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
              {listing.description}
            </p>
          </div>

          {/* Key Features & Delivery Perks */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 flex items-start gap-3">
              <Truck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-xs text-slate-900 dark:text-white">Hyperlocal Doorstep Delivery</p>
                <p className="text-[11px] text-slate-500 mt-0.5">White-glove drop off and optional room placement.</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-violet-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-xs text-slate-900 dark:text-white">AI Item Condition Baseline</p>
                <p className="text-[11px] text-slate-500 mt-0.5">Photographed and pre-verified. Zero surprise deductions.</p>
              </div>
            </div>
          </div>

          {/* Customer Reviews Section */}
          <div className="pt-6 border-t border-slate-200 dark:border-slate-800">
            <h3 className="font-display font-bold text-2xl text-slate-900 dark:text-white mb-6 flex items-center gap-2">
              <span>Verified Renter Reviews</span>
              <span className="text-sm font-normal text-slate-500">({reviews.length})</span>
            </h3>

            {/* Submit Review Box */}
            <form onSubmit={handleSubmitReview} className="p-4 rounded-2xl glass-panel mb-8 border border-slate-200 dark:border-slate-800">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Write a Review</span>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setNewRating(star)}
                      className="p-1 hover:scale-110 transition"
                    >
                      <Star
                        className={`w-4 h-4 ${star <= newRating ? 'text-amber-400 fill-amber-400' : 'text-slate-300'}`}
                      />
                    </button>
                  ))}
                </div>
              </div>
              <textarea
                rows={2}
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Share your experience renting this item..."
                className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-medium focus:ring-2 focus:ring-emerald-500 resize-none"
              />
              <div className="mt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={isSubmittingReview || !newComment.trim()}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition disabled:opacity-50"
                >
                  {isSubmittingReview ? "Posting..." : "Post Review"}
                </button>
              </div>
            </form>

            {/* Review Cards */}
            <div className="space-y-4">
              {reviews.map((r, i) => (
                <div key={r.id || i} className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-xs text-slate-900 dark:text-white">
                      {r.reviewer?.name || "Verified Renter"}
                    </span>
                    <div className="flex items-center gap-0.5">
                      {[...Array(r.rating)].map((_, idx) => (
                        <Star key={idx} className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                      ))}
                    </div>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    {r.comment}
                  </p>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right Column: Sticky Pricing & Rental Booking Widget */}
        <div className="lg:col-span-4 sticky top-28">
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-6">
            
            {/* Price Tiers Display */}
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Rental Rate</span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-xl font-bold text-slate-500">₹</span>
                <span className="font-display font-black text-4xl text-slate-900 dark:text-white">
                  {listing.price_per_day.toLocaleString()}
                </span>
                <span className="text-sm font-semibold text-slate-500">/ day</span>
              </div>

              {listing.price_per_month && (
                <div className="mt-3 p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200/60 dark:border-emerald-800/60 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-emerald-900 dark:text-emerald-200">
                      ₹{listing.price_per_month.toLocaleString()} / month
                    </span>
                    <p className="text-[10px] text-emerald-700 dark:text-emerald-400 font-medium">
                      Automated 27% extended lease discount
                    </p>
                  </div>
                  <span className="text-[10px] uppercase font-black bg-emerald-500 text-white px-2 py-0.5 rounded-full">
                    Best Value
                  </span>
                </div>
              )}
            </div>

            {/* Quick Rental Guarantees */}
            <div className="space-y-2.5 text-xs text-slate-600 dark:text-slate-300 pt-2 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <span>Security Deposit</span>
                <span className="font-bold text-slate-900 dark:text-white">
                  ₹{(listing.security_deposit || 0).toLocaleString()} (Refundable)
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>Doorstep Delivery</span>
                <span className="font-bold text-emerald-600">Available</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Cancellation</span>
                <span className="font-bold text-slate-900 dark:text-white">Free before dispatch</span>
              </div>
            </div>

            {/* Primary RENT THIS CTA Button */}
            <button
              onClick={() => setIsBookingModalOpen(true)}
              className="w-full py-4 rounded-2xl font-extrabold text-base text-white bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 hover:from-emerald-500 hover:to-teal-400 shadow-glow-emerald transition active:scale-95 flex items-center justify-center gap-2"
            >
              <span>RENT THIS ITEM</span>
            </button>

            <button
              onClick={() => navigate(`/chat?recipient=${listing.owner_id}&listing=${listing.id}`)}
              className="w-full py-3 rounded-2xl font-bold text-xs text-slate-700 dark:text-slate-300 glass-panel border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition flex items-center justify-center gap-2"
            >
              <MessageSquare className="w-4 h-4 text-emerald-600" />
              <span>Ask Owner a Question</span>
            </button>

            <div className="text-center">
              <span className="text-[11px] text-slate-400 flex items-center justify-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                Guaranteed by TEMPORA Escrow & AI Verification
              </span>
            </div>

          </div>
        </div>

      </div>

      {/* Booking Modal */}
      <BookingModal
        listing={listing}
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
      />

    </div>
  );
};
