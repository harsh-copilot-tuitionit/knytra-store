"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function AdminGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const ADMIN_UID = process.env.NEXT_PUBLIC_ADMIN_UID;

  useEffect(() => {
    if (loading) return;
    if (pathname === "/admin/login") return;
    if (!user || user.uid !== ADMIN_UID) {
      router.replace("/admin/login");
    }
  }, [user, loading, ADMIN_UID, router, pathname]);

  // Still checking auth state
  if (loading) {
    return (
      <div style={{ minHeight: "100vh", background: "#0a0a0a", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ width: 32, height: 32, border: "2px solid #333", borderTopColor: "#fff", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  // On login page — always render it
  if (pathname === "/admin/login") return <>{children}</>;

  // Not the admin
  if (!user || user.uid !== ADMIN_UID) return null;

  return <>{children}</>;
}
