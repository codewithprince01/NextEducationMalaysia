import React, { useEffect, useState } from 'react';
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
  BarChart3
} from 'lucide-react';

interface CategoryItem {
  id: number;
  category_name: string;
}

interface MalaysiaAppItem {
  id: number;
  year: number;
  category_id: number;
  category_name?: string;
  count: number;
  created_at?: string;
}

export default function MalaysiaApplications() {
  const [items, setItems] = useState<MalaysiaAppItem[]>([]);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    year: new Date().getFullYear(),
    category_id: '',
    count: 0,
  });

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/v1/admin/malaysia-application-categories');
      const json = await res.json();
      if (res.ok && json.status) {
        setCategories(json.data || []);
      }
    } catch {
      // Ignore background fetch error
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/v1/admin/malaysia-applications');
      const json = await res.json();
      if (res.ok && json.status) {
        setItems(json.data || []);
      } else {
        showToast('error', json.message || 'Failed to fetch applications');
      }
    } catch {
      showToast('error', 'Network error while fetching applications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchData();
  }, []);

  const handleOpenAdd = () => {
    setEditingId(null);
    setFormData({
      year: new Date().getFullYear(),
      category_id: categories[0]?.id ? String(categories[0].id) : '',
      count: 0,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: MalaysiaAppItem) => {
    setEditingId(item.id);
    setFormData({
      year: item.year || new Date().getFullYear(),
      category_id: String(item.category_id || ''),
      count: item.count || 0,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    const isConfirmed = await confirmDelete('Are you sure you want to delete this record?');
    if (!isConfirmed) return;

    try {
      const res = await fetch(`/api/v1/admin/malaysia-applications/${id}`, { method: 'DELETE' });
      const json = await res.json();

      if (res.ok && json.status) {
        showToast('success', 'Deleted successfully');
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
    if (!formData.year || !formData.category_id) {
      showToast('error', 'Year and Category are required');
      return;
    }

    setSubmitting(true);
    try {
      const url = editingId
        ? `/api/v1/admin/malaysia-applications/${editingId}`
        : '/api/v1/admin/malaysia-applications';
      const method = editingId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const json = await res.json();
      if (res.ok && json.status) {
        showToast('success', editingId ? 'Updated successfully' : 'Created successfully');
        setIsModalOpen(false);
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
    String(item.year).includes(searchQuery) ||
    (item.category_name || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const paginated = filtered.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="space-y-3 max-w-[1600px] mx-auto">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed top-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-lg shadow-xl text-white text-sm font-medium transition-all duration-300 ${
            toast.type === 'success' ? 'bg-emerald-600' : 'bg-rose-600'
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
            <BarChart3 className="w-6 h-6 text-indigo-600" /> Malaysia Course Applications
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Annual EMGS statistics and breakdown of course application counts.
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
            onClick={handleOpenAdd}
            className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" /> Add Application Data
          </button>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row gap-4 justify-between items-center">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search year or category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
          />
        </div>
        <div className="text-xs text-slate-500">
          Showing <span className="font-semibold text-slate-700">{filtered.length}</span> entries
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold text-xs uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4 w-16">ID</th>
                <th className="py-3.5 px-4">Year</th>
                <th className="py-3.5 px-4">Category Name</th>
                <th className="py-3.5 px-4">Application Count</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-indigo-600" />
                    Loading application statistics...
                  </td>
                </tr>
              ) : paginated.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    No application statistics found.
                  </td>
                </tr>
              ) : (
                paginated.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-medium text-slate-400">#{item.id}</td>
                    <td className="py-3.5 px-4 font-semibold text-slate-800">{item.year}</td>
                    <td className="py-3.5 px-4 font-medium text-indigo-600">{item.category_name || '-'}</td>
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-700">{item.count.toLocaleString()}</td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleOpenEdit(item)}
                          className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
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

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-100 w-full max-w-md overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50/50">
              <h3 className="text-base font-semibold text-slate-800">
                {editingId ? 'Edit Application Data' : 'Add Application Data'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1.5">
                  Year <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  required
                  value={formData.year}
                  onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value || '2024', 10) })}
                  className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1.5">
                  Category <span className="text-rose-500">*</span>
                </label>
                <select
                  required
                  value={formData.category_id}
                  onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
                >
                  <option value="">-- Select Category --</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.category_name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1.5">
                  Count <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  required
                  value={formData.count}
                  onChange={(e) => setFormData({ ...formData, count: parseInt(e.target.value || '0', 10) })}
                  className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all font-mono"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium shadow-sm transition-colors disabled:opacity-50"
                >
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  {editingId ? 'Save Changes' : 'Create Record'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
