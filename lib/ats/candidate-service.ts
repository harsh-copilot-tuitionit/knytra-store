import * as admin from "firebase-admin";
import { getAdminDb } from "@/lib/firebase-admin";
import type { CareerCandidate } from "@/lib/types/careers";

export async function getCandidateByEmail(
  email: string,
): Promise<CareerCandidate | null> {
  const db = getAdminDb();
  const lower = email.trim().toLowerCase();
  const snap = await db
    .collection("careers_candidates")
    .where("email", "==", lower)
    .limit(1)
    .get();

  if (snap.empty) return null;
  const doc = snap.docs[0];
  const d = doc.data();
  return {
    id: doc.id,
    fullName: d.fullName ?? "",
    email: d.email ?? "",
    phone: d.phone ?? "",
    city: d.city ?? "",
    applicationsCount: d.applicationsCount ?? 0,
    lastApplicationAt: d.lastApplicationAt?.toDate?.()?.toISOString() ?? null,
    createdAt: d.createdAt?.toDate?.()?.toISOString() ?? null,
    updatedAt: d.updatedAt?.toDate?.()?.toISOString() ?? null,
  };
}

export async function getCandidateById(
  id: string,
): Promise<CareerCandidate | null> {
  const db = getAdminDb();
  const snap = await db.collection("careers_candidates").doc(id).get();
  if (!snap.exists) return null;
  const d = snap.data() ?? {};
  return {
    id: snap.id,
    fullName: d.fullName ?? "",
    email: d.email ?? "",
    phone: d.phone ?? "",
    city: d.city ?? "",
    applicationsCount: d.applicationsCount ?? 0,
    lastApplicationAt: d.lastApplicationAt?.toDate?.()?.toISOString() ?? null,
    createdAt: d.createdAt?.toDate?.()?.toISOString() ?? null,
    updatedAt: d.updatedAt?.toDate?.()?.toISOString() ?? null,
  };
}

export async function createOrUpdateCandidate(
  partial: {
    fullName: string;
    email: string;
    phone: string;
    city: string;
  },
): Promise<CareerCandidate> {
  const db = getAdminDb();
  const lower = partial.email.trim().toLowerCase();
  const now = admin.firestore.FieldValue.serverTimestamp();
  const snap = await db
    .collection("careers_candidates")
    .where("email", "==", lower)
    .limit(1)
    .get();

  if (!snap.empty) {
    const doc = snap.docs[0];
    const values = {
      fullName: partial.fullName.trim(),
      phone: partial.phone.replace(/\D/g, "").slice(-10),
      city: partial.city.trim(),
      updatedAt: now,
    };
    await db.collection("careers_candidates").doc(doc.id).update(values);
    return {
      id: doc.id,
      fullName: values.fullName,
      email: lower,
      phone: values.phone,
      city: values.city,
      applicationsCount: doc.data().applicationsCount ?? 0,
      lastApplicationAt:
        doc.data().lastApplicationAt?.toDate?.()?.toISOString() ?? null,
      createdAt: doc.data().createdAt?.toDate?.()?.toISOString() ?? null,
      updatedAt: new Date().toISOString(),
    };
  }

  const docRef = await db.collection("careers_candidates").add({
    fullName: partial.fullName.trim(),
    email: lower,
    phone: partial.phone.replace(/\D/g, "").slice(-10),
    city: partial.city.trim(),
    applicationsCount: 0,
    lastApplicationAt: null,
    createdAt: now,
    updatedAt: now,
  });

  return {
    id: docRef.id,
    fullName: partial.fullName.trim(),
    email: lower,
    phone: partial.phone.replace(/\D/g, "").slice(-10),
    city: partial.city.trim(),
    applicationsCount: 0,
    lastApplicationAt: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}
