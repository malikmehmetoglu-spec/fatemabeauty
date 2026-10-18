"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { DOMAIN } from "@/lib/hosts";

/**
 * The admin is its own installable app: on admin.fatema.beauty (and on /admin/* anywhere) point the page at
 * /admin.webmanifest (start_url /admin/, scope /admin/). On Vercel the admin host also gets it by rewrite.
 */
export function ManifestSwitch() {
  const pathname = usePathname() || "/";
  useEffect(() => {
    const admin = window.location.hostname === `admin.${DOMAIN}` || pathname.startsWith("/admin");
    const link = document.querySelector<HTMLLinkElement>('link[rel="manifest"]');
    const href = admin ? "/admin.webmanifest" : "/manifest.webmanifest";
    if (link && link.getAttribute("href") !== href) link.setAttribute("href", href);
  }, [pathname]);
  return null;
}
