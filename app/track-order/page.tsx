"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import styles from "./trackOrder.module.css";

function TrackOrderForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [orderId,  setOrderId]  = useState(searchParams.get("order") ?? "");
  const [contact,  setContact]  = useState("");
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/track-order", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ orderId: orderId.trim(), contact: contact.trim() }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Invalid details.");
      } else {
        // Cookie is set by the API response â€” navigate to the full order page.
        router.push(`/orders/${orderId.trim()}`);
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.container}>

        <div className={styles.header}>
          <h1 className={styles.title}>Track Your Order</h1>
          <p className={styles.sub}>
            Enter your Order ID and the phone number or email address used at checkout.
          </p>
        </div>

        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="orderId">Order ID</label>
            <input
              id="orderId"
              className={styles.input}
              type="text"
              placeholder="e.g. dRgUvAiriWC312HzjkBv"
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
              autoComplete="off"
              spellCheck={false}
              required
            />
            <span className={styles.hint}>
              Found on your order confirmation email or the Order Confirmed page.
            </span>
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="contact">Phone or Email</label>
            <input
              id="contact"
              className={styles.input}
              type="text"
              placeholder="10-digit mobile number or email address"
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              autoComplete="off"
              required
            />
            <span className={styles.hint}>
              Use the phone number or email you provided during checkout.
            </span>
          </div>

          {error && (
            <p className={styles.error} role="alert">
              {error}
            </p>
          )}

          <button
            type="submit"
            className={styles.submitBtn}
            disabled={loading || !orderId.trim() || !contact.trim()}
          >
            {loading ? "Verifyingâ€¦" : "Track Order"}
          </button>
        </form>

      </div>
    </div>
  );
}

export default function TrackOrderPage() {
  return (
    <Suspense>
      <TrackOrderForm />
    </Suspense>
  );
}

