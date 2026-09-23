/**
 * Global Constants
 *
 * Centralized configuration constants matching the existing Laravel setup.
 */

function normalizeSiteOrigin(raw?: string | null): string {
  const fallback = "https://www.educationmalaysia.in";
  const input = String(raw || fallback).trim();
  try {
    const url = new URL(input);
    const host = url.hostname.toLowerCase();
    if (host === "educationmalaysia.in") {
      url.hostname = "www.educationmalaysia.in";
    }
    return url.origin;
  } catch {
    return fallback;
  }
}

const rawImageBase = (
  process.env.NEXT_PUBLIC_IMAGE_BASE_URL || "http://localhost:3000"
)
  .trim()
  .replace(/\/+$/, "");
export const SITE_URL = normalizeSiteOrigin(
  process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL,
);
export const IMAGE_BASE_URL = rawImageBase;
/**
 * CDN/image delivery base. If CDN is configured, prefer it; otherwise fall back to admin image host.
 * Keeps existing behavior unchanged unless NEXT_PUBLIC_IMAGE_CDN_URL is provided.
 */
export const IMAGE_DELIVERY_BASE_URL = (
  process.env.NEXT_PUBLIC_IMAGE_CDN_URL || IMAGE_BASE_URL
)
  .trim()
  .replace(/\/+$/, "");
/** @deprecated use IMAGE_BASE_URL Instead */
export const NEXT_PUBLIC_IMAGE_BASE_URL = IMAGE_BASE_URL;
export const ADMIN_URL =
  process.env.NEXT_PUBLIC_ADMIN_URL || "https://admin.educationmalaysia.in";
export const SITE_VAR = process.env.SITE_VAR || "MYS";

/** Storage URL for images served from Laravel admin */
export function storageUrl(path: string | null | undefined): string | null {
  if (!path) return null;
  const cleaned = String(path).trim();
  if (!cleaned || /^https?:?$/i.test(cleaned)) return null;
  if (/^https?:\/\//i.test(cleaned)) {
    try {
      const url = new URL(cleaned);
      return url.hostname ? cleaned : null;
    } catch {
      return null;
    }
  }
  const stripped = cleaned.replace(/^\/+/, "").replace(/^storage\/+/, "").replace(/^public\/+/, "");
  const relativePath = `/storage/${stripped}`;
  if (
    !IMAGE_DELIVERY_BASE_URL ||
    IMAGE_DELIVERY_BASE_URL.includes("localhost") ||
    IMAGE_DELIVERY_BASE_URL.includes("127.0.0.1")
  ) {
    return relativePath;
  }
  return `${IMAGE_DELIVERY_BASE_URL}${relativePath}`;
}

/** Full site URL for a given path */
export function siteUrl(path: string): string {
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${SITE_URL}${cleanPath}`;
}

/** Default revalidation times (seconds) */
export const REVALIDATE = {
  UNIVERSITY: 86400, // 24 hours
  COURSE: 86400, // 24 hours
  BLOG: 21600, // 6 hours
  LANDING: 43200, // 12 hours
  SPECIALIZATION: 86400, // 24 hours
  SCHOLARSHIP: 86400, // 24 hours
  HOME: 43200, // 12 hours
} as const;
