import { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAdminAuth } from '@/context/AdminAuthContext';
import {
  Building2,
  GraduationCap,
  FileText,
  ArrowRight,
  Sparkles,
  RefreshCw,
  ShieldCheck,
  Award,
  HelpCircle,
  Briefcase,
  MapPin,
  Calendar,
  Clock,
  ArrowUpRight,
  Users
} from 'lucide-react';

interface UniversityItem {
  id: number;
  name?: string;
  uname?: string;
  city?: string;
  state?: string;
  qs_rank?: string;
  rating?: number;
  logo_path?: string;
  status?: number;
  created_at?: string;
}

interface BlogItem {
  id: number;
  title?: string;
  slug?: string;
  thumbnail_path?: string;
  status?: number;
  created_at?: string;
  category?: {
    category_name?: string;
  };
}

interface DashboardStats {
  universities: number;
  activeUniversities?: number;
  featuredUniversities?: number;
  scholarshipUniversities?: number;
  programs: number;
  blogs: number;
  blogCategories?: number;
  categories?: number;
  specializations?: number;
  levels?: number;
  users?: number;
  services?: number;
  exams?: number;
  faqs?: number;
  scholarships?: number;
  testimonials?: number;
  recentUniversities?: UniversityItem[];
  recentBlogs?: BlogItem[];
}

export default function Dashboard() {
  const { user, isSuperAdmin, canAccess } = useAdminAuth();
  const [stats, setStats] = useState<DashboardStats>({
    universities: 0,
    activeUniversities: 0,
    featuredUniversities: 0,
    scholarshipUniversities: 0,
    programs: 0,
    blogs: 0,
    blogCategories: 0,
    categories: 0,
    specializations: 0,
    levels: 0,
    users: 0,
    services: 0,
    exams: 0,
    faqs: 0,
    scholarships: 0,
    testimonials: 0,
    recentUniversities: [],
    recentBlogs: [],
  });

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [currentTime, setCurrentTime] = useState<string>('');

  // Live Clock for Malaysia Standard Time (MYT / UTC+8)
  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      const mytString = now.toLocaleTimeString('en-US', {
        timeZone: 'Asia/Kuala_Lumpur',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
      });
      setCurrentTime(mytString);
    };
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  const fetchStats = async (isManual = false) => {
    if (isManual) setRefreshing(true);
    try {
      const res = await fetch('/api/v1/admin/dashboard/stats');
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          setStats(json.data);
        }
      }
    } catch (e) {
      console.error('Failed to load dashboard stats:', e);
    } finally {
      setLoading(false);
      if (isManual) {
        setTimeout(() => setRefreshing(false), 500);
      }
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  // Quick Action Shortcuts filtered by user permissions
  const quickActions = useMemo(() => {
    const actions = [
      {
        label: 'Add University',
        href: '/university/add',
        icon: Building2,
        module: 'university',
        bg: 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/25',
      },
      {
        label: 'Create Article',
        href: '/blogs/create',
        icon: FileText,
        module: 'blogs',
        bg: 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/25',
      },
      {
        label: 'View Programs',
        href: '/programs',
        icon: GraduationCap,
        module: 'programs',
        bg: 'bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-600/25',
      },
    ];

    return actions.filter((action) => canAccess(action.module));
  }, [canAccess]);

  return (
    <div className="space-y-6 pb-12">
      {/* ── ELEGANT LIGHT HERO BANNER ── */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#eef5ff] via-[#f7faff] to-[#edf4fe] p-6 sm:p-8 border border-[#cfe0fc] shadow-xs">
        {/* Subtle ambient background glow accents */}
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-blue-400/10 blur-3xl pointer-events-none" />
        <div className="absolute -left-20 -bottom-20 h-64 w-64 rounded-full bg-indigo-400/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/90 border border-[#cfe0fc] text-[#1e40af] text-xs font-bold shadow-2xs">
                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                <span>Overview Dashboard</span>
              </span>

              {isSuperAdmin ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-bold">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  Super Admin
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white border border-stone-200 text-stone-700 text-[11px] font-bold">
                  Staff
                </span>
              )}

              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/90 border border-stone-200 text-stone-600 text-[11px] font-medium shadow-2xs">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                <span>System Active</span>
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-stone-900 font-serif">
              Welcome back, {user?.name || 'Administrator'} 👋
            </h1>

            <p className="text-stone-600 text-xs sm:text-sm font-medium leading-relaxed">
              Administrative management center for universities, academic degree programs, and published editorial media.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Live MYT Clock Pill */}
            <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-[#cfe0fc] text-stone-700 text-xs font-bold shadow-2xs">
              <Clock className="w-3.5 h-3.5 text-blue-600" />
              <span>MYT {currentTime || '--:--:--'}</span>
            </div>

            <button
              type="button"
              onClick={() => fetchStats(true)}
              disabled={refreshing}
              className="p-2.5 rounded-xl bg-white hover:bg-blue-50 border border-[#cfe0fc] text-stone-700 hover:text-[#1e40af] transition-all cursor-pointer disabled:opacity-50 shadow-2xs"
              title="Refresh statistics"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-blue-600' : ''}`} />
            </button>

            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <Link
                  key={action.href}
                  to={action.href}
                  className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap shadow-sm ${action.bg}`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{action.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── CORE 3 STAT CARDS (ACADEMIC & CONTENT) ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {/* Card 1: Universities */}
        <Link
          to="/university"
          className="group relative overflow-hidden bg-white border border-slate-200/90 hover:border-indigo-400 rounded-3xl p-6 shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center font-bold shadow-xs group-hover:scale-105 transition-transform">
              <Building2 className="w-6 h-6" />
            </div>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 shadow-2xs">
              {stats.activeUniversities || stats.universities} Active
            </span>
          </div>

          <div className="mt-5">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl sm:text-4xl font-black text-slate-800 tracking-tight">
                {loading ? '...' : stats.universities}
              </span>
              <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Universities</span>
            </div>
            <div className="flex items-center justify-between text-xs font-bold text-indigo-600 mt-3 pt-3 border-t border-slate-100">
              <span className="group-hover:text-indigo-700">Explore Catalog</span>
              <ArrowRight className="w-4 h-4 text-indigo-600 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </Link>

        {/* Card 2: Degree Programs */}
        <Link
          to="/programs"
          className="group relative overflow-hidden bg-white border border-slate-200/90 hover:border-emerald-400 rounded-3xl p-6 shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center font-bold shadow-xs group-hover:scale-105 transition-transform">
              <GraduationCap className="w-6 h-6" />
            </div>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 shadow-2xs">
              {stats.levels || 0} Levels
            </span>
          </div>

          <div className="mt-5">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl sm:text-4xl font-black text-slate-800 tracking-tight">
                {loading ? '...' : stats.programs}
              </span>
              <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Programs</span>
            </div>
            <div className="flex items-center justify-between text-xs font-bold text-emerald-600 mt-3 pt-3 border-t border-slate-100">
              <span className="group-hover:text-emerald-700">{stats.specializations || 0} Specializations</span>
              <ArrowRight className="w-4 h-4 text-emerald-600 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </Link>

        {/* Card 3: Articles & Blogs */}
        <Link
          to="/blogs"
          className="group relative overflow-hidden bg-white border border-slate-200/90 hover:border-amber-400 rounded-3xl p-6 shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-100 text-amber-600 flex items-center justify-center font-bold shadow-xs group-hover:scale-105 transition-transform">
              <FileText className="w-6 h-6" />
            </div>
            <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200 shadow-2xs">
              {stats.blogCategories || 0} Categories
            </span>
          </div>

          <div className="mt-5">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl sm:text-4xl font-black text-slate-800 tracking-tight">
                {loading ? '...' : stats.blogs}
              </span>
              <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Articles</span>
            </div>
            <div className="flex items-center justify-between text-xs font-bold text-amber-600 mt-3 pt-3 border-t border-slate-100">
              <span className="group-hover:text-amber-700">Manage Publications</span>
              <ArrowRight className="w-4 h-4 text-amber-600 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </Link>
      </div>

      {/* ── SECONDARY QUICK METRICS RIBBON ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Link
          to="/scholarships"
          className="group bg-white hover:bg-blue-50/40 border border-slate-200/90 hover:border-blue-300 rounded-2xl p-4 flex items-center gap-3.5 transition-all shadow-2xs hover:shadow-sm"
        >
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform shadow-2xs">
            <Award className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <span className="text-[10.5px] font-extrabold text-slate-400 uppercase tracking-wider block truncate">Scholarships</span>
            <span className="text-base font-black text-slate-800">{stats.scholarships || 0}</span>
          </div>
        </Link>

        <Link
          to="/services"
          className="group bg-white hover:bg-purple-50/40 border border-slate-200/90 hover:border-purple-300 rounded-2xl p-4 flex items-center gap-3.5 transition-all shadow-2xs hover:shadow-sm"
        >
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 border border-purple-100 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform shadow-2xs">
            <Briefcase className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <span className="text-[10.5px] font-extrabold text-slate-400 uppercase tracking-wider block truncate">Services</span>
            <span className="text-base font-black text-slate-800">{stats.services || 0}</span>
          </div>
        </Link>

        <Link
          to="/faqs"
          className="group bg-white hover:bg-cyan-50/40 border border-slate-200/90 hover:border-cyan-300 rounded-2xl p-4 flex items-center gap-3.5 transition-all shadow-2xs hover:shadow-sm"
        >
          <div className="w-10 h-10 rounded-xl bg-cyan-50 text-cyan-600 border border-cyan-100 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform shadow-2xs">
            <HelpCircle className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <span className="text-[10.5px] font-extrabold text-slate-400 uppercase tracking-wider block truncate">Help FAQs</span>
            <span className="text-base font-black text-slate-800">{stats.faqs || 0}</span>
          </div>
        </Link>

        <Link
          to="/users"
          className="group bg-white hover:bg-emerald-50/40 border border-slate-200/90 hover:border-emerald-300 rounded-2xl p-4 flex items-center gap-3.5 transition-all shadow-2xs hover:shadow-sm"
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform shadow-2xs">
            <Users className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <span className="text-[10.5px] font-extrabold text-slate-400 uppercase tracking-wider block truncate">Active Users</span>
            <span className="text-base font-black text-slate-800">{stats.users || 0}</span>
          </div>
        </Link>
      </div>

      {/* ── 2-COLUMN RECENT DATA: UNIVERSITIES & BLOGS ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Universities */}
        {canAccess('university') && (
          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-sm">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center shadow-2xs">
                  <Building2 className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h2 className="text-sm font-black text-slate-800">Recently Added Universities</h2>
                  <p className="text-[11px] text-slate-400 font-medium">Institutions in catalog</p>
                </div>
              </div>

              <Link
                to="/university"
                className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-700 hover:gap-1.5 transition-all"
              >
                <span>View All</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="divide-y divide-slate-100 mt-2">
              {stats.recentUniversities && stats.recentUniversities.length > 0 ? (
                stats.recentUniversities.slice(0, 5).map((uni) => (
                  <div key={uni.id} className="py-3 flex items-center justify-between gap-3 group hover:bg-indigo-50/30 px-2 rounded-2xl transition-colors">
                    <div className="flex items-center gap-3 min-w-0">
                      {uni.logo_path ? (
                        <img
                          src={uni.logo_path.startsWith('http') ? uni.logo_path : `/${uni.logo_path}`}
                          alt={uni.name || 'University'}
                          className="w-10 h-10 rounded-xl object-contain bg-slate-50 p-1 border border-slate-200/80 shrink-0"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 font-black text-xs flex items-center justify-center shrink-0 border border-indigo-100">
                          {uni.name?.charAt(0) || 'U'}
                        </div>
                      )}

                      <div className="min-w-0">
                        <span className="text-xs font-bold text-slate-800 block truncate group-hover:text-indigo-600 transition-colors">
                          {uni.name}
                        </span>
                        <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-400">
                          {(uni.city || uni.state) && (
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-slate-400" />
                              {[uni.city, uni.state].filter(Boolean).join(', ')}
                            </span>
                          )}
                          {uni.qs_rank && (
                            <span className="px-1.5 py-0.2 bg-amber-50 text-amber-700 rounded font-semibold border border-amber-200/60">
                              QS #{uni.qs_rank}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10.5px] font-bold ${
                          uni.status === 1
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {uni.status === 1 ? 'Active' : 'Draft'}
                      </span>
                      <Link
                        to={`/university/edit/${uni.id}`}
                        className="p-1 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                        title="Edit University"
                      >
                        <ArrowUpRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-8 text-center text-xs text-slate-400">
                  No universities recorded yet.
                </div>
              )}
            </div>
          </div>
        )}

        {/* Recent Articles */}
        {canAccess('blogs') && (
          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-sm">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center shadow-2xs">
                  <FileText className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h2 className="text-sm font-black text-slate-800">Recent Blog Publications</h2>
                  <p className="text-[11px] text-slate-400 font-medium">Articles & news stories</p>
                </div>
              </div>

              <Link
                to="/blogs"
                className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 hover:text-emerald-700 hover:gap-1.5 transition-all"
              >
                <span>View All</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="divide-y divide-slate-100 mt-2">
              {stats.recentBlogs && stats.recentBlogs.length > 0 ? (
                stats.recentBlogs.slice(0, 5).map((blog) => (
                  <div key={blog.id} className="py-3 flex items-center justify-between gap-3 group hover:bg-emerald-50/30 px-2 rounded-2xl transition-colors">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 font-black text-xs flex items-center justify-center shrink-0 border border-amber-100 shadow-2xs">
                        <FileText className="w-5 h-5" />
                      </div>

                      <div className="min-w-0">
                        <span className="text-xs font-bold text-slate-800 block truncate group-hover:text-emerald-600 transition-colors">
                          {blog.title}
                        </span>
                        <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-400">
                          {blog.category?.category_name && (
                            <span className="px-1.5 py-0.2 bg-blue-50 text-blue-700 rounded font-semibold border border-blue-200/60 truncate max-w-[140px]">
                              {blog.category.category_name}
                            </span>
                          )}
                          {blog.created_at && (
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3 text-slate-400" />
                              {new Date(blog.created_at).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <Link
                        to={`/blogs/edit/${blog.id}`}
                        className="p-1 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                        title="Edit Blog"
                      >
                        <ArrowUpRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-8 text-center text-xs text-slate-400">
                  No articles published yet.
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
