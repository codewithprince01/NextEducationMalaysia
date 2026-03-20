import { NextResponse } from 'next/server';

// ============================================================
// RESPONSE UTILITIES
// Standard API response envelope matching Laravel's format:
// { status: bool, message: string, data: any }
// ============================================================

import { serializeBigInt } from './formatters';

export function apiSuccess<T>(
  data: T,
  message = 'Success',
  statusCode = 200,
  extra: Record<string, unknown> = {}
): NextResponse {
  return NextResponse.json(
    { 
      status: true, 
      message, 
      data: serializeBigInt(data), 
      ...serializeBigInt(extra) 
    },
    { status: statusCode }
  );
}

export function apiError(
  message: string,
  statusCode = 500,
  extra: Record<string, unknown> = {}
): NextResponse {
  return NextResponse.json(
    { status: false, message, ...extra },
    { status: statusCode }
  );
}

export function apiValidationError(
  errors: Record<string, string[]>,
  message = 'Validation failed'
): NextResponse {
  return NextResponse.json(
    { status: false, message, errors },
    { status: 422 }
  );
}

export function apiNotFound(message = 'Not found'): NextResponse {
  return NextResponse.json({ status: false, message }, { status: 404 });
}

export function apiUnauthorized(message = 'Unauthorized'): NextResponse {
  return NextResponse.json({ status: false, message }, { status: 401 });
}

export function apiConflict(message = 'Conflict'): NextResponse {
  return NextResponse.json({ status: false, message }, { status: 409 });
}
