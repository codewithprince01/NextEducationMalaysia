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
  SquarePen,
  ListTodo,
  CreditCard,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const API_BASE = (process.env.NEXT_PUBLIC_API_URL || '/api/v1').replace(/\/$/, '')
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

  const [mounted, setMounted] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [profileImage, setProfileImage] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const displayName = mounted ? (studentData?.name || user?.name || "Student") : "Student";
  const displayEmail = mounted ? (studentData?.email || user?.email || "") : "";

  // Generate initials for avatar
  const initials = displayName
    .split(" ")
    .map((n: string) => n[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase() || "ST";

  // Compress & center-crop avatar image so it's ~20KB and never exceeds localStorage quota
  const compressAndResizeAvatar = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onerror = () => resolve("");
      reader.onload = () => {
        const result = reader.result as string;
        try {
          const img = new Image();
          img.onerror = () => resolve(result);
          img.onload = () => {
            try {
              const canvas = document.createElement("canvas");
              const MAX_SIZE = 256;
              const minDim = Math.min(img.width, img.height);
              const startX = (img.width - minDim) / 2;
              const startY = (img.height - minDim) / 2;

              canvas.width = MAX_SIZE;
              canvas.height = MAX_SIZE;

              const ctx = canvas.getContext("2d");
              if (!ctx) {
                resolve(result);
                return;
              }

              ctx.imageSmoothingEnabled = true;
              ctx.imageSmoothingQuality = "high";
              ctx.drawImage(img, startX, startY, minDim, minDim, 0, 0, MAX_SIZE, MAX_SIZE);

              // High-quality JPEG (~15-25KB, guaranteed to persist in localStorage)
              const compressed = canvas.toDataURL("image/jpeg", 0.88);
              resolve(compressed);
            } catch {
              resolve(result);
            }
          };
          img.src = result;
        } catch {
          resolve(result);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  // Load avatar from localStorage or studentData on mount & when studentData changes
  useEffect(() => {
    const loadAvatar = () => {
      try {
        const savedAvatar = localStorage.getItem("student_profile_avatar");
        if (savedAvatar) {
          setProfileImage(savedAvatar);
        } else if (studentData?.profile_image || studentData?.photo || studentData?.avatar) {
          setProfileImage(studentData.profile_image || studentData.photo || studentData.avatar);
        }
      } catch (err) {
        console.error("Error reading saved avatar:", err);
      }
    };
    loadAvatar();
  }, [studentData]);

  // Listen to cross-component & cross-tab avatar updates
  useEffect(() => {
    const handleAvatarUpdate = () => {
      try {
        const saved = localStorage.getItem("student_profile_avatar");
        if (saved) setProfileImage(saved);
      } catch {}
    };
    window.addEventListener("student_avatar_updated", handleAvatarUpdate);
    window.addEventListener("storage", handleAvatarUpdate);
    return () => {
      window.removeEventListener("student_avatar_updated", handleAvatarUpdate);
      window.removeEventListener("storage", handleAvatarUpdate);
    };
  }, []);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please select an image file (PNG, JPG, JPEG, WEBP).");
      return;
    }

    try {
      const compressed = await compressAndResizeAvatar(file);
      if (compressed) {
        setProfileImage(compressed);
        try {
          localStorage.setItem("student_profile_avatar", compressed);
          // Broadcast to navbar and all listeners
          window.dispatchEvent(new Event("student_avatar_updated"));
        } catch (storageErr) {
          console.error("Failed to save avatar to localStorage:", storageErr);
        }
      }
    } catch (err) {
      console.error("Error processing photo upload:", err);
    }
  };

  const [appCounts, setAppCounts] = useState<{ paid: number; unpaid: number } | null>(null);

  useEffect(() => {
    const fetchAppCounts = async () => {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      if (!token) return;
      try {
        const res = await fetch(`${API_BASE}/student/applied-college`, {
          headers: {
            Authorization: `Bearer ${token}`,
            ...(API_KEY ? { 'x-api-key': API_KEY } : {}),
          },
        });
        const data = await res.json();
        const apps = Array.isArray(data?.data?.applied_programs)
          ? data.data.applied_programs
          : Array.isArray(data?.applied_programs)
          ? data.applied_programs
          : [];
        const isPaid = (c: any) => {
          const s = String(c?.app_status || "").toLowerCase().trim();
          return s === "paid" || s === "accepted" || s === "approved";
        };
        const paid = apps.filter((c: any) => isPaid(c)).length;
        const unpaid = apps.length - paid;
        setAppCounts({ paid, unpaid });
      } catch {
        // ignore
      }
    };

    fetchAppCounts();
    const handleUpdated = () => fetchAppCounts();
    window.addEventListener('applied_colleges_updated', handleUpdated);
    return () => window.removeEventListener('applied_colleges_updated', handleUpdated);
  }, []);

  const navLinks = [
    { href: "/student/overview", icon: LayoutDashboard, label: "Overview" },
    { href: "/student/profile", icon: User, label: "My Profile" },
    { href: "/student/my-applications", icon: GraduationCap, label: "My Applications" },
    { href: "/student/unpaid-applications", icon: CreditCard, label: "Unpaid Applications" },
    { href: "/student/tasks", icon: ListTodo, label: "My Tasks" },
    { href: "/student/conversation", icon: MessageSquare, label: "Conversations" },
    { href: "/student/change-password", icon: Lock, label: "Change Password" },
  ];

  const sidebarContent = (
    <div className="h-full flex flex-col justify-between select-none">
      <div>
        {/* Hidden File Input for Avatar Upload */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handlePhotoUpload}
          className="hidden"
        />

        {/* Profile Header (Matching exact screenshot design) */}
        {!isCollapsed ? (
          <div className="bg-blue-600 px-5 pt-8 pb-6 text-center relative shrink-0">
            {/* Mobile close button (mobile drawer only) */}
            {onCloseMobile && (
              <button
                type="button"
                onClick={onCloseMobile}
                className="lg:hidden p-1.5 rounded-lg bg-black/15 text-white hover:bg-black/30 transition absolute top-2.5 right-2.5 cursor-pointer z-20"
                aria-label="Close sidebar"
              >
                <X className="w-4 h-4" />
              </button>
            )}

            {/* Circular Profile Image with Upload Badge */}
            <div className="relative w-24 h-24 mx-auto group">
              <div
                onClick={() => fileInputRef.current?.click()}
                className="w-24 h-24 rounded-full bg-white shadow-lg overflow-hidden flex items-center justify-center cursor-pointer ring-4 ring-white/20 transition hover:ring-white/40"
                title="Click to upload profile photo"
              >
                {profileImage ? (
                  <img
                    src={profileImage}
                    alt={displayName}
                    className="w-full h-full object-cover rounded-full"
                  />
                ) : (
                  <div className="w-full h-full p-2.5 flex items-center justify-center">
                    <svg
                      viewBox="0 0 100 100"
                      className="w-full h-full text-blue-600 fill-current"
                      preserveAspectRatio="xMidYMid meet"
                    >
                      <circle cx="50" cy="36" r="18" />
                      <path d="M 22 86 C 22 66, 34 55, 50 55 C 66 55, 78 66, 78 86 Z" />
                    </svg>
                  </div>
                )}
              </div>

              {/* Upload Pencil Badge Button */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-white text-blue-600 shadow-md border border-slate-200/80 flex items-center justify-center cursor-pointer hover:bg-blue-50 transition transform hover:scale-105 active:scale-95 z-10"
                title="Upload profile photo"
                aria-label="Upload profile photo"
              >
                <SquarePen className="w-4 h-4 text-blue-600" />
              </button>
            </div>

            {/* Student Name & Email */}
            <h2
              suppressHydrationWarning
              className="mt-3.5 font-bold text-xl text-white tracking-tight leading-snug truncate px-1"
            >
              {displayName}
            </h2>
            <p
              suppressHydrationWarning
              className="text-xs text-blue-100 truncate mt-0.5 px-1 font-normal opacity-90"
            >
              {displayEmail}
            </p>
          </div>
        ) : (
          <div className="bg-blue-600 py-4 px-2 text-center relative shrink-0">
            <div className="relative w-11 h-11 mx-auto group">
              <div
                onClick={() => fileInputRef.current?.click()}
                className="w-11 h-11 rounded-full bg-white shadow-md overflow-hidden flex items-center justify-center cursor-pointer ring-2 ring-white/30"
                title={`${displayName} (${displayEmail}) - Click to upload photo`}
                suppressHydrationWarning
              >
                {profileImage ? (
                  <img
                    src={profileImage}
                    alt={displayName}
                    className="w-full h-full object-cover rounded-full"
                  />
                ) : (
                  <div className="w-full h-full p-1 flex items-center justify-center">
                    <svg
                      viewBox="0 0 100 100"
                      className="w-full h-full text-blue-600 fill-current"
                      preserveAspectRatio="xMidYMid meet"
                    >
                      <circle cx="50" cy="36" r="18" />
                      <path d="M 22 86 C 22 66, 34 55, 50 55 C 66 55, 78 66, 78 86 Z" />
                    </svg>
                  </div>
                )}
              </div>

              {/* Tiny pencil badge */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-white text-blue-600 shadow-xs border border-slate-200 flex items-center justify-center cursor-pointer hover:bg-blue-50"
                title="Upload photo"
              >
                <SquarePen className="w-2.5 h-2.5 text-blue-600" />
              </button>
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
                  className={`flex items-center rounded-xl text-xs sm:text-sm font-semibold transition-all relative ${
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

                  {/* Badges */}
                  {!isCollapsed && link.href === "/student/my-applications" && appCounts && appCounts.paid > 0 && (
                    <span className="ml-auto px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                      {appCounts.paid} Paid
                    </span>
                  )}
                  {!isCollapsed && link.href === "/student/unpaid-applications" && appCounts && appCounts.unpaid > 0 && (
                    <span className="ml-auto px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                      {appCounts.unpaid} Unpaid
                    </span>
                  )}
                  {isCollapsed && link.href === "/student/unpaid-applications" && appCounts && appCounts.unpaid > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-amber-500 ring-2 ring-white" />
                  )}

                  {!isCollapsed && link.href === "/student/tasks" && (
                    <span className="ml-auto px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-200/60">
                      Checklist
                    </span>
                  )}
                  {isCollapsed && link.href === "/student/tasks" && (
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-blue-500 ring-2 ring-white" />
                  )}
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

