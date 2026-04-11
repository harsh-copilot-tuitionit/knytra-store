"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import styles from "./account.module.css";

interface RecentOrder {
  id: string;
  totalAmount: number;
  status: string;
  createdAt: { seconds: number } | null;
  itemCount: number;
}

function initials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .slice(0, 2)
    .join("");
}

function badgeClass(status: string): string {
  if (status === "placed")    return styles.badgePlaced;
  if (status === "shipped")   return styles.badgeShipped;
  if (status === "delivered") return styles.badgeDelivered;
  return styles.badgeFallback;
}

function formatDate(ts: { seconds: number } | null): string {
  if (!ts) return "—";
  return new Date(ts.seconds * 1000).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function AccountPage() {
  const router = useRouter();
  const { user, loading, logout } = useAuth();
  const { clearCart, clearBuyNow } = useCart();
  const { resetWishlist } = useWishlist();

  const [orders, setOrders] = useState<RecentOrder[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [ordersError, setOrdersError] = useState(false);
  const fetchIdRef = useRef(0);

  /**
   * Fetch the 3 most recent orders for this user.
   *
   * Developer note:
   * The primary query (`where("user.email", "==", user.email)` +
   * `orderBy("createdAt", "desc")`) requires a Firestore composite index:
   *   orders -> user.email ASC, createdAt DESC
   * If missing, Firebase console will prompt index creation with a direct link.
   */
  useEffect(() => {
    if (!user?.email) {
      setOrders([]);
      setOrdersError(false);
      setOrdersLoading(false);
      return;
    }

    const email = user.email;

    function mapDoc(doc: import("firebase/firestore").QueryDocumentSnapshot): RecentOrder {
      const d = doc.data();
      return {
        id: doc.id,
        totalAmount: d.totalAmount ?? 0,
        status: d.status ?? "placed",
        createdAt: d.createdAt ?? null,
        itemCount: Array.isArray(d.items) ? d.items.length : 0,
      };
    }

    function isIndexError(error: unknown): boolean {
      const e = error as { code?: string; message?: string };
      const m = e?.message?.toLowerCase() ?? "";
      return (
        e?.code === "failed-precondition" ||
        m.includes("requires an index") ||
        m.includes("index")
      );
    }

    const getTime = (o: RecentOrder): number =>
      (o.createdAt as any)?.toMillis?.() ?? 0;

    function sortAndLimit(rows: RecentOrder[], n = 3): RecentOrder[] {
      return [...rows].sort((a, b) => getTime(b) - getTime(a)).slice(0, n);
    }

    async function fetchOrders() {
      const currentFetchId = ++fetchIdRef.current;
      setOrdersLoading(true);
      setOrdersError(false);

      try {
        // Primary indexed query.
        let rows: RecentOrder[];
        try {
          const snap = await getDocs(
            query(
              collection(db, "orders"),
              where("user.email", "==", email),
              orderBy("createdAt", "desc"),
              limit(3),
            )
          );
          rows = snap.docs.map(mapDoc);
        } catch (err: unknown) {
          if (!isIndexError(err)) throw err;

          const e = err as { code?: string; message?: string };
          console.warn(
            "[Account] Missing composite index for recent orders " +
            "(orders -> user.email ASC, createdAt DESC). Falling back to equality-only query.",
            { code: e?.code, message: e?.message },
          );

          if (process.env.NODE_ENV !== "production") {
            console.info(
              "[Account][dev-only] Create index in Firebase console when prompted: " +
              "orders -> user.email ASC, createdAt DESC",
            );
          }

          // Fallback query (no orderBy), then sort + limit client-side.
          const snap = await getDocs(
            query(collection(db, "orders"), where("user.email", "==", email))
          );
          rows = snap.docs.map(mapDoc);
        }

        if (fetchIdRef.current !== currentFetchId) return;
        setOrders(sortAndLimit(rows.filter(o => !!o.id), 3));
      } catch (err: unknown) {
        const e = err as { code?: string; message?: string };
        console.error("[Account] Recent orders query failed", {
          code: e?.code,
          message: e?.message,
          error: err,
        });
        if (fetchIdRef.current !== currentFetchId) return;
        setOrders([]);
        setOrdersError(true);
      } finally {
        if (fetchIdRef.current === currentFetchId) {
          setOrdersLoading(false);
        }
      }
    }

    fetchOrders();
  }, [user]);

  async function handleLogout() {
    await logout();
    resetWishlist();
    clearCart();
    clearBuyNow();
    router.replace("/");
  }

  if (loading || !user) return null;

  const displayName = user.displayName ?? user.email ?? "User";

  return (
    <div className={styles.page}>

      {/* ── Hero ── */}
      <div className={styles.hero}>
        <div className={styles.heroInner}>
          <div className={styles.avatar}>{initials(displayName)}</div>
          <div className={styles.heroText}>
            <p className={styles.heroName}>{displayName}</p>
            <p className={styles.heroEmail}>{user.email}</p>
          </div>
        </div>
      </div>

      <div className={styles.body}>

        {/* ── Quick navigation ── */}
        <section>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>My Account</h2>
          </div>

          <div className={styles.navGrid}>
            <Link href="/account/orders" className={styles.navCard}>
              <span className={styles.navCardIcon}>📦</span>
              <span className={styles.navCardLabel}>Orders</span>
            </Link>

            <Link href="/account/addresses" className={styles.navCard}>
              <span className={styles.navCardIcon}>📍</span>
              <span className={styles.navCardLabel}>Addresses</span>
            </Link>

            <Link href="/wishlist" className={styles.navCard}>
              <span className={styles.navCardIcon}>♡</span>
              <span className={styles.navCardLabel}>Wishlist</span>
            </Link>

            <button
              onClick={handleLogout}
              className={`${styles.navCard} ${styles.navCardDanger}`}
            >
              <span className={styles.navCardIcon}>↩</span>
              <span className={styles.navCardLabel}>Logout</span>
            </button>
          </div>
        </section>

        {/* ── Recent orders ── */}
        <section>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Recent Orders</h2>
            <Link href="/account/orders" className={styles.sectionLink}>
              View all →
            </Link>
          </div>

          {ordersLoading ? (
            <div className={styles.ordersList}>
              {[0, 1, 2].map((i) => (
                <div key={i} className={`${styles.skeletonRow} skeleton`} />
              ))}
            </div>
          ) : ordersError ? (
            <p className={styles.errorState}>
              Something went wrong. Please try again.
            </p>
          ) : orders.length === 0 ? (
            <p className={styles.emptyState}>No orders yet</p>
          ) : (
            <div className={styles.ordersList}>
              {orders.map((order) => (
                <Link
                  key={order.id}
                  href={`/orders/${order.id}`}
                  className={styles.orderRow}
                >
                  <div className={styles.orderLeft}>
                    <span className={styles.orderRef}>
                      #{order.id.slice(-8).toUpperCase()}
                    </span>
                    <span className={styles.orderMeta}>
                      {formatDate(order.createdAt)} · {order.itemCount}{" "}
                      {order.itemCount === 1 ? "item" : "items"}
                    </span>
                  </div>
                  <div className={styles.orderRight}>
                    <span className={styles.orderAmount}>
                      ₹{order.totalAmount.toLocaleString("en-IN")}
                    </span>
                    <span className={`${styles.badge} ${badgeClass(order.status)}`}>
                      {order.status}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}

        </section>

      </div>
    </div>
  );
}
