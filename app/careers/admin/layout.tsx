import type { Metadata } from "next";
import CareersAdminShell from "./CareersAdminShell";
import React from "react";

export const metadata: Metadata = {
  title: "Recruitment Dashboard | Knytra",
  robots: { index: false, follow: false },
};

export default function CareersAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <CareersAdminShell>{children}</CareersAdminShell>;
}
