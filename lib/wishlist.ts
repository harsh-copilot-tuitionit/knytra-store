export interface WishlistItem {
  productId: string;
  name: string;
  price: number;
  image: string;
  addedAt: number;
}

export interface WishlistProductInput {
  productId: string;
  name: string;
  price: number;
  image: string;
}

export const WISHLIST_PRODUCT_ID_RE = /^[a-zA-Z0-9_-]{1,120}$/;

export function isValidWishlistProductId(productId: string): boolean {
  return WISHLIST_PRODUCT_ID_RE.test(productId);
}
