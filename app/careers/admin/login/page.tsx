"use client";

import { useState } from "react";
import Link from "next/link";
import styles from "../CareersAdminAuth.module.css";

export default function CareersAdminLoginPage() {
  const [uid, setUid] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const res = await fetch("/api/careers/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uid, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Login failed.");
        return;
      }

      window.location.href = "/careers/admin";
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className={styles.authPage}>
      <div className={styles.authCard}>
        <h1 className={styles.authLogo}>KNYTRA</h1>
        <p className={styles.authSubtitle}>Recruitment Dashboard</p>

        <form
          className={styles.authForm}
          onSubmit={handleSubmit}
          noValidate
        >
          <div className={styles.authField}>
            <label htmlFor="uid" className={styles.authLabel}>
              Recruiter UID
            </label>
            <input
              id="uid"
              type="text"
              className={styles.authInput}
              value={uid}
              onChange={(e) => setUid(e.target.value)}
              autoComplete="username"
              required
            />
          </div>

          <div className={styles.authField}>
            <label htmlFor="password" className={styles.authLabel}>
              Password
            </label>
            <input
              id="password"
              type="password"
              className={styles.authInput}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
          </div>

          {error && <p className={styles.authError}>{error}</p>}

          <button
            type="submit"
            className={styles.authBtn}
            disabled={submitting}
          >
            {submitting ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <p className={styles.authLink}>
          First time? <Link href="/careers/admin/setup">Create credentials</Link>
        </p>
      </div>
    </div>
  );
}
