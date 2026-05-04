/**
 * Qikink order payload builder
 * Constructs the complete order payload for Qikink API consumption,
 * handling SKU resolution with catalog/legacy fallback.
 */

import {
  QikinkOrderPayload,
  QikinkLineItem,
  QikinkShippingAddress,
} from "./qikink";

interface OrderData {
  items?: Array<{
    qikinkCatalogSku?: string;
    qikinkProductSku?: string;
    quantity?: number;
    price?: number;
  }>;
  user?: {
    name?: string;
    phone?: string;
    email?: string;
  };
  address?: {
    name?: string;
    phone?: string;
    fullAddress?: string;
    city?: string;
    state?: string;
    pincode?: string;
  };
  totalAmount?: number;
  total?: number;
}

/**
 * Builds a Qikink order payload from order data.
 * Throws if required fields are missing or invalid.
 *
 * @param orderId - Firestore order ID (truncated to 15 chars for order_number)
 * @param order - Order data containing items, user, address, and pricing
 * @returns QikinkOrderPayload ready for API submission
 * @throws Error if items, SKU, or shipping address is missing/invalid
 */
export function buildQikinkOrderPayload(
  orderId: string,
  order: OrderData,
): QikinkOrderPayload {
  // ── Validate and extract items ──
  const orderItems = order.items ?? [];
  if (orderItems.length === 0) {
    throw new Error("[qikink-order-builder] Order has no items");
  }

  // ── Validate shipping address ──
  const addr = order.address ?? {};
  if (!addr.fullAddress) {
    throw new Error("[qikink-order-builder] Missing shipping address (fullAddress)");
  }

  // ── Check for missing SKU ──
  const missingSkuItem = orderItems.find(
    (item) => !(item.qikinkCatalogSku ?? item.qikinkProductSku),
  );
  if (missingSkuItem) {
    throw new Error("[qikink-order-builder] Item missing both qikinkCatalogSku and qikinkProductSku");
  }

  // ── Build line items with resolved SKU ──
  const line_items: QikinkLineItem[] = orderItems.map((item) => {
    const sku = item.qikinkCatalogSku ?? item.qikinkProductSku ?? "";
    console.log("[qikink-order-builder] Using catalog SKU:", sku);
    return {
      search_from_my_products: 0 as const,
      quantity: String(item.quantity ?? 1),
      price: String(item.price ?? 0),
      sku,
    };
  });

  // ── Parse name into first/last ──
  const fullName = order.user?.name ?? addr.name ?? "";
  const nameParts = fullName.trim().split(/\s+/);
  const firstName = nameParts[0] ?? "";
  const lastName = nameParts.slice(1).join(" ") || undefined;

  // ── Build shipping address ──
  const shipping_address: QikinkShippingAddress = {
    first_name: firstName,
    last_name: lastName,
    address1: addr.fullAddress ?? "",
    phone: order.user?.phone ?? addr.phone ?? "",
    email: order.user?.email ?? "",
    city: addr.city ?? "",
    zip: addr.pincode ?? "",
    province: addr.state ?? "",
    country_code: "IN",
  };

  // ── Build and return payload ──
  const payload: QikinkOrderPayload = {
    order_number: orderId.slice(0, 15),
    qikink_shipping: "1",
    gateway: "Prepaid",
    total_order_value: String(order.totalAmount ?? order.total ?? 0),
    line_items,
    shipping_address,
  };

  return payload;
}
