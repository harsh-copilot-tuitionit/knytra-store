"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import styles from "./page.module.css";

interface AdminOrder {
  id: string;
  user?: { name?: string; email?: string; phone?: string };
  totalAmount?: number;
  payment?: { status?: string; razorpay_payment_id?: string };
  qikinkStatus?: string;
  qikinkOrderId?: string;
  qikinkError?: string;
  qikinkAttemptCount?: number;
  qikinkLastAttemptAt?: unknown;
  qikinkLastFailedAt?: unknown;
  qikinkCreatedAt?: unknown;
}

interface RetryResponse {
  success: boolean;
  qikinkStatus: string | null;
  qikinkOrderId: string | null;
  qikinkError: string | null;
  error?: string;
}

function formatTimestamp(ts: unknown): string {
  if (!ts) return "-";
  if (typeof ts === "string") {
    const parsed = new Date(ts);
    return Number.isNaN(parsed.getTime()) ? "-" : parsed.toLocaleString("en-IN");
  }
  if (typeof ts === "object" && ts !== null) {
    const withToDate = ts as { toDate?: () => Date; seconds?: number };
    if (typeof withToDate.toDate === "function") {
      return withToDate.toDate().toLocaleString("en-IN");
    }
    if (typeof withToDate.seconds === "number") {
      return new Date(withToDate.seconds * 1000).toLocaleString("en-IN");
    }
  }
  return "-";
}

export default function AdminOrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();

  const [order, setOrder] = useState<AdminOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [retrying, setRetrying] = useState(false);
  const [feedback, setFeedback] = useState<{ kind: "success" | "error"; message: string } | null>(null);

  const fetchOrder = useCallback(async () => {
    if (!id) return;

    setLoading(true);
    try {
      const snap = await getDoc(doc(db, "orders", id));
      if (!snap.exists()) {
        setOrder(null);
        setFeedback({ kind: "error", message: "Order not found." });
        return;
      }
      setOrder({ id: snap.id, ...(snap.data() as Omit<AdminOrder, "id">) });
    } catch (err) {
      console.error("Failed to fetch admin order:", err);
      setFeedback({ kind: "error", message: "Failed to load order." });
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchOrder();
  }, [fetchOrder]);

  const canRetry = order?.qikinkStatus === "failed" && !order?.qikinkOrderId;

  const handleRetryQikink = async () => {
    if (!id || !canRetry || retrying) return;

    setRetrying(true);
    setFeedback(null);

    try {
      const headers: Record<string, string> = {};
      if (user) {
        headers.Authorization = `Bearer ${await user.getIdToken()}`;
      }

      const res = await fetch(`/api/admin/orders/${id}/retry-qikink`, {
        method: "POST",
        headers,
      });

      const data = (await res.json().catch(() => ({}))) as RetryResponse;

      if (!res.ok) {
        setFeedback({
          kind: "error",
          message: data.error ?? data.qikinkError ?? "Qikink retry failed",
        });
        return;
      }

      setFeedback({ kind: "success", message: "Qikink retry completed" });
      await fetchOrder();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Qikink retry failed";
      setFeedback({ kind: "error", message });
    } finally {
      setRetrying(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.headerRow}>
        <div>
          <h1 className={styles.title}>Order Detail</h1>
          <p className={styles.subtitle}>Admin view with Qikink fulfillment controls.</p>
        </div>
        <Link href="/admin/orders" className={styles.backLink}>
          Back to Orders
        </Link>
      </div>

      {loading ? (
        <div className={styles.card}>Loading order...</div>
      ) : !order ? (
        <div className={styles.card}>Order not found.</div>
      ) : (
        <>
          <section className={styles.card}>
            <h2 className={styles.sectionTitle}>Order Summary</h2>
            <div className={styles.grid}>
              <div>
                <div className={styles.label}>Order ID</div>
                <div className={styles.value}>{order.id}</div>
              </div>
              <div>
                <div className={styles.label}>Customer</div>
                <div className={styles.value}>{order.user?.name ?? "-"}</div>
              </div>
              <div>
                <div className={styles.label}>Payment Status</div>
                <div className={styles.value}>{order.payment?.status ?? "-"}</div>
              </div>
              <div>
                <div className={styles.label}>Total Amount</div>
                <div className={styles.value}>₹{(order.totalAmount ?? 0).toLocaleString("en-IN")}</div>
              </div>
            </div>
          </section>

          <section className={styles.card}>
            <h2 className={styles.sectionTitle}>Qikink Fulfillment</h2>
            <div className={styles.grid}>
              <div>
                <div className={styles.label}>Qikink Status</div>
                <div className={styles.value}>{order.qikinkStatus ?? "Not attempted"}</div>
              </div>
              <div>
                <div className={styles.label}>Qikink Order ID</div>
                <div className={styles.value}>{order.qikinkOrderId ?? "-"}</div>
              </div>
              <div>
                <div className={styles.label}>Qikink Error</div>
                <div className={styles.value}>{order.qikinkError ?? "-"}</div>
              </div>
              <div>
                <div className={styles.label}>Attempt Count</div>
                <div className={styles.value}>{order.qikinkAttemptCount ?? "-"}</div>
              </div>
              <div>
                <div className={styles.label}>Last Attempt At</div>
                <div className={styles.value}>{formatTimestamp(order.qikinkLastAttemptAt)}</div>
              </div>
              <div>
                <div className={styles.label}>Last Failed At</div>
                <div className={styles.value}>{formatTimestamp(order.qikinkLastFailedAt)}</div>
              </div>
              <div>
                <div className={styles.label}>Created At</div>
                <div className={styles.value}>{formatTimestamp(order.qikinkCreatedAt)}</div>
              </div>
            </div>

            {feedback && (
              <p className={feedback.kind === "success" ? styles.successMsg : styles.errorMsg}>
                {feedback.message}
              </p>
            )}

            {canRetry && (
              <button
                type="button"
                className={styles.retryButton}
                onClick={handleRetryQikink}
                disabled={retrying}
              >
                {retrying ? "Retrying..." : "Retry Qikink"}
              </button>
            )}
          </section>
        </>
      )}
    </div>
  );
}
