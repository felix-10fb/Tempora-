import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  DollarSign, Package, TrendingUp, Star, PlusCircle,
  Clock, ArrowUpRight, CheckCircle2, ChevronRight, BarChart3
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar
} from 'recharts';
import { api } from '../services/api';
import { Listing, Booking } from '../types';

export const OwnerDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<any>(null);
  const [ownerListings, setOwnerListings] = useState<Listing[]>([]);
  const [ownerBookings, setOwnerBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    setIsLoading(true);
    Promise.all([
      api.getOwnerDashboard().catch(() => null),
      api.getOwnerListings().catch(() => []),
      api.getOwnerBookings().catch(() => [])
    ])
      .then(([dashStats, listings, bookings]) => {
        setStats(dashStats);
        setOwnerListings(listings);
        setOwnerBookings(bookings);
      })
      .finally(() => setIsLoading(false));
  }, []);

  const COLORS = ['#10b981', '#8b5cf6', '#3b82f6', '#f59e0b', '#ec4899'];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      
      {/* Top Banner with Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
            Owner Earnings & Fleet Management
          </span>
          <h1 className="font-display font-black text-3xl sm:text-4xl text-slate-900 dark:text-white mt-1">
            Owner Platform
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Monitor asset utilization, incoming rental requests, and escrow payouts.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/add-listing')}
            className="px-5 py-3 rounded-2xl font-extrabold text-xs text-white bg-emerald-600 hover:bg-emerald-500 shadow-glow-emerald transition flex items-center gap-2"
          >
            <PlusCircle className="w-4 h-4" />
            <span>List New Item</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="p-6 rounded-3xl glass-panel border border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-2">
            <span>Total Revenue</span>
            <DollarSign className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="font-display font-black text-3xl text-slate-900 dark:text-white">
            ₹{(stats?.total_revenue || 66000).toLocaleString()}
          </p>
          <span className="text-[11px] font-semibold text-emerald-600 flex items-center gap-1 mt-2">
            <TrendingUp className="w-3.5 h-3.5" /> +24% from last month
          </span>
        </div>

        <div className="p-6 rounded-3xl glass-panel border border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-2">
            <span>Active Listings</span>
            <Package className="w-4 h-4 text-violet-500" />
          </div>
          <p className="font-display font-black text-3xl text-slate-900 dark:text-white">
            {stats?.active_listings || ownerListings.length || 6}
          </p>
          <span className="text-[11px] text-slate-400 mt-2 block">
            {stats?.active_rentals || 4} currently out on rental
          </span>
        </div>

        <div className="p-6 rounded-3xl glass-panel border border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-2">
            <span>Asset Utilization</span>
            <BarChart3 className="w-4 h-4 text-blue-500" />
          </div>
          <p className="font-display font-black text-3xl text-slate-900 dark:text-white">
            {stats?.utilization_rate || 74.5}%
          </p>
          <span className="text-[11px] font-semibold text-emerald-600 mt-2 block">
            Optimal capital efficiency
          </span>
        </div>

        <div className="p-6 rounded-3xl glass-panel border border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-2">
            <span>Owner Rating</span>
            <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
          </div>
          <p className="font-display font-black text-3xl text-slate-900 dark:text-white">
            {stats?.average_rating || 4.9} / 5.0
          </p>
          <span className="text-[11px] text-emerald-600 font-semibold mt-2 block">
            Top 5% Superhost in Chennai
          </span>
        </div>
      </div>

      {/* Interactive Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Revenue Over Time Chart (8 Cols) */}
        <div className="lg:col-span-8 p-6 rounded-3xl glass-panel border border-slate-200 dark:border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-display font-bold text-lg text-slate-900 dark:text-white">
              Revenue Over Time
            </h3>
            <span className="text-xs text-slate-400">Monthly breakdown</span>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats?.revenue_chart || []}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="period" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} tickFormatter={(v) => `₹${v}`} />
                <Tooltip
                  formatter={(val: any) => [`₹${Number(val).toLocaleString()}`, 'Revenue']}
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '1rem', color: '#fff' }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Breakdown (4 Cols) */}
        <div className="lg:col-span-4 p-6 rounded-3xl glass-panel border border-slate-200 dark:border-slate-800 space-y-4">
          <h3 className="font-display font-bold text-lg text-slate-900 dark:text-white">
            Category Spread
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats?.category_distribution || [
                    { category: 'Furniture', count: 4 },
                    { category: 'Electronics', count: 2 },
                    { category: 'Cameras', count: 2 }
                  ]}
                  dataKey="count"
                  nameKey="category"
                  cx="50%"
                  cy="50%"
                  outerRadius={75}
                  innerRadius={45}
                  paddingAngle={5}
                >
                  {(stats?.category_distribution || [1, 2, 3]).map((_: any, idx: number) => (
                    <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem', color: '#fff' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
            {(stats?.category_distribution || []).map((cat: any, i: number) => (
              <div key={i} className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                  {cat.category}
                </span>
                <span className="font-bold">{cat.count} listings</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Owner Listings Table / Manager */}
      <div className="p-6 rounded-3xl glass-panel border border-slate-200 dark:border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-display font-bold text-lg text-slate-900 dark:text-white">
            Your Active Inventory ({ownerListings.length})
          </h3>
          <button
            onClick={() => navigate('/add-listing')}
            className="text-xs font-bold text-emerald-600 hover:underline"
          >
            + Add Another Listing
          </button>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {ownerListings.map((item) => (
            <div key={item.id} className="py-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <img
                  src={item.images[0]?.image_url || "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=200"}
                  alt={item.title}
                  className="w-16 h-16 rounded-2xl object-cover"
                />
                <div>
                  <span className="text-[10px] font-bold uppercase text-emerald-600">
                    {item.category} • {item.condition}
                  </span>
                  <h4 className="font-display font-bold text-sm text-slate-900 dark:text-white">
                    {item.title}
                  </h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    ₹{item.price_per_day} / day • ₹{item.price_per_month} / mo
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold">
                  {item.status}
                </span>
                <button
                  onClick={() => navigate(`/listing/${item.id}`)}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-900 dark:hover:text-white transition"
                >
                  <ArrowUpRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
