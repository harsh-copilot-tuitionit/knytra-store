"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import styles from "./orderConfirmation.module.css";

type VerifyStatus = "verifying" | "success" | "failed";

function OrderConfirmationContent() {
  const params = useSearchParams();
  const paymentId = params.get("payment_id") ?? "";
  const orderId   = params.get("order_id") ?? "";
  const signature = params.get("signature") ?? "";
  const docId     = params.get("doc_id") ?? "";

  const [status, setStatus] = useState<VerifyStatus>("verifying");

  useEffect(() => {
    if (!paymentId || !orderId || !signature || !docId) {
      setStatus("failed");
      return;
    }

    fetch("/api/verify-payment", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        razorpay_payment_id: paymentId,
        razorpay_order_id:   orderId,
        razorpay_signature:  signature,
        firestore_order_id:  docId,
      }),
    })
      .then((res) => setStatus(res.ok ? "success" : "failed"))
      .catch(() => setStatus("failed"));
  }, [paymentId, orderId, signature, docId]);

  if (status === "verifying") {
    return (
      <div className={styles.page}>
        <div className={styles.card}>
          <div className={styles.spinner} />
          <p className={styles.sub}>Verifying your payment…</p>
        </div>
      </div>
    );
  }

  if (status === "failed") {
    return (
      <div className={styles.page}>
        <div className={styles.card}>
          <div className={`${styles.checkmark} ${styles.failed}`}>✕</div>
          <h1 className={styles.title}>Payment Failed</h1>
          <p className={styles.sub}>
            Something went wrong with your payment. No money has been charged. Please try again.
          </p>
          <Link href="/checkout" className={styles.shopBtn}>Try Again</Link>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.checkmark}>✓</div>
        <h1 className={styles.title}>Order Confirmed!</h1>
        <p className={styles.sub}>
          Thanks for shopping with KNYTRA. Your order is confirmed and will ship in 5–7 business days.
        </p>

        <div className={styles.details}>
          <div className={styles.detailRow}>
            <span className={styles.detailLabel}>Payment ID</span>
            <span className={styles.detailValue}>{paymentId}</span>
          </div>
          <div className={styles.detailRow}>
            <span className={styles.detailLabel}>Order ID</span>
            <span className={styles.detailValue}>{orderId}</span>
          </div>
        </div>

        <Link href="/shop" className={styles.shopBtn}>Continue Shopping</Link>
      </div>
    </div>
  );
}

export default function OrderConfirmationPage() {
  return (
    <Suspense fallback={<div className={styles.loading}>Loading…</div>}>
      <OrderConfirmationContent />
    </Suspense>
  );
}

