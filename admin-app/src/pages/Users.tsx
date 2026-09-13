import React, { useEffect, useState } from 'react';
import { confirmDelete } from '@/lib/swal';
import Pagination from '@/components/common/Pagination';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Loader2,
  X,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Users as UsersIcon,
  ShieldCheck
} from 'lucide-react';

interface UserItem {
  id: number;
  name: string;
  email: string;
  mobile?: string;
  username?: string;
  role?: string;
  status: number;
  department?: string;
  permissions?: Record<string, Record<string, number>>;
  granted_count?: number;
  created_at?: string;
}

const PERMISSION_MODULES: { key: string; label: string }[] = [
  { key: 'dashboard', label: 'Dashboard' },
  { key: 'profile', label: 'Profile' },
  { key: 'course-category', label: 'Course Category' },
  { key: 'course-category-contents', label: 'Course Category Contents' },
  { key: 'course-category-faqs', label: 'Course Category FAQs' },
  { key: 'course-specializations', label: 'Course Specializations' },
  { key: 'course-specialization-levels', label: 'Course Specialization Levels' },
  { key: 'course-specialization-contents', label: 'Course Specialization Contents' },
  { key: 'specialization-levels', label: 'Specialization Levels' },
  { key: 'specialization-level-contents', label: 'Specialization Level Contents' },
  { key: 'course-specialization-level-contents', label: 'Course Specialization Level Contents' },
  { key: 'course-specialization-faqs', label: 'Course Specialization FAQs' },
  { key: 'programs', label: 'Programs' },
  { key: 'levels', label: 'Levels' },
  { key: 'institute-types', label: 'Institute Types' },
  { key: 'study-modes', label: 'Study Modes' },
  { key: 'course-modes', label: 'Course Modes' },
  { key: 'university', label: 'University' },
  { key: 'university-documents', label: 'University Documents' },
  { key: 'document-categories', label: 'Document Categories' },
  { key: 'university-overview', label: 'University Overview' },
  { key: 'university-programs', label: 'University Programs' },
  { key: 'university-program-contents', label: 'University Program Contents' },
  { key: 'university-photos', label: 'University Photos' },
  { key: 'university-videos', label: 'University Videos' },
  { key: 'university-facilities', label: 'University Facilities' },
  { key: 'other-content', label: 'Other Content' },
  { key: 'university-ranking', label: 'University Ranking' },
  { key: 'university-scholarships', label: 'University Scholarships' },
  { key: 'university-scholarship-contents', label: 'University Scholarship Contents' },
  { key: 'university-reviews', label: 'University Reviews' },
  { key: 'services', label: 'Services' },
  { key: 'service-content', label: 'Service Content' },
  { key: 'exams', label: 'Exams' },
  { key: 'exam-page-tabs', label: 'Exam Page Tabs' },
  { key: 'exam-page-tab-contents', label: 'Exam Page Tab Contents' },
  { key: 'exam-tab-faqs', label: 'Exam Tab FAQs' },
  { key: 'exam-faqs', label: 'Exam FAQs' },
  { key: 'exam-content', label: 'Exam Content' },
  { key: 'job-pages', label: 'Job Pages' },
  { key: 'job-page-tabs', label: 'Job Page Tabs' },
  { key: 'job-page-tab-contents', label: 'Job Page Tab Contents' },
  { key: 'blog-category', label: 'Blog Categories' },
  { key: 'blogs', label: 'Blogs' },
  { key: 'blog-contents', label: 'Blog Contents' },
  { key: 'blog-faqs', label: 'Blog FAQs' },
  { key: 'employee-statuses', label: 'Employee Statuses' },
  { key: 'static-page-seos', label: 'Static Page SEOs' },
  { key: 'dynamic-page-seos', label: 'Dynamic Page SEOs' },
  { key: 'default-og-image', label: 'Default OG Image' },
  { key: 'upload-files', label: 'Upload Files' },
  { key: 'authors', label: 'Authors' },
  { key: 'users', label: 'Users' },
  { key: 'testimonials', label: 'Testimonials' },
  { key: 'faq-categories', label: 'FAQ Categories' },
  { key: 'faqs', label: 'FAQs' },
  { key: 'landing-pages', label: 'Landing Pages' },
  { key: 'landing-page-banners', label: 'Landing Page Banners' },
  { key: 'landing-page-faqs', label: 'Landing Page FAQs' },
  { key: 'landing-page-universities', label: 'Landing Page Universities' },
  { key: 'scholarships', label: 'Scholarships' },
  { key: 'scholarship-faqs', label: 'Scholarship FAQs' },
  { key: 'scholarship-contents', label: 'Scholarship Contents' },
  { key: 'page-contents', label: 'Page Contents' },
  { key: 'static-page-contents', label: 'Static Page Contents' },
  { key: 'page-banners', label: 'Page Banners' },
  { key: 'url-redirections', label: 'URL Redirections' },
  { key: 'addresses', label: 'Addresses' },
  { key: 'email-settings', label: 'Email Settings' },
  { key: 'internships', label: 'Internships' },
  { key: 'internship-contents', label: 'Internship Contents' },
  { key: 'internship-faqs', label: 'Internship FAQs' },
  { key: 'malaysia-application-categories', label: 'Malaysia Application Categories' },
  { key: 'malaysia-applications', label: 'Malaysia Applications' },
  { key: 'international-student-data-countries', label: 'International Student Data Countries' },
  { key: 'international-student-data', label: 'International Student Data' },
  { key: 'our-partners', label: 'Our Partners' },
];

export default function Users() {
  const [items, setItems] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Add / Edit User Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobile: '',
    password: '',
    role: 'subadmin',
    department: '',
    status: 1,
  });

  // Manage Module Permissions Modal
  const [permUser, setPermUser] = useState<UserItem | null>(null);
  const [permState, setPermState] = useState<Record<string, Record<string, number>>>({});
  const [savingPerms, setSavingPerms] = useState(false);
  const [copyFromUserId, setCopyFromUserId] = useState<string>('');

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/v1/admin/users');
      const json = await res.json();
      if (res.ok && (json.status || json.success)) {
        setItems(json.data || []);
      } else {
        showToast('error', json.message || json.error || 'Failed to fetch users');
      }
    } catch {
      showToast('error', 'Network error while fetching users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenAdd = () => {
    setEditingId(null);
    setFormData({
      name: '',
      email: '',
      mobile: '',
      password: '',
      role: 'subadmin',
      department: '',
      status: 1,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: UserItem) => {
    setEditingId(item.id);
    setFormData({
      name: item.name || '',
      email: item.email || '',
      mobile: item.mobile || '',
      password: '',
      role: item.role || 'subadmin',
      department: item.department || '',
      status: item.status !== undefined ? item.status : 1,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    const isConfirmed = await confirmDelete('Are you sure you want to delete this admin user?');
    if (!isConfirmed) return;

    try {
      const res = await fetch(`/api/v1/admin/users/${id}`, { method: 'DELETE' });
      const json = await res.json();

      if (res.ok && (json.status || json.success)) {
        showToast('success', 'Deleted successfully');
        fetchData();
      } else {
        showToast('error', json.message || json.error || 'Failed to delete');
      }
    } catch {
      showToast('error', 'Error deleting record');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim()) {
      showToast('error', 'Name and Email are required');
      return;
    }
    if (!editingId && !formData.password.trim()) {
      showToast('error', 'Password is required for new users');
      return;
    }

    setSubmitting(true);
    try {
      const url = editingId
        ? `/api/v1/admin/users/${editingId}`
        : '/api/v1/admin/users';
      const method = editingId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const json = await res.json();
      if (res.ok && (json.status || json.success)) {
        showToast('success', editingId ? 'Updated successfully' : 'Created successfully');
        setIsModalOpen(false);
        fetchData();
      } else {
        showToast('error', json.message || json.error || 'Action failed');
      }
    } catch {
      showToast('error', 'Network error');
    } finally {
      setSubmitting(false);
    }
  };

  // Permissions Modal Helpers
  const handleOpenPermissions = (user: UserItem) => {
    setPermUser(user);
    setCopyFromUserId('');

    const initial: Record<string, Record<string, number>> = {};
    PERMISSION_MODULES.forEach((mod) => {
      const existing = user.permissions?.[mod.key] || {};
      initial[mod.key] = {
        view: Number(existing.view || 0),
        add: Number(existing.add || 0),
        edit: Number(existing.edit || 0),
        delete: Number(existing.delete || 0),
      };
    });
    setPermState(initial);
  };

  const handleToggleRowAction = (moduleKey: string, action: string, value: boolean) => {
    setPermState((prev) => ({
      ...prev,
      [moduleKey]: {
        ...(prev[moduleKey] || { view: 0, add: 0, edit: 0, delete: 0 }),
        [action]: value ? 1 : 0,
      },
    }));
  };

  const handleToggleRowAll = (moduleKey: string, value: boolean) => {
    const val = value ? 1 : 0;
    setPermState((prev) => ({
      ...prev,
      [moduleKey]: {
        view: val,
        add: val,
        edit: val,
        delete: val,
      },
    }));
  };

  const handleToggleColumn = (action: string, value: boolean) => {
    const val = value ? 1 : 0;
    setPermState((prev) => {
      const next = { ...prev };
      PERMISSION_MODULES.forEach((mod) => {
        next[mod.key] = {
          ...(next[mod.key] || { view: 0, add: 0, edit: 0, delete: 0 }),
          [action]: val,
        };
      });
      return next;
    });
  };

  const handleToggleGlobalAll = (value: boolean) => {
    const val = value ? 1 : 0;
    setPermState(() => {
      const next: Record<string, Record<string, number>> = {};
      PERMISSION_MODULES.forEach((mod) => {
        next[mod.key] = { view: val, add: val, edit: val, delete: val };
      });
      return next;
    });
  };

  const handleSelectNone = () => {
    handleToggleGlobalAll(false);
  };

  const handleCopyPermissionsFromUser = (targetUserIdStr: string) => {
    setCopyFromUserId(targetUserIdStr);
    if (!targetUserIdStr) return;

    const targetUser = items.find((u) => String(u.id) === targetUserIdStr);
    if (targetUser) {
      const next: Record<string, Record<string, number>> = {};
      PERMISSION_MODULES.forEach((mod) => {
        const existing = targetUser.permissions?.[mod.key] || {};
        next[mod.key] = {
          view: Number(existing.view || 0),
          add: Number(existing.add || 0),
          edit: Number(existing.edit || 0),
          delete: Number(existing.delete || 0),
        };
      });
      setPermState(next);
      showToast('success', `Copied permissions from ${targetUser.name}`);
    }
  };

  const handleSavePermissions = async () => {
    if (!permUser) return;
    setSavingPerms(true);
    try {
      const res = await fetch(`/api/v1/admin/users/${permUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ permissions: permState }),
      });

      const json = await res.json();
      if (res.ok && (json.status || json.success)) {
        showToast('success', 'Permissions updated successfully');
        setPermUser(null);
        fetchData();
      } else {
        showToast('error', json.message || json.error || 'Failed to update permissions');
      }
    } catch {
      showToast('error', 'Error updating permissions');
    } finally {
      setSavingPerms(false);
    }
  };

  // Helper check for column switches state
  const isGlobalAllChecked = PERMISSION_MODULES.every((mod) => {
    const row = permState[mod.key] || { view: 0, add: 0, edit: 0, delete: 0 };
    return row.view && row.add && row.edit && row.delete;
  });

  const isColumnActionChecked = (action: string) =>
    PERMISSION_MODULES.every((mod) => Boolean(permState[mod.key]?.[action]));

  const filtered = items.filter((item) => {
    const matchesSearch =
      (item.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.email || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.mobile || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.username || '').toLowerCase().includes(searchQuery.toLowerCase());

    const matchesRole = roleFilter === '' || (item.role || '').toLowerCase() === roleFilter.toLowerCase();

    return matchesSearch && matchesRole;
  });

  const paginated = filtered.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  const totalPages = Math.ceil(filtered.length / itemsPerPage) || 1;

  return (
    <div className="p-6">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg text-white ${toast.type === 'success' ? 'bg-emerald-600' : 'bg-red-600'
            }`}
        >
          {toast.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5" />
          ) : (
            <AlertCircle className="w-5 h-5" />
          )}
          <span className="font-medium text-sm">{toast.message}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <UsersIcon className="w-7 h-7 text-indigo-600" />
            Users & Module Permissions
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage admin users, roles, and granular access permissions for all system modules.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors text-sm font-semibold shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Add New User
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search name, email, mobile..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
            />
          </div>

          <div>
            <select
              value={roleFilter}
              onChange={(e) => {
                setRoleFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
            >
              <option value="">All Roles</option>
              <option value="admin">Admin</option>
              <option value="subadmin">Sub Admin</option>
              <option value="author">Author</option>
              <option value="counsellor">Counsellor</option>
              <option value="agent">Agent</option>
            </select>
          </div>

          <div className="flex items-center justify-end gap-2 text-sm text-slate-500">
            <button
              onClick={fetchData}
              className="p-2 hover:bg-slate-100 rounded-lg text-slate-600 transition-colors"
              title="Refresh Users"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <span>
              Total Users: <strong className="text-slate-800">{filtered.length}</strong>
            </span>
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
              <tr>
                <th className="py-3.5 px-4 w-16 text-center">S.No.</th>
                <th className="py-3.5 px-4">Name</th>
                <th className="py-3.5 px-4">Email</th>
                <th className="py-3.5 px-4">Mobile</th>
                <th className="py-3.5 px-4">Role</th>
                <th className="py-3.5 px-4 text-center">Permissions</th>
                <th className="py-3.5 px-4 text-right w-28">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-indigo-600 mb-2" />
                    Loading users...
                  </td>
                </tr>
              ) : paginated.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    No users found matching your search.
                  </td>
                </tr>
              ) : (
                paginated.map((item, idx) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 text-center text-slate-500 font-mono text-xs">
                      {(currentPage - 1) * itemsPerPage + idx + 1}
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900">{item.name}</div>
                      {item.username && (
                        <span className="text-xs text-slate-400 font-mono">@{item.username}</span>
                      )}
                    </td>

                    <td className="py-3 px-4 text-slate-700 font-mono text-xs">{item.email}</td>

                    <td className="py-3 px-4 text-slate-600 font-mono text-xs">
                      {item.mobile || 'N/A'}
                    </td>

                    <td className="py-3 px-4">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-indigo-50 text-indigo-700 capitalize border border-indigo-100">
                        {item.role || 'subadmin'}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => handleOpenPermissions(item)}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-800 hover:underline bg-indigo-50/60 hover:bg-indigo-100 px-3 py-1.5 rounded-lg border border-indigo-200/60 transition-all"
                      >
                        <ShieldCheck className="w-3.5 h-3.5" />
                        {item.granted_count || 0} module(s)
                      </button>
                    </td>

                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenEdit(item)}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit User"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Delete User"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {!loading && filtered.length > 0 && (
          <div className="p-4 border-t border-slate-200">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={(page) => setCurrentPage(page)}
            />
          </div>
        )}
      </div>

      {/* MANAGE MODULE PERMISSIONS MODAL */}
      {permUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-5xl h-[85vh] flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-900 text-white">
              <h3 className="text-lg font-bold flex items-center gap-2 text-white">
                <ShieldCheck className="w-5 h-5 text-indigo-400" />
                Manage Module Permissions
              </h3>
              <button
                onClick={() => setPermUser(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Subheader / User & Copy From Section */}
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h4 className="text-base font-bold text-slate-900">{permUser.name}</h4>
                <p className="text-xs text-slate-500 font-mono">{permUser.email}</p>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <div className="flex-1 sm:flex-initial">
                  <label className="block text-xs font-bold text-slate-600 mb-1">
                    Copy From User
                  </label>
                  <select
                    value={copyFromUserId}
                    onChange={(e) => handleCopyPermissionsFromUser(e.target.value)}
                    className="w-full sm:w-72 px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">Select user</option>
                    {items
                      .filter((u) => u.id !== permUser.id)
                      .map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.name} ({u.email})
                        </option>
                      ))}
                  </select>
                </div>

                <button
                  type="button"
                  onClick={handleSelectNone}
                  className="mt-5 px-3.5 py-1.5 bg-slate-600 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold transition-colors shadow-sm whitespace-nowrap"
                >
                  Select None
                </button>
              </div>
            </div>

            {/* Table Container */}
            <div className="flex-1 overflow-y-auto p-6">
              <table className="w-full text-left text-xs border border-slate-200 rounded-lg overflow-hidden">
                <thead className="bg-slate-100 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider sticky top-0 z-10 shadow-sm">
                  <tr>
                    <th className="py-3.5 px-4 w-[46%] bg-slate-100">Module</th>
                    <th className="py-3.5 px-4 text-center bg-slate-100">
                      <div className="flex flex-col items-center gap-1">
                        <span>All</span>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={isGlobalAllChecked}
                            onChange={(e) => handleToggleGlobalAll(e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="w-8 h-4 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-slate-700"></div>
                        </label>
                      </div>
                    </th>
                    <th className="py-3.5 px-4 text-center bg-slate-100">
                      <div className="flex flex-col items-center gap-1">
                        <span className="text-blue-600">View</span>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={isColumnActionChecked('view')}
                            onChange={(e) => handleToggleColumn('view', e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="w-8 h-4 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>
                    </th>
                    <th className="py-3.5 px-4 text-center bg-slate-100">
                      <div className="flex flex-col items-center gap-1">
                        <span className="text-emerald-600">Add</span>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={isColumnActionChecked('add')}
                            onChange={(e) => handleToggleColumn('add', e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="w-8 h-4 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-emerald-500"></div>
                        </label>
                      </div>
                    </th>
                    <th className="py-3.5 px-4 text-center bg-slate-100">
                      <div className="flex flex-col items-center gap-1">
                        <span className="text-amber-600">Edit</span>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={isColumnActionChecked('edit')}
                            onChange={(e) => handleToggleColumn('edit', e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="w-8 h-4 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-amber-500"></div>
                        </label>
                      </div>
                    </th>
                    <th className="py-3.5 px-4 text-center bg-slate-100">
                      <div className="flex flex-col items-center gap-1">
                        <span className="text-rose-600">Delete</span>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={isColumnActionChecked('delete')}
                            onChange={(e) => handleToggleColumn('delete', e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="w-8 h-4 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-rose-600"></div>
                        </label>
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {PERMISSION_MODULES.map((mod) => {
                    const row = permState[mod.key] || { view: 0, add: 0, edit: 0, delete: 0 };
                    const isAllRowChecked = Boolean(row.view && row.add && row.edit && row.delete);

                    return (
                      <tr key={mod.key} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-4 font-semibold text-slate-800">{mod.label}</td>

                        {/* Row ALL Switch */}
                        <td className="py-3 px-4 text-center">
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={isAllRowChecked}
                              onChange={(e) => handleToggleRowAll(mod.key, e.target.checked)}
                              className="sr-only peer"
                            />
                            <div className="w-8 h-4 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-slate-700"></div>
                          </label>
                        </td>

                        {/* View Switch */}
                        <td className="py-3 px-4 text-center">
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={Boolean(row.view)}
                              onChange={(e) => handleToggleRowAction(mod.key, 'view', e.target.checked)}
                              className="sr-only peer"
                            />
                            <div className="w-8 h-4 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-blue-600"></div>
                          </label>
                        </td>

                        {/* Add Switch */}
                        <td className="py-3 px-4 text-center">
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={Boolean(row.add)}
                              onChange={(e) => handleToggleRowAction(mod.key, 'add', e.target.checked)}
                              className="sr-only peer"
                            />
                            <div className="w-8 h-4 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-emerald-500"></div>
                          </label>
                        </td>

                        {/* Edit Switch */}
                        <td className="py-3 px-4 text-center">
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={Boolean(row.edit)}
                              onChange={(e) => handleToggleRowAction(mod.key, 'edit', e.target.checked)}
                              className="sr-only peer"
                            />
                            <div className="w-8 h-4 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-amber-500"></div>
                          </label>
                        </td>

                        {/* Delete Switch */}
                        <td className="py-3 px-4 text-center">
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={Boolean(row.delete)}
                              onChange={(e) => handleToggleRowAction(mod.key, 'delete', e.target.checked)}
                              className="sr-only peer"
                            />
                            <div className="w-8 h-4 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-rose-600"></div>
                          </label>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setPermUser(null)}
                className="px-4 py-2 bg-slate-600 hover:bg-slate-700 text-white rounded-lg text-sm font-semibold transition-colors shadow-sm"
              >
                Close
              </button>
              <button
                type="button"
                onClick={handleSavePermissions}
                disabled={savingPerms}
                className="flex items-center gap-2 px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold shadow-sm transition-colors disabled:opacity-50"
              >
                {savingPerms && <Loader2 className="w-4 h-4 animate-spin" />}
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit User Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-100 w-full max-w-lg overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50/50">
              <h3 className="text-base font-semibold text-slate-800">
                {editingId ? 'Edit Admin User' : 'Add Admin User'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1.5">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Full Name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1.5">
                  Email Address <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  placeholder="Email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1.5">
                    Mobile Number
                  </label>
                  <input
                    type="text"
                    placeholder="Mobile"
                    value={formData.mobile}
                    onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1.5">
                    Role
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all capitalize"
                  >
                    <option value="admin">Admin</option>
                    <option value="subadmin">Sub Admin</option>
                    <option value="author">Author</option>
                    <option value="counsellor">Counsellor</option>
                    <option value="agent">Agent</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1.5">
                  Password {!editingId && <span className="text-rose-500">*</span>}
                </label>
                <input
                  type="password"
                  required={!editingId}
                  placeholder={editingId ? 'Leave blank to keep current password' : 'Password'}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center gap-2 px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold shadow-sm transition-colors disabled:opacity-50"
                >
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  {editingId ? 'Update User' : 'Create User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
