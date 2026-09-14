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
  Eye,
  EyeOff
} from 'lucide-react';

interface BlogCategoryItem {
  id: number;
  category_name: string;
  category_slug: string;
  description?: string;
  meta_title?: string;
  meta_description?: string;
  meta_keyword?: string;
  seo_rating?: string;
  best_rating?: string;
  review_number?: string;
  og_image_path?: string;
  status: number;
  _count?: { blogs: number };
}

export default function BlogCategories() {
  const [categories, setCategories] = useState<BlogCategoryItem[]>([]);
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
    category_name: '',
    category_slug: '',
    description: '',
    meta_title: '',
    meta_description: '',
    meta_keyword: '',
    seo_rating: '',
    best_rating: '',
    review_number: '',
    og_image_path: '',
    status: 1,
  });

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/v1/admin/blog-categories');
      const json = await res.json();
      if (res.ok && json.success) {
        setCategories(json.data || []);
      } else {
        showToast('error', json.error || 'Failed to fetch categories');
      }
    } catch {
      showToast('error', 'Network error while fetching categories');
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
      category_name: '',
      category_slug: '',
      description: '',
      meta_title: '',
      meta_description: '',
      meta_keyword: '',
      seo_rating: '',
      best_rating: '',
      review_number: '',
      og_image_path: '',
      status: 1,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: BlogCategoryItem) => {
    setEditingId(item.id);
    setFormData({
      category_name: item.category_name || '',
      category_slug: item.category_slug || '',
      description: item.description || '',
      meta_title: item.meta_title || '',
      meta_description: item.meta_description || '',
      meta_keyword: item.meta_keyword || '',
      seo_rating: item.seo_rating || '',
      best_rating: item.best_rating || '',
      review_number: item.review_number || '',
      og_image_path: item.og_image_path || '',
      status: item.status !== undefined ? item.status : 1,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.category_name.trim()) {
      showToast('error', 'Category name is required');
      return;
    }

    setSubmitting(true);
    try {
      const url = editingId
        ? `/api/v1/admin/blog-categories/${editingId}`
        : '/api/v1/admin/blog-categories';
      const method = editingId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const json = await res.json();

      if (res.ok && json.success) {
        showToast(
          'success',
          editingId ? 'Category updated successfully' : 'Category created successfully'
        );
        setIsModalOpen(false);
        fetchData();
      } else {
        showToast('error', json.error || 'Failed to save category');
      }
    } catch {
      showToast('error', 'Error submitting category form');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (item: BlogCategoryItem) => {
    const confirmed = await confirmDelete(item.category_name);
    if (!confirmed) return;

    try {
      const res = await fetch(`/api/v1/admin/blog-categories/${item.id}`, {
        method: 'DELETE',
      });
      const json = await res.json();
      if (res.ok && json.success) {
        showToast('success', 'Category deleted successfully');
        setCategories((prev) => prev.filter((c) => c.id !== item.id));
      } else {
        showToast('error', json.error || 'Failed to delete category');
      }
    } catch {
      showToast('error', 'Error deleting category');
    }
  };

  const filteredCategories = categories.filter((c) =>
    (c.category_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (c.category_slug || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(filteredCategories.length / itemsPerPage);
  const currentCategories = filteredCategories.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="space-y-3">
      {/* Toast */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-2xl shadow-xl flex items-center gap-3 text-sm font-semibold transition-all ${toast.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'
            }`}
        >
          {toast.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Header */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-[11px] font-extrabold uppercase tracking-widest text-indigo-600 block">
              BLOG MANAGEMENT
            </span>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Blog Categories
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchData}
              className="p-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={handleOpenAdd}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20 flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              Add Blog Category
            </button>
          </div>
        </div>
      </div>

      {/* Search & Stats bar */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search categories..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:border-indigo-600"
          />
        </div>
        <span className="text-xs font-bold text-slate-500">
          Total Categories: {filteredCategories.length}
        </span>
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200/80 rounded-3xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-12 flex flex-col items-center justify-center text-slate-500">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mb-3" />
            <p className="text-xs font-semibold">Loading blog categories...</p>
          </div>
        ) : filteredCategories.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <p className="text-sm font-semibold">No blog categories found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/50 text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                  <th className="py-4 px-6">ID</th>
                  <th className="py-4 px-6">Category Name</th>
                  <th className="py-4 px-6">Slug</th>
                  <th className="py-4 px-6">Blogs Count</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
                {currentCategories.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-4 px-6 font-bold text-slate-400">#{item.id}</td>
                    <td className="py-4 px-6 font-bold text-slate-900">{item.category_name}</td>
                    <td className="py-4 px-6 font-mono text-slate-500">{item.category_slug}</td>
                    <td className="py-4 px-6">
                      <span className="px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-600 font-bold text-xs">
                        {item._count?.blogs || 0} blogs
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      {item.status === 1 ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-600 font-bold text-[11px]">
                          <Eye className="w-3 h-3" /> Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 text-slate-500 font-bold text-[11px]">
                          <EyeOff className="w-3 h-3" /> Inactive
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenEdit(item)}
                          className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:text-indigo-600 hover:border-indigo-200 transition-colors"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(item)}
                          className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:text-rose-600 hover:border-rose-200 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {totalPages > 1 && (
          <div className="border-t border-slate-100">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={filteredCategories.length}
              itemsPerPage={itemsPerPage}
              onPageChange={(p) => setCurrentPage(p)}
            />
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-xl max-h-[90vh] overflow-y-auto p-6 shadow-2xl space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="text-lg font-extrabold text-slate-900">
                {editingId ? 'Edit Blog Category' : 'Add Blog Category'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-2">
                  Category Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Study in Malaysia News"
                  value={formData.category_name}
                  onChange={(e) => setFormData({ ...formData, category_name: e.target.value })}
                  required
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-900 text-xs font-semibold focus:outline-none focus:border-indigo-600"
                />
              </div>

              <div>
                <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-2">
                  URL Slug (Optional - auto-generated if left empty)
                </label>
                <input
                  type="text"
                  placeholder="e.g. study-in-malaysia-news"
                  value={formData.category_slug}
                  onChange={(e) => setFormData({ ...formData, category_slug: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-900 text-xs font-semibold focus:outline-none focus:border-indigo-600"
                />
              </div>

              <div>
                <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-2">
                  Description
                </label>
                <textarea
                  rows={3}
                  placeholder="Short description..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-900 text-xs font-semibold focus:outline-none focus:border-indigo-600"
                />
              </div>

              <div className="border-t border-slate-100 pt-4 space-y-4">
                <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
                  SEO Metadata
                </h4>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Meta Title</label>
                  <input
                    type="text"
                    value={formData.meta_title}
                    onChange={(e) => setFormData({ ...formData, meta_title: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Meta Description</label>
                  <textarea
                    rows={2}
                    value={formData.meta_description}
                    onChange={(e) => setFormData({ ...formData, meta_description: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Meta Keywords</label>
                  <input
                    type="text"
                    placeholder="keyword1, keyword2"
                    value={formData.meta_keyword}
                    onChange={(e) => setFormData({ ...formData, meta_keyword: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-semibold"
                  />
                </div>

                {/* SEO Schema Fields */}
                <div className="grid grid-cols-3 gap-3 pt-2">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">SEO Rating</label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="5"
                      placeholder="e.g. 4.5"
                      value={formData.seo_rating}
                      onChange={(e) => setFormData({ ...formData, seo_rating: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Best Rating</label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="5"
                      placeholder="e.g. 5.0"
                      value={formData.best_rating}
                      onChange={(e) => setFormData({ ...formData, best_rating: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Number of Reviews</label>
                    <input
                      type="number"
                      min="0"
                      placeholder="e.g. 120"
                      value={formData.review_number}
                      onChange={(e) => setFormData({ ...formData, review_number: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-semibold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Upload OG Image</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setFormData({ ...formData, og_image_path: file.name });
                      }
                    }}
                    className="w-full text-xs text-slate-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-slate-200 file:text-slate-700 hover:file:bg-slate-300 cursor-pointer border border-slate-200 rounded-xl bg-slate-50"
                  />
                  {formData.og_image_path && (
                    <span className="text-[11px] text-slate-500 mt-1 block truncate">
                      Current / Selected: {formData.og_image_path}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <label className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">
                  Status:
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: parseInt(e.target.value, 10) })}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold"
                >
                  <option value={1}>Active</option>
                  <option value={0}>Inactive</option>
                </select>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-700 text-white font-bold text-xs shadow-md shadow-blue-600/20 flex items-center gap-2 transition-all disabled:opacity-50"
                >
                  {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{editingId ? 'Update Category' : 'Create Category'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
