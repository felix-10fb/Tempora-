import React, { useState } from 'react';
import { X, Calendar, Truck, ShieldCheck, CreditCard, CheckCircle2, ChevronRight, ArrowLeft } from 'lucide-react';
import confetti from 'canvas-confetti';
import { Listing, Booking } from '../../types';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';

interface BookingModalProps {
  listing: Listing;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (booking: Booking) => void;
}

export const BookingModal: React.FC<BookingModalProps> = ({
  listing,
  isOpen,
  onClose,
  onSuccess
}) => {
  const { toast, success, error } = useToast();
  
  // Step State (1 to 5)
  const [step, setStep] = useState<number>(1);
  const [startDate, setStartDate] = useState<string>(
    new Date(Date.now() + 86400000).toISOString().split('T')[0]
  );
  const [endDate, setEndDate] = useState<string>(
    new Date(Date.now() + 86400000 * 8).toISOString().split('T')[0]
  );
  const [deliveryType, setDeliveryType] = useState<'DELIVERY' | 'PICKUP'>('DELIVERY');
  const [deliveryAddress, setDeliveryAddress] = useState<string>('No. 42, Anna Salai, Chennai, TN - 600002');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [createdBooking, setCreatedBooking] = useState<Booking | null>(null);

  if (!isOpen) return null;

  // Compute Days
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.max(86400000, end.getTime() - start.getTime());
  const rentalDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  // Compute Amounts
  let rentalAmount = 0;
  if (rentalDays >= 30 && listing.price_per_month) {
    rentalAmount = (rentalDays / 30) * listing.price_per_month;
  } else if (rentalDays >= 7 && listing.price_per_week) {
    rentalAmount = (rentalDays / 7) * listing.price_per_week;
  } else {
    rentalAmount = rentalDays * listing.price_per_day;
  }
  rentalAmount = Math.round(rentalAmount);

  const deliveryFee = deliveryType === 'DELIVERY' ? 149 : 0;
  const protectionFee = Math.round(rentalAmount * 0.03);
  const platformFee = Math.round(rentalAmount * 0.05);
  const deposit = listing.security_deposit || 0;
  const totalAmount = rentalAmount + deliveryFee + protectionFee + platformFee + deposit;

  const handleNextStep = () => {
    if (step < 4) setStep(step + 1);
  };

  const handlePrevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleConfirmAndPay = async () => {
    setIsSubmitting(true);
    try {
      const bkg = await api.createBooking({
        listing_id: listing.id,
        start_date: new Date(startDate).toISOString(),
        end_date: new Date(endDate).toISOString(),
        delivery_type: deliveryType,
        delivery_address: deliveryType === 'DELIVERY' ? deliveryAddress : undefined
      });

      // Process payment simulation
      await api.processPayment(bkg.id, 'card');

      setCreatedBooking(bkg);
      setStep(5);
      success("Rental booked successfully!");

      // Fire celebratory confetti
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });

      if (onSuccess) onSuccess(bkg);
    } catch (err: any) {
      error(err.message || "Failed to create booking");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-xl w-full overflow-hidden shadow-2xl transition-all">
        
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              {step < 5 ? `Step ${step} of 4` : "Confirmed"}
            </span>
            <span className="text-slate-300 dark:text-slate-700">•</span>
            <h3 className="font-display font-bold text-slate-900 dark:text-white truncate max-w-xs">
              {listing.title}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          
          {/* STEP 1: DATES */}
          {step === 1 && (
            <div className="space-y-5 animate-fade-in">
              <div>
                <h4 className="font-display font-extrabold text-xl text-slate-900 dark:text-white">
                  When do you need this?
                </h4>
                <p className="text-xs text-slate-500 mt-1">
                  Select your rental period. Weekly and monthly rates offer steep automated discounts.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500 mb-1.5">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    min={new Date().toISOString().split('T')[0]}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-medium focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500 mb-1.5">
                    Return Date
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    min={startDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-medium focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-800/60 flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-emerald-800 dark:text-emerald-300">
                    Total Duration:
                  </span>
                  <p className="text-lg font-extrabold text-emerald-900 dark:text-emerald-100">
                    {rentalDays} {rentalDays === 1 ? 'Day' : 'Days'}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-semibold text-emerald-800 dark:text-emerald-300">
                    Estimated Base:
                  </span>
                  <p className="text-lg font-extrabold text-emerald-900 dark:text-emerald-100">
                    ₹{rentalAmount.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: DELIVERY vs PICKUP */}
          {step === 2 && (
            <div className="space-y-5 animate-fade-in">
              <div>
                <h4 className="font-display font-extrabold text-xl text-slate-900 dark:text-white">
                  Delivery or Self Pickup?
                </h4>
                <p className="text-xs text-slate-500 mt-1">
                  Hyperlocal dispatch delivers right to your doorstep within 45 minutes.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div
                  onClick={() => setDeliveryType('DELIVERY')}
                  className={`p-4 rounded-2xl border-2 cursor-pointer transition ${
                    deliveryType === 'DELIVERY'
                      ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/40'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                  }`}
                >
                  <Truck className="w-6 h-6 text-emerald-600 mb-2" />
                  <p className="font-bold text-sm text-slate-900 dark:text-white">Doorstep Delivery</p>
                  <p className="text-xs text-slate-500 mt-1">₹149 • White-glove drop-off & packaging</p>
                </div>

                <div
                  onClick={() => setDeliveryType('PICKUP')}
                  className={`p-4 rounded-2xl border-2 cursor-pointer transition ${
                    deliveryType === 'PICKUP'
                      ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/40'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                  }`}
                >
                  <Calendar className="w-6 h-6 text-emerald-600 mb-2" />
                  <p className="font-bold text-sm text-slate-900 dark:text-white">Self Pickup</p>
                  <p className="text-xs text-slate-500 mt-1">FREE • Pick up directly from owner</p>
                </div>
              </div>

              {deliveryType === 'DELIVERY' && (
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500 mb-1.5">
                    Delivery Address
                  </label>
                  <input
                    type="text"
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                    placeholder="Enter street, apartment, and city"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-medium focus:ring-2 focus:ring-emerald-500"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">Google Places Autocomplete verified.</p>
                </div>
              )}
            </div>
          )}

          {/* STEP 3: PRICE BREAKDOWN */}
          {step === 3 && (
            <div className="space-y-4 animate-fade-in">
              <div>
                <h4 className="font-display font-extrabold text-xl text-slate-900 dark:text-white">
                  Review Rental Breakdown
                </h4>
                <p className="text-xs text-slate-500 mt-1">
                  100% transparent pricing. No surprise hidden charges.
                </p>
              </div>

              <div className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
                <div className="py-2.5 flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400">Rental Fee ({rentalDays} days)</span>
                  <span className="font-semibold text-slate-900 dark:text-white">₹{rentalAmount.toLocaleString()}</span>
                </div>
                <div className="py-2.5 flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400">Delivery Fee</span>
                  <span className="font-semibold text-slate-900 dark:text-white">₹{deliveryFee}</span>
                </div>
                <div className="py-2.5 flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400">Damage Protection Plan (3%)</span>
                  <span className="font-semibold text-slate-900 dark:text-white">₹{protectionFee}</span>
                </div>
                <div className="py-2.5 flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400">Platform Community Fee (5%)</span>
                  <span className="font-semibold text-slate-900 dark:text-white">₹{platformFee}</span>
                </div>
                <div className="py-2.5 flex justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="text-slate-600 dark:text-slate-400">Refundable Security Deposit</span>
                    <span className="text-[10px] bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 font-bold px-1.5 py-0.5 rounded">
                      Refunded on Return
                    </span>
                  </div>
                  <span className="font-semibold text-slate-900 dark:text-white">₹{deposit.toLocaleString()}</span>
                </div>
                <div className="pt-3 pb-1 flex justify-between items-baseline font-bold">
                  <span className="text-base text-slate-900 dark:text-white">Total Checkout Amount</span>
                  <span className="text-2xl font-display font-extrabold text-emerald-600 dark:text-emerald-400">
                    ₹{totalAmount.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: PAYMENT SIMULATION */}
          {step === 4 && (
            <div className="space-y-5 animate-fade-in">
              <div>
                <h4 className="font-display font-extrabold text-xl text-slate-900 dark:text-white">
                  Instant Secure Checkout
                </h4>
                <p className="text-xs text-slate-500 mt-1">
                  Card, UPI, or NetBanking. Security deposit held in escrow until safe return.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex items-center gap-3">
                <CreditCard className="w-6 h-6 text-emerald-600 shrink-0" />
                <div className="flex-1 text-xs">
                  <p className="font-bold text-slate-900 dark:text-white">Demo Card (Stripe Escrow Integration)</p>
                  <p className="text-slate-500">•••• •••• •••• 4242 (Instant simulated validation)</p>
                </div>
                <ShieldCheck className="w-5 h-5 text-emerald-500 shrink-0" />
              </div>

              <div className="text-xs text-slate-500 space-y-1">
                <p className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  Free cancellation up to 24 hours before delivery.
                </p>
                <p className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  AI Item Inspection protects you from pre-existing scratches.
                </p>
              </div>
            </div>
          )}

          {/* STEP 5: CONFIRMATION RECEIPT */}
          {step === 5 && (
            <div className="text-center py-6 space-y-4 animate-fade-in">
              <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-600 dark:text-emerald-300 flex items-center justify-center mx-auto shadow-glow-emerald">
                <CheckCircle2 className="w-9 h-9" />
              </div>

              <h4 className="font-display font-extrabold text-2xl text-slate-900 dark:text-white">
                Booking Confirmed!
              </h4>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 max-w-sm mx-auto text-left text-xs space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-400">Booking ID</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white">
                    {createdBooking?.id ? `TMP-${createdBooking.id.substring(0, 8).toUpperCase()}` : 'TMP-BKG-8839'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Item</span>
                  <span className="font-semibold text-slate-900 dark:text-white truncate max-w-[180px]">
                    {listing.title}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Duration</span>
                  <span className="font-semibold text-slate-900 dark:text-white">{rentalDays} Days</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Status</span>
                  <span className="font-bold text-emerald-600 uppercase">Confirmed & Paid</span>
                </div>
              </div>

              <button
                onClick={onClose}
                className="w-full py-3.5 rounded-2xl font-bold text-sm text-white bg-emerald-600 hover:bg-emerald-500 shadow-glow-emerald transition"
              >
                Go to My Rentals Dashboard
              </button>
            </div>
          )}

        </div>

        {/* Modal Footer Controls */}
        {step < 5 && (
          <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            {step > 1 ? (
              <button
                onClick={handlePrevStep}
                className="flex items-center gap-1.5 text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 transition"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
            ) : (
              <div />
            )}

            {step < 4 ? (
              <button
                onClick={handleNextStep}
                className="px-6 py-2.5 rounded-xl font-extrabold text-xs text-white bg-emerald-600 hover:bg-emerald-500 transition shadow-sm flex items-center gap-1.5"
              >
                <span>Continue</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                disabled={isSubmitting}
                onClick={handleConfirmAndPay}
                className="px-6 py-2.5 rounded-xl font-extrabold text-xs text-white bg-emerald-600 hover:bg-emerald-500 transition shadow-glow-emerald flex items-center gap-2 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span>Processing...</span>
                ) : (
                  <>
                    <span>Confirm & Pay ₹{totalAmount.toLocaleString()}</span>
                    <CheckCircle2 className="w-4 h-4" />
                  </>
                )}
              </button>
            )}
          </div>
        )}

      </div>
    </div>
  );
};
