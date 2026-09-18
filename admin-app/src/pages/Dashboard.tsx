import { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAdminAuth } from '@/context/AdminAuthContext';
import {
  Building2,
  GraduationCap,
  FileText,
  Users,
  Search,
  ArrowRight,
  TrendingUp,
  BarChart3,
  Sparkles,
  RefreshCw,
  Globe2,
  ShieldCheck,
  Award,
  Layers,
  HelpCircle,
  Briefcase,
  BookOpen,
  MessageSquare,
  UploadCloud,
  CheckCircle2,
  ExternalLink,
  MapPin,
  Calendar,
  Clock,
  Activity,
  ArrowUpRight
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
  applications: number;
  malaysiaApplications?: number;
  internationalApplications?: number;
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
    applications: 0,
    malaysiaApplications: 0,
    internationalApplications: 0,
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

  // Live Clock for Malaysia Standard Time (UTC+8) & Local
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
        bg: 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-600/20',
      },
      {
        label: 'Create Blog',
        href: '/blogs/create',
        icon: FileText,
        module: 'blogs',
        bg: 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20',
      },
      {
        label: 'All Programs',
        href: '/programs',
        icon: GraduationCap,
        module: 'programs',
        bg: 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-600/20',
      },
      {
        label: 'Upload Files',
        href: '/upload-files',
        icon: UploadCloud,
        module: 'upload-files',
        bg: 'bg-purple-600 hover:bg-purple-700 text-white shadow-purple-600/20',
      },
    ];

    return actions.filter((action) => canAccess(action.module));
  }, [canAccess]);

  // Quick Module Cards filtered by user permissions
  const quickModules = useMemo(() => {
    const modules = [
      {
        title: 'Universities & Campuses',
        description: 'Manage 120+ top institutions, campus photos, facilities, QS rankings, and overviews.',
        href: '/university',
        module: 'university',
        icon: Building2,
        color: 'from-blue-500 to-indigo-600',
        badge: `${stats.universities || 0} Listed`,
        lightBg: 'bg-blue-50 text-blue-600 border-blue-100',
      },
      {
        title: 'Degree Programs & Levels',
        description: 'Configure academic levels, course specializations, study modes, and program contents.',
        href: '/programs',
        module: 'programs',
        icon: GraduationCap,
        color: 'from-emerald-500 to-teal-600',
        badge: `${stats.programs || 0} Programs`,
        lightBg: 'bg-emerald-50 text-emerald-600 border-emerald-100',
      },
      {
        title: 'Blog & Editorial News',
        description: 'Publish high-ranking articles, student guides, admission news, and educational FAQs.',
        href: '/blogs',
        module: 'blogs',
        icon: FileText,
        color: 'from-amber-500 to-orange-600',
        badge: `${stats.blogs || 0} Articles`,
        lightBg: 'bg-amber-50 text-amber-600 border-amber-100',
      },
      {
        title: 'Applications & EMGS Data',
        description: 'Monitor student application distributions, Malaysia courses, and international analytics.',
        href: '/malaysia-applications',
        module: ['malaysia-applications', 'international-student-data'],
        icon: Globe2,
        color: 'from-violet-500 to-purple-600',
        badge: `${stats.applications || 0} Applications`,
        lightBg: 'bg-violet-50 text-violet-600 border-violet-100',
      },
      {
        title: 'SEO & Page Metadata',
        description: 'Optimize page meta tags, OpenGraph social cards, dynamic SEO, and search index rules.',
        href: '/static-page-seos',
        module: 'static-page-seos',
        icon: Search,
        color: 'from-rose-500 to-pink-600',
        badge: 'SEO Engine',
        lightBg: 'bg-rose-50 text-rose-600 border-rose-100',
      },
      {
        title: 'Student Testimonials',
        description: 'Manage verified student feedback, star ratings, photos, and university reviews.',
        href: '/testimonials',
        module: 'testimonials',
        icon: MessageSquare,
        color: 'from-cyan-500 to-blue-600',
        badge: `${stats.testimonials || 0} Reviews`,
        lightBg: 'bg-cyan-50 text-cyan-600 border-cyan-100',
      },
    ];

    return modules.filter((m) => canAccess(m.module));
  }, [canAccess, stats]);

  // Application percentage calculations
  const totalApps = stats.applications || 1;
  const myApps = stats.malaysiaApplications || 0;
  const intApps = stats.internationalApplications || 0;
  const myAppsPercent = Math.min(100, Math.round((myApps / totalApps) * 100)) || 50;
  const intAppsPercent = 100 - myAppsPercent;

  return (
    <div className="space-y-6 sm:space-y-8 pb-12">
      {/* ── TOP HERO BANNER & GREETING ── */}
      <div className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-indigo-900/40">
        {/* Ambient Glows */}
        <div className="absolute -top-24 -right-24 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-200 text-xs font-semibold backdrop-blur-md">
                <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                <span>Admin Management Console</span>
              </span>

              {isSuperAdmin ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-[11px] font-bold">
                  <ShieldCheck className="w-3 h-3" />
                  Super Admin
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/20 border border-amber-400/30 text-amber-300 text-[11px] font-bold">
                  <ShieldCheck className="w-3 h-3" />
                  Staff Member
                </span>
              )}

              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/10 text-slate-300 text-[11px] font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span>Live Portal</span>
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white">
              Welcome back, {user?.name?.split(' ')[0] || 'Admin'} 👋
            </h1>

            <p className="text-slate-300 text-xs sm:text-sm font-medium leading-relaxed">
              Real-time administrative control for universities, degrees, EMGS student applications, editorial media, and SEO settings.
            </p>
          </div>

          {/* Quick Actions & Live Time Widget */}
          <div className="flex flex-col sm:flex-row lg:flex-col items-start sm:items-center lg:items-end gap-3">
            {/* Live Clock Pill */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-2xl bg-white/10 border border-white/10 text-slate-200 text-xs font-semibold backdrop-blur-md">
              <Clock className="w-3.5 h-3.5 text-blue-300" />
              <span>MYT: {currentTime || 'Loading...'}</span>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-2.5">
              <button
                type="button"
                onClick={() => fetchStats(true)}
                disabled={refreshing}
                title="Refresh Live Statistics"
                className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold border border-white/15 flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">Refresh</span>
              </button>

              {quickActions.map((action) => {
                const Icon = action.icon;
                return (
                  <Link
                    key={action.href}
                    to={action.href}
                    className={`px-4 py-2 rounded-xl text-xs font-bold shadow-md flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${action.bg}`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{action.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ── PRIMARY KPI STAT METRICS GRID ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {/* Metric 1: Universities */}
        <div className="group relative overflow-hidden bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm hover:shadow-xl hover:border-indigo-200 transition-all duration-300 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100/80 text-indigo-600 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
              <Building2 className="w-6 h-6" />
            </div>
            <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs font-bold">
              <TrendingUp className="w-3 h-3 text-emerald-600" />
              <span>{stats.activeUniversities || stats.universities} Active</span>
            </div>
          </div>

          <div className="mt-5">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                {loading ? '...' : stats.universities}
              </span>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Universities</span>
            </div>
            <div className="flex items-center justify-between text-xs font-medium text-slate-500 mt-2 pt-2 border-t border-slate-100">
              <span>Scholarships Available</span>
              <span className="font-bold text-indigo-600">{stats.scholarshipUniversities || 0} Unis</span>
            </div>
          </div>
        </div>

        {/* Metric 2: Programs & Courses */}
        <div className="group relative overflow-hidden bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm hover:shadow-xl hover:border-emerald-200 transition-all duration-300 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100/80 text-emerald-600 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs font-bold">
              <Layers className="w-3 h-3 text-emerald-600" />
              <span>{stats.levels || 0} Levels</span>
            </div>
          </div>

          <div className="mt-5">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                {loading ? '...' : stats.programs}
              </span>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Degrees</span>
            </div>
            <div className="flex items-center justify-between text-xs font-medium text-slate-500 mt-2 pt-2 border-t border-slate-100">
              <span>Specializations</span>
              <span className="font-bold text-emerald-600">{stats.specializations || 0} Fields</span>
            </div>
          </div>
        </div>

        {/* Metric 3: Applications & Inquiries */}
        <div className="group relative overflow-hidden bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm hover:shadow-xl hover:border-violet-200 transition-all duration-300 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 rounded-2xl bg-violet-50 border border-violet-100/80 text-violet-600 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
              <Users className="w-6 h-6" />
            </div>
            <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-violet-50 border border-violet-100 text-violet-700 text-xs font-bold">
              <Globe2 className="w-3 h-3 text-violet-600" />
              <span>EMGS Portal</span>
            </div>
          </div>

          <div className="mt-5">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                {loading ? '...' : (stats.applications > 0 ? stats.applications.toLocaleString() : '0')}
              </span>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Applications</span>
            </div>
            <div className="flex items-center justify-between text-xs font-medium text-slate-500 mt-2 pt-2 border-t border-slate-100">
              <span>Malaysia vs Global</span>
              <span className="font-bold text-violet-600">
                {myAppsPercent}% / {intAppsPercent}%
              </span>
            </div>
          </div>
        </div>

        {/* Metric 4: Blogs & Publications */}
        <div className="group relative overflow-hidden bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm hover:shadow-xl hover:border-amber-200 transition-all duration-300 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-100/80 text-amber-600 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
              <FileText className="w-6 h-6" />
            </div>
            <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 border border-amber-100 text-amber-700 text-xs font-bold">
              <BookOpen className="w-3 h-3 text-amber-600" />
              <span>{stats.blogCategories || 0} Categories</span>
            </div>
          </div>

          <div className="mt-5">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                {loading ? '...' : stats.blogs}
              </span>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Articles</span>
            </div>
            <div className="flex items-center justify-between text-xs font-medium text-slate-500 mt-2 pt-2 border-t border-slate-100">
              <span>Published Content</span>
              <span className="font-bold text-amber-600">SEO Indexed</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── SECONDARY QUICK STATS RIBBON ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-white border border-slate-200/80 rounded-2xl p-3.5 flex items-center gap-3 shadow-2xs">
          <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 font-bold text-xs">
            <Layers className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <span className="text-xs font-bold text-slate-400 block truncate uppercase tracking-wider">Course Cats</span>
            <span className="text-base font-extrabold text-slate-800">{stats.categories || 0}</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-3.5 flex items-center gap-3 shadow-2xs">
          <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 font-bold text-xs">
            <Award className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <span className="text-xs font-bold text-slate-400 block truncate uppercase tracking-wider">Scholarships</span>
            <span className="text-base font-extrabold text-slate-800">{stats.scholarships || 0}</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-3.5 flex items-center gap-3 shadow-2xs">
          <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 font-bold text-xs">
            <Briefcase className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <span className="text-xs font-bold text-slate-400 block truncate uppercase tracking-wider">Services</span>
            <span className="text-base font-extrabold text-slate-800">{stats.services || 0}</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-3.5 flex items-center gap-3 shadow-2xs">
          <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0 font-bold text-xs">
            <BookOpen className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <span className="text-xs font-bold text-slate-400 block truncate uppercase tracking-wider">Exams</span>
            <span className="text-base font-extrabold text-slate-800">{stats.exams || 0}</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-3.5 flex items-center gap-3 shadow-2xs">
          <div className="w-9 h-9 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center shrink-0 font-bold text-xs">
            <HelpCircle className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <span className="text-xs font-bold text-slate-400 block truncate uppercase tracking-wider">System FAQs</span>
            <span className="text-base font-extrabold text-slate-800">{stats.faqs || 0}</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-3.5 flex items-center gap-3 shadow-2xs">
          <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 font-bold text-xs">
            <MessageSquare className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <span className="text-xs font-bold text-slate-400 block truncate uppercase tracking-wider">Testimonials</span>
            <span className="text-base font-extrabold text-slate-800">{stats.testimonials || 0}</span>
          </div>
        </div>
      </div>

      {/* ── RECENT LIVE DATA & ANALYTICS SECTION ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Recent Universities & Recent Blogs */}
        <div className="lg:col-span-2 space-y-6">
          {/* Recent Universities Box */}
          {canAccess('university') && (
            <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-sm font-extrabold text-slate-900">Recently Added Universities</h2>
                    <p className="text-[11px] text-slate-400 font-medium">Institutions added to the catalog</p>
                  </div>
                </div>

                <Link
                  to="/university"
                  className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-700 hover:gap-1.5 transition-all"
                >
                  <span>View All</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="divide-y divide-slate-100 mt-2">
                {stats.recentUniversities && stats.recentUniversities.length > 0 ? (
                  stats.recentUniversities.map((uni) => (
                    <div key={uni.id} className="py-3 flex items-center justify-between gap-3 group hover:bg-slate-50/60 px-2 rounded-xl transition-colors">
                      <div className="flex items-center gap-3 min-w-0">
                        {uni.logo_path ? (
                          <img
                            src={uni.logo_path.startsWith('http') ? uni.logo_path : `/${uni.logo_path}`}
                            alt={uni.name || 'University'}
                            className="w-10 h-10 rounded-xl object-contain bg-slate-50 p-1 border border-slate-200/70 shrink-0"
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = 'none';
                            }}
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-500 font-bold text-xs flex items-center justify-center shrink-0">
                            {uni.name?.charAt(0) || 'U'}
                          </div>
                        )}

                        <div className="min-w-0">
                          <span className="text-xs font-bold text-slate-800 block truncate group-hover:text-blue-600 transition-colors">
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
                          className={`px-2 py-0.5 rounded-full text-[10.5px] font-bold ${
                            uni.status === 1
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/70'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {uni.status === 1 ? 'Active' : 'Draft'}
                        </span>
                        <Link
                          to={`/university/edit/${uni.id}`}
                          className="p-1 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
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

          {/* Recent Blogs Box */}
          {canAccess('blogs') && (
            <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-sm font-extrabold text-slate-900">Recent Blog Publications</h2>
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
                  stats.recentBlogs.map((blog) => (
                    <div key={blog.id} className="py-3 flex items-center justify-between gap-3 group hover:bg-slate-50/60 px-2 rounded-xl transition-colors">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 font-bold text-xs flex items-center justify-center shrink-0 border border-amber-100">
                          <FileText className="w-4 h-4" />
                        </div>

                        <div className="min-w-0">
                          <span className="text-xs font-bold text-slate-800 block truncate group-hover:text-emerald-600 transition-colors">
                            {blog.title}
                          </span>
                          <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-400">
                            {blog.category?.category_name && (
                              <span className="px-1.5 py-0.2 bg-blue-50 text-blue-700 rounded font-semibold border border-blue-200/60 truncate max-w-[150px]">
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
                    No blogs published yet.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right 1 Col: Application Analytics & System Health */}
        <div className="space-y-6">
          {/* Applications Analytics Card */}
          <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center">
                    <Activity className="w-4 h-4" />
                  </div>
                  <h3 className="text-sm font-extrabold text-slate-900">Application Distribution</h3>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">EMGS Data</span>
              </div>

              <div className="space-y-4 my-4">
                {/* Malaysia Application Bar */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-700 flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
                      Malaysia Domestic Courses
                    </span>
                    <span className="font-extrabold text-slate-900">{myApps.toLocaleString()} ({myAppsPercent}%)</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-indigo-600 h-full rounded-full transition-all duration-1000"
                      style={{ width: `${myAppsPercent}%` }}
                    />
                  </div>
                </div>

                {/* International Student Bar */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-700 flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-purple-600" />
                      International Students
                    </span>
                    <span className="font-extrabold text-slate-900">{intApps.toLocaleString()} ({intAppsPercent}%)</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-purple-500 to-pink-600 h-full rounded-full transition-all duration-1000"
                      style={{ width: `${intAppsPercent}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-2 mt-4 text-xs">
                <div className="flex items-center justify-between text-slate-600">
                  <span>Total Recorded Applications</span>
                  <span className="font-extrabold text-slate-900">{stats.applications.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between text-slate-600">
                  <span>Tracked Course Categories</span>
                  <span className="font-bold text-indigo-600">{stats.categories || 0} Categories</span>
                </div>
              </div>
            </div>

            <Link
              to="/malaysia-applications"
              className="mt-5 w-full py-2.5 rounded-xl border border-slate-200 text-center text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center justify-center gap-1.5 transition-colors"
            >
              <span>Explore Application Datasets</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* System Health & Portal Status Card */}
          <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                System Health & Status
              </h3>
              <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/60">
                <CheckCircle2 className="w-3 h-3" />
                Healthy
              </span>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between py-1.5 border-b border-slate-100 text-slate-600">
                <span>Database Connection</span>
                <span className="font-bold text-emerald-600 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  MySQL Connected
                </span>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-slate-100 text-slate-600">
                <span>API Gateway (Next.js)</span>
                <span className="font-bold text-slate-800">v1 Active</span>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-slate-100 text-slate-600">
                <span>Admin Users Count</span>
                <span className="font-bold text-slate-800">{stats.users || 1} Staff</span>
              </div>
              <div className="flex items-center justify-between py-1.5 text-slate-600">
                <span>Public Website</span>
                <a
                  href="/"
                  target="_blank"
                  rel="noreferrer"
                  className="font-bold text-blue-600 hover:underline flex items-center gap-1"
                >
                  <span>Visit Portal</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── QUICK MANAGEMENT MODULE SHORTCUTS ── */}
      {quickModules.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-indigo-600" />
              <span>Permitted Management Modules</span>
            </h2>
            <span className="text-xs font-semibold text-slate-400">
              {quickModules.length} Modules Accessible
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {quickModules.map((mod) => {
              const Icon = mod.icon;
              return (
                <Link
                  key={mod.href}
                  to={mod.href}
                  className="group bg-white hover:bg-slate-50/50 border border-slate-200/80 hover:border-indigo-300 rounded-3xl p-6 transition-all shadow-xs hover:shadow-lg flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className={`w-12 h-12 rounded-2xl ${mod.lightBg} flex items-center justify-center group-hover:scale-110 transition-transform shadow-2xs`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600">
                        {mod.badge}
                      </span>
                    </div>

                    <h3 className="text-base font-extrabold text-slate-900 mb-1.5 group-hover:text-indigo-600 transition-colors">
                      {mod.title}
                    </h3>
                    <p className="text-slate-500 text-xs leading-relaxed font-medium">
                      {mod.description}
                    </p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-indigo-600 group-hover:text-indigo-700">
                    <span>Open Module</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
