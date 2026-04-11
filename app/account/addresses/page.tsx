"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { track } from "@/lib/analytics";
import styles from "./addresses.module.css";

// ── Types ──────────────────────────────────────────────────────────────────
interface Address {
  id: string;
  name: string;
  phone: string;
  line1: string;
  line2: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  isDefault: boolean;
  createdAt: number | null;
  updatedAt: number | null;
}

// ── Indian states list ─────────────────────────────────────────────────────
const INDIAN_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka",
  "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya",
  "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim",
  "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand",
  "West Bengal",
  // UTs
  "Andaman and Nicobar Islands", "Chandigarh",
  "Dadra and Nagar Haveli and Daman and Diu", "Delhi",
  "Jammu and Kashmir", "Ladakh", "Lakshadweep", "Puducherry",
];

// ── Empty form ─────────────────────────────────────────────────────────────
const EMPTY_FORM = {
  name: "", phone: "", line1: "", line2: "",
  city: "", state: "", pincode: "", isDefault: false,
};

type FormState = typeof EMPTY_FORM;

// ── Helpers ────────────────────────────────────────────────────────────────
function formatAddress(a: Address): string {
  const parts = [a.line1, a.line2, a.city, a.state, a.pincode, a.country]
    .filter(Boolean);
  return parts.join(", ");
}

function normalisePhoneInput(raw: string): string {
  return raw.replace(/\D/g, "").slice(0, 10);
}

// ── Page ───────────────────────────────────────────────────────────────────
export default function AddressesPage() {
  const router              = useRouter();
  const { user, loading }   = useAuth();

  const [addresses,    setAddresses]    = useState<Address[]>([]);
  const [pageLoading,  setPageLoading]  = useState(true);
  const [pageError,    setPageError]    = useState<string | null>(null);

  // Modal state
  const [showModal,    setShowModal]    = useState(false);
  const [editTarget,   setEditTarget]   = useState<Address | null>(null); // null = new address
  const [form,         setForm]         = useState<FormState>(EMPTY_FORM);
  const [formError,    setFormError]    = useState<string | null>(null);
  const [submitting,   setSubmitting]   = useState(false);

  // Per-card action loading
  const [deletingId,   setDeletingId]   = useState<string | null>(null);
  const [defaultingId, setDefaultingId] = useState<string | null>(null);

  const fetchIdRef = useRef(0);

  // ── Fetch addresses ────────────────────────────────────────────────────
  const fetchAddresses = useCallback(async () => {
    if (!user) return;
    const fetchId = ++fetchIdRef.current;

    setPageLoading(true);
    setPageError(null);

    try {
      const token = await user.getIdToken();
      const res   = await fetch("/api/addresses", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (fetchIdRef.current !== fetchId) return;

      if (res.status === 401) {
        router.replace("/login?next=/account/addresses");
        return;
      }
      if (!res.ok) {
        setPageError("Failed to load addresses. Please try again.");
        return;
      }

      const data = await res.json();
      setAddresses(data.addresses ?? []);
    } catch {
      if (fetchIdRef.current === fetchId) {
        setPageError("Something went wrong. Please try again.");
      }
    } finally {
      if (fetchIdRef.current === fetchId) setPageLoading(false);
    }
  }, [user, router]);

  useEffect(() => {
    if (user) fetchAddresses();
  }, [user, fetchAddresses]);

  // ── Modal helpers ──────────────────────────────────────────────────────
  function openAdd() {
    setEditTarget(null);
    setForm(EMPTY_FORM);
    setFormError(null);
    setShowModal(true);
  }

  function openEdit(addr: Address) {
    setEditTarget(addr);
    setForm({
      name:      addr.name,
      phone:     addr.phone,
      line1:     addr.line1,
      line2:     addr.line2,
      city:      addr.city,
      state:     addr.state,
      pincode:   addr.pincode,
      isDefault: addr.isDefault,
    });
    setFormError(null);
    setShowModal(true);
  }

  function closeModal() {
    if (submitting) return;
    setShowModal(false);
    setEditTarget(null);
    setForm(EMPTY_FORM);
    setFormError(null);
  }

  function handleFormChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) {
    const { name, value, type } = e.target;
    setFormError(null);
    const nextValue =
      name === "phone"
        ? normalisePhoneInput(value)
        : name === "pincode"
          ? value.replace(/\D/g, "").slice(0, 6)
          : value;
    setForm(prev => ({
      ...prev,
      [name]: type === "checkbox"
        ? (e.target as HTMLInputElement).checked
        : nextValue,
    }));
  }

  // ── Submit (create or update) ──────────────────────────────────────────
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user || submitting) return;

    setSubmitting(true);
    setFormError(null);

    try {
      const token = await user.getIdToken();
      const isEdit = editTarget !== null;
      const url    = isEdit ? `/api/addresses/${editTarget.id}` : "/api/addresses";
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });

      if (res.status === 401) {
        router.replace("/login?next=/account/addresses");
        return;
      }

      const data = await res.json();

      if (!res.ok) {
        setFormError(data.error ?? "An error occurred. Please try again.");
        return;
      }

      // Optimistic update: apply changes locally, then re-fetch for consistency
      if (isEdit) {
        setAddresses(prev =>
          prev
            .map(a => {
              if (form.isDefault && a.id !== editTarget.id) {
                return { ...a, isDefault: false };
              }
              if (a.id === editTarget.id) return { ...a, ...data };
              return a;
            })
            .sort((a, b) => {
              if (a.isDefault !== b.isDefault) return a.isDefault ? -1 : 1;
              return (b.createdAt ?? 0) - (a.createdAt ?? 0);
            }),
        );

        track("address_saved", {
          source: "account_addresses",
          type: "edit",
          isDefault: form.isDefault,
        });
      } else {
        setAddresses(prev => {
          const updated = form.isDefault
            ? prev.map(a => ({ ...a, isDefault: false }))
            : prev;
          return [data, ...updated]
            .sort((a, b) => {
              if (a.isDefault !== b.isDefault) return a.isDefault ? -1 : 1;
              return (b.createdAt ?? 0) - (a.createdAt ?? 0);
            });
        });

        track("address_saved", {
          source: "account_addresses",
          type: "new",
          isDefault: form.isDefault,
        });
      }

      closeModal();
    } catch {
      setFormError("Network error. Please check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  }

  // ── Delete ─────────────────────────────────────────────────────────────
  async function handleDelete(addr: Address) {
    if (!user || deletingId) return;

    const confirmed = window.confirm(
      addr.isDefault
        ? "This is your default address. Deleting it will promote the most recent remaining address. Continue?"
        : "Delete this address?",
    );
    if (!confirmed) return;

    setDeletingId(addr.id);
    setPageError(null); // clear any previous error banner

    try {
      const token = await user.getIdToken();
      const res   = await fetch(`/api/addresses/${addr.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.status === 401) {
        router.replace("/login?next=/account/addresses");
        return;
      }
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setPageError(data.error ?? "Failed to delete address. Please try again.");
        return;
      }

      // Functional update — avoids stale closure over `addresses`
      setAddresses(prev => {
        const updated = prev.filter(a => a.id !== addr.id);
        if (addr.isDefault && updated.length > 0) {
          const mostRecent = [...updated].sort(
            (a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0),
          )[0];
          return updated.map(a =>
            a.id === mostRecent.id ? { ...a, isDefault: true } : a,
          );
        }
        return updated;
      });
    } catch {
      setPageError("Network error. Please try again.");
    } finally {
      setDeletingId(null);
    }
  }

  // ── Set as default ─────────────────────────────────────────────────────
  async function handleSetDefault(addr: Address) {
    if (!user || defaultingId || addr.isDefault) return;

    setDefaultingId(addr.id);
    setPageError(null); // clear any previous error banner

    try {
      const token = await user.getIdToken();
      const res   = await fetch(`/api/addresses/${addr.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ ...addr, isDefault: true }),
      });

      if (res.status === 401) {
        router.replace("/login?next=/account/addresses");
        return;
      }
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setPageError(data.error ?? "Failed to update address. Please try again.");
        return;
      }

      // Optimistic update
      setAddresses(prev =>
        prev
          .map(a => ({ ...a, isDefault: a.id === addr.id }))
          .sort((a, b) => {
            if (a.isDefault !== b.isDefault) return a.isDefault ? -1 : 1;
            return (b.createdAt ?? 0) - (a.createdAt ?? 0);
          }),
      );
    } catch {
      setPageError("Network error. Please try again.");
    } finally {
      setDefaultingId(null);
    }
  }

  // ── Gate ───────────────────────────────────────────────────────────────
  if (loading || !user) return null;

  const anyActionLoading = !!deletingId || !!defaultingId || submitting;

  // ── Render ─────────────────────────────────────────────────────────────
  return (
    <>
      <div className={styles.page}>

        {/* ── Header ── */}
        <div className={styles.header}>
          <div className={styles.headerInner}>
            <Link href="/account" className={styles.backBtn}>← Account</Link>
            <h1 className={styles.title}>Saved Addresses</h1>
          </div>
        </div>

        <div className={styles.body}>

          {/* ── Error banner ── */}
          {pageError && (
            <div className={styles.errorBanner}>
              <span>{pageError}</span>
              <button
                className={styles.retryBtn}
                onClick={() => void fetchAddresses()}
                disabled={pageLoading}
              >
                Retry
              </button>
            </div>
          )}

          {/* ── Top bar ── */}
          {!pageLoading && (
            <div className={styles.topBar}>
              <span className={styles.count}>
                {addresses.length} / 10 saved
              </span>
              <button
                className={styles.addBtn}
                onClick={openAdd}
                disabled={addresses.length >= 10 || anyActionLoading || showModal}
              >
                + Add Address
              </button>
            </div>
          )}

          {/* ── Skeletons ── */}
          {pageLoading && (
            <div className={styles.grid}>
              {Array.from({ length: 2 }).map((_, i) => (
                <div key={i} className={`${styles.skeletonCard} skeleton`} />
              ))}
            </div>
          )}

          {/* ── Empty state ── */}
          {!pageLoading && addresses.length === 0 && (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon} aria-hidden="true">📍</div>
              <p>No saved addresses.</p>
              <button
                className={styles.addBtn}
                onClick={openAdd}
                disabled={anyActionLoading || showModal}
              >
                + Add address
              </button>
            </div>
          )}

          {/* ── Address grid ── */}
          {!pageLoading && addresses.length > 0 && (
            <div className={styles.grid}>
              {addresses.map(addr => (
                <div
                  key={addr.id}
                  className={`${styles.card} ${addr.isDefault ? styles.isDefault : ""}`}
                >
                  {addr.isDefault && (
                    <span className={styles.defaultBadge}>Default</span>
                  )}

                  <div>
                    <p className={styles.cardName}>{addr.name}</p>
                    <p className={styles.cardPhone}>{addr.phone}</p>
                  </div>

                  <p className={styles.cardAddress}>
                    {formatAddress(addr)}
                  </p>

                  <div className={styles.cardActions}>
                    <button
                      className={styles.actionBtn}
                      onClick={() => openEdit(addr)}
                      disabled={anyActionLoading || showModal}
                    >
                      Edit
                    </button>

                    {!addr.isDefault && (
                      <button
                        className={styles.actionBtn}
                        onClick={() => handleSetDefault(addr)}
                        disabled={anyActionLoading || showModal}
                      >
                        {defaultingId === addr.id ? "Saving…" : "Set Default"}
                      </button>
                    )}

                    <button
                      className={`${styles.actionBtn} ${styles.actionBtnDanger}`}
                      onClick={() => handleDelete(addr)}
                      disabled={anyActionLoading || showModal}
                    >
                      {deletingId === addr.id ? "Deleting…" : "Delete"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>
      </div>

      {/* ── Modal ── */}
      {showModal && (
        <div
          className={styles.overlay}
          onClick={e => { if (e.target === e.currentTarget) closeModal(); }}
        >
          <div className={styles.modal} role="dialog" aria-modal="true">
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>
                {editTarget ? "Edit Address" : "Add New Address"}
              </h2>
              <button className={styles.closeBtn} onClick={closeModal} aria-label="Close">
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit} noValidate style={{ display: "contents" }}>

              {/* Name */}
              <div className={styles.fieldGroup}>
                <label className={styles.label} htmlFor="addr-name">Full Name</label>
                <input
                  id="addr-name"
                  className={styles.input}
                  name="name"
                  value={form.name}
                  onChange={handleFormChange}
                  placeholder="First Last"
                  autoComplete="name"
                  disabled={submitting}
                />
              </div>

              {/* Phone */}
              <div className={styles.fieldGroup}>
                <label className={styles.label} htmlFor="addr-phone">Phone</label>
                <input
                  id="addr-phone"
                  className={styles.input}
                  name="phone"
                  type="tel"
                  value={form.phone}
                  onChange={handleFormChange}
                  placeholder="9876543210"
                  autoComplete="tel"
                  maxLength={10}
                  disabled={submitting}
                />
              </div>

              {/* Line 1 */}
              <div className={styles.fieldGroup}>
                <label className={styles.label} htmlFor="addr-line1">Address Line 1</label>
                <input
                  id="addr-line1"
                  className={styles.input}
                  name="line1"
                  value={form.line1}
                  onChange={handleFormChange}
                  placeholder="Flat / House no., Street, Area"
                  autoComplete="address-line1"
                  disabled={submitting}
                />
              </div>

              {/* Line 2 */}
              <div className={styles.fieldGroup}>
                <label className={styles.label} htmlFor="addr-line2">
                  Address Line 2{" "}
                  <span className={styles.optionalTag}>(optional)</span>
                </label>
                <input
                  id="addr-line2"
                  className={styles.input}
                  name="line2"
                  value={form.line2}
                  onChange={handleFormChange}
                  placeholder="Landmark, Colony (optional)"
                  autoComplete="address-line2"
                  disabled={submitting}
                />
              </div>

              {/* City + Pincode */}
              <div className={styles.fieldRow}>
                <div className={styles.fieldGroup}>
                  <label className={styles.label} htmlFor="addr-city">City</label>
                  <input
                    id="addr-city"
                    className={styles.input}
                    name="city"
                    value={form.city}
                    onChange={handleFormChange}
                    placeholder="New Delhi"
                    autoComplete="address-level2"
                    disabled={submitting}
                  />
                </div>
                <div className={styles.fieldGroup}>
                  <label className={styles.label} htmlFor="addr-pincode">Pincode</label>
                  <input
                    id="addr-pincode"
                    className={styles.input}
                    name="pincode"
                    value={form.pincode}
                    onChange={handleFormChange}
                    placeholder="110001"
                    autoComplete="postal-code"
                    maxLength={6}
                    disabled={submitting}
                  />
                </div>
              </div>

              {/* State */}
              <div className={styles.fieldGroup}>
                <label className={styles.label} htmlFor="addr-state">State</label>
                <select
                  id="addr-state"
                  className={styles.select}
                  name="state"
                  value={form.state}
                  onChange={handleFormChange}
                  disabled={submitting}
                >
                  <option value="">Select state</option>
                  {INDIAN_STATES.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              {/* Default checkbox */}
              <div className={styles.defaultRow}>
                <input
                  id="addr-default"
                  type="checkbox"
                  name="isDefault"
                  checked={form.isDefault}
                  onChange={handleFormChange}
                  disabled={submitting || (editTarget?.isDefault ?? false)}
                />
                <label htmlFor="addr-default">Set as default address</label>
              </div>

              {/* Form error */}
              {formError && (
                <div className={styles.formError}>{formError}</div>
              )}

              {/* Buttons */}
              <button
                type="submit"
                className={styles.submitBtn}
                disabled={submitting}
              >
                {submitting
                  ? (editTarget ? "Saving…" : "Adding…")
                  : (editTarget ? "Save Changes" : "Add Address")}
              </button>

              <button
                type="button"
                className={styles.cancelBtn}
                onClick={closeModal}
                disabled={submitting}
              >
                Cancel
              </button>

            </form>
          </div>
        </div>
      )}
    </>
  );
}
