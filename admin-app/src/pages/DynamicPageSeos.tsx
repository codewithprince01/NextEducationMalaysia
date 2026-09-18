import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { confirmDelete } from '@/lib/swal';
import Pagination from '@/components/common/Pagination';
import { uploadFileToStorage } from '@/lib/uploadHelper';
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
  FileCode,
  Eye,
  ChevronUp
} from 'lucide-react';

interface DynamicPageSeoItem {
  id: number;
  url: string;
  meta_title?: string;
  meta_description?: string;
  meta_keyword?: string;
  og_image_path?: string;
  page_content?: string;
  seo_rating?: number | string;
  best_rating?: number | string;
  review_number?: number | string;
  created_at?: string;
}

export default function DynamicPageSeos() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [items, setItems] = useState<DynamicPageSeoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  // Form visibility & Editing state
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [ogImageFile, setOgImageFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    url: '',
    meta_title: '',
    meta_description: '',
    meta_keyword: '',
    og_image_path: '',
    seo_rating: '',
    best_rating: '',
    review_number: '',
  });

  // View Content Modal (for Meta Title, Keyword, Description)
  const [viewModal, setViewModal] = useState<{ isOpen: boolean; title: string; content: string }>({
    isOpen: false,
    title: '',
    content: '',
  });

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/v1/admin/dynamic-page-seos');
      const json = await res.json();
      if (res.ok && json.status) {
        const fetchedItems: DynamicPageSeoItem[] = json.data || [];
        setItems(fetchedItems);

        // Check if there is an edit param in URL
        const editIdParam = searchParams.get('edit');
        if (editIdParam) {
          const targetId = parseInt(editIdParam, 10);
          const found = fetchedItems.find((i) => i.id === targetId);
          if (found) {
            populateForm(found);
          }
        }
      } else {
        showToast('error', json.message || 'Failed to fetch dynamic page SEOs');
      }
    } catch {
      showToast('error', 'Network error while fetching dynamic page SEOs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const populateForm = (item: DynamicPageSeoItem) => {
    setEditingId(item.id);
    setOgImageFile(null);
    setFormData({
      url: item.url || '',
      meta_title: item.meta_title || '',
      meta_description: item.meta_description || '',
      meta_keyword: item.meta_keyword || '',
      og_image_path: item.og_image_path || '',
      seo_rating: item.seo_rating !== null && item.seo_rating !== undefined ? String(item.seo_rating) : '',
      best_rating: item.best_rating !== null && item.best_rating !== undefined ? String(item.best_rating) : '',
      review_number: item.review_number !== null && item.review_number !== undefined ? String(item.review_number) : '',
    });
    setShowForm(true);
  };

  const handleOpenAdd = () => {
    setEditingId(null);
    setOgImageFile(null);
    setFormData({
      url: '',
      meta_title: '',
      meta_description: '',
      meta_keyword: '',
      og_image_path: '',
      seo_rating: '',
      best_rating: '',
      review_number: '',
    });
    setSearchParams({}, { replace: true });
    setShowForm(true);
  };

  const handleOpenEdit = (item: DynamicPageSeoItem) => {
    setSearchParams({ edit: String(item.id) }, { replace: true });
    populateForm(item);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingId(null);
    setOgImageFile(null);
    setSearchParams({}, { replace: true });
  };

  const handleDelete = async (id: number) => {
    const isConfirmed = await confirmDelete('Are you sure you want to delete this dynamic page SEO?');
    if (!isConfirmed) return;

    try {
      const res = await fetch(`/api/v1/admin/dynamic-page-seos/${id}`, { method: 'DELETE' });
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
    if (!formData.url.trim()) {
      showToast('error', 'Enter Page Name is required');
      return;
    }

    setSubmitting(true);
    try {
      const currentFormData = { ...formData };
      if (ogImageFile) {
        const res = await uploadFileToStorage(ogImageFile, 'seo');
        currentFormData.og_image_path = res.file_path;
      }

      const url = editingId
        ? `/api/v1/admin/dynamic-page-seos/${editingId}`
        : '/api/v1/admin/dynamic-page-seos';
      const method = editingId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(currentFormData),
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
    (item.url || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (item.meta_title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (item.meta_keyword || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (item.meta_description || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const paginated = filtered.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-2xl border border-slate-100 shadow-2xs">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
            <span className="p-2 rounded-xl bg-[#effaf2] text-[#14532d] border border-[#c8ebd2]/60 shadow-2xs">
              <FileCode className="w-5 h-5 text-emerald-700" />
            </span>
            Dynamic Page SEOs
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Manage page meta tags, ratings, and OG images for dynamic URLs.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchData}
            className="p-2 text-slate-600 hover:text-[#14532d] hover:bg-[#effaf2] rounded-xl border border-slate-200 hover:border-[#c8ebd2] transition-colors cursor-pointer"
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
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#14532d] hover:bg-[#0f3e21] text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
          >
            {showForm ? (
              <>
                <ChevronUp className="w-3.5 h-3.5 text-emerald-300" /> Hide Form
              </>
            ) : (
              <>
                <Plus className="w-3.5 h-3.5 text-emerald-300" /> Add Dynamic Page SEO
              </>
            )}
          </button>
        </div>
      </div>

      {/* Form Card (Matching Laravel's Form Structure) */}
      {showForm && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-2xs overflow-hidden animate-fadeIn">
          <div className="flex items-center justify-between p-4 px-6 border-b border-slate-100 bg-[#effaf2]">
            <h3 className="text-sm font-bold text-[#14532d] uppercase tracking-wider">
              {editingId ? 'Edit Dynamic Page SEO Record' : 'Add Dynamic Page SEO Record'}
            </h3>
            <button
              onClick={handleCancelForm}
              className="p-1 text-slate-400 hover:text-slate-600 rounded-lg transition-colors cursor-pointer"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {/* Enter Page Name */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
                  Enter Page Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. /study-in-malaysia/computer-science"
                  value={formData.url}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-1 focus:ring-emerald-500 focus:border-emerald-600 focus:bg-white transition-all font-mono"
                />
              </div>
            </div>

            <hr className="border-slate-100 my-2" />

            {/* Meta Title & Meta Keyword */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
                  Meta Title
                </label>
                <input
                  type="text"
                  placeholder="Enter Meta Title"
                  value={formData.meta_title}
                  onChange={(e) => setFormData({ ...formData, meta_title: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-1 focus:ring-emerald-500 focus:border-emerald-600 focus:bg-white transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
                  Meta Keyword
                </label>
                <input
                  type="text"
                  placeholder="Meta Keyword"
                  value={formData.meta_keyword}
                  onChange={(e) => setFormData({ ...formData, meta_keyword: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-1 focus:ring-emerald-500 focus:border-emerald-600 focus:bg-white transition-all"
                />
              </div>
            </div>

            {/* Meta Description */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
                Meta Description
              </label>
              <textarea
                rows={4}
                placeholder="Enter Meta Description"
                value={formData.meta_description}
                onChange={(e) => setFormData({ ...formData, meta_description: e.target.value })}
                className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-1 focus:ring-emerald-500 focus:border-emerald-600 focus:bg-white transition-all resize-y"
              />
            </div>

            {/* Seo Rating, Best Rating, Number of Review, Upload OG Image */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
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
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-1 focus:ring-emerald-500 focus:border-emerald-600 focus:bg-white transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
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
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-1 focus:ring-emerald-500 focus:border-emerald-600 focus:bg-white transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
                  Number of Review
                </label>
                <input
                  type="number"
                  placeholder="Number of Review"
                  value={formData.review_number}
                  onChange={(e) => setFormData({ ...formData, review_number: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-1 focus:ring-emerald-500 focus:border-emerald-600 focus:bg-white transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
                  Upload OG Image
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0] || null;
                    setOgImageFile(file);
                  }}
                  className="w-full text-xs text-slate-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-[#effaf2] file:text-[#14532d] hover:file:bg-[#dcfce7] cursor-pointer border border-slate-200 rounded-xl bg-slate-50"
                />
                {(ogImageFile || formData.og_image_path) && (
                  <span className="text-[11px] text-slate-600 mt-1 block truncate font-mono">
                    {ogImageFile ? `Selected: ${ogImageFile.name}` : `Current: ${formData.og_image_path}`}
                  </span>
                )}
              </div>
            </div>

            {/* Buttons */}
            <div className="flex items-center gap-2 pt-4 border-t border-slate-100">
              {editingId ? (
                <button
                  type="button"
                  onClick={handleCancelForm}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() =>
                    setFormData({
                      url: '',
                      meta_title: '',
                      meta_description: '',
                      meta_keyword: '',
                      og_image_path: '',
                      seo_rating: '',
                      best_rating: '',
                      review_number: '',
                    })
                  }
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  Reset
                </button>
              )}
              <button
                type="submit"
                disabled={submitting}
                className="flex items-center gap-2 px-5 py-2 bg-[#14532d] hover:bg-[#0f3e21] text-white rounded-xl text-xs font-bold shadow-xs transition-colors disabled:opacity-50 cursor-pointer"
              >
                {submitting && <Loader2 className="w-4 h-4 animate-spin text-emerald-300" />}
                Submit
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Controls / Search */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-2xs flex flex-col sm:flex-row gap-4 justify-between items-center">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search pages or titles..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-1 focus:ring-emerald-500 focus:border-emerald-600 focus:bg-white transition-all"
          />
        </div>
        <div className="text-xs text-slate-500">
          Showing <span className="font-bold text-slate-700">{filtered.length}</span> entries
        </div>
      </div>

      {/* Table (Matching Laravel's Columns: S.No., Page, Meta Title, Meta Keyword, Meta Description, SEO Rating, Action) */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-[#effaf2] border-b-2 border-[#c8ebd2] text-[#14532d] font-extrabold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3.5 px-4 w-16 text-center text-emerald-700">Sr. No.</th>
                <th className="py-3.5 px-4">Page</th>
                <th className="py-3.5 px-4">Meta Title</th>
                <th className="py-3.5 px-4">Meta Keyword</th>
                <th className="py-3.5 px-4">Meta Description</th>
                <th className="py-3.5 px-4">SEO Rating</th>
                <th className="py-3.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-emerald-600" />
                    Loading dynamic page SEOs...
                  </td>
                </tr>
              ) : paginated.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400 font-medium">
                    No dynamic page SEOs found.
                  </td>
                </tr>
              ) : (
                paginated.map((item, index) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 text-center font-bold text-emerald-700">
                      {(currentPage - 1) * itemsPerPage + index + 1}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-emerald-950 font-mono text-xs">
                      {item.url}
                    </td>
                    <td className="py-3.5 px-4">
                      {item.meta_title ? (
                        <button
                          onClick={() => setViewModal({ isOpen: true, title: 'Meta Title', content: item.meta_title || '' })}
                          className="px-2.5 py-1 text-xs font-bold text-[#14532d] bg-[#effaf2] border border-[#c8ebd2]/60 hover:bg-[#dcfce7] rounded-lg transition-colors inline-flex items-center gap-1 cursor-pointer"
                        >
                          <Eye className="w-3 h-3 text-emerald-700" /> View
                        </button>
                      ) : (
                        <span className="text-slate-400 text-xs italic">Null</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      {item.meta_keyword ? (
                        <button
                          onClick={() => setViewModal({ isOpen: true, title: 'Meta Keyword', content: item.meta_keyword || '' })}
                          className="px-2.5 py-1 text-xs font-bold text-[#14532d] bg-[#effaf2] border border-[#c8ebd2]/60 hover:bg-[#dcfce7] rounded-lg transition-colors inline-flex items-center gap-1 cursor-pointer"
                        >
                          <Eye className="w-3 h-3 text-emerald-700" /> View
                        </button>
                      ) : (
                        <span className="text-slate-400 text-xs italic">Null</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      {item.meta_description ? (
                        <button
                          onClick={() => setViewModal({ isOpen: true, title: 'Meta Description', content: item.meta_description || '' })}
                          className="px-2.5 py-1 text-xs font-bold text-[#14532d] bg-[#effaf2] border border-[#c8ebd2]/60 hover:bg-[#dcfce7] rounded-lg transition-colors inline-flex items-center gap-1 cursor-pointer"
                        >
                          <Eye className="w-3 h-3 text-emerald-700" /> View
                        </button>
                      ) : (
                        <span className="text-slate-400 text-xs italic">Null</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-xs font-medium text-slate-700 leading-relaxed">
                      <div><span className="text-slate-400 font-semibold">SEO:</span> {item.seo_rating ?? '-'}</div>
                      <div><span className="text-slate-400 font-semibold">Best:</span> {item.best_rating ?? '-'}</div>
                      <div><span className="text-slate-400 font-semibold">Reviews:</span> {item.review_number ?? '-'}</div>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenEdit(item)}
                          className="p-1.5 rounded-lg bg-[#effaf2] text-[#14532d] hover:bg-[#dcfce7] border border-[#c8ebd2]/60 shadow-2xs transition-colors cursor-pointer"
                          title="Edit"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="p-1.5 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200/60 shadow-2xs transition-colors cursor-pointer"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
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
          <div className="p-4 border-t border-slate-100 bg-slate-50/50">
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

      {/* Content View Modal */}
      {viewModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 w-full max-w-lg overflow-hidden">
            <div className="flex items-center justify-between p-4 px-6 border-b border-slate-100 bg-slate-50/50">
              <h3 className="text-base font-bold text-slate-800">{viewModal.title}</h3>
              <button
                onClick={() => setViewModal({ isOpen: false, title: '', content: '' })}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 text-xs text-slate-700 whitespace-pre-wrap max-h-[60vh] overflow-y-auto leading-relaxed font-medium">
              {viewModal.content}
            </div>
            <div className="flex justify-end p-4 px-6 border-t border-slate-100 bg-slate-50/50">
              <button
                onClick={() => setViewModal({ isOpen: false, title: '', content: '' })}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
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
