'use client'

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { BiConversation } from "react-icons/bi";
import { MdPersonSearch } from "react-icons/md";
import {
  FaUserCircle,
  FaEdit,
  FaSignOutAlt,
  FaLock,
  FaSchool,
} from "react-icons/fa";
import { useAuth } from "@/context/AuthContext";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://admin.educationmalaysia.in/api'

export default function StudentSidebar() {
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
          },
        });
        const data = await res.json();
        setStudentData(data.data.student);
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
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      logout();
      router.push("/login");
    }
  };

  const navLinks = [
    { href: "/student/overview", icon: <MdPersonSearch />, label: "Overview" },
    { href: "/student/profile", icon: <FaUserCircle />, label: "My Profile" },
    { href: "/student/applied-colleges", icon: <FaSchool />, label: "Applied Colleges" },
    { href: "/student/conversation", icon: <BiConversation />, label: "Conversations" },
    { href: "/student/change-password", icon: <FaLock />, label: "Change Password" },
  ];

  return (
    <div className="w-full md:w-1/4 bg-gradient-to-b from-blue-800 via-blue-700 to-blue-900 text-white rounded-2xl p-8 shadow-2xl flex flex-col items-center h-fit sticky top-24">
      {/* Profile Section */}
      <div className="relative">
        <FaUserCircle className="w-28 h-28 text-white drop-shadow-lg" />
        <button className="absolute bottom-2 right-2 bg-white text-blue-800 p-2 rounded-full shadow-md hover:bg-blue-100 transition">
          <FaEdit size={16} />
        </button>
      </div>

      {/* Name & Email */}
      <h2 className="mt-4 font-semibold text-xl tracking-wide text-center">
        {studentData ? studentData.name : user?.name || "Loading..."}
      </h2>
      <p className="text-sm mb-8 opacity-80 text-center">
        {studentData ? studentData.email : user?.email || "..."}
      </p>

      {/* Sidebar Menu */}
      <div className="space-y-3 w-full">
        {navLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`flex items-center gap-3 w-full backdrop-blur-sm text-white rounded-xl py-3 px-4 shadow transition ${
              pathname === link.href 
                ? "bg-white/30 font-bold border border-white/20" 
                : "bg-white/10 hover:bg-white/20"
            }`}
          >
            {link.icon} {link.label}
          </Link>
        ))}
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white rounded-xl py-3 px-4 shadow transition cursor-pointer"
        >
          <FaSignOutAlt /> Log Out
        </button>
      </div>
    </div>
  );
}
