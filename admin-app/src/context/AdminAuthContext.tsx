import React, { createContext, useContext, useState, useEffect } from 'react';

export interface AdminUser {
  id: number;
  name: string;
  email: string;
  role: string;
  permissions?: Record<string, Record<string, any>>;
  last_login?: string;
  profile_picture?: string;
  department?: string;
  status?: number;
}

export type PermissionAction = 'view' | 'create' | 'edit' | 'delete';

interface AdminAuthContextType {
  user: AdminUser | null;
  token: string | null;
  loading: boolean;
  isAuthenticated: boolean;
  isSuperAdmin: boolean;
  canAccess: (moduleKey: string | string[], action?: PermissionAction) => boolean;
  login: (credentials: { username: string; password: string }) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export const checkIsSuperAdmin = (u: AdminUser | null): boolean => {
  if (!u) return false;
  const role = (u.role || '').toLowerCase().trim();
  return (
    role === 'super-admin' ||
    role === 'superadmin' ||
    role === 'super_admin'
  );
};

export const AdminAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const refreshUser = async (activeToken?: string) => {
    const t = activeToken || token || localStorage.getItem('admin_access_token');
    if (!t) return;
    try {
      const res = await fetch('/api/v1/admin/auth/me', {
        headers: { Authorization: `Bearer ${t}` },
      });
      const json = await res.json();
      if (res.ok && json.status && json.data?.user) {
        setUser(json.data.user);
        localStorage.setItem('admin_user', JSON.stringify(json.data.user));
      }
    } catch {
      // Ignore network errors on refresh
    }
  };

  useEffect(() => {
    const savedToken = localStorage.getItem('admin_access_token');
    const savedUser = localStorage.getItem('admin_user');

    if (savedToken && savedUser) {
      try {
        setToken(savedToken);
        const parsed = JSON.parse(savedUser);
        setUser(parsed);
      } catch {
        localStorage.removeItem('admin_access_token');
        localStorage.removeItem('admin_user');
      }
    }
    setLoading(false);

    if (savedToken) {
      refreshUser(savedToken);
    }
  }, []);

  const login = async (credentials: { username: string; password: string }) => {
    try {
      const res = await fetch('/api/v1/admin/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });

      const json = await res.json();
      const accessToken = json.data?.access_token || json.data?.token;
      if (res.ok && json.status && accessToken) {
        const userData = json.data.user;

        setToken(accessToken);
        setUser(userData);

        localStorage.setItem('admin_access_token', accessToken);
        localStorage.setItem('admin_user', JSON.stringify(userData));

        return { success: true };
      } else {
        return { success: false, message: json.message || 'Invalid credentials' };
      }
    } catch {
      return { success: false, message: 'Connection error while authenticating' };
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('admin_access_token');
    localStorage.removeItem('admin_user');
  };

  const isSuperAdmin = checkIsSuperAdmin(user);

  const canAccess = (moduleKey: string | string[], action: PermissionAction = 'view'): boolean => {
    if (!user) return false;
    // Super-admin has full unrestricted access to everything
    if (isSuperAdmin) return true;

    const modules = Array.isArray(moduleKey) ? moduleKey : [moduleKey];
    const userPerms = user.permissions || {};

    return modules.some((mod) => {
      const modPerm = userPerms[mod];
      if (!modPerm) return false;

      const val = modPerm[action];
      if (val === 1 || val === true || val === '1') return true;

      // If checking 'view', granting any action on that module implies view permission
      if (action === 'view') {
        return Object.values(modPerm).some((v) => v === 1 || v === true || v === '1');
      }

      return false;
    });
  };

  return (
    <AdminAuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: !!token && !!user,
        isSuperAdmin,
        canAccess,
        login,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
};
