import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { shopService } from '../services/shopService';
import { useCart } from '../context/CartContext';
import { RazorpayModal } from '../components/RazorpayModal';
import { loadRazorpay } from '../utils/loadRazorpay';
import agriMitraLogo from '../assets/AgriMitra.png';
import { Plus, ShieldCheck, CreditCard, Banknote } from 'lucide-react';
import toast from 'react-hot-toast';

export const Checkout = () => {
  const navigate = useNavigate();
  const { cart, clearCartState } = useCart();
  const [addresses, setAddresses] = useState([]);
  const [addressId, setAddressId] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('RAZORPAY');
  const [couponCode, setCouponCode] = useState('');
  const [isPlacing, setIsPlacing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Razorpay Modal state
  const [razorpayModalOpen, setRazorpayModalOpen] = useState(false);
  const [activeRzpOrder, setActiveRzpOrder] = useState(null);
  const [currentPlacedOrder, setCurrentPlacedOrder] = useState(null);

  useEffect(() => {
    shopService
      .getAddresses()
      .then((addrRes) => {
        setAddresses(addrRes.data || []);
        const def = (addrRes.data || []).find((a) => a.isDefault);
        if (def) setAddressId(def.id);
        else if (addrRes.data?.length) setAddressId(addrRes.data[0].id);
      })
      .catch((err) => toast.error(err.response?.data?.message || 'Failed to load addresses'))
      .finally(() => setIsLoading(false));
  }, []);

  const handleRazorpayPayment = async (placedOrder) => {
    try {
      toast.loading('Initializing official Razorpay gateway...', { id: 'rzp-init' });
      const rzpOrderRes = await shopService.createRazorpayOrder(placedOrder.id);
      const rzpData = rzpOrderRes.data;
      toast.dismiss('rzp-init');

      setCurrentPlacedOrder(placedOrder);
      setActiveRzpOrder(rzpData);

      const scriptLoaded = await loadRazorpay();
      if (!scriptLoaded || !window.Razorpay) {
        toast.error('Unable to load Razorpay checkout script. Please check your internet connection.');
        setRazorpayModalOpen(true);
        return;
      }

      const options = {
        key: rzpData.keyId,
        amount: rzpData.amountInPaise,
        currency: rzpData.currency || 'INR',
        name: rzpData.companyName || 'AgriMitra',
        description: `Order #${placedOrder.id} Payment`,
        image: agriMitraLogo,
        order_id: rzpData.razorpayOrderId,
        handler: async function (response) {
          await handlePaymentSuccess({
            ...response,
            orderId: placedOrder.id,
          });
        },
        prefill: {
          name: rzpData.customerName || '',
          email: rzpData.customerEmail || '',
          contact: rzpData.customerPhone || '',
        },
        theme: {
          color: '#059669',
        },
        modal: {
          ondismiss: function () {
            toast('Payment cancelled or closed. You can retry from My Orders.', { icon: 'ℹ️' });
            navigate(`/orders/${placedOrder.id}`);
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (resp) {
        toast.error(resp.error?.description || 'Payment failed on Razorpay');
      });
      rzp.open();
    } catch (err) {
      toast.dismiss('rzp-init');
      clearCartState();
      toast.error(err.response?.data?.message || 'Failed to initialize payment gateway');
      navigate(`/orders/${placedOrder.id}`);
    }
  };

  const handlePaymentSuccess = async (response) => {
    const targetOrderId = response?.orderId || currentPlacedOrder?.id || activeRzpOrder?.orderId;
    const targetRzpOrderId = response?.razorpay_order_id || activeRzpOrder?.razorpayOrderId;
    try {
      toast.loading('Verifying Razorpay payment...', { id: 'rzp-verify' });
      await shopService.verifyRazorpayPayment({
        orderId: targetOrderId,
        razorpayOrderId: targetRzpOrderId,
        razorpayPaymentId: response.razorpay_payment_id,
        razorpaySignature: response.razorpay_signature,
      });
      toast.dismiss('rzp-verify');
      clearCartState();
      setRazorpayModalOpen(false);
      toast.success('Payment verified! Order #' + targetOrderId + ' confirmed.');
      navigate(`/orders/${targetOrderId}`);
    } catch (err) {
      toast.dismiss('rzp-verify');
      clearCartState();
      setRazorpayModalOpen(false);
      toast.error(err.response?.data?.message || 'Payment verification failed');
      navigate(`/orders/${targetOrderId}`);
    }
  };

  const handleModalClose = () => {
    setRazorpayModalOpen(false);
    clearCartState();
    toast('Payment pending. You can complete payment anytime from My Orders.', { icon: 'ℹ️' });
    navigate(`/orders/${currentPlacedOrder?.id}`);
  };

  const placeOrder = async () => {
    if (!addressId) {
      toast.error('Please select a shipping address');
      return;
    }
    setIsPlacing(true);
    try {
      const res = await shopService.checkout({
        addressId,
        paymentMethod,
        couponCode: couponCode ? couponCode.trim() : undefined,
      });

      const placedOrder = res.data;

      if (paymentMethod === 'RAZORPAY') {
        await handleRazorpayPayment(placedOrder);
      } else {
        clearCartState();
        toast.success('Order placed successfully via Cash on Delivery!');
        navigate(`/orders/${placedOrder.id}`);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to place order');
    } finally {
      setIsPlacing(false);
    }
  };

  if (isLoading) return <div className="max-w-4xl mx-auto px-4 py-10 text-sm text-slate-500">Loading checkout...</div>;

  if (!cart || cart.items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <p className="text-sm text-slate-500 mb-3">Your cart is empty.</p>
        <Link to="/" className="text-sm font-semibold text-emerald-700 hover:text-emerald-800">
          Explore Marketplace &rarr;
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Checkout</h1>
        <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-semibold bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Razorpay 256-bit Secure Checkout</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* 1. Shipping Address Selection */}
          <div className="bg-[#fdfcf9] border border-stone-200/90 rounded-2xl p-5 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-900">Shipping Address</h2>
              <Link
                to="/addresses"
                className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 inline-flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Add new
              </Link>
            </div>

            {addresses.length === 0 ? (
              <p className="text-xs text-slate-500 bg-amber-50 border border-amber-200 rounded-xl p-3">
                No saved addresses. <Link to="/addresses" className="underline font-semibold">Add one</Link> to continue.
              </p>
            ) : (
              <div className="space-y-2">
                {addresses.map((a) => (
                  <label
                    key={a.id}
                    className={`flex items-start gap-3 p-3.5 border rounded-xl cursor-pointer transition ${
                      addressId === a.id
                        ? 'border-emerald-500 bg-emerald-50/40 ring-1 ring-emerald-500/30'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <input
                      type="radio"
                      name="address"
                      checked={addressId === a.id}
                      onChange={() => setAddressId(a.id)}
                      className="mt-0.5 text-emerald-600 focus:ring-emerald-500"
                    />
                    <div className="text-xs space-y-0.5">
                      <p className="font-bold text-slate-900">
                        {a.fullName} <span className="font-normal text-slate-500">· {a.phone}</span>
                      </p>
                      <p className="text-slate-600">
                        {a.line1}{a.line2 ? `, ${a.line2}` : ''}, {a.city}, {a.state} - {a.pincode}
                      </p>
                    </div>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* 2. Payment Method Selection */}
          <div className="bg-[#fdfcf9] border border-stone-200/90 rounded-2xl p-5 shadow-2xs space-y-3">
            <h2 className="text-sm font-bold text-slate-900">Payment Method</h2>
            <div className="space-y-3">
              {/* Option A: Razorpay */}
              <label
                className={`flex items-start gap-3.5 p-4 border rounded-2xl cursor-pointer transition ${
                  paymentMethod === 'RAZORPAY'
                    ? 'border-emerald-500 bg-emerald-50/50 ring-1 ring-emerald-500/30'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === 'RAZORPAY'}
                  onChange={() => setPaymentMethod('RAZORPAY')}
                  className="mt-1 text-emerald-600 focus:ring-emerald-500"
                />
                <div className="flex-1 text-xs space-y-1">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <span className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                      <CreditCard className="w-4 h-4 text-emerald-600" />
                      Razorpay Online Payment (UPI / Cards / NetBanking)
                    </span>
                    <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 border border-emerald-200 px-2 py-0.5 rounded-full">
                      Test Mode Active
                    </span>
                  </div>
                  <p className="text-slate-500">
                    Pay securely using Google Pay, PhonePe, Paytm, Any UPI, Credit/Debit Cards, or NetBanking.
                  </p>
                </div>
              </label>

              {/* Option B: Cash on Delivery */}
              <label
                className={`flex items-start gap-3.5 p-4 border rounded-2xl cursor-pointer transition ${
                  paymentMethod === 'COD'
                    ? 'border-emerald-500 bg-emerald-50/50 ring-1 ring-emerald-500/30'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === 'COD'}
                  onChange={() => setPaymentMethod('COD')}
                  className="mt-1 text-emerald-600 focus:ring-emerald-500"
                />
                <div className="flex-1 text-xs space-y-0.5">
                  <span className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                    <Banknote className="w-4 h-4 text-stone-600" />
                    Cash on Delivery (COD)
                  </span>
                  <p className="text-slate-500">Pay cash upon arrival of agricultural inputs directly at your farm or home.</p>
                </div>
              </label>
            </div>
          </div>

          {/* 3. Coupon Code */}
          <div className="bg-[#fdfcf9] border border-stone-200/90 rounded-2xl p-5 shadow-2xs space-y-2">
            <h2 className="text-sm font-bold text-slate-900">Kisan Coupon Code</h2>
            <div className="flex gap-2">
              <input
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                placeholder="Enter discount coupon (e.g. KISAN10)"
                className="flex-1 px-3.5 py-2 bg-white border border-stone-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 uppercase"
              />
            </div>
          </div>
        </div>

        {/* 4. Order Summary Card */}
        <div className="bg-white border border-stone-200/90 rounded-2xl p-5 h-fit space-y-4 shadow-2xs">
          <h2 className="text-sm font-bold text-slate-900 pb-2 border-b border-stone-100">
            Order Summary ({cart.items.length} {cart.items.length === 1 ? 'item' : 'items'})
          </h2>

          <div className="space-y-2 max-h-56 overflow-y-auto divide-y divide-stone-100 pr-1">
            {cart.items.map((item) => (
              <div key={item.id} className="pt-2 first:pt-0 flex justify-between text-xs text-slate-600">
                <span className="truncate pr-2 font-medium">
                  {item.productName} <span className="text-slate-400">× {item.quantity}</span>
                </span>
                <span className="font-bold text-slate-900 shrink-0">₹{item.lineTotal}</span>
              </div>
            ))}
          </div>

          <div className="pt-3 border-t border-stone-200 space-y-1.5 text-xs">
            <div className="flex justify-between text-slate-600">
              <span>Subtotal</span>
              <span className="font-semibold text-slate-800">₹{cart.subtotal}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Delivery Fee</span>
              <span className="font-semibold text-emerald-700">
                {cart.subtotal >= 500 ? 'FREE (Orders > ₹500)' : '₹50'}
              </span>
            </div>
            <div className="pt-2 border-t border-stone-200 flex justify-between text-sm font-extrabold text-slate-900">
              <span>Estimated Total</span>
              <span className="text-emerald-700">₹{cart.subtotal >= 500 ? cart.subtotal : cart.subtotal + 50}</span>
            </div>
          </div>

          <button
            onClick={placeOrder}
            disabled={isPlacing || !addressId}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white font-bold text-sm shadow-sm disabled:opacity-50 cursor-pointer transition flex items-center justify-center gap-2"
          >
            {isPlacing ? (
              <span>Processing...</span>
            ) : paymentMethod === 'RAZORPAY' ? (
              <>
                <ShieldCheck className="w-4 h-4" />
                <span>Pay via Razorpay</span>
              </>
            ) : (
              <span>Place Order (COD)</span>
            )}
          </button>

          <p className="text-[10px] text-center text-slate-400">
            By placing your order, you agree to AgriMitra's Terms of Sale & Privacy Policy.
          </p>
        </div>
      </div>

      {/* Razorpay Test Modal */}
      <RazorpayModal
        isOpen={razorpayModalOpen}
        onClose={handleModalClose}
        onSuccess={handlePaymentSuccess}
        orderData={activeRzpOrder}
      />
    </div>
  );
};
