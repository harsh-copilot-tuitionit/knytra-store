/**
 * KNYTRA — Customer Auth Utilities
 *
 * Pure functions wrapping Firebase Auth for use across the customer account system.
 * Admin auth is handled separately in app/admin/login/page.tsx.
 */

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  AuthError,
} from "firebase/auth";
import { auth } from "@/lib/firebase";

// ── Error messages ────────────────────────────────────────────────────────────

const AUTH_ERRORS: Record<string, string> = {
  "auth/email-already-in-use":    "An account with this email already exists.",
  "auth/invalid-email":           "Please enter a valid email address.",
  "auth/weak-password":           "Password must be at least 6 characters.",
  "auth/user-not-found":          "No account found with this email.",
  "auth/wrong-password":          "Incorrect password. Please try again.",
  "auth/invalid-credential":      "Incorrect email or password.",
  "auth/too-many-requests":       "Too many attempts. Please wait a moment and try again.",
  "auth/user-disabled":           "This account has been disabled. Contact support@knytra.in.",
  "auth/network-request-failed":  "Network error. Check your connection and try again.",
};

export function getAuthErrorMessage(error: unknown): string {
  const code = (error as AuthError)?.code;
  return AUTH_ERRORS[code] ?? "Something went wrong. Please try again.";
}

// ── signUp ────────────────────────────────────────────────────────────────────

/**
 * Creates a new Firebase Auth user with email/password and sets their display name.
 * Throws with a user-friendly message string on failure.
 */
export async function signUp(
  email: string,
  password: string,
  displayName: string
): Promise<void> {
  try {
    const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);
    await updateProfile(cred.user, { displayName: displayName.trim() });
  } catch (err) {
    throw new Error(getAuthErrorMessage(err));
  }
}

// ── login ─────────────────────────────────────────────────────────────────────

/**
 * Signs in an existing user with email/password.
 * Throws with a user-friendly message string on failure.
 */
export async function login(email: string, password: string): Promise<void> {
  try {
    await signInWithEmailAndPassword(auth, email.trim(), password);
  } catch (err) {
    throw new Error(getAuthErrorMessage(err));
  }
}

// ── logout ────────────────────────────────────────────────────────────────────

/**
 * Signs out the current user.
 * Throws with a user-friendly message string on failure.
 */
export async function logout(): Promise<void> {
  try {
    await signOut(auth);
  } catch (err) {
    throw new Error(getAuthErrorMessage(err));
  }
}
