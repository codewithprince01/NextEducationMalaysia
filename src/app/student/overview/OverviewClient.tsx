'use client';

import React, { useEffect, useState } from "react";
import {
  FileText,
  Clock,
  TrendingUp,
  Eye,
  Calendar,
  ArrowUpRight,
  Sparkles,
  ArrowRight,
  AlertTriangle,
  CheckCircle2,
  UploadCloud,
  GraduationCap,
  ClipboardList,
  CreditCard,
  Building2,
  MessageSquare,
  ShieldCheck,
  Compass,
} from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { evaluateStudentChecklist, ChecklistItem } from "@/utils/studentChecklist";

const API_BASE = (process.env.NEXT_PUBLIC_API_URL || "/api/v1").replace(/\/$/, "");
const API_KEY = process.env.NEXT_PUBLIC_FRONTEND_API_KEY || "";

export default function OverviewClient() {
  const router = useRouter();
  const [student, setStudent] = useState<any>(null);
  const [stats, setStats] = useState({
    total: 0,
    accepted: 0,
    review: 0,
    paidCount: 0,
    unpaidCount: 0,
    progress: 0,
  });
  const [paidApps, setPaidApps] = useState<any[]>([]);
  const [unpaidApps, setUnpaidApps] = useState<any[]>([]);
  const [missingItems, setMissingItems] = useState<ChecklistItem[]>([]);
  const [completedItemsCount, setCompletedItemsCount] = useState(0);
  const [totalItemsCount, setTotalItemsCount] = useState(10);
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

        const [appRes, profileRes, docRes] = await Promise.all([
          fetch(`${API_BASE}/student/applied-college`, { headers: commonHeaders }).catch(() => null),
          fetch(`${API_BASE}/student/profile`, { headers: commonHeaders }).catch(() => null),
          fetch(`${API_BASE}/student/documents`, { headers: commonHeaders }).catch(() => null),
        ]);

        // 1. Applications Data
        const appJson = appRes ? await appRes.json().catch(() => null) : null;
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

        const isAppPaid = (c: any) => {
          const s = String(c?.app_status || "").toLowerCase().trim();
          return s === "paid" || s === "accepted" || s === "approved";
        };

        const paid = sorted.filter((c: any) => isAppPaid(c));
        const unpaid = sorted.filter((c: any) => !isAppPaid(c));

        setPaidApps(paid);
        setUnpaidApps(unpaid);

        // 2. Profile & Documents Data
        const profileJson = profileRes ? await profileRes.json().catch(() => null) : null;
        const studentObj = profileJson?.data?.student || profileJson?.student || {};
        setStudent(studentObj);

        const docJson = docRes ? await docRes.json().catch(() => null) : null;
        const docs = Array.isArray(docJson?.data?.student_documents)
          ? docJson.data.student_documents
          : Array.isArray(docJson?.student_documents)
            ? docJson.student_documents
            : [];

        const evaluated = evaluateStudentChecklist(studentObj, docs);

        setCompletedItemsCount(evaluated.completedCount);
        setTotalItemsCount(evaluated.totalCount);
        setMissingItems(evaluated.missingItems);
        setStats({
          total,
          accepted,
          review,
          paidCount: paid.length,
          unpaidCount: unpaid.length,
          progress: evaluated.progressPercent,
        });
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

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-64 gap-3">
        <div className="w-9 h-9 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-medium text-slate-500">Loading your overview...</p>
      </div>
    );
  }

  const isProfileComplete = stats.progress === 100;
  const displayName = student?.name || "Student";
  const studentId = student?.student_id || student?.id || "";

  return (
    <div className="w-full max-w-7xl mx-auto space-y-4 sm:space-y-5">
      {/* 🌟 Top Welcome & Progress Strip (Tight & Elegant) */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 shadow-2xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Left: Greeting & Subtitle */}
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                <Sparkles className="w-3 h-3 text-blue-600" />
                Student Portal
              </span>
              {studentId && (
                <span className="text-[11px] font-medium text-slate-400">
                  ID: #{studentId}
                </span>
              )}
            </div>
            <h1 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight leading-snug">
              Welcome back, {displayName} 👋
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Here is your latest application status and Malaysian university admission progress.
            </p>
          </div>

          {/* Right: Progress Readiness Widget */}
          <div className="shrink-0 flex items-center gap-3 bg-slate-50 border border-slate-200/70 rounded-xl p-2.5 sm:px-3.5 sm:py-2.5">
            <div className="min-w-[130px] sm:min-w-[160px]">
              <div className="flex items-center justify-between text-[11px] font-bold mb-1">
                <span className="text-slate-700">Profile Readiness</span>
                <span className={isProfileComplete ? "text-emerald-600" : "text-blue-600"}>
                  {stats.progress}%
                </span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-slate-200 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    isProfileComplete ? "bg-emerald-500" : "bg-blue-600"
                  }`}
                  style={{ width: `${stats.progress}%` }}
                />
              </div>
            </div>

            {isProfileComplete ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-emerald-100 text-emerald-800 shrink-0">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Ready</span>
              </span>
            ) : (
              <Link
                href="/student/tasks"
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-blue-600 hover:bg-blue-700 text-white transition shrink-0 shadow-2xs cursor-pointer"
              >
                <span>Tasks</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            )}
          </div>
        </div>

        {/* Dynamic Warning row if tasks are pending */}
        {!isProfileComplete && missingItems.length > 0 && (
          <div className="mt-3.5 pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs">
            <div className="flex items-center gap-2 flex-wrap text-amber-900">
              <span className="inline-flex items-center gap-1 font-semibold text-amber-700 text-[11px]">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                {missingItems.length} action items pending:
              </span>
              <div className="flex items-center gap-1.5 flex-wrap">
                {missingItems.slice(0, 3).map((item) => (
                  <span
                    key={item.id}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50/80 border border-amber-200/80 text-[10px] font-medium text-amber-900"
                  >
                    {item.name}
                  </span>
                ))}
                {missingItems.length > 3 && (
                  <span className="text-[10px] text-amber-700 font-semibold">
                    +{missingItems.length - 3} more
                  </span>
                )}
              </div>
            </div>

            <Link
              href="/student/tasks"
              className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 hover:text-blue-700 hover:underline shrink-0"
            >
              <UploadCloud className="w-3.5 h-3.5" />
              <span>Complete Profile & Upload Documents</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        )}
      </div>

      {/* 📊 4 Compact Stat / Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Applications */}
        <div className="bg-white rounded-xl sm:rounded-2xl p-3.5 sm:p-4 border border-slate-200/80 shadow-2xs hover:border-blue-200 transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold text-slate-500">Total Applied</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center shrink-0">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <p className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              {stats.total}
            </p>
            <span className="text-[10px] text-slate-400 font-medium">Programs</span>
          </div>
        </div>

        {/* Paid Applications */}
        <Link
          href="/student/my-applications"
          className="bg-white rounded-xl sm:rounded-2xl p-3.5 sm:p-4 border border-slate-200/80 shadow-2xs hover:border-emerald-300 hover:shadow-xs transition-all group block"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold text-slate-500 group-hover:text-emerald-700 transition-colors">
              Paid Applications
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-100 text-emerald-600 group-hover:bg-emerald-100 flex items-center justify-center shrink-0 transition-colors">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <p className="text-xl sm:text-2xl font-black text-emerald-700 tracking-tight">
              {stats.paidCount}
            </p>
            <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-100 text-emerald-800 uppercase">
              Confirmed
            </span>
          </div>
        </Link>

        {/* Unpaid Applications */}
        <Link
          href="/student/unpaid-applications"
          className="bg-white rounded-xl sm:rounded-2xl p-3.5 sm:p-4 border border-slate-200/80 shadow-2xs hover:border-amber-300 hover:shadow-xs transition-all group block"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold text-slate-500 group-hover:text-amber-700 transition-colors">
              Unpaid Applications
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 border border-amber-100 text-amber-600 group-hover:bg-amber-100 flex items-center justify-center shrink-0 transition-colors">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <p className="text-xl sm:text-2xl font-black text-amber-700 tracking-tight">
              {stats.unpaidCount}
            </p>
            <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-100 text-amber-800 uppercase">
              Pending
            </span>
          </div>
        </Link>

        {/* Profile Readiness */}
        <Link
          href="/student/tasks"
          className="bg-white rounded-xl sm:rounded-2xl p-3.5 sm:p-4 border border-slate-200/80 shadow-2xs hover:border-indigo-300 hover:shadow-xs transition-all group block"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold text-slate-500 group-hover:text-indigo-700 transition-colors">
              Checklist
            </span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-600 group-hover:bg-indigo-100 flex items-center justify-center shrink-0 transition-colors">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <p className="text-xl sm:text-2xl font-black text-indigo-900 tracking-tight">
              {stats.progress}%
            </p>
            <span className="text-[10px] text-indigo-600 font-semibold">
              {completedItemsCount}/{totalItemsCount} Done
            </span>
          </div>
        </Link>
      </div>

      {/* 🏛️ 2 Application Modules (Paid vs Unpaid) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5">
        {/* Module 1: Paid & Verified Applications */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-4 sm:p-5 flex flex-col justify-between">
          <div>
            {/* Header */}
            <div className="flex items-center justify-between gap-3 pb-3 mb-3.5 border-b border-slate-100">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-7 h-7 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <h2 className="!text-[14px] !font-bold !leading-tight text-slate-900">
                    My Applications (Paid)
                  </h2>
                  <p className="text-[10px] text-slate-400 font-medium truncate">
                    Confirmed admission fee payments
                  </p>
                </div>
              </div>
              <Link
                href="/student/my-applications"
                className="shrink-0 text-[11px] text-emerald-700 hover:text-emerald-900 font-semibold inline-flex items-center gap-1 transition"
              >
                View All ({paidApps.length}) <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* List */}
            <div className="space-y-2.5">
              {paidApps.length > 0 ? (
                paidApps.slice(0, 3).map((app, index) => {
                  const program = app?.university_program || app?.university_programs || {};
                  const university = program?.university || {};

                  return (
                    <div
                      key={app.id || index}
                      className="flex items-center justify-between p-3 rounded-xl bg-slate-50/70 hover:bg-emerald-50/40 border border-slate-100 hover:border-emerald-200/70 transition-all gap-2.5"
                    >
                      <div className="flex items-center gap-2.5 min-w-0 flex-1">
                        <div className="w-8 h-8 rounded-lg bg-white border border-emerald-200 text-emerald-700 flex items-center justify-center shrink-0 shadow-2xs">
                          <Building2 className="w-4 h-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-bold text-slate-900 text-xs truncate">
                            {program?.course_name || app?.program || "Course Application"}
                          </p>
                          <p className="text-[11px] text-slate-500 truncate font-medium">
                            {university?.name || app?.university || "University"}
                          </p>
                          <p className="flex items-center gap-1 text-[10px] text-slate-400 mt-0.5">
                            <Calendar className="w-3 h-3 text-slate-400" />
                            <span>Submitted: {formatDate(app?.created_at || app?.updated_at)}</span>
                          </p>
                        </div>
                      </div>

                      <div className="shrink-0 flex items-center gap-1.5">
                        <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 text-[9px] font-bold rounded-md uppercase bg-emerald-100 text-emerald-800 border border-emerald-200">
                          Paid
                        </span>
                        <Link
                          href={`/student/applications/${app.id}`}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold shadow-2xs transition"
                        >
                          <Eye className="w-3 h-3" />
                          <span>View</span>
                        </Link>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-7 px-3 rounded-xl border border-dashed border-slate-200 bg-slate-50/50">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-1.5">
                    <GraduationCap className="w-4 h-4" />
                  </div>
                  <p className="font-bold text-slate-700 text-xs">No paid applications yet</p>
                  <p className="text-[11px] text-slate-400 mt-0.5 mb-2.5 max-w-xs mx-auto">
                    Confirmed university admissions will be displayed here.
                  </p>
                  <Link
                    href="/courses-in-malaysia"
                    className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-[11px] transition shadow-2xs"
                  >
                    Browse University Programs
                  </Link>
                </div>
              )}
            </div>
          </div>

          <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-[11px]">
            <span className="text-slate-400 font-medium">
              {paidApps.length} verified {paidApps.length === 1 ? "application" : "applications"}
            </span>
            <Link
              href="/student/my-applications"
              className="font-bold text-blue-600 hover:text-blue-800"
            >
              Manage Paid Applications &rarr;
            </Link>
          </div>
        </div>

        {/* Module 2: Unpaid Applications (Payment Pending) */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-4 sm:p-5 flex flex-col justify-between">
          <div>
            {/* Header */}
            <div className="flex items-center justify-between gap-3 pb-3 mb-3.5 border-b border-slate-100">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-7 h-7 rounded-lg bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center shrink-0">
                  <CreditCard className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <h2 className="!text-[14px] !font-bold !leading-tight text-slate-900">
                    Unpaid Applications
                  </h2>
                  <p className="text-[10px] text-slate-400 font-medium truncate">
                    Applications pending processing fee
                  </p>
                </div>
              </div>
              <Link
                href="/student/unpaid-applications"
                className="shrink-0 text-[11px] text-amber-700 hover:text-amber-900 font-semibold inline-flex items-center gap-1 transition"
              >
                View All ({unpaidApps.length}) <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* List */}
            <div className="space-y-2.5">
              {unpaidApps.length > 0 ? (
                unpaidApps.slice(0, 3).map((app, index) => {
                  const program = app?.university_program || app?.university_programs || {};
                  const university = program?.university || {};

                  return (
                    <div
                      key={app.id || index}
                      className="flex items-center justify-between p-3 rounded-xl bg-slate-50/70 hover:bg-amber-50/40 border border-slate-100 hover:border-amber-200/70 transition-all gap-2.5"
                    >
                      <div className="flex items-center gap-2.5 min-w-0 flex-1">
                        <div className="w-8 h-8 rounded-lg bg-white border border-amber-200 text-amber-700 flex items-center justify-center shrink-0 shadow-2xs">
                          <Building2 className="w-4 h-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-bold text-slate-900 text-xs truncate">
                            {program?.course_name || app?.program || "Course Application"}
                          </p>
                          <p className="text-[11px] text-slate-500 truncate font-medium">
                            {university?.name || app?.university || "University"}
                          </p>
                          <p className="flex items-center gap-1 text-[10px] text-slate-400 mt-0.5">
                            <Calendar className="w-3 h-3 text-slate-400" />
                            <span>Submitted: {formatDate(app?.created_at || app?.updated_at)}</span>
                          </p>
                        </div>
                      </div>

                      <div className="shrink-0 flex items-center gap-1.5">
                        <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 text-[9px] font-bold rounded-md uppercase bg-amber-100 text-amber-800 border border-amber-200">
                          Pending
                        </span>
                        <Link
                          href={`/student/applications/${app.id}`}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold shadow-2xs transition"
                        >
                          <Eye className="w-3 h-3" />
                          <span>View</span>
                        </Link>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-7 px-3 rounded-xl border border-dashed border-slate-200 bg-slate-50/50">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-1.5">
                    <CreditCard className="w-4 h-4" />
                  </div>
                  <p className="font-bold text-slate-700 text-xs">No pending fees</p>
                  <p className="text-[11px] text-slate-400 mt-0.5 mb-2.5 max-w-xs mx-auto">
                    You have no unpaid application fees right now.
                  </p>
                  <Link
                    href="/courses-in-malaysia"
                    className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-semibold text-[11px] transition shadow-2xs"
                  >
                    Apply for New Program
                  </Link>
                </div>
              )}
            </div>
          </div>

          <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-[11px]">
            <span className="text-slate-400 font-medium">
              {unpaidApps.length} {unpaidApps.length === 1 ? "application" : "applications"} pending fee
            </span>
            <Link
              href="/student/unpaid-applications"
              className="font-bold text-amber-700 hover:text-amber-900"
            >
              View Unpaid Applications &rarr;
            </Link>
          </div>
        </div>
      </div>

      {/* ⚡ Quick Dashboard Actions (Compact Grid) */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-4 sm:p-5">
        <div className="pb-2.5 mb-3 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="!text-[14px] !font-bold !leading-tight text-slate-900">
              Quick Actions
            </h2>
            <p className="text-[10px] text-slate-400 font-medium mt-0.5">
              Direct shortcuts to manage your university applications and guidance
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
          <Link
            href="/student/my-applications"
            className="flex items-center gap-2.5 p-3 rounded-xl border border-slate-200/70 bg-slate-50/50 hover:bg-emerald-50/50 hover:border-emerald-200 transition-all group"
          >
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-slate-800 truncate group-hover:text-emerald-900">
                My Applications
              </p>
              <p className="text-[10px] text-slate-400 truncate">Paid programs</p>
            </div>
          </Link>

          <Link
            href="/student/unpaid-applications"
            className="flex items-center gap-2.5 p-3 rounded-xl border border-slate-200/70 bg-slate-50/50 hover:bg-amber-50/50 hover:border-amber-200 transition-all group"
          >
            <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <CreditCard className="w-4 h-4" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-slate-800 truncate group-hover:text-amber-900">
                Unpaid Applications
              </p>
              <p className="text-[10px] text-slate-400 truncate">Pending fee</p>
            </div>
          </Link>

          <Link
            href="/student/tasks"
            className="flex items-center gap-2.5 p-3 rounded-xl border border-slate-200/70 bg-slate-50/50 hover:bg-blue-50/50 hover:border-blue-200 transition-all group"
          >
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <ClipboardList className="w-4 h-4" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-slate-800 truncate group-hover:text-blue-900">
                My Tasks
              </p>
              <p className="text-[10px] text-slate-400 truncate">Upload documents</p>
            </div>
          </Link>

          <Link
            href="/student/conversation"
            className="flex items-center gap-2.5 p-3 rounded-xl border border-slate-200/70 bg-slate-50/50 hover:bg-purple-50/50 hover:border-purple-200 transition-all group"
          >
            <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-slate-800 truncate group-hover:text-purple-900">
                Counselor Chat
              </p>
              <p className="text-[10px] text-slate-400 truncate">Ask questions</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
