import axios from "axios";

export const REMOTE_API_BASE = "https://admin.educationmalaysia.in/api";
export const LOCAL_API_BASE = "/api/v1";
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

  try {
    const res = await axios.get(`${REMOTE_API_BASE}${cleanEndpoint}`, { headers, timeout: 8000 });
    return res;
  } catch (remoteErr: any) {
    try {
      const res = await axios.get(`${LOCAL_API_BASE}${cleanEndpoint}`, { headers, timeout: 5000 });
      return res;
    } catch (localErr) {
      throw remoteErr;
    }
  }
}

export async function apiPostWithFallback(endpoint: string, data: any, token?: string) {
  const cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  const headers = getHeaders(token);

  try {
    const res = await axios.post(`${REMOTE_API_BASE}${cleanEndpoint}`, data, { headers, timeout: 12000 });
    return res;
  } catch (remoteErr: any) {
    if (!remoteErr.response || remoteErr.response.status === 404 || remoteErr.response.status >= 500) {
      try {
        const res = await axios.post(`${LOCAL_API_BASE}${cleanEndpoint}`, data, { headers, timeout: 8000 });
        return res;
      } catch (localErr) {
        throw remoteErr;
      }
    }
    throw remoteErr;
  }
}
