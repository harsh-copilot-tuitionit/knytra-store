"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { getDemoProduct } from "@/lib/demoProducts";
import styles from "./productDetail.module.css";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  images: string[];
  sizes: string[];
  status: string;
}

function TickerBand() {
  const seg = "Free Shipping  \u2715  Free Shipping  \u2715  ";
  const items = Array.from({ length: 8 }, (_, i) => (
    <span key={i} className={styles.tickerItem}>{seg}</span>
  ));
  return (
    <div className={styles.ticker} aria-hidden="true">
      <div className={styles.tickerTrack}>
        {items}
        {items.map((item, i) =>
          <span key={`d${i}`} className={styles.tickerItem}>{seg}</span>
        )}
      </div>
    </div>
  );
}

export default function ProductDetailClient() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;
  const { addToCart, triggerBuyNow } = useCart();
  const { isInWishlist, isToggling, toggleWishlist } = useWishlist();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [addedPulse, setAddedPulse] = useState(false);
  const [wishlistToast, setWishlistToast] = useState<string | null>(null);
  const [sizeError, setSizeError] = useState(false);

  useEffect(() => {
    if (!slug) return;
    const demo = getDemoProduct(slug);
    if (demo) {
      setProduct(demo as Product);
      setLoading(false);
      return;
    }
    async function fetchProduct() {
      try {
        const snap = await getDoc(doc(db, "products", slug));
        setProduct(snap.exists() ? ({ id: snap.id, ...snap.data() } as Product) : null);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    fetchProduct();
  }, [slug]);

  useEffect(() => {
    if (product?.sizes?.length === 1 && product.sizes[0] === "One Size") {
      setSelectedSize("One Size");
    }
  }, [product]);

  useEffect(() => {
    if (!wishlistToast) return;
    const t = setTimeout(() => setWishlistToast(null), 1600);
    return () => clearTimeout(t);
  }, [wishlistToast]);

  const handleAddToCart = () => {
    if (!selectedSize) {
      setSizeError(true);
      return;
    }
    if (!product) return;
    setSizeError(false);
    addToCart({
      id: `${product.id}-${selectedSize}`,
      productId: product.id,
      name: product.name,
      size: selectedSize,
      price: product.price,
      image: product.images?.[0] ?? "",
      quantity,
    });
    setAddedPulse(true);
    setTimeout(() => setAddedPulse(false), 1200);
  };

  const handleBuyNow = () => {
    if (!selectedSize) {
      setSizeError(true);
      return;
    }
    if (!product) return;
    setSizeError(false);
    triggerBuyNow({
      id: `${product.id}-${selectedSize}`,
      productId: product.id,
      name: product.name,
      size: selectedSize,
      price: product.price,
      image: product.images?.[0] ?? "",
      quantity,
    });
    router.push("/checkout");
  };

  const handleWishlistToggle = async () => {
    if (!product || isToggling(product.id)) return;

    const wasInWishlist = isInWishlist(product.id);

    try {
      await toggleWishlist(
        {
          productId: product.id,
          name: product.name,
          price: product.price,
          image: product.images?.[0] ?? "",
        },
        "pdp",
      );
      setWishlistToast(wasInWishlist ? "Removed from wishlist" : "Added to wishlist");
    } catch {
      setWishlistToast("Failed to update wishlist. Try again");
    }
  };

  if (loading) {
    return (
      <div className={styles.skeletonPage}>
        {/* fake header */}
        <div className={styles.skeletonHeader}>
          <div className={`${styles.skeletonBackBtn} skeleton`} />
        </div>
        {/* fake title */}
        <div className={`${styles.skeletonTitle} skeleton`} />
        {/* fake gallery */}
        <div className={styles.skeletonGallery}>
          <div className={styles.skeletonThumbStrip}>
            {[0, 1, 2].map((i) => (
              <div key={i} className={`${styles.skeletonThumb} skeleton`} />
            ))}
          </div>
          <div className={`${styles.skeletonMainImg} skeleton`} />
        </div>
        {/* fake info */}
        <div className={styles.skeletonInfoBlock}>
          <div className={`${styles.skeletonLabel} skeleton`} />
          <div className={`${styles.skeletonLine} ${styles.skeletonLong} skeleton`} />
          <div className={`${styles.skeletonLine} ${styles.skeletonMid} skeleton`} />
        </div>
        {/* fake sizes */}
        <div className={styles.skeletonSizes}>
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className={`${styles.skeletonSizeChip} skeleton`} />
          ))}
        </div>
        {/* fake price + ATC */}
        <div className={styles.skeletonInfoBlock}>
          <div className={`${styles.skeletonLine} ${styles.skeletonShort} skeleton`} />
        </div>
        <div className={`${styles.skeletonATC} skeleton`} />
      </div>
    );
  }

  if (!product) {
    return (
      <div className={styles.notFound}>
        <h1>Product not found.</h1>
        <Link href="/shop" className={styles.backLink}>
          ← Back to Shop
        </Link>
      </div>
    );
  }

  const images = product.images ?? [];
  const showSizeSelector =
    product.sizes && product.sizes.length > 0 && product.sizes[0] !== "One Size";

  return (
    <div className={styles.page}>

      {/* ── Header ── */}
      <div className={styles.detailHeader}>
        <button
          className={styles.backBtn}
          onClick={() => router.back()}
          aria-label="Go back"
        >
          ←
        </button>
        <div className={styles.headerActions}>
          <button
            className={`${styles.headerIcon} ${isInWishlist(product.id) ? styles.wishlisted : ""}`}
            onClick={() => void handleWishlistToggle()}
            aria-label="Wishlist"
            disabled={isToggling(product.id)}
          >
            {isInWishlist(product.id) ? "\u2665" : "\u2661"}
          </button>
          <Link href="/shop" className={styles.headerIcon} aria-label="Back to shop">
            🛍
          </Link>
        </div>
      </div>

      {/* ── Product title ── */}
      <h1 className={styles.productTitle}>{product.name}</h1>

      {/* ── Gallery ── */}
      <div className={styles.galleryRow}>
        {images.length > 1 && (
          <div className={styles.thumbStrip}>
            {images.map((img, i) => (
              <button
                key={i}
                className={`${styles.thumb} ${i === selectedImage ? styles.thumbActive : ""}`}
                onClick={() => setSelectedImage(i)}
                aria-label={`View image ${i + 1}`}
              >
                <Image src={img} alt="" fill sizes="66px" className={styles.thumbImg} />
              </button>
            ))}
          </div>
        )}
        <div
          className={`${styles.mainImageWrap} ${images.length <= 1 ? styles.mainImageFull : ""}`}
        >
          {images[0] ? (
            <Image
              src={images[selectedImage]}
              alt={product.name}
              fill
              priority
              sizes="(max-width: 768px) 85vw, 50vw"
              className={styles.mainImage}
            />
          ) : (
            <div className={styles.noImage} />
          )}
        </div>
      </div>

      {/* ── Ticker ── */}
      <TickerBand />

      {/* ── Info ── */}
      <div className={styles.infoSection}>

        {product.description && (
          <div className={styles.block}>
            <h3 className={styles.blockLabel}>Description</h3>
            <p className={styles.descText}>{product.description}</p>
          </div>
        )}

        {showSizeSelector && (
          <div className={styles.block}>
            <span className={styles.blockLabel}>Size :</span>
            <div className={styles.sizeGrid}>
              {product.sizes.map((size) => (
                <button
                  key={size}
                  className={`${styles.sizeBtn} ${selectedSize === size ? styles.sizeBtnActive : ""}`}
                  onClick={() => { setSelectedSize(size); setSizeError(false); }}
                >
                  {size}
                </button>
              ))}
            </div>
            {sizeError && (
              <p className={styles.sizeError}>Please select a size to continue.</p>
            )}
          </div>
        )}

        <div className={styles.block}>
          <span className={styles.blockLabel}>Price :</span>
          <div className={styles.priceRow}>
            <div className={styles.priceNumbers}>
              {product.originalPrice && (
                <span className={styles.originalPrice}>
                  ₹{product.originalPrice.toLocaleString("en-IN")}
                </span>
              )}
              <span className={styles.salePrice}>
                ₹{product.price.toLocaleString("en-IN")}
              </span>
            </div>
            <div className={styles.qtyControl}>
              <button
                className={styles.qtyBtn}
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                aria-label="Decrease quantity"
              >
                −
              </button>
              <span className={styles.qtyValue}>{quantity}</span>
              <button
                className={styles.qtyBtn}
                onClick={() => setQuantity((q) => q + 1)}
                aria-label="Increase quantity"
              >
                +
              </button>
            </div>
          </div>
        </div>

        <button
          className={`${styles.addToCartBtn} ${addedPulse ? styles.added : ""}`}
          onClick={handleAddToCart}
        >
          {addedPulse ? "ADDED TO CART ✓" : "ADD TO CART +"}
        </button>

        {/* ── Inline action buttons ── */}
        <div className={styles.actionRow}>
          <button
            className={styles.inlineCartBtn}
            onClick={handleAddToCart}
          >
            {addedPulse ? "ADDED ✓" : "ADD TO CART"}
          </button>
          <button
            className={styles.buyNowBtn}
            onClick={handleBuyNow}
          >
            BUY NOW
          </button>
        </div>

        <div className={styles.policies}>
          <span>🇮🇳 Made in India · Premium Quality</span>
          <span>🚚 Ships within 5–7 business days</span>
          <span>🔄 Easy returns within 7 days</span>
        </div>

      </div>

      {wishlistToast && <div className={styles.toast}>{wishlistToast}</div>}
    </div>
  );
}
