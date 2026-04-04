"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useCart } from "@/context/CartContext";
import styles from "./productDetail.module.css";
import { ShoppingBag, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  images: string[];
  sizes: string[];
  status: string;
}

export default function ProductDetailClient() {
  const params = useParams();
  const slug = params?.slug as string;
  const { addToCart } = useCart();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [selectedImage, setSelectedImage] = useState(0);
  const [addedPulse, setAddedPulse] = useState(false);

  useEffect(() => {
    if (!slug) return;
    async function fetchProduct() {
      try {
        const snap = await getDoc(doc(db, "products", slug));
        if (!snap.exists()) {
          setProduct(null);
        } else {
          setProduct({ id: snap.id, ...snap.data() } as Product);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    fetchProduct();
  }, [slug]);

  const handleAddToCart = () => {
    if (!selectedSize) {
      alert("Please select a size.");
      return;
    }
    if (!product) return;

    addToCart({
      id: `${product.id}-${selectedSize}`,
      productId: product.id,
      name: product.name,
      size: selectedSize,
      price: product.price,
      image: product.images?.[0] ?? "",
      quantity: 1,
    });

    setAddedPulse(true);
    setTimeout(() => setAddedPulse(false), 600);
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner} />
      </div>
    );
  }

  if (!product) {
    return (
      <div className={styles.notFound}>
        <h1>Product not found.</h1>
        <Link href="/shop" className={styles.backLink}>← Back to Shop</Link>
      </div>
    );
  }

  const images = product.images ?? [];

  return (
    <div className={styles.container}>
      <div className={styles.breadcrumb}>
        <Link href="/shop">Shop</Link>
        <span>/</span>
        <span>{product.name}</span>
      </div>

      <div className={styles.productLayout}>
        {/* Image Gallery */}
        <div className={styles.gallery}>
          <div className={styles.mainImage}>
            {images.length > 0 ? (
              <Image
                src={images[selectedImage]}
                alt={product.name}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className={styles.mainImg}
                priority
              />
            ) : (
              <div className={styles.noImage} />
            )}
            {images.length > 1 && (
              <>
                <button
                  className={`${styles.galleryArrow} ${styles.arrowLeft}`}
                  onClick={() => setSelectedImage((i) => (i === 0 ? images.length - 1 : i - 1))}
                >
                  <ChevronLeft size={24} />
                </button>
                <button
                  className={`${styles.galleryArrow} ${styles.arrowRight}`}
                  onClick={() => setSelectedImage((i) => (i === images.length - 1 ? 0 : i + 1))}
                >
                  <ChevronRight size={24} />
                </button>
              </>
            )}
          </div>

          {images.length > 1 && (
            <div className={styles.thumbnails}>
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(i)}
                  className={`${styles.thumb} ${i === selectedImage ? styles.thumbActive : ""}`}
                >
                  <Image src={img} alt={`View ${i + 1}`} fill sizes="80px" className={styles.thumbImg} />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className={styles.info}>
          <h1 className={styles.productName}>{product.name}</h1>
          <p className={styles.price}>₹{product.price.toLocaleString("en-IN")}</p>

          <div className={styles.divider} />

          {product.sizes && product.sizes.length > 0 && (
            <div className={styles.sizeSection}>
              <div className={styles.sizeHeader}>
                <span className={styles.sizeLabel}>Size</span>
                {selectedSize && (
                  <span className={styles.selectedSizeIndicator}>{selectedSize}</span>
                )}
              </div>
              <div className={styles.sizeGrid}>
                {product.sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`${styles.sizeBtn} ${selectedSize === size ? styles.sizeBtnActive : ""}`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          <button
            className={`${styles.addToCartBtn} ${addedPulse ? styles.addedPulse : ""}`}
            onClick={handleAddToCart}
          >
            <ShoppingBag size={20} />
            {addedPulse ? "Added!" : "Add to Cart"}
          </button>

          {product.description && (
            <div className={styles.descriptionSection}>
              <h3 className={styles.descLabel}>About this piece</h3>
              <p className={styles.description}>{product.description}</p>
            </div>
          )}

          <div className={styles.policies}>
            <span>🇮🇳 Made in India · Print on Demand</span>
            <span>🚚 Ships within 5–7 business days</span>
            <span>🔄 Easy returns within 7 days</span>
          </div>
        </div>
      </div>
    </div>
  );
}
