import React, { useState } from 'react';
import {
  X,
  CreditCard,
  QrCode,
  Building2,
  ShieldCheck,
  Lock,
  Loader2,
  Smartphone,
} from 'lucide-react';
import agriMitraLogo from '../assets/AgriMitra.png';
import toast from 'react-hot-toast';

const POPULAR_BANKS = [
  { id: 'HDFC', name: 'HDFC Bank' },
  { id: 'SBIN', name: 'State Bank of India' },
  { id: 'ICIC', name: 'ICICI Bank' },
  { id: 'UTIB', name: 'Axis Bank' },
  { id: 'KKBK', name: 'Kotak Mahindra Bank' },
  { id: 'PUNB', name: 'Punjab National Bank' },
];

export const RazorpayModal = ({
  isOpen,
  onClose,
  onSuccess,
  orderData,
}) => {
  const [activeTab, setActiveTab] = useState('card');
  const [isProcessing, setIsProcessing] = useState(false);

  // User input states (empty by default - user enters details)
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [cardName, setCardName] = useState('');
  const [upiId, setUpiId] = useState('');
  const [selectedBank, setSelectedBank] = useState('');

  if (!isOpen || !orderData) return null;

  const totalAmount = orderData.amount || (orderData.amountInPaise ? orderData.amountInPaise / 100 : 0);

  // Format Card Number as user types: "4111 2222 3333 4444"
  const handleCardNumberChange = (e) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 16);
    const parts = raw.match(/.{1,4}/g);
    setCardNumber(parts ? parts.join(' ') : raw);
  };

  // Format Expiry as user types: "MM/YY"
  const handleExpiryChange = (e) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 4);
    if (raw.length > 2) {
      setCardExpiry(raw.slice(0, 2) + '/' + raw.slice(2));
    } else {
      setCardExpiry(raw);
    }
  };

  // Restrict CVV to 3 digits
  const handleCvvChange = (e) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 3);
    setCardCvv(raw);
  };

  const handlePay = () => {
    // Validate inputs based on active payment method
    if (activeTab === 'card') {
      const cleanDigits = cardNumber.replace(/\s+/g, '');
      if (cleanDigits.length !== 16) {
        toast.error('Please enter a valid 16-digit card number');
        return;
      }
      if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(cardExpiry)) {
        toast.error('Please enter a valid expiry date (MM/YY)');
        return;
      }
      if (cardCvv.length !== 3) {
        toast.error('Please enter a valid 3-digit CVV');
        return;
      }
      if (!cardName.trim() || cardName.trim().length < 2) {
        toast.error('Please enter the cardholder name');
        return;
      }
    } else if (activeTab === 'upi') {
      const trimmed = upiId.trim();
      if (!trimmed) {
        toast.error('Please enter your UPI ID');
        return;
      }
      if (!/^[a-zA-Z0-9.\-_]{2,}@[a-zA-Z0-9.\-_]{2,}$/.test(trimmed)) {
        toast.error('Please enter a valid UPI ID (e.g. name@okhdfcbank)');
        return;
      }
    } else if (activeTab === 'netbanking') {
      if (!selectedBank) {
        toast.error('Please select your bank to proceed with NetBanking');
        return;
      }
    }

    setIsProcessing(true);
    // Simulate payment authorization
    setTimeout(() => {
      setIsProcessing(false);
      const paymentId = 'pay_test_' + Math.random().toString(36).substring(2, 12).toUpperCase();
      const signature = 'sig_test_' + Math.random().toString(36).substring(2, 16);

      onSuccess({
        orderId: orderData.orderId,
        razorpay_payment_id: paymentId,
        razorpay_order_id: orderData.razorpayOrderId || 'order_test_' + orderData.orderId,
        razorpay_signature: signature,
      });
    }, 850);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
      <div
        className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-stone-200/90 flex flex-col animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 1. Header */}
        <div className="bg-[#0c2340] text-white p-4 sm:p-5 relative flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white p-1 flex items-center justify-center shrink-0 shadow-xs">
              <img src={agriMitraLogo} alt="AgriMitra" className="w-full h-full object-contain" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-sm tracking-tight">AgriMitra</span>
                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  TEST MODE
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Order #{orderData.orderId} &middot; <span className="text-[10px] font-mono text-emerald-400">{orderData.keyId || 'rzp_test_LqWBBDbgwot51h'}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <span className="text-[10px] uppercase text-slate-400 font-semibold block">Amount</span>
              <span className="text-base font-extrabold text-white">₹{totalAmount}</span>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
              title="Close payment modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 2. Payment Method Tabs */}
        <div className="flex border-b border-stone-200/80 bg-stone-50/80 text-xs font-semibold text-stone-600">
          <button
            type="button"
            onClick={() => setActiveTab('card')}
            className={`flex-1 py-3 px-2 flex items-center justify-center gap-1.5 transition cursor-pointer border-b-2 ${
              activeTab === 'card'
                ? 'border-emerald-600 text-emerald-800 bg-white'
                : 'border-transparent hover:text-stone-900'
            }`}
          >
            <CreditCard className="w-4 h-4" />
            <span>Cards</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('upi')}
            className={`flex-1 py-3 px-2 flex items-center justify-center gap-1.5 transition cursor-pointer border-b-2 ${
              activeTab === 'upi'
                ? 'border-emerald-600 text-emerald-800 bg-white'
                : 'border-transparent hover:text-stone-900'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            <span>UPI / QR</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('netbanking')}
            className={`flex-1 py-3 px-2 flex items-center justify-center gap-1.5 transition cursor-pointer border-b-2 ${
              activeTab === 'netbanking'
                ? 'border-emerald-600 text-emerald-800 bg-white'
                : 'border-transparent hover:text-stone-900'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Netbanking</span>
          </button>
        </div>

        {/* 3. Tab Contents */}
        <div className="p-5 space-y-4">
          {/* Tab A: Card Payment */}
          {activeTab === 'card' && (
            <div className="space-y-3 animate-in fade-in duration-100">
              <div>
                <label className="text-[11px] font-bold text-stone-600 uppercase tracking-wider block mb-1">
                  Card Number
                </label>
                <div className="relative flex items-center">
                  <input
                    type="text"
                    value={cardNumber}
                    onChange={handleCardNumberChange}
                    placeholder="Enter 16-digit card number"
                    maxLength={19}
                    className="w-full pl-3 pr-10 py-2 border border-stone-200 rounded-xl text-xs sm:text-sm font-mono text-slate-900 focus:outline-none focus:border-emerald-600 placeholder:text-stone-400"
                  />
                  <CreditCard className="w-4 h-4 text-stone-400 absolute right-3 pointer-events-none" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="text-[11px] font-bold text-stone-600 uppercase tracking-wider block mb-1">
                    Expiry (MM/YY)
                  </label>
                  <input
                    type="text"
                    value={cardExpiry}
                    onChange={handleExpiryChange}
                    placeholder="MM/YY"
                    maxLength={5}
                    className="w-full px-3 py-2 border border-stone-200 rounded-xl text-xs sm:text-sm font-mono text-slate-900 focus:outline-none focus:border-emerald-600 placeholder:text-stone-400"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-stone-600 uppercase tracking-wider block mb-1">
                    CVV
                  </label>
                  <input
                    type="password"
                    value={cardCvv}
                    onChange={handleCvvChange}
                    placeholder="CVV"
                    maxLength={3}
                    className="w-full px-3 py-2 border border-stone-200 rounded-xl text-xs sm:text-sm font-mono text-slate-900 focus:outline-none focus:border-emerald-600 placeholder:text-stone-400"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-stone-600 uppercase tracking-wider block mb-1">
                  Cardholder Name
                </label>
                <input
                  type="text"
                  value={cardName}
                  onChange={(e) => setCardName(e.target.value)}
                  placeholder="Full name on card"
                  className="w-full px-3 py-2 border border-stone-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-emerald-600 placeholder:text-stone-400"
                />
              </div>
            </div>
          )}

          {/* Tab B: UPI / QR */}
          {activeTab === 'upi' && (
            <div className="space-y-3 animate-in fade-in duration-100">
              <div className="text-center py-2 bg-stone-50 rounded-2xl border border-stone-200/80 p-3 space-y-1">
                <div className="w-24 h-24 mx-auto bg-white p-2 rounded-xl border border-stone-200 flex items-center justify-center shadow-2xs">
                  <QrCode className="w-20 h-20 text-emerald-800" />
                </div>
                <p className="text-[11px] font-semibold text-stone-600">Scan & Pay with Any UPI App</p>
                <p className="text-[10px] text-stone-400">Google Pay, PhonePe, Paytm, BHIM</p>
              </div>

              <div>
                <label className="text-[11px] font-bold text-stone-600 uppercase tracking-wider block mb-1">
                  Or enter Virtual Payment Address (UPI ID)
                </label>
                <input
                  type="text"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  placeholder="e.g. mobile@upi or username@bank"
                  className="w-full px-3 py-2 border border-stone-200 rounded-xl text-xs sm:text-sm font-mono text-slate-900 focus:outline-none focus:border-emerald-600 placeholder:text-stone-400"
                />
                <div className="flex items-center gap-1.5 flex-wrap pt-2">
                  <span className="text-[10px] text-stone-400 font-medium">Quick handles:</span>
                  {['@okhdfcbank', '@paytm', '@ybl', '@upi'].map((handle) => (
                    <button
                      key={handle}
                      type="button"
                      onClick={() => {
                        const prefix = upiId.includes('@') ? upiId.split('@')[0] : upiId;
                        setUpiId(prefix ? `${prefix}${handle}` : `user${handle}`);
                      }}
                      className="text-[10px] px-2 py-0.5 rounded-md bg-stone-100 hover:bg-stone-200 text-stone-700 font-medium transition cursor-pointer border border-stone-200"
                    >
                      {handle}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Tab C: Netbanking */}
          {activeTab === 'netbanking' && (
            <div className="space-y-2.5 animate-in fade-in duration-100">
              <label className="text-[11px] font-bold text-stone-600 uppercase tracking-wider block">
                Select Your Bank
              </label>
              <div className="grid grid-cols-1 gap-1.5 max-h-48 overflow-y-auto">
                {POPULAR_BANKS.map((b) => (
                  <label
                    key={b.id}
                    className={`flex items-center justify-between p-2.5 border rounded-xl cursor-pointer text-xs transition ${
                      selectedBank === b.id
                        ? 'border-emerald-500 bg-emerald-50/60 font-bold text-emerald-900'
                        : 'border-stone-200 hover:border-stone-300 text-stone-700'
                    }`}
                  >
                    <span>{b.name}</span>
                    <input
                      type="radio"
                      name="bank"
                      checked={selectedBank === b.id}
                      onChange={() => setSelectedBank(b.id)}
                      className="text-emerald-600 focus:ring-emerald-500"
                    />
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* 4. Action Button */}
          <button
            type="button"
            onClick={handlePay}
            disabled={isProcessing}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white font-bold text-sm shadow-md shadow-emerald-700/20 disabled:opacity-50 transition cursor-pointer flex items-center justify-center gap-2"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Authorizing with Bank...</span>
              </>
            ) : (
              <>
                <Lock className="w-4 h-4" />
                <span>Pay ₹{totalAmount}</span>
              </>
            )}
          </button>

          {/* Footer note */}
          <div className="pt-2 border-t border-stone-100 flex items-center justify-center gap-1.5 text-[10px] text-stone-400">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Secured with 256-bit encryption · Razorpay Test Gateway</span>
          </div>
        </div>
      </div>
    </div>
  );
};
