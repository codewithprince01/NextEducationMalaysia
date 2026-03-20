import { NextResponse } from 'next/server';

// ============================================================
// API KEY MIDDLEWARE
// Replicates Laravel CheckApiKey middleware exactly.
// Reads X-API-KEY header, validates against FRONTEND_API_KEY env.
// ============================================================

/**
 * Validates the X-API-KEY header.
 * Returns a 401 NextResponse if invalid, or null if authorized.
 *
 * Usage in a route handler:
 *   const authErr = await checkApiKey(request);
 *   if (authErr) return authErr;
 */
export async function checkApiKey(request: Request): Promise<NextResponse | null> {
  const apiKey = (request.headers.get('x-api-key') || '').trim().replace(/^["']|["']$/g, '');
  const expectedKey = (process.env.FRONTEND_API_KEY || '').trim().replace(/^["']|["']$/g, '');

  if (!expectedKey) {
    console.error('FRONTEND_API_KEY env variable is not set.');
    return NextResponse.json(
      { status: false, message: 'Server configuration error.' },
      { status: 500 }
    );
  }

  if (!apiKey || apiKey !== expectedKey) {
    console.log(`[checkApiKey] Mismatch after cleaning: received="${apiKey}", expected="${expectedKey}"`);
    return NextResponse.json(
      { status: false, message: 'Unauthorized. Invalid API Key.' },
      { status: 401 }
    );
  }

  return null; // Authorized — proceed
}
