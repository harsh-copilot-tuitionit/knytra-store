import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import React from "react";

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <main style={{ minHeight: "calc(100vh - 72px)", display: "flex", flexDirection: "column" }}>
        {children}
      </main>
      <Footer />
    </>
  );
}
