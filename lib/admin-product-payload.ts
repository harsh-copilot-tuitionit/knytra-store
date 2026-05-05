interface VariantInput {
  size?: unknown;
  color?: unknown;
  variationName?: unknown;
  sku?: unknown;
  qikinkCatalogSku?: unknown;
  qikinkProductSku?: unknown;
  qikinkStoreSku?: unknown;
  qikinkDesignSku?: unknown;
  qikinkPrintTypeId?: unknown;
  qikinkProductCost?: unknown;
  qikinkSellingCost?: unknown;
  qikinkImageUrl?: unknown;
}

interface ProductPayloadInput {
  name?: unknown;
  description?: unknown;
  price?: unknown;
  status?: unknown;
  qikinkProductId?: unknown;
  qikinkProductName?: unknown;
  images?: unknown;
  variants?: unknown;
}

export interface NormalizedProductPayload {
  name: string;
  description: string;
  price: number;
  status: "draft" | "active";
  qikinkProductId: string | null;
  qikinkProductName: string | null;
  images: string[];
  variants: Array<{
    size: string | null;
    color: string | null;
    variationName: string | null;
    sku: string | null;
    qikinkCatalogSku: string | null;
    qikinkProductSku: string | null;
    qikinkStoreSku: string | null;
    qikinkDesignSku: string | null;
    qikinkPrintTypeId: number | null;
    qikinkProductCost: number | null;
    qikinkSellingCost: number | null;
    qikinkImageUrl: string | null;
  }>;
  sizes: string[];
}

function asTrimmedString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function asPositiveNumber(value: unknown): number | null {
  if (value === null || value === undefined || value === "") {
    return null;
  }
  const n = Number(value);
  if (!Number.isFinite(n) || n <= 0) {
    return null;
  }
  return n;
}

function variantHasAnyData(variant: VariantInput): boolean {
  return [
    variant.size,
    variant.color,
    variant.variationName,
    variant.sku,
    variant.qikinkCatalogSku,
    variant.qikinkProductSku,
    variant.qikinkStoreSku,
    variant.qikinkDesignSku,
    variant.qikinkPrintTypeId,
    variant.qikinkProductCost,
    variant.qikinkSellingCost,
    variant.qikinkImageUrl,
  ].some((value) => {
    if (value === null || value === undefined) return false;
    if (typeof value === "string") return value.trim().length > 0;
    return true;
  });
}

export function validateAndNormalizeProductPayload(
  raw: unknown,
): { success: true; data: NormalizedProductPayload } | { success: false; error: string } {
  if (!raw || typeof raw !== "object") {
    return { success: false, error: "Invalid request body." };
  }

  const body = raw as ProductPayloadInput;

  const name = asTrimmedString(body.name);
  if (!name) {
    return { success: false, error: "Product name is required." };
  }

  const price = Number(body.price);
  if (!Number.isFinite(price) || price <= 0) {
    return { success: false, error: "Price must be a positive number." };
  }

  const status = body.status;
  if (status !== "draft" && status !== "active") {
    return { success: false, error: "Status must be draft or active." };
  }

  const variantsInput = Array.isArray(body.variants) ? (body.variants as VariantInput[]) : [];
  const meaningfulVariants = variantsInput.filter(variantHasAnyData);

  const variants: NormalizedProductPayload["variants"] = [];

  for (const [index, variant] of meaningfulVariants.entries()) {
    const row = index + 1;
    const qikinkCatalogSku = asTrimmedString(variant.qikinkCatalogSku);
    const qikinkPrintTypeId = asPositiveNumber(variant.qikinkPrintTypeId);

    if (qikinkCatalogSku && !qikinkPrintTypeId) {
      return {
        success: false,
        error: `Variant ${row}: print type ID is required when catalog SKU is set.`,
      };
    }

    if (
      variant.qikinkPrintTypeId !== null
      && variant.qikinkPrintTypeId !== undefined
      && variant.qikinkPrintTypeId !== ""
      && !qikinkPrintTypeId
    ) {
      return {
        success: false,
        error: `Variant ${row}: print type ID must be a positive number.`,
      };
    }

    const qikinkProductCost = asPositiveNumber(variant.qikinkProductCost);
    if (
      variant.qikinkProductCost !== null
      && variant.qikinkProductCost !== undefined
      && variant.qikinkProductCost !== ""
      && !qikinkProductCost
    ) {
      return {
        success: false,
        error: `Variant ${row}: product cost must be a positive number.`,
      };
    }

    const qikinkSellingCost = asPositiveNumber(variant.qikinkSellingCost);
    if (
      variant.qikinkSellingCost !== null
      && variant.qikinkSellingCost !== undefined
      && variant.qikinkSellingCost !== ""
      && !qikinkSellingCost
    ) {
      return {
        success: false,
        error: `Variant ${row}: selling cost must be a positive number.`,
      };
    }

    variants.push({
      size: asTrimmedString(variant.size) || null,
      color: asTrimmedString(variant.color) || null,
      variationName: asTrimmedString(variant.variationName) || null,
      sku: asTrimmedString(variant.sku) || null,
      qikinkCatalogSku: qikinkCatalogSku || null,
      qikinkProductSku: asTrimmedString(variant.qikinkProductSku) || null,
      qikinkStoreSku: asTrimmedString(variant.qikinkStoreSku) || null,
      qikinkDesignSku: asTrimmedString(variant.qikinkDesignSku) || null,
      qikinkPrintTypeId,
      qikinkProductCost,
      qikinkSellingCost,
      qikinkImageUrl: asTrimmedString(variant.qikinkImageUrl) || null,
    });
  }

  if (status === "active" && variants.length === 0) {
    return { success: false, error: "Active products must include at least one variant." };
  }

  const sizes = Array.from(new Set(
    variants
      .map((variant) => variant.size ?? "")
      .filter((size) => size !== ""),
  ));

  const images = Array.isArray(body.images)
    ? body.images.filter((img): img is string => typeof img === "string")
    : [];

  return {
    success: true,
    data: {
      name,
      description: asTrimmedString(body.description),
      price,
      status,
      qikinkProductId: asTrimmedString(body.qikinkProductId) || null,
      qikinkProductName: asTrimmedString(body.qikinkProductName) || null,
      images,
      variants,
      sizes,
    },
  };
}
