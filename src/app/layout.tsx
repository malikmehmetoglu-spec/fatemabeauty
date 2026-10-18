import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";

const messiri = localFont({
  src: [
    { path: "../fonts/ElMessiri-400.ttf", weight: "400" },
    { path: "../fonts/ElMessiri-500.ttf", weight: "500" },
    { path: "../fonts/ElMessiri-600.ttf", weight: "600" },
    { path: "../fonts/ElMessiri-700.ttf", weight: "700" },
  ],
  variable: "--font-messiri",
  display: "swap",
});

const rubik = localFont({
  src: [
    { path: "../fonts/Rubik-400.ttf", weight: "400" },
    { path: "../fonts/Rubik-500.ttf", weight: "500" },
    { path: "../fonts/Rubik-700.ttf", weight: "700" },
  ],
  variable: "--font-rubik",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Fatema Beauty — Skin Care Center",
  description: "فاطمة بيوتي — مركز العناية بالبشرة",
  manifest: "/manifest.webmanifest",
  icons: { icon: "/icons/icon-192.png", apple: "/icons/icon-192.png" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#ECDDF2",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl" className={`${messiri.variable} ${rubik.variable}`}>
      <body>{children}</body>
    </html>
  );
}
