import admin from "firebase-admin";
import { readFileSync, existsSync } from "fs";

function loadEnv(filePath) {
  const env = readFileSync(filePath, "utf8");
  for (const line of env.split("\n")) {
    const match = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
    if (!match) continue;
    if (process.env[match[1]]) continue;
    process.env[match[1]] = match[2].replace(/^["']|["']$/g, "");
  }
}

if (existsSync(".env.local")) {
  loadEnv(".env.local");
}

const keyPath = process.env.FIREBASE_SERVICE_ACCOUNT_KEY_PATH ?? "service-account-key.json";
if (!existsSync(keyPath)) {
  console.error(`Missing Firebase service account key: ${keyPath}`);
  process.exit(1);
}

const serviceAccount = JSON.parse(readFileSync(keyPath, "utf8"));
if (!admin.apps.length) {
  admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
}

const db = admin.firestore();

const verifiedVariants = [
  {
    size: "S",
    color: "White",
    sku: "MVnHs-Wh-S",
    qikinkCatalogSku: "MVnHs-Wh-S",
    qikinkProductSku: "MVnHs-Wh-S",
    qikinkPrintTypeId: 1,
    qikinkDesignSku: null,
  },
  {
    size: "M",
    color: "White",
    sku: "MVnHs-Wh-M",
    qikinkCatalogSku: "MVnHs-Wh-M",
    qikinkProductSku: "MVnHs-Wh-M",
    qikinkPrintTypeId: 1,
    qikinkDesignSku: null,
  },
  {
    size: "L",
    color: "White",
    sku: "MVnHs-Wh-L",
    qikinkCatalogSku: "MVnHs-Wh-L",
    qikinkProductSku: "MVnHs-Wh-L",
    qikinkPrintTypeId: 1,
    qikinkDesignSku: null,
  },
  {
    size: "XL",
    color: "White",
    sku: "MVnHs-Wh-XL",
    qikinkCatalogSku: "MVnHs-Wh-XL",
    qikinkProductSku: "MVnHs-Wh-XL",
    qikinkPrintTypeId: 1,
    qikinkDesignSku: null,
  },
  {
    size: "XXL",
    color: "White",
    sku: "MVnHs-Wh-XXL",
    qikinkCatalogSku: "MVnHs-Wh-XXL",
    qikinkProductSku: "MVnHs-Wh-XXL",
    qikinkPrintTypeId: 1,
    qikinkDesignSku: null,
  },
];

const verifiedSizes = verifiedVariants.map((v) => v.size);

const productsSnap = await db.collection("products").get();
if (productsSnap.empty) {
  console.log("No products found in Firestore.");
  process.exit(0);
}

for (const doc of productsSnap.docs) {
  const data = doc.data();
  const currentStatus = String(data.status ?? "");

  if (currentStatus !== "active") {
    console.log(`Skipping ${doc.id} (${data.name ?? "Unnamed"}) - status=${currentStatus}`);
    continue;
  }

  await doc.ref.set(
    {
      variants: verifiedVariants,
      sizes: verifiedSizes,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    },
    { merge: true },
  );

  console.log(`Updated product ${doc.id} (${data.name ?? "Unnamed"}) with ${verifiedVariants.length} verified variants.`);
}
