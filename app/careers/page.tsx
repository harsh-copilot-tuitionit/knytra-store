import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { getAdminDb } from "@/lib/firebase-admin";
import type { CareerJob } from "@/lib/types/careers";
import styles from "./careers.module.css";

export const metadata: Metadata = {
  title: "Careers | Knytra",
  description:
    "Join the team building the next era of Indian streetwear. View open positions at Knytra.",
};

const TICKER = [
  "Build with intent",
  "Street-first culture",
  "Small team, big impact",
  "Creative freedom",
  "Design-led brand",
  "Delhi roots, global ambition",
];

const CULTURE = [
  {
    id: "01",
    title: "Ownership Over Titles",
    text: "You own your work end-to-end. No hand-offs to a committee. Ship it, own it, iterate.",
  },
  {
    id: "02",
    title: "Speed With Craft",
    text: "We move fast but we don't cut corners. Every pixel, stitch, and word matters.",
  },
  {
    id: "03",
    title: "Street Sensibility",
    text: "Our best ideas come from the city, not the boardroom. Stay plugged into the culture.",
  },
  {
    id: "04",
    title: "No Ego, Just Work",
    text: "Small team means everyone contributes everywhere. The best idea wins, regardless of who said it.",
  },
];

async function getOpenJobs(): Promise<CareerJob[]> {
  try {
    const db = getAdminDb();
    const snap = await db
      .collection("careers_jobs")
      .where("status", "==", "open")
      .orderBy("createdAt", "desc")
      .get();

    return snap.docs.map((doc) => {
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
        compensation: d.compensation ?? "",
        status: d.status ?? "open",
        createdAt: d.createdAt?.toDate?.()?.toISOString() ?? null,
        updatedAt: d.updatedAt?.toDate?.()?.toISOString() ?? null,
      };
    });
  } catch {
    return [];
  }
}

export default async function CareersPage() {
  const jobs = await getOpenJobs();

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
          {/* ── Hero ── */}
          <section className={styles.hero}>
            <div className={styles.heroInner}>
              <p className={styles.eyebrow}>Careers</p>
              <h1 className={styles.title}>
                Shape the future of Indian streetwear.
              </h1>
              <p className={styles.subtitle}>
                Knytra is building something different — a brand rooted in
                intent, not trends. We are looking for people who move with
                purpose, create with conviction, and want to leave a mark on
                the culture.
              </p>
              <div className={styles.heroActions}>
                <a href="#open-roles" className={styles.ctaPrimary}>
                  View Open Roles
                </a>
                <Link href="/about" className={styles.ctaGhost}>
                  Our Story
                </Link>
              </div>

              <div className={styles.ticker} aria-hidden="true">
                <div className={styles.tickerTrack}>
                  {[...TICKER, ...TICKER].map((item, i) => (
                    <span
                      key={`${item}-${i}`}
                      className={styles.tickerItem}
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <div className={styles.content}>
            {/* ── Culture ── */}
            <section className={styles.section}>
              <div className={styles.sectionHeader}>
                <p className={styles.sectionEyebrow}>Culture</p>
                <h2 className={styles.sectionTitle}>
                  How we work at Knytra.
                </h2>
              </div>
              <p className={styles.sectionText}>
                We are a small, intentional team. Everyone here shapes the
                brand directly — from product decisions to creative direction.
                No layers, no red tape.
              </p>

              <div className={styles.statGrid}>
                <article className={styles.statCard}>
                  <span className={styles.statValue}>Remote</span>
                  <span className={styles.statLabel}>Work setup</span>
                </article>
                <article className={styles.statCard}>
                  <span className={styles.statValue}>Lean</span>
                  <span className={styles.statLabel}>Team size</span>
                </article>
                <article className={styles.statCard}>
                  <span className={styles.statValue}>Creative</span>
                  <span className={styles.statLabel}>Environment</span>
                </article>
                <article className={styles.statCard}>
                  <span className={styles.statValue}>Fast</span>
                  <span className={styles.statLabel}>Decision making</span>
                </article>
              </div>
            </section>

            <section className={styles.section}>
              <div className={styles.sectionHeader}>
                <p className={styles.sectionEyebrow}>Values</p>
                <h2 className={styles.sectionTitle}>
                  What we stand for as a team.
                </h2>
              </div>
              <div className={styles.valueGrid}>
                {CULTURE.map((item) => (
                  <article key={item.id} className={styles.valueCard}>
                    <span className={styles.valueIndex}>{item.id}</span>
                    <h3>{item.title}</h3>
                    <p>{item.text}</p>
                  </article>
                ))}
              </div>
              <div className={styles.statementBand}>
                We hire people, not resumes. Show us what you have built and
                why it matters.
              </div>
            </section>

            {/* ── Open Positions ── */}
            <section className={styles.section} id="open-roles">
              <div className={styles.sectionHeader}>
                <p className={styles.sectionEyebrow}>Open Roles</p>
                <h2 className={styles.sectionTitle}>
                  Current openings at Knytra.
                </h2>
              </div>

              {jobs.length > 0 ? (
                <div className={styles.jobsGrid}>
                  {jobs.map((job) => (
                    <Link
                      key={job.id}
                      href={`/careers/${job.slug}`}
                      className={styles.jobCard}
                    >
                      <span className={styles.jobCardDept}>
                        {job.department}
                      </span>
                      <h3 className={styles.jobCardTitle}>{job.title}</h3>
                      <div className={styles.jobCardMeta}>
                        <span className={styles.jobBadge}>
                          {job.location}
                        </span>
                        <span className={styles.jobBadge}>
                          {job.type.replace("-", " ")}
                        </span>
                      </div>
                      <span className={styles.jobCardCta}>
                        View Role <ArrowRight size={14} />
                      </span>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className={styles.emptyJobs}>
                  <p>
                    No open positions right now. Check back soon — we are
                    always growing.
                  </p>
                </div>
              )}
            </section>

            {/* ── How to Apply ── */}
            <section className={styles.section}>
              <div className={styles.sectionHeader}>
                <p className={styles.sectionEyebrow}>Process</p>
                <h2 className={styles.sectionTitle}>How hiring works.</h2>
              </div>
              <div className={styles.timeline}>
                <article className={styles.timelineItem}>
                  <span className={styles.timelineStep}>01</span>
                  <div>
                    <h3 className={styles.timelineTitle}>Apply</h3>
                    <p className={styles.timelineText}>
                      Pick a role and submit your application with relevant
                      links and a short cover letter.
                    </p>
                  </div>
                </article>
                <article className={styles.timelineItem}>
                  <span className={styles.timelineStep}>02</span>
                  <div>
                    <h3 className={styles.timelineTitle}>Screening</h3>
                    <p className={styles.timelineText}>
                      Our team reviews every application. We look for
                      alignment with the role, culture fit, and proof of
                      work.
                    </p>
                  </div>
                </article>
                <article className={styles.timelineItem}>
                  <span className={styles.timelineStep}>03</span>
                  <div>
                    <h3 className={styles.timelineTitle}>Interview</h3>
                    <p className={styles.timelineText}>
                      A conversation with the team — no trick questions.
                      We want to understand how you think and what drives
                      you.
                    </p>
                  </div>
                </article>
                <article className={styles.timelineItem}>
                  <span className={styles.timelineStep}>04</span>
                  <div>
                    <h3 className={styles.timelineTitle}>Offer</h3>
                    <p className={styles.timelineText}>
                      If it is a fit, we move fast. Expect a clear offer and
                      quick onboarding.
                    </p>
                  </div>
                </article>
              </div>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
