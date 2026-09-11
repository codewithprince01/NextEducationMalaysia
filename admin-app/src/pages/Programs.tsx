import { useEffect, useState } from 'react';
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
  Layers,
  BookOpen
} from 'lucide-react';

interface ProgramItem {
  id: number;
  course_name: string;
  slug: string;
  level?: string;
  duration?: string;
  tution_fee?: string;
  university_id?: number;
  university_name?: string;
  category_name?: string;
  specialization_name?: string;
  status?: number;
}

export default function Programs() {
  const [programs, setPrograms] = useState<ProgramItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    course_name: '',
    level: 'Undergraduate',
    duration: '',
    tution_fee: '',
    status: 1,
  });

  const fetchPrograms = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/v1/admin/programs');
      const json = await res.json();
      if (res.ok && json.status) {
        setPrograms(json.data || []);
      } else {
        showToast('error', json.message || 'Failed to load degree programs');
      }
    } catch {
      showToast('error', 'Connection error while fetching programs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrograms();
  }, []);

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  const handleOpenAddModal = () => {
    setEditingId(null);
    setFormData({
      course_name: '',
      level: 'Undergraduate',
      duration: '3 Years',
      tution_fee: 'MYR 25,000 / Year',
      status: 1,
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (item: ProgramItem) => {
    setEditingId(item.id);
    setFormData({
      course_name: item.course_name || '',
      level: item.level || 'Undergraduate',
      duration: item.duration || '',
      tution_fee: item.tution_fee || '',
      status: item.status !== undefined ? item.status : 1,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.course_name.trim()) {
      showToast('error', 'Please enter a course name');
      return;
    }

    setSubmitting(true);
    try {
      const url = editingId ? `/api/v1/admin/programs/${editingId}` : '/api/v1/admin/programs';
      const method = editingId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const json = await res.json();
      if (res.ok && json.status) {
        showToast('success', json.message || (editingId ? 'Program updated!' : 'Program created!'));
        setIsModalOpen(false);
        fetchPrograms();
      } else {
        showToast('error', json.message || 'Action failed');
      }
    } catch {
      showToast('error', 'Connection error occurred');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number, name: string) => {
    const isConfirmed = await confirmDelete(
      'Delete Program / Course?',
      `Are you sure you want to delete program "${name}"? This action cannot be undone.`
    );
    if (!isConfirmed) return;

    try {
      const res = await fetch(`/api/v1/admin/programs/${id}`, { method: 'DELETE' });
      const json = await res.json();
      if (res.ok && json.status) {
        showToast('success', `Program "${name}" deleted successfully`);
        fetchPrograms();
      } else {
        showToast('error', json.message || 'Failed to delete program');
      }
    } catch {
      showToast('error', 'Connection error while deleting program');
    }
  };

  // Pagination State (20 per page)
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  const filtered = programs.filter(
    (item) =>
      item.course_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.slug?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.university_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.level?.toLowerCase().includes(searchQuery.toLowerCase())
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
    <div className="space-y-6">
      {toast && (
        <div
          className={`fixed top-5 right-5 z-50 p-4 rounded-2xl shadow-xl border flex items-center gap-3 text-xs font-bold ${
            toast.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}
        >
          {toast.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-600" />
          )}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Top Header Card */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-5">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 text-xs font-bold">
            <BookOpen className="w-3.5 h-3.5" />
            PROGRAMS & DEGREES
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            All Academic Programs
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm font-medium">
            Manage university degree courses, tuition fees, study duration, and specializations.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchPrograms}
            className="p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors cursor-pointer"
            title="Refresh Data"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={handleOpenAddModal}
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20 flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            Add New Program
          </button>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white border border-slate-200/80 rounded-3xl shadow-sm overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-slate-100 flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search course name, university, or level..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200/80 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-100 transition-all"
            />
          </div>
          <span className="text-xs font-bold text-slate-400">
            Total: <strong className="text-slate-800">{filtered.length}</strong> programs
          </span>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="py-16 text-center text-slate-500 flex flex-col items-center gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
              <span className="text-xs font-semibold">Loading academic programs...</span>
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-16 text-center text-slate-400 space-y-2">
              <Layers className="w-10 h-10 mx-auto text-slate-300" />
              <p className="text-sm font-bold text-slate-700">No Programs Found</p>
              <p className="text-xs text-slate-400">Try adjusting your search query or add a new program.</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-100 text-[11px] font-extrabold text-slate-400 uppercase tracking-widest">
                  <th className="py-4 px-6 w-16 text-center">Sr. No.</th>
                  <th className="py-4 px-6 w-16 text-center">ID</th>
                  <th className="py-4 px-6">Course Name</th>
                  <th className="py-4 px-6">University</th>
                  <th className="py-4 px-6">Level</th>
                  <th className="py-4 px-6">Tuition Fee</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
                {paginated.map((item, index) => {
                  const srNo = (currentPage - 1) * itemsPerPage + index + 1;
                  return (
                  <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-4 px-6 text-center font-extrabold text-slate-700">{srNo}</td>
                    <td className="py-4 px-6 text-center font-bold text-slate-400">#{item.id}</td>
                    <td className="py-4 px-6 font-bold text-slate-900">{item.course_name}</td>
                    <td className="py-4 px-6 text-slate-700 font-semibold">
                      {item.university_name || '-'}
                    </td>
                    <td className="py-4 px-6">
                      <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[11px] font-bold">
                        {item.level || 'Degree'}
                      </span>
                    </td>
                    <td className="py-4 px-6 font-semibold text-emerald-700">{item.tution_fee || '-'}</td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenEditModal(item)}
                          className="p-2 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors cursor-pointer"
                          title="Edit Program"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id, item.course_name)}
                          className="p-2 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                          title="Delete Program"
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
          )}
        </div>

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={filtered.length}
          itemsPerPage={itemsPerPage}
          onPageChange={(p) => setCurrentPage(p)}
        />
      </div>

      {/* Modal Form */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-6 relative">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h3 className="text-lg font-extrabold text-slate-900">
                {editingId ? 'Edit Program' : 'Add New Program'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Course Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.course_name}
                  onChange={(e) => setFormData({ ...formData, course_name: e.target.value })}
                  placeholder="e.g. Bachelor of Computer Science"
                  className="w-full bg-slate-50 border border-slate-200/80 focus:bg-white focus:border-indigo-600 focus:ring-4 focus:ring-indigo-100 text-slate-900 text-xs rounded-xl px-4 py-3 outline-none transition-all placeholder:text-slate-400 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Level
                  </label>
                  <input
                    type="text"
                    value={formData.level}
                    onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                    placeholder="e.g. Undergraduate"
                    className="w-full bg-slate-50 border border-slate-200/80 focus:bg-white focus:border-indigo-600 focus:ring-4 focus:ring-indigo-100 text-slate-900 text-xs rounded-xl px-4 py-3 outline-none transition-all font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Duration
                  </label>
                  <input
                    type="text"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    placeholder="e.g. 3 Years"
                    className="w-full bg-slate-50 border border-slate-200/80 focus:bg-white focus:border-indigo-600 focus:ring-4 focus:ring-indigo-100 text-slate-900 text-xs rounded-xl px-4 py-3 outline-none transition-all font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Tuition Fee
                </label>
                <input
                  type="text"
                  value={formData.tution_fee}
                  onChange={(e) => setFormData({ ...formData, tution_fee: e.target.value })}
                  placeholder="e.g. MYR 28,000 / Year"
                  className="w-full bg-slate-50 border border-slate-200/80 focus:bg-white focus:border-indigo-600 focus:ring-4 focus:ring-indigo-100 text-slate-900 text-xs rounded-xl px-4 py-3 outline-none transition-all placeholder:text-slate-400 font-medium"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/20 flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <span>{editingId ? 'Update Program' : 'Create Program'}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
