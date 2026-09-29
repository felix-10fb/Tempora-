import React, { useState, useEffect } from 'react';
import { MapPin, Layers, Package, AlertTriangle, Navigation, Star } from 'lucide-react';
import { api } from '../../services/api';

export const AdminMapPage: React.FC = () => {
  const [mapData, setMapData] = useState<any>(null);
  const [filterType, setFilterType] = useState<string>('ALL');
  const [selectedEntity, setSelectedEntity] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    setIsLoading(true);
    api.getAdminMapData()
      .then((data) => setMapData(data))
      .catch((err) => console.error(err))
      .finally(() => setIsLoading(false));
  }, []);

  const center = mapData?.center || { lat: 13.0827, lng: 80.2707 };

  const listings = mapData?.listings || [];
  const rentals = mapData?.active_rentals || [];
  const disputes = mapData?.disputes || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-black text-3xl text-white">
            Hyperlocal Operations Live Map
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time geospatial visualization of active equipment, underway courier deliveries, and open claim zones.
          </p>
        </div>

        {/* Filter Chips */}
        <div className="flex items-center gap-2">
          {['ALL', 'LISTINGS', 'RENTALS', 'DISPUTES'].map((f) => (
            <button
              key={f}
              onClick={() => setFilterType(f)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                filterType === f
                  ? 'bg-violet-600 text-white shadow-glow-violet'
                  : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Map Canvas Container */}
      <div className="relative w-full h-[650px] rounded-3xl overflow-hidden border border-slate-800 bg-[#0d1322] shadow-2xl select-none">
        
        {/* Vector Background Grid Roads */}
        <svg className="absolute inset-0 w-full h-full opacity-30" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="admin-road-grid" width="70" height="70" patternUnits="userSpaceOnUse">
              <path d="M 70 0 L 0 0 0 70" fill="none" stroke="#334155" strokeWidth="2" />
              <circle cx="70" cy="70" r="1.5" fill="#475569" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#admin-road-grid)" />
          <path d="M 520 0 Q 480 350 560 800 L 800 800 L 800 0 Z" fill="rgba(139, 92, 246, 0.08)" />
        </svg>

        {/* Live Radar Sweep Badge */}
        <div className="absolute top-4 left-4 z-20 flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-slate-900/90 backdrop-blur-md border border-slate-800 text-xs font-semibold text-white shadow-lg">
          <Navigation className="w-3.5 h-3.5 text-violet-400 animate-spin" />
          <span>Active Fleet Coordinates • Greater Chennai Grid</span>
        </div>

        {/* Live Marker Layer */}
        <div className="absolute inset-0 pointer-events-auto">
          {/* 1. Listings */}
          {(filterType === 'ALL' || filterType === 'LISTINGS') &&
            listings.map((l: any, i: number) => {
              const deltaLat = l.lat - center.lat;
              const deltaLng = l.lng - center.lng;
              const top = Math.max(10, Math.min(88, 50 - deltaLat * 380));
              const left = Math.max(10, Math.min(88, 50 + deltaLng * 380));

              return (
                <div
                  key={`l-${i}`}
                  style={{ top: `${top}%`, left: `${left}%` }}
                  onClick={() => setSelectedEntity({ ...l, markerCategory: 'Listing' })}
                  className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer hover:scale-125 transition z-10"
                >
                  <div className="px-2.5 py-1 rounded-full bg-emerald-600 text-white font-extrabold text-[10px] shadow-glow-emerald border border-emerald-400/40 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                    <span>₹{l.price_per_day}</span>
                  </div>
                </div>
              );
            })}

          {/* 2. Active Rentals */}
          {(filterType === 'ALL' || filterType === 'RENTALS') &&
            rentals.map((r: any, i: number) => {
              const deltaLat = r.lat - center.lat;
              const deltaLng = r.lng - center.lng;
              const top = Math.max(10, Math.min(88, 50 - deltaLat * 380));
              const left = Math.max(10, Math.min(88, 50 + deltaLng * 380));

              return (
                <div
                  key={`r-${i}`}
                  style={{ top: `${top}%`, left: `${left}%` }}
                  onClick={() => setSelectedEntity({ ...r, markerCategory: 'Active Rental' })}
                  className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer hover:scale-125 transition z-15"
                >
                  <div className="px-2.5 py-1 rounded-full bg-violet-600 text-white font-extrabold text-[10px] shadow-glow-violet border border-violet-400/40 flex items-center gap-1">
                    <Package className="w-3 h-3" />
                    <span>On Lease ({r.days_left}d left)</span>
                  </div>
                </div>
              );
            })}

          {/* 3. Disputes */}
          {(filterType === 'ALL' || filterType === 'DISPUTES') &&
            disputes.map((d: any, i: number) => {
              const deltaLat = d.lat - center.lat;
              const deltaLng = d.lng - center.lng;
              const top = Math.max(10, Math.min(88, 50 - deltaLat * 380));
              const left = Math.max(10, Math.min(88, 50 + deltaLng * 380));

              return (
                <div
                  key={`d-${i}`}
                  style={{ top: `${top}%`, left: `${left}%` }}
                  onClick={() => setSelectedEntity({ ...d, markerCategory: 'Dispute' })}
                  className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer hover:scale-125 transition z-20"
                >
                  <div className="px-2.5 py-1 rounded-full bg-red-600 text-white font-extrabold text-[10px] shadow-lg border border-red-400 flex items-center gap-1 animate-pulse">
                    <AlertTriangle className="w-3 h-3" />
                    <span>Open Claim</span>
                  </div>
                </div>
              );
            })}
        </div>

        {/* Selected Entity Inspector Panel */}
        {selectedEntity && (
          <div className="absolute bottom-6 left-6 max-w-sm w-full bg-slate-900/95 backdrop-blur-md p-4 rounded-3xl border border-slate-800 shadow-2xl z-30 animate-slide-up space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-violet-400">
                {selectedEntity.markerCategory}
              </span>
              <button
                onClick={() => setSelectedEntity(null)}
                className="text-slate-400 hover:text-white text-xs"
              >
                ✕
              </button>
            </div>
            <h4 className="font-display font-bold text-sm text-white truncate">
              {selectedEntity.title}
            </h4>
            <div className="text-xs text-slate-300">
              {selectedEntity.category && <p>Category: {selectedEntity.category}</p>}
              {selectedEntity.price_per_day && <p className="font-bold text-emerald-400">₹{selectedEntity.price_per_day} / day</p>}
              {selectedEntity.renter && <p>Renter: {selectedEntity.renter}</p>}
              {selectedEntity.raised_by && <p className="text-red-400">Claimant: {selectedEntity.raised_by}</p>}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
