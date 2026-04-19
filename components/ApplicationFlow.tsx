"use client";

import { useEffect, useMemo, useState } from "react";
import type {
  ApplicationConfig,
  JobType,
  Question,
} from "@/lib/types/careers";
import styles from "./ApplicationFlow.module.css";

interface Props {
  jobId: string;
  jobSlug: string;
  jobTitle: string;
  jobType: JobType;
  description: string;
  applicationConfig: ApplicationConfig;
}

type StepId =
  | "intro"
  | "basic"
  | "studentQuestion"
  | "studentDetails"
  | "experienceDetails"
  | "motivation"
  | "assessment"
  | "customQuestions"
  | "availability"
  | "declaration";

const defaultApplicationState = {
  fullName: "",
  email: "",
  phone: "",
  city: "",
  studentStatus: null as boolean | null,
  studentDetails: {
    institute: "",
    university: "",
    course: "",
    specialization: "",
    currentYear: "",
    completionYear: "",
    cgpa: "",
  },
  experienceDetails: {
    highestQualification: "",
    currentStatus: "",
    company: "",
    role: "",
    experience: "",
  },
  motivationAnswers: {
    whyJoinKnytra: "",
    whyThisRole: "",
    relevantExperience: "",
  },
  assessmentAnswers: {
    messageToCandidate: "",
  },
  customAnswers: {} as Record<string, string>,
  availability: {
    availableDuration: "",
    performanceBased: "",
    hybridModel: "",
    hoursPerDay: "",
  },
  declaration: {
    infoCorrect: false,
    understandsPerformanceBased: false,
  },
};

export default function ApplicationFlow({
  jobId,
  jobSlug,
  jobTitle,
  jobType,
  description,
  applicationConfig,
}: Props) {
  const [state, setState] = useState(() => ({ ...defaultApplicationState }));
  const [activeStep, setActiveStep] = useState(0);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const steps = useMemo<StepId[]>(() => {
    const list: StepId[] = ["intro", "basic", "studentQuestion"];

    if (applicationConfig.showStudentSection && state.studentStatus === true) {
      list.push("studentDetails");
    }
    if (applicationConfig.showExperienceSection) {
      list.push("experienceDetails");
    }
    if (applicationConfig.showMotivationSection) {
      list.push("motivation");
    }
    if (applicationConfig.showAssessmentSection) {
      list.push("assessment");
    }
    if (applicationConfig.customQuestions.length > 0) {
      list.push("customQuestions");
    }

    list.push("availability", "declaration");
    return list;
  }, [applicationConfig, state.studentStatus]);

  useEffect(() => {
    if (activeStep >= steps.length) {
      setActiveStep(steps.length - 1);
    }
  }, [activeStep, steps.length]);

  const stepLabel = useMemo(() => {
    const id = steps[activeStep];
    switch (id) {
      case "intro":
        return "Intro";
      case "basic":
        return "Basic Details";
      case "studentQuestion":
        return "Student Status";
      case "studentDetails":
        return "Student Details";
      case "experienceDetails":
        return "Experience";
      case "motivation":
        return "Motivation";
      case "assessment":
        return "Assessment";
      case "customQuestions":
        return "Questions";
      case "availability":
        return "Availability";
      case "declaration":
        return "Declaration";
      default:
        return "";
    }
  }, [activeStep, steps]);

  function updateField<K extends keyof typeof defaultApplicationState>(
    key: K,
    value: typeof defaultApplicationState[K],
  ) {
    setState((current) => ({ ...current, [key]: value }));
    setError("");
  }

  function updateNestedField<
    K extends keyof typeof defaultApplicationState["studentDetails"],
  >(
    group: "studentDetails" | "experienceDetails",
    key: K,
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

  function updateCustomAnswer(questionId: string, value: string) {
    setState((current) => ({
      ...current,
      customAnswers: {
        ...current.customAnswers,
        [questionId]: value,
      },
    }));
    setError("");
  }

  function validateStep(stepId: StepId): string {
    if (stepId === "basic") {
      if (!state.fullName.trim()) return "Full name is required.";
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(state.email.trim()))
        return "Please enter a valid email address.";
      if (!/^\d{10}$/.test(state.phone.replace(/\D/g, "")))
        return "Please enter a valid 10-digit phone number.";
      if (!state.city.trim()) return "City is required.";
    }

    if (stepId === "studentQuestion") {
      if (state.studentStatus === null)
        return "Please tell us if you are currently a student.";
    }

    if (stepId === "studentDetails") {
      if (state.studentStatus !== true) return "";
      const { institute, university, course, specialization, currentYear, completionYear } = state.studentDetails;
      if (!institute.trim()) return "Institute / college is required.";
      if (!university.trim()) return "University is required.";
      if (!course.trim()) return "Course is required.";
      if (!specialization.trim()) return "Specialization is required.";
      if (!currentYear.trim()) return "Current year is required.";
      if (!completionYear.trim()) return "Year of completion is required.";
    }

    if (stepId === "experienceDetails") {
      const { highestQualification, currentStatus, company, role, experience } = state.experienceDetails;
      if (!highestQualification.trim()) return "Highest qualification is required.";
      if (!currentStatus.trim()) return "Current status is required.";
      if (!company.trim()) return "Current / last organization is required.";
      if (!role.trim()) return "Role is required.";
      if (!experience.trim()) return "Experience is required.";
    }

    if (stepId === "motivation") {
      if (!state.motivationAnswers.whyJoinKnytra.trim())
        return "Please tell us why you want to join Knytra.";
      if (!state.motivationAnswers.whyThisRole.trim())
        return "Please tell us why you are interested in this role.";
      if (!state.motivationAnswers.relevantExperience.trim())
        return "Please share any relevant experience.";
    }

    if (stepId === "assessment") {
      if (state.assessmentAnswers.messageToCandidate.trim().length < 80)
        return "Assessment answer must be at least 80 characters.";
    }

    if (stepId === "customQuestions") {
      for (const question of applicationConfig.customQuestions) {
        if (question.required) {
          const value = state.customAnswers[question.id]?.trim() ?? "";
          if (!value) return `Answer required for: ${question.question}`;
        }
      }
    }

    if (stepId === "availability") {
      if (!state.availability.availableDuration)
        return "Please confirm availability for the role.";
      if (!state.availability.performanceBased)
        return "Please confirm performance-based internship comfort.";
      if (!state.availability.hybridModel)
        return "Please confirm hybrid model comfort.";
      if (!state.availability.hoursPerDay.trim())
        return "Please enter the hours per day you can commit.";
    }

    if (stepId === "declaration") {
      if (!state.declaration.infoCorrect)
        return "Please confirm the information is correct.";
      if (!state.declaration.understandsPerformanceBased)
        return "Please confirm you understand the performance-based nature.";
    }

    return "";
  }

  async function handleContinue() {
    const stepId = steps[activeStep];
    const validationError = validateStep(stepId);
    if (validationError) {
      setError(validationError);
      return;
    }

    if (activeStep === steps.length - 1) {
      setSubmitting(true);
      setError("");

      try {
        const response = await fetch("/api/careers/applications", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            role: {
              jobId,
              jobSlug,
              jobTitle,
            },
            fullName: state.fullName.trim(),
            email: state.email.trim().toLowerCase(),
            phone: state.phone.replace(/\D/g, "").slice(-10),
            city: state.city.trim(),
            studentStatus: state.studentStatus,
            studentDetails:
              state.studentStatus === true ? state.studentDetails : null,
            experienceDetails: applicationConfig.showExperienceSection
              ? state.experienceDetails
              : null,
            motivationAnswers: applicationConfig.showMotivationSection
              ? state.motivationAnswers
              : null,
            assessmentAnswers: applicationConfig.showAssessmentSection
              ? state.assessmentAnswers
              : null,
            customAnswers: state.customAnswers,
            availability: {
              availableDuration: state.availability.availableDuration === "yes",
              performanceBased: state.availability.performanceBased === "yes",
              hybridModel: state.availability.hybridModel === "yes",
              hoursPerDay: state.availability.hoursPerDay.trim(),
            },
            declaration: state.declaration,
          }),
        });

        const data = await response.json();
        if (!response.ok) {
          setError(data.error || "Unable to submit application.");
          return;
        }

        setSuccess(true);
      } catch {
        setError("Network error. Please try again.");
      } finally {
        setSubmitting(false);
      }

      return;
    }

    setActiveStep((current) => current + 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
    setError("");
  }

  const currentStepId = steps[activeStep];

  return (
    <div className={styles.flowShell}>
      <div className={styles.flowPanel}>
        <div className={styles.flowHeader}>
          <div className={styles.sectionHeading}>Applying for {jobTitle}</div>
          <h1 className={styles.flowTitle}>{jobTitle}</h1>
          <p className={styles.flowLead}>{description}</p>
          {jobType === "internship" && (
            <p className={styles.flowLead}>
              This is a performance-based internship where incentives depend on performance.
            </p>
          )}
          <div className={styles.progressBar}>
            <div className={styles.progressLabel}>
              <span>Step {activeStep + 1} of {steps.length}</span>
              <span>{stepLabel}</span>
            </div>
            <div className={styles.progressTrack}>
              <div
                className={styles.progressFill}
                style={{ width: `${((activeStep + 1) / steps.length) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {!success ? (
          <div className={styles.stepContent}>
            {currentStepId === "intro" && (
              <div>
                <p className={styles.textBlock}>
                  Complete this short application in focused steps. We ask only what is needed to evaluate your fit for this role.
                </p>
              </div>
            )}

            {currentStepId === "basic" && (
              <div className={styles.formGrid}>
                <div className={styles.formField}>
                  <label className={styles.formLabel}>Full Name</label>
                  <input
                    className={styles.formInput}
                    value={state.fullName}
                    onChange={(e) => updateField("fullName", e.target.value)}
                    placeholder="Your full name"
                  />
                </div>
                <div className={styles.formField}>
                  <label className={styles.formLabel}>Email</label>
                  <input
                    className={styles.formInput}
                    type="email"
                    value={state.email}
                    onChange={(e) => updateField("email", e.target.value)}
                    placeholder="you@example.com"
                  />
                </div>
                <div className={styles.formField}>
                  <label className={styles.formLabel}>Phone Number</label>
                  <input
                    className={styles.formInput}
                    type="tel"
                    value={state.phone}
                    onChange={(e) => updateField("phone", e.target.value)}
                    placeholder="10-digit mobile number"
                  />
                </div>
                <div className={styles.formField}>
                  <label className={styles.formLabel}>City</label>
                  <input
                    className={styles.formInput}
                    value={state.city}
                    onChange={(e) => updateField("city", e.target.value)}
                    placeholder="Your city"
                  />
                </div>
              </div>
            )}

            {currentStepId === "studentQuestion" && (
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
                        state.studentStatus === option.value
                          ? styles.optionCardActive
                          : ""
                      }`}
                      onClick={() => updateField("studentStatus", option.value)}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {currentStepId === "studentDetails" && (
              <div className={styles.formGrid}>
                {[
                  { label: "Institute / College", key: "institute" },
                  { label: "University", key: "university" },
                  { label: "Course", key: "course" },
                  { label: "Specialization", key: "specialization" },
                  { label: "Current Year", key: "currentYear" },
                  { label: "Year of Completion", key: "completionYear" },
                ].map(({ label, key }) => (
                  <div key={key} className={styles.formField}>
                    <label className={styles.formLabel}>{label}</label>
                    <input
                      className={styles.formInput}
                      value={state.studentDetails[key as keyof typeof state.studentDetails]}
                      onChange={(e) =>
                        updateNestedField("studentDetails", key as any, e.target.value)
                      }
                      placeholder={label}
                    />
                  </div>
                ))}
                <div className={styles.formField}>
                  <label className={styles.formLabel}>CGPA (optional)</label>
                  <input
                    className={styles.formInput}
                    value={state.studentDetails.cgpa}
                    onChange={(e) =>
                      updateNestedField("studentDetails", "cgpa" as any, e.target.value)
                    }
                    placeholder="e.g. 8.7"
                  />
                </div>
              </div>
            )}

            {currentStepId === "experienceDetails" && (
              <div className={styles.formGrid}>
                {[
                  { label: "Highest Qualification", key: "highestQualification" },
                  { label: "Current Status", key: "currentStatus" },
                  { label: "Current / Last Organization", key: "company" },
                  { label: "Role", key: "role" },
                  { label: "Total Experience", key: "experience" },
                ].map(({ label, key }) => (
                  <div key={key} className={styles.formField}>
                    <label className={styles.formLabel}>{label}</label>
                    <input
                      className={styles.formInput}
                      value={state.experienceDetails[key as keyof typeof state.experienceDetails]}
                      onChange={(e) =>
                        updateNestedField("experienceDetails", key as any, e.target.value)
                      }
                      placeholder={label}
                    />
                  </div>
                ))}
              </div>
            )}

            {currentStepId === "motivation" && (
              <div className={styles.formGrid}>
                <div className={styles.formField}>
                  <label className={styles.formLabel}>Why do you want to join Knytra?</label>
                  <textarea
                    className={styles.formTextarea}
                    value={state.motivationAnswers.whyJoinKnytra}
                    onChange={(e) =>
                      setState((current) => ({
                        ...current,
                        motivationAnswers: {
                          ...current.motivationAnswers,
                          whyJoinKnytra: e.target.value,
                        },
                      }))
                    }
                    placeholder="Tell us what attracts you to the team and this business."
                  />
                </div>
                <div className={styles.formField}>
                  <label className={styles.formLabel}>Why are you interested in this role?</label>
                  <textarea
                    className={styles.formTextarea}
                    value={state.motivationAnswers.whyThisRole}
                    onChange={(e) =>
                      setState((current) => ({
                        ...current,
                        motivationAnswers: {
                          ...current.motivationAnswers,
                          whyThisRole: e.target.value,
                        },
                      }))
                    }
                    placeholder="What makes this role a fit for your goals?"
                  />
                </div>
                <div className={styles.formField}>
                  <label className={styles.formLabel}>Any relevant experience?</label>
                  <textarea
                    className={styles.formTextarea}
                    value={state.motivationAnswers.relevantExperience}
                    onChange={(e) =>
                      setState((current) => ({
                        ...current,
                        motivationAnswers: {
                          ...current.motivationAnswers,
                          relevantExperience: e.target.value,
                        },
                      }))
                    }
                    placeholder="Share previous work, internships, or projects."
                  />
                </div>
              </div>
            )}

            {currentStepId === "assessment" && (
              <div className={styles.formField}>
                <label className={styles.formLabel}>
                  Write a short message you would send to approach a candidate for an internship role.
                </label>
                <textarea
                  className={styles.formTextarea}
                  value={state.assessmentAnswers.messageToCandidate}
                  onChange={(e) =>
                    setState((current) => ({
                      ...current,
                      assessmentAnswers: {
                        messageToCandidate: e.target.value,
                      },
                    }))
                  }
                  placeholder="Write your message here."
                />
              </div>
            )}

            {currentStepId === "customQuestions" && (
              <div className={styles.formGrid}>
                {applicationConfig.customQuestions.map((question) => (
                  <div key={question.id} className={styles.formField}>
                    <label className={styles.formLabel}>
                      {question.question}
                      {question.required ? " *" : ""}
                    </label>
                    {question.type === "textarea" ? (
                      <textarea
                        className={styles.formTextarea}
                        value={state.customAnswers[question.id] ?? ""}
                        onChange={(e) =>
                          updateCustomAnswer(question.id, e.target.value)
                        }
                      />
                    ) : question.type === "select" ? (
                      <select
                        className={styles.formSelect}
                        value={state.customAnswers[question.id] ?? ""}
                        onChange={(e) =>
                          updateCustomAnswer(question.id, e.target.value)
                        }
                      >
                        <option value="">Select an option</option>
                        {(question.options ?? []).map((option, idx) => (
                          <option key={idx} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        className={styles.formInput}
                        type="text"
                        value={state.customAnswers[question.id] ?? ""}
                        onChange={(e) =>
                          updateCustomAnswer(question.id, e.target.value)
                        }
                      />
                    )}
                  </div>
                ))}
              </div>
            )}

            {currentStepId === "availability" && (
              <div className={styles.formGrid}>
                {[
                  {
                    label: "Available for the duration?",
                    field: "availableDuration",
                  },
                  {
                    label: "Comfortable with performance-based internship?",
                    field: "performanceBased",
                  },
                  {
                    label: "Comfortable with hybrid model?",
                    field: "hybridModel",
                  },
                ].map((item) => (
                  <div key={item.field} className={styles.formField}>
                    <label className={styles.formLabel}>{item.label}</label>
                    <div className={styles.optionGrid}>
                      {[
                        { label: "Yes", value: "yes" },
                        { label: "No", value: "no" },
                      ].map((option) => (
                        <button
                          key={option.value}
                          type="button"
                          className={`${styles.optionCard} ${
                            state.availability[item.field as keyof typeof state.availability] === option.value
                              ? styles.optionCardActive
                              : ""
                          }`}
                          onClick={() =>
                            setState((current) => ({
                              ...current,
                              availability: {
                                ...current.availability,
                                [item.field]: option.value,
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
                <div className={styles.formField}>
                  <label className={styles.formLabel}>Hours per day</label>
                  <input
                    className={styles.formInput}
                    type="text"
                    value={state.availability.hoursPerDay}
                    onChange={(e) =>
                      setState((current) => ({
                        ...current,
                        availability: {
                          ...current.availability,
                          hoursPerDay: e.target.value,
                        },
                      }))
                    }
                    placeholder="e.g. 4-6 hours"
                  />
                </div>
              </div>
            )}

            {currentStepId === "declaration" && (
              <div className={styles.formGrid}>
                <label className={styles.checkboxRow}>
                  <input
                    className={styles.checkboxInput}
                    type="checkbox"
                    checked={state.declaration.infoCorrect}
                    onChange={(e) =>
                      setState((current) => ({
                        ...current,
                        declaration: {
                          ...current.declaration,
                          infoCorrect: e.target.checked,
                        },
                      }))
                    }
                  />
                  <span className={styles.checkboxLabel}>
                    I confirm the information supplied is accurate.
                  </span>
                </label>
                <label className={styles.checkboxRow}>
                  <input
                    className={styles.checkboxInput}
                    type="checkbox"
                    checked={state.declaration.understandsPerformanceBased}
                    onChange={(e) =>
                      setState((current) => ({
                        ...current,
                        declaration: {
                          ...current.declaration,
                          understandsPerformanceBased: e.target.checked,
                        },
                      }))
                    }
                  />
                  <span className={styles.checkboxLabel}>
                    I understand the performance-based nature of this internship.
                  </span>
                </label>
              </div>
            )}

            {error && <p className={styles.errorMessage}>{error}</p>}

            <div className={styles.actionRow}>
              {activeStep > 0 && (
                <button
                  type="button"
                  className={styles.btnSecondary}
                  onClick={() => setActiveStep((current) => Math.max(0, current - 1))}
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
                {activeStep === steps.length - 1
                  ? submitting
                    ? "Submitting..."
                    : "Submit Application"
                  : "Continue"}
              </button>
            </div>
          </div>
        ) : (
          <div className={styles.successCard}>
            <div className={styles.successTitle}>Application Received</div>
            <p className={styles.successText}>
              Your application for {jobTitle} has been received.
              Shortlisted candidates will be contacted via email.
            </p>
            <div className={styles.actionRow}>
              <a href="/careers" className={styles.btnSecondary}>
                Back to Careers
              </a>
              <a href="/" className={styles.btnPrimary}>
                Explore Website
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
