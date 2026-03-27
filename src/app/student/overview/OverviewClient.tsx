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
    <div className="min-h-screen w-full">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-gray-900 mb-1">{stats.total}</div>
                <div className="text-sm text-gray-500">Total Applications</div>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-gray-900 mb-1">{stats.accepted}</div>
                <div className="text-sm text-gray-500">Accepted</div>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-gray-900 mb-1">{stats.review}</div>
                <div className="text-sm text-gray-500">Under Review</div>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <Clock className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-gray-900 mb-1">{stats.progress}%</div>
                <div className="text-sm text-gray-500">Avg Progress</div>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">Recent Applications</h2>
              <Link
                href="/student/applied-colleges"
                className="text-sm text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1 hover:gap-2 transition-all"
              >
                View All <ArrowUpRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="p-6 space-y-4">
              {recentApps.length > 0 ? (
                recentApps.map((app, index) => (
                  <div key={index} className="flex items-center justify-between p-4 rounded-xl bg-gray-50">
                    <div className="flex items-center space-x-4">
                      <div
                        className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                          String(app?.app_status || "").toLowerCase() === "accepted"
                            ? "bg-green-100 text-green-600"
                            : "bg-blue-100 text-blue-600"
                        }`}
                      >
                        {String(app?.app_status || "").toLowerCase() === "accepted" ? (
                          <CheckCircle className="w-6 h-6" />
                        ) : (
                          <FileText className="w-6 h-6" />
                        )}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900 line-clamp-1">
                          {app?.university_program?.course_name || "Course Application"}
                        </div>
                        <div className="text-sm text-gray-500 mb-1">
                          {app?.university_program?.university?.name || "University"}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-400">
                          <Calendar className="w-3 h-3" />
                          <span>Updated {formatDate(app?.created_at || app?.updated_at)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div
                        className={`px-3 py-1 text-center text-[10px] uppercase font-bold rounded-full mb-1 ${getStatusColor(
                          app?.app_status,
                        )}`}
                      >
                        {app?.app_status || "PENDING"}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-2">No applications yet.</p>
                  <Link href="/courses" className="text-blue-600 hover:underline text-sm font-medium">
                    Browse Courses
                  </Link>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-xl font-semibold text-gray-900">Quick Actions</h2>
            </div>
            <div className="p-6 space-y-4">
              <Link
                href="/student/applied-colleges"
                className="w-full flex items-center space-x-4 p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Eye className="w-6 h-6 text-blue-600" />
                </div>
                <div className="text-left">
                  <div className="font-medium text-gray-900">View All Applications</div>
                </div>
              </Link>

              <button className="w-full flex items-center space-x-4 p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <Award className="w-6 h-6 text-green-600" />
                </div>
                <div className="text-left">
                  <div className="font-medium text-gray-900">Check Offer Letters</div>
                </div>
              </button>

              <button className="w-full flex items-center space-x-4 p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                  <Plane className="w-6 h-6 text-purple-600" />
                </div>
                <div className="text-left">
                  <div className="font-medium text-gray-900">Visa Applications</div>
                </div>
              </button>

              <Link
                href="/contact-us"
                className="w-full flex items-center space-x-4 p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                  <MessageCircle className="w-6 h-6 text-orange-600" />
                </div>
                <div className="text-left">
                  <div className="font-medium text-gray-900">Get Support</div>
                </div>
              </Link>
            </div>
          </div>
      </div>

      <button
        type="button"
        aria-label="Support"
        className="fixed bottom-6 right-6 w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
      >
        <MessageCircle className="w-6 h-6" />
      </button>
      </div>
  );
}
