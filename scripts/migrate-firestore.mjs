/**
 * Knytra — Firestore Migration Script
 * 
 * Exports ALL Firestore collections from knytra-85510 to a local JSON,
 * then imports them into knytra-in.
 * 
 * USAGE:
 *   1. Download service account key from:
 *        Firebase Console → knytra-85510 → Project Settings → Service Accounts
 *        → Generate new private key → save as  scripts/sa-old.json
 *
 *   2. Download service account key from:
 *        Firebase Console → knytra-in → Project Settings → Service Accounts
 *        → Generate new private key → save as  scripts/sa-new.json
 *
 *   3. Run:
 *        node scripts/migrate-firestore.mjs
 */

import admin from "firebase-admin";
import { readFileSync, writeFileSync, existsSync } from "fs";
import { createRequire } from "module";

const require = createRequire(import.meta.url);

const EXPORT_FILE = "scripts/firestore-export.json";

// ── Helpers ───────────────────────────────────────────────────────────────────

function initApp(saPath, name) {
  const sa = JSON.parse(readFileSync(saPath, "utf8"));
  return admin.initializeApp(
    { credential: admin.credential.cert(sa) },
    name
  );
}

async function exportAll(db) {
  const result = {};
  const collections = await db.listCollections();
  console.log(`Found ${collections.length} top-level collection(s).`);

  for (const col of collections) {
    console.log(`  Exporting collection: ${col.id}`);
    result[col.id] = {};
    const snap = await col.get();
    for (const docSnap of snap.docs) {
      result[col.id][docSnap.id] = docSnap.data();
      // Recurse into sub-collections (1 level deep)
      const subCols = await docSnap.ref.listCollections();
      if (subCols.length > 0) {
        result[col.id][docSnap.id].__subCollections = {};
        for (const sub of subCols) {
          console.log(`    Exporting sub-collection: ${col.id}/${docSnap.id}/${sub.id}`);
          result[col.id][docSnap.id].__subCollections[sub.id] = {};
          const subSnap = await sub.get();
          for (const subDoc of subSnap.docs) {
            result[col.id][docSnap.id].__subCollections[sub.id][subDoc.id] = subDoc.data();
          }
        }
      }
    }
    console.log(`    → ${snap.size} document(s)`);
  }
  return result;
}

async function importAll(db, data) {
  for (const [colId, docs] of Object.entries(data)) {
    console.log(`  Importing collection: ${colId} (${Object.keys(docs).length} docs)`);
    const batch = db.batch();
    let count = 0;

    for (const [docId, docData] of Object.entries(docs)) {
      const subCollections = docData.__subCollections;
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { __subCollections, ...cleanData } = docData;
      batch.set(db.collection(colId).doc(docId), cleanData);
      count++;

      // Flush batch every 400 writes
      if (count % 400 === 0) {
        await batch.commit();
        console.log(`    Committed ${count} writes...`);
      }

      // Handle sub-collections
      if (subCollections) {
        for (const [subColId, subDocs] of Object.entries(subCollections)) {
          console.log(`    Importing sub-collection: ${colId}/${docId}/${subColId}`);
          const subBatch = db.batch();
          for (const [subDocId, subDocData] of Object.entries(subDocs)) {
            subBatch.set(
              db.collection(colId).doc(docId).collection(subColId).doc(subDocId),
              subDocData
            );
          }
          await subBatch.commit();
        }
      }
    }
    await batch.commit();
    console.log(`  ✓ ${colId} done.`);
  }
}

// ── Main ──────────────────────────────────────────────────────────────────────

const OLD_SA = "scripts/sa-old.json";
const NEW_SA = "scripts/sa-new.json";

if (!existsSync(OLD_SA) || !existsSync(NEW_SA)) {
  console.error(`
ERROR: Service account key files not found.

Please:
  1. Go to Firebase Console → knytra-85510 → Project Settings → Service Accounts
     → Generate new private key → Save as: scripts/sa-old.json

  2. Go to Firebase Console → knytra-in → Project Settings → Service Accounts
     → Generate new private key → Save as: scripts/sa-new.json

Then re-run:  node scripts/migrate-firestore.mjs
`);
  process.exit(1);
}

console.log("\n━━━ PHASE 1: EXPORT from knytra-85510 ━━━\n");
const oldApp = initApp(OLD_SA, "old");
const oldDb = oldApp.firestore();

const exported = await exportAll(oldDb);
writeFileSync(EXPORT_FILE, JSON.stringify(exported, null, 2), "utf8");
console.log(`\n✓ Export saved to ${EXPORT_FILE}`);
console.log(`  Total collections: ${Object.keys(exported).length}`);
Object.entries(exported).forEach(([col, docs]) => {
  console.log(`  - ${col}: ${Object.keys(docs).length} documents`);
});

console.log("\n━━━ PHASE 2: IMPORT to knytra-in ━━━\n");
const newApp = initApp(NEW_SA, "new");
const newDb = newApp.firestore();

await importAll(newDb, exported);
console.log("\n✓ Migration complete!\n");
process.exit(0);
