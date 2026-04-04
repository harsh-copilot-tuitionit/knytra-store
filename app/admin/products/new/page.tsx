"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, UploadCloud, X, Save } from "lucide-react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "@/lib/firebase";
import styles from "./newProduct.module.css";
import Image from "next/image";

export default function NewProduct() {
  const router = useRouter();
  
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    status: "draft",
  });
  const [sizes, setSizes] = useState<string[]>([]);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  const availableSizes = ["XS", "S", "M", "L", "XL", "XXL"];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const toggleSize = (size: string) => {
    if (sizes.includes(size)) {
      setSizes(sizes.filter((s) => s !== size));
    } else {
      setSizes([...sizes, size]);
    }
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
    if (!formData.name || !formData.price) return alert("Name and price required");
    
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
        name: formData.name,
        description: formData.description,
        price: Number(formData.price),
        status: formData.status,
        sizes,
        images: uploadedImageUrls,
        createdAt: serverTimestamp(),
      });

      router.push("/admin/products");
    } catch (error) {
      console.error("Error creating product:", error);
      alert("Failed to create product");
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

            <h3 className={styles.cardTitle}>Sizes</h3>
            <div className={styles.sizesGrid}>
              {availableSizes.map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={() => toggleSize(size)}
                  className={`${styles.sizeBtn} ${sizes.includes(size) ? styles.sizeActive : ""}`}
                >
                  {size}
                </button>
              ))}
            </div>
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
