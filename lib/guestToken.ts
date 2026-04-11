/**
 * Guest Order Token — HMAC-SHA256 signed, 1-hour TTL.
 *
 * Used to prove that a visitor has successfully verified ownership of a guest
 * order (userId == null) via /api/track-order before being allowed to view
 * the full order details at /orders/[id].
 *
 * Token format: orderId|expiry|hmac-hex
 *
 * Required env var:
 *   TRACK_ORDER_SECRET — run the following to generate a value:
 *   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
 */

import { createHmac, timingSafeEqual } from "crypto";

const TOKEN_TTL_S = 3600; // 1 hour

function getSecret(): Buffer {
  const secret = process.env.TRACK_ORDER_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV === "production") {
      throw new Error(
        "[guestToken] TRACK_ORDER_SECRET is not set. " +
        "Generate one with: node -e \"console.log(require('crypto').randomBytes(32).toString('hex'))\" " +
        "and add it to your environment variables."
      );
    }
    console.warn(
      "[guestToken] TRACK_ORDER_SECRET is not set. Using dev fallback. " +
      "This MUST be set in production."
    );
    return Buffer.from("knytra-dev-fallback-secret-not-for-production");
  }
  return Buffer.from(secret);
}

/**
 * Sign a guest token for a given orderId.
 * Returns a string safe for use as a cookie value.
 */
export function signGuestToken(orderId: string): string {
  const expiry = Math.floor(Date.now() / 1000) + TOKEN_TTL_S;
  const payload = `${orderId}|${expiry}`;
  const mac = createHmac("sha256", getSecret()).update(payload).digest("hex");
  return `${payload}|${mac}`;
}

/**
 * Verify a guest token against an expected orderId.
 * Returns true only if the token:
 *   - Was issued for exactly this orderId
 *   - Has not expired
 *   - Has a valid HMAC signature (timing-safe comparison)
 */
export function verifyGuestToken(orderId: string, token: string): boolean {
  try {
    const parts = token.split("|");
    if (parts.length !== 3) return false;

    const [tokenOrderId, expiryStr, mac] = parts;
    if (tokenOrderId !== orderId) return false;

    const expiry = parseInt(expiryStr, 10);
    if (Number.isNaN(expiry) || Math.floor(Date.now() / 1000) > expiry) return false;

    const payload = `${tokenOrderId}|${expiryStr}`;
    const expected = createHmac("sha256", getSecret()).update(payload).digest("hex");

    // HMAC-SHA256 always produces 64 hex chars — reject anything else immediately
    if (mac.length !== expected.length) return false;

    return timingSafeEqual(Buffer.from(mac, "hex"), Buffer.from(expected, "hex"));
  } catch {
    return false;
  }
}
