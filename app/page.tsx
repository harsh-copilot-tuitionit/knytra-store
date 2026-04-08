import Image from "next/image";
import Link from "next/link";
import Countdown from "@/components/Countdown";
import EmailCapture from "@/components/EmailCapture";
import styles from "./page.module.css";

export default function HomePage() {
  const LAUNCH_DATE = "2026-05-14T00:00:00+05:30";

  return (
    <main className={styles.main}>

      {/* ── Hero ── */}
      <section className={styles.hero}>
        {/* Background photo */}
        <div className={styles.heroBg} aria-hidden="true">
          <Image
            src="https://images.unsplash.com/photo-1529374255404-311a2a4f1fd9?w=1400&h=900&fit=crop"
            alt=""
            fill
            priority
            className={styles.heroBgImg}
          />
          <div className={styles.heroBgOverlay} />
        </div>

        {/* Topbar */}
        <header className={styles.topbar}>
          <span className={styles.topbarBrand}>KNYTRA.COM</span>
          <a
            href="https://instagram.com/knytra.in"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.topbarInsta}
          >
            @knytra.in
          </a>
        </header>

        {/* Hero content */}
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
            <span className={styles.heroLine}>WEAR</span>
            <span className={styles.heroLine}>THE</span>
            <span className={styles.heroLine}>STREETS.</span>
          </div>

          <p className={styles.heroSub}>RAW. BOLD. UNAPOLOGETICALLY URBAN.</p>

          {/* Circular rotating badge */}
          <div className={styles.circleBadge} aria-hidden="true">
            <svg viewBox="0 0 120 120" width="120" height="120">
              <defs>
                <path
                  id="circlePath"
                  d="M 60,60 m -42,0 a 42,42 0 1,1 84,0 a 42,42 0 1,1 -84,0"
                />
              </defs>
              <text
                fontSize="10.5"
                fill="rgba(255,255,255,0.7)"
                fontFamily="var(--font-inter)"
                fontWeight="500"
                letterSpacing="2.5"
              >
                <textPath href="#circlePath">
                  KNYTRA · WEAR THE STREETS · KNYTRA · WEAR THE STREETS ·
                </textPath>
              </text>
              <text
                x="60"
                y="64"
                textAnchor="middle"
                fontSize="20"
                fill="white"
                fontFamily="var(--font-inter)"
              >
                ✕
              </text>
            </svg>
          </div>

          <Link href="/shop" className={styles.shopCta}>
            START SHOPPING →
          </Link>
        </div>
      </section>

      {/* ── Countdown section ── */}
      <section className={styles.countdownSection}>
        <p className={styles.droppingLabel}>DROPPING</p>
        <Countdown targetDate={LAUNCH_DATE} />
        <div className={styles.emailWrap}>
          <EmailCapture />
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className={styles.footer}>
        <a
          href="https://instagram.com/knytra.in"
          target="_blank"
          rel="noopener noreferrer"
          className={styles.instaLink}
          aria-label="Follow Knytra on Instagram"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
          </svg>
          @knytra.in
        </a>
        <span className={styles.copyright}>© 2026 KNYTRA. ALL RIGHTS RESERVED.</span>
      </footer>

    </main>
  );
}
