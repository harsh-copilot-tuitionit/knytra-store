import styles from "./admin.module.css";
import { DollarSign, ShoppingBag, Users, TrendingUp } from "lucide-react";

export default function AdminDashboard() {
  return (
    <div className={styles.dashboard}>
      <div className={styles.header}>
        <h1 className={styles.title}>Dashboard Overview</h1>
        <p className={styles.subtitle}>Welcome back. Here is what&apos;s happening with Knytra today.</p>
      </div>

      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statHeader}>
            <span className={styles.statLabel}>Total Revenue</span>
            <DollarSign size={20} className={styles.statIcon} />
          </div>
          <div className={styles.statValue}>₹0.00</div>
          <div className={styles.statDelta}>+0% from last month</div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statHeader}>
            <span className={styles.statLabel}>Orders</span>
            <ShoppingBag size={20} className={styles.statIcon} />
          </div>
          <div className={styles.statValue}>0</div>
          <div className={styles.statDelta}>+0% from last month</div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statHeader}>
            <span className={styles.statLabel}>Customers</span>
            <Users size={20} className={styles.statIcon} />
          </div>
          <div className={styles.statValue}>0</div>
          <div className={styles.statDelta}>+0% from last month</div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statHeader}>
            <span className={styles.statLabel}>Conversion Rate</span>
            <TrendingUp size={20} className={styles.statIcon} />
          </div>
          <div className={styles.statValue}>0.0%</div>
          <div className={styles.statDelta}>+0% from last month</div>
        </div>
      </div>

      <div className={styles.recentSection}>
        <h2 className={styles.sectionTitle}>Recent Orders</h2>
        <div className={styles.tableCard}>
          <div className={styles.emptyState}>
            <ShoppingBag size={48} className={styles.emptyIcon} />
            <p>No orders yet</p>
            <span className={styles.emptyHelper}>When you receive orders, they will appear here.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
