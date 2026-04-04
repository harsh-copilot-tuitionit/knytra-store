"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { collection, getDocs, query, where, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import styles from "./shop.module.css";
// import { Product } from "../admin/products/page"; // We can redefine or import properly. Let's redefine for isolation.

interface Product {
  id: string;
  name: string;
  price: number;
  images: string[];
  status: string;
}

export default function Shop() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchActiveProducts() {
      try {
        const q = query(
          collection(db, "products"),
          where("status", "==", "active"),
          // Note: requiring composite index for where + orderBy. We will just fetch 'active' and sort client-side, 
          // or rely on Firebase default if no orderBy is used.
        );
        const snapshot = await getDocs(q);
        const fetched = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Product[];

        // Sort descending by created manually to avoid needing a combined index right now
        // fetched.sort((a, b) => b.createdAt - a.createdAt);

        setProducts(fetched);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchActiveProducts();
  }, []);

  return (
    <div className={styles.container}>
      <header className={styles.shopHeader}>
        <h1 className={styles.title}>LATEST DROPS</h1>
        <p className={styles.subtitle}>RAW & UNAPOLOGETIC.</p>
      </header>

      {loading ? (
        <div className={styles.loadingState}>
          <div className={styles.spinner} />
          <p>Loading collection...</p>
        </div>
      ) : products.length === 0 ? (
        <div className={styles.emptyState}>
          <h2>NOTHING HERE YET.</h2>
          <p>Check back later for new drops.</p>
        </div>
      ) : (
        <div className={styles.productGrid}>
          {products.map(product => (
            <Link href={`/shop/${product.id}`} key={product.id} className={styles.productCard}>
              <div className={styles.imageWrapper}>
                {product.images && product.images.length > 0 ? (
                  <Image 
                    src={product.images[0]} 
                    alt={product.name} 
                    fill 
                    className={styles.productImage}
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                ) : (
                  <div className={styles.placeholderImg}>No Image</div>
                )}
                {/* Optional hover overlay */}
                <div className={styles.imageOverlay}>
                  <span>QUICK VIEW</span>
                </div>
              </div>
              
              <div className={styles.productInfo}>
                <h3 className={styles.productName}>{product.name}</h3>
                <span className={styles.productPrice}>
                  ₹{product.price.toLocaleString("en-IN")}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
