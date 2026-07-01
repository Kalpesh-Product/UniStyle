import { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Heart, HelpCircle, Truck, Share2, Check, Star, ChevronLeft, ChevronRight, ShoppingBag, Lock, RefreshCw } from 'lucide-react';
import { useProduct, useProducts } from '@/hooks/useProducts';
import type { Product } from '@/data/products';
import { api, type BackendReview } from '@/lib/api';

function CollectionRow({ title, products }: { title: string; products: Product[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);

  if (products.length === 0) return null;

  const scrollNext = () => {
    scrollRef.current?.scrollBy({ left: 280, behavior: 'smooth' });
  };

  return (
    <div className="max-w-[1440px] mx-auto px-6 lg:px-12 py-10">
      <h2 className="font-playfair text-2xl md:text-3xl font-normal tracking-widest uppercase mb-6">{title}</h2>
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

function ZoomLightbox({ images, name, current, onChange, onClose }: {
  images: string[]; name: string; current: number;
  onChange: (i: number) => void; onClose: () => void;
}) {
  const prev = () => onChange((current - 1 + images.length) % images.length);
  const next = () => onChange((current + 1) % images.length);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') prev();
      else if (e.key === 'ArrowRight') next();
      else if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [current]);

  return (
    <div className="fixed inset-0 z-[60] bg-black/90 flex items-center justify-center" onClick={onClose}>
      <button className="absolute top-6 right-6 text-white hover:opacity-70" onClick={onClose}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      </button>
      <button
        className="absolute left-4 text-white p-3 hover:bg-white/10 rounded-full"
        onClick={e => { e.stopPropagation(); prev(); }}
      >
        <ChevronLeft size={28} />
      </button>
      <img src={images[current]} alt={name} className="max-w-[80vw] max-h-[85vh] object-contain" onClick={e => e.stopPropagation()} />
      <button
        className="absolute right-4 text-white p-3 hover:bg-white/10 rounded-full"
        onClick={e => { e.stopPropagation(); next(); }}
      >
        <ChevronRight size={28} />
      </button>
      <span className="absolute bottom-6 text-white text-sm">{current + 1} / {images.length}</span>
    </div>
  );
}

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
  const [reviews, setReviews] = useState<BackendReview[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
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
    if (!product?.id) return;
    setReviewsLoading(true);
    api.getProductReviews(product.id)
      .then(data => setReviews(data.reviews))
      .catch(() => setReviews([]))
      .finally(() => setReviewsLoading(false));
  }, [product?.id]);

  useEffect(() => {
    if (!sectionRef.current) return;
    const ctx = gsap.context(() => {
      gsap.from('.product-info-col', { x: 40, opacity: 0, duration: 0.8, scrollTrigger: { trigger: sectionRef.current, start: 'top 70%' } });
    }, sectionRef);
    return () => ctx.revert();
  }, [product]);

  const displayImages = (() => {
    if (selectedColor && product?.colors) {
      const colorObj = product.colors.find(c => c.name === selectedColor);
      if (colorObj?.images && colorObj.images.length > 0) return colorObj.images;
    }
    return product?.images ?? [];
  })();

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
            <div className="relative bg-[#E5E2E1] overflow-hidden mb-4 cursor-zoom-in max-h-[55vh] lg:max-h-[60vh]" onClick={() => setZoomOpen(true)}>
              <img src={displayImages[mainImage]} alt={product.name} className="w-full h-[55vh] lg:h-[60vh] object-contain p-6" />
              {product.badge && (
                <span className="absolute top-4 right-4 bg-[#1A1A1A] text-white text-xs font-medium px-3 py-1.5">{product.badge}</span>
              )}
              {displayImages.length > 1 && (
                <>
                  <button
                    onClick={e => { e.stopPropagation(); setMainImage(i => (i - 1 + displayImages.length) % displayImages.length); }}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 hover:bg-white flex items-center justify-center shadow transition-colors"
                    aria-label="Previous image"
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <button
                    onClick={e => { e.stopPropagation(); setMainImage(i => (i + 1) % displayImages.length); }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 hover:bg-white flex items-center justify-center shadow transition-colors"
                    aria-label="Next image"
                  >
                    <ChevronRight size={18} />
                  </button>
                  <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5">
                    {displayImages.map((_, i) => (
                      <button
                        key={i}
                        onClick={e => { e.stopPropagation(); setMainImage(i); }}
                        className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${i === mainImage ? 'bg-[#1A1A1A] scale-125' : 'bg-[#1A1A1A]/30'}`}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
            <div className="grid grid-cols-4 gap-2">
              {displayImages.map((img, i) => (
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
            <div className="flex items-start justify-between gap-4 mb-3">
              <h1 className="font-playfair text-2xl md:text-3xl font-normal tracking-widest">{product.name}</h1>
              <div className="flex items-center gap-3 text-[#666] shrink-0 pt-2">
                <button
                  onClick={() => {
                    if (inWishlist) { removeFromWishlist(product.id); showToast('Removed from wishlist'); }
                    else { addToWishlist(product); showToast('Added to wishlist'); }
                  }}
                  className="hover:text-[#1A1A1A] transition-colors"
                  title={inWishlist ? 'Remove from Wishlist' : 'Add to Wishlist'}
                >
                  <Heart size={20} fill={inWishlist ? 'currentColor' : 'none'} />
                </button>
                <button className="hover:text-[#1A1A1A] transition-colors" title="Share">
                  <Share2 size={20} />
                </button>
              </div>
            </div>
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
            {reviews.length > 0 && (() => {
              const avg = reviews.reduce((s, r) => s + r.rating, 0) / reviews.length;
              return (
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} size={16} fill={i < Math.round(avg) ? '#1A1A1A' : '#E5E5E5'} strokeWidth={0} />
                    ))}
                  </div>
                  <span className="text-sm text-[#666]">{avg.toFixed(1)} ({reviews.length} Reviews)</span>
                </div>
              );
            })()}

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
                      onClick={() => { setSelectedColor(c.name); setMainImage(0); }}
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

            {/* Add to Cart + Buy Now */}
            <div className="flex gap-3 mb-6">
              <button
                onClick={handleAddToCart}
                className="flex-1 flex items-center justify-center gap-2 bg-[#1A1A1A] text-white text-sm font-semibold uppercase tracking-wider py-3.5 hover:bg-[#333] transition-colors"
              >
                <ShoppingBag size={16} /> Add to Cart
              </button>
              <button
                onClick={handleBuyNow}
                className="flex-1 bg-white text-[#1A1A1A] border border-[#1A1A1A] text-sm font-semibold uppercase tracking-wider py-3.5 hover:bg-[#1A1A1A] hover:text-white transition-colors"
              >
                Buy Now
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

        {/* Reviews Section */}
        <div className="mt-16 border-t border-[#E5E5E5] pt-10">
          <div className="flex items-center justify-between mb-8">
            <h2 className="font-playfair text-2xl font-normal tracking-widest uppercase">Customer Reviews</h2>
            <span className="text-sm text-[#999]">{reviews.length} {reviews.length === 1 ? 'review' : 'reviews'}</span>
          </div>

          {reviewsLoading ? (
            <div className="flex flex-col gap-4">
              {[1, 2].map(i => (
                <div key={i} className="h-24 bg-[#F5F5F5] animate-pulse" />
              ))}
            </div>
          ) : reviews.length === 0 ? (
            <div className="text-center py-16 border border-dashed border-[#E5E5E5]">
              <Star size={32} className="mx-auto mb-3 text-[#E5E5E5]" strokeWidth={1} />
              <p className="text-sm font-medium text-[#1A1A1A] mb-1">No reviews yet</p>
              <p className="text-sm text-[#999]">Be the first to review this product after your purchase.</p>
            </div>
          ) : (() => {
            const avg = reviews.reduce((s, r) => s + r.rating, 0) / reviews.length;
            const breakdown = [5, 4, 3, 2, 1].map(star => ({
              star,
              count: reviews.filter(r => r.rating === star).length,
              pct: Math.round((reviews.filter(r => r.rating === star).length / reviews.length) * 100),
            }));
            return (
              <div>
                {/* Summary */}
                <div className="flex flex-col sm:flex-row gap-8 mb-10 pb-10 border-b border-[#E5E5E5]">
                  {/* Big avg */}
                  <div className="flex flex-col items-center justify-center min-w-[140px] bg-[#F9F9F9] border border-[#E5E5E5] px-8 py-6">
                    <span className="text-5xl font-bold tracking-tight text-[#1A1A1A]">{avg.toFixed(1)}</span>
                    <div className="flex gap-0.5 my-2">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} size={16} fill={i < Math.round(avg) ? '#1A1A1A' : '#E5E5E5'} strokeWidth={0} />
                      ))}
                    </div>
                    <span className="text-xs text-[#999] uppercase tracking-wider">{reviews.length} Reviews</span>
                  </div>

                  {/* Breakdown bars */}
                  <div className="flex-1 flex flex-col justify-center gap-2.5">
                    {breakdown.map(({ star, count, pct }) => (
                      <div key={star} className="flex items-center gap-3">
                        <div className="flex gap-0.5 shrink-0">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star key={i} size={11} fill={i < star ? '#1A1A1A' : '#E5E5E5'} strokeWidth={0} />
                          ))}
                        </div>
                        <div className="flex-1 h-1.5 bg-[#E5E5E5] rounded-full overflow-hidden">
                          <div className="h-full bg-[#1A1A1A] rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
                        </div>
                        <span className="text-xs text-[#999] w-8 text-right shrink-0">{count}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Review cards */}
                <div className="flex flex-col gap-6">
                  {reviews.map(review => {
                    const user = review.userId as unknown as { firstName?: string; lastName?: string };
                    const firstName = user?.firstName || '';
                    const lastName = user?.lastName || '';
                    const name = [firstName, lastName].filter(Boolean).join(' ') || 'Customer';
                    const initials = [firstName[0], lastName[0]].filter(Boolean).join('').toUpperCase() || 'C';
                    return (
                      <div key={review._id} className="border border-[#E5E5E5] p-5">
                        <div className="flex items-start gap-4">
                          {/* Avatar */}
                          <div className="w-9 h-9 rounded-full bg-[#1A1A1A] text-white text-xs font-bold flex items-center justify-center shrink-0">
                            {initials}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2 mb-1">
                              <span className="text-sm font-semibold text-[#1A1A1A]">{name}</span>
                              <span className="text-xs text-[#999] shrink-0">{new Date(review.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                            </div>
                            <div className="flex gap-0.5 mb-2">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <Star key={i} size={13} fill={i < review.rating ? '#1A1A1A' : '#E5E5E5'} strokeWidth={0} />
                              ))}
                            </div>
                            <p className="text-sm text-[#555] leading-relaxed">{review.comment}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })()}
        </div>
      </div>

      {/* Complete the Collection */}
      <CollectionRow title="Complete the Collection" products={completeCollection} />

      {/* You May Also Like */}
      {/* <div className="bg-[#F5F5F5]"> */}
        <CollectionRow title="You May Also Like" products={youMayAlsoLike} />
      {/* </div> */}

      {/* Zoom Modal */}
      {zoomOpen && (
        <ZoomLightbox
          images={displayImages}
          name={product.name}
          current={mainImage}
          onChange={setMainImage}
          onClose={() => setZoomOpen(false)}
        />
      )}
    </div>
  );
}
