import { Link, useNavigate } from 'react-router-dom';
import { Minus, Plus, X, ShoppingBag, Heart, Lock, ChevronLeft } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { useProducts } from '@/hooks/useProducts';
import { showToast } from '@/components/ToastContainer';

function YouMayAlsoLike() {
  const { products } = useProducts();
  const { addToCart } = useCart();
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();
  const suggestions = products.slice(0, 4);

  if (suggestions.length === 0) return null;

  return (
    <div className="border border-[#E5E5E5] p-6">
      <h3 className="text-sm font-bold uppercase tracking-wider mb-5">You May Also Like</h3>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {suggestions.map(product => {
          const inWishlist = isInWishlist(product.id);
          return (
            <div key={product.id} className="group">
              <div className="relative bg-[#F5F5F5] overflow-hidden mb-3">
                <Link to={`/product/${product.slug}`}>
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    className="w-full aspect-square object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </Link>
                <button
                  onClick={() => {
                    if (inWishlist) {
                      removeFromWishlist(product.id);
                      showToast('Removed from wishlist');
                    } else {
                      addToWishlist(product);
                      showToast('Added to wishlist');
                    }
                  }}
                  className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm hover:bg-[#F5F5F5] transition-colors"
                  aria-label="Add to wishlist"
                >
                  <Heart
                    size={14}
                    fill={inWishlist ? 'currentColor' : 'none'}
                    className={inWishlist ? 'text-[#1A1A1A]' : 'text-[#666]'}
                  />
                </button>
              </div>
              <Link to={`/product/${product.slug}`} className="block text-sm font-medium text-[#1A1A1A] hover:underline leading-snug mb-1 truncate">
                {product.name}
              </Link>
              <p className="text-sm font-semibold mb-3">
                ${(product.salePrice ?? product.price).toFixed(2)}
              </p>
              <button
                onClick={() => { addToCart(product); showToast('Added to cart'); }}
                className="w-full border border-[#1A1A1A] text-[#1A1A1A] text-[11px] font-semibold uppercase tracking-wider py-2.5 hover:bg-[#1A1A1A] hover:text-white transition-colors"
              >
                Add to Cart
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function CartPage() {
  const { items, removeFromCart, updateQuantity, subtotal } = useCart();
  const navigate = useNavigate();

  if (items.length === 0) {
    return (
      <div className="mt-[72px] min-h-[60vh]">
        <div className="max-w-[1400px] mx-auto px-4 md:px-6 py-12">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight mb-10 text-center">SHOPPING CART</h1>

          {/* Empty message */}
          <div className="text-center py-10 mb-10">
            <div className="w-16 h-16 rounded-full border-2 border-[#E5E5E5] flex items-center justify-center mx-auto mb-5">
              <ShoppingBag size={28} strokeWidth={1.5} className="text-[#999]" />
            </div>
            <h2 className="text-base font-bold uppercase tracking-wider mb-3">Your Cart Is Currently Empty</h2>
            <p className="text-sm text-[#666] mb-8 max-w-[420px] mx-auto leading-relaxed">
              Before proceed to checkout you must add some products to your shopping cart.
              You will find a lot of interesting products on our Website.
            </p>
            <Link
              to="/shop"
              className="inline-block bg-[#1A1A1A] text-white text-xs font-semibold uppercase tracking-[0.1em] px-10 py-4 hover:bg-[#333] transition-colors"
            >
              Go To Shopping
            </Link>
          </div>

          {/* You May Also Like + Order Summary */}
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="flex-1 min-w-0">
              <YouMayAlsoLike />
            </div>

            {/* Order Summary */}
            <div className="w-full lg:w-[320px] shrink-0">
              <div className="border border-[#E5E5E5] p-6">
                <h3 className="text-sm font-bold uppercase tracking-wider mb-6">Order Summary</h3>
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-[#666]">Subtotal</span>
                    <span className="font-medium">$0.00</span>
                  </div>
                  <div className="flex justify-between text-sm pb-4 border-b border-[#E5E5E5]">
                    <span className="text-[#666]">Shipping</span>
                    <span className="font-medium">$0.00</span>
                  </div>
                  <div className="flex justify-between text-sm pt-1">
                    <span className="font-bold">Total</span>
                    <span className="font-bold text-lg">$0.00</span>
                  </div>
                </div>
                <button
                  disabled
                  className="w-full bg-[#1A1A1A] text-white text-xs font-semibold uppercase tracking-[0.1em] py-4 mb-3 opacity-50 cursor-not-allowed"
                >
                  Proceed to Checkout
                </button>
                <Link
                  to="/shop"
                  className="block text-center w-full border border-[#1A1A1A] text-[#1A1A1A] text-xs font-semibold uppercase tracking-[0.1em] py-4 mb-4 hover:bg-[#F5F5F5] transition-colors"
                >
                  Continue Shopping
                </Link>
                <div className="flex items-center justify-center gap-2 text-xs text-[#999]">
                  <Lock size={12} />
                  <span>Secure Checkout</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-[72px] min-h-[60vh]">
      <div className="max-w-[1400px] mx-auto px-4 md:px-6 py-12">
        {/* Title + item count */}
        <div className="text-center mb-10">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">SHOPPING CART</h1>
          <p className="text-sm text-[#999] mt-1">{items.length} {items.length === 1 ? 'Item' : 'Items'}</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Cart Items */}
          <div className="flex-1 min-w-0">
            {/* Table header */}
            <div className="hidden md:grid md:grid-cols-[2fr_1fr_1fr_1fr_40px] pb-3 mb-2 border-b border-[#E5E5E5] text-xs font-medium uppercase tracking-wider text-[#999]">
              <span>Product</span>
              <span>Price</span>
              <span>Quantity</span>
              <span>Total</span>
              <span></span>
            </div>

            {/* Items */}
            <div className="divide-y divide-[#E5E5E5]">
              {items.map(item => {
                const itemPrice = item.product.salePrice || item.product.price;
                const meta = [item.color, item.size ? `Size ${item.size}` : null].filter(Boolean).join(' • ');
                return (
                  <div key={item.id} className="flex flex-col md:grid md:grid-cols-[2fr_1fr_1fr_1fr_40px] items-start md:items-center gap-4 py-5">
                    {/* Product info */}
                    <div className="flex items-center gap-4">
                      <Link to={`/product/${item.product.slug}`} className="w-[72px] h-[72px] bg-[#F5F5F5] shrink-0 overflow-hidden">
                        <img src={item.product.images[0]} alt={item.product.name} className="w-full h-full object-cover" />
                      </Link>
                      <div>
                        <Link to={`/product/${item.product.slug}`} className="text-sm font-semibold text-[#1A1A1A] hover:underline leading-snug">
                          {item.product.name}
                        </Link>
                        {meta && <p className="text-xs text-[#999] mt-1">{meta}</p>}
                        <p className="text-xs text-[#999] mt-0.5 md:hidden">${itemPrice.toFixed(2)}</p>
                      </div>
                    </div>

                    {/* Price */}
                    <div className="hidden md:block text-sm text-[#1A1A1A]">${itemPrice.toFixed(2)}</div>

                    {/* Quantity stepper */}
                    <div className="flex items-center border border-[#E5E5E5]">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="w-9 h-9 flex items-center justify-center hover:bg-[#F5F5F5] transition-colors"
                      >
                        <Minus size={12} />
                      </button>
                      <span className="w-10 text-center text-sm font-medium">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="w-9 h-9 flex items-center justify-center hover:bg-[#F5F5F5] transition-colors"
                      >
                        <Plus size={12} />
                      </button>
                    </div>

                    {/* Line total */}
                    <div className="text-sm font-semibold text-[#1A1A1A]">${(itemPrice * item.quantity).toFixed(2)}</div>

                    {/* Remove */}
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="text-[#999] hover:text-[#DC2626] transition-colors"
                      aria-label="Remove item"
                    >
                      <X size={16} />
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Continue Shopping button */}
            <div className="mt-6">
              <Link
                to="/shop"
                className="inline-flex items-center gap-2 border border-[#E5E5E5] text-[#1A1A1A] text-xs font-semibold uppercase tracking-[0.08em] px-6 py-3 hover:border-[#1A1A1A] transition-colors"
              >
                <ChevronLeft size={14} />
                Continue Shopping
              </Link>
            </div>
          </div>

          {/* Cart Totals */}
          <div className="w-full lg:w-[300px] xl:w-[340px] shrink-0">
            <div className="border border-[#E5E5E5] p-6">
              <h3 className="text-base font-bold uppercase tracking-wider mb-6">Cart Totals</h3>

              <div className="space-y-3 mb-5">
                <div className="flex justify-between text-sm">
                  <span className="text-[#666]">Subtotal</span>
                  <span className="font-medium">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm pb-5 border-b border-[#E5E5E5]">
                  <span className="text-[#666]">Shipping</span>
                  <span className="text-[#999] text-xs">Calculated at checkout</span>
                </div>
                <div className="flex justify-between items-center pt-1">
                  <span className="text-sm font-bold">Total</span>
                  <span className="font-bold text-xl">${subtotal.toFixed(2)}</span>
                </div>
              </div>

              <button
                onClick={() => navigate('/checkout')}
                className="w-full bg-[#1A1A1A] text-white text-xs font-semibold uppercase tracking-[0.1em] py-4 hover:bg-[#333] transition-colors mb-3"
              >
                Proceed to Checkout
              </button>
              <Link
                to="/shop"
                className="block text-center w-full border border-[#E5E5E5] text-[#1A1A1A] text-xs font-semibold uppercase tracking-[0.1em] py-4 hover:border-[#1A1A1A] transition-colors mb-5"
              >
                Continue Shopping
              </Link>

              <div className="flex items-center justify-center gap-2 text-xs text-[#999]">
                <Lock size={12} />
                <span>Secure Checkout</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
