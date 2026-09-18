import React, { useEffect, useState, useRef } from 'react';
import { confirmDelete } from '@/lib/swal';
import Pagination from '@/components/common/Pagination';
import RichTextEditor from '@/components/common/RichTextEditor';
import { getStorageUrl } from '@/lib/uploadHelper';
import {
  BookOpen,
  Search,
  Edit2,
  Trash2,
  Loader2,
  X,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Plus,
  RotateCcw,
  Eye,
  Globe
} from 'lucide-react';

interface ExamItem {
  id: number;
  page_name?: string;
  name?: string;
  headline?: string;
  uri?: string;
  position?: number | string;
  description?: string;
  thumbnail_path?: string;
  imgpath?: string;
  og_image_path?: string;
  og_image?: string;
  meta_title?: string;
  meta_description?: string;
  meta_keyword?: string;
  seo_rating?: string;
  best_rating?: string;
  review_number?: string;
  hview?: number;
  status?: number;
  created_at?: string;
}

export default function Exams() {
  const [items, setItems] = useState<ExamItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Form card toggle state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // View Modals for Description & SEO
  const [descModal, setDescModal] = useState<string | null>(null);
  const [seoModal, setSeoModal] = useState<ExamItem | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    page_name: '',
    headline: '',
    description: '',
    position: '1',
    meta_title: '',
    meta_keyword: '',
    meta_description: '',
    seo_rating: '',
    best_rating: '',
    review_number: '',
  });

  const thumbnailRef = useRef<HTMLInputElement>(null);
  const ogImageRef = useRef<HTMLInputElement>(null);
  const [existingThumbnail, setExistingThumbnail] = useState<string>('');
  const [existingOgImage, setExistingOgImage] = useState<string>('');

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/v1/admin/exams');
      const json = await res.json();
      if (res.ok && (json.status || json.success)) {
        setItems(json.data || []);
      } else {
        showToast('error', json.message || json.error || 'Failed to fetch exams');
      }
    } catch {
      showToast('error', 'Network error while fetching exams');
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
      page_name: '',
      headline: '',
      description: '',
      position: '1',
      meta_title: '',
      meta_keyword: '',
      meta_description: '',
      seo_rating: '',
      best_rating: '',
      review_number: '',
    });
    setExistingThumbnail('');
    setExistingOgImage('');
    if (thumbnailRef.current) thumbnailRef.current.value = '';
    if (ogImageRef.current) ogImageRef.current.value = '';
    setIsFormOpen(true);
  };

  const handleOpenEdit = (item: ExamItem) => {
    setEditingId(item.id);
    setFormData({
      page_name: item.page_name || item.name || '',
      headline: item.headline || '',
      description: item.description || '',
      position: String(item.position ?? '1'),
      meta_title: item.meta_title || '',
      meta_keyword: item.meta_keyword || '',
      meta_description: item.meta_description || '',
      seo_rating: item.seo_rating || '',
      best_rating: item.best_rating || '',
      review_number: item.review_number || '',
    });
    setExistingThumbnail(item.thumbnail_path || item.imgpath || '');
    setExistingOgImage(item.og_image_path || item.og_image || '');
    if (thumbnailRef.current) thumbnailRef.current.value = '';
    if (ogImageRef.current) ogImageRef.current.value = '';
    setIsFormOpen(true);
  };

  const handleReset = () => {
    setFormData({
      page_name: '',
      headline: '',
      description: '',
      position: '1',
      meta_title: '',
      meta_keyword: '',
      meta_description: '',
      seo_rating: '',
      best_rating: '',
      review_number: '',
    });
    setExistingThumbnail('');
    setExistingOgImage('');
    if (thumbnailRef.current) thumbnailRef.current.value = '';
    if (ogImageRef.current) ogImageRef.current.value = '';
  };

  const handleDelete = async (id: number) => {
    const isConfirmed = await confirmDelete('Are you sure you want to delete this exam?');
    if (!isConfirmed) return;

    try {
      const res = await fetch(`/api/v1/admin/exams/${id}`, { method: 'DELETE' });
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
    if (!formData.page_name.trim()) {
      showToast('error', 'Exam name is required');
      return;
    }

    setSubmitting(true);
    try {
      const payload = new FormData();
      payload.append('page_name', formData.page_name);
      payload.append('headline', formData.headline);
      payload.append('description', formData.description);
      payload.append('position', formData.position);
      payload.append('meta_title', formData.meta_title);
      payload.append('meta_keyword', formData.meta_keyword);
      payload.append('meta_description', formData.meta_description);
      payload.append('seo_rating', formData.seo_rating);
      payload.append('best_rating', formData.best_rating);
      payload.append('review_number', formData.review_number);

      if (thumbnailRef.current?.files?.[0]) {
        payload.append('thumbnail', thumbnailRef.current.files[0]);
      }
      if (ogImageRef.current?.files?.[0]) {
        payload.append('og_image', ogImageRef.current.files[0]);
      }

      const url = editingId
        ? `/api/v1/admin/exams/${editingId}`
        : '/api/v1/admin/exams';
      const method = editingId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        body: payload,
      });

      const json = await res.json();
      if (res.ok && (json.status || json.success)) {
        showToast('success', editingId ? 'Updated successfully' : 'Created successfully');
        setEditingId(null);
        handleReset();
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

  const filtered = items.filter((item) =>
    (item.page_name || item.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (item.headline || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (item.uri || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const paginated = filtered.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="space-y-4 max-w-[1600px] mx-auto pb-10">
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-emerald-800" /> Exams
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage entrance exams, headlines, positions, descriptions, and SEO ratings.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchData}
            className="p-2 text-slate-600 hover:text-emerald-800 hover:bg-[#effaf2] rounded-xl border border-slate-200 transition-colors cursor-pointer"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => {
              if (isFormOpen && !editingId) {
                setIsFormOpen(false);
              } else {
                handleOpenAdd();
              }
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-[#14532d] hover:bg-[#0f3e21] text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
          >
            {isFormOpen && !editingId ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4 text-emerald-300" />}
            <span>{isFormOpen && !editingId ? 'Close Form' : 'Add New Exam'}</span>
          </button>
        </div>
      </div>

      {/* Form Card */}
      {isFormOpen && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden animate-fadeIn">
          <div className="flex items-center justify-between px-6 py-4 border-b border-[#c8ebd2] bg-[#effaf2]">
            <h2 className="text-sm font-bold text-[#14532d] flex items-center gap-2">
              {editingId ? <Edit2 className="w-4 h-4 text-emerald-700" /> : <Plus className="w-4 h-4 text-emerald-700" />}
              <span>{editingId ? 'Update Exam Record' : 'Add New Exam Record'}</span>
            </h2>
            <button
              onClick={() => setIsFormOpen(false)}
              className="p-1 text-slate-400 hover:text-slate-600 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  Exam Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Exam Name"
                  value={formData.page_name}
                  onChange={(e) => setFormData({ ...formData, page_name: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs bg-slate-50/70 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-1 focus:ring-emerald-500 focus:border-emerald-600 focus:bg-white transition-all"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  Enter Title
                </label>
                <input
                  type="text"
                  placeholder="Enter Title"
                  value={formData.headline}
                  onChange={(e) => setFormData({ ...formData, headline: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs bg-slate-50/70 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-1 focus:ring-emerald-500 focus:border-emerald-600 focus:bg-white transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                Description
              </label>
              <RichTextEditor
                value={formData.description}
                onChange={(content) => setFormData({ ...formData, description: content })}
                placeholder="Description"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  Thumbnail
                </label>
                <input
                  type="file"
                  ref={thumbnailRef}
                  accept="image/*"
                  className="w-full text-xs text-slate-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-[#effaf2] file:text-[#14532d] hover:file:bg-[#dcfce7] cursor-pointer border border-slate-200 rounded-xl bg-slate-50/70"
                />
                {existingThumbnail && (
                  <div className="mt-1 flex items-center gap-2">
                    <img src={existingThumbnail} alt="Thumbnail" className="h-6 w-6 object-cover rounded-md border border-[#c8ebd2]" />
                    <span className="text-[11px] text-slate-500 truncate font-mono">{existingThumbnail}</span>
                  </div>
                )}
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  Position
                </label>
                <input
                  type="number"
                  placeholder="Position"
                  value={formData.position}
                  onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs bg-slate-50/70 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-1 focus:ring-emerald-500 focus:border-emerald-600 focus:bg-white transition-all"
                />
              </div>
            </div>

            <hr className="my-2 border-slate-200" />

            {/* SEO Section */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  Meta Title
                </label>
                <input
                  type="text"
                  placeholder="Enter Meta Title"
                  value={formData.meta_title}
                  onChange={(e) => setFormData({ ...formData, meta_title: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs bg-slate-50/70 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-1 focus:ring-emerald-500 focus:border-emerald-600 focus:bg-white transition-all"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  Meta Keyword
                </label>
                <input
                  type="text"
                  placeholder="Meta Keyword"
                  value={formData.meta_keyword}
                  onChange={(e) => setFormData({ ...formData, meta_keyword: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs bg-slate-50/70 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-1 focus:ring-emerald-500 focus:border-emerald-600 focus:bg-white transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                Meta Description
              </label>
              <textarea
                rows={3}
                placeholder="Meta Description"
                value={formData.meta_description}
                onChange={(e) => setFormData({ ...formData, meta_description: e.target.value })}
                className="w-full px-3.5 py-2 text-xs bg-slate-50/70 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-1 focus:ring-emerald-500 focus:border-emerald-600 focus:bg-white transition-all resize-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  Seo Rating
                </label>
                <input
                  type="text"
                  placeholder="Seo Rating"
                  value={formData.seo_rating}
                  onChange={(e) => setFormData({ ...formData, seo_rating: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs bg-slate-50/70 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-1 focus:ring-emerald-500 focus:border-emerald-600 focus:bg-white transition-all"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  Best Rating
                </label>
                <input
                  type="text"
                  placeholder="Best Rating"
                  value={formData.best_rating}
                  onChange={(e) => setFormData({ ...formData, best_rating: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs bg-slate-50/70 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-1 focus:ring-emerald-500 focus:border-emerald-600 focus:bg-white transition-all"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  Number of Review
                </label>
                <input
                  type="text"
                  placeholder="Total Reviews"
                  value={formData.review_number}
                  onChange={(e) => setFormData({ ...formData, review_number: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs bg-slate-50/70 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-1 focus:ring-emerald-500 focus:border-emerald-600 focus:bg-white transition-all"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  Upload OG Image
                </label>
                <input
                  type="file"
                  ref={ogImageRef}
                  accept="image/*"
                  className="w-full text-xs text-slate-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-[#effaf2] file:text-[#14532d] hover:file:bg-[#dcfce7] cursor-pointer border border-slate-200 rounded-xl bg-slate-50/70"
                />
                {existingOgImage && (
                  <div className="mt-1 flex items-center gap-2">
                    <img src={existingOgImage} alt="OG Image" className="h-6 w-6 object-cover rounded-md border border-[#c8ebd2]" />
                    <span className="text-[11px] text-slate-500 truncate font-mono">{existingOgImage}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={handleReset}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Reset
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center gap-1.5 px-5 py-2 bg-[#14532d] hover:bg-[#0f3e21] text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer disabled:opacity-50"
              >
                {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                <span>{editingId ? 'Update Record' : 'Submit'}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Controls & Search */}
      <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row gap-4 justify-between items-center">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search exam name or heading..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50/70 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-1 focus:ring-emerald-500 focus:border-emerald-600 focus:bg-white transition-all"
          />
        </div>
        <div className="text-xs text-slate-500">
          Showing <span className="font-bold text-slate-700">{filtered.length}</span> entries
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-[#effaf2] border-b-2 border-[#c8ebd2] text-[#14532d] font-extrabold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3.5 px-4 w-16 text-center text-emerald-700">Sr. No.</th>
                <th className="py-3.5 px-4">Exam Name</th>
                <th className="py-3.5 px-4">Heading</th>
                <th className="py-3.5 px-4">Description</th>
                <th className="py-3.5 px-4">Header View</th>
                <th className="py-3.5 px-4">Position</th>
                <th className="py-3.5 px-4">Image</th>
                <th className="py-3.5 px-4">SEO</th>
                <th className="py-3.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-emerald-700" />
                    Loading exams...
                  </td>
                </tr>
              ) : paginated.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400 font-medium">
                    No data found
                  </td>
                </tr>
              ) : (
                paginated.map((item, index) => {
                  const thumb = getStorageUrl(item.thumbnail_path || item.imgpath);
                  return (
                    <tr key={item.id} className="hover:bg-[#f6fcf8] transition-colors">
                      <td className="py-3.5 px-4 text-center font-bold text-emerald-700">
                        {(currentPage - 1) * itemsPerPage + index + 1}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-800">
                        {item.page_name || item.name}
                      </td>
                      <td className="py-3.5 px-4 font-medium text-slate-700 max-w-xs text-xs">
                        {item.headline || '-'}
                      </td>
                      <td className="py-3.5 px-4">
                        {item.description ? (
                          <button
                            onClick={() => setDescModal(item.description || '')}
                            className="px-2.5 py-1 border border-[#c8ebd2] hover:bg-[#dcfce7] bg-[#effaf2] text-[#14532d] rounded-lg text-xs font-bold transition-colors cursor-pointer"
                          >
                            View
                          </button>
                        ) : (
                          <span className="text-slate-400 text-xs">Null</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-[#effaf2] text-[#14532d] border border-[#c8ebd2] font-bold text-[10px] uppercase">
                          Active
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-xs text-slate-600">
                        {item.position ?? '1'}
                      </td>
                      <td className="py-3.5 px-4">
                        {thumb ? (
                          <a href={thumb} target="_blank" rel="noreferrer">
                            <img src={thumb} alt={item.page_name || 'Exam'} className="h-7 w-7 object-cover rounded-md border border-[#c8ebd2]" />
                          </a>
                        ) : (
                          <span className="text-slate-400 text-xs">N/A</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <button
                          onClick={() => setSeoModal(item)}
                          className="px-2.5 py-1 border border-[#c8ebd2] hover:bg-[#dcfce7] bg-[#effaf2] text-[#14532d] rounded-lg text-xs font-bold transition-colors cursor-pointer"
                        >
                          View
                        </button>
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
                  );
                })
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

      {/* Description View Modal */}
      {descModal !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 w-full max-w-2xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#c8ebd2] bg-[#effaf2]">
              <h3 className="text-sm font-bold text-[#14532d] flex items-center gap-1.5">
                <Eye className="w-4 h-4 text-emerald-700" /> Description
              </h3>
              <button
                onClick={() => setDescModal(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div
              className="p-5 max-h-[70vh] overflow-y-auto text-xs leading-relaxed text-slate-700 prose prose-slate max-w-none"
              dangerouslySetInnerHTML={{ __html: descModal }}
            />
            <div className="p-3 border-t border-slate-100 bg-slate-50/50 flex justify-end">
              <button
                onClick={() => setDescModal(null)}
                className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SEO View Modal */}
      {seoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 w-full max-w-lg overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#c8ebd2] bg-[#effaf2]">
              <h3 className="text-sm font-bold text-[#14532d] flex items-center gap-1.5">
                <Globe className="w-4 h-4 text-emerald-700" /> SEO Details - {seoModal.page_name || seoModal.name}
              </h3>
              <button
                onClick={() => setSeoModal(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-5 space-y-3 text-xs text-slate-600">
              <div>
                <span className="font-bold text-slate-700 block mb-0.5">Meta Title:</span>
                <p className="bg-slate-50 p-2 rounded-xl border border-slate-200 font-mono text-[11px]">
                  {seoModal.meta_title || 'N/A'}
                </p>
              </div>
              <div>
                <span className="font-bold text-slate-700 block mb-0.5">Meta Keyword:</span>
                <p className="bg-slate-50 p-2 rounded-xl border border-slate-200 font-mono text-[11px]">
                  {seoModal.meta_keyword || 'N/A'}
                </p>
              </div>
              <div>
                <span className="font-bold text-slate-700 block mb-0.5">Meta Description:</span>
                <p className="bg-slate-50 p-2 rounded-xl border border-slate-200 font-mono text-[11px]">
                  {seoModal.meta_description || 'N/A'}
                </p>
              </div>
              <div className="grid grid-cols-3 gap-2 pt-1">
                <div>
                  <span className="font-bold text-slate-700 block mb-0.5">Seo Rating:</span>
                  <span className="px-2 py-1 bg-[#effaf2] text-[#14532d] border border-[#c8ebd2] rounded-lg font-bold block text-center">
                    {seoModal.seo_rating || 'N/A'}
                  </span>
                </div>
                <div>
                  <span className="font-bold text-slate-700 block mb-0.5">Best Rating:</span>
                  <span className="px-2 py-1 bg-[#effaf2] text-[#14532d] border border-[#c8ebd2] rounded-lg font-bold block text-center">
                    {seoModal.best_rating || 'N/A'}
                  </span>
                </div>
                <div>
                  <span className="font-bold text-slate-700 block mb-0.5">Reviews:</span>
                  <span className="px-2 py-1 bg-[#effaf2] text-[#14532d] border border-[#c8ebd2] rounded-lg font-bold block text-center">
                    {seoModal.review_number || 'N/A'}
                  </span>
                </div>
              </div>
            </div>
            <div className="p-3 border-t border-slate-100 bg-slate-50/50 flex justify-end">
              <button
                onClick={() => setSeoModal(null)}
                className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
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
