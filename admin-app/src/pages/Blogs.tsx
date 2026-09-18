import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { confirmDelete } from '@/lib/swal';
import Pagination from '@/components/common/Pagination';
import RichTextEditor from '@/components/common/RichTextEditor';
import { getStorageUrl } from '@/lib/uploadHelper';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Loader2,
  RefreshCw,
  UserCheck,
  FolderOpen,
  X,
  FileText,
  HelpCircle,
  Layers,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  ExternalLink
} from 'lucide-react';

interface BlogItem {
  id: number;
  title: string;
  headline?: string;
  slug: string;
  description?: string;
  thumbnail_path?: string;
  category_id?: number;
  author_id?: number;
  status: number;
  created_at?: string;
  updated_at?: string;
  category_name?: string;
  author_name?: string;
  creator_name?: string;
  updater_name?: string;
  approver_name?: string;
  contents_count?: number;
  faqs_count?: number;
  category?: { id: number; category_name: string };
  author?: { id: number; name: string };
}

interface CategoryOption {
  id: number;
  category_name: string;
}

interface BlogContentItem {
  id: number;
  blog_id: number;
  title: string;
  slug?: string;
  description: string;
  position: number;
  parent_id?: number | null;
  parent_title?: string;
}

interface BlogFaqItem {
  id: number;
  blog_id: number;
  question: string;
  answer: string;
}

export default function Blogs() {
  const navigate = useNavigate();
  const [blogs, setBlogs] = useState<BlogItem[]>([]);
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Description Modal State
  const [descriptionModalItem, setDescriptionModalItem] = useState<BlogItem | null>(null);

  // Image Preview Modal
  const [previewImage, setPreviewImage] = useState<{ title: string; url: string } | null>(null);

  // Blog Contents Manager Modal
  const [contentManagerItem, setContentManagerItem] = useState<BlogItem | null>(null);
  const [contentsList, setContentsList] = useState<BlogContentItem[]>([]);
  const [loadingContents, setLoadingContents] = useState(false);
  const [editingContentId, setEditingContentId] = useState<number | null>(null);
  const [contentFormData, setContentFormData] = useState({
    title: '',
    description: '',
    position: 1,
    parent_id: '',
  });

  // Blog FAQs Manager Modal
  const [faqManagerItem, setFaqManagerItem] = useState<BlogItem | null>(null);
  const [faqsList, setFaqsList] = useState<BlogFaqItem[]>([]);
  const [loadingFaqs, setLoadingFaqs] = useState(false);
  const [editingFaqId, setEditingFaqId] = useState<number | null>(null);
  const [faqFormData, setFaqFormData] = useState({ question: '', answer: '' });

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/v1/admin/blog-categories');
      const json = await res.json();
      if (res.ok && json.success) setCategories(json.data || []);
    } catch {
      console.error('Failed to fetch categories');
    }
  };

  const fetchBlogs = async (showLoading = true) => {
    if (showLoading) setLoading(true);
    try {
      const query = selectedCategory ? `?category_id=${selectedCategory}` : '';
      const res = await fetch(`/api/v1/admin/blogs${query}`);
      const json = await res.json();
      if (res.ok && json.success) {
        setBlogs(json.data || []);
      } else {
        if (showLoading) showToast('error', json.error || 'Failed to fetch blogs');
      }
    } catch {
      if (showLoading) showToast('error', 'Network error while fetching blogs');
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchBlogs();
  }, []);

  useEffect(() => {
    fetchBlogs();
  }, [selectedCategory]);

  const handleDelete = async (item: BlogItem) => {
    const confirmed = await confirmDelete(item.title || 'this blog post');
    if (!confirmed) return;

    // Optimistic UI update
    setBlogs((prev) => prev.filter((b) => b.id !== item.id));

    try {
      const res = await fetch(`/api/v1/admin/blogs/${item.id}`, {
        method: 'DELETE',
      });
      const json = await res.json();
      if (res.ok && json.success) {
        showToast('success', 'Blog deleted successfully');
        fetchBlogs(false);
      } else {
        showToast('error', json.error || 'Failed to delete blog');
        fetchBlogs(false);
      }
    } catch {
      showToast('error', 'Error deleting blog');
      fetchBlogs(false);
    }
  };

  // --- CONTENTS MANAGER HANDLERS ---
  const fetchContents = async (blog_id: number) => {
    setLoadingContents(true);
    try {
      const res = await fetch(`/api/v1/admin/blog-contents?blog_id=${blog_id}`);
      if (res.ok) {
        const json = await res.json();
        setContentsList(json.data || []);
        setContentFormData({ title: '', description: '', position: (json.data || []).length + 1, parent_id: '' });
      }
    } catch {
      setContentsList([]);
    } finally {
      setLoadingContents(false);
    }
  };

  const handleOpenContents = (item: BlogItem) => {
    setContentManagerItem(item);
    setEditingContentId(null);
    fetchContents(item.id);
  };

  const handleSaveContent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contentManagerItem || !contentFormData.title || !contentFormData.description) return;

    try {
      const url = editingContentId
        ? `/api/v1/admin/blog-contents/${editingContentId}`
        : '/api/v1/admin/blog-contents';
      const method = editingContentId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          blog_id: contentManagerItem.id,
          ...contentFormData,
        }),
      });

      if (res.ok) {
        showToast('success', 'Blog content saved successfully');
        setEditingContentId(null);
        fetchContents(contentManagerItem.id);
        fetchBlogs();
      }
    } catch {
      showToast('error', 'Error saving blog content');
    }
  };

  const handleDeleteContent = async (id: number) => {
    if (!confirm('Delete this content entry?')) return;
    try {
      const res = await fetch(`/api/v1/admin/blog-contents/${id}`, { method: 'DELETE' });
      if (res.ok && contentManagerItem) {
        fetchContents(contentManagerItem.id);
        fetchBlogs();
      }
    } catch {
      showToast('error', 'Failed to delete content');
    }
  };

  // --- FAQS MANAGER HANDLERS ---
  const fetchFaqs = async (blog_id: number) => {
    setLoadingFaqs(true);
    try {
      const res = await fetch(`/api/v1/admin/blog-faqs?blog_id=${blog_id}`);
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

  const handleOpenFaqs = (item: BlogItem) => {
    setFaqManagerItem(item);
    setEditingFaqId(null);
    fetchFaqs(item.id);
  };

  const handleSaveFaq = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!faqManagerItem || !faqFormData.question || !faqFormData.answer) return;

    try {
      const url = editingFaqId
        ? `/api/v1/admin/blog-faqs/${editingFaqId}`
        : '/api/v1/admin/blog-faqs';
      const method = editingFaqId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          blog_id: faqManagerItem.id,
          ...faqFormData,
        }),
      });

      if (res.ok) {
        showToast('success', 'FAQ saved successfully');
        setEditingFaqId(null);
        fetchFaqs(faqManagerItem.id);
        fetchBlogs();
      }
    } catch {
      showToast('error', 'Error saving FAQ');
    }
  };

  const handleDeleteFaq = async (id: number) => {
    if (!confirm('Delete this FAQ entry?')) return;
    try {
      const res = await fetch(`/api/v1/admin/blog-faqs/${id}`, { method: 'DELETE' });
      if (res.ok && faqManagerItem) {
        fetchFaqs(faqManagerItem.id);
        fetchBlogs();
      }
    } catch {
      showToast('error', 'Failed to delete FAQ');
    }
  };

  const filteredBlogs = blogs.filter(
    (b) =>
      (b.title || b.headline || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (b.slug || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(filteredBlogs.length / itemsPerPage);
  const currentBlogs = filteredBlogs.slice(
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
                <FileText className="w-3 h-3 text-amber-700" />
                <span>Editorial & Publications</span>
              </span>
              <span className="text-[11px] font-bold text-stone-600 bg-stone-100 px-2.5 py-0.5 rounded-full border border-stone-200">
                Education Malaysia
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight font-serif">
              Blog & Article Publications
            </h1>
            <p className="text-xs sm:text-sm text-stone-500 font-medium leading-relaxed">
              Curate and publish educational articles, university insights, study guides, structured contents, and student FAQs.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              onClick={() => fetchBlogs()}
              disabled={loading}
              className="p-2.5 rounded-xl border border-stone-200 bg-stone-50/70 hover:bg-stone-100 text-stone-700 transition-colors cursor-pointer disabled:opacity-50 shadow-2xs"
              title="Refresh articles"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-stone-600' : ''}`} />
            </button>

            <Link
              to="/blogs/create"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs shadow-md shadow-stone-900/15 transition-all cursor-pointer whitespace-nowrap"
            >
              <Plus className="w-4 h-4 text-amber-300" />
              <span>Add New Blog</span>
            </Link>
          </div>
        </div>

        {/* ── COMPACT METRIC STAT PILLS ── */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-4 pt-3.5 border-t border-stone-100 text-xs">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#faf8f4] border border-stone-200/90 text-stone-700">
            <span className="text-stone-500 text-[11px] font-medium uppercase tracking-wider">Total Articles:</span>
            <span className="font-extrabold text-stone-900">{loading ? '...' : blogs.length}</span>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-50/70 border border-emerald-200/80 text-emerald-900">
            <span className="text-emerald-700 text-[11px] font-medium uppercase tracking-wider">Published:</span>
            <span className="font-extrabold text-emerald-800">{loading ? '...' : blogs.filter((b) => b.status === 1).length}</span>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-amber-50/70 border border-amber-200/80 text-amber-900">
            <span className="text-amber-700 text-[11px] font-medium uppercase tracking-wider">Topics:</span>
            <span className="font-extrabold text-amber-900">{categories.length}</span>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-indigo-50/70 border border-indigo-200/80 text-indigo-900">
            <span className="text-indigo-700 text-[11px] font-medium uppercase tracking-wider">Drafts:</span>
            <span className="font-extrabold text-indigo-900">{loading ? '...' : blogs.filter((b) => b.status !== 1).length}</span>
          </div>
        </div>
      </div>

      {/* ── SEARCH & FILTER CONTROLS ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-stone-200/90 shadow-xs">
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search by article title or slug..."
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

          <div className="relative w-full sm:w-64">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full bg-stone-50/70 border border-stone-200/90 rounded-xl px-3 py-2 text-xs font-bold text-stone-700 focus:outline-none focus:border-amber-600 focus:bg-white cursor-pointer"
            >
              <option value="">-- All Categories ({categories.length}) --</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.category_name}
                </option>
              ))}
            </select>
          </div>

          {(searchQuery || selectedCategory) && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('');
              }}
              className="px-3 py-2 rounded-xl text-xs font-bold text-amber-800 hover:bg-amber-50 cursor-pointer transition-colors"
            >
              Reset Filters
            </button>
          )}
        </div>

        <div className="flex items-center gap-3 text-xs font-semibold text-stone-500 shrink-0">
          <span>Showing</span>
          <span className="px-2.5 py-1 rounded-lg bg-stone-100 font-bold text-stone-900 border border-stone-200">
            {filteredBlogs.length} {filteredBlogs.length === 1 ? 'Article' : 'Articles'}
          </span>
        </div>
      </div>

      {/* ── MAIN DATA TABLE ── */}
      <div className="bg-white rounded-3xl border border-stone-200/90 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-16 flex flex-col items-center justify-center text-stone-400">
            <Loader2 className="w-8 h-8 animate-spin text-amber-700 mb-2" />
            <p className="text-xs font-bold text-stone-700">Loading blog articles...</p>
          </div>
        ) : filteredBlogs.length === 0 ? (
          <div className="p-16 text-center text-stone-400">
            <p className="text-sm font-black text-stone-800 font-serif">No Blog Posts Found</p>
            <p className="text-xs text-stone-500 mt-1">Try resetting search filters or create a new blog entry.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#eef5ff] border-b-2 border-[#cfe0fc] text-[#1e40af] font-extrabold uppercase tracking-wider text-[11px]">
                  <th className="py-3.5 px-4 w-12 text-center text-blue-700">#</th>
                  <th className="py-3.5 px-4 min-w-[140px] text-[#1e40af]">Category</th>
                  <th className="py-3.5 px-4 min-w-[240px] text-[#1e40af]">Article Title</th>
                  <th className="py-3.5 px-4 w-24 text-[#1e40af]">Description</th>
                  <th className="py-3.5 px-4 w-28 text-[#1e40af]">Thumbnail</th>
                  <th className="py-3.5 px-4 min-w-[140px] text-[#1e40af]">Author</th>
                  <th className="py-3.5 px-4 text-center w-24 text-[#1e40af]">Status</th>
                  <th className="py-3.5 px-4 min-w-[140px] text-[#1e40af]">Sub Modules</th>
                  <th className="py-3.5 px-4 text-right w-24 text-[#1e40af]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 font-medium text-stone-700">
                {currentBlogs.map((item, index) => {
                  const categoryName = item.category?.category_name || item.category_name || 'Uncategorized';
                  const authorName = item.author?.name || item.author_name || 'Team Education Malaysia';

                  return (
                    <tr key={item.id} className="hover:bg-[#fbfaf7] transition-colors group">
                      <td className="py-4 px-4 text-center font-bold text-stone-400 font-mono text-[11px]">
                        {(currentPage - 1) * itemsPerPage + index + 1}
                      </td>

                      <td className="py-4 px-4">
                        <span className="inline-flex items-center gap-1 font-bold text-amber-900 bg-amber-50 border border-amber-200/60 px-2 py-0.5 rounded-md text-[11px]">
                          <FolderOpen className="w-3 h-3 text-amber-700 shrink-0" />
                          <span>{categoryName}</span>
                        </span>
                      </td>

                      <td className="py-4 px-4">
                        <div className="font-extrabold text-stone-900 text-xs sm:text-sm leading-snug hover:text-amber-800 transition-colors">
                          {item.title || item.headline}
                        </div>
                        {item.slug && (
                          <div className="text-[10.5px] font-mono text-stone-400 mt-0.5 truncate max-w-xs">
                            /{item.slug}
                          </div>
                        )}
                      </td>

                      <td className="py-4 px-4">
                        <button
                          onClick={() => setDescriptionModalItem(item)}
                          className="px-2.5 py-1 bg-stone-100 hover:bg-stone-200 text-stone-800 border border-stone-200/80 rounded-lg text-[10.5px] font-bold transition-colors cursor-pointer shadow-2xs"
                        >
                          View Text
                        </button>
                      </td>

                      <td className="py-4 px-4">
                        {item.thumbnail_path ? (
                          <button
                            type="button"
                            onClick={() =>
                              setPreviewImage({
                                title: item.title || item.headline || 'Blog Thumbnail',
                                url: item.thumbnail_path!,
                              })
                            }
                            className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200/60 rounded-lg text-[10.5px] font-bold cursor-pointer transition-colors shadow-2xs"
                          >
                            <ImageIcon className="w-3 h-3 text-amber-700" />
                            <span>Preview</span>
                          </button>
                        ) : (
                          <span className="text-stone-400">—</span>
                        )}
                      </td>

                      <td className="py-4 px-4 font-semibold text-stone-800 text-[11px]">
                        <span className="inline-flex items-center gap-1.5">
                          <UserCheck className="w-3.5 h-3.5 text-stone-500 shrink-0" />
                          <span>{authorName}</span>
                        </span>
                      </td>

                      <td className="py-4 px-4 text-center">
                        {item.status === 1 ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                            Approved
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-stone-100 text-stone-600 border border-stone-200">
                            Draft
                          </span>
                        )}
                      </td>

                      <td className="py-4 px-4 space-y-1">
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleOpenContents(item)}
                            className="px-2 py-1 bg-stone-100 hover:bg-stone-200 text-stone-800 border border-stone-200 rounded-lg text-[10.5px] font-bold transition-colors inline-flex items-center gap-1 cursor-pointer shadow-2xs"
                          >
                            <span>Content</span>
                            <span className="px-1.5 py-0.5 bg-stone-200 text-stone-800 rounded-md text-[9px] font-extrabold">
                              {item.contents_count ?? 0}
                            </span>
                          </button>
                          <button
                            onClick={() => handleOpenFaqs(item)}
                            className="px-2 py-1 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 rounded-lg text-[10.5px] font-bold transition-colors inline-flex items-center gap-1 cursor-pointer shadow-2xs"
                          >
                            <span>FAQs</span>
                            <span className="px-1.5 py-0.5 bg-amber-100 text-amber-900 rounded-md text-[9px] font-extrabold">
                              {item.faqs_count ?? 0}
                            </span>
                          </button>
                        </div>
                      </td>

                      <td className="py-4 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => navigate(`/blogs/edit/${item.id}`)}
                            className="p-1.5 rounded-lg bg-stone-900 hover:bg-stone-800 text-white transition-colors cursor-pointer"
                            title="Edit Blog"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(item)}
                            className="p-1.5 rounded-lg bg-stone-100 hover:bg-rose-50 text-stone-500 hover:text-rose-600 border border-stone-200 transition-colors cursor-pointer"
                            title="Delete Blog"
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
          </div>
        )}

        {totalPages > 1 && (
          <div className="p-4 border-t border-stone-100 bg-[#faf8f4]/60">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={(p) => setCurrentPage(p)}
              totalItems={filteredBlogs.length}
              itemsPerPage={itemsPerPage}
            />
          </div>
        )}
      </div>

      {/* ── MODAL: DESCRIPTION VIEW ── */}
      {descriptionModalItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-100 w-full max-w-lg overflow-hidden animate-fadeIn">
            <div className="flex items-center justify-between px-5 py-3.5 bg-slate-50 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-800">Blog Description Detail</h3>
              <button onClick={() => setDescriptionModalItem(null)} className="text-slate-400 hover:text-slate-600 p-1">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-5 text-xs text-slate-700 space-y-2 max-h-96 overflow-y-auto">
              <h4 className="font-bold text-slate-900 text-sm mb-2">{descriptionModalItem.title || descriptionModalItem.headline}</h4>
              <div
                className="prose prose-xs max-w-none"
                dangerouslySetInnerHTML={{ __html: descriptionModalItem.description || '<p class="text-slate-400 italic">No description provided.</p>' }}
              />
            </div>
            <div className="p-3 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setDescriptionModalItem(null)}
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
                  <Layers className="w-4 h-4 text-indigo-600" /> Blog Contents
                </h3>
                <span className="text-xs text-indigo-700 font-medium">{contentManagerItem.title || contentManagerItem.headline}</span>
              </div>
              <button onClick={() => setContentManagerItem(null)} className="text-indigo-400 hover:text-indigo-700 p-1">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-5 flex-1">
              {/* Form to Add/Edit Content */}
              <form onSubmit={handleSaveContent} className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                <h4 className="text-xs font-bold text-slate-700 uppercase">
                  {editingContentId ? 'Edit Content Section' : 'Add Content Section'}
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Section Title</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Introduction, Benefits"
                      value={contentFormData.title}
                      onChange={(e) => setContentFormData({ ...contentFormData, title: e.target.value })}
                      className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Display Position</label>
                    <input
                      type="number"
                      required
                      value={contentFormData.position}
                      onChange={(e) => setContentFormData({ ...contentFormData, position: parseInt(e.target.value, 10) || 1 })}
                      className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Parent Title (Optional)</label>
                    <select
                      value={contentFormData.parent_id}
                      onChange={(e) => setContentFormData({ ...contentFormData, parent_id: e.target.value })}
                      className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="">Select Parent</option>
                      {contentsList
                        .filter((c) => c.id !== editingContentId && !c.parent_id)
                        .map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.title}
                          </option>
                        ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Section Description</label>
                  <RichTextEditor
                    value={contentFormData.description}
                    onChange={(val) => setContentFormData(prev => ({ ...prev, description: val }))}
                    placeholder="Detailed section content..."
                  />
                </div>

                <div className="flex justify-end gap-2">
                  {editingContentId && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingContentId(null);
                        setContentFormData({ title: '', description: '', position: contentsList.length + 1, parent_id: '' });
                      }}
                      className="px-3 py-1.5 bg-slate-200 text-slate-700 rounded text-xs font-bold"
                    >
                      Cancel Edit
                    </button>
                  )}
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-indigo-600 text-white rounded text-xs font-bold hover:bg-indigo-700 transition-colors cursor-pointer"
                  >
                    {editingContentId ? 'Update Section' : 'Add Section'}
                  </button>
                </div>
              </form>

              {/* Contents Table */}
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 text-slate-700 font-bold uppercase">
                    <tr>
                      <th className="py-2.5 px-3 w-12">Pos</th>
                      <th className="py-2.5 px-3">Title</th>
                      <th className="py-2.5 px-3">Description</th>
                      <th className="py-2.5 px-3">Parent Title</th>
                      <th className="py-2.5 px-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {loadingContents ? (
                      <tr>
                        <td colSpan={5} className="py-6 text-center text-slate-400">Loading contents...</td>
                      </tr>
                    ) : contentsList.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-6 text-center text-slate-400">No content sections added yet.</td>
                      </tr>
                    ) : (
                      contentsList.map((c) => (
                        <tr key={c.id} className="hover:bg-slate-50">
                          <td className="py-2.5 px-3 font-bold text-slate-500">{c.position}</td>
                          <td className="py-2.5 px-3 font-bold text-indigo-700">{c.title}</td>
                          <td className="py-2.5 px-3 text-slate-600 max-w-xs truncate">
                            {c.description.replace(/<[^>]+>/g, '')}
                          </td>
                          <td className="py-2.5 px-3 font-medium text-slate-500">{c.parent_title || 'N/A'}</td>
                          <td className="py-2.5 px-3 text-right">
                            <div className="flex justify-end gap-1">
                              <button
                                onClick={() => {
                                  setEditingContentId(c.id);
                                  setContentFormData({
                                    title: c.title,
                                    description: c.description,
                                    position: c.position,
                                    parent_id: c.parent_id ? c.parent_id.toString() : '',
                                  });
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
                className="px-4 py-1.5 bg-slate-200 text-slate-700 hover:bg-slate-300 rounded text-xs font-bold transition-colors cursor-pointer"
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
                  <HelpCircle className="w-4 h-4 text-rose-600" /> Blog FAQs
                </h3>
                <span className="text-xs text-rose-700 font-medium">{faqManagerItem.title || faqManagerItem.headline}</span>
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
                  <textarea
                    rows={3}
                    placeholder="Enter answer..."
                    value={faqFormData.answer}
                    onChange={(e) => setFaqFormData({ ...faqFormData, answer: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 transition-all resize-y"
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
                    className="px-4 py-1.5 bg-rose-600 text-white rounded text-xs font-bold hover:bg-rose-700 transition-colors cursor-pointer"
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
                className="px-4 py-1.5 bg-slate-200 text-slate-700 hover:bg-slate-300 rounded text-xs font-bold transition-colors cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Image Preview Modal */}
      {previewImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-100 overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h3 className="font-extrabold text-slate-900 text-sm">{previewImage.title} Preview</h3>
              <button
                type="button"
                onClick={() => setPreviewImage(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 flex flex-col items-center justify-center bg-slate-50/50 min-h-[220px]">
              <img
                src={getStorageUrl(previewImage.url)}
                alt={previewImage.title}
                className="max-h-80 w-auto rounded-xl shadow-md border border-slate-200 object-contain bg-white p-1"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                  const parent = (e.target as HTMLElement).parentElement;
                  if (parent && !parent.querySelector('.img-error-msg')) {
                    const msg = document.createElement('div');
                    msg.className = 'img-error-msg text-xs text-rose-500 font-medium py-4 text-center';
                    msg.innerText = 'Unable to load image from storage.';
                    parent.appendChild(msg);
                  }
                }}
              />
              <a
                href={getStorageUrl(previewImage.url)}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-mono text-indigo-600 hover:underline mt-4 break-all flex items-center gap-1 font-semibold"
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
