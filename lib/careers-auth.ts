/**
 * KNYTRA — Careers Admin Authentication
 *
 * UID-based one-time password system for recruitment dashboard access.
 * Uses PBKDF2 for password hashing and HMAC-SHA256 for session tokens.
 */

import crypto from "crypto";

const ITERATIONS = 100_000;
const KEY_LENGTH = 64;
const DIGEST = "sha512";
const SESSION_MAX_AGE = 24 * 60 * 60 * 1000; // 24 hours

export const SESSION_COOKIE_NAME = "knytra_careers_session";

export function generateSalt(): string {
  return crypto.randomBytes(32).toString("hex");
}

export function hashPassword(password: string, salt: string): string {
  return crypto
    .pbkdf2Sync(password, salt, ITERATIONS, KEY_LENGTH, DIGEST)
    .toString("hex");
}

export function verifyPassword(
  password: string,
  salt: string,
  hash: string,
): boolean {
  const computed = hashPassword(password, salt);
  try {
    return crypto.timingSafeEqual(
      Buffer.from(computed, "hex"),
      Buffer.from(hash, "hex"),
    );
  } catch {
    return false;
  }
}

export function createSessionToken(uid: string): string {
  const secret = process.env.CAREERS_ADMIN_SECRET;
  if (!secret) throw new Error("CAREERS_ADMIN_SECRET is not configured");

  const timestamp = Date.now().toString();
  const payload = `${uid}.${timestamp}`;
  const signature = crypto
    .createHmac("sha256", secret)
    .update(payload)
    .digest("hex");
  return `${payload}.${signature}`;
}

export function verifySessionToken(
  token: string,
): { uid: string; timestamp: number } | null {
  const secret = process.env.CAREERS_ADMIN_SECRET;
  if (!secret) return null;

  const parts = token.split(".");
  if (parts.length !== 3) return null;

  const [uid, timestamp, signature] = parts;
  if (!uid || !timestamp || !signature) return null;

  const expected = crypto
    .createHmac("sha256", secret)
    .update(`${uid}.${timestamp}`)
    .digest("hex");

  try {
    if (
      !crypto.timingSafeEqual(
        Buffer.from(signature, "hex"),
        Buffer.from(expected, "hex"),
      )
    )
      return null;
  } catch {
    return null;
  }

  const ts = parseInt(timestamp, 10);
  if (isNaN(ts) || Date.now() - ts > SESSION_MAX_AGE) return null;

  return { uid, timestamp: ts };
}

/** Shared helper: read + verify session from a NextRequest cookie */
export function getSessionFromRequest(
  cookies: { get: (name: string) => { value: string } | undefined },
): { uid: string; timestamp: number } | null {
  const token = cookies.get(SESSION_COOKIE_NAME)?.value;
  if (!token) return null;
  return verifySessionToken(token);
}

export function sessionCookieHeader(
  token: string,
  maxAge = 86_400,
): string {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  return `${SESSION_COOKIE_NAME}=${token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${maxAge}${secure}`;
}
