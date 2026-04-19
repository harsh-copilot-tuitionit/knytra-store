"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, X, Plus } from "lucide-react";
import styles from "../../careersAdmin.module.css";

export default function EditJobPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [form, setForm] = useState({
    title: "",
    department: "",
    location: "",
    type: "full-time",
    description: "",
    compensation: "",
    status: "draft",
  });
  const [requirements, setRequirements] = useState<string[]>([""]);
  const [responsibilities, setResponsibilities] = useState<string[]>([
    "",
  ]);
  const [perks, setPerks] = useState<string[]>([""]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try {
      const res = await fetch(`/api/careers/jobs/${id}`);
      if (res.ok) {
        const data = await res.json();
        setForm({
          title: data.title ?? "",
          department: data.department ?? "",
          location: data.location ?? "",
          type: data.type ?? "full-time",
          description: data.description ?? "",
          compensation: data.compensation ?? "",
          status: data.status ?? "draft",
        });
        setRequirements(
          data.requirements?.length ? data.requirements : [""],
        );
        setResponsibilities(
          data.responsibilities?.length
            ? data.responsibilities
            : [""],
        );
        setPerks(data.perks?.length ? data.perks : [""]);
      } else if (res.status === 404) {
        router.replace("/careers/admin/jobs");
      }
    } finally {
      setLoading(false);
    }
  }, [id, router]);

  useEffect(() => {
    void load();
  }, [load]);

  function update(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setError("");
  }

  function updateListItem(
    list: string[],
    setList: (v: string[]) => void,
    index: number,
    value: string,
  ) {
    const updated = [...list];
    updated[index] = value;
    setList(updated);
  }

  function removeListItem(
    list: string[],
    setList: (v: string[]) => void,
    index: number,
  ) {
    setList(list.filter((_, i) => i !== index));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSaving(true);

    try {
      const res = await fetch(`/api/careers/jobs/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          requirements: requirements.filter((r) => r.trim()),
          responsibilities: responsibilities.filter((r) => r.trim()),
          perks: perks.filter((r) => r.trim()),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to update job.");
        return;
      }

      router.push("/careers/admin/jobs");
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className={styles.formPage}>
        <div className={styles.pageHeader}>
          <h1 className={styles.pageTitle}>Loading...</h1>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.formPage}>
      <Link href="/careers/admin/jobs" className={styles.backLink}>
        <ArrowLeft size={14} /> Back to Jobs
      </Link>

      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Edit Position</h1>
        <p className={styles.pageSubtitle}>{form.title}</p>
      </div>

      <form className={styles.form} onSubmit={handleSubmit} noValidate>
        <div className={styles.formRow}>
          <div className={styles.formField}>
            <label className={styles.formLabel} htmlFor="title">
              Job Title *
            </label>
            <input
              id="title"
              className={styles.formInput}
              type="text"
              value={form.title}
              onChange={(e) => update("title", e.target.value)}
              required
            />
          </div>
          <div className={styles.formField}>
            <label className={styles.formLabel} htmlFor="department">
              Department
            </label>
            <input
              id="department"
              className={styles.formInput}
              type="text"
              value={form.department}
              onChange={(e) => update("department", e.target.value)}
            />
          </div>
        </div>

        <div className={styles.formRow}>
          <div className={styles.formField}>
            <label className={styles.formLabel} htmlFor="location">
              Location
            </label>
            <input
              id="location"
              className={styles.formInput}
              type="text"
              value={form.location}
              onChange={(e) => update("location", e.target.value)}
            />
          </div>
          <div className={styles.formField}>
            <label className={styles.formLabel} htmlFor="type">
              Employment Type
            </label>
            <select
              id="type"
              className={styles.formSelect}
              value={form.type}
              onChange={(e) => update("type", e.target.value)}
            >
              <option value="full-time">Full-Time</option>
              <option value="part-time">Part-Time</option>
              <option value="contract">Contract</option>
              <option value="internship">Internship</option>
            </select>
          </div>
        </div>

        <div className={styles.formRow}>
          <div className={styles.formField}>
            <label className={styles.formLabel} htmlFor="compensation">
              Compensation
            </label>
            <input
              id="compensation"
              className={styles.formInput}
              type="text"
              value={form.compensation}
              onChange={(e) => update("compensation", e.target.value)}
            />
          </div>
          <div className={styles.formField}>
            <label className={styles.formLabel} htmlFor="status">
              Status
            </label>
            <select
              id="status"
              className={styles.formSelect}
              value={form.status}
              onChange={(e) => update("status", e.target.value)}
            >
              <option value="draft">Draft</option>
              <option value="open">Open</option>
              <option value="closed">Closed</option>
            </select>
          </div>
        </div>

        <div className={styles.formField}>
          <label className={styles.formLabel} htmlFor="description">
            Job Description
          </label>
          <textarea
            id="description"
            className={styles.formTextarea}
            value={form.description}
            onChange={(e) => update("description", e.target.value)}
          />
        </div>

        <div className={styles.formField}>
          <label className={styles.formLabel}>Responsibilities</label>
          <div className={styles.listEditor}>
            {responsibilities.map((item, i) => (
              <div key={i} className={styles.listItem}>
                <input
                  className={styles.listItemInput}
                  value={item}
                  onChange={(e) =>
                    updateListItem(
                      responsibilities,
                      setResponsibilities,
                      i,
                      e.target.value,
                    )
                  }
                  placeholder={`Responsibility ${i + 1}`}
                />
                {responsibilities.length > 1 && (
                  <button
                    type="button"
                    className={styles.listRemoveBtn}
                    onClick={() =>
                      removeListItem(
                        responsibilities,
                        setResponsibilities,
                        i,
                      )
                    }
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              className={styles.listAddBtn}
              onClick={() =>
                setResponsibilities((prev) => [...prev, ""])
              }
            >
              <Plus size={14} style={{ display: "inline" }} /> Add
              responsibility
            </button>
          </div>
        </div>

        <div className={styles.formField}>
          <label className={styles.formLabel}>Requirements</label>
          <div className={styles.listEditor}>
            {requirements.map((item, i) => (
              <div key={i} className={styles.listItem}>
                <input
                  className={styles.listItemInput}
                  value={item}
                  onChange={(e) =>
                    updateListItem(
                      requirements,
                      setRequirements,
                      i,
                      e.target.value,
                    )
                  }
                  placeholder={`Requirement ${i + 1}`}
                />
                {requirements.length > 1 && (
                  <button
                    type="button"
                    className={styles.listRemoveBtn}
                    onClick={() =>
                      removeListItem(
                        requirements,
                        setRequirements,
                        i,
                      )
                    }
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              className={styles.listAddBtn}
              onClick={() => setRequirements((prev) => [...prev, ""])}
            >
              <Plus size={14} style={{ display: "inline" }} /> Add
              requirement
            </button>
          </div>
        </div>

        <div className={styles.formField}>
          <label className={styles.formLabel}>Perks</label>
          <div className={styles.listEditor}>
            {perks.map((item, i) => (
              <div key={i} className={styles.listItem}>
                <input
                  className={styles.listItemInput}
                  value={item}
                  onChange={(e) =>
                    updateListItem(perks, setPerks, i, e.target.value)
                  }
                  placeholder={`Perk ${i + 1}`}
                />
                {perks.length > 1 && (
                  <button
                    type="button"
                    className={styles.listRemoveBtn}
                    onClick={() => removeListItem(perks, setPerks, i)}
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              className={styles.listAddBtn}
              onClick={() => setPerks((prev) => [...prev, ""])}
            >
              <Plus size={14} style={{ display: "inline" }} /> Add perk
            </button>
          </div>
        </div>

        {error && (
          <p style={{ color: "#f87171", fontSize: 14 }}>{error}</p>
        )}

        <div className={styles.formActions}>
          <button
            type="submit"
            className={styles.btnPrimary}
            disabled={saving}
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
          <Link
            href="/careers/admin/jobs"
            className={styles.btnSecondary}
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
