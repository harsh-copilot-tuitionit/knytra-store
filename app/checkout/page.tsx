"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { track } from "@/lib/analytics";
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

function normalisePhoneInput(raw: string): string {
  return raw.replace(/\D/g, "").slice(0, 10);
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
  const [addressSaveInfo,  setAddressSaveInfo]  = useState("");
  const [savedAddrError,   setSavedAddrError]   = useState("");
  const [savedAddrReload,  setSavedAddrReload]  = useState(0);
  const addressActionsLocked = paying || savingAddress || addressesLoading;

  // Fetch saved addresses when a logged-in user lands on checkout
  useEffect(() => {
    if (!user) return;
    let cancelled = false;

    async function fetchSavedAddresses() {
      setAddressesLoading(true);
      setSavedAddrError("");
      try {
        const token = await user!.getIdToken();
        const res   = await fetch("/api/addresses", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (cancelled) return;

        if (res.status === 401) {
          router.replace("/login?next=/checkout");
          return;
        }

        if (!res.ok) {
          throw new Error("Failed to load saved addresses.");
        }

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
          track("address_selected", { source: "checkout", mode: "saved" });
        } else {
          setSelectedAddrId("new");
          track("address_selected", { source: "checkout", mode: "new" });
        }
      } catch {
        if (!cancelled) {
          setSavedAddrError("Could not load saved addresses. You can enter a new address.");
        }
      } finally {
        if (!cancelled) setAddressesLoading(false);
      }
    }

    fetchSavedAddresses();
    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, savedAddrReload, router]);

  // Autofill form when user picks a different saved address
  function handleSelectAddress(addr: SavedAddress | "new") {
    if (addressActionsLocked) return;

    if (addr === "new") {
      setSelectedAddrId("new");
      setForm(prev => ({ ...prev, name: "", phone: "", fullAddress: "", city: "", state: "", pincode: "" }));
      setAddressSaveInfo("");
      track("address_selected", { source: "checkout", mode: "new" });
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
      setAddressSaveInfo("");
      track("address_selected", { source: "checkout", mode: "saved" });
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (addressActionsLocked) return;

    const { name, value } = e.target;
    const nextValue =
      name === "phone"
        ? normalisePhoneInput(value)
        : name === "pincode"
          ? value.replace(/\D/g, "").slice(0, 6)
          : value;
    setForm((prev) => ({ ...prev, [name]: nextValue }));
    setPaymentError("");
    setAddressSaveInfo("");
    // Per spec: if user edits any field while a saved address is selected,
    // treat the entry as a new address (do NOT overwrite the saved one).
    if (selectedAddrId !== "new") {
      setSelectedAddrId("new");
      track("address_selected", { source: "checkout", mode: "new" });
    }
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
    setAddressSaveInfo("");
    setPaying(true);

    // Shared request setup
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (user) {
      const idToken = await user.getIdToken();
      headers["Authorization"] = `Bearer ${idToken}`;
    }

    const orderBody = {
      amount: checkoutTotal * 100,
      items: checkoutItems,
      user: {
        name: form.name,
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
    };

    // Optionally save address (fire-and-forget for both flows)
    if (user && saveNewAddress && selectedAddrId === "new") {
      setSavingAddress(true);
      const saveAddressPromise = (async () => {
        const token = await user.getIdToken();
        const saveRes = await fetch("/api/addresses", {
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
            isDefault: savedAddresses.length === 0,
          }),
        });
        if (!saveRes.ok) {
          const data = await saveRes.json().catch(() => ({}));
          throw new Error(data.error ?? "Failed to save address to address book.");
        }
        track("address_saved", {
          source: "checkout",
          type: "new",
          isDefault: savedAddresses.length === 0,
        });
      })();

      saveAddressPromise
        .catch((err: unknown) => {
          const message = err instanceof Error
            ? err.message
            : "Address could not be saved to your account. Payment can continue.";
          setAddressSaveInfo(message);
          console.warn("[checkout] Failed to save address.", err);
        })
        .finally(() => { setSavingAddress(false); });
    }

    // ── Razorpay flow ──
    const loaded = await loadRazorpayScript();
    if (!loaded) {
      setPaymentError("Failed to load payment gateway. Please try again.");
      setPaying(false);
      return;
    }

    let razorpay_order_id: string;
    let orderAmount: number;
    let firestoreOrderId: string;
    try {
      const res = await fetch("/api/create-order", {
        method: "POST",
        headers,
        body: JSON.stringify(orderBody),
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
        // form.email is "" for auth users (readOnly field never fires handleChange);
        // fall back to the Firebase user email so Razorpay modal is pre-filled.
        email: user?.email ?? form.email,
        contact: form.phone,
      },
      theme: { color: "#000000" },

      // 4. Success — verify inline, always land on /order-success
      handler: async (response: RazorpaySuccessResponse) => {
        clearBuyNow();
        if (!isBuyNow) clearCart();

        const successUrl =
          `/order-success?doc_id=${firestoreOrderId}` +
          `&payment_id=${response.razorpay_payment_id}`;

        try {
          const verifyRes = await fetch("/api/verify-payment", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              razorpay_order_id:   response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature:  response.razorpay_signature,
              firestore_order_id:  firestoreOrderId,
            }),
          });
          if (!verifyRes.ok) {
            console.error("[checkout] verify-payment returned", verifyRes.status);
          }
        } catch (err) {
          // Webhook is the safety net — still redirect to success
          console.error("[checkout] verify-payment fetch failed:", err);
        }

        router.replace(successUrl);
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
              {savedAddrError && (
                <div className={styles.savedErrorBanner}>
                  <span>{savedAddrError}</span>
                  <button
                    type="button"
                    className={styles.retryBtn}
                    onClick={() => setSavedAddrReload((v) => v + 1)}
                    disabled={addressesLoading}
                  >
                    Retry
                  </button>
                </div>
              )}

              {addressesLoading ? (
                <div className={styles.addrList}>
                  {Array.from({ length: 2 }).map((_, i) => (
                    <div key={i} className={styles.addrOption} aria-hidden="true">
                      <div className={`${styles.addrRadioSkeleton} skeleton`} />
                      <div className={styles.addrOptionBody}>
                        <div className={`${styles.addrLineSkeletonShort} skeleton`} />
                        <div className={`${styles.addrLineSkeletonLong} skeleton`} />
                      </div>
                    </div>
                  ))}
                </div>
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
                          disabled={addressActionsLocked}
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
                        disabled={addressActionsLocked}
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
              disabled={addressActionsLocked}
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
                disabled={addressActionsLocked}
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
                disabled={addressActionsLocked}
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
              disabled={addressActionsLocked}
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
                disabled={addressActionsLocked}
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
                disabled={addressActionsLocked}
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
              disabled={addressActionsLocked}
            />
          </div>

          {/* Save address checkbox — only for logged-in users entering a new address */}
          {user && selectedAddrId === "new" && (
            <label className={styles.saveAddrRow}>
              <input
                type="checkbox"
                checked={saveNewAddress}
                onChange={e => setSaveNewAddress(e.target.checked)}
                disabled={addressActionsLocked}
              />
              <span>Save this address to my account</span>
            </label>
          )}

          {addressSaveInfo && (
            <p className={styles.addressSaveInfo}>{addressSaveInfo}</p>
          )}



          <p className={styles.secureNote}>
            🔒 Secure checkout · Payments powered by Razorpay
          </p>
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
              disabled={!isValid || paying || (!!user && addressesLoading)}
            >
              {paying
                ? "Opening payment…"
                : isValid
                  ? "Proceed to Pay →"
                  : "Fill details to continue"}
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
          disabled={!isValid || paying || (!!user && addressesLoading)}
        >
          {paying
            ? "Opening payment…"
            : isValid
              ? "Proceed to Pay →"
              : "Fill details to continue"}
        </button>
      </div>
    </div>
  );
}
