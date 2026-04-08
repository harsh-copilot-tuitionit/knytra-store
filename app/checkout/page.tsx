"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import styles from "./checkout.module.css";

export default function CheckoutPage() {
  const { cart, cartTotal, cartCount, buyNowItem, clearBuyNow } = useCart();

  // Clear buyNowItem when the user navigates away from this page
  useEffect(() => {
    return () => { clearBuyNow(); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Buy Now mode: single item bypasses the cart
  const isBuyNow = buyNowItem !== null;
  const checkoutItems = isBuyNow ? [buyNowItem] : cart;
  const checkoutTotal = isBuyNow
    ? buyNowItem.price * buyNowItem.quantity
    : cartTotal;
  const hasItems = isBuyNow ? true : cartCount > 0;

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    pincode: "",
    city: "",
    fullAddress: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // All required fields must be non-empty (email is optional)
  const isValid =
    form.name.trim() !== "" &&
    form.phone.trim().length >= 10 &&
    form.pincode.trim().length === 6 &&
    form.city.trim() !== "" &&
    form.fullAddress.trim() !== "";

  const handleProceed = () => {
    if (!isValid) return;
    // Razorpay payment initiation — Ticket 4
  };

  if (!hasItems) {
    return (
      <div className={styles.empty}>
        <p className={styles.emptyIcon}>🛍</p>
        <h2 className={styles.emptyTitle}>Your cart is empty.</h2>
        <p className={styles.emptySub}>Add some pieces before checking out.</p>
        <Link href="/shop" className={styles.shopBtn}>Browse the Shop</Link>
      </div>
    );
  }

  return (
    <div className={styles.page}>

      <div className={styles.header}>
        <Link href="/shop" className={styles.backBtn}>← Back</Link>
        <span className={styles.brand}>KNYTRA</span>
        <span />
      </div>

      <div className={styles.layout}>

        {/* ── Left: Address form ── */}
        <section className={styles.formSection}>
          <h2 className={styles.sectionTitle}>Delivery Details</h2>

          <div className={styles.fieldGroup}>
            <label className={styles.label}>Full Name</label>
            <input
              className={styles.input}
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="First Name Last Name"
              autoComplete="name"
            />
          </div>

          <div className={styles.fieldRow}>
            <div className={styles.fieldGroup}>
              <label className={styles.label}>Email</label>
              <input
                className={styles.input}
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="yourmail@mail.com"
                autoComplete="email"
              />
            </div>
            <div className={styles.fieldGroup}>
              <label className={styles.label}>Phone</label>
              <input
                className={styles.input}
                name="phone"
                type="tel"
                value={form.phone}
                onChange={handleChange}
                placeholder="9876543210"
                autoComplete="tel"
              />
            </div>
          </div>

          <div className={styles.fieldGroup}>
            <label className={styles.label}>Full Address</label>
            <textarea
              className={styles.textarea}
              name="fullAddress"
              value={form.fullAddress}
              onChange={handleChange}
              placeholder="House/Flat no., Street, Area"
              rows={3}
              autoComplete="street-address"
            />
          </div>

          <div className={styles.fieldRow}>
            <div className={styles.fieldGroup}>
              <label className={styles.label}>City</label>
              <input
                className={styles.input}
                name="city"
                value={form.city}
                onChange={handleChange}
                placeholder="New Delhi"
                autoComplete="address-level2"
              />
            </div>
            <div className={styles.fieldGroup}>
              <label className={styles.label}>Pincode</label>
              <input
                className={styles.input}
                name="pincode"
                value={form.pincode}
                onChange={handleChange}
                placeholder="110001"
                autoComplete="postal-code"
                maxLength={6}
              />
            </div>
          </div>

          <p className={styles.secureNote}>🔒 Secure checkout · Payments powered by Razorpay</p>
        </section>

        {/* ── Right: Order summary ── */}
        <section className={styles.summarySection}>
          <h2 className={styles.sectionTitle}>Order Summary</h2>

          <div className={styles.itemsList}>
            {checkoutItems.map((item) => (
              <div key={item.id} className={styles.item}>
                <div className={styles.itemImageWrap}>
                  {item.image ? (
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      sizes="72px"
                      className={styles.itemImage}
                    />
                  ) : (
                    <div className={styles.itemImageFallback} />
                  )}
                </div>
                <div className={styles.itemDetails}>
                  <p className={styles.itemName}>{item.name}</p>
                  <p className={styles.itemMeta}>Size: {item.size} · Qty: {item.quantity}</p>
                </div>
                <p className={styles.itemPrice}>
                  ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                </p>
              </div>
            ))}
          </div>

          <div className={styles.totalsBlock}>
            <div className={styles.totalRow}>
              <span>Subtotal</span>
              <span>₹{checkoutTotal.toLocaleString("en-IN")}</span>
            </div>
            <div className={styles.totalRow}>
              <span>Shipping</span>
              <span className={styles.free}>Free</span>
            </div>
            <div className={`${styles.totalRow} ${styles.grandTotal}`}>
              <span>Total</span>
              <span>₹{checkoutTotal.toLocaleString("en-IN")}</span>
            </div>
          </div>

          <button
            className={styles.placeOrderBtn}
            onClick={handleProceed}
            disabled={!isValid}
          >
            {isValid ? "Proceed to Pay →" : "Fill details to continue"}
          </button>
        </section>

      </div>
    </div>
  );
}
