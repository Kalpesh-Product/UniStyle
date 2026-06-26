import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CreditCard, Lock, ChevronLeft, ShieldCheck, Truck } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { showToast } from '@/components/ToastContainer';
import { api, ApiError } from '@/lib/api';

export function CheckoutPage() {
  const { items, subtotal, clearCart } = useCart();
  const { user, isAuthenticated, refreshOrders } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState<'shipping' | 'payment'>('shipping');
  const [shippingData, setShippingData] = useState({
    email: user?.email || '',
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    address1: '',
    address2: '',
    city: '',
    country: '',
    postalCode: '',
    phone: '',
  });
  const [shippingMethod, setShippingMethod] = useState<'standard' | 'express'>('standard');
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'paypal'>('card');
  const [cardData, setCardData] = useState({ number: '', expiry: '', cvv: '', name: '' });
  const [processing, setProcessing] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  const [promoApplied, setPromoApplied] = useState(false);

  const shippingCost = shippingMethod === 'express' ? 15 : subtotal > 100 ? 0 : 8;
  const discount = promoApplied ? subtotal * 0.1 : 0;
  const tax = (subtotal - discount) * 0.08;
  const total = subtotal - discount + shippingCost + tax;

  const handleApplyPromo = () => {
    if (promoCode.toUpperCase() === 'SAVE10') {
      setPromoApplied(true);
      showToast('Promo code applied!');
    } else {
      showToast('Invalid promo code', 'error');
    }
  };

  const handlePlaceOrder = async () => {
    if (!isAuthenticated) {
      showToast('Please sign in to place an order', 'error');
      navigate('/account');
      return;
    }

    setProcessing(true);
    try {
      const { orderId, redirectUrl, url } = await api.createCheckoutSession({
        shippingAddress: {
          fullName: `${shippingData.firstName} ${shippingData.lastName}`.trim(),
          line1: shippingData.address1,
          line2: shippingData.address2 || undefined,
          city: shippingData.city,
          postalCode: shippingData.postalCode,
          country: shippingData.country,
          phone: shippingData.phone || undefined,
        },
      });

      clearCart();
      showToast('Order placed successfully!');
      await refreshOrders();

      if (url) {
        window.location.href = url;
      } else {
        navigate(redirectUrl || `/account?order=success&orderId=${orderId}`);
      }
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : 'Failed to place order', 'error');
    } finally {
      setProcessing(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="mt-[72px] min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Your cart is empty</h1>
          <p className="text-sm text-[#666] mb-6">Add some items to proceed to checkout.</p>
          <Link to="/shop" className="inline-block bg-[#1A1A1A] text-white text-xs font-semibold uppercase tracking-[0.08em] px-8 py-4 hover:bg-[#333] transition-colors">
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-[72px]">
      <div className="max-w-[1200px] mx-auto px-6 lg:px-12 py-12">
        <Link to="/cart" className="inline-flex items-center gap-2 text-sm text-[#666] hover:text-[#1A1A1A] mb-8">
          <ChevronLeft size={16} /> Back to Cart
        </Link>

        <h1 className="text-3xl font-bold tracking-tight mb-10">Checkout</h1>

        <div className="flex flex-col lg:flex-row gap-12">
          {/* Left: Form */}
          <div className="flex-1">
            {/* Progress */}
            <div className="flex items-center gap-4 mb-10">
              <div className={`flex items-center gap-2 text-sm font-medium ${step === 'shipping' || step === 'payment' ? 'text-[#1A1A1A]' : 'text-[#999]'}`}>
                <span className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${step === 'shipping' || step === 'payment' ? 'bg-[#1A1A1A] text-white' : 'bg-[#E5E5E5]'}`}>1</span>
                Shipping
              </div>
              <div className="w-12 h-[1px] bg-[#E5E5E5]" />
              <div className={`flex items-center gap-2 text-sm font-medium ${step === 'payment' ? 'text-[#1A1A1A]' : 'text-[#999]'}`}>
                <span className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${step === 'payment' ? 'bg-[#1A1A1A] text-white' : 'bg-[#E5E5E5]'}`}>2</span>
                Payment
              </div>
            </div>

            {step === 'shipping' && (
              <div>
                <h2 className="text-lg font-bold mb-6">Contact Information</h2>
                <input
                  type="email"
                  placeholder="Email"
                  value={shippingData.email}
                  onChange={e => setShippingData({ ...shippingData, email: e.target.value })}
                  className="w-full border border-[#E5E5E5] px-4 py-3 text-sm mb-6 outline-none focus:border-[#1A1A1A] transition-colors"
                />

                <h2 className="text-lg font-bold mb-6">Shipping Address</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  <input placeholder="First Name" value={shippingData.firstName} onChange={e => setShippingData({ ...shippingData, firstName: e.target.value })} className="w-full border border-[#E5E5E5] px-4 py-3 text-sm outline-none focus:border-[#1A1A1A]" />
                  <input placeholder="Last Name" value={shippingData.lastName} onChange={e => setShippingData({ ...shippingData, lastName: e.target.value })} className="w-full border border-[#E5E5E5] px-4 py-3 text-sm outline-none focus:border-[#1A1A1A]" />
                </div>
                <input placeholder="Address" value={shippingData.address1} onChange={e => setShippingData({ ...shippingData, address1: e.target.value })} className="w-full border border-[#E5E5E5] px-4 py-3 text-sm mb-4 outline-none focus:border-[#1A1A1A]" />
                <input placeholder="Apartment, suite, etc. (optional)" value={shippingData.address2} onChange={e => setShippingData({ ...shippingData, address2: e.target.value })} className="w-full border border-[#E5E5E5] px-4 py-3 text-sm mb-4 outline-none focus:border-[#1A1A1A]" />
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                  <input placeholder="City" value={shippingData.city} onChange={e => setShippingData({ ...shippingData, city: e.target.value })} className="w-full border border-[#E5E5E5] px-4 py-3 text-sm outline-none focus:border-[#1A1A1A]" />
                  <input placeholder="Country" value={shippingData.country} onChange={e => setShippingData({ ...shippingData, country: e.target.value })} className="w-full border border-[#E5E5E5] px-4 py-3 text-sm outline-none focus:border-[#1A1A1A]" />
                  <input placeholder="Postal Code" value={shippingData.postalCode} onChange={e => setShippingData({ ...shippingData, postalCode: e.target.value })} className="w-full border border-[#E5E5E5] px-4 py-3 text-sm outline-none focus:border-[#1A1A1A]" />
                </div>
                <input placeholder="Phone" value={shippingData.phone} onChange={e => setShippingData({ ...shippingData, phone: e.target.value })} className="w-full border border-[#E5E5E5] px-4 py-3 text-sm mb-8 outline-none focus:border-[#1A1A1A]" />

                <h2 className="text-lg font-bold mb-6">Shipping Method</h2>
                <div className="space-y-3 mb-8">
                  <label className={`flex items-center justify-between p-4 border cursor-pointer transition-colors ${shippingMethod === 'standard' ? 'border-[#1A1A1A] bg-[#F5F5F5]' : 'border-[#E5E5E5]'}`}>
                    <div className="flex items-center gap-3">
                      <Truck size={18} />
                      <div>
                        <p className="text-sm font-medium">Standard Shipping</p>
                        <p className="text-xs text-[#999]">5-7 business days</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium">{subtotal > 100 ? 'FREE' : '$8.00'}</span>
                      <input type="radio" name="shipping" checked={shippingMethod === 'standard'} onChange={() => setShippingMethod('standard')} className="accent-[#1A1A1A]" />
                    </div>
                  </label>
                  <label className={`flex items-center justify-between p-4 border cursor-pointer transition-colors ${shippingMethod === 'express' ? 'border-[#1A1A1A] bg-[#F5F5F5]' : 'border-[#E5E5E5]'}`}>
                    <div className="flex items-center gap-3">
                      <Truck size={18} />
                      <div>
                        <p className="text-sm font-medium">Express Shipping</p>
                        <p className="text-xs text-[#999]">2-3 business days</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium">$15.00</span>
                      <input type="radio" name="shipping" checked={shippingMethod === 'express'} onChange={() => setShippingMethod('express')} className="accent-[#1A1A1A]" />
                    </div>
                  </label>
                </div>

                <button
                  onClick={() => setStep('payment')}
                  className="w-full bg-[#1A1A1A] text-white text-sm font-semibold uppercase tracking-[0.08em] py-4 hover:bg-[#333] transition-colors"
                >
                  Continue to Payment
                </button>
              </div>
            )}

            {step === 'payment' && (
              <div>
                <button onClick={() => setStep('shipping')} className="text-sm text-[#666] hover:text-[#1A1A1A] underline mb-6">
                  Edit shipping info
                </button>

                <h2 className="text-lg font-bold mb-6">Payment Method</h2>
                <div className="space-y-3 mb-8">
                  <label className={`flex items-center gap-3 p-4 border cursor-pointer transition-colors ${paymentMethod === 'card' ? 'border-[#1A1A1A] bg-[#F5F5F5]' : 'border-[#E5E5E5]'}`}>
                    <CreditCard size={18} />
                    <span className="text-sm font-medium">Credit / Debit Card</span>
                    <input type="radio" name="payment" checked={paymentMethod === 'card'} onChange={() => setPaymentMethod('card')} className="ml-auto accent-[#1A1A1A]" />
                  </label>
                  <label className={`flex items-center gap-3 p-4 border cursor-pointer transition-colors ${paymentMethod === 'paypal' ? 'border-[#1A1A1A] bg-[#F5F5F5]' : 'border-[#E5E5E5]'}`}>
                    <span className="text-sm font-bold tracking-wider">Pay</span>
                    <span className="text-sm font-medium">Pal</span>
                    <input type="radio" name="payment" checked={paymentMethod === 'paypal'} onChange={() => setPaymentMethod('paypal')} className="ml-auto accent-[#1A1A1A]" />
                  </label>
                </div>

                {paymentMethod === 'card' && (
                  <div className="mb-8">
                    <h3 className="text-sm font-semibold uppercase tracking-wider mb-4">Card Details</h3>
                    <input
                      placeholder="Card Number"
                      value={cardData.number}
                      onChange={e => setCardData({ ...cardData, number: e.target.value })}
                      className="w-full border border-[#E5E5E5] px-4 py-3 text-sm mb-4 outline-none focus:border-[#1A1A1A]"
                    />
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                      <input placeholder="MM/YY" value={cardData.expiry} onChange={e => setCardData({ ...cardData, expiry: e.target.value })} className="w-full border border-[#E5E5E5] px-4 py-3 text-sm outline-none focus:border-[#1A1A1A]" />
                      <input placeholder="CVV" value={cardData.cvv} onChange={e => setCardData({ ...cardData, cvv: e.target.value })} className="w-full border border-[#E5E5E5] px-4 py-3 text-sm outline-none focus:border-[#1A1A1A]" />
                      <input placeholder="ZIP" className="w-full border border-[#E5E5E5] px-4 py-3 text-sm outline-none focus:border-[#1A1A1A]" />
                    </div>
                    <input placeholder="Name on Card" value={cardData.name} onChange={e => setCardData({ ...cardData, name: e.target.value })} className="w-full border border-[#E5E5E5] px-4 py-3 text-sm outline-none focus:border-[#1A1A1A]" />
                  </div>
                )}

                <div className="flex items-center gap-2 text-sm text-[#666] mb-8">
                  <Lock size={14} />
                  <span>Your payment information is encrypted and secure.</span>
                </div>

                <button
                  onClick={handlePlaceOrder}
                  disabled={processing}
                  className="w-full bg-[#1A1A1A] text-white text-sm font-semibold uppercase tracking-[0.08em] py-4 hover:bg-[#333] transition-colors disabled:opacity-50"
                >
                  {processing ? 'Processing...' : `Place Order — $${total.toFixed(2)}`}
                </button>
              </div>
            )}
          </div>

          {/* Right: Order Summary */}
          <div className="w-full lg:w-[380px] shrink-0">
            <div className="bg-[#F5F5F5] p-6">
              <h3 className="font-bold mb-6">Order Summary</h3>

              {/* Items */}
              <div className="space-y-4 mb-6 max-h-[300px] overflow-y-auto">
                {items.map(item => (
                  <div key={item.id} className="flex items-center gap-3">
                    <div className="relative w-16 h-16 bg-white shrink-0">
                      <img src={item.product.images[0]} alt={item.product.name} className="w-full h-full object-cover" />
                      <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#1A1A1A] text-white text-[10px] flex items-center justify-center font-medium">
                        {item.quantity}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{item.product.name}</p>
                      {item.color && <p className="text-xs text-[#999]">{item.color}</p>}
                      {item.size && <p className="text-xs text-[#999]">{item.size}</p>}
                    </div>
                    <p className="text-sm font-medium">${((item.product.salePrice || item.product.price) * item.quantity).toFixed(2)}</p>
                  </div>
                ))}
              </div>

              {/* Promo */}
              <div className="flex items-center gap-2 mb-6 pb-6 border-b border-[#E5E5E5]">
                <input
                  type="text"
                  placeholder="Promo code"
                  value={promoCode}
                  onChange={e => setPromoCode(e.target.value)}
                  className="flex-1 bg-white border border-[#E5E5E5] px-3 py-2.5 text-sm outline-none focus:border-[#1A1A1A]"
                />
                <button
                  onClick={handleApplyPromo}
                  className="bg-[#1A1A1A] text-white text-xs font-semibold uppercase tracking-wider px-4 py-2.5 hover:bg-[#333] transition-colors"
                >
                  Apply
                </button>
              </div>

              {/* Totals */}
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-[#666]">Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                {promoApplied && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Discount (SAVE10)</span>
                    <span>-${discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-[#666]">Shipping</span>
                  <span>{shippingCost === 0 ? 'FREE' : `$${shippingCost.toFixed(2)}`}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[#666]">Tax</span>
                  <span>${tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between pt-3 border-t border-[#E5E5E5]">
                  <span className="font-bold">Total</span>
                  <span className="font-bold text-xl">${total.toFixed(2)}</span>
                </div>
              </div>

              {/* Security */}
              <div className="flex items-center justify-center gap-2 text-xs text-[#999]">
                <ShieldCheck size={14} />
                <span>Secure checkout</span>
                <Lock size={14} />
                <span>SSL encrypted</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
