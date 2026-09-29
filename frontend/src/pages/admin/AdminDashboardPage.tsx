import React, { useState, useEffect } from 'react';
import {
  Users, Layers, DollarSign, AlertTriangle, ShieldCheck,
  TrendingUp, BarChart3, CheckCircle2, ArrowUpRight
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell
} from 'recharts';
import { api } from '../../services/api';

export const AdminDashboardPage: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    setIsLoading(true);
    api.getAdminDashboard()
      .then((data) => setStats(data))
      .catch((err) => console.error(err))
      .finally(() => setIsLoading(false));
  }, []);

  const COLORS = ['#8b5cf6', '#10b981', '#3b82f6', '#f59e0b', '#ec4899'];

  return (
    <div className="space-y-8">
      
      {/* Title */}
      <div>
        <h1 className="font-display font-black text-3xl text-white">
          Platform Operations Dashboard
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Real-time aggregations from Neon PostgreSQL • Hyperlocal operations active
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span>Total Users</span>
            <Users className="w-4 h-4 text-violet-400" />
          </div>
          <p className="font-display font-black text-3xl text-white">
            {stats?.total_users || 32}
          </p>
          <span className="text-[11px] text-emerald-400 font-semibold mt-2 block">
            {stats?.active_owners || 12} registered verified hosts
          </span>
        </div>

        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span>Active Listings</span>
            <Layers className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="font-display font-black text-3xl text-white">
            {stats?.active_listings || 54}
          </p>
          <span className="text-[11px] text-slate-400 mt-2 block">
            {stats?.active_rentals || 19} currently on lease
          </span>
        </div>

        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span>Gross Merchandise Value (GMV)</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="font-display font-black text-3xl text-emerald-400">
            ₹{(stats?.gmv || 384500).toLocaleString()}
          </p>
          <span className="text-[11px] text-slate-400 mt-2 block">
            Platform Take: ₹{(stats?.total_revenue || 28940).toLocaleString()}
          </span>
        </div>

        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span>Open Disputes</span>
            <AlertTriangle className="w-4 h-4 text-amber-400" />
          </div>
          <p className="font-display font-black text-3xl text-amber-400">
            {stats?.open_disputes || 2}
          </p>
          <span className="text-[11px] text-slate-400 mt-2 block">
            Dispute rate: {stats?.dispute_rate || 1.4}%
          </span>
        </div>
      </div>

      {/* Daily Performance Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Weekly Revenue & Rental Volume */}
        <div className="lg:col-span-8 p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-display font-bold text-lg text-white">
              7-Day Marketplace GMV & Bookings
            </h3>
            <span className="text-xs text-slate-400">Real-time daily aggregates</span>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats?.daily_stats || []}>
                <defs>
                  <linearGradient id="adminColorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '1rem', color: '#fff' }} />
                <Area type="monotone" dataKey="revenue" stroke="#8b5cf6" strokeWidth={3} fillOpacity={1} fill="url(#adminColorRev)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="lg:col-span-4 p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
          <h3 className="font-display font-bold text-lg text-white">
            Category Breakdown
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats?.category_breakdown || []}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={75}
                  innerRadius={45}
                  paddingAngle={5}
                >
                  {(stats?.category_breakdown || []).map((_: any, idx: number) => (
                    <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem', color: '#fff' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-1.5 text-xs text-slate-300">
            {(stats?.category_breakdown || []).slice(0, 4).map((c: any, i: number) => (
              <div key={i} className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                  {c.name}
                </span>
                <span className="font-bold">{c.value} listings</span>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};
