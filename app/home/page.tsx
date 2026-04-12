import Image from "next/image";
import Link from "next/link";
import { DEMO_PRODUCTS } from "@/lib/demoProducts";
import styles from "./home.module.css";

const MARQUEE_WORDS = [
  "CRAFTED WITH INTENT",
  "LIMITED DROPS",
  "MADE IN INDIA",
  "RAW · BOLD · URBAN",
  "CRAFTED WITH INTENT",
  "LIMITED DROPS",
  "MADE IN INDIA",
  "RAW · BOLD · URBAN",
];

// Pick featured products: bestsellers first, then fill with others
const featured = [
  ...DEMO_PRODUCTS.filter((p) => p.tag === "bestseller"),
  ...DEMO_PRODUCTS.filter((p) => p.tag !== "bestseller"),
].slice(0, 4);

const newArrivals = DEMO_PRODUCTS.filter((p) => p.tag === "new");

const CATEGORIES = [
  {
    label: "T-Shirts",
    slug: "Tshirt",
    image:
      "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=600&h=750&fit=crop",
  },
  {
    label: "Hoodies",
    slug: "Sweater",
    image:
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&h=750&fit=crop",
  },
  {
    label: "Bottoms",
    slug: "Sweat Pant",
    image:
      "https://images.unsplash.com/photo-1542272604-787c3835535d?w=600&h=750&fit=crop",
  },
  {
    label: "Caps",
    slug: "Cap",
    image:
      "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=600&h=750&fit=crop",
  },
];

export default function HomePage() {
  return (
    <div className={styles.page}>

      {/* ─────────────────────────────────────────
          HERO
      ───────────────────────────────────────── */}
      <section className={styles.hero}>
        <div className={styles.heroMedia}>
          <Image
            src="https://images.unsplash.com/photo-1544441893-675973e31985?w=1600&h=900&fit=crop"
            alt="Knytra hero"
            fill
            priority
            sizes="100vw"
            className={styles.heroImg}
          />
          <div className={styles.heroOverlay} />
        </div>

        <div className={styles.heroContent}>
          <p className={styles.heroEyebrow}>New Season · SS26</p>
          <h1 className={styles.heroHeadline}>
            <span>CRAFTED</span>
            <span>WITH</span>
            <span>INTENT.</span>
          </h1>
          <p className={styles.heroSub}>
            Raw streetwear. Limited drops. Built for those who move.
          </p>
          <div className={styles.heroCtas}>
            <Link href="/shop" className={styles.ctaPrimary}>
              Shop Now
            </Link>
            <Link href="/shop" className={styles.ctaGhost}>
              View All →
            </Link>
          </div>
        </div>

        {/* Scroll hint */}
        <div className={styles.scrollHint} aria-hidden="true">
          <span className={styles.scrollLine} />
          <span className={styles.scrollLabel}>SCROLL</span>
        </div>
      </section>

      {/* ─────────────────────────────────────────
          MARQUEE BAND
      ───────────────────────────────────────── */}
      <div className={styles.marqueeWrap} aria-hidden="true">
        <div className={styles.marqueeTrack}>
          {MARQUEE_WORDS.map((w, i) => (
            <span key={i} className={styles.marqueeItem}>
              {w} <span className={styles.marqueeDot}>✕</span>
            </span>
          ))}
        </div>
      </div>

      {/* ─────────────────────────────────────────
          FEATURED PRODUCTS
      ───────────────────────────────────────── */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <div>
            <p className={styles.sectionEye}>Curated for you</p>
            <h2 className={styles.sectionTitle}>Featured Drops</h2>
          </div>
          <Link href="/shop" className={styles.sectionLink}>
            See All →
          </Link>
        </div>

        <div className={styles.productGrid}>
          {featured.map((product) => (
            <Link
              key={product.id}
              href={`/shop/${product.id}`}
              className={styles.productCard}
            >
              <div className={styles.productImageWrap}>
                <Image
                  src={product.images[0]}
                  alt={product.name}
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  className={styles.productImage}
                />
                {product.tag && (
                  <span className={`${styles.productTag} ${product.tag === "new" ? styles.tagNew : styles.tagBest}`}>
                    {product.tag === "new" ? "NEW" : "BESTSELLER"}
                  </span>
                )}
              </div>
              <div className={styles.productInfo}>
                <p className={styles.productName}>{product.name}</p>
                <div className={styles.productPricing}>
                  {product.originalPrice && (
                    <s className={styles.productOriginal}>
                      ₹{product.originalPrice.toLocaleString("en-IN")}
                    </s>
                  )}
                  <span className={styles.productPrice}>
                    ₹{product.price.toLocaleString("en-IN")}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ─────────────────────────────────────────
          BANNER — MANIFESTO
      ───────────────────────────────────────── */}
      <section className={styles.manifesto}>
        <div className={styles.manifestoMedia}>
          <Image
            src="https://images.unsplash.com/photo-1523398002811-999ca8dec234?w=1400&h=600&fit=crop"
            alt=""
            fill
            sizes="100vw"
            className={styles.manifestoImg}
          />
          <div className={styles.manifestoOverlay} />
        </div>
        <div className={styles.manifestoContent}>
          <p className={styles.manifestoQuote}>
            "Not made for everyone.<br />Made for those who get it."
          </p>
          <Link href="/shop" className={styles.manifestoCta}>
            Explore the Collection
          </Link>
        </div>
      </section>

      {/* ─────────────────────────────────────────
          SHOP BY CATEGORY
      ───────────────────────────────────────── */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <div>
            <p className={styles.sectionEye}>Find your fit</p>
            <h2 className={styles.sectionTitle}>Shop by Category</h2>
          </div>
        </div>

        <div className={styles.categoryGrid}>
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.slug}
              href={`/shop?category=${encodeURIComponent(cat.slug)}`}
              className={styles.categoryCard}
            >
              <div className={styles.categoryImageWrap}>
                <Image
                  src={cat.image}
                  alt={cat.label}
                  fill
                  sizes="(max-width: 640px) 50vw, 25vw"
                  className={styles.categoryImage}
                />
                <div className={styles.categoryOverlay} />
              </div>
              <span className={styles.categoryLabel}>{cat.label}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* ─────────────────────────────────────────
          NEW ARRIVALS STRIP
      ───────────────────────────────────────── */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <div>
            <p className={styles.sectionEye}>Just dropped</p>
            <h2 className={styles.sectionTitle}>New Arrivals</h2>
          </div>
          <Link href="/shop" className={styles.sectionLink}>
            See All →
          </Link>
        </div>

        <div className={styles.newArrivalsRow}>
          {newArrivals.map((product) => (
            <Link
              key={product.id}
              href={`/shop/${product.id}`}
              className={styles.newArrivalCard}
            >
              <div className={styles.newArrivalImageWrap}>
                <Image
                  src={product.images[0]}
                  alt={product.name}
                  fill
                  sizes="(max-width: 640px) 80vw, 40vw"
                  className={styles.newArrivalImage}
                />
                <span className={styles.newBadge}>NEW</span>
              </div>
              <div className={styles.newArrivalInfo}>
                <p className={styles.newArrivalCategory}>{product.category}</p>
                <p className={styles.newArrivalName}>{product.name}</p>
                <p className={styles.newArrivalPrice}>
                  ₹{product.price.toLocaleString("en-IN")}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ─────────────────────────────────────────
          BRAND STRIP
      ───────────────────────────────────────── */}
      <section className={styles.brandStrip}>
        <div className={styles.brandStripGrid}>
          <div className={styles.brandStripItem}>
            <span className={styles.brandStripIcon}>⬡</span>
            <p className={styles.brandStripLabel}>Limited Drops</p>
            <p className={styles.brandStripSub}>Small batches. Intentionally made.</p>
          </div>
          <div className={styles.brandStripItem}>
            <span className={styles.brandStripIcon}>◈</span>
            <p className={styles.brandStripLabel}>Made in India</p>
            <p className={styles.brandStripSub}>Premium Indian craftsmanship.</p>
          </div>
          <div className={styles.brandStripItem}>
            <span className={styles.brandStripIcon}>◎</span>
            <p className={styles.brandStripLabel}>Ships in 5–7 Days</p>
            <p className={styles.brandStripSub}>Free shipping on all orders.</p>
          </div>
          <div className={styles.brandStripItem}>
            <span className={styles.brandStripIcon}>◇</span>
            <p className={styles.brandStripLabel}>Easy Returns</p>
            <p className={styles.brandStripSub}>7-day hassle-free returns.</p>
          </div>
        </div>
      </section>

    </div>
  );
}
