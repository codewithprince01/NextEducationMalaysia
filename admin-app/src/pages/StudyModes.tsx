import React, { useEffect, useState } from 'react';
import { confirmDelete } from '@/lib/swal';
import Pagination from '@/components/common/Pagination';
import {
  BookOpen,
  Plus,
  Search,
  Edit2,
  Trash2,
  Loader2,
  X,
  CheckCircle2,
  AlertCircle,
  RefreshCw
} from 'lucide-react';

interface StudyModeItem {
  id: number;
  study_mode: string;
  created_at?: string;
}

export default function StudyModes() {
  const [modes, setModes] = useState<StudyModeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Pagination State (20 per page)
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  // Add / Edit Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    study_mode: '',
  });

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/v1/admin/study-modes');
      const json = await res.json();
      if (res.ok && json.status) {
        setModes(json.data || []);
      } else {
        showToast('error', json.message || 'Failed to fetch study modes');
      }
    } catch {
      showToast('error', 'Network error while fetching data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenAdd = () => {
    setEditingId(null);
    setFormData({ study_mode: '' });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: StudyModeItem) => {
    setEditingId(item.id);
    setFormData({ study_mode: item.study_mode });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.study_mode.trim()) {
      showToast('error', 'Study mode name is required');
      return;
    }

    setSubmitting(true);
    try {
      const url = editingId
        ? `/api/v1/admin/study-modes/${editingId}`
        : '/api/v1/admin/study-modes';
      const method = editingId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const json = await res.json();
      if (res.ok && json.status) {
        showToast('success', json.message || (editingId ? 'Updated successfully' : 'Created successfully'));
        setIsModalOpen(false);
        fetchData();
      } else {
        showToast('error', json.message || 'Operation failed');
      }
    } catch {
      showToast('error', 'Network error while saving data');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number, name: string) => {
    const isConfirmed = await confirmDelete(
      'Delete Study Mode?',
      `Are you sure you want to delete "${name}"?`
    );
    if (!isConfirmed) return;

    try {
      const res = await fetch(`/api/v1/admin/study-modes/${id}`, { method: 'DELETE' });
      const json = await res.json();
      if (res.ok && json.status) {
        showToast('success', 'Study mode deleted successfully');
        fetchData();
      } else {
        showToast('error', json.message || 'Failed to delete item');
      }
    } catch {
      showToast('error', 'Network error while deleting item');
    }
  };

  // Filter & Pagination
  const filtered = modes.filter((item) =>
    item.study_mode?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginated = filtered.slice(
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
          <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-extrabold text-blue-700 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded-full uppercase tracking-wider">
                University Setup
              </span>
            </div>
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight mt-0.5">Study Modes List</h1>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Manage study modes (Full-time, Part-time, Online/Distance Learning, Hybrid).
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

          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-600/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Study Mode</span>
          </button>
        </div>
      </div>

      {/* Search & Stats Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search study mode..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all"
          />
        </div>

        <div className="text-xs font-semibold text-slate-500">
          Total Modes: <span className="text-slate-900 font-bold">{modes.length}</span>
        </div>
      </div>

      {/* Main Data Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 flex flex-col items-center justify-center text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-3" />
            <p className="text-xs font-semibold">Loading study modes...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <BookOpen className="w-12 h-12 mx-auto mb-3 text-slate-300" />
            <p className="text-sm font-bold text-slate-700">No Study Modes Found</p>
            <p className="text-xs text-slate-400 mt-1">Add a new study mode to get started.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200/80 text-slate-500 font-extrabold uppercase tracking-wider text-[10.5px]">
                  <th className="py-3.5 px-4 w-14 text-center">Sr. No.</th>
                  <th className="py-3.5 px-4 w-14 text-center">ID</th>
                  <th className="py-3.5 px-5">Study Mode Name</th>
                  <th className="py-3.5 px-5">Created At</th>
                  <th className="py-3.5 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {paginated.map((item, index) => {
                  const srNo = (currentPage - 1) * itemsPerPage + index + 1;
                  return (
                    <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-4 px-4 text-center font-extrabold text-slate-700">{srNo}</td>
                      <td className="py-4 px-4 text-center font-bold text-slate-400">#{item.id}</td>
                      <td className="py-4 px-5">
                        <div className="font-bold text-slate-900 text-xs">{item.study_mode}</div>
                      </td>
                      <td className="py-4 px-5 text-slate-500 font-mono text-[11px]">
                        {item.created_at ? new Date(item.created_at).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="py-4 px-5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenEdit(item)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
                            title="Edit Study Mode"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(item.id, item.study_mode)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                            title="Delete Study Mode"
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

        {/* Pagination Footer */}
        {filtered.length > itemsPerPage && (
          <div className="p-4 border-t border-slate-100 flex items-center justify-between">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        )}
      </div>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-100 overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h3 className="font-extrabold text-slate-900 text-sm">
                {editingId ? 'Edit Study Mode' : 'Add New Study Mode'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Study Mode Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Full-time, Part-time, Online"
                  value={formData.study_mode}
                  onChange={(e) => setFormData({ ...formData, study_mode: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:border-blue-600 focus:bg-white transition-all"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-600/20 disabled:opacity-50 transition-all cursor-pointer flex items-center gap-2"
                >
                  {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{editingId ? 'Update Mode' : 'Save Mode'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
