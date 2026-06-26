import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useProducts } from '@/hooks/useProducts';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { showToast } from '@/components/ToastContainer';
import type { Product } from '@/data/products';

function HeroSection() {
  return (
    <section className="relative w-full h-[600px] md:h-[700px] lg:h-[85vh] overflow-hidden mt-[72px]">
      <div className="absolute inset-0">
        <img src="/hero-img.jpeg" alt="University merchandise" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#F0EDE8]/90 via-[#F0EDE8]/50 to-transparent" />
      </div>
      <div className="relative z-10 h-full flex items-center max-w-[1440px] mx-auto px-6 lg:px-12">
        <div className="max-w-[600px]">
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold leading-[1.05] tracking-tight text-[#1A1A1A] mb-8">
            WEAR<br />YOUR<br />JOURNEY!
          </h1>
          <Link
            to="/shop"
            className="inline-block bg-[#1A1A1A] text-white text-xs font-semibold tracking-[0.08em] uppercase px-8 py-4 hover:bg-[#333] transition-colors"
          >
            Shop Collection
          </Link>
        </div>
      </div>
    </section>
  );
}

const categoryTiles = [
  { name: 'Hoodies', image: '/Hoodies.jpeg' },
  { name: 'Sweatshirts', image: '/SweatShirt.jpeg' },
  { name: 'T-Shirts', image: '/T-Shirt.jpeg' },
  { name: 'Bottoms', image: '/Bottom.jpeg' },
  { name: 'Caps', image: '/Caps.jpeg' },
  { name: 'Accessories', image: '/Accesories.jpeg' },
];

function CategoriesSection() {
  return (
    <section className="py-20 md:py-28">
      <div className="max-w-[1440px] mx-auto px-6 lg:px-12">
        <h2 className="text-3xl md:text-4xl font-bold text-center tracking-tight mb-12">CATEGORIES</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
          {categoryTiles.map(c => (
            <Link key={c.name} to={`/shop?category=${c.name}`} className="group block text-center">
              <div className="bg-[#F5F5F5] overflow-hidden mb-3">
                <img
                  src={c.image}
                  alt={c.name}
                  className="w-full aspect-square object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <span className="text-sm font-semibold uppercase tracking-wide text-[#1A1A1A]">{c.name}</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

function FeaturedProductsSection() {
  const { products } = useProducts({ featured: true });
  const { addToCart } = useCart();
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();
  const [current, setCurrent] = useState(0);
  const featured = products.slice(0, 3);
  const active = featured[current];
  const activeInWishlist = active ? isInWishlist(active.id) : false;

  useEffect(() => {
    if (featured.length <= 1) return;
    const timer = setInterval(() => {
      setCurrent(prev => (prev + 1) % featured.length);
    }, 3500);
    return () => clearInterval(timer);
  }, [featured.length]);

  return (
    <section className="bg-[#1A1A1A] text-white">
      <div className="max-w-[1440px] mx-auto px-6 lg:px-12 py-16 md:py-20 grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">
        <h2 className="text-5xl md:text-6xl lg:text-7xl font-extrabold leading-[0.95] tracking-tight">
          FEATURED<br />PRODUCTS!
        </h2>
        <div className="flex justify-center lg:justify-end">
          <div className="group relative bg-white p-4 max-w-[440px] w-full">
            <img
              src={active?.images?.[0] ?? '/product-wool-coat.jpg'}
              alt={active?.name ?? 'Featured product'}
              className="w-full aspect-square object-cover"
            />
            {active && (
              <div className="absolute bottom-10 left-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                <button
                  onClick={() => { addToCart(active); showToast('Added to cart'); }}
                  className="flex-1 bg-[#1A1A1A] text-white text-[11px] font-semibold uppercase tracking-wider py-2.5 hover:bg-[#333] transition-colors"
                >
                  Add to Cart
                </button>
                <button
                  onClick={() => {
                    if (activeInWishlist) { removeFromWishlist(active.id); showToast('Removed from wishlist'); }
                    else { addToWishlist(active); showToast('Added to wishlist'); }
                  }}
                  className={`w-10 flex items-center justify-center border ${activeInWishlist ? 'bg-[#1A1A1A] text-white border-[#1A1A1A]' : 'bg-white text-[#1A1A1A] border-[#E5E5E5]'} hover:bg-[#1A1A1A] hover:text-white transition-colors`}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill={activeInWishlist ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                </button>
              </div>
            )}
            {featured.length > 1 && (
              <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-2">
                {featured.map((p, i) => (
                  <button
                    key={p.id}
                    onClick={() => setCurrent(i)}
                    aria-label={`Show ${p.name}`}
                    className={`w-2 h-2 rounded-full transition-colors ${i === current ? 'bg-[#1A1A1A]' : 'bg-[#1A1A1A]/25'}`}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function ProductTile({ product }: { product: Product }) {
  const { addToCart } = useCart();
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();
  const inWishlist = isInWishlist(product.id);

  return (
    <div className="group">
      <div className="relative bg-[#F5F5F5] overflow-hidden">
        <Link to={`/product/${product.slug}`}>
          <img
            src={product.images[0]}
            alt={product.name}
            className="w-full aspect-square object-cover group-hover:scale-105 transition-transform duration-500"
          />
        </Link>
        <div className="absolute bottom-0 left-0 right-0 p-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity translate-y-2 group-hover:translate-y-0 duration-300">
          <button
            onClick={() => { addToCart(product); showToast('Added to cart'); }}
            className="flex-1 bg-[#1A1A1A] text-white text-[11px] font-semibold uppercase tracking-wider py-2.5 hover:bg-[#333] transition-colors"
          >
            Add to Cart
          </button>
          <button
            onClick={() => {
              if (inWishlist) { removeFromWishlist(product.id); showToast('Removed from wishlist'); }
              else { addToWishlist(product); showToast('Added to wishlist'); }
            }}
            className={`w-10 flex items-center justify-center border ${inWishlist ? 'bg-[#1A1A1A] text-white border-[#1A1A1A]' : 'bg-white text-[#1A1A1A] border-[#E5E5E5]'} hover:bg-[#1A1A1A] hover:text-white transition-colors`}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill={inWishlist ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
          </button>
        </div>
      </div>
      <div className="mt-3 text-center">
        <Link to={`/product/${product.slug}`} className="text-sm font-medium text-[#1A1A1A] hover:underline">
          {product.name}
        </Link>
        <div className="mt-1">
          {product.salePrice ? (
            <>
              <span className="text-sm font-semibold mr-2">${product.salePrice.toFixed(2)}</span>
              <span className="text-sm text-[#999] line-through">${product.price.toFixed(2)}</span>
            </>
          ) : (
            <span className="text-sm font-semibold">${product.price.toFixed(2)}</span>
          )}
        </div>
      </div>
    </div>
  );
}

function BestSellersSection() {
  const { products } = useProducts();
  const bestSellers = products.slice(0, 6);

  return (
    <section className="py-20 md:py-28">
      <div className="max-w-[1440px] mx-auto px-6 lg:px-12">
        <h2 className="text-3xl md:text-4xl font-bold text-center tracking-tight mb-3">BEST SELLERS</h2>
        <div className="w-32 h-1 bg-[#1A1A1A] mx-auto mb-12" />
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6 lg:gap-8">
          {bestSellers.map(p => <ProductTile key={p.id} product={p} />)}
        </div>
      </div>
    </section>
  );
}

const universities = [
  { name: 'University of Birmingham', logo: '/University-of-Birmingham.jpeg' },
  { name: 'Middlesex University', logo: '/Middlesex-University.jpeg' },
  { name: 'Heriot Watt University', logo: '/Heriot-Watt-University.jpeg' },
  { name: 'University of Wollongong', logo: '/University-of-Wollongong.jpeg' },
  { name: 'New York University', logo: '/New-York-University.jpeg' },
  { name: 'De Montfort University', logo: '/De-Montfort-University.jpeg' },
];

function UniversitiesSection() {
  return (
    <section className="bg-[#F0EDE8] py-20 md:py-28">
      <div className="max-w-[1440px] mx-auto px-6 lg:px-12">
        <h2 className="text-2xl md:text-3xl font-bold text-center text-black tracking-tight mb-12">
          SEARCH BY OUR TOP UNIVERSITIES!
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
          {universities.map(u => (
            <Link
              key={u.name}
              to={`/shop?university=${encodeURIComponent(u.name)}`}
              className="group bg-[#F0EDE8] aspect-square flex items-center justify-center p-6 hover:bg-white transition-colors"
            >
              <img
                src={u.logo}
                alt={u.name}
                className="max-w-full max-h-full object-contain group-hover:scale-105 transition-transform duration-300"
              />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

export function HomePagePreview() {
  return (
    <>
      <HeroSection />
      <CategoriesSection />
      <FeaturedProductsSection />
      <BestSellersSection />
      <UniversitiesSection />
    </>
  );
}
