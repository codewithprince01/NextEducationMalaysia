'use client'

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  CreditCard,
  Building2,
  Clock,
  AlertCircle,
  Calendar,
  GraduationCap,
  ArrowRight,
  CheckCircle2,
  Trash2,
  ExternalLink,
  PhoneCall,
  Sparkles,
  HelpCircle,
  Info,
  Eye
} from "lucide-react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://admin.educationmalaysia.in/api'
const API_KEY = process.env.NEXT_PUBLIC_FRONTEND_API_KEY || ''

export default function UnpaidApplicationsClient() {
  const [unpaidCourses, setUnpaidCourses] = useState<any[]>([]);
  const [paidCount, setPaidCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchApplications = async () => {
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

      let allApps: any[] = [];
      if (Array.isArray(data?.data?.applied_programs)) {
        allApps = data.data.applied_programs;
      } else if (Array.isArray(data?.applied_programs)) {
        allApps = data.applied_programs;
      } else if (Array.isArray(data)) {
        allApps = data;
      }

      // Filter unpaid applications (app_status !== 'Paid' and !== 'Accepted')
      const isPaid = (c: any) => {
        const s = String(c?.app_status || "").toLowerCase().trim();
        return s === "paid" || s === "accepted" || s === "approved";
      };

      const unpaid = allApps.filter((c: any) => !isPaid(c));
      const paid = allApps.filter((c: any) => isPaid(c));

      setUnpaidCourses(unpaid);
      setPaidCount(paid.length);
    } catch (err) {
      console.error("Error fetching unpaid applications:", err);
      setUnpaidCourses([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
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

      setUnpaidCourses((prev) => prev.filter((course) => course.id !== id));
      try {
        localStorage.setItem('applied_colleges_updated', String(Date.now()));
      } catch {
        // ignore
      }
    } catch (err) {
      console.error("Failed to delete application:", err);
    } finally {
      setDeleting(false);
      setDeleteTargetId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-10 h-10 border-4 border-amber-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      {/* Header with Switcher Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center">
              <CreditCard className="w-5 h-5" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Unpaid Applications
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
              {unpaidCourses.length} Pending
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Applications you have submitted where application or processing fee payment is still pending.
          </p>
        </div>

        {/* Quick Navigation to Paid Applications */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Link
            href="/student/my-applications"
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-slate-200 hover:border-blue-300 text-slate-700 hover:text-blue-700 text-xs font-bold shadow-2xs transition"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>My Applications (Paid: {paidCount})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {unpaidCourses.length === 0 ? (
        <div className="bg-white border border-slate-200/80 rounded-2xl p-10 text-center shadow-xs">
          <div className="w-14 h-14 rounded-2xl bg-slate-50 text-slate-400 border border-slate-200 flex items-center justify-center mx-auto mb-3">
            <CreditCard className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-slate-800 mb-1">
            No Unpaid Applications
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto mb-6">
            You do not have any pending unpaid applications. All your courses are either paid or you have not applied yet.
          </p>
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <Link
              href="/courses-in-malaysia"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition"
            >
              <GraduationCap className="w-4 h-4" />
              Browse University Courses
            </Link>
            {paidCount > 0 && (
              <Link
                href="/student/my-applications"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition"
              >
                View Paid Applications ({paidCount})
              </Link>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {unpaidCourses.map((course) => {
            const program = course.university_program || course.university_programs || {};
            const university = program.university || {};

            return (
              <div
                key={course.id}
                className="bg-white border border-amber-200/70 hover:border-amber-300 rounded-2xl p-5 sm:p-6 shadow-xs transition-all relative overflow-hidden group"
              >
                {/* Left Amber Status Accent Bar */}
                <div className="absolute top-0 left-0 bottom-0 w-1.5 bg-amber-500" />

                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Program & University Details */}
                  <div className="space-y-2 min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-amber-100 text-amber-800 border border-amber-200 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {course.app_status || "Not-Paid (Payment Pending)"}
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
                      {program.course_name || course.program || "Course Name"}
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
                      <span>Cancel Application</span>
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
              <h3 className="text-base font-bold text-slate-900">Cancel Unpaid Application?</h3>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Are you sure you want to remove this unpaid course application? You can always re-apply anytime.
              </p>
            </div>
            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setDeleteTargetId(null)}
                disabled={deleting}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 disabled:opacity-60 cursor-pointer"
              >
                Keep Application
              </button>
              <button
                type="button"
                onClick={() => handleDelete(deleteTargetId)}
                disabled={deleting}
                className="px-4 py-2 rounded-xl bg-red-600 text-white text-xs font-bold hover:bg-red-700 disabled:opacity-60 cursor-pointer"
              >
                {deleting ? "Cancelling..." : "Yes, Cancel"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
