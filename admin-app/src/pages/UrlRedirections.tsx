import React, { useEffect, useState } from 'react';
import { confirmDelete } from '@/lib/swal';
import Pagination from '@/components/common/Pagination';
import {
  ArrowLeftRight,
  Search,
  Edit2,
  Trash2,
  Loader2,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Plus,
  ExternalLink,
  RotateCcw,
  X
} from 'lucide-react';

interface UrlRedirectionItem {
  id: number;
  old_url: string;
  new_url: string;
  created_at?: string;
}

export default function UrlRedirections() {
  const [items, setItems] = useState<UrlRedirectionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Form state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    old_url: '',
    new_url: '',
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
    setFormData({ old_url: '', new_url: '' });
    setIsFormOpen(false);
  };

  const handleOpenEdit = (item: UrlRedirectionItem) => {
    setEditingId(item.id);
    setFormData({
      old_url: item.old_url || '',
      new_url: item.new_url || '',
    });
    setIsFormOpen(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
      showToast('error', 'Both Old URL and New URL are required');
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
    <div className="space-y-4 max-w-[1600px] mx-auto">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed top-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-lg shadow-xl text-white text-sm font-medium transition-all duration-300 ${toast.type === 'success' ? 'bg-[#14532d]' : 'bg-rose-600'
            }`}
        >
          {toast.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-stone-200/90 shadow-xs">
        <div>
          <h1 className="text-2xl font-bold text-stone-900 tracking-tight flex items-center gap-2">
            <ArrowLeftRight className="w-6 h-6 text-[#14532d]" /> Url Redirections
          </h1>
          <p className="text-sm text-stone-500 mt-1">
            Manage 301/302 HTTP URL redirects for legacy paths and SEO optimization.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchData}
            className="p-2.5 text-stone-600 hover:text-[#14532d] hover:bg-stone-50 rounded-xl border border-stone-200 transition-colors cursor-pointer"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            type="button"
            onClick={() => {
              if (isFormOpen) {
                handleResetForm();
              } else {
                setEditingId(null);
                setFormData({ old_url: '', new_url: '' });
                setIsFormOpen(true);
              }
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-[#14532d] hover:bg-[#0f3e21] text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
          >
            {isFormOpen ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            <span>{isFormOpen ? 'Close Form' : '+ Add Redirection'}</span>
          </button>
        </div>
      </div>

      {/* Form Card */}
      {isFormOpen && (
        <div className="bg-white rounded-2xl border border-stone-200/90 shadow-xs p-6 animate-fadeIn">
          <div className="flex items-center justify-between border-b border-stone-100 pb-3 mb-4">
            <h2 className="text-base font-bold text-stone-800 flex items-center gap-2">
              {editingId ? <Edit2 className="w-4 h-4 text-[#14532d]" /> : <Plus className="w-4 h-4 text-[#14532d]" />}
              {editingId ? 'Update Redirection Record' : 'Add New Redirection Record'}
            </h2>
            <button
              type="button"
              onClick={handleResetForm}
              className="text-stone-400 hover:text-stone-600 text-xs font-medium cursor-pointer"
            >
              Cancel
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase mb-1.5">
                  Old Url (Not enter full url, skip domain , Ex:/blog) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: /blog or /old-page"
                  value={formData.old_url}
                  onChange={(e) => setFormData({ ...formData, old_url: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:outline-hidden focus:ring-1 focus:ring-emerald-500 focus:border-emerald-600 focus:bg-white transition-all font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase mb-1.5">
                  New Url (Not enter full url, skip domain) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: /blogs or /new-page"
                  value={formData.new_url}
                  onChange={(e) => setFormData({ ...formData, new_url: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:outline-hidden focus:ring-1 focus:ring-emerald-500 focus:border-emerald-600 focus:bg-white transition-all font-mono"
                />
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={handleResetForm}
                className="flex items-center gap-1.5 px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-bold shadow-2xs transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Cancel / Reset
              </button>

              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-[#14532d] hover:bg-[#0f3e21] text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer disabled:opacity-50"
              >
                {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                {editingId ? 'Update Redirection' : 'Save Redirection'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Table Card */}
      <div className="bg-white rounded-2xl border border-stone-200/90 shadow-xs overflow-hidden">
        {/* Controls */}
        <div className="p-4 border-b border-stone-100 flex flex-col sm:flex-row gap-4 justify-between items-center bg-stone-50/50">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              placeholder="Search old or new URL..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs bg-white border border-stone-200 rounded-xl focus:outline-hidden focus:ring-1 focus:ring-emerald-500 focus:border-emerald-600 transition-all font-medium"
            />
          </div>
          <div className="text-xs text-stone-500">
            Showing <span className="font-bold text-stone-800">{filtered.length}</span> entries
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-stone-700">
            <thead>
              <tr className="bg-[#effaf2] border-b-2 border-[#c8ebd2] text-[#14532d] font-extrabold text-[11px] uppercase tracking-wider">
                <th className="py-3.5 px-4 w-20 text-center text-emerald-700">Sr. No.</th>
                <th className="py-3.5 px-4 text-[#14532d]">Urls</th>
                <th className="py-3.5 px-4 w-32 text-center text-[#14532d]">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {loading ? (
                <tr>
                  <td colSpan={3} className="py-12 text-center text-stone-400">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-[#14532d]" />
                    Loading url redirections...
                  </td>
                </tr>
              ) : paginated.length === 0 ? (
                <tr>
                  <td colSpan={3} className="py-12 text-center text-stone-400">
                    No data found
                  </td>
                </tr>
              ) : (
                paginated.map((item, index) => {
                  const srNo = (currentPage - 1) * itemsPerPage + index + 1;
                  return (
                    <tr key={item.id} className="hover:bg-[#faf8f4] transition-colors font-medium">
                      <td className="py-3.5 px-4 font-bold text-emerald-700 text-center">{srNo}</td>
                      <td className="py-3.5 px-4 space-y-2">
                        <div className="flex items-center gap-2">
                          <a
                            href={item.old_url}
                            target="_blank"
                            rel="noreferrer"
                            className="text-xs font-bold text-[#14532d] hover:underline flex items-center gap-1 min-w-[70px]"
                          >
                            Old Url <ExternalLink className="w-3 h-3" />
                          </a>
                          <span className="text-stone-400">:</span>
                          <input
                            type="text"
                            readOnly
                            value={item.old_url}
                            className="flex-1 max-w-md px-3 py-1 bg-stone-50 border border-stone-200 rounded-lg text-xs font-mono text-stone-700 focus:outline-hidden"
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <a
                            href={item.new_url}
                            target="_blank"
                            rel="noreferrer"
                            className="text-xs font-bold text-emerald-700 hover:underline flex items-center gap-1 min-w-[70px]"
                          >
                            New Url <ExternalLink className="w-3 h-3" />
                          </a>
                          <span className="text-stone-400">:</span>
                          <input
                            type="text"
                            readOnly
                            value={item.new_url}
                            className="flex-1 max-w-md px-3 py-1 bg-stone-50 border border-stone-200 rounded-lg text-xs font-mono text-stone-700 focus:outline-hidden"
                          />
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => handleOpenEdit(item)}
                            className="p-1.5 rounded-lg bg-[#effaf2] text-[#14532d] hover:bg-[#dcfce7] border border-[#c8ebd2]/60 shadow-2xs transition-colors cursor-pointer"
                            title="Edit"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="p-1.5 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200/60 shadow-2xs transition-colors cursor-pointer"
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
          <div className="p-4 border-t border-stone-100">
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
