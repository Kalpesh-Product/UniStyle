import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingBag, Trash2, ChevronDown, Filter, SlidersHorizontal, ChevronRight } from 'lucide-react';
import type { Product } from '@/data/products';
import { useProducts } from '@/hooks/useProducts';
import { useWishlist } from '@/context/WishlistContext';
import { useCart } from '@/context/CartContext';
import { showToast } from '@/components/ToastContainer';

const sortOptions = [
  { label: 'Most Recent', value: 'recent' },
  { label: 'Alphabetically, A-Z', value: 'az' },
  { label: 'Alphabetically, Z-A', value: 'za' },
  { label: 'Price, low to high', value: 'price-asc' },
  { label: 'Price, high to low', value: 'price-desc' },
];

function WishlistCard({ product }: { product: Product }) {
  const { removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();

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
        <button
          onClick={() => {
            removeFromWishlist(product.id);
            showToast('Removed from wishlist');
          }}
          className="absolute top-3 right-3 w-8 h-8 bg-white/90 flex items-center justify-center text-[#1A1A1A] hover:text-[#DC2626] transition-colors"
          aria-label="Remove from wishlist"
        >
          <Heart size={16} fill="currentColor" />
        </button>
        <div className="absolute bottom-0 left-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0 duration-300">
          <button
            onClick={() => { addToCart(product); showToast('Added to cart'); }}
            className="w-full bg-[#1A1A1A] text-white text-[11px] font-semibold uppercase tracking-wider py-2.5 hover:bg-[#333] transition-colors"
          >
            Add to Cart
          </button>
        </div>
      </div>
      <div className="mt-3">
        {product.university && <p className="text-xs text-[#999]">{product.university}</p>}
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
      </div>
    </div>
  );
}

function RecommendedCard({ product }: { product: Product }) {
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
        <button
          onClick={() => {
            if (inWishlist) { removeFromWishlist(product.id); showToast('Removed from wishlist'); }
            else { addToWishlist(product); showToast('Added to wishlist'); }
          }}
          className={`absolute top-3 right-3 w-8 h-8 bg-white/90 flex items-center justify-center transition-colors ${inWishlist ? 'text-[#1A1A1A]' : 'text-[#666] hover:text-[#1A1A1A]'}`}
          aria-label="Toggle wishlist"
        >
          <Heart size={16} fill={inWishlist ? 'currentColor' : 'none'} />
        </button>
      </div>
      <div className="mt-3">
        {product.university && <p className="text-xs text-[#999]">{product.university}</p>}
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
      </div>
    </div>
  );
}

export function WishlistPage() {
  const { items, clearWishlist } = useWishlist();
  const { addToCart } = useCart();
  const { products: allProducts } = useProducts();

  const [selectedGenders, setSelectedGenders] = useState<string[]>([]);
  const [selectedUniversities, setSelectedUniversities] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedAvailability, setSelectedAvailability] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 200]);
  const [sort, setSort] = useState('recent');
  const [sortOpen, setSortOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [filtersCollapsed, setFiltersCollapsed] = useState(false);

  const universities = useMemo(
    () => Array.from(new Set(items.map(p => p.university).filter((u): u is string => !!u))).sort(),
    [items]
  );

  const categories = useMemo(
    () => Array.from(new Set(items.map(p => p.category).filter(Boolean))).sort(),
    [items]
  );

  const toggleGender = (gender: string) => {
    setSelectedGenders(prev => prev.includes(gender) ? prev.filter(g => g !== gender) : [...prev, gender]);
  };
  const toggleUniversity = (uni: string) => {
    setSelectedUniversities(prev => prev.includes(uni) ? prev.filter(u => u !== uni) : [...prev, uni]);
  };
  const toggleCategory = (cat: string) => {
    setSelectedCategories(prev => prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]);
  };

  const filteredItems = useMemo(() => {
    let result = [...items];
    if (selectedGenders.length) result = result.filter(p => !!p.gender && selectedGenders.includes(p.gender));
    if (selectedUniversities.length) result = result.filter(p => !!p.university && selectedUniversities.includes(p.university));
    if (selectedCategories.length) result = result.filter(p => selectedCategories.includes(p.category));
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
  }, [items, selectedGenders, selectedUniversities, selectedCategories, selectedAvailability, priceRange, sort]);

  const recommended = useMemo(() => {
    const wishlistIds = new Set(items.map(p => p.id));
    return allProducts.filter(p => !wishlistIds.has(p.id)).slice(0, 8);
  }, [allProducts, items]);

  const handleMoveAllToCart = () => {
    items.forEach(p => addToCart(p));
    clearWishlist();
    showToast('Moved all items to cart');
  };

  const handleClearWishlist = () => {
    clearWishlist();
    showToast('Wishlist cleared');
  };

  return (
    <div className="mt-[72px]">
      <div className="max-w-[1440px] mx-auto px-6 lg:px-12 py-12">
        {/* Header */}
        <div className="flex flex-wrap items-start justify-between gap-4 mb-2">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Wishlist ({items.length})</h1>
            <p className="text-sm text-[#666] mt-2">
              <Link to="/" className="hover:text-[#1A1A1A]">Home</Link> / Wishlist
            </p>
          </div>
          {items.length > 0 && (
            <div className="flex items-center gap-3">
              <button
                onClick={handleMoveAllToCart}
                className="flex items-center gap-2 border border-[#1A1A1A] text-sm font-medium px-4 py-2.5 hover:bg-[#1A1A1A] hover:text-white transition-colors"
              >
                <ShoppingBag size={16} />
                Move All To Cart
              </button>
              <button
                onClick={handleClearWishlist}
                className="flex items-center gap-2 border border-[#E5E5E5] text-sm font-medium px-4 py-2.5 hover:border-[#DC2626] hover:text-[#DC2626] transition-colors"
              >
                <Trash2 size={16} />
                Clear Wishlist
              </button>
            </div>
          )}
        </div>

        {items.length === 0 ? (
          <div className="text-center py-16">
            <Heart size={48} className="mx-auto text-[#E5E5E5] mb-6" />
            <p className="text-lg text-[#666]">There are no products in wishlist</p>
            <Link to="/shop" className="inline-block mt-6 text-sm font-medium underline hover:text-[#1A1A1A]">
              Continue Shopping
            </Link>
          </div>
        ) : (
          <div className="flex gap-8 mt-8">
            {/* Sidebar */}
            <aside className={`fixed lg:static inset-y-0 left-0 z-40 w-72 bg-white lg:w-[280px] lg:shrink-0 p-6 lg:p-0 overflow-y-auto transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'} border-r lg:border-0 border-[#E5E5E5]`}>
              <div className="flex items-center justify-between mb-6 lg:hidden">
                <h3 className="font-semibold">Filters</h3>
                <button onClick={() => setSidebarOpen(false)}>&times;</button>
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
                  {/* Gender */}
                  <div className="mb-6">
                    <h4 className="text-sm font-semibold uppercase tracking-wider mb-3">Gender</h4>
                    <div className="space-y-2">
                      {['men', 'women'].map(gender => {
                        const count = items.filter(p => p.gender === gender).length;
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
                          const count = items.filter(p => p.university === uni).length;
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
                      {categories.map(cat => {
                        const count = items.filter(p => p.category === cat).length;
                        return (
                          <label key={cat} className="flex items-center gap-2 text-sm text-[#666] cursor-pointer hover:text-[#1A1A1A]">
                            <input type="checkbox" checked={selectedCategories.includes(cat)} onChange={() => toggleCategory(cat)} className="accent-[#1A1A1A]" />
                            {cat} ({count})
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  {/* Availability */}
                  <div className="mb-6">
                    <h4 className="text-sm font-semibold uppercase tracking-wider mb-3">Availability</h4>
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-sm text-[#666] cursor-pointer">
                        <input type="checkbox" checked={selectedAvailability.includes('in')} onChange={() => setSelectedAvailability(prev => prev.includes('in') ? prev.filter(x => x !== 'in') : [...prev, 'in'])} className="accent-[#1A1A1A]" />
                        In stock ({items.filter(p => p.inStock).length})
                      </label>
                      <label className="flex items-center gap-2 text-sm text-[#666] cursor-pointer">
                        <input type="checkbox" checked={selectedAvailability.includes('out')} onChange={() => setSelectedAvailability(prev => prev.includes('out') ? prev.filter(x => x !== 'out') : [...prev, 'out'])} className="accent-[#1A1A1A]" />
                        Out of stock ({items.filter(p => !p.inStock).length})
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
                </>
              )}
            </aside>

            {/* Main */}
            <div className="flex-1 min-w-0">
              {/* Toolbar */}
              <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
                <p className="text-sm text-[#666]">
                  Showing {filteredItems.length} of {items.length} products
                </p>
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <span className="text-sm text-[#666] mr-2">Sort by:</span>
                    <button onClick={() => setSortOpen(!sortOpen)} className="inline-flex items-center gap-2 text-sm border border-[#E5E5E5] px-3 py-2 hover:border-[#1A1A1A] transition-colors">
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
              {filteredItems.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {filteredItems.map(p => <WishlistCard key={p.id} product={p} />)}
                </div>
              ) : (
                <div className="text-center py-20">
                  <p className="text-lg text-[#666]">No wishlist items match your filters.</p>
                </div>
              )}

              {/* You May Also Like */}
              {recommended.length > 0 && (
                <div className="mt-20">
                  <div className="flex items-center justify-between mb-8">
                    <h2 className="text-2xl font-bold tracking-tight">You May Also Like</h2>
                    <Link to="/shop" className="flex items-center gap-2 text-sm font-medium hover:underline">
                      View All
                      <ChevronRight size={16} />
                    </Link>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    {recommended.map(p => <RecommendedCard key={p.id} product={p} />)}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
