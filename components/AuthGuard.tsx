"use client";

import { useEffect } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

function getNextPath(pathname: string, searchParams: URLSearchParams): string {
  const qs = searchParams.toString();
  return qs ? `${pathname}?${qs}` : pathname;
}

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (loading || user) return;
    const next = getNextPath(pathname || "/", searchParams);
    router.replace(`/login?next=${encodeURIComponent(next)}`);
  }, [loading, pathname, router, searchParams, user]);

  if (loading) {
    return (
      <div
        style={{
          minHeight: "45vh",
          display: "grid",
          placeItems: "center",
          fontFamily: "var(--font-body)",
          color: "#666",
          fontSize: "14px",
        }}
      >
        Loading...
      </div>
    );
  }

  if (!user) return null;

  return <>{children}</>;
}
