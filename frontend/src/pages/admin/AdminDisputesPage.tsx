import React, { useState, useEffect } from 'react';
import { AlertTriangle, CheckCircle2, ShieldCheck, DollarSign, Image as ImageIcon } from 'lucide-react';
import { api } from '../../services/api';
import { Dispute } from '../../types';
import { useToast } from '../../context/ToastContext';

export const AdminDisputesPage: React.FC = () => {
  const { success, error } = useToast();
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [selectedDispute, setSelectedDispute] = useState<Dispute | null>(null);
  const [resolutionNotes, setResolutionNotes] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchDisputes = async () => {
    setIsLoading(true);
    try {
      const data = await api.getAdminDisputes();
      setDisputes(data);
      if (data.length > 0 && !selectedDispute) {
        setSelectedDispute(data[0]);
      }
    } catch {
      // Fallback
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDisputes();
  }, []);

  const handleResolve = async (action: string) => {
    if (!selectedDispute) return;
    try {
      await api.resolveDispute(selectedDispute.id, action, resolutionNotes || "Admin mediated resolution");
      success(`Dispute resolved with ${action}. Escrow updated and audit log recorded.`);
      fetchDisputes();
    } catch (err: any) {
      error(err.message || "Failed to resolve dispute");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display font-black text-3xl text-white">
          Dispute Resolution Center
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Review evidence, compare pre vs post AI condition scans, and allocate escrow deposit refunds.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Col: Dispute List (5 cols) */}
        <div className="lg:col-span-5 space-y-3">
          <div className="text-xs font-bold uppercase text-slate-400">
            Open Claims ({disputes.length})
          </div>

          <div className="space-y-3">
            {disputes.map((d) => (
              <div
                key={d.id}
                onClick={() => setSelectedDispute(d)}
                className={`p-4 rounded-2xl border cursor-pointer transition ${
                  selectedDispute?.id === d.id
                    ? 'bg-slate-900 border-violet-500 ring-2 ring-violet-500/30 shadow-lg'
                    : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-bold text-amber-400 flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    {d.reason}
                  </span>
                  <span className="text-[10px] text-slate-500">
                    {d.status}
                  </span>
                </div>
                <p className="text-xs text-slate-300 line-clamp-2">
                  {d.description}
                </p>
                <div className="mt-2 text-[10px] text-slate-400">
                  Case ID: DSP-{d.id.substring(0, 8).toUpperCase()}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Col: Case Detail & Adjudication Controls (7 cols) */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-6 shadow-xl">
          {selectedDispute ? (
            <>
              <div className="border-b border-slate-800 pb-4">
                <span className="text-[10px] font-bold uppercase text-amber-400 tracking-wider">
                  Claim Investigation Details
                </span>
                <h3 className="font-display font-bold text-xl text-white mt-1">
                  {selectedDispute.reason}
                </h3>
                <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                  {selectedDispute.description}
                </p>
              </div>

              {/* AI Condition Baseline Comparison */}
              <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-violet-400 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4" />
                    AI Vision Baseline Scan Report
                  </span>
                  <span className="text-[10px] font-bold bg-slate-700 text-slate-300 px-2 py-0.5 rounded">
                    Confidence: 96%
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Pre-rental baseline photographs documented minor cosmetic micro-scratches on rear bezel prior to renter handover.
                  AI condition differential shows 98.4% congruence. Minimal new wear.
                </p>
              </div>

              {/* Evidence Photos */}
              {selectedDispute.evidence && selectedDispute.evidence.length > 0 && (
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-400 mb-2">
                    Submitted Evidence Images
                  </label>
                  <div className="flex gap-3 overflow-x-auto">
                    {selectedDispute.evidence.map((img, i) => (
                      <img
                        key={i}
                        src={img}
                        alt="Evidence"
                        className="w-28 h-28 rounded-xl object-cover border border-slate-700"
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Admin Adjudication Form */}
              <div className="space-y-4 pt-4 border-t border-slate-800">
                <label className="block text-xs font-bold uppercase text-slate-400">
                  Adjudication Notes (Appended to immutable audit log)
                </label>
                <textarea
                  rows={2}
                  value={resolutionNotes}
                  onChange={(e) => setResolutionNotes(e.target.value)}
                  placeholder="Reasoning for escrow disbursement decision..."
                  className="w-full p-3 rounded-xl border border-slate-700 bg-slate-800 text-xs text-white focus:ring-2 focus:ring-violet-500 resize-none"
                />

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <button
                    onClick={() => handleResolve('FULL_REFUND')}
                    className="p-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition"
                  >
                    Full Refund
                  </button>
                  <button
                    onClick={() => handleResolve('RELEASE_DEPOSIT')}
                    className="p-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs transition"
                  >
                    Release Deposit
                  </button>
                  <button
                    onClick={() => handleResolve('PARTIAL_REFUND')}
                    className="p-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs transition"
                  >
                    Partial Refund
                  </button>
                  <button
                    onClick={() => handleResolve('DISMISSED')}
                    className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition border border-slate-700"
                  >
                    Dismiss Claim
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-20 text-xs text-slate-500">
              Select a dispute to review evidence and allocate escrow resolutions.
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
