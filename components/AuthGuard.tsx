"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (loading || user) return;
    const next = pathname || "/";
    router.replace(`/login?next=${next}`);
  }, [loading, pathname, router, user]);

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
