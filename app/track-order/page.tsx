"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import styles from "./trackOrder.module.css";

interface TrackItem {
  name: string;
  size: string;
  quantity: number;
  price: number;
  image: string;
}

interface TrackResult {
  id: string;
  status: "placed" | "shipped" | "delivered";
  totalAmount: number;
  createdAt: string | null;
  items: TrackItem[];
  payment: { status: string };
  address: { city: string; pincode: string };
}

const DELIVERY_STEPS: { key: TrackResult["status"]; label: string; desc: string }[] = [
  { key: "placed",    label: "Order Placed", desc: "We've received your order."           },
  { key: "shipped",   label: "Shipped",      desc: "Your order is on its way."            },
  { key: "delivered", label: "Delivered",    desc: "Your order has been delivered."       },
];

const STEP_INDEX: Record<string, number> = { placed: 0, shipped: 1, delivered: 2 };

const PAYMENT_COLOR: Record<string, string> = {
  success: "#1a7a3e",
  pending: "#a06000",
  failed:  "#cc0000",
};

const PAYMENT_LABEL: Record<string, string> = {
  success: "Paid",
  pending: "Pending",
  failed:  "Failed",
};

function formatDate(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric", month: "long", year: "numeric",
  });
}

export default function TrackOrderPage() {
  const [orderId, setOrderId] = useState("");
  const [phone,   setPhone]   = useState("");
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");
  const [result,  setResult]  = useState<TrackResult | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setResult(null);
    setLoading(true);

    try {
      const res = await fetch("/api/track-order", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ orderId: orderId.trim(), phone: phone.trim() }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Order not found or details do not match.");
      } else {
        setResult(data as TrackResult);
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const currentStep = result ? (STEP_INDEX[result.status] ?? 0) : 0;

  return (
    <div className={styles.page}>
      <div className={styles.container}>

        <div className={styles.header}>
          <h1 className={styles.title}>Track Your Order</h1>
          <p className={styles.sub}>
            Enter your Order ID and registered phone number to track your shipment.
          </p>
        </div>

        {/* ── Lookup form */}
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
            <label className={styles.label} htmlFor="phone">Phone Number</label>
            <input
              id="phone"
              className={styles.input}
              type="tel"
              placeholder="10-digit mobile number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              autoComplete="tel"
              required
            />
          </div>

          {error && <p className={styles.error}>{error}</p>}

          <button
            type="submit"
            className={styles.submitBtn}
            disabled={loading || !orderId.trim() || !phone.trim()}
          >
            {loading ? "Tracking…" : "Track Order"}
          </button>
        </form>

        {/* ── Results */}
        {result && (
          <div className={styles.result}>

            {/* ── Order meta */}
            <div className={styles.resultHeader}>
              <div>
                <p className={styles.resultRef}>
                  Order <span>#{result.id.slice(-8).toUpperCase()}</span>
                </p>
                <p className={styles.resultDate}>Placed on {formatDate(result.createdAt)}</p>
              </div>
              <div className={styles.resultMeta}>
                <span
                  className={styles.payBadge}
                  style={{ color: PAYMENT_COLOR[result.payment.status] ?? "#555" }}
                >
                  {PAYMENT_LABEL[result.payment.status] ?? result.payment.status}
                </span>
                <span className={styles.cityBadge}>
                  {result.address.city}{result.address.pincode ? ` — ${result.address.pincode}` : ""}
                </span>
              </div>
            </div>

            {/* ── Delivery tracker */}
            <div className={styles.tracker}>
              {DELIVERY_STEPS.map((step, i) => {
                const active  = i <= currentStep;
                const current = i === currentStep;
                return (
                  <div key={step.key} className={`${styles.step} ${active ? styles.stepActive : ""}`}>
                    <div className={styles.stepLeft}>
                      <div className={`${styles.dot} ${current ? styles.dotCurrent : ""}`}>
                        {active && i < currentStep && <span>✓</span>}
                      </div>
                      {i < DELIVERY_STEPS.length - 1 && (
                        <div className={`${styles.line} ${active && i < currentStep ? styles.lineFilled : ""}`} />
                      )}
                    </div>
                    <div className={styles.stepBody}>
                      <span className={styles.stepLabel}>{step.label}</span>
                      {current && <span className={styles.stepDesc}>{step.desc}</span>}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* ── Items summary */}
            <div className={styles.items}>
              <h2 className={styles.itemsTitle}>Items</h2>
              {result.items.map((item, i) => (
                <div key={i} className={styles.item}>
                  {item.image && (
                    <div className={styles.itemImg}>
                      <Image src={item.image} alt={item.name} fill sizes="56px" style={{ objectFit: "cover" }} />
                    </div>
                  )}
                  <div className={styles.itemInfo}>
                    <span className={styles.itemName}>{item.name}</span>
                    <span className={styles.itemMeta}>Size: {item.size} · Qty: {item.quantity}</span>
                  </div>
                  <span className={styles.itemPrice}>
                    ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                  </span>
                </div>
              ))}
              <div className={styles.totalRow}>
                <span>Total</span>
                <span>₹{result.totalAmount.toLocaleString("en-IN")}</span>
              </div>
            </div>

            {/* ── CTAs */}
            <div className={styles.ctas}>
              <Link href={`/orders/${result.id}`} className={styles.detailBtn}>
                Full Order Details →
              </Link>
              <button
                className={styles.resetBtn}
                onClick={() => { setResult(null); setOrderId(""); setPhone(""); }}
              >
                Track Another Order
              </button>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
