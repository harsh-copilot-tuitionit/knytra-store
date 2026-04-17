import { readFileSync } from "fs";
import { createRequire } from "module";
import admin from "firebase-admin";

// Load .env.local manually
const envContent = readFileSync(".env.local", "utf-8");
for (const line of envContent.split("\n")) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith("#")) continue;
  const eqIdx = trimmed.indexOf("=");
  if (eqIdx === -1) continue;
  const key = trimmed.slice(0, eqIdx).trim();
  const val = trimmed.slice(eqIdx + 1).trim().replace(/^"|"$/g, "");
  if (!process.env[key]) process.env[key] = val;
}

const privateKey = process.env.FIREBASE_PRIVATE_KEY;
admin.initializeApp({
  credential: admin.credential.cert({
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: privateKey.replace(/\\n/g, "\n"),
  }),
});

const db = admin.firestore();
const snap = await db.collection("careers_jobs").get();
console.log("Total careers_jobs docs:", snap.size);
for (const doc of snap.docs) {
  const d = doc.data();
  console.log({
    id: doc.id,
    title: d.title,
    status: d.status,
    slug: d.slug,
    createdAt: d.createdAt?.toDate?.() ?? d.createdAt,
  });
}
process.exit(0);
