import type { Metadata } from "next";
import Link from "next/link";
import styles from "../brandPages.module.css";

export const metadata: Metadata = {
  title: "Contact | Knytra",
  description: "Reach Knytra support for order help, exchanges, delivery updates, and collaboration requests.",
};

export default function ContactPage() {
  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <p className={styles.eyebrow}>Contact</p>
          <h1 className={styles.title}>Talk to the team behind the drop.</h1>
          <p className={styles.subtitle}>
            Questions about your order, sizing, exchanges, or collaborations? Reach out and we
            will get back as quickly as possible during support hours.
          </p>
          <div className={styles.heroActions}>
            <a href="mailto:support@knytra.in" className={styles.ctaPrimary}>
              Email Support
            </a>
            <a href="tel:+919105021555" className={styles.ctaGhost}>
              Call Support
            </a>
          </div>
        </div>
      </section>

      <div className={styles.content}>
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <p className={styles.sectionEyebrow}>Reach Out</p>
            <h2 className={styles.sectionTitle}>Primary support channels.</h2>
          </div>

          <div className={styles.contactGrid}>
            <article className={styles.contactCard}>
              <span className={styles.contactLabel}>Support Email</span>
              <a className={styles.contactValue} href="mailto:support@knytra.in">
                support@knytra.in
              </a>
              <p className={styles.contactMeta}>
                Best channel for order issues, exchanges, and payment support.
              </p>
            </article>

            <article className={styles.contactCard}>
              <span className={styles.contactLabel}>Phone</span>
              <a className={styles.contactValue} href="tel:+919105021555">
                +91 91050 21555
              </a>
              <p className={styles.contactMeta}>Mon-Sat, 10:00 AM to 6:00 PM IST.</p>
            </article>

            <article className={styles.contactCard}>
              <span className={styles.contactLabel}>Instagram</span>
              <a
                className={styles.contactValue}
                href="https://instagram.com/knytra.in"
                target="_blank"
                rel="noopener noreferrer"
              >
                @knytra.in
              </a>
              <p className={styles.contactMeta}>Great for general questions and updates.</p>
            </article>

            <article className={styles.contactCard}>
              <span className={styles.contactLabel}>Registered Office</span>
              <p className={styles.contactMeta}>
                Kyraas Jewel Enterprises, 1/11822, 3rd Floor, C-23, Panchsheel Garden, Naveen
                Shahdara, Delhi - 110032.
              </p>
              <p className={styles.contactMeta}>GST: 07EMLPR1878A1ZS</p>
            </article>
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <p className={styles.sectionEyebrow}>Before You Message</p>
            <h2 className={styles.sectionTitle}>Help us solve it faster.</h2>
          </div>
          <p className={styles.sectionText}>
            Include the details below in your first message so we can resolve your issue in one
            pass.
          </p>
          <ol className={styles.contactSteps}>
            <li>Order ID and the email used at checkout.</li>
            <li>For delivery issues: tracking number and current status screenshot.</li>
            <li>
              For exchanges: unboxing video plus clear product photos as per the{" "}
              <Link href="/refunds">Refund Policy</Link>.
            </li>
            <li>Preferred resolution and your best callback time.</li>
          </ol>
        </section>

        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <p className={styles.sectionEyebrow}>Response Times</p>
            <h2 className={styles.sectionTitle}>Typical turnaround.</h2>
          </div>
          <div className={styles.timeline}>
            <article className={styles.timelineItem}>
              <span className={styles.timelineStep}>01</span>
              <div>
                <h3 className={styles.timelineTitle}>Order and payment issues</h3>
                <p className={styles.timelineText}>Usually within 1 business day.</p>
              </div>
            </article>
            <article className={styles.timelineItem}>
              <span className={styles.timelineStep}>02</span>
              <div>
                <h3 className={styles.timelineTitle}>Exchange assessments</h3>
                <p className={styles.timelineText}>Usually within 2-3 business days.</p>
              </div>
            </article>
            <article className={styles.timelineItem}>
              <span className={styles.timelineStep}>03</span>
              <div>
                <h3 className={styles.timelineTitle}>General queries</h3>
                <p className={styles.timelineText}>Usually within 1-2 business days.</p>
              </div>
            </article>
          </div>
        </section>
      </div>
    </div>
  );
}
