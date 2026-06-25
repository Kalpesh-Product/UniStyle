import { useState, useMemo, useRef, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { X, Filter, Grid3X3, LayoutGrid, LayoutList, ChevronDown, SlidersHorizontal, ChevronRight } from 'lucide-react';
import type { Product } from '@/data/products';
import { useProducts } from '@/hooks/useProducts';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { showToast } from '@/components/ToastContainer';
import gsap from 'gsap';

const sortOptions = [
  { label: 'Most relevant', value: 'relevant' },
  { label: 'Best selling', value: 'bestselling' },
  { label: 'Alphabetically, A-Z', value: 'az' },
  { label: 'Alphabetically, Z-A', value: 'za' },
  { label: 'Price, low to high', value: 'price-asc' },
  { label: 'Price, high to low', value: 'price-desc' },
];

const ACCESSORY_CATEGORIES = ['Badges', 'Bagpack', 'Beanies', 'Bottles', 'Caps', 'Crests', 'Mugs', 'Scarfs', 'Tote Bags'];

const colors = [
  { name: 'Black', hex: '#1A1A1A' },
  { name: 'Navy', hex: '#1E3A5F' },
  { name: 'Burgundy', hex: '#6B1A2A' },
  { name: 'Cream', hex: '#F5F0E8' },
  { name: 'Red', hex: '#B83A3A' },
  { name: 'Nude', hex: '#D4A996' },
];

function ProductCard({ product }: { product: Product }) {
  const { addToCart } = useCart();
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();
  const inWishlist = isInWishlist(product.id);
  const hasCountdown = !!product.countdownEnd;
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, mins: 0, secs: 0 });

  useEffect(() => {
    if (!hasCountdown) return;
    const end = new Date(product.countdownEnd!).getTime();
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
  }, [hasCountdown, product.countdownEnd]);

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
        {product.badge && (
          <span className="absolute top-3 left-3 bg-[#1A1A1A] text-white text-[11px] font-medium px-2 py-1">{product.badge}</span>
        )}
        {hasCountdown && (
          <div className="absolute bottom-0 left-0 right-0 bg-[#1A1A1A] text-white flex items-center justify-center gap-2 py-2 text-[11px] font-medium">
            <span className="text-white/60">Ends in:</span>
            <span className="border border-white/30 px-1.5 py-0.5">{String(countdown.days).padStart(2, '0')}d</span>
            <span>:</span>
            <span className="border border-white/30 px-1.5 py-0.5">{String(countdown.hours).padStart(2, '0')}h</span>
            <span>:</span>
            <span className="border border-white/30 px-1.5 py-0.5">{String(countdown.mins).padStart(2, '0')}m</span>
            <span>:</span>
            <span className="border border-white/30 px-1.5 py-0.5">{String(countdown.secs).padStart(2, '0')}s</span>
          </div>
        )}
        <div className="absolute bottom-0 left-0 right-0 p-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0 duration-300">
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
            className={`w-10 flex items-center justify-center border ${inWishlist ? 'bg-[#1A1A1A] text-white' : 'bg-white text-[#1A1A1A]'} transition-colors`}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill={inWishlist ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
          </button>
        </div>
      </div>
      <div className="mt-3">
        <Link to={`/product/${product.slug}`} className="text-sm font-medium text-[#1A1A1A] hover:underline">{product.name}</Link>
        <div className="flex items-center gap-2 mt-1">
          {product.salePrice ? (
            <>
              <span className="text-sm font-semibold text-[#DC2626]">${product.salePrice.toFixed(2)}</span>
              <span className="text-sm text-[#999] line-through">${product.price.toFixed(2)}</span>
            </>
          ) : (
            <span className="text-sm font-semibold">${product.price.toFixed(2)}</span>
          )}
        </div>
        {product.rating && (
          <div className="flex items-center gap-1 mt-1">
            <div className="flex">
              {Array.from({ length: 5 }).map((_, i) => (
                <svg key={i} width="12" height="12" viewBox="0 0 24 24" fill={i < Math.round(product.rating!) ? '#1A1A1A' : '#E5E5E5'}><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
              ))}
            </div>
            <span className="text-xs text-[#999]">({product.reviewCount})</span>
          </div>
        )}
      </div>
    </div>
  );
}

export function ShopPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCategory = searchParams.get('category') || '';
  const sectionRef = useRef<HTMLDivElement>(null);
  const { products, loading } = useProducts();

  const [selectedCategories, setSelectedCategories] = useState<string[]>(initialCategory ? [initialCategory] : []);
  const [selectedGenders, setSelectedGenders] = useState<string[]>([]);
  const [selectedUniversities, setSelectedUniversities] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedAvailability, setSelectedAvailability] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 200]);
  const [sort, setSort] = useState('relevant');
  const [gridCols, setGridCols] = useState(4);
  const [sortOpen, setSortOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [filtersCollapsed, setFiltersCollapsed] = useState(false);
  const [accessoriesOpen, setAccessoriesOpen] = useState(
    () => !!initialCategory && ACCESSORY_CATEGORIES.includes(initialCategory)
  );

  const universities = useMemo(
    () => Array.from(new Set(products.map(p => p.university).filter((u): u is string => !!u))).sort(),
    [products]
  );

  const categories = useMemo(
    () => Array.from(new Set(products.map(p => p.category).filter(Boolean))).sort(),
    [products]
  );

  const accessorySubcategories = useMemo(
    () => categories.filter(c => ACCESSORY_CATEGORIES.includes(c)),
    [categories]
  );

  const otherCategories = useMemo(
    () => categories.filter(c => !ACCESSORY_CATEGORIES.includes(c)),
    [categories]
  );

  const sizeOrder = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
  const allSizes = useMemo(() => {
    const found = new Set<string>();
    products.forEach(p => p.sizes?.forEach(s => found.add(s)));
    return Array.from(found).sort((a, b) => {
      const ai = sizeOrder.indexOf(a);
      const bi = sizeOrder.indexOf(b);
      if (ai === -1 && bi === -1) return a.localeCompare(b);
      if (ai === -1) return 1;
      if (bi === -1) return -1;
      return ai - bi;
    });
  }, [products]);

  const filteredProducts = useMemo(() => {
    let result = [...products];
    if (selectedGenders.length) result = result.filter(p => !!p.gender && selectedGenders.includes(p.gender));
    if (selectedCategories.length) result = result.filter(p => selectedCategories.includes(p.category));
    if (selectedUniversities.length) result = result.filter(p => !!p.university && selectedUniversities.includes(p.university));
    if (selectedColors.length) result = result.filter(p => p.colors?.some(c => selectedColors.includes(c.name)));
    if (selectedSizes.length) result = result.filter(p => p.sizes?.some(s => selectedSizes.includes(s)));
    if (selectedAvailability.length) {
      result = result.filter(p => selectedAvailability.includes(p.inStock ? 'in' : 'out'));
    }
    result = result.filter(p => {
      const effectivePrice = p.salePrice || p.price;
      return effectivePrice >= priceRange[0] && effectivePrice <= priceRange[1];
    });
    switch (sort) {
      case 'az': result.sort((a, b) => a.name.localeCompare(b.name)); break;
      case 'za': result.sort((a, b) => b.name.localeCompare(a.name)); break;
      case 'price-asc': result.sort((a, b) => (a.salePrice || a.price) - (b.salePrice || b.price)); break;
      case 'price-desc': result.sort((a, b) => (b.salePrice || b.price) - (a.salePrice || a.price)); break;
      default: break;
    }
    return result;
  }, [products, selectedGenders, selectedCategories, selectedUniversities, selectedColors, selectedSizes, selectedAvailability, priceRange, sort]);

  const clearFilters = () => {
    setSelectedGenders([]);
    setSelectedCategories([]);
    setSelectedUniversities([]);
    setSelectedColors([]);
    setSelectedSizes([]);
    setSelectedAvailability([]);
    setPriceRange([0, 200]);
    setSearchParams({});
  };

  const toggleGender = (gender: string) => {
    setSelectedGenders(prev => prev.includes(gender) ? prev.filter(g => g !== gender) : [...prev, gender]);
  };

  const toggleCategory = (cat: string) => {
    setSelectedCategories(prev => prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]);
  };

  const toggleUniversity = (uni: string) => {
    setSelectedUniversities(prev => prev.includes(uni) ? prev.filter(u => u !== uni) : [...prev, uni]);
  };

  const toggleSize = (size: string) => {
    setSelectedSizes(prev => prev.includes(size) ? prev.filter(s => s !== size) : [...prev, size]);
  };

  useEffect(() => {
    if (!sectionRef.current) return;
    const ctx = gsap.context(() => {
      gsap.from('.shop-card', { y: 30, opacity: 0, duration: 0.5, stagger: 0.08, scrollTrigger: { trigger: sectionRef.current, start: 'top 80%' } });
    }, sectionRef);
    return () => ctx.revert();
  }, [filteredProducts]);

  return (
    <div className="mt-[72px]">
      {/* Banner */}
      {/* <div className="relative bg-[#1A1A1A] h-[300px] md:h-[400px] flex flex-col items-center justify-center text-white">
        <div className="absolute inset-0 opacity-30">
          <img src="/hero-1.jpg" alt="" className="w-full h-full object-cover" />
        </div>
        <div className="relative z-10 text-center">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">PRODUCTS</h1>
          <p className="text-sm text-white/70 mt-3">Home / Products</p>
        </div>
      </div> */}

      <div ref={sectionRef} className="max-w-[1440px] mx-auto px-6 lg:px-12 py-12">
        <div className="flex gap-8">
          {/* Sidebar */}
          <aside className={`fixed lg:static inset-y-0 left-0 z-40 w-72 bg-white lg:w-[280px] lg:shrink-0 p-6 lg:p-0 overflow-y-auto transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'} border-r lg:border-0 border-[#E5E5E5]`}>
            <div className="flex items-center justify-between mb-6 lg:hidden">
              <h3 className="font-semibold">Filters</h3>
              <button onClick={() => setSidebarOpen(false)}><X size={20} /></button>
            </div>
            <button
              onClick={() => setFiltersCollapsed(prev => !prev)}
              className="flex items-center justify-between w-full text-sm font-medium text-[#1A1A1A] mb-6"
            >
              <span className="flex items-center gap-2">
                <SlidersHorizontal size={16} />
                {filtersCollapsed ? 'Show Filters' : 'Hide Filters'}
              </span>
              <ChevronRight size={16} className={`transition-transform ${filtersCollapsed ? '' : 'rotate-90'}`} />
            </button>

            {!filtersCollapsed && (
              <>
                {/* <button onClick={clearFilters} className="text-xs font-medium underline text-[#666] hover:text-[#1A1A1A] mb-6">Reset</button> */}

                {/* Gender */}
                <div className="mb-6">
                  <h4 className="text-sm font-semibold uppercase tracking-wider mb-3">Gender</h4>
                  <div className="space-y-2">
                    {['men', 'women'].map(gender => {
                      const count = products.filter(p => p.gender === gender).length;
                      return (
                        <label key={gender} className="flex items-center gap-2 text-sm text-[#666] cursor-pointer hover:text-[#1A1A1A]">
                          <input type="checkbox" checked={selectedGenders.includes(gender)} onChange={() => toggleGender(gender)} className="accent-[#1A1A1A]" />
                          {gender === 'men' ? 'Men' : 'Women'} ({count})
                        </label>
                      );
                    })}
                  </div>
                </div>

                {/* Universities */}
                {universities.length > 0 && (
                  <div className="mb-6">
                    <h4 className="text-sm font-semibold uppercase tracking-wider mb-3">Universities</h4>
                    <div className="space-y-2">
                      {universities.map(uni => {
                        const count = products.filter(p => p.university === uni).length;
                        return (
                          <label key={uni} className="flex items-center gap-2 text-sm text-[#666] cursor-pointer hover:text-[#1A1A1A]">
                            <input type="checkbox" checked={selectedUniversities.includes(uni)} onChange={() => toggleUniversity(uni)} className="accent-[#1A1A1A]" />
                            {uni} ({count})
                          </label>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Categories */}
                <div className="mb-6">
                  <h4 className="text-sm font-semibold uppercase tracking-wider mb-3">Categories</h4>
                  <div className="space-y-2">
                    {accessorySubcategories.length > 0 && (
                      <div>
                        <div className="flex items-center justify-between w-full text-sm text-[#666]">
                          <label className="flex items-center gap-2 cursor-pointer hover:text-[#1A1A1A]">
                            <input
                              type="checkbox"
                              ref={el => {
                                if (el) {
                                  const selectedCount = accessorySubcategories.filter(c => selectedCategories.includes(c)).length;
                                  el.indeterminate = selectedCount > 0 && selectedCount < accessorySubcategories.length;
                                }
                              }}
                              checked={accessorySubcategories.every(c => selectedCategories.includes(c))}
                              onChange={() => {
                                const allSelected = accessorySubcategories.every(c => selectedCategories.includes(c));
                                setSelectedCategories(prev => allSelected
                                  ? prev.filter(c => !accessorySubcategories.includes(c))
                                  : Array.from(new Set([...prev, ...accessorySubcategories])));
                              }}
                              className="accent-[#1A1A1A]"
                            />
                            Accessories ({products.filter(p => ACCESSORY_CATEGORIES.includes(p.category)).length})
                          </label>
                          <button
                            type="button"
                            onClick={() => setAccessoriesOpen(prev => !prev)}
                            aria-label="Toggle accessories subcategories"
                          >
                            <ChevronRight size={14} className={`transition-transform ${accessoriesOpen ? 'rotate-90' : ''}`} />
                          </button>
                        </div>
                        {accessoriesOpen && (
                          <div className="mt-2 ml-4 space-y-2">
                            {accessorySubcategories.map(cat => {
                              const count = products.filter(p => p.category === cat).length;
                              return (
                                <label key={cat} className="flex items-center gap-2 text-sm text-[#666] cursor-pointer hover:text-[#1A1A1A]">
                                  <input type="checkbox" checked={selectedCategories.includes(cat)} onChange={() => toggleCategory(cat)} className="accent-[#1A1A1A]" />
                                  {cat} ({count})
                                </label>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    )}
                    {otherCategories.map(cat => {
                      const count = products.filter(p => p.category === cat).length;
                      return (
                        <label key={cat} className="flex items-center gap-2 text-sm text-[#666] cursor-pointer hover:text-[#1A1A1A]">
                          <input type="checkbox" checked={selectedCategories.includes(cat)} onChange={() => toggleCategory(cat)} className="accent-[#1A1A1A]" />
                          {cat} ({count})
                        </label>
                      );
                    })}
                  </div>
                </div>

                {/* Size */}
                {allSizes.length > 0 && (
                  <div className="mb-6">
                    <h4 className="text-sm font-semibold uppercase tracking-wider mb-3">Size</h4>
                    <div className="space-y-2">
                      {allSizes.map(size => {
                        const count = products.filter(p => p.sizes?.includes(size)).length;
                        return (
                          <label key={size} className="flex items-center gap-2 text-sm text-[#666] cursor-pointer hover:text-[#1A1A1A]">
                            <input type="checkbox" checked={selectedSizes.includes(size)} onChange={() => toggleSize(size)} className="accent-[#1A1A1A]" />
                            {size} ({count})
                          </label>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Availability */}
                <div className="mb-6">
                  <h4 className="text-sm font-semibold uppercase tracking-wider mb-3">Availability</h4>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm text-[#666] cursor-pointer">
                      <input type="checkbox" checked={selectedAvailability.includes('in')} onChange={() => setSelectedAvailability(prev => prev.includes('in') ? prev.filter(x => x !== 'in') : [...prev, 'in'])} className="accent-[#1A1A1A]" />
                      In stock ({products.filter(p => p.inStock).length})
                    </label>
                    <label className="flex items-center gap-2 text-sm text-[#666] cursor-pointer">
                      <input type="checkbox" checked={selectedAvailability.includes('out')} onChange={() => setSelectedAvailability(prev => prev.includes('out') ? prev.filter(x => x !== 'out') : [...prev, 'out'])} className="accent-[#1A1A1A]" />
                      Out of stock ({products.filter(p => !p.inStock).length})
                    </label>
                  </div>
                </div>

                {/* Price */}
                <div className="mb-6">
                  <h4 className="text-sm font-semibold uppercase tracking-wider mb-3">Price</h4>
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-xs text-[#666]">${priceRange[0]}</span>
                    <span className="text-xs text-[#666]">-</span>
                    <span className="text-xs text-[#666]">${priceRange[1]}</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={2000}
                    value={priceRange[1]}
                    onChange={e => setPriceRange([0, parseInt(e.target.value)])}
                    className="w-full accent-[#1A1A1A]"
                  />
                </div>

                {/* Colors */}
                <div className="mb-6">
                  <h4 className="text-sm font-semibold uppercase tracking-wider mb-3">Color</h4>
                  <div className="flex flex-wrap gap-2">
                    {colors.map(c => (
                      <button
                        key={c.name}
                        onClick={() => setSelectedColors(prev => prev.includes(c.name) ? prev.filter(x => x !== c.name) : [...prev, c.name])}
                        className={`w-6 h-6 rounded-full border-2 transition-all ${selectedColors.includes(c.name) ? 'border-[#1A1A1A] scale-110' : 'border-[#E5E5E5]'}`}
                        style={{ backgroundColor: c.hex }}
                        title={c.name}
                      />
                    ))}
                  </div>
                </div>
              </>
            )}
          </aside>

          {/* Main */}
          <div className="flex-1 min-w-0">
            {/* Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
              <p className="text-sm text-[#666]">
                Showing {filteredProducts.length} of {products.length} products
              </p>
              <div className="flex items-center gap-4">
                <div className="hidden md:flex items-center gap-1">
                  <button onClick={() => setGridCols(2)} className={`p-2 ${gridCols === 2 ? 'text-[#1A1A1A]' : 'text-[#999]'}`}><LayoutGrid size={18} /></button>
                  <button onClick={() => setGridCols(3)} className={`p-2 ${gridCols === 3 ? 'text-[#1A1A1A]' : 'text-[#999]'}`}><Grid3X3 size={18} /></button>
                  <button onClick={() => setGridCols(4)} className={`p-2 ${gridCols === 4 ? 'text-[#1A1A1A]' : 'text-[#999]'}`}><LayoutList size={18} /></button>
                </div>
                <div className="relative">
                  <button onClick={() => setSortOpen(!sortOpen)} className="flex items-center gap-2 text-sm border border-[#E5E5E5] px-3 py-2 hover:border-[#1A1A1A] transition-colors">
                    {sortOptions.find(o => o.value === sort)?.label || 'Sort'}
                    <ChevronDown size={14} />
                  </button>
                  {sortOpen && (
                    <div className="absolute right-0 top-full mt-1 bg-white border border-[#E5E5E5] py-1 min-w-[200px] z-10">
                      {sortOptions.map(o => (
                        <button
                          key={o.value}
                          onClick={() => { setSort(o.value); setSortOpen(false); }}
                          className={`block w-full text-left px-4 py-2 text-sm hover:bg-[#F5F5F5] ${sort === o.value ? 'font-medium' : 'text-[#666]'}`}
                        >
                          {o.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 border border-[#E5E5E5]"><Filter size={18} /></button>
              </div>
            </div>

            {/* Product Grid */}
            {loading ? (
              <div className="text-center py-20">
                <p className="text-lg text-[#666]">Loading products...</p>
              </div>
            ) : filteredProducts.length > 0 ? (
              <div className={`grid gap-6 ${gridCols === 2 ? 'grid-cols-2' : gridCols === 3 ? 'grid-cols-2 md:grid-cols-3' : 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4'}`}>
                {filteredProducts.map(p => (
                  <div key={p.id} className="shop-card">
                    <ProductCard product={p} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-20">
                <p className="text-lg text-[#666] mb-4">No products match your filters.</p>
                <button onClick={clearFilters} className="text-sm underline font-medium">Clear all filters</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
