import React, { useState, useRef, useEffect, useMemo } from 'react';
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
  PenTool,
  MessageSquare,
  Menu,
  X,
  Bell,
  Pin,
  Settings,
  FileCheck,
  UploadCloud,
  ArrowLeftRight,
  MapPin,
  Layout,
  User as UserIcon,
  ShieldCheck,
  ShieldAlert,
  ChevronRight,
  Sparkles
} from 'lucide-react';

type NavLinkItem = {
  label: string;
  href: string;
  icon: React.ElementType;
  module?: string | string[];
  badge?: string;
};

type NavGroupChild = {
  label: string;
  href: string;
  module?: string | string[];
};

type NavGroupItem = {
  label: string;
  icon: React.ElementType;
  module?: string | string[];
  children: NavGroupChild[];
};

type NavSection = {
  section: string;
  items: (NavLinkItem | NavGroupItem)[];
};

const navigationConfig: NavSection[] = [
  {
    section: 'MAIN',
    items: [
      { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, module: 'dashboard' },
    ],
  },
  {
    section: 'ACADEMICS & INSTITUTIONS',
    items: [
      {
        label: 'Universities',
        icon: Building2,
        module: 'university',
        children: [
          { label: 'All Universities', href: '/university', module: 'university' },
          { label: 'Add University', href: '/university/add', module: 'university' },
          { label: 'University Overviews', href: '/university-overviews', module: 'university-overview' },
          { label: 'Photos & Videos Gallery', href: '/university-gallery', module: ['university-photos', 'university-videos'] },
          { label: 'Campus Facilities', href: '/university-facilities', module: 'university-facilities' },
          { label: 'Rankings & Accreditations', href: '/university-rankings', module: 'university-ranking' },
          { label: 'Institute Types', href: '/institute-types', module: 'institute-types' },
          { label: 'Study Modes', href: '/study-modes', module: 'study-modes' },
          { label: 'University Documents', href: '/university-documents', module: 'university-documents' },
          { label: 'Document Categories', href: '/document-categories', module: 'document-categories' },
        ],
      },
      {
        label: 'Programs & Courses',
        icon: GraduationCap,
        children: [
          { label: 'Levels', href: '/levels', module: 'levels' },
          { label: 'Course Categories', href: '/course-category', module: 'course-category' },
          { label: 'Specializations', href: '/course-specializations', module: 'course-specializations' },
        ],
      },
      { label: 'Scholarships & Grants', href: '/scholarships', icon: Award, module: 'scholarships' },
    ],
  },
  {
    section: 'ADMISSIONS & STUDENTS',
    items: [
      {
        label: 'Student Applications',
        icon: FileCheck,
        module: 'malaysia-applications',
        children: [
          { label: 'Malaysia Course Applications', href: '/malaysia-applications', module: 'malaysia-applications' },
          { label: 'Malaysia App Categories', href: '/malaysia-application-categories', module: 'malaysia-application-categories' },
          { label: 'International Student Leads', href: '/international-student-data', module: 'international-student-data' },
          { label: 'International Countries', href: '/international-student-data-countries', module: 'international-student-data-countries' },
        ],
      },
      { label: 'University Reviews', href: '/university-reviews', icon: MessageSquare, module: 'university-reviews' },
      { label: 'Student Testimonials', href: '/testimonials', icon: Sparkles, module: 'testimonials' },
    ],
  },
  {
    section: 'EDITORIAL & CONTENT',
    items: [
      {
        label: 'Articles & Blogs',
        icon: FileText,
        module: 'blogs',
        children: [
          { label: 'All Articles', href: '/blogs', module: 'blogs' },
          { label: 'Create New Article', href: '/blogs/create', module: 'blogs' },
          { label: 'Blog Categories', href: '/blog-category', module: 'blog-category' },
          { label: 'Article Section Contents', href: '/blog-contents', module: 'blog-contents' },
          { label: 'Article FAQs', href: '/blog-faqs', module: 'blog-faqs' },
        ],
      },
      { label: 'Authors & Contributors', href: '/authors', icon: PenTool, module: 'authors' },
      {
        label: 'Help Center FAQs',
        icon: HelpCircle,
        module: 'faqs',
        children: [
          { label: 'All FAQs', href: '/faqs', module: 'faqs' },
          { label: 'FAQ Categories', href: '/faq-categories', module: 'faq-categories' },
        ],
      },
      {
        label: 'Services & Careers',
        icon: Briefcase,
        module: 'services',
        children: [
          { label: 'Services List', href: '/services', module: 'services' },
          { label: 'Service Contents', href: '/service-contents', module: 'service-content' },
          { label: 'Exams & Tests', href: '/exams', module: 'exams' },
          { label: 'Internships', href: '/internships', module: 'internships' },
          { label: 'Partner Network', href: '/our-partners', module: 'our-partners' },
        ],
      },
    ],
  },
  {
    section: 'WEBSITE & MARKETING',
    items: [
      {
        label: 'Page Contents',
        icon: Layout,
        module: 'page-contents',
        children: [
          { label: 'Home Page Contents', href: '/page-contents', module: 'page-contents' },
          { label: 'Static Page Contents', href: '/static-page-contents', module: 'static-page-contents' },
          { label: 'Landing Pages', href: '/landing-pages', module: 'landing-pages' },
          { label: 'Page Banners & Hero', href: '/page-banners', module: 'page-banners' },
        ],
      },
      {
        label: 'SEO & Metadata',
        icon: Search,
        module: 'static-page-seos',
        children: [
          { label: 'Static Pages SEO', href: '/static-page-seos', module: 'static-page-seos' },
          { label: 'Dynamic Pages SEO', href: '/dynamic-page-seos', module: 'dynamic-page-seos' },
          { label: 'Default Social OG Image', href: '/default-og-image', module: 'default-og-image' },
        ],
      },
    ],
  },
  {
    section: 'SYSTEM & SETTINGS',
    items: [
      { label: 'Users', href: '/users', icon: Users, module: 'users' },
      { label: 'Audit Trail', href: '/audit-logs', icon: ShieldAlert, module: 'users', badge: 'Live' },
      { label: 'Media & File Storage', href: '/upload-files', icon: UploadCloud, module: 'upload-files' },
      { label: 'URL Redirections', href: '/url-redirections', icon: ArrowLeftRight, module: 'url-redirections' },
      { label: 'Branch Addresses', href: '/addresses', icon: MapPin, module: 'addresses' },
      { label: 'System & Email Settings', href: '/system-settings', icon: Settings, module: 'email-settings' },
    ],
  },
];

export default function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, canAccess } = useAdminAuth();
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
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Keyboard shortcut (Ctrl+K or Cmd+K) to focus sidebar search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Close profile dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setProfileDropdownOpen(false);
      }
    };
    if (profileDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [profileDropdownOpen]);

  // Derive current page title and breadcrumb for clean header presentation
  const currentTitle = useMemo(() => {
    for (const sec of navigationConfig) {
      for (const item of sec.items) {
        if ('children' in item) {
          const matchedChild = item.children.find(
            (c) => c.href === pathname || (c.href !== '/' && pathname.startsWith(c.href + '/'))
          );
          if (matchedChild) {
            return { section: sec.section, parent: item.label, title: matchedChild.label };
          }
        } else if (item.href === pathname || (item.href !== '/' && pathname.startsWith(item.href + '/'))) {
          return { section: sec.section, parent: undefined, title: item.label };
        }
      }
    }
    return { section: 'ADMIN', parent: undefined, title: 'Dashboard' };
  }, [pathname]);

  // Filter sections and items dynamically according to user permissions
  const permittedNavigationConfig = useMemo(() => {
    return navigationConfig
      .map((sec) => {
        const allowedItems = sec.items
          .map((item) => {
            if ('children' in item) {
              const allowedChildren = item.children.filter((child) => {
                return child.module ? canAccess(child.module) : true;
              });
              if (allowedChildren.length === 0) return null;
              return { ...item, children: allowedChildren };
            }
            return (item.module ? canAccess(item.module) : true) ? item : null;
          })
          .filter(Boolean) as (NavLinkItem | NavGroupItem)[];

        if (allowedItems.length === 0) return null;
        return { ...sec, items: allowedItems };
      })
      .filter(Boolean) as NavSection[];
  }, [canAccess]);

  // Filter navigation items based on search query
  const filteredNavigationConfig = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return permittedNavigationConfig;

    return permittedNavigationConfig
      .map((sec) => {
        const matchingItems = sec.items
          .map((item) => {
            if ('children' in item) {
              const parentMatches = item.label.toLowerCase().includes(query);
              if (parentMatches) {
                return item; // Keep all children if parent group matches
              }
              const matchingChildren = item.children.filter((child) =>
                child.label.toLowerCase().includes(query)
              );
              if (matchingChildren.length > 0) {
                return { ...item, children: matchingChildren };
              }
              return null;
            } else {
              return item.label.toLowerCase().includes(query) ? item : null;
            }
          })
          .filter(Boolean) as (NavLinkItem | NavGroupItem)[];

        if (matchingItems.length === 0) return null;
        return { ...sec, items: matchingItems };
      })
      .filter(Boolean) as NavSection[];
  }, [permittedNavigationConfig, searchQuery]);

  // Count total matching items when searching
  const totalResultsCount = useMemo(() => {
    if (!searchQuery.trim()) return 0;
    let count = 0;
    filteredNavigationConfig.forEach((sec) => {
      sec.items.forEach((item) => {
        if ('children' in item) {
          count += item.children.length;
        } else {
          count += 1;
        }
      });
    });
    return count;
  }, [filteredNavigationConfig, searchQuery]);

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

  // Automatically expand group containing active route or search matches
  useEffect(() => {
    filteredNavigationConfig.forEach((sec) => {
      sec.items.forEach((item) => {
        if ('children' in item) {
          const isChildActive = item.children.some(
            (c) => pathname === c.href || (c.href !== '/' && pathname.startsWith(c.href))
          );
          if (isChildActive || searchQuery.trim() !== '') {
            setOpenGroups((prev) => ({ ...prev, [item.label]: true }));
          }
        }
      });
    });
  }, [pathname, filteredNavigationConfig, searchQuery]);

  const toggleGroup = (groupName: string) => {
    setOpenGroups((prev) => ({ ...prev, [groupName]: !prev[groupName] }));
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-[#f7f5ee] text-slate-800 flex font-sans selection:bg-emerald-500/20 selection:text-emerald-900">
      {/* Mobile Sidebar Backdrop */}
      {mobileSidebarOpen && (
        <div
          onClick={closeMobile}
          className="fixed inset-0 bg-slate-950/50 backdrop-blur-xs z-40 lg:hidden transition-opacity"
        />
      )}

      {/* ── LEFT SIDEBAR ── */}
      <aside
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className={`fixed top-0 left-0 z-50 h-screen bg-white border-r border-slate-200/90 flex flex-col justify-between transition-all duration-300 ease-in-out shrink-0 shadow-sm ${
          mobileSidebarOpen ? 'translate-x-0 w-[270px]' : '-translate-x-full lg:translate-x-0'
        } ${!isExpanded ? 'lg:w-[70px]' : 'lg:w-[270px]'}`}
      >
        <div className="flex flex-col min-h-0 flex-1">
          {/* Header Brand Logo & Pin Toggle */}
          <div className="h-[68px] px-4 border-b border-slate-100 flex items-center justify-between shrink-0 bg-white">
            <Link
              to="/dashboard"
              className={`flex items-center gap-3 group min-w-0 ${!isExpanded && !mobileSidebarOpen ? 'mx-auto' : ''}`}
            >
              <div className="w-10 h-10 rounded-xl bg-[#effaf2] border border-[#c8ebd2] flex items-center justify-center text-[#14532d] font-serif font-black text-base shadow-2xs group-hover:bg-[#dcfce7] group-hover:border-[#bbf7d0] transition-all duration-200 shrink-0">
                EM
              </div>
              {(isExpanded || mobileSidebarOpen) && (
                <div className="flex flex-col min-w-0">
                  <span className="font-black text-slate-900 text-sm leading-tight tracking-tight truncate">
                    Education Malaysia
                  </span>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Control Hub
                    </span>
                  </div>
                </div>
              )}
            </Link>

            {/* Pin Toggle Button (Desktop) */}
            {(isExpanded || mobileSidebarOpen) && (
              <button
                type="button"
                onClick={togglePin}
                className="hidden lg:flex w-7 h-7 items-center justify-center rounded-lg text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 transition-all cursor-pointer shrink-0"
                title={isPinned ? 'Unpin sidebar (auto-collapse)' : 'Pin sidebar (keep expanded)'}
              >
                <Pin className={`w-3.5 h-3.5 transition-transform duration-200 ${isPinned ? 'rotate-45 text-emerald-700' : ''}`} />
              </button>
            )}

            {/* Close Button (Mobile) */}
            <button
              onClick={closeMobile}
              className="lg:hidden text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* ── SEARCH BOX IN SIDEBAR ── */}
          {(isExpanded || mobileSidebarOpen) ? (
            <div className="px-3 pt-3 pb-1 shrink-0">
              <div className="relative flex items-center">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 pointer-events-none" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search navigation..."
                  className="w-full pl-8.5 pr-8 py-2 text-xs font-medium bg-slate-50 border border-slate-200/90 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 transition-all shadow-2xs"
                />
                {searchQuery ? (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 p-0.5 text-slate-400 hover:text-slate-700 rounded-md hover:bg-slate-200/60 transition-colors cursor-pointer"
                    title="Clear search"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <kbd className="hidden sm:inline-block absolute right-2.5 text-[9.5px] font-bold text-slate-400 bg-white border border-slate-200 px-1 py-0.5 rounded shadow-2xs">
                    ⌘K
                  </kbd>
                )}
              </div>
              {searchQuery && (
                <div className="flex items-center justify-between px-1 mt-1.5 text-[10.5px]">
                  <span className="text-slate-400 font-medium">
                    Found <strong className="text-emerald-700 font-bold">{totalResultsCount}</strong> menu {totalResultsCount === 1 ? 'item' : 'items'}
                  </span>
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="text-emerald-700 hover:text-emerald-900 font-bold underline cursor-pointer"
                  >
                    Reset
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="px-2 pt-3 pb-1 flex justify-center shrink-0">
              <button
                type="button"
                onClick={() => {
                  togglePin();
                  setTimeout(() => searchInputRef.current?.focus(), 150);
                }}
                className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200/80 text-slate-500 hover:text-emerald-700 hover:bg-[#effaf2] flex items-center justify-center transition-all cursor-pointer shadow-2xs"
                title="Search menu (Ctrl+K)"
              >
                <Search className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* ── NAVIGATION LINKS LIST ── */}
          <div className={`flex-1 py-2 overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-slate-200 hover:scrollbar-thumb-slate-300 ${
            !isExpanded && !mobileSidebarOpen ? 'px-2 space-y-3' : 'px-3 space-y-4'
          }`}>
            {filteredNavigationConfig.length === 0 && searchQuery ? (
              <div className="py-8 text-center px-3">
                <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-2.5">
                  <Search className="w-5 h-5" />
                </div>
                <p className="text-xs font-bold text-slate-700">No menu items found</p>
                <p className="text-[11px] text-slate-400 mt-1">No matching links for "{searchQuery}"</p>
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold text-emerald-700 bg-[#effaf2] hover:bg-[#dcfce7] border border-[#c8ebd2] transition-colors cursor-pointer"
                >
                  Clear search
                </button>
              </div>
            ) : (
              filteredNavigationConfig.map((sec, secIdx) => (
                <div key={sec.section} className="space-y-1">
                  {(isExpanded || mobileSidebarOpen) ? (
                    <div className="flex items-center gap-2 px-2.5 pt-1.5 pb-1">
                      <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest leading-none">
                        {sec.section}
                      </span>
                      <div className="flex-1 h-px bg-slate-100" />
                    </div>
                  ) : (
                    secIdx > 0 && <div className="my-2 border-t border-slate-200/80 mx-1.5" />
                  )}

                  {sec.items.map((item) => {
                    if ('children' in item) {
                      const isOpen = openGroups[item.label] || false;
                      const Icon = item.icon;
                      const isAnyChildActive = item.children.some(
                        (c) => pathname === c.href || (c.href !== '/' && pathname.startsWith(c.href + '/'))
                      );

                      // Collapsed mode: icon only, clicking navigates to first child
                      if (!isExpanded && !mobileSidebarOpen) {
                        const firstChild = item.children[0];
                        return (
                          <Link
                            key={item.label}
                            to={firstChild.href}
                            title={item.label}
                            className={`w-10 h-10 mx-auto flex items-center justify-center rounded-xl transition-all ${
                              isAnyChildActive
                                ? 'bg-[#effaf2] border border-[#c8ebd2] text-[#14532d] shadow-xs'
                                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                            }`}
                          >
                            <Icon className={`w-4.5 h-4.5 shrink-0 ${isAnyChildActive ? 'text-[#14532d]' : 'text-slate-500'}`} />
                          </Link>
                        );
                      }

                      // Expanded mode: full group with chevron & sub-links
                      return (
                        <div key={item.label} className="space-y-0.5">
                          <button
                            type="button"
                            onClick={() => toggleGroup(item.label)}
                            className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer group select-none ${
                              isAnyChildActive
                                ? 'text-[#14532d] bg-[#f2faf4] font-extrabold border border-[#d6f0dd] shadow-2xs'
                                : 'text-slate-700 hover:bg-slate-100/80 hover:text-slate-900'
                            }`}
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                                isAnyChildActive
                                  ? 'bg-[#dcfce7] text-[#14532d] border border-[#c8ebd2] shadow-2xs'
                                  : 'bg-slate-100 text-slate-500 group-hover:bg-slate-200 group-hover:text-slate-700'
                              }`}>
                                <Icon className="w-3.5 h-3.5" />
                              </div>
                              <span className="truncate">{item.label}</span>
                            </div>
                            <div className="flex items-center gap-1.5 shrink-0">
                              <span className="text-[10px] font-bold text-slate-500 bg-slate-100/90 border border-slate-200/60 px-1.5 py-0.5 rounded-full">
                                {item.children.length}
                              </span>
                              <ChevronDown
                                className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${
                                  isOpen ? 'rotate-180 text-emerald-700 font-bold' : ''
                                }`}
                              />
                            </div>
                          </button>

                          {isOpen && (
                            <div className="ml-5 pl-2.5 space-y-0.5 pt-0.5 pb-1 border-l-2 border-slate-200/70">
                              {item.children.map((child) => {
                                const isActive = pathname === child.href || (child.href !== '/' && pathname.startsWith(child.href + '/'));
                                return (
                                  <Link
                                    key={child.href}
                                    to={child.href}
                                    onClick={closeMobile}
                                    className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs transition-all ${
                                      isActive
                                        ? 'bg-[#effaf2] text-[#14532d] font-bold border border-[#c8ebd2] shadow-2xs'
                                        : 'text-slate-600 hover:text-emerald-700 hover:bg-emerald-50/60 font-medium'
                                    }`}
                                  >
                                    <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${isActive ? 'bg-emerald-600 ring-2 ring-emerald-300/60' : 'bg-slate-300'}`} />
                                    <span className="truncate">{child.label}</span>
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
                          className={`w-10 h-10 mx-auto flex items-center justify-center rounded-xl transition-all ${
                            isActive
                              ? 'bg-[#effaf2] border border-[#c8ebd2] text-[#14532d] shadow-xs'
                              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                          }`}
                        >
                          <Icon className={`w-4.5 h-4.5 shrink-0 ${isActive ? 'text-[#14532d]' : 'text-slate-500'}`} />
                        </Link>
                      );
                    }

                    return (
                      <Link
                        key={item.href}
                        to={item.href}
                        onClick={closeMobile}
                        className={`flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-bold transition-all group ${
                          isActive
                            ? 'bg-[#effaf2] text-[#14532d] font-extrabold border border-[#c8ebd2] shadow-2xs'
                            : 'text-slate-700 hover:bg-slate-100/80 hover:text-slate-900'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                            isActive
                              ? 'bg-[#dcfce7] text-[#14532d] border border-[#c8ebd2]'
                              : 'bg-slate-100 text-slate-500 group-hover:bg-slate-200 group-hover:text-slate-700'
                          }`}>
                            <Icon className="w-3.5 h-3.5" />
                          </div>
                          <span className="truncate">{item.label}</span>
                        </div>
                        {item.badge && (
                          <span className={`text-[9.5px] font-extrabold px-1.5 py-0.5 rounded-full uppercase tracking-wider ${
                            isActive ? 'bg-emerald-100 text-emerald-900 border border-emerald-200' : 'bg-slate-100 text-slate-700 border border-slate-200'
                          }`}>
                            {item.badge}
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </div>
              ))
            )}
          </div>
        </div>

        {/* ── SIDEBAR FOOTER USER CARD ── */}
        <div className="p-3 border-t border-slate-100 bg-slate-50/70 shrink-0">
          {(isExpanded || mobileSidebarOpen) ? (
            <div className="flex items-center justify-between gap-2 bg-white p-2 rounded-xl border border-slate-200/80 shadow-2xs">
              <Link to="/profile" className="flex items-center gap-2.5 min-w-0 group hover:opacity-80 transition-opacity">
                <div className="w-8 h-8 rounded-lg bg-[#effaf2] border border-[#c8ebd2] text-[#14532d] font-black text-xs flex items-center justify-center shadow-2xs shrink-0">
                  {user?.name?.charAt(0).toUpperCase() || 'A'}
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-bold text-slate-900 truncate leading-tight group-hover:text-emerald-700 transition-colors">
                    {user?.name || 'Administrator'}
                  </span>
                  <span className="text-[10px] font-semibold text-slate-400 capitalize truncate">
                    {user?.role || 'Staff'}
                  </span>
                </div>
              </Link>
              <div className="flex items-center gap-1 shrink-0">
                <Link
                  to="/profile"
                  className="p-1.5 text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors"
                  title="Profile Settings"
                >
                  <Settings className="w-3.5 h-3.5" />
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                  title="Logout"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <Link
                to="/profile"
                className="w-10 h-10 rounded-xl bg-[#effaf2] border border-[#c8ebd2] text-[#14532d] font-black text-xs flex items-center justify-center shadow-2xs hover:bg-[#dcfce7] transition-all"
                title={user?.name || 'Administrator'}
              >
                {user?.name?.charAt(0).toUpperCase() || 'A'}
              </Link>
            </div>
          )}
        </div>
      </aside>

      {/* ── MAIN CONTENT AREA ── */}
      <div className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${!isExpanded ? 'lg:pl-[70px]' : 'lg:pl-[270px]'}`}>
        {/* Top Header Bar */}
        <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-8 py-3.5 flex items-center justify-between gap-4 shadow-2xs">
          {/* Left Title & Breadcrumb */}
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={toggleMobile}
              className="lg:hidden p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 cursor-pointer transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Current Page Title & Breadcrumb */}
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-1.5 text-[10.5px] font-extrabold text-slate-400 uppercase tracking-widest truncate">
                <span>{currentTitle.section}</span>
                {currentTitle.parent && (
                  <>
                    <ChevronRight className="w-3 h-3 text-slate-300 inline shrink-0" />
                    <span className="text-slate-500">{currentTitle.parent}</span>
                  </>
                )}
              </div>
              <span className="text-base sm:text-lg font-black text-slate-900 leading-tight tracking-tight truncate">
                {currentTitle.title}
              </span>
            </div>
          </div>

          {/* Right Notifications & Profile Dropdown */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Notification Icon */}
            <button
              type="button"
              className="w-10 h-10 rounded-xl border border-slate-200/80 bg-white hover:bg-slate-50 text-slate-600 flex items-center justify-center relative transition-all hover:scale-105 shadow-2xs cursor-pointer"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 absolute top-2 right-2 ring-2 ring-white" />
            </button>

            {/* User Profile Dropdown Pill & Card */}
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setProfileDropdownOpen((prev) => !prev)}
                className={`flex items-center gap-3 pl-1.5 pr-3.5 py-1.5 rounded-2xl border transition-all cursor-pointer shadow-2xs ${
                  profileDropdownOpen
                    ? 'border-[#c8ebd2] bg-[#f2faf4] ring-2 ring-emerald-100'
                    : 'border-slate-200/90 bg-white hover:bg-slate-50/80 hover:border-slate-300'
                }`}
              >
                <div className="w-8 h-8 rounded-xl bg-[#effaf2] border border-[#c8ebd2] text-[#14532d] font-black flex items-center justify-center text-xs shadow-2xs shrink-0">
                  {user?.name?.charAt(0).toUpperCase() || 'A'}
                </div>
                <div className="hidden sm:flex flex-col text-left min-w-0">
                  <span className="text-xs font-bold text-slate-900 leading-tight truncate max-w-[140px]">
                    {user?.name || 'Admin User'}
                  </span>
                  <span className="text-[10px] font-semibold text-slate-400 capitalize truncate">
                    {user?.role || 'Administrator'}
                  </span>
                </div>
                <ChevronDown
                  className={`w-4 h-4 text-slate-400 transition-transform duration-200 shrink-0 ${
                    profileDropdownOpen ? 'rotate-180 text-emerald-700' : ''
                  }`}
                />
              </button>

              {/* Profile Card Popover */}
              {profileDropdownOpen && (
                <div className="absolute right-0 top-full mt-2 w-72 sm:w-80 bg-white rounded-2xl shadow-2xl border border-slate-200/90 py-3 z-50">
                  {/* Card Header Profile Info */}
                  <div className="px-4 pb-3 pt-1 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-2xl bg-[#effaf2] border border-[#c8ebd2] text-[#14532d] font-serif font-black text-base flex items-center justify-center shadow-xs shrink-0">
                        {user?.name?.charAt(0).toUpperCase() || 'A'}
                      </div>
                      <div className="min-w-0 flex-1">
                        <span className="font-extrabold text-sm text-slate-900 truncate block">
                          {user?.name || 'Admin'}
                        </span>
                        <span className="text-xs font-medium text-slate-400 truncate block">
                          {user?.email || 'admin@educationmalaysia.in'}
                        </span>
                        <div className="mt-1">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#effaf2] border border-[#c8ebd2] text-[10px] font-bold text-[#14532d] uppercase tracking-wider">
                            <ShieldCheck className="w-3 h-3 text-emerald-600" />
                            {user?.role || 'Staff'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Menu Links */}
                  <div className="p-2 space-y-1">
                    <Link
                      to="/profile"
                      onClick={() => setProfileDropdownOpen(false)}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold text-slate-700 hover:bg-stone-100/80 hover:text-stone-900 transition-colors"
                    >
                      <div className="w-7 h-7 rounded-lg bg-stone-100 text-stone-700 flex items-center justify-center shrink-0">
                        <UserIcon className="w-4 h-4" />
                      </div>
                      <div className="flex flex-col">
                        <span>My Profile</span>
                        <span className="text-[10px] font-normal text-slate-400">Account info and password</span>
                      </div>
                    </Link>

                    <Link
                      to="/system-settings"
                      onClick={() => setProfileDropdownOpen(false)}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold text-slate-700 hover:bg-stone-100/80 hover:text-stone-900 transition-colors"
                    >
                      <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center shrink-0">
                        <Settings className="w-4 h-4" />
                      </div>
                      <div className="flex flex-col">
                        <span>Settings</span>
                        <span className="text-[10px] font-normal text-slate-400">System preferences & email</span>
                      </div>
                    </Link>

                    <Link
                      to="/dashboard"
                      onClick={() => setProfileDropdownOpen(false)}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold text-slate-700 hover:bg-stone-100/80 hover:text-stone-900 transition-colors"
                    >
                      <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                        <LayoutDashboard className="w-4 h-4" />
                      </div>
                      <div className="flex flex-col">
                        <span>Dashboard</span>
                        <span className="text-[10px] font-normal text-slate-400">Overview & metrics</span>
                      </div>
                    </Link>
                  </div>

                  {/* Card Footer Logout Button */}
                  <div className="px-2 pt-2 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => {
                        setProfileDropdownOpen(false);
                        handleLogout();
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 hover:text-rose-700 transition-colors cursor-pointer"
                    >
                      <div className="w-7 h-7 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                        <LogOut className="w-4 h-4" />
                      </div>
                      <span>Logout</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content View */}
        <main className="flex-1 p-3 sm:p-4 w-full">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
