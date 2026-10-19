"use client";

/**
 * Root "/" — one build serves every address, so the root picks the right entry by host name:
 *   fatema.beauty / www  → public site        store.fatema.beauty → store
 *   book.fatema.beauty   → public booking link (same page as /book/)
 *   admin.fatema.beauty  → staff login        kiosk / tv          → their screens
 *   app.fatema.beauty, the store apps (Capacitor) and anything else → patient app splash (P_Splash)
 * Done on the client because the site is a static export (Vercel serves "/" before any rewrite).
 */
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { R } from "@/lib/routes";
import { BG } from "@/lib/tokens";
import { SplashScreen } from "./SplashScreen";
import SitePage from "./site/page";
import StorePage from "./store/page";
import BookPage from "./book/page";

type Entry = "splash" | "site" | "store" | "book" | "redirect" | null;

const REDIRECTS: Record<string, string> = { admin: R.W_Login, kiosk: R.T_Welcome, tv: R.TV_Board };

export default function Root() {
  const router = useRouter();
  const [entry, setEntry] = useState<Entry>(null);

  useEffect(() => {
    const host = window.location.hostname.toLowerCase();
    const sub = host.endsWith(".fatema.beauty") ? host.slice(0, -".fatema.beauty".length) : "";
    if (host === "fatema.beauty" || sub === "www") setEntry("site");
    else if (sub === "store") setEntry("store");
    else if (sub === "book") setEntry("book");
    else if (REDIRECTS[sub]) { setEntry("redirect"); router.replace(REDIRECTS[sub]); }
    else setEntry("splash");
  }, [router]);

  if (entry === "site") return <SitePage />;
  if (entry === "store") return <StorePage />;
  if (entry === "book") return <BookPage />;
  if (entry === "splash") return <SplashScreen />;
  return <div style={{ minHeight: "100dvh", background: BG }} />;
}
