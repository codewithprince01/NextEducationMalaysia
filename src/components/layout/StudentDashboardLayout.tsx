'use client'

import React, { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import StudentSidebar from '../student/StudentSidebar'
import { Menu, PanelLeftClose, PanelLeftOpen, Compass } from 'lucide-react'

export default function StudentDashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Read saved collapsed state from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('student_sidebar_collapsed');
      if (saved !== null) {
        setIsCollapsed(saved === 'true');
      }
    } catch {
      // ignore storage access errors
    }
  }, []);

  const handleToggleCollapse = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('student_sidebar_collapsed', String(next));
      } catch {
        // ignore
      }
      return next;
    });
  };

  // Human-friendly title for the breadcrumb
  const getPageTitle = () => {
    if (pathname?.includes('/profile')) return 'My Profile';
    if (pathname?.includes('/applied-colleges')) return 'Applied Colleges';
    if (pathname?.includes('/conversation')) return 'Conversations';
    if (pathname?.includes('/change-password')) return 'Change Password';
    return 'Overview';
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-row relative antialiased">
      {/* Mobile Backdrop Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Collapsible Flush-Left Sidebar */}
      <StudentSidebar
        isCollapsed={isCollapsed}
        onToggleCollapse={handleToggleCollapse}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
      />

      {/* Main Area: Top Bar + Content */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        {/* Sleek Dashboard Top Navbar */}
        <header className="h-16 bg-white/95 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-20 px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Mobile Hamburger */}
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              className="lg:hidden p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition cursor-pointer"
              aria-label="Open sidebar"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Desktop Collapse Toggle */}
            <button
              type="button"
              onClick={handleToggleCollapse}
              className="hidden lg:flex items-center justify-center p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition cursor-pointer"
              title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {isCollapsed ? <PanelLeftOpen className="w-5 h-5" /> : <PanelLeftClose className="w-5 h-5" />}
            </button>

            {/* Breadcrumb / Page Title */}
            <div className="flex items-center gap-2 text-xs sm:text-sm">
              <span className="text-slate-400 font-medium">Dashboard</span>
              <span className="text-slate-300">/</span>
              <span className="text-slate-900 font-bold tracking-tight">{getPageTitle()}</span>
            </div>
          </div>

          {/* Right Action Icons */}
          <div className="flex items-center gap-3">
            <Link
              href="/courses-in-malaysia"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white text-xs font-semibold transition shadow-2xs"
            >
              <Compass className="w-3.5 h-3.5" />
              Browse Courses
            </Link>
          </div>
        </header>

        {/* Dashboard Main Content Body */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 w-full max-w-7xl">
          {children}
        </main>
      </div>
    </div>
  );
}

