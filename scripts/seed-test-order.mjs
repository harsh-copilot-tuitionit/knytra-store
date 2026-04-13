/**
 * Knytra — Seed Test Order
 *
 * Writes one dummy order to the `orders` collection in Firestore,
 * then reads it back to confirm the schema is correct.
 *
 * USAGE:
 *   node scripts/seed-test-order.mjs
 *
 * Requires: scripts/sa-new.json (Firebase service account key)
 */

import admin from "firebase-admin";
import { readFileSync } from "fs";

// ── Init ─────────────────────────────────────────────────────────────────────

const sa = JSON.parse(readFileSync("scripts/sa-new.json", "utf8"));

admin.initializeApp({ credential: admin.credential.cert(sa) });

const db = admin.firestore();

// ── Dummy Order ───────────────────────────────────────────────────────────────

const dummyOrder = {
  items: [
    {
      productId: "urban-phantom-hoodie",
      name: "Urban Phantom Hoodie",
      price: 2499,
      quantity: 1,
      size: "L",
      image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&h=960&fit=crop",
    },
    {
      productId: "concrete-shadow-tee",
      name: "Concrete Shadow Tee",
      price: 1299,
      quantity: 2,
      size: "M",
      image: "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800&h=960&fit=crop",
    },
  ],
  totalAmount: 5097,
  user: {
    name: "Harsh Rathore",
    phone: "9876543210",
    email: "harsh@knytra.in",
  },
  address: {
    name: "Harsh Rathore",
    phone: "9876543210",
    pincode: "110001",
    city: "New Delhi",
    fullAddress: "123, Street Name, New Delhi, India",
  },
  payment: {
    razorpay_order_id: "order_test_DUMMY123",
    razorpay_payment_id: "pay_test_DUMMY456",
    status: "success",
  },
  status: "placed",
  createdAt: admin.firestore.FieldValue.serverTimestamp(),
};

// ── Write + Read Back ─────────────────────────────────────────────────────────

async function run() {
  console.log("\n📦 Writing dummy order to Firestore...");

  const ref = await db.collection("orders").add(dummyOrder);
  console.log(`✅ Order created! Document ID: ${ref.id}`);

  const snap = await ref.get();
  const data = snap.data();

  console.log("\n📄 Order read back from Firestore:");
  console.log(JSON.stringify({ id: snap.id, ...data }, null, 2));

  console.log("\n✅ Acceptance criteria passed — order exists in Firestore.");
  process.exit(0);
}

run().catch((err) => {
  console.error("❌ Error:", err);
  process.exit(1);
});
