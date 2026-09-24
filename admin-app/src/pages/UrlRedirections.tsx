import React, { useEffect, useState } from 'react';
import { confirmDelete } from '@/lib/swal';
import Pagination from '@/components/common/Pagination';
import {
  Home,
  Plus,
  Minus,
  Edit2,
  Trash2,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Pause,
  Play,
  X
} from 'lucide-react';

interface UrlRedirectionItem {
  id: number;
  old_url: string;
  new_url: string;
  status_code?: number;
  status?: number;
  hits?: number;
  last_hit?: string | null;
  created_at?: string;
  updated_at?: string;
}

export default function UrlRedirections() {
  const [items, setItems] = useState<UrlRedirectionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterInput, setFilterInput] = useState('');
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Form state
  const [isFormOpen, setIsFormOpen] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [togglingId, setTogglingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    old_url: '',
    new_url: '',
    status_code: 301,
    status: 1,
  });

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/v1/admin/url-redirections');
      if (res.ok) {
        const json = await res.json();
        if (json.status || json.success) {
          setItems(json.data || []);
        } else {
          setItems([]);
        }
      } else {
        setItems([]);
      }
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleResetForm = () => {
    setEditingId(null);
    setFormData({
      old_url: '',
      new_url: '',
      status_code: 301,
      status: 1,
    });
  };

  const handleOpenEdit = (item: UrlRedirectionItem) => {
    setEditingId(item.id);
    setFormData({
      old_url: item.old_url || '',
      new_url: item.new_url || '',
      status_code: item.status_code || 301,
      status: item.status !== 0 ? 1 : 0,
    });
    setIsFormOpen(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleToggleStatus = async (item: UrlRedirectionItem) => {
    const nextStatus = item.status === 1 ? 0 : 1;
    setTogglingId(item.id);

    // Optimistic local update
    setItems((prev) =>
      prev.map((r) => (r.id === item.id ? { ...r, status: nextStatus } : r))
    );

    try {
      const res = await fetch(`/api/v1/admin/url-redirections/${item.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus }),
      });
      const json = await res.json();
      if (res.ok && json.status) {
        showToast('success', `Status marked as ${nextStatus === 1 ? 'Active' : 'Inactive'}`);
      } else {
        fetchData();
        showToast('error', json.message || 'Failed to toggle status');
      }
    } catch {
      fetchData();
      showToast('error', 'Error updating status');
    } finally {
      setTogglingId(null);
    }
  };

  const handleDelete = async (id: number) => {
    const isConfirmed = await confirmDelete('Are you sure you want to delete this redirection rule?');
    if (!isConfirmed) return;

    try {
      const res = await fetch(`/api/v1/admin/url-redirections/${id}`, { method: 'DELETE' });
      const json = await res.json();

      if (res.ok && (json.status || json.success)) {
        showToast('success', 'Record deleted successfully');
        if (editingId === id) handleResetForm();
        fetchData();
      } else {
        showToast('error', json.message || json.error || 'Failed to delete');
      }
    } catch {
      showToast('error', 'Error deleting record');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.old_url.trim() || !formData.new_url.trim()) {
      showToast('error', 'Both Old URL and Redirect To are required');
      return;
    }

    setSubmitting(true);
    try {
      const url = editingId
        ? `/api/v1/admin/url-redirections/${editingId}`
        : '/api/v1/admin/url-redirections';
      const method = editingId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const json = await res.json();
      if (res.ok && (json.status || json.success)) {
        showToast('success', json.message || (editingId ? 'Record has been updated successfully.' : 'Record has been added successfully.'));
        handleResetForm();
        fetchData();
      } else {
        showToast('error', json.message || json.error || 'Action failed');
      }
    } catch {
      showToast('error', 'Network error');
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = items.filter((item) =>
    (item.old_url || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (item.new_url || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const paginated = filtered.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto pb-12 font-sans text-slate-800">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed top-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-xl text-white text-sm font-semibold transition-all duration-300 ${
            toast.type === 'success' ? 'bg-emerald-600' : 'bg-rose-600'
          }`}
        >
          {toast.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Header & Breadcrumb */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-700 tracking-tight">Url Redirections</h1>
        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
          <Home className="w-3.5 h-3.5 text-slate-400" />
          <span>›</span>
          <span className="text-slate-600 font-bold">Url Redirections</span>
        </div>
      </div>

      {/* Add New Redirect Card (Collapsible) */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        {/* Card Header Bar */}
        <div className="bg-[#2c3e50] text-white px-5 py-3.5 flex items-center justify-between">
          <h2 className="text-sm font-bold tracking-wide uppercase">
            {editingId ? 'Edit Redirect' : 'Add New Redirect'}
          </h2>
          <button
            type="button"
            onClick={() => setIsFormOpen(!isFormOpen)}
            className="w-7 h-7 rounded-full bg-sky-500 hover:bg-sky-600 text-white flex items-center justify-center transition-colors cursor-pointer shadow-xs"
            title={isFormOpen ? 'Collapse Form' : 'Expand Form'}
          >
            {isFormOpen ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          </button>
        </div>

        {/* Card Body Form */}
        {isFormOpen && (
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
              {/* Old URL */}
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-2 tracking-wider">
                  OLD URL <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Old URL"
                  value={formData.old_url}
                  onChange={(e) => setFormData({ ...formData, old_url: e.target.value })}
                  className="w-full px-4 py-2.5 text-sm bg-white border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all"
                />
                <p className="text-[11px] font-medium text-slate-400 mt-1.5">Example: /old-page</p>
              </div>

              {/* Redirect To */}
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-2 tracking-wider">
                  REDIRECT TO <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Redirect To"
                  value={formData.new_url}
                  onChange={(e) => setFormData({ ...formData, new_url: e.target.value })}
                  className="w-full px-4 py-2.5 text-sm bg-white border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all"
                />
                <p className="text-[11px] font-medium text-slate-400 mt-1.5">Use /new-page or https://example.com/new-page</p>
              </div>

              {/* Status Code */}
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-2 tracking-wider">
                  STATUS CODE <span className="text-rose-500">*</span>
                </label>
                <select
                  value={formData.status_code}
                  onChange={(e) => setFormData({ ...formData, status_code: Number(e.target.value) })}
                  className="w-full px-4 py-2.5 text-sm bg-white border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 cursor-pointer transition-all font-medium text-slate-700"
                >
                  <option value={301}>301</option>
                  <option value={302}>302</option>
                </select>
              </div>
            </div>

            {/* Activate Immediately Toggle Switch */}
            <div className="flex items-center gap-3 pt-1">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, status: formData.status === 1 ? 0 : 1 })}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                  formData.status === 1 ? 'bg-indigo-600' : 'bg-slate-300'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                    formData.status === 1 ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
              <span className="text-xs font-bold text-slate-600 tracking-wider uppercase">
                ACTIVATE IMMEDIATELY
              </span>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={handleResetForm}
                className="px-6 py-2 rounded-full bg-amber-400 hover:bg-amber-500 text-white text-xs font-bold tracking-wide transition-all shadow-2xs cursor-pointer active:scale-95"
              >
                Reset
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-7 py-2 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold tracking-wide transition-all shadow-md cursor-pointer active:scale-95 disabled:opacity-50 inline-flex items-center gap-2"
              >
                {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>{editingId ? 'Update' : 'Submit'}</span>
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Search Filter Card */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <input
              type="text"
              placeholder="Search old or new URL"
              value={filterInput}
              onChange={(e) => setFilterInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') setSearchQuery(filterInput);
              }}
              className="w-full px-4 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
            />
            {filterInput && (
              <button
                type="button"
                onClick={() => {
                  setFilterInput('');
                  setSearchQuery('');
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
            <button
              type="button"
              onClick={() => setSearchQuery(filterInput)}
              className="px-6 py-2.5 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold tracking-wide shadow-xs transition-all cursor-pointer active:scale-95 flex-1 sm:flex-none text-center"
            >
              Search
            </button>
            <button
              type="button"
              onClick={() => {
                setFilterInput('');
                setSearchQuery('');
              }}
              className="px-6 py-2.5 rounded-full bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold tracking-wide transition-all cursor-pointer active:scale-95 flex-1 sm:flex-none text-center"
            >
              Clear
            </button>
          </div>
        </div>
      </div>

      {/* Main Data Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-extrabold uppercase tracking-wider text-[11px]">
                <th className="py-3.5 px-4 w-20 text-center">SR. NO.</th>
                <th className="py-3.5 px-5 min-w-[340px]">URL</th>
                <th className="py-3.5 px-4 w-28 text-center">STATUS</th>
                <th className="py-3.5 px-4 w-20 text-center">HITS</th>
                <th className="py-3.5 px-4 w-28 text-center">LAST HIT</th>
                <th className="py-3.5 px-4 w-32 text-center">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-indigo-600" />
                    <span>Loading URL redirections...</span>
                  </td>
                </tr>
              ) : paginated.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400 font-semibold">
                    No redirection rules found
                  </td>
                </tr>
              ) : (
                paginated.map((item, index) => {
                  const srNo = (currentPage - 1) * itemsPerPage + index + 1;
                  const isActive = item.status !== 0;
                  const statusCode = item.status_code || 301;

                  return (
                    <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                      {/* Sr. No */}
                      <td className="py-4 px-4 text-center font-bold text-slate-500">
                        {srNo}
                      </td>

                      {/* URL (Old and New formatted) */}
                      <td className="py-4 px-5 space-y-1.5 font-sans font-medium text-xs break-all">
                        <div className="flex items-start gap-1">
                          <span className="font-bold text-slate-500 shrink-0">Old :</span>
                          <span className="text-indigo-600 font-medium">{item.old_url}</span>
                        </div>
                        <div className="flex items-start gap-1">
                          <span className="font-bold text-slate-500 shrink-0">New :</span>
                          <span className="text-rose-500 font-medium">{item.new_url}</span>
                        </div>
                      </td>

                      {/* Status Badge */}
                      <td className="py-4 px-4 text-center">
                        <span
                          className={`inline-flex items-center justify-center px-2.5 py-1 rounded-md text-[10.5px] font-bold text-white shadow-2xs ${
                            isActive ? 'bg-emerald-500' : 'bg-slate-400'
                          }`}
                        >
                          {isActive ? `Active ${statusCode}` : `Inactive ${statusCode}`}
                        </span>
                      </td>

                      {/* Hits */}
                      <td className="py-4 px-4 text-center font-bold text-slate-600">
                        {item.hits ?? 0}
                      </td>

                      {/* Last Hit */}
                      <td className="py-4 px-4 text-center text-slate-400 font-semibold text-[11px]">
                        {item.last_hit || '-'}
                      </td>

                      {/* Action Icon Buttons */}
                      <td className="py-4 px-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          {/* Pause / Play Toggle Status */}
                          <button
                            type="button"
                            onClick={() => handleToggleStatus(item)}
                            disabled={togglingId === item.id}
                            className={`w-7 h-7 rounded-full text-white flex items-center justify-center shadow-md transition-all hover:scale-110 active:scale-95 cursor-pointer ${
                              isActive ? 'bg-amber-400 hover:bg-amber-500' : 'bg-emerald-500 hover:bg-emerald-600'
                            } ${togglingId === item.id ? 'opacity-60 cursor-wait' : ''}`}
                            title={isActive ? 'Deactivate Redirection' : 'Activate Redirection'}
                          >
                            {togglingId === item.id ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : isActive ? (
                              <Pause className="w-3.5 h-3.5 fill-white" />
                            ) : (
                              <Play className="w-3.5 h-3.5 fill-white" />
                            )}
                          </button>

                          {/* Edit */}
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(item)}
                            className="w-7 h-7 rounded-full bg-sky-400 hover:bg-sky-500 text-white flex items-center justify-center shadow-md transition-all hover:scale-110 active:scale-95 cursor-pointer"
                            title="Edit"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          {/* Delete */}
                          <button
                            type="button"
                            onClick={() => handleDelete(item.id)}
                            className="w-7 h-7 rounded-full bg-rose-500 hover:bg-rose-600 text-white flex items-center justify-center shadow-md transition-all hover:scale-110 active:scale-95 cursor-pointer"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
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
    </div>
  );
}
