import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { Product } from '@/data/products';
import { useProducts } from '@/hooks/useProducts';
import { blogPosts } from '@/data/blog';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { showToast } from '@/components/ToastContainer';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const heroSlides = [
  {
    caption: 'SIGNATURE COLLECTION',
    title: 'REFINED MODERN STYLE',
    cta1: 'SHOP COLLECTION',
    cta2: 'BEST SELLER',
    image: '/hero-1.jpg',
  },
  {
    caption: 'NEW ARRIVALS',
    title: 'ELEVATED EVERYDAY WEAR',
    cta1: 'SHOP NOW',
    cta2: 'VIEW LOOKBOOK',
    image: '/hero-2.jpg',
  },
];

function HeroSection() {
  const [current, setCurrent] = useState(0);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent(prev => (prev + 1) % heroSlides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const next = () => setCurrent(prev => (prev + 1) % heroSlides.length);
  const prev = () => setCurrent(prev => (prev - 1 + heroSlides.length) % heroSlides.length);

  const slide = heroSlides[current];

  return (
    <section ref={sectionRef} className="relative w-full h-[600px] md:h-[700px] lg:h-[85vh] overflow-hidden mt-[72px]">
      {/* Background */}
      <div className="absolute inset-0 transition-opacity duration-700">
        <img src={slide.image} alt="" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#F0EDE8]/90 via-[#F0EDE8]/50 to-transparent" />
      </div>

      {/* Content */}
      <div className="relative z-10 h-full flex items-center max-w-[1440px] mx-auto px-6 lg:px-12">
        <div className="max-w-[600px]">
          <p className="text-xs font-medium tracking-[0.15em] text-[#666] mb-4">{slide.caption}</p>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-[1.05] tracking-tight text-[#1A1A1A] mb-8">
            {slide.title}
          </h1>
          <div className="flex flex-wrap gap-4">
            <Link
              to="/shop"
              className="inline-block bg-[#1A1A1A] text-white text-xs font-semibold tracking-[0.08em] uppercase px-8 py-4 hover:bg-[#333] transition-colors"
            >
              {slide.cta1}
            </Link>
            <Link
              to="/shop"
              className="inline-block bg-transparent text-[#1A1A1A] border border-[#1A1A1A] text-xs font-semibold tracking-[0.08em] uppercase px-8 py-4 hover:bg-[#1A1A1A] hover:text-white transition-colors"
            >
              {slide.cta2}
            </Link>
          </div>
        </div>
      </div>

      {/* Arrows */}
      <div className="absolute bottom-8 right-8 z-10 flex gap-3">
        <button
          onClick={prev}
          className="w-10 h-10 rounded-full border border-white/50 bg-white/80 flex items-center justify-center hover:bg-white transition-colors"
          aria-label="Previous slide"
        >
          <ChevronLeft size={18} />
        </button>
        <button
          onClick={next}
          className="w-10 h-10 rounded-full border border-white/50 bg-white/80 flex items-center justify-center hover:bg-white transition-colors"
          aria-label="Next slide"
        >
          <ChevronRight size={18} />
        </button>
      </div>
    </section>
  );
}

function ProductCard({ product, small }: { product: Product; small?: boolean }) {
  const { addToCart } = useCart();
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();

  const handleAdd = () => {
    addToCart(product);
    showToast('Added to cart');
  };

  const inWishlist = isInWishlist(product.id);

  return (
    <div className="group animate-fade-in">
      <div className="relative bg-[#F5F5F5] overflow-hidden">
        <Link to={`/product/${product.slug}`}>
          <img
            src={product.images[0]}
            alt={product.name}
            className={`w-full object-cover ${small ? 'aspect-[3/4]' : 'aspect-square'} group-hover:scale-105 transition-transform duration-500`}
          />
        </Link>
        {product.badge && (
          <span className="absolute top-3 left-3 bg-[#1A1A1A] text-white text-[11px] font-medium px-2 py-1">
            {product.badge}
          </span>
        )}
        {/* Quick actions */}
        <div className="absolute bottom-0 left-0 right-0 p-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity translate-y-2 group-hover:translate-y-0 duration-300">
          <button
            onClick={handleAdd}
            className="flex-1 bg-[#1A1A1A] text-white text-[11px] font-semibold uppercase tracking-wider py-2.5 hover:bg-[#333] transition-colors"
          >
            Add to Cart
          </button>
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
            className={`w-10 flex items-center justify-center border ${inWishlist ? 'bg-[#1A1A1A] text-white border-[#1A1A1A]' : 'bg-white text-[#1A1A1A] border-[#E5E5E5]'} hover:bg-[#1A1A1A] hover:text-white transition-colors`}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill={inWishlist ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
          </button>
        </div>
      </div>
      <div className="mt-3">
        <Link to={`/product/${product.slug}`} className="text-sm font-medium text-[#1A1A1A] hover:underline">
          {product.name}
        </Link>
        <div className="flex items-center gap-2 mt-1">
          {product.salePrice ? (
            <>
              <span className="text-sm font-semibold">${product.salePrice.toFixed(2)}</span>
              <span className="text-sm text-[#999] line-through">${product.price.toFixed(2)}</span>
            </>
          ) : (
            <span className="text-sm font-semibold">${product.price.toFixed(2)}</span>
          )}
        </div>
        {product.colors && (
          <div className="flex items-center gap-1.5 mt-2">
            {product.colors.map(c => (
              <span
                key={c.name}
                className="w-3.5 h-3.5 rounded-full border border-[#E5E5E5]"
                style={{ backgroundColor: c.hex }}
                title={c.name}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const categoryTiles = [
  { name: 'Women', image: '/product-trench.jpg' },
  { name: 'Men', image: '/product-henley.jpg' },
  { name: 'Bags', image: '/product-bag-black.jpg' },
  { name: 'Shoes', image: '/product-shoes.jpg' },
];

function CategoryShowcase() {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!sectionRef.current) return;
    const ctx = gsap.context(() => {
      gsap.from('.cat-title', { y: 30, opacity: 0, duration: 0.6, scrollTrigger: { trigger: sectionRef.current, start: 'top 80%' } });
      gsap.from('.cat-card', { y: 40, opacity: 0, duration: 0.6, stagger: 0.15, scrollTrigger: { trigger: sectionRef.current, start: 'top 70%' } });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="py-20 md:py-28 relative overflow-hidden">
      {/* Watermark */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
        <span className="text-[120px] md:text-[200px] font-extrabold text-[#F0F0F0] tracking-tight whitespace-nowrap">
          MODERN FASHION
        </span>
      </div>
      <div className="max-w-[1440px] mx-auto px-6 lg:px-12 relative z-10">
        <h2 className="cat-title text-3xl md:text-4xl font-bold text-center tracking-tight mb-12">CATEGORIES</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {categoryTiles.map(c => (
            <Link key={c.name} to={`/shop?category=${c.name}`} className="cat-card group relative block overflow-hidden bg-[#F5F5F5]">
              <img
                src={c.image}
                alt={c.name}
                className="w-full aspect-[3/4] object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors" />
              <span className="absolute bottom-5 left-5 text-white text-lg font-semibold tracking-wide uppercase drop-shadow">
                {c.name}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

function DarkFeature() {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!sectionRef.current) return;
    const ctx = gsap.context(() => {
      gsap.from('.df-text', { x: -40, opacity: 0, duration: 0.8, scrollTrigger: { trigger: sectionRef.current, start: 'top 70%' } });
      gsap.from('.df-image', { x: 40, opacity: 0, duration: 0.8, scrollTrigger: { trigger: sectionRef.current, start: 'top 70%' } });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="bg-[#1A1A1A] text-white">
      <div className="max-w-[1440px] mx-auto px-6 lg:px-12 py-20 md:py-28">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="df-text">
            <p className="text-xs font-medium tracking-[0.15em] text-white/60 mb-6 uppercase">
              A Curated Collection of Modern Fashion Essentials
            </p>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold leading-[1.1] tracking-tight">
              TIMELESS FASHION PIECES<br />
              DESIGNED FOR MODERN EVERYDAY<br />
              LIVING
            </h2>
          </div>
          <div className="df-image flex justify-center lg:justify-end">
            <div className="bg-white p-4 shadow-2xl max-w-[360px]">
              <img src="/product-wool-coat.jpg" alt="Featured" className="w-full aspect-[3/4] object-cover" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function BestSellers() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const { products } = useProducts();
  const bestSellers = products.slice(5, 8);

  useEffect(() => {
    if (!sectionRef.current) return;
    const ctx = gsap.context(() => {
      gsap.from('.bs-title', { y: 30, opacity: 0, duration: 0.6, scrollTrigger: { trigger: sectionRef.current, start: 'top 80%' } });
      gsap.from('.bs-card', { y: 40, opacity: 0, duration: 0.6, stagger: 0.12, scrollTrigger: { trigger: sectionRef.current, start: 'top 70%' } });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="py-20 md:py-28">
      <div className="max-w-[1440px] mx-auto px-6 lg:px-12">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6 mb-12">
          <h2 className="bs-title text-3xl md:text-4xl font-bold tracking-tight">BEST SELLERS</h2>
          <p className="text-xs font-medium tracking-wide text-[#666] uppercase max-w-[400px] lg:text-right">
            Carefully curated pieces designed to balance modern style, comfort, and everyday versatility.
          </p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1 flex flex-col justify-between">
            <p className="text-sm text-[#666] leading-relaxed mb-6">
              Discover our most loved styles, selected for their timeless design, premium materials, and versatility that fits effortlessly into everyday life.
            </p>
            <Link to="/shop" className="inline-flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.08em] hover:underline">
              <span className="w-10 h-[1px] bg-[#1A1A1A]" />
              All Products
            </Link>
          </div>
          <div className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {bestSellers.map(p => (
              <div key={p.id} className="bs-card">
                <ProductCard product={p} small />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function FeaturedProducts() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const { products } = useProducts();
  const featured = products.slice(0, 2);

  useEffect(() => {
    if (!sectionRef.current) return;
    const ctx = gsap.context(() => {
      gsap.from('.fp-image', { x: -40, opacity: 0, duration: 0.8, scrollTrigger: { trigger: sectionRef.current, start: 'top 70%' } });
      gsap.from('.fp-content', { x: 40, opacity: 0, duration: 0.8, scrollTrigger: { trigger: sectionRef.current, start: 'top 70%' } });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="py-20 md:py-0">
      <div className="max-w-[1440px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2">
          <div className="fp-image">
            <img src="/lifestyle-cardigan.jpg" alt="Featured" className="w-full h-full object-cover min-h-[500px] lg:min-h-[700px]" />
          </div>
          <div className="fp-content flex flex-col justify-center px-6 lg:px-16 py-16 lg:py-0">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-8">FEATURED PRODUCTS</h2>
            <div className="space-y-8">
              {featured.map(p => (
                <div key={p.id} className="flex gap-6">
                  <Link to={`/product/${p.slug}`} className="shrink-0 w-32 h-40 bg-[#F5F5F5]">
                    <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover" />
                  </Link>
                  <div className="flex flex-col justify-center">
                    <Link to={`/product/${p.slug}`} className="text-sm font-medium text-[#1A1A1A] hover:underline">{p.name}</Link>
                    <div className="flex items-center gap-2 mt-1">
                      {p.salePrice ? (
                        <>
                          <span className="text-sm text-[#999] line-through">${p.price.toFixed(2)}</span>
                          <span className="text-sm font-semibold">${p.salePrice.toFixed(2)}</span>
                        </>
                      ) : (
                        <span className="text-sm font-semibold">${p.price.toFixed(2)}</span>
                      )}
                    </div>
                    {p.colors && (
                      <div className="flex items-center gap-1.5 mt-2">
                        {p.colors.map(c => (
                          <span key={c.name} className="w-3.5 h-3.5 rounded-full border border-[#E5E5E5]" style={{ backgroundColor: c.hex }} title={c.name} />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function PromoSection() {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!sectionRef.current) return;
    const ctx = gsap.context(() => {
      gsap.from('.promo-text', { y: 40, opacity: 0, duration: 0.8, scrollTrigger: { trigger: sectionRef.current, start: 'top 70%' } });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="py-20 md:py-0">
      <div className="max-w-[1440px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2">
          <div className="promo-text flex flex-col justify-center px-6 lg:px-16 py-16 lg:py-24">
            <p className="text-xs font-medium tracking-[0.15em] text-[#666] mb-4 uppercase">
              Timeless Fashion Inspired by Modern Lifestyles
            </p>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold leading-[1.1] tracking-tight mb-6">
              CLEAN AND MODERN<br />
              FASHION BUILT FOR<br />
              EVERYDAY STYLE
            </h2>
            <p className="text-sm text-[#666] leading-relaxed mb-8 max-w-[480px]">
              Clean silhouettes, refined details, and thoughtful construction come together to create versatile fashion pieces designed for comfort, confidence, and effortless everyday style.
            </p>
            <Link to="/shop" className="inline-flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.08em] hover:underline w-fit">
              <span className="w-10 h-[1px] bg-[#1A1A1A]" />
              Shop Now
            </Link>
          </div>
          <div>
            <img src="/lifestyle-sweater.jpg" alt="" className="w-full h-full object-cover min-h-[500px]" />
          </div>
        </div>
      </div>
    </section>
  );
}

function MarqueeSection() {
  return (
    <div className="bg-[#1A1A1A] py-5 overflow-hidden">
      <div className="flex whitespace-nowrap animate-marquee">
        {Array.from({ length: 8 }).map((_, i) => (
          <span key={i} className="text-white text-xs font-medium tracking-[0.1em] uppercase mx-8">
            Elevated Style, Now At Better Prices. <span className="mx-4 text-white/40">|</span>
          </span>
        ))}
      </div>
    </div>
  );
}

function BlogSection() {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!sectionRef.current) return;
    const ctx = gsap.context(() => {
      gsap.from('.blog-header', { y: 30, opacity: 0, duration: 0.6, scrollTrigger: { trigger: sectionRef.current, start: 'top 80%' } });
      gsap.from('.blog-card', { y: 40, opacity: 0, duration: 0.6, stagger: 0.12, scrollTrigger: { trigger: sectionRef.current, start: 'top 70%' } });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="py-20 md:py-28">
      <div className="max-w-[1440px] mx-auto px-6 lg:px-12">
        <div className="blog-header flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-4">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">OUR BLOG</h2>
          <p className="text-xs font-medium tracking-wide text-[#666] uppercase max-w-[350px] lg:text-right">
            Where modern style meets everyday inspiration and creative expression.
          </p>
        </div>
        <div className="mb-10">
          <p className="text-sm text-[#666] max-w-[400px] mb-4">
            Discover styling ideas, seasonal edits, and creative perspectives designed to inspire modern everyday wardrobes.
          </p>
          <Link to="/blog" className="inline-flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.08em] hover:underline">
            <span className="w-10 h-[1px] bg-[#1A1A1A]" />
            All Articles
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {blogPosts.slice(0, 3).map(post => (
            <article key={post.id} className="blog-card group">
              <Link to={`/blog/${post.slug}`} className="block overflow-hidden mb-4">
                <img src={post.image} alt={post.title} className="w-full aspect-[16/10] object-cover group-hover:scale-105 transition-transform duration-500" />
              </Link>
              <Link to={`/blog/${post.slug}`}>
                <h3 className="text-lg font-semibold text-[#1A1A1A] mb-2 leading-snug group-hover:underline">{post.title}</h3>
              </Link>
              <div className="flex items-center gap-3 text-xs text-[#999] mb-2">
                <span className="font-medium uppercase tracking-wider text-[#1A1A1A]">{post.category}</span>
                <span>|</span>
                <span>{post.date}</span>
              </div>
              <p className="text-sm text-[#666] line-clamp-2">{post.excerpt}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function NewsletterSection() {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!sectionRef.current) return;
    const ctx = gsap.context(() => {
      gsap.from('.news-center', { y: 30, opacity: 0, duration: 0.8, scrollTrigger: { trigger: sectionRef.current, start: 'top 70%' } });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="py-0">
      <div className="max-w-[1440px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3">
          <div className="hidden lg:block">
            <img src="/newsletter-1.jpg" alt="" className="w-full h-full object-cover min-h-[400px]" />
          </div>
          <div className="news-center flex flex-col items-center justify-center px-8 py-16 lg:py-0 bg-white">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-center mb-4">OUR NEWSLETTER</h2>
            <p className="text-sm text-[#666] text-center max-w-[500px] mb-8">
              Be the first to know about new arrivals, exclusive offers, and trend alerts. Join our fashion circle today!
            </p>
            <div className="w-full max-w-[400px] flex items-center border-b border-[#1A1A1A]">
              <input
                type="email"
                placeholder="Email address"
                className="flex-1 py-3 text-sm bg-transparent outline-none placeholder:text-[#999]"
              />
              <button className="text-xs font-semibold uppercase tracking-[0.08em] py-3 hover:underline shrink-0">
                Subscribe
              </button>
            </div>
          </div>
          <div className="hidden lg:block">
            <img src="/newsletter-2.jpg" alt="" className="w-full h-full object-cover min-h-[400px]" />
          </div>
        </div>
      </div>
    </section>
  );
}

export function HomePage() {
  return (
    <>
      <HeroSection />
      <CategoryShowcase />
      <DarkFeature />
      <BestSellers />
      <FeaturedProducts />
      <PromoSection />
      <MarqueeSection />
      <BlogSection />
      <NewsletterSection />
    </>
  );
}
