"use client";

import Link from "next/link";
import { ShoppingCart, Menu, Search } from "lucide-react";
import styles from "./Navbar.module.css";
import { useCart } from "@/context/CartContext";

export default function Navbar() {
  const { cartCount, toggleCart } = useCart();

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
          <Link href="/account" className={styles.link}>Account</Link>
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
