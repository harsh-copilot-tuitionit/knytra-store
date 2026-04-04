import styles from "../products/products.module.css";
import { Users } from "lucide-react";

export default function AdminCustomers() {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Customers</h1>
          <p className={styles.subtitle}>View customer profiles and data.</p>
        </div>
      </div>
      
      <div className={styles.tableCard}>
        <div className={styles.emptyState}>
          <div className={styles.emptyIconWrap}>
            <Users size={32} />
          </div>
          <h3>No Customers Yet</h3>
          <p>Customer accounts will populate here after they log in or checkout.</p>
        </div>
      </div>
    </div>
  );
}
