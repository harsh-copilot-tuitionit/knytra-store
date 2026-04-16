import { SESSION_COOKIE_NAME } from "@/lib/careers-auth";

export async function POST() {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  const response = Response.json({ success: true });
  response.headers.set(
    "Set-Cookie",
    `${SESSION_COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0${secure}`,
  );
  return response;
}
