import Image from "next/image";
import styles from "./page.module.css";

export default function HomePage() {
  return (
    <main className={styles.main}>
      <section className={styles.hero}>
        <div className={styles.heroBg} aria-hidden="true">
          <Image
            src="https://images.unsplash.com/photo-1516826957135-700dedea698c?w=1400&h=900&fit=crop"
            alt=""
            fill
            priority
            className={styles.heroBgImg}
          />
          <div className={styles.heroBgOverlay} />
        </div>

        <div className={styles.heroContent}>
          <div className={styles.logoWrap}>
            <Image
              src="/knytra-logo.png"
              alt="KNYTRA"
              width={240}
              height={90}
              priority
              className={styles.logo}
            />
          </div>

          <div className={styles.heroText}>
            <span className={styles.heroLine}>KNYTRA</span>
            <span className={styles.heroLine}>PERMANENTLY</span>
            <span className={styles.heroLine}>CLOSED</span>
          </div>

          <p className={styles.heroSub}>
            This website is permanently closed. All operations have been
            discontinued.
          </p>

          <div className={styles.noticePanel}>
            <p className={styles.noticeTitle}>Site Permanently Closed</p>
            <p className={styles.noticeText}>
              This page is no longer active and does not accept orders or
              inquiries. No further updates will be issued here.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
