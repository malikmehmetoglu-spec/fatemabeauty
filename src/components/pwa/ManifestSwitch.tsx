"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { DOMAIN } from "@/lib/hosts";
import { isStoreContext } from "./useInstall";

/**
 * The admin is its own installable app: on admin.fatema.beauty (and on /admin/* anywhere) point the page at
 * /admin.webmanifest (start_url /admin/, scope /admin/). On Vercel the admin host also gets it by rewrite.
 * The store is a third app: store.fatema.beauty → /store-host.webmanifest (scope "/" of that origin);
 * /store, /cart, /checkout, /orders on other hosts → /store.webmanifest (id & scope /store/).
 */
export function ManifestSwitch() {
  const pathname = usePathname() || "/";
  useEffect(() => {
    const host = window.location.hostname;
    const admin = host === `admin.${DOMAIN}` || pathname.startsWith("/admin");
    const store = !admin && isStoreContext(pathname);
    const link = document.querySelector<HTMLLinkElement>('link[rel="manifest"]');
    const href = admin ? "/admin.webmanifest" : store ? (host === `store.${DOMAIN}` ? "/store-host.webmanifest" : "/store.webmanifest") : "/manifest.webmanifest";
    if (link && link.getAttribute("href") !== href) link.setAttribute("href", href);
    const apple = document.querySelector<HTMLLinkElement>('link[rel="apple-touch-icon"]');
    const icon = admin ? "/icons/admin-192.png" : store ? "/icons/store-apple-180.png" : "/icons/icon-192.png";
    if (apple && apple.getAttribute("href") !== icon) apple.setAttribute("href", icon);
  }, [pathname]);
  return null;
}
