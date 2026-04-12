"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { DEMO_PRODUCTS, DemoProduct } from "@/lib/demoProducts";
import { Search, X } from "lucide-react";
import styles from "./SearchOverlay.module.css";

interface Product {
  id: string;
  name: string;
  price: number;
  images: string[];
  status: string;
  category?: string;
  description?: string;
}

interface SearchOverlayProps {
  onClose: () => void;
}

const MAX_RESULTS = 8;
const DEBOUNCE_MS = 200;

export default function SearchOverlay({ onClose }: SearchOverlayProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedTerm, setDebouncedTerm] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [loaded, setLoaded] = useState(false);

  // Load products once on mount (same logic as /shop)
  useEffect(() => {
    let cancelled = false;

    async function load() {
      const demos: Product[] = DEMO_PRODUCTS.map((d: DemoProduct) => ({
        id: d.id,
        name: d.name,
        price: d.price,
        images: d.images,
        status: d.status,
        category: d.category,
        description: d.description,
      }));

      try {
        const q = query(collection(db, "products"), where("status", "==", "active"));
        const snap = await getDocs(q);
        const fb = snap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Product[];

        if (cancelled) return;
        const fbIds = new Set(fb.map((p) => p.id));
        const mergedDemos = demos.filter((d) => !fbIds.has(d.id));
        setProducts([...fb, ...mergedDemos]);
      } catch {
        if (!cancelled) setProducts(demos);
      } finally {
        if (!cancelled) setLoaded(true);
      }
    }

    load();
    return () => { cancelled = true; };
  }, []);

  // Auto-focus input
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Lock body scroll while overlay is open
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, []);

  // ESC to close
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  // Debounce
  useEffect(() => {
    const id = setTimeout(() => setDebouncedTerm(searchTerm.trim()), DEBOUNCE_MS);
    return () => clearTimeout(id);
  }, [searchTerm]);

  // Filtered results
  const results = useMemo(() => {
    if (!debouncedTerm) return [];
    const lower = debouncedTerm.toLowerCase();
    return products
      .filter((p) => {
        const name = p.name?.toLowerCase() ?? "";
        const cat = p.category?.toLowerCase() ?? "";
        const desc = p.description?.toLowerCase() ?? "";
        return name.includes(lower) || cat.includes(lower) || desc.includes(lower);
      })
      .slice(0, MAX_RESULTS);
  }, [debouncedTerm, products]);

  const handleBackdropClick = useCallback(() => onClose(), [onClose]);

  const formatPrice = (p: number) =>
    `₹${p.toLocaleString("en-IN")}`;

  return (
    <>
      {/* Backdrop */}
      <div className={styles.backdrop} onClick={handleBackdropClick} aria-hidden="true" />

      {/* Overlay panel */}
      <div className={styles.overlay} role="dialog" aria-modal="true" aria-label="Search products">
        {/* Header */}
        <div className={styles.header}>
          <Search size={20} className={styles.searchIcon} />
          <input
            ref={inputRef}
            className={styles.input}
            type="text"
            placeholder="Search products…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            autoComplete="off"
            spellCheck={false}
          />
          <button className={styles.closeBtn} onClick={onClose} aria-label="Close search">
            ESC
          </button>
        </div>

        {/* Body */}
        <div className={styles.body}>
          {!debouncedTerm ? (
            <div className={styles.emptyState}>Start typing to search</div>
          ) : !loaded ? (
            <div className={styles.emptyState}>Loading…</div>
          ) : results.length === 0 ? (
            <div className={styles.emptyState}>No products found</div>
          ) : (
            <>
              <div className={styles.resultsHeading}>
                {results.length} result{results.length !== 1 ? "s" : ""}
              </div>
              <div className={styles.resultsGrid}>
                {results.map((product) => (
                  <Link
                    key={product.id}
                    href={`/shop/${product.id}`}
                    className={styles.resultCard}
                    onClick={onClose}
                  >
                    <div className={styles.resultImageWrap}>
                      {product.images?.[0] && (
                        <Image
                          src={product.images[0]}
                          alt={product.name}
                          fill
                          sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw"
                          className={styles.resultImage}
                        />
                      )}
                    </div>
                    <div className={styles.resultInfo}>
                      <span className={styles.resultName}>{product.name}</span>
                      <span className={styles.resultPrice}>{formatPrice(product.price)}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
