import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Home, Package, Heart, MapPin, CreditCard, User, Shield, Star, LogOut,
  ChevronRight, Lock, Smartphone, Monitor, Calendar, Mail, Pencil,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useWishlist } from '@/context/WishlistContext';
import { showToast } from '@/components/ToastContainer';
import { STATUS_STYLES, statusLabel, formatDate } from './account/accountHelpers';
import { OrdersTab } from './account/OrdersTab';
import { AddressesTab } from './account/AddressesTab';
import { PaymentMethodsTab } from './account/PaymentMethodsTab';
import { AccountDetailsTab } from './account/AccountDetailsTab';
import { SecurityTab } from './account/SecurityTab';
import { ReviewsTab } from './account/ReviewsTab';

export function AccountPage() {
  const {
    user, isAuthenticated, login, register, logout, updateProfile,
    addAddress, updateAddress, removeAddress, changePassword, deleteAccount, orders,
  } = useAuth();
  const { items: wishlistItems, totalItems: wishlistTotal, removeFromWishlist } = useWishlist();
  const [searchParams, setSearchParams] = useSearchParams();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [activeTab, setActiveTab] = useState('overview');
  const [formData, setFormData] = useState({
    firstName: '', lastName: '', email: '', password: '',
  });

  useEffect(() => {
    if (searchParams.get('order') === 'success') {
      const orderId = searchParams.get('orderId');
      showToast(orderId ? `Order #${orderId} placed successfully!` : 'Order placed successfully!');
      setActiveTab('orders');
      searchParams.delete('order');
      searchParams.delete('orderId');
      setSearchParams(searchParams, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await login(formData.email, formData.password);
    if (success) {
      showToast('Signed in successfully');
    } else {
      showToast('Invalid credentials', 'error');
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await register({
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      password: formData.password,
    });
    if (success) {
      showToast('Account created successfully');
    } else {
      showToast('Email already registered', 'error');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="mt-[72px] min-h-[60vh] flex items-center justify-center">
        <div className="w-full max-w-[480px] px-6">
          {mode === 'login' ? (
            <form onSubmit={handleLogin} className="text-center">
              <h1 className="text-3xl font-bold tracking-tight mb-2">Sign In</h1>
              <p className="text-sm text-[#666] mb-8">Sign in to your account</p>
              <input
                type="email"
                placeholder="Email"
                required
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
                className="w-full border border-[#E5E5E5] px-4 py-3 text-sm mb-4 outline-none focus:border-[#1A1A1A] transition-colors"
              />
              <input
                type="password"
                placeholder="Password"
                required
                value={formData.password}
                onChange={e => setFormData({ ...formData, password: e.target.value })}
                className="w-full border border-[#E5E5E5] px-4 py-3 text-sm mb-6 outline-none focus:border-[#1A1A1A] transition-colors"
              />
              <button type="submit" className="w-full bg-[#1A1A1A] text-white text-sm font-semibold uppercase tracking-[0.08em] py-4 hover:bg-[#333] transition-colors">
                Sign In
              </button>
              <p className="text-sm text-[#666] mt-4">
                Don't have an account?{' '}
                <button type="button" onClick={() => setMode('register')} className="underline font-medium hover:text-[#1A1A1A]">
                  Create one
                </button>
              </p>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="text-center">
              <h1 className="text-3xl font-bold tracking-tight mb-2">Create Account</h1>
              <p className="text-sm text-[#666] mb-8">Join our fashion community</p>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <input
                  type="text"
                  placeholder="First Name"
                  required
                  value={formData.firstName}
                  onChange={e => setFormData({ ...formData, firstName: e.target.value })}
                  className="w-full border border-[#E5E5E5] px-4 py-3 text-sm outline-none focus:border-[#1A1A1A] transition-colors"
                />
                <input
                  type="text"
                  placeholder="Last Name"
                  required
                  value={formData.lastName}
                  onChange={e => setFormData({ ...formData, lastName: e.target.value })}
                  className="w-full border border-[#E5E5E5] px-4 py-3 text-sm outline-none focus:border-[#1A1A1A] transition-colors"
                />
              </div>
              <input
                type="email"
                placeholder="Email"
                required
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
                className="w-full border border-[#E5E5E5] px-4 py-3 text-sm mb-4 outline-none focus:border-[#1A1A1A] transition-colors"
              />
              <input
                type="password"
                placeholder="Password"
                required
                value={formData.password}
                onChange={e => setFormData({ ...formData, password: e.target.value })}
                className="w-full border border-[#E5E5E5] px-4 py-3 text-sm mb-6 outline-none focus:border-[#1A1A1A] transition-colors"
              />
              <button type="submit" className="w-full bg-[#1A1A1A] text-white text-sm font-semibold uppercase tracking-[0.08em] py-4 hover:bg-[#333] transition-colors">
                Create Account
              </button>
              <p className="text-sm text-[#666] mt-4">
                Already have an account?{' '}
                <button type="button" onClick={() => setMode('login')} className="underline font-medium hover:text-[#1A1A1A]">
                  Sign in
                </button>
              </p>
            </form>
          )}
        </div>
      </div>
    );
  }

  const navItems = [
    { id: 'overview', label: 'Overview', icon: Home },
    { id: 'orders', label: 'Orders', icon: Package },
    { id: 'wishlist', label: 'Wishlist', icon: Heart, badge: wishlistTotal },
    { id: 'addresses', label: 'Addresses', icon: MapPin },
    { id: 'payment', label: 'Payment Methods', icon: CreditCard },
    { id: 'account', label: 'Account Details', icon: User },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'reviews', label: 'Reviews', icon: Star },
  ];

  const recentOrders = orders.slice(0, 4);
  const highlightedWishlist = wishlistItems.slice(0, 5);

  return (
    <div className="mt-[72px] min-h-[60vh]">
      <div className="max-w-[1440px] mx-auto px-6 lg:px-12 py-12">
        <div className="flex flex-col lg:flex-row gap-12">
          {/* Sidebar */}
          <aside className="w-full lg:w-[260px] shrink-0">
            <div className="flex flex-col items-center text-center mb-6">
              <div className="w-16 h-16 rounded-full bg-[#F1E7FB] text-[#1A1A1A] flex items-center justify-center font-bold text-xl mb-3">
                {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
              </div>
              <p className="font-semibold">{user?.firstName} {user?.lastName}</p>
              <p className="text-xs text-[#999]">{user?.email}</p>
            </div>
            <nav className="space-y-1">
              {navItems.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center justify-between gap-3 px-4 py-3 text-sm font-medium transition-all ${
                    activeTab === tab.id ? 'text-[#1A1A1A] bg-[#F5F5F5]' : 'text-[#666] hover:text-[#1A1A1A] hover:bg-[#FAFAFA]'
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <tab.icon size={18} />
                    {tab.label}
                  </span>
                  {!!tab.badge && (
                    <span className="text-[11px] font-semibold bg-[#1A1A1A] text-white rounded-full px-2 py-0.5">{tab.badge}</span>
                  )}
                </button>
              ))}
              <button
                onClick={() => {
                  logout();
                  showToast('Signed out');
                }}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-[#666] hover:text-[#DC2626] transition-colors"
              >
                <LogOut size={18} />
                Logout
              </button>
            </nav>
          </aside>

          {/* Content */}
          <div className="flex-1 min-w-0">
            {activeTab === 'overview' && (
              <div>
                <p className="text-sm text-[#999] mb-1">Welcome back,</p>
                <h2 className="text-3xl font-bold tracking-tight mb-2">{user?.firstName} {user?.lastName}</h2>
                <p className="text-sm text-[#666] mb-8">Here's what's happening with your account today.</p>

                {/* Stat cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
                  <div className="border border-[#E5E5E5] p-5">
                    <div className="w-10 h-10 rounded-full bg-[#F1E7FB] flex items-center justify-center mb-4"><Package size={18} /></div>
                    <p className="text-2xl font-bold">{orders.length}</p>
                    <p className="text-xs text-[#666] mt-1">Total Orders</p>
                    <button onClick={() => setActiveTab('orders')} className="text-xs font-medium underline mt-3 hover:text-[#1A1A1A]">View orders &rarr;</button>
                  </div>
                  <div className="border border-[#E5E5E5] p-5">
                    <div className="w-10 h-10 rounded-full bg-[#FCE7EF] flex items-center justify-center mb-4"><Heart size={18} /></div>
                    <p className="text-2xl font-bold">{wishlistTotal}</p>
                    <p className="text-xs text-[#666] mt-1">Wishlist Items</p>
                    <button onClick={() => setActiveTab('wishlist')} className="text-xs font-medium underline mt-3 hover:text-[#1A1A1A]">View wishlist &rarr;</button>
                  </div>
                  <div className="border border-[#E5E5E5] p-5">
                    <div className="w-10 h-10 rounded-full bg-[#E5F0FF] flex items-center justify-center mb-4"><MapPin size={18} /></div>
                    <p className="text-2xl font-bold">{user?.addresses.length || 0}</p>
                    <p className="text-xs text-[#666] mt-1">Saved Addresses</p>
                    <button onClick={() => setActiveTab('addresses')} className="text-xs font-medium underline mt-3 hover:text-[#1A1A1A]">Manage &rarr;</button>
                  </div>
                  <div className="border border-[#E5E5E5] p-5">
                    <div className="w-10 h-10 rounded-full bg-[#E3F7E8] flex items-center justify-center mb-4"><CreditCard size={18} /></div>
                    <p className="text-2xl font-bold">0</p>
                    <p className="text-xs text-[#666] mt-1">Payment Methods</p>
                    <button onClick={() => setActiveTab('payment')} className="text-xs font-medium underline mt-3 hover:text-[#1A1A1A]">Manage &rarr;</button>
                  </div>
                </div>

                {/* Recent Orders */}
                <div className="mb-10">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold">Recent Orders</h3>
                    {orders.length > 0 && (
                      <button onClick={() => setActiveTab('orders')} className="text-xs font-medium underline flex items-center gap-1 hover:text-[#1A1A1A]">
                        View All Orders <ChevronRight size={14} />
                      </button>
                    )}
                  </div>
                  {recentOrders.length === 0 ? (
                    <div className="text-center py-12 bg-[#F5F5F5]">
                      <Package size={36} className="mx-auto text-[#CCC] mb-4" />
                      <p className="text-[#666]">No orders yet</p>
                      <Link to="/shop" className="text-sm underline mt-2 inline-block">Start Shopping</Link>
                    </div>
                  ) : (
                    <div className="border border-[#E5E5E5] divide-y divide-[#E5E5E5]">
                      {recentOrders.map(order => (
                        <button
                          key={order.id}
                          onClick={() => setActiveTab('orders')}
                          className="w-full flex items-center gap-4 p-4 text-left hover:bg-[#FAFAFA] transition-colors"
                        >
                          <img src={order.items[0]?.image} alt="" className="w-12 h-12 object-cover bg-[#F5F5F5] shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold">Order #{order.id.slice(-6).toUpperCase()}</p>
                            <p className="text-xs text-[#999]">{order.date} &middot; {order.items.length} item{order.items.length !== 1 ? 's' : ''}</p>
                          </div>
                          <span className={`text-xs font-medium px-2.5 py-1 rounded-full shrink-0 ${STATUS_STYLES[order.status]}`}>
                            {statusLabel(order.status)}
                          </span>
                          <p className="text-sm font-bold w-20 text-right shrink-0">${order.total.toFixed(2)}</p>
                          <ChevronRight size={16} className="text-[#999] shrink-0" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Account Details + Security */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
                  <div className="border border-[#E5E5E5] p-6">
                    <div className="flex items-center justify-between mb-5">
                      <h3 className="font-bold">Account Details</h3>
                      <button onClick={() => setActiveTab('account')} className="text-xs font-medium underline flex items-center gap-1 hover:text-[#1A1A1A]">
                        <Pencil size={12} /> Edit
                      </button>
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <User size={16} className="text-[#999] mt-0.5" />
                        <div>
                          <p className="text-xs text-[#999]">Full Name</p>
                          <p className="text-sm font-medium">{user?.firstName} {user?.lastName}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <Mail size={16} className="text-[#999] mt-0.5" />
                        <div>
                          <p className="text-xs text-[#999]">Email Address</p>
                          <p className="text-sm font-medium">{user?.email}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <Calendar size={16} className="text-[#999] mt-0.5" />
                        <div>
                          <p className="text-xs text-[#999]">Member Since</p>
                          <p className="text-sm font-medium">{formatDate(user?.createdAt)}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="border border-[#E5E5E5] p-6">
                    <h3 className="font-bold mb-5">Security</h3>
                    <div className="space-y-1">
                      <button onClick={() => setActiveTab('security')} className="w-full flex items-center justify-between py-3 border-b border-[#F0F0F0] hover:text-[#1A1A1A] text-left">
                        <span className="flex items-center gap-3">
                          <Lock size={16} className="text-[#999]" />
                          <span>
                            <span className="block text-sm font-medium">Change Password</span>
                            <span className="block text-xs text-[#999]">Update your password regularly</span>
                          </span>
                        </span>
                        <ChevronRight size={16} className="text-[#999]" />
                      </button>
                      <button onClick={() => setActiveTab('security')} className="w-full flex items-center justify-between py-3 border-b border-[#F0F0F0] hover:text-[#1A1A1A] text-left">
                        <span className="flex items-center gap-3">
                          <Smartphone size={16} className="text-[#999]" />
                          <span>
                            <span className="block text-sm font-medium">Two-Factor Authentication</span>
                            <span className="block text-xs text-[#999]">Add an extra layer of security</span>
                          </span>
                        </span>
                        <ChevronRight size={16} className="text-[#999]" />
                      </button>
                      <button onClick={() => setActiveTab('security')} className="w-full flex items-center justify-between py-3 hover:text-[#1A1A1A] text-left">
                        <span className="flex items-center gap-3">
                          <Monitor size={16} className="text-[#999]" />
                          <span>
                            <span className="block text-sm font-medium">Login Sessions</span>
                            <span className="block text-xs text-[#999]">Manage your active sessions</span>
                          </span>
                        </span>
                        <ChevronRight size={16} className="text-[#999]" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Wishlist Highlights */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold">Wishlist Highlights</h3>
                    {wishlistItems.length > 0 && (
                      <button onClick={() => setActiveTab('wishlist')} className="text-xs font-medium underline flex items-center gap-1 hover:text-[#1A1A1A]">
                        View Full Wishlist <ChevronRight size={14} />
                      </button>
                    )}
                  </div>
                  {highlightedWishlist.length === 0 ? (
                    <div className="text-center py-12 bg-[#F5F5F5]">
                      <Heart size={36} className="mx-auto text-[#CCC] mb-4" />
                      <p className="text-[#666]">Your wishlist is empty</p>
                      <Link to="/shop" className="text-sm underline mt-2 inline-block">Browse Products</Link>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                      {highlightedWishlist.map(product => (
                        <div key={product.id} className="group">
                          <div className="relative bg-[#F5F5F5] mb-2">
                            <Link to={`/product/${product.slug}`}>
                              <img src={product.images[0]} alt={product.name} className="w-full aspect-square object-cover" />
                            </Link>
                            <button
                              onClick={() => { removeFromWishlist(product.id); showToast('Removed from wishlist'); }}
                              className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white flex items-center justify-center text-[#1A1A1A]"
                            >
                              <Heart size={14} fill="currentColor" />
                            </button>
                          </div>
                          {product.university && <p className="text-xs text-[#999] truncate">{product.university}</p>}
                          <Link to={`/product/${product.slug}`} className="text-sm font-medium hover:underline truncate block">{product.name}</Link>
                          <p className="text-sm font-semibold mt-0.5">${(product.salePrice ?? product.price).toFixed(2)}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'orders' && <OrdersTab orders={orders} />}

            {activeTab === 'wishlist' && (
              <div>
                <h2 className="text-2xl font-bold mb-6">Wishlist</h2>
                {wishlistItems.length === 0 ? (
                  <div className="text-center py-12 bg-[#F5F5F5]">
                    <Heart size={36} className="mx-auto text-[#CCC] mb-4" />
                    <p className="text-[#666]">Your wishlist is empty</p>
                    <Link to="/shop" className="text-sm underline mt-2 inline-block">Browse Products</Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
                    {wishlistItems.map(product => (
                      <div key={product.id} className="group">
                        <div className="relative bg-[#F5F5F5] mb-2">
                          <Link to={`/product/${product.slug}`}>
                            <img src={product.images[0]} alt={product.name} className="w-full aspect-square object-cover" />
                          </Link>
                          <button
                            onClick={() => { removeFromWishlist(product.id); showToast('Removed from wishlist'); }}
                            className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white flex items-center justify-center text-[#1A1A1A]"
                          >
                            <Heart size={14} fill="currentColor" />
                          </button>
                        </div>
                        {product.university && <p className="text-xs text-[#999] truncate">{product.university}</p>}
                        <Link to={`/product/${product.slug}`} className="text-sm font-medium hover:underline truncate block">{product.name}</Link>
                        <p className="text-sm font-semibold mt-0.5">${(product.salePrice ?? product.price).toFixed(2)}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'addresses' && user && (
              <AddressesTab
                addresses={user.addresses}
                addAddress={addAddress}
                updateAddress={updateAddress}
                removeAddress={removeAddress}
              />
            )}

            {activeTab === 'payment' && <PaymentMethodsTab />}

            {activeTab === 'account' && user && (
              <AccountDetailsTab user={user} updateProfile={updateProfile} deleteAccount={deleteAccount} />
            )}

            {activeTab === 'security' && (
              <SecurityTab changePassword={changePassword} deleteAccount={deleteAccount} />
            )}

            {activeTab === 'reviews' && <ReviewsTab />}
          </div>
        </div>
      </div>
    </div>
  );
}
