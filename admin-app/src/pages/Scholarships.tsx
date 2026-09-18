import React, { useEffect, useState, useRef } from 'react';
import { confirmDelete } from '@/lib/swal';
import Pagination from '@/components/common/Pagination';
import { getStorageUrl } from '@/lib/uploadHelper';
import {
  GraduationCap,
  Search,
  Edit2,
  Trash2,
  Loader2,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Plus,
  Image as ImageIcon,
  FileText,
  HelpCircle,
  RotateCcw,
  X,
  Globe
} from 'lucide-react';

interface ScholarshipItem {
  id: number;
  title: string;
  slug?: string;
  type?: string;
  active_status?: string | number;
  page_type?: string;
  landing_page_link?: string;
  thumbnail_name?: string;
  thumbnail_path?: string;
  og_image_name?: string;
  og_image_path?: string;
  shortnote?: string;
  meta_title?: string;
  meta_description?: string;
  meta_keyword?: string;
  seo_rating?: string;
  best_rating?: string;
  review_number?: string;
  contents_count?: number;
  faqs_count?: number;
  created_at?: string;
}

export default function Scholarships() {
  const [items, setItems] = useState<ScholarshipItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Form toggle state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'main' | 'seo'>('main');
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // View Modals
  const [shortnoteModal, setShortnoteModal] = useState<string | null>(null);
  const [seoModal, setSeoModal] = useState<ScholarshipItem | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    type: 'university',
    active_status: '1',
    page_type: 'scholarship_page',
    landing_page_link: '',
    shortnote: '',
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
      const res = await fetch('/api/v1/admin/scholarships');
      if (res.ok) {
        const json = await res.json();
        if (json.status || json.success) {
          setItems(json.data || []);
        } else {
          setItems([]);
        }
      } else {
        setItems([]);
      }
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenAdd = () => {
    setEditingId(null);
    setActiveTab('main');
    setFormData({
      title: '',
      slug: '',
      type: 'university',
      active_status: '1',
      page_type: 'scholarship_page',
      landing_page_link: '',
      shortnote: '',
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

  const handleOpenEdit = (item: ScholarshipItem) => {
    setEditingId(item.id);
    setActiveTab('main');
    setFormData({
      title: item.title || '',
      slug: item.slug || '',
      type: item.type || 'university',
      active_status: String(item.active_status ?? '1'),
      page_type: item.page_type || 'scholarship_page',
      landing_page_link: item.landing_page_link || '',
      shortnote: item.shortnote || '',
      meta_title: item.meta_title || '',
      meta_keyword: item.meta_keyword || '',
      meta_description: item.meta_description || '',
      seo_rating: item.seo_rating || '',
      best_rating: item.best_rating || '',
      review_number: item.review_number || '',
    });
    setExistingThumbnail(item.thumbnail_path || '');
    setExistingOgImage(item.og_image_path || '');
    if (thumbnailRef.current) thumbnailRef.current.value = '';
    if (ogImageRef.current) ogImageRef.current.value = '';
    setIsFormOpen(true);
  };

  const handleReset = () => {
    setFormData({
      title: '',
      slug: '',
      type: 'university',
      active_status: '1',
      page_type: 'scholarship_page',
      landing_page_link: '',
      shortnote: '',
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
    const isConfirmed = await confirmDelete('Are you sure you want to delete this scholarship?');
    if (!isConfirmed) return;

    try {
      const res = await fetch(`/api/v1/admin/scholarships/${id}`, { method: 'DELETE' });
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
    if (!formData.title.trim()) {
      showToast('error', 'Title is required');
      return;
    }

    setSubmitting(true);
    try {
      const payload = new FormData();
      payload.append('title', formData.title);
      payload.append('slug', formData.slug);
      payload.append('active_status', formData.active_status);
      payload.append('type', formData.type);
      payload.append('page_type', formData.page_type);
      payload.append('landing_page_link', formData.landing_page_link);
      payload.append('shortnote', formData.shortnote);
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
        ? `/api/v1/admin/scholarships/${editingId}`
        : '/api/v1/admin/scholarships';
      const method = editingId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        body: payload,
      });

      const json = await res.json();
      if (res.ok && (json.status || json.success)) {
        showToast('success', editingId ? 'Updated successfully' : 'Created successfully');
        setIsFormOpen(false);
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
    (item.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (item.type || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (item.slug || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const paginated = filtered.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="space-y-5 max-w-[1600px] mx-auto pb-8">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl text-xs font-semibold text-white animate-in slide-in-from-bottom-5 duration-200 ${
            toast.type === 'success' ? 'bg-stone-900 border border-emerald-500/40' : 'bg-rose-900 border border-rose-500/40'
          }`}
        >
          {toast.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <AlertCircle className="w-4 h-4 text-rose-400" />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* ── CLASSIC EDITORIAL HEADER ── */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-stone-200/90 shadow-xs relative overflow-hidden">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-1.5 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-900 text-[11px] font-bold tracking-wider uppercase">
                <GraduationCap className="w-3 h-3 text-amber-700" />
                <span>Financial Aid & Grants</span>
              </span>
              <span className="text-[11px] font-bold text-stone-600 bg-stone-100 px-2.5 py-0.5 rounded-full border border-stone-200">
                Malaysia Schemes
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight font-serif">
              Scholarships & Grants
            </h1>
            <p className="text-xs sm:text-sm text-stone-500 font-medium leading-relaxed">
              Manage university tuition waivers, government bursaries, merit grants, eligibility guidelines, and application links.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              onClick={fetchData}
              disabled={loading}
              className="p-2.5 rounded-xl border border-stone-200 bg-stone-50/70 hover:bg-stone-100 text-stone-700 transition-colors cursor-pointer disabled:opacity-50 shadow-2xs"
              title="Refresh scholarships"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-stone-600' : ''}`} />
            </button>

            <button
              onClick={() => {
                if (isFormOpen && !editingId) {
                  setIsFormOpen(false);
                } else {
                  handleOpenAdd();
                }
              }}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs shadow-md shadow-stone-900/15 transition-all cursor-pointer"
            >
              {isFormOpen ? <X className="w-4 h-4 text-amber-300" /> : <Plus className="w-4 h-4 text-amber-300" />}
              <span>{isFormOpen ? 'Close Form' : 'Add Scholarship'}</span>
            </button>
          </div>
        </div>

        {/* ── CLASSIC METRIC STAT CARDS ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 mt-6 pt-6 border-t border-stone-100">
          <div className="p-3.5 rounded-2xl bg-[#faf8f4] border border-stone-200/80">
            <div className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">Total Schemes</div>
            <div className="text-2xl font-black text-stone-900 tracking-tight mt-0.5">
              {loading ? '...' : items.length}
            </div>
            <div className="text-[10.5px] font-semibold text-stone-600 mt-1">Listed grants</div>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#faf8f4] border border-stone-200/80">
            <div className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">Active Published</div>
            <div className="text-2xl font-black text-emerald-800 tracking-tight mt-0.5">
              {loading ? '...' : items.filter((s) => String(s.active_status) === '1').length}
            </div>
            <div className="text-[10.5px] font-semibold text-emerald-700 mt-1">Live applications</div>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#faf8f4] border border-stone-200/80">
            <div className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">University Types</div>
            <div className="text-2xl font-black text-amber-800 tracking-tight mt-0.5">
              {loading ? '...' : items.filter((s) => (s.type || '').toLowerCase() === 'university').length}
            </div>
            <div className="text-[10.5px] font-semibold text-amber-700 mt-1">Direct institutional</div>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#faf8f4] border border-stone-200/80">
            <div className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">General Schemes</div>
            <div className="text-2xl font-black text-indigo-900 tracking-tight mt-0.5">
              {loading ? '...' : items.filter((s) => (s.type || '').toLowerCase() !== 'university').length}
            </div>
            <div className="text-[10.5px] font-semibold text-indigo-700 mt-1">External / merit</div>
          </div>
        </div>
      </div>

      {/* Form Card (Top) */}
      {isFormOpen && (
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden animate-fadeIn">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
            <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
              {editingId ? <Edit2 className="w-4 h-4 text-indigo-600" /> : <Plus className="w-4 h-4 text-indigo-600" />}
              {editingId ? 'Update Scholarship Record' : 'Add New Scholarship Record'}
            </h2>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setActiveTab('main')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${activeTab === 'main' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
              >
                General Details
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('seo')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${activeTab === 'seo' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
              >
                SEO Fields
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {activeTab === 'main' ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                      Enter Title <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Enter Title"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                      Enter Slug
                    </label>
                    <input
                      type="text"
                      placeholder="Enter Slug (Auto-generated if empty)"
                      value={formData.slug}
                      onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                      className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                      Active Status
                    </label>
                    <select
                      value={formData.active_status}
                      onChange={(e) => setFormData({ ...formData, active_status: e.target.value })}
                      className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
                    >
                      <option value="1">Active</option>
                      <option value="0">Inactive</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                      Enter Type
                    </label>
                    <input
                      type="text"
                      placeholder="Enter Type (e.g. University, Government)"
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                      className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                      Page Type
                    </label>
                    <select
                      value={formData.page_type}
                      onChange={(e) => setFormData({ ...formData, page_type: e.target.value })}
                      className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
                    >
                      <option value="scholarship_page">Scholarship Page</option>
                      <option value="landing_page">Landing Page</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                      Upload Thumbnail
                    </label>
                    <input
                      type="file"
                      ref={thumbnailRef}
                      accept="image/*"
                      className="w-full text-xs text-slate-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-slate-200 file:text-slate-700 hover:file:bg-slate-300 cursor-pointer border border-slate-200 rounded-lg bg-slate-50"
                    />
                    {existingThumbnail && (
                      <div className="mt-1 flex items-center gap-2">
                        <img src={existingThumbnail} alt="Thumbnail" className="h-6 w-6 object-cover rounded border" />
                        <span className="text-[11px] text-slate-500 truncate font-mono">{existingThumbnail}</span>
                      </div>
                    )}
                  </div>
                </div>

                {formData.page_type === 'landing_page' && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                      Enter Landing Page Link
                    </label>
                    <input
                      type="text"
                      placeholder="Enter Landing Page Link (e.g. /study-in-malaysia)"
                      value={formData.landing_page_link}
                      onChange={(e) => setFormData({ ...formData, landing_page_link: e.target.value })}
                      className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                    Shortnote
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Enter shortnote..."
                    value={formData.shortnote}
                    onChange={(e) => setFormData({ ...formData, shortnote: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all resize-none"
                  />
                </div>
              </>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
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
                    <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                      Meta Keywords
                    </label>
                    <input
                      type="text"
                      placeholder="Enter Meta Keywords"
                      value={formData.meta_keyword}
                      onChange={(e) => setFormData({ ...formData, meta_keyword: e.target.value })}
                      className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                    Meta Description
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Enter Meta Description"
                    value={formData.meta_description}
                    onChange={(e) => setFormData({ ...formData, meta_description: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all resize-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                      SEO Rating
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 4.8"
                      value={formData.seo_rating}
                      onChange={(e) => setFormData({ ...formData, seo_rating: e.target.value })}
                      className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                      Best Rating
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 5.0"
                      value={formData.best_rating}
                      onChange={(e) => setFormData({ ...formData, best_rating: e.target.value })}
                      className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                      Review Number
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 120"
                      value={formData.review_number}
                      onChange={(e) => setFormData({ ...formData, review_number: e.target.value })}
                      className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                      Upload OG Image
                    </label>
                    <input
                      type="file"
                      ref={ogImageRef}
                      accept="image/*"
                      className="w-full text-xs text-slate-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-slate-200 file:text-slate-700 hover:file:bg-slate-300 cursor-pointer border border-slate-200 rounded-lg bg-slate-50"
                    />
                    {existingOgImage && (
                      <div className="mt-1 flex items-center gap-2">
                        <img src={existingOgImage} alt="OG Image" className="h-6 w-6 object-cover rounded border" />
                        <span className="text-[11px] text-slate-500 truncate font-mono">{existingOgImage}</span>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={handleReset}
                className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <RotateCcw className="w-4 h-4" /> Reset
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsFormOpen(false);
                  setEditingId(null);
                }}
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex items-center gap-2 px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium shadow-sm transition-colors disabled:opacity-50"
              >
                {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                {editingId ? 'Update Record' : 'Submit'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ── SEARCH & FILTER CONTROLS ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-stone-200/90 shadow-xs">
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search title, type, or slug..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-stone-50/70 border border-stone-200/90 rounded-xl pl-10 pr-8 py-2 text-xs font-medium text-stone-800 placeholder-stone-400 focus:outline-none focus:border-amber-600 focus:bg-white focus:ring-2 focus:ring-amber-500/20 transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 text-stone-400 hover:text-stone-700 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="px-3 py-2 rounded-xl text-xs font-bold text-amber-800 hover:bg-amber-50 cursor-pointer transition-colors"
            >
              Reset Search
            </button>
          )}
        </div>

        <div className="flex items-center gap-3 text-xs font-semibold text-stone-500 shrink-0">
          <span>Showing</span>
          <span className="px-2.5 py-1 rounded-lg bg-stone-100 font-bold text-stone-900 border border-stone-200">
            {filtered.length} {filtered.length === 1 ? 'Scholarship' : 'Scholarships'}
          </span>
        </div>
      </div>

      {/* ── MAIN DATA TABLE ── */}
      <div className="bg-white rounded-3xl border border-stone-200/90 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#faf8f4] border-b border-stone-200 text-stone-600 font-black uppercase tracking-wider text-[10.5px]">
                <th className="py-4 px-4 w-12 text-center">#</th>
                <th className="py-4 px-4 min-w-[240px]">Scholarship Title</th>
                <th className="py-4 px-4 min-w-[120px]">Scheme Type</th>
                <th className="py-4 px-4 text-center min-w-[110px]">Active Status</th>
                <th className="py-4 px-4 min-w-[130px]">Media Assets</th>
                <th className="py-4 px-4 min-w-[110px]">Shortnote</th>
                <th className="py-4 px-4 min-w-[100px]">SEO Meta</th>
                <th className="py-4 px-4 min-w-[140px]">Content Modules</th>
                <th className="py-4 px-4 text-right w-24">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 font-medium text-stone-700">
              {loading ? (
                <tr>
                  <td colSpan={9} className="py-16 text-center text-stone-400">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto text-amber-700 mb-2" />
                    <p className="text-xs font-bold text-stone-700">Loading scholarships...</p>
                  </td>
                </tr>
              ) : paginated.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-16 text-center text-stone-400">
                    <p className="text-sm font-black text-stone-800 font-serif">No Scholarships Found</p>
                    <p className="text-xs text-stone-500 mt-1">Try searching another term or add a new scholarship scheme.</p>
                  </td>
                </tr>
              ) : (
                paginated.map((item, index) => (
                  <tr key={item.id} className="hover:bg-[#fbfaf7] transition-colors group">
                    <td className="py-4 px-4 text-center font-bold text-stone-400 font-mono text-[11px]">
                      {(currentPage - 1) * itemsPerPage + index + 1}
                    </td>

                    <td className="py-4 px-4">
                      <div className="font-extrabold text-stone-900 text-xs sm:text-sm leading-snug hover:text-amber-800 transition-colors">
                        {item.title}
                      </div>
                      {item.slug && (
                        <div className="text-[10.5px] font-mono text-stone-400 mt-0.5 truncate max-w-xs">
                          /{item.slug}
                        </div>
                      )}
                    </td>

                    <td className="py-4 px-4">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10.5px] font-bold bg-amber-50 text-amber-900 capitalize border border-amber-200/60">
                        {item.type || 'N/A'}
                      </span>
                    </td>

                    <td className="py-4 px-4 text-center">
                      {String(item.active_status) === '1' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-stone-100 text-stone-600 border border-stone-200">
                          Inactive
                        </span>
                      )}
                    </td>

                    <td className="py-4 px-4 text-xs">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5">
                          <span className="text-stone-400 text-[11px]">Thumb:</span>
                          {item.thumbnail_path ? (
                            <a
                              href={getStorageUrl(item.thumbnail_path)}
                              target="_blank"
                              rel="noreferrer"
                              className="text-amber-800 font-bold hover:underline flex items-center gap-0.5 text-[11px]"
                            >
                              <span>View</span>
                              <ImageIcon className="w-3 h-3 text-amber-700" />
                            </a>
                          ) : (
                            <span className="text-stone-400">—</span>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-stone-400 text-[11px]">OG:</span>
                          {item.og_image_path ? (
                            <a
                              href={getStorageUrl(item.og_image_path)}
                              target="_blank"
                              rel="noreferrer"
                              className="text-amber-800 font-bold hover:underline flex items-center gap-0.5 text-[11px]"
                            >
                              <span>View</span>
                              <ImageIcon className="w-3 h-3 text-amber-700" />
                            </a>
                          ) : (
                            <span className="text-stone-400">—</span>
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-4">
                      {item.shortnote ? (
                        <button
                          onClick={() => setShortnoteModal(item.shortnote || '')}
                          className="px-2.5 py-1 bg-stone-100 hover:bg-stone-200 text-stone-800 border border-stone-200/80 rounded-lg text-[10.5px] font-bold transition-colors cursor-pointer shadow-2xs"
                        >
                          View Text
                        </button>
                      ) : (
                        <span className="text-stone-400 text-[11px]">—</span>
                      )}
                    </td>

                    <td className="py-4 px-4">
                      <button
                        onClick={() => setSeoModal(item)}
                        className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200/60 rounded-lg text-[10.5px] font-bold transition-colors flex items-center gap-1 cursor-pointer shadow-2xs"
                      >
                        <Globe className="w-3 h-3 text-amber-700" />
                        <span>SEO</span>
                      </button>
                    </td>

                    <td className="py-4 px-4">
                      <div className="flex flex-col gap-1 text-[10.5px]">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-stone-100 text-stone-700 font-bold w-fit border border-stone-200/60">
                          <FileText className="w-3 h-3 text-stone-500" /> Contents ({item.contents_count ?? 0})
                        </span>
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-50 text-amber-900 font-bold w-fit border border-amber-200/60">
                          <HelpCircle className="w-3 h-3 text-amber-700" /> FAQs ({item.faqs_count ?? 0})
                        </span>
                      </div>
                    </td>

                    <td className="py-4 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenEdit(item)}
                          className="p-1.5 rounded-lg bg-stone-900 hover:bg-stone-800 text-white transition-colors cursor-pointer"
                          title="Edit Scholarship"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="p-1.5 rounded-lg bg-stone-100 hover:bg-rose-50 text-stone-500 hover:text-rose-600 border border-stone-200 transition-colors cursor-pointer"
                          title="Delete Scholarship"
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
        {!loading && filtered.length > itemsPerPage && (
          <div className="p-4 border-t border-stone-100 bg-[#faf8f4]/60">
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

      {/* Shortnote Modal */}
      {shortnoteModal !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-100 w-full max-w-lg overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-slate-50/50">
              <h3 className="text-sm font-bold text-slate-800">Shortnote</h3>
              <button
                onClick={() => setShortnoteModal(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-5 max-h-80 overflow-y-auto text-xs leading-relaxed text-slate-600">
              {shortnoteModal}
            </div>
            <div className="p-3 border-t border-slate-100 bg-slate-50/50 flex justify-end">
              <button
                onClick={() => setShortnoteModal(null)}
                className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded text-xs font-medium transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SEO View Modal */}
      {seoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-100 w-full max-w-lg overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-slate-50/50">
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                <Globe className="w-4 h-4 text-indigo-600" /> SEO Details - {seoModal.title}
              </h3>
              <button
                onClick={() => setSeoModal(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-5 space-y-3 text-xs text-slate-600">
              <div>
                <span className="font-semibold text-slate-700 block mb-0.5">Meta Title:</span>
                <p className="bg-slate-50 p-2 rounded border border-slate-200 font-mono text-[11px]">
                  {seoModal.meta_title || 'N/A'}
                </p>
              </div>
              <div>
                <span className="font-semibold text-slate-700 block mb-0.5">Meta Keywords:</span>
                <p className="bg-slate-50 p-2 rounded border border-slate-200 font-mono text-[11px]">
                  {seoModal.meta_keyword || 'N/A'}
                </p>
              </div>
              <div>
                <span className="font-semibold text-slate-700 block mb-0.5">Meta Description:</span>
                <p className="bg-slate-50 p-2 rounded border border-slate-200 font-mono text-[11px]">
                  {seoModal.meta_description || 'N/A'}
                </p>
              </div>
              <div className="grid grid-cols-3 gap-2 pt-1">
                <div>
                  <span className="font-semibold text-slate-700 block mb-0.5">SEO Rating:</span>
                  <span className="px-2 py-1 bg-slate-100 rounded text-slate-800 font-semibold block text-center">
                    {seoModal.seo_rating || 'N/A'}
                  </span>
                </div>
                <div>
                  <span className="font-semibold text-slate-700 block mb-0.5">Best Rating:</span>
                  <span className="px-2 py-1 bg-slate-100 rounded text-slate-800 font-semibold block text-center">
                    {seoModal.best_rating || 'N/A'}
                  </span>
                </div>
                <div>
                  <span className="font-semibold text-slate-700 block mb-0.5">Reviews:</span>
                  <span className="px-2 py-1 bg-slate-100 rounded text-slate-800 font-semibold block text-center">
                    {seoModal.review_number || 'N/A'}
                  </span>
                </div>
              </div>
            </div>
            <div className="p-3 border-t border-slate-100 bg-slate-50/50 flex justify-end">
              <button
                onClick={() => setSeoModal(null)}
                className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded text-xs font-medium transition-colors"
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
