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
import styles from "./orders.module.css";

interface Order {
  id: string;
  totalAmount: number;
  status: string;
  createdAt: any;
  itemCount: number;
}

function badgeClass(status: string): string {
  if (status === "placed")    return styles.badgePlaced;
  if (status === "shipped")   return styles.badgeShipped;
  if (status === "delivered") return styles.badgeDelivered;
  return styles.badgeFallback;
}

function formatDate(ts: any): string {
  const ms = ts?.toMillis?.() ?? (ts?.seconds ? ts.seconds * 1000 : null);
  if (!ms) return "—";
  return new Date(ms).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function isIndexError(err: any): boolean {
  return (
    err?.code === "failed-precondition" ||
    err?.message?.toLowerCase().includes("index")
  );
}

export default function OrderHistoryPage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [ordersError, setOrdersError] = useState(false);
  const [ordersPartial, setOrdersPartial] = useState(false);
  const fetchIdRef = useRef(0);

  // Auth guard
  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login?next=/account/orders");
    }
  }, [user, loading, router]);

  /**
   * Fetch ALL orders for this user (no limit — full history).
   *
   * Strategy:
   *   1. Query by userId (indexed). Composite index required:
   *      orders → userId ASC, createdAt DESC
   *   2. Legacy fallback: query by user.email for orders without userId.
   *      Composite index required:
   *      orders → user.email ASC, createdAt DESC
   *
   * On index-missing errors, retries with equality-only query + client sort.
   * On other errors, surfaces the error state without fallback.
   */
  useEffect(() => {
    if (!user?.email) return;

    const uid   = user.uid;
    const email = user.email;

    function mapDoc(doc: import("firebase/firestore").QueryDocumentSnapshot): Order {
      const d = doc.data();
      return {
        id: doc.id,
        totalAmount: d.totalAmount ?? 0,
        status: d.status ?? "placed",
        createdAt: d.createdAt ?? null,
        itemCount: Array.isArray(d.items) ? d.items.length : 0,
      };
    }

    const getTime = (o: Order): number => o.createdAt?.toMillis?.() ?? 0;

    function sortDesc(rows: Order[]): Order[] {
      return [...rows].sort((a, b) => getTime(b) - getTime(a));
    }

    /**
     * Run an indexed query; on index-missing error fall back to equality-only
     * + client-side sort. Throws on any non-index error.
     */
    async function runQuery(
      filterField: string,
      filterValue: string,
      label: string
    ): Promise<Order[]> {
      try {
        const q = query(
          collection(db, "orders"),
          where(filterField, "==", filterValue),
          orderBy("createdAt", "desc")
        );
        const snap = await getDocs(q);
        return snap.docs.map(mapDoc);
      } catch (err: any) {
        if (!isIndexError(err)) throw err;
        console.warn(
          `[OrderHistory] Missing composite index (${label}). ` +
          `Create index: orders → ${filterField} ASC, createdAt DESC.`
        );
      }
      // Equality-only fallback
      const snap = await getDocs(
        query(collection(db, "orders"), where(filterField, "==", filterValue))
      );
      return snap.docs.map(mapDoc);
    }

    async function fetchOrders() {
      const currentFetchId = ++fetchIdRef.current;
      setOrdersPartial(false);
      let userIdOrders: Order[] = [];

      try {
        // ── 1. Primary: userId query ────────────────────────────────────────
        try {
          userIdOrders = await runQuery("userId", uid, "userId");
        } catch (err: any) {
          console.error("[OrderHistory] userId query failed:", err);
        }

        // ── 2. Email fallback: for legacy orders without userId ─────────────
        let emailOrders: Order[] = [];
        try {
          emailOrders = await runQuery("user.email", email, "user.email");
        } catch (err: any) {
          if (userIdOrders.length === 0) {
            console.error("[OrderHistory] Email query failed:", err);
            if (fetchIdRef.current !== currentFetchId) return;
            setOrdersError(true);
            return;
          }
          console.warn("[OrderHistory] Email query failed (userId results available):", err);
          if (fetchIdRef.current !== currentFetchId) return;
          setOrdersPartial(true);
        }

        // ── 3. Merge, deduplicate, sort ─────────────────────────────────────
        const merged  = [...userIdOrders, ...emailOrders].filter(o => !!o.id);
        const unique  = Array.from(new Map(merged.map(o => [o.id, o])).values());
        if (fetchIdRef.current !== currentFetchId) return;
        setOrders(sortDesc(unique));
      } finally {
        if (fetchIdRef.current === currentFetchId) {
          setOrdersLoading(false);
        }
      }
    }

    fetchOrders();
  }, [user]);

  if (loading || !user) return null;

  const SKELETON_COUNT = 5;

  return (
    <div className={styles.page}>

      {/* ── Header ── */}
      <div className={styles.header}>
        <div className={styles.headerInner}>
          <Link href="/account" className={styles.backBtn}>← Account</Link>
          <h1 className={styles.title}>Order History</h1>
        </div>
      </div>

      <div className={styles.body}>

        {/* ── Loading skeletons ── */}
        {ordersLoading && (
          <div className={styles.list}>
            {Array.from({ length: SKELETON_COUNT }).map((_, i) => (
              <div key={i} className={`${styles.skeletonRow} skeleton`} />
            ))}
          </div>
        )}

        {/* ── Error ── */}
        {!ordersLoading && ordersError && (
          <p className={styles.errorState}>
            Something went wrong loading your orders. Please try again.
          </p>
        )}

        {/* ── Empty ── */}
        {!ordersLoading && !ordersError && orders.length === 0 && (
          <p className={styles.emptyState}>
            No orders yet.{" "}
            <Link href="/shop" style={{ color: "#000", fontWeight: 600 }}>
              Start shopping →
            </Link>
          </p>
        )}

        {/* ── Order list ── */}
        {!ordersLoading && !ordersError && orders.length > 0 && (
          <div className={styles.list}>
            {orders.map((order) => (
              <Link
                key={order.id}
                href={`/orders/${order.id}`}
                className={styles.row}
              >
                <div className={styles.rowLeft}>
                  <span className={styles.ref}>
                    #{order.id.slice(-8).toUpperCase()}
                  </span>
                  <span className={styles.meta}>
                    {formatDate(order.createdAt)} · {order.itemCount}{" "}
                    {order.itemCount === 1 ? "item" : "items"}
                  </span>
                </div>

                <div className={styles.rowRight}>
                  <span className={styles.amount}>
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

        {/* ── Partial notice ── */}
        {ordersPartial && (
          <p className={styles.partialNotice}>
            Some older orders may not be visible right now.
          </p>
        )}

      </div>
    </div>
  );
}
