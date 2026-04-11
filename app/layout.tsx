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
  title: "Knytra — Wear the Streets",
  description:
    "A new era of Indian streetwear is coming. Raw, bold, and unapologetically urban. Sign up to be the first to know when we drop.",
  keywords: [
    "Indian streetwear",
    "urban fashion India",
    "streetwear brand",
    "Knytra",
    "raw bold urban clothing",
    "coming soon",
  ],
  openGraph: {
    title: "Knytra — Wear the Streets",
    description:
      "A new era of Indian streetwear is coming. Raw, bold, and unapologetically urban.",
    url: "https://knytra.com",
    siteName: "Knytra",
    type: "website",
    locale: "en_IN",
  },
  twitter: {
    card: "summary_large_image",
    title: "Knytra — Wear the Streets",
    description:
      "A new era of Indian streetwear is coming. Raw, bold, and unapologetically urban.",
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
