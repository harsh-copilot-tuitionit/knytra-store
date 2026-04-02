"use client";

import { useState } from "react";
import styles from "./EmailCapture.module.css";

type Status = "idle" | "loading" | "success" | "error";

export default function EmailCapture() {
  const [email, setEmail]   = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");

  function resetError() {
    if (status === "error") {
      setStatus("idle");
      setMessage("");
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const trimmed = email.trim();
    if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setStatus("error");
      setMessage("Enter a valid email address.");
      return;
    }

    setStatus("loading");

    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: trimmed }),
      });

      const data = await res.json();

      if (res.ok) {
        setStatus("success");
        setMessage(data.message ?? "You're on the list.");
        setEmail("");
      } else {
        setStatus("error");
        setMessage(data.error ?? "Something went wrong. Try again.");
      }
    } catch {
      setStatus("error");
      setMessage("Connection failed. Please try again.");
    }
  }

  return (
    <div className={styles.container}>
      <p className={styles.heading}>BE THE FIRST TO KNOW</p>

      {status === "success" ? (
        <div className={styles.success} role="status">
          <span className={styles.checkmark} aria-hidden="true">✓</span>
          <p className={styles.successText}>{message}</p>
        </div>
      ) : (
        <form
          className={styles.form}
          onSubmit={handleSubmit}
          noValidate
          aria-label="Join the Knytra waitlist"
        >
          <div
            className={`${styles.inputWrap} ${status === "error" ? styles.inputWrapError : ""}`}
          >
            <input
              id="waitlist-email"
              type="email"
              name="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); resetError(); }}
              placeholder="YOUR EMAIL ADDRESS"
              className={styles.input}
              disabled={status === "loading"}
              aria-label="Your email address"
              aria-describedby={status === "error" ? "email-error" : undefined}
              autoComplete="email"
              spellCheck={false}
            />
            <button
              type="submit"
              id="join-waitlist-btn"
              className={styles.button}
              disabled={status === "loading"}
              aria-label="Join the waitlist"
            >
              {status === "loading" ? (
                <span className={styles.spinner} role="status" aria-label="Submitting…" />
              ) : (
                "NOTIFY ME"
              )}
            </button>
          </div>

          {status === "error" && message && (
            <p id="email-error" className={styles.error} role="alert">
              {message}
            </p>
          )}
        </form>
      )}
    </div>
  );
}
