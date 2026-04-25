import { NextRequest, NextResponse } from "next/server";
import { sendCareerEmail } from "@/lib/email/career-email-service";
import { getApplicationById, logApplicationEmail } from "@/lib/ats/application-service";
import type { CareerEmailTemplateType } from "@/lib/email/career-email-templates";
import { getSessionFromRequest } from "@/lib/careers-auth";


export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const session = getSessionFromRequest(req.cookies);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  const { type } = await req.json();
  if (!type) {
    return NextResponse.json({ error: "Missing email type" }, { status: 400 });
  }

  const application = await getApplicationById(id);
  if (!application) {
    return NextResponse.json({ error: "Application not found" }, { status: 404 });
  }

  const to = application.email;
  const candidateName = application.fullName || "Candidate";
  const jobTitle = application.jobTitle || application.role?.jobTitle || undefined;
  const sentBy = session.uid || "admin";

  try {
    const log = await sendCareerEmail({
      to,
      type: type as CareerEmailTemplateType,
      candidateName,
      jobTitle,
      sentBy,
    });
    await logApplicationEmail(id, log);
    return NextResponse.json({ success: true, log });
  } catch (error) {
    const err = error instanceof Error ? error : { message: "Failed to send email" };
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
