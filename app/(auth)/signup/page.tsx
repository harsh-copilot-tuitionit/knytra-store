"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import styles from "../auth.module.css";

export default function SignupPage() {
  const router = useRouter();
  const { user, loading, signUp } = useAuth();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Redirect already-logged-in users
  useEffect(() => {
    if (!loading && user) {
      router.replace("/account");
    }
  }, [user, loading, router]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    // Client-side validation
    if (form.name.trim().length < 2) {
      setError("Please enter your full name.");
      return;
    }
    if (form.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setSubmitting(true);
    try {
      await signUp(form.email.trim(), form.password, form.name.trim());
      router.replace("/account");
    } catch (err: unknown) {
      setError((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  }

  // Don't render while checking auth state
  if (loading) return null;
  // Avoid flash — redirect fires in useEffect above
  if (user) return null;

  return (
    <div className={styles.page}>
      <div className={styles.card}>

        {/* Brand header */}
        <div className={styles.brandRow}>
          <p className={styles.brand}>KNYTRA</p>
          <p className={styles.brandSub}>Create your account</p>
        </div>

        <form onSubmit={handleSubmit} className={styles.form} noValidate>

          {/* Name */}
          <div className={styles.field}>
            <label htmlFor="name" className={styles.label}>Full Name</label>
            <input
              id="name"
              name="name"
              type="text"
              className={styles.input}
              value={form.name}
              onChange={handleChange}
              placeholder="First Last"
              autoComplete="name"
              required
            />
          </div>

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
              placeholder="Min. 6 characters"
              autoComplete="new-password"
              required
            />
          </div>

          {/* Confirm password */}
          <div className={styles.field}>
            <label htmlFor="confirmPassword" className={styles.label}>Confirm Password</label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              className={styles.input}
              value={form.confirmPassword}
              onChange={handleChange}
              placeholder="Re-enter your password"
              autoComplete="new-password"
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
            {submitting ? "Creating account…" : "Create Account"}
          </button>

          {/* Terms note */}
          <p className={styles.termsNote}>
            By creating an account you agree to our{" "}
            <Link href="/terms">Terms of Service</Link> and{" "}
            <Link href="/privacy">Privacy Policy</Link>.
          </p>

          {/* Divider */}
          <div className={styles.divider}>
            <span className={styles.dividerLine} />
            <span className={styles.dividerText}>already have an account?</span>
            <span className={styles.dividerLine} />
          </div>

          {/* Link to login */}
          <p className={styles.footerNote}>
            <Link href="/login">Sign in →</Link>
          </p>

        </form>
      </div>
    </div>
  );
}
