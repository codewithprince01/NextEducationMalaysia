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
  Eye,
  EyeOff,
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

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-slate-200/80 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
            <GraduationCap className="w-6 h-6 text-indigo-600" /> Scholarships
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage university grants, merit schemes, scholarship landing links, and SEO metadata.
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
              if (isFormOpen && !editingId) {
                setIsFormOpen(false);
              } else {
                handleOpenAdd();
              }
            }}
            className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium shadow-sm transition-colors"
          >
            {isFormOpen ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            {isFormOpen ? 'Close Form' : 'Add New'}
          </button>
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

      {/* Controls & Search */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row gap-4 justify-between items-center">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search title, type, or slug..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
          />
        </div>
        <div className="text-xs text-slate-500">
          Showing <span className="font-semibold text-slate-700">{filtered.length}</span> entries
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold text-xs uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4 w-16">Sr. No.</th>
                <th className="py-3.5 px-4">Title</th>
                <th className="py-3.5 px-4">Type</th>
                <th className="py-3.5 px-4">Active Status</th>
                <th className="py-3.5 px-4">Images</th>
                <th className="py-3.5 px-4">Shortnote</th>
                <th className="py-3.5 px-4">SEO</th>
                <th className="py-3.5 px-4">Contents</th>
                <th className="py-3.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-indigo-600" />
                    Loading scholarships...
                  </td>
                </tr>
              ) : paginated.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    No data found.
                  </td>
                </tr>
              ) : (
                paginated.map((item, index) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-medium text-slate-500">
                      {(currentPage - 1) * itemsPerPage + index + 1}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-800">
                      <div>{item.title}</div>
                      {item.slug && (
                        <div className="text-[11px] font-mono text-slate-400 font-normal">/{item.slug}</div>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-xs font-semibold capitalize text-indigo-600">
                      {item.type || 'N/A'}
                    </td>
                    <td className="py-3.5 px-4">
                      {String(item.active_status) === '1' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-600 font-bold text-xs">
                          <Eye className="w-3 h-3" /> Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-500 font-bold text-xs">
                          <EyeOff className="w-3 h-3" /> Inactive
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-xs">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5">
                          <span className="text-slate-400">Thumbnail:</span>
                          {item.thumbnail_path ? (
                            <a
                              href={getStorageUrl(item.thumbnail_path)}
                              target="_blank"
                              rel="noreferrer"
                              className="text-indigo-600 hover:underline flex items-center gap-1"
                            >
                              <ImageIcon className="w-3.5 h-3.5" /> View
                            </a>
                          ) : (
                            <span className="text-slate-400">N/A</span>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-slate-400">Og image:</span>
                          {item.og_image_path ? (
                            <a
                              href={getStorageUrl(item.og_image_path)}
                              target="_blank"
                              rel="noreferrer"
                              className="text-indigo-600 hover:underline flex items-center gap-1"
                            >
                              <ImageIcon className="w-3.5 h-3.5" /> View
                            </a>
                          ) : (
                            <span className="text-slate-400">N/A</span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      {item.shortnote ? (
                        <button
                          onClick={() => setShortnoteModal(item.shortnote || '')}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-xs font-medium transition-colors"
                        >
                          View Shortnote
                        </button>
                      ) : (
                        <span className="text-slate-400 text-xs">N/A</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <button
                        onClick={() => setSeoModal(item)}
                        className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded text-xs font-medium transition-colors flex items-center gap-1"
                      >
                        <Globe className="w-3 h-3" /> View SEO
                      </button>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex flex-col gap-1.5">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded bg-blue-50 text-blue-700 text-xs font-semibold w-fit">
                          <FileText className="w-3 h-3" /> Contents ({item.contents_count ?? 0})
                        </span>
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded bg-amber-50 text-amber-700 text-xs font-semibold w-fit">
                          <HelpCircle className="w-3 h-3" /> FAQs ({item.faqs_count ?? 0})
                        </span>
                      </div>
                    </td>
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
