"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import styles from "../auth.module.css";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading, login } = useAuth();

  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Redirect already-logged-in users
  useEffect(() => {
    if (!loading && user) {
      const next = searchParams.get("next") ?? "/account";
      router.replace(next);
    }
  }, [user, loading, router, searchParams]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await login(form.email.trim(), form.password);
      const next = searchParams.get("next") ?? "/account";
      router.replace(next);
    } catch (err: unknown) {
      setError((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return null;
  if (user) return null;

  return (
    <div className={styles.page}>
      <div className={styles.card}>

        {/* Brand header */}
        <div className={styles.brandRow}>
          <p className={styles.brand}>KNYTRA</p>
          <p className={styles.brandSub}>Sign in to your account</p>
        </div>

        <form onSubmit={handleSubmit} className={styles.form} noValidate>

          {/* Email */}
          <div className={styles.field}>
            <label htmlFor="email" className={styles.label}>Email</label>
            <input
              id="email"
              name="email"
              type="email"
              className={styles.input}
              value={form.email}
              onChange={handleChange}
              placeholder="you@example.com"
              autoComplete="email"
              required
            />
          </div>

          {/* Password */}
          <div className={styles.field}>
            <label htmlFor="password" className={styles.label}>Password</label>
            <input
              id="password"
              name="password"
              type="password"
              className={styles.input}
              value={form.password}
              onChange={handleChange}
              placeholder="Your password"
              autoComplete="current-password"
              required
            />
          </div>

          {/* Error */}
          {error && <p className={styles.error} role="alert">{error}</p>}

          {/* Submit */}
          <button
            type="submit"
            className={styles.submitBtn}
            disabled={submitting}
          >
            {submitting ? "Signing in…" : "Sign In"}
          </button>

          {/* Divider */}
          <div className={styles.divider}>
            <span className={styles.dividerLine} />
            <span className={styles.dividerText}>new to knytra?</span>
            <span className={styles.dividerLine} />
          </div>

          {/* Link to signup */}
          <p className={styles.footerNote}>
            <Link href="/signup">Create an account →</Link>
          </p>

        </form>
      </div>
    </div>
  );
}
