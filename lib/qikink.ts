/**
 * Qikink print-on-demand order integration.
 *
 * Auth: POST /api/token (form-encoded) → Accesstoken header on subsequent calls.
 * Order creation: POST /api/order/create with ClientId + Accesstoken headers.
 * Env vars: QIKINK_CLIENT_ID, QIKINK_CLIENT_SECRET, QIKINK_API_BASE
 */

const API_BASE = process.env.QIKINK_API_BASE ?? "https://api.qikink.com";
const TOKEN_PATH = "/api/token";
const ORDER_PATH = "/api/order/create";

// ── Types ──────────────────────────────────────────────

export interface QikinkDesign {
  design_code: string;
  width_inches: string;
  height_inches: string;
  placement_sku: string; // "fr" | "bk" | "lp" | "rp" | "rs" | "ls"
  design_link: string;
  mockup_link: string;
}

export interface QikinkLineItem {
  search_from_my_products: 0 | 1;
  quantity: string;
  price: string;
  sku: string;
  print_type_id?: number; // required if search_from_my_products is 0
  designs?: QikinkDesign[]; // required if search_from_my_products is 0
}

export interface QikinkShippingAddress {
  first_name: string;
  last_name?: string;
  address1: string;
  address2?: string;
  phone: string;
  email: string;
  city: string;
  zip: string;
  province: string;
  country_code: string;
}

export interface QikinkOrderPayload {
  order_number: string;
  qikink_shipping: "0" | "1";
  gateway: "COD" | "Prepaid";
  total_order_value: string;
  line_items: QikinkLineItem[];
  shipping_address: QikinkShippingAddress;
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
  if (cachedToken && Date.now() < tokenExpiresAt - 60_000) {
    return cachedToken;
  }

  const clientId = process.env.QIKINK_CLIENT_ID;
  const clientSecret = process.env.QIKINK_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error("Missing QIKINK_CLIENT_ID or QIKINK_CLIENT_SECRET");
  }

  // Attempt A: ClientId + client_secret
  console.log("QIKINK TOKEN ATTEMPT A");
  let res = await fetch(`${API_BASE}${TOKEN_PATH}`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      ClientId: clientId,
      client_secret: clientSecret,
    }),
  });
  let text = await res.text();
  console.log("QIKINK TOKEN ATTEMPT A status:", res.status);
  console.log("QIKINK TOKEN ATTEMPT A body:", text);
  if (res.ok) {
    const data = JSON.parse(text);
    cachedToken = data.access_token ?? data.Accesstoken;
    tokenExpiresAt = Date.now() + (data.expires_in ?? 3600) * 1000;
    return cachedToken!;
  }

  // Attempt B: client_id + client_secret
  console.log("QIKINK TOKEN ATTEMPT B");
  res = await fetch(`${API_BASE}${TOKEN_PATH}`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
    }),
  });
  text = await res.text();
  console.log("QIKINK TOKEN ATTEMPT B status:", res.status);
  console.log("QIKINK TOKEN ATTEMPT B body:", text);
  if (res.ok) {
    const data = JSON.parse(text);
    cachedToken = data.access_token ?? data.Accesstoken;
    tokenExpiresAt = Date.now() + (data.expires_in ?? 3600) * 1000;
    return cachedToken!;
  }

  throw new Error(`Qikink token request failed (A:${res.status}, B:${res.status}): see logs above for details`);
}

// ── Create order ───────────────────────────────────────

export async function createQikinkOrder(
  payload: QikinkOrderPayload,
): Promise<QikinkResult> {
  try {
    const token = await getAccessToken();
    const clientId = process.env.QIKINK_CLIENT_ID;

    if (!clientId) {
      throw new Error("Missing QIKINK_CLIENT_ID");
    }

    const res = await fetch(`${API_BASE}${ORDER_PATH}`, {
      method: "POST",
      headers: {
        ClientId: clientId,
        Accesstoken: token,
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
      qikinkOrderId: body?.order_id?.toString() ?? undefined,
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
