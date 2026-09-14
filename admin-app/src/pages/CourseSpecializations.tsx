import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { confirmDelete } from '@/lib/swal';
import Pagination from '@/components/common/Pagination';
import RichTextEditor from '@/components/common/RichTextEditor';
import {
  GraduationCap,
  Plus,
  Search,
  Edit2,
  Trash2,
  Loader2,
  X,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  FileText,
  HelpCircle,
  Eye,
  Download,
  Upload,
  User,
  Tag,
  ExternalLink,
  Layers
} from 'lucide-react';

interface SpecializationItem {
  id: number;
  name: string;
  slug: string;
  course_category_id?: number;
  category_name?: string;
  author_id?: number;
  author_name?: string;
  shortnote?: string;
  icon_class?: string;
  courses_description?: string;
  meta_title?: string;
  meta_description?: string;
  meta_keyword?: string;
  seo_rating?: string;
  best_rating?: string;
  review_number?: string;
  thumbnail_path?: string;
  banner_path?: string;
  content_image_path?: string;
  og_image_path?: string;
  status?: number;
  contents_count?: number;
  faqs_count?: number;
  levels_count?: number;
  created_at?: string;
}

interface CategoryOption {
  id: number;
  name: string;
}

interface AuthorOption {
  id: number;
  name: string;
}

interface FaqItem {
  id?: number;
  specialization_id: number;
  question: string;
  answer: string;
  position: number;
}

export default function CourseSpecializations() {
  const navigate = useNavigate();
  const [specializations, setSpecializations] = useState<SpecializationItem[]>([]);
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [authors, setAuthors] = useState<AuthorOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Pagination State (20 per page)
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  // Main Add / Edit Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<'basic' | 'seo' | 'images'>('basic');

  const [formData, setFormData] = useState({
    name: '',
    course_category_id: '',
    author_id: '',
    shortnote: '',
    icon_class: '',
    courses_description: '',
    meta_title: '',
    meta_description: '',
    meta_keyword: '',
    seo_rating: '',
    best_rating: '',
    review_number: '',
    thumbnail_path: '',
    banner_path: '',
    content_image_path: '',
    og_image_path: '',
    status: 1,
  });

  // Preview Modals
  const [previewSeo, setPreviewSeo] = useState<SpecializationItem | null>(null);
  const [previewImage, setPreviewImage] = useState<{ title: string; url: string } | null>(null);

  // FAQs Sub-module Modal
  const [faqModalItem, setFaqModalItem] = useState<SpecializationItem | null>(null);
  const [faqs, setFaqs] = useState<FaqItem[]>([]);
  const [loadingFaqs, setLoadingFaqs] = useState(false);
  const [faqFormData, setFaqFormData] = useState<{ question: string; answer: string }>({ question: '', answer: '' });
  const [editingFaqId, setEditingFaqId] = useState<number | null>(null);

  // Excel Import State
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  const handleDownloadFormat = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      'course_category_id,specialization_name,courses_description\n' +
      '"17","Software Engineering","Specialized training in software development, cloud systems, and system design."\n' +
      '"17","Biotechnology","Rigorous theoretical grounding along with practical lab-based training in genetics."';
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'course_specialization_import_format.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImport = async () => {
    if (!importFile) {
      showToast('error', 'Please choose an Excel or CSV file first');
      return;
    }
    setImporting(true);
    try {
      const formData = new FormData();
      formData.append('file', importFile);

      const res = await fetch('/api/v1/admin/course-specializations/import', {
        method: 'POST',
        body: formData,
      });

      const json = await res.json();
      if (res.ok && json.status) {
        showToast('success', json.message || 'Import successful');
        setImportFile(null);
        fetchData();
      } else {
        showToast('error', json.message || 'Import failed');
      }
    } catch {
      showToast('error', 'Network error during import');
    } finally {
      setImporting(false);
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const [specRes, catRes, authRes] = await Promise.all([
        fetch('/api/v1/admin/course-specializations'),
        fetch('/api/v1/admin/course-categories'),
        fetch('/api/v1/admin/authors'),
      ]);

      const specJson = await specRes.json();
      const catJson = await catRes.json();
      const authJson = await authRes.json();

      if (specRes.ok && specJson.status) {
        setSpecializations(specJson.data || []);
      }
      if (catRes.ok && catJson.status) {
        setCategories(catJson.data || []);
      }
      if (authRes.ok && authJson.data) {
        setAuthors(authJson.data || []);
      }
    } catch {
      showToast('error', 'Connection error while fetching specializations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Export to CSV
  const handleExportCSV = () => {
    if (specializations.length === 0) return;

    const headers = ['ID', 'Specialization Name', 'Slug', 'Category', 'Author', 'Status', 'Contents Count', 'FAQs Count', 'Levels Count'];
    const rows = specializations.map((s) => [
      s.id,
      `"${(s.name || '').replace(/"/g, '""')}"`,
      s.slug,
      `"${(s.category_name || '').replace(/"/g, '""')}"`,
      `"${(s.author_name || '').replace(/"/g, '""')}"`,
      s.status === 1 ? 'Active' : 'Inactive',
      s.contents_count || 0,
      s.faqs_count || 0,
      s.levels_count || 0,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `course_specializations_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Open Add Modal
  const handleOpenAddModal = () => {
    setEditingId(null);
    setActiveTab('basic');
    setFormData({
      name: '',
      course_category_id: categories.length > 0 ? String(categories[0].id) : '',
      author_id: authors.length > 0 ? String(authors[0].id) : '',
      shortnote: '',
      icon_class: '',
      courses_description: '',
      meta_title: '',
      meta_description: '',
      meta_keyword: '',
      seo_rating: '',
      best_rating: '',
      review_number: '',
      thumbnail_path: '',
      banner_path: '',
      content_image_path: '',
      og_image_path: '',
      status: 1,
    });
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEditModal = (item: SpecializationItem) => {
    setEditingId(item.id);
    setActiveTab('basic');
    setFormData({
      name: item.name || '',
      course_category_id: item.course_category_id ? String(item.course_category_id) : '',
      author_id: item.author_id ? String(item.author_id) : '',
      shortnote: item.shortnote || '',
      icon_class: item.icon_class || '',
      courses_description: item.courses_description || '',
      meta_title: item.meta_title || '',
      meta_description: item.meta_description || '',
      meta_keyword: item.meta_keyword || '',
      seo_rating: item.seo_rating || '',
      best_rating: item.best_rating || '',
      review_number: item.review_number || '',
      thumbnail_path: item.thumbnail_path || '',
      banner_path: item.banner_path || '',
      content_image_path: item.content_image_path || '',
      og_image_path: item.og_image_path || '',
      status: item.status !== undefined ? item.status : 1,
    });
    setIsModalOpen(true);
  };

  // Submit Main Add / Edit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      showToast('error', 'Specialization name is required');
      return;
    }

    setSubmitting(true);
    try {
      const url = editingId
        ? `/api/v1/admin/course-specializations/${editingId}`
        : '/api/v1/admin/course-specializations';
      const method = editingId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const json = await res.json();
      if (res.ok && json.status) {
        showToast('success', editingId ? 'Specialization updated successfully' : 'Specialization created successfully');
        setIsModalOpen(false);
        fetchData();
      } else {
        showToast('error', json.message || 'Action failed');
      }
    } catch {
      showToast('error', 'Connection error occurred');
    } finally {
      setSubmitting(false);
    }
  };

  // Delete Specialization
  const handleDelete = async (id: number, name: string) => {
    const isConfirmed = await confirmDelete(
      'Delete Course Specialization?',
      `Are you sure you want to delete specialization "${name}"? This action cannot be undone.`
    );
    if (!isConfirmed) return;

    try {
      const res = await fetch(`/api/v1/admin/course-specializations/${id}`, { method: 'DELETE' });
      const json = await res.json();
      if (res.ok && json.status) {
        showToast('success', `Specialization "${name}" deleted successfully`);
        fetchData();
      } else {
        showToast('error', json.message || 'Failed to delete specialization');
      }
    } catch {
      showToast('error', 'Connection error while deleting specialization');
    }
  };

  // -------------------------------------------------------------
  // SUB-MODULE: Manage Specialization FAQs
  // -------------------------------------------------------------
  const handleOpenFaqsModal = async (item: SpecializationItem) => {
    setFaqModalItem(item);
    setLoadingFaqs(true);
    setEditingFaqId(null);
    setFaqFormData({ question: '', answer: '' });
    try {
      const res = await fetch(`/api/v1/admin/course-specialization-faqs?specialization_id=${item.id}`);
      const json = await res.json();
      if (res.ok && json.data) {
        setFaqs(json.data || []);
      } else {
        setFaqs([]);
      }
    } catch {
      showToast('error', 'Failed to load FAQs');
    } finally {
      setLoadingFaqs(false);
    }
  };

  const handleSaveFaq = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!faqModalItem || !faqFormData.question.trim()) return;

    try {
      const url = editingFaqId
        ? `/api/v1/admin/course-specialization-faqs/${editingFaqId}`
        : '/api/v1/admin/course-specialization-faqs';
      const method = editingFaqId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          specialization_id: faqModalItem.id,
          question: faqFormData.question,
          answer: faqFormData.answer,
        }),
      });

      const json = await res.json();
      if (res.ok && json.status) {
        showToast('success', editingFaqId ? 'FAQ updated' : 'FAQ created');
        setFaqFormData({ question: '', answer: '' });
        setEditingFaqId(null);
        handleOpenFaqsModal(faqModalItem);
        fetchData();
      } else {
        showToast('error', json.message || 'Failed to save FAQ');
      }
    } catch {
      showToast('error', 'Network error while saving FAQ');
    }
  };

  const handleDeleteFaq = async (id: number) => {
    const isConfirmed = await confirmDelete('Delete FAQ?', 'Are you sure you want to delete this FAQ item?');
    if (!isConfirmed) return;

    try {
      const res = await fetch(`/api/v1/admin/course-specialization-faqs/${id}`, { method: 'DELETE' });
      const json = await res.json();
      if (res.ok && json.status) {
        showToast('success', 'FAQ deleted successfully');
        if (faqModalItem) handleOpenFaqsModal(faqModalItem);
        fetchData();
      }
    } catch {
      showToast('error', 'Failed to delete FAQ');
    }
  };

  // Search Filter & Pagination
  const filtered = specializations.filter(
    (item) =>
      item.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.slug?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.author_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginated = filtered.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="space-y-3">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-xl text-xs font-semibold text-white animate-in slide-in-from-bottom-5 duration-200 ${
            toast.type === 'success' ? 'bg-emerald-600' : 'bg-rose-600'
          }`}
        >
          {toast.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-cyan-50 border border-cyan-100 flex items-center justify-center text-cyan-600 shrink-0">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-extrabold text-cyan-600 bg-cyan-50 border border-cyan-100 px-2 py-0.5 rounded-full uppercase tracking-wider">
                Course Specializations
              </span>
            </div>
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight mt-0.5">Course Specialization List</h1>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Manage academic disciplines, SEO metadata, image assets, contents, levels, and FAQs.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchData}
            className="p-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
            title="Refresh list"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-xs transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={handleOpenAddModal}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Specialization</span>
          </button>
        </div>
      </div>

      {/* Select Excel File Import Box */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
        <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">Select Excel File</h3>
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full flex items-center border border-slate-200 rounded-xl overflow-hidden bg-slate-50">
            <input
              type="file"
              accept=".xlsx, .xls, .csv"
              onChange={(e) => setImportFile(e.target.files?.[0] || null)}
              className="w-full text-xs text-slate-600 file:mr-4 file:py-2 file:px-4 file:rounded-l-xl file:border-0 file:text-xs file:font-bold file:bg-slate-200 file:text-slate-700 hover:file:bg-slate-300 cursor-pointer"
            />
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
            <button
              onClick={handleImport}
              disabled={importing || !importFile}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-600 disabled:opacity-50 text-white font-bold text-xs shadow-xs transition-all cursor-pointer"
            >
              {importing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
              <span>Import</span>
            </button>
            <button
              onClick={handleDownloadFormat}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs transition-all cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Formate</span>
            </button>
          </div>
        </div>
      </div>

      {/* Search & Stats Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search specialization, category, slug..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-100 transition-all"
          />
        </div>

        <div className="flex items-center gap-4 text-xs font-semibold text-slate-500">
          <div>
            Total: <span className="text-slate-900 font-bold">{specializations.length}</span>
          </div>
          <div className="h-3 w-px bg-slate-200" />
          <div>
            Active: <span className="text-emerald-600 font-bold">{specializations.filter((s) => s.status === 1).length}</span>
          </div>
        </div>
      </div>

      {/* Main Rich Data Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 flex flex-col items-center justify-center text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mb-3" />
            <p className="text-xs font-semibold">Loading specializations...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <GraduationCap className="w-12 h-12 mx-auto mb-3 text-slate-300" />
            <p className="text-sm font-bold text-slate-700">No Specializations Found</p>
            <p className="text-xs text-slate-400 mt-1">Try searching another term or add a new specialization.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200/80 text-slate-500 font-extrabold uppercase tracking-wider text-[10.5px]">
                  <th className="py-3.5 px-4 w-14 text-center">Sr. No.</th>
                  <th className="py-3.5 px-4 w-14 text-center">ID</th>
                  <th className="py-3.5 px-5">Specialization & Slug</th>
                  <th className="py-3.5 px-5">Category</th>
                  <th className="py-3.5 px-4">SEO</th>
                  <th className="py-3.5 px-5">Images</th>
                  <th className="py-3.5 px-5">Sub-Modules</th>
                  <th className="py-3.5 px-5">More Details</th>
                  <th className="py-3.5 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {paginated.map((item, index) => {
                  const srNo = (currentPage - 1) * itemsPerPage + index + 1;
                  return (
                    <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-4 px-4 text-center font-extrabold text-slate-700">{srNo}</td>
                      <td className="py-4 px-4 text-center font-bold text-slate-400">#{item.id}</td>
                      <td className="py-4 px-5 max-w-xs">
                        <div className="font-bold text-slate-900 text-xs leading-snug">{item.name}</div>
                        <div className="text-[11px] font-mono text-slate-400 mt-0.5 truncate">{item.slug}</div>
                      </td>

                      {/* Category Column */}
                      <td className="py-4 px-5">
                        <div className="font-bold text-indigo-700 text-xs">{item.category_name || 'N/A'}</div>
                        <div className="text-[10.5px] text-slate-400 font-mono">Cat #{item.course_category_id}</div>
                      </td>

                      {/* SEO Metadata Column */}
                      <td className="py-4 px-4">
                        <button
                          onClick={() => setPreviewSeo(item)}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-sky-200 bg-sky-50/70 text-sky-700 text-[11px] font-bold hover:bg-sky-100 transition-colors cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View</span>
                        </button>
                      </td>

                      {/* Images Column */}
                      <td className="py-4 px-5">
                        <div className="space-y-1 text-[11px]">
                          <div className="flex items-center gap-1.5">
                            <span className="text-slate-400 font-semibold">Thumbnail:</span>
                            {item.thumbnail_path ? (
                              <button
                                onClick={() => setPreviewImage({ title: 'Thumbnail', url: item.thumbnail_path! })}
                                className="text-indigo-600 font-bold hover:underline cursor-pointer flex items-center gap-1"
                              >
                                View <ExternalLink className="w-2.5 h-2.5" />
                              </button>
                            ) : (
                              <span className="text-slate-400">N/A</span>
                            )}
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-slate-400 font-semibold">Banner:</span>
                            {item.banner_path ? (
                              <button
                                onClick={() => setPreviewImage({ title: 'Banner', url: item.banner_path! })}
                                className="text-indigo-600 font-bold hover:underline cursor-pointer flex items-center gap-1"
                              >
                                View <ExternalLink className="w-2.5 h-2.5" />
                              </button>
                            ) : (
                              <span className="text-slate-400">N/A</span>
                            )}
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-slate-400 font-semibold">OG Image:</span>
                            {item.og_image_path ? (
                              <button
                                onClick={() => setPreviewImage({ title: 'OG Image', url: item.og_image_path! })}
                                className="text-indigo-600 font-bold hover:underline cursor-pointer flex items-center gap-1"
                              >
                                View <ExternalLink className="w-2.5 h-2.5" />
                              </button>
                            ) : (
                              <span className="text-slate-400">N/A</span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Sub-modules Badges Column */}
                      <td className="py-4 px-5">
                        <div className="space-y-1.5">
                          {/* Content Badge */}
                          <button
                            onClick={() => navigate(`/course-specialization-contents/${item.id}`)}
                            className="w-full inline-flex items-center justify-between px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[10.5px] shadow-xs transition-all cursor-pointer"
                            title="Manage Specialization Content Tabs"
                          >
                            <span className="flex items-center gap-1">
                              <FileText className="w-3 h-3" /> Content
                            </span>
                            <span className="bg-indigo-800 text-white px-1.5 py-0.2 rounded-full text-[9px]">
                              {item.contents_count || 0}
                            </span>
                          </button>

                          {/* FAQs Badge */}
                          <button
                            onClick={() => handleOpenFaqsModal(item)}
                            className="w-full inline-flex items-center justify-between px-2.5 py-1 rounded-lg bg-sky-600 hover:bg-sky-700 text-white font-bold text-[10.5px] shadow-xs transition-all cursor-pointer"
                            title="Manage Specialization FAQs"
                          >
                            <span className="flex items-center gap-1">
                              <HelpCircle className="w-3 h-3" /> Faqs
                            </span>
                            <span className="bg-sky-800 text-white px-1.5 py-0.2 rounded-full text-[9px]">
                              {item.faqs_count || 0}
                            </span>
                          </button>

                          {/* Level Badge */}
                          <button
                            onClick={() => navigate(`/specialization-levels/${item.id}`)}
                            className="w-full inline-flex items-center justify-between px-2.5 py-1 rounded-lg bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-[10.5px] shadow-xs transition-all cursor-pointer"
                            title="Manage Specialization Levels"
                          >
                            <span className="flex items-center gap-1">
                              <Layers className="w-3 h-3" /> Level
                            </span>
                            <span className="bg-cyan-800 text-white px-1.5 py-0.2 rounded-full text-[9px]">
                              {item.levels_count || 0}
                            </span>
                          </button>
                        </div>
                      </td>

                      {/* More Details Column */}
                      <td className="py-4 px-5">
                        <div className="space-y-1 text-[11px]">
                          <div className="flex items-center gap-1.5">
                            <User className="w-3 h-3 text-slate-400" />
                            <span className="text-slate-500">Author:</span>
                            <span className="font-bold text-slate-800">{item.author_name || 'Team EM'}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Tag className="w-3 h-3 text-slate-400" />
                            <span className="text-slate-500">Icon:</span>
                            <span className="font-mono text-slate-600">{item.icon_class || 'N/A'}</span>
                          </div>
                        </div>
                      </td>

                      {/* Actions Column */}
                      <td className="py-4 px-5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenEditModal(item)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors cursor-pointer"
                            title="Edit Specialization"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => handleDelete(item.id, item.name)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                            title="Delete Specialization"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={filtered.length}
              itemsPerPage={itemsPerPage}
              onPageChange={(p) => setCurrentPage(p)}
            />
          </div>
        )}
      </div>

      {/* ── MODAL 1: ADD / EDIT SPECIALIZATION ── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-100 overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h3 className="font-extrabold text-slate-900 text-sm">
                {editingId ? 'Edit Course Specialization' : 'Add New Course Specialization'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Navigation Tabs */}
            <div className="flex border-b border-slate-100 px-6 bg-slate-50/30">
              <button
                type="button"
                onClick={() => setActiveTab('basic')}
                className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-colors cursor-pointer ${
                  activeTab === 'basic'
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                Basic Information
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('seo')}
                className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-colors cursor-pointer ${
                  activeTab === 'seo'
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                SEO Metadata
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('images')}
                className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-colors cursor-pointer ${
                  activeTab === 'images'
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                Media Assets
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              {activeTab === 'basic' && (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">Specialization Name *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Software Engineering"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-100 transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">Course Category *</label>
                      <select
                        required
                        value={formData.course_category_id}
                        onChange={(e) => setFormData({ ...formData, course_category_id: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-100 transition-all"
                      >
                        <option value="">-- Select Category --</option>
                        {categories.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">Author</label>
                      <select
                        value={formData.author_id}
                        onChange={(e) => setFormData({ ...formData, author_id: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-100 transition-all"
                      >
                        <option value="">-- Select Author --</option>
                        {authors.map((a) => (
                          <option key={a.id} value={a.id}>
                            {a.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">Icon Class</label>
                      <input
                        type="text"
                        placeholder="fa fa-code"
                        value={formData.icon_class}
                        onChange={(e) => setFormData({ ...formData, icon_class: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-100 transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Shortnote</label>
                    <textarea
                      rows={2}
                      placeholder="Brief note for lists..."
                      value={formData.shortnote}
                      onChange={(e) => setFormData({ ...formData, shortnote: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-100 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Courses Description</label>
                    <RichTextEditor
                      value={formData.courses_description}
                      onChange={(val) => setFormData({ ...formData, courses_description: val })}
                      placeholder="Specialization description with formatting..."
                      minHeight="250px"
                    />
                  </div>
                </>
              )}

              {activeTab === 'seo' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">Meta Title</label>
                      <input
                        type="text"
                        placeholder="Enter Meta Title"
                        value={formData.meta_title}
                        onChange={(e) => setFormData({ ...formData, meta_title: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-100 transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">Meta Keyword</label>
                      <input
                        type="text"
                        placeholder="Meta Keyword"
                        value={formData.meta_keyword}
                        onChange={(e) => setFormData({ ...formData, meta_keyword: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-100 transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Meta Description</label>
                    <textarea
                      rows={3}
                      placeholder="Enter Meta Description..."
                      value={formData.meta_description}
                      onChange={(e) => setFormData({ ...formData, meta_description: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-100 transition-all"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">Seo Rating</label>
                      <input
                        type="text"
                        placeholder="Seo Rating"
                        value={formData.seo_rating}
                        onChange={(e) => setFormData({ ...formData, seo_rating: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-100 transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">Best Rating</label>
                      <input
                        type="text"
                        placeholder="Best Rating"
                        value={formData.best_rating}
                        onChange={(e) => setFormData({ ...formData, best_rating: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-100 transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">Number of Review</label>
                      <input
                        type="text"
                        placeholder="Total Reviews"
                        value={formData.review_number}
                        onChange={(e) => setFormData({ ...formData, review_number: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-100 transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">Upload OG Image</label>
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
                </div>
              )}

              {activeTab === 'images' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Upload Thumbnail Image</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setFormData({ ...formData, thumbnail_path: file.name });
                        }
                      }}
                      className="w-full text-xs text-slate-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-slate-200 file:text-slate-700 hover:file:bg-slate-300 cursor-pointer border border-slate-200 rounded-xl bg-slate-50"
                    />
                    {formData.thumbnail_path && (
                      <span className="text-[11px] text-slate-500 mt-1 block truncate">
                        Current / Selected: {formData.thumbnail_path}
                      </span>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Upload Banner Image</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setFormData({ ...formData, banner_path: file.name });
                        }
                      }}
                      className="w-full text-xs text-slate-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-slate-200 file:text-slate-700 hover:file:bg-slate-300 cursor-pointer border border-slate-200 rounded-xl bg-slate-50"
                    />
                    {formData.banner_path && (
                      <span className="text-[11px] text-slate-500 mt-1 block truncate">
                        Current / Selected: {formData.banner_path}
                      </span>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Upload Content Image</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setFormData({ ...formData, content_image_path: file.name });
                        }
                      }}
                      className="w-full text-xs text-slate-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-slate-200 file:text-slate-700 hover:file:bg-slate-300 cursor-pointer border border-slate-200 rounded-xl bg-slate-50"
                    />
                    {formData.content_image_path && (
                      <span className="text-[11px] text-slate-500 mt-1 block truncate">
                        Current / Selected: {formData.content_image_path}
                      </span>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Status</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: Number(e.target.value) })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-100 transition-all"
                    >
                      <option value={1}>Active</option>
                      <option value={0}>Inactive</option>
                    </select>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/20 flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <span>{editingId ? 'Update Specialization' : 'Create Specialization'}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL 2: MANAGE SPECIALIZATION FAQS ── */}
      {faqModalItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl border border-slate-100 overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div>
                <h3 className="font-extrabold text-slate-900 text-sm">FAQs for "{faqModalItem.name}"</h3>
                <p className="text-[11px] text-slate-500 font-medium">Add, edit, or remove frequently asked questions.</p>
              </div>
              <button
                onClick={() => setFaqModalItem(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
              {/* FAQ Form */}
              <form onSubmit={handleSaveFaq} className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 space-y-3">
                <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">
                  {editingFaqId ? 'Edit FAQ Item' : 'Add New FAQ Item'}
                </h4>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Question *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. What career paths are available for this specialization?"
                    value={faqFormData.question}
                    onChange={(e) => setFaqFormData({ ...faqFormData, question: e.target.value })}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Answer</label>
                  <textarea
                    rows={3}
                    placeholder="Provide a helpful detailed answer..."
                    value={faqFormData.answer}
                    onChange={(e) => setFaqFormData({ ...faqFormData, answer: e.target.value })}
                    className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs font-medium text-slate-800 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-1">
                  {editingFaqId && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingFaqId(null);
                        setFaqFormData({ question: '', answer: '' });
                      }}
                      className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-100 cursor-pointer"
                    >
                      Cancel
                    </button>
                  )}
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs shadow-sm cursor-pointer"
                  >
                    {editingFaqId ? 'Update FAQ' : 'Add FAQ'}
                  </button>
                </div>
              </form>

              {/* FAQs List Table */}
              <div className="space-y-2">
                <h4 className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">Existing FAQs ({faqs.length})</h4>
                {loadingFaqs ? (
                  <div className="p-6 text-center text-slate-400">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-indigo-600" />
                    <span className="text-xs font-semibold">Loading FAQs...</span>
                  </div>
                ) : faqs.length === 0 ? (
                  <p className="text-xs text-slate-400 italic bg-slate-50 p-4 rounded-xl text-center">No FAQs added yet.</p>
                ) : (
                  <div className="divide-y divide-slate-100 border border-slate-200/80 rounded-xl overflow-hidden">
                    {faqs.map((faq, idx) => (
                      <div key={faq.id || idx} className="p-3.5 bg-white hover:bg-slate-50 flex items-start justify-between gap-4 transition-colors">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-extrabold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                              #{idx + 1}
                            </span>
                            <span className="font-bold text-slate-900 text-xs">{faq.question}</span>
                          </div>
                          <p className="text-xs text-slate-600 pl-4 border-l-2 border-slate-200 mt-1">{faq.answer || 'No answer set'}</p>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            onClick={() => {
                              setEditingFaqId(faq.id!);
                              setFaqFormData({ question: faq.question, answer: faq.answer || '' });
                            }}
                            className="p-1 text-slate-400 hover:text-indigo-600 rounded cursor-pointer"
                            title="Edit FAQ"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteFaq(faq.id!)}
                            className="p-1 text-slate-400 hover:text-rose-600 rounded cursor-pointer"
                            title="Delete FAQ"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── PREVIEW MODAL: SEO METADATA ── */}
      {previewSeo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-100 overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h3 className="font-extrabold text-slate-900 text-sm">SEO Details — {previewSeo.name}</h3>
              <button onClick={() => setPreviewSeo(null)} className="text-slate-400 hover:text-slate-600 p-1 rounded-lg cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-3.5 text-xs max-h-[80vh] overflow-y-auto">
              <div>
                <span className="font-bold text-slate-700 block mb-1">Meta Title:</span>
                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-slate-800 font-semibold">
                  {previewSeo.meta_title || 'N/A'}
                </div>
              </div>

              <div>
                <span className="font-bold text-slate-700 block mb-1">Meta Keyword:</span>
                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-slate-700 font-mono text-[11px]">
                  {previewSeo.meta_keyword || 'N/A'}
                </div>
              </div>

              <div>
                <span className="font-bold text-slate-700 block mb-1">Meta Description:</span>
                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-slate-700 font-medium leading-relaxed">
                  {previewSeo.meta_description || 'N/A'}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-center">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Seo Rating</span>
                  <span className="font-extrabold text-slate-900 text-xs mt-0.5 block">{previewSeo.seo_rating || 'N/A'}</span>
                </div>
                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-center">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Best Rating</span>
                  <span className="font-extrabold text-slate-900 text-xs mt-0.5 block">{previewSeo.best_rating || 'N/A'}</span>
                </div>
                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-center">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Reviews</span>
                  <span className="font-extrabold text-slate-900 text-xs mt-0.5 block">{previewSeo.review_number || 'N/A'}</span>
                </div>
              </div>

              <div>
                <span className="font-bold text-slate-700 block mb-1">Upload OG Image:</span>
                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-slate-700 font-mono text-[11px] truncate">
                  {previewSeo.og_image_path || 'N/A'}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── PREVIEW MODAL: IMAGE PREVIEW ── */}
      {previewImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-100 overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h3 className="font-extrabold text-slate-900 text-sm">Image Preview — {previewImage.title}</h3>
              <button onClick={() => setPreviewImage(null)} className="text-slate-400 hover:text-slate-600 p-1 rounded-lg cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 flex flex-col items-center">
              <div className="bg-slate-100 p-2 rounded-xl border border-slate-200 mb-3 w-full flex justify-center">
                <img
                  src={previewImage.url.startsWith('http') ? previewImage.url : `/${previewImage.url}`}
                  alt={previewImage.title}
                  className="max-h-80 object-contain rounded-lg shadow-xs"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              </div>
              <p className="text-xs font-mono text-slate-600 break-all text-center">{previewImage.url}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
