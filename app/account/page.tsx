"use client";

import { useEffect, useState } from "react";
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

  // Guard — redirect unauthenticated users
  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login?next=/account");
    }
  }, [user, loading, router]);

  /**
   * Fetch the 3 most recent orders for this user.
   *
   * Strategy (in order):
   *   1. Query by `userId` (Firebase UID) — fast, secure, for logged-in users.
   *      Requires composite index: orders → userId ASC, createdAt DESC
   *   2. Fallback to `user.email` — covers legacy orders created before userId
   *      was stored, and preserves backward compatibility.
   *
   * Each query path follows the same pattern:
   *   - Try the indexed (orderBy) query first.
   *   - On index-missing errors (code "failed-precondition"), fall back to an
   *     equality-only query and sort client-side.
   *   - On any other error, surface it immediately (no further fallback).
   *
   * To create composite indexes in Firebase Console → Firestore → Indexes:
   *   • userId ASC, createdAt DESC   (collection: orders)
   *   • user.email ASC, createdAt DESC (collection: orders)
   */
  useEffect(() => {
    if (!user?.email) return;

    const uid   = user.uid;
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

    function isIndexError(error: any): boolean {
      return (
        error?.code === "failed-precondition" ||
        error?.message?.toLowerCase().includes("index")
      );
    }

    function clientSort(rows: RecentOrder[]): RecentOrder[] {
      return rows
        .sort((a, b) => {
          const aMs = (a.createdAt as any)?.toMillis?.() ?? 0;
          const bMs = (b.createdAt as any)?.toMillis?.() ?? 0;
          return bMs - aMs;
        })
        .slice(0, 3);
    }

    /** Run an indexed query; on index error fall back to equality-only + client sort.
     *  Returns the result rows, or throws if a non-index error occurs. */
    async function runQuery(
      filterField: string,
      filterValue: string,
      label: string
    ): Promise<RecentOrder[]> {
      // ── Indexed path ─────────────────────────────────────────────────────
      try {
        const q = query(
          collection(db, "orders"),
          where(filterField, "==", filterValue),
          orderBy("createdAt", "desc"),
          limit(3)
        );
        const snap = await getDocs(q);
        return snap.docs.map(mapDoc);
      } catch (err: any) {
        if (!isIndexError(err)) {
          // Real error — bubble up so the caller can surface it
          throw err;
        }
        console.warn(
          `[Account] Missing composite index for orders (${label}). ` +
          `Create index: orders → ${filterField} ASC, createdAt DESC. ` +
          `Falling back to client-side sort.`
        );
      }

      // ── Equality-only fallback (no orderBy) ───────────────────────────────
      const fallback = query(
        collection(db, "orders"),
        where(filterField, "==", filterValue)
      );
      const snap = await getDocs(fallback);
      return clientSort(snap.docs.map(mapDoc));
    }

    async function fetchOrders() {
      // ── 1. Primary: query by userId (fast, indexed) ───────────────────────
      try {
        const rows = await runQuery("userId", uid, "userId");
        setOrders(rows);
        setOrdersLoading(false);
        return;
      } catch (err: any) {
        console.error("[Account] userId orders query failed:", err);
        // Don't give up yet — try the email fallback for legacy orders
      }

      // ── 2. Legacy fallback: query by user.email ───────────────────────────
      try {
        const rows = await runQuery("user.email", email, "user.email");
        setOrders(rows);
      } catch (err: any) {
        console.error("[Account] Email orders query also failed:", err);
        setOrdersError(true);
      } finally {
        setOrdersLoading(false);
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
