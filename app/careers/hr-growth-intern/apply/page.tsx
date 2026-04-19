import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import HRGrowthInternApplicationFlow from "@/components/HRGrowthInternApplicationFlow";
import { getAdminDb } from "@/lib/firebase-admin";
import { notFound } from "next/navigation";

export const metadata: Metadata = {
  title: "Apply - HR Growth Intern | Knytra",
  description: "Apply for the HR Growth Intern position at Knytra.",
};

async function getJob() {
  const db = getAdminDb();
  const snap = await db
    .collection("careers_jobs")
    .where("slug", "==", "hr-growth-intern")
    .where("status", "==", "open")
    .limit(1)
    .get();

  if (snap.empty) return null;
  const doc = snap.docs[0];
  return { id: doc.id };
}

export default async function HRGrowthInternApplyPage() {
  const job = await getJob();
  if (!job) notFound();

  return (
    <>
      <Navbar />
      <main>
        <HRGrowthInternApplicationFlow
          role={{
            jobId: job.id,
            jobSlug: "hr-growth-intern",
            jobTitle: "HR Growth Intern",
          }}
        />
      </main>
      <Footer />
    </>
  );
}
