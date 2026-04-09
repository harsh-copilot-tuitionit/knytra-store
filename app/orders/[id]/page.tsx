import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { getAdminDb } from "@/lib/firebase-admin";
import styles from "./orderDetail.module.css";

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
  user: { name: string; phone: string; email: string };
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

const STEP_INDEX: Record<string, number> = {
  placed: 0, shipped: 1, delivered: 2,
};

const PAYMENT_LABEL: Record<string, string> = {
  success: "Paid",
  pending: "Pending",
  failed:  "Failed",
};

async function fetchOrder(id: string): Promise<OrderData | null> {
  try {
    const db = getAdminDb();
    const snap = await db.collection("orders").doc(id).get();
    if (!snap.exists) return null;
    const d = snap.data()!;
    return {
      id: snap.id,
      items:       d.items       ?? [],
      totalAmount: d.totalAmount ?? 0,
      user:        d.user        ?? {},
      address:     d.address     ?? {},
      payment:     d.payment     ?? {},
      status:      d.status      ?? "placed",
      createdAt:   d.createdAt?.toDate?.()?.toISOString() ?? null,
    };
  } catch {
    return null;
  }
}

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const order = await fetchOrder(id);

  if (!order) notFound();

  const currentStep = STEP_INDEX[order.status] ?? 0;
  const placedDate = order.createdAt
    ? new Date(order.createdAt).toLocaleDateString("en-IN", {
        day: "numeric", month: "long", year: "numeric",
      })
    : "—";

  return (
    <div className={styles.page}>
      <div className={styles.container}>

        {/* ── Back */}
        <Link href="/shop" className={styles.back}>← Back to Shop</Link>

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
