"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Suspense, useEffect, useState } from "react";
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
  createdAt: string | null;
}

function OrderSuccessContent() {
  const params = useSearchParams();
  const docId = params.get("doc_id") ?? "";
  const paymentId = params.get("payment_id") ?? "";
  const isCOD = params.get("method") === "cod";

  const [order, setOrder] = useState<OrderData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!docId) { setError(true); setLoading(false); return; }

    fetch(`/api/orders/${docId}`)
      .then((res) => {
        if (!res.ok) throw new Error("Not found");
        return res.json();
      })
      .then((data: OrderData) => { setOrder(data); setLoading(false); })
      .catch(() => { setError(true); setLoading(false); });
  }, [docId]);

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
          <p className={styles.sub}>Could not load order details.</p>
          <Link href="/shop" className={styles.cta}>Continue Shopping</Link>
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
          {isCOD
            ? "Thanks for shopping with KNYTRA. Pay when your order arrives."
            : "Thanks for shopping with KNYTRA. Your order will ship in 5–7 business days."}
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
          {isCOD
            ? <>Payment Mode: <span>Cash on Delivery</span></>
            : <>Payment ID: <span>{displayPaymentId}</span></>}
        </div>

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
