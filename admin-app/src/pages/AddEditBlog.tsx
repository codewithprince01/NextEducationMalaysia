import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import RichTextEditor from '@/components/common/RichTextEditor';
import {
  ArrowLeft,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Save,
  Globe
} from 'lucide-react';

interface CategoryOption {
  id: number;
  category_name: string;
}

interface AuthorOption {
  id: number;
  name: string;
}

export default function AddEditBlog() {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();

  const isEdit = Boolean(id);
  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [authors, setAuthors] = useState<AuthorOption[]>([]);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    headline: '',
    slug: '',
    short_description: '',
    description: '',
    thumbnail_path: '',
    category_id: '',
    author_id: '',
    status: 1,
    meta_title: '',
    meta_description: '',
    meta_keyword: '',
    seo_rating: '',
    best_rating: '',
    review_number: '',
    og_image_path: '',
  });

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchOptions = async () => {
    try {
      const [catRes, authorRes] = await Promise.all([
        fetch('/api/v1/admin/blog-categories'),
        fetch('/api/v1/admin/authors'),
      ]);

      const catJson = await catRes.json();
      const authorJson = await authorRes.json();

      if (catRes.ok && catJson.success) setCategories(catJson.data || []);
      if (authorRes.ok && authorJson.success) setAuthors(authorJson.data || []);
    } catch {
      console.error('Error fetching categories or authors');
    }
  };

  const fetchBlogDetails = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/v1/admin/blogs/${id}`);
      const json = await res.json();
      if (res.ok && json.success) {
        const b = json.data;
        setFormData({
          title: b.title || '',
          headline: b.headline || '',
          slug: b.slug || '',
          short_description: b.short_description || '',
          description: b.description || '',
          thumbnail_path: b.thumbnail_path || '',
          category_id: b.category_id ? b.category_id.toString() : '',
          author_id: b.author_id ? b.author_id.toString() : '',
          status: b.status !== undefined ? b.status : 1,
          meta_title: b.meta_title || '',
          meta_description: b.meta_description || '',
          meta_keyword: b.meta_keyword || '',
          og_image_path: b.og_image_path || '',
        });
      } else {
        showToast('error', json.error || 'Failed to load blog post');
      }
    } catch {
      showToast('error', 'Error loading blog data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOptions();
    if (isEdit) fetchBlogDetails();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      showToast('error', 'Blog title is required');
      return;
    }

    setSubmitting(true);
    try {
      const url = isEdit ? `/api/v1/admin/blogs/${id}` : '/api/v1/admin/blogs';
      const method = isEdit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const json = await res.json();

      if (res.ok && json.success) {
        showToast('success', isEdit ? 'Blog updated successfully' : 'Blog created successfully');
        setTimeout(() => navigate('/blogs'), 1000);
      } else {
        showToast('error', json.error || 'Failed to save blog post');
      }
    } catch {
      showToast('error', 'Error submitting blog form');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-2xl shadow-xl flex items-center gap-3 text-sm font-semibold transition-all ${toast.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'
            }`}
        >
          {toast.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Header */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/blogs')}
              className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <span className="text-[11px] font-extrabold uppercase tracking-widest text-indigo-600 block">
                BLOG EDITOR
              </span>
              <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                {isEdit ? 'Edit Blog Post' : 'Create New Blog Post'}
              </h1>
            </div>
          </div>

          <button
            onClick={handleSubmit}
            disabled={submitting || loading}
            className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20 flex items-center gap-2 transition-all disabled:opacity-50"
          >
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>{isEdit ? 'Update Post' : 'Publish Post'}</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="bg-white border border-slate-200/80 rounded-3xl p-12 flex flex-col items-center justify-center text-slate-500">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mb-3" />
          <p className="text-xs font-semibold">Loading blog content...</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content Area (Left 2 Columns) */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm space-y-5">
              <div>
                <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-2">
                  Blog Title *
                </label>
                <input
                  type="text"
                  placeholder="Enter blog article title..."
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-900 text-sm font-bold focus:outline-none focus:border-indigo-600"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Headline</label>
                  <input
                    type="text"
                    placeholder="Short catchy headline..."
                    value={formData.headline}
                    onChange={(e) => setFormData({ ...formData, headline: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">URL Slug</label>
                  <input
                    type="text"
                    placeholder="e.g. top-universities-in-malaysia"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Short Description Summary
                </label>
                <textarea
                  rows={2}
                  placeholder="Brief summary for list view cards..."
                  value={formData.short_description}
                  onChange={(e) => setFormData({ ...formData, short_description: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-2">
                  Full Blog Article Content *
                </label>
                <RichTextEditor
                  value={formData.description}
                  onChange={(val) => setFormData({ ...formData, description: val })}
                  placeholder="Write the full blog post body here..."
                  minHeight={400}
                />
              </div>
            </div>

            {/* SEO Panel */}
            <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                <Globe className="w-4 h-4 text-indigo-600" />
                <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">
                  Search Engine Optimization (SEO)
                </h3>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Meta Title</label>
                <input
                  type="text"
                  value={formData.meta_title}
                  onChange={(e) => setFormData({ ...formData, meta_title: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Meta Keywords</label>
                <input
                  type="text"
                  placeholder="malaysia, education, study abroad"
                  value={formData.meta_keyword}
                  onChange={(e) => setFormData({ ...formData, meta_keyword: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Meta Description</label>
                <textarea
                  rows={2}
                  value={formData.meta_description}
                  onChange={(e) => setFormData({ ...formData, meta_description: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-semibold"
                />
              </div>
            </div>
          </div>

          {/* Sidebar Settings (Right 1 Column) */}
          <div className="space-y-6">
            <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm space-y-5">
              <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider pb-3 border-b border-slate-100">
                Publishing Settings
              </h3>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Category</label>
                <select
                  value={formData.category_id}
                  onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-semibold"
                >
                  <option value="">-- Select Category --</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.category_name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Author</label>
                <select
                  value={formData.author_id}
                  onChange={(e) => setFormData({ ...formData, author_id: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-semibold"
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
                <label className="block text-xs font-bold text-slate-700 mb-1">Publication Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: parseInt(e.target.value, 10) })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-semibold"
                >
                  <option value={1}>Published</option>
                  <option value={0}>Draft</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Thumbnail Image Path / URL
                </label>
                <input
                  type="text"
                  placeholder="/storage/blogs/image1.jpg"
                  value={formData.thumbnail_path}
                  onChange={(e) => setFormData({ ...formData, thumbnail_path: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  OG Sharing Image Path
                </label>
                <input
                  type="text"
                  placeholder="/storage/blogs/og_image1.jpg"
                  value={formData.og_image_path}
                  onChange={(e) => setFormData({ ...formData, og_image_path: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-semibold"
                />
              </div>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}
