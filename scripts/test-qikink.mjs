/**
 * Quick Qikink sandbox integration test.
 * Usage: node scripts/test-qikink.mjs
 *
 * Reads credentials from .env.local via dotenv.
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

const API_BASE = process.env.QIKINK_API_BASE ?? "https://sandbox.qikink.com";
const CLIENT_ID = process.env.QIKINK_CLIENT_ID;
const CLIENT_SECRET = process.env.QIKINK_CLIENT_SECRET;

if (!CLIENT_ID || !CLIENT_SECRET) {
  console.error("❌ Missing QIKINK_CLIENT_ID or QIKINK_CLIENT_SECRET in .env.local");
  process.exit(1);
}

console.log(`🔗 API Base: ${API_BASE}`);

// Step 1: Get access token from /api/token
console.log("\n── Step 1: Requesting access token...");

let token = null;
let tokenData = null;

try {
  const tokenRes = await fetch(`${API_BASE}/api/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ ClientId: CLIENT_ID, client_secret: CLIENT_SECRET }),
  });
  const text = await tokenRes.text();
  console.log(`  → ${tokenRes.status}: ${text.slice(0, 300)}`);
  if (tokenRes.ok) {
    tokenData = JSON.parse(text);
    token = tokenData.access_token ?? tokenData.Accesstoken ?? tokenData.token;
    console.log(`\n✅ Token obtained (expires in ${tokenData.expires_in ?? "?"}s)`);
  } else {
    console.error("\n❌ Token request failed.");
    process.exit(1);
  }
} catch (err) {
  console.error("\n❌ Token request error:", err.message);
  process.exit(1);
}

// Step 2: Create a test order
console.log("\n── Step 2: Creating test order...");
const testOrder = {
  order_number: `KT${Date.now().toString(36)}`,
  qikink_shipping: "1",
  gateway: "Prepaid",
  total_order_value: "999",
  line_items: [
    {
      search_from_my_products: 1,
      quantity: "1",
      price: "999",
      sku: "MVnHs-Wh-M", // Qikink SKU — change to a valid one from your dashboard
    },
  ],
  shipping_address: {
    first_name: "Test",
    last_name: "User",
    address1: "123 Test Street, Test Area",
    phone: "9999999999",
    email: "test@knytra.com",
    city: "Mumbai",
    zip: "400001",
    province: "Maharashtra",
    country_code: "IN",
  },
};

const orderRes = await fetch(`${API_BASE}/api/order/create`, {
  method: "POST",
  headers: {
    ClientId: CLIENT_ID,
    Accesstoken: token,
    "Content-Type": "application/json",
  },
  body: JSON.stringify(testOrder),
});

const orderBody = await orderRes.json().catch(() => null);

if (!orderRes.ok) {
  console.error(`❌ Order creation failed (${orderRes.status}):`);
  console.error(JSON.stringify(orderBody, null, 2));
  process.exit(1);
}

console.log("✅ Order created successfully!");
console.log(JSON.stringify(orderBody, null, 2));
