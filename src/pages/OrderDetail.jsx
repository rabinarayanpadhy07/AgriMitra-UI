import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { shopService } from '../services/shopService';
import { StatusBadge } from '../components/StatusBadge';
import { Modal, FormField, inputClass } from '../components/Modal';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { Package, ShieldCheck } from 'lucide-react';
import { RazorpayModal } from '../components/RazorpayModal';
import { loadRazorpay } from '../utils/loadRazorpay';
import agriMitraLogo from '../assets/AgriMitra.png';
import toast from 'react-hot-toast';

const CANCELLABLE = ['PLACED', 'CONFIRMED'];

export const OrderDetail = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [returnModalOpen, setReturnModalOpen] = useState(false);
  const [returnReason, setReturnReason] = useState('');

  const load = async () => {
    try {
      const res = await shopService.getMyOrder(id);
      setOrder(res.data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load order');
    }
  };

  useEffect(() => { load(); }, [id]);

  const cancelOrder = async () => {
    setIsSubmitting(true);
    try {
      await shopService.cancelMyOrder(id);
      toast.success('Order cancelled');
      setCancelOpen(false);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to cancel order');
    } finally {
      setIsSubmitting(false);
    }
  };

  const submitReturn = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await shopService.requestReturn({ orderId: Number(id), reason: returnReason });
      toast.success('Return request submitted');
      setReturnModalOpen(false);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit return request');
    } finally {
      setIsSubmitting(false);
    }
  };

  const [isPaying, setIsPaying] = useState(false);
  const [razorpayModalOpen, setRazorpayModalOpen] = useState(false);
  const [activeRzpOrder, setActiveRzpOrder] = useState(null);

  const handlePayNow = async () => {
    setIsPaying(true);
    try {
      toast.loading('Initializing Razorpay gateway...', { id: 'rzp-init' });
      const rzpRes = await shopService.createRazorpayOrder(order.id);
      const rzpData = rzpRes.data;
      toast.dismiss('rzp-init');

      setActiveRzpOrder(rzpData);

      const isOfficialOrder = rzpData.razorpayOrderId && !rzpData.razorpayOrderId.startsWith('order_test_');

      if (isOfficialOrder) {
        const scriptLoaded = await loadRazorpay();
        if (scriptLoaded && window.Razorpay) {
          const options = {
            key: rzpData.keyId,
            amount: rzpData.amountInPaise,
            currency: rzpData.currency || 'INR',
            name: rzpData.companyName || 'AgriMitra',
            description: `Order #${order.id} Payment`,
            image: agriMitraLogo,
            order_id: rzpData.razorpayOrderId,
            handler: async function (response) {
              await handlePaymentSuccess({
                ...response,
                orderId: order.id,
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
                setRazorpayModalOpen(true);
              },
            },
          };

          try {
            const rzp = new window.Razorpay(options);
            rzp.on('payment.failed', function (resp) {
              toast.error(resp.error?.description || 'Payment failed on Razorpay');
              setRazorpayModalOpen(true);
            });
            rzp.open();
          } catch {
            setRazorpayModalOpen(true);
          }
        } else {
          setRazorpayModalOpen(true);
        }
      } else {
        // Test sandbox order: Open AgriMitra Razorpay Test Modal directly so user enters details without CDN failures
        setRazorpayModalOpen(true);
      }
    } catch (err) {
      toast.dismiss('rzp-init');
      toast.error(err.response?.data?.message || 'Failed to start payment');
    } finally {
      setIsPaying(false);
    }
  };

  const handlePaymentSuccess = async (response) => {
    const targetOrderId = response?.orderId || order?.id || activeRzpOrder?.orderId;
    const targetRzpOrderId = response?.razorpay_order_id || activeRzpOrder?.razorpayOrderId || ('order_test_' + targetOrderId);
    try {
      toast.loading('Verifying Razorpay payment...', { id: 'rzp-verify' });
      await shopService.verifyRazorpayPayment({
        orderId: targetOrderId,
        razorpayOrderId: targetRzpOrderId,
        razorpayPaymentId: response.razorpay_payment_id,
        razorpaySignature: response.razorpay_signature,
      });
      toast.dismiss('rzp-verify');
      setRazorpayModalOpen(false);
      toast.success('Payment confirmed!');
      load();
    } catch (err) {
      toast.dismiss('rzp-verify');
      setRazorpayModalOpen(false);
      toast.error(err.response?.data?.message || 'Payment verification failed');
    }
  };

  if (!order) return <div className="max-w-3xl mx-auto px-4 py-10 text-sm text-slate-500">Loading order...</div>;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <Link to="/orders" className="text-xs text-slate-500 hover:text-emerald-700">&larr; Back to Orders</Link>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Order #{order.id}</h1>
          <p className="text-xs text-slate-500">{new Date(order.createdAt).toLocaleString()}</p>
        </div>
        <StatusBadge status={order.status} />
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        {order.status === 'PLACED' && (
          <button
            onClick={handlePayNow}
            disabled={isPaying}
            className="text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 cursor-pointer rounded-lg px-3.5 py-1.5 shadow-2xs flex items-center gap-1.5"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>{isPaying ? 'Opening Gateway...' : 'Pay Now via Razorpay'}</span>
          </button>
        )}
        {CANCELLABLE.includes(order.status) && (
          <button onClick={() => setCancelOpen(true)} className="text-xs font-semibold text-rose-600 hover:text-rose-700 cursor-pointer border border-rose-200 rounded-lg px-3 py-1.5">
            Cancel Order
          </button>
        )}
        {order.status === 'DELIVERED' && (
          <button onClick={() => setReturnModalOpen(true)} className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 cursor-pointer border border-emerald-200 rounded-lg px-3 py-1.5">
            Request Return
          </button>
        )}
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl divide-y divide-slate-100">
        {order.items?.map((item) => (
          <div key={item.id} className="flex items-center gap-3 p-4">
            <div className="w-12 h-12 bg-slate-100 rounded-lg overflow-hidden flex items-center justify-center shrink-0">
              {item.productImage ? <img src={item.productImage} alt="" className="w-full h-full object-cover" /> : <Package className="w-5 h-5 text-slate-300" />}
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-slate-900">{item.productName}</p>
              <p className="text-xs text-slate-500">Qty {item.quantity} × ₹{item.unitPrice}</p>
            </div>
            <p className="text-sm font-bold text-slate-900">₹{item.lineTotal}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-4 text-xs text-slate-600">
          <p className="font-semibold text-slate-800 mb-1">Shipping Address</p>
          <p>{order.shippingFullName} · {order.shippingPhone}</p>
          <p>{order.shippingLine1}{order.shippingLine2 ? `, ${order.shippingLine2}` : ''}</p>
          <p>{order.shippingCity}, {order.shippingState} {order.shippingPincode}</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-4 text-xs space-y-1">
          <div className="flex justify-between"><span className="text-slate-500">Subtotal</span><span>₹{order.subtotal}</span></div>
          <div className="flex justify-between"><span className="text-slate-500">Discount {order.couponCode ? `(${order.couponCode})` : ''}</span><span>-₹{order.discountAmount}</span></div>
          <div className="flex justify-between"><span className="text-slate-500">Shipping</span><span>₹{order.shippingFee}</span></div>
          <div className="flex justify-between font-bold text-slate-900 text-sm pt-1 border-t border-slate-100"><span>Total</span><span>₹{order.totalAmount}</span></div>
        </div>
      </div>

      <ConfirmDialog isOpen={cancelOpen} title="Cancel this order?" message="This order will be cancelled and cannot be undone."
        confirmText="Cancel Order" danger isSubmitting={isSubmitting} onConfirm={cancelOrder} onCancel={() => setCancelOpen(false)} />

      <Modal isOpen={returnModalOpen} title="Request a Return" onClose={() => setReturnModalOpen(false)}>
        <form onSubmit={submitReturn} className="space-y-4">
          <FormField label="Reason for return" required>
            <textarea className={inputClass} rows={3} required value={returnReason} onChange={(e) => setReturnReason(e.target.value)} />
          </FormField>
          <button type="submit" disabled={isSubmitting} className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white font-semibold shadow-sm disabled:opacity-50 cursor-pointer transition">
            {isSubmitting ? 'Submitting...' : 'Submit Return Request'}
          </button>
        </form>
      </Modal>

      <RazorpayModal
        isOpen={razorpayModalOpen}
        onClose={() => setRazorpayModalOpen(false)}
        onSuccess={handlePaymentSuccess}
        orderData={activeRzpOrder}
      />
    </div>
  );
};
