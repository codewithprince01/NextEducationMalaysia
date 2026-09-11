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
  Globe
} from 'lucide-react';

interface StaticPageSeoItem {
  id: number;
  page: string;
  meta_title?: string;
  meta_description?: string;
  meta_keyword?: string;
  og_image_path?: string;
  website?: string;
  created_at?: string;
}

export default function StaticPageSeos() {
  const [items, setItems] = useState<StaticPageSeoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    page: '',
    meta_title: '',
    meta_description: '',
    meta_keyword: '',
    og_image_path: '',
  });

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/v1/admin/static-page-seos');
      const json = await res.json();
      if (res.ok && json.status) {
        setItems(json.data || []);
      } else {
        showToast('error', json.message || 'Failed to fetch static page SEOs');
      }
    } catch {
      showToast('error', 'Network error while fetching static page SEOs');
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
      page: '',
      meta_title: '',
      meta_description: '',
      meta_keyword: '',
      og_image_path: '',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: StaticPageSeoItem) => {
    setEditingId(item.id);
    setFormData({
      page: item.page || '',
      meta_title: item.meta_title || '',
      meta_description: item.meta_description || '',
      meta_keyword: item.meta_keyword || '',
      og_image_path: item.og_image_path || '',
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    const isConfirmed = await confirmDelete('Are you sure you want to delete this static page SEO?');
    if (!isConfirmed) return;

    try {
      const res = await fetch(`/api/v1/admin/static-page-seos/${id}`, { method: 'DELETE' });
      const json = await res.json();

      if (res.ok && json.status) {
        showToast('success', 'Deleted successfully');
        fetchData();
      } else {
        showToast('error', json.message || 'Failed to delete');
      }
    } catch {
      showToast('error', 'Error deleting record');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.page.trim()) {
      showToast('error', 'Page name is required');
      return;
    }

    setSubmitting(true);
    try {
      const url = editingId
        ? `/api/v1/admin/static-page-seos/${editingId}`
        : '/api/v1/admin/static-page-seos';
      const method = editingId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const json = await res.json();
      if (res.ok && json.status) {
        showToast('success', editingId ? 'Updated successfully' : 'Created successfully');
        setIsModalOpen(false);
        fetchData();
      } else {
        showToast('error', json.message || 'Action failed');
      }
    } catch {
      showToast('error', 'Network error');
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = items.filter((item) =>
    (item.page || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (item.meta_title || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const paginated = filtered.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="space-y-3 max-w-[1600px] mx-auto">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed top-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-lg shadow-xl text-white text-sm font-medium transition-all duration-300 ${
            toast.type === 'success' ? 'bg-emerald-600' : 'bg-rose-600'
          }`}
        >
          {toast.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-slate-200/80 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
            <Globe className="w-6 h-6 text-indigo-600" /> Static Page SEOs
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage meta tags, descriptions, and OG images for static pages.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchData}
            className="p-2.5 text-slate-600 hover:text-indigo-600 hover:bg-slate-50 rounded-lg border border-slate-200 transition-colors"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" /> Add Static Page SEO
          </button>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row gap-4 justify-between items-center">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search pages or titles..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
          />
        </div>
        <div className="text-xs text-slate-500">
          Showing <span className="font-semibold text-slate-700">{filtered.length}</span> entries
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold text-xs uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4 w-16">ID</th>
                <th className="py-3.5 px-4">Page</th>
                <th className="py-3.5 px-4">Meta Title</th>
                <th className="py-3.5 px-4">Meta Description</th>
                <th className="py-3.5 px-4">OG Image Path</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-indigo-600" />
                    Loading static page SEOs...
                  </td>
                </tr>
              ) : paginated.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    No static page SEOs found.
                  </td>
                </tr>
              ) : (
                paginated.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-medium text-slate-400">#{item.id}</td>
                    <td className="py-3.5 px-4 font-semibold text-slate-800">{item.page}</td>
                    <td className="py-3.5 px-4 text-slate-600 max-w-xs truncate">{item.meta_title || '-'}</td>
                    <td className="py-3.5 px-4 text-slate-500 max-w-sm truncate">{item.meta_description || '-'}</td>
                    <td className="py-3.5 px-4 text-slate-500 max-w-xs truncate font-mono text-xs">{item.og_image_path || '-'}</td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleOpenEdit(item)}
                          className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Delete"
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

        {/* Pagination */}
        {!loading && filtered.length > 0 && (
          <div className="p-4 border-t border-slate-100">
            <Pagination
              currentPage={currentPage}
              totalPages={Math.ceil(filtered.length / itemsPerPage)}
              onPageChange={setCurrentPage}
              totalItems={filtered.length}
              itemsPerPage={itemsPerPage}
            />
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-100 w-full max-w-xl overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50/50">
              <h3 className="text-base font-semibold text-slate-800">
                {editingId ? 'Edit Static Page SEO' : 'Add Static Page SEO'}
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
                  Page Identifier <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. home, about-us, contact-us"
                  value={formData.page}
                  onChange={(e) => setFormData({ ...formData, page: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1.5">
                  Meta Title
                </label>
                <input
                  type="text"
                  placeholder="SEO Title..."
                  value={formData.meta_title}
                  onChange={(e) => setFormData({ ...formData, meta_title: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1.5">
                  Meta Description
                </label>
                <textarea
                  rows={3}
                  placeholder="Brief description for search engines..."
                  value={formData.meta_description}
                  onChange={(e) => setFormData({ ...formData, meta_description: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1.5">
                  Meta Keywords
                </label>
                <input
                  type="text"
                  placeholder="keywords, comma, separated"
                  value={formData.meta_keyword}
                  onChange={(e) => setFormData({ ...formData, meta_keyword: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1.5">
                  OG Image Path
                </label>
                <input
                  type="text"
                  placeholder="e.g. /uploads/og-home.jpg"
                  value={formData.og_image_path}
                  onChange={(e) => setFormData({ ...formData, og_image_path: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium shadow-sm transition-colors disabled:opacity-50"
                >
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  {editingId ? 'Save Changes' : 'Create SEO'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
