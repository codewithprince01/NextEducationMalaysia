'use client'

import React, { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import StudentSidebar from '../student/StudentSidebar'
import { Menu, PanelLeftClose, PanelLeftOpen, Compass, ChevronRight, LayoutDashboard, ArrowUpRight } from 'lucide-react'

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
    if (pathname?.includes('/tasks')) return 'My Tasks';
    if (pathname?.includes('/profile')) return 'My Profile';
    if (pathname?.includes('/applied-colleges')) return 'My Applications';
    if (pathname?.includes('/unpaid-applications')) return 'Unpaid Applications';
    if (pathname?.includes('/applications')) return 'Application Details';
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
        <header className="h-16 bg-white/95 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-20 px-4 sm:px-6 lg:px-8 flex items-center justify-between shadow-2xs">
          <div className="flex items-center gap-3 sm:gap-3.5">
            {/* Mobile Hamburger */}
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              className="lg:hidden p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition cursor-pointer"
              aria-label="Open sidebar"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Desktop Collapse Toggle - Single, sleek button */}
            <button
              type="button"
              onClick={handleToggleCollapse}
              className="hidden lg:flex items-center justify-center w-9 h-9 rounded-xl border border-slate-200/80 bg-slate-50/80 hover:bg-slate-100 hover:border-slate-300 text-slate-600 hover:text-blue-600 transition shadow-2xs cursor-pointer active:scale-95"
              title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {isCollapsed ? <PanelLeftOpen className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
            </button>

            {/* Vertical divider */}
            <div className="hidden lg:block h-6 w-px bg-slate-200/80" />

            {/* Modern Breadcrumb / Page Title */}
            <div className="flex items-center gap-2 text-xs sm:text-sm">
              <div className="hidden sm:flex items-center gap-1.5 text-slate-400 font-medium">
                <LayoutDashboard className="w-3.5 h-3.5 text-slate-400" />
                <span>Dashboard</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-slate-300 hidden sm:block" />
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50/90 border border-blue-100 text-blue-700 font-bold text-xs sm:text-sm shadow-2xs">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
                <span>{getPageTitle()}</span>
              </div>
            </div>
          </div>

          {/* Right Action Icons - Premium Browse Courses Button */}
          <div className="flex items-center gap-3">
            <Link
              href="/courses-in-malaysia"
              className="group inline-flex items-center gap-2 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-xl bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs sm:text-sm font-semibold shadow-xs shadow-blue-500/20 hover:shadow-md hover:shadow-blue-500/30 transition-all active:scale-[0.98]"
            >
              <Compass className="w-4 h-4 transition-transform group-hover:rotate-45" />
              <span className="font-semibold">Browse Courses</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-blue-200 group-hover:text-white transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 hidden sm:inline-block" />
            </Link>
          </div>
        </header>

        {/* Dashboard Main Content Body */}
        <main
          className={`flex-1 w-full ${
            pathname?.includes('/conversation')
              ? 'p-0 flex flex-col min-w-0'
              : 'p-4 sm:p-6 lg:p-8 w-full max-w-7xl'
          }`}
        >
          {children}
        </main>
      </div>
    </div>
  );
}

