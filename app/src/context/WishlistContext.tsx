import React, { createContext, useContext, useState, useCallback, useMemo, useEffect, useRef } from 'react';
import type { Product } from '@/data/products';
import { api, type BackendWishlistItem } from '@/lib/api';
import { adaptProduct } from '@/lib/productAdapter';
import { useAuth } from '@/context/AuthContext';

interface WishlistContextType {
  items: Product[];
  addToWishlist: (product: Product) => void;
  removeFromWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  clearWishlist: () => void;
  totalItems: number;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

const GUEST_WISHLIST_KEY = 'unistyle-guest-wishlist';

function readGuestWishlist(): Product[] {
  try {
    const saved = localStorage.getItem(GUEST_WISHLIST_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

function writeGuestWishlist(items: Product[]) {
  localStorage.setItem(GUEST_WISHLIST_KEY, JSON.stringify(items));
}

function fromBackend(item: BackendWishlistItem): Product {
  return adaptProduct(item.productId);
}

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  const [items, setItems] = useState<Product[]>(() => readGuestWishlist());
  const hasMerged = useRef(false);

  const refreshServerWishlist = useCallback(async () => {
    const { items: backendItems } = await api.getWishlist();
    setItems(backendItems.map(fromBackend));
  }, []);

  useEffect(() => {
    if (!isAuthenticated) {
      hasMerged.current = false;
      setItems(readGuestWishlist());
      return;
    }
    if (hasMerged.current) return;
    hasMerged.current = true;

    const guestItems = readGuestWishlist();
    (async () => {
      for (const product of guestItems) {
        await api.addToWishlist(product.id).catch(() => {});
      }
      if (guestItems.length) {
        localStorage.removeItem(GUEST_WISHLIST_KEY);
      }
      await refreshServerWishlist();
    })();
  }, [isAuthenticated, refreshServerWishlist]);

  const addToWishlist = useCallback((product: Product) => {
    if (isAuthenticated) {
      api.addToWishlist(product.id).then(refreshServerWishlist);
      return;
    }
    setItems(prev => {
      if (prev.find(p => p.id === product.id)) return prev;
      const newItems = [...prev, product];
      writeGuestWishlist(newItems);
      return newItems;
    });
  }, [isAuthenticated, refreshServerWishlist]);

  const removeFromWishlist = useCallback((productId: string) => {
    if (isAuthenticated) {
      api.removeFromWishlist(productId).then(refreshServerWishlist);
      return;
    }
    setItems(prev => {
      const newItems = prev.filter(p => p.id !== productId);
      writeGuestWishlist(newItems);
      return newItems;
    });
  }, [isAuthenticated, refreshServerWishlist]);

  const isInWishlist = useCallback(
    (productId: string) => items.some(p => p.id === productId),
    [items]
  );

  const clearWishlist = useCallback(() => {
    if (isAuthenticated) {
      Promise.all(items.map(p => api.removeFromWishlist(p.id))).then(refreshServerWishlist);
      return;
    }
    setItems([]);
    localStorage.removeItem(GUEST_WISHLIST_KEY);
  }, [isAuthenticated, items, refreshServerWishlist]);

  const totalItems = useMemo(() => items.length, [items]);

  return (
    <WishlistContext.Provider value={{ items, addToWishlist, removeFromWishlist, isInWishlist, clearWishlist, totalItems }}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) throw new Error('useWishlist must be used within WishlistProvider');
  return context;
}
