"use client";

import { useState } from "react";
import styles from "../careers.module.css";

interface Props {
  jobId: string;
  jobTitle: string;
}

export default function ApplyForm({ jobId, jobTitle }: Props) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    currentRole: "",
    experience: "",
    linkedIn: "",
    resumeUrl: "",
    portfolioUrl: "",
    coverLetter: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  function update(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setError("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const res = await fetch("/api/careers/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobId,
          jobTitle,
          ...form,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong.");
        return;
      }

      setSuccess(true);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (success) {
    return (
      <div className={styles.applyCard}>
        <div className={styles.formSuccess}>
          <p style={{ fontSize: "1.1rem", marginBottom: 8 }}>
            Application submitted!
          </p>
          <p
            style={{
              color: "rgba(255,255,255,0.7)",
              fontSize: "0.9rem",
              fontWeight: 400,
            }}
          >
            We have received your application for {jobTitle}. Our team will
            review it and get back to you.
          </p>
        </div>
      </div>
    );
  }

  return (
    <form className={styles.applyCard} onSubmit={handleSubmit} noValidate>
      <h3 className={styles.applyTitle}>Apply Now</h3>

      <div className={styles.formField}>
        <label className={styles.formLabel} htmlFor="name">
          Full Name *
        </label>
        <input
          id="name"
          className={styles.formInput}
          type="text"
          value={form.name}
          onChange={(e) => update("name", e.target.value)}
          required
          autoComplete="name"
        />
      </div>

      <div className={styles.formField}>
        <label className={styles.formLabel} htmlFor="email">
          Email *
        </label>
        <input
          id="email"
          className={styles.formInput}
          type="email"
          value={form.email}
          onChange={(e) => update("email", e.target.value)}
          required
          autoComplete="email"
        />
      </div>

      <div className={styles.formField}>
        <label className={styles.formLabel} htmlFor="phone">
          Phone *
        </label>
        <input
          id="phone"
          className={styles.formInput}
          type="tel"
          value={form.phone}
          onChange={(e) => update("phone", e.target.value)}
          placeholder="10-digit number"
          required
          autoComplete="tel"
        />
      </div>

      <div className={styles.formField}>
        <label className={styles.formLabel} htmlFor="currentRole">
          Current Role
        </label>
        <input
          id="currentRole"
          className={styles.formInput}
          type="text"
          value={form.currentRole}
          onChange={(e) => update("currentRole", e.target.value)}
          placeholder="e.g. Graphic Designer at XYZ"
        />
      </div>

      <div className={styles.formField}>
        <label className={styles.formLabel} htmlFor="experience">
          Years of Experience
        </label>
        <input
          id="experience"
          className={styles.formInput}
          type="text"
          value={form.experience}
          onChange={(e) => update("experience", e.target.value)}
          placeholder="e.g. 2 years"
        />
      </div>

      <div className={styles.formField}>
        <label className={styles.formLabel} htmlFor="linkedIn">
          LinkedIn
        </label>
        <input
          id="linkedIn"
          className={styles.formInput}
          type="url"
          value={form.linkedIn}
          onChange={(e) => update("linkedIn", e.target.value)}
          placeholder="https://linkedin.com/in/..."
        />
      </div>

      <div className={styles.formField}>
        <label className={styles.formLabel} htmlFor="resumeUrl">
          Resume Link *
        </label>
        <input
          id="resumeUrl"
          className={styles.formInput}
          type="url"
          value={form.resumeUrl}
          onChange={(e) => update("resumeUrl", e.target.value)}
          placeholder="Google Drive, Dropbox, or direct link"
        />
      </div>

      <div className={styles.formField}>
        <label className={styles.formLabel} htmlFor="portfolioUrl">
          Portfolio / Work Samples
        </label>
        <input
          id="portfolioUrl"
          className={styles.formInput}
          type="url"
          value={form.portfolioUrl}
          onChange={(e) => update("portfolioUrl", e.target.value)}
          placeholder="Behance, Dribbble, GitHub, or website"
        />
      </div>

      <div className={styles.formField}>
        <label className={styles.formLabel} htmlFor="coverLetter">
          Why Knytra?
        </label>
        <textarea
          id="coverLetter"
          className={styles.formTextarea}
          value={form.coverLetter}
          onChange={(e) => update("coverLetter", e.target.value)}
          placeholder="Tell us why you want to join and what excites you about the role..."
        />
      </div>

      {error && <p className={styles.formError}>{error}</p>}

      <button
        type="submit"
        className={styles.submitBtn}
        disabled={submitting}
      >
        {submitting ? "Submitting..." : "Submit Application"}
      </button>
    </form>
  );
}
