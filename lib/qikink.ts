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

  // Only attempt: ClientId + client_secret
  const res = await fetch(`${API_BASE}${TOKEN_PATH}`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      ClientId: clientId,
      client_secret: clientSecret,
    }),
  });

  const rawText = await res.text();

  if (!res.ok) {
    console.error("[qikink] Token request failed:", res.status, rawText);
    throw new Error(`Qikink token request failed (${res.status})`);
  }

  let data: Record<string, unknown>;
  try {
    data = rawText ? JSON.parse(rawText) : {};
  } catch {
    throw new Error("Qikink token response was not valid JSON");
  }

  const token = (data.access_token ?? data.Accesstoken ?? data.token) as string | undefined;
  if (!token) {
    throw new Error("Qikink token response did not include access token");
  }

  cachedToken = token;
  tokenExpiresAt = Date.now() + ((data.expires_in as number | undefined) ?? 3600) * 1000;
  console.log("[qikink] Token acquired, expires in", data.expires_in ?? "unknown");
  return cachedToken;
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

    console.log("[qikink] Order payload:", payload);
    const res = await fetch(`${API_BASE}${ORDER_PATH}`, {
      method: "POST",
      headers: {
        ClientId: clientId,
        Accesstoken: token,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const rawText = await res.text();
    let body: unknown = null;
    try {
      body = rawText ? JSON.parse(rawText) : null;
    } catch {
      body = rawText;
    }

    if (!res.ok) {
      console.error("[qikink] Order creation failed:", res.status);
      return {
        success: false,
        qikinkStatus: "failed",
        qikinkResponse: body,
        qikinkError: `HTTP ${res.status}: ${typeof body === "string" ? body : JSON.stringify(body)}`,
      };
    }

    const bodyObj = body !== null && typeof body === "object" ? (body as Record<string, unknown>) : null;
    const qikinkOrderId = bodyObj?.order_id != null
      ? String(bodyObj.order_id)
      : bodyObj?.id != null
        ? String(bodyObj.id)
        : undefined;

    console.log("[qikink] Order created:", qikinkOrderId ?? body);
    return {
      success: true,
      qikinkOrderId,
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
