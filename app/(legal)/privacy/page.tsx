import type { Metadata } from "next";
import styles from "../legal.module.css";

export const metadata: Metadata = {
  title: "Privacy Policy — Knytra",
  description: "How Knytra collects, uses, and protects your personal information.",
};

export default function PrivacyPage() {
  return (
    <div className={styles.page}>
      <div className={styles.hero}>
        <p className={styles.eyebrow}>Legal</p>
        <h1 className={styles.title}>Privacy Policy</h1>
        <p className={styles.meta}>
          Effective Date: 9 April 2026 &nbsp;·&nbsp; Knytra Streetwear (TM) / Kyraas Jewel Enterprises
        </p>
      </div>

      <div className={styles.content}>

        <div className={styles.callout}>
          We take your privacy seriously. This Policy explains what personal data we collect,
          why we collect it, how we use it, and your rights in relation to it. By using this
          website or placing an order, you consent to this Policy.
        </div>

        {/* 1 */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>1. Who We Are</h2>
          <div className={styles.body}>
            <p>
              The data controller is <strong>Kyraas Jewel Enterprises</strong>, trading as
              Knytra Streetwear (TM), GST No. 07EMLPR1878A1ZS, located at 1/11822, 3rd Floor,
              C-23, Panchsheel Garden, Naveen Shahdara, Delhi – 110032, India.
            </p>
            <p>
              For privacy-related queries, contact us at{" "}
              <a href="mailto:support@knytra.in">support@knytra.in</a>.
            </p>
          </div>
        </section>

        {/* 2 */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>2. Information We Collect</h2>
          <div className={styles.body}>
            <p>We collect the following categories of personal information:</p>
            <ul className={styles.list}>
              <li>
                <strong>Identity &amp; Contact:</strong> Full name, email address, phone number.
              </li>
              <li>
                <strong>Delivery Address:</strong> Street address, city, state, PIN code.
              </li>
              <li>
                <strong>Order &amp; Transaction Data:</strong> Items purchased, price, order
                reference number, payment status. We do <em>not</em> store card numbers, UPI
                IDs, or netbanking credentials — these are processed exclusively by Razorpay.
              </li>
              <li>
                <strong>Account Data:</strong> If you create an account, your email address,
                display name, and order history linked to your account.
              </li>
              <li>
                <strong>Technical Data:</strong> IP address, browser type, operating system,
                referring URLs, and pages viewed, collected automatically via cookies and logs.
              </li>
              <li>
                <strong>Communications:</strong> Any messages, complaints, or feedback you send us.
              </li>
            </ul>
          </div>
        </section>

        {/* 3 */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>3. How We Use Your Information</h2>
          <div className={styles.body}>
            <p>We use your personal information for the following purposes:</p>
            <ul className={styles.list}>
              <li>Processing, fulfilling, and shipping your orders.</li>
              <li>Communicating order confirmations, dispatch updates, and delivery notifications.</li>
              <li>Responding to support queries, complaints, and refund/exchange requests.</li>
              <li>
                Sending marketing communications (only where you have opted in). You may
                unsubscribe at any time using the link in any marketing email.
              </li>
              <li>Detecting and preventing fraud, abuse, and unauthorised transactions.</li>
              <li>Complying with legal obligations under Indian law, including GST reporting.</li>
              <li>
                Improving website performance and user experience through analytics.
              </li>
            </ul>
          </div>
        </section>

        {/* 4 */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>4. Third-Party Services</h2>
          <div className={styles.body}>
            <p>
              We share your data only with trusted third parties who assist us in operating the
              website and fulfilling orders. These include:
            </p>
            <ul className={styles.list}>
              <li>
                <strong>Razorpay</strong> — payment processing. Your payment credentials go
                directly to Razorpay and are governed by{" "}
                <a
                  href="https://razorpay.com/privacy/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Razorpay&apos;s Privacy Policy
                </a>
                .
              </li>
              <li>
                <strong>Qikink</strong> — print-on-demand production and order fulfilment.
                Your name, phone number, and delivery address are shared to enable shipping.
              </li>
              <li>
                <strong>Google Firebase</strong> — cloud database infrastructure and
                authentication. Data is stored in Google&apos;s secure cloud environment.
              </li>
              <li>
                <strong>Courier Partners</strong> — delivery of your order. Your name, address,
                and phone number are shared with the assigned courier company.
              </li>
            </ul>
            <p>
              We do not sell, rent, or trade your personal information to any third party for
              their own marketing purposes.
            </p>
          </div>
        </section>

        {/* 5 */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>5. Cookies</h2>
          <div className={styles.body}>
            <p>
              This website uses cookies — small text files stored on your browser — to maintain
              your session, remember your cart, and analyse site traffic. Essential cookies are
              required for the website to function and cannot be disabled. Analytics and
              preference cookies are optional. You can control cookies through your browser
              settings; however, disabling certain cookies may affect website functionality.
            </p>
          </div>
        </section>

        {/* 6 */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>6. Data Retention</h2>
          <div className={styles.body}>
            <p>
              We retain your personal data for as long as necessary to fulfil the purposes described
              in this Policy, including for legal and regulatory compliance. Specifically:
            </p>
            <ul className={styles.list}>
              <li>
                Order data is retained for a minimum of 7 years to comply with GST and
                accounting regulations.
              </li>
              <li>
                Account data is retained until you request deletion, subject to any outstanding
                legal or financial obligations.
              </li>
              <li>
                Marketing preferences and communications are retained until you withdraw consent.
              </li>
            </ul>
          </div>
        </section>

        {/* 7 */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>7. Your Rights</h2>
          <div className={styles.body}>
            <p>
              Under applicable Indian data protection law, you have the right to:
            </p>
            <ul className={styles.list}>
              <li>Request access to the personal data we hold about you.</li>
              <li>Request correction of inaccurate or incomplete data.</li>
              <li>Request deletion of your data (subject to legal retention requirements).</li>
              <li>Withdraw consent to marketing communications at any time.</li>
            </ul>
            <p>
              To exercise any of these rights, email us at{" "}
              <a href="mailto:support@knytra.in">support@knytra.in</a>. We will respond
              within 30 days. We may require identity verification before actioning your request.
            </p>
          </div>
        </section>

        {/* 8 */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>8. Security</h2>
          <div className={styles.body}>
            <p>
              We implement appropriate technical and organisational measures to protect your personal
              data against unauthorised access, alteration, disclosure, or destruction. All payment
              transactions are encrypted via TLS. However, no method of transmission over the
              internet is 100% secure, and we cannot guarantee absolute security.
            </p>
          </div>
        </section>

        {/* 9 */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>9. Changes to This Policy</h2>
          <div className={styles.body}>
            <p>
              We may update this Privacy Policy from time to time. The updated policy will be
              posted on this page with a revised effective date. Continued use of the website
              after changes constitutes acceptance of the revised Policy.
            </p>
          </div>
        </section>

        {/* 10 */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>10. Governing Law</h2>
          <div className={styles.body}>
            <p>
              This Privacy Policy is governed by the laws of India. Any disputes relating to
              privacy matters shall be subject to the exclusive jurisdiction of the courts in
              New Delhi, India.
            </p>
          </div>
        </section>

      </div>
    </div>
  );
}
