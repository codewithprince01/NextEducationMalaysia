import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { confirmDelete } from '@/lib/swal';
import Pagination from '@/components/common/Pagination';
import RichTextEditor from '@/components/common/RichTextEditor';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Loader2,
  X,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  HelpCircle,
  Filter,
  Eye,
  ChevronUp
} from 'lucide-react';

interface FaqCategoryItem {
  id: number;
  category_name: string;
}

interface FaqItem {
  id: number;
  category_id?: number;
  category_name?: string;
  question: string;
  answer?: string;
  created_at?: string;
}

export default function Faqs() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [items, setItems] = useState<FaqItem[]>([]);
  const [categories, setCategories] = useState<FaqCategoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  // Form visibility & Editing state
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    category_id: '',
    question: '',
    answer: '',
  });

  // View Answer Modal
  const [viewModal, setViewModal] = useState<{ isOpen: boolean; title: string; content: string }>({
    isOpen: false,
    title: '',
    content: '',
  });

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/v1/admin/faq-categories');
      const json = await res.json();
      if (res.ok && json.status) {
        setCategories(json.data || []);
      }
    } catch {
      // Ignore background error
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const url = selectedCategory
        ? `/api/v1/admin/faqs?category_id=${selectedCategory}`
        : '/api/v1/admin/faqs';
      const res = await fetch(url);
      const json = await res.json();
      if (res.ok && json.status) {
        const fetchedItems: FaqItem[] = json.data || [];
        setItems(fetchedItems);

        // Check for ?edit=<ID> in URL
        const editIdParam = searchParams.get('edit');
        if (editIdParam) {
          const targetId = parseInt(editIdParam, 10);
          const found = fetchedItems.find((i) => i.id === targetId);
          if (found) {
            populateForm(found);
          }
        }
      } else {
        showToast('error', json.message || 'Failed to fetch FAQs');
      }
    } catch {
      showToast('error', 'Network error while fetching FAQs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchData();
  }, [selectedCategory]);

  const populateForm = (item: FaqItem) => {
    setEditingId(item.id);
    setFormData({
      category_id: item.category_id ? String(item.category_id) : '',
      question: item.question || '',
      answer: item.answer || '',
    });
    setShowForm(true);
  };

  const handleOpenAdd = () => {
    setEditingId(null);
    setFormData({
      category_id: selectedCategory || (categories[0]?.id ? String(categories[0].id) : ''),
      question: '',
      answer: '',
    });
    setSearchParams({}, { replace: true });
    setShowForm(true);
  };

  const handleOpenEdit = (item: FaqItem) => {
    setSearchParams({ edit: String(item.id) }, { replace: true });
    populateForm(item);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingId(null);
    setSearchParams({}, { replace: true });
  };

  const handleDelete = async (id: number) => {
    const isConfirmed = await confirmDelete('Are you sure you want to delete this FAQ?');
    if (!isConfirmed) return;

    try {
      const res = await fetch(`/api/v1/admin/faqs/${id}`, { method: 'DELETE' });
      const json = await res.json();

      if (res.ok && json.status) {
        showToast('success', 'Deleted successfully');
        if (editingId === id) {
          handleCancelForm();
        }
        fetchData();
      } else {
        showToast('error', json.message || 'Failed to delete');
      }
    } catch {
      showToast('error', 'Error deleting record');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.question.trim()) {
      showToast('error', 'Question is required');
      return;
    }

    setSubmitting(true);
    try {
      const url = editingId
        ? `/api/v1/admin/faqs/${editingId}`
        : '/api/v1/admin/faqs';
      const method = editingId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const json = await res.json();
      if (res.ok && json.status) {
        showToast('success', editingId ? 'Updated successfully' : 'Created successfully');
        handleCancelForm();
        fetchData();
      } else {
        showToast('error', json.message || 'Action failed');
      }
    } catch {
      showToast('error', 'Network error');
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = items.filter((item) =>
    (item.question || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (item.answer || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (item.category_name || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const paginated = filtered.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="space-y-4 max-w-[1600px] mx-auto">
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-slate-200/80 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
            <HelpCircle className="w-6 h-6 text-indigo-600" /> Faqs
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage category frequently asked questions and answers.
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
              if (showForm && !editingId) {
                setShowForm(false);
              } else {
                handleOpenAdd();
              }
            }}
            className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium shadow-sm transition-colors"
          >
            {showForm ? (
              <>
                <ChevronUp className="w-4 h-4" /> Hide Form
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" /> Add FAQ
              </>
            )}
          </button>
        </div>
      </div>

      {/* Form Card (Matching Laravel faqs.blade.php) */}
      {showForm && (
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden animate-fadeIn">
          <div className="flex items-center justify-between p-4 px-6 border-b border-slate-200 bg-slate-50/50">
            <h3 className="text-base font-bold text-slate-800">
              {editingId ? 'Edit Faq Record' : 'Add Faq Record'}
            </h3>
            <button
              onClick={handleCancelForm}
              className="p-1 text-slate-400 hover:text-slate-600 rounded-lg transition-colors"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {/* Select Category */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1.5">
                  Select Category <span className="text-rose-500">*</span>
                </label>
                <select
                  required
                  value={formData.category_id}
                  onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all text-slate-700"
                >
                  <option value="">-- Select Category --</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.category_name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Question */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1.5">
                Question <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="Question"
                value={formData.question}
                onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
              />
            </div>

            {/* Answer */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1.5">
                Answer <span className="text-rose-500">*</span>
              </label>
              <RichTextEditor
                value={formData.answer}
                onChange={(content) => setFormData({ ...formData, answer: content })}
                placeholder="Enter Answer..."
              />
            </div>

            {/* Buttons */}
            <div className="flex items-center gap-2 pt-4 border-t border-slate-100">
              {editingId ? (
                <button
                  type="button"
                  onClick={handleCancelForm}
                  className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg text-sm font-medium transition-colors"
                >
                  Cancel
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() =>
                    setFormData({
                      category_id: '',
                      question: '',
                      answer: '',
                    })
                  }
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-sm font-medium transition-colors"
                >
                  Reset
                </button>
              )}
              <button
                type="submit"
                disabled={submitting}
                className="flex items-center gap-2 px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium shadow-sm transition-colors disabled:opacity-50"
              >
                {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                Submit
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Controls / Filter / Search */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row gap-4 justify-between items-center">
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search questions or answers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="py-2 px-3 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-700"
            >
              <option value="">All FAQ Categories</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.category_name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="text-xs text-slate-500">
          Showing <span className="font-semibold text-slate-700">{filtered.length}</span> entries
        </div>
      </div>

      {/* Table (Matching Laravel FaqC.php: Sr. No., Category, Question, Answer, Action) */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold text-xs uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4 w-16">Sr. No.</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Question</th>
                <th className="py-3.5 px-4">Answer</th>
                <th className="py-3.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-indigo-600" />
                    Loading FAQs...
                  </td>
                </tr>
              ) : paginated.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    No FAQs found.
                  </td>
                </tr>
              ) : (
                paginated.map((item, index) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-medium text-slate-500">
                      {(currentPage - 1) * itemsPerPage + index + 1}
                    </td>
                    <td className="py-3.5 px-4 font-medium text-indigo-600">
                      {item.category_name || 'General'}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-800 max-w-sm">
                      {item.question}
                    </td>
                    <td className="py-3.5 px-4">
                      {item.answer ? (
                        <button
                          onClick={() => setViewModal({ isOpen: true, title: 'Answer', content: item.answer || '' })}
                          className="px-2.5 py-1 text-xs font-medium text-sky-700 bg-sky-50 border border-sky-200 hover:bg-sky-100 rounded transition-colors inline-flex items-center gap-1"
                        >
                          <Eye className="w-3 h-3" /> View
                        </button>
                      ) : (
                        <span className="text-slate-400 text-xs">Null</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenEdit(item)}
                          className="p-1.5 text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="p-1.5 text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors"
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

      {/* Answer View Modal */}
      {viewModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-100 w-full max-w-2xl overflow-hidden">
            <div className="flex items-center justify-between p-4 px-6 border-b border-slate-100 bg-slate-50/50">
              <h3 className="text-base font-bold text-slate-800">{viewModal.title}</h3>
              <button
                onClick={() => setViewModal({ isOpen: false, title: '', content: '' })}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div
              className="p-6 text-sm text-slate-700 max-h-[60vh] overflow-y-auto leading-relaxed prose max-w-none"
              dangerouslySetInnerHTML={{ __html: viewModal.content }}
            />
            <div className="flex justify-end p-4 px-6 border-t border-slate-100 bg-slate-50/50">
              <button
                onClick={() => setViewModal({ isOpen: false, title: '', content: '' })}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg text-sm font-medium transition-colors"
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
