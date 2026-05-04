/**
 * Quick Qikink sandbox integration test — catalog SKU mode.
 * Usage: node scripts/test-qikink.mjs
 *
 * Reads credentials from .env.local.
 * Uses search_from_my_products: 0 (catalog SKU mode, matching production behavior).
 * Override test values via env vars — see defaults below.
 *
 * Required env vars: QIKINK_CLIENT_ID, QIKINK_CLIENT_SECRET
 * Optional env vars:
 *   QIKINK_API_BASE      — default: https://sandbox.qikink.com
 *   QIKINK_TEST_SKU      — default: MVnHs-Wh-S  (Qikink catalog SKU)
 *   QIKINK_TEST_PRICE    — default: 299
 *   QIKINK_TEST_CITY     — default: Mumbai
 *   QIKINK_TEST_PINCODE  — default: 400001
 *   QIKINK_TEST_STATE    — default: Maharashtra
 *   QIKINK_TEST_PHONE    — default: 9999999999
 *   QIKINK_TEST_EMAIL    — default: test@knytra.com
 */

import { readFileSync } from "fs";

// Parse .env.local manually (no dotenv dep needed)
const envFile = readFileSync(".env.local", "utf-8");
for (const line of envFile.split("\n")) {
  const match = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
  if (match) {
    const val = match[2].replace(/^["']|["']$/g, "");
    if (!process.env[match[1]]) process.env[match[1]] = val;
  }
}

// ── Config ─────────────────────────────────────────────
const API_BASE   = process.env.QIKINK_API_BASE     ?? "https://sandbox.qikink.com";
const CLIENT_ID  = process.env.QIKINK_CLIENT_ID;
const CLIENT_SECRET = process.env.QIKINK_CLIENT_SECRET;

const TEST_SKU   = process.env.QIKINK_TEST_SKU     ?? "MVnHs-Wh-S";
const TEST_PRICE = process.env.QIKINK_TEST_PRICE   ?? "299";
const TEST_CITY  = process.env.QIKINK_TEST_CITY    ?? "Mumbai";
const TEST_ZIP   = process.env.QIKINK_TEST_PINCODE ?? "400001";
const TEST_STATE = process.env.QIKINK_TEST_STATE   ?? "Maharashtra";
const TEST_PHONE = process.env.QIKINK_TEST_PHONE   ?? "9999999999";
const TEST_EMAIL = process.env.QIKINK_TEST_EMAIL   ?? "test@knytra.com";

if (!CLIENT_ID || !CLIENT_SECRET) {
  console.error("❌ Missing QIKINK_CLIENT_ID or QIKINK_CLIENT_SECRET in .env.local");
  process.exit(1);
}

console.log(`🔗 API Base : ${API_BASE}`);
console.log(`🏷  Test SKU : ${TEST_SKU} (search_from_my_products: 0 — catalog SKU mode)`);

// ── Step 1: Get access token from /api/token ──────────
console.log("\n── Step 1: Requesting access token...");

let token = null;

try {
  const tokenRes = await fetch(`${API_BASE}/api/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ ClientId: CLIENT_ID, client_secret: CLIENT_SECRET }),
  });

  const rawText = await tokenRes.text();

  if (!tokenRes.ok) {
    console.error(`❌ Token request failed (${tokenRes.status}):`, rawText.slice(0, 300));
    process.exit(1);
  }

  let tokenData;
  try {
    tokenData = rawText ? JSON.parse(rawText) : {};
  } catch {
    console.error("❌ Token response was not valid JSON:", rawText.slice(0, 300));
    process.exit(1);
  }

  token = tokenData.access_token ?? tokenData.Accesstoken ?? tokenData.token;
  if (!token) {
    console.error("❌ Token response did not include access token:", JSON.stringify(tokenData));
    process.exit(1);
  }

  console.log(`✅ Token obtained (expires in ${tokenData.expires_in ?? "?"}s)`);
} catch (err) {
  console.error("❌ Token request error:", err.message);
  process.exit(1);
}

// ── Step 2: Create a test order (catalog SKU mode) ────
console.log("\n── Step 2: Creating test order...");

const testOrder = {
  order_number: `KT${Date.now().toString(36)}`,
  qikink_shipping: "1",
  gateway: "Prepaid",
  total_order_value: TEST_PRICE,
  line_items: [
    {
      search_from_my_products: 0, // catalog SKU mode — matches production behavior
      quantity: "1",
      price: TEST_PRICE,
      sku: TEST_SKU,
    },
  ],
  shipping_address: {
    first_name: "Test",
    last_name: "User",
    address1: "123 Test Street, Test Area",
    phone: TEST_PHONE,
    email: TEST_EMAIL,
    city: TEST_CITY,
    zip: TEST_ZIP,
    province: TEST_STATE,
    country_code: "IN",
  },
};

// Text-first safe parse — handles plain-text or HTML error responses from sandbox
const orderRes = await fetch(`${API_BASE}/api/order/create`, {
  method: "POST",
  headers: {
    ClientId: CLIENT_ID,
    Accesstoken: token,
    "Content-Type": "application/json",
  },
  body: JSON.stringify(testOrder),
});

const rawOrderText = await orderRes.text();
let orderBody = null;
try {
  orderBody = rawOrderText ? JSON.parse(rawOrderText) : null;
} catch {
  orderBody = rawOrderText; // store raw text on non-JSON response
}

if (!orderRes.ok) {
  console.error(`❌ Order creation failed (${orderRes.status}):`);
  console.error(typeof orderBody === "string" ? orderBody : JSON.stringify(orderBody, null, 2));
  process.exit(1);
}

console.log("✅ Order created successfully!");
console.log(JSON.stringify(orderBody, null, 2));
