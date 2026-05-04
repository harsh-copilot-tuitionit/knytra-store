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
  items?: OrderItem[];
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

interface OrderItem {
  qikinkCatalogSku?: string;
  qikinkProductSku?: string;
  name?: string;
  productId?: string;
  size?: string;
  quantity?: number;
  price?: number;
}

/**
 * Helper to build a human-readable item label for error messages.
 */
function getItemLabel(item: OrderItem): string {
  const parts = [];
  if (item.name) parts.push(item.name);
  if (item.size) parts.push(item.size);
  return parts.length > 0 ? parts.join(" / ") : "Unknown item";
}

/**
 * Builds a Qikink order payload from order data.
 * Throws if required fields are missing or invalid.
 *
 * @param orderId - Firestore order ID (truncated to 15 chars for order_number)
 * @param order - Order data containing items, user, address, and pricing
 * @returns QikinkOrderPayload ready for API submission
 * @throws Error if items, SKU, address, pricing, or other fields are invalid
 */
export function buildQikinkOrderPayload(
  orderId: string,
  order: OrderData,
): QikinkOrderPayload {
  // ── Validate items exist ──
  const orderItems = order.items ?? [];
  if (orderItems.length === 0) {
    throw new Error("[qikink-order-builder] Order has no items");
  }

  // ── Validate total order value ──
  const totalOrderValue = order.totalAmount ?? order.total ?? 0;
  if (totalOrderValue <= 0) {
    throw new Error("[qikink-order-builder] Invalid Qikink total order value");
  }

  // ── Validate shipping address fields ──
  const addr = order.address ?? {};
  if (!addr.fullAddress) {
    throw new Error("[qikink-order-builder] Missing shipping address (fullAddress)");
  }
  if (!addr.phone && !order.user?.phone) {
    throw new Error("[qikink-order-builder] Missing shipping address (phone)");
  }
  if (!addr.city) {
    throw new Error("[qikink-order-builder] Missing shipping address (city)");
  }
  if (!addr.pincode) {
    throw new Error("[qikink-order-builder] Missing shipping address (pincode)");
  }
  if (!addr.state) {
    throw new Error("[qikink-order-builder] Missing shipping address (state)");
  }

  // ── Validate each item: SKU, quantity, price ──
  for (const item of orderItems) {
    const itemLabel = getItemLabel(item);

    // Check SKU
    if (!(item.qikinkCatalogSku ?? item.qikinkProductSku)) {
      throw new Error(
        `[qikink-order-builder] Missing Qikink catalog SKU for item: ${itemLabel}`,
      );
    }

    // Check quantity
    const qty = item.quantity ?? 1;
    if (qty <= 0) {
      throw new Error(
        `[qikink-order-builder] Invalid quantity for item: ${itemLabel}`,
      );
    }

    // Check price — must be a finite number > 0; missing or 0 are not allowed
    const price = item.price;
    if (typeof price !== "number" || !Number.isFinite(price) || price <= 0) {
      throw new Error(
        `[qikink-order-builder] Invalid Qikink item price for item: ${itemLabel}`,
      );
    }
  }

  // ── Build line items with resolved SKU and validated quantities/prices ──
  const line_items: QikinkLineItem[] = orderItems.map((item) => {
    const sku = item.qikinkCatalogSku ?? item.qikinkProductSku ?? "";
    const qty = item.quantity ?? 1;
    console.log("[qikink-order-builder] Using catalog SKU:", sku);
    return {
      search_from_my_products: 0 as const,
      quantity: String(qty),
      price: String(item.price),
      sku,
    };
  });

  // ── Parse name into first/last ──
  const fullName = order.user?.name ?? addr.name ?? "";
  const nameParts = fullName.trim().split(/\s+/);
  const firstName = (nameParts[0] ?? "").trim() || "Customer";
  const lastName = nameParts.slice(1).join(" ") || undefined;

  // ── Build shipping address ──
  const phone = order.user?.phone ?? addr.phone ?? "";
  const shipping_address: QikinkShippingAddress = {
    first_name: firstName,
    last_name: lastName,
    address1: addr.fullAddress ?? "",
    phone,
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
    total_order_value: String(totalOrderValue),
    line_items,
    shipping_address,
  };

  return payload;
}

