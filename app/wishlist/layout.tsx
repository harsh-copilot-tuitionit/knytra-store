import React from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AuthGuard from "@/components/AuthGuard";

export default function WishlistLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <Navbar />
      <main style={{ minHeight: "calc(100vh - 72px)", display: "flex", flexDirection: "column" }}>
        {children}
      </main>
      <Footer />
    </AuthGuard>
  );
}
