export type JobType = "full-time" | "part-time" | "contract" | "internship";
export type JobStatus = "open" | "closed" | "draft";

export type ApplicationStage =
  | "received"
  | "screening"
  | "shortlisted"
  | "interview"
  | "assessment"
  | "offer"
  | "hired"
  | "rejected";

export type ApplicationLifecycleStatus = "new" | "active" | "hired" | "rejected";

export type ApplicationStatus = ApplicationStage | ApplicationLifecycleStatus;

export type QuestionType = "text" | "textarea" | "select";

export interface Question {
  id: string;
  question: string;
  type: QuestionType;
  options?: string[];
  required: boolean;
}

export interface ApplicationConfig {
  showStudentSection: boolean;
  showExperienceSection: boolean;
  showMotivationSection: boolean;
  showAssessmentSection: boolean;
  customQuestions: Question[];
}

export function normalizeApplicationConfig(
  config?: Partial<ApplicationConfig> | null,
): ApplicationConfig {
  return {
    showStudentSection: Boolean(config?.showStudentSection),
    showExperienceSection: Boolean(config?.showExperienceSection),
    showMotivationSection: Boolean(config?.showMotivationSection),
    showAssessmentSection: Boolean(config?.showAssessmentSection),
    customQuestions: Array.isArray(config?.customQuestions)
      ? config.customQuestions.map((question) => ({
          id:
            question.id ||
            `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          question: question.question ?? "",
          type: question.type ?? "text",
          options: Array.isArray(question.options) ? question.options : [],
          required: Boolean(question.required),
        }))
      : [],
  };
}

export interface ApplicationRole {
  jobId: string;
  jobSlug: string;
  jobTitle: string;
}

export interface ApplicationNote {
  text: string;
  author: string;
  createdAt: string;
}

export interface ApplicationTimelineEntry {
  status: ApplicationStatus;
  action: string;
  note: string;
  author: string;
  createdAt: string;
}

export interface ApplicationStageHistoryEntry {
  fromStage: ApplicationStage | "none";
  toStage: ApplicationStage;
  changedAt: string;
  changedBy: string;
  note?: string;
}

export interface ApplicationEvaluation {
  rating: number;
  strengths: string;
  weaknesses: string;
  notes: string;
}

export interface CandidateProfile {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  city: string;
  applicationsCount: number;
  lastApplicationAt: string | null;
  createdAt: string | null;
  updatedAt: string | null;
}

export interface CareerApplication {
  id: string;
  jobId: string;
  jobTitle: string;
  jobSlug: string;
  role: ApplicationRole;
  candidateId: string;
  candidate: CandidateProfile;
  fullName: string;
  email: string;
  phone: string;
  city: string;
  studentStatus: boolean;
  isStudent: boolean;
  studentDetails?: {
    institute: string;
    university: string;
    course: string;
    specialization: string;
    currentYear: string;
    completionYear: string;
    cgpa?: string;
  } | null;
  experienceDetails?: {
    highestQualification: string;
    currentStatus: string;
    company: string;
    role: string;
    experience: string;
  } | null;
  motivationAnswers?: {
    whyJoinKnytra?: string;
    whyThisRole?: string;
    relevantExperience?: string;
    whyHRGrowth?: string;
  };
  assessmentAnswers?: {
    messageToCandidate: string;
  };
  customAnswers: Record<string, string>;
  availability: {
    availableDuration: boolean;
    performanceBased: boolean;
    hybridModel: boolean;
    hoursPerDay: string;
  };
  declaration: {
    infoCorrect: boolean;
    understandsPerformanceBased: boolean;
  };
  status: ApplicationStatus;
  currentStage: ApplicationStage;
  stage: ApplicationStage;
  stageHistory: ApplicationStageHistoryEntry[];
  evaluation: ApplicationEvaluation;
  notes: ApplicationNote[];
  timeline: ApplicationTimelineEntry[];
  createdAt: string | null;
  updatedAt: string | null;
}

export interface CareerJob {
  id: string;
  title: string;
  slug: string;
  department: string;
  location: string;
  type: JobType;
  description: string;
  requirements: string[];
  responsibilities: string[];
  perks: string[];
  compensation: string;
  status: JobStatus;
  applicationConfig: ApplicationConfig;
  pipelineStages?: ApplicationStage[];
  assignedRecruiters?: string[];
  createdAt: string | null;
  updatedAt: string | null;
}

export interface CareerCandidate {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  city: string;
  applicationsCount: number;
  lastApplicationAt: string | null;
  createdAt: string | null;
  updatedAt: string | null;
}

export interface ApplicationFilters {
  status?: ApplicationStatus;
  jobId?: string;
  stage?: ApplicationStage;
  search?: string;
}

export interface JobInput {
  title: string;
  department?: string;
  location?: string;
  type?: JobType;
  description?: string;
  requirements?: string[];
  responsibilities?: string[];
  perks?: string[];
  compensation?: string;
  status?: JobStatus;
  applicationConfig?: Partial<ApplicationConfig> | null;
  pipelineStages?: ApplicationStage[];
  assignedRecruiters?: string[];
}

export const APPLICATION_STATUS_LABELS: Record<ApplicationStatus, string> = {
  received: "Received",
  screening: "Screening",
  shortlisted: "Shortlisted",
  interview: "Interview",
  assessment: "Assessment",
  offer: "Offer Extended",
  hired: "Hired",
  rejected: "Rejected",
  new: "New",
  active: "Active",
};

export const APPLICATION_STATUS_ORDER: ApplicationStatus[] = [
  "received",
  "screening",
  "shortlisted",
  "interview",
  "assessment",
  "offer",
  "hired",
  "rejected",
];

export const JOB_TYPE_LABELS: Record<JobType, string> = {
  "full-time": "Full-Time",
  "part-time": "Part-Time",
  contract: "Contract",
  internship: "Internship",
};
