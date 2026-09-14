import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { confirmDelete } from '@/lib/swal';
import RichTextEditor from '@/components/common/RichTextEditor';
import Pagination from '@/components/common/Pagination';
import {
  Building2,
  Plus,
  Edit2,
  Trash2,
  Loader2,
  X,
  CheckCircle2,
  AlertCircle,
  Eye,
  Search,
  Trophy,
  Hash
} from 'lucide-react';

interface RankingItem {
  id: number;
  university_id: number;
  university_name?: string;
  title: string;
  description?: string;
  position: number;
  created_at?: string;
}

interface UniversityItem {
  id: number;
  name: string;
}

export default function UniversityRankings() {
  const { id } = useParams<{ id?: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const queryUnivId = searchParams.get('university_id') || id || '';

  const [rankings, setRankings] = useState<RankingItem[]>([]);
  const [universities, setUniversities] = useState<UniversityItem[]>([]);
  const [selectedUnivId, setSelectedUnivId] = useState<string>(queryUnivId);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // View Modal
  const [viewingItem, setViewingItem] = useState<{ title: string; html: string } | null>(null);

  // Form
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    university_id: '',
    title: '',
    description: '',
    position: '',
  });

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchUniversities = async () => {
    try {
      const res = await fetch('/api/v1/admin/universities');
      const json = await res.json();
      if (res.ok && (json.status || json.success)) {
        setUniversities(json.data || []);
      }
    } catch {
      console.error('Failed to fetch universities');
    }
  };

  const fetchRankings = async (targetUnivId?: string) => {
    const univId = targetUnivId !== undefined ? targetUnivId : selectedUnivId;
    if (!univId) {
      setRankings([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/v1/admin/university-rankings?university_id=${univId}`);
      const json = await res.json();
      if (res.ok && json.success) {
        setRankings(json.data || []);
      } else {
        showToast('error', json.error || 'Failed to fetch rankings');
      }
    } catch {
      showToast('error', 'Network error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUniversities();
    if (queryUnivId) {
      setSelectedUnivId(queryUnivId);
      fetchRankings(queryUnivId);
    }
  }, [queryUnivId]);

  const handleUniversityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setSelectedUnivId(val);
    if (val) {
      navigate(`/university-rankings/${val}`, { replace: true });
    }
    fetchRankings(val);
    setFormData(prev => ({ ...prev, university_id: val }));
  };

  const handleOpenAdd = () => {
    setEditingId(null);
    setFormData({ university_id: selectedUnivId, title: '', description: '', position: '' });
    setIsFormOpen(true);
  };

  const handleOpenEdit = (item: RankingItem) => {
    setEditingId(item.id);
    setFormData({
      university_id: String(item.university_id),
      title: item.title || '',
      description: item.description || '',
      position: String(item.position || ''),
    });
    setIsFormOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.university_id || !formData.title.trim()) {
      showToast('error', 'University and Title are required');
      return;
    }

    setSubmitting(true);
    try {
      const url = editingId
        ? `/api/v1/admin/university-rankings/${editingId}`
        : '/api/v1/admin/university-rankings';
      const method = editingId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const json = await res.json();

      if (res.ok && json.success) {
        showToast('success', editingId ? 'Ranking updated' : 'Ranking created');
        setIsFormOpen(false);
        fetchRankings();
      } else {
        showToast('error', json.error || 'Failed to save ranking');
      }
    } catch {
      showToast('error', 'Error saving ranking');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (item: RankingItem) => {
    const confirmed = await confirmDelete(item.title);
    if (!confirmed) return;

    try {
      const res = await fetch(`/api/v1/admin/university-rankings/${item.id}`, { method: 'DELETE' });
      const json = await res.json();
      if (res.ok && json.success) {
        showToast('success', 'Ranking deleted');
        setRankings(prev => prev.filter(r => r.id !== item.id));
      } else {
        showToast('error', json.error || 'Failed to delete');
      }
    } catch {
      showToast('error', 'Error deleting ranking');
    }
  };

  const filtered = rankings.filter(r =>
    (r.title || '').toLowerCase().includes(searchQuery.toLowerCase())
  );
  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const currentItems = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const selectedUniv = universities.find(u => String(u.id) === selectedUnivId);

  return (
    <div className="space-y-3">
      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-2xl shadow-xl flex items-center gap-3 text-sm font-semibold ${toast.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'}`}>
          {toast.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-[11px] font-extrabold uppercase tracking-widest text-blue-700 block">
              UNIVERSITY MODULE
            </span>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              <Trophy className="w-6 h-6 text-amber-500" />
              University Rankings
              {selectedUniv && (
                <span className="ml-2 text-base font-bold text-blue-700">
                  — {selectedUniv.name}
                </span>
              )}
            </h1>
          </div>
          <div className="flex items-center gap-3">
            {selectedUnivId && (
              <button
                onClick={handleOpenAdd}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white font-bold text-xs shadow-md shadow-blue-600/20 flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap"
              >
                <Plus className="w-4 h-4" /> Add Ranking
              </button>
            )}
          </div>
        </div>
      </div>

      {/* University Selector + Search */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row items-center gap-4">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Building2 className="w-4 h-4 text-slate-400 shrink-0" />
          <select
            value={selectedUnivId}
            onChange={handleUniversityChange}
            className="w-full sm:w-80 px-3 py-2 rounded-xl border border-slate-200 text-slate-800 text-xs font-semibold focus:outline-none focus:border-blue-600 bg-slate-50"
          >
            <option value="">-- Select University --</option>
            {universities.map(u => (
              <option key={u.id} value={u.id}>{u.name}</option>
            ))}
          </select>
        </div>

        {selectedUnivId && (
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search rankings..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:border-blue-600"
            />
          </div>
        )}

        {selectedUnivId && (
          <span className="text-xs font-bold text-slate-500 ml-auto whitespace-nowrap">
            {filtered.length} ranking{filtered.length !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      {/* Add/Edit Form Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-xl max-h-[90vh] overflow-y-auto p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="text-lg font-extrabold text-slate-900">
                {editingId ? 'Edit Ranking' : 'Add Ranking'}
              </h3>
              <button onClick={() => setIsFormOpen(false)} className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-1.5">
                  University *
                </label>
                <select
                  value={formData.university_id}
                  onChange={e => setFormData({ ...formData, university_id: e.target.value })}
                  required
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:border-blue-600 bg-slate-50"
                >
                  <option value="">-- Select University --</option>
                  {universities.map(u => (
                    <option key={u.id} value={u.id}>{u.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-1.5">
                    Title / Ranking Agency *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. QS World Rankings 2025"
                    value={formData.title}
                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                    required
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:border-blue-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-1.5">
                    Position / Rank
                  </label>
                  <input
                    type="number"
                    placeholder="e.g. 150"
                    value={formData.position}
                    onChange={e => setFormData({ ...formData, position: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:border-blue-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-1.5">
                  Description
                </label>
                <RichTextEditor
                  value={formData.description}
                  onChange={val => setFormData({ ...formData, description: val })}
                />
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-700 text-white font-bold text-xs shadow-md shadow-blue-600/20 flex items-center gap-2 transition-all disabled:opacity-50"
                >
                  {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{editingId ? 'Update Ranking' : 'Save Ranking'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Description Modal */}
      {viewingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-2xl max-h-[80vh] overflow-y-auto p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <h3 className="text-lg font-extrabold text-slate-900">{viewingItem.title}</h3>
              <button onClick={() => setViewingItem(null)} className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div
              className="prose prose-sm max-w-none text-slate-700"
              dangerouslySetInnerHTML={{ __html: viewingItem.html }}
            />
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-white border border-slate-200/80 rounded-3xl overflow-hidden shadow-sm">
        {!selectedUnivId ? (
          <div className="p-12 flex flex-col items-center justify-center text-slate-400">
            <Building2 className="w-10 h-10 mb-3 opacity-30" />
            <p className="text-sm font-semibold">Select a university to view rankings</p>
          </div>
        ) : loading ? (
          <div className="p-12 flex flex-col items-center justify-center text-slate-500">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-3" />
            <p className="text-xs font-semibold">Loading rankings...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <Trophy className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm font-semibold">No rankings found for this university.</p>
            <button
              onClick={handleOpenAdd}
              className="mt-4 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-700 text-white font-bold text-xs shadow-md flex items-center gap-2 mx-auto"
            >
              <Plus className="w-4 h-4" /> Add First Ranking
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/50 text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                  <th className="py-4 px-6">ID</th>
                  <th className="py-4 px-6">Ranking Agency / Title</th>
                  <th className="py-4 px-6">Position</th>
                  <th className="py-4 px-6">Description</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
                {currentItems.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-4 px-6 font-bold text-slate-400">#{item.id}</td>
                    <td className="py-4 px-6 font-bold text-slate-900 max-w-xs truncate">{item.title}</td>
                    <td className="py-4 px-6">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 font-bold text-[11px]">
                        <Hash className="w-3 h-3" />
                        {item.position || '—'}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      {item.description ? (
                        <button
                          onClick={() => setViewingItem({ title: item.title, html: item.description || '' })}
                          className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 font-semibold text-[11px]"
                        >
                          <Eye className="w-3 h-3" /> View
                        </button>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenEdit(item)}
                          className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:text-blue-600 hover:border-blue-200 transition-colors"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(item)}
                          className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:text-rose-600 hover:border-rose-200 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {totalPages > 1 && (
          <div className="border-t border-slate-100">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={filtered.length}
              itemsPerPage={itemsPerPage}
              onPageChange={p => setCurrentPage(p)}
            />
          </div>
        )}
      </div>
    </div>
  );
}

