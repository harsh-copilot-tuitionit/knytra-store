import { NextRequest } from "next/server";
import { getAdminDb } from "@/lib/firebase-admin";
import { signGuestToken } from "@/lib/guestToken";

// ── Rate limiter (in-memory, per IP × orderId) ─────────────────────────────
// NOTE: Resets on process restart. Acceptable for basic brute-force protection
// on a single-instance deployment. Add a distributed store (Redis/Upstash) for
// multi-instance setups.
const WINDOW_MS   = 15 * 60 * 1000; // 15 minutes
const MAX_FAILURES = 5;

type Bucket = { fails: number; windowStart: number };
const rateLimitMap = new Map<string, Bucket>();

// Clean up expired entries every 5 minutes to prevent unbounded growth.
setInterval(() => {
  const now = Date.now();
  for (const [key, bucket] of rateLimitMap.entries()) {
    if (now - bucket.windowStart > WINDOW_MS) rateLimitMap.delete(key);
  }
}, 5 * 60 * 1000);

function getIp(req: NextRequest): string {
  return req.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "unknown";
}

function isRateLimited(key: string): boolean {
  const bucket = rateLimitMap.get(key);
  if (!bucket) return false;
  if (Date.now() - bucket.windowStart > WINDOW_MS) {
    rateLimitMap.delete(key);
    return false;
  }
  return bucket.fails >= MAX_FAILURES;
}

function recordFailure(key: string): void {
  const now = Date.now();
  const bucket = rateLimitMap.get(key);
  if (!bucket || now - bucket.windowStart > WINDOW_MS) {
    rateLimitMap.set(key, { fails: 1, windowStart: now });
  } else {
    bucket.fails++;
  }
}

function clearFailures(key: string): void {
  rateLimitMap.delete(key);
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
  const rateLimitKey  = `${ip}:${trimmedId}`;

  if (isRateLimited(rateLimitKey)) {
    // Generic message — don't hint that rate limiting is involved.
    return Response.json({ error: GENERIC_ERROR }, { status: 429 });
  }

  try {
    const db   = getAdminDb();
    const snap = await db.collection("orders").doc(trimmedId).get();

    if (!snap.exists) {
      recordFailure(rateLimitKey);
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
      recordFailure(rateLimitKey);
      return Response.json({ error: GENERIC_ERROR }, { status: 404 });
    }

    // ── Verification passed ────────────────────────────────────────────────
    clearFailures(rateLimitKey);

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
