"use client";

import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { track } from "@/lib/analytics";
import {
  isValidWishlistProductId,
  WishlistItem,
  WishlistProductInput,
} from "@/lib/wishlist";

type WishlistSource = "pdp" | "plp" | "wishlist";

interface WishlistContextType {
  wishlistItems: WishlistItem[];
  loading: boolean;
  error: string | null;
  isInWishlist: (productId: string) => boolean;
  isToggling: (productId: string) => boolean;
  refreshWishlist: () => Promise<void>;
  toggleWishlist: (product: WishlistProductInput, source: WishlistSource) => Promise<void>;
  removeFromWishlist: (productId: string, source?: WishlistSource) => Promise<void>;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

function getLoginRedirect(): string {
  if (typeof window === "undefined") return "/login";
  const next = window.location.pathname + window.location.search;
  return `/login?next=${encodeURIComponent(next || "/wishlist")}`;
}

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pendingIds, setPendingIds] = useState<Set<string>>(new Set());

  const itemsRef = useRef<WishlistItem[]>([]);
  useEffect(() => {
    itemsRef.current = wishlistItems;
  }, [wishlistItems]);

  const inWishlistSet = useMemo(
    () => new Set(wishlistItems.map((item) => item.productId)),
    [wishlistItems],
  );

  const clearForSignedOut = useCallback(() => {
    setWishlistItems([]);
    setError(null);
    setPendingIds(new Set());
    setLoading(false);
  }, []);

  const refreshWishlist = useCallback(async () => {
    if (!user) {
      clearForSignedOut();
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const token = await user.getIdToken();
      const res = await fetch("/api/wishlist", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.status === 401) {
        setWishlistItems([]);
        setError("Session expired. Please login again.");
        router.replace(getLoginRedirect());
        return;
      }

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Failed to fetch wishlist.");
      }

      const data = await res.json();
      const rows = Array.isArray(data.items) ? (data.items as WishlistItem[]) : [];
      setWishlistItems(rows);
    } catch (err) {
      console.error("[Wishlist] Failed to fetch wishlist", err);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [clearForSignedOut, router, user]);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      clearForSignedOut();
      return;
    }
    void refreshWishlist();
  }, [authLoading, clearForSignedOut, refreshWishlist, user]);

  const isToggling = (productId: string) => pendingIds.has(productId);

  const isInWishlist = (productId: string) => inWishlistSet.has(productId);

  const toggleWishlist = useCallback(async (product: WishlistProductInput, source: WishlistSource) => {
    if (!isValidWishlistProductId(product.productId)) {
      throw new Error("Invalid product id.");
    }

    if (!user) {
      router.push(getLoginRedirect());
      return;
    }

    if (pendingIds.has(product.productId)) return;

    const snapshot = itemsRef.current;
    const currentlyIn = snapshot.some((item) => item.productId === product.productId);

    setError(null);
    setPendingIds((prev) => new Set(prev).add(product.productId));

    setWishlistItems((prev) => {
      if (currentlyIn) {
        return prev.filter((item) => item.productId !== product.productId);
      }

      const optimistic: WishlistItem = {
        productId: product.productId,
        name: product.name,
        price: product.price,
        image: product.image,
        addedAt: Date.now(),
      };
      return [optimistic, ...prev];
    });

    try {
      const token = await user.getIdToken();
      const res = await fetch("/api/wishlist/toggle", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(product),
      });

      if (res.status === 401) {
        router.replace(getLoginRedirect());
        throw new Error("Session expired.");
      }

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Wishlist toggle failed.");
      }

      const data = await res.json() as { inWishlist?: boolean };
      const inWishlist = data.inWishlist === true;

      setWishlistItems((prev) => {
        const exists = prev.some((item) => item.productId === product.productId);
        if (inWishlist && !exists) {
          const inserted: WishlistItem = {
            productId: product.productId,
            name: product.name,
            price: product.price,
            image: product.image,
            addedAt: Date.now(),
          };
          return [inserted, ...prev];
        }
        if (!inWishlist && exists) {
          return prev.filter((item) => item.productId !== product.productId);
        }
        return prev;
      });

      track("wishlist_toggle", { productId: product.productId, source });
      track(inWishlist ? "wishlist_add" : "wishlist_remove", {
        productId: product.productId,
        source,
      });
    } catch (err) {
      setWishlistItems(snapshot);
      setError("Something went wrong. Please try again.");
      throw err;
    } finally {
      setPendingIds((prev) => {
        const next = new Set(prev);
        next.delete(product.productId);
        return next;
      });
    }
  }, [pendingIds, router, user]);

  const removeFromWishlist = useCallback(async (productId: string, source: WishlistSource = "wishlist") => {
    if (!isValidWishlistProductId(productId)) {
      throw new Error("Invalid product id.");
    }

    if (!user) {
      router.push(getLoginRedirect());
      return;
    }

    if (pendingIds.has(productId)) return;

    const snapshot = itemsRef.current;
    setError(null);
    setPendingIds((prev) => new Set(prev).add(productId));
    setWishlistItems((prev) => prev.filter((item) => item.productId !== productId));

    try {
      const token = await user.getIdToken();
      const res = await fetch(`/api/wishlist/${productId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.status === 401) {
        router.replace(getLoginRedirect());
        throw new Error("Session expired.");
      }

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Failed to remove wishlist item.");
      }

      track("wishlist_remove", { productId, source });
    } catch (err) {
      setWishlistItems(snapshot);
      setError("Something went wrong. Please try again.");
      throw err;
    } finally {
      setPendingIds((prev) => {
        const next = new Set(prev);
        next.delete(productId);
        return next;
      });
    }
  }, [pendingIds, router, user]);

  return (
    <WishlistContext.Provider
      value={{
        wishlistItems,
        loading,
        error,
        isInWishlist,
        isToggling,
        refreshWishlist,
        toggleWishlist,
        removeFromWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error("useWishlist must be used within a WishlistProvider");
  }
  return context;
}
