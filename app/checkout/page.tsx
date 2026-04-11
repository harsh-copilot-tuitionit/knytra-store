"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import styles from "./checkout.module.css";

// Minimal Razorpay window type
declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => RazorpayInstance;
  }
}
interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  prefill: { name: string; email: string; contact: string };
  theme: { color: string };
  handler: (response: RazorpaySuccessResponse) => void;
  modal: { ondismiss: () => void };
}
interface RazorpayInstance { open(): void; }
export interface RazorpaySuccessResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (document.getElementById("razorpay-script")) { resolve(true); return; }
    const script = document.createElement("script");
    script.id = "razorpay-script";
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, cartTotal, cartCount, buyNowItem, clearBuyNow, clearCart, isHydrated } = useCart();
  const { user } = useAuth();

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

  // Redirect to shop when cart is confirmed empty (after hydration)
  useEffect(() => {
    if (isHydrated && !hasItems) {
      router.replace("/shop");
    }
  }, [isHydrated, hasItems, router]);

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    pincode: "",
    city: "",
    fullAddress: "",
  });
  const [paying, setPaying] = useState(false);
  const [paymentError, setPaymentError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setPaymentError("");
  };

  // All required fields must be non-empty (email is optional)
  const isValid =
    form.name.trim() !== "" &&
    form.phone.trim().length >= 10 &&
    form.pincode.trim().length === 6 &&
    form.city.trim() !== "" &&
    form.fullAddress.trim() !== "";

  const handleProceed = async () => {
    if (!isValid || paying) return;
    setPaymentError("");
    setPaying(true);

    // 1. Load Razorpay SDK
    const loaded = await loadRazorpayScript();
    if (!loaded) {
      setPaymentError("Failed to load payment gateway. Please try again.");
      setPaying(false);
      return;
    }

    // 2. Create Razorpay order via our backend
    let razorpay_order_id: string;
    let orderAmount: number;
    let firestoreOrderId: string;
    try {
      const headers: Record<string, string> = { "Content-Type": "application/json" };

      if (user) {
        // Send a fresh ID token so the server can derive userId and canonical
        // email from the verified token — the body values are not trusted.
        const idToken = await user.getIdToken();
        headers["Authorization"] = `Bearer ${idToken}`;
      }

      const res = await fetch("/api/create-order", {
        method: "POST",
        headers,
        body: JSON.stringify({
          amount: checkoutTotal * 100, // paise
          items: checkoutItems,
          // userId is intentionally absent — derived server-side from the token
          user: {
            name: form.name,
            // For auth users the server will override this with auth.email;
            // included here only for guest orders.
            email: form.email,
            phone: form.phone,
          },
          address: {
            name: form.name,
            phone: form.phone,
            pincode: form.pincode,
            city: form.city,
            fullAddress: form.fullAddress,
          },
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        if (res.status === 401) {
          setPaymentError("Session expired. Please login again.");
          setPaying(false);
          router.replace("/login?next=/checkout");
          return;
        }
        throw new Error(data.error ?? "Order creation failed");
      }
      const data = await res.json();
      razorpay_order_id = data.razorpay_order_id;
      orderAmount = data.amount;
      firestoreOrderId = data.firestore_order_id;
    } catch {
      setPaymentError("Could not initiate payment. Please try again.");
      setPaying(false);
      return;
    }

    // 3. Open Razorpay modal
    try {
      const rzp = new window.Razorpay({
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
      amount: orderAmount,
      currency: "INR",
      name: "KNYTRA",
      description: `Order (${checkoutItems.length} item${checkoutItems.length > 1 ? "s" : ""})`,
      order_id: razorpay_order_id,
      prefill: {
        name: form.name,
        email: form.email,
        contact: form.phone,
      },
      theme: { color: "#000000" },

      // 4. Success
      handler: (response: RazorpaySuccessResponse) => {
        clearBuyNow();
        if (!isBuyNow) clearCart();
        router.push(
          `/order-confirmation?payment_id=${response.razorpay_payment_id}` +
          `&order_id=${response.razorpay_order_id}` +
          `&signature=${response.razorpay_signature}` +
          `&doc_id=${firestoreOrderId}`
        );
      },

      // 5. Dismiss / failure
      modal: {
        ondismiss: () => {
          setPaymentError("Payment cancelled. You can try again.");
          setPaying(false);
        },
      },
    });

      rzp.open();
    } catch {
      setPaymentError("Failed to open payment modal. Please try again.");
      setPaying(false);
    }
  };

  // Show nothing while cart is loading from localStorage
  if (!isHydrated) return null;

  // Redirect to shop is handled by the useEffect above — show nothing while it fires
  if (!hasItems) return null;

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
                value={user ? (user.email ?? "") : form.email}
                onChange={user ? undefined : handleChange}
                readOnly={!!user}
                placeholder="yourmail@mail.com"
                autoComplete="email"
                style={user ? { background: "#f5f5f5", color: "#888", cursor: "not-allowed" } : undefined}
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

          {/* Desktop pay button — hidden on mobile */}
          <div className={styles.desktopPayBtn}>
            <button
              className={styles.placeOrderBtn}
              onClick={handleProceed}
              disabled={!isValid || paying}
            >
              {paying ? "Opening payment…" : isValid ? "Proceed to Pay →" : "Fill details to continue"}
            </button>
            {paymentError && (
              <p className={styles.paymentError}>{paymentError}</p>
            )}
          </div>
        </section>

      </div>

      {/* ── Sticky pay bar — mobile only ── */}
      <div className={styles.stickyPayBar}>
        {paymentError && (
          <p className={styles.paymentError}>{paymentError}</p>
        )}
        <button
          className={styles.placeOrderBtn}
          onClick={handleProceed}
          disabled={!isValid || paying}
        >
          {paying ? "Opening payment…" : isValid ? "Proceed to Pay →" : "Fill details to continue"}
        </button>
      </div>
    </div>
  );
}
