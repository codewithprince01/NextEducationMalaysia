import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { confirmDelete } from '@/lib/swal';
import Pagination from '@/components/common/Pagination';
import RichTextEditor from '@/components/common/RichTextEditor';
import {
  FileText,
  ArrowLeft,
  Plus,
  Minus,
  Edit2,
  Trash2,
  Loader2,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  X,
  Save,
  RotateCcw
} from 'lucide-react';

interface SpecializationLevelContentItem {
  id: number;
  specialization_level_id?: number;
  position: number;
  title: string;
  slug?: string;
  description?: string;
}

export default function SpecializationLevelContents() {
  const { id: paramLevelId } = useParams<{ id?: string }>();
  const navigate = useNavigate();

  const [items, setItems] = useState<SpecializationLevelContentItem[]>([]);
  const [levelInfo, setLevelInfo] = useState<{ id: number; level: string; specialization_id?: number; specialization_name?: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    specialization_level_id: paramLevelId || '',
    position: 1,
    title: '',
    description: ''
  });

  // Preview Modal
  const [previewContent, setPreviewContent] = useState<SpecializationLevelContentItem | null>(null);

  // Pagination (20 items/page)
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const url = paramLevelId
        ? `/api/v1/admin/specialization-level-contents?specialization_level_id=${paramLevelId}`
        : '/api/v1/admin/specialization-level-contents';

      const res = await fetch(url);
      const json = await res.json();

      if (res.ok && json.status) {
        setItems(json.data || []);
        if (json.level) {
          setLevelInfo(json.level);
        }
      } else {
        showToast('error', json.message || 'Failed to load level content tabs');
      }
    } catch {
      showToast('error', 'Connection error while fetching data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [paramLevelId]);

  const handleResetForm = () => {
    setEditingId(null);
    setFormData({
      specialization_level_id: paramLevelId || '',
      position: items.length + 1,
      title: '',
      description: ''
    });
  };

  const handleOpenEdit = (item: SpecializationLevelContentItem) => {
    setEditingId(item.id);
    setFormData({
      specialization_level_id: item.specialization_level_id ? String(item.specialization_level_id) : (paramLevelId || ''),
      position: item.position || 1,
      title: item.title || '',
      description: item.description || ''
    });
    setIsFormVisible(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      showToast('error', 'Enter Title is required');
      return;
    }

    setSubmitting(true);
    try {
      const url = editingId
        ? `/api/v1/admin/specialization-level-contents/${editingId}`
        : '/api/v1/admin/specialization-level-contents';
      const method = editingId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          specialization_level_id: formData.specialization_level_id || paramLevelId
        })
      });

      const json = await res.json();
      if (res.ok && json.status) {
        showToast('success', editingId ? 'Record updated successfully' : 'Record created successfully');
        handleResetForm();
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

  const handleDelete = async (id: number, title: string) => {
    const isConfirmed = await confirmDelete(
      'Delete Content Tab?',
      `Are you sure you want to delete "${title}"?`
    );
    if (!isConfirmed) return;

    try {
      const res = await fetch(`/api/v1/admin/specialization-level-contents/${id}`, { method: 'DELETE' });
      const json = await res.json();
      if (res.ok && json.status) {
        showToast('success', 'Record has been deleted');
        fetchData();
      } else {
        showToast('error', json.message || 'Delete failed');
      }
    } catch {
      showToast('error', 'Network error during delete');
    }
  };

  const totalPages = Math.ceil(items.length / itemsPerPage);
  const paginatedItems = items.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
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
          <button
            onClick={() => {
              if (levelInfo?.specialization_id) {
                navigate(`/specialization-levels/${levelInfo.specialization_id}`);
              } else {
                navigate('/specialization-levels');
              }
            }}
            className="p-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
            title="Back to Specialization Levels"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-extrabold text-indigo-600 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-full uppercase tracking-wider">
                Specializations &gt; Levels &gt; Specialization Level Contents
              </span>
              {levelInfo && (
                <span className="text-[10px] font-extrabold text-slate-700 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-full">
                  {levelInfo.specialization_name || 'Specialization'} &gt; {levelInfo.level}
                </span>
              )}
            </div>
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight mt-0.5">
              Specialization Level Contents {levelInfo ? `- ${levelInfo.level}` : ''}
            </h1>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Manage description tabs (About Course, Course Duration, Entry Requirements, Tuition Fee, Top Universities, Careers) for this specialization level.
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
        </div>
      </div>

      {/* Form Card (Matching exact Laravel add-new-record blade layout) */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
            <FileText className="w-4 h-4 text-indigo-600" />
            {editingId ? 'Update Record' : 'Add New Record'}
          </h3>
          <button
            type="button"
            onClick={() => setIsFormVisible(!isFormVisible)}
            className="w-7 h-7 rounded-lg bg-sky-500 hover:bg-sky-600 text-white flex items-center justify-center font-bold transition-all cursor-pointer shadow-xs"
            title={isFormVisible ? 'Collapse form' : 'Expand form'}
          >
            {isFormVisible ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          </button>
        </div>

        {isFormVisible && (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              <div className="md:col-span-8">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Enter Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Enter Title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-800 focus:outline-none focus:border-indigo-500 focus:bg-white"
                />
              </div>

              <div className="md:col-span-4">
                <label className="block text-xs font-bold text-slate-700 mb-1">Enter Position</label>
                <input
                  type="number"
                  placeholder="Enter Position"
                  value={formData.position}
                  onChange={(e) => setFormData({ ...formData, position: Number(e.target.value) })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-800 focus:outline-none focus:border-indigo-500 focus:bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Enter Description</label>
              <RichTextEditor
                value={formData.description}
                onChange={(val) => setFormData({ ...formData, description: val })}
                placeholder="Enter Description"
                minHeight={220}
              />
            </div>

            <div className="flex items-center justify-start gap-3 pt-3">
              <button
                type="button"
                onClick={handleResetForm}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reset
              </button>
              {editingId && (
                <button
                  type="button"
                  onClick={handleResetForm}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-500 hover:bg-slate-600 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
                >
                  Cancel
                </button>
              )}
              <button
                type="submit"
                disabled={submitting}
                className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20 disabled:opacity-50 transition-all cursor-pointer"
              >
                {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                Submit
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Table Container */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-3 text-indigo-600" />
            <span className="text-xs font-semibold">Loading content tabs...</span>
          </div>
        ) : items.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <FileText className="w-10 h-10 mx-auto mb-2 opacity-30" />
            <p className="text-xs font-semibold">No content tabs added yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-100 text-[11px] font-extrabold text-slate-600 uppercase tracking-wider">
                  <th className="py-3.5 px-5">Sr. No.</th>
                  <th className="py-3.5 px-5">Position</th>
                  <th className="py-3.5 px-5">Title</th>
                  <th className="py-3.5 px-5">Description</th>
                  <th className="py-3.5 px-5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
                {paginatedItems.map((item, index) => (
                  <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-4 px-5 font-bold text-slate-400">
                      {(currentPage - 1) * itemsPerPage + index + 1}
                    </td>
                    <td className="py-4 px-5 font-semibold text-slate-800">
                      {item.position || ''}
                    </td>
                    <td className="py-4 px-5 font-bold text-slate-900">
                      {item.title}
                    </td>
                    <td className="py-4 px-5">
                      <button
                        onClick={() => setPreviewContent(item)}
                        className="inline-flex items-center gap-1 px-3 py-1 rounded-lg border border-sky-400 text-sky-500 hover:bg-sky-50 font-semibold text-[11px] transition-colors cursor-pointer"
                      >
                        View
                      </button>
                    </td>
                    <td className="py-4 px-5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleDelete(item.id, item.title)}
                          className="p-1.5 rounded-lg text-white bg-rose-500 hover:bg-rose-600 shadow-xs transition-colors cursor-pointer"
                          title="Delete Content Tab"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleOpenEdit(item)}
                          className="p-1.5 rounded-lg text-white bg-sky-500 hover:bg-sky-600 shadow-xs transition-colors cursor-pointer"
                          title="Edit Content Tab"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={items.length}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
        />
      </div>

      {/* Description Preview Modal */}
      {previewContent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-100 overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h3 className="font-extrabold text-slate-900 text-sm">
                Description: {previewContent.title}
              </h3>
              <button
                onClick={() => setPreviewContent(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 max-h-[60vh] overflow-y-auto">
              <div
                className="prose prose-sm max-w-none text-xs text-slate-700 leading-relaxed"
                dangerouslySetInnerHTML={{ __html: previewContent.description || '<p class="italic text-slate-400">No description content.</p>' }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
