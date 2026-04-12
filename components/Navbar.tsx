"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShoppingCart, Menu, Search, X } from "lucide-react";
import styles from "./Navbar.module.css";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useWishlist } from "@/context/WishlistContext";

const HIDE_START_Y = 50;
const TOP_SHOW_Y = 20;
const SCROLL_DELTA_THRESHOLD = 8;

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
  const { cartCount, toggleCart, clearCart, clearBuyNow, isCartOpen } = useCart();
  const { user, loading, logout } = useAuth();
  const { resetWishlist } = useWishlist();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const lastScrollYRef = useRef(0);
  const rafPendingRef = useRef(false);
  const isVisibleRef = useRef(true);

  function setNavbarVisible(nextVisible: boolean) {
    if (isVisibleRef.current === nextVisible) return;
    isVisibleRef.current = nextVisible;
    setIsVisible(nextVisible);
  }

  function hasActiveModal() {
    return Boolean(document.querySelector('[aria-modal="true"], [role="dialog"]'));
  }

  useEffect(() => {
    // Close mobile menu after route navigation.
    setMobileMenuOpen(false);
    setNavbarVisible(true);
    if (typeof window !== "undefined") {
      lastScrollYRef.current = window.scrollY;
    }
  }, [pathname]);

  useEffect(() => {
    isVisibleRef.current = isVisible;
  }, [isVisible]);

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

  useEffect(() => {
    if (mobileMenuOpen || isCartOpen || hasActiveModal()) {
      setNavbarVisible(true);
    }
  }, [mobileMenuOpen, isCartOpen]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const observer = new MutationObserver(() => {
      if (hasActiveModal()) {
        setNavbarVisible(true);
      }
    });

    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    let disposed = false;
    lastScrollYRef.current = window.scrollY;

    // Use requestAnimationFrame to keep scroll updates smooth and avoid main-thread thrash.
    const onScroll = () => {
      if (rafPendingRef.current) return;

      rafPendingRef.current = true;
      window.requestAnimationFrame(() => {
        rafPendingRef.current = false;
        if (disposed) return;

        const currentY = window.scrollY;
        const delta = currentY - lastScrollYRef.current;
        const absDelta = Math.abs(delta);

        if (mobileMenuOpen || isCartOpen || hasActiveModal()) {
          setNavbarVisible(true);
          lastScrollYRef.current = currentY;
          return;
        }

        if (currentY < TOP_SHOW_Y) {
          setNavbarVisible(true);
          lastScrollYRef.current = currentY;
          return;
        }

        if (absDelta < SCROLL_DELTA_THRESHOLD) {
          lastScrollYRef.current = currentY;
          return;
        }

        if (delta > 0 && currentY > HIDE_START_Y) {
          setNavbarVisible(false);
        } else if (delta < 0) {
          setNavbarVisible(true);
        }

        lastScrollYRef.current = currentY;
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      disposed = true;
      window.removeEventListener("scroll", onScroll);
      rafPendingRef.current = false;
    };
  }, [mobileMenuOpen, isCartOpen]);

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
      <nav
        className={`${styles.navbar} ${mobileMenuOpen ? styles.navbarMenuOpen : ""} ${
          isVisible ? styles.navbarVisible : styles.navbarHidden
        }`}
      >
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
