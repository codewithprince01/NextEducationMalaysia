/**
 * Resilient API Fetch Helper for Admin App
 * 
 * Features:
 * - Auto-injects Authorization Bearer token from localStorage
 * - Automatic retry with exponential backoff on transient connection/startup errors (e.g. Next.js dev server booting up)
 * - Safe JSON parsing that never crashes on HTML 500/502/503/proxy responses
 * - Unified error reporting
 */

export interface ApiResponse<T = any> {
  ok: boolean;
  status: number;
  data: T | null;
  message?: string;
  error?: string;
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function safeFetch<T = any>(
  url: string,
  options: RequestInit = {},
  retries = 2,
  backoffMs = 600
): Promise<ApiResponse<T>> {
  const token = localStorage.getItem('admin_access_token');
  const headers = new Headers(options.headers || {});

  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  // Inject user identity headers from localStorage
  try {
    const rawUser = localStorage.getItem('admin_user');
    if (rawUser) {
      const u = JSON.parse(rawUser);
      if (u.id && !headers.has('x-admin-user-id')) headers.set('x-admin-user-id', String(u.id));
      if (u.email && !headers.has('x-admin-user-email')) headers.set('x-admin-user-email', String(u.email));
      if (u.name && !headers.has('x-admin-user-name')) headers.set('x-admin-user-name', String(u.name));
      if (u.role && !headers.has('x-admin-user-role')) headers.set('x-admin-user-role', String(u.role));
    }
  } catch {}

  let lastError: any = null;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url, {
        credentials: 'include',
        ...options,
        headers,
      });

      // Attempt to parse response as JSON safely
      const contentType = res.headers.get('content-type') || '';
      let json: any = null;

      if (contentType.includes('application/json')) {
        try {
          json = await res.json();
        } catch {
          json = null;
        }
      } else {
        const text = await res.text();
        try {
          json = JSON.parse(text);
        } catch {
          json = null;
        }
      }

      // If the backend returned a 502/503 (dev server proxy startup error), retry if attempts remain
      if ((res.status === 502 || res.status === 503) && attempt < retries) {
        await sleep(backoffMs * (attempt + 1));
        continue;
      }

      if (res.ok) {
        return {
          ok: true,
          status: res.status,
          data: json?.data !== undefined ? json.data : json,
          message: json?.message,
        };
      }

      return {
        ok: false,
        status: res.status,
        data: json?.data || null,
        message: json?.message || json?.error || `Request failed with status ${res.status}`,
        error: json?.error,
      };
    } catch (err: any) {
      lastError = err;
      // Network error (e.g. backend server starting up or connection refused)
      if (attempt < retries) {
        await sleep(backoffMs * (attempt + 1));
        continue;
      }
    }
  }

  return {
    ok: false,
    status: 0,
    data: null,
    message: lastError?.message || 'Network connection error',
    error: String(lastError),
  };
}

export const api = {
  get: <T = any>(url: string, options?: RequestInit, retries = 2) =>
    safeFetch<T>(url, { ...options, method: 'GET' }, retries),

  post: <T = any>(url: string, body?: any, options?: RequestInit) =>
    safeFetch<T>(
      url,
      {
        ...options,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(options?.headers || {}),
        },
        body: body ? JSON.stringify(body) : undefined,
      },
      1
    ),

  put: <T = any>(url: string, body?: any, options?: RequestInit) =>
    safeFetch<T>(
      url,
      {
        ...options,
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(options?.headers || {}),
        },
        body: body ? JSON.stringify(body) : undefined,
      },
      1
    ),

  patch: <T = any>(url: string, body?: any, options?: RequestInit) =>
    safeFetch<T>(
      url,
      {
        ...options,
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(options?.headers || {}),
        },
        body: body ? JSON.stringify(body) : undefined,
      },
      1
    ),

  delete: <T = any>(url: string, options?: RequestInit) =>
    safeFetch<T>(url, { ...options, method: 'DELETE' }, 1),
};
