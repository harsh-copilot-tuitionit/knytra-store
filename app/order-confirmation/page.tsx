"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Suspense, useEffect } from "react";
import styles from "./orderConfirmation.module.css";

function OrderConfirmationContent() {
  const params = useSearchParams();
  const router = useRouter();
  const paymentId = params.get("payment_id") ?? "";
  const orderId   = params.get("order_id") ?? "";
  const signature = params.get("signature") ?? "";
  const docId     = params.get("doc_id") ?? "";

  useEffect(() => {
    if (!paymentId || !orderId || !signature || !docId) {
      router.replace("/order-failed");
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
      .then((res) => {
        if (res.ok) {
          router.replace(`/order-success?doc_id=${docId}&payment_id=${paymentId}`);
        } else {
          router.replace("/order-failed");
        }
      })
      .catch(() => router.replace("/order-failed"));
  }, [paymentId, orderId, signature, docId, router]);

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.spinner} />
        <p className={styles.sub}>Verifying your payment…</p>
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

