"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Suspense, useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import styles from "./orderSuccess.module.css";

interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  size: string;
  image: string;
}

interface OrderData {
  id: string;
  items: OrderItem[];
  totalAmount: number;
  address: {
    name: string;
    city: string;
    pincode: string;
    fullAddress: string;
  };
  payment: {
    razorpay_payment_id: string;
  };
  whatsapp: {
    sent: boolean;
    error: string | null;
  };
  createdAt: string | null;
}

function OrderSuccessContent() {
  const params = useSearchParams();
  const { user, loading: authLoading } = useAuth();
  const docId = params.get("doc_id") ?? "";
  const paymentId = params.get("payment_id") ?? "";

  const [order, setOrder] = useState<OrderData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (authLoading) return;          // wait for Firebase auth to settle
    if (!docId) { setError(true); setLoading(false); return; }

    const MAX_RETRIES = 5;
    const RETRY_DELAY = 800;          // ms
    let cancelled = false;

    async function fetchOrder(attempt: number) {
      try {
        const headers: Record<string, string> = {};
        if (user) {
          const token = await user.getIdToken();
          headers["Authorization"] = `Bearer ${token}`;
        }

        const url = paymentId
          ? `/api/orders/${docId}?payment_id=${encodeURIComponent(paymentId)}`
          : `/api/orders/${docId}`;
        const res = await fetch(url, { headers });
        if (!res.ok) throw new Error(`Status ${res.status}`);
        const data: OrderData = await res.json();
        if (!cancelled) { setOrder(data); setLoading(false); }
      } catch (err) {
        console.warn(`[order-success] fetch attempt ${attempt} failed:`, err);
        if (!cancelled && attempt < MAX_RETRIES) {
          await new Promise((r) => setTimeout(r, RETRY_DELAY));
          if (!cancelled) fetchOrder(attempt + 1);
        } else if (!cancelled) {
          setError(true);
          setLoading(false);
        }
      }
    }

    fetchOrder(1);
    return () => { cancelled = true; };
  }, [docId, user, authLoading]);

  if (loading) {
    return (
      <div className={styles.page}>
        <div className={styles.card}>
          <div className={styles.spinner} />
          <p className={styles.sub}>Loading your order…</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className={styles.page}>
        <div className={styles.card}>
          <div className={styles.checkmark}>✓</div>
          <h1 className={styles.title}>Payment Successful</h1>
          <p className={styles.sub}>
            Your payment went through, but we couldn&apos;t load the order
            details right now. You can view your order from the Orders page.
          </p>
          {paymentId && (
            <div className={styles.paymentId}>
              Payment ID: <span>{paymentId}</span>
            </div>
          )}
          <Link href="/account/orders" className={styles.cta}>View My Orders</Link>
          <Link href="/shop" className={styles.ctaSecondary}>Continue Shopping</Link>
        </div>
      </div>
    );
  }

  const displayPaymentId = paymentId || order.payment?.razorpay_payment_id || "—";

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        {/* Header */}
        <div className={styles.checkmark}>✓</div>
        <h1 className={styles.title}>Order Confirmed!</h1>
        <p className={styles.sub}>
          Thanks for shopping with KNYTRA. Your order will ship in 5–7 business days.
        </p>

        {/* Order ref */}
        <div className={styles.refBox}>
          <span className={styles.refLabel}>Order Ref</span>
          <span className={styles.refValue}>{order.id.slice(-8).toUpperCase()}</span>
        </div>

        {/* Items */}
        <div className={styles.items}>
          <h2 className={styles.sectionTitle}>Items Ordered</h2>
          {order.items.map((item, i) => (
            <div key={i} className={styles.item}>
              {item.image && (
                <div className={styles.itemImage}>
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    sizes="64px"
                    style={{ objectFit: "cover" }}
                  />
                </div>
              )}
              <div className={styles.itemInfo}>
                <span className={styles.itemName}>{item.name}</span>
                <span className={styles.itemMeta}>
                  Size: {item.size} &nbsp;·&nbsp; Qty: {item.quantity}
                </span>
              </div>
              <span className={styles.itemPrice}>
                ₹{(item.price * item.quantity).toLocaleString("en-IN")}
              </span>
            </div>
          ))}
        </div>

        {/* Total */}
        <div className={styles.totalRow}>
          <span>Total Paid</span>
          <span className={styles.totalAmount}>
            ₹{order.totalAmount.toLocaleString("en-IN")}
          </span>
        </div>

        {/* Payment info */}
        <div className={styles.paymentId}>
          Payment ID: <span>{displayPaymentId}</span>
        </div>

        {order.whatsapp?.sent ? (
          <div className={styles.whatsappSuccess}>
            ✅ Order details have been sent to your WhatsApp.
          </div>
        ) : (
          <div className={styles.whatsappPending}>
            ⚠️ We were unable to send WhatsApp confirmation automatically.
            {order.whatsapp?.error ? <span> {order.whatsapp.error}</span> : ""}
          </div>
        )}

        {/* CTA */}
        <Link href="/shop" className={styles.cta}>Continue Shopping</Link>
      </div>
    </div>
  );
}

export default function OrderSuccessPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: "100vh" }} />}>
      <OrderSuccessContent />
    </Suspense>
  );
}
