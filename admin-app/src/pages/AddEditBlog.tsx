import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Loader2,
  CheckCircle2,
  AlertCircle,
  FileText
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
    slug: '',
    category_id: '',
    author_id: '',
    thumbnail_path: '',
    description: '',
    meta_title: '',
    meta_keyword: '',
    meta_description: '',
    seo_rating: '',
    best_rating: '',
    review_number: '',
    og_image_path: '',
    status: 1,
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
          title: b.title || b.headline || '',
          slug: b.slug || '',
          category_id: b.category_id ? b.category_id.toString() : '',
          author_id: b.author_id ? b.author_id.toString() : '',
          thumbnail_path: b.thumbnail_path || '',
          description: b.description || '',
          meta_title: b.meta_title || '',
          meta_keyword: b.meta_keyword || '',
          meta_description: b.meta_description || '',
          seo_rating: b.seo_rating ? b.seo_rating.toString() : '',
          best_rating: b.best_rating ? b.best_rating.toString() : '',
          review_number: b.review_number ? b.review_number.toString() : '',
          og_image_path: b.og_image_path || '',
          status: b.status !== undefined ? b.status : 1,
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

  const handleReset = () => {
    if (isEdit) {
      fetchBlogDetails();
    } else {
      setFormData({
        title: '',
        slug: '',
        category_id: '',
        author_id: '',
        thumbnail_path: '',
        description: '',
        meta_title: '',
        meta_keyword: '',
        meta_description: '',
        seo_rating: '',
        best_rating: '',
        review_number: '',
        og_image_path: '',
        status: 1,
      });
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
      const url = isEdit ? `/api/v1/admin/blogs/${id}` : '/api/v1/admin/blogs';
      const method = isEdit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          headline: formData.title,
          ...formData,
        }),
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
    <div className="space-y-4 max-w-[1400px] mx-auto p-2 sm:p-4">
      {/* Toast */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl shadow-xl flex items-center gap-3 text-sm font-semibold transition-all ${toast.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'
            }`}
        >
          {toast.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Header */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/blogs')}
            className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
            title="Back to Blogs List"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              <FileText className="w-5 h-5 text-indigo-600" />
              <span>Blogs</span>
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              {isEdit ? 'Update existing blog post record' : 'Add new blog post record'}
            </p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="bg-white border border-slate-200/80 rounded-2xl p-12 flex flex-col items-center justify-center text-slate-500">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mb-3" />
          <p className="text-xs font-semibold">Loading blog record...</p>
        </div>
      ) : (
        <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xs overflow-hidden">
          <div className="px-6 py-4 bg-slate-50/80 border-b border-slate-200/80">
            <h2 className="text-sm font-extrabold text-slate-800">
              {isEdit ? 'Update Record' : 'Add New Record'}
            </h2>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {/* Row 1: Title & Slug */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Slug
                </label>
                <input
                  type="text"
                  placeholder="Slug"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all font-mono"
                />
              </div>
            </div>

            {/* Row 2: Category, Author, Thumbnail */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Category
                </label>
                <select
                  value={formData.category_id}
                  onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all font-medium"
                >
                  <option value="">Select</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.category_name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Author
                </label>
                <select
                  value={formData.author_id}
                  onChange={(e) => setFormData({ ...formData, author_id: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all font-medium"
                >
                  <option value="">Select</option>
                  {authors.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Thumbnail
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setFormData({ ...formData, thumbnail_path: file.name });
                    }
                  }}
                  className="w-full text-xs text-slate-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-slate-200 file:text-slate-700 hover:file:bg-slate-300 cursor-pointer border border-slate-200 rounded-lg bg-slate-50"
                />
                {formData.thumbnail_path && (
                  <span className="text-[11px] text-slate-500 mt-1 block truncate">
                    Current / Selected: {formData.thumbnail_path}
                  </span>
                )}
              </div>
            </div>

            {/* Row 3: Description */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Description
              </label>
              <textarea
                rows={4}
                placeholder="Description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all resize-y font-medium"
              />
            </div>

            <hr className="border-slate-200 my-4" />

            {/* SEO Section */}
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Meta Title
                  </label>
                  <input
                    type="text"
                    placeholder="Enter Meta Title"
                    value={formData.meta_title}
                    onChange={(e) => setFormData({ ...formData, meta_title: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Meta Keyword
                  </label>
                  <input
                    type="text"
                    placeholder="Meta Keyword"
                    value={formData.meta_keyword}
                    onChange={(e) => setFormData({ ...formData, meta_keyword: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Meta Description
                </label>
                <textarea
                  rows={3}
                  placeholder="Meta Description"
                  value={formData.meta_description}
                  onChange={(e) => setFormData({ ...formData, meta_description: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all resize-y font-medium"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Seo Rating
                  </label>
                  <input
                    type="text"
                    placeholder="Seo Rating"
                    value={formData.seo_rating}
                    onChange={(e) => setFormData({ ...formData, seo_rating: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Best Rating
                  </label>
                  <input
                    type="text"
                    placeholder="Best Rating"
                    value={formData.best_rating}
                    onChange={(e) => setFormData({ ...formData, best_rating: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Number of Review
                  </label>
                  <input
                    type="text"
                    placeholder="Total Reviews"
                    value={formData.review_number}
                    onChange={(e) => setFormData({ ...formData, review_number: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Upload OG Image
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setFormData({ ...formData, og_image_path: file.name });
                      }
                    }}
                    className="w-full text-xs text-slate-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-slate-200 file:text-slate-700 hover:file:bg-slate-300 cursor-pointer border border-slate-200 rounded-lg bg-slate-50"
                  />
                  {formData.og_image_path && (
                    <span className="text-[11px] text-slate-500 mt-1 block truncate">
                      Current / Selected: {formData.og_image_path}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex items-center gap-2 pt-3">
              <button
                type="button"
                onClick={handleReset}
                className="px-3.5 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-xs font-bold transition-colors shadow-xs cursor-pointer"
              >
                Reset
              </button>
              {isEdit && (
                <button
                  type="button"
                  onClick={() => navigate('/blogs')}
                  className="px-3.5 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg text-xs font-bold transition-colors shadow-xs cursor-pointer"
                >
                  Cancel
                </button>
              )}
              <button
                type="submit"
                disabled={submitting}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition-colors shadow-xs disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
              >
                {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>{isEdit ? 'Update' : 'Submit'}</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
