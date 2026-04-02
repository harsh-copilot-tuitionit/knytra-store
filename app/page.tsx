import Image from "next/image";
import Countdown from "@/components/Countdown";
import EmailCapture from "@/components/EmailCapture";
import styles from "./page.module.css";

/* ——————————————————————————————————————
   Coming Soon — Server Component
   Target: May 14, 2026 00:00 IST (UTC+5:30)
—————————————————————————————————————— */
export default function ComingSoonPage() {
  const LAUNCH_DATE = "2026-05-14T00:00:00+05:30";

  return (
    <main className={styles.main}>

      {/* ── Ambient layers ───────────────── */}
      <div className={styles.noise}         aria-hidden="true" />
      <div className={styles.grid}          aria-hidden="true" />
      <div className={styles.glowTop}       aria-hidden="true" />
      <div className={styles.glowBottom}    aria-hidden="true" />

      {/* ── Corner brackets ──────────────── */}
      <span className={`${styles.corner} ${styles.cornerTL}`} aria-hidden="true" />
      <span className={`${styles.corner} ${styles.cornerTR}`} aria-hidden="true" />
      <span className={`${styles.corner} ${styles.cornerBL}`} aria-hidden="true" />
      <span className={`${styles.corner} ${styles.cornerBR}`} aria-hidden="true" />

      {/* ── Top bar ──────────────────────── */}
      <header className={styles.topbar}>
        <span className={styles.topbarBrand}>KNYTRA.COM</span>
        <a
          href="https://instagram.com/knytra.in"
          target="_blank"
          rel="noopener noreferrer"
          className={styles.topbarInsta}
          aria-label="Follow Knytra on Instagram"
        >
          @knytra.in
        </a>
      </header>

      {/* ── Hero ─────────────────────────── */}
      <section className={styles.hero} aria-label="Coming soon announcement">

        {/* Logo */}
        <div className={styles.logoWrap}>
          <Image
            src="/knytra-logo.png"
            alt="KNYTRA"
            width={320}
            height={120}
            priority
            className={styles.logo}
          />
        </div>

        {/* Tagline */}
        <p className={styles.tagline}>WEAR THE STREETS</p>

        {/* Rule */}
        <div className={styles.divider} aria-hidden="true" />

        {/* Drop label */}
        <p className={styles.droppingLabel}>DROPPING</p>

        {/* Countdown */}
        <Countdown targetDate={LAUNCH_DATE} />

        {/* Waitlist */}
        <EmailCapture />

      </section>

      {/* ── Footer ───────────────────────── */}
      <footer className={styles.footer}>
        <a
          href="https://instagram.com/knytra.in"
          target="_blank"
          rel="noopener noreferrer"
          className={styles.instaLink}
          aria-label="Follow us on Instagram @knytra.in"
          id="instagram-footer-link"
        >
          {/* Instagram icon */}
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
          </svg>
          @knytra.in
        </a>

        <span className={styles.copyright}>
          © 2026 KNYTRA. ALL RIGHTS RESERVED.
        </span>
      </footer>

    </main>
  );
}
