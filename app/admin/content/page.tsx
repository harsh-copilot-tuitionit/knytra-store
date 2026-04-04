import styles from "../products/products.module.css";
import { LayoutDashboard } from "lucide-react";

export default function AdminContent() {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Content</h1>
          <p className={styles.subtitle}>Manage website content and banners.</p>
        </div>
      </div>
      
      <div className={styles.tableCard}>
        <div className={styles.emptyState}>
          <div className={styles.emptyIconWrap}>
            <LayoutDashboard size={32} />
          </div>
          <h3>No Content Areas</h3>
          <p>Soon you'll be able to manage homepage banners and text blocks here.</p>
        </div>
      </div>
    </div>
  );
}
