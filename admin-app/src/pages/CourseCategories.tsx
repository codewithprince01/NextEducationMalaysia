import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { confirmDelete } from '@/lib/swal';
import Pagination from '@/components/common/Pagination';
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

  const fetchData = async () => {
    setLoading(true);
    try {
      const [catRes, authRes] = await Promise.all([
        fetch('/api/v1/admin/course-categories'),
        fetch('/api/v1/admin/authors'),
      ]);

      const catJson = await catRes.json();
      const authJson = await authRes.json();

      if (catRes.ok && catJson.status) {
        setCategories(catJson.data || []);
      } else {
        showToast('error', catJson.message || 'Failed to fetch categories');
      }

      if (authRes.ok && authJson.data) {
        setAuthors(authJson.data || []);
      }
    } catch {
      showToast('error', 'Connection error while loading data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Export to CSV
  const handleExportCSV = () => {
    if (categories.length === 0) return;

    const headers = ['ID', 'Name', 'Slug', 'Author', 'Shortnote', 'Status', 'Contents Count', 'FAQs Count'];
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

  // Open Add Modal
  const handleOpenAdd = () => {
    setEditingId(null);
    setActiveTab('basic');
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
      const url = editingId
        ? `/api/v1/admin/course-categories/${editingId}`
        : '/api/v1/admin/course-categories';
      const method = editingId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
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

    try {
      const res = await fetch(`/api/v1/admin/course-categories/${id}`, { method: 'DELETE' });
      const json = await res.json();
      if (res.ok && json.status) {
        showToast('success', `Category "${name}" deleted successfully`);
        fetchData();
      } else {
        showToast('error', json.message || 'Failed to delete category');
      }
    } catch {
      showToast('error', 'Connection error while deleting category');
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
          <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-extrabold text-indigo-600 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-full uppercase tracking-wider">
                Course Categories
              </span>
            </div>
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight mt-0.5">Course Categories List</h1>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Manage academic course disciplines, SEO metadata, image assets, contents, and FAQs.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchData}
            className="p-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
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
            onClick={handleOpenAdd}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Category</span>
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
            placeholder="Search name, slug, author..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-100 transition-all"
          />
        </div>

        <div className="flex items-center gap-4 text-xs font-semibold text-slate-500">
          <div>
            Total: <span className="text-slate-900 font-bold">{categories.length}</span>
          </div>
          <div className="h-3 w-px bg-slate-200" />
          <div>
            Active: <span className="text-emerald-600 font-bold">{categories.filter((c) => c.status === 1).length}</span>
          </div>
        </div>
      </div>

      {/* Main Rich Data Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 flex flex-col items-center justify-center text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mb-3" />
            <p className="text-xs font-semibold">Loading course categories...</p>
          </div>
        ) : filteredCategories.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <GraduationCap className="w-12 h-12 mx-auto mb-3 text-slate-300" />
            <p className="text-sm font-bold text-slate-700">No Course Categories Found</p>
            <p className="text-xs text-slate-400 mt-1">Try searching another term or add a new category.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200/80 text-slate-500 font-extrabold uppercase tracking-wider text-[10.5px]">
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
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {paginatedCategories.map((item, index) => {
                  const srNo = (currentPage - 1) * itemsPerPage + index + 1;
                  return (
                  <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-4 px-4 text-center font-extrabold text-slate-700">{srNo}</td>
                    <td className="py-4 px-4 text-center font-bold text-slate-400">#{item.id}</td>
                    <td className="py-4 px-5 max-w-xs">
                      <div className="font-bold text-slate-900 text-xs leading-snug">{item.name}</div>
                      <div className="text-[11px] font-mono text-slate-400 mt-0.5 truncate">{item.slug}</div>
                    </td>

                    {/* Shortnote Column */}
                    <td className="py-4 px-4">
                      {item.shortnote ? (
                        <button
                          onClick={() => setPreviewShortnote(item)}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-indigo-200 bg-indigo-50/70 text-indigo-700 text-[11px] font-bold hover:bg-indigo-100 transition-colors cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View</span>
                        </button>
                      ) : (
                        <span className="text-slate-400 italic text-[11px]">N/A</span>
                      )}
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
                          <span className="text-slate-400 font-semibold">Content Img:</span>
                          {item.content_image_path ? (
                            <button
                              onClick={() => setPreviewImage({ title: 'Content Image', url: item.content_image_path! })}
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

                    {/* More Details Column */}
                    <td className="py-4 px-5">
                      <div className="space-y-1 text-[11px]">
                        <div className="flex items-center gap-1.5">
                          <User className="w-3 h-3 text-slate-400" />
                          <span className="text-slate-500">Author:</span>
                          <span className="font-bold text-slate-800">{item.author_name || 'Team Education Malaysia'}</span>
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
                      <div className="flex items-center justify-end gap-2">
                        {/* Sub-module 1: Content Badge */}
                        <button
                          onClick={() => navigate(`/course-category-contents/${item.id}`)}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[11px] shadow-sm transition-all cursor-pointer"
                          title="Manage Category Content Tabs in Dedicated Editor"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span>Content</span>
                          <span className="bg-indigo-800 text-white px-1.5 py-0.5 rounded-full text-[9.5px]">
                            {item.contents_count || 0}
                          </span>
                        </button>

                        {/* Sub-module 2: FAQs Badge */}
                        <button
                          onClick={() => handleOpenFaqsModal(item)}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-700 text-white font-bold text-[11px] shadow-sm transition-all cursor-pointer"
                          title="Manage Category FAQs"
                        >
                          <HelpCircle className="w-3.5 h-3.5" />
                          <span>Faqs</span>
                          <span className="bg-sky-800 text-white px-1.5 py-0.5 rounded-full text-[9.5px]">
                            {item.faqs_count || 0}
                          </span>
                        </button>

                        <button
                          onClick={() => handleOpenEdit(item)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors cursor-pointer"
                          title="Edit Category"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => handleDelete(item.id, item.name)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
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
                        type="text"
                        placeholder="uploads/og_image.jpg"
                        value={formData.og_image_path}
                        onChange={(e) => setFormData({ ...formData, og_image_path: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-100 transition-all"
                      />
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'images' && (
                <>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Thumbnail Image Path</label>
                    <input
                      type="text"
                      placeholder="uploads/category/thumbnail.jpg"
                      value={formData.thumbnail_path}
                      onChange={(e) => setFormData({ ...formData, thumbnail_path: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-100 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Banner Image Path</label>
                    <input
                      type="text"
                      placeholder="uploads/category/banner.jpg"
                      value={formData.banner_path}
                      onChange={(e) => setFormData({ ...formData, banner_path: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-100 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Content Image Path</label>
                    <input
                      type="text"
                      placeholder="uploads/category/content.jpg"
                      value={formData.content_image_path}
                      onChange={(e) => setFormData({ ...formData, content_image_path: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-100 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">OG Image Path</label>
                    <input
                      type="text"
                      placeholder="uploads/category/og.jpg"
                      value={formData.og_image_path}
                      onChange={(e) => setFormData({ ...formData, og_image_path: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-100 transition-all"
                    />
                  </div>
                </>
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
                src={previewImage.url.startsWith('http') ? previewImage.url : `/${previewImage.url}`}
                alt={previewImage.title}
                className="max-h-64 object-contain rounded-lg shadow-md"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
              <span className="text-[11px] font-mono text-slate-500 mt-3 break-all">{previewImage.url}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
