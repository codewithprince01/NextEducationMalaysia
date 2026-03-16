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

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://admin.educationmalaysia.in/api'

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
          return;
        }

        // 1. Fetch Applied Courses
        const appRes = await fetch(`${API_BASE}/student/applied-college`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const appData = await appRes.json();

        let courses = [];
        if (appData && Array.isArray(appData.applied_programs)) {
          courses = appData.applied_programs;
        } else if (appData.data && Array.isArray(appData.data.applied_programs)) {
          courses = appData.data.applied_programs;
        }

        // Calculate Stats
        const total = courses.length;
        const accepted = courses.filter(
          (c: any) => c.app_status?.toLowerCase() === "accepted" || c.app_status?.toLowerCase() === "approved",
        ).length;
        const review = courses.filter(
          (c: any) =>
            c.app_status?.toLowerCase() === "pending" ||
            c.app_status?.toLowerCase() === "review" ||
            !c.app_status,
        ).length;

        // Sort by date (newest first)
        const sorted = [...courses].sort((a: any, b: any) => {
          const dateA = new Date(a.created_at || a.updated_at || 0).getTime();
          const dateB = new Date(b.created_at || b.updated_at || 0).getTime();
          if (dateA !== dateB) return dateB - dateA;
          return b.id - a.id;
        });

        setRecentApps(sorted.slice(0, 3));

        // 2. Fetch Profile for Progress
        const profileRes = await fetch(`${API_BASE}/student/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const profileData = await profileRes.json();
        const student = profileData?.data?.student || {};

        // Calculate Progress (Simple logic based on filled fields)
        const fields = [
          student.name,
          student.email,
          student.mobile,
          student.dob,
          student.nationality,
          student.passport_number,
          student.home_address,
        ];
        const filled = fields.filter((f) => f && f !== "").length;
        const progress = Math.round((filled / fields.length) * 100);

        setStats({ total, accepted, review, progress });
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const formatDate = (dateString: string) => {
    if (!dateString) return "Recently";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getStatusColor = (status: string) => {
    const s = (status || "pending").toLowerCase();
    if (s === "accepted" || s === "approved")
      return "bg-green-100 text-green-700 border-green-200";
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
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-0">
        <header className="mb-10 text-center md:text-left">
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Welcome Back!</h1>
          <p className="text-gray-500 mt-2 font-medium">Track your applications and academic journey</p>
        </header>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {/* Total Applications */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-gray-900 mb-1">{stats.total}</div>
                <div className="text-sm font-semibold text-gray-500">Total Applications</div>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          {/* Accepted */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-gray-900 mb-1">{stats.accepted}</div>
                <div className="text-sm font-semibold text-gray-500">Accepted</div>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          {/* Under Review */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-gray-900 mb-1">{stats.review}</div>
                <div className="text-sm font-semibold text-gray-500">Under Review</div>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <Clock className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>

          {/* Profile Progress */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-gray-900 mb-1">{stats.progress}%</div>
                <div className="text-sm font-semibold text-gray-500">Profile Progress</div>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-orange-600" />
              </div>
            </div>
            <div className="mt-4 w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
              <div 
                className="bg-orange-500 h-full rounded-full transition-all duration-1000" 
                style={{ width: `${stats.progress}%` }}
              />
            </div>
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Applications */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col">
            <div className="p-6 border-b border-gray-50 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" />
                Recent Applications
              </h2>
              <Link
                href="/student/applied-colleges"
                className="text-sm text-blue-600 hover:text-blue-800 font-bold flex items-center gap-1 transition-all"
              >
                View All <ArrowUpRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="p-6 space-y-5 flex-1">
              {recentApps.length > 0 ? (
                recentApps.map((app, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 rounded-2xl bg-gray-50 hover:bg-white hover:shadow-sm border border-transparent hover:border-gray-100 transition-all group"
                  >
                    <div className="flex items-center space-x-4">
                      <div
                        className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors ${
                          app.app_status?.toLowerCase() === "accepted" || app.app_status?.toLowerCase() === "approved"
                            ? "bg-green-100 text-green-600"
                            : "bg-blue-100 text-blue-600"
                        }`}
                      >
                        {app.app_status?.toLowerCase() === "accepted" || app.app_status?.toLowerCase() === "approved" ? (
                          <CheckCircle className="w-6 h-6" />
                        ) : (
                          <FileText className="w-6 h-6" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="font-bold text-gray-900 line-clamp-1 group-hover:text-blue-600 transition-colors">
                          {app.university_program?.course_name || "Course Application"}
                        </div>
                        <div className="text-sm font-medium text-gray-500 mb-1 flex items-center gap-1">
                          <Award className="w-3.5 h-3.5 inline" />
                          {app.university_program?.university?.name || "University"}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-400 font-medium">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>
                            Updated {formatDate(app.created_at || app.updated_at)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex-shrink-0">
                      <div
                        className={`px-3 py-1.5 text-center text-[10px] uppercase font-heavy tracking-wider rounded-full ${getStatusColor(
                          app.app_status,
                        )}`}
                      >
                        {app.app_status || "PENDING"}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FileText className="w-8 h-8 text-gray-300" />
                  </div>
                  <p className="text-gray-500 font-medium mb-4">No applications yet.</p>
                  <Link
                    href="/courses"
                    className="inline-flex items-center px-6 py-2.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 active:scale-95"
                  >
                    Browse Courses
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
            <div className="p-6 border-b border-gray-50 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              <h2 className="text-xl font-bold text-gray-900">Quick Actions</h2>
            </div>
            <div className="p-6 grid grid-cols-1 sm:grid-cols-1 gap-4">
              {/* View All Applications */}
              <Link
                href="/student/applied-colleges"
                className="flex items-center space-x-4 p-4 rounded-2xl bg-blue-50/50 hover:bg-blue-50 transition-all border border-blue-100/50 hover:border-blue-200 group"
              >
                <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                  <Eye className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <div className="font-bold text-gray-900 group-hover:text-blue-700 transition-colors text-lg">
                    View All Applications
                  </div>
                  <p className="text-sm text-gray-500 font-medium tracking-tight">Track your college admission status</p>
                </div>
              </Link>

              {/* Check Offer Letters */}
              <button className="flex items-center space-x-4 p-4 rounded-2xl bg-green-50/50 hover:bg-green-50 transition-all border border-green-100/50 hover:border-green-200 group text-left w-full">
                <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                  <Award className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <div className="font-bold text-gray-900 group-hover:text-green-700 transition-colors text-lg">
                    Check Offer Letters
                  </div>
                  <p className="text-sm text-gray-500 font-medium tracking-tight">Download your official university documents</p>
                </div>
              </button>

              {/* Visa Applications */}
              <button className="flex items-center space-x-4 p-4 rounded-2xl bg-purple-50/50 hover:bg-purple-50 transition-all border border-purple-100/50 hover:border-purple-200 group text-left w-full">
                <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                  <Plane className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <div className="font-bold text-gray-900 group-hover:text-purple-700 transition-colors text-lg">
                    Visa Applications
                  </div>
                  <p className="text-sm text-gray-500 font-medium tracking-tight">Monitor your EMGS Malaysia visa status</p>
                </div>
              </button>

              {/* Get Support */}
              <Link
                href="/contact-us"
                className="flex items-center space-x-4 p-4 rounded-2xl bg-orange-50/50 hover:bg-orange-50 transition-all border border-orange-100/50 hover:border-orange-200 group"
              >
                <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                  <MessageCircle className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <div className="font-bold text-gray-900 group-hover:text-orange-700 transition-colors text-lg">
                    Get Support
                  </div>
                  <p className="text-sm text-gray-500 font-medium tracking-tight">Chat with our admission experts</p>
                </div>
              </Link>
            </div>
          </div>
        </div>

        {/* Floating Chat Button */}
        <Link 
          href="/student/conversation"
          className="fixed bottom-8 right-8 w-16 h-16 bg-blue-600 text-white rounded-2xl shadow-2xl hover:bg-blue-700 hover:scale-110 transition-all flex items-center justify-center z-50 group active:scale-95"
        >
          <MessageCircle className="w-8 h-8 group-hover:rotate-12 transition-transform" />
          <span className="absolute -top-1 -right-1 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-blue-500 border-2 border-white"></span>
          </span>
        </Link>
      </div>
    </div>
  );
}
