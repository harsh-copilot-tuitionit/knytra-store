"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, UploadCloud, X, Save, Plus, Trash2 } from "lucide-react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "@/lib/firebase";
import styles from "./newProduct.module.css";
import Image from "next/image";

interface VariantForm {
  size: string;
  color: string;
  variationName: string;
  sku: string;
  qikinkCatalogSku: string;
  qikinkProductSku: string;
  qikinkStoreSku: string;
  qikinkDesignSku: string;
  qikinkPrintTypeId: string;
  qikinkProductCost: string;
  qikinkSellingCost: string;
  qikinkImageUrl: string;
}

const emptyVariant = (): VariantForm => ({
  size: "",
  color: "",
  variationName: "",
  sku: "",
  qikinkCatalogSku: "",
  qikinkProductSku: "",
  qikinkStoreSku: "",
  qikinkDesignSku: "",
  qikinkPrintTypeId: "",
  qikinkProductCost: "",
  qikinkSellingCost: "",
  qikinkImageUrl: "",
});

const hasVariantData = (variant: VariantForm) =>
  Object.values(variant).some((value) => value.trim() !== "");

const unique = (values: string[]) => Array.from(new Set(values));

export default function NewProduct() {
  const router = useRouter();
  
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    status: "draft",
    qikinkProductId: "",
    qikinkProductName: "",
  });
  const [variants, setVariants] = useState<VariantForm[]>([emptyVariant()]);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [formError, setFormError] = useState<string>("");

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormError("");
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleVariantChange = (
    index: number,
    field: keyof VariantForm,
    value: string,
  ) => {
    setFormError("");
    setVariants((prev) =>
      prev.map((variant, i) =>
        i === index ? { ...variant, [field]: value } : variant,
      ),
    );
  };

  const addVariant = () => {
    setVariants((prev) => [...prev, emptyVariant()]);
  };

  const removeVariant = (index: number) => {
    setVariants((prev) => {
      if (prev.length === 1) {
        return [emptyVariant()];
      }
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setImageFiles((prev) => [...prev, ...filesArray]);

      const previews = filesArray.map((file) => URL.createObjectURL(file));
      setImagePreviews((prev) => [...prev, ...previews]);
    }
  };

  const removeImage = (index: number) => {
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const name = formData.name.trim();
    if (!name) {
      setFormError("Product name is required.");
      return;
    }

    if (!formData.price.trim()) {
      setFormError("Selling price is required.");
      return;
    }

    const sellingPrice = Number(formData.price);
    if (!Number.isFinite(sellingPrice) || sellingPrice <= 0) {
      setFormError("Selling price must be a positive number.");
      return;
    }

    const trimmedVariants = variants
      .map((variant) =>
        Object.fromEntries(
          Object.entries(variant).map(([k, v]) => [k, v.trim()]),
        ) as VariantForm,
      )
      .filter(hasVariantData);

    if (formData.status === "active" && trimmedVariants.length === 0) {
      setFormError("Active products must include at least one variant.");
      return;
    }

    for (const [index, variant] of trimmedVariants.entries()) {
      const row = index + 1;
      if (variant.qikinkCatalogSku && !variant.qikinkPrintTypeId) {
        setFormError(`Variant ${row}: print type ID is required when catalog SKU is set.`);
        return;
      }

      if (variant.qikinkPrintTypeId) {
        const printTypeId = Number(variant.qikinkPrintTypeId);
        if (!Number.isFinite(printTypeId) || printTypeId <= 0) {
          setFormError(`Variant ${row}: print type ID must be a positive number.`);
          return;
        }
      }

      if (variant.qikinkProductCost) {
        const productCost = Number(variant.qikinkProductCost);
        if (!Number.isFinite(productCost) || productCost <= 0) {
          setFormError(`Variant ${row}: product cost must be a positive number.`);
          return;
        }
      }

      if (variant.qikinkSellingCost) {
        const sellingCost = Number(variant.qikinkSellingCost);
        if (!Number.isFinite(sellingCost) || sellingCost <= 0) {
          setFormError(`Variant ${row}: selling cost must be a positive number.`);
          return;
        }
      }
    }

    const sizes = unique(
      trimmedVariants
        .map((variant) => variant.size)
        .filter((size) => size !== ""),
    );

    const saveVariants = trimmedVariants.map((variant) => ({
      size: variant.size || null,
      color: variant.color || null,
      variationName: variant.variationName || null,
      sku: variant.sku || null,
      qikinkCatalogSku: variant.qikinkCatalogSku || null,
      qikinkProductSku: variant.qikinkProductSku || null,
      qikinkStoreSku: variant.qikinkStoreSku || null,
      qikinkDesignSku: variant.qikinkDesignSku || null,
      qikinkPrintTypeId: variant.qikinkPrintTypeId
        ? Number(variant.qikinkPrintTypeId)
        : null,
      qikinkProductCost: variant.qikinkProductCost
        ? Number(variant.qikinkProductCost)
        : null,
      qikinkSellingCost: variant.qikinkSellingCost
        ? Number(variant.qikinkSellingCost)
        : null,
      qikinkImageUrl: variant.qikinkImageUrl || null,
    }));
    
    setLoading(true);

    try {
      // 1. Upload Images to Firebase Storage
      const uploadedImageUrls: string[] = [];
      
      for (const file of imageFiles) {
        const storageRef = ref(storage, `products/${Date.now()}_${file.name}`);
        await uploadBytes(storageRef, file);
        const downloadUrl = await getDownloadURL(storageRef);
        uploadedImageUrls.push(downloadUrl);
      }

      // 2. Save Product to Firestore
      await addDoc(collection(db, "products"), {
        name,
        description: formData.description,
        price: sellingPrice,
        status: formData.status,
        qikinkProductId: formData.qikinkProductId.trim() || null,
        qikinkProductName: formData.qikinkProductName.trim() || null,
        variants: saveVariants,
        sizes,
        images: uploadedImageUrls,
        createdAt: serverTimestamp(),
      });

      router.push("/admin/products");
    } catch (error) {
      console.error("Error creating product:", error);
      setFormError("Failed to create product.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <Link href="/admin/products" className={styles.backButton}>
            <ArrowLeft size={20} />
          </Link>
          <h1 className={styles.title}>Add Product</h1>
        </div>
        <button type="submit" disabled={loading} className={styles.saveButton}>
          <Save size={18} />
          <span>{loading ? "Saving..." : "Save Product"}</span>
        </button>
      </div>

      <div className={styles.grid}>
        {/* Left Column */}
        <div className={styles.mainCol}>
          <div className={styles.card}>
            <div className={styles.inputGroup}>
              <label>Title</label>
              <input 
                type="text" 
                name="name" 
                value={formData.name} 
                onChange={handleInputChange} 
                placeholder="e.g. Graphic Oversized Tee" 
                required 
              />
            </div>

            <div className={styles.qikinkProductGrid}>
              <div className={styles.inputGroup}>
                <label>Qikink Product ID</label>
                <input
                  type="text"
                  name="qikinkProductId"
                  value={formData.qikinkProductId}
                  onChange={handleInputChange}
                  placeholder="e.g. 64059178"
                />
              </div>

              <div className={styles.inputGroup}>
                <label>Qikink Product Name</label>
                <input
                  type="text"
                  name="qikinkProductName"
                  value={formData.qikinkProductName}
                  onChange={handleInputChange}
                  placeholder="e.g. Unisex Terry Oversized Tee"
                />
              </div>
            </div>
            
            <div className={styles.inputGroup}>
              <label>Description</label>
              <textarea 
                name="description" 
                value={formData.description} 
                onChange={handleInputChange} 
                placeholder="Detailed description of the piece, material, and fit..." 
                rows={6}
              />
            </div>
          </div>

          {/* Media Card */}
          <div className={styles.card}>
            <h3 className={styles.cardTitle}>Media</h3>
            
            <div className={styles.imageGrid}>
              {imagePreviews.map((src, index) => (
                <div key={index} className={styles.imagePreview}>
                  <Image src={src} alt="Preview" fill className={styles.previewImg} />
                  <button type="button" onClick={() => removeImage(index)} className={styles.removeImgBtn}>
                    <X size={14} />
                  </button>
                </div>
              ))}
              
              <label className={styles.uploadBox}>
                <input 
                  type="file" 
                  multiple 
                  accept="image/*" 
                  onChange={handleImageChange} 
                  className={styles.hiddenInput} 
                />
                <UploadCloud size={24} />
                <span>Upload</span>
              </label>
            </div>
          </div>

          {/* Pricing & Variants */}
          <div className={styles.card}>
            <h3 className={styles.cardTitle}>Pricing</h3>
            <div className={styles.inputGroup}>
              <label>Price (₹)</label>
              <input 
                type="number" 
                name="price" 
                value={formData.price} 
                onChange={handleInputChange} 
                placeholder="1499" 
                required 
              />
            </div>

            <hr className={styles.divider} />

            <div className={styles.variantHeader}>
              <h3 className={styles.cardTitle}>Variants</h3>
              <button
                type="button"
                className={styles.addVariantButton}
                onClick={addVariant}
              >
                <Plus size={16} />
                <span>Add Variant</span>
              </button>
            </div>

            <div className={styles.variantsList}>
              {variants.map((variant, index) => (
                <div key={index} className={styles.variantCard}>
                  <div className={styles.variantCardHeader}>
                    <h4>Variant {index + 1}</h4>
                    <button
                      type="button"
                      className={styles.removeVariantButton}
                      onClick={() => removeVariant(index)}
                      aria-label={`Remove variant ${index + 1}`}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>

                  <div className={styles.variantGrid}>
                    <div className={styles.inputGroup}>
                      <label>Size</label>
                      <input
                        type="text"
                        value={variant.size}
                        onChange={(e) => handleVariantChange(index, "size", e.target.value)}
                        placeholder="M"
                      />
                    </div>

                    <div className={styles.inputGroup}>
                      <label>Color</label>
                      <input
                        type="text"
                        value={variant.color}
                        onChange={(e) => handleVariantChange(index, "color", e.target.value)}
                        placeholder="Maroon"
                      />
                    </div>

                    <div className={styles.inputGroup}>
                      <label>Variation Name</label>
                      <input
                        type="text"
                        value={variant.variationName}
                        onChange={(e) => handleVariantChange(index, "variationName", e.target.value)}
                        placeholder="Maroon - M"
                      />
                    </div>

                    <div className={styles.inputGroup}>
                      <label>Site SKU</label>
                      <input
                        type="text"
                        value={variant.sku}
                        onChange={(e) => handleVariantChange(index, "sku", e.target.value)}
                        placeholder="UOsTMRnHs-Mn-M"
                      />
                    </div>

                    <div className={styles.inputGroup}>
                      <label>Qikink Product SKU / Catalog SKU</label>
                      <input
                        type="text"
                        value={variant.qikinkCatalogSku}
                        onChange={(e) => handleVariantChange(index, "qikinkCatalogSku", e.target.value)}
                        placeholder="UOsTMRnHs-Mn-M"
                      />
                    </div>

                    <div className={styles.inputGroup}>
                      <label>Qikink Product SKU (Legacy)</label>
                      <input
                        type="text"
                        value={variant.qikinkProductSku}
                        onChange={(e) => handleVariantChange(index, "qikinkProductSku", e.target.value)}
                        placeholder="UOsTMRnHs-Mn-M"
                      />
                    </div>

                    <div className={styles.inputGroup}>
                      <label>Qikink Store SKU</label>
                      <input
                        type="text"
                        value={variant.qikinkStoreSku}
                        onChange={(e) => handleVariantChange(index, "qikinkStoreSku", e.target.value)}
                        placeholder="v-..."
                      />
                    </div>

                    <div className={styles.inputGroup}>
                      <label>Qikink Design SKU</label>
                      <input
                        type="text"
                        value={variant.qikinkDesignSku}
                        onChange={(e) => handleVariantChange(index, "qikinkDesignSku", e.target.value)}
                        placeholder="design-sku"
                      />
                    </div>

                    <div className={styles.inputGroup}>
                      <label>Print Type ID</label>
                      <input
                        type="number"
                        min="1"
                        step="1"
                        value={variant.qikinkPrintTypeId}
                        onChange={(e) => handleVariantChange(index, "qikinkPrintTypeId", e.target.value)}
                        placeholder="1"
                      />
                    </div>

                    <div className={styles.inputGroup}>
                      <label>Product Cost</label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={variant.qikinkProductCost}
                        onChange={(e) => handleVariantChange(index, "qikinkProductCost", e.target.value)}
                        placeholder="294"
                      />
                    </div>

                    <div className={styles.inputGroup}>
                      <label>Selling Cost</label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={variant.qikinkSellingCost}
                        onChange={(e) => handleVariantChange(index, "qikinkSellingCost", e.target.value)}
                        placeholder="1239"
                      />
                    </div>

                    <div className={`${styles.inputGroup} ${styles.variantImageUrl}`}>
                      <label>Qikink Image URL</label>
                      <input
                        type="url"
                        value={variant.qikinkImageUrl}
                        onChange={(e) => handleVariantChange(index, "qikinkImageUrl", e.target.value)}
                        placeholder="https://..."
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {formError && <p className={styles.formError}>{formError}</p>}
          </div>
        </div>

        {/* Right Column */}
        <div className={styles.sideCol}>
          <div className={styles.card}>
            <h3 className={styles.cardTitle}>Status</h3>
            <div className={styles.inputGroup}>
              <select name="status" value={formData.status} onChange={handleInputChange}>
                <option value="draft">Draft</option>
                <option value="active">Active</option>
              </select>
              <p className={styles.helpText}>
                Active products will be visible on your storefront immediately.
              </p>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
