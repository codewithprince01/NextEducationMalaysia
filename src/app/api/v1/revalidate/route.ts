import { NextRequest } from 'next/server';
import { revalidatePath, revalidateTag } from 'next/cache';
import { withMiddleware, checkApiKey, apiSuccess, apiError } from '@/backend';

// ============================================================
// CACHE REVALIDATION
// Page data is served from unstable_cache with revalidate: 86400,
// so an edit made in the admin panel would otherwise not appear on
// the site for up to 24 hours. Call this after saving content to
// purge the relevant cache immediately.
//
//   POST /api/v1/revalidate
//   Header: X-API-KEY: <FRONTEND_API_KEY>
//   Body:   { "tag": "specialization" }
//        or { "path": "/specialization/aerospace-engineering" }
//        or { "tag": ["specialization", "course"] }
// ============================================================

const ALLOWED_TAGS = [
  'specialization',
  'course',
  'universities',
  'scholarship',
  'blog',
  'seo',
  'institute-types',
  'page-contents',
] as const;

function toList(value: unknown): string[] {
  if (typeof value === 'string') return value.trim() ? [value.trim()] : [];
  if (Array.isArray(value)) {
    return value.filter((item): item is string => typeof item === 'string' && item.trim() !== '').map((item) => item.trim());
  }
  return [];
}

export const POST = withMiddleware(checkApiKey)(async (req: NextRequest) => {
  try {
    const body = await req.json().catch(() => ({}));

    const tags = toList(body.tag ?? body.tags);
    const paths = toList(body.path ?? body.paths);

    if (!tags.length && !paths.length) {
      return apiError('Provide at least one "tag" or "path" to revalidate', 400);
    }

    const invalidTags = tags.filter((tag) => !ALLOWED_TAGS.includes(tag as (typeof ALLOWED_TAGS)[number]));
    if (invalidTags.length) {
      return apiError(`Unknown tag(s): ${invalidTags.join(', ')}. Allowed: ${ALLOWED_TAGS.join(', ')}`, 400);
    }

    // Only site-relative paths — never let a caller purge an arbitrary URL.
    const invalidPaths = paths.filter((path) => !path.startsWith('/') || path.startsWith('//'));
    if (invalidPaths.length) {
      return apiError(`Paths must start with "/": ${invalidPaths.join(', ')}`, 400);
    }

    // Next 16 requires the cache-life profile argument. 'max' is the correct
    // choice from a route handler — updateTag() only works in Server Actions.
    tags.forEach((tag) => revalidateTag(tag, 'max'));
    paths.forEach((path) => revalidatePath(path));

    return apiSuccess({ revalidated: { tags, paths } }, 'Cache revalidated successfully');
  } catch (error: any) {
    return apiError(error.message || 'Failed to revalidate cache', 500);
  }
});
