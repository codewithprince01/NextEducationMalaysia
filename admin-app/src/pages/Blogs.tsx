import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { confirmDelete } from '@/lib/swal';
import Pagination from '@/components/common/Pagination';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Loader2,
  RefreshCw,
  Eye,
  EyeOff,
  UserCheck,
  FolderOpen
} from 'lucide-react';

interface BlogItem {
  id: number;
  title: string;
  headline?: string;
  slug: string;
  thumbnail_path?: string;
  category_id?: number;
  author_id?: number;
  status: number;
  created_at?: string;
  category?: { id: number; category_name: string };
  author?: { id: number; name: string };
  _count?: { contents: number; faqs: number };
}

interface CategoryOption {
  id: number;
  category_name: string;
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
  const itemsPerPage = 15;

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
    const confirmed = await confirmDelete(item.title);
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

  const filteredBlogs = blogs.filter(
    (b) =>
      (b.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (b.slug || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(filteredBlogs.length / itemsPerPage);
  const currentBlogs = filteredBlogs.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="space-y-3">
      {/* Toast */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-2xl shadow-xl flex items-center gap-3 text-sm font-semibold transition-all ${toast.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'
            }`}
        >
          <span>{toast.message}</span>
        </div>
      )}

      {/* Header */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-[11px] font-extrabold uppercase tracking-widest text-blue-700 block">
              CONTENT MANAGEMENT
            </span>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              All Blogs &amp; Articles
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchBlogs}
              className="p-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <Link
              to="/blogs/create"
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white font-bold text-xs shadow-md shadow-blue-600/20 flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              Create New Blog
            </Link>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search blogs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:border-blue-600"
            />
          </div>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full sm:w-64 px-3.5 py-2 rounded-xl border border-slate-200 text-slate-800 text-xs font-semibold focus:outline-none focus:border-blue-600"
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
          Total Posts: {filteredBlogs.length}
        </span>
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200/80 rounded-3xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-12 flex flex-col items-center justify-center text-slate-500">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-3" />
            <p className="text-xs font-semibold">Loading blogs...</p>
          </div>
        ) : filteredBlogs.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <p className="text-sm font-semibold">No blog posts found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/50 text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                  <th className="py-4 px-5">Sr. No</th>
                  <th className="py-4 px-5">Category</th>
                  <th className="py-4 px-5">Title</th>
                  <th className="py-4 px-5">Description</th>
                  <th className="py-4 px-5">Thumbnail</th>
                  <th className="py-4 px-5">Author</th>
                  <th className="py-4 px-5">Status</th>
                  <th className="py-4 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
                {currentBlogs.map((item, index) => (
                  <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-5 font-bold text-slate-400 text-xs">
                      {(currentPage - 1) * itemsPerPage + index + 1}
                    </td>
                    <td className="py-3.5 px-5">
                      {item.category ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 font-bold text-[11px]">
                          <FolderOpen className="w-3 h-3 text-blue-600" />
                          {item.category.category_name}
                        </span>
                      ) : (
                        <span className="text-slate-400 text-[11px]">Uncategorized</span>
                      )}
                    </td>
                    <td className="py-3.5 px-5 max-w-[220px]">
                      <div className="font-extrabold text-slate-900 text-xs truncate">{item.title}</div>
                      <div className="text-[10px] font-mono text-slate-400 truncate">{item.slug}</div>
                    </td>
                    <td className="py-3.5 px-5 max-w-[180px]">
                      {item.headline ? (
                        <span className="text-[11px] text-slate-600 line-clamp-2">{item.headline}</span>
                      ) : (
                        <span className="text-slate-300 text-[11px]">N/A</span>
                      )}
                    </td>
                    <td className="py-3.5 px-5">
                      {item.thumbnail_path ? (
                        <img
                          src={item.thumbnail_path}
                          alt={item.title}
                          className="w-12 h-9 object-cover rounded-lg border border-slate-200"
                          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                        />
                      ) : (
                        <span className="text-slate-300 text-[11px]">N/A</span>
                      )}
                    </td>
                    <td className="py-3.5 px-5">
                      {item.author ? (
                        <span className="inline-flex items-center gap-1 font-semibold text-slate-700 text-xs">
                          <UserCheck className="w-3.5 h-3.5 text-purple-600" />
                          {item.author.name}
                        </span>
                      ) : (
                        <span className="text-slate-400 text-xs">Admin</span>
                      )}
                    </td>
                    <td className="py-3.5 px-5">
                      {item.status === 1 ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-600 font-bold text-[11px]">
                          <Eye className="w-3 h-3" /> Approved
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 text-amber-600 font-bold text-[11px]">
                          <EyeOff className="w-3 h-3" /> Draft
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => navigate(`/blogs/edit/${item.id}`)}
                          className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:text-blue-600 hover:border-blue-200 transition-colors"
                          title="Edit"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(item)}
                          className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:text-rose-600 hover:border-rose-200 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
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
            />
          </div>
        )}
      </div>
    </div>
  );
}
