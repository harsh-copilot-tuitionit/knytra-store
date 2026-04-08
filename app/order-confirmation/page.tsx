"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";
import styles from "./orderConfirmation.module.css";

function OrderConfirmationContent() {
  const params = useSearchParams();
  const paymentId = params.get("payment_id") ?? "";
  const orderId = params.get("order_id") ?? "";

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.checkmark}>✓</div>
        <h1 className={styles.title}>Order Placed!</h1>
        <p className={styles.sub}>
          Thanks for shopping with KNYTRA. Your order is confirmed and will ship in 5–7 business days.
        </p>

        <div className={styles.details}>
          <div className={styles.detailRow}>
            <span className={styles.detailLabel}>Payment ID</span>
            <span className={styles.detailValue}>{paymentId || "—"}</span>
          </div>
          <div className={styles.detailRow}>
            <span className={styles.detailLabel}>Order ID</span>
            <span className={styles.detailValue}>{orderId || "—"}</span>
          </div>
        </div>

        <Link href="/shop" className={styles.shopBtn}>Continue Shopping</Link>
      </div>
    </div>
  );
}

export default function OrderConfirmationPage() {
  return (
    <Suspense fallback={<div className={styles.loading}>Loading...</div>}>
      <OrderConfirmationContent />
    </Suspense>
  );
}
