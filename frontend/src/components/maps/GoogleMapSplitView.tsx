import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Navigation, ZoomIn, ZoomOut, Layers, ExternalLink, Star } from 'lucide-react';
import { Listing } from '../../types';

interface GoogleMapSplitViewProps {
  listings: Listing[];
  selectedListing?: Listing | null;
  onSelectListing: (listing: Listing) => void;
  center?: { lat: number; lng: number };
}

export const GoogleMapSplitView: React.FC<GoogleMapSplitViewProps> = ({
  listings,
  selectedListing,
  onSelectListing,
  center = { lat: 13.0827, lng: 80.2707 } // Chennai default
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState<number>(12);
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';
  const [isGoogleLoaded, setIsGoogleLoaded] = useState<boolean>(false);

  // Load real Google Maps script if API key is provided
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
      center,
      zoom,
      styles: [
        {
          featureType: "poi",
          elementType: "labels",
          stylers: [{ visibility: "off" }]
        }
      ]
    });

    // Add markers
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
  }, [isGoogleLoaded, listings, center]);

  return (
    <div className="relative w-full h-full min-h-[500px] rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 shadow-inner">
      {/* If Google Maps API is loaded, show actual container */}
      {isGoogleLoaded ? (
        <div ref={mapContainerRef} className="w-full h-full" />
      ) : (
        /* Dynamic Vector City Map with Real Coordinate Projections */
        <div className="relative w-full h-full bg-[#e8ecef] dark:bg-[#131b2e] overflow-hidden select-none">
          {/* Subtle Grid Roads Simulation */}
          <svg className="absolute inset-0 w-full h-full opacity-35 dark:opacity-20" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="road-grid" width="80" height="80" patternUnits="userSpaceOnUse">
                <path d="M 80 0 L 0 0 0 80" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-slate-400 dark:text-slate-600" />
                <circle cx="80" cy="80" r="1.5" className="text-slate-500 fill-current" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#road-grid)" />
            {/* Coastal Water Wave Path representing Chennai Marina Beach shoreline */}
            <path d="M 450 0 Q 420 300 480 800 L 800 800 L 800 0 Z" fill="rgba(16, 185, 129, 0.08)" />
          </svg>

          {/* Interactive Marker Overlay */}
          <div className="absolute inset-0 pointer-events-auto">
            {listings.map((item, idx) => {
              // Coordinate projection offset relative to Chennai center (13.0827, 80.2707)
              const deltaLat = item.latitude - center.lat;
              const deltaLng = item.longitude - center.lng;
              const topPercent = Math.max(10, Math.min(88, 50 - deltaLat * 380));
              const leftPercent = Math.max(10, Math.min(88, 50 + deltaLng * 380));
              const isSelected = selectedListing?.id === item.id;

              return (
                <div
                  key={item.id || idx}
                  style={{ top: `${topPercent}%`, left: `${leftPercent}%` }}
                  onClick={() => onSelectListing(item)}
                  className={`absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all duration-300 z-10 hover:z-30 ${
                    isSelected ? 'scale-125 z-40' : 'hover:scale-110'
                  }`}
                >
                  <div
                    className={`px-3 py-1.5 rounded-full font-display font-extrabold text-xs shadow-elevated border flex items-center gap-1.5 transition ${
                      isSelected
                        ? 'bg-slate-900 text-white border-white ring-4 ring-emerald-500/40'
                        : 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white border-slate-200 dark:border-slate-700 hover:bg-emerald-600 hover:text-white'
                    }`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span>₹{item.price_per_day}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Selected Listing Popup Card on Map */}
          {selectedListing && (
            <div className="absolute bottom-6 left-6 right-6 max-w-sm mx-auto bg-white/95 dark:bg-slate-900/95 backdrop-blur-md p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl z-30 animate-slide-up flex gap-3">
              <img
                src={selectedListing.images[0]?.image_url || "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400"}
                alt={selectedListing.title}
                className="w-20 h-20 rounded-xl object-cover shrink-0"
              />
              <div className="flex-1 min-w-0">
                <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wide">
                  {selectedListing.category}
                </span>
                <h4 className="font-bold text-xs text-slate-900 dark:text-white truncate">
                  {selectedListing.title}
                </h4>
                <p className="text-[11px] text-slate-500 truncate mt-0.5">{selectedListing.location}</p>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400">
                    ₹{selectedListing.price_per_day} / day
                  </span>
                  <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300 flex items-center gap-0.5">
                    <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                    {selectedListing.rating.toFixed(1)}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Map Control Buttons */}
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

      {/* Hyperlocal Radar Badge */}
      <div className="absolute top-4 left-4 z-20 flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200 shadow-sm">
        <Navigation className="w-3.5 h-3.5 text-emerald-500 animate-spin" />
        <span>Hyperlocal Radar • Chennai Center</span>
      </div>
    </div>
  );
};
