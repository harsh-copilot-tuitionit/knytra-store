import type { Metadata } from "next";
import styles from "../legal.module.css";

export const metadata: Metadata = {
  title: "Shipping & Delivery Policy — Knytra",
  description: "Knytra's shipping timelines, delivery coverage, and related terms.",
};

export default function ShippingPage() {
  return (
    <div className={styles.page}>
      <div className={styles.hero}>
        <p className={styles.eyebrow}>Legal</p>
        <h1 className={styles.title}>Shipping &amp; Delivery Policy</h1>
        <p className={styles.meta}>
          Effective Date: 9 April 2026 &nbsp;·&nbsp; Knytra Streetwear (TM) / Kyraas Jewel Enterprises
        </p>
      </div>

      <div className={styles.content}>

        <div className={styles.callout}>
          All Knytra products are manufactured on a print-on-demand basis. This means your order
          is created specifically for you after it is placed — please factor this into your
          delivery expectations.
        </div>

        {/* 1 */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>1. Processing Time</h2>
          <div className={styles.body}>
            <p>
              After order placement and payment confirmation, your item enters production within
              2–4 hours. Production (printing, quality check, and packing) typically takes{" "}
              <strong>3–5 business days</strong>. Business days are Monday through Saturday,
              excluding public holidays.
            </p>
            <p>
              Orders placed after 6 PM IST or on Sundays / public holidays will begin processing
              on the next business day.
            </p>
          </div>
        </section>

        {/* 2 */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>2. Delivery Timeline</h2>
          <div className={styles.body}>
            <p>
              Once dispatched, estimated delivery timelines are as follows:
            </p>
            <ul className={styles.list}>
              <li>
                <strong>Metro cities</strong> (Delhi, Mumbai, Bengaluru, Hyderabad, Chennai,
                Kolkata, Ahmedabad, Pune): 2–4 business days after dispatch.
              </li>
              <li>
                <strong>Tier 2 &amp; Tier 3 cities:</strong> 4–7 business days after dispatch.
              </li>
              <li>
                <strong>Remote / rural PIN codes:</strong> 7–12 business days after dispatch.
              </li>
            </ul>
            <p>
              Total estimated time from order placement to delivery:{" "}
              <strong>7–14 business days</strong> depending on location. These are estimates and
              not guaranteed delivery dates.
            </p>
          </div>
        </section>

        {/* 3 */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>3. Shipping Partners &amp; Tracking</h2>
          <div className={styles.body}>
            <p>
              We ship via reputed courier partners including (but not limited to) Delhivery,
              Shiprocket, Blue Dart, and Xpressbees. The courier assigned to your order is
              determined by your PIN code and availability at the time of dispatch.
            </p>
            <p>
              A tracking number and tracking link will be sent to the email address provided at
              checkout within <strong>24 hours of dispatch</strong>. Please check your spam/junk
              folder if you do not receive this notification.
            </p>
          </div>
        </section>

        {/* 4 */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>4. Shipping Charges</h2>
          <div className={styles.body}>
            <p>
              Shipping is currently offered <strong>free of charge</strong> on all orders
              across India, with no minimum order value. We reserve the right to modify this
              at any time; any changes will apply only to orders placed after the change.
            </p>
          </div>
        </section>

        {/* 5 */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>5. Delivery Coverage</h2>
          <div className={styles.body}>
            <p>
              We currently ship <strong>within India only</strong>. International shipping is
              not available at this time. Deliverability to certain remote PIN codes may be
              subject to courier serviceability. If we are unable to service your PIN code, we
              will contact you within 2 business days of order placement and issue a full refund.
            </p>
          </div>
        </section>

        {/* 6 */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>6. Failed Delivery &amp; RTO</h2>
          <div className={styles.body}>
            <p>
              Couriers typically make up to three delivery attempts. If delivery fails after all
              attempts (due to incorrect address, recipient unavailability, or refusal to accept),
              the package is returned to our fulfilment centre (RTO — Return to Origin).
            </p>
            <p>
              In the event of RTO:
            </p>
            <ul className={styles.list}>
              <li>
                We will contact you via email to arrange re-delivery. A re-delivery charge
                of <strong>₹80–₹150</strong> (depending on location) will apply and must be
                paid before re-dispatch.
              </li>
              <li>
                If you do not respond within 7 days of our RTO notification, the order will be
                deemed abandoned. No refund will be issued for abandoned orders.
              </li>
            </ul>
            <p>
              Please ensure your delivery address and phone number are correct at checkout.
              We are not responsible for failed deliveries due to incorrect information provided
              by you.
            </p>
          </div>
        </section>

        {/* 7 */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>7. Address Changes</h2>
          <div className={styles.body}>
            <p>
              Address changes can only be accommodated <strong>before</strong> the order is
              dispatched. Contact us immediately at{" "}
              <a href="mailto:support@knytra.in">support@knytra.in</a> with your order ID.
              Once a package is in transit, the delivery address cannot be changed.
            </p>
          </div>
        </section>

        {/* 8 */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>8. Liability for Courier Delays</h2>
          <div className={styles.body}>
            <p>
              Delivery timelines are estimates and are not guaranteed. Delays can occur due to
              high-volume periods, weather events, courier operational constraints, local
              disturbances, or other circumstances beyond our control. Knytra shall not be liable
              for any loss or inconvenience caused by courier delays. We will, however, assist
              you in tracking and escalating with the courier where possible.
            </p>
          </div>
        </section>

        {/* 9 */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>9. Lost or Damaged Shipments</h2>
          <div className={styles.body}>
            <p>
              If your tracking shows &quot;delivered&quot; but you have not received the package,
              please contact us within <strong>24 hours</strong> of the reported delivery. We will
              raise a courier investigation, which typically takes 5–7 business days to resolve.
            </p>
            <p>
              If an item arrives visibly damaged, please refuse the delivery where possible and
              contact us immediately with photographs of the damaged packaging. Claims for damage
              in transit must be raised within 24 hours of delivery.
            </p>
            <p>
              Please note: we cannot be held responsible for packages shown as delivered that are
              subsequently reported as missing without any evidence of courier misdelivery.
            </p>
          </div>
        </section>

        {/* 10 */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>10. Express &amp; Same-Day Delivery</h2>
          <div className={styles.body}>
            <p>
              We do not currently offer express, same-day, or next-day delivery options. All
              orders are shipped via standard shipping. We do not accept responsibility for
              orders that are needed by a specific date — please plan your purchase accordingly.
            </p>
          </div>
        </section>

      </div>
    </div>
  );
}
