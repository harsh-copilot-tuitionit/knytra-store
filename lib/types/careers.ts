/**
 * KNYTRA — Recruitment & Careers Types
 */

export type JobType = "full-time" | "part-time" | "contract" | "internship";
export type JobStatus = "open" | "closed" | "draft";

export type ApplicationStatus =
  | "received"
  | "screening"
  | "shortlisted"
  | "interview"
  | "assessment"
  | "offer"
  | "hired"
  | "rejected";

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
  createdAt: string | null;
  updatedAt: string | null;
}

export interface ApplicationNote {
  text: string;
  author: string;
  createdAt: string;
}

export interface ApplicationTimelineEntry {
  status: ApplicationStatus;
  note: string;
  author: string;
  createdAt: string;
}

export interface CareerApplication {
  id: string;
  jobId: string;
  jobTitle: string;
  name: string;
  email: string;
  phone: string;
  resumeUrl: string;
  portfolioUrl: string;
  coverLetter: string;
  experience: string;
  currentRole: string;
  linkedIn: string;
  status: ApplicationStatus;
  notes: ApplicationNote[];
  timeline: ApplicationTimelineEntry[];
  createdAt: string | null;
  updatedAt: string | null;
}

export interface CareersAdmin {
  uid: string;
  name: string;
  role: "recruiter" | "hiring_manager" | "admin";
  createdAt: string;
  lastLogin: string | null;
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
};

export const APPLICATION_STATUS_ORDER: ApplicationStatus[] = [
  "received",
  "screening",
  "shortlisted",
  "interview",
  "assessment",
  "offer",
  "hired",
];

export const JOB_TYPE_LABELS: Record<JobType, string> = {
  "full-time": "Full-Time",
  "part-time": "Part-Time",
  contract: "Contract",
  internship: "Internship",
};
