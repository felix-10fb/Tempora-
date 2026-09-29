import React, { useState, useEffect } from 'react';
import { Layers, Check, X, ShieldAlert, ArrowUpRight } from 'lucide-react';
import { api } from '../../services/api';
import { Listing } from '../../types';
import { useToast } from '../../context/ToastContext';

export const AdminListingsPage: React.FC = () => {
  const { success, error } = useToast();
  const [listings, setListings] = useState<Listing[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchListings = async () => {
    setIsLoading(true);
    try {
      const data = await api.getAdminListings(statusFilter || undefined);
      setListings(data);
    } catch {
      // Fallback
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchListings();
  }, [statusFilter]);

  const handleModeration = async (listingId: string, action: string) => {
    try {
      await api.moderateListing(listingId, action);
      success(`Listing updated to ${action}`);
      fetchListings();
    } catch (err: any) {
      error(err.message || "Failed to update listing");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display font-black text-3xl text-white">
          Listing Moderation Queue
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Review community submissions, inspect safety compliance, and approve/suspend listings.
        </p>
      </div>

      <div className="flex gap-2">
        {['', 'APPROVED', 'PENDING', 'SUSPENDED'].map((st) => (
          <button
            key={st}
            onClick={() => setStatusFilter(st)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
              statusFilter === st
                ? 'bg-violet-600 text-white shadow-glow-violet'
                : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            {st ? st : 'All Statuses'}
          </button>
        ))}
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-800/60 uppercase tracking-wider text-[10px] text-slate-400 border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Item</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Rates</th>
                <th className="py-3 px-4">Deposit</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Moderation Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {listings.map((item) => (
                <tr key={item.id} className="hover:bg-slate-800/40 transition">
                  <td className="py-3.5 px-4 flex items-center gap-3">
                    <img
                      src={item.images[0]?.image_url || "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=200"}
                      alt=""
                      className="w-10 h-10 rounded-xl object-cover shrink-0"
                    />
                    <div>
                      <p className="font-bold text-white truncate max-w-xs">{item.title}</p>
                      <p className="text-[10px] text-slate-400">{item.location}</p>
                    </div>
                  </td>
                  <td className="py-3.5 px-4">{item.category}</td>
                  <td className="py-3.5 px-4 font-bold text-emerald-400">₹{item.price_per_day} / day</td>
                  <td className="py-3.5 px-4">₹{item.security_deposit}</td>
                  <td className="py-3.5 px-4">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      item.status === 'APPROVED'
                        ? 'bg-emerald-950 text-emerald-300'
                        : item.status === 'SUSPENDED'
                        ? 'bg-red-950 text-red-300'
                        : 'bg-amber-950 text-amber-300'
                    }`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right space-x-2">
                    {item.status !== 'APPROVED' && (
                      <button
                        onClick={() => handleModeration(item.id, 'APPROVE')}
                        className="px-2.5 py-1 rounded-lg bg-emerald-600/30 text-emerald-300 hover:bg-emerald-600 hover:text-white transition font-bold text-[10px]"
                      >
                        Approve
                      </button>
                    )}
                    {item.status !== 'SUSPENDED' && (
                      <button
                        onClick={() => handleModeration(item.id, 'SUSPEND')}
                        className="px-2.5 py-1 rounded-lg bg-red-600/30 text-red-300 hover:bg-red-600 hover:text-white transition font-bold text-[10px]"
                      >
                        Suspend
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
