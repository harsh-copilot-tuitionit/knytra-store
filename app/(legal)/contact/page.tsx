import type { Metadata } from "next";
import styles from "../legal.module.css";

export const metadata: Metadata = {
  title: "Contact Us — Knytra",
  description: "Get in touch with the Knytra support team.",
};

export default function ContactPage() {
  return (
    <div className={styles.page}>
      <div className={styles.hero}>
        <p className={styles.eyebrow}>Support</p>
        <h1 className={styles.title}>Contact Us</h1>
        <p className={styles.meta}>
          Knytra Streetwear (TM) &nbsp;·&nbsp; Kyraas Jewel Enterprises
        </p>
      </div>

      <div className={styles.content}>

        <div className={styles.callout}>
          We respond to all queries within <strong>1–2 business days</strong> (Mon–Sat, 10 AM – 6 PM IST).
          Please include your order ID in all communications for faster resolution.
        </div>

        {/* Contact cards */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Get in Touch</h2>
          <div className={styles.contactGrid}>

            <div className={styles.contactCard}>
              <span className={styles.contactCardLabel}>Support Email</span>
              <a
                className={styles.contactCardValue}
                href="mailto:support@knytra.in"
              >
                support@knytra.in
              </a>
              <span className={styles.contactCardSub}>
                For order issues, exchanges, and general enquiries
              </span>
            </div>

            <div className={styles.contactCard}>
              <span className={styles.contactCardLabel}>Phone</span>
              <a
                className={styles.contactCardValue}
                href="tel:+919105021555"
              >
                +91 91050 21555
              </a>
              <span className={styles.contactCardSub}>
                Mon – Sat, 10 AM – 6 PM IST only
              </span>
            </div>

            <div className={styles.contactCard}>
              <span className={styles.contactCardLabel}>Instagram</span>
              <a
                className={styles.contactCardValue}
                href="https://instagram.com/knytra.in"
                target="_blank"
                rel="noopener noreferrer"
              >
                @knytra.in
              </a>
              <span className={styles.contactCardSub}>
                DMs for general queries (not for order support)
              </span>
            </div>

            <div className={styles.contactCard}>
              <span className={styles.contactCardLabel}>Registered Address</span>
              <span className={styles.contactCardValue} style={{ fontSize: "13px" }}>
                1/11822, 3rd Floor, C-23,<br />
                Panchsheel Garden, Naveen Shahdara,<br />
                Delhi – 110032
              </span>
              <span className={styles.contactCardSub}>
                Kyraas Jewel Enterprises · GST: 07EMLPR1878A1ZS
              </span>
            </div>

          </div>
        </section>

        {/* Response SLA */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Response Times</h2>
          <div className={styles.body}>
            <table className={styles.hoursTable}>
              <tbody>
                <tr>
                  <td>Order / Payment issues</td>
                  <td>Within 1 business day</td>
                </tr>
                <tr>
                  <td>Exchange requests</td>
                  <td>Within 3 business days</td>
                </tr>
                <tr>
                  <td>Tracking enquiries</td>
                  <td>Within 1 business day</td>
                </tr>
                <tr>
                  <td>General enquiries</td>
                  <td>Within 2 business days</td>
                </tr>
                <tr>
                  <td>Support hours</td>
                  <td>Mon – Sat, 10 AM – 6 PM IST</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Order support tips */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Before You Contact Us</h2>
          <div className={styles.body}>
            <p>
              To help us resolve your query faster, please ensure you include:
            </p>
            <ul className={styles.list}>
              <li>Your <strong>Order ID</strong> (found in your confirmation email).</li>
              <li>The email address used at checkout.</li>
              <li>
                For exchange requests: an unboxing video and at least 3 photographs — see our{" "}
                <a href="/refunds">Refund &amp; Cancellation Policy</a> for full requirements.
              </li>
              <li>
                For delivery issues: your courier tracking number and a screenshot of the
                tracking status.
              </li>
            </ul>
            <p>
              Incomplete queries may result in a delayed response while we gather the required
              information.
            </p>
          </div>
        </section>

        <div className={styles.calloutStrong}>
          All formal / legal notices must be sent in writing to: support@knytra.in with the
          subject line &quot;LEGAL NOTICE&quot;, or by registered post to Kyraas Jewel Enterprises,
          1/11822, 3rd Floor, C-23, Panchsheel Garden, Naveen Shahdara, Delhi – 110032.
        </div>

      </div>
    </div>
  );
}
