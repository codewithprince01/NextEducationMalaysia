import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAdminAuth } from '@/context/AdminAuthContext';
import {
  Building2,
  GraduationCap,
  FileText,
  Users,
  Search,
  PlusCircle,
  ArrowRight,
  TrendingUp,
  BarChart3
} from 'lucide-react';

export default function Dashboard() {
  const { user } = useAdminAuth();
  const [stats, setStats] = useState({
    universities: 120,
    programs: 450,
    blogs: 118,
    applications: 740,
  });

  useEffect(() => {
    const fetchQuickStats = async () => {
      try {
        const res = await fetch('/api/v1/courses/filters');
        if (res.ok) {
          const json = await res.json();
          const filters = json.data || {};
          setStats((prev) => ({
            ...prev,
            programs: (filters.categories?.length || 30) * 15,
          }));
        }
      } catch (e) {
        console.error('Stats error:', e);
      }
    };
    fetchQuickStats();
  }, []);

  return (
    <div className="space-y-8">
      {/* ── TOP DASHBOARD WELCOME HERO CARD ── */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="space-y-1.5">
            <span className="text-[11px] font-extrabold uppercase tracking-widest text-indigo-600 block">
              DASHBOARD OVERVIEW
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Welcome back, {user?.name?.split(' ')[0] || 'Admin'} 👋
            </h1>
            <p className="text-slate-500 text-xs sm:text-sm font-medium">
              Here&apos;s what&apos;s happening with Education Malaysia portal today.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/university/add"
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20 flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap"
            >
              <PlusCircle className="w-4 h-4" />
              Add University
            </Link>
          </div>
        </div>
      </div>

      {/* ── STAT METRICS GRID (Innayat Medical Style) ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Metric 1: Total Applications */}
        <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
              <Users className="w-6 h-6" />
            </div>
            <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-600 text-xs font-bold">
              <TrendingUp className="w-3 h-3" />
              <span>+12.5%</span>
            </div>
          </div>
          <div className="mt-5">
            <span className="text-3xl sm:text-4xl font-extrabold text-slate-900 block leading-tight">
              {stats.applications}
            </span>
            <span className="text-xs font-bold text-slate-500 mt-1 block">
              Total Inquiries & Leads
            </span>
          </div>
        </div>

        {/* Metric 2: Active Universities */}
        <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 rounded-2xl bg-cyan-100 text-cyan-600 flex items-center justify-center shrink-0">
              <Building2 className="w-6 h-6" />
            </div>
            <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-600 text-xs font-bold">
              <TrendingUp className="w-3 h-3" />
              <span>+4.1%</span>
            </div>
          </div>
          <div className="mt-5">
            <span className="text-3xl sm:text-4xl font-extrabold text-slate-900 block leading-tight">
              {stats.universities}
            </span>
            <span className="text-xs font-bold text-slate-500 mt-1 block">
              Active Universities
            </span>
          </div>
        </div>

        {/* Metric 3: Partner Programs */}
        <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-600 text-xs font-bold">
              <TrendingUp className="w-3 h-3" />
              <span>+2.8%</span>
            </div>
          </div>
          <div className="mt-5">
            <span className="text-3xl sm:text-4xl font-extrabold text-slate-900 block leading-tight">
              {stats.programs}
            </span>
            <span className="text-xs font-bold text-slate-500 mt-1 block">
              Programs & Degrees
            </span>
          </div>
        </div>

        {/* Metric 4: Blogs & Articles */}
        <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
              <FileText className="w-6 h-6" />
            </div>
            <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-600 text-xs font-bold">
              <TrendingUp className="w-3 h-3" />
              <span>+6.3%</span>
            </div>
          </div>
          <div className="mt-5">
            <span className="text-3xl sm:text-4xl font-extrabold text-slate-900 block leading-tight">
              {stats.blogs}
            </span>
            <span className="text-xs font-bold text-slate-500 mt-1 block">
              Published Blogs & News
            </span>
          </div>
        </div>
      </div>

      {/* ── QUICK MANAGEMENT CARDS SECTION ── */}
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-indigo-600" />
            Quick Management Modules
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link
            to="/university"
            className="group bg-white hover:bg-slate-50/50 border border-slate-200/80 hover:border-indigo-300 rounded-3xl p-6 transition-all shadow-sm hover:shadow-md flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                <Building2 className="w-6 h-6" />
              </div>
              <h3 className="text-base font-extrabold text-slate-900 mb-1.5 group-hover:text-indigo-600 transition-colors">
                University Management
              </h3>
              <p className="text-slate-500 text-xs leading-relaxed font-medium">
                Add, edit, and configure universities, logos, QS rankings, facilities, photos, and dynamic scholarship availability.
              </p>
            </div>
            <div className="mt-6 flex items-center gap-1.5 text-xs font-bold text-indigo-600 group-hover:gap-2.5 transition-all">
              <span>Manage Universities</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </Link>

          <Link
            to="/levels"
            className="group bg-white hover:bg-slate-50/50 border border-slate-200/80 hover:border-emerald-300 rounded-3xl p-6 transition-all shadow-sm hover:shadow-md flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                <GraduationCap className="w-6 h-6" />
              </div>
              <h3 className="text-base font-extrabold text-slate-900 mb-1.5 group-hover:text-emerald-600 transition-colors">
                Academic Levels & Categories
              </h3>
              <p className="text-slate-500 text-xs leading-relaxed font-medium">
                Organize degree levels, study modes, course categories, specialization levels, and all degree programs.
              </p>
            </div>
            <div className="mt-6 flex items-center gap-1.5 text-xs font-bold text-emerald-600 group-hover:gap-2.5 transition-all">
              <span>Manage Levels</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </Link>

          <Link
            to="/static-page-seos"
            className="group bg-white hover:bg-slate-50/50 border border-slate-200/80 hover:border-purple-300 rounded-3xl p-6 transition-all shadow-sm hover:shadow-md flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                <Search className="w-6 h-6" />
              </div>
              <h3 className="text-base font-extrabold text-slate-900 mb-1.5 group-hover:text-purple-600 transition-colors">
                SEO & Page Metadata
              </h3>
              <p className="text-slate-500 text-xs leading-relaxed font-medium">
                Configure meta titles, meta descriptions, static/dynamic SEO rules, and default OG social sharing cards.
              </p>
            </div>
            <div className="mt-6 flex items-center gap-1.5 text-xs font-bold text-purple-600 group-hover:gap-2.5 transition-all">
              <span>Manage SEO</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
