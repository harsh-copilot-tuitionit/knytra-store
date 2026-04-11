import styles from "./skeletons.module.css";

export default function AccountSkeleton() {
  return (
    <div className={styles.heroSkeleton} aria-hidden="true">
      <div className={`${styles.avatar} skeleton`} />
      <div className={styles.heroText}>
        <div className={`${styles.heroName} skeleton`} />
        <div className={`${styles.heroEmail} skeleton`} />
      </div>
    </div>
  );
}
