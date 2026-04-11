import styles from "./skeletons.module.css";

export default function OrderCardSkeleton() {
  return (
    <div className={styles.orderRow} aria-hidden="true">
      <div className={styles.leftCol}>
        <div className={`${styles.lineShort} skeleton`} />
        <div className={`${styles.lineLong} skeleton`} />
      </div>
      <div className={styles.rightCol}>
        <div className={`${styles.linePrice} skeleton`} />
        <div className={`${styles.badge} skeleton`} />
      </div>
    </div>
  );
}
