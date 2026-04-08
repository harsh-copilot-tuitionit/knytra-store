import Link from "next/link";
import styles from "./not-found.module.css";

export default function NotFound() {
  return (
    <main className={styles.main}>
      {/* Animated thread lines background */}
      <div className={styles.bg} aria-hidden="true">
        {Array.from({ length: 12 }).map((_, i) => (
          <span key={i} className={styles.thread} style={{ "--i": i } as React.CSSProperties} />
        ))}
      </div>

      <div className={styles.content}>
        {/* Big 404 */}
        <div className={styles.codeWrap} aria-hidden="true">
          <span className={styles.codeText}>404</span>
          <span className={styles.codeGhost}>404</span>
        </div>

        {/* Knitting needle SVG icon */}
        <div className={styles.icon} aria-hidden="true">
          <svg width="56" height="56" viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="28" cy="28" r="27" stroke="white" strokeWidth="1.2" strokeDasharray="4 3" />
            <line x1="14" y1="28" x2="42" y2="28" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
            <line x1="20" y1="20" x2="36" y2="36" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
            <line x1="36" y1="20" x2="20" y2="36" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
            <circle cx="28" cy="28" r="4" stroke="white" strokeWidth="1.5"/>
          </svg>
        </div>

        {/* Headline */}
        <h1 className={styles.heading}>
          Hold on while we<br />
          <em className={styles.accent}>knit this page</em><br />
          for you.
        </h1>

        <p className={styles.sub}>
          Looks like the bricks are still being laid here.<br />
          This thread hasn&apos;t been woven into the fabric just yet.
        </p>

        {/* CTA */}
        <Link href="/" className={styles.btn}>
          Back to Home
        </Link>

        <Link href="/shop" className={styles.btnGhost}>
          Browse the Shop →
        </Link>
      </div>

      {/* Brand mark */}
      <span className={styles.brand} aria-hidden="true">KNYTRA</span>
    </main>
  );
}
