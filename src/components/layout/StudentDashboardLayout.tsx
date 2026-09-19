'use client'

import React, { Suspense, useState, useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import StudentSidebar from '../student/StudentSidebar'
import RequireAuth from '../auth/RequireAuth'
import AuthSplash from '../auth/AuthSplash'
import { Menu } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'

export default function StudentDashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<AuthSplash label="Checking your session…" />}>
      <RequireAuth>
        <StudentDashboardShell>{children}</StudentDashboardShell>
      </RequireAuth>
    </Suspense>
  );
}

function StudentDashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();
  const [isPinned, setIsPinned] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  // Read saved pinned state from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('student_sidebar_pinned');
      if (saved !== null) {
        setIsPinned(saved === 'true');
      } else {
        const legacy = localStorage.getItem('student_sidebar_collapsed');
        if (legacy !== null) {
          setIsPinned(legacy !== 'true');
        }
      }
    } catch {
      // ignore storage access errors
    }
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const handleTogglePin = () => {
    setIsPinned((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('student_sidebar_pinned', String(next));
      } catch {
        // ignore
      }
      return next;
    });
  };

  const isFixedPage = pathname?.includes('/conversation') || pathname?.includes('/change-password');

  return (
    <div
      className={`bg-slate-50 flex flex-row relative antialiased ${
        isFixedPage
          ? 'h-screen h-[100dvh] overflow-hidden pt-[76px]'
          : 'min-h-screen'
      }`}
    >
      {/* Mobile Backdrop Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Collapsible Flush-Left Sidebar with Pin & Hover Expand */}
      <StudentSidebar
        isPinned={isPinned}
        onTogglePin={handleTogglePin}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
      />

      {/* Mobile-only floating sidebar trigger */}
      <button
        type="button"
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed bottom-5 left-5 z-40 p-3 rounded-full bg-blue-600 text-white shadow-lg shadow-blue-600/40 hover:bg-blue-700 transition active:scale-95 cursor-pointer"
        aria-label="Open sidebar"
        title="Open menu"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Main Area: Content */}
      <div
        className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ease-in-out ${
          isFixedPage
            ? 'h-full min-h-0 overflow-hidden'
            : 'min-h-[calc(100vh-76px)]'
        }`}
      >
        {/* Dashboard Main Content Body */}
        <main
          className={`flex-1 w-full ${
            isFixedPage
              ? 'p-0 flex flex-col min-w-0 min-h-0 h-full overflow-hidden'
              : 'p-4 sm:p-6 lg:p-8 xl:p-8 2xl:p-10 w-full'
          }`}
        >
          {children}
        </main>
      </div>
    </div>
  );
}

