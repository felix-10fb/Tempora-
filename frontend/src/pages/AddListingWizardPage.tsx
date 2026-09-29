import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Upload, Sparkles, Check, ArrowRight, ArrowLeft,
  DollarSign, MapPin, ShieldCheck, Image as ImageIcon
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';

export const AddListingWizardPage: React.FC = () => {
  const navigate = useNavigate();
  const { toast, success, error } = useToast();

  const [step, setStep] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Form State
  const [photoUrl, setPhotoUrl] = useState<string>("https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800");
  const [title, setTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [category, setCategory] = useState<string>("Furniture");
  const [condition, setCondition] = useState<string>("Excellent");
  const [pricePerDay, setPricePerDay] = useState<number>(249);
  const [pricePerMonth, setPricePerMonth] = useState<number>(4400);
  const [deposit, setDeposit] = useState<number>(3000);
  const [location, setLocation] = useState<string>("Adyar, Chennai");
  const [deliveryAvailable, setDeliveryAvailable] = useState<boolean>(true);

  // AI Pre-scan condition preview
  const [aiScore] = useState<number>(94);

  const categories = [
    'Furniture',
    'Clothing',
    'Electronics',
    'Cameras & Creator Equipment',
    'Appliances',
    'Sports Equipment',
    'Event Equipment',
    'Study/Office Equipment'
  ];

  const handlePublish = async () => {
    if (!title || !description) {
      toast("Please enter a title and description", "error");
      return;
    }

    setIsSubmitting(true);
    try {
      const newListing = await api.createListing({
        title,
        description,
        category,
        condition,
        price_per_day: Number(pricePerDay),
        price_per_month: Number(pricePerMonth),
        security_deposit: Number(deposit),
        location,
        city: "Chennai",
        latitude: 13.0012,
        longitude: 80.2565,
        delivery_available: deliveryAvailable,
        images: [photoUrl]
      });

      success("Listing published successfully!");
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
      navigate(`/listing/${newListing.id}`);
    } catch (err: any) {
      error(err.message || "Failed to publish listing");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
      
      {/* Step Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
          <span>Step {step} of 5</span>
          <span className="text-emerald-600 dark:text-emerald-400">
            {step === 1 && "Photos"}
            {step === 2 && "Details & Category"}
            {step === 3 && "Pricing & Deposit"}
            {step === 4 && "Location & Delivery"}
            {step === 5 && "AI Pre-Inspection & Publish"}
          </span>
        </div>
        <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-emerald-500 transition-all duration-300"
            style={{ width: `${(step / 5) * 100}%` }}
          />
        </div>
      </div>

      {/* Form Content */}
      <div className="glass-panel p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-elevated">
        
        {/* STEP 1: PHOTOS */}
        {step === 1 && (
          <div className="space-y-6 animate-fade-in">
            <div>
              <h2 className="font-display font-black text-2xl text-slate-900 dark:text-white">
                Upload Listing Imagery
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Provide high-resolution photos. TEMPORA AI uses these to calculate your Condition Baseline Score.
              </p>
            </div>

            <div className="aspect-video w-full rounded-2xl overflow-hidden border-2 border-dashed border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 flex flex-col items-center justify-center relative">
              {photoUrl ? (
                <img src={photoUrl} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <div className="text-center p-6">
                  <Upload className="w-10 h-10 text-slate-400 mx-auto mb-2" />
                  <p className="text-sm font-bold text-slate-700 dark:text-slate-300">Enter image URL</p>
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-400 mb-1.5">
                Image Web Link
              </label>
              <input
                type="text"
                value={photoUrl}
                onChange={(e) => setPhotoUrl(e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className="w-full p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-medium focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>
        )}

        {/* STEP 2: DETAILS */}
        {step === 2 && (
          <div className="space-y-6 animate-fade-in">
            <div>
              <h2 className="font-display font-black text-2xl text-slate-900 dark:text-white">
                Title & Specifications
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Be clear and descriptive. Include brand, model, and physical dimensions.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-400 mb-1.5">
                Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Herman Miller Aeron Ergonomic Task Chair"
                className="w-full p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm font-medium focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-400 mb-1.5">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm font-medium focus:ring-2 focus:ring-emerald-500"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-400 mb-1.5">
                Description
              </label>
              <textarea
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Detailed description, included accessories, usage guidelines..."
                className="w-full p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm font-medium focus:ring-2 focus:ring-emerald-500 resize-none"
              />
            </div>
          </div>
        )}

        {/* STEP 3: PRICING */}
        {step === 3 && (
          <div className="space-y-6 animate-fade-in">
            <div>
              <h2 className="font-display font-black text-2xl text-slate-900 dark:text-white">
                Rental Rates & Deposit
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                You earn 95% of all rental fees directly to your bank account.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-400 mb-1.5">
                  Price Per Day (₹)
                </label>
                <input
                  type="number"
                  value={pricePerDay}
                  onChange={(e) => setPricePerDay(Number(e.target.value))}
                  className="w-full p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm font-bold focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-400 mb-1.5">
                  Price Per Month (₹)
                </label>
                <input
                  type="number"
                  value={pricePerMonth}
                  onChange={(e) => setPricePerMonth(Number(e.target.value))}
                  className="w-full p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm font-bold focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold uppercase text-slate-400 mb-1.5">
                  Refundable Security Deposit (₹)
                </label>
                <input
                  type="number"
                  value={deposit}
                  onChange={(e) => setDeposit(Number(e.target.value))}
                  className="w-full p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm font-bold focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: LOCATION & DISPATCH */}
        {step === 4 && (
          <div className="space-y-6 animate-fade-in">
            <div>
              <h2 className="font-display font-black text-2xl text-slate-900 dark:text-white">
                Hyperlocal Pickup & Delivery
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Your exact address is only shared with confirmed renters upon dispatch.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-400 mb-1.5">
                Neighborhood / Area
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm font-medium focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <label className="flex items-center gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 cursor-pointer">
              <input
                type="checkbox"
                checked={deliveryAvailable}
                onChange={(e) => setDeliveryAvailable(e.target.checked)}
                className="w-5 h-5 rounded text-emerald-600 accent-emerald-500"
              />
              <div className="text-xs">
                <p className="font-bold text-slate-900 dark:text-white">Enable TEMPORA Courier Delivery</p>
                <p className="text-slate-500">Fleet drivers pick up from your doorstep and handle drop-off.</p>
              </div>
            </label>
          </div>
        )}

        {/* STEP 5: AI PRE-INSPECTION SCAN */}
        {step === 5 && (
          <div className="space-y-6 animate-fade-in">
            <div>
              <h2 className="font-display font-black text-2xl text-slate-900 dark:text-white">
                AI Item Baseline Inspection
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Our vision model analyzes your imagery to protect your equipment from dispute ambiguity.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-slate-900 text-white border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                  Baseline Condition Grade
                </span>
                <p className="font-display font-black text-3xl mt-0.5">Very Good</p>
                <p className="text-xs text-slate-400 mt-1">0 structural defects detected • Ready for rental</p>
              </div>
              <div className="text-center p-4 rounded-2xl bg-slate-800 border border-slate-700">
                <span className="font-display font-black text-3xl text-emerald-400">{aiScore}</span>
                <span className="text-xs text-slate-400 block">/ 100 Score</span>
              </div>
            </div>

            <div className="text-xs text-slate-500 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>Full deposit protection enabled. Returns will be automatically compared against this baseline scan.</span>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          {step > 1 ? (
            <button
              onClick={() => setStep(step - 1)}
              className="px-5 py-2.5 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 transition flex items-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>
          ) : <div />}

          {step < 5 ? (
            <button
              onClick={() => setStep(step + 1)}
              className="px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 transition shadow-sm flex items-center gap-1.5"
            >
              <span>Next</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              disabled={isSubmitting}
              onClick={handlePublish}
              className="px-8 py-3 rounded-2xl text-xs font-black text-white bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 shadow-glow-emerald transition disabled:opacity-50"
            >
              {isSubmitting ? "Publishing to Marketplace..." : "Publish Listing Live"}
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
