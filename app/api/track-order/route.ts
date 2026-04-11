import { NextRequest } from "next/server";
import { getAdminDb } from "@/lib/firebase-admin";
import { signGuestToken } from "@/lib/guestToken";
import { Timestamp } from "firebase-admin/firestore";

// ── Rate limiter config ────────────────────────────────────────────────────
const WINDOW_S    = 15 * 60; // 15 minutes in seconds
const MAX_FAILURES = 5;
const ATTEMPTS_COLLECTION = "track_order_attempts";

function getIp(req: NextRequest): string {
  return req.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "unknown";
}

/**
 * Check and increment the failure counter for a given key.
 * Uses a Firestore document (ATTEMPTS_COLLECTION/{key}) so rate limiting
 * persists across all serverless instances.
 *
 * Returns true if the request should be blocked (>= MAX_FAILURES in window).
 * Throws on unexpected Firestore errors.
 */
async function checkAndIncrementFailure(key: string): Promise<boolean> {
  const db  = getAdminDb();
  const ref = db.collection(ATTEMPTS_COLLECTION).doc(key);

  return db.runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    const now  = Timestamp.now();

    if (!snap.exists) {
      tx.set(ref, { attempts: 1, lastAttemptAt: now });
      return false; // first attempt — allow
    }

    const data            = snap.data()!;
    const lastAttemptAt   = (data.lastAttemptAt as Timestamp).seconds;
    const windowExpiredAt = lastAttemptAt + WINDOW_S;
    const nowSeconds      = now.seconds;

    if (nowSeconds > windowExpiredAt) {
      // Window expired — reset counter
      tx.set(ref, { attempts: 1, lastAttemptAt: now });
      return false;
    }

    const newAttempts = (data.attempts as number) + 1;
    tx.update(ref, { attempts: newAttempts, lastAttemptAt: now });
    return newAttempts > MAX_FAILURES;
  });
}

/** Delete the rate-limit document on successful verification. */
async function clearFailures(key: string): Promise<void> {
  const db = getAdminDb();
  await db.collection(ATTEMPTS_COLLECTION).doc(key).delete();
}

// ── Helpers ────────────────────────────────────────────────────────────────

/** Strip spaces, dashes, parentheses, and leading +91 / 91 country codes. */
function normalisePhone(raw: string): string {
  return raw.replace(/[\s\-().]/g, "").replace(/^\+91/, "").replace(/^91(\d{10})$/, "$1");
}

// All failures return the same generic message to prevent enumeration.
const GENERIC_ERROR = "Invalid details.";

// ── Route handler ──────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  let body: { orderId?: string; contact?: string };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid request." }, { status: 400 });
  }

  const { orderId, contact } = body;

  if (!orderId || !contact) {
    return Response.json(
      { error: "Order ID and phone or email are required." },
      { status: 400 }
    );
  }

  const trimmedId      = orderId.trim();
  const trimmedContact = contact.trim();

  // Length guards
  if (trimmedId.length > 64 || trimmedContact.length > 256) {
    return Response.json({ error: "Invalid input." }, { status: 400 });
  }

  // Firestore auto-IDs are alphanumeric — reject anything else to guard the
  // cookie name and prevent path-traversal in the Set-Cookie Path attribute.
  if (!/^[a-zA-Z0-9]+$/.test(trimmedId)) {
    return Response.json({ error: GENERIC_ERROR }, { status: 404 });
  }

  const ip            = getIp(request);
  // Underscore separator — safe as a Firestore document ID (no slashes)
  const rateLimitKey  = `${ip}_${trimmedId}`;

  try {
    const db   = getAdminDb();

    // ── Fetch order + rate-limit check in parallel ─────────────────────────
    const [blocked, snap] = await Promise.all([
      checkAndIncrementFailure(rateLimitKey),
      db.collection("orders").doc(trimmedId).get(),
    ]);

    if (blocked) {
      return Response.json({ error: GENERIC_ERROR }, { status: 429 });
    }

    if (!snap.exists) {
      return Response.json({ error: GENERIC_ERROR }, { status: 404 });
    }

    const d       = snap.data()!;
    const isEmail = trimmedContact.includes("@");
    let verified  = false;

    if (isEmail) {
      // Email comparison is case-insensitive
      const storedEmail: string = d.user?.email ?? "";
      verified = storedEmail.toLowerCase() === trimmedContact.toLowerCase();
    } else {
      // Phone: normalise both sides before comparing
      const storedPhone: string = d.user?.phone ?? d.address?.phone ?? "";
      verified = normalisePhone(storedPhone) === normalisePhone(trimmedContact);
    }

    if (!verified) {
      // Counter was already incremented above; no second call needed.
      return Response.json({ error: GENERIC_ERROR }, { status: 404 });
    }

    // ── Verification passed ────────────────────────────────────────────────
    await clearFailures(rateLimitKey);

    const token      = signGuestToken(trimmedId);
    const cookieName = `gto_${trimmedId}`;
    const isProduction = process.env.NODE_ENV === "production";

    const cookieDirectives = [
      `${cookieName}=${token}`,
      `Path=/orders/${trimmedId}`,
      `Max-Age=${60 * 60}`, // 1 hour
      "HttpOnly",
      "SameSite=Strict",
      ...(isProduction ? ["Secure"] : []),
    ].join("; ");

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Set-Cookie": cookieDirectives,
      },
    });
  } catch (error: unknown) {
    console.error("[track-order] Error:", error);
    return Response.json({ error: "Failed to process request." }, { status: 500 });
  }
}
