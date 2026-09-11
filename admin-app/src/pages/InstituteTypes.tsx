import React, { useEffect, useState } from 'react';
import { confirmDelete } from '@/lib/swal';
import Pagination from '@/components/common/Pagination';
import {
  Building2,
  Plus,
  Edit2,
  Trash2,
  Loader2,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  X
} from 'lucide-react';

interface InstituteTypeItem {
  id: number;
  type: string;
  slug: string;
  seo_title?: string;
  seo_title_slug?: string;
  university_count?: number;
  created_at?: string;
}

export default function InstituteTypes() {
  const [types, setTypes] = useState<InstituteTypeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Pagination & Display State
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Form Modal State (Closed by default, matching StudyModes.tsx)
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    type: '',
    seo_title: '',
  });

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/v1/admin/institute-types');
      const json = await res.json();
      if (res.ok && json.status) {
        setTypes(json.data || []);
      } else {
        showToast('error', json.message || 'Failed to fetch institute types');
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

  const handleReset = () => {
    setEditingId(null);
    setFormData({ type: '', seo_title: '' });
  };

  const handleOpenAdd = () => {
    handleReset();
    setIsFormOpen(true);
  };

  const handleOpenEdit = (item: InstituteTypeItem) => {
    setEditingId(item.id);
    setFormData({
      type: item.type || '',
      seo_title: item.seo_title || '',
    });
    setIsFormOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.type.trim()) {
      showToast('error', 'Institute type name is required');
      return;
    }

    setSubmitting(true);
    try {
      const url = editingId
        ? `/api/v1/admin/institute-types/${editingId}`
        : '/api/v1/admin/institute-types';
      const method = editingId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const json = await res.json();
      if (res.ok && json.status) {
        showToast('success', json.message || (editingId ? 'Updated successfully' : 'Created successfully'));
        handleReset();
        setIsFormOpen(false);
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
      'Delete Institute Type?',
      `Are you sure you want to delete "${name}"?`
    );
    if (!isConfirmed) return;

    try {
      const res = await fetch(`/api/v1/admin/institute-types/${id}`, { method: 'DELETE' });
      const json = await res.json();
      if (res.ok && json.status) {
        showToast('success', 'Institute type deleted successfully');
        fetchData();
      } else {
        showToast('error', json.message || 'Failed to delete item');
      }
    } catch {
      showToast('error', 'Network error while deleting item');
    }
  };

  // Filter & Pagination
  const filtered = types.filter(
    (item) =>
      item.type?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.seo_title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.slug?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, itemsPerPage]);

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginated = filtered.slice(startIndex, startIndex + itemsPerPage);

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
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-extrabold text-indigo-600 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-full uppercase tracking-wider">
                University Setup
              </span>
            </div>
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight mt-0.5">Institute Type</h1>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Manage university & college institute classifications.
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
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Institute Type</span>
          </button>
        </div>
      </div>

      {/* Data Table Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        {/* Table Controls Header */}
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
            <span>Show</span>
            <select
              value={itemsPerPage}
              onChange={(e) => setItemsPerPage(Number(e.target.value))}
              className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs font-bold text-slate-800 focus:outline-none focus:border-indigo-500"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
            <span>entries</span>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <button
              onClick={fetchData}
              className="p-2 rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50 transition-colors cursor-pointer"
              title="Refresh table"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>

            <div className="relative flex-1 sm:w-64">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                Search:
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-16 pr-3 py-1.5 text-xs font-medium text-slate-800 focus:outline-none focus:border-indigo-500 focus:bg-white transition-all"
              />
            </div>
          </div>
        </div>

        {/* Main Table */}
        {loading ? (
          <div className="p-12 flex flex-col items-center justify-center text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mb-3" />
            <p className="text-xs font-semibold">Loading institute types...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <Building2 className="w-12 h-12 mx-auto mb-3 text-slate-300" />
            <p className="text-sm font-bold text-slate-700">No Institute Types Found</p>
            <p className="text-xs text-slate-400 mt-1">Add a new record to get started.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200/80 text-slate-600 font-extrabold uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4 w-16">Sr. No.</th>
                  <th className="py-3 px-4 w-16">Id</th>
                  <th className="py-3 px-6">Type</th>
                  <th className="py-3 px-6">SEO Name</th>
                  <th className="py-3 px-6">University</th>
                  <th className="py-3 px-4 text-center w-28">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {paginated.map((item, index) => {
                  const srNo = startIndex + index + 1;
                  return (
                    <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-slate-700">{srNo}</td>
                      <td className="py-3.5 px-4 font-bold text-slate-600">{item.id}</td>
                      <td className="py-3.5 px-6 font-semibold text-slate-900">{item.type}</td>
                      <td className="py-3.5 px-6 font-medium text-slate-700">{item.seo_title || item.type}</td>
                      <td className="py-3.5 px-6">
                        <span className="px-2 py-0.5 text-xs font-bold text-white bg-sky-500 rounded-md inline-block shadow-2xs">
                          {item.university_count ?? 0}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => handleDelete(item.id, item.type)}
                            className="p-1.5 rounded-lg bg-red-500 hover:bg-red-600 text-white transition-colors cursor-pointer shadow-2xs"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleOpenEdit(item)}
                            className="p-1.5 rounded-lg bg-sky-500 hover:bg-sky-600 text-white transition-colors cursor-pointer shadow-2xs"
                            title="Edit"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
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

        {/* Table Footer */}
        <div className="p-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs font-semibold text-slate-500">
            Showing {filtered.length === 0 ? 0 : startIndex + 1} to{' '}
            {Math.min(startIndex + itemsPerPage, filtered.length)} of {filtered.length} entries
          </div>

          {totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          )}
        </div>
      </div>

      {/* Add / Edit Form Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-100 overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h3 className="font-extrabold text-slate-900 text-sm">
                {editingId ? 'Edit Institute Type' : 'Add New Institute Type'}
              </h3>
              <button
                onClick={() => setIsFormOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Enter Institute Type *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Public University, Private University, College"
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:border-indigo-500 focus:bg-white transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Enter Institute Type SEO Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Public Universities in Malaysia"
                  value={formData.seo_title}
                  onChange={(e) => setFormData({ ...formData, seo_title: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:border-indigo-500 focus:bg-white transition-all"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20 disabled:opacity-50 transition-all cursor-pointer flex items-center gap-2"
                >
                  {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{editingId ? 'Update Record' : 'Save Record'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
