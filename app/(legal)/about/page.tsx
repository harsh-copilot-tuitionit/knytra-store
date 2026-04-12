import type { Metadata } from "next";
import Link from "next/link";
import styles from "../brandPages.module.css";

export const metadata: Metadata = {
  title: "About Knytra",
  description:
    "Discover the Knytra manifesto, our streetwear roots, and the values that shape every drop.",
};

const TICKER = [
  "Delhi roots",
  "Limited runs",
  "Street-made silhouettes",
  "No recycled designs",
  "Community-led feedback",
  "Raw. Bold. Urban.",
];

const VALUES = [
  {
    id: "01",
    title: "Built In Small Batches",
    text: "We release in controlled quantities to keep quality high and each piece worth owning.",
  },
  {
    id: "02",
    title: "Fabric Before Hype",
    text: "Heavyweight hand-feel, durable prints, and fit-tested cuts come before every campaign idea.",
  },
  {
    id: "03",
    title: "Street Data Over Trends",
    text: "Our briefs come from what people actually wear in the city, not trend decks.",
  },
  {
    id: "04",
    title: "Respect The Culture",
    text: "Every design is original and built with care for the scenes and cities that inspired it.",
  },
];

export default function AboutPage() {
  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <p className={styles.eyebrow}>Brand Story</p>
          <h1 className={styles.title}>Built from asphalt, not algorithms.</h1>
          <p className={styles.subtitle}>
            Knytra started with one idea: Indian streetwear should feel original, intentional, and
            lived in. We design for nights that run late, commutes that get loud, and people who
            wear confidence like a uniform.
          </p>
          <div className={styles.heroActions}>
            <Link href="/drops" className={styles.ctaPrimary}>
              See Upcoming Drops
            </Link>
            <Link href="/shop" className={styles.ctaGhost}>
              Shop Current Line
            </Link>
          </div>

          <div className={styles.ticker} aria-hidden="true">
            <div className={styles.tickerTrack}>
              {[...TICKER, ...TICKER].map((item, index) => (
                <span key={`${item}-${index}`} className={styles.tickerItem}>
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      <div className={styles.content}>
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <p className={styles.sectionEyebrow}>Origin</p>
            <h2 className={styles.sectionTitle}>From side streets to statement pieces.</h2>
          </div>
          <p className={styles.sectionText}>
            Founded in Delhi, Knytra is shaped by movement: skate spots under flyovers, midnight
            studio sessions, and the energy of local neighborhoods. We are not chasing luxury for
            the label. We are building a visual language for people who want their clothing to say
            something before they do.
          </p>

          <div className={styles.statGrid}>
            <article className={styles.statCard}>
              <span className={styles.statValue}>Delhi</span>
              <span className={styles.statLabel}>Home base</span>
            </article>
            <article className={styles.statCard}>
              <span className={styles.statValue}>Small run</span>
              <span className={styles.statLabel}>Production model</span>
            </article>
            <article className={styles.statCard}>
              <span className={styles.statValue}>Fit-tested</span>
              <span className={styles.statLabel}>Every silhouette</span>
            </article>
            <article className={styles.statCard}>
              <span className={styles.statValue}>Street-first</span>
              <span className={styles.statLabel}>Design direction</span>
            </article>
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <p className={styles.sectionEyebrow}>Code</p>
            <h2 className={styles.sectionTitle}>What we will always stand for.</h2>
          </div>
          <div className={styles.valueGrid}>
            {VALUES.map((item) => (
              <article key={item.id} className={styles.valueCard}>
                <span className={styles.valueIndex}>{item.id}</span>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </article>
            ))}
          </div>

          <div className={styles.statementBand}>
            We are not made for everyone. We are made for people who move with intent.
          </div>
        </section>
      </div>
    </div>
  );
}
