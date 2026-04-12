import type { Metadata } from "next";
import Link from "next/link";
import styles from "../brandPages.module.css";

export const metadata: Metadata = {
  title: "Drops | Knytra",
  description:
    "Track upcoming Knytra drops, release windows, and how each collection moves from concept to street.",
};

const DROPS = [
  {
    name: "Concrete Bloom",
    window: "May 2026",
    status: "soon",
    note: "Oversized tees and washed graphics inspired by city flora and cracked concrete.",
    href: "/shop",
  },
  {
    name: "Night Transit",
    window: "July 2026",
    status: "soon",
    note: "Layering essentials for monsoon commutes: heavy knits, utility pants, and storm tones.",
    href: "/shop",
  },
  {
    name: "Signal Fire",
    window: "Live now",
    status: "live",
    note: "Limited rerun of core silhouettes with high-contrast prints and refined fits.",
    href: "/shop",
  },
];

const PROCESS = [
  {
    title: "Street Research",
    text: "We gather references from real streets, local scenes, and customer fit feedback.",
  },
  {
    title: "Prototype and Fit Test",
    text: "Each piece goes through wear-tests to lock silhouette, comfort, and print behavior.",
  },
  {
    title: "Limited Production",
    text: "We manufacture in focused runs to protect quality and prevent overproduction waste.",
  },
  {
    title: "Drop Day",
    text: "Once a drop sells out, it usually does not come back in the same form.",
  },
];

export default function DropsPage() {
  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <p className={styles.eyebrow}>Release Radar</p>
          <h1 className={styles.title}>Limited runs. No lazy repeats.</h1>
          <p className={styles.subtitle}>
            Knytra drops are built as chapters, not endless inventory. Mark your calendar,
            pick your fit, and move early.
          </p>
          <div className={styles.heroActions}>
            <Link href="/shop" className={styles.ctaPrimary}>
              Shop Live Drop
            </Link>
            <Link href="/contact" className={styles.ctaGhost}>
              Ask Drop Questions
            </Link>
          </div>
        </div>
      </section>

      <div className={styles.content}>
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <p className={styles.sectionEyebrow}>Calendar</p>
            <h2 className={styles.sectionTitle}>Upcoming and live collections.</h2>
          </div>
          <div className={styles.dropGrid}>
            {DROPS.map((drop) => (
              <article key={drop.name} className={styles.dropCard}>
                <h3>{drop.name}</h3>
                <div className={styles.dropMeta}>
                  <span className={styles.dropWindow}>{drop.window}</span>
                  <span className={drop.status === "live" ? styles.badgeLive : styles.badgeSoon}>
                    {drop.status === "live" ? "Live" : "Soon"}
                  </span>
                </div>
                <p>{drop.note}</p>
                <div className={styles.dropActions}>
                  <Link href={drop.href} className={styles.ctaGhost}>
                    Explore Drop
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <p className={styles.sectionEyebrow}>Method</p>
            <h2 className={styles.sectionTitle}>How a drop comes to life.</h2>
          </div>
          <div className={styles.timeline}>
            {PROCESS.map((step, index) => (
              <article key={step.title} className={styles.timelineItem}>
                <span className={styles.timelineStep}>{`0${index + 1}`}</span>
                <div>
                  <h3 className={styles.timelineTitle}>{step.title}</h3>
                  <p className={styles.timelineText}>{step.text}</p>
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
