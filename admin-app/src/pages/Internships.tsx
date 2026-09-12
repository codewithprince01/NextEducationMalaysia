import React, { useEffect, useState } from 'react';
import { confirmDelete } from '@/lib/swal';
import Pagination from '@/components/common/Pagination';
import RichTextEditor from '@/components/common/RichTextEditor';
import {
  Search,
  Edit2,
  Trash2,
  Loader2,
  X,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Award,
  Globe,
  ChevronDown,
  ChevronUp,
  HelpCircle,
  Layers,
  Image as ImageIcon
} from 'lucide-react';

interface InternshipItem {
  id: number;
  title: string;
  slug: string;
  active_status?: string | number;
  thumbnail_name?: string;
  thumbnail_path?: string;
  shortnote?: string;
  website?: string;
  meta_title?: string;
  meta_keyword?: string;
  meta_description?: string;
  seo_rating?: string;
  best_rating?: string;
  review_number?: string;
  og_image_name?: string;
  og_image_path?: string;
  contents_count?: number;
  faqs_count?: number;
  created_at?: string;
}

interface InternshipContentItem {
  id: number;
  internship_id: number;
  tab: string;
  description: string;
  position: number;
}

interface InternshipFaqItem {
  id: number;
  internship_id: number;
  question: string;
  answer: string;
}

export default function Internships() {
  const [items, setItems] = useState<InternshipItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Form state for Add/Update
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formOpen, setFormOpen] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    active_status: 'LIVE',
    thumbnail_path: '',
    shortnote: '',
    meta_title: '',
    meta_keyword: '',
    meta_description: '',
    seo_rating: '',
    best_rating: '',
    review_number: '',
    og_image_path: '',
  });

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // View Modals
  const [shortnoteModalItem, setShortnoteModalItem] = useState<InternshipItem | null>(null);
  const [seoModalItem, setSeoModalItem] = useState<InternshipItem | null>(null);

  // Content Manager Modal
  const [contentManagerItem, setContentManagerItem] = useState<InternshipItem | null>(null);
  const [contentsList, setContentsList] = useState<InternshipContentItem[]>([]);
  const [loadingContents, setLoadingContents] = useState(false);
  const [editingContentId, setEditingContentId] = useState<number | null>(null);
  const [contentFormData, setContentFormData] = useState({ tab: '', description: '', position: 1 });

  // FAQ Manager Modal
  const [faqManagerItem, setFaqManagerItem] = useState<InternshipItem | null>(null);
  const [faqsList, setFaqsList] = useState<InternshipFaqItem[]>([]);
  const [loadingFaqs, setLoadingFaqs] = useState(false);
  const [editingFaqId, setEditingFaqId] = useState<number | null>(null);
  const [faqFormData, setFaqFormData] = useState({ question: '', answer: '' });

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/v1/admin/internships');
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

  const handleResetForm = () => {
    setEditingId(null);
    setFormData({
      title: '',
      slug: '',
      active_status: 'LIVE',
      thumbnail_path: '',
      shortnote: '',
      meta_title: '',
      meta_keyword: '',
      meta_description: '',
      seo_rating: '',
      best_rating: '',
      review_number: '',
      og_image_path: '',
    });
  };

  const handleStartEdit = (item: InternshipItem) => {
    setEditingId(item.id);
    setFormOpen(true);
    setFormData({
      title: item.title || '',
      slug: item.slug || '',
      active_status: item.active_status ? String(item.active_status) : 'LIVE',
      thumbnail_path: item.thumbnail_path || '',
      shortnote: item.shortnote || '',
      meta_title: item.meta_title || '',
      meta_keyword: item.meta_keyword || '',
      meta_description: item.meta_description || '',
      seo_rating: item.seo_rating || '',
      best_rating: item.best_rating || '',
      review_number: item.review_number || '',
      og_image_path: item.og_image_path || '',
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      showToast('error', 'Enter Title is required');
      return;
    }

    setSubmitting(true);
    try {
      const url = editingId
        ? `/api/v1/admin/internships/${editingId}`
        : '/api/v1/admin/internships';
      const method = editingId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const json = await res.json();
      if (res.ok && (json.status || json.success)) {
        showToast('success', editingId ? 'Record has been updated successfully.' : 'Record has been added successfully.');
        handleResetForm();
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

  const handleDelete = async (id: number) => {
    const isConfirmed = await confirmDelete('Are you sure you want to delete this record?');
    if (!isConfirmed) return;

    try {
      const res = await fetch(`/api/v1/admin/internships/${id}`, { method: 'DELETE' });
      const json = await res.json();

      if (res.ok && (json.status || json.success)) {
        showToast('success', 'Record deleted successfully');
        fetchData();
      } else {
        showToast('error', json.message || json.error || 'Failed to delete');
      }
    } catch {
      showToast('error', 'Error deleting record');
    }
  };

  // --- CONTENT MANAGER HANDLERS ---
  const fetchContents = async (internship_id: number) => {
    setLoadingContents(true);
    try {
      const res = await fetch(`/api/v1/admin/internship-contents?internship_id=${internship_id}`);
      if (res.ok) {
        const json = await res.json();
        setContentsList(json.data || []);
        setContentFormData({ tab: '', description: '', position: (json.data || []).length + 1 });
      }
    } catch {
      setContentsList([]);
    } finally {
      setLoadingContents(false);
    }
  };

  const handleOpenContents = (item: InternshipItem) => {
    setContentManagerItem(item);
    setEditingContentId(null);
    fetchContents(item.id);
  };

  const handleSaveContent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contentManagerItem || !contentFormData.tab || !contentFormData.description) return;

    try {
      const url = editingContentId
        ? `/api/v1/admin/internship-contents/${editingContentId}`
        : '/api/v1/admin/internship-contents';
      const method = editingContentId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          internship_id: contentManagerItem.id,
          ...contentFormData,
        }),
      });

      if (res.ok) {
        showToast('success', 'Content saved successfully');
        setEditingContentId(null);
        fetchContents(contentManagerItem.id);
        fetchData();
      }
    } catch {
      showToast('error', 'Error saving content');
    }
  };

  const handleDeleteContent = async (id: number) => {
    if (!confirm('Delete this content entry?')) return;
    try {
      const res = await fetch(`/api/v1/admin/internship-contents/${id}`, { method: 'DELETE' });
      if (res.ok && contentManagerItem) {
        fetchContents(contentManagerItem.id);
        fetchData();
      }
    } catch {
      showToast('error', 'Failed to delete content');
    }
  };

  // --- FAQ MANAGER HANDLERS ---
  const fetchFaqs = async (internship_id: number) => {
    setLoadingFaqs(true);
    try {
      const res = await fetch(`/api/v1/admin/internship-faqs?internship_id=${internship_id}`);
      if (res.ok) {
        const json = await res.json();
        setFaqsList(json.data || []);
        setFaqFormData({ question: '', answer: '' });
      }
    } catch {
      setFaqsList([]);
    } finally {
      setLoadingFaqs(false);
    }
  };

  const handleOpenFaqs = (item: InternshipItem) => {
    setFaqManagerItem(item);
    setEditingFaqId(null);
    fetchFaqs(item.id);
  };

  const handleSaveFaq = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!faqManagerItem || !faqFormData.question || !faqFormData.answer) return;

    try {
      const url = editingFaqId
        ? `/api/v1/admin/internship-faqs/${editingFaqId}`
        : '/api/v1/admin/internship-faqs';
      const method = editingFaqId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          internship_id: faqManagerItem.id,
          ...faqFormData,
        }),
      });

      if (res.ok) {
        showToast('success', 'FAQ saved successfully');
        setEditingFaqId(null);
        fetchFaqs(faqManagerItem.id);
        fetchData();
      }
    } catch {
      showToast('error', 'Error saving FAQ');
    }
  };

  const handleDeleteFaq = async (id: number) => {
    if (!confirm('Delete this FAQ entry?')) return;
    try {
      const res = await fetch(`/api/v1/admin/internship-faqs/${id}`, { method: 'DELETE' });
      if (res.ok && faqManagerItem) {
        fetchFaqs(faqManagerItem.id);
        fetchData();
      }
    } catch {
      showToast('error', 'Failed to delete FAQ');
    }
  };

  // Filtering
  const filtered = items.filter((item) =>
    (item.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (item.slug || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const paginated = filtered.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="space-y-4 max-w-[1600px] mx-auto p-2 sm:p-4">
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

      {/* Header & Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
            <Award className="w-6 h-6 text-blue-600" /> Internships
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage global training-cum-internship programs, content tabs, and FAQs.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchData}
            className="p-2 text-slate-600 hover:text-blue-600 hover:bg-slate-50 rounded-lg border border-slate-200 transition-colors"
            title="Refresh Data"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* ── FORM CARD (Add New / Update Record) ── */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div
          onClick={() => setFormOpen(!formOpen)}
          className="flex items-center justify-between px-5 py-3.5 bg-slate-50/80 border-b border-slate-200/80 cursor-pointer select-none hover:bg-slate-100/60 transition-colors"
        >
          <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
            <span>{editingId ? 'Update Record' : 'Add New Record'}</span>
          </h2>
          <button type="button" className="text-slate-500 p-1 rounded-md hover:bg-slate-200/60">
            {formOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>

        {formOpen && (
          <form onSubmit={handleSubmit} className="p-5 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Enter Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Enter Title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Enter Slug
                </label>
                <input
                  type="text"
                  placeholder="Enter Slug"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Enter Active Status
                </label>
                <input
                  type="text"
                  placeholder="e.g. LIVE"
                  value={formData.active_status}
                  onChange={(e) => setFormData({ ...formData, active_status: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Upload thumbnail
                </label>
                <input
                  type="text"
                  placeholder="Image URL or Path (e.g. /uploads/internships/thumb.jpg)"
                  value={formData.thumbnail_path}
                  onChange={(e) => setFormData({ ...formData, thumbnail_path: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Shortnote
              </label>
              <RichTextEditor
                value={formData.shortnote}
                onChange={(content) => setFormData({ ...formData, shortnote: content })}
                placeholder="Shortnote content..."
              />
            </div>

            <hr className="border-slate-200 my-4" />

            {/* SEO Section */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-blue-600" /> SEO &amp; Meta Information
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Meta Title</label>
                  <input
                    type="text"
                    placeholder="Enter Meta Title"
                    value={formData.meta_title}
                    onChange={(e) => setFormData({ ...formData, meta_title: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Meta Keyword</label>
                  <input
                    type="text"
                    placeholder="Meta Keyword"
                    value={formData.meta_keyword}
                    onChange={(e) => setFormData({ ...formData, meta_keyword: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Meta Description</label>
                <textarea
                  rows={2}
                  placeholder="Meta Description"
                  value={formData.meta_description}
                  onChange={(e) => setFormData({ ...formData, meta_description: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all resize-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Seo Rating</label>
                  <input
                    type="text"
                    placeholder="Seo Rating"
                    value={formData.seo_rating}
                    onChange={(e) => setFormData({ ...formData, seo_rating: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Best Rating</label>
                  <input
                    type="text"
                    placeholder="Best Rating"
                    value={formData.best_rating}
                    onChange={(e) => setFormData({ ...formData, best_rating: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Number of Review</label>
                  <input
                    type="text"
                    placeholder="Total Reviews"
                    value={formData.review_number}
                    onChange={(e) => setFormData({ ...formData, review_number: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Upload OG Image</label>
                  <input
                    type="text"
                    placeholder="OG Image URL"
                    value={formData.og_image_path}
                    onChange={(e) => setFormData({ ...formData, og_image_path: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex items-center gap-2 pt-3">
              <button
                type="button"
                onClick={handleResetForm}
                className="px-3.5 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-xs font-bold transition-colors shadow-xs"
              >
                Reset
              </button>
              {editingId && (
                <button
                  type="button"
                  onClick={handleResetForm}
                  className="px-3.5 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg text-xs font-bold transition-colors shadow-xs"
                >
                  Cancel
                </button>
              )}
              <button
                type="submit"
                disabled={submitting}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-colors shadow-xs disabled:opacity-50 flex items-center gap-1.5"
              >
                {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                {editingId ? 'Update' : 'Submit'}
              </button>
            </div>
          </form>
        )}
      </div>

      {/* ── DATA TABLE CARD ── */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
        {/* Table Search Header */}
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            Show
            <select
              value={itemsPerPage}
              disabled
              className="bg-slate-50 border border-slate-200 rounded px-2 py-1 text-xs text-slate-700"
            >
              <option value={10}>10</option>
            </select>
            entries
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
            />
          </div>
        </div>

        {/* Table Body */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4 w-16">Sr. No.</th>
                <th className="py-3 px-4">Title</th>
                <th className="py-3 px-4">Active Status</th>
                <th className="py-3 px-4">Images</th>
                <th className="py-3 px-4">Shortnote</th>
                <th className="py-3 px-4">Seo</th>
                <th className="py-3 px-4">Contents</th>
                <th className="py-3 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2 text-blue-600" />
                    Loading internship programs...
                  </td>
                </tr>
              ) : paginated.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400 font-medium">
                    No data found
                  </td>
                </tr>
              ) : (
                paginated.map((item, idx) => {
                  const srNo = (currentPage - 1) * itemsPerPage + idx + 1;
                  return (
                    <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4 font-semibold text-slate-500">{srNo}</td>
                      <td className="py-3.5 px-4 font-bold text-slate-800 max-w-xs">{item.title}</td>
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/80">
                          {item.active_status || 'LIVE'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        {item.thumbnail_path ? (
                          <a
                            href={item.thumbnail_path}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded text-xs font-semibold"
                          >
                            <ImageIcon className="w-3 h-3" /> View Image
                          </a>
                        ) : (
                          <span className="text-slate-400">N/A</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <button
                          onClick={() => setShortnoteModalItem(item)}
                          className="px-2.5 py-1 bg-cyan-50 text-cyan-600 border border-cyan-200 hover:bg-cyan-100 rounded text-xs font-bold transition-colors cursor-pointer"
                        >
                          View
                        </button>
                      </td>
                      <td className="py-3.5 px-4">
                        <button
                          onClick={() => setSeoModalItem(item)}
                          className="px-2.5 py-1 bg-sky-50 text-sky-600 border border-sky-200 hover:bg-sky-100 rounded text-xs font-bold transition-colors cursor-pointer"
                        >
                          View
                        </button>
                      </td>
                      <td className="py-3.5 px-4 space-y-1">
                        <div>
                          <button
                            onClick={() => handleOpenContents(item)}
                            className="px-2 py-1 bg-indigo-50 text-indigo-700 border border-indigo-200 hover:bg-indigo-100 rounded text-[11px] font-bold transition-colors inline-flex items-center gap-1 cursor-pointer"
                          >
                            <span>Contents</span>
                            <span className="px-1.5 py-0.2 bg-indigo-600 text-white rounded-full text-[10px]">
                              {item.contents_count ?? 0}
                            </span>
                          </button>
                        </div>
                        <div>
                          <button
                            onClick={() => handleOpenFaqs(item)}
                            className="px-2 py-1 bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 rounded text-[11px] font-bold transition-colors inline-flex items-center gap-1 cursor-pointer"
                          >
                            <span>Faqs</span>
                            <span className="px-1.5 py-0.2 bg-rose-600 text-white rounded-full text-[10px]">
                              {item.faqs_count ?? 0}
                            </span>
                          </button>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => handleStartEdit(item)}
                            className="p-1.5 bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white rounded transition-colors"
                            title="Edit"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="p-1.5 bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white rounded transition-colors"
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

        {/* Pagination Footer */}
        {!loading && filtered.length > 0 && (
          <div className="p-4 border-t border-slate-100 flex items-center justify-between">
            <div className="text-xs text-slate-500">
              Showing { (currentPage - 1) * itemsPerPage + 1 } to { Math.min(currentPage * itemsPerPage, filtered.length) } of { filtered.length } entries
            </div>
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

      {/* ── MODAL: SHORTNOTE VIEW ── */}
      {shortnoteModalItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-100 w-full max-w-lg overflow-hidden animate-fadeIn">
            <div className="flex items-center justify-between px-5 py-3.5 bg-slate-50 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-800">Shortnote Detail</h3>
              <button onClick={() => setShortnoteModalItem(null)} className="text-slate-400 hover:text-slate-600 p-1">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-5 text-xs text-slate-700 space-y-2 max-h-96 overflow-y-auto">
              <h4 className="font-bold text-slate-900 text-sm mb-2">{shortnoteModalItem.title}</h4>
              <div
                className="prose prose-xs max-w-none"
                dangerouslySetInnerHTML={{ __html: shortnoteModalItem.shortnote || '<p class="text-slate-400 italic">No shortnote provided.</p>' }}
              />
            </div>
            <div className="p-3 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setShortnoteModalItem(null)}
                className="px-4 py-1.5 bg-slate-200 text-slate-700 hover:bg-slate-300 rounded text-xs font-bold transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: SEO VIEW ── */}
      {seoModalItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-100 w-full max-w-lg overflow-hidden animate-fadeIn">
            <div className="flex items-center justify-between px-5 py-3.5 bg-slate-50 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <Globe className="w-4 h-4 text-blue-600" /> SEO Details
              </h3>
              <button onClick={() => setSeoModalItem(null)} className="text-slate-400 hover:text-slate-600 p-1">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-5 text-xs text-slate-700 space-y-3">
              <div>
                <span className="font-bold text-slate-500 uppercase block text-[10px]">Meta Title</span>
                <p className="font-semibold text-slate-800">{seoModalItem.meta_title || 'N/A'}</p>
              </div>
              <div>
                <span className="font-bold text-slate-500 uppercase block text-[10px]">Meta Keyword</span>
                <p className="font-medium text-slate-700">{seoModalItem.meta_keyword || 'N/A'}</p>
              </div>
              <div>
                <span className="font-bold text-slate-500 uppercase block text-[10px]">Meta Description</span>
                <p className="font-medium text-slate-700">{seoModalItem.meta_description || 'N/A'}</p>
              </div>
              <div className="grid grid-cols-3 gap-2 bg-slate-50 p-3 rounded-lg border border-slate-100">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Seo Rating</span>
                  <span className="font-bold text-blue-600">{seoModalItem.seo_rating || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Best Rating</span>
                  <span className="font-bold text-emerald-600">{seoModalItem.best_rating || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Reviews</span>
                  <span className="font-bold text-indigo-600">{seoModalItem.review_number || 'N/A'}</span>
                </div>
              </div>
            </div>
            <div className="p-3 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setSeoModalItem(null)}
                className="px-4 py-1.5 bg-slate-200 text-slate-700 hover:bg-slate-300 rounded text-xs font-bold transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: CONTENTS MANAGER ── */}
      {contentManagerItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-100 w-full max-w-3xl overflow-hidden animate-fadeIn flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between px-5 py-3.5 bg-indigo-50/70 border-b border-indigo-100">
              <div>
                <h3 className="text-sm font-bold text-indigo-950 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-indigo-600" /> Internship Contents
                </h3>
                <span className="text-xs text-indigo-700 font-medium">{contentManagerItem.title}</span>
              </div>
              <button onClick={() => setContentManagerItem(null)} className="text-indigo-400 hover:text-indigo-700 p-1">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-5 flex-1">
              {/* Form to Add/Edit Content */}
              <form onSubmit={handleSaveContent} className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                <h4 className="text-xs font-bold text-slate-700 uppercase">
                  {editingContentId ? 'Edit Content Tab' : 'Add Content Tab'}
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Tab Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Overview, Eligibility, Fee Structure"
                      value={contentFormData.tab}
                      onChange={(e) => setContentFormData({ ...contentFormData, tab: e.target.value })}
                      className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Display Order Position</label>
                    <input
                      type="number"
                      required
                      value={contentFormData.position}
                      onChange={(e) => setContentFormData({ ...contentFormData, position: parseInt(e.target.value, 10) || 1 })}
                      className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Tab Description</label>
                  <RichTextEditor
                    value={contentFormData.description}
                    onChange={(val) => setContentFormData({ ...contentFormData, description: val })}
                    placeholder="Detailed content for this tab..."
                  />
                </div>

                <div className="flex justify-end gap-2">
                  {editingContentId && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingContentId(null);
                        setContentFormData({ tab: '', description: '', position: contentsList.length + 1 });
                      }}
                      className="px-3 py-1.5 bg-slate-200 text-slate-700 rounded text-xs font-bold"
                    >
                      Cancel Edit
                    </button>
                  )}
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-indigo-600 text-white rounded text-xs font-bold hover:bg-indigo-700 transition-colors"
                  >
                    {editingContentId ? 'Update Tab' : 'Add Content Tab'}
                  </button>
                </div>
              </form>

              {/* Contents Table */}
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 text-slate-700 font-bold uppercase">
                    <tr>
                      <th className="py-2.5 px-3 w-16">Pos</th>
                      <th className="py-2.5 px-3">Tab</th>
                      <th className="py-2.5 px-3">Description</th>
                      <th className="py-2.5 px-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {loadingContents ? (
                      <tr>
                        <td colSpan={4} className="py-6 text-center text-slate-400">Loading contents...</td>
                      </tr>
                    ) : contentsList.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="py-6 text-center text-slate-400">No contents added yet.</td>
                      </tr>
                    ) : (
                      contentsList.map((c) => (
                        <tr key={c.id} className="hover:bg-slate-50">
                          <td className="py-2.5 px-3 font-bold text-slate-500">{c.position}</td>
                          <td className="py-2.5 px-3 font-bold text-indigo-700">{c.tab}</td>
                          <td className="py-2.5 px-3 text-slate-600 max-w-xs truncate">
                            {c.description.replace(/<[^>]+>/g, '')}
                          </td>
                          <td className="py-2.5 px-3 text-right">
                            <div className="flex justify-end gap-1">
                              <button
                                onClick={() => {
                                  setEditingContentId(c.id);
                                  setContentFormData({ tab: c.tab, description: c.description, position: c.position });
                                }}
                                className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteContent(c.id)}
                                className="p-1 text-rose-600 hover:bg-rose-50 rounded"
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
            </div>

            <div className="p-3 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setContentManagerItem(null)}
                className="px-4 py-1.5 bg-slate-200 text-slate-700 hover:bg-slate-300 rounded text-xs font-bold transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: FAQS MANAGER ── */}
      {faqManagerItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-100 w-full max-w-3xl overflow-hidden animate-fadeIn flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between px-5 py-3.5 bg-rose-50/70 border-b border-rose-100">
              <div>
                <h3 className="text-sm font-bold text-rose-950 flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-rose-600" /> Internship FAQs
                </h3>
                <span className="text-xs text-rose-700 font-medium">{faqManagerItem.title}</span>
              </div>
              <button onClick={() => setFaqManagerItem(null)} className="text-rose-400 hover:text-rose-700 p-1">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-5 flex-1">
              {/* Form to Add/Edit FAQ */}
              <form onSubmit={handleSaveFaq} className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                <h4 className="text-xs font-bold text-slate-700 uppercase">
                  {editingFaqId ? 'Edit FAQ Item' : 'Add FAQ Item'}
                </h4>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Question</label>
                  <input
                    type="text"
                    required
                    placeholder="Enter question..."
                    value={faqFormData.question}
                    onChange={(e) => setFaqFormData({ ...faqFormData, question: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Answer</label>
                  <RichTextEditor
                    value={faqFormData.answer}
                    onChange={(val) => setFaqFormData({ ...faqFormData, answer: val })}
                    placeholder="Enter answer..."
                  />
                </div>

                <div className="flex justify-end gap-2">
                  {editingFaqId && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingFaqId(null);
                        setFaqFormData({ question: '', answer: '' });
                      }}
                      className="px-3 py-1.5 bg-slate-200 text-slate-700 rounded text-xs font-bold"
                    >
                      Cancel Edit
                    </button>
                  )}
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-rose-600 text-white rounded text-xs font-bold hover:bg-rose-700 transition-colors"
                  >
                    {editingFaqId ? 'Update FAQ' : 'Add FAQ'}
                  </button>
                </div>
              </form>

              {/* FAQs Table */}
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 text-slate-700 font-bold uppercase">
                    <tr>
                      <th className="py-2.5 px-3 w-12">#</th>
                      <th className="py-2.5 px-3">Question</th>
                      <th className="py-2.5 px-3">Answer</th>
                      <th className="py-2.5 px-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {loadingFaqs ? (
                      <tr>
                        <td colSpan={4} className="py-6 text-center text-slate-400">Loading FAQs...</td>
                      </tr>
                    ) : faqsList.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="py-6 text-center text-slate-400">No FAQs added yet.</td>
                      </tr>
                    ) : (
                      faqsList.map((f, i) => (
                        <tr key={f.id} className="hover:bg-slate-50">
                          <td className="py-2.5 px-3 font-bold text-slate-400">{i + 1}</td>
                          <td className="py-2.5 px-3 font-bold text-slate-800">{f.question}</td>
                          <td className="py-2.5 px-3 text-slate-600 max-w-xs truncate">
                            {f.answer.replace(/<[^>]+>/g, '')}
                          </td>
                          <td className="py-2.5 px-3 text-right">
                            <div className="flex justify-end gap-1">
                              <button
                                onClick={() => {
                                  setEditingFaqId(f.id);
                                  setFaqFormData({ question: f.question, answer: f.answer });
                                }}
                                className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteFaq(f.id)}
                                className="p-1 text-rose-600 hover:bg-rose-50 rounded"
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
            </div>

            <div className="p-3 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setFaqManagerItem(null)}
                className="px-4 py-1.5 bg-slate-200 text-slate-700 hover:bg-slate-300 rounded text-xs font-bold transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
