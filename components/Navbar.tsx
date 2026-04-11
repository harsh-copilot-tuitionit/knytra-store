"use client";

import Link from "next/link";
import { ShoppingCart, Menu, Search } from "lucide-react";
import styles from "./Navbar.module.css";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useWishlist } from "@/context/WishlistContext";

export default function Navbar() {
  const { cartCount, toggleCart, clearCart, clearBuyNow } = useCart();
  const { user, loading, logout } = useAuth();
  const { resetWishlist } = useWishlist();

  async function handleLogout() {
    try {
      await logout();
      resetWishlist();
      clearCart();
      clearBuyNow();
      window.location.href = "/";
    } catch (err) {
      console.error("[Navbar] Logout failed", err);
    }
  }

  return (
    <nav className={styles.navbar}>
      <div className={styles.navContainer}>
        {/* Left - Mobile Menu */}
        <div className={styles.mobileMenu}>
          <button className={styles.iconButton}>
            <Menu size={24} />
          </button>
        </div>

        {/* Brand Center/Left */}
        <div className={styles.brand}>
          <Link href="/shop" className={styles.logo}>
            KNYTRA
          </Link>
        </div>

        {/* Center - Nav Links (Desktop) */}
        <div className={styles.navLinks}>
          <Link href="/shop" className={styles.link}>Shop</Link>
          <Link href="/shop/collections" className={styles.link}>Collections</Link>
          {!loading && user ? (
            <>
              <Link href="/account" className={styles.link}>Account</Link>
              <Link href="/wishlist" className={styles.link}>Wishlist</Link>
              <button className={styles.logoutBtn} onClick={() => void handleLogout()}>
                Logout
              </button>
            </>
          ) : (
            <Link href="/login" className={styles.link}>Login</Link>
          )}
        </div>

        {/* Right - Actions */}
        <div className={styles.actions}>
          <button className={`${styles.iconButton} ${styles.desktopSearch}`}>
            <Search size={22} />
          </button>
          
          <button className={styles.cartButton} onClick={toggleCart}>
            <ShoppingCart size={22} />
            {cartCount > 0 && (
              <span className={styles.cartBadge}>{cartCount}</span>
            )}
          </button>
        </div>
      </div>
    </nav>
  );
}
