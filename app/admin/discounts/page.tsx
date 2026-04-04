import styles from "../products/products.module.css";
import { Tags } from "lucide-react";

export default function AdminDiscounts() {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Discounts</h1>
          <p className={styles.subtitle}>Manage discount codes and promotions.</p>
        </div>
      </div>
      
      <div className={styles.tableCard}>
        <div className={styles.emptyState}>
          <div className={styles.emptyIconWrap}>
            <Tags size={32} />
          </div>
          <h3>No Discounts</h3>
          <p>Create promotional codes to offer your customers.</p>
        </div>
      </div>
    </div>
  );
}
