import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// Global fetch interceptor for admin-app to ensure all outgoing requests carry admin auth and identity
const originalFetch = window.fetch;
window.fetch = async function (input: RequestInfo | URL, init?: RequestInit) {
  const url = typeof input === 'string' ? input : input instanceof URL ? input.toString() : (input as Request).url;

  if (url.includes('/api/')) {
    const token = localStorage.getItem('admin_access_token');
    const rawUser = localStorage.getItem('admin_user');
    const headers = new Headers(
      init?.headers || (typeof input === 'object' && 'headers' in input ? (input as Request).headers : undefined) || {}
    );

    if (token && !headers.has('Authorization')) {
      headers.set('Authorization', `Bearer ${token}`);
    }

    if (rawUser) {
      try {
        const u = JSON.parse(rawUser);
        if (u.id && !headers.has('x-admin-user-id')) headers.set('x-admin-user-id', String(u.id));
        if (u.email && !headers.has('x-admin-user-email')) headers.set('x-admin-user-email', String(u.email));
        if (u.name && !headers.has('x-admin-user-name')) headers.set('x-admin-user-name', String(u.name));
        if (u.role && !headers.has('x-admin-user-role')) headers.set('x-admin-user-role', String(u.role));
      } catch {}
    }

    init = {
      credentials: 'include',
      ...init,
      headers,
    };
  }

  return originalFetch(input, init);
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
