import { NextRequest, NextResponse } from 'next/server';

type Bucket = {
  count: number;
  resetAt: number;
};

const buckets = new Map<string, Bucket>();

function getClientIp(req: NextRequest): string {
  const forwarded = req.headers.get('x-forwarded-for') || '';
  const ip = forwarded.split(',')[0]?.trim();
  if (ip) return ip;
  const realIp = req.headers.get('x-real-ip');
  if (realIp) return realIp.trim();
  return 'unknown';
}

export function createRateLimitMiddleware(options: {
  keyPrefix: string;
  windowMs: number;
  max: number;
}) {
  const { keyPrefix, windowMs, max } = options;

  return async function rateLimit(request: NextRequest): Promise<NextResponse | null> {
    const now = Date.now();
    const key = `${keyPrefix}:${getClientIp(request)}`;
    const current = buckets.get(key);

    if (!current || current.resetAt <= now) {
      buckets.set(key, { count: 1, resetAt: now + windowMs });
      return null;
    }

    current.count += 1;
    buckets.set(key, current);

    if (current.count > max) {
      const retryAfter = Math.max(1, Math.ceil((current.resetAt - now) / 1000));
      return NextResponse.json(
        {
          status: false,
          message: 'Too many requests. Please try again later.',
        },
        {
          status: 429,
          headers: {
            'Retry-After': String(retryAfter),
          },
        }
      );
    }

    return null;
  };
}

export const authRateLimit = createRateLimitMiddleware({
  keyPrefix: 'auth',
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 25,
});
