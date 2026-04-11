"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  getDocs,
  QueryDocumentSnapshot,
  QueryConstraint,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import styles from "./orders.module.css";

const PAGE_SIZE = 10;

interface Order {
  id: string;
  totalAmount: number;
  status: string;
  createdAt: any;
  itemCount: number;
}

interface QueryResult {
  rows: Order[];
  lastDoc: QueryDocumentSnapshot | null;
  hasMore: boolean;
  indexFallback: boolean;
}

function badgeClass(status: string): string {
  if (status === "placed")    return styles.badgePlaced;
  if (status === "shipped")   return styles.badgeShipped;
  if (status === "delivered") return styles.badgeDelivered;
  return styles.badgeFallback;
}

function formatDate(ts: any): string {
  const ms = ts?.toMillis?.() ?? (ts?.seconds ? ts.seconds * 1000 : 0);
  if (!ms) return "—";
  return new Date(ms).toLocaleDateString("en-IN", {
    day: "2-digit",
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

function mapDoc(doc: QueryDocumentSnapshot): Order {
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
const sortDesc = (rows: Order[]): Order[] =>
  [...rows].sort((a, b) => getTime(b) - getTime(a));

/**
 * Merge two already-sorted (DESC) arrays without a full re-sort.
 * O(n + m) instead of O((n+m) log(n+m)).
 */
function mergeSorted(existing: Order[], incoming: Order[]): Order[] {
  const result: Order[] = [];
  let i = 0, j = 0;
  while (i < existing.length && j < incoming.length) {
    if (getTime(existing[i]) >= getTime(incoming[j])) {
      result.push(existing[i++]);
    } else {
      result.push(incoming[j++]);
    }
  }
  return [...result, ...existing.slice(i), ...incoming.slice(j)];
}

/**
 * Run a paginated, indexed query.
 * On index-missing errors, falls back to an equality-only query (no further
 * pagination possible — sets hasMore: false).
 * Throws on any other error.
 *
 * Composite index required:
 *   orders → userId ASC, createdAt DESC
 * (defined in firestore.indexes.json — deploy via: npx firebase deploy --only firestore:indexes)
 */
async function runQuery(
  filterField: string,
  filterValue: string,
  label: string,
  cursor: QueryDocumentSnapshot | null
): Promise<QueryResult> {
  const constraints: QueryConstraint[] = [
    where(filterField, "==", filterValue),
    orderBy("createdAt", "desc"),
    limit(PAGE_SIZE),
    ...(cursor ? [startAfter(cursor)] : []),
  ];

  try {
    const snap = await getDocs(query(collection(db, "orders"), ...constraints));
    return {
      rows: snap.docs.map(mapDoc),
      lastDoc: snap.docs[snap.docs.length - 1] ?? null,
      hasMore: snap.docs.length === PAGE_SIZE,
      indexFallback: false,
    };
  } catch (err: any) {
    if (!isIndexError(err)) throw err;
    console.warn(
      `[OrderHistory] Missing composite index (${label}). ` +
      `Create index: orders → ${filterField} ASC, createdAt DESC. ` +
      `Fetching all and disabling server-side pagination.`
    );
  }

  // Equality-only fallback — fetches all remaining, no further pagination
  const snap = await getDocs(
    query(collection(db, "orders"), where(filterField, "==", filterValue))
  );
  return { rows: snap.docs.map(mapDoc), lastDoc: null, hasMore: false, indexFallback: true };
}

export default function OrderHistoryPage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [ordersError, setOrdersError] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [indexFallback, setIndexFallback] = useState(false);

  // Race condition guard
  const fetchIdRef = useRef(0);

  // Cursor + exhaustion state for the userId query stream.
  // Stored in refs so updates don't trigger re-renders.
  const cursorByIdRef  = useRef<QueryDocumentSnapshot | null>(null);
  const hasMoreByIdRef = useRef(true);

  // Global dedup set — grows across pages to prevent cross-page duplicates
  const seenIdsRef = useRef(new Set<string>());

  const fetchPage = useCallback(async (isInitial: boolean) => {
    if (!user?.uid) return;

    const uid = user.uid;
    const currentFetchId = ++fetchIdRef.current;

    if (isInitial) {
      // Reset all state for a fresh load
      setOrdersLoading(true);
      setOrdersError(false);
      setHasMore(false);
      setIndexFallback(false);
      cursorByIdRef.current = null;
      hasMoreByIdRef.current = true;
      seenIdsRef.current = new Set();
    } else {
      setLoadingMore(true);
    }

    let newRows: Order[] = [];

    try {
      // ── userId query (only valid query under current security rules) ──────
      // Security rules require resource.data.userId == request.auth.uid.
      // Any other filter (e.g. user.email) cannot satisfy that proof and is
      // rejected by Firestore as PERMISSION_DENIED, so the email path is
      // intentionally absent.
      if (hasMoreByIdRef.current) {
        try {
          const result = await runQuery("userId", uid, "userId", cursorByIdRef.current);
          newRows                = result.rows;
          cursorByIdRef.current  = result.lastDoc;
          hasMoreByIdRef.current = result.hasMore;
          if (result.indexFallback) {
            // Index-less: all docs fetched in one shot — disable pagination
            hasMoreByIdRef.current = false;
            if (fetchIdRef.current === currentFetchId) setIndexFallback(true);
          }
        } catch (err: any) {
          console.error("[OrderHistory] userId query failed:", err);
          hasMoreByIdRef.current = false;
          if (isInitial) {
            if (fetchIdRef.current !== currentFetchId) return;
            setOrdersError(true);
            return;
          }
        }
      }

      // ── Dedup against global seen set, sort, append ───────────────────────
      const fresh = newRows.filter(o => !!o.id && !seenIdsRef.current.has(o.id));
      fresh.forEach(o => seenIdsRef.current.add(o.id));

      // Cap the seen-set to prevent unbounded growth for heavy users.
      const SEEN_CAP = 500;
      if (seenIdsRef.current.size > SEEN_CAP) {
        seenIdsRef.current = new Set(
          Array.from(seenIdsRef.current).slice(-SEEN_CAP)
        );
      }

      if (fetchIdRef.current !== currentFetchId) return;
      setOrders(prev =>
        isInitial ? sortDesc(fresh) : mergeSorted(prev, sortDesc(fresh))
      );
      setHasMore(hasMoreByIdRef.current);
    } finally {
      if (fetchIdRef.current === currentFetchId) {
        setOrdersLoading(false);
        setLoadingMore(false);
      }
    }
  }, [user]);

  // Initial fetch
  useEffect(() => {
    if (user?.uid) fetchPage(true);
  }, [user, fetchPage]);

  if (loading || !user) return null;

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

        {/* ── Loading skeletons (initial) ── */}
        {ordersLoading && (
          <div className={styles.list}>
            {Array.from({ length: PAGE_SIZE }).map((_, i) => (
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
          <>
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

            {/* ── Load More (hidden in index-fallback mode) ── */}
            {hasMore && !indexFallback && (
              <button
                onClick={() => fetchPage(false)}
                disabled={loadingMore}
                className={styles.loadMoreBtn}
              >
                {loadingMore ? "Loading…" : "Load More"}
              </button>
            )}
          </>
        )}

        {/* ── Index-fallback notice ── */}
        {indexFallback && !ordersLoading && (
          <p className={styles.partialNotice}>
            Showing all orders (limited performance mode — create a Firestore index to enable pagination).
          </p>
        )}

      </div>
    </div>
  );
}

