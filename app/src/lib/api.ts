const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';
const TOKEN_KEY = 'unistyle-token';
const ADMIN_TOKEN_KEY = 'unistyle-admin-token';

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string | null) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

export function getAdminToken(): string | null {
  return localStorage.getItem(ADMIN_TOKEN_KEY);
}

export function setAdminToken(token: string | null) {
  if (token) localStorage.setItem(ADMIN_TOKEN_KEY, token);
  else localStorage.removeItem(ADMIN_TOKEN_KEY);
}

export class ApiError extends Error {
  status: number;
  details?: unknown;
  constructor(message: string, status: number, details?: unknown) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> | undefined),
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });

  if (res.status === 204) return undefined as T;

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new ApiError(data.error || 'Request failed', res.status, data.details);
  }

  return data as T;
}

// Separate from `request`: admin sessions use their own token (not the
// customer auth token), and CSV upload needs to send FormData instead of JSON.
async function adminRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getAdminToken();
  const isFormData = options.body instanceof FormData;
  const headers: Record<string, string> = {
    ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
    ...(options.headers as Record<string, string> | undefined),
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });

  if (res.status === 204) return undefined as T;

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new ApiError(data.error || 'Request failed', res.status, data.details);
  }

  return data as T;
}

// ---- Auth ----
export const api = {
  signup: (data: { email: string; password: string; firstName?: string; lastName?: string }) =>
    request<{ token: string; user: BackendUser }>('/auth/signup', { method: 'POST', body: JSON.stringify(data) }),

  login: (data: { email: string; password: string }) =>
    request<{ token: string; user: BackendUser }>('/auth/login', { method: 'POST', body: JSON.stringify(data) }),

  getMe: () => request<{ user: BackendUser }>('/auth/me'),

  patchMe: (data: {
    firstName?: string; lastName?: string; email?: string; phone?: string;
    dateOfBirth?: string; gender?: string; nationality?: string;
    preferences?: Partial<BackendUserPreferences>;
  }) =>
    request<{ user: BackendUser }>('/auth/me', { method: 'PATCH', body: JSON.stringify(data) }),

  addAddress: (data: BackendAddressInput) =>
    request<{ user: BackendUser }>('/auth/me/addresses', { method: 'POST', body: JSON.stringify(data) }),

  updateAddress: (addressId: string, data: Partial<BackendAddressInput>) =>
    request<{ user: BackendUser }>(`/auth/me/addresses/${addressId}`, { method: 'PATCH', body: JSON.stringify(data) }),

  removeAddress: (addressId: string) =>
    request<{ user: BackendUser }>(`/auth/me/addresses/${addressId}`, { method: 'DELETE' }),

  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    request<void>('/auth/me/change-password', { method: 'POST', body: JSON.stringify(data) }),

  deleteAccount: () => request<void>('/auth/me', { method: 'DELETE' }),

  // ---- Products ----
  getProducts: (params: { category?: string; university?: string; gender?: string; search?: string; featured?: boolean; page?: number; limit?: number } = {}) => {
    const qs = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => { if (v !== undefined) qs.set(k, String(v)); });
    return request<{ products: BackendProduct[]; total: number; page: number; limit: number }>(`/products?${qs}`);
  },

  getProductBySlug: (slug: string) => request<{ product: BackendProduct }>(`/products/${slug}`),

  // ---- Cart ----
  getCart: () => request<{ items: BackendCartItem[] }>('/cart'),

  addToCart: (data: { productId: string; quantity?: number; size?: string; color?: string }) =>
    request<{ item: BackendCartItem }>('/cart', { method: 'POST', body: JSON.stringify(data) }),

  updateCartItem: (itemId: string, quantity: number) =>
    request<{ item: BackendCartItem }>(`/cart/${itemId}`, { method: 'PATCH', body: JSON.stringify({ quantity }) }),

  removeCartItem: (itemId: string) => request<void>(`/cart/${itemId}`, { method: 'DELETE' }),

  clearCart: () => request<void>('/cart', { method: 'DELETE' }),

  // ---- Wishlist ----
  getWishlist: () => request<{ items: BackendWishlistItem[] }>('/wishlist'),

  addToWishlist: (productId: string) =>
    request<{ item: BackendWishlistItem }>('/wishlist', { method: 'POST', body: JSON.stringify({ productId }) }),

  removeFromWishlist: (productId: string) => request<void>(`/wishlist/${productId}`, { method: 'DELETE' }),

  // ---- Checkout / Orders ----
  createCheckoutSession: (data: { shippingAddress: BackendAddressInput }) =>
    request<{ orderId: string; redirectUrl?: string; url?: string }>('/checkout/create-session', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getOrders: () => request<{ orders: BackendOrder[] }>('/orders'),

  // ---- Reviews ----
  getMyReviews: () => request<{ reviews: BackendReview[]; awaiting: BackendAwaitingReview[] }>('/reviews/me'),

  createReview: (data: { productId: string; orderId: string; rating: number; comment: string }) =>
    request<{ review: BackendReview }>('/reviews', { method: 'POST', body: JSON.stringify(data) }),

  updateReview: (id: string, data: { rating?: number; comment?: string }) =>
    request<{ review: BackendReview }>(`/reviews/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),

  // ---- Admin ----
  adminLogin: (data: { username: string; password: string }) =>
    adminRequest<{ token: string }>('/admin/login', { method: 'POST', body: JSON.stringify(data) }),

  createProduct: (data: AdminProductInput) =>
    adminRequest<{ product: BackendProduct }>('/products', { method: 'POST', body: JSON.stringify(data) }),

  updateProduct: (id: string, data: Partial<AdminProductInput>) =>
    adminRequest<{ product: BackendProduct }>(`/products/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),

  deleteProduct: (id: string) => adminRequest<void>(`/products/${id}`, { method: 'DELETE' }),

  importProductsCsv: (file: File, write: boolean) => {
    const form = new FormData();
    form.append('file', file);
    return adminRequest<ImportSheetResult>(`/products/import-sheet${write ? '?write=true' : ''}`, {
      method: 'POST',
      body: form,
    });
  },
};

// ---- Backend response shapes ----
export interface BackendAddressInput {
  label?: string;
  fullName: string;
  line1: string;
  line2?: string;
  city: string;
  state?: string;
  postalCode: string;
  country: string;
  phone?: string;
  isDefault?: boolean;
}

export interface BackendAddress extends BackendAddressInput {
  _id: string;
}

export interface BackendUserPreferences {
  emailNotifications: boolean;
  smsNotifications: boolean;
  language: string;
  currency: string;
}

export interface BackendUser {
  _id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  dateOfBirth?: string;
  gender?: string;
  nationality?: string;
  preferences?: BackendUserPreferences;
  addresses: BackendAddress[];
  createdAt?: string;
}

export interface BackendProduct {
  _id: string;
  slug: string;
  name: string;
  description: string;
  price: number; // cents
  compareAt?: number; // cents
  category: string;
  university?: string;
  gender?: 'men' | 'women' | 'unisex';
  images: string[];
  sizes: string[];
  colors: { name: string; hex: string }[];
  stock: number;
  featured: boolean;
  rating?: number;
  reviewCount?: number;
  badge?: string;
  countdownEnd?: string;
}

export interface BackendCartItem {
  _id: string;
  productId: BackendProduct;
  quantity: number;
  size?: string;
  color?: string;
}

export interface BackendWishlistItem {
  _id: string;
  productId: BackendProduct;
}

export interface BackendOrderItem {
  productId: BackendProduct;
  quantity: number;
  size?: string;
  color?: string;
  price: number;
}

export interface BackendOrder {
  _id: string;
  status: 'PENDING' | 'PAID' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED' | 'REFUNDED';
  total: number;
  shippingAddress: BackendAddressInput;
  items: BackendOrderItem[];
  createdAt: string;
  updatedAt: string;
}

export interface BackendReview {
  _id: string;
  userId: string;
  productId: BackendProduct;
  orderId: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface BackendAwaitingReview {
  orderId: string;
  deliveredAt: string;
  product: BackendProduct;
}

export interface AdminProductInput {
  name: string;
  description: string;
  price: number; // cents
  compareAt?: number; // cents
  category: string;
  university?: string;
  gender?: 'men' | 'women' | 'unisex';
  images: string[];
  sizes: string[];
  colors: { name: string; hex: string }[];
  stock: number;
  featured: boolean;
  rating?: number;
  reviewCount?: number;
  badge?: string;
}

export interface ImportSheetResult {
  dryRun: boolean;
  totalRows: number;
  validProducts: number;
  skipped: number;
  imported?: number;
  warnings: string[];
  products?: AdminProductInput[];
}
