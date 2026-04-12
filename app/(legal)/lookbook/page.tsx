import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import styles from "../brandPages.module.css";

export const metadata: Metadata = {
  title: "Lookbook | Knytra",
  description:
    "Explore Knytra lookbook edits: layered silhouettes, street textures, and styling direction for the season.",
};

const LOOKS = [
  {
    title: "Underpass Uniform",
    mood: "Oversized tee, cargos, cap",
    image:
      "https://images.unsplash.com/photo-1516826957135-700dedea698c?w=1100&h=1500&fit=crop",
    variant: "tall",
  },
  {
    title: "Monsoon Concrete",
    mood: "Layered hoodie and utility pants",
    image:
      "https://images.unsplash.com/photo-1544441893-675973e31985?w=1300&h=1000&fit=crop",
    variant: "wide",
  },
  {
    title: "Neon Side Street",
    mood: "Graphic tee with washed denim",
    image:
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=1000&h=1400&fit=crop",
    variant: "tall",
  },
  {
    title: "Last Metro",
    mood: "Dark palette and clean silhouettes",
    image:
      "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=1000&h=1400&fit=crop",
    variant: "normal",
  },
  {
    title: "Rooftop Static",
    mood: "Statement outerwear with minimal base",
    image:
      "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=1300&h=1000&fit=crop",
    variant: "wide",
  },
  {
    title: "After Hours",
    mood: "Muted layering for late city hours",
    image:
      "https://images.unsplash.com/photo-1525134479668-1bee5c7c6845?w=1000&h=1400&fit=crop",
    variant: "normal",
  },
];

const STYLING_NOTES = [
  {
    title: "Contrast Volumes",
    text: "Pair oversized tops with tapered bottoms to keep movement clean and proportioned.",
  },
  {
    title: "Texture Stacking",
    text: "Blend washed cottons, brushed fleece, and matte accessories for depth without loud colors.",
  },
  {
    title: "One Loud Piece",
    text: "Anchor the fit in neutrals and let one graphic or silhouette carry the statement.",
  },
];

export default function LookbookPage() {
  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <p className={styles.eyebrow}>Lookbook</p>
          <h1 className={styles.title}>Street frames from the current era.</h1>
          <p className={styles.subtitle}>
            Outfit direction built around city texture, utility, and comfort. Save your favorite
            silhouettes, then build your own version in the shop.
          </p>
          <div className={styles.heroActions}>
            <Link href="/shop" className={styles.ctaPrimary}>
              Build Your Fit
            </Link>
            <Link href="/drops" className={styles.ctaGhost}>
              Track Next Drop
            </Link>
          </div>
        </div>
      </section>

      <div className={styles.content}>
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <p className={styles.sectionEyebrow}>Editorial</p>
            <h2 className={styles.sectionTitle}>Season snapshots.</h2>
          </div>
          <div className={styles.lookbookGrid}>
            {LOOKS.map((look) => (
              <article
                key={look.title}
                className={`${styles.lookbookCard} ${
                  look.variant === "tall"
                    ? styles.lookbookTall
                    : look.variant === "wide"
                      ? styles.lookbookWide
                      : ""
                }`}
              >
                <Image
                  src={look.image}
                  alt={look.title}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className={styles.lookbookImage}
                />
                <div className={styles.lookbookCaption}>
                  <h3>{look.title}</h3>
                  <p>{look.mood}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <p className={styles.sectionEyebrow}>Styling Notes</p>
            <h2 className={styles.sectionTitle}>How we style it.</h2>
          </div>
          <div className={styles.noteGrid}>
            {STYLING_NOTES.map((note) => (
              <article key={note.title} className={styles.noteCard}>
                <h3>{note.title}</h3>
                <p>{note.text}</p>
              </article>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
