/**
 * Qikink print-on-demand order integration.
 *
 * Auth: OAuth2 client-credentials → Bearer token.
 * Env vars: QIKINK_CLIENT_ID, QIKINK_CLIENT_SECRET, QIKINK_API_BASE
 *
 * Adjust TOKEN_PATH / ORDER_PATH if Qikink changes their API routes.
 */

const API_BASE = process.env.QIKINK_API_BASE ?? "https://api.qikink.com";
const TOKEN_PATH = "/token";
const ORDER_PATH = "/api/v1/orders";

// ── Types ──────────────────────────────────────────────

export interface QikinkOrderItem {
  product_name: string;
  variant: string; // size
  quantity: number;
}

export interface QikinkOrderPayload {
  order_id: string; // our Firestore order id
  customer_name: string;
  email: string;
  phone: string;
  shipping_address: {
    address_line1: string;
    city: string;
    state: string;
    pincode: string;
    country: string;
  };
  items: QikinkOrderItem[];
}

export interface QikinkResult {
  success: boolean;
  qikinkOrderId?: string;
  qikinkStatus: "created" | "failed";
  qikinkResponse?: unknown;
  qikinkError?: string;
}

// ── Token cache (in-memory, per cold-start) ────────────

let cachedToken: string | null = null;
let tokenExpiresAt = 0;

async function getAccessToken(): Promise<string> {
  // Return cached token if still valid (with 60s buffer)
  if (cachedToken && Date.now() < tokenExpiresAt - 60_000) {
    return cachedToken;
  }

  const clientId = process.env.QIKINK_CLIENT_ID;
  const clientSecret = process.env.QIKINK_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error("Missing QIKINK_CLIENT_ID or QIKINK_CLIENT_SECRET");
  }

  const res = await fetch(`${API_BASE}${TOKEN_PATH}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: "client_credentials",
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Qikink token request failed (${res.status}): ${text}`);
  }

  const data = await res.json();
  cachedToken = data.access_token;
  // Default 1-hour expiry if not provided
  tokenExpiresAt = Date.now() + (data.expires_in ?? 3600) * 1000;
  return cachedToken!;
}

// ── Create order ───────────────────────────────────────

export async function createQikinkOrder(
  payload: QikinkOrderPayload,
): Promise<QikinkResult> {
  try {
    const token = await getAccessToken();

    const res = await fetch(`${API_BASE}${ORDER_PATH}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const body = await res.json().catch(() => null);

    if (!res.ok) {
      console.error("[qikink] Order creation failed:", res.status, body);
      return {
        success: false,
        qikinkStatus: "failed",
        qikinkResponse: body,
        qikinkError: `HTTP ${res.status}: ${JSON.stringify(body)}`,
      };
    }

    console.log("[qikink] Order created:", body);
    return {
      success: true,
      qikinkOrderId: body?.order_id ?? body?.id ?? undefined,
      qikinkStatus: "created",
      qikinkResponse: body,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[qikink] Exception:", message);
    return {
      success: false,
      qikinkStatus: "failed",
      qikinkError: message,
    };
  }
}
