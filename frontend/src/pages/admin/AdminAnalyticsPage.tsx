import React, { useState } from 'react';
import { BarChart3, TrendingUp, Users, DollarSign, Calendar, RefreshCw } from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  BarChart, Bar, LineChart, Line
} from 'recharts';

export const AdminAnalyticsPage: React.FC = () => {
  const [timeRange, setTimeRange] = useState<string>('30d');

  const metricsData = [
    { name: 'Daily Active Users (DAU)', val: '1,420', change: '+18%' },
    { name: 'Monthly Active Users (MAU)', val: '14,890', change: '+32%' },
    { name: 'Avg. Rental Duration', val: '14.2 Days', change: '+2.1d' },
    { name: 'Avg. Order Value (AOV)', val: '₹3,450', change: '+₹380' },
    { name: 'Repeat Customer Rate', val: '32.4%', change: '+4.2%' },
    { name: 'Dispute Rate', val: '1.4%', change: '-0.3%' },
    { name: 'Item Utilization Rate', val: '74.5%', change: '+8.1%' },
    { name: 'Gross Margin', val: '94.2%', change: '+1.0%' },
  ];

  const gmvGrowthData = [
    { period: 'Week 1', gmv: 85000, revenue: 6800, activeRentals: 42 },
    { period: 'Week 2', gmv: 112000, revenue: 8960, activeRentals: 58 },
    { period: 'Week 3', gmv: 145000, revenue: 11600, activeRentals: 74 },
    { period: 'Week 4', gmv: 198000, revenue: 15840, activeRentals: 96 },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-black text-3xl text-white">
            Marketplace Analytics & Growth
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Aggregated operational cohort metrics derived from PostgreSQL bookings and user lifecycle logs.
          </p>
        </div>

        {/* Time Filter */}
        <div className="flex items-center gap-2 bg-slate-900 p-1.5 rounded-2xl border border-slate-800">
          {['7d', '30d', '90d', '1y'].map((t) => (
            <button
              key={t}
              onClick={() => setTimeRange(t)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition uppercase ${
                timeRange === t
                  ? 'bg-violet-600 text-white shadow-glow-violet'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* 8-KPI Operational Matrix */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {metricsData.map((m, i) => (
          <div key={i} className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
            <span className="text-[11px] font-semibold text-slate-400 block truncate">{m.name}</span>
            <p className="font-display font-black text-2xl text-white">{m.val}</p>
            <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" /> {m.change}
            </span>
          </div>
        ))}
      </div>

      {/* Deep Chart */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-display font-bold text-lg text-white">
            Weekly GMV & Active Equipment Deployment
          </h3>
          <span className="text-xs text-slate-400">Total transaction velocity</span>
        </div>

        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={gmvGrowthData}>
              <XAxis dataKey="period" stroke="#64748b" fontSize={11} />
              <YAxis stroke="#64748b" fontSize={11} tickFormatter={(v) => `₹${v}`} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '1rem', color: '#fff' }}
                formatter={(val: any) => [`₹${Number(val).toLocaleString()}`, 'Amount']}
              />
              <Bar dataKey="gmv" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
              <Bar dataKey="revenue" fill="#10b981" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
};
