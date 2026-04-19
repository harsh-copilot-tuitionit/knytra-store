"use client";

import { useState } from "react";
import type { Question } from "@/lib/types/careers";
import { normalizeApplicationConfig } from "@/lib/types/careers";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, X, Plus, ArrowUp, ArrowDown } from "lucide-react";
import styles from "../../careersAdmin.module.css";

export default function NewJobPage() {
  const router = useRouter();

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
  const [responsibilities, setResponsibilities] = useState<string[]>([""]);
  const [perks, setPerks] = useState<string[]>([""]);
  const [applicationConfig, setApplicationConfig] = useState({
    showStudentSection: false,
    showExperienceSection: false,
    showMotivationSection: false,
    showAssessmentSection: false,
    customQuestions: [] as Question[],
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

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

  function createQuestion(): Question {
    return {
      id:
        typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
          ? crypto.randomUUID()
          : `${Date.now()}-${Math.random()}`,
      question: "",
      type: "text",
      options: [],
      required: true,
    };
  }

  function updateQuestion(
    index: number,
    changes: Partial<Question>,
  ) {
    setApplicationConfig((current) => {
      const updated = [...current.customQuestions];
      updated[index] = { ...updated[index], ...changes };
      return { ...current, customQuestions: updated };
    });
  }

  function removeQuestion(index: number) {
    setApplicationConfig((current) => ({
      ...current,
      customQuestions: current.customQuestions.filter((_, i) => i !== index),
    }));
  }

  function moveQuestion(index: number, direction: -1 | 1) {
    setApplicationConfig((current) => {
      const updated = [...current.customQuestions];
      const nextIndex = index + direction;
      if (nextIndex < 0 || nextIndex >= updated.length) return current;
      const temp = updated[nextIndex];
      updated[nextIndex] = updated[index];
      updated[index] = temp;
      return { ...current, customQuestions: updated };
    });
  }

  function addQuestion() {
    setApplicationConfig((current) => ({
      ...current,
      customQuestions: [...current.customQuestions, createQuestion()],
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSaving(true);

    try {
      const res = await fetch("/api/careers/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          requirements: requirements.filter((r) => r.trim()),
          responsibilities: responsibilities.filter((r) => r.trim()),
          perks: perks.filter((r) => r.trim()),
          applicationConfig: normalizeApplicationConfig(applicationConfig),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to create job.");
        return;
      }

      router.push("/careers/admin/jobs");
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className={styles.formPage}>
      <Link href="/careers/admin/jobs" className={styles.backLink}>
        <ArrowLeft size={14} /> Back to Jobs
      </Link>

      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Create New Position</h1>
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
              placeholder="e.g. Graphic Designer"
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
              placeholder="e.g. Creative"
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
              placeholder="e.g. Remote / Delhi"
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
              placeholder="e.g. ₹4-6L / Stipend based"
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
              <option value="open">Open (visible on careers page)</option>
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
            placeholder="Describe the role, its impact, and what makes it exciting..."
          />
        </div>

        {/* Responsibilities */}
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

        {/* Requirements */}
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

        {/* Perks */}
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
        <div className={styles.formSection}>
          <h2 className={styles.sectionTitle}>Application Flow Configuration</h2>

          <div className={styles.formGrid}>
            {[
              { label: "Student section", key: "showStudentSection" },
              { label: "Experience section", key: "showExperienceSection" },
              { label: "Motivation section", key: "showMotivationSection" },
              { label: "Assessment section", key: "showAssessmentSection" },
            ].map((option) => (
              <label key={option.key} className={styles.checkboxRow}>
                <input
                  type="checkbox"
                  checked={applicationConfig[option.key as keyof typeof applicationConfig] as boolean}
                  onChange={(e) =>
                    setApplicationConfig((current) => ({
                      ...current,
                      [option.key]: e.target.checked,
                    }))
                  }
                />
                <span className={styles.checkboxLabel}>{option.label}</span>
              </label>
            ))}
          </div>

          <div className={styles.formField}>
            <div className={styles.sectionSubtitle}>
              Custom questions will render as part of the application flow.
            </div>
            {applicationConfig.customQuestions.map((question, index) => (
              <div key={question.id} className={styles.customQuestionCard}>
                <div className={styles.customQuestionRow}>
                  <input
                    className={styles.formInput}
                    type="text"
                    value={question.question}
                    onChange={(e) =>
                      updateQuestion(index, { question: e.target.value })
                    }
                    placeholder="Question text"
                  />
                  <button
                    type="button"
                    className={styles.iconButton}
                    onClick={() => moveQuestion(index, -1)}
                    disabled={index === 0}
                  >
                    <ArrowUp size={16} />
                  </button>
                  <button
                    type="button"
                    className={styles.iconButton}
                    onClick={() => moveQuestion(index, 1)}
                    disabled={index === applicationConfig.customQuestions.length - 1}
                  >
                    <ArrowDown size={16} />
                  </button>
                  <button
                    type="button"
                    className={styles.iconButton}
                    onClick={() => removeQuestion(index)}
                  >
                    <X size={16} />
                  </button>
                </div>
                <div className={styles.formRow}>
                  <div className={styles.formField}>
                    <label className={styles.formLabel}>
                      Input type
                    </label>
                    <select
                      className={styles.formSelect}
                      value={question.type}
                      onChange={(e) =>
                        updateQuestion(index, {
                          type: e.target.value as "text" | "textarea" | "select",
                          options: e.target.value === "select" ? question.options ?? [""] : [],
                        })
                      }
                    >
                      <option value="text">Text</option>
                      <option value="textarea">Textarea</option>
                      <option value="select">Select</option>
                    </select>
                  </div>
                  <div className={styles.formField}>
                    <label className={styles.checkboxLabel}>
                      <input
                        type="checkbox"
                        checked={question.required}
                        onChange={(e) =>
                          updateQuestion(index, { required: e.target.checked })
                        }
                      />
                      Required
                    </label>
                  </div>
                </div>
                {question.type === "select" && (
                  <div className={styles.formField}>
                    <label className={styles.formLabel}>
                      Options (comma separated)
                    </label>
                    <input
                      className={styles.formInput}
                      type="text"
                      value={(question.options ?? []).join(", ")}
                      onChange={(e) =>
                        updateQuestion(index, {
                          options: e.target.value
                            .split(",")
                            .map((opt) => opt.trim())
                            .filter(Boolean),
                        })
                      }
                      placeholder="Option 1, Option 2, Option 3"
                    />
                  </div>
                )}
              </div>
            ))}
            <button
              type="button"
              className={styles.listAddBtn}
              onClick={addQuestion}
            >
              <Plus size={14} style={{ display: "inline" }} /> Add question
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
            {saving ? "Creating..." : "Create Position"}
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
