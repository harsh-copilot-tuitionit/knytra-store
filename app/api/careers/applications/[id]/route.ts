import { NextRequest } from "next/server";
import { getSessionFromRequest } from "@/lib/careers-auth";
import { getApplicationById, updateApplication, hasApplicationEmailBeenSent, logApplicationEmail } from "@/lib/ats/application-service";
import { getEmailTemplateForStage, sendCareerEmail } from "@/lib/email/career-email-service";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = getSessionFromRequest(request.cookies);
  if (!session) {
    return Response.json({ error: "Unauthorized." }, { status: 401 });
  }

  const { id } = await params;

  try {
    const application = await getApplicationById(id);
    if (!application) {
      return Response.json({ error: "Application not found." }, { status: 404 });
    }
    return Response.json(application);
  } catch (error) {
    console.error("[GET /api/careers/applications/id]", error);
    return Response.json(
      { error: "Failed to fetch application." },
      { status: 500 },
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = getSessionFromRequest(request.cookies);
  if (!session) {
    return Response.json({ error: "Unauthorized." }, { status: 401 });
  }

  const { id } = await params;

  try {
    const body = await request.json();
    // Fetch old application for stage comparison and email log
    const oldApp = await getApplicationById(id);
    const oldStage = oldApp?.currentStage ?? oldApp?.stage ?? "received";

    const application = await updateApplication(id, {
      stage: body.stage,
      note: body.note,
      evaluation: body.evaluation,
      candidate: body.candidate,
      author: session.uid,
    });

    if (!application) {
      return Response.json({ error: "Application not found." }, { status: 404 });
    }

    // --- Automatic email logic ---
    let emailResult: { attempted: boolean; success?: boolean; error?: string; type?: string } = { attempted: false };
    const newStage = application.currentStage ?? application.stage ?? "received";
    const forceEmail = !!body.forceEmail;
    if (
      body.stage &&
      oldStage !== newStage &&
      newStage !== "received" &&
      newStage !== "screening"
    ) {
      const templateType = getEmailTemplateForStage(newStage);
      if (templateType) {
        const alreadySent = forceEmail ? false : await hasApplicationEmailBeenSent(id, templateType);
        if (!alreadySent) {
          try {
            const log = await sendCareerEmail({
              to: application.email,
              type: templateType,
              candidateName: application.fullName,
              jobTitle: application.jobTitle || application.role?.jobTitle,
              sentBy: session.uid,
            });
            if (log.success) {
              await logApplicationEmail(id, log);
              emailResult = { attempted: true, success: true, type: templateType };
            } else {
              emailResult = { attempted: true, success: false, error: "SMTP send failed" };
            }
          } catch (err) {
            emailResult = { attempted: true, success: false, error: err instanceof Error ? err.message : "Failed to send email" };
          }
        } else {
          emailResult = { attempted: false };
        }
      } else {
        emailResult = { attempted: false };
      }
    } else {
      emailResult = { attempted: false };
    }

    return Response.json({ application, email: emailResult });
  } catch (error) {
    console.error("[PUT /api/careers/applications/id]", error);
    return Response.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to update application.",
      },
      { status: 500 },
    );
  }
}
