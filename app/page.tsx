import Countdown from "@/components/Countdown";
import EmailCapture from "@/components/EmailCapture";
import styles from "./page.module.css";

export default function HomePage() {
  return (
    <main className={styles.main}>
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <p className={styles.themeLabel}>LAUNCHING SOON</p>
          <h1 className={styles.title}>KNYTRA</h1>
          <p className={styles.tagline}>CRAFTED WITH INTENT</p>
          <p className={styles.subtitle}>
            A new chapter in Indian streetwear. The launch window opens 14 May 2026.
          </p>

          <div className={styles.launchMeta}>
            <span className={styles.launchDate}>14 MAY 2026</span>
            <span className={styles.launchHint}>Minimal drop. Limited access. Join the waitlist.</span>
          </div>

          <Countdown targetDate="2026-05-14T00:00:00" />

          <div className={styles.emailWrap}>
            <EmailCapture />
          </div>
        </div>
      </section>
    </main>
  );
}
