import type { Metadata } from "next";
import styles from "../legal.module.css";

export const metadata: Metadata = {
  title: "Terms of Service — Knytra",
  description: "Terms and conditions governing use of the Knytra website and purchase of Knytra products.",
};

export default function TermsPage() {
  return (
    <div className={styles.page}>
      <div className={styles.hero}>
        <p className={styles.eyebrow}>Legal</p>
        <h1 className={styles.title}>Terms of Service</h1>
        <p className={styles.meta}>
          Effective Date: 9 April 2026 &nbsp;·&nbsp; Knytra Streetwear (TM) / Kyraas Jewel Enterprises
        </p>
      </div>

      <div className={styles.content}>

        <div className={styles.callout}>
          Please read these Terms of Service carefully before using this website or placing an order.
          By accessing knytra.in or completing a purchase, you agree to be bound by these terms in full.
          If you do not agree, please do not use this website.
        </div>

        {/* 1 */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>1. About Us</h2>
          <div className={styles.body}>
            <p>
              This website is operated by <strong>Kyraas Jewel Enterprises</strong>, trading as{" "}
              <strong>Knytra Streetwear (TM)</strong>, registered under GST no.{" "}
              <strong>07EMLPR1878A1ZS</strong>, with its registered office at 1/11822, 3rd Floor,
              C-23, Panchsheel Garden, Naveen Shahdara, Delhi – 110032, India. The brand
              &quot;Knytra&quot; and &quot;Knytra Streetwear&quot; are proprietary trade marks of Kyraas Jewel
              Enterprises.
            </p>
            <p>
              References to &quot;we&quot;, &quot;us&quot;, or &quot;our&quot; throughout these Terms refer to
              Kyraas Jewel Enterprises. References to &quot;you&quot; refer to the person accessing or using
              this website.
            </p>
          </div>
        </section>

        {/* 2 */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>2. Eligibility</h2>
          <div className={styles.body}>
            <p>
              You must be at least 18 years of age to place an order or use this website. By using
              this site you represent and warrant that you meet this age requirement. We reserve the
              right to refuse orders from persons we reasonably believe to be under 18.
            </p>
          </div>
        </section>

        {/* 3 */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>3. Products &amp; Pricing</h2>
          <div className={styles.body}>
            <p>
              All products are manufactured on a print-on-demand basis and may differ slightly from
              product images due to monitor calibration, lighting, and the nature of fabric printing.
              Colours, textures, and placement may vary within industry-standard tolerances and shall
              not constitute grounds for a return or refund unless the variation is materially
              significant.
            </p>
            <p>
              Prices on this website are listed in Indian Rupees (INR) and are inclusive of applicable
              taxes unless stated otherwise. We reserve the right to change prices at any time without
              prior notice. The price applicable to your order is the price displayed at the time you
              complete checkout.
            </p>
            <p>
              In the event of an obvious pricing error, we reserve the right to cancel the order and
              issue a full refund, even after an order confirmation has been sent. We will notify you
              promptly in such cases.
            </p>
          </div>
        </section>

        {/* 4 */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>4. Order Acceptance</h2>
          <div className={styles.body}>
            <p>
              Completing the checkout process and receiving an order confirmation does not constitute
              our acceptance of your order. Acceptance occurs only when your order has been dispatched.
              We reserve the right to refuse or cancel any order at our sole discretion, including but
              not limited to situations involving suspected fraud, abusive behaviour,
              ineligible delivery locations, or stock/production errors.
            </p>
            <p>
              You will receive an email confirmation when your order is placed and a separate
              dispatch notification. Please ensure your contact details are accurate at checkout — we
              are not liable for failed deliveries due to incorrect information provided by you.
            </p>
          </div>
        </section>

        {/* 5 */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>5. Payment</h2>
          <div className={styles.body}>
            <p>
              All payments are processed securely through <strong>Razorpay</strong>, a PCI-DSS
              compliant payment gateway. We do not store any credit/debit card or netbanking
              credentials on our servers. By placing an order, you authorise us to charge the total
              order amount to your selected payment method.
            </p>
            <p>
              In the event of a payment dispute, you must contact us at{" "}
              <a href="mailto:support@knytra.in">support@knytra.in</a> before initiating a
              chargeback with your bank. Chargebacks raised without prior communication may result in
              your account being permanently suspended and the matter referred for legal recovery.
            </p>
          </div>
        </section>

        {/* 6 */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>6. Intellectual Property</h2>
          <div className={styles.body}>
            <p>
              All content on this website — including but not limited to text, graphics, logos,
              product designs, images, and software — is the exclusive intellectual property of
              Kyraas Jewel Enterprises or its licensors and is protected under applicable Indian and
              international intellectual property laws. "Knytra" and "Knytra Streetwear" are trade
              marks of Kyraas Jewel Enterprises. Unauthorised reproduction or use of any content or
              trade mark is strictly prohibited.
            </p>
          </div>
        </section>

        {/* 7 */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>7. Limitation of Liability</h2>
          <div className={styles.body}>
            <p>
              To the maximum extent permitted by applicable law, Kyraas Jewel Enterprises shall not
              be liable for any indirect, incidental, special, consequential, or punitive damages
              arising out of or relating to your use of this website or the products purchased. Our
              total aggregate liability in connection with any order shall not exceed the amount paid
              by you for that specific order.
            </p>
          </div>
        </section>

        {/* 8 */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>8. Governing Law &amp; Dispute Resolution</h2>
          <div className={styles.body}>
            <p>
              These Terms shall be governed by and construed in accordance with the laws of India.
              Any disputes arising out of or in connection with these Terms or your use of this
              website shall be subject to the exclusive jurisdiction of the courts in{" "}
              <strong>New Delhi, India</strong>.
            </p>
            <p>
              Before initiating legal proceedings, the parties agree to attempt to resolve disputes
              through good-faith negotiation. Written notice of the dispute must be sent to{" "}
              <a href="mailto:support@knytra.in">support@knytra.in</a>. If unresolved within 30 days
              of notice, either party may pursue formal legal remedies.
            </p>
          </div>
        </section>

        {/* 9 */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>9. Changes to These Terms</h2>
          <div className={styles.body}>
            <p>
              We reserve the right to modify these Terms at any time. Changes will be effective
              immediately upon posting to this page with an updated effective date. Continued use of
              the website after changes constitutes your acceptance of the revised Terms.
            </p>
          </div>
        </section>

        {/* 10 */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>10. Contact</h2>
          <div className={styles.body}>
            <p>
              For any questions regarding these Terms, please contact:{" "}
              <a href="mailto:support@knytra.in">support@knytra.in</a>
            </p>
            <p>
              Kyraas Jewel Enterprises, 1/11822, 3rd Floor, C-23, Panchsheel Garden,
              Naveen Shahdara, Delhi – 110032.
            </p>
          </div>
        </section>

      </div>
    </div>
  );
}
