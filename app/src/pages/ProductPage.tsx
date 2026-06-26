import { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Heart, HelpCircle, Truck, Share2, Check, Star, ChevronLeft, ChevronRight, ShoppingBag, Lock, RefreshCw, Search } from 'lucide-react';
import { useProduct, useProducts } from '@/hooks/useProducts';
import type { Product } from '@/data/products';

function CollectionRow({ title, products }: { title: string; products: Product[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);

  if (products.length === 0) return null;

  const scrollNext = () => {
    scrollRef.current?.scrollBy({ left: 280, behavior: 'smooth' });
  };

  return (
    <div className="max-w-[1440px] mx-auto px-6 lg:px-12 py-10">
      <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-6">{title}</h2>
      <div className="relative">
        <div ref={scrollRef} className="flex gap-6 overflow-x-auto scroll-smooth pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {products.map(p => <CollectionCard key={p.id} product={p} />)}
        </div>
        {products.length > 4 && (
          <button
            onClick={scrollNext}
            className="hidden md:flex absolute right-0 top-1/3 -translate-y-1/2 w-9 h-9 rounded-full bg-white shadow items-center justify-center"
            aria-label="Show more"
          >
            <ChevronRight size={18} />
          </button>
        )}
      </div>
    </div>
  );
}

function CollectionCard({ product }: { product: Product }) {
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();
  const inWishlist = isInWishlist(product.id);

  return (
    <div className="shrink-0 w-[calc(50%-12px)] md:w-[calc(25%-18px)]">
      <div className="relative bg-white overflow-hidden">
        <Link to={`/product/${product.slug}`}>
          <img src={product.images[0]} alt={product.name} className="w-full aspect-square object-cover" />
        </Link>
        <button
          onClick={() => {
            if (inWishlist) { removeFromWishlist(product.id); showToast('Removed from wishlist'); }
            else { addToWishlist(product); showToast('Added to wishlist'); }
          }}
          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white flex items-center justify-center shadow"
        >
          <Heart size={14} fill={inWishlist ? 'currentColor' : 'none'} />
        </button>
      </div>
      <div className="mt-3">
        <Link to={`/product/${product.slug}`} className="text-sm font-medium text-[#1A1A1A] hover:underline">{product.name}</Link>
      </div>
    </div>
  );
}
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { showToast } from '@/components/ToastContainer';
import gsap from 'gsap';

export function ProductPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { product, loading } = useProduct(slug);
  const { addToCart } = useCart();
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();
  const sectionRef = useRef<HTMLDivElement>(null);

  const [selectedColor, setSelectedColor] = useState(product?.colors?.[0]?.name || '');
  const [selectedSize, setSelectedSize] = useState(product?.sizes?.[0] || '');
  const [quantity, setQuantity] = useState(1);
  const [mainImage, setMainImage] = useState(0);
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, mins: 0, secs: 0 });
  const [zoomOpen, setZoomOpen] = useState(false);
  const { products: allProducts } = useProducts();

  const completeCollection = product
    ? allProducts.filter(p => p.id !== product.id && p.university && p.university === product.university).slice(0, 8)
    : [];
  const youMayAlsoLike = product
    ? allProducts.filter(p => p.id !== product.id).slice(0, 4)
    : [];

  useEffect(() => {
    if (product) {
      setSelectedColor(product.colors?.[0]?.name || '');
      setSelectedSize(product.sizes?.[0] || '');
      setMainImage(0);
      setQuantity(1);
    }
  }, [product]);

  useEffect(() => {
    if (!product?.countdownEnd) return;
    const end = new Date(product.countdownEnd).getTime();
    const tick = () => {
      const diff = end - Date.now();
      if (diff <= 0) return;
      setCountdown({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        mins: Math.floor((diff / (1000 * 60)) % 60),
        secs: Math.floor((diff / 1000) % 60),
      });
    };
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [product?.countdownEnd]);

  useEffect(() => {
    if (!sectionRef.current) return;
    const ctx = gsap.context(() => {
      gsap.from('.product-info-col', { x: 40, opacity: 0, duration: 0.8, scrollTrigger: { trigger: sectionRef.current, start: 'top 70%' } });
    }, sectionRef);
    return () => ctx.revert();
  }, [product]);

  if (loading) {
    return (
      <div className="mt-[72px] text-center py-20">
        <p className="text-[#666]">Loading product...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="mt-[72px] text-center py-20">
        <h1 className="text-2xl font-bold mb-4">Product not found</h1>
        <Link to="/shop" className="underline text-sm">Back to shop</Link>
      </div>
    );
  }

  const inWishlist = isInWishlist(product.id);

  const handleAddToCart = () => {
    addToCart(product, selectedColor, selectedSize, quantity);
    showToast('Added to cart');
  };

  const handleBuyNow = () => {
    addToCart(product, selectedColor, selectedSize, quantity);
    showToast('Added to cart');
    navigate('/checkout');
  };

  return (
    <div className="mt-[72px]" ref={sectionRef}>
      {/* Breadcrumb */}
      <div className="max-w-[1440px] mx-auto px-6 lg:px-12 py-4">
        <nav className="text-sm text-[#666]">
          <Link to="/" className="hover:underline">Home</Link>
          {product.university && (
            <>
              <span className="mx-2">/</span>
              <Link to={`/shop?university=${encodeURIComponent(product.university)}`} className="hover:underline">{product.university}</Link>
            </>
          )}
          <span className="mx-2">/</span>
          <Link to={`/shop?category=${encodeURIComponent(product.category)}`} className="hover:underline">{product.category}</Link>
          <span className="mx-2">/</span>
          <span className="text-[#1A1A1A]">{product.name}</span>
        </nav>
      </div>

      {/* Product Main */}
      <div className="max-w-[1440px] mx-auto px-6 lg:px-12 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Images */}
          <div>
            <div className="relative bg-[#F5F5F5] overflow-hidden mb-4 cursor-zoom-in max-h-[55vh] lg:max-h-[60vh]" onClick={() => setZoomOpen(true)}>
              <img src={product.images[mainImage]} alt={product.name} className="w-full h-[55vh] lg:h-[60vh] object-contain p-6" />
              {product.badge && (
                <span className="absolute top-4 right-4 bg-[#1A1A1A] text-white text-xs font-medium px-3 py-1.5">{product.badge}</span>
              )}
              <span className="absolute top-4 left-4 w-9 h-9 rounded-full bg-white flex items-center justify-center shadow">
                <Search size={16} />
              </span>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {product.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setMainImage(i)}
                  className={`bg-[#F5F5F5] border-2 overflow-hidden ${mainImage === i ? 'border-[#1A1A1A]' : 'border-transparent'}`}
                >
                  <img src={img} alt="" className="w-full aspect-square object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Info */}
          <div className="product-info-col">
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight mb-3">{product.name}</h1>
            <div className="flex items-center gap-3 mb-4">
              {product.salePrice ? (
                <>
                  <span className="text-2xl font-bold text-[#DC2626]">${product.salePrice.toFixed(2)}</span>
                  <span className="text-lg text-[#999] line-through">${product.price.toFixed(2)}</span>
                </>
              ) : (
                <span className="text-2xl font-bold">${product.price.toFixed(2)}</span>
              )}
            </div>
            {/* Rating */}
            {(product.rating || product.reviewCount) && (
              <div className="flex items-center gap-2 mb-4">
                <div className="flex">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} size={16} fill={i < Math.round(product.rating || 0) ? '#1A1A1A' : '#E5E5E5'} strokeWidth={0} />
                  ))}
                </div>
                <span className="text-sm text-[#666]">{(product.rating || 0).toFixed(1)} ({product.reviewCount || 0} Reviews)</span>
              </div>
            )}

            <p className="text-sm text-[#666] leading-relaxed mb-4">{product.description}</p>

            {/* Stock */}
            <div className="flex items-center gap-2 mb-4">
              <Check size={16} className="text-green-600" />
              <span className="text-sm font-medium text-green-600">In stock</span>
            </div>

            {/* Social proof */}
            {/* <div className="flex items-center gap-4 text-sm text-[#666] mb-4">
              <span className="flex items-center gap-1"><Eye size={14} /> 35 people are viewing this right now</span>
              <span className="flex items-center gap-1"><Flame size={14} /> 33 sold in last 10 hours</span>
            </div> */}

            {/* Countdown */}
            {product.countdownEnd && (
              <div className="mb-5">
                <p className="text-sm text-[#DC2626] font-medium mb-2">Hurry up! Sale ends in:</p>
                <div className="flex items-center gap-2 text-sm">
                  {['days', 'hours', 'mins', 'secs'].map((unit, i) => (
                    <span key={unit} className="flex items-center">
                      <span className="border border-[#E5E5E5] px-2.5 py-1.5 font-medium">
                        {String(Object.values(countdown)[i]).padStart(2, '0')}
                      </span>
                      <span className="text-[10px] text-[#999] ml-1">{unit}</span>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Color */}
            {product.colors && product.colors.length > 0 && (
              <div className="mb-5">
                <p className="text-sm font-medium mb-2">Color: {selectedColor}</p>
                <div className="flex items-center gap-2">
                  {product.colors.map(c => (
                    <button
                      key={c.name}
                      onClick={() => setSelectedColor(c.name)}
                      className={`w-8 h-8 rounded-full border-2 transition-all ${selectedColor === c.name ? 'border-[#1A1A1A] ring-2 ring-[#1A1A1A] ring-offset-2' : 'border-[#E5E5E5]'}`}
                      style={{ backgroundColor: c.hex }}
                      title={c.name}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Size */}
            {product.sizes && product.sizes.length > 0 && (
              <div className="mb-5">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium">Size: {selectedSize}</p>
                  <button className="text-xs underline text-[#666] flex items-center gap-1"><HelpCircle size={12} /> Size guide</button>
                </div>
                <div className="flex items-center gap-2">
                  {product.sizes.map(s => (
                    <button
                      key={s}
                      onClick={() => setSelectedSize(s)}
                      className={`min-w-[44px] px-3 py-2 text-sm font-medium border transition-all ${selectedSize === s ? 'bg-[#1A1A1A] text-white border-[#1A1A1A]' : 'bg-white text-[#1A1A1A] border-[#E5E5E5] hover:border-[#1A1A1A]'}`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Add to Cart */}
            <button
              onClick={handleAddToCart}
              className="w-full flex items-center justify-center gap-2 bg-[#1A1A1A] text-white text-sm font-semibold uppercase tracking-wider py-3.5 hover:bg-[#333] transition-colors mb-3"
            >
              <ShoppingBag size={16} /> Add to Cart
            </button>

            {/* Buy Now */}
            <button
              onClick={handleBuyNow}
              className="w-full bg-white text-[#1A1A1A] border border-[#1A1A1A] text-sm font-semibold uppercase tracking-wider py-3.5 hover:bg-[#1A1A1A] hover:text-white transition-colors mb-6"
            >
              Buy Now
            </button>

            {/* Wishlist / Share */}
            <div className="flex items-center justify-between text-sm text-[#666] mb-8">
              <button
                onClick={() => {
                  if (inWishlist) { removeFromWishlist(product.id); showToast('Removed from wishlist'); }
                  else { addToWishlist(product); showToast('Added to wishlist'); }
                }}
                className="flex items-center gap-1.5 hover:text-[#1A1A1A]"
              >
                <Heart size={16} fill={inWishlist ? 'currentColor' : 'none'} /> {inWishlist ? 'In Wishlist' : 'Add to Wishlist'}
              </button>
              <button className="flex items-center gap-1.5 hover:text-[#1A1A1A]">
                <Share2 size={16} /> Share
              </button>
            </div>

            {/* Trust badges */}
            <div className="grid grid-cols-4 gap-2 border border-[#E5E5E5] rounded-lg p-4 bg-[#FAFAFA]">
              {[
                { icon: Check, label: 'Official University Merchandise' },
                { icon: Lock, label: 'Secure Checkout' },
                { icon: Truck, label: 'Fast UAE Delivery' },
                { icon: RefreshCw, label: 'Easy Exchanges' },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="flex flex-col items-center text-center gap-1.5">
                  <Icon size={20} className="text-[#1A1A1A]" />
                  <span className="text-[11px] text-[#666] leading-tight">{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tabs */}
        {/* <div className="mt-16 border-t border-[#E5E5E5] pt-8">
          <div className="flex items-center gap-8 mb-8 border-b border-[#E5E5E5]">
            {['description', 'reviews', 'shipping', 'return'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-3 text-sm font-medium capitalize transition-colors ${activeTab === tab ? 'text-[#1A1A1A] border-b-2 border-[#1A1A1A]' : 'text-[#999] hover:text-[#1A1A1A]'}`}
              >
                {tab}
              </button>
            ))}
          </div>
          <div className="max-w-[800px]">
            {activeTab === 'description' && <p className="text-sm text-[#666] leading-relaxed">{product.description}</p>}
            {activeTab === 'reviews' && (
              <div>
                <div className="flex items-center gap-4 mb-6">
                  <div className="flex items-center gap-2">
                    <div className="flex">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} size={16} fill={i < Math.round(product.rating || 0) ? '#1A1A1A' : '#E5E5E5'} strokeWidth={0} />
                      ))}
                    </div>
                    <span className="text-sm font-medium">Based on {product.reviewCount || 0} reviews</span>
                  </div>
                </div>
                <p className="text-sm text-[#666]">Reviews will be displayed here.</p>
              </div>
            )}
            {activeTab === 'shipping' && (
              <div className="text-sm text-[#666] leading-relaxed space-y-3">
                <p>We offer worldwide shipping with trusted carriers. Standard delivery takes 5-7 business days, while express shipping delivers within 2-3 business days.</p>
                <p>Free standard shipping on orders over $100. All orders are fully tracked and insured.</p>
              </div>
            )}
            {activeTab === 'return' && (
              <div className="text-sm text-[#666] leading-relaxed space-y-3">
                <p>We accept returns within 30 days of delivery. Items must be unworn, unwashed, and in original packaging with tags attached.</p>
                <p>Exchanges are available for different sizes or colors. Return shipping is free for defective or incorrect items.</p>
              </div>
            )}
          </div>
        </div> */}
      </div>

      {/* Complete the Collection */}
      <CollectionRow title="Complete the Collection" products={completeCollection} />

      {/* You May Also Like */}
      {/* <div className="bg-[#F5F5F5]"> */}
        <CollectionRow title="You May Also Like" products={youMayAlsoLike} />
      {/* </div> */}

      {/* Zoom Modal */}
      {zoomOpen && (
        <div className="fixed inset-0 z-[60] bg-black/90 flex items-center justify-center" onClick={() => setZoomOpen(false)}>
          <button className="absolute top-6 right-6 text-white" onClick={() => setZoomOpen(false)}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
          <img src={product.images[mainImage]} alt={product.name} className="max-w-[90vw] max-h-[90vh] object-contain" onClick={e => e.stopPropagation()} />
          <div className="absolute bottom-6 flex items-center gap-4">
            <button onClick={() => setMainImage((mainImage - 1 + product.images.length) % product.images.length)} className="text-white p-2 hover:bg-white/10"><ChevronLeft size={24} /></button>
            <span className="text-white text-sm">{mainImage + 1} / {product.images.length}</span>
            <button onClick={() => setMainImage((mainImage + 1) % product.images.length)} className="text-white p-2 hover:bg-white/10"><ChevronRight size={24} /></button>
          </div>
        </div>
      )}
    </div>
  );
}
