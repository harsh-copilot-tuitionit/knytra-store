"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShoppingCart, Menu, Search, X } from "lucide-react";
import styles from "./Navbar.module.css";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useWishlist } from "@/context/WishlistContext";

const PRIMARY_LINKS = [
  { href: "/shop", label: "Shop" },
  { href: "/drops", label: "Drops" },
  { href: "/lookbook", label: "Lookbook" },
  { href: "/about", label: "About" },
  { href: "/faq", label: "FAQ" },
  { href: "/contact", label: "Contact" },
];

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

  function isActivePath(href: string) {
    if (href === "/shop") {
      return pathname.startsWith("/shop");
    }

    return pathname === href || pathname.startsWith(`${href}/`);
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
            {PRIMARY_LINKS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`${styles.link} ${isActivePath(item.href) ? styles.linkActive : ""}`}
              >
                {item.label}
              </Link>
            ))}
            {!loading && user ? (
              <>
                <Link href="/account" className={`${styles.link} ${isActivePath("/account") ? styles.linkActive : ""}`}>
                  Account
                </Link>
                <Link href="/wishlist" className={`${styles.link} ${isActivePath("/wishlist") ? styles.linkActive : ""}`}>
                  Wishlist
                </Link>
                <button className={styles.logoutBtn} onClick={() => void handleLogout()}>
                  Logout
                </button>
              </>
            ) : (
              <Link href="/login" className={`${styles.link} ${isActivePath("/login") ? styles.linkActive : ""}`}>
                Login
              </Link>
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
          {PRIMARY_LINKS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`${styles.mobileLink} ${isActivePath(item.href) ? styles.mobileLinkActive : ""}`}
              onClick={() => setMobileMenuOpen(false)}
            >
              {item.label}
            </Link>
          ))}
          {!loading && user ? (
            <>
              <Link
                href="/account"
                className={`${styles.mobileLink} ${isActivePath("/account") ? styles.mobileLinkActive : ""}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                Account
              </Link>
              <Link
                href="/wishlist"
                className={`${styles.mobileLink} ${isActivePath("/wishlist") ? styles.mobileLinkActive : ""}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                Wishlist
              </Link>
              <button className={styles.mobileLogoutBtn} onClick={() => void handleLogout()}>
                Logout
              </button>
            </>
          ) : (
            <Link
              href="/login"
              className={`${styles.mobileLink} ${isActivePath("/login") ? styles.mobileLinkActive : ""}`}
              onClick={() => setMobileMenuOpen(false)}
            >
              Login
            </Link>
          )}
        </div>
      </div>
    </>
  );
}
