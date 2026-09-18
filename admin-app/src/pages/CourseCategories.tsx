import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { confirmDelete } from '@/lib/swal';
import Pagination from '@/components/common/Pagination';
import { uploadFileToStorage, getStorageUrl } from '@/lib/uploadHelper';
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
  ExternalLink
} from 'lucide-react';

interface CategoryItem {
  id: number;
  name: string;
  slug: string;
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
  created_at?: string;
}

interface AuthorOption {
  id: number;
  name: string;
}

interface ContentTabItem {
  id?: number;
  course_category_id: number;
  tab: string;
  position: number;
  description: string;
}

interface FaqItem {
  id?: number;
  course_category_id: number;
  question: string;
  answer: string;
}

export default function CourseCategories() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<CategoryItem[]>([]);
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

  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [contentImageFile, setContentImageFile] = useState<File | null>(null);
  const [ogImageFile, setOgImageFile] = useState<File | null>(null);

  // Preview Modals
  const [previewSeo, setPreviewSeo] = useState<CategoryItem | null>(null);
  const [previewShortnote, setPreviewShortnote] = useState<CategoryItem | null>(null);
  const [previewImage, setPreviewImage] = useState<{ title: string; url: string } | null>(null);

  // Sub-modules Modals
  const [contentModalCategory, setContentModalCategory] = useState<CategoryItem | null>(null);
  const [contentTabs, setContentTabs] = useState<ContentTabItem[]>([]);
  const [loadingContents, setLoadingContents] = useState(false);
  const [contentFormData, setContentFormData] = useState({ tab: '', position: 1, description: '' });
  const [editingContentId, setEditingContentId] = useState<number | null>(null);

  const [faqModalCategory, setFaqModalCategory] = useState<CategoryItem | null>(null);
  const [faqs, setFaqs] = useState<FaqItem[]>([]);
  const [loadingFaqs, setLoadingFaqs] = useState(false);
  const [faqFormData, setFaqFormData] = useState({ question: '', answer: '' });
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
      'name,shortnote,icon_class,courses_description\n' +
      '"Business & Management","Study business operations and strategic management","fa fa-briefcase","Find top university options offering Diploma, Bachelor\'s, Master\'s, and PhD programmes in business."\n' +
      '"Applied and Pure Sciences","Understanding theories and nature","fa fa-flask","Discover a wide spectrum of Applied and Pure Sciences courses in Malaysia."';
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'course_category_import_format.csv');
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

      const res = await fetch('/api/v1/admin/course-categories/import', {
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

  const fetchData = async (showLoading = true) => {
    if (showLoading) setLoading(true);
    try {
      const [catRes, authorRes] = await Promise.all([
        fetch('/api/v1/admin/course-categories'),
        fetch('/api/v1/admin/authors'),
      ]);

      const catJson = await catRes.json();
      const authorJson = await authorRes.json();

      if (catRes.ok && catJson.status) {
        setCategories(catJson.data || []);
      } else {
        if (showLoading) showToast('error', catJson.message || 'Failed to load course categories');
      }

      if (authorRes.ok && authorJson.status) {
        setAuthors(authorJson.data || []);
      }
    } catch {
      if (showLoading) showToast('error', 'Connection error while fetching data');
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Export to CSV Function
  const handleExportCSV = () => {
    if (categories.length === 0) return;

    const headers = ['ID', 'Category Name', 'Author', 'Shortnote', 'Status', 'Contents Count', 'FAQs Count'];
    const rows = categories.map((c) => [
      c.id,
      `"${(c.name || '').replace(/"/g, '""')}"`,
      c.slug,
      `"${(c.author_name || '').replace(/"/g, '""')}"`,
      `"${(c.shortnote || '').replace(/"/g, '""')}"`,
      c.status === 1 ? 'Active' : 'Inactive',
      c.contents_count || 0,
      c.faqs_count || 0,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `course_categories_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const resetFileStates = () => {
    setOgImageFile(null);
    setThumbnailFile(null);
    setBannerFile(null);
    setContentImageFile(null);
  };

  // Open Add Modal
  const handleOpenAdd = () => {
    setEditingId(null);
    setActiveTab('basic');
    resetFileStates();
    setFormData({
      name: '',
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
  const handleOpenEdit = (item: CategoryItem) => {
    setEditingId(item.id);
    setActiveTab('basic');
    resetFileStates();
    setFormData({
      name: item.name || '',
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

  // Submit Category Add / Edit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      showToast('error', 'Category name is required');
      return;
    }

    setSubmitting(true);
    try {
      const currentFormData = { ...formData };
      if (thumbnailFile) {
        const res = await uploadFileToStorage(thumbnailFile, 'categories');
        currentFormData.thumbnail_path = res.file_path;
      }
      if (bannerFile) {
        const res = await uploadFileToStorage(bannerFile, 'categories');
        currentFormData.banner_path = res.file_path;
      }
      if (contentImageFile) {
        const res = await uploadFileToStorage(contentImageFile, 'categories');
        currentFormData.content_image_path = res.file_path;
      }
      if (ogImageFile) {
        const res = await uploadFileToStorage(ogImageFile, 'seo');
        currentFormData.og_image_path = res.file_path;
      }

      const url = editingId
        ? `/api/v1/admin/course-categories/${editingId}`
        : '/api/v1/admin/course-categories';
      const method = editingId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(currentFormData),
      });

      const json = await res.json();
      if (res.ok && json.status) {
        showToast('success', editingId ? 'Category updated successfully' : 'Category created successfully');
        setIsModalOpen(false);
        fetchData();
      } else {
        showToast('error', json.message || 'Action failed');
      }
    } catch {
      showToast('error', 'Network error occurred');
    } finally {
      setSubmitting(false);
    }
  };

  // Delete Category using SweetAlert2
  const handleDelete = async (id: number, name: string) => {
    const isConfirmed = await confirmDelete(
      'Delete Course Category?',
      `Are you sure you want to delete "${name}"? This action cannot be undone.`
    );
    if (!isConfirmed) return;

    // Optimistic UI update
    setCategories((prev) => prev.filter((c) => c.id !== id));

    try {
      const res = await fetch(`/api/v1/admin/course-categories/${id}`, { method: 'DELETE' });
      const json = await res.json();
      if (res.ok && json.status) {
        showToast('success', `Category "${name}" deleted successfully`);
        fetchData(false);
      } else {
        showToast('error', json.message || 'Failed to delete category');
        fetchData(false);
      }
    } catch {
      showToast('error', 'Connection error while deleting category');
      fetchData(false);
    }
  };

  // -------------------------------------------------------------
  // SUB-MODULE 1: Manage Category Contents
  // -------------------------------------------------------------
  const handleOpenContentsModal = async (cat: CategoryItem) => {
    setContentModalCategory(cat);
    setLoadingContents(true);
    setContentFormData({ tab: '', position: contentTabs.length + 1, description: '' });
    setEditingContentId(null);
    try {
      const res = await fetch(`/api/v1/admin/course-category-contents?course_category_id=${cat.id}`);
      const json = await res.json();
      if (res.ok && json.data) setContentTabs(json.data);
    } catch {
      showToast('error', 'Failed to load content tabs');
    } finally {
      setLoadingContents(false);
    }
  };

  const handleSaveContentTab = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contentModalCategory || !contentFormData.tab.trim()) return;

    try {
      const url = editingContentId
        ? `/api/v1/admin/course-category-contents/${editingContentId}`
        : '/api/v1/admin/course-category-contents';
      const method = editingContentId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          course_category_id: contentModalCategory.id,
          ...contentFormData,
        }),
      });

      const json = await res.json();
      if (res.ok && json.status) {
        showToast('success', editingContentId ? 'Tab updated' : 'Tab added');
        setContentFormData({ tab: '', position: 1, description: '' });
        setEditingContentId(null);
        handleOpenContentsModal(contentModalCategory);
        fetchData();
      } else {
        showToast('error', json.message || 'Failed to save tab');
      }
    } catch {
      showToast('error', 'Network error while saving tab');
    }
  };

  const handleDeleteContentTab = async (id: number) => {
    const isConfirmed = await confirmDelete('Delete Content Tab?', 'Are you sure you want to delete this tab?');
    if (!isConfirmed) return;

    try {
      const res = await fetch(`/api/v1/admin/course-category-contents/${id}`, { method: 'DELETE' });
      const json = await res.json();
      if (res.ok && json.status) {
        showToast('success', 'Tab deleted successfully');
        if (contentModalCategory) handleOpenContentsModal(contentModalCategory);
        fetchData();
      }
    } catch {
      showToast('error', 'Failed to delete tab');
    }
  };

  // -------------------------------------------------------------
  // SUB-MODULE 2: Manage Category FAQs
  // -------------------------------------------------------------
  const handleOpenFaqsModal = async (cat: CategoryItem) => {
    setFaqModalCategory(cat);
    setLoadingFaqs(true);
    setFaqFormData({ question: '', answer: '' });
    setEditingFaqId(null);
    try {
      const res = await fetch(`/api/v1/admin/course-category-faqs?course_category_id=${cat.id}`);
      const json = await res.json();
      if (res.ok && json.data) setFaqs(json.data);
    } catch {
      showToast('error', 'Failed to load FAQs');
    } finally {
      setLoadingFaqs(false);
    }
  };

  const handleSaveFaq = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!faqModalCategory || !faqFormData.question.trim()) return;

    try {
      const url = editingFaqId
        ? `/api/v1/admin/course-category-faqs/${editingFaqId}`
        : '/api/v1/admin/course-category-faqs';
      const method = editingFaqId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          course_category_id: faqModalCategory.id,
          ...faqFormData,
        }),
      });

      const json = await res.json();
      if (res.ok && json.status) {
        showToast('success', editingFaqId ? 'FAQ updated' : 'FAQ created');
        setFaqFormData({ question: '', answer: '' });
        setEditingFaqId(null);
        handleOpenFaqsModal(faqModalCategory);
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
      const res = await fetch(`/api/v1/admin/course-category-faqs/${id}`, { method: 'DELETE' });
      const json = await res.json();
      if (res.ok && json.status) {
        showToast('success', 'FAQ deleted successfully');
        if (faqModalCategory) handleOpenFaqsModal(faqModalCategory);
        fetchData();
      }
    } catch {
      showToast('error', 'Failed to delete FAQ');
    }
  };

  // Filter Categories
  const filteredCategories = categories.filter(
    (item) =>
      item.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.slug?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.author_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.shortnote?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const totalPages = Math.ceil(filteredCategories.length / itemsPerPage);
  const paginatedCategories = filteredCategories.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="space-y-3">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-xl text-xs font-semibold text-white animate-in slide-in-from-bottom-5 duration-200 ${toast.type === 'success' ? 'bg-emerald-600' : 'bg-rose-600'
            }`}
        >
          {toast.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* ── CLASSIC EDITORIAL HEADER ── */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-stone-200/90 shadow-xs relative overflow-hidden">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="space-y-1.5 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-900 text-[11px] font-bold tracking-wider uppercase">
                <GraduationCap className="w-3.5 h-3.5 text-amber-700" />
                <span>Academic Disciplines</span>
              </span>
              <span className="text-[11px] font-bold text-stone-500 bg-stone-100 px-2.5 py-0.5 rounded-full border border-stone-200">
                Course Categories
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight font-serif">
              Course Categories Directory
            </h1>
            <p className="text-xs sm:text-sm text-stone-500 font-medium leading-relaxed">
              Manage academic disciplines, study streams, rich content overview tabs, FAQs, and SEO metadata across Malaysian universities.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              onClick={() => fetchData()}
              className="p-2.5 rounded-xl border border-stone-200 text-stone-600 hover:bg-stone-50 hover:text-stone-900 transition-colors cursor-pointer"
              title="Refresh list"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-amber-800' : ''}`} />
            </button>

            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 text-stone-700 font-bold text-xs shadow-2xs transition-colors cursor-pointer"
            >
              <Download className="w-4 h-4 text-emerald-700" />
              <span>Export CSV</span>
            </button>

            <button
              onClick={handleOpenAdd}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs shadow-md shadow-stone-900/15 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Category</span>
            </button>
          </div>
        </div>

        {/* ── TOP STAT METRICS (4 CARDS) ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 mt-6 pt-6 border-t border-stone-100">
          <div className="p-3.5 rounded-2xl bg-[#faf8f4] border border-stone-200/80">
            <div className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">Total Categories</div>
            <div className="text-2xl font-black text-stone-900 tracking-tight mt-0.5">
              {categories.length}
            </div>
            <div className="text-[10.5px] font-semibold text-stone-500 mt-1">Listed disciplines</div>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#faf8f4] border border-stone-200/80">
            <div className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">Active Published</div>
            <div className="text-2xl font-black text-emerald-800 tracking-tight mt-0.5">
              {categories.filter((c) => c.status === 1).length}
            </div>
            <div className="text-[10.5px] font-semibold text-emerald-700 mt-1">Visible on portal</div>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#faf8f4] border border-stone-200/80">
            <div className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">Content Modules</div>
            <div className="text-2xl font-black text-amber-900 tracking-tight mt-0.5">
              {categories.reduce((acc, c) => acc + (c.contents_count || 0), 0)}
            </div>
            <div className="text-[10.5px] font-semibold text-amber-700 mt-1">Detailed tab overviews</div>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#faf8f4] border border-stone-200/80">
            <div className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">FAQ Knowledge</div>
            <div className="text-2xl font-black text-indigo-950 tracking-tight mt-0.5">
              {categories.reduce((acc, c) => acc + (c.faqs_count || 0), 0)}
            </div>
            <div className="text-[10.5px] font-semibold text-indigo-800 mt-1">Questions & answers</div>
          </div>
        </div>
      </div>

      {/* ── EXCEL DATA IMPORT TOOL ── */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-stone-200/90 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-stone-800 uppercase tracking-wider">Bulk Import Course Categories</h3>
          <button
            onClick={handleDownloadFormat}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 text-amber-900 border border-amber-200/80 text-xs font-bold rounded-xl hover:bg-amber-100 transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>CSV Template</span>
          </button>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full flex items-center border border-stone-200 rounded-xl overflow-hidden bg-stone-50/70 p-1">
            <input
              type="file"
              accept=".xlsx, .xls, .csv"
              onChange={(e) => setImportFile(e.target.files?.[0] || null)}
              className="w-full text-xs text-stone-600 file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-stone-200 file:text-stone-800 hover:file:bg-stone-300 cursor-pointer"
            />
          </div>
          <button
            onClick={handleImport}
            disabled={importing || !importFile}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 disabled:opacity-50 text-white font-bold text-xs shadow-xs transition-all cursor-pointer shrink-0"
          >
            {importing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
            <span>Import Categories</span>
          </button>
        </div>
      </div>

      {/* ── SEARCH & STATS BAR ── */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-stone-200/90 shadow-xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search category name, slug, author..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-stone-50/70 border border-stone-200/90 rounded-xl pl-10 pr-4 py-2 text-xs font-medium text-stone-800 placeholder-stone-400 focus:outline-none focus:border-amber-600 focus:bg-white transition-all"
          />
        </div>

        <div className="flex items-center gap-4 text-xs font-bold text-stone-500">
          <div>
            Showing: <span className="text-stone-900 font-extrabold">{filteredCategories.length}</span> Categories
          </div>
          <div className="h-3 w-px bg-stone-200" />
          <div>
            Active: <span className="text-emerald-700 font-extrabold">{categories.filter((c) => c.status === 1).length}</span>
          </div>
        </div>
      </div>

      {/* ── MAIN RICH DATA TABLE ── */}
      <div className="bg-white rounded-3xl border border-stone-200/90 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-16 flex flex-col items-center justify-center text-stone-400">
            <Loader2 className="w-8 h-8 animate-spin text-amber-800 mb-3" />
            <p className="text-xs font-bold">Loading course categories...</p>
          </div>
        ) : filteredCategories.length === 0 ? (
          <div className="p-16 text-center text-stone-400">
            <GraduationCap className="w-12 h-12 mx-auto mb-3 text-stone-300" />
            <p className="text-sm font-bold text-stone-700">No Course Categories Found</p>
            <p className="text-xs text-stone-400 mt-1">Try searching another term or add a new category.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#faf8f4] border-b border-stone-200 text-stone-600 font-black uppercase tracking-wider text-[10.5px] font-serif">
                  <th className="py-3.5 px-4 w-14 text-center">Sr. No.</th>
                  <th className="py-3.5 px-4 w-14 text-center">ID</th>
                  <th className="py-3.5 px-5">Name & Slug</th>
                  <th className="py-3.5 px-4">Shortnote</th>
                  <th className="py-3.5 px-4">SEO</th>
                  <th className="py-3.5 px-5">Images</th>
                  <th className="py-3.5 px-5">More Details</th>
                  <th className="py-3.5 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 font-medium text-stone-700">
                {paginatedCategories.map((item, index) => {
                  const srNo = (currentPage - 1) * itemsPerPage + index + 1;
                  return (
                    <tr key={item.id} className="hover:bg-[#fbfaf7] transition-colors group">
                      <td className="py-4 px-4 text-center font-extrabold text-stone-500">{srNo}</td>
                      <td className="py-4 px-4 text-center font-bold text-stone-400">#{item.id}</td>
                      <td className="py-4 px-5 max-w-xs">
                        <div className="font-bold text-stone-900 text-xs leading-snug group-hover:text-amber-800 transition-colors">{item.name}</div>
                        <div className="text-[11px] font-mono text-stone-400 mt-0.5 truncate">{item.slug}</div>
                      </td>

                      {/* Shortnote Column */}
                      <td className="py-4 px-4">
                        {item.shortnote ? (
                          <button
                            onClick={() => setPreviewShortnote(item)}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-stone-200 bg-stone-50 hover:bg-stone-100 text-stone-700 text-[11px] font-bold transition-colors cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5 text-stone-500" />
                            <span>View</span>
                          </button>
                        ) : (
                          <span className="text-stone-400 italic text-[11px]">N/A</span>
                        )}
                      </td>

                      {/* SEO Metadata Column */}
                      <td className="py-4 px-4">
                        <button
                          onClick={() => setPreviewSeo(item)}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-stone-200 bg-stone-50 hover:bg-stone-100 text-stone-700 text-[11px] font-bold transition-colors cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5 text-stone-500" />
                          <span>View</span>
                        </button>
                      </td>

                      {/* Images Column */}
                      <td className="py-4 px-5">
                        <div className="space-y-1 text-[11px]">
                          <div className="flex items-center gap-1.5">
                            <span className="text-stone-400 font-semibold">Thumbnail:</span>
                            {item.thumbnail_path ? (
                              <button
                                onClick={() => setPreviewImage({ title: 'Thumbnail', url: item.thumbnail_path! })}
                                className="text-amber-800 font-bold hover:underline cursor-pointer flex items-center gap-1"
                              >
                                View <ExternalLink className="w-2.5 h-2.5" />
                              </button>
                            ) : (
                              <span className="text-stone-400">N/A</span>
                            )}
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-stone-400 font-semibold">Banner:</span>
                            {item.banner_path ? (
                              <button
                                onClick={() => setPreviewImage({ title: 'Banner', url: item.banner_path! })}
                                className="text-amber-800 font-bold hover:underline cursor-pointer flex items-center gap-1"
                              >
                                View <ExternalLink className="w-2.5 h-2.5" />
                              </button>
                            ) : (
                              <span className="text-stone-400">N/A</span>
                            )}
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-stone-400 font-semibold">Content Img:</span>
                            {item.content_image_path ? (
                              <button
                                onClick={() => setPreviewImage({ title: 'Content Image', url: item.content_image_path! })}
                                className="text-amber-800 font-bold hover:underline cursor-pointer flex items-center gap-1"
                              >
                                View <ExternalLink className="w-2.5 h-2.5" />
                              </button>
                            ) : (
                              <span className="text-stone-400">N/A</span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* More Details Column */}
                      <td className="py-4 px-5">
                        <div className="space-y-1 text-[11px]">
                          <div className="flex items-center gap-1.5">
                            <User className="w-3 h-3 text-stone-400" />
                            <span className="text-stone-500">Author:</span>
                            <span className="font-bold text-stone-800">{item.author_name || 'Team Education Malaysia'}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Tag className="w-3 h-3 text-stone-400" />
                            <span className="text-stone-500">Icon:</span>
                            <span className="font-mono text-stone-600">{item.icon_class || 'N/A'}</span>
                          </div>
                        </div>
                      </td>

                      {/* Actions Column */}
                      <td className="py-4 px-5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Sub-module 1: Content Badge */}
                          <button
                            onClick={() => navigate(`/course-category-contents/${item.id}`)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-stone-900 hover:bg-stone-800 text-white font-bold text-[11px] shadow-2xs transition-all cursor-pointer"
                            title="Manage Category Content Tabs in Dedicated Editor"
                          >
                            <FileText className="w-3.5 h-3.5" />
                            <span>Content</span>
                            <span className="bg-stone-700 text-white px-1.5 py-0.2 rounded-full text-[9.5px]">
                              {item.contents_count || 0}
                            </span>
                          </button>

                          {/* Sub-module 2: FAQs Badge */}
                          <button
                            onClick={() => handleOpenFaqsModal(item)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-amber-800 hover:bg-amber-900 text-white font-bold text-[11px] shadow-2xs transition-all cursor-pointer"
                            title="Manage Category FAQs"
                          >
                            <HelpCircle className="w-3.5 h-3.5" />
                            <span>FAQs</span>
                            <span className="bg-amber-950 text-white px-1.5 py-0.2 rounded-full text-[9.5px]">
                              {item.faqs_count || 0}
                            </span>
                          </button>

                          <button
                            onClick={() => handleOpenEdit(item)}
                            className="p-1.5 rounded-lg text-stone-600 hover:text-stone-900 hover:bg-stone-100 transition-colors cursor-pointer"
                            title="Edit Category"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => handleDelete(item.id, item.name)}
                            className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                            title="Delete Category"
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
            <div className="p-4 border-t border-stone-200/80 bg-[#faf8f4]">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={filteredCategories.length}
                itemsPerPage={itemsPerPage}
                onPageChange={(p) => setCurrentPage(p)}
              />
            </div>
          </div>
        )}
      </div>

      {/* ── MODAL 1: ADD / EDIT CATEGORY ── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-100 overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h3 className="font-extrabold text-slate-900 text-sm">
                {editingId ? 'Edit Course Category' : 'Add New Course Category'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Navigation Tabs */}
            <div className="flex border-b border-slate-100 px-6 bg-slate-50/30">
              <button
                type="button"
                onClick={() => setActiveTab('basic')}
                className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-colors cursor-pointer ${activeTab === 'basic'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
              >
                Basic Information
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('seo')}
                className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-colors cursor-pointer ${activeTab === 'seo'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
              >
                SEO Metadata
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('images')}
                className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-colors cursor-pointer ${activeTab === 'images'
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
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">Category Name *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Engineering and Technology"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-100 transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">Author</label>
                      <select
                        value={formData.author_id}
                        onChange={(e) => setFormData({ ...formData, author_id: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-100 transition-all"
                      >
                        <option value="">Select Author...</option>
                        {authors.map((a) => (
                          <option key={a.id} value={a.id}>
                            {a.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">Icon Class</label>
                      <input
                        type="text"
                        placeholder="e.g. fa-laptop or graduation-cap"
                        value={formData.icon_class}
                        onChange={(e) => setFormData({ ...formData, icon_class: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-100 transition-all"
                      />
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

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Shortnote</label>
                    <textarea
                      rows={2}
                      placeholder="Brief category short summary..."
                      value={formData.shortnote}
                      onChange={(e) => setFormData({ ...formData, shortnote: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-100 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Full Category Description</label>
                    <textarea
                      rows={4}
                      placeholder="Detailed course category overview..."
                      value={formData.courses_description}
                      onChange={(e) => setFormData({ ...formData, courses_description: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-100 transition-all"
                    />
                  </div>
                </>
              )}

              {activeTab === 'seo' && (
                <div className="space-y-4">
                  {/* Row 1: Meta Title & Meta Keyword */}
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

                  {/* Row 2: Meta Description */}
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

                  {/* Row 3: Seo Rating, Best Rating, Number of Review, Upload OG Image */}
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
                          const file = e.target.files?.[0] || null;
                          setOgImageFile(file);
                        }}
                        className="w-full text-xs text-slate-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-slate-200 file:text-slate-700 hover:file:bg-slate-300 cursor-pointer border border-slate-200 rounded-xl bg-slate-50"
                      />
                      {(ogImageFile || formData.og_image_path) && (
                        <span className="text-[11px] text-slate-600 mt-1 block truncate">
                          {ogImageFile ? `Selected: ${ogImageFile.name}` : `Current: ${formData.og_image_path}`}
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
                        const file = e.target.files?.[0] || null;
                        setThumbnailFile(file);
                      }}
                      className="w-full text-xs text-slate-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-slate-200 file:text-slate-700 hover:file:bg-slate-300 cursor-pointer border border-slate-200 rounded-xl bg-slate-50"
                    />
                    {(thumbnailFile || formData.thumbnail_path) && (
                      <span className="text-[11px] text-slate-600 mt-1 block truncate">
                        {thumbnailFile ? `Selected: ${thumbnailFile.name}` : `Current: ${formData.thumbnail_path}`}
                      </span>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Upload Banner Image</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0] || null;
                        setBannerFile(file);
                      }}
                      className="w-full text-xs text-slate-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-slate-200 file:text-slate-700 hover:file:bg-slate-300 cursor-pointer border border-slate-200 rounded-xl bg-slate-50"
                    />
                    {(bannerFile || formData.banner_path) && (
                      <span className="text-[11px] text-slate-600 mt-1 block truncate">
                        {bannerFile ? `Selected: ${bannerFile.name}` : `Current: ${formData.banner_path}`}
                      </span>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Upload Content Image</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0] || null;
                        setContentImageFile(file);
                      }}
                      className="w-full text-xs text-slate-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-slate-200 file:text-slate-700 hover:file:bg-slate-300 cursor-pointer border border-slate-200 rounded-xl bg-slate-50"
                    />
                    {(contentImageFile || formData.content_image_path) && (
                      <span className="text-[11px] text-slate-600 mt-1 block truncate">
                        {contentImageFile ? `Selected: ${contentImageFile.name}` : `Current: ${formData.content_image_path}`}
                      </span>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Upload OG Image</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0] || null;
                        setOgImageFile(file);
                      }}
                      className="w-full text-xs text-slate-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-slate-200 file:text-slate-700 hover:file:bg-slate-300 cursor-pointer border border-slate-200 rounded-xl bg-slate-50"
                    />
                    {(ogImageFile || formData.og_image_path) && (
                      <span className="text-[11px] text-slate-600 mt-1 block truncate">
                        {ogImageFile ? `Selected: ${ogImageFile.name}` : `Current: ${formData.og_image_path}`}
                      </span>
                    )}
                  </div>
                </div>
              )}

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center gap-2 px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20 transition-all disabled:opacity-50"
                >
                  {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{editingId ? 'Update Category' : 'Create Category'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL 2: MANAGE CATEGORY CONTENT TABS ── */}
      {contentModalCategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl border border-slate-100 overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div>
                <h3 className="font-extrabold text-slate-900 text-sm">
                  Manage Content Tabs — {contentModalCategory.name}
                </h3>
                <p className="text-[11px] text-slate-500 font-medium">Add, edit, or remove tabbed content sections for this category.</p>
              </div>
              <button
                onClick={() => setContentModalCategory(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 grid grid-cols-1 md:grid-cols-12 gap-6 max-h-[75vh] overflow-y-auto">
              {/* Form Column */}
              <div className="md:col-span-5 bg-slate-50 p-4 rounded-xl border border-slate-200/80 space-y-3">
                <h4 className="font-bold text-xs text-slate-800">
                  {editingContentId ? 'Edit Tab' : 'Add New Tab'}
                </h4>
                <form onSubmit={handleSaveContentTab} className="space-y-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Tab Title *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Overview, Fees, Career Prospects"
                      value={contentFormData.tab}
                      onChange={(e) => setContentFormData({ ...contentFormData, tab: e.target.value })}
                      className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-800"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Position Order</label>
                    <input
                      type="number"
                      value={contentFormData.position}
                      onChange={(e) => setContentFormData({ ...contentFormData, position: Number(e.target.value) })}
                      className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-800"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Description / Content</label>
                    <textarea
                      rows={4}
                      placeholder="Tab content body..."
                      value={contentFormData.description}
                      onChange={(e) => setContentFormData({ ...contentFormData, description: e.target.value })}
                      className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-800"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-1">
                    {editingContentId && (
                      <button
                        type="button"
                        onClick={() => {
                          setEditingContentId(null);
                          setContentFormData({ tab: '', position: 1, description: '' });
                        }}
                        className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 font-bold text-xs"
                      >
                        Cancel
                      </button>
                    )}
                    <button
                      type="submit"
                      className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs"
                    >
                      {editingContentId ? 'Update Tab' : 'Add Tab'}
                    </button>
                  </div>
                </form>
              </div>

              {/* Tabs List Column */}
              <div className="md:col-span-7 space-y-3">
                <h4 className="font-bold text-xs text-slate-800">Existing Content Tabs ({contentTabs.length})</h4>
                {loadingContents ? (
                  <div className="p-6 text-center text-slate-400">
                    <Loader2 className="w-6 h-6 animate-spin text-indigo-600 mx-auto" />
                  </div>
                ) : contentTabs.length === 0 ? (
                  <div className="p-6 text-center text-slate-400 bg-slate-50 rounded-xl border border-slate-200/80">
                    <p className="text-xs font-semibold">No content tabs added yet.</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {contentTabs.map((ct) => (
                      <div
                        key={ct.id}
                        className="p-3 bg-white border border-slate-200/80 rounded-xl flex items-center justify-between gap-3 shadow-2xs"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900 text-xs">{ct.tab}</span>
                            <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">
                              Pos: {ct.position}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">{ct.description || 'No description'}</p>
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => {
                              setEditingContentId(ct.id!);
                              setContentFormData({ tab: ct.tab, position: ct.position, description: ct.description || '' });
                            }}
                            className="p-1 rounded text-slate-500 hover:text-indigo-600 hover:bg-indigo-50"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteContentTab(ct.id!)}
                            className="p-1 rounded text-slate-500 hover:text-rose-600 hover:bg-rose-50"
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

      {/* ── MODAL 3: MANAGE CATEGORY FAQS ── */}
      {faqModalCategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl border border-slate-100 overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div>
                <h3 className="font-extrabold text-slate-900 text-sm">
                  Manage Category FAQs — {faqModalCategory.name}
                </h3>
                <p className="text-[11px] text-slate-500 font-medium">Add, edit, or remove frequently asked questions for this category.</p>
              </div>
              <button
                onClick={() => setFaqModalCategory(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 grid grid-cols-1 md:grid-cols-12 gap-6 max-h-[75vh] overflow-y-auto">
              {/* Form Column */}
              <div className="md:col-span-5 bg-slate-50 p-4 rounded-xl border border-slate-200/80 space-y-3">
                <h4 className="font-bold text-xs text-slate-800">
                  {editingFaqId ? 'Edit FAQ' : 'Add New FAQ'}
                </h4>
                <form onSubmit={handleSaveFaq} className="space-y-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Question *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. What are the entry requirements?"
                      value={faqFormData.question}
                      onChange={(e) => setFaqFormData({ ...faqFormData, question: e.target.value })}
                      className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-800"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Answer</label>
                    <textarea
                      rows={4}
                      placeholder="Detailed answer text..."
                      value={faqFormData.answer}
                      onChange={(e) => setFaqFormData({ ...faqFormData, answer: e.target.value })}
                      className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-800"
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
                        className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 font-bold text-xs"
                      >
                        Cancel
                      </button>
                    )}
                    <button
                      type="submit"
                      className="px-4 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs"
                    >
                      {editingFaqId ? 'Update FAQ' : 'Add FAQ'}
                    </button>
                  </div>
                </form>
              </div>

              {/* FAQs List Column */}
              <div className="md:col-span-7 space-y-3">
                <h4 className="font-bold text-xs text-slate-800">Existing FAQs ({faqs.length})</h4>
                {loadingFaqs ? (
                  <div className="p-6 text-center text-slate-400">
                    <Loader2 className="w-6 h-6 animate-spin text-sky-600 mx-auto" />
                  </div>
                ) : faqs.length === 0 ? (
                  <div className="p-6 text-center text-slate-400 bg-slate-50 rounded-xl border border-slate-200/80">
                    <p className="text-xs font-semibold">No FAQs added yet.</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {faqs.map((f) => (
                      <div
                        key={f.id}
                        className="p-3 bg-white border border-slate-200/80 rounded-xl space-y-1 shadow-2xs"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <span className="font-bold text-slate-900 text-xs">Q: {f.question}</span>
                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              onClick={() => {
                                setEditingFaqId(f.id!);
                                setFaqFormData({ question: f.question, answer: f.answer || '' });
                              }}
                              className="p-1 rounded text-slate-500 hover:text-sky-600 hover:bg-sky-50"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteFaq(f.id!)}
                              className="p-1 rounded text-slate-500 hover:text-rose-600 hover:bg-rose-50"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                        <p className="text-[11px] text-slate-500 leading-normal">{f.answer || 'No answer text'}</p>
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

      {/* ── PREVIEW MODAL: SHORTNOTE ── */}
      {previewShortnote && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-100 overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h3 className="font-extrabold text-slate-900 text-sm">Shortnote — {previewShortnote.name}</h3>
              <button onClick={() => setPreviewShortnote(null)} className="text-slate-400 hover:text-slate-600 p-1 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              <p className="text-xs text-slate-700 leading-relaxed font-medium bg-slate-50 p-4 rounded-xl border border-slate-200">
                {previewShortnote.shortnote}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ── PREVIEW MODAL: IMAGE PREVIEW ── */}
      {previewImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden max-w-lg w-full animate-in zoom-in-95 duration-150">
            <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <span className="font-bold text-xs text-slate-800">{previewImage.title} Preview</span>
              <button onClick={() => setPreviewImage(null)} className="text-slate-400 hover:text-slate-600 p-1">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-4 flex flex-col items-center justify-center bg-slate-900/5">
              <img
                src={getStorageUrl(previewImage.url)}
                alt={previewImage.title}
                className="max-h-64 object-contain rounded-lg shadow-md bg-white p-1"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
              <a
                href={getStorageUrl(previewImage.url)}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] font-mono text-indigo-600 hover:underline mt-3 break-all flex items-center gap-1 font-semibold"
              >
                {getStorageUrl(previewImage.url)} <ExternalLink className="w-3 h-3 shrink-0" />
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
