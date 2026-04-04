import styles from "../products/products.module.css";
import { ShoppingBag } from "lucide-react";

export default function AdminOrders() {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Orders</h1>
          <p className={styles.subtitle}>View and manage customer orders.</p>
        </div>
      </div>
      
      <div className={styles.tableCard}>
        <div className={styles.emptyState}>
          <div className={styles.emptyIconWrap}>
            <ShoppingBag size={32} />
          </div>
          <h3>No Orders Yet</h3>
          <p>Once you make a sale, orders will appear here automatically.</p>
        </div>
      </div>
    </div>
  );
}
