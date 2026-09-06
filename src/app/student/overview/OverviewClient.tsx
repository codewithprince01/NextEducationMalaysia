'use client'

import React, { useEffect, useState } from "react";
import {
  FileText,
  CheckCircle,
  Clock,
  TrendingUp,
  Eye,
  Award,
  Plane,
  MessageCircle,
  Calendar,
  ArrowUpRight,
} from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://admin.educationmalaysia.in/api";
const API_KEY = process.env.NEXT_PUBLIC_FRONTEND_API_KEY || "";

export default function OverviewClient() {
  const router = useRouter();
  const [stats, setStats] = useState({
    total: 0,
    accepted: 0,
    review: 0,
    progress: 0,
  });
  const [recentApps, setRecentApps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setLoading(false);
          router.push("/login");
          return;
        }

        const commonHeaders = {
          Authorization: `Bearer ${token}`,
          ...(API_KEY ? { "x-api-key": API_KEY } : {}),
        };

        const appRes = await fetch(`${API_BASE}/student/applied-college`, {
          headers: commonHeaders,
        });
        const appJson = await appRes.json();
        const courses = Array.isArray(appJson?.data?.applied_programs)
          ? appJson.data.applied_programs
          : Array.isArray(appJson?.applied_programs)
            ? appJson.applied_programs
            : [];

        const total = courses.length;
        const accepted = courses.filter((c: any) => {
          const s = String(c?.app_status || "").toLowerCase();
          return s === "accepted" || s === "approved";
        }).length;
        const review = courses.filter((c: any) => {
          const s = String(c?.app_status || "").toLowerCase();
          return s === "pending" || s === "review" || !s;
        }).length;

        const sorted = [...courses].sort((a: any, b: any) => {
          const dateA = new Date(a.created_at || a.updated_at || 0).getTime();
          const dateB = new Date(b.created_at || b.updated_at || 0).getTime();
          if (dateA !== dateB) return dateB - dateA;
          return Number(b.id || 0) - Number(a.id || 0);
        });
        setRecentApps(sorted.slice(0, 3));

        const profileRes = await fetch(`${API_BASE}/student/profile`, {
          headers: commonHeaders,
        });
        const profileJson = await profileRes.json();
        const student = profileJson?.data?.student || {};

        const fields = [
          student.name,
          student.email,
          student.mobile,
          student.dob,
          student.nationality,
          student.passport_number,
          student.home_address,
        ];
        const filled = fields.filter((f) => Boolean(f)).length;
        const progress = Math.round((filled / fields.length) * 100);
        setStats({ total, accepted, review, progress });
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router]);

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Recently";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getStatusColor = (status?: string) => {
    const s = String(status || "pending").toLowerCase();
    if (s === "accepted" || s === "approved") return "bg-green-100 text-green-700 border-green-200";
    if (s === "rejected") return "bg-red-100 text-red-700 border-red-200";
    return "bg-blue-100 text-blue-700 border-blue-200";
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="w-full space-y-6 sm:space-y-8">
      {/* 4 Overview Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-xs hover:border-blue-200 transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">{stats.total}</p>
              <p className="text-xs font-semibold text-slate-500 mt-0.5">Total Applications</p>
            </div>
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center shrink-0 shadow-2xs">
              <FileText className="w-6 h-6" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-xs hover:border-emerald-200 transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">{stats.accepted}</p>
              <p className="text-xs font-semibold text-slate-500 mt-0.5">Accepted Offers</p>
            </div>
            <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center shrink-0 shadow-2xs">
              <CheckCircle className="w-6 h-6" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-xs hover:border-amber-200 transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">{stats.review}</p>
              <p className="text-xs font-semibold text-slate-500 mt-0.5">Under Review</p>
            </div>
            <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center shrink-0 shadow-2xs">
              <Clock className="w-6 h-6" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-xs hover:border-indigo-200 transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">{stats.progress}%</p>
              <p className="text-xs font-semibold text-slate-500 mt-0.5">Profile Completion</p>
            </div>
            <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center shrink-0 shadow-2xs">
              <TrendingUp className="w-6 h-6" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Recent Applications & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Applications Card */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 sm:p-7 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 mb-5 border-b border-slate-100">
              <h2 className="text-base sm:text-lg font-bold text-slate-900">Recent Applications</h2>
              <Link
                href="/student/applied-colleges"
                className="text-xs text-blue-600 hover:text-blue-800 font-semibold inline-flex items-center gap-1 hover:gap-1.5 transition-all"
              >
                View All <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="space-y-3">
              {recentApps.length > 0 ? (
                recentApps.map((app, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50/70 border border-slate-200/60 hover:border-slate-300 transition"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                          String(app?.app_status || "").toLowerCase() === "accepted"
                            ? "bg-emerald-100 text-emerald-600"
                            : "bg-blue-100 text-blue-600"
                        }`}
                      >
                        {String(app?.app_status || "").toLowerCase() === "accepted" ? (
                          <CheckCircle className="w-5 h-5" />
                        ) : (
                          <FileText className="w-5 h-5" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-slate-900 text-xs sm:text-sm truncate">
                          {app?.university_program?.course_name || "Course Application"}
                        </p>
                        <p className="text-xs text-slate-500 truncate mt-0.5">
                          {app?.university_program?.university?.name || "University"}
                        </p>
                        <p className="flex items-center gap-1 text-[11px] text-slate-400 mt-1">
                          <Calendar className="w-3 h-3" />
                          <span>Updated {formatDate(app?.created_at || app?.updated_at)}</span>
                        </p>
                      </div>
                    </div>
                    <div className="shrink-0 pl-2">
                      <span
                        className={`inline-block px-2.5 py-1 text-[10px] font-bold rounded-full uppercase border ${getStatusColor(
                          app?.app_status,
                        )}`}
                      >
                        {app?.app_status || "PENDING"}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 px-4 rounded-xl border border-dashed border-slate-200 bg-slate-50/50">
                  <FileText className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                  <p className="font-bold text-slate-700 text-sm">No applications submitted yet</p>
                  <p className="text-xs text-slate-400 mt-1 mb-3">Explore programs from Malaysian universities.</p>
                  <Link
                    href="/courses-in-malaysia"
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition shadow-2xs"
                  >
                    Browse Courses
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions Card */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 sm:p-7">
          <div className="pb-4 mb-5 border-b border-slate-100">
            <h2 className="text-base sm:text-lg font-bold text-slate-900">Quick Actions</h2>
            <p className="text-xs text-slate-500">Shortcuts to manage your applications and documents</p>
          </div>

          <div className="space-y-3">
            <Link
              href="/student/applied-colleges"
              className="w-full flex items-center gap-3.5 p-3.5 rounded-xl border border-slate-200/60 bg-slate-50/60 hover:bg-slate-100/80 hover:border-slate-300 transition-all group"
            >
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <Eye className="w-5 h-5" />
              </div>
              <div className="text-left flex-1 min-w-0">
                <p className="text-xs sm:text-sm font-bold text-slate-800">View All Applications</p>
                <p className="text-[11px] text-slate-500">Review status of your course submissions</p>
              </div>
            </Link>

            <Link
              href="/student/profile"
              className="w-full flex items-center gap-3.5 p-3.5 rounded-xl border border-slate-200/60 bg-slate-50/60 hover:bg-slate-100/80 hover:border-slate-300 transition-all group"
            >
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <Award className="w-5 h-5" />
              </div>
              <div className="text-left flex-1 min-w-0">
                <p className="text-xs sm:text-sm font-bold text-slate-800">Update Profile & Documents</p>
                <p className="text-[11px] text-slate-500">Upload transcripts, passports, and test scores</p>
              </div>
            </Link>

            <Link
              href="/student/conversation"
              className="w-full flex items-center gap-3.5 p-3.5 rounded-xl border border-slate-200/60 bg-slate-50/60 hover:bg-slate-100/80 hover:border-slate-300 transition-all group"
            >
              <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <MessageCircle className="w-5 h-5" />
              </div>
              <div className="text-left flex-1 min-w-0">
                <p className="text-xs sm:text-sm font-bold text-slate-800">Conversations & Messages</p>
                <p className="text-[11px] text-slate-500">Chat with education counselors & advisors</p>
              </div>
            </Link>

            <Link
              href="/contact-us"
              className="w-full flex items-center gap-3.5 p-3.5 rounded-xl border border-slate-200/60 bg-slate-50/60 hover:bg-slate-100/80 hover:border-slate-300 transition-all group"
            >
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <Plane className="w-5 h-5" />
              </div>
              <div className="text-left flex-1 min-w-0">
                <p className="text-xs sm:text-sm font-bold text-slate-800">Visa & Admissions Support</p>
                <p className="text-[11px] text-slate-500">Get free expert guidance for student visas</p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
