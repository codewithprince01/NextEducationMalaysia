import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link, useSearchParams } from 'react-router-dom';
import { confirmDelete } from '@/lib/swal';
import Pagination from '@/components/common/Pagination';
import RichTextEditor from '@/components/common/RichTextEditor';
import {
  FileText,
  ArrowLeft,
  Edit2,
  Trash2,
  Loader2,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Layers,
  Sparkles,
  RotateCcw,
  Send,
  Plus,
  X,
  Eye
} from 'lucide-react';

interface SpecializationOption {
  id: number;
  name: string;
  slug: string;
}

interface ContentTabItem {
  id: number;
  specialization_id: number;
  tab: string;
  title?: string;
  tab_title?: string;
  name?: string;
  position: number;
  description: string;
  created_at?: string;
  updated_at?: string;
}

export default function CourseSpecializationContents() {
  const { id: routeSpecId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const editIdParam = searchParams.get('edit');

  const [specializations, setSpecializations] = useState<SpecializationOption[]>([]);
  const [selectedSpecId, setSelectedSpecId] = useState<number | null>(
    routeSpecId ? Number(routeSpecId) : null
  );

  const [contents, setContents] = useState<ContentTabItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [viewModalItem, setViewModalItem] = useState<ContentTabItem | null>(null);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Pagination (20 per page)
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  // Edit State
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    tab: '',
    position: 1,
    description: '',
  });

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  // Fetch Specializations List
  const fetchSpecializations = async () => {
    try {
      const res = await fetch('/api/v1/admin/course-specializations');
      const json = await res.json();
      if (res.ok && json.status && json.data) {
        setSpecializations(json.data);
        if (!selectedSpecId && json.data.length > 0) {
          setSelectedSpecId(json.data[0].id);
        }
      }
    } catch {
      showToast('error', 'Failed to load specializations');
    }
  };

  // Fetch Contents for selected specialization
  const fetchContents = async (specId: number) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/v1/admin/course-specialization-contents?specialization_id=${specId}`);
      const json = await res.json();
      if (res.ok && json.data) {
        const list = json.data || [];
        setContents(list);
        if (!editingId) {
          setFormData((prev) => ({ ...prev, position: list.length + 1 }));
        }
      } else {
        setContents([]);
        if (!editingId) {
          setFormData((prev) => ({ ...prev, position: 1 }));
        }
      }
    } catch {
      showToast('error', 'Failed to fetch content tabs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSpecializations();
  }, []);

  useEffect(() => {
    if (selectedSpecId) {
      fetchContents(selectedSpecId);
    }
  }, [selectedSpecId]);

  // Auto pre-fill edit form if URL has ?edit=ID
  useEffect(() => {
    if (contents.length > 0 && editIdParam) {
      const editItem = contents.find((i) => String(i.id) === String(editIdParam));
      if (editItem) {
        setEditingId(editItem.id);
        const itemTab = editItem.tab || editItem.title || editItem.tab_title || editItem.name || '';
        setFormData({
          tab: itemTab,
          position: editItem.position || 1,
          description: editItem.description || '',
        });
        setShowForm(true);
      }
    }
  }, [contents, editIdParam]);

  const handleSpecSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = Number(e.target.value);
    setSelectedSpecId(val);
    navigate(`/course-specialization-contents/${val}`);
    setEditingId(null);
    setShowForm(false);
    setFormData({
      tab: '',
      position: 1,
      description: '',
    });
    if (searchParams.has('edit')) {
      setSearchParams({}, { replace: true });
    }
  };

  const handleReset = () => {
    setEditingId(null);
    setFormData({
      tab: '',
      position: contents.length + 1,
      description: '',
    });
    if (searchParams.has('edit')) {
      setSearchParams({}, { replace: true });
    }
  };

  const handleEditClick = (item: ContentTabItem) => {
    setEditingId(item.id);
    const itemTab = item.tab || item.title || item.tab_title || item.name || '';
    setFormData({
      tab: itemTab,
      position: item.position || 1,
      description: item.description || '',
    });
    setShowForm(true);
    setSearchParams({ edit: String(item.id) }, { replace: true });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSpecId) {
      showToast('error', 'Please select a specialization first');
      return;
    }
    if (!formData.tab.trim()) {
      showToast('error', 'Tab title is required');
      return;
    }

    setSubmitting(true);
    try {
      const url = editingId
        ? `/api/v1/admin/course-specialization-contents/${editingId}`
        : '/api/v1/admin/course-specialization-contents';
      const method = editingId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          specialization_id: selectedSpecId,
          tab: formData.tab,
          position: Number(formData.position) || 1,
          description: formData.description,
        }),
      });

      const json = await res.json();
      if (res.ok && json.status) {
        showToast('success', editingId ? 'Content tab updated successfully' : 'Content tab created successfully');
        handleReset();
        setShowForm(false);
        fetchContents(selectedSpecId);
      } else {
        showToast('error', json.message || 'Failed to save content tab');
      }
    } catch {
      showToast('error', 'Network error occurred while saving content');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number, tabTitle: string) => {
    const isConfirmed = await confirmDelete(
      'Delete Content Tab?',
      `Are you sure you want to delete tab "${tabTitle}"? This action cannot be undone.`
    );
    if (!isConfirmed) return;

    try {
      const res = await fetch(`/api/v1/admin/course-specialization-contents/${id}`, { method: 'DELETE' });
      const json = await res.json();
      if (res.ok && json.status) {
        showToast('success', `Tab "${tabTitle}" deleted successfully`);
        if (selectedSpecId) fetchContents(selectedSpecId);
      } else {
        showToast('error', json.message || 'Failed to delete tab');
      }
    } catch {
      showToast('error', 'Connection error while deleting content tab');
    }
  };

  const selectedSpecObj = specializations.find((s) => s.id === selectedSpecId);

  const totalPages = Math.ceil(contents.length / itemsPerPage);
  const paginatedContents = contents.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="space-y-6">
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

      {/* Navigation Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center gap-4">
          <Link
            to="/course-specializations"
            className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 text-slate-600 hover:bg-slate-200 flex items-center justify-center transition-colors shrink-0"
            title="Back to Course Specializations"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-extrabold text-indigo-600 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-full uppercase tracking-wider">
                Specialization Content Editor
              </span>
            </div>
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight mt-0.5">
              {selectedSpecObj ? `Contents for "${selectedSpecObj.name}"` : 'Manage Specialization Contents'}
            </h1>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Create, edit and format rich tab descriptions for course specialization detail pages.
            </p>
          </div>
        </div>

        {/* Action controls & Specialization Selector Dropdown */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <label className="text-xs font-bold text-slate-600 shrink-0">Specialization:</label>
            <select
              value={selectedSpecId || ''}
              onChange={handleSpecSelectChange}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-100 transition-all"
            >
              {specializations.map((s) => (
                <option key={s.id} value={s.id}>
                  #{s.id} - {s.name}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => {
              if (!showForm) {
                handleReset();
                setShowForm(true);
              } else {
                setShowForm(false);
              }
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition-all shadow-sm cursor-pointer"
          >
            {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            <span>{showForm ? 'Close Form' : '+ Add Description'}</span>
          </button>
        </div>
      </div>

      {/* ── FORM SECTION: RICH DESCRIPTION EDITOR (HIDDEN BY DEFAULT) ── */}
      {showForm && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden animate-in fade-in duration-200">
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <h2 className="font-extrabold text-slate-900 text-sm">
                {editingId ? `Edit Tab #${editingId}` : 'Enter Description'}
              </h2>
            </div>
            <div className="flex items-center gap-2">
              {editingId && (
                <span className="text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200 px-2.5 py-1 rounded-full">
                  Editing Existing Content
                </span>
              )}
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                title="Close Form"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Tab Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Overview, Admission, Fees, Career"
                  value={formData.tab}
                  onChange={(e) => setFormData({ ...formData, tab: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-100 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Display Position Order</label>
                <input
                  type="number"
                  min="1"
                  required
                  placeholder="1"
                  value={formData.position}
                  onChange={(e) => setFormData({ ...formData, position: Number(e.target.value) })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-100 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Enter Description *</label>
              <RichTextEditor
                value={formData.description}
                onChange={(val) => setFormData({ ...formData, description: val })}
                placeholder="Write detailed tab content with formatting, images, bullet points..."
                minHeight="350px"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={handleReset}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-sm transition-all cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>

              <button
                type="submit"
                disabled={submitting}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20 transition-all cursor-pointer disabled:opacity-50"
              >
                {submitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-3.5 h-3.5" />
                )}
                <span>{editingId ? 'Update Tab Content' : 'Submit'}</span>
              </button>

              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xs transition-all cursor-pointer ml-auto"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ── TABLE OF EXISTING CONTENT TABS ── */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-indigo-600" />
            <h3 className="font-extrabold text-slate-900 text-sm">
              Existing Content Tabs ({contents.length})
            </h3>
          </div>
          <button
            onClick={() => selectedSpecId && fetchContents(selectedSpecId)}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
            title="Reload content list"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {loading ? (
          <div className="p-12 flex flex-col items-center justify-center text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mb-3" />
            <p className="text-xs font-semibold">Loading content tabs...</p>
          </div>
        ) : contents.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <FileText className="w-12 h-12 mx-auto mb-3 text-slate-300" />
            <p className="text-sm font-bold text-slate-700">No Content Tabs Created Yet</p>
            <p className="text-xs text-slate-400 mt-1">Click "+ Add Description" above to create content tabs.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200/80 text-slate-500 font-extrabold uppercase tracking-wider text-[10.5px]">
                  <th className="py-3.5 px-4 w-16 text-center">Sr. No.</th>
                  <th className="py-3.5 px-4 w-24 text-center">Position</th>
                  <th className="py-3.5 px-5 w-44">Tab</th>
                  <th className="py-3.5 px-6">Description</th>
                  <th className="py-3.5 px-5 text-right w-28">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {paginatedContents.map((item, index) => {
                  const srNo = (currentPage - 1) * itemsPerPage + index + 1;
                  return (
                    <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-4 px-4 text-center font-extrabold text-slate-700">{srNo}</td>
                      <td className="py-4 px-4 text-center">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700">
                          {item.position}
                        </span>
                      </td>
                      <td className="py-4 px-5 font-bold text-slate-900">{item.tab}</td>
                      <td className="py-4 px-6">
                        <button
                          type="button"
                          onClick={() => setViewModalItem(item)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200/60 font-bold text-xs transition-colors cursor-pointer shadow-2xs"
                        >
                          <Eye className="w-3.5 h-3.5 text-indigo-600" />
                          <span>View Description</span>
                        </button>
                      </td>
                      <td className="py-4 px-5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleEditClick(item)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors cursor-pointer"
                            title="Edit Tab & Description"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(item.id, item.tab)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                            title="Delete Content Tab"
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
              totalItems={contents.length}
              itemsPerPage={itemsPerPage}
              onPageChange={(p) => setCurrentPage(p)}
            />
          </div>
        )}
      </div>

      {/* ── DESCRIPTION VIEW MODAL POPUP ── */}
      {viewModalItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-600" />
                <h3 className="font-extrabold text-slate-900 text-base">
                  Tab Description: {viewModalItem.tab}
                </h3>
                <span className="text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-100 px-2.5 py-0.5 rounded-full ml-2">
                  Position: {viewModalItem.position}
                </span>
              </div>
              <button
                onClick={() => setViewModalItem(null)}
                className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(85vh-120px)] space-y-4">
              {viewModalItem.description ? (
                <div
                  className="prose prose-slate prose-sm max-w-none text-slate-700 leading-relaxed font-normal"
                  dangerouslySetInnerHTML={{ __html: viewModalItem.description }}
                />
              ) : (
                <p className="text-sm italic text-slate-400">No description entered.</p>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-end">
              <button
                onClick={() => setViewModalItem(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold transition-all cursor-pointer"
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


