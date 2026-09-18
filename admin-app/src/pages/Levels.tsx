import React, { useEffect, useState } from 'react';
import { confirmDelete } from '@/lib/swal';
import Pagination from '@/components/common/Pagination';
import {
  GraduationCap,
  Plus,
  Search,
  Edit2,
  Trash2,
  Loader2,
  X,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Layers
} from 'lucide-react';

interface LevelItem {
  id: number;
  level: string;
  slug: string;
  short_name?: string;
  short_name_slug?: string;
  seo_name?: string;
  seo_name_slug?: string;
  courses_description?: string;
}

export default function Levels() {
  const [levels, setLevels] = useState<LevelItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Pagination State (20 per page)
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    level: '',
    short_name: '',
    seo_name: '',
    courses_description: '',
  });

  const fetchLevels = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/v1/admin/levels');
      const json = await res.json();
      if (res.ok && json.status) {
        setLevels(json.data || []);
      } else {
        showToast('error', json.message || 'Failed to load academic levels');
      }
    } catch {
      showToast('error', 'Connection error while fetching levels');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLevels();
  }, []);

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  const handleOpenAddModal = () => {
    setEditingId(null);
    setFormData({
      level: '',
      short_name: '',
      seo_name: '',
      courses_description: '',
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (item: LevelItem) => {
    setEditingId(item.id);
    setFormData({
      level: item.level || '',
      short_name: item.short_name || '',
      seo_name: item.seo_name || '',
      courses_description: item.courses_description || '',
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.level.trim()) {
      showToast('error', 'Please enter a level title');
      return;
    }

    setSubmitting(true);
    try {
      const url = editingId ? `/api/v1/admin/levels/${editingId}` : '/api/v1/admin/levels';
      const method = editingId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const json = await res.json();
      if (res.ok && json.status) {
        showToast('success', json.message || (editingId ? 'Level updated!' : 'Level created!'));
        setIsModalOpen(false);
        fetchLevels();
      } else {
        showToast('error', json.message || 'Action failed');
      }
    } catch {
      showToast('error', 'Connection error occurred');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number, levelName: string) => {
    const isConfirmed = await confirmDelete(
      'Delete Academic Level?',
      `Are you sure you want to delete "${levelName}"? This action cannot be undone.`
    );
    if (!isConfirmed) return;

    try {
      const res = await fetch(`/api/v1/admin/levels/${id}`, { method: 'DELETE' });
      const json = await res.json();
      if (res.ok && json.status) {
        showToast('success', `Level "${levelName}" deleted successfully`);
        fetchLevels();
      } else {
        showToast('error', json.message || 'Failed to delete level');
      }
    } catch {
      showToast('error', 'Connection error while deleting level');
    }
  };

  const filteredLevels = levels.filter(
    (item) =>
      item.level?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.slug?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.short_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const totalPages = Math.ceil(filteredLevels.length / itemsPerPage);
  const paginatedLevels = filteredLevels.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="space-y-3">
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

      {/* ── CLASSIC EDITORIAL HEADER ── */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-stone-200/90 shadow-xs relative overflow-hidden">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="space-y-1.5 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-900 text-[11px] font-bold tracking-wider uppercase">
                <GraduationCap className="w-3.5 h-3.5 text-amber-700" />
                <span>Academic Hierarchy</span>
              </span>
              <span className="text-[11px] font-bold text-stone-500 bg-stone-100 px-2.5 py-0.5 rounded-full border border-stone-200">
                Education Levels
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight font-serif">
              Academic Levels Management
            </h1>
            <p className="text-xs sm:text-sm text-stone-500 font-medium leading-relaxed">
              Configure degree classifications, study tiers (Diploma, Bachelor, Master, PhD, Foundation), short abbreviations, and SEO routes.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              onClick={fetchLevels}
              className="p-2.5 rounded-xl border border-stone-200 text-stone-600 hover:bg-stone-50 hover:text-stone-900 transition-colors cursor-pointer"
              title="Refresh Data"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-amber-800' : ''}`} />
            </button>
            <button
              onClick={handleOpenAddModal}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#14532d] hover:bg-[#0f3e21] text-white font-bold text-xs shadow-xs transition-all cursor-pointer whitespace-nowrap"
            >
              <Plus className="w-4 h-4 text-emerald-300" />
              <span>Add New Level</span>
            </button>
          </div>
        </div>

        {/* ── TOP STAT METRICS (4 CARDS) ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 mt-6 pt-6 border-t border-stone-100">
          <div className="p-3.5 rounded-2xl bg-[#faf8f4] border border-stone-200/80">
            <div className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">Total Levels</div>
            <div className="text-2xl font-black text-stone-900 tracking-tight mt-0.5">
              {levels.length}
            </div>
            <div className="text-[10.5px] font-semibold text-stone-500 mt-1">Classifications</div>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#faf8f4] border border-stone-200/80">
            <div className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">Short Codes</div>
            <div className="text-2xl font-black text-amber-900 tracking-tight mt-0.5">
              {levels.filter((l) => Boolean(l.short_name)).length}
            </div>
            <div className="text-[10.5px] font-semibold text-amber-700 mt-1">Degree abbreviations</div>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#faf8f4] border border-stone-200/80">
            <div className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">SEO Indexed</div>
            <div className="text-2xl font-black text-emerald-800 tracking-tight mt-0.5">
              {levels.filter((l) => Boolean(l.seo_name)).length}
            </div>
            <div className="text-[10.5px] font-semibold text-emerald-700 mt-1">SEO naming assigned</div>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#faf8f4] border border-stone-200/80">
            <div className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">Status</div>
            <div className="text-2xl font-black text-indigo-950 tracking-tight mt-0.5">
              Active
            </div>
            <div className="text-[10.5px] font-semibold text-indigo-800 mt-1">All tiers enabled</div>
          </div>
        </div>
      </div>

      {/* ── TABLE SEARCH & TOOLBAR ── */}
      <div className="bg-white rounded-3xl border border-stone-200/90 shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-stone-200/90 flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#faf8f4]">
          <div className="relative flex-1 w-full max-w-md">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search level name, slug, or short name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-stone-200/90 rounded-xl pl-10 pr-4 py-2 text-xs text-stone-800 placeholder-stone-400 focus:outline-none focus:border-amber-600 transition-all"
            />
          </div>
          <span className="text-xs font-bold text-stone-500">
            Showing <strong className="text-stone-900">{filteredLevels.length}</strong> academic tiers
          </span>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="py-16 text-center text-stone-400 flex flex-col items-center gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-amber-800" />
              <span className="text-xs font-bold">Loading academic levels...</span>
            </div>
          ) : filteredLevels.length === 0 ? (
            <div className="py-16 text-center text-stone-400 space-y-2">
              <Layers className="w-10 h-10 mx-auto text-stone-300" />
              <p className="text-sm font-bold text-stone-700">No Levels Found</p>
              <p className="text-xs text-stone-400">Try adjusting your search query or add a new level.</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#effaf2] border-b-2 border-[#c8ebd2] text-[11px] font-extrabold text-[#14532d] uppercase tracking-wider">
                  <th className="py-3.5 px-6 w-16 text-center text-emerald-700">Sr. No.</th>
                  <th className="py-3.5 px-6 w-16 text-center text-emerald-700">ID</th>
                  <th className="py-3.5 px-6 text-[#14532d]">Level Title</th>
                  <th className="py-3.5 px-6 text-[#14532d]">URL Slug</th>
                  <th className="py-3.5 px-6 text-[#14532d]">Short Name</th>
                  <th className="py-3.5 px-6 text-[#14532d]">SEO Name</th>
                  <th className="py-3.5 px-6 text-right text-[#14532d]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 font-medium text-stone-700">
                {paginatedLevels.map((item, index) => {
                  const srNo = (currentPage - 1) * itemsPerPage + index + 1;
                  return (
                  <tr key={item.id} className="hover:bg-[#fbfaf7] transition-colors group">
                    <td className="py-4 px-6 text-center font-extrabold text-stone-500">{srNo}</td>
                    <td className="py-4 px-6 text-center font-bold text-stone-400">#{item.id}</td>
                    <td className="py-4 px-6 font-bold text-stone-900 group-hover:text-amber-800 transition-colors">{item.level}</td>
                    <td className="py-4 px-6 font-mono text-[11px] text-stone-400">{item.slug}</td>
                    <td className="py-4 px-6">
                      {item.short_name ? (
                        <span className="px-2.5 py-0.5 rounded-full bg-stone-100 border border-stone-200 text-stone-700 text-[11px] font-bold">
                          {item.short_name}
                        </span>
                      ) : (
                        <span className="text-stone-300">-</span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-stone-600">{item.seo_name || '-'}</td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenEditModal(item)}
                          className="p-1.5 rounded-lg bg-[#effaf2] text-[#14532d] hover:bg-[#dcfce7] border border-[#c8ebd2]/60 transition-colors cursor-pointer shadow-2xs"
                          title="Edit Level"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id, item.level)}
                          className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                          title="Delete Level"
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

        <div className="p-4 border-t border-stone-200/80 bg-[#faf8f4]">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={filteredLevels.length}
            itemsPerPage={itemsPerPage}
            onPageChange={(p) => setCurrentPage(p)}
          />
        </div>
      </div>

      {/* Modal Form */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-6 relative">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h3 className="text-lg font-extrabold text-slate-900">
                {editingId ? 'Edit Academic Level' : 'Add New Academic Level'}
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
                  Level Title *
                </label>
                <input
                  type="text"
                  required
                  value={formData.level}
                  onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                  placeholder="e.g. Undergraduate Degree"
                  className="w-full bg-slate-50 border border-slate-200/80 focus:bg-white focus:border-indigo-600 focus:ring-4 focus:ring-indigo-100 text-slate-900 text-xs rounded-xl px-4 py-3 outline-none transition-all placeholder:text-slate-400 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Short Name
                </label>
                <input
                  type="text"
                  value={formData.short_name}
                  onChange={(e) => setFormData({ ...formData, short_name: e.target.value })}
                  placeholder="e.g. UG"
                  className="w-full bg-slate-50 border border-slate-200/80 focus:bg-white focus:border-indigo-600 focus:ring-4 focus:ring-indigo-100 text-slate-900 text-xs rounded-xl px-4 py-3 outline-none transition-all placeholder:text-slate-400 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  SEO Name
                </label>
                <input
                  type="text"
                  value={formData.seo_name}
                  onChange={(e) => setFormData({ ...formData, seo_name: e.target.value })}
                  placeholder="e.g. Bachelor Degree in Malaysia"
                  className="w-full bg-slate-50 border border-slate-200/80 focus:bg-white focus:border-indigo-600 focus:ring-4 focus:ring-indigo-100 text-slate-900 text-xs rounded-xl px-4 py-3 outline-none transition-all placeholder:text-slate-400 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Courses Overview / Description
                </label>
                <textarea
                  rows={3}
                  value={formData.courses_description}
                  onChange={(e) => setFormData({ ...formData, courses_description: e.target.value })}
                  placeholder="Overview description for courses in this level..."
                  className="w-full bg-slate-50 border border-slate-200/80 focus:bg-white focus:border-indigo-600 focus:ring-4 focus:ring-indigo-100 text-slate-900 text-xs rounded-xl p-4 outline-none transition-all placeholder:text-slate-400 font-medium resize-none"
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
                  className="px-5 py-2.5 rounded-xl bg-[#14532d] hover:bg-[#0f3e21] text-white text-xs font-bold shadow-xs flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-emerald-300" />
                      Saving...
                    </>
                  ) : (
                    <span>{editingId ? 'Update Level' : 'Create Level'}</span>
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
