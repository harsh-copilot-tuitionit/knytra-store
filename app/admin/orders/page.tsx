"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { ShoppingBag } from "lucide-react";
import { db } from "@/lib/firebase";
import styles from "../products/products.module.css";

interface AdminOrderListItem {
  id: string;
  user?: { name?: string };
  totalAmount?: number;
  payment?: { status?: string };
  qikinkStatus?: string;
  qikinkOrderId?: string;
  createdAt?: { toDate?: () => Date };
}

function formatDate(value?: { toDate?: () => Date }): string {
  if (!value?.toDate) return "-";
  return value.toDate().toLocaleString("en-IN");
}

export default function AdminOrders() {
  const [orders, setOrders] = useState<AdminOrderListItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchOrders() {
      try {
        const q = query(collection(db, "orders"), orderBy("createdAt", "desc"));
        const snapshot = await getDocs(q);
        const rows = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as AdminOrderListItem[];
        setOrders(rows);
      } catch (error) {
        console.error("Error fetching orders:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchOrders();
  }, []);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Orders</h1>
          <p className={styles.subtitle}>View orders and retry failed Qikink fulfillment.</p>
        </div>
      </div>

      <div className={styles.tableCard}>
        {loading ? (
          <div className={styles.loadingState}>Loading orders...</div>
        ) : orders.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIconWrap}>
              <ShoppingBag size={32} />
            </div>
            <h3>No Orders Yet</h3>
            <p>Once you make a sale, orders will appear here automatically.</p>
          </div>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Order</th>
                <th>Customer</th>
                <th>Payment</th>
                <th>Qikink</th>
                <th>Placed</th>
                <th className={styles.actionCol}>Action</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id}>
                  <td className={styles.priceCell}>{order.id.slice(-8).toUpperCase()}</td>
                  <td>{order.user?.name ?? "-"}</td>
                  <td>{order.payment?.status ?? "-"}</td>
                  <td>
                    {order.qikinkStatus ?? "Not attempted"}
                    {order.qikinkOrderId ? " (created)" : ""}
                  </td>
                  <td>{formatDate(order.createdAt)}</td>
                  <td className={styles.actionCol}>
                    <Link href={`/admin/orders/${order.id}`} className={styles.actionButton}>
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
