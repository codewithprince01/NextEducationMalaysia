import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { confirmDelete } from '@/lib/swal';
import Pagination from '@/components/common/Pagination';
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
  Image as ImageIcon,
  ChevronUp
} from 'lucide-react';

interface DefaultOgImageItem {
  id: number;
  page?: string;
  file_name?: string;
  file_path?: string;
  og_image_path?: string;
  is_default?: number;
  created_at?: string;
}

export default function DefaultOgImage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [items, setItems] = useState<DefaultOgImageItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  // Form visibility & Editing state
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    page: '',
    file_path: '',
  });

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/v1/admin/default-og-image');
      const json = await res.json();
      if (res.ok && json.status) {
        const fetchedItems: DefaultOgImageItem[] = json.data || [];
        setItems(fetchedItems);

        // Check URL for ?edit=<ID>
        const editIdParam = searchParams.get('edit');
        if (editIdParam) {
          const targetId = parseInt(editIdParam, 10);
          const found = fetchedItems.find((i) => i.id === targetId);
          if (found) {
            populateForm(found);
          }
        }
      } else {
        showToast('error', json.message || 'Failed to fetch default OG images');
      }
    } catch {
      showToast('error', 'Network error while fetching default OG images');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const populateForm = (item: DefaultOgImageItem) => {
    setEditingId(item.id);
    setFormData({
      page: item.page || '',
      file_path: item.file_path || item.og_image_path || '',
    });
    setShowForm(true);
  };

  const handleOpenAdd = () => {
    setEditingId(null);
    setFormData({
      page: '',
      file_path: '',
    });
    setSearchParams({}, { replace: true });
    setShowForm(true);
  };

  const handleOpenEdit = (item: DefaultOgImageItem) => {
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
    const isConfirmed = await confirmDelete('Are you sure you want to delete this OG image record?');
    if (!isConfirmed) return;

    try {
      const res = await fetch(`/api/v1/admin/default-og-image/${id}`, { method: 'DELETE' });
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
    if (!formData.page.trim()) {
      showToast('error', 'Enter Page Name is required');
      return;
    }
    if (!formData.file_path.trim() && !editingId) {
      showToast('error', 'Upload File is required');
      return;
    }

    setSubmitting(true);
    try {
      const url = editingId
        ? `/api/v1/admin/default-og-image/${editingId}`
        : '/api/v1/admin/default-og-image';
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
    (item.page || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (item.file_path || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const paginated = filtered.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const getImageUrl = (path?: string) => {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    return `/${path.replace(/^\/+/, '')}`;
  };

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
            <ImageIcon className="w-6 h-6 text-indigo-600" /> Default OG Image
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage page default OG image records.
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
                <Plus className="w-4 h-4" /> Add Default OG Image
              </>
            )}
          </button>
        </div>
      </div>

      {/* Form Card (Matching Laravel default-og-image.blade.php) */}
      {showForm && (
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden animate-fadeIn">
          <div className="flex items-center justify-between p-4 px-6 border-b border-slate-200 bg-slate-50/50">
            <h3 className="text-base font-bold text-slate-800">
              {editingId ? 'Edit Default OG Image Record' : 'Add Default OG Image Record'}
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1.5">
                  Enter Page Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. all, home, courses"
                  value={formData.page}
                  onChange={(e) => setFormData({ ...formData, page: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1.5">
                  Upload File <span className="text-rose-500">{editingId ? '' : '*'}</span>
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setFormData({ ...formData, file_path: file.name });
                    }
                  }}
                  className="w-full text-xs text-slate-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-slate-200 file:text-slate-700 hover:file:bg-slate-300 cursor-pointer border border-slate-200 rounded-lg bg-slate-50"
                />
                {formData.file_path && (
                  <span className="text-[11px] text-slate-500 mt-1 block truncate font-mono">
                    Selected File: {formData.file_path}
                  </span>
                )}
              </div>
            </div>

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
                      page: '',
                      file_path: '',
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

      {/* Controls / Search */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row gap-4 justify-between items-center">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search pages or files..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
          />
        </div>
        <div className="text-xs text-slate-500">
          Showing <span className="font-semibold text-slate-700">{filtered.length}</span> entries
        </div>
      </div>

      {/* Table (Matching Laravel's Columns: S.No., Page, File, Action) */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold text-xs uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4 w-16">S.No.</th>
                <th className="py-3.5 px-4">Page</th>
                <th className="py-3.5 px-4">File</th>
                <th className="py-3.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={4} className="py-12 text-center text-slate-400">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-indigo-600" />
                    Loading default OG images...
                  </td>
                </tr>
              ) : paginated.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-12 text-center text-slate-400">
                    No OG image records found.
                  </td>
                </tr>
              ) : (
                paginated.map((item, index) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-medium text-slate-500">
                      {(currentPage - 1) * itemsPerPage + index + 1}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-800">
                      {item.page || 'all'}
                    </td>
                    <td className="py-3.5 px-4">
                      {item.file_path || item.og_image_path ? (
                        <div className="flex items-center gap-3">
                          <img
                            src={getImageUrl(item.file_path || item.og_image_path)}
                            alt={item.page || 'OG Image'}
                            className="w-12 h-12 object-cover rounded border border-slate-200 bg-slate-50"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = 'none';
                              const nextSibling = (e.target as HTMLElement).nextElementSibling as HTMLElement;
                              if (nextSibling) nextSibling.style.display = 'inline-block';
                            }}
                          />
                          <span className="hidden text-slate-400 text-xs font-mono truncate max-w-xs">
                            {item.file_path || item.og_image_path}
                          </span>
                        </div>
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
    </div>
  );
}
