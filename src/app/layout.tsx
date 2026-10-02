import type { Metadata, Viewport } from "next";
import { Heebo } from "next/font/google";
import "./globals.css";

const heebo = Heebo({
  subsets: ["hebrew", "latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-heebo",
});

export const metadata: Metadata = {
  title: "Travel Vault",
  description: "ארנק נסיעות דיגיטלי למסמכים, כרטיסים ופרטי הטיול",
  applicationName: "Travel Vault",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Travel Vault",
  },
  icons: {
    icon: "/icons/icon-192.png",
    apple: "/icons/apple-touch-icon.png",
  },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#14283a",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="he" dir="rtl" className={`${heebo.variable} h-full`}>
      <body className={`${heebo.className} min-h-dvh antialiased`}>{children}</body>
    </html>
  );
}
