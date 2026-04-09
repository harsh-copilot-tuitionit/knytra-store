import Link from "next/link";
import styles from "./orderFailed.module.css";

export default function OrderFailedPage() {
  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.icon}>✕</div>
        <h1 className={styles.title}>Payment Failed</h1>
        <p className={styles.sub}>
          Your payment could not be processed. You have <strong>not</strong> been charged.
          This can happen due to insufficient funds, a network issue, or a bank decline.
        </p>
        <div className={styles.actions}>
          <Link href="/checkout" className={styles.retryBtn}>
            Retry Payment
          </Link>
          <Link href="/shop" className={styles.shopLink}>
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
