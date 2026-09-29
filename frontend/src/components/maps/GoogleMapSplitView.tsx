import React, { useState, useEffect, useRef } from 'react';
import {
  MapPin, Navigation, ZoomIn, ZoomOut, Layers, ExternalLink,
  Star, Compass, Car, ChevronRight, X, Clock, AlertCircle, CheckCircle2
} from 'lucide-react';
import { Listing, TamilNaduPincode, NavigationRoute } from '../../types';
import { api } from '../../services/api';

interface GoogleMapSplitViewProps {
  listings: Listing[];
  selectedListing?: Listing | null;
  onSelectListing: (listing: Listing) => void;
  center?: { lat: number; lng: number };
  activeOrigin?: TamilNaduPincode | null;
  onOriginChange?: (origin: TamilNaduPincode) => void;
}

const DEFAULT_ORIGIN: TamilNaduPincode = {
  pincode: '600017',
  area: 'T. Nagar (Thyagaraya Nagar)',
  district: 'Chennai',
  lat: 13.0418,
  lng: 80.2341
};

export const GoogleMapSplitView: React.FC<GoogleMapSplitViewProps> = ({
  listings,
  selectedListing,
  onSelectListing,
  center = { lat: 13.0827, lng: 80.2707 }, // Default Chennai
  activeOrigin,
  onOriginChange
}) => {
  const currentOrigin = activeOrigin || DEFAULT_ORIGIN;
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState<number>(12);
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';
  const [isGoogleLoaded, setIsGoogleLoaded] = useState<boolean>(false);

  // Navigation Route State
  const [isNavigating, setIsNavigating] = useState<boolean>(false);
  const [routeData, setRouteData] = useState<NavigationRoute | null>(null);
  const [navLoading, setNavLoading] = useState<boolean>(false);
  const [showPincodeSelector, setShowPincodeSelector] = useState<boolean>(false);
  const [availablePincodes, setAvailablePincodes] = useState<TamilNaduPincode[]>([]);

  // Fetch TN Pincodes for the in-map quick switcher
  useEffect(() => {
    api.getTamilNaduPincodes()
      .then(pins => setAvailablePincodes(pins))
      .catch(err => console.error("Failed to fetch TN pincodes for map:", err));
  }, []);

  // Request turn-by-turn route when navigation is triggered
  const startNavigation = async (targetListing: Listing) => {
    setIsNavigating(true);
    setNavLoading(true);
    try {
      const data = await api.getNavigationRoute(
        currentOrigin.lat,
        currentOrigin.lng,
        targetListing.latitude,
        targetListing.longitude
      );
      setRouteData(data);
    } catch (err) {
      console.error("Navigation routing error:", err);
      // Fallback route calculation
      const dist = Math.sqrt(
        Math.pow((targetListing.latitude - currentOrigin.lat) * 111, 2) +
        Math.pow((targetListing.longitude - currentOrigin.lng) * 111, 2)
      );
      setRouteData({
        distance_km: Math.round(dist * 10) / 10,
        eta_minutes: Math.max(12, Math.round(dist * 2.8)),
        traffic_condition: 'Moderate Flow • Optimal Arterial Route',
        waypoints: [
          { lat: currentOrigin.lat, lng: currentOrigin.lng },
          { lat: (currentOrigin.lat + targetListing.latitude) / 2 + 0.002, lng: (currentOrigin.lng + targetListing.longitude) / 2 - 0.002 },
          { lat: targetListing.latitude, lng: targetListing.longitude }
        ],
        directions: [
          `Depart from ${currentOrigin.area} [${currentOrigin.pincode}]`,
          `Proceed along connecting main road toward ${targetListing.location} (${(dist * 0.6).toFixed(1)} km)`,
          `Take access exit near ${targetListing.city}`,
          `Arrive at item location: ${targetListing.title}`
        ]
      });
    } finally {
      setNavLoading(false);
    }
  };

  // Automatically recalculate route if origin changes while navigating
  useEffect(() => {
    if (isNavigating && selectedListing) {
      startNavigation(selectedListing);
    }
  }, [currentOrigin.pincode]);

  // Load Google Maps script if API key is present
  useEffect(() => {
    if (!apiKey) return;
    if ((window as any).google && (window as any).google.maps) {
      setIsGoogleLoaded(true);
      return;
    }

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
    script.async = true;
    script.onload = () => setIsGoogleLoaded(true);
    document.head.appendChild(script);
  }, [apiKey]);

  // When real Google Maps is loaded
  useEffect(() => {
    if (!isGoogleLoaded || !mapContainerRef.current || !(window as any).google) return;

    const map = new (window as any).google.maps.Map(mapContainerRef.current, {
      center: { lat: currentOrigin.lat, lng: currentOrigin.lng },
      zoom,
      styles: [{ featureType: "poi", elementType: "labels", stylers: [{ visibility: "off" }] }]
    });

    // Add user origin marker
    new (window as any).google.maps.Marker({
      position: { lat: currentOrigin.lat, lng: currentOrigin.lng },
      map,
      title: `You: ${currentOrigin.area}`,
      icon: {
        path: (window as any).google.maps.SymbolPath.CIRCLE,
        scale: 8,
        fillColor: '#3b82f6',
        fillOpacity: 1,
        strokeColor: '#ffffff',
        strokeWeight: 3
      }
    });

    // Add listing markers
    listings.forEach((item) => {
      const marker = new (window as any).google.maps.Marker({
        position: { lat: item.latitude, lng: item.longitude },
        map,
        title: item.title,
        label: {
          text: `₹${item.price_per_day}`,
          color: "#ffffff",
          fontWeight: "bold",
          fontSize: "11px"
        }
      });

      marker.addListener("click", () => {
        onSelectListing(item);
      });
    });
  }, [isGoogleLoaded, listings, currentOrigin]);

  // Coordinate projections for custom interactive canvas map
  const originLat = currentOrigin.lat;
  const originLng = currentOrigin.lng;
  const deltaOriginLat = originLat - center.lat;
  const deltaOriginLng = originLng - center.lng;
  const originTopPercent = Math.max(8, Math.min(92, 50 - deltaOriginLat * 380));
  const originLeftPercent = Math.max(8, Math.min(92, 50 + deltaOriginLng * 380));

  // Selected listing projection
  let destTopPercent = 50;
  let destLeftPercent = 50;
  if (selectedListing) {
    const dLat = selectedListing.latitude - center.lat;
    const dLng = selectedListing.longitude - center.lng;
    destTopPercent = Math.max(8, Math.min(92, 50 - dLat * 380));
    destLeftPercent = Math.max(8, Math.min(92, 50 + dLng * 380));
  }

  // Google Maps external navigation URL
  const googleMapsUrl = selectedListing
    ? `https://www.google.com/maps/dir/?api=1&origin=${currentOrigin.lat},${currentOrigin.lng}&destination=${selectedListing.latitude},${selectedListing.longitude}`
    : '#';

  return (
    <div className="relative w-full h-full min-h-[520px] rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 shadow-inner">
      {/* If Google Maps API is loaded, show actual container */}
      {isGoogleLoaded ? (
        <div ref={mapContainerRef} className="w-full h-full" />
      ) : (
        /* High-Definition Interactive Vector Tamil Nadu Hyperlocal Map */
        <div className="relative w-full h-full bg-[#f1f5f9] dark:bg-[#0c1322] overflow-hidden select-none">
          {/* Subtle Grid Roads & Arterial Paths */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="road-grid" width="70" height="70" patternUnits="userSpaceOnUse">
                <path d="M 70 0 L 0 0 0 70" fill="none" stroke="currentColor" strokeWidth="1.2" className="text-slate-300 dark:text-slate-800/80" />
                <circle cx="70" cy="70" r="1.5" className="text-slate-400 dark:text-slate-700 fill-current" />
              </pattern>
              {/* Radial gradient glow for current origin */}
              <radialGradient id="origin-glow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.35" />
                <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
              </radialGradient>
              {/* Route line gradient */}
              <linearGradient id="route-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#3b82f6" />
                <stop offset="100%" stopColor="#10b981" />
              </linearGradient>
            </defs>
            <rect width="100%" height="100%" fill="url(#road-grid)" />

            {/* Arterial Highway Network Simulation */}
            <path d="M 0 180 Q 250 240 500 200 T 900 280" fill="none" stroke="rgba(148, 163, 184, 0.4)" strokeWidth="6" />
            <path d="M 120 0 Q 220 300 320 600 T 450 900" fill="none" stroke="rgba(148, 163, 184, 0.4)" strokeWidth="6" />
            <path d="M 400 0 Q 380 400 550 800" fill="none" stroke="rgba(148, 163, 184, 0.3)" strokeWidth="4" />

            {/* Coastal Water Bay path (representing Chennai Coastline / Marina / ECR) */}
            <path d="M 490 0 Q 460 300 520 800 L 900 800 L 900 0 Z" fill="rgba(16, 185, 129, 0.07)" />

            {/* Active Navigation Route Line (when navigating) */}
            {isNavigating && selectedListing && (
              <g className="transition-all duration-700 ease-out">
                {/* Outer route shadow/glow */}
                <path
                  d={`M ${originLeftPercent}% ${originTopPercent}% Q ${(originLeftPercent + destLeftPercent) / 2 + 5}% ${(originTopPercent + destTopPercent) / 2 - 5}% ${destLeftPercent}% ${destTopPercent}%`}
                  fill="none"
                  stroke="rgba(16, 185, 129, 0.25)"
                  strokeWidth="14"
                  strokeLinecap="round"
                />
                {/* Core route path with dash animation */}
                <path
                  d={`M ${originLeftPercent}% ${originTopPercent}% Q ${(originLeftPercent + destLeftPercent) / 2 + 5}% ${(originTopPercent + destTopPercent) / 2 - 5}% ${destLeftPercent}% ${destTopPercent}%`}
                  fill="none"
                  stroke="url(#route-gradient)"
                  strokeWidth="4"
                  strokeDasharray="6,4"
                  strokeLinecap="round"
                  className="animate-dash"
                />
              </g>
            )}
          </svg>

          {/* User's Current Origin Marker (Tamil Nadu Pincode Location) */}
          <div
            style={{ top: `${originTopPercent}%`, left: `${originLeftPercent}%` }}
            className="absolute -translate-x-1/2 -translate-y-1/2 z-30 pointer-events-auto"
            title={`Your Location: ${currentOrigin.area} (${currentOrigin.pincode})`}
          >
            {/* Pulsing Radar Ring */}
            <div className="absolute -inset-4 rounded-full bg-blue-500/20 animate-ping" />
            <div className="relative flex items-center justify-center w-8 h-8 rounded-full bg-blue-600 text-white shadow-lg border-2 border-white ring-4 ring-blue-500/30">
              <Navigation className="w-4 h-4 fill-white rotate-45" />
            </div>
            <div className="absolute top-9 left-1/2 -translate-x-1/2 whitespace-nowrap bg-blue-900/90 text-white px-2 py-0.5 rounded-full text-[10px] font-bold shadow-md">
              You • {currentOrigin.pincode}
            </div>
          </div>

          {/* Interactive Listing Markers */}
          <div className="absolute inset-0 pointer-events-auto">
            {listings.map((item, idx) => {
              const deltaLat = item.latitude - center.lat;
              const deltaLng = item.longitude - center.lng;
              const topPercent = Math.max(8, Math.min(92, 50 - deltaLat * 380));
              const leftPercent = Math.max(8, Math.min(92, 50 + deltaLng * 380));
              const isSelected = selectedListing?.id === item.id;

              return (
                <div
                  key={item.id || idx}
                  style={{ top: `${topPercent}%`, left: `${leftPercent}%` }}
                  onClick={() => onSelectListing(item)}
                  className={`absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all duration-300 z-10 hover:z-40 ${
                    isSelected ? 'scale-125 z-40' : 'hover:scale-110'
                  }`}
                >
                  <div
                    className={`px-3 py-1.5 rounded-full font-display font-extrabold text-xs shadow-elevated border flex items-center gap-1.5 transition ${
                      isSelected
                        ? 'bg-slate-900 text-white border-white ring-4 ring-emerald-500/50'
                        : 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white border-slate-200 dark:border-slate-700 hover:bg-emerald-600 hover:text-white'
                    }`}
                  >
                    <span className={`w-2 h-2 rounded-full ${isSelected ? 'bg-emerald-400 animate-ping' : 'bg-emerald-500'}`} />
                    <span>₹{item.price_per_day}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Turn-by-Turn Navigation Overlay / Drawer */}
          {isNavigating && routeData && (
            <div className="absolute top-16 left-4 right-4 sm:left-6 sm:right-auto sm:w-80 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl z-40 p-4 animate-slide-up">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400">
                    <Compass className="w-5 h-5 animate-spin" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">Active Navigation</h4>
                    <p className="text-[10px] text-slate-500">Live Tamil Nadu Road Matrix</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsNavigating(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Metrics Strip */}
              <div className="grid grid-cols-2 gap-2 my-3 py-2 px-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                <div>
                  <span className="text-[10px] font-semibold text-slate-400">Total Distance</span>
                  <p className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-1">
                    <Car className="w-3.5 h-3.5 text-blue-500" />
                    {routeData.distance_km} km
                  </p>
                </div>
                <div>
                  <span className="text-[10px] font-semibold text-slate-400">Est. Transit Time</span>
                  <p className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    ~{routeData.eta_minutes} mins
                  </p>
                </div>
              </div>

              {/* Turn-by-Turn Steps */}
              <div className="space-y-2 max-h-36 overflow-y-auto pr-1 text-xs">
                {routeData.directions.map((step, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-[11px] text-slate-700 dark:text-slate-300">
                    <span className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-600 font-bold text-[9px] flex items-center justify-center shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <span className="flex-1">{step}</span>
                  </div>
                ))}
              </div>

              {/* External Google Maps Button */}
              <a
                href={googleMapsUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-3 w-full py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 text-xs font-bold flex items-center justify-center gap-1.5 transition shadow-sm"
              >
                <span>Open in Google Maps GPS</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          )}

          {/* Selected Listing Floating Action Card */}
          {selectedListing && !isNavigating && (
            <div className="absolute bottom-5 left-4 right-4 sm:left-6 sm:right-6 max-w-md mx-auto bg-white/95 dark:bg-slate-900/95 backdrop-blur-md p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl z-30 animate-slide-up flex flex-col sm:flex-row gap-3">
              <img
                src={selectedListing.images[0]?.image_url || "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400"}
                alt={selectedListing.title}
                className="w-full sm:w-20 h-24 sm:h-20 rounded-xl object-cover shrink-0"
              />
              <div className="flex-1 min-w-0 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wide">
                      {selectedListing.category}
                    </span>
                    <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300 flex items-center gap-0.5">
                      <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                      {selectedListing.rating.toFixed(1)}
                    </span>
                  </div>
                  <h4 className="font-bold text-xs text-slate-900 dark:text-white truncate mt-0.5">
                    {selectedListing.title}
                  </h4>
                  <p className="text-[11px] text-slate-500 truncate">{selectedListing.location}</p>
                </div>

                <div className="flex items-center justify-between gap-2 mt-2">
                  <span className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400">
                    ₹{selectedListing.price_per_day} <span className="text-[10px] font-normal text-slate-400">/ day</span>
                  </span>

                  <button
                    onClick={() => startNavigation(selectedListing)}
                    className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 transition shadow-sm"
                  >
                    <Navigation className="w-3 h-3 rotate-45" />
                    <span>Navigate</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Top Left: Tamil Nadu Origin & Pincode Selector */}
      <div className="absolute top-4 left-4 z-20">
        <div className="relative">
          <button
            onClick={() => setShowPincodeSelector(!showPincodeSelector)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200 shadow-md hover:bg-slate-50 dark:hover:bg-slate-800 transition"
          >
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse" />
            <span className="truncate max-w-[140px] sm:max-w-[180px]">
              {currentOrigin.area} ({currentOrigin.pincode})
            </span>
            <ChevronRight className={`w-3.5 h-3.5 transition-transform ${showPincodeSelector ? 'rotate-90' : ''}`} />
          </button>

          {/* Quick Pincode Switcher Dropdown */}
          {showPincodeSelector && (
            <div className="absolute left-0 mt-2 w-72 max-h-64 overflow-y-auto bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl p-2 z-50 animate-slide-up">
              <div className="px-2 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Select Tamil Nadu Origin PIN
              </div>
              <div className="space-y-1 mt-1">
                {availablePincodes.slice(0, 15).map((pin) => (
                  <button
                    key={pin.pincode}
                    onClick={() => {
                      if (onOriginChange) onOriginChange(pin);
                      setShowPincodeSelector(false);
                    }}
                    className={`w-full text-left px-2.5 py-1.5 rounded-xl text-xs flex items-center justify-between transition ${
                      currentOrigin.pincode === pin.pincode
                        ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-bold'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <div className="truncate pr-2">
                      <span className="block truncate font-medium">{pin.area}</span>
                      <span className="text-[10px] text-slate-400">{pin.district}</span>
                    </div>
                    <span className="text-[11px] font-mono font-bold bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                      {pin.pincode}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Top Right: Zoom & Layer Controls */}
      <div className="absolute top-4 right-4 flex flex-col gap-1.5 z-20">
        <button
          onClick={() => setZoom(Math.min(zoom + 1, 18))}
          className="p-2.5 rounded-xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-md shadow-sm border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-800 transition"
          title="Zoom In"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={() => setZoom(Math.max(zoom - 1, 8))}
          className="p-2.5 rounded-xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-md shadow-sm border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-800 transition"
          title="Zoom Out"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
      </div>

      {/* Hyperlocal Radar Footnote */}
      <div className="absolute bottom-4 right-4 z-20 hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm text-[10px] font-medium text-slate-500 border border-slate-200 dark:border-slate-800">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
        <span>Live Tamil Nadu Hyperlocal Grid</span>
      </div>
    </div>
  );
};
