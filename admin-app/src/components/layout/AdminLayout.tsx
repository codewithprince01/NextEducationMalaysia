import React, { useState } from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import { useAdminAuth } from '@/context/AdminAuthContext';
import { useSidebar } from '@/context/SidebarContext';
import {
  LayoutDashboard,
  Building2,
  GraduationCap,
  FileText,
  Search,
  HelpCircle,
  Users,
  Briefcase,
  LogOut,
  ChevronDown,
  Award,
  BookOpen,
  PenTool,
  MessageSquare,
  Menu,
  X,
  Bell,
  Command,
  Pin,
  Settings
} from 'lucide-react';

type NavLinkItem = {
  label: string;
  href: string;
  icon: React.ElementType;
};

type NavGroupItem = {
  label: string;
  icon: React.ElementType;
  children: { label: string; href: string }[];
};

type NavSection = {
  section: string;
  items: (NavLinkItem | NavGroupItem)[];
};

const navigationConfig: NavSection[] = [
  {
    section: 'MAIN',
    items: [
      { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    ],
  },
  {
    section: 'ACADEMICS & UNIVERSITIES',
    items: [
      {
        label: 'Universities',
        icon: Building2,
        children: [
          { label: 'All Universities', href: '/university' },
          { label: 'Add University', href: '/university/add' },
          { label: 'University Reviews', href: '/university-reviews' },
          { label: 'Institute Types', href: '/institute-types' },
          { label: 'Study Modes', href: '/study-modes' },
        ],
      },
      {
        label: 'Programs & Courses',
        icon: GraduationCap,
        children: [
          { label: 'Levels', href: '/levels' },
          { label: 'Course Categories', href: '/course-category' },
          { label: 'Specializations', href: '/course-specializations' },
        ],
      },
    ],
  },
  {
    section: 'CONTENT & MEDIA',
    items: [
      {
        label: 'Blogs',
        icon: FileText,
        children: [
          { label: 'All Blogs', href: '/blogs' },
          { label: 'Create Blog', href: '/blogs/create' },
          { label: 'Blog Categories', href: '/blog-category' },
        ],
      },
      {
        label: 'FAQs',
        icon: HelpCircle,
        children: [
          { label: 'FAQ List', href: '/faqs' },
          { label: 'FAQ Categories', href: '/faq-categories' },
        ],
      },
      { label: 'Services', href: '/services', icon: Briefcase },
      { label: 'Exams', href: '/exams', icon: BookOpen },
      { label: 'Internships', href: '/internships', icon: Award },
    ],
  },
  {
    section: 'SEO & METADATA',
    items: [
      {
        label: 'SEO Settings',
        icon: Search,
        children: [
          { label: 'Static Page SEO', href: '/static-page-seos' },
          { label: 'Dynamic Page SEO', href: '/dynamic-page-seos' },
          { label: 'Default OG Image', href: '/default-og-image' },
        ],
      },
    ],
  },
  {
    section: 'ADMINISTRATION',
    items: [
      { label: 'Admin Users', href: '/users', icon: Users },
      { label: 'Authors', href: '/authors', icon: PenTool },
      { label: 'Testimonials', href: '/testimonials', icon: MessageSquare },
    ],
  },
];

export default function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAdminAuth();
  const {
    isOpen: mobileSidebarOpen,
    toggleMobile,
    closeMobile,
    isPinned,
    isExpanded,
    togglePin,
    setHovered
  } = useSidebar();

  const pathname = location.pathname;
  const [searchQuery, setSearchQuery] = useState('');

  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    navigationConfig.forEach((sec) => {
      sec.items.forEach((item) => {
        if ('children' in item) {
          const isChildActive = item.children.some(
            (c) => pathname === c.href || (c.href !== '/' && pathname.startsWith(c.href))
          );
          if (isChildActive) {
            initial[item.label] = true;
          }
        }
      });
    });
    return initial;
  });

  // Automatically expand group containing active route
  React.useEffect(() => {
    navigationConfig.forEach((sec) => {
      sec.items.forEach((item) => {
        if ('children' in item) {
          const isChildActive = item.children.some(
            (c) => pathname === c.href || (c.href !== '/' && pathname.startsWith(c.href))
          );
          if (isChildActive) {
            setOpenGroups((prev) => ({ ...prev, [item.label]: true }));
          }
        }
      });
    });
  }, [pathname]);

  const toggleGroup = (groupName: string) => {
    setOpenGroups((prev) => ({ ...prev, [groupName]: !prev[groupName] }));
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-[#f4f7fe] text-slate-800 flex font-sans selection:bg-indigo-600 selection:text-white">
      {/* Mobile Sidebar Backdrop */}
      {mobileSidebarOpen && (
        <div
          onClick={closeMobile}
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-40 lg:hidden"
        />
      )}

      {/* ── LEFT SIDEBAR (Innayat Medical Admin Ref Style) ── */}
      <aside
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className={`fixed top-0 left-0 z-50 h-screen bg-white border-r border-slate-200/80 flex flex-col justify-between transition-all duration-300 ease-in-out shrink-0 shadow-sm ${
          mobileSidebarOpen ? 'translate-x-0 w-72' : '-translate-x-full lg:translate-x-0'
        } ${!isExpanded ? 'lg:w-[72px]' : 'lg:w-72'}`}
      >
        <div className="flex flex-col min-h-0 flex-1">
          {/* Header Logo & Pin */}
          <div className="h-[72px] px-4 border-b border-slate-100 flex items-center justify-between shrink-0">
            <Link
              to="/dashboard"
              className={`flex items-center gap-3 group min-w-0 ${!isExpanded && !mobileSidebarOpen ? 'mx-auto' : ''}`}
            >
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 via-violet-600 to-indigo-500 flex items-center justify-center text-white font-black text-lg shadow-md shadow-indigo-500/25 group-hover:scale-105 transition-transform shrink-0">
                EM
              </div>
              {(isExpanded || mobileSidebarOpen) && (
                <div className="flex flex-col min-w-0">
                  <span className="font-extrabold text-slate-900 text-sm leading-tight truncate">
                    Education Malaysia
                  </span>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                    Admin Panel
                  </span>
                </div>
              )}
            </Link>

            {/* Pin Toggle Button (Desktop) */}
            {(isExpanded || mobileSidebarOpen) && (
              <button
                type="button"
                onClick={togglePin}
                className="hidden lg:flex w-8 h-8 items-center justify-center rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-slate-100 transition-all cursor-pointer shrink-0"
                title={isPinned ? 'Unpin sidebar (collapse on mouse leave)' : 'Pin sidebar (keep expanded)'}
              >
                <Pin className={`w-4 h-4 transition-transform duration-200 ${isPinned ? 'rotate-45 text-indigo-600' : ''}`} />
              </button>
            )}

            {/* Close Button (Mobile) */}
            <button
              onClick={closeMobile}
              className="lg:hidden text-slate-400 hover:text-slate-600 p-1 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links List */}
          <div className={`flex-1 p-3 space-y-5 overflow-y-auto scrollbar-thin ${!isExpanded && !mobileSidebarOpen ? 'px-2' : 'px-3'}`}>
            {navigationConfig.map((sec, secIdx) => (
              <div key={sec.section} className="space-y-1">
                {(isExpanded || mobileSidebarOpen) ? (
                  <span className="px-3 text-[10.5px] font-extrabold text-slate-400 uppercase tracking-widest block mb-2">
                    {sec.section}
                  </span>
                ) : (
                  secIdx > 0 && <div className="my-2 border-t border-slate-200/80 mx-2" />
                )}

                {sec.items.map((item) => {
                  if ('children' in item) {
                    const isOpen = openGroups[item.label] || false;
                    const Icon = item.icon;
                    const isAnyChildActive = item.children.some(
                      (c) => pathname === c.href || (c.href !== '/' && pathname.startsWith(c.href))
                    );

                    // Collapsed mode: icon only, clicking navigates to first child
                    if (!isExpanded && !mobileSidebarOpen) {
                      const firstChild = item.children[0];
                      return (
                        <Link
                          key={item.label}
                          to={firstChild.href}
                          title={item.label}
                          className={`w-full flex items-center justify-center p-2.5 rounded-xl transition-all ${
                            isAnyChildActive
                              ? 'bg-gradient-to-r from-indigo-500 via-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-500/25'
                              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                          }`}
                        >
                          <Icon className={`w-5 h-5 shrink-0 ${isAnyChildActive ? 'text-white' : 'text-slate-500'}`} />
                        </Link>
                      );
                    }

                    // Expanded mode: full group with chevron & sub-links
                    return (
                      <div key={item.label} className="space-y-1">
                        <button
                          onClick={() => toggleGroup(item.label)}
                          className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                            isAnyChildActive
                              ? 'text-indigo-600 bg-indigo-50/80'
                              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <Icon className={`w-4.5 h-4.5 shrink-0 ${isAnyChildActive ? 'text-indigo-600' : 'text-slate-500'}`} />
                            <span>{item.label}</span>
                          </div>
                          <ChevronDown
                            className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${
                              isOpen ? 'rotate-180 text-indigo-600' : ''
                            }`}
                          />
                        </button>

                        {isOpen && (
                          <div className="pl-9 pr-1 space-y-1 pt-1 border-l-2 border-slate-100 ml-5">
                            {item.children.map((child) => {
                              const isActive = pathname === child.href || (child.href !== '/' && pathname.startsWith(child.href + '/'));
                              return (
                                <Link
                                  key={child.href}
                                  to={child.href}
                                  onClick={closeMobile}
                                  className={`block px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                                    isActive
                                      ? 'bg-gradient-to-r from-indigo-500 via-indigo-600 to-purple-600 text-white font-bold shadow-md shadow-indigo-500/20'
                                      : 'text-slate-600 hover:text-indigo-600 hover:bg-slate-50'
                                  }`}
                                >
                                  {child.label}
                                </Link>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  }

                  const Icon = item.icon;
                  const isActive = pathname === item.href;

                  if (!isExpanded && !mobileSidebarOpen) {
                    return (
                      <Link
                        key={item.href}
                        to={item.href}
                        title={item.label}
                        className={`w-full flex items-center justify-center p-2.5 rounded-xl transition-all ${
                          isActive
                            ? 'bg-gradient-to-r from-indigo-500 via-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-500/25'
                            : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                        }`}
                      >
                        <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                      </Link>
                    );
                  }

                  return (
                    <Link
                      key={item.href}
                      to={item.href}
                      onClick={closeMobile}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                        isActive
                          ? 'bg-gradient-to-r from-indigo-500 via-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-500/25'
                          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                      }`}
                    >
                      <Icon className={`w-4.5 h-4.5 shrink-0 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar Footer User Card */}
        <div className="p-3 border-t border-slate-100 bg-slate-50/50 shrink-0">
          {(isExpanded || mobileSidebarOpen) ? (
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-indigo-100 border border-indigo-200/80 flex items-center justify-center text-indigo-700 font-bold text-sm shrink-0">
                  {user?.name?.charAt(0).toUpperCase() || 'A'}
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-bold text-slate-800 truncate">{user?.name || 'Super Admin'}</span>
                  <span className="text-[10px] font-medium text-slate-400 truncate">{user?.email || 'admin@educationmalaysia.in'}</span>
                </div>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <Link
                  to="/profile"
                  className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                  title="Profile Settings"
                >
                  <Settings className="w-4 h-4" />
                </Link>
                <button
                  onClick={handleLogout}
                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <Link
                to="/profile"
                className="w-9 h-9 rounded-xl bg-indigo-100 border border-indigo-200/80 flex items-center justify-center text-indigo-700 font-bold text-sm shrink-0 hover:ring-2 hover:ring-indigo-300 transition-all"
                title={user?.name || 'Super Admin'}
              >
                {user?.name?.charAt(0).toUpperCase() || 'A'}
              </Link>
            </div>
          )}
        </div>
      </aside>

      {/* ── MAIN CONTENT AREA ── */}
      <div className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${!isExpanded ? 'lg:pl-[72px]' : 'lg:pl-72'}`}>
        {/* Top Header Bar */}
        <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-8 py-3.5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1 max-w-md">
            <button
              onClick={toggleMobile}
              className="lg:hidden p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 cursor-pointer"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Quick Search Field */}
            <div className="relative w-full hidden sm:flex items-center">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50/80 border border-slate-200/80 rounded-full pl-10 pr-10 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-100 transition-all"
              />
              <span className="absolute right-3 inline-flex items-center gap-0.5 text-[10px] font-bold text-slate-400 bg-white px-1.5 py-0.5 rounded border border-slate-200">
                <Command className="w-2.5 h-2.5" /> K
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Notification Icon */}
            <button
              className="w-9 h-9 rounded-xl border border-slate-200/80 bg-white hover:bg-slate-50 text-slate-600 flex items-center justify-center relative transition-colors cursor-pointer"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              <span className="w-2 h-2 rounded-full bg-rose-500 absolute top-2 right-2 ring-2 ring-white" />
            </button>

            {/* User Profile Pill */}
            <Link
              to="/profile"
              className="flex items-center gap-2.5 pl-1.5 pr-3 py-1 rounded-full border border-slate-200/80 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all shadow-xs"
            >
              <div className="w-7 h-7 rounded-full bg-indigo-600 text-white font-extrabold flex items-center justify-center text-xs">
                {user?.name?.charAt(0).toUpperCase() || 'A'}
              </div>
              <span className="hidden sm:inline text-slate-800">{user?.name || 'Admin'}</span>
            </Link>
          </div>
        </header>

        {/* Page Content View */}
        <main className="flex-1 p-4 sm:p-8 max-w-[1700px] w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
