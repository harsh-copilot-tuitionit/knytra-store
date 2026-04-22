"use client";

import { useState } from "react";
import Link from "next/link";
import styles from "../CareersAdminAuth.module.css";

export default function CareersAdminSetupPage() {
  const [uid, setUid] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState("recruiter");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSubmitting(true);

    try {
      const res = await fetch("/api/careers/admin/setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uid, password, name, role }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Setup failed.");
        return;
      }

      setSuccess(
        `Credentials created for UID "${data.uid}". You can now log in.`,
      );
      setUid("");
      setPassword("");
      setName("");
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
        <p className={styles.authSubtitle}>Create Recruiter Credentials</p>

        <form
          className={styles.authForm}
          onSubmit={handleSubmit}
          noValidate
        >
          <div className={styles.authField}>
            <label htmlFor="name" className={styles.authLabel}>
              Full Name
            </label>
            <input
              id="name"
              type="text"
              className={styles.authInput}
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="name"
              required
            />
          </div>

          <div className={styles.authField}>
            <label htmlFor="uid" className={styles.authLabel}>
              Choose a UID
            </label>
            <input
              id="uid"
              type="text"
              className={styles.authInput}
              value={uid}
              onChange={(e) => setUid(e.target.value)}
              placeholder="e.g. harsh, recruiter-01"
              autoComplete="username"
              required
            />
          </div>

          <div className={styles.authField}>
            <label htmlFor="password" className={styles.authLabel}>
              Password (min 8 characters)
            </label>
            <input
              id="password"
              type="password"
              className={styles.authInput}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
              required
            />
          </div>

          <div className={styles.authField}>
            <label htmlFor="role" className={styles.authLabel}>
              Role
            </label>
            <select
              id="role"
              className={styles.authSelect}
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              <option value="recruiter">Recruiter</option>
              <option value="hiring_manager">Hiring Manager</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          {error && <p className={styles.authError}>{error}</p>}
          {success && <p className={styles.authSuccess}>{success}</p>}

          <button
            type="submit"
            className={styles.authBtn}
            disabled={submitting}
          >
            {submitting ? "Creating..." : "Create Credentials"}
          </button>
        </form>

        <p className={styles.authLink}>
          Already set up? <Link href="/careers/admin/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
