import * as admin from "firebase-admin";

if (!admin.apps.length) {
  try {
    const privateKey = process.env.FIREBASE_PRIVATE_KEY;
    if (privateKey) {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: privateKey.replace(/\\n/g, "\n"),
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
