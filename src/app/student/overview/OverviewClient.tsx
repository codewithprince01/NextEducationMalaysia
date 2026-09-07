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
  Sparkles,
  Compass,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  AlertTriangle,
  UploadCloud,
  FileCheck2,
  GraduationCap,
  Send,
  ShieldCheck,
  Check,
  UserCheck,
  ClipboardList,
  Laptop,
  CreditCard,
  Building2,
  Wallet
} from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://admin.educationmalaysia.in/api";
const API_KEY = process.env.NEXT_PUBLIC_FRONTEND_API_KEY || "";

import { evaluateStudentChecklist, ChecklistItem } from "@/utils/studentChecklist";


export default function OverviewClient() {
  const router = useRouter();
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

        // Separate Paid Applications vs Unpaid Applications
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
        const student = profileJson?.data?.student || profileJson?.student || {};

        const docJson = docRes ? await docRes.json().catch(() => null) : null;
        const docs = Array.isArray(docJson?.data?.student_documents)
          ? docJson.data.student_documents
          : Array.isArray(docJson?.student_documents)
            ? docJson.student_documents
            : [];

        // Unified Checklist Evaluation matching /student/tasks
        const evaluated = evaluateStudentChecklist(student, docs);

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

  // Stepper milestones configuration
  const isProfileComplete = stats.progress === 100;
  const hasApplications = stats.total > 0;
  const hasAcceptedOffers = stats.accepted > 0;

  const STEPS = [
    {
      step: 1,
      title: "Complete profile",
      status: isProfileComplete ? "completed" : "in_progress",
      icon: <Laptop className="w-4 h-4" />,
      tag: isProfileComplete ? "Done" : `${stats.progress}%`,
    },
    {
      step: 2,
      title: "Start applying",
      status: hasApplications ? "completed" : isProfileComplete ? "in_progress" : "upcoming",
      icon: <ClipboardList className="w-4 h-4" />,
      tag: hasApplications ? "Done" : isProfileComplete ? "Next" : "Locked",
    },
    {
      step: 3,
      title: "Review & submit",
      status: hasApplications && stats.review > 0 ? "in_progress" : hasAcceptedOffers ? "completed" : "upcoming",
      icon: <Send className="w-4 h-4" />,
      tag: hasApplications ? (stats.review > 0 ? "Under Review" : "Submitted") : "Upcoming",
    },
    {
      step: 4,
      title: "Get your results",
      status: hasAcceptedOffers ? "completed" : "upcoming",
      icon: <Award className="w-4 h-4" />,
      tag: hasAcceptedOffers ? "Accepted!" : "Upcoming",
    },
    {
      step: 5,
      title: "Apply for visa",
      status: hasAcceptedOffers ? "in_progress" : "upcoming",
      icon: <Plane className="w-4 h-4" />,
      tag: "EMGS Visa",
    },
    {
      step: 6,
      title: "Enrol & settle",
      status: "upcoming",
      icon: <GraduationCap className="w-4 h-4" />,
      tag: "Fly to Malaysia",
    },
  ];

  return (
    <div className="w-full space-y-6 sm:space-y-8">
      {/* 🌟 My Progress Roadmap Card (Matching Reference Design) */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-7 shadow-xs">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-amber-50 border border-amber-200/80 text-amber-600 flex items-center justify-center shrink-0 shadow-2xs">
              <Compass className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                My Progress
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 font-medium">
                Track your full journey from profile completion to arriving in Malaysia
              </p>
            </div>
          </div>

          {/* Profile Completion Badge */}
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${
                isProfileComplete
                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                  : "bg-blue-50 text-blue-700 border border-blue-200"
              }`}
            >
              {isProfileComplete ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              ) : (
                <Clock className="w-4 h-4 text-blue-600" />
              )}
              <span>Profile: {stats.progress}% Ready</span>
            </span>
          </div>
        </div>

        {/* 6-Step Stepper Roadmap */}
        <div className="pt-6 pb-2 overflow-x-auto scrollbar-none">
          <div className="min-w-[680px]">
            {/* Steps Container */}
            <div className="grid grid-cols-6 gap-2 sm:gap-3 relative">
              {/* Connecting Background Line */}
              <div className="absolute top-[88px] left-8 right-8 h-0.5 bg-slate-200 -z-0" />

              {STEPS.map((s) => {
                const isCompleted = s.status === "completed";
                const isInProgress = s.status === "in_progress";

                return (
                  <div key={s.step} className="flex flex-col items-center text-center relative z-10">
                    {/* Icon Card on Top */}
                    <div
                      className={`w-full py-3.5 px-2 rounded-xl border flex flex-col items-center justify-center transition-all ${
                        isCompleted
                          ? "bg-emerald-50/60 border-emerald-200 shadow-2xs"
                          : isInProgress
                          ? "bg-blue-50/70 border-blue-300 shadow-xs ring-2 ring-blue-500/10"
                          : "bg-slate-50/70 border-slate-200 text-slate-400"
                      }`}
                    >
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center mb-1.5 ${
                          isCompleted
                            ? "bg-emerald-100 text-emerald-700"
                            : isInProgress
                            ? "bg-blue-100 text-blue-700"
                            : "bg-slate-200/70 text-slate-500"
                        }`}
                      >
                        {s.icon}
                      </div>
                      <p
                        className={`text-xs font-bold leading-tight line-clamp-1 ${
                          isCompleted
                            ? "text-slate-900"
                            : isInProgress
                            ? "text-blue-900"
                            : "text-slate-600"
                        }`}
                      >
                        {s.title}
                      </p>
                    </div>

                    {/* Step Number Circle on the Line */}
                    <div className="mt-3 mb-1">
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold transition-all ${
                          isCompleted
                            ? "bg-emerald-600 text-white shadow-2xs"
                            : isInProgress
                            ? "bg-blue-600 text-white shadow-xs ring-4 ring-blue-100"
                            : "bg-slate-200 text-slate-600"
                        }`}
                      >
                        {isCompleted ? <Check className="w-3.5 h-3.5" /> : s.step}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ⚠️ Dynamic Incomplete Profile Alert & Action Strip */}
        {!isProfileComplete ? (
          <div className="mt-6 pt-5 border-t border-slate-100 bg-amber-50/60 rounded-2xl p-4 sm:p-5 border border-amber-200/70 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
                <h4 className="text-sm font-bold text-amber-950">
                  Your Profile is {stats.progress}% Complete — Action Required
                </h4>
                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                  {missingItems.length} Requirements Pending
                </span>
              </div>

              {/* Progress bar */}
              <div className="w-full max-w-md h-2 rounded-full bg-amber-200/60 overflow-hidden">
                <div
                  className="h-full rounded-full bg-amber-600 transition-all duration-500"
                  style={{ width: `${stats.progress}%` }}
                />
              </div>

              {/* Missing Requirements List */}
              <div className="flex items-center gap-1.5 flex-wrap text-xs text-amber-900 pt-0.5">
                <span className="font-semibold text-slate-700">Please complete:</span>
                {missingItems.slice(0, 4).map((item) => (
                  <span
                    key={item.id}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white border border-amber-200 text-[11px] font-medium text-amber-900 shadow-2xs"
                  >
                    <AlertTriangle className="w-3 h-3 text-amber-600 shrink-0" />
                    {item.name}
                  </span>
                ))}
                {missingItems.length > 4 && (
                  <span className="text-[11px] text-amber-700 font-semibold">
                    +{missingItems.length - 4} more
                  </span>
                )}
              </div>
            </div>

            {/* Direct Action Button to My Tasks */}
            <div className="shrink-0 flex items-center gap-2">
              <Link
                href="/student/tasks"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-xs sm:text-sm font-bold shadow-xs transition cursor-pointer"
              >
                <UploadCloud className="w-4 h-4" />
                <span>Complete Profile & Upload Documents</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        ) : (
          <div className="mt-6 pt-5 border-t border-slate-100 bg-emerald-50/70 rounded-2xl p-4 sm:p-5 border border-emerald-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 border border-emerald-200">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-emerald-950">
                  Profile 100% Completed! 🎉
                </h4>
                <p className="text-xs text-emerald-700 mt-0.5">
                  All required documents and identity credentials have been submitted. You can now explore courses and apply.
                </p>
              </div>
            </div>

            <Link
              href="/courses-in-malaysia"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold shadow-xs transition shrink-0"
            >
              <span>Browse Courses & Apply</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}
      </div>

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

        {/* Paid Applications Card */}
        <Link
          href="/student/my-applications"
          className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-xs hover:border-emerald-300 hover:shadow-sm transition-all group block"
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-1.5">
                <p className="text-2xl sm:text-3xl font-black text-emerald-700 tracking-tight">{stats.paidCount}</p>
                <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-100 text-emerald-800 uppercase">Paid</span>
              </div>
              <p className="text-xs font-semibold text-slate-500 mt-0.5 group-hover:text-emerald-700 transition-colors">
                My Applications (Paid)
              </p>
            </div>
            <div className="w-12 h-12 bg-emerald-50 text-emerald-600 group-hover:bg-emerald-100 rounded-xl flex items-center justify-center shrink-0 shadow-2xs transition-colors">
              <CheckCircle2 className="w-6 h-6" />
            </div>
          </div>
        </Link>

        {/* Unpaid Applications Card */}
        <Link
          href="/student/unpaid-applications"
          className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-xs hover:border-amber-300 hover:shadow-sm transition-all group block"
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-1.5">
                <p className="text-2xl sm:text-3xl font-black text-amber-700 tracking-tight">{stats.unpaidCount}</p>
                <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-100 text-amber-800 uppercase">Pending</span>
              </div>
              <p className="text-xs font-semibold text-slate-500 mt-0.5 group-hover:text-amber-700 transition-colors">
                Unpaid Applications
              </p>
            </div>
            <div className="w-12 h-12 bg-amber-50 text-amber-600 group-hover:bg-amber-100 rounded-xl flex items-center justify-center shrink-0 shadow-2xs transition-colors">
              <CreditCard className="w-6 h-6" />
            </div>
          </div>
        </Link>

        {/* Profile Progress Card */}
        <Link
          href="/student/tasks"
          className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-xs hover:border-indigo-300 hover:shadow-sm transition-all group block"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">{stats.progress}%</p>
              <p className="text-xs font-semibold text-slate-500 mt-0.5 group-hover:text-indigo-700 transition-colors">
                Profile Completion
              </p>
            </div>
            <div className="w-12 h-12 bg-indigo-50 text-indigo-600 group-hover:bg-indigo-100 rounded-xl flex items-center justify-center shrink-0 shadow-2xs transition-colors">
              <TrendingUp className="w-6 h-6" />
            </div>
          </div>
        </Link>
      </div>

      {/* 🌟 Two Distinct Application Showcase Modules */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Module 1: My Applications (Paid Universities) */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 sm:p-7 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 mb-5 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-slate-900">
                    My Applications (Paid)
                  </h2>
                  <p className="text-xs text-slate-500 font-medium">
                    Universities with confirmed admission fee payment
                  </p>
                </div>
              </div>
              <Link
                href="/student/my-applications"
                className="text-xs text-emerald-700 hover:text-emerald-900 font-semibold inline-flex items-center gap-1 hover:gap-1.5 transition-all"
              >
                View All ({paidApps.length}) <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="space-y-3">
              {paidApps.length > 0 ? (
                paidApps.slice(0, 3).map((app, index) => {
                  const program = app?.university_program || app?.university_programs || {};
                  const university = program?.university || {};

                  return (
                    <div
                      key={app.id || index}
                      className="flex items-center justify-between p-3.5 rounded-xl bg-emerald-50/40 border border-emerald-200/60 hover:border-emerald-300 transition"
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 border border-emerald-200">
                          <Building2 className="w-5 h-5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-bold text-slate-900 text-xs sm:text-sm truncate">
                            {program?.course_name || app?.program || "Course Application"}
                          </p>
                          <p className="text-xs text-slate-600 truncate mt-0.5 font-medium">
                            {university?.name || app?.university || "University"}
                          </p>
                          <p className="flex items-center gap-1 text-[11px] text-slate-400 mt-1">
                            <Calendar className="w-3 h-3" />
                            <span>Submitted: {formatDate(app?.created_at || app?.updated_at)}</span>
                          </p>
                        </div>
                      </div>
                      <div className="shrink-0 pl-2 flex items-center gap-2">
                        <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold rounded-full uppercase bg-emerald-100 text-emerald-800 border border-emerald-300 shadow-2xs">
                          <CheckCircle2 className="w-3 h-3" />
                          Paid & Confirmed
                        </span>
                        <Link
                          href={`/student/applications/${app.id}`}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-2xs transition"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View Application</span>
                        </Link>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-10 px-4 rounded-xl border border-dashed border-slate-200 bg-slate-50/50">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-2">
                    <GraduationCap className="w-5 h-5" />
                  </div>
                  <p className="font-bold text-slate-700 text-sm">No paid applications yet</p>
                  <p className="text-xs text-slate-400 mt-1 mb-3 max-w-xs mx-auto">
                    Once you submit the processing fee for your applied course, your confirmed universities will show here.
                  </p>
                  <Link
                    href="/courses-in-malaysia"
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition shadow-2xs"
                  >
                    Browse University Programs
                  </Link>
                </div>
              )}
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-500 font-medium">
              {paidApps.length} verified paid {paidApps.length === 1 ? 'application' : 'applications'}
            </span>
            <Link
              href="/student/my-applications"
              className="text-xs font-bold text-blue-600 hover:text-blue-800"
            >
              Manage Paid Applications &rarr;
            </Link>
          </div>
        </div>

        {/* Module 2: Unpaid Applications (Payment Pending) */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 sm:p-7 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 mb-5 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center">
                  <CreditCard className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-slate-900">
                    Unpaid Applications
                  </h2>
                  <p className="text-xs text-slate-500 font-medium">
                    Applications submitted with pending fee payment
                  </p>
                </div>
              </div>
              <Link
                href="/student/unpaid-applications"
                className="text-xs text-amber-700 hover:text-amber-900 font-semibold inline-flex items-center gap-1 hover:gap-1.5 transition-all"
              >
                View All ({unpaidApps.length}) <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="space-y-3">
              {unpaidApps.length > 0 ? (
                unpaidApps.slice(0, 3).map((app, index) => {
                  const program = app?.university_program || app?.university_programs || {};
                  const university = program?.university || {};

                  return (
                    <div
                      key={app.id || index}
                      className="flex items-center justify-between p-3.5 rounded-xl bg-amber-50/40 border border-amber-200/60 hover:border-amber-300 transition"
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 border border-amber-200">
                          <Building2 className="w-5 h-5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-bold text-slate-900 text-xs sm:text-sm truncate">
                            {program?.course_name || app?.program || "Course Application"}
                          </p>
                          <p className="text-xs text-slate-600 truncate mt-0.5 font-medium">
                            {university?.name || app?.university || "University"}
                          </p>
                          <p className="flex items-center gap-1 text-[11px] text-slate-400 mt-1">
                            <Clock className="w-3 h-3" />
                            <span>Submitted: {formatDate(app?.created_at || app?.updated_at)}</span>
                          </p>
                        </div>
                      </div>
                      <div className="shrink-0 pl-2 flex items-center gap-2">
                        <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold rounded-full uppercase bg-amber-100 text-amber-800 border border-amber-300 shadow-2xs">
                          <Clock className="w-3 h-3 text-amber-600" />
                          Unpaid
                        </span>
                        <Link
                          href={`/student/applications/${app.id}`}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-2xs transition"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View Application</span>
                        </Link>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-10 px-4 rounded-xl border border-dashed border-slate-200 bg-slate-50/50">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-2">
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <p className="font-bold text-slate-700 text-sm">No unpaid applications</p>
                  <p className="text-xs text-slate-400 mt-1 mb-3 max-w-xs mx-auto">
                    You have no pending application fees. Apply to more Malaysian universities anytime.
                  </p>
                  <Link
                    href="/courses-in-malaysia"
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs transition shadow-2xs"
                  >
                    Apply for New Program
                  </Link>
                </div>
              )}
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-500 font-medium">
              {unpaidApps.length} {unpaidApps.length === 1 ? 'application' : 'applications'} pending fee payment
            </span>
            <Link
              href="/student/unpaid-applications"
              className="text-xs font-bold text-amber-700 hover:text-amber-900"
            >
              View Unpaid Applications &rarr;
            </Link>
          </div>
        </div>
      </div>

      {/* Quick Actions Card Grid */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 sm:p-7">
        <div className="pb-4 mb-5 border-b border-slate-100">
          <h2 className="text-base sm:text-lg font-bold text-slate-900">Quick Dashboard Actions</h2>
          <p className="text-xs text-slate-500">Shortcuts to manage your applications, profile, and counselor guidance</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          <Link
            href="/student/my-applications"
            className="flex items-center gap-3.5 p-3.5 rounded-xl border border-slate-200/60 bg-slate-50/60 hover:bg-slate-100/80 hover:border-slate-300 transition-all group"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div className="text-left flex-1 min-w-0">
              <p className="text-xs sm:text-sm font-bold text-slate-800">My Applications</p>
              <p className="text-[11px] text-slate-500">View paid applications</p>
            </div>
          </Link>

          <Link
            href="/student/unpaid-applications"
            className="flex items-center gap-3.5 p-3.5 rounded-xl border border-slate-200/60 bg-slate-50/60 hover:bg-slate-100/80 hover:border-slate-300 transition-all group"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <CreditCard className="w-5 h-5" />
            </div>
            <div className="text-left flex-1 min-w-0">
              <p className="text-xs sm:text-sm font-bold text-slate-800">Unpaid Applications</p>
              <p className="text-[11px] text-slate-500">Manage pending fees</p>
            </div>
          </Link>

          <Link
            href="/student/tasks"
            className="flex items-center gap-3.5 p-3.5 rounded-xl border border-slate-200/60 bg-slate-50/60 hover:bg-slate-100/80 hover:border-slate-300 transition-all group"
          >
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <ClipboardList className="w-5 h-5" />
            </div>
            <div className="text-left flex-1 min-w-0">
              <p className="text-xs sm:text-sm font-bold text-slate-800">My Tasks Checklist</p>
              <p className="text-[11px] text-slate-500">Upload pending documents</p>
            </div>
          </Link>

          <Link
            href="/student/conversation"
            className="flex items-center gap-3.5 p-3.5 rounded-xl border border-slate-200/60 bg-slate-50/60 hover:bg-slate-100/80 hover:border-slate-300 transition-all group"
          >
            <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <MessageCircle className="w-5 h-5" />
            </div>
            <div className="text-left flex-1 min-w-0">
              <p className="text-xs sm:text-sm font-bold text-slate-800">Counselor Messages</p>
              <p className="text-[11px] text-slate-500">Chat with education experts</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
