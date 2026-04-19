"use client";

import { useMemo, useState } from "react";
import styles from "./HRGrowthInternApplicationFlow.module.css";

interface RoleMeta {
  jobId: string;
  jobSlug: string;
  jobTitle: string;
}

interface Props {
  role: RoleMeta;
}

type AvailabilityAnswer = "yes" | "no";

type ApplicationState = {
  fullName: string;
  email: string;
  phone: string;
  city: string;
  linkedin: string;
  additionalLink: string;
  isStudent: boolean | null;
  studentDetails: {
    institute: string;
    university: string;
    course: string;
    specialization: string;
    currentYear: string;
    completionYear: string;
  };
  experienceDetails: {
    highestQualification: string;
    currentStatus: string;
    company: string;
    role: string;
    experience: string;
  };
  motivation: string;
  availability: {
    availableMayJune: AvailabilityAnswer | "";
    performanceBased: AvailabilityAnswer | "";
    hybridComfortable: AvailabilityAnswer | "";
  };
  confirmation: {
    infoCorrect: boolean;
    understandsPerformanceBased: boolean;
  };
  resumeLink: string;
};

const initialState: ApplicationState = {
  fullName: "",
  email: "",
  phone: "",
  city: "",
  linkedin: "",
  additionalLink: "",
  isStudent: null,
  studentDetails: {
    institute: "",
    university: "",
    course: "",
    specialization: "",
    currentYear: "",
    completionYear: "",
  },
  experienceDetails: {
    highestQualification: "",
    currentStatus: "",
    company: "",
    role: "",
    experience: "",
  },
  motivation: "",
  availability: {
    availableMayJune: "",
    performanceBased: "",
    hybridComfortable: "",
  },
  confirmation: {
    infoCorrect: false,
    understandsPerformanceBased: false,
  },
  resumeLink: "",
};

const stepLabels = [
  "Intro",
  "Basic Details",
  "Student Status",
  "Background",
  "Motivation",
  "Availability",
  "Confirmation",
];

export default function HRGrowthInternApplicationFlow({ role }: Props) {
  const [state, setState] = useState<ApplicationState>(initialState);
  const [step, setStep] = useState(1);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const progressValue = useMemo(() => (step / stepLabels.length) * 100, [step]);

  function updateField<K extends keyof ApplicationState>(key: K, value: ApplicationState[K]) {
    setState((current) => ({ ...current, [key]: value }));
    setError("");
  }

  function updateNestedField(
    group: "studentDetails" | "experienceDetails",
    key: keyof ApplicationState["studentDetails"] | keyof ApplicationState["experienceDetails"],
    value: string,
  ) {
    setState((current) => ({
      ...current,
      [group]: {
        ...(current[group] as any),
        [key]: value,
      },
    }));
    setError("");
  }

  function validateStep() {
    if (step === 2) {
      if (!state.fullName.trim()) return "Full name is required.";
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(state.email.trim())) return "Please enter a valid email address.";
      if (!/^\d{10}$/.test(state.phone.replace(/\D/g, ""))) return "Please enter a valid 10-digit phone number.";
      if (!state.city.trim()) return "City is required.";
      if (!state.linkedin.trim()) return "LinkedIn profile is required.";
      if (!state.resumeLink.trim()) return "Resume link is required.";
    }

    if (step === 3) {
      if (state.isStudent === null) return "Please select whether you are currently a student.";
    }

    if (step === 4) {
      if (state.isStudent) {
        const { institute, university, course, specialization, currentYear, completionYear } = state.studentDetails;
        if (!institute.trim()) return "Institute / college is required.";
        if (!university.trim()) return "University is required.";
        if (!course.trim()) return "Course is required.";
        if (!specialization.trim()) return "Specialization is required.";
        if (!currentYear.trim()) return "Current year is required.";
        if (!completionYear.trim()) return "Year of completion is required.";
      } else {
        const { highestQualification, currentStatus, company, role, experience } = state.experienceDetails;
        if (!highestQualification.trim()) return "Highest qualification is required.";
        if (!currentStatus.trim()) return "Current status is required.";
        if (!company.trim()) return "Current / last company is required.";
        if (!role.trim()) return "Role is required.";
        if (!experience.trim()) return "Experience is required.";
      }
    }

    if (step === 5) {
      if (!state.motivation.trim()) return "Please share why HR / Growth interests you.";
    }

    if (step === 6) {
      const { availableMayJune, performanceBased, hybridComfortable } = state.availability;
      if (!availableMayJune) return "Please confirm availability for May 1 – June 30.";
      if (!performanceBased) return "Please confirm whether you are comfortable with a performance-based internship.";
      if (!hybridComfortable) return "Please confirm whether you are comfortable with a hybrid model.";
    }

    if (step === 7) {
      if (!state.confirmation.infoCorrect) return "Please confirm that the information provided is correct.";
      if (!state.confirmation.understandsPerformanceBased) return "Please confirm that you understand the performance-based nature of this internship.";
    }

    return "";
  }

  async function handleContinue() {
    const validationError = validateStep();
    if (validationError) {
      setError(validationError);
      return;
    }

    if (step < 7) {
      setStep((current) => current + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const response = await fetch("/api/careers/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role: {
            jobId: role.jobId,
            jobSlug: role.jobSlug,
            jobTitle: role.jobTitle,
          },
          fullName: state.fullName.trim(),
          email: state.email.trim().toLowerCase(),
          phone: state.phone.replace(/\D/g, "").slice(-10),
          city: state.city.trim(),
          linkedIn: state.linkedin.trim(),
          additionalLink: state.additionalLink.trim(),
          isStudent: state.isStudent,
          studentDetails: state.isStudent ? state.studentDetails : undefined,
          experienceDetails: state.isStudent ? undefined : state.experienceDetails,
          motivationAnswers: {
            whyHRGrowth: state.motivation.trim(),
          },
          availability: {
            availableMayJune: state.availability.availableMayJune === "yes",
            performanceBased: state.availability.performanceBased === "yes",
            hybridComfortable: state.availability.hybridComfortable === "yes",
          },
          confirmation: state.confirmation,
          resumeLink: state.resumeLink.trim(),
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        setError(data.error || "Unable to submit application.");
        return;
      }

      setSuccess(true);
      setStep(8);
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className={styles.flowShell}>
      <div className={styles.flowPanel}>
        <div className={styles.flowHeader}>
          <span className={styles.sectionHeading}>HR Growth Intern</span>
          <h1 className={styles.flowTitle}>Applying for HR Growth Intern</h1>
          <p className={styles.flowIntro}>
            This is a performance-based internship (not fixed stipend).
            Complete the short application flow to lock in your application.
          </p>

          <div className={styles.progressBar}>
            <div className={styles.progressLabel}>
              <span>{step <= 7 ? `Step ${step} of 7` : "Application complete"}</span>
              <span>{stepLabels[Math.min(step - 1, stepLabels.length - 1)]}</span>
            </div>
            <div className={styles.progressTrack}>
              <div
                className={styles.progressFill}
                style={{ width: `${Math.min(progressValue, 100)}%` }}
              />
            </div>
          </div>
        </div>

        {!success ? (
          <div className={styles.stepContent}>
            {step === 1 && (
              <div>
                <p className={styles.textBlock}>
                  Welcome to the Knytra HR Growth Intern application.
                  This experience is built for applicants who want to work in a hybrid performance-driven environment.
                  Click continue to begin.
                </p>
              </div>
            )}

            {step === 2 && (
              <div className={styles.formGrid}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel} htmlFor="fullName">
                    Full Name
                  </label>
                  <input
                    id="fullName"
                    className={styles.formInput}
                    value={state.fullName}
                    onChange={(e) => updateField("fullName", e.target.value)}
                    placeholder="Enter your full name"
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel} htmlFor="email">
                    Email
                  </label>
                  <input
                    id="email"
                    className={styles.formInput}
                    type="email"
                    value={state.email}
                    onChange={(e) => updateField("email", e.target.value)}
                    placeholder="you@example.com"
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel} htmlFor="phone">
                    Phone Number
                  </label>
                  <input
                    id="phone"
                    className={styles.formInput}
                    type="tel"
                    value={state.phone}
                    onChange={(e) => updateField("phone", e.target.value)}
                    placeholder="10-digit mobile number"
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel} htmlFor="city">
                    City
                  </label>
                  <input
                    id="city"
                    className={styles.formInput}
                    value={state.city}
                    onChange={(e) => updateField("city", e.target.value)}
                    placeholder="City where you are based"
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel} htmlFor="linkedin">
                    LinkedIn Profile
                  </label>
                  <input
                    id="linkedin"
                    className={styles.formInput}
                    type="url"
                    value={state.linkedin}
                    onChange={(e) => updateField("linkedin", e.target.value)}
                    placeholder="https://linkedin.com/in/..."
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel} htmlFor="additionalLink">
                    Additional Link (optional)
                  </label>
                  <input
                    id="additionalLink"
                    className={styles.formInput}
                    type="url"
                    value={state.additionalLink}
                    onChange={(e) => updateField("additionalLink", e.target.value)}
                    placeholder="Portfolio, social profile, or project link"
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel} htmlFor="resumeLink">
                    Resume Link
                  </label>
                  <input
                    id="resumeLink"
                    className={styles.formInput}
                    type="url"
                    value={state.resumeLink}
                    onChange={(e) => updateField("resumeLink", e.target.value)}
                    placeholder="Google Drive, Dropbox or direct link"
                  />
                </div>
              </div>
            )}

            {step === 3 && (
              <div>
                <p className={styles.sectionHeading}>Are you currently a student?</p>
                <div className={styles.optionGrid}>
                  {[
                    { label: "Yes", value: true },
                    { label: "No", value: false },
                  ].map((option) => (
                    <button
                      key={option.label}
                      type="button"
                      className={`${styles.optionCard} ${
                        state.isStudent === option.value ? styles.optionCardActive : ""
                      }`}
                      onClick={() => updateField("isStudent", option.value)}
                    >
                      {option.label}
                    </button>
                  ))}
              </div>
              </div>
            )}

            {step === 4 && (
              <div className={styles.formGrid}>
                {state.isStudent ? (
                  <>
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel} htmlFor="institute">
                        Institute / College
                      </label>
                      <input
                        id="institute"
                        className={styles.formInput}
                        value={state.studentDetails.institute}
                        onChange={(e) => updateNestedField("studentDetails", "institute", e.target.value)}
                        placeholder="Institute or college name"
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel} htmlFor="university">
                        University
                      </label>
                      <input
                        id="university"
                        className={styles.formInput}
                        value={state.studentDetails.university}
                        onChange={(e) => updateNestedField("studentDetails", "university", e.target.value)}
                        placeholder="University name"
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel} htmlFor="course">
                        Course
                      </label>
                      <input
                        id="course"
                        className={styles.formInput}
                        value={state.studentDetails.course}
                        onChange={(e) => updateNestedField("studentDetails", "course", e.target.value)}
                        placeholder="Course name"
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel} htmlFor="specialization">
                        Specialization
                      </label>
                      <input
                        id="specialization"
                        className={styles.formInput}
                        value={state.studentDetails.specialization}
                        onChange={(e) => updateNestedField("studentDetails", "specialization", e.target.value)}
                        placeholder="Specialization or major"
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel} htmlFor="currentYear">
                        Current Year
                      </label>
                      <input
                        id="currentYear"
                        className={styles.formInput}
                        value={state.studentDetails.currentYear}
                        onChange={(e) => updateNestedField("studentDetails", "currentYear", e.target.value)}
                        placeholder="e.g. 2nd year"
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel} htmlFor="completionYear">
                        Year of Completion
                      </label>
                      <input
                        id="completionYear"
                        className={styles.formInput}
                        value={state.studentDetails.completionYear}
                        onChange={(e) => updateNestedField("studentDetails", "completionYear", e.target.value)}
                        placeholder="e.g. 2027"
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel} htmlFor="highestQualification">
                        Highest Qualification
                      </label>
                      <input
                        id="highestQualification"
                        className={styles.formInput}
                        value={state.experienceDetails.highestQualification}
                        onChange={(e) => updateNestedField("experienceDetails", "highestQualification", e.target.value)}
                        placeholder="e.g. MBA, BBA"
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel} htmlFor="currentStatus">
                        Current Status
                      </label>
                      <input
                        id="currentStatus"
                        className={styles.formInput}
                        value={state.experienceDetails.currentStatus}
                        onChange={(e) => updateNestedField("experienceDetails", "currentStatus", e.target.value)}
                        placeholder="e.g. Working, Freelancing, Between roles"
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel} htmlFor="company">
                        Current / Last Company
                      </label>
                      <input
                        id="company"
                        className={styles.formInput}
                        value={state.experienceDetails.company}
                        onChange={(e) => updateNestedField("experienceDetails", "company", e.target.value)}
                        placeholder="Company name"
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel} htmlFor="role">
                        Role
                      </label>
                      <input
                        id="role"
                        className={styles.formInput}
                        value={state.experienceDetails.role}
                        onChange={(e) => updateNestedField("experienceDetails", "role", e.target.value)}
                        placeholder="Your position title"
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel} htmlFor="experience">
                        Experience
                      </label>
                      <input
                        id="experience"
                        className={styles.formInput}
                        value={state.experienceDetails.experience}
                        onChange={(e) => updateNestedField("experienceDetails", "experience", e.target.value)}
                        placeholder="e.g. 2 years 6 months"
                      />
                    </div>
                  </>
                )}
              </div>
            )}

            {step === 5 && (
              <div className={styles.formGroup}>
                <label className={styles.formLabel} htmlFor="motivation">
                  Why HR / Growth?
                </label>
                <textarea
                  id="motivation"
                  className={styles.formTextarea}
                  value={state.motivation}
                  onChange={(e) => updateField("motivation", e.target.value)}
                  placeholder="Tell us what attracts you to HR and growth at Knytra."
                />
              </div>
            )}

            {step === 6 && (
              <div className={styles.formGrid}>
                {([
                  {
                    label: "Available May 1 – June 30?",
                    name: "availableMayJune",
                  },
                  {
                    label: "Comfortable with performance-based internship?",
                    name: "performanceBased",
                  },
                  {
                    label: "Comfortable with hybrid model?",
                    name: "hybridComfortable",
                  },
                ] as const).map((field) => (
                  <div key={field.name} className={styles.formGroup}>
                    <label className={styles.formLabel}>{field.label}</label>
                    <div className={styles.optionGrid}>
                      {[
                        { label: "Yes", value: "yes" as AvailabilityAnswer },
                        { label: "No", value: "no" as AvailabilityAnswer },
                      ].map((option) => (
                        <button
                          key={option.value}
                          type="button"
                          className={`${styles.optionCard} ${
                            state.availability[field.name] === option.value ? styles.optionCardActive : ""
                          }`}
                          onClick={() =>
                            setState((current) => ({
                              ...current,
                              availability: {
                                ...current.availability,
                                [field.name]: option.value,
                              },
                            }))
                          }
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {step === 7 && (
              <div className={styles.formGrid}>
                <div className={styles.checkboxRow}>
                  <input
                    id="infoCorrect"
                    type="checkbox"
                    className={styles.checkboxInput}
                    checked={state.confirmation.infoCorrect}
                    onChange={(e) =>
                      setState((current) => ({
                        ...current,
                        confirmation: {
                          ...current.confirmation,
                          infoCorrect: e.target.checked,
                        },
                      }))
                    }
                  />
                  <label className={styles.checkboxLabel} htmlFor="infoCorrect">
                    I confirm the information provided is accurate.
                  </label>
                </div>
                <div className={styles.checkboxRow}>
                  <input
                    id="understandsPerformance"
                    type="checkbox"
                    className={styles.checkboxInput}
                    checked={state.confirmation.understandsPerformanceBased}
                    onChange={(e) =>
                      setState((current) => ({
                        ...current,
                        confirmation: {
                          ...current.confirmation,
                          understandsPerformanceBased: e.target.checked,
                        },
                      }))
                    }
                  />
                  <label className={styles.checkboxLabel} htmlFor="understandsPerformance">
                    I understand this is a performance-based internship.
                  </label>
                </div>
              </div>
            )}

            {error && <p className={styles.errorMessage}>{error}</p>}

            <div className={styles.actionRow}>
              {step > 1 && (
                <button
                  type="button"
                  className={styles.btnSecondary}
                  onClick={() => setStep((current) => Math.max(1, current - 1))}
                >
                  Back
                </button>
              )}
              <button
                type="button"
                className={styles.btnPrimary}
                onClick={handleContinue}
                disabled={submitting}
              >
                {step === 7 ? submitting ? "Submitting..." : "Submit Application" : "Continue"}
              </button>
            </div>
          </div>
        ) : (
          <div className={styles.successCard}>
            <div className={styles.successTitle}>Application Received</div>
            <p className={styles.successText}>
              Your HR Growth Intern application is with our recruitment team.
              We will review your profile and reach out if you move forward.
            </p>
            <p className={styles.successText}>
              Want to stay in the loop? Join the WhatsApp group for the drive.
            </p>
            <a
              className={styles.successLink}
              href="https://wa.me/1234567890"
              target="_blank"
              rel="noreferrer"
            >
              Join the WhatsApp group
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
