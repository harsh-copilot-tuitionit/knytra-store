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

interface SavedAddress {
  id: string;
  name: string;
  phone: string;
  line1: string;
  line2: string;
  city: string;
  state: string;
  pincode: string;
  isDefault: boolean;
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
    state: "",
    fullAddress: "",
  });
  const [paying, setPaying] = useState(false);
  const [paymentError, setPaymentError] = useState("");

  // ── Saved addresses ──────────────────────────────────────────────────────
  const [savedAddresses,   setSavedAddresses]   = useState<SavedAddress[]>([]);
  const [selectedAddrId,   setSelectedAddrId]   = useState<string>("new");
  const [addressesLoading, setAddressesLoading] = useState(false);
  const [saveNewAddress,   setSaveNewAddress]   = useState(false);
  const [savingAddress,    setSavingAddress]    = useState(false);

  // Fetch saved addresses when a logged-in user lands on checkout
  useEffect(() => {
    if (!user) return;
    let cancelled = false;

    async function fetchSavedAddresses() {
      setAddressesLoading(true);
      try {
        const token = await user!.getIdToken();
        const res   = await fetch("/api/addresses", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (cancelled || !res.ok) return;
        const data = await res.json();
        const list: SavedAddress[] = data.addresses ?? [];
        setSavedAddresses(list);

        // Pre-select default address and autofill the form
        const def = list.find(a => a.isDefault) ?? list[0] ?? null;
        if (def) {
          setSelectedAddrId(def.id);
          setForm(prev => ({
            ...prev,
            name:        def.name,
            phone:       def.phone,
            fullAddress: [def.line1, def.line2].filter(Boolean).join("\n"),
            city:        def.city,
            state:       def.state,
            pincode:     def.pincode,
          }));
        } else {
          setSelectedAddrId("new");
        }
      } catch {
        // Silent — user can still enter manually
      } finally {
        if (!cancelled) setAddressesLoading(false);
      }
    }

    fetchSavedAddresses();
    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // Autofill form when user picks a different saved address
  function handleSelectAddress(addr: SavedAddress | "new") {
    if (addr === "new") {
      setSelectedAddrId("new");
      setForm(prev => ({ ...prev, name: "", phone: "", fullAddress: "", city: "", state: "", pincode: "" }));
    } else {
      setSelectedAddrId(addr.id);
      setForm(prev => ({
        ...prev,
        name:        addr.name,
        phone:       addr.phone,
        fullAddress: [addr.line1, addr.line2].filter(Boolean).join("\n"),
        city:        addr.city,
        state:       addr.state,
        pincode:     addr.pincode,
      }));
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setPaymentError("");
  };

  // All required fields must be non-empty (email is optional for guests)
  const isValid =
    form.name.trim() !== "" &&
    form.phone.trim().length >= 10 &&
    form.pincode.trim().length === 6 &&
    form.city.trim() !== "" &&
    form.state.trim() !== "" &&
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
            name:        form.name,
            phone:       form.phone,
            pincode:     form.pincode,
            city:        form.city,
            state:       form.state,
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

    // 2b. Optionally save the address to the user's address book
    if (user && saveNewAddress && selectedAddrId === "new") {
      setSavingAddress(true);
      try {
        const token = await user.getIdToken();
        await fetch("/api/addresses", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            name:      form.name,
            phone:     form.phone,
            line1:     form.fullAddress.split("\n")[0] ?? form.fullAddress,
            line2:     form.fullAddress.split("\n").slice(1).join(", ") ?? "",
            city:      form.city,
            state:     form.state,
            pincode:   form.pincode,
            isDefault: savedAddresses.length === 0, // default if first
          }),
        });
      } catch {
        // Non-fatal — order is already created; failure here is silent
        console.warn("[checkout] Failed to save address to address book.");
      } finally {
        setSavingAddress(false);
      }
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

          {/* ── Saved addresses (logged-in users only) ── */}
          {user && (
            <div className={styles.savedSection}>
              {addressesLoading ? (
                <div className={styles.addrLoading}>Loading saved addresses…</div>
              ) : savedAddresses.length > 0 ? (
                <>
                  <p className={styles.savedLabel}>Saved Addresses</p>
                  <div className={styles.addrList}>
                    {savedAddresses.map(addr => (
                      <label
                        key={addr.id}
                        className={`${styles.addrOption} ${selectedAddrId === addr.id ? styles.addrOptionSelected : ""}`}
                      >
                        <input
                          type="radio"
                          name="savedAddress"
                          value={addr.id}
                          checked={selectedAddrId === addr.id}
                          onChange={() => handleSelectAddress(addr)}
                          className={styles.addrRadio}
                        />
                        <div className={styles.addrOptionBody}>
                          <span className={styles.addrOptionName}>
                            {addr.name}
                            {addr.isDefault && (
                              <span className={styles.addrDefaultTag}> · Default</span>
                            )}
                          </span>
                          <span className={styles.addrOptionDetail}>
                            {[addr.line1, addr.line2, addr.city, addr.state, addr.pincode]
                              .filter(Boolean)
                              .join(", ")}
                          </span>
                        </div>
                      </label>
                    ))}

                    <label
                      className={`${styles.addrOption} ${selectedAddrId === "new" ? styles.addrOptionSelected : ""}`}
                    >
                      <input
                        type="radio"
                        name="savedAddress"
                        value="new"
                        checked={selectedAddrId === "new"}
                        onChange={() => handleSelectAddress("new")}
                        className={styles.addrRadio}
                      />
                      <div className={styles.addrOptionBody}>
                        <span className={styles.addrOptionName}>Enter new address</span>
                      </div>
                    </label>
                  </div>
                </>
              ) : null}
            </div>
          )}

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

          <div className={styles.fieldGroup}>
            <label className={styles.label}>State</label>
            <input
              className={styles.input}
              name="state"
              value={form.state}
              onChange={handleChange}
              placeholder="Delhi"
              autoComplete="address-level1"
            />
          </div>

          {/* Save address checkbox — only for logged-in users entering a new address */}
          {user && selectedAddrId === "new" && (
            <label className={styles.saveAddrRow}>
              <input
                type="checkbox"
                checked={saveNewAddress}
                onChange={e => setSaveNewAddress(e.target.checked)}
                disabled={paying || savingAddress}
              />
              <span>Save this address to my account</span>
            </label>
          )}

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
