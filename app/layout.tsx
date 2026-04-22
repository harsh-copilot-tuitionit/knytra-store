import type { Metadata } from "next";
import { Space_Grotesk, Inter } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import { AuthProvider } from "@/context/AuthContext";
import { WishlistProvider } from "@/context/WishlistContext";
import CartSidebar from "@/components/CartSidebar";
// ...existing code...

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Knytra — Launching 14 May 2026",
  description:
    "Knytra returns with a minimal launch on 14 May 2026. Join the waitlist for first access to the new drop.",
  keywords: [
    "Indian streetwear",
    "launch",
    "coming soon",
    "waitlist",
    "Knytra",
  ],
  openGraph: {
    title: "Knytra — Launching 14 May 2026",
    description:
      "Knytra returns with a minimal launch on 14 May 2026. Join the waitlist for first access.",
    url: "https://knytra.com",
    siteName: "Knytra",
    type: "website",
    locale: "en_IN",
  },
  twitter: {
    card: "summary_large_image",
    title: "Knytra — Launching 14 May 2026",
    description:
      "Knytra returns with a minimal launch on 14 May 2026. Join the waitlist for first access.",
  },
  robots: {
    index: true,
    follow: true,
  },
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://knytra.com"
  ),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${spaceGrotesk.variable} ${inter.variable}`}
    >
      <body>
        <AuthProvider>
          <WishlistProvider>
            <CartProvider>
              <CartSidebar />
              {children}
            </CartProvider>
          </WishlistProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
