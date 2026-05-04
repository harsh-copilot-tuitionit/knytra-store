export interface DemoVariant {
  size: string;
  color: string;
  sku: string;
  qikinkCatalogSku: string | null;
  qikinkProductSku: string | null;
  qikinkPrintTypeId: number | null;
  qikinkDesignSku: string | null;
}

export interface DemoProduct {
  id: string;
  slug?: string;
  name: string;
  description?: string;
  price: number;
  originalPrice?: number;
  images: string[];
  sizes?: string[];
  variants?: DemoVariant[];
  status: string;
  category: string;
  tag?: "new" | "bestseller";
}

const U = "https://images.unsplash.com";

export const DEMO_PRODUCTS: DemoProduct[] = [
  {
    id: "64059178",
    slug: "unisex-terry-oversized-tee",
    name: "Unisex Terry Oversized Tee | UT27",
    description: "Unisex terry oversized tee in Maroon. Single M-size variant for product and Qikink testing.",
    price: 299,
    images: [
      "/images/productimages/64059178/Front.jpg",
      "/images/productimages/64059178/Back.jpg",
    ],
    status: "active",
    category: "Cotton Apparels",
    variants: [
      {
        size: "M",
        color: "White",
        sku: "MVnHs-Wh-M",
        qikinkCatalogSku: "MVnHs-Wh-M",
        qikinkProductSku: "MVnHs-Wh-M",
        qikinkPrintTypeId: 1,
        qikinkDesignSku: null,
      },
    ],
  },
];

export function getDemoProduct(id: string): DemoProduct | undefined {
  return DEMO_PRODUCTS.find((p) => p.id === id || p.slug === id);
}
