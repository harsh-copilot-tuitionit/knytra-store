import * as admin from "firebase-admin";
import fs from "fs";

if (!admin.apps.length) {
  try {
    const keyPath = process.env.FIREBASE_SERVICE_ACCOUNT_KEY_PATH;
    if (keyPath && fs.existsSync(keyPath)) {
      const serviceAccount = JSON.parse(fs.readFileSync(keyPath, "utf8"));
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
    } else if (process.env.FIREBASE_PRIVATE_KEY && process.env.FIREBASE_CLIENT_EMAIL && process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID) {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
        }),
      });
    } else {
      admin.initializeApp();
    }
    console.log("[Knytra] Firebase Admin SDK Initialized.");
  } catch (error: unknown) {
    console.error("[Knytra] Firebase admin initialization error", error);
  }
}

export const getAdminDb = () => admin.firestore();
export const getAdminAuth = () => admin.auth();
