import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
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
  Briefcase,
  Eye,
  ChevronUp,
  FileText
} from 'lucide-react';

interface ServiceItem {
  id: number;
  page_name?: string;
  headline?: string;
  thumbnail_path?: string;
  imgpath?: string;
  meta_title?: string;
  meta_description?: string;
  meta_keyword?: string;
  page_content?: string;
  seo_rating?: number | string;
  best_rating?: number | string;
  review_number?: number | string;
  og_image_path?: string;
  content_count?: number;
  created_at?: string;
}

export default function Services() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [items, setItems] = useState<ServiceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Form visibility & Editing state
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    page_name: '',
    headline: '',
    thumbnail_path: '',
    meta_title: '',
    meta_keyword: '',
    meta_description: '',
    seo_rating: '',
    best_rating: '',
    review_number: '',
    og_image_path: '',
  });

  // View SEO Modal
  const [seoModal, setSeoModal] = useState<{ isOpen: boolean; item: ServiceItem | null }>({
    isOpen: false,
    item: null,
  });

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/v1/admin/services');
      const json = await res.json();
      if (res.ok && json.status) {
        const fetchedItems: ServiceItem[] = json.data || [];
        setItems(fetchedItems);

        // Check for ?edit=<ID> in URL
        const editIdParam = searchParams.get('edit');
        if (editIdParam) {
          const targetId = parseInt(editIdParam, 10);
          const found = fetchedItems.find((i) => i.id === targetId);
          if (found) {
            populateForm(found);
          }
        }
      } else {
        showToast('error', json.message || 'Failed to fetch services');
      }
    } catch {
      showToast('error', 'Network error while fetching services');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const populateForm = (item: ServiceItem) => {
    setEditingId(item.id);
    setFormData({
      page_name: item.page_name || '',
      headline: item.headline || '',
      thumbnail_path: item.thumbnail_path || item.imgpath || '',
      meta_title: item.meta_title || '',
      meta_keyword: item.meta_keyword || '',
      meta_description: item.meta_description || '',
      seo_rating: item.seo_rating !== null && item.seo_rating !== undefined ? String(item.seo_rating) : '',
      best_rating: item.best_rating !== null && item.best_rating !== undefined ? String(item.best_rating) : '',
      review_number: item.review_number !== null && item.review_number !== undefined ? String(item.review_number) : '',
      og_image_path: item.og_image_path || '',
    });
    setShowForm(true);
  };

  const handleOpenAdd = () => {
    setEditingId(null);
    setFormData({
      page_name: '',
      headline: '',
      thumbnail_path: '',
      meta_title: '',
      meta_keyword: '',
      meta_description: '',
      seo_rating: '',
      best_rating: '',
      review_number: '',
      og_image_path: '',
    });
    setSearchParams({}, { replace: true });
    setShowForm(true);
  };

  const handleOpenEdit = (item: ServiceItem) => {
    setSearchParams({ edit: String(item.id) }, { replace: true });
    populateForm(item);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingId(null);
    setSearchParams({}, { replace: true });
  };

  const handleDelete = async (id: number) => {
    const isConfirmed = await confirmDelete('Are you sure you want to delete this service record?');
    if (!isConfirmed) return;

    try {
      const res = await fetch(`/api/v1/admin/services/${id}`, { method: 'DELETE' });
      const json = await res.json();

      if (res.ok && json.status) {
        showToast('success', 'Deleted successfully');
        if (editingId === id) {
          handleCancelForm();
        }
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
    if (!formData.page_name.trim()) {
      showToast('error', 'Enter Page Name is required');
      return;
    }

    setSubmitting(true);
    try {
      const url = editingId
        ? `/api/v1/admin/services/${editingId}`
        : '/api/v1/admin/services';
      const method = editingId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const json = await res.json();
      if (res.ok && json.status) {
        showToast('success', editingId ? 'Updated successfully' : 'Created successfully');
        handleCancelForm();
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
    (item.page_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (item.headline || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const paginated = filtered.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const getImageUrl = (path?: string) => {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    return `/${path.replace(/^\/+/, '')}`;
  };

  return (
    <div className="space-y-4 max-w-[1600px] mx-auto">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed top-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-lg shadow-xl text-white text-sm font-medium transition-all duration-300 ${toast.type === 'success' ? 'bg-emerald-600' : 'bg-rose-600'
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
            <Briefcase className="w-6 h-6 text-indigo-600" /> Services
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage service page titles, headlines, thumbnails, and SEO meta tags.
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
            onClick={() => {
              if (showForm && !editingId) {
                setShowForm(false);
              } else {
                handleOpenAdd();
              }
            }}
            className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium shadow-sm transition-colors"
          >
            {showForm ? (
              <>
                <ChevronUp className="w-4 h-4" /> Hide Form
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" /> Add Service
              </>
            )}
          </button>
        </div>
      </div>

      {/* Form Card (Matching Laravel services.blade.php + media_1789217102087.png) */}
      {showForm && (
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden animate-fadeIn">
          <div className="flex items-center justify-between p-4 px-6 border-b border-slate-200 bg-slate-50/50">
            <h3 className="text-base font-bold text-slate-800">
              {editingId ? 'Edit Record' : 'Add New Record'}
            </h3>
            <button
              onClick={handleCancelForm}
              className="p-1 text-slate-400 hover:text-slate-600 rounded-lg transition-colors"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Enter Page Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="Enter Page Name"
                  value={formData.page_name}
                  onChange={(e) => setFormData({ ...formData, page_name: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Enter Headline
                </label>
                <input
                  type="text"
                  placeholder="Enter Headline"
                  value={formData.headline}
                  onChange={(e) => setFormData({ ...formData, headline: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Thumbnail
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setFormData({ ...formData, thumbnail_path: file.name });
                    }
                  }}
                  className="w-full text-xs text-slate-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-slate-200 file:text-slate-700 hover:file:bg-slate-300 cursor-pointer border border-slate-200 rounded-lg bg-slate-50"
                />
                {formData.thumbnail_path && (
                  <span className="text-[11px] text-slate-500 mt-1 block truncate font-mono">
                    Selected File: {formData.thumbnail_path}
                  </span>
                )}
              </div>
            </div>

            <hr className="border-slate-100 my-4" />

            {/* SEO FIELD COMPONENT (<x-SeoField>) */}
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Meta Title
                  </label>
                  <input
                    type="text"
                    placeholder="Enter Meta Title"
                    value={formData.meta_title}
                    onChange={(e) => setFormData({ ...formData, meta_title: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Meta Keyword
                  </label>
                  <input
                    type="text"
                    placeholder="Meta Keyword"
                    value={formData.meta_keyword}
                    onChange={(e) => setFormData({ ...formData, meta_keyword: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Meta Description
                </label>
                <textarea
                  rows={5}
                  placeholder="Meta Description"
                  value={formData.meta_description}
                  onChange={(e) => setFormData({ ...formData, meta_description: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all resize-y"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Seo Rating
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="5"
                    step="0.1"
                    placeholder="Seo Rating"
                    value={formData.seo_rating}
                    onChange={(e) => setFormData({ ...formData, seo_rating: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Best Rating
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="5"
                    step="0.1"
                    placeholder="Best Rating"
                    value={formData.best_rating}
                    onChange={(e) => setFormData({ ...formData, best_rating: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Number of Review
                  </label>
                  <input
                    type="number"
                    placeholder="Total Reviews"
                    value={formData.review_number}
                    onChange={(e) => setFormData({ ...formData, review_number: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Upload OG Image
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setFormData({ ...formData, og_image_path: file.name });
                      }
                    }}
                    className="w-full text-xs text-slate-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-slate-200 file:text-slate-700 hover:file:bg-slate-300 cursor-pointer border border-slate-200 rounded-lg bg-slate-50"
                  />
                  {formData.og_image_path && (
                    <span className="text-[11px] text-slate-500 mt-1 block truncate font-mono">
                      Selected OG: {formData.og_image_path}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex items-center gap-2 pt-4 border-t border-slate-100">
              {editingId ? (
                <button
                  type="button"
                  onClick={handleCancelForm}
                  className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg text-sm font-medium transition-colors"
                >
                  Cancel
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() =>
                    setFormData({
                      page_name: '',
                      headline: '',
                      thumbnail_path: '',
                      meta_title: '',
                      meta_keyword: '',
                      meta_description: '',
                      seo_rating: '',
                      best_rating: '',
                      review_number: '',
                      og_image_path: '',
                    })
                  }
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-sm font-medium transition-colors"
                >
                  Reset
                </button>
              )}
              <button
                type="submit"
                disabled={submitting}
                className="flex items-center gap-2 px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium shadow-sm transition-colors disabled:opacity-50"
              >
                {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                Submit
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Controls / Search */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row gap-4 justify-between items-center">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search page name or headline..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
          />
        </div>
        <div className="text-xs text-slate-500">
          Showing <span className="font-semibold text-slate-700">{filtered.length}</span> entries
        </div>
      </div>

      {/* Table (Matching Laravel services.blade.php & media_1789217102087.png) */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold text-xs uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4 w-16">Sr. No.</th>
                <th className="py-3.5 px-4">Page Name</th>
                <th className="py-3.5 px-4">Headline</th>
                <th className="py-3.5 px-4">Image</th>
                <th className="py-3.5 px-4">SEO</th>
                <th className="py-3.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-indigo-600" />
                    Loading services...
                  </td>
                </tr>
              ) : paginated.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    No service records found.
                  </td>
                </tr>
              ) : (
                paginated.map((item, index) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-medium text-slate-500">
                      {(currentPage - 1) * itemsPerPage + index + 1}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-800">
                      {item.page_name || '-'}
                    </td>
                    <td className="py-3.5 px-4 text-slate-700 max-w-xs truncate">
                      {item.headline || '-'}
                    </td>
                    <td className="py-3.5 px-4">
                      {item.thumbnail_path || item.imgpath ? (
                        <img
                          src={getImageUrl(item.thumbnail_path || item.imgpath)}
                          alt={item.page_name || 'Service Thumbnail'}
                          className="w-10 h-10 object-cover rounded border border-slate-200 bg-slate-50"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                            const nextSibling = (e.target as HTMLElement).nextElementSibling as HTMLElement;
                            if (nextSibling) nextSibling.style.display = 'inline';
                          }}
                        />
                      ) : (
                        <span className="text-slate-400 text-xs">N/A</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      {item.meta_title ? (
                        <button
                          onClick={() => setSeoModal({ isOpen: true, item })}
                          className="px-2.5 py-1 text-xs font-medium text-sky-700 bg-sky-50 border border-sky-200 hover:bg-sky-100 rounded transition-colors inline-flex items-center gap-1"
                        >
                          <Eye className="w-3 h-3" /> View
                        </button>
                      ) : (
                        <span className="text-slate-400 text-xs">Null</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => navigate(`/service-content/${item.id}`)}
                          className="px-2 py-1 text-xs font-medium text-sky-700 bg-sky-50 border border-sky-200 hover:bg-sky-100 rounded transition-colors inline-flex items-center gap-1"
                          title="Service Content"
                        >
                          <FileText className="w-3 h-3" /> Content <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-rose-500 text-white font-bold">{item.content_count || 0}</span>
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="p-1.5 text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleOpenEdit(item)}
                          className="p-1.5 text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
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

      {/* SEO View Modal (Matching Laravel <x-seo-view-model>) */}
      {seoModal.isOpen && seoModal.item && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-100 w-full max-w-lg overflow-hidden">
            <div className="flex items-center justify-between p-4 px-6 border-b border-slate-100 bg-slate-50/50">
              <h3 className="text-base font-bold text-slate-800">SEO</h3>
              <button
                onClick={() => setSeoModal({ isOpen: false, item: null })}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 text-sm text-slate-700 space-y-4 max-h-[60vh] overflow-y-auto leading-relaxed">
              <div>
                <h4 className="font-bold text-slate-900 mb-1">Meta Title</h4>
                <p className="text-slate-600 bg-slate-50 p-2.5 rounded border border-slate-100">{seoModal.item.meta_title || '-'}</p>
              </div>
              <div>
                <h4 className="font-bold text-slate-900 mb-1">Meta Keyword</h4>
                <p className="text-slate-600 bg-slate-50 p-2.5 rounded border border-slate-100">{seoModal.item.meta_keyword || '-'}</p>
              </div>
              <div>
                <h4 className="font-bold text-slate-900 mb-1">Meta Description</h4>
                <p className="text-slate-600 bg-slate-50 p-2.5 rounded border border-slate-100 whitespace-pre-wrap">{seoModal.item.meta_description || '-'}</p>
              </div>
              {seoModal.item.page_content && (
                <div>
                  <h4 className="font-bold text-slate-900 mb-1">Page Content</h4>
                  <div className="text-slate-600 bg-slate-50 p-2.5 rounded border border-slate-100 prose max-w-none" dangerouslySetInnerHTML={{ __html: seoModal.item.page_content }} />
                </div>
              )}
              <div>
                <h4 className="font-bold text-slate-900 mb-1">Seo Rating</h4>
                <p className="text-slate-600 bg-slate-50 p-2.5 rounded border border-slate-100">
                  Rating : {seoModal.item.seo_rating ?? ''} | Best Rating : {seoModal.item.best_rating ?? ''} | Number of Review : {seoModal.item.review_number ?? ''}
                </p>
              </div>
              {seoModal.item.og_image_path && (
                <div>
                  <h4 className="font-bold text-slate-900 mb-1">OG Image</h4>
                  <a href={getImageUrl(seoModal.item.og_image_path)} target="_blank" rel="noreferrer" className="text-indigo-600 underline text-xs font-mono">
                    View OG Image ({seoModal.item.og_image_path})
                  </a>
                </div>
              )}
            </div>
            <div className="flex justify-end p-4 px-6 border-t border-slate-100 bg-slate-50/50">
              <button
                onClick={() => setSeoModal({ isOpen: false, item: null })}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg text-sm font-medium transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
