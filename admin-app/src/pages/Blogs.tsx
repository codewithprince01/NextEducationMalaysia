import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { confirmDelete } from '@/lib/swal';
import Pagination from '@/components/common/Pagination';
import RichTextEditor from '@/components/common/RichTextEditor';
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
  AlertCircle
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

  const fetchBlogs = async () => {
    setLoading(true);
    try {
      const query = selectedCategory ? `?category_id=${selectedCategory}` : '';
      const res = await fetch(`/api/v1/admin/blogs${query}`);
      const json = await res.json();
      if (res.ok && json.success) {
        setBlogs(json.data || []);
      } else {
        showToast('error', json.error || 'Failed to fetch blogs');
      }
    } catch {
      showToast('error', 'Network error while fetching blogs');
    } finally {
      setLoading(false);
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

    try {
      const res = await fetch(`/api/v1/admin/blogs/${item.id}`, {
        method: 'DELETE',
      });
      const json = await res.json();
      if (res.ok && json.success) {
        showToast('success', 'Blog deleted successfully');
        setBlogs((prev) => prev.filter((b) => b.id !== item.id));
      } else {
        showToast('error', json.error || 'Failed to delete blog');
      }
    } catch {
      showToast('error', 'Error deleting blog');
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

      {/* Header */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
              <FileText className="w-5 h-5" />
            </div>
            <span>Blog Records</span>
          </h1>
          <p className="text-xs font-medium text-slate-500 mt-1">
            Manage blog posts, categories, content sub-sections, and FAQs.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchBlogs}
            className="p-2.5 rounded-xl border border-slate-200 text-slate-600 hover:text-blue-600 hover:bg-blue-50/80 transition-all cursor-pointer"
            title="Refresh Data"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <Link
            to="/blogs/create"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs shadow-md shadow-blue-600/20 transition-all cursor-pointer whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Blog</span>
          </Link>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-72">
            <Search className="w-3.5 h-3.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search blogs title or slug..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:border-blue-600 bg-slate-50 focus:bg-white transition-all"
            />
          </div>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full sm:w-64 px-3.5 py-2 rounded-xl border border-slate-200 text-slate-800 text-xs font-semibold focus:outline-none focus:border-blue-600 bg-slate-50 focus:bg-white transition-all"
          >
            <option value="">-- All Categories --</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.category_name}
              </option>
            ))}
          </select>
        </div>

        <span className="text-xs font-bold text-slate-500">
          Showing <span className="font-extrabold text-slate-800">{filteredBlogs.length}</span> entries
        </span>
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-xs">
        {loading ? (
          <div className="p-12 flex flex-col items-center justify-center text-slate-500">
            <Loader2 className="w-6 h-6 animate-spin text-blue-600 mb-2" />
            <p className="text-xs font-semibold">Loading blogs...</p>
          </div>
        ) : filteredBlogs.length === 0 ? (
          <div className="p-12 text-center text-slate-400 font-semibold text-xs">
            No blog posts found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs text-slate-600">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-700 font-bold uppercase tracking-wider">
                  <th className="py-3 px-4 w-14">Sr. No.</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Title</th>
                  <th className="py-3 px-4">Description</th>
                  <th className="py-3 px-4">Thumbnail</th>
                  <th className="py-3 px-4">Author</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Activity</th>
                  <th className="py-3 px-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {currentBlogs.map((item, index) => {
                  const categoryName = item.category?.category_name || item.category_name || 'Uncategorized';
                  const authorName = item.author?.name || item.author_name || 'Team Education Malaysia';

                  return (
                    <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4 font-semibold text-slate-500">
                        {(currentPage - 1) * itemsPerPage + index + 1}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-800">
                        <span className="inline-flex items-center gap-1">
                          <FolderOpen className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                          {categoryName}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 max-w-xs font-semibold text-slate-800">
                        {item.title || item.headline}
                      </td>
                      <td className="py-3.5 px-4">
                        <button
                          onClick={() => setDescriptionModalItem(item)}
                          className="px-2.5 py-1 bg-cyan-50 text-cyan-600 border border-cyan-200 hover:bg-cyan-100 rounded text-xs font-bold transition-colors cursor-pointer"
                        >
                          View
                        </button>
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
                      <td className="py-3.5 px-4 font-medium text-slate-700">
                        <span className="inline-flex items-center gap-1">
                          <UserCheck className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                          {authorName}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        {item.status === 1 ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/80">
                            Approved
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200/80">
                            Draft
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 space-y-1 text-[11px]">
                        <div>
                          <span className="text-slate-400 font-medium">Created: </span>
                          <span className="inline-block px-1.5 py-0.2 rounded bg-indigo-100 text-indigo-800 font-bold">
                            {item.creator_name || authorName}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-400 font-medium">Updated: </span>
                          <span className="inline-block px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 font-bold">
                            {item.updater_name || authorName}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-400 font-medium">Approved: </span>
                          <span className="inline-block px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 font-bold">
                            {item.approver_name || (item.status === 1 ? item.creator_name || authorName : 'Pending')}
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 space-y-1">
                        <div>
                          <button
                            onClick={() => handleOpenContents(item)}
                            className="px-2 py-1 bg-indigo-50 text-indigo-700 border border-indigo-200 hover:bg-indigo-100 rounded text-[11px] font-bold transition-colors inline-flex items-center gap-1 cursor-pointer"
                          >
                            <span>Content</span>
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
                        <div className="flex items-center justify-center gap-1 pt-1">
                          <button
                            onClick={() => navigate(`/blogs/edit/${item.id}`)}
                            className="p-1.5 bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white rounded transition-colors"
                            title="Edit"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(item)}
                            className="p-1.5 bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white rounded transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
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
          <div className="p-4 border-t border-slate-100">
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
                    onChange={(val) => setContentFormData({ ...contentFormData, description: val })}
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
    </div>
  );
}
