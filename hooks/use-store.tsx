"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { Product } from "@/types/product";
import { products } from "@/data/products";

export type CartLine = Product & { quantity: number; variantId?: string };
type StoredCartItem = { productId: string; quantity: number; variantId?: string };
type LegacyStoredCartItem = { productId?: number | string; id?: number; stableId?: string; quantity: number; variantId?: string };

type StoreContextValue = {
  cart: CartLine[];
  favorites: number[];
  addToCart: (product: Product, quantity?: number, variantId?: string) => void;
  decreaseCartQuantity: (id: number, variantId?: string) => void;
  setCartQuantity: (id: number, quantity: number, variantId?: string) => void;
  removeFromCart: (id: number) => void;
  clearCart: () => void;
  toggleFavorite: (id: number) => void;
  cartCount: number;
  cartTotal: number;
  cartNotice: string;
};

const StoreContext = createContext<StoreContextValue | null>(null);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [cartItems, setCartItems] = useState<StoredCartItem[]>([]);
  const [favorites, setFavorites] = useState<number[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [cartNotice, setCartNotice] = useState("");

  useEffect(() => {
    const savedCart = window.localStorage.getItem("andreas-cart");
    const savedFavorites = window.localStorage.getItem("andreas-favorites");
    if (savedCart) {
      try {
        const parsed = JSON.parse(savedCart) as LegacyStoredCartItem[];
        const reconciled = parsed
            .flatMap((item) => {
              const storedStableId = item.stableId ?? (typeof item.productId === "string" ? item.productId : undefined);
              const numericId = typeof item.productId === "number" ? item.productId : item.id;
              const product = storedStableId
                ? products.find((candidate) => candidate.stableId === storedStableId)
                : products.find((candidate) => candidate.id === numericId);
              return product
                ? [{
                    productId: product.stableId,
                    quantity: Math.max(1, Math.floor(item.quantity || 1)),
                    variantId: item.variantId,
                  }]
                : [];
            });
        setCartItems(reconciled);
        if (reconciled.length < parsed.length) {
          setCartNotice("Um ou mais produtos deixaram de estar disponíveis e foram removidos do carrinho.");
        }
      } catch {
        setCartItems([]);
      }
    }
    if (savedFavorites) {
      try {
        setFavorites((JSON.parse(savedFavorites) as number[]).filter((id) => products.some((product) => product.id === id)));
      } catch {
        setFavorites([]);
      }
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) window.localStorage.setItem("andreas-cart", JSON.stringify(cartItems));
  }, [cartItems, hydrated]);

  useEffect(() => {
    if (hydrated) window.localStorage.setItem("andreas-favorites", JSON.stringify(favorites));
  }, [favorites, hydrated]);

  const cart = useMemo<CartLine[]>(
    () =>
      cartItems.flatMap((item) => {
        const product = products.find((candidate) => candidate.stableId === item.productId);
        return product ? [{ ...product, quantity: item.quantity, variantId: item.variantId }] : [];
      }),
    [cartItems],
  );

  const value = useMemo<StoreContextValue>(() => {
    const addToCart = (product: Product, quantity = 1, variantId?: string) => {
      if (!products.some((candidate) => candidate.id === product.id)) return;
      const safeQuantity = Math.max(1, Math.floor(quantity));
      setCartItems((current) => {
        const existing = current.find((item) => item.productId === product.stableId && item.variantId === variantId);
        if (existing) {
          return current.map((item) =>
            item.productId === product.stableId && item.variantId === variantId
              ? { ...item, quantity: item.quantity + safeQuantity }
              : item,
          );
        }
        return [...current, { productId: product.stableId, quantity: safeQuantity, variantId }];
      });
    };

    const setCartQuantity = (id: number, quantity: number, variantId?: string) => {
      const safeQuantity = Math.max(1, Math.floor(quantity));
      const stableId = products.find((product) => product.id === id)?.stableId;
      if (!stableId) return;
      setCartItems((current) =>
        current.map((item) =>
          item.productId === stableId && item.variantId === variantId ? { ...item, quantity: safeQuantity } : item,
        ),
      );
    };

    const decreaseCartQuantity = (id: number, variantId?: string) => {
      const stableId = products.find((product) => product.id === id)?.stableId;
      if (!stableId) return;
      setCartItems((current) =>
        current.map((item) =>
          item.productId === stableId && item.variantId === variantId
            ? { ...item, quantity: Math.max(1, item.quantity - 1) }
            : item,
        ),
      );
    };

    const removeFromCart = (id: number) => {
      const stableId = products.find((product) => product.id === id)?.stableId;
      if (!stableId) return;
      setCartItems((current) => current.filter((item) => item.productId !== stableId));
    };

    const toggleFavorite = (id: number) => {
      setFavorites((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]));
    };

    return {
      cart,
      favorites,
      addToCart,
      decreaseCartQuantity,
      setCartQuantity,
      removeFromCart,
      clearCart: () => setCartItems([]),
      toggleFavorite,
      cartCount: cart.reduce((sum, item) => sum + item.quantity, 0),
      cartTotal: cart.reduce((sum, item) => sum + Math.round(item.price * 100) * item.quantity, 0) / 100,
      cartNotice,
    };
  }, [cart, cartNotice, favorites]);

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const context = useContext(StoreContext);
  if (!context) throw new Error("useStore must be used inside StoreProvider");
  return context;
}
