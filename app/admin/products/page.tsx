"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { Plus, Search, Pencil, Image as ImageIcon } from "lucide-react";
import { db } from "@/lib/firebase";
import styles from "./products.module.css";

// Interface map for products
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  images: string[];
  sizes: string[];
  status: "active" | "draft";
  qikinkProductId?: string | null;
  variants?: Array<{
    size?: string | null;
    qikinkCatalogSku?: string | null;
    qikinkPrintTypeId?: number | null;
  }>;
  createdAt: any;
}

function getQikinkReadiness(product: Product): {
  label: "Ready" | "Needs Config";
  className: string;
} {
  const variants = product.variants ?? [];
  if (variants.length === 0) {
    return { label: "Needs Config", className: styles.needsConfig };
  }

  const hasInvalidCatalogVariant = variants.some((variant) => {
    const catalogSku = (variant.qikinkCatalogSku ?? "").trim();
    const hasCatalogSku = catalogSku.length > 0;
    const printTypeId = Number(variant.qikinkPrintTypeId);
    return hasCatalogSku && (!Number.isFinite(printTypeId) || printTypeId <= 0);
  });

  const hasFulfillableVariant = variants.some((variant) => {
    const catalogSku = (variant.qikinkCatalogSku ?? "").trim();
    const printTypeId = Number(variant.qikinkPrintTypeId);
    return catalogSku.length > 0 && Number.isFinite(printTypeId) && printTypeId > 0;
  });

  if (hasInvalidCatalogVariant || !hasFulfillableVariant) {
    return { label: "Needs Config", className: styles.needsConfig };
  }

  return { label: "Ready", className: styles.ready };
}

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProducts() {
      try {
        const q = query(collection(db, "products"), orderBy("createdAt", "desc"));
        const snapshot = await getDocs(q);
        const fetchedProducts = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Product[];
        
        setProducts(fetchedProducts);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, []);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Products</h1>
          <p className={styles.subtitle}>Manage your store catalog</p>
        </div>
        <Link href="/admin/products/new" className={styles.addButton}>
          <Plus size={18} />
          <span>Add Product</span>
        </Link>
      </div>

      <div className={styles.toolbar}>
        <div className={styles.searchBox}>
          <Search size={18} className={styles.searchIcon} />
          <input 
            type="text" 
            placeholder="Search products..." 
            className={styles.searchInput}
          />
        </div>
      </div>

      <div className={styles.tableCard}>
        {loading ? (
          <div className={styles.loadingState}>Loading products...</div>
        ) : products.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIconWrap}>
              <ImageIcon size={32} />
            </div>
            <h3>No products found</h3>
            <p>Get started by wrapping up your first design.</p>
            <Link href="/admin/products/new" className={styles.addButtonSolid}>
              <Plus size={18} />
              <span>Add First Product</span>
            </Link>
          </div>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Product</th>
                <th>Status</th>
                <th>Price</th>
                <th>Sizes</th>
                <th>Qikink Product ID</th>
                <th>Variants</th>
                <th>Qikink</th>
                <th className={styles.actionCol}></th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => {
                const variantsCount = product.variants?.length ?? 0;
                const readiness = getQikinkReadiness(product);

                return (
                  <tr key={product.id}>
                    <td>
                      <div className={styles.productCell}>
                        <div className={styles.productImage}>
                          {product.images && product.images.length > 0 ? (
                            <Image
                              src={product.images[0]}
                              alt={product.name}
                              fill
                              sizes="40px"
                              className={styles.image}
                            />
                          ) : (
                            <ImageIcon size={16} className={styles.placeholderIcon} />
                          )}
                        </div>
                        <span className={styles.productName}>{product.name}</span>
                      </div>
                    </td>
                    <td>
                      <span className={`${styles.statusBadge} ${styles[product.status]}`}>
                        {product.status}
                      </span>
                    </td>
                    <td className={styles.priceCell}>
                      ₹{product.price.toLocaleString("en-IN")}
                    </td>
                    <td>
                      <div className={styles.sizesRow}>
                        {(product.sizes ?? []).map((size) => (
                          <span key={size} className={styles.sizeBadge}>{size}</span>
                        ))}
                      </div>
                    </td>
                    <td className={styles.metaCell}>
                      {product.qikinkProductId ? (
                        <span className={styles.metaText}>{product.qikinkProductId}</span>
                      ) : (
                        <span className={styles.metaMuted}>-</span>
                      )}
                    </td>
                    <td className={styles.metaCell}>
                      <span className={styles.metaText}>{variantsCount}</span>
                    </td>
                    <td>
                      <span className={`${styles.readinessBadge} ${readiness.className}`}>
                        {readiness.label}
                      </span>
                    </td>
                    <td className={styles.actionCol}>
                      <Link href={`/admin/products/${product.id}`} className={styles.actionButton}>
                        <Pencil size={16} />
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
