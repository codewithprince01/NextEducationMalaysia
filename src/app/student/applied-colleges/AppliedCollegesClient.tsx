'use client'

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  GraduationCap,
  Building2,
  CheckCircle2,
  CreditCard,
  Trash2,
  Calendar,
  ArrowRight,
  Sparkles,
  Check,
  Info,
  Eye
} from "lucide-react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://admin.educationmalaysia.in/api'
const API_KEY = process.env.NEXT_PUBLIC_FRONTEND_API_KEY || ''

export default function AppliedCollegesClient() {
  const [allCourses, setAllCourses] = useState<any[]>([]);
  const [activeFilter, setActiveFilter] = useState<'paid' | 'all'>('paid');
  const [loading, setLoading] = useState(true);
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  const isPaid = (course: any) => {
    const s = String(course?.app_status || "").toLowerCase().trim();
    return s === "paid" || s === "accepted" || s === "approved";
  };

  const fetchApplied = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setLoading(false);
        return;
      }

      const res = await fetch(`${API_BASE}/student/applied-college`, {
        headers: {
          Authorization: `Bearer ${token}`,
          ...(API_KEY ? { 'x-api-key': API_KEY } : {}),
        },
      });
      const data = await res.json();

      let apps: any[] = [];
      if (Array.isArray(data?.data?.applied_programs)) {
        apps = data.data.applied_programs;
      } else if (Array.isArray(data?.applied_programs)) {
        apps = data.applied_programs;
      } else if (Array.isArray(data)) {
        apps = data;
      }
      setAllCourses(apps);
    } catch (err) {
      console.error("Error fetching applied courses:", err);
      setAllCourses([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplied();
  }, []);

  const handleDelete = async (id: number) => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      setDeleting(true);
      const response = await fetch(`${API_BASE}/student/application/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          ...(API_KEY ? { 'x-api-key': API_KEY } : {}),
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || "Failed to delete application");
      }

      setAllCourses((prev) => prev.filter((course) => course.id !== id));
      try {
        localStorage.setItem('applied_colleges_updated', String(Date.now()));
        window.dispatchEvent(new Event('applied_colleges_updated'));
      } catch {
        // ignore
      }
    } catch (err) {
      console.error("Failed to delete:", err);
    } finally {
      setDeleting(false);
      setDeleteTargetId(null);
    }
  };

  const paidCourses = allCourses.filter((c) => isPaid(c));
  const unpaidCourses = allCourses.filter((c) => !isPaid(c));
  const displayedCourses = activeFilter === 'paid' ? paidCourses : allCourses;

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      {/* Header & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center">
              <GraduationCap className="w-5 h-5" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              My Applications (Paid)
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
              {paidCourses.length} Paid & Confirmed
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Official applications with confirmed admission and fee payment verification.
          </p>
        </div>

        {/* Switcher to Unpaid Applications */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Link
            href="/student/unpaid-applications"
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-800 text-xs font-bold transition shadow-2xs"
          >
            <CreditCard className="w-4 h-4 text-amber-600" />
            <span>Unpaid Applications ({unpaidCourses.length})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Filter Tabs Bar */}
      <div className="flex items-center justify-between gap-4 flex-wrap bg-slate-100/80 p-1.5 rounded-2xl border border-slate-200/60">
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setActiveFilter('paid')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
              activeFilter === 'paid'
                ? 'bg-white text-emerald-800 shadow-xs border border-emerald-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Paid Applications ({paidCourses.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter('all')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
              activeFilter === 'all'
                ? 'bg-white text-slate-900 shadow-xs border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All Submissions ({allCourses.length})
          </button>
        </div>

        {unpaidCourses.length > 0 && activeFilter === 'paid' && (
          <span className="text-xs text-amber-800 font-medium px-3 py-1 bg-amber-50 rounded-xl border border-amber-200/70">
            Note: {unpaidCourses.length} application(s) pending payment are under <Link href="/student/unpaid-applications" className="underline font-bold">Unpaid Applications</Link>.
          </span>
        )}
      </div>

      {displayedCourses.length === 0 ? (
        <div className="bg-white border border-slate-200/80 rounded-2xl p-10 text-center shadow-xs">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center mx-auto mb-3">
            <CheckCircle2 className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-slate-800 mb-1">
            {activeFilter === 'paid' ? 'No Paid Applications Yet' : 'No Applications Found'}
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto mb-6">
            {activeFilter === 'paid'
              ? 'When your application or processing fee is verified by the university admissions office, it will appear here.'
              : 'You have not submitted any course applications yet. Explore top Malaysian university programs and apply.'}
          </p>
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <Link
              href="/courses-in-malaysia"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition"
            >
              <GraduationCap className="w-4 h-4" />
              Browse University Programs
            </Link>
            {unpaidCourses.length > 0 && (
              <Link
                href="/student/unpaid-applications"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-xs font-bold transition"
              >
                View Unpaid Applications ({unpaidCourses.length})
              </Link>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {displayedCourses.map((course) => {
            const program = course.university_program || course.university_programs || {};
            const university = program.university || {};
            const paid = isPaid(course);

            return (
              <div
                key={course.id}
                className={`bg-white rounded-2xl p-5 sm:p-6 shadow-xs transition-all relative overflow-hidden group border ${
                  paid
                    ? 'border-emerald-200/80 hover:border-emerald-300'
                    : 'border-slate-200/80 hover:border-slate-300'
                }`}
              >
                {/* Left Status Accent Bar */}
                <div
                  className={`absolute top-0 left-0 bottom-0 w-1.5 ${
                    paid ? 'bg-emerald-500' : 'bg-amber-500'
                  }`}
                />

                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Program & University Details */}
                  <div className="space-y-2 min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase flex items-center gap-1 border ${
                          paid
                            ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                            : 'bg-amber-100 text-amber-800 border-amber-200'
                        }`}
                      >
                        {paid ? <CheckCircle2 className="w-3 h-3 text-emerald-600" /> : null}
                        {paid ? 'Paid & Confirmed' : (course.app_status || 'Pending Payment')}
                      </span>
                      {program.level && (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
                          {program.level}
                        </span>
                      )}
                      <span className="text-[11px] text-slate-400">
                        Application #{course.id}
                      </span>
                    </div>

                    <h3 className="text-base sm:text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                      {program.course_name || course.program || "Course Application"}
                    </h3>

                    <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-600 font-medium">
                      <Building2 className="w-4 h-4 text-slate-400 shrink-0" />
                      <span>{university.name || course.university || "University"}</span>
                    </div>

                    {/* Metadata Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 text-xs text-slate-600">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Study Mode</span>
                        <span className="font-semibold">{program.study_mode || "Full Time"}</span>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Duration</span>
                        <span className="font-semibold">{program.duration || "3 Years"}</span>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Intake</span>
                        <span className="font-semibold">{program.intake || "Upcoming"}</span>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Deadline</span>
                        <span className="font-semibold">{program.application_deadline || "Open"}</span>
                      </div>
                    </div>
                  </div>

                  {/* Right Actions */}
                  <div className="flex flex-col sm:flex-row lg:flex-col items-stretch sm:items-center lg:items-end gap-2.5 shrink-0 pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                    <Link
                      href={`/student/applications/${course.id}`}
                      className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-2xs transition"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>View Application</span>
                    </Link>

                    <button
                      type="button"
                      onClick={() => setDeleteTargetId(course.id)}
                      className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-slate-50 hover:bg-red-50 text-slate-600 hover:text-red-600 border border-slate-200 hover:border-red-200 text-xs font-semibold transition cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete Application</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTargetId !== null && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-200 p-6 space-y-4">
            <div className="w-11 h-11 rounded-xl bg-red-50 text-red-600 border border-red-200 flex items-center justify-center">
              <Trash2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Delete Application?</h3>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Are you sure you want to delete this application record?
              </p>
            </div>
            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setDeleteTargetId(null)}
                disabled={deleting}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 disabled:opacity-60 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleDelete(deleteTargetId)}
                disabled={deleting}
                className="px-4 py-2 rounded-xl bg-red-600 text-white text-xs font-bold hover:bg-red-700 disabled:opacity-60 cursor-pointer"
              >
                {deleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
