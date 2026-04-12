import type { Metadata } from "next";
import Link from "next/link";
import styles from "../brandPages.module.css";

export const metadata: Metadata = {
  title: "FAQ | Knytra",
  description:
    "Answers to common Knytra questions on drops, orders, shipping, returns, sizing, and account support.",
};

const FAQ_ITEMS = [
  {
    question: "How often do you release new drops?",
    answer:
      "Most drops launch every 6-10 weeks. We announce release windows on the Drops page and social channels before going live.",
  },
  {
    question: "Will sold-out products restock?",
    answer:
      "Some core pieces return, but many graphics and colorways are one-run only. If a product matters to you, buy during the active drop.",
  },
  {
    question: "How long does shipping usually take?",
    answer:
      "Orders are usually processed in 2-4 business days, then delivered in about 5-8 business days depending on your location.",
  },
  {
    question: "Can I return an item for a refund?",
    answer:
      "Knytra follows a strict exchange-first policy for eligible cases. Read the complete terms in our Refund Policy before placing an order.",
  },
  {
    question: "Where can I check sizing before ordering?",
    answer:
      "Each product page includes a fit guide and size chart. If you are between sizes, we usually recommend sizing up for a relaxed streetwear fit.",
  },
  {
    question: "Do I need an account to place an order?",
    answer:
      "No account is required for checkout, but signing in helps you track history, save addresses, and build a wishlist.",
  },
];

export default function FaqPage() {
  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <p className={styles.eyebrow}>Support</p>
          <h1 className={styles.title}>Clear answers, no runaround.</h1>
          <p className={styles.subtitle}>
            Everything customers ask us most often, in one place. If your question is not covered,
            our support team is one message away.
          </p>
          <div className={styles.heroActions}>
            <Link href="/contact" className={styles.ctaPrimary}>
              Contact Support
            </Link>
            <Link href="/refunds" className={styles.ctaGhost}>
              Refund Policy
            </Link>
          </div>
        </div>
      </section>

      <div className={styles.content}>
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <p className={styles.sectionEyebrow}>Frequently Asked</p>
            <h2 className={styles.sectionTitle}>Top questions from the community.</h2>
          </div>

          <div className={styles.faqGroup}>
            {FAQ_ITEMS.map((item) => (
              <details key={item.question} className={styles.faqItem}>
                <summary>{item.question}</summary>
                <p className={styles.answer}>{item.answer}</p>
              </details>
            ))}
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <p className={styles.sectionEyebrow}>Policies</p>
            <h2 className={styles.sectionTitle}>Need the legal details?</h2>
          </div>
          <p className={styles.sectionText}>
            Full policy documents are available for terms, privacy, shipping, and refunds.
            Browse them anytime for complete details on payments, delivery, and exchanges.
          </p>
          <div className={styles.heroActions}>
            <Link href="/terms" className={styles.ctaGhost}>
              Terms of Service
            </Link>
            <Link href="/privacy" className={styles.ctaGhost}>
              Privacy Policy
            </Link>
            <Link href="/shipping" className={styles.ctaGhost}>
              Shipping Policy
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
