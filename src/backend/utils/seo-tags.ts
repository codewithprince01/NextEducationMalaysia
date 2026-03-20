// ============================================================
// SEO TAG UTILITIES
// Ports Laravel helper.php replaceTag(), slugify(), unslugify()
// These are called in EVERY content API endpoint.
// ============================================================

import { DOMAIN, SITE_URL } from '../config/constants';
import type { SeoMeta } from '../types';

/**
 * Replaces %tag% placeholders in SEO strings.
 * Direct port of PHP replaceTag() in helper.php.
 *
 * @example replaceTag('%title% - %currentyear%', { title: 'MBA', currentyear: '2025' })
 *          → 'MBA - 2025'
 */
export function replaceTag(
  str: string | null | undefined,
  tagMap: Record<string, string>
): string {
  if (!str) return '';
  let result = str;
  for (const [key, value] of Object.entries(tagMap)) {
    result = result.replaceAll(`%${key}%`, value ?? '');
  }
  // Collapse extra whitespace — mirrors PHP trim(preg_replace('/\s+/', ' ', $string))
  return result.replace(/\s+/g, ' ').trim();
}

/**
 * Converts a string to a URL-safe slug.
 * Port of PHP slugify() in helper.php.
 */
export function slugify(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Converts a slug back to human-readable text.
 * Port of PHP unslugify() in helper.php.
 */
export function unslugify(slug: string): string {
  return slug
    .replace(/[-_]/g, ' ')
    .trim()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

/**
 * Builds the standard tag substitution map used in every content endpoint.
 * Any extra key/value pairs are merged in.
 */
export function buildTagMap(extra: Record<string, string> = {}): Record<string, string> {
  const now = new Date();
  return {
    currentmonth: now.toLocaleString('en-US', { month: 'short' }), // 'Jan', 'Mar' etc.
    currentyear: String(now.getFullYear()),
    site: SITE_URL,
    domain: DOMAIN,
    ...extra,
  };
}

/**
 * Resolves a single SEO meta block, merging model-level override with a fallback
 * DynamicPageSeo/StaticPageSeo row, then substituting all %tags%.
 *
 * Usage (mirrors the Laravel controller pattern):
 *   const seo = resolveSeo({ model: specialization, dynamic: dseo, tagMap: { title: spec.name } })
 */
export function resolveSeo(params: {
  model?: {
    meta_title?: string | null;
    meta_keyword?: string | null;
    meta_description?: string | null;
    page_content?: string | null;
    seo_rating?: any | null;
    content_image_path?: string | null;
    og_image_path?: string | null;
  } | null;
  fallback?: {
    meta_title?: string | null;
    meta_keyword?: string | null;
    meta_description?: string | null;
    page_content?: string | null;
    og_image_path?: string | null;
    seo_rating?: any | null;
  } | null;
  tagMap?: Record<string, string>;
  defaultImage?: string | null;
}): SeoMeta {
  const { model, fallback, tagMap = {}, defaultImage } = params;
  const tags = buildTagMap(tagMap);

  const raw = (field: 'meta_title' | 'meta_keyword' | 'meta_description' | 'page_content') =>
    model?.[field] || fallback?.[field] || '';

  return {
    meta_title: replaceTag(raw('meta_title'), tags),
    meta_keyword: replaceTag(raw('meta_keyword'), tags),
    meta_description: replaceTag(raw('meta_description'), tags),
    page_content: replaceTag(raw('page_content'), tags),
    og_image_path: model?.content_image_path ?? model?.og_image_path ?? fallback?.og_image_path ?? defaultImage ?? null,
    seo_rating: model?.seo_rating?.toString() === '0' ? '0' : (model?.seo_rating?.toString() ?? fallback?.seo_rating?.toString() ?? ''),
  };
}
