/**
 * KNYTRA — Shared TypeScript Types
 */

// ── Address ───────────────────────────────────────────────────────────────────

export interface Address {
  id: string;         // uuid generated client-side
  name: string;       // recipient name
  phone: string;      // recipient phone
  pincode: string;    // 6-digit PIN code
  city: string;
  fullAddress: string; // house/flat, street, area
}

// ── User Profile (Firestore: users/{uid}) ─────────────────────────────────────

export interface UserProfile {
  id: string;           // same as Firebase Auth uid
  name: string;
  email: string;
  phone?: string;       // optional primary phone on the account
  addresses: Address[]; // saved delivery addresses (multi-address support)
  createdAt: unknown;   // Firestore Timestamp (unknown keeps it isomorphic)
}

// ── Order item (shared between cart and order documents) ──────────────────────

export interface OrderItem {
  id: string;
  name: string;
  size: string;
  quantity: number;
  price: number;
  image?: string;
}
