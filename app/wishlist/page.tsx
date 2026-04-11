"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { track } from "@/lib/analytics";
import styles from "./wishlist.module.css";

export default function WishlistPage() {
  const { user } = useAuth();
  const { addToCart } = useCart();
  const {
    wishlistItems,
    loading,
    error,
    refreshWishlist,
    removeFromWishlist,
    isToggling,
  } = useWishlist();

  const [pageError, setPageError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      void refreshWishlist();
    }
  }, [user, refreshWishlist]);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 1800);
    return () => clearTimeout(timer);
  }, [toast]);

  if (!user) return null;

  const removeItem = async (productId: string) => {
    setPageError(null);
    try {
      await removeFromWishlist(productId, "wishlist");
    } catch {
      setPageError("Something went wrong. Please try again.");
    }
  };

  const moveToCart = async (item: {
    productId: string;
    name: string;
    price: number;
    image: string;
  }) => {
    setPageError(null);
    addToCart({
      id: `${item.productId}-One Size`,
      productId: item.productId,
      name: item.name,
      size: "One Size",
      price: item.price,
      image: item.image,
      quantity: 1,
    });

    track("wishlist_move_to_cart", {
      productId: item.productId,
      source: "wishlist",
    });

    try {
      await removeFromWishlist(item.productId, "wishlist");
      setToast("Moved to cart");
    } catch {
      setPageError("Added to cart, but could not remove from wishlist.");
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div className={styles.headerInner}>
          <Link href="/account" className={styles.backBtn}>← Account</Link>
          <h1 className={styles.title}>Wishlist</h1>
          <span className={styles.count}>{wishlistItems.length} items</span>
        </div>
      </div>

      <main className={styles.body}>
        {(error || pageError) && (
          <div className={styles.errorBanner}>
            {pageError ?? error ?? "Something went wrong. Please try again."}
          </div>
        )}

        {loading ? (
          <div className={styles.grid}>
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className={`${styles.skeletonCard} skeleton`} />
            ))}
          </div>
        ) : wishlistItems.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon} aria-hidden="true">♡</div>
            <h2>Your wishlist is empty</h2>
            <Link href="/shop" className={styles.cta}>Explore products</Link>
          </div>
        ) : (
          <div className={styles.grid}>
            {wishlistItems.map((item) => {
              const pending = isToggling(item.productId);
              return (
                <article key={item.productId} className={styles.card}>
                  <Link href={`/shop/${item.productId}`} className={styles.imageWrap}>
                    {item.image ? (
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        sizes="(max-width: 768px) 45vw, 280px"
                        className={styles.image}
                      />
                    ) : (
                      <div className={styles.placeholder} />
                    )}
                  </Link>

                  <div className={styles.cardBody}>
                    <Link href={`/shop/${item.productId}`} className={styles.name}>
                      {item.name}
                    </Link>
                    <p className={styles.price}>₹{item.price.toLocaleString("en-IN")}</p>

                    <div className={styles.actions}>
                      <button
                        className={styles.primaryBtn}
                        onClick={() => void moveToCart(item)}
                        disabled={pending}
                      >
                        Move to Cart
                      </button>
                      <button
                        className={styles.secondaryBtn}
                        onClick={() => void removeItem(item.productId)}
                        disabled={pending}
                      >
                        {pending ? "Removing…" : "Remove"}
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </main>

      {toast && <div className={styles.toast}>{toast}</div>}
    </div>
  );
}
