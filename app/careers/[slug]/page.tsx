import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { notFound } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { getAdminDb } from "@/lib/firebase-admin";
import StickyApplyBar from "@/components/StickyApplyBar";
import styles from "../careers.module.css";

interface Props {
  params: Promise<{ slug: string }>;
}

async function getJobBySlug(slug: string) {
  const db = getAdminDb();
  const snap = await db
    .collection("careers_jobs")
    .where("slug", "==", slug)
    .where("status", "==", "open")
    .limit(1)
    .get();

  if (snap.empty) return null;

  const doc = snap.docs[0];
  const d = doc.data();
  return {
    id: doc.id,
    title: d.title ?? "",
    slug: d.slug ?? "",
    department: d.department ?? "",
    location: d.location ?? "",
    type: d.type ?? "full-time",
    description: d.description ?? "",
    requirements: d.requirements ?? [],
    responsibilities: d.responsibilities ?? [],
    perks: d.perks ?? [],
    compensation: d.compensation ?? "",
    status: d.status as string,
    createdAt: d.createdAt?.toDate?.()?.toISOString() ?? null,
    updatedAt: d.updatedAt?.toDate?.()?.toISOString() ?? null,
  };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const job = await getJobBySlug(slug);

  if (!job) {
    return { title: "Position Not Found | Knytra" };
  }

  return {
    title: `${job.title} | Careers | Knytra`,
    description: `Apply for ${job.title} at Knytra — ${job.department}, ${job.location}. ${job.description.slice(0, 120)}`,
  };
}

export default async function JobDetailPage({ params }: Props) {
  const { slug } = await params;
  const job = await getJobBySlug(slug);

  if (!job) notFound();

  return (
    <>
      <Navbar />
      <main
        style={{
          minHeight: "calc(100vh - 72px)",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div className={styles.page}>
          <section className={styles.hero}>
            <div className={styles.heroInner}>
              <Link href="/careers" className={styles.backLink}>
                <ArrowLeft size={14} /> Back to Careers
              </Link>
              <p className={styles.eyebrow}>{job.department}</p>
              <h1 className={styles.title}>{job.title}</h1>
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "8px",
                  marginTop: "18px",
                }}
              >
                <span className={styles.jobBadge}>{job.location}</span>
                <span className={styles.jobBadge}>
                  {job.type.replace("-", " ")}
                </span>
                {job.compensation && (
                  <span className={styles.jobBadge}>
                    {job.compensation}
                  </span>
                )}
              </div>
            </div>
          </section>

          <div className={styles.content}>
            <div className={styles.jobDetailContent}>
              {/* Left: Job details */}
              <div className={styles.jobBody}>
                {job.description && (
                  <>
                    <h3>About This Role</h3>
                    <p>{job.description}</p>
                  </>
                )}

                {job.responsibilities.length > 0 && (
                  <>
                    <h3>What You Will Do</h3>
                    <ul>
                      {job.responsibilities.map(
                        (item: string, i: number) => (
                          <li key={i}>{item}</li>
                        ),
                      )}
                    </ul>
                  </>
                )}

                {job.requirements.length > 0 && (
                  <>
                    <h3>What We Are Looking For</h3>
                    <ul>
                      {job.requirements.map(
                        (item: string, i: number) => (
                          <li key={i}>{item}</li>
                        ),
                      )}
                    </ul>
                  </>
                )}

                {job.perks && job.perks.length > 0 && (
                  <>
                    <h3>Perks</h3>
                    <ul>
                      {job.perks.map((item: string, i: number) => (
                        <li key={i}>{item}</li>
                      ))}
                    </ul>
                  </>
                )}
              </div>
            </div>
          </div>

          <StickyApplyBar
            href={`/careers/${job.slug}/apply`}
            label={`Applying for ${job.title}`}
          />
        </div>
      </main>
      <Footer />
    </>
  );
}
