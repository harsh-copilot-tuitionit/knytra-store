import Link from "next/link";
import styles from "./Footer.module.css";
import React from "react";

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.topSection}>
          <div className={styles.brandCol}>
            <h2 className={styles.logo}>KNYTRA</h2>
            <p className={styles.tagline}>WEAR THE STREETS.</p>
            <a 
              href="https://instagram.com/knytra.in" 
              target="_blank" 
              rel="noopener noreferrer"
              className={styles.socialLink}
            >
              @knytra.in
            </a>
          </div>

          <div className={styles.linksGrid}>
            <div className={styles.linkGroup}>
              <h3>Shop</h3>
              <Link href="/shop">All Products</Link>
              <Link href="/shop/collections/new">New Arrivals</Link>
              <Link href="/shop/collections/bestsellers">Bestsellers</Link>
            </div>
            
            <div className={styles.linkGroup}>
              <h3>Support</h3>
              <Link href="/faq">FAQ</Link>
              <Link href="/shipping">Shipping & Returns</Link>
              <Link href="/contact">Contact Us</Link>
            </div>

            <div className={styles.linkGroup}>
              <h3>Legal</h3>
              <Link href="/terms">Terms of Service</Link>
              <Link href="/privacy">Privacy Policy</Link>
              <Link href="/refunds">Refund Policy</Link>
            </div>
          </div>
        </div>

        <div className={styles.bottomSection}>
          <p>© {new Date().getFullYear()} KNYTRA. ALL RIGHTS RESERVED.</p>
          <div className={styles.paymentMethods}>
            {/* Visual stubs for payment methods */}
            <span>UPI</span>
            <span>Cards</span>
            <span>NetBanking</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
