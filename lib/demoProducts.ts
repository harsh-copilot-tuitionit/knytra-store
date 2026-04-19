export interface DemoVariant {
  size: string;
  color: string;
  sku: string;
  qikinkStoreSku: string | null;
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
    id: "concrete-shadow-tee",
    name: "Concrete Shadow Tee",
    description:
      "Heavyweight 300gsm cotton jersey. Oversized unisex drop-shoulder cut. Silkscreen-printed front graphic — fades with every wash, by design. Raw hem edges. This piece doesn't ask for attention. It commands it.",
    price: 1299,
    originalPrice: 1799,
    images: [
      `${U}/photo-1576566588028-4147f3842f27?w=800&h=960&fit=crop`,
      `${U}/photo-1620799140408-edc6dcb6d633?w=800&h=960&fit=crop`,
    ],
    sizes: ["XS", "S", "M", "L", "XL", "XXL"],
    status: "active",
    category: "Tshirt",
    tag: "bestseller",
  },
  {
    id: "raw-edge-tee",
    name: "Raw Edge Tee",
    description:
      "Drop-shoulder in washed cotton. Intentionally unhemmed sleeves — the raw edge is the aesthetic. Small batch production, built to last. Zero compromises. 100% intentional.",
    price: 999,
    images: [
      `${U}/photo-1583743814966-8936f5b7be1a?w=800&h=960&fit=crop`,
      `${U}/photo-1576566588028-4147f3842f27?w=800&h=960&fit=crop`,
    ],
    sizes: ["S", "M", "L", "XL"],
    status: "active",
    category: "Tshirt",
    tag: "new",
  },
  {
    id: "urban-phantom-hoodie",
    name: "Urban Phantom Hoodie",
    description:
      "Heavy-duty 380gsm fleece. Pre-shrunk. Double-lined hood. Kangaroo pocket. Ribbed cuffs and hem. The silhouette is boxy — it drapes, not clings. Built for streets, not gyms.",
    price: 2499,
    originalPrice: 2999,
    images: [
      `${U}/photo-1521572163474-6864f9cf17ab?w=800&h=960&fit=crop`,
      `${U}/photo-1542272604-787c3835535d?w=800&h=960&fit=crop`,
    ],
    sizes: ["S", "M", "L", "XL", "XXL"],
    status: "active",
    category: "Sweater",
    tag: "bestseller",
  },
  {
    id: "nocturne-crewneck",
    name: "Nocturne Crewneck",
    description:
      "Mid-weight brushed fleece crewneck. Ribbed collar, cuffs, and hem. KNYTRA wordmark embroidered at chest — understated on purpose. The foundation piece of every serious wardrobe.",
    price: 1799,
    images: [
      `${U}/photo-1578587018452-892bacefd3f2?w=800&h=960&fit=crop`,
      `${U}/photo-1556821840-3a63f15732ce?w=800&h=960&fit=crop`,
    ],
    sizes: ["S", "M", "L", "XL"],
    status: "active",
    category: "Sweater",
    tag: "new",
  },
  {
    id: "blacktop-cargo-jogger",
    name: "Blacktop Cargo Jogger",
    description:
      "Technical cargo cut in black cotton twill. Side utility pockets, elasticated waistband with drawstring, tapered ankle. The problem with these is you won't want to take them off.",
    price: 2199,
    originalPrice: 2599,
    images: [
      `${U}/photo-1551028719-00167b16eac5?w=800&h=960&fit=crop`,
      `${U}/photo-1542272604-787c3835535d?w=800&h=960&fit=crop`,
    ],
    sizes: ["XS", "S", "M", "L", "XL"],
    status: "active",
    category: "Sweat Pant",
  },
  {
    id: "shadow-block-cap",
    name: "Shadow Block Cap",
    description:
      "Six-panel unstructured cap in washed black cotton. Metal adjustable buckle. Low crown profile. Embroidered KNYTRA wordmark on front. Worn-in feeling from day one.",
    price: 799,
    images: [
      `${U}/photo-1618354691373-d851c5c3a990?w=800&h=960&fit=crop`,
      `${U}/photo-1588850561407-ed78c282e89b?w=800&h=960&fit=crop`,
    ],
    sizes: ["One Size"],
    status: "active",
    category: "Cap",
    tag: "new",
  },
  {
    id: "qikink-test-tee",
    slug: "qikink-test-tee",
    name: "Qikink Test Tee",
    description: "A dedicated Qikink test tee for order and SKU verification.",
    price: 1,
    images: [
      `${U}/photo-1521572163474-6864f9cf17ab?w=800&h=960&fit=crop`,
    ],
    status: "active",
    category: "T-Shirts",
    variants: [
      {
        size: "S",
        color: "Lavender",
        sku: "KNY-TEST-TEE-S",
        qikinkStoreSku: "v-9xGgOiGFaVZW08YPNhUhUbTUqQje9nKY",
        qikinkDesignSku: null,
      },
    ],
  },
  {
    id: "64059178",
    slug: "unisex-terry-oversized-tee",
    name: "Unisex Terry Oversized Tee | UT27",
    description: "Unisex terry oversized tee in Maroon. Single M-size variant for product and Qikink testing.",
    price: 1,
    images: [
      "/images/productimages/64059178/Front.jpg",
      "/images/productimages/64059178/Back.jpg",
    ],
    status: "active",
    category: "Cotton Apparels",
    variants: [
      {
        size: "M",
        color: "Maroon",
        sku: "UOsTMRnHs-Mm-M",
        qikinkStoreSku: "v-9hCn1CGDaVZW08UGMR8gubTUqg_Z9huZ",
        qikinkDesignSku: null,
      },
    ],
  },
];

export function getDemoProduct(id: string): DemoProduct | undefined {
  return DEMO_PRODUCTS.find((p) => p.id === id || p.slug === id);
}
