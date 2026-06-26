import { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Search, User, Heart, ShoppingBag, X, Menu, ChevronDown } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';

const menItems = [
  { label: 'View All Men', href: '/shop?gender=men' },
  { label: 'Hoodies', href: '/shop?gender=men&category=Hoodies' },
  { label: 'T-Shirts', href: '/shop?gender=men&category=T-Shirt' },
  { label: 'Sweatshirts', href: '/shop?gender=men&category=SweatShirt' },
  { label: 'Bottoms', href: '/shop?gender=men&category=Bottom' },
  { label: 'Caps', href: '/shop?gender=men&category=Caps' },
];

const womenItems = [
  { label: 'View All Women', href: '/shop?gender=women' },
  { label: 'Hoodies', href: '/shop?gender=women&category=Hoodies' },
  { label: 'T-Shirts', href: '/shop?gender=women&category=T-Shirt' },
  { label: 'Sweatshirts', href: '/shop?gender=women&category=SweatShirt' },
  { label: 'Bottoms', href: '/shop?gender=women&category=Bottom' },
  { label: 'Dresses', href: '/shop?gender=women&category=Dresses' },
];

const universityItems = [
  { label: 'View All Universities', href: '/shop' },
  { label: 'De Montfort University', href: '/shop?university=De+Montfort+University' },
  { label: 'Heriot-Watt University', href: '/shop?university=Heriot-Watt+University' },
  { label: 'Middlesex University', href: '/shop?university=Middlesex+University' },
  { label: 'New York University', href: '/shop?university=New+York+University' },
  { label: 'University of Birmingham', href: '/shop?university=University+of+Birmingham' },
  { label: 'University of Wollongong', href: '/shop?university=University+of+Wollongong' },
];

type DropdownItem = { label: string; href: string };

type NavItem = {
  label: string;
  href: string;
  dropdown?: DropdownItem[];
};

const navLinks: NavItem[] = [
  { label: 'Home', href: '/' },
  { label: 'Shop', href: '/shop' },
  { label: 'Men', href: '/shop?gender=men', dropdown: menItems },
  { label: 'Women', href: '/shop?gender=women', dropdown: womenItems },
  { label: 'Universities', href: '/shop', dropdown: universityItems },
  // { label: 'Product', href: '/shop' },
  // { label: 'Blog', href: '/blog' },
  // { label: 'Featured', href: '/shop' },
];

export function Header() {
  const location = useLocation();
  const { totalItems: cartCount } = useCart();
  const { totalItems: wishlistCount } = useWishlist();
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<number | null>(null);
  const dropdownTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (searchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [searchOpen]);

  useEffect(() => {
    setMobileMenuOpen(false);
    setSearchOpen(false);
  }, [location.pathname]);

  const handleMouseEnter = (index: number) => {
    if (dropdownTimeout.current) clearTimeout(dropdownTimeout.current);
    setActiveDropdown(index);
  };

  const handleMouseLeave = () => {
    dropdownTimeout.current = setTimeout(() => setActiveDropdown(null), 150);
  };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-[#E5E5E5]">
        <div className="max-w-[1440px] mx-auto px-4 md:px-6 lg:px-12 h-[72px] flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <img src="/Logo.jpeg" alt="UniStyle" className="h-10 w-auto" />
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-8">
            {navLinks.map((link, index) => (
              <div
                key={link.label}
                className="relative"
                onMouseEnter={() => link.dropdown ? handleMouseEnter(index) : undefined}
                onMouseLeave={link.dropdown ? handleMouseLeave : undefined}
              >
                <Link
                  to={link.href}
                  className={`flex items-center gap-1 text-sm font-medium tracking-wide pb-1 border-b-2 transition-colors ${
                    location.pathname === link.href
                      ? 'border-[#1A1A1A] text-[#1A1A1A]'
                      : 'border-transparent text-[#1A1A1A] hover:border-[#1A1A1A]'
                  }`}
                >
                  {link.label}
                  {link.dropdown && <ChevronDown size={14} />}
                </Link>

                {link.dropdown && activeDropdown === index && (
                  <div className="absolute top-full left-0 mt-1 bg-white shadow-[0_8px_32px_rgba(0,0,0,0.08)] py-2 min-w-[200px] z-50">
                    {link.dropdown.map((item) => (
                      <Link
                        key={item.label}
                        to={item.href}
                        className="block px-4 py-2 text-sm text-[#666] hover:text-[#1A1A1A] hover:bg-[#F5F5F5] transition-colors"
                      >
                        {item.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>

          {/* Right Icons */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="p-1 hover:opacity-70 transition-opacity"
              aria-label="Search"
            >
              <Search size={20} strokeWidth={1.5} />
            </button>
            <Link to="/account" className="hidden sm:block p-1 hover:opacity-70 transition-opacity" aria-label="Account">
              <User size={20} strokeWidth={1.5} />
            </Link>
            <Link to="/wishlist" className="relative p-1 hover:opacity-70 transition-opacity" aria-label="Wishlist">
              <Heart size={20} strokeWidth={1.5} />
              {wishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#1A1A1A] text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full">
                  {wishlistCount}
                </span>
              )}
            </Link>
            <Link to="/cart" className="relative p-1 hover:opacity-70 transition-opacity" aria-label="Cart">
              <ShoppingBag size={20} strokeWidth={1.5} />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#1A1A1A] text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full">
                  {cartCount}
                </span>
              )}
            </Link>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-1 hover:opacity-70 transition-opacity"
              aria-label="Menu"
            >
              <Menu size={20} strokeWidth={1.5} />
            </button>
          </div>
        </div>
      </header>

      {/* Search Overlay */}
      {searchOpen && (
        <div className="fixed inset-0 z-[55] bg-white/95 backdrop-blur-sm pt-[72px]">
          <div className="max-w-[800px] mx-auto px-6 pt-16">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold">Search</h2>
              <button onClick={() => setSearchOpen(false)} className="p-2 hover:bg-[#F5F5F5]">
                <X size={24} />
              </button>
            </div>
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search for products, categories..."
              className="w-full text-2xl border-b-2 border-[#1A1A1A] pb-4 bg-transparent outline-none placeholder:text-[#999]"
            />
            <div className="mt-8">
              <h3 className="text-sm font-medium text-[#999] uppercase tracking-wider mb-4">Popular Searches</h3>
              <div className="flex flex-wrap gap-3">
                {['Wool Coat', 'Handbag', 'Sunglasses', 'Sweater', 'Trench Coat'].map(term => (
                  <Link
                    key={term}
                    to="/shop"
                    onClick={() => setSearchOpen(false)}
                    className="px-4 py-2 border border-[#E5E5E5] text-sm hover:border-[#1A1A1A] transition-colors"
                  >
                    {term}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-[54] bg-white pt-[72px] lg:hidden overflow-y-auto">
          <div className="px-6 py-8 space-y-1">
            {navLinks.map(link => (
              <div key={link.label}>
                <Link
                  to={link.href}
                  className="block text-lg font-medium py-3 border-b border-[#E5E5E5]"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.label}
                </Link>
                {link.dropdown && (
                  <div className="pl-4 pb-2">
                    {link.dropdown.slice(1).map(item => (
                      <Link
                        key={item.label}
                        to={item.href}
                        className="block text-sm text-[#666] py-2 hover:text-[#1A1A1A] transition-colors"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        {item.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
            <Link
              to="/account"
              className="block text-lg font-medium py-3 border-b border-[#E5E5E5]"
              onClick={() => setMobileMenuOpen(false)}
            >
              Account
            </Link>
          </div>
        </div>
      )}
    </>
  );
}
