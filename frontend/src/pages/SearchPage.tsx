import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Search, Filter, SlidersHorizontal, Check, RefreshCw, X,
  MapPin, Star, ShieldCheck, Truck, Navigation, ChevronDown,
  RotateCcw, Sparkles, ArrowUpDown
} from 'lucide-react';
import { Listing, TamilNaduPincode } from '../types';
import { api } from '../services/api';
import { ListingCard } from '../components/listing/ListingCard';
import { GoogleMapSplitView } from '../components/maps/GoogleMapSplitView';
import { BookingModal } from '../components/booking/BookingModal';

const CATEGORIES = [
  'Furniture',
  'Clothing',
  'Electronics',
  'Cameras & Creator Equipment',
  'Appliances',
  'Sports Equipment',
  'Event Equipment',
  'Study/Office Equipment'
];

const CONDITIONS = [
  'Pristine',
  'Like New',
  'Excellent',
  'Very Good',
  'Good'
];

const DISTRICTS = [
  'All Districts',
  'Chennai',
  'Coimbatore',
  'Madurai',
  'Tiruchirappalli',
  'Salem',
  'Tirunelveli',
  'Vellore',
  'Chengalpattu',
  'Kanchipuram'
];

export const SearchPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCategory = searchParams.get('category');
  const initialQuery = searchParams.get('q') || '';

  const [listings, setListings] = useState<Listing[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
  const [bookingModalListing, setBookingModalListing] = useState<Listing | null>(null);
  const [showFilterPanel, setShowFilterPanel] = useState<boolean>(false);

  // Tamil Nadu Pincodes
  const [tnPincodes, setTnPincodes] = useState<TamilNaduPincode[]>([]);
  const [selectedDistrict, setSelectedDistrict] = useState<string>('All Districts');
  const [selectedPincode, setSelectedPincode] = useState<TamilNaduPincode | null>(null);
  const [pincodeSearchQuery, setPincodeSearchQuery] = useState<string>('');
  const [showPincodeDropdown, setShowPincodeDropdown] = useState<boolean>(false);

  // Precision Multiple Filter States
  const [query, setQuery] = useState<string>(initialQuery);
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    initialCategory && initialCategory !== 'All' ? [initialCategory] : []
  );
  const [selectedConditions, setSelectedConditions] = useState<string[]>([]);
  const [minPrice, setMinPrice] = useState<number>(0);
  const [maxPrice, setMaxPrice] = useState<number>(5000);
  const [radiusKm, setRadiusKm] = useState<number>(30);
  const [minRating, setMinRating] = useState<number>(0);
  const [deliveryOnly, setDeliveryOnly] = useState<boolean>(false);
  const [pickupOnly, setPickupOnly] = useState<boolean>(false);
  const [verifiedOnly, setVerifiedOnly] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<string>('popular');

  // Load Tamil Nadu Pincodes on Mount
  useEffect(() => {
    api.getTamilNaduPincodes()
      .then((pins) => {
        setTnPincodes(pins);
        // Default to Chennai T. Nagar
        const defaultPin = pins.find(p => p.pincode === '600017') || pins[0];
        if (defaultPin) setSelectedPincode(defaultPin);
      })
      .catch((err) => console.error("Failed to load TN pincodes:", err));
  }, []);

  // Fetch Listings with Precision Filters
  const fetchResults = async () => {
    setIsLoading(true);
    try {
      const params: Record<string, any> = {
        q: query || undefined,
        categories: selectedCategories.length > 0 ? selectedCategories.join(',') : undefined,
        conditions: selectedConditions.length > 0 ? selectedConditions.join(',') : undefined,
        min_price: minPrice > 0 ? minPrice : undefined,
        max_price: maxPrice < 5000 ? maxPrice : undefined,
        delivery: deliveryOnly ? true : undefined,
        pickup: pickupOnly ? true : undefined,
        verified_only: verifiedOnly ? true : undefined,
        min_rating: minRating > 0 ? minRating : undefined,
        pincode: selectedPincode ? selectedPincode.pincode : undefined,
        lat: selectedPincode ? selectedPincode.lat : undefined,
        lng: selectedPincode ? selectedPincode.lng : undefined,
        radius_km: selectedPincode && radiusKm < 100 ? radiusKm : undefined,
        sort_by: sortBy
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
  }, [
    selectedCategories,
    selectedConditions,
    minPrice,
    maxPrice,
    radiusKm,
    minRating,
    deliveryOnly,
    pickupOnly,
    verifiedOnly,
    selectedPincode,
    sortBy
  ]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchResults();
  };

  // Toggle Category selection (multi-select)
  const toggleCategory = (cat: string) => {
    if (selectedCategories.includes(cat)) {
      setSelectedCategories(selectedCategories.filter(c => c !== cat));
    } else {
      setSelectedCategories([...selectedCategories, cat]);
    }
  };

  // Toggle Condition selection (multi-select)
  const toggleCondition = (cond: string) => {
    if (selectedConditions.includes(cond)) {
      setSelectedConditions(selectedConditions.filter(c => c !== cond));
    } else {
      setSelectedConditions([...selectedConditions, cond]);
    }
  };

  // Reset all filters
  const resetFilters = () => {
    setQuery('');
    setSelectedCategories([]);
    setSelectedConditions([]);
    setMinPrice(0);
    setMaxPrice(5000);
    setRadiusKm(30);
    setMinRating(0);
    setDeliveryOnly(false);
    setPickupOnly(false);
    setVerifiedOnly(false);
    setSortBy('popular');
  };

  // Filtered pincodes for the search dropdown
  const filteredPincodes = tnPincodes.filter(pin => {
    const matchesDistrict = selectedDistrict === 'All Districts' || pin.district.toLowerCase() === selectedDistrict.toLowerCase();
    const matchesQuery = !pincodeSearchQuery ||
      pin.pincode.includes(pincodeSearchQuery) ||
      pin.area.toLowerCase().includes(pincodeSearchQuery.toLowerCase()) ||
      pin.district.toLowerCase().includes(pincodeSearchQuery.toLowerCase());
    return matchesDistrict && matchesQuery;
  });

  const totalActiveFiltersCount =
    (selectedCategories.length > 0 ? 1 : 0) +
    (selectedConditions.length > 0 ? 1 : 0) +
    (minPrice > 0 || maxPrice < 5000 ? 1 : 0) +
    (deliveryOnly ? 1 : 0) +
    (pickupOnly ? 1 : 0) +
    (verifiedOnly ? 1 : 0) +
    (minRating > 0 ? 1 : 0) +
    (selectedPincode ? 1 : 0);

  return (
    <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
      
      {/* Search Header & Primary Action Row */}
      <div className="mb-6 space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
          
          {/* Main Search Input */}
          <form onSubmit={handleSearchSubmit} className="flex-1 relative">
            <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search Sony cameras, ergonomic chairs, lehengas, PS5 consoles, projectors..."
              className="w-full pl-12 pr-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm font-medium focus:ring-2 focus:ring-emerald-500 shadow-sm transition"
            />
            {query && (
              <button
                type="button"
                onClick={() => { setQuery(''); fetchResults(); }}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </form>

          {/* Tamil Nadu Pincode Location Picker */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowPincodeDropdown(!showPincodeDropdown)}
              className="w-full md:w-auto px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-bold flex items-center justify-between gap-2 shadow-sm hover:border-emerald-500 transition"
            >
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-emerald-500 shrink-0" />
                <span className="truncate max-w-[150px]">
                  {selectedPincode ? `${selectedPincode.area} (${selectedPincode.pincode})` : 'Tamil Nadu PIN'}
                </span>
              </div>
              <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${showPincodeDropdown ? 'rotate-180' : ''}`} />
            </button>

            {/* Pincode Selector Modal / Dropdown */}
            {showPincodeDropdown && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-4 z-50 animate-slide-up">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <Navigation className="w-3.5 h-3.5 text-emerald-500" />
                    Tamil Nadu Hyperlocal Grid
                  </span>
                  <button
                    onClick={() => setShowPincodeDropdown(false)}
                    className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* District Filter Chips */}
                <div className="flex items-center gap-1.5 overflow-x-auto py-2.5 scrollbar-none">
                  {DISTRICTS.map((dist) => (
                    <button
                      key={dist}
                      onClick={() => setSelectedDistrict(dist)}
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold whitespace-nowrap transition ${
                        selectedDistrict === dist
                          ? 'bg-emerald-600 text-white shadow-sm'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                      }`}
                    >
                      {dist}
                    </button>
                  ))}
                </div>

                {/* Search Pincode / Area Input */}
                <input
                  type="text"
                  placeholder="Search area (e.g. Mylapore, Gandhipuram, 600017)..."
                  value={pincodeSearchQuery}
                  onChange={(e) => setPincodeSearchQuery(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 mb-2"
                />

                {/* Pincode List */}
                <div className="max-h-52 overflow-y-auto space-y-1 pr-1">
                  {filteredPincodes.map((pin) => (
                    <button
                      key={pin.pincode}
                      onClick={() => {
                        setSelectedPincode(pin);
                        setShowPincodeDropdown(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between transition ${
                        selectedPincode?.pincode === pin.pincode
                          ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-bold border border-emerald-500/30'
                          : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      <div>
                        <div className="font-semibold text-slate-900 dark:text-white">{pin.area}</div>
                        <div className="text-[10px] text-slate-400">{pin.district}</div>
                      </div>
                      <span className="font-mono text-[11px] font-bold bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-slate-600 dark:text-slate-300">
                        {pin.pincode}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Toggle Advanced Filters Button */}
          <button
            onClick={() => setShowFilterPanel(!showFilterPanel)}
            className={`px-4 py-3 rounded-2xl border text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition shrink-0 ${
              showFilterPanel || totalActiveFiltersCount > 0
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 border-slate-900 dark:border-white'
                : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-800 hover:bg-slate-50'
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>Precise Filters</span>
            {totalActiveFiltersCount > 0 && (
              <span className="w-5 h-5 rounded-full bg-emerald-500 text-white text-[10px] font-bold flex items-center justify-center">
                {totalActiveFiltersCount}
              </span>
            )}
          </button>

          {/* Precision Sorting Dropdown */}
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full md:w-auto px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-bold text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-emerald-500 shadow-sm appearance-none pr-8 cursor-pointer"
            >
              <option value="popular">Sort: Most Popular</option>
              <option value="price_low">Price: Low to High</option>
              <option value="price_high">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
              <option value="distance">Closest Distance</option>
              <option value="newest">Newest Arrivals</option>
            </select>
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

        </div>

        {/* Multi-Category Quick Selector Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          <button
            onClick={() => setSelectedCategories([])}
            className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition ${
              selectedCategories.length === 0
                ? 'bg-emerald-600 text-white shadow-md'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
            }`}
          >
            All Categories
          </button>
          {CATEGORIES.map((c) => {
            const isSelected = selectedCategories.includes(c);
            return (
              <button
                key={c}
                onClick={() => toggleCategory(c)}
                className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-md ring-2 ring-emerald-500/50'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                }`}
              >
                {isSelected && <Check className="w-3.5 h-3.5 text-emerald-400 dark:text-emerald-600" />}
                <span>{c}</span>
              </button>
            );
          })}
        </div>

        {/* Expandable Advanced Precision Filter Drawer / Panel */}
        {showFilterPanel && (
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl animate-slide-up space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-emerald-500" />
                <h3 className="font-display font-bold text-sm text-slate-900 dark:text-white">
                  Multi-Parametric Precision Filtering
                </h3>
              </div>
              <button
                onClick={resetFilters}
                className="text-xs font-bold text-slate-500 hover:text-emerald-600 flex items-center gap-1 transition"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset All</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              
              {/* 1. Price Range Bracket */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                  Daily Rental Rate: ₹{minPrice} - ₹{maxPrice}
                </label>
                <div className="space-y-3">
                  <input
                    type="range"
                    min="0"
                    max="5000"
                    step="100"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(Number(e.target.value))}
                    className="w-full accent-emerald-500 cursor-pointer"
                  />
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => { setMinPrice(0); setMaxPrice(500); }}
                      className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-[11px] font-bold text-slate-600 dark:text-slate-300 hover:bg-emerald-50 hover:text-emerald-600"
                    >
                      &lt; ₹500
                    </button>
                    <button
                      onClick={() => { setMinPrice(500); setMaxPrice(1500); }}
                      className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-[11px] font-bold text-slate-600 dark:text-slate-300 hover:bg-emerald-50 hover:text-emerald-600"
                    >
                      ₹500-1.5k
                    </button>
                    <button
                      onClick={() => { setMinPrice(1500); setMaxPrice(5000); }}
                      className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-[11px] font-bold text-slate-600 dark:text-slate-300 hover:bg-emerald-50 hover:text-emerald-600"
                    >
                      ₹1.5k+
                    </button>
                  </div>
                </div>
              </div>

              {/* 2. Hyperlocal Distance Radius from Selected TN Pincode */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                  Distance Radius: {radiusKm >= 100 ? 'All Tamil Nadu' : `Within ${radiusKm} km`}
                </label>
                <input
                  type="range"
                  min="5"
                  max="100"
                  step="5"
                  value={radiusKm}
                  onChange={(e) => setRadiusKm(Number(e.target.value))}
                  className="w-full accent-emerald-500 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400 font-semibold mt-1">
                  <span>5 km</span>
                  <span>25 km</span>
                  <span>50 km</span>
                  <span>All TN</span>
                </div>
              </div>

              {/* 3. Multi-Condition Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                  Asset Condition (Multi-Select)
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {CONDITIONS.map((cond) => {
                    const isSelected = selectedConditions.includes(cond);
                    return (
                      <button
                        key={cond}
                        type="button"
                        onClick={() => toggleCondition(cond)}
                        className={`px-2.5 py-1 rounded-xl text-[11px] font-bold transition flex items-center gap-1 ${
                          isSelected
                            ? 'bg-emerald-600 text-white shadow-sm'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                        }`}
                      >
                        {isSelected && <Check className="w-3 h-3" />}
                        <span>{cond}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 4. Logistics, Trust & Minimum Rating */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Logistics & Trust
                </label>
                <div className="flex flex-col gap-1.5">
                  <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-700 dark:text-slate-300 font-medium">
                    <input
                      type="checkbox"
                      checked={deliveryOnly}
                      onChange={(e) => setDeliveryOnly(e.target.checked)}
                      className="rounded text-emerald-600 focus:ring-emerald-500"
                    />
                    <Truck className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Doorstep Delivery Available</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-700 dark:text-slate-300 font-medium">
                    <input
                      type="checkbox"
                      checked={verifiedOnly}
                      onChange={(e) => setVerifiedOnly(e.target.checked)}
                      className="rounded text-emerald-600 focus:ring-emerald-500"
                    />
                    <ShieldCheck className="w-3.5 h-3.5 text-blue-500" />
                    <span>Verified Owners Only</span>
                  </label>

                  <div className="flex items-center gap-1.5 pt-1">
                    <span className="text-[11px] font-bold text-slate-500">Min Rating:</span>
                    {[0, 3.5, 4.0, 4.5].map((rate) => (
                      <button
                        key={rate}
                        type="button"
                        onClick={() => setMinRating(rate)}
                        className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition flex items-center gap-0.5 ${
                          minRating === rate
                            ? 'bg-amber-400 text-slate-900 shadow-sm'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                        }`}
                      >
                        {rate === 0 ? 'All' : `${rate}★`}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* Active Applied Filters Chips Row */}
        {totalActiveFiltersCount > 0 && (
          <div className="flex items-center gap-2 flex-wrap pt-1">
            <span className="text-xs font-bold text-slate-400">Active filters:</span>

            {selectedPincode && (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                <MapPin className="w-3 h-3" />
                {selectedPincode.area} [{selectedPincode.pincode}]
              </span>
            )}

            {selectedCategories.map((cat) => (
              <span key={cat} className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                {cat}
                <button onClick={() => toggleCategory(cat)} className="hover:text-emerald-900">
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}

            {selectedConditions.map((cond) => (
              <span key={cond} className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                {cond}
                <button onClick={() => toggleCondition(cond)} className="hover:text-slate-900">
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}

            {deliveryOnly && (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                Doorstep Delivery
                <button onClick={() => setDeliveryOnly(false)}><X className="w-3 h-3" /></button>
              </span>
            )}

            {verifiedOnly && (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                Verified Only
                <button onClick={() => setVerifiedOnly(false)}><X className="w-3 h-3" /></button>
              </span>
            )}

            {minRating > 0 && (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300">
                {minRating}★ & Above
                <button onClick={() => setMinRating(0)}><X className="w-3 h-3" /></button>
              </span>
            )}

            <button
              onClick={resetFilters}
              className="text-xs font-bold text-red-600 dark:text-red-400 hover:underline ml-2"
            >
              Clear All
            </button>
          </div>
        )}

      </div>

      {/* Split Screen Layout: Listings Grid & Interactive Map */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Listings Grid (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold px-1">
            <span>
              {listings.length} verified listings in {selectedPincode ? selectedPincode.district : 'Tamil Nadu'}
            </span>
            <span className="capitalize">Order: {sortBy.replace('_', ' ')}</span>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-80 rounded-3xl bg-slate-200 dark:bg-slate-800 animate-pulse" />
              ))}
            </div>
          ) : listings.length === 0 ? (
            <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 shadow-sm">
              <Search className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="font-display font-bold text-lg text-slate-900 dark:text-white">
                No items match your precise filters
              </h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Try widening your distance radius or clearing some category tags to uncover more verified gear.
              </p>
              <button
                onClick={resetFilters}
                className="mt-4 px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold shadow-md hover:bg-emerald-700 transition"
              >
                Reset All Filters
              </button>
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

        {/* Right Column: Interactive Map with Navigation & TN Pincodes (5 cols sticky) */}
        <div className="lg:col-span-5 sticky top-28 h-[calc(100vh-140px)] min-h-[520px]">
          <GoogleMapSplitView
            listings={listings}
            selectedListing={selectedListing}
            onSelectListing={(item) => setSelectedListing(item)}
            activeOrigin={selectedPincode}
            onOriginChange={(newPin) => setSelectedPincode(newPin)}
            center={selectedPincode ? { lat: selectedPincode.lat, lng: selectedPincode.lng } : undefined}
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
