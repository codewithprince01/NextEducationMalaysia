import axios from "axios";

export const LOCAL_API_BASE = process.env.NEXT_PUBLIC_API_URL || "/api/v1";
export const REMOTE_API_BASE = "https://admin.educationmalaysia.in/api";
export const API_KEY = process.env.NEXT_PUBLIC_FRONTEND_API_KEY || "vN7kO8pM6vGz1Nz0Vw4k5AjcB5n9hTzY6QsErK8gNbE=";

export function parseApiList(resData: any): any[] {
  if (!resData) return [];
  if (Array.isArray(resData)) return resData;
  if (Array.isArray(resData.data)) return resData.data;
  if (Array.isArray(resData.data?.data)) return resData.data.data;
  if (Array.isArray(resData.data?.data?.data)) return resData.data.data.data;
  return [];
}

export const DEFAULT_LEVELS = [
  { id: 3, level: "Diploma" },
  { id: 2, level: "Pre-University" },
  { id: 4, level: "Under-Graduate" },
  { id: 5, level: "Post-Graduate" },
  { id: 6, level: "Post-Graduate-Diploma" },
  { id: 7, level: "Ph.D" },
];

export const DEFAULT_COURSE_CATEGORIES = [
  { id: 1, name: "Business and Management" },
  { id: 2, name: "Engineering and Technology" },
  { id: 3, name: "Computer Science and IT" },
  { id: 4, name: "Medicine and Health Sciences" },
  { id: 5, name: "Accounting and Finance" },
  { id: 6, name: "Arts and Design" },
  { id: 7, name: "Hospitality and Tourism" },
  { id: 8, name: "Media and Communication" },
  { id: 9, name: "Law and Legal Studies" },
  { id: 10, name: "Education and Training" },
];

const getHeaders = (token?: string) => {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (API_KEY) headers["x-api-key"] = API_KEY;
  if (token) headers["Authorization"] = `Bearer ${token}`;
  return headers;
};

export async function apiGetWithFallback(endpoint: string, token?: string) {
  const cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  const headers = getHeaders(token);

  // 1. Always attempt Primary Local Next.js API first
  try {
    const res = await axios.get(`${LOCAL_API_BASE}${cleanEndpoint}`, { headers, timeout: 8000 });
    return res;
  } catch (localErr: any) {
    // If local returned 404, server error (>= 500), or network failed, attempt remote fallback
    if (!localErr.response || localErr.response.status === 404 || localErr.response.status >= 500) {
      try {
        const res = await axios.get(`${REMOTE_API_BASE}${cleanEndpoint}`, { headers, timeout: 8000 });
        return res;
      } catch (remoteErr) {
        throw localErr;
      }
    }
    throw localErr;
  }
}

export async function apiPostWithFallback(endpoint: string, data: any, token?: string) {
  const cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  const headers = getHeaders(token);

  // 1. Always attempt Primary Local Next.js API first
  try {
    const res = await axios.post(`${LOCAL_API_BASE}${cleanEndpoint}`, data, { headers, timeout: 10000 });
    return res;
  } catch (localErr: any) {
    // Only fallback to remote if local endpoint does not exist (404), network dropped, or server error (>= 500)
    if (!localErr.response || localErr.response.status === 404 || localErr.response.status >= 500) {
      try {
        const res = await axios.post(`${REMOTE_API_BASE}${cleanEndpoint}`, data, { headers, timeout: 10000 });
        return res;
      } catch (remoteErr) {
        throw localErr;
      }
    }
    // If local returned 400, 401, 409 (Email exists), 422 (Validation), throw immediately without delay
    throw localErr;
  }
}
