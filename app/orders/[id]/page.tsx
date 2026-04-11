"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import styles from "./orderDetail.module.css";

interface OrderItem {
  name: string;
  price: number;
  quantity: number;
  size: string;
  image: string;
}

interface OrderData {
  id: string;
  userId: string | null;
  items: OrderItem[];
  totalAmount: number;
  address: { name: string; phone: string; fullAddress: string; city: string; pincode: string };
  payment: { razorpay_order_id: string; razorpay_payment_id: string; status: string };
  status: "placed" | "shipped" | "delivered";
  createdAt: string | null;
}

const DELIVERY_STEPS: { key: OrderData["status"]; label: string }[] = [
  { key: "placed",    label: "Order Placed"  },
  { key: "shipped",   label: "Shipped"       },
  { key: "delivered", label: "Delivered"     },
];

const STEP_INDEX: Record<string, number> = { placed: 0, shipped: 1, delivered: 2 };

const PAYMENT_LABEL: Record<string, string> = {
  success: "Paid",
  pending: "Pending",
  failed:  "Failed",
};

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router  = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [order,       setOrder]       = useState<OrderData | null>(null);
  const [pageLoading, setPageLoading] = useState(true);
  const [error,       setError]       = useState<string | null>(null);

  useEffect(() => {
    // Wait for auth to resolve so we know whether to send a Bearer token.
    if (authLoading) return;

    let cancelled = false;

    async function fetchOrder() {
      setPageLoading(true);
      setError(null);

      try {
        const headers: Record<string, string> = {};

        if (user) {
          // Logged-in user: attach a Firebase ID token so the API can verify
          // ownership (order.userId === uid).
          const idToken = await user.getIdToken();
          headers["Authorization"] = `Bearer ${idToken}`;
        }
        // Guest users: the browser automatically sends the gto_<id> HttpOnly
        // cookie that was set by /api/track-order on successful verification.

        const res = await fetch(`/api/orders/${id}`, { headers });

        if (cancelled) return;

        if (res.status === 401 || res.status === 403) {
          // Not authorised — send guest to verify; auth users with wrong uid
          // also land here (edge case: auth user viewing someone else's order).
          router.replace(`/track-order?order=${encodeURIComponent(id)}`);
          return;
        }

        if (res.status === 404) {
          setError("This order could not be found.");
          return;
        }

        if (!res.ok) {
          setError("Failed to load order. Please try again.");
          return;
        }

        const data = await res.json();
        setOrder(data as OrderData);
      } catch {
        if (!cancelled) setError("Something went wrong. Please try again.");
      } finally {
        if (!cancelled) setPageLoading(false);
      }
    }

    fetchOrder();
    return () => { cancelled = true; };
  }, [id, user, authLoading, router]);

  // ── Loading skeleton ────────────────────────────────────────────────────
  if (pageLoading) {
    return (
      <div className={styles.page}>
        <div className={styles.container}>
          <div className="skeleton" style={{ height: 16, width: 140, borderRadius: 4 }} />
          <div className="skeleton" style={{ height: 76, borderRadius: 8 }} />
          <div className="skeleton" style={{ height: 96, borderRadius: 8 }} />
          <div className="skeleton" style={{ height: 180, borderRadius: 8 }} />
          <div className="skeleton" style={{ height: 120, borderRadius: 8 }} />
        </div>
      </div>
    );
  }

  // ── Error state ─────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className={styles.page}>
        <div className={styles.container}>
          <p style={{ color: "#cc0000", fontSize: 14, fontWeight: 600, margin: 0 }}>{error}</p>
          <Link href="/shop" className={styles.cta} style={{ alignSelf: "flex-start" }}>
            Back to Shop
          </Link>
        </div>
      </div>
    );
  }

  if (!order) return null;

  const currentStep = STEP_INDEX[order.status] ?? 0;
  const placedDate  = order.createdAt
    ? new Date(order.createdAt).toLocaleDateString("en-IN", {
        day: "numeric", month: "long", year: "numeric",
      })
    : "—";

  return (
    <div className={styles.page}>
      <div className={styles.container}>

        {/* ── Back */}
        <Link
          href={order.userId ? "/account/orders" : "/track-order"}
          className={styles.back}
        >
          ← {order.userId ? "Order History" : "Track Another Order"}
        </Link>

        {/* ── Header */}
        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>Order Details</h1>
            <p className={styles.refLine}>
              Ref: <span className={styles.ref}>{order.id.slice(-8).toUpperCase()}</span>
              &nbsp;·&nbsp; Placed on {placedDate}
            </p>
          </div>
          <span className={`${styles.statusBadge} ${styles[`status_${order.status}`]}`}>
            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
          </span>
        </div>

        {/* ── Delivery tracker */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Delivery Status</h2>
          <div className={styles.tracker}>
            {DELIVERY_STEPS.map((step, i) => (
              <div
                key={step.key}
                className={`${styles.trackerStep} ${i <= currentStep ? styles.trackerActive : ""}`}
              >
                <div className={styles.trackerDot} />
                {i < DELIVERY_STEPS.length - 1 && <div className={styles.trackerLine} />}
                <span className={styles.trackerLabel}>{step.label}</span>
              </div>
            ))}
          </div>
        </section>

        {/* ── Items */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Items Ordered</h2>
          <div className={styles.items}>
            {order.items.map((item, i) => (
              <div key={i} className={styles.item}>
                {item.image && (
                  <div className={styles.itemImg}>
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      sizes="72px"
                      style={{ objectFit: "cover" }}
                    />
                  </div>
                )}
                <div className={styles.itemInfo}>
                  <span className={styles.itemName}>{item.name}</span>
                  <span className={styles.itemMeta}>
                    Size: {item.size}&nbsp;·&nbsp;Qty: {item.quantity}
                  </span>
                </div>
                <span className={styles.itemPrice}>
                  ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                </span>
              </div>
            ))}
          </div>
          <div className={styles.totalRow}>
            <span>Total Paid</span>
            <span className={styles.totalAmount}>
              ₹{order.totalAmount.toLocaleString("en-IN")}
            </span>
          </div>
        </section>

        <div className={styles.grid}>

          {/* ── Delivery address */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Delivery Address</h2>
            <div className={styles.infoBlock}>
              <p className={styles.infoName}>{order.address.name}</p>
              <p className={styles.infoLine}>{order.address.fullAddress}</p>
              <p className={styles.infoLine}>{order.address.city} — {order.address.pincode}</p>
              <p className={styles.infoLine}>{order.address.phone}</p>
            </div>
          </section>

          {/* ── Payment */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Payment</h2>
            <div className={styles.infoBlock}>
              <div className={styles.paymentRow}>
                <span className={styles.payLabel}>Status</span>
                <span className={`${styles.payValue} ${styles[`pay_${order.payment.status}`]}`}>
                  {PAYMENT_LABEL[order.payment.status] ?? order.payment.status}
                </span>
              </div>
              {order.payment.razorpay_payment_id && (
                <div className={styles.paymentRow}>
                  <span className={styles.payLabel}>Payment ID</span>
                  <span className={styles.payMono}>{order.payment.razorpay_payment_id}</span>
                </div>
              )}
              <div className={styles.paymentRow}>
                <span className={styles.payLabel}>Order ID</span>
                <span className={styles.payMono}>{order.payment.razorpay_order_id}</span>
              </div>
            </div>
          </section>

        </div>

        <div className={styles.ctaRow}>
          <a
            href={`/api/orders/${order.id}/invoice`}
            download
            className={styles.invoiceBtn}
          >
            ↓ Download Invoice
          </a>
          <Link href="/shop" className={styles.cta}>Continue Shopping</Link>
        </div>

      </div>
    </div>
  );
}


