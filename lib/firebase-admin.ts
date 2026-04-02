import * as admin from "firebase-admin";

if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        // Replace escaped newline characters from process.env string
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
      }),
    });
    console.log("[Knytra] Firebase Admin SDK Initialized Successfully.");
  } catch (error: any) {
    console.error("[Knytra] Firebase admin initialization error", error.stack);
  }
}

// Export lazy getters to avoid top-level evaluation during Vercel builds
export const getAdminDb = () => admin.firestore();
export const getAdminAuth = () => admin.auth();
