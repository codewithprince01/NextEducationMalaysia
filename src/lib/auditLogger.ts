import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyAccessToken } from '@/backend/utils/auth';

export type AuditAction = 'VIEW' | 'CREATE' | 'UPDATE' | 'DELETE' | 'LOGIN' | 'LOGOUT' | 'BULK_ACTION';

export interface AuditLogOptions {
  req?: NextRequest | Request;
  user?: {
    id?: number;
    name?: string;
    email?: string;
    role?: string;
  };
  action: AuditAction;
  module: string;
  recordId?: string | number;
  description?: string;
  oldValues?: any;
  newValues?: any;
  status?: 'success' | 'failed';
}

/**
 * Extract client IP address from request headers
 */
export function getClientIp(req?: NextRequest | Request): string {
  if (!req) return '127.0.0.1';
  try {
    const headers = req.headers;
    const forwardedFor = headers.get('x-forwarded-for');
    if (forwardedFor) {
      return forwardedFor.split(',')[0].trim();
    }
    const realIp = headers.get('x-real-ip') || headers.get('cf-connecting-ip') || headers.get('x-client-ip');
    if (realIp) return realIp.trim();
  } catch {}
  return '127.0.0.1';
}

/**
 * Parse Browser, OS, and Device from User Agent string
 */
export function parseUserAgent(uaString: string = ''): {
  browser: string;
  os: string;
  device: string;
} {
  const ua = uaString.toLowerCase();

  // OS Detection
  let os = 'Unknown OS';
  if (ua.includes('windows nt 10.0')) os = 'Windows 10/11';
  else if (ua.includes('windows nt 6.3')) os = 'Windows 8.1';
  else if (ua.includes('windows nt 6.2')) os = 'Windows 8';
  else if (ua.includes('windows nt 6.1')) os = 'Windows 7';
  else if (ua.includes('windows')) os = 'Windows';
  else if (ua.includes('macintosh') || ua.includes('mac os x')) os = 'macOS';
  else if (ua.includes('android')) os = 'Android';
  else if (ua.includes('iphone') || ua.includes('ipad') || ua.includes('ipod')) os = 'iOS';
  else if (ua.includes('linux')) os = 'Linux';

  // Browser Detection
  let browser = 'Unknown Browser';
  if (ua.includes('edg/')) {
    const match = uaString.match(/Edg\/([\d.]+)/);
    browser = match ? `Edge ${match[1].split('.')[0]}` : 'Edge';
  } else if (ua.includes('chrome/') && !ua.includes('edg/')) {
    const match = uaString.match(/Chrome\/([\d.]+)/);
    browser = match ? `Chrome ${match[1].split('.')[0]}` : 'Chrome';
  } else if (ua.includes('firefox/')) {
    const match = uaString.match(/Firefox\/([\d.]+)/);
    browser = match ? `Firefox ${match[1].split('.')[0]}` : 'Firefox';
  } else if (ua.includes('safari/') && !ua.includes('chrome')) {
    const match = uaString.match(/Version\/([\d.]+)/);
    browser = match ? `Safari ${match[1].split('.')[0]}` : 'Safari';
  } else if (ua.includes('opera/') || ua.includes('opr/')) {
    browser = 'Opera';
  } else if (ua.includes('postman')) {
    browser = 'Postman';
  }

  // Device Detection
  let device = 'Desktop';
  if (ua.includes('mobile') || ua.includes('android') || ua.includes('iphone')) {
    device = 'Mobile';
  } else if (ua.includes('ipad') || ua.includes('tablet')) {
    device = 'Tablet';
  }

  return { browser, os, device };
}

/**
 * Filter sensitive fields before saving in logs
 */
function sanitizeObject(obj: any): any {
  if (!obj || typeof obj !== 'object') return obj;

  const SENSITIVE_KEYS = ['password', 'token', 'access_token', 'refresh_token', 'secret', 'otp'];
  
  if (Array.isArray(obj)) {
    return obj.map(sanitizeObject);
  }

  const result: Record<string, any> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (SENSITIVE_KEYS.some((s) => key.toLowerCase().includes(s))) {
      result[key] = '[REDACTED]';
    } else if (value && typeof value === 'object' && !(value instanceof Date)) {
      result[key] = sanitizeObject(value);
    } else if (typeof value === 'bigint') {
      result[key] = value.toString();
    } else {
      result[key] = value;
    }
  }
  return result;
}

/**
 * Calculate changed values between old and new state
 */
export function computeJsonDiff(oldObj: any, newObj: any): Record<string, { old: any; new: any }> | null {
  if (!oldObj && !newObj) return null;
  const cleanOld = sanitizeObject(oldObj) || {};
  const cleanNew = sanitizeObject(newObj) || {};

  const diff: Record<string, { old: any; new: any }> = {};
  const allKeys = new Set([...Object.keys(cleanOld), ...Object.keys(cleanNew)]);

  for (const key of allKeys) {
    const oldVal = cleanOld[key];
    const newVal = cleanNew[key];

    // Check if serialized values differ
    const strOld = JSON.stringify(oldVal);
    const strNew = JSON.stringify(newVal);

    if (strOld !== strNew) {
      diff[key] = {
        old: oldVal !== undefined ? oldVal : null,
        new: newVal !== undefined ? newVal : null,
      };
    }
  }

  return Object.keys(diff).length > 0 ? diff : null;
}

/**
 * Resolve user details from request or options
 */
async function resolveUser(req?: NextRequest | Request, explicitUser?: AuditLogOptions['user']) {
  if (explicitUser && (explicitUser.id || explicitUser.name || explicitUser.email)) {
    return explicitUser;
  }

  if (!req) return null;

  try {
    let token: string | undefined;

    if ('cookies' in req && typeof (req as any).cookies?.get === 'function') {
      token = (req as NextRequest).cookies.get('admin_access_token')?.value;
    }

    if (!token) {
      const authHeader = req.headers.get('authorization');
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7);
      }
    }

    if (!token) return null;

    const payload = verifyAccessToken(token);
    if (!payload?.sub) return null;

    const userId = Number(payload.sub);
    const rows: any[] = await prisma.$queryRawUnsafe(
      'SELECT id, name, email, role FROM users WHERE id = ? LIMIT 1',
      userId
    );

    if (rows && rows.length > 0) {
      return {
        id: Number(rows[0].id),
        name: rows[0].name || '',
        email: rows[0].email || '',
        role: rows[0].role || 'staff',
      };
    }
  } catch {}

  return null;
}

/**
 * Main Audit Logging function. Asynchronous and safe against throwing errors.
 */
export async function recordAuditLog(options: AuditLogOptions): Promise<void> {
  try {
    const { req, action, module, recordId, description, oldValues, newValues, status = 'success' } = options;

    const user = await resolveUser(req, options.user);
    const ipAddress = getClientIp(req);
    const userAgent = req?.headers?.get('user-agent') || '';
    const { browser, os, device } = parseUserAgent(userAgent);

    const cleanOld = oldValues ? sanitizeObject(oldValues) : null;
    const cleanNew = newValues ? sanitizeObject(newValues) : null;
    const diff = computeJsonDiff(cleanOld, cleanNew);

    const oldValuesJson = cleanOld ? JSON.stringify(cleanOld) : null;
    const newValuesJson = cleanNew ? JSON.stringify(cleanNew) : null;
    const diffValuesJson = diff ? JSON.stringify(diff) : null;

    const autoDescription =
      description ||
      `${action} action on ${module}${recordId ? ` (ID: ${recordId})` : ''} by ${user?.name || user?.email || 'System'}`;

    await prisma.$executeRawUnsafe(
      `INSERT INTO admin_audit_logs (
        user_id, user_name, user_email, user_role, action, module, record_id,
        description, old_values, new_values, diff_values, ip_address, user_agent,
        browser, os, device, status, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      user?.id || null,
      user?.name || 'System / Guest',
      user?.email || null,
      user?.role || null,
      action.toUpperCase(),
      module.toLowerCase(),
      recordId ? String(recordId) : null,
      autoDescription,
      oldValuesJson,
      newValuesJson,
      diffValuesJson,
      ipAddress,
      userAgent.substring(0, 500),
      browser,
      os,
      device,
      status
    );
  } catch (error) {
    // Log error to console but never crash parent API handler
    console.error('Failed to record audit log:', error);
  }
}
