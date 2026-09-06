'use client'

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import {
  LayoutDashboard,
  User,
  GraduationCap,
  MessageSquare,
  Lock,
  LogOut,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  X,
  Sparkles,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://admin.educationmalaysia.in/api'
const API_KEY = process.env.NEXT_PUBLIC_FRONTEND_API_KEY || ''

interface StudentSidebarProps {
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export default function StudentSidebar({
  isCollapsed = false,
  onToggleCollapse,
  mobileOpen = false,
  onCloseMobile,
}: StudentSidebarProps) {
  const { logout, user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [studentData, setStudentData] = useState<any>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const res = await fetch(`${API_BASE}/student/profile`, {
          headers: {
            Authorization: `Bearer ${token}`,
            ...(API_KEY ? { 'x-api-key': API_KEY } : {}),
          },
        });
        const data = await res.json();
        if (res.ok && data?.data?.student) {
          setStudentData(data.data.student);
        } else if (res.status === 401) {
          console.warn("Profile fetch unauthorized, clearing session.");
          logout();
          router.push("/login");
        }
      } catch (err) {
        console.error("Profile fetch error:", err);
      }
    };

    fetchProfile();
  }, []);

  const handleLogout = async () => {
    const token = localStorage.getItem("token");
    try {
      await fetch(`${API_BASE}/student/logout`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          ...(API_KEY ? { 'x-api-key': API_KEY } : {}),
        },
      });
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      logout();
      router.push("/login");
    }
  };

  const displayName = studentData?.name || user?.name || "Student";
  const displayEmail = studentData?.email || user?.email || "";

  // Generate initials for avatar
  const initials = displayName
    .split(" ")
    .map((n: string) => n[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase() || "ST";

  const navLinks = [
    { href: "/student/overview", icon: LayoutDashboard, label: "Overview" },
    { href: "/student/profile", icon: User, label: "My Profile" },
    { href: "/student/applied-colleges", icon: GraduationCap, label: "Applied Colleges" },
    { href: "/student/conversation", icon: MessageSquare, label: "Conversations" },
    { href: "/student/change-password", icon: Lock, label: "Change Password" },
  ];

  const sidebarContent = (
    <div className="h-full flex flex-col justify-between select-none">
      <div>
        {/* Decorative top accent banner */}
        <div className="h-16 bg-linear-to-r from-blue-600 via-blue-500 to-indigo-600 relative shrink-0">
          <div className="absolute inset-0 bg-white/5 backdrop-blur-xs" />
          {/* Collapse toggle button on top right of banner */}
          {!isCollapsed && onToggleCollapse && (
            <button
              type="button"
              onClick={onToggleCollapse}
              className="hidden lg:flex items-center justify-center w-6 h-6 rounded-md bg-black/20 hover:bg-black/35 text-white transition absolute top-2 right-2 cursor-pointer z-20"
              title="Collapse sidebar"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
          )}
          {onCloseMobile && (
            <button
              type="button"
              onClick={onCloseMobile}
              className="lg:hidden p-1 rounded-md bg-black/20 text-white hover:bg-black/35 transition absolute top-2 right-2 cursor-pointer z-20"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Profile Header (Original Design) */}
        {!isCollapsed ? (
          <div className="px-5 pb-4 pt-0 text-center relative border-b border-slate-100">
            {/* Avatar */}
            <div className="w-16 h-16 rounded-2xl bg-linear-to-br from-blue-600 to-indigo-700 text-white font-black text-xl flex items-center justify-center mx-auto -mt-8 shadow-md shadow-blue-500/20 ring-4 ring-white relative z-10">
              {initials}
            </div>

            {/* Student Name & Email */}
            <h2 className="mt-3 font-bold text-base text-slate-900 tracking-tight truncate">
              {displayName}
            </h2>
            <p className="text-xs text-slate-500 truncate mt-0.5">
              {displayEmail}
            </p>

            {/* Verified Badge */}
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/80 mt-2.5">
              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
              <span>Verified Student</span>
            </div>
          </div>
        ) : (
          <div className="py-3 px-2 text-center border-b border-slate-100">
            <div
              className="w-10 h-10 rounded-xl bg-linear-to-br from-blue-600 to-indigo-700 text-white font-bold text-xs flex items-center justify-center mx-auto -mt-7 shadow-xs ring-2 ring-white relative z-10 cursor-pointer"
              title={`${displayName} (${displayEmail})`}
            >
              {initials}
            </div>
          </div>
        )}

        {/* Navigation Links */}
        <div className={`py-3 ${isCollapsed ? "px-2" : "px-3"}`}>
          {!isCollapsed && (
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-3 py-1.5">
              Dashboard Menu
            </p>
          )}
          <nav className="space-y-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href || (link.href !== "/student/overview" && pathname?.startsWith(link.href));
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={onCloseMobile}
                  title={isCollapsed ? link.label : undefined}
                  className={`flex items-center rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                    isCollapsed ? "justify-center p-2.5" : "gap-3 px-3.5 py-2.5"
                  } ${
                    isActive
                      ? isCollapsed
                        ? "bg-blue-600 text-white shadow-xs"
                        : "bg-blue-50 text-blue-700 font-bold border-l-3 border-l-blue-600 shadow-2xs"
                      : isCollapsed
                      ? "text-slate-500 hover:text-slate-900 hover:bg-slate-100"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                  }`}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? (isCollapsed ? "text-white" : "text-blue-600") : "text-slate-400"}`} />
                  {!isCollapsed && <span className="truncate">{link.label}</span>}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Footer Section */}
      <div className={`p-3 border-t border-slate-100 space-y-2 ${isCollapsed ? "px-2" : "px-3"}`}>
        {/* Sign Out Button */}
        <button
          onClick={handleLogout}
          title={isCollapsed ? "Sign Out" : undefined}
          className={`flex items-center justify-center rounded-xl text-xs sm:text-sm font-bold text-rose-600 hover:text-rose-700 hover:bg-rose-50 transition-all cursor-pointer w-full ${
            isCollapsed ? "p-2.5" : "gap-2 py-2.5 px-3.5 border border-rose-100"
          }`}
        >
          <LogOut className="w-4 h-4 shrink-0" />
          {!isCollapsed && <span>Sign Out</span>}
        </button>

        {/* Collapse toggle at bottom (if collapsed on desktop) */}
        {isCollapsed && onToggleCollapse && (
          <button
            type="button"
            onClick={onToggleCollapse}
            className="hidden lg:flex items-center justify-center w-full p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
            title="Expand sidebar"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Sliding Drawer */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-white shadow-2xl border-r border-slate-200 transition-transform duration-300 ease-in-out lg:hidden ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {sidebarContent}
      </aside>

      {/* Desktop Sticky Flush-Left Sidebar */}
      <aside
        className={`hidden lg:flex flex-col sticky top-0 h-screen bg-white border-r border-slate-200/80 z-30 transition-all duration-300 ease-in-out shrink-0 ${
          isCollapsed ? "w-[76px]" : "w-64 xl:w-72"
        }`}
      >
        {sidebarContent}
      </aside>
    </>
  );
}

