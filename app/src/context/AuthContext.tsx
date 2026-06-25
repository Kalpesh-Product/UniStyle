import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { api, getToken, setToken, ApiError, type BackendUser, type BackendOrder, type BackendAddressInput, type BackendUserPreferences } from '@/lib/api';

export interface Address {
  id: string;
  label: string;
  firstName: string;
  lastName: string;
  address1: string;
  address2?: string;
  city: string;
  country: string;
  postalCode: string;
  phone: string;
  isDefault: boolean;
}

export interface Order {
  id: string;
  date: string;
  deliveredAt?: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
  items: { productId: string; name: string; image: string; price: number; quantity: number }[];
  total: number;
  shippingAddress: Address;
}

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  avatar?: string;
  phone?: string;
  dateOfBirth?: string;
  gender?: string;
  nationality?: string;
  preferences?: BackendUserPreferences;
  addresses: Address[];
  createdAt?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (data: { firstName: string; lastName: string; email: string; password: string }) => Promise<boolean>;
  logout: () => void;
  updateProfile: (data: Partial<Omit<User, 'preferences'>> & { preferences?: Partial<BackendUserPreferences> }) => Promise<void>;
  addAddress: (address: Omit<Address, 'id'>) => Promise<void>;
  updateAddress: (addressId: string, address: Partial<Omit<Address, 'id'>>) => Promise<void>;
  removeAddress: (addressId: string) => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  deleteAccount: () => Promise<void>;
  orders: Order[];
  refreshOrders: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function splitFullName(fullName: string): { firstName: string; lastName: string } {
  const [firstName, ...rest] = fullName.trim().split(' ');
  return { firstName: firstName || '', lastName: rest.join(' ') };
}

function addressFromBackend(addr: BackendAddressInput & { _id: string }): Address {
  const { firstName, lastName } = splitFullName(addr.fullName);
  return {
    id: addr._id,
    label: addr.label || 'Home',
    firstName,
    lastName,
    address1: addr.line1,
    address2: addr.line2,
    city: addr.city,
    country: addr.country,
    postalCode: addr.postalCode,
    phone: addr.phone || '',
    isDefault: addr.isDefault || false,
  };
}

function addressToBackend(addr: Omit<Address, 'id'>): BackendAddressInput {
  return {
    label: addr.label,
    fullName: `${addr.firstName} ${addr.lastName}`.trim(),
    line1: addr.address1,
    line2: addr.address2,
    city: addr.city,
    postalCode: addr.postalCode,
    country: addr.country,
    phone: addr.phone,
    isDefault: addr.isDefault,
  };
}

function addressPatchToBackend(addr: Partial<Omit<Address, 'id'>>): Partial<BackendAddressInput> {
  const patch: Partial<BackendAddressInput> = {};
  if (addr.label !== undefined) patch.label = addr.label;
  if (addr.firstName !== undefined || addr.lastName !== undefined) {
    patch.fullName = `${addr.firstName ?? ''} ${addr.lastName ?? ''}`.trim();
  }
  if (addr.address1 !== undefined) patch.line1 = addr.address1;
  if (addr.address2 !== undefined) patch.line2 = addr.address2;
  if (addr.city !== undefined) patch.city = addr.city;
  if (addr.postalCode !== undefined) patch.postalCode = addr.postalCode;
  if (addr.country !== undefined) patch.country = addr.country;
  if (addr.phone !== undefined) patch.phone = addr.phone;
  if (addr.isDefault !== undefined) patch.isDefault = addr.isDefault;
  return patch;
}

function userFromBackend(u: BackendUser): User {
  return {
    id: u._id,
    firstName: u.firstName || '',
    lastName: u.lastName || '',
    email: u.email,
    phone: u.phone,
    dateOfBirth: u.dateOfBirth,
    gender: u.gender,
    nationality: u.nationality,
    preferences: u.preferences,
    addresses: u.addresses.map(addressFromBackend),
    createdAt: u.createdAt,
  };
}

const STATUS_MAP: Record<BackendOrder['status'], Order['status']> = {
  PENDING: 'pending',
  PAID: 'processing',
  SHIPPED: 'shipped',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
  REFUNDED: 'refunded',
};

function orderFromBackend(o: BackendOrder): Order {
  const { firstName, lastName } = splitFullName(o.shippingAddress.fullName);
  return {
    id: o._id,
    date: new Date(o.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
    deliveredAt: o.status === 'DELIVERED' ? o.updatedAt : undefined,
    status: STATUS_MAP[o.status],
    items: o.items.map(item => ({
      productId: item.productId._id,
      name: item.productId.name,
      image: item.productId.images[0],
      price: item.price / 100,
      quantity: item.quantity,
    })),
    total: o.total / 100,
    shippingAddress: {
      id: '',
      label: 'Home',
      firstName,
      lastName,
      address1: o.shippingAddress.line1,
      address2: o.shippingAddress.line2,
      city: o.shippingAddress.city,
      country: o.shippingAddress.country,
      postalCode: o.shippingAddress.postalCode,
      phone: o.shippingAddress.phone || '',
      isDefault: false,
    },
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);

  const refreshOrders = useCallback(async () => {
    try {
      const { orders: backendOrders } = await api.getOrders();
      setOrders(backendOrders.map(orderFromBackend));
    } catch {
      setOrders([]);
    }
  }, []);

  useEffect(() => {
    if (!getToken()) return;
    api.getMe()
      .then(({ user: backendUser }) => {
        setUser(userFromBackend(backendUser));
        refreshOrders();
      })
      .catch(() => setToken(null));
  }, [refreshOrders]);

  const login = useCallback(async (email: string, password: string) => {
    try {
      const { token, user: backendUser } = await api.login({ email, password });
      setToken(token);
      setUser(userFromBackend(backendUser));
      await refreshOrders();
      return true;
    } catch (err) {
      if (err instanceof ApiError) return false;
      throw err;
    }
  }, [refreshOrders]);

  const register = useCallback(async (data: { firstName: string; lastName: string; email: string; password: string }) => {
    try {
      const { token, user: backendUser } = await api.signup(data);
      setToken(token);
      setUser(userFromBackend(backendUser));
      return true;
    } catch (err) {
      if (err instanceof ApiError) return false;
      throw err;
    }
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    setOrders([]);
  }, []);

  const updateProfile = useCallback(async (data: Partial<Omit<User, 'preferences'>> & { preferences?: Partial<BackendUserPreferences> }) => {
    const { user: backendUser } = await api.patchMe({
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      phone: data.phone,
      dateOfBirth: data.dateOfBirth,
      gender: data.gender,
      nationality: data.nationality,
      preferences: data.preferences,
    });
    setUser(userFromBackend(backendUser));
  }, []);

  const addAddress = useCallback(async (address: Omit<Address, 'id'>) => {
    const { user: backendUser } = await api.addAddress(addressToBackend(address));
    setUser(userFromBackend(backendUser));
  }, []);

  const updateAddress = useCallback(async (addressId: string, address: Partial<Omit<Address, 'id'>>) => {
    const { user: backendUser } = await api.updateAddress(addressId, addressPatchToBackend(address));
    setUser(userFromBackend(backendUser));
  }, []);

  const removeAddress = useCallback(async (addressId: string) => {
    const { user: backendUser } = await api.removeAddress(addressId);
    setUser(userFromBackend(backendUser));
  }, []);

  const changePassword = useCallback(async (currentPassword: string, newPassword: string) => {
    await api.changePassword({ currentPassword, newPassword });
  }, []);

  const deleteAccount = useCallback(async () => {
    await api.deleteAccount();
    setToken(null);
    setUser(null);
    setOrders([]);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        updateProfile,
        addAddress,
        updateAddress,
        removeAddress,
        changePassword,
        deleteAccount,
        orders,
        refreshOrders,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
