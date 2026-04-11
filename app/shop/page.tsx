"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { DEMO_PRODUCTS, DemoProduct } from "@/lib/demoProducts";
import { useWishlist } from "@/context/WishlistContext";
import styles from "./shop.module.css";

interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  images: string[];
  status: string;
  category?: string;
  tag?: string;
}

const CATEGORIES = ["All", "Tshirt", "Sweater", "Cap", "Sweat Pant"];
const TABS = ["For You", "New Arrivals", "Best Sellers"];

export default function Shop() {
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("All");
  const [activeTab, setActiveTab] = useState("For You");
  const { isInWishlist, isToggling, toggleWishlist } = useWishlist();

  useEffect(() => {
    async function load() {
      const demos: Product[] = DEMO_PRODUCTS.map((d: DemoProduct) => ({ ...d }));
      try {
        const q = query(collection(db, "products"), where("status", "==", "active"));
        const snap = await getDocs(q);
        const fb = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as Product[];
        const fbIds = new Set(fb.map((p) => p.id));
        const mergedDemos = demos.filter((d) => !fbIds.has(d.id));
        setAllProducts([...fb, ...mergedDemos]);
      } catch {
        setAllProducts(demos);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const onToggleWishlist = async (e: React.MouseEvent, product: Product) => {
    e.preventDefault();
    e.stopPropagation();

    if (isToggling(product.id)) return;

    try {
      await toggleWishlist(
        {
          productId: product.id,
          name: product.name,
          price: product.price,
          image: product.images?.[0] ?? "",
        },
        "plp",
      );
    } catch {
      // Context handles optimistic rollback + error state.
    }
  };

  const filtered = allProducts.filter((p) => {
    const catMatch = activeCategory === "All" || p.category === activeCategory;
    const tabMatch =
      activeTab === "For You" ||
      (activeTab === "New Arrivals" && p.tag === "new") ||
      (activeTab === "Best Sellers" && p.tag === "bestseller");
    return catMatch && tabMatch;
  });

  return (
    <div className={styles.pageWrapper}>

      {/* ── Tab bar ── */}
      <div className={styles.tabsBar} role="tablist">
        {TABS.map((tab) => (
          <button
            key={tab}
            role="tab"
            aria-selected={activeTab === tab}
            className={`${styles.tab} ${activeTab === tab ? styles.tabActive : ""}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* ── Shell ── */}
      <div className={styles.shell}>

        {/* Sidebar */}
        <aside className={styles.sidebar} aria-label="Filter by category">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              className={`${styles.sidebarItem} ${activeCategory === cat ? styles.sidebarItemActive : ""}`}
              onClick={() => setActiveCategory(cat)}
              aria-pressed={activeCategory === cat}
            >
              {cat}
            </button>
          ))}
        </aside>

        {/* Products */}
        <main className={styles.main}>
          {loading ? (
            <div className={styles.skeletonGrid}>
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className={styles.skeletonCard}>
                  <div className={`${styles.skeletonImg} skeleton`} />
                  <div className={`${styles.skeletonName} skeleton`} />
                  <div className={`${styles.skeletonPrice} skeleton`} />
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className={styles.emptyState}>
              <h2>NOTHING HERE YET.</h2>
              <p>Check back later for new drops.</p>
            </div>
          ) : (
            <div className={styles.productGrid}>
              {filtered.map((product) => (
                <Link href={`/shop/${product.id}`} key={product.id} className={styles.card}>
                  <div className={styles.imageWrap}>
                    {product.images?.[0] ? (
                      <Image
                        src={product.images[0]}
                        alt={product.name}
                        fill
                        className={styles.productImage}
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                      />
                    ) : (
                      <div className={styles.placeholderImg} />
                    )}
                    <div className={styles.imageActions}>
                      <button
                        className={styles.actionBtn}
                        onClick={(e) => e.preventDefault()}
                        aria-label="Quick view"
                      >
                        +
                      </button>
                      <button
                        className={`${styles.actionBtn} ${isInWishlist(product.id) ? styles.wishlisted : ""}`}
                        onClick={(e) => void onToggleWishlist(e, product)}
                        aria-label="Add to wishlist"
                        disabled={isToggling(product.id)}
                      >
                        {isInWishlist(product.id) ? "♥" : "♡"}
                      </button>
                    </div>
                  </div>
                  <div className={styles.cardBody}>
                    <p className={styles.productName}>{product.name}</p>
                    <div className={styles.priceRow}>
                      {product.tag && (
                        <span className={styles.tagBadge}>
                          {product.tag === "new" ? "NEW" : "TOP"}
                        </span>
                      )}
                      <span className={styles.priceBadge}>
                        ₹{product.price.toLocaleString("en-IN")}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </main>

      </div>
    </div>
  );
}
