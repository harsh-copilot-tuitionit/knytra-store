import type { Metadata } from "next";
import styles from "../legal.module.css";

export const metadata: Metadata = {
  title: "Refund & Cancellation Policy — Knytra",
  description: "Knytra's refund, return, exchange, and cancellation policy — please read carefully before purchasing.",
};

export default function RefundsPage() {
  return (
    <div className={styles.page}>
      <div className={styles.hero}>
        <p className={styles.eyebrow}>Legal</p>
        <h1 className={styles.title}>Refund &amp; Cancellation Policy</h1>
        <p className={styles.meta}>
          Effective Date: 9 April 2026 &nbsp;·&nbsp; Knytra Streetwear (TM) / Kyraas Jewel Enterprises
        </p>
      </div>

      <div className={styles.content}>

        <div className={styles.calloutStrong}>
          All Knytra products are manufactured on a print-on-demand basis specifically for each
          order. Please review this policy in full before purchasing. Placing an order constitutes
          your acceptance of these terms.
        </div>

        {/* 1 */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>1. No Refunds — Exchange Only</h2>
          <div className={styles.body}>
            <p>
              We operate a <strong>strict no-refund policy</strong>. Because each product is
              custom-printed on demand at the time of order, we are unable to accept returns for
              a refund under any circumstances except those mandated by applicable law.
            </p>
            <p>
              Knytra does <strong>not</strong> issue refunds to the original payment method, cash
              refunds, or bank transfers as a resolution to order issues. The sole remedy available
              (where eligible) is a like-for-like product exchange or, at our discretion, store
              credit valid for 90 days.
            </p>
          </div>
        </section>

        {/* 2 */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>2. Cancellations</h2>
          <div className={styles.body}>
            <p>
              Orders enter production within <strong>2–4 hours</strong> of placement. Once
              production has begun, orders <strong>cannot be cancelled</strong> under any
              circumstances. If you wish to cancel, you must contact us at{" "}
              <a href="mailto:support@knytra.in">support@knytra.in</a> within 2 hours of
              placing your order. We will make best efforts to halt production, but cannot
              guarantee cancellation.
            </p>
            <p>
              Cancellations accepted before production begins will be refunded in full within
              5–7 business days, minus any applicable payment gateway processing fees (typically
              ~2%).
            </p>
          </div>
        </section>

        {/* 3 */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>3. Exchange Eligibility — Strict Criteria</h2>
          <div className={styles.body}>
            <p>
              An exchange request will be considered <strong>only if all of the following
              conditions</strong> are satisfied simultaneously:
            </p>
            <ol className={styles.listNum}>
              <li>
                You notify us at <a href="mailto:support@knytra.in">support@knytra.in</a> within{" "}
                <strong>48 hours of delivery</strong>. Requests submitted after this window are
                automatically ineligible, with no exceptions.
              </li>
              <li>
                The item is <strong>unworn, unwashed, and unaltered</strong>. Any sign of wear,
                smell of perfume or deodorant, washing, or alteration renders the item ineligible.
              </li>
              <li>
                All <strong>original tags are fully intact and attached</strong> to the product
                exactly as received.
              </li>
              <li>
                The item is returned in its <strong>original packaging</strong> (polybag/mailer),
                sealed appropriately.
              </li>
              <li>
                You provide a <strong>clear unboxing video</strong> and at least three (3)
                high-resolution photographs of the issue within your initial email. Requests
                without visual evidence will not be processed.
              </li>
              <li>
                The item has not been subjected to any foreign substance (water, food, chemicals).
              </li>
              <li>
                The exchange is for the same product in a different size only — style, colour,
                or product changes are not permitted.
              </li>
            </ol>
            <div className={styles.callout}>
              We reserve the right to inspect returned items and reject exchange requests where
              any of the above conditions are not fully met. Our assessment is final.
            </div>
          </div>
        </section>

        {/* 4 */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>4. Items Not Eligible for Exchange</h2>
          <div className={styles.body}>
            <p>
              The following items are categorically excluded from exchange under all circumstances:
            </p>
            <ul className={styles.list}>
              <li>Items purchased during a sale, promotional event, or with a discount code.</li>
              <li>Accessories (caps, bags, socks, phone cases, or any non-apparel items).</li>
              <li>
                Customised or personalised products — including but not limited to items ordered
                with custom text, names, or numbers.
              </li>
              <li>
                Items reported after 48 hours of delivery as confirmed by courier tracking data.
              </li>
              <li>Items that have been washed, worn, altered, or damaged after receipt.</li>
              <li>Items missing original tags or packaging.</li>
              <li>Gift cards.</li>
            </ul>
          </div>
        </section>

        {/* 5 */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>5. Defective or Incorrect Items</h2>
          <div className={styles.body}>
            <p>
              If you receive an item that is defective (e.g., significant print misalignment, torn
              seam, or incorrect item), we will arrange a replacement at no cost, subject to the
              following:
            </p>
            <ul className={styles.list}>
              <li>
                You must report the defect within <strong>48 hours of delivery</strong> with an
                unboxing video and photographs as described in Section 3.
              </li>
              <li>
                Minor variations in print placement (less than 1cm), colour shade, or fabric
                texture within industry-standard tolerances do not constitute defects.
              </li>
              <li>
                Our quality team will review the evidence and respond within 5 business days.
                Our determination of whether an item is defective is final.
              </li>
              <li>
                If a replacement is approved, you must return the defective item (postage
                prepaid by us via a courier label we provide) before the replacement is dispatched.
              </li>
            </ul>
          </div>
        </section>

        {/* 6 */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>6. Return Shipping Costs</h2>
          <div className={styles.body}>
            <p>
              For size-exchange requests (where eligible), <strong>the customer bears the full
              cost of return shipping</strong>. We recommend using a tracked courier service, as
              we accept no liability for items lost or damaged in transit back to us. Shipping
              costs will not be refunded or credited under any circumstances.
            </p>
            <p>
              Replacement/exchange items will be shipped to you at no charge (standard shipping
              only) if the exchange is approved.
            </p>
          </div>
        </section>

        {/* 7 */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>7. Processing Time</h2>
          <div className={styles.body}>
            <p>
              Approved exchanges are processed within <strong>7–10 business days</strong> of our
              receipt of the returned item and confirmation of its condition. Production and
              shipping time is additional (typically 5–7 business days). Total turnaround for
              exchanges may be up to 3 weeks from receipt of the returned item.
            </p>
            <p>
              We will communicate at each stage via the email address provided at checkout.
            </p>
          </div>
        </section>

        {/* 8 */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>8. One Exchange Per Order</h2>
          <div className={styles.body}>
            <p>
              Only <strong>one exchange is permitted per order</strong>. Exchanged items are final
              sale and are not eligible for any further exchange, credit, or refund.
            </p>
          </div>
        </section>

        {/* 9 */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>9. Store Credit</h2>
          <div className={styles.body}>
            <p>
              In exceptional circumstances and entirely at our discretion, we may issue store
              credit in lieu of an exchange (e.g., if the requested size is permanently out of
              stock). Store credit is valid for <strong>90 days</strong> from the date of issue
              and is non-transferable, non-extendable, and has no cash value. Expired store
              credit will not be reissued.
            </p>
          </div>
        </section>

        {/* 10 */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>10. How to Initiate an Exchange Request</h2>
          <div className={styles.body}>
            <ol className={styles.listNum}>
              <li>
                Email <a href="mailto:support@knytra.in">support@knytra.in</a> with
                subject line: <strong>EXCHANGE REQUEST – [Your Order ID]</strong> within 48
                hours of delivery.
              </li>
              <li>
                Include your order number, name, phone number, the reason for exchange, and the
                size you require.
              </li>
              <li>
                Attach your unboxing video and at minimum three photographs clearly showing the
                issue (or the current size tag for size-exchange requests).
              </li>
              <li>
                Our team will respond within 3 business days with a decision. If approved, you
                will receive instructions for returning the item.
              </li>
              <li>
                Ship the item only after receiving written approval. Unsolicited returns will
                not be accepted and will not be returned to sender.
              </li>
            </ol>
          </div>
        </section>

        {/* 11 */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>11. Consumer Rights</h2>
          <div className={styles.body}>
            <p>
              Nothing in this Policy limits or excludes your rights under the Consumer Protection
              Act, 2019, or any other applicable mandatory Indian consumer protection law.
              Where such law provides rights that cannot be contractually excluded, those rights
              continue to apply.
            </p>
          </div>
        </section>

      </div>
    </div>
  );
}
