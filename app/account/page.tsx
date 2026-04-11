"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
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

  const [orders, setOrders] = useState<RecentOrder[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [ordersError, setOrdersError] = useState(false);
  const fetchIdRef = useRef(0);

  // Guard — redirect unauthenticated users
  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login?next=/account");
    }
  }, [user, loading, router]);

  /**
   * Fetch the 3 most recent orders for this user.
   * Queries by `userId` only — the only field allowed by Firestore security
   * rules. Email-based queries are intentionally omitted: the rule
   * `resource.data.userId == request.auth.uid` cannot be proven from an
   * email filter, so Firestore rejects them as PERMISSION_DENIED.
   *
   * Requires composite index: orders → userId ASC, createdAt DESC
   * (defined in firestore.indexes.json)
   */
  useEffect(() => {
    if (!user?.uid) return;

    const uid = user.uid;

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

    function isIndexError(error: any): boolean {
      return (
        error?.code === "failed-precondition" ||
        error?.message?.toLowerCase().includes("index")
      );
    }

    const getTime = (o: RecentOrder): number =>
      (o.createdAt as any)?.toMillis?.() ?? 0;

    function sortAndLimit(rows: RecentOrder[], n = 3): RecentOrder[] {
      return [...rows].sort((a, b) => getTime(b) - getTime(a)).slice(0, n);
    }

    async function fetchOrders() {
      const currentFetchId = ++fetchIdRef.current;

      try {
        // Indexed query: userId == uid, ordered by createdAt DESC.
        // On index-missing error, fall back to equality-only + client sort.
        let rows: RecentOrder[];
        try {
          const snap = await getDocs(
            query(
              collection(db, "orders"),
              where("userId", "==", uid),
              orderBy("createdAt", "desc")
            )
          );
          rows = snap.docs.map(mapDoc);
        } catch (err: any) {
          if (!isIndexError(err)) throw err;
          console.warn(
            "[Account] Missing composite index for orders. " +
            "Run: npx firebase deploy --only firestore:indexes"
          );
          const snap = await getDocs(
            query(collection(db, "orders"), where("userId", "==", uid))
          );
          rows = snap.docs.map(mapDoc);
        }

        if (fetchIdRef.current !== currentFetchId) return;
        setOrders(sortAndLimit(rows.filter(o => !!o.id), 3));
      } catch (err: any) {
        console.error("[Account] Orders query failed:", err);
        if (fetchIdRef.current !== currentFetchId) return;
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

            <Link href="/account/wishlist" className={styles.navCard}>
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
              Something went wrong loading your orders. Please try again.
            </p>
          ) : orders.length === 0 ? (
            <p className={styles.emptyState}>
              No orders yet.{" "}
              <Link href="/shop" style={{ color: "#000", fontWeight: 600 }}>
                Start shopping →
              </Link>
            </p>
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
