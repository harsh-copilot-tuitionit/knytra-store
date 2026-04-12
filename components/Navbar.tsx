"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShoppingCart, Menu, Search, X } from "lucide-react";
import styles from "./Navbar.module.css";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useWishlist } from "@/context/WishlistContext";

export default function Navbar() {
  const pathname = usePathname();
  const { cartCount, toggleCart, clearCart, clearBuyNow } = useCart();
  const { user, loading, logout } = useAuth();
  const { resetWishlist } = useWishlist();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    // Close mobile menu after route navigation.
    setMobileMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
      return;
    }
    document.body.style.overflow = "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  async function handleLogout() {
    try {
      await logout();
      setMobileMenuOpen(false);
      resetWishlist();
      clearCart();
      clearBuyNow();
      window.location.href = "/";
    } catch (err) {
      console.error("[Navbar] Logout failed", err);
    }
  }

  return (
    <>
      <nav className={`${styles.navbar} ${mobileMenuOpen ? styles.navbarMenuOpen : ""}`}>
        <div className={styles.navContainer}>
          {/* Left - Mobile Menu */}
          <div className={styles.mobileMenu}>
            <button
              className={styles.iconButton}
              onClick={() => setMobileMenuOpen((v) => !v)}
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-nav-menu"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
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

      <div
        className={`${styles.mobileBackdrop} ${mobileMenuOpen ? styles.mobileBackdropOpen : ""}`}
        onClick={() => setMobileMenuOpen(false)}
        aria-hidden={!mobileMenuOpen}
      />

      <div
        id="mobile-nav-menu"
        className={`${styles.mobilePanel} ${mobileMenuOpen ? styles.mobilePanelOpen : ""}`}
      >
        <div className={styles.mobilePanelLinks}>
          <Link href="/shop" className={styles.mobileLink} onClick={() => setMobileMenuOpen(false)}>
            Shop
          </Link>
          <Link href="/shop/collections" className={styles.mobileLink} onClick={() => setMobileMenuOpen(false)}>
            Collections
          </Link>
          {!loading && user ? (
            <>
              <Link href="/account" className={styles.mobileLink} onClick={() => setMobileMenuOpen(false)}>
                Account
              </Link>
              <Link href="/wishlist" className={styles.mobileLink} onClick={() => setMobileMenuOpen(false)}>
                Wishlist
              </Link>
              <button className={styles.mobileLogoutBtn} onClick={() => void handleLogout()}>
                Logout
              </button>
            </>
          ) : (
            <Link href="/login" className={styles.mobileLink} onClick={() => setMobileMenuOpen(false)}>
              Login
            </Link>
          )}
        </div>
      </div>
    </>
  );
}
