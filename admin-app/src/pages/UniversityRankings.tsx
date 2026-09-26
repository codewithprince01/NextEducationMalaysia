import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { confirmDelete } from '@/lib/swal';
import RichTextEditor from '@/components/common/RichTextEditor';
import Pagination from '@/components/common/Pagination';
import {
  Building2,
  Plus,
  Minus,
  Edit2,
  Trash2,
  Loader2,
  X,
  CheckCircle2,
  AlertCircle,
  Eye,
  Search,
  Trophy,
  Hash,
  FileText,
  GraduationCap,
  ImageIcon,
  RotateCcw
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
      const res = await fetch('/api/v1/admin/universities?minimal=true');
      const json = await res.json();
      if (res.ok && (json.status || json.success)) {
        setUniversities(json.data || []);
      }
    } catch {
      console.error('Failed to fetch universities');
    }
  };

  const fetchRankings = async (targetUnivId?: string, showLoading = true) => {
    const univId = targetUnivId !== undefined ? targetUnivId : selectedUnivId;
    if (!univId) {
      setRankings([]);
      if (showLoading) setLoading(false);
      return;
    }

    if (showLoading) setLoading(true);
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
      if (showLoading) setLoading(false);
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

  const handleResetForm = () => {
    setEditingId(null);
    setFormData({ university_id: selectedUnivId, title: '', description: '', position: '' });
    setIsFormOpen(false);
  };

  const handleOpenAdd = () => {
    handleResetForm();
    setIsFormOpen(true);
    window.scrollTo({ top: 200, behavior: 'smooth' });
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
    window.scrollTo({ top: 200, behavior: 'smooth' });
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
        handleResetForm();
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

    // Optimistic removal: instantly vanishes from UI
    setRankings(prev => prev.filter(r => r.id !== item.id));

    try {
      const res = await fetch(`/api/v1/admin/university-rankings/${item.id}`, { method: 'DELETE' });
      const json = await res.json();
      if (res.ok && json.success) {
        showToast('success', 'Ranking deleted');
      } else {
        showToast('error', json.error || 'Failed to delete');
        fetchRankings(selectedUnivId, false);
      }
    } catch {
      showToast('error', 'Error deleting ranking');
      fetchRankings(selectedUnivId, false);
    }
  };

  const getCleanSnippet = (htmlStr?: string) => {
    if (!htmlStr) return 'No description provided';
    const clean = htmlStr.replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').trim();
    return clean.length > 100 ? clean.substring(0, 100) + '...' : clean || 'No description provided';
  };

  const filtered = rankings.filter(r =>
    (r.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (r.description || '').toLowerCase().includes(searchQuery.toLowerCase())
  );
  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const currentItems = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const totalWordsCount = rankings.reduce((acc, item) => {
    const titleWords = (item.title || '').trim().split(/\s+/).filter(Boolean).length;
    const descWords = (item.description || '').replace(/<[^>]+>/g, ' ').trim().split(/\s+/).filter(Boolean).length;
    return acc + titleWords + descWords;
  }, 0);

  const selectedUniv = universities.find(u => String(u.id) === selectedUnivId);

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto pb-10">
      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-2xl shadow-xl flex items-center gap-3 text-sm font-semibold ${toast.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'}`}>
          {toast.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* ── TOP HERO HEADER CARD (MATCHING UNIVERSITY OVERVIEW & FACILITIES DESIGN) ── */}
      <div className="bg-white border border-stone-200/80 rounded-3xl p-6 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold tracking-wider uppercase bg-amber-50 border border-amber-200 text-amber-900">
                <Trophy className="w-3.5 h-3.5 text-amber-700" />
                INSTITUTIONAL RANKINGS & RECOGNITION
              </span>
              {selectedUniv && (
                <span className="text-[11px] font-bold text-stone-700 bg-amber-50 border border-amber-200/80 px-2.5 py-0.5 rounded-full">
                  {selectedUniv.name}
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight font-serif">
              University Campus Rankings
            </h1>

          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-3 shrink-0">
            {/* Select University Dropdown */}
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-amber-800 shrink-0" />
              <select
                value={selectedUnivId}
                onChange={handleUniversityChange}
                className="w-full sm:w-72 bg-stone-50/70 border border-stone-200/90 rounded-xl px-3 py-2 text-xs font-bold text-stone-800 focus:outline-none focus:border-amber-600 focus:bg-white cursor-pointer shadow-2xs"
              >
                <option value="">-- Select a University ({universities.length}) --</option>
                {universities.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={() => fetchRankings(selectedUnivId)}
              disabled={loading || !selectedUnivId}
              className="p-2.5 rounded-xl border border-stone-200 bg-stone-50/70 hover:bg-stone-100 text-stone-700 transition-colors cursor-pointer disabled:opacity-40 shadow-2xs self-start sm:self-auto"
              title="Refresh rankings list"
            >
              <RotateCcw className={`w-4 h-4 ${loading ? 'animate-spin text-stone-600' : ''}`} />
            </button>
          </div>
        </div>

        {/* University Sub-Navigation Bar */}
        {selectedUnivId && (
          <div className="flex flex-wrap items-center gap-2 mt-5 pt-4 border-t border-stone-100">
            <button
              onClick={() => navigate(`/university-overviews?university_id=${selectedUnivId}`)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-stone-600 bg-stone-100 hover:bg-stone-200 transition-all cursor-pointer border border-stone-200/60"
            >
              <FileText className="w-3.5 h-3.5 text-stone-500" />
              <span>Overview</span>
            </button>
            <button
              onClick={() => navigate(`/programs?university_id=${selectedUnivId}`)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-stone-600 bg-stone-100 hover:bg-stone-200 transition-all cursor-pointer border border-stone-200/60"
            >
              <GraduationCap className="w-3.5 h-3.5 text-stone-500" />
              <span>Programs</span>
            </button>
            <button
              onClick={() => navigate(`/university-gallery?university_id=${selectedUnivId}`)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-stone-600 bg-stone-100 hover:bg-stone-200 transition-all cursor-pointer border border-stone-200/60"
            >
              <ImageIcon className="w-3.5 h-3.5 text-stone-500" />
              <span>Gallery</span>
            </button>
            <button
              onClick={() => navigate(`/university-facilities?university_id=${selectedUnivId}`)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-stone-600 bg-stone-100 hover:bg-stone-200 transition-all cursor-pointer border border-stone-200/60"
            >
              <Building2 className="w-3.5 h-3.5 text-stone-500" />
              <span>Facilities</span>
            </button>
            <button
              onClick={() => navigate(`/university-rankings?university_id=${selectedUnivId}`)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-stone-900 text-white shadow-xs transition-all"
            >
              <Trophy className="w-3.5 h-3.5 text-amber-300" />
              <span>Rankings ({rankings.length})</span>
            </button>
          </div>
        )}

        {/* ── COMPACT METRIC STAT PILLS ── */}
        {selectedUnivId && (
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-4 pt-3.5 border-t border-stone-100 text-xs">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#faf8f4] border border-stone-200/90 text-stone-700">
              <span className="text-stone-500 text-[11px] font-medium uppercase tracking-wider">Total Rankings:</span>
              <span className="font-extrabold text-stone-900">{rankings.length}</span>
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-50/70 border border-emerald-200/80 text-emerald-900">
              <span className="text-emerald-700 text-[11px] font-medium uppercase tracking-wider">With Details:</span>
              <span className="font-extrabold text-emerald-800">{rankings.filter((r) => Boolean(r.description)).length}</span>
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-amber-50/70 border border-amber-200/80 text-amber-900">
              <span className="text-amber-700 text-[11px] font-medium uppercase tracking-wider">Words:</span>
              <span className="font-extrabold text-amber-900">{totalWordsCount.toLocaleString()}</span>
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-indigo-50/70 border border-indigo-200/80 text-indigo-900">
              <span className="text-indigo-700 text-[11px] font-medium uppercase tracking-wider">Selected Univ:</span>
              <span className="font-extrabold text-indigo-900">#{selectedUnivId}</span>
            </div>
          </div>
        )}
      </div>

      {!selectedUnivId ? (
        /* Empty State */
        <div className="bg-white rounded-3xl p-16 border border-stone-200/90 text-center flex flex-col items-center justify-center max-w-2xl mx-auto shadow-xs">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200/80 flex items-center justify-center text-amber-800 mb-4 shadow-inner">
            <Building2 className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-black text-stone-900 font-serif">Select an Institution</h3>
          <p className="text-xs sm:text-sm text-stone-500 mt-1.5 max-w-md font-medium leading-relaxed">
            Please choose a university from the dropdown header above to manage its institutional rankings, recognition badges, and national ratings.
          </p>
        </div>
      ) : (
        <>
          {/* ── CARD 1: ADD / EDIT RANKING FORM ── */}
          <div className="bg-white rounded-3xl border border-stone-200/90 shadow-xs overflow-hidden">
            <div
              className="flex items-center justify-between p-5 sm:p-6 bg-[#faf8f4] border-b border-stone-200/90 cursor-pointer select-none"
              onClick={() => setIsFormOpen(!isFormOpen)}
            >
              <div className="flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-lg bg-[#effaf2] border border-[#c8ebd2] text-[#14532d] flex items-center justify-center font-bold">
                  {editingId ? <Edit2 className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                </span>
                <div>
                  <h2 className="text-base font-black text-stone-900 font-serif">
                    {editingId ? 'Edit Ranking Record' : 'Add New Institutional Ranking'}
                  </h2>
                  <p className="text-[11px] text-stone-500 font-medium">
                    {editingId ? 'Update ranking agency, position, or description' : 'Add a global or national ranking badge to this institution'}
                  </p>
                </div>
              </div>

              <button
                type="button"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#effaf2] hover:bg-[#dcfce7] text-[#14532d] border border-[#c8ebd2] text-xs font-bold transition-all cursor-pointer"
                title={isFormOpen ? 'Collapse form' : 'Expand form'}
              >
                {isFormOpen ? (
                  <>
                    <Minus className="w-3.5 h-3.5" />
                    <span>Hide Form</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-3.5 h-3.5" />
                    <span>Open Form</span>
                  </>
                )}
              </button>
            </div>

            {isFormOpen && (
              <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-stone-700 mb-2 uppercase tracking-wider font-serif">
                      Ranking Agency / Title <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. QS World University Rankings, Times Higher Education (THE), SETARA Tier 5..."
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full px-4 py-2.5 text-xs sm:text-sm bg-stone-50/50 border border-stone-200 rounded-xl focus:outline-none focus:border-amber-600 focus:bg-white transition-all text-stone-800 font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-2 uppercase tracking-wider font-serif">
                      Position / Rank
                    </label>
                    <input
                      type="number"
                      placeholder="e.g. 150"
                      value={formData.position}
                      onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                      className="w-full px-4 py-2.5 text-xs sm:text-sm bg-stone-50/50 border border-stone-200 rounded-xl focus:outline-none focus:border-amber-600 focus:bg-white transition-all text-stone-800 font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-2 uppercase tracking-wider font-serif">
                    Ranking Details & Methodology
                  </label>
                  <div className="border border-stone-200 rounded-2xl overflow-hidden bg-white shadow-2xs">
                    <RichTextEditor
                      value={formData.description}
                      onChange={(val) => setFormData({ ...formData, description: val })}
                      placeholder="Write context about this ranking, criteria, year of award, subject breakdown..."
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-stone-100">
                  <button
                    type="button"
                    onClick={handleResetForm}
                    className="px-5 py-2.5 rounded-xl border border-stone-200 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs transition-colors cursor-pointer"
                  >
                    Cancel / Reset
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex items-center gap-2 px-7 py-2.5 rounded-xl bg-[#14532d] hover:bg-[#0f3e21] text-white font-bold text-xs shadow-xs transition-all disabled:opacity-50 cursor-pointer"
                  >
                    {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-300" />}
                    <span>{editingId ? 'Update Ranking' : 'Create Ranking Record'}</span>
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* ── CARD 2: RANKINGS LIST DATA TABLE ── */}
          <div className="bg-white rounded-3xl border border-stone-200/90 shadow-xs overflow-hidden">
            {/* Table Header Controls */}
            <div className="p-5 sm:p-6 bg-[#faf8f4] border-b border-stone-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-lg bg-[#effaf2] border border-[#c8ebd2] text-[#14532d] flex items-center justify-center font-bold">
                  <Trophy className="w-3.5 h-3.5" />
                </span>
                <div>
                  <h2 className="text-base font-black text-stone-900 font-serif">University Rankings Directory</h2>
                  <p className="text-[11px] text-stone-500 font-medium">
                    {filtered.length} ranking{filtered.length !== 1 ? 's' : ''} configured for this institution
                  </p>
                </div>
              </div>

              {/* Action and Search Toolbar */}
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <div className="relative flex-1 sm:w-64">
                  <Search className="w-3.5 h-3.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                  <input
                    type="text"
                    placeholder="Search rankings..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 text-xs bg-white border border-stone-200 rounded-xl focus:outline-none focus:border-emerald-600 transition-all text-stone-800 placeholder-stone-400 shadow-2xs font-medium"
                  />
                </div>
                {!isFormOpen && (
                  <button
                    type="button"
                    onClick={handleOpenAdd}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#14532d] hover:bg-[#0f3e21] text-white rounded-xl text-xs font-bold transition-all shadow-xs shrink-0 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Ranking
                  </button>
                )}
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-stone-600">
                <thead>
                  <tr className="bg-[#effaf2] border-b-2 border-[#c8ebd2] text-[#14532d] font-extrabold uppercase tracking-wider text-[11px]">
                    <th className="py-3.5 px-5 w-16 text-center text-emerald-700">#</th>
                    <th className="py-3.5 px-5 text-[#14532d]">Ranking Agency / Title</th>
                    <th className="py-3.5 px-5 text-[#14532d]">Position</th>
                    <th className="py-3.5 px-5 text-[#14532d]">Description Preview</th>
                    <th className="py-3.5 px-5 w-28 text-right text-[#14532d]">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 font-medium text-stone-700">
                  {loading ? (
                    <tr>
                      <td colSpan={5} className="py-16 text-center text-stone-400 font-medium">
                        <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-amber-800" />
                        Loading campus rankings...
                      </td>
                    </tr>
                  ) : currentItems.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-16 text-center text-stone-400 font-medium">
                        {searchQuery ? 'No rankings matched your search.' : 'No rankings configured yet for this institution.'}
                      </td>
                    </tr>
                  ) : (
                    currentItems.map((item, index) => {
                      const srNo = (currentPage - 1) * itemsPerPage + index + 1;
                      const cleanSnippet = getCleanSnippet(item.description);

                      return (
                        <tr key={item.id} className="hover:bg-[#fbfaf7] transition-colors group">
                          <td className="py-4 px-5 text-center font-bold text-stone-400 font-mono text-[11px]">
                            {srNo}
                          </td>
                          <td className="py-4 px-5">
                            <div className="font-bold text-stone-900 text-xs sm:text-sm font-serif">
                              {item.title}
                            </div>
                            <div className="text-[10px] text-stone-400 font-mono mt-0.5">
                              ID: #{item.id}
                            </div>
                          </td>
                          <td className="py-4 px-5">
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200/80 text-amber-800 font-bold text-[11px]">
                              <Hash className="w-3 h-3 text-amber-700" />
                              {item.position || '—'}
                            </span>
                          </td>
                          <td className="py-4 px-5 max-w-md">
                            <p className="text-[11px] text-stone-500 truncate leading-relaxed">
                              {cleanSnippet}
                            </p>
                            {item.description && (
                              <button
                                onClick={() =>
                                  setViewingItem({
                                    title: item.title,
                                    html: item.description || '<p>No description provided.</p>',
                                  })
                                }
                                className="inline-flex items-center gap-1 mt-1 text-[11px] font-bold text-amber-900 hover:text-amber-800 hover:underline cursor-pointer"
                              >
                                <Eye className="w-3 h-3" /> Read Full Details
                              </button>
                            )}
                          </td>
                          <td className="py-4 px-5 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => handleOpenEdit(item)}
                                className="p-2 bg-stone-100 hover:bg-stone-900 text-stone-700 hover:text-white rounded-xl transition-all shadow-2xs cursor-pointer"
                                title="Edit Ranking"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDelete(item)}
                                className="p-2 bg-rose-50 hover:bg-rose-600 text-rose-600 hover:text-white rounded-xl transition-all shadow-2xs cursor-pointer"
                                title="Delete Ranking"
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

            {/* Pagination Footer */}
            {!loading && filtered.length > 0 && (
              <div className="p-5 bg-[#faf8f4] border-t border-stone-200/90 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-stone-500 font-medium">
                <div>
                  Showing <span className="font-bold text-stone-800">{(currentPage - 1) * itemsPerPage + 1}</span> to{' '}
                  <span className="font-bold text-stone-800">{Math.min(currentPage * itemsPerPage, filtered.length)}</span> of{' '}
                  <span className="font-bold text-stone-800">{filtered.length}</span> rankings
                </div>
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                  totalItems={filtered.length}
                  itemsPerPage={itemsPerPage}
                />
              </div>
            )}
          </div>
        </>
      )}

      {/* ── DESCRIPTION PREVIEW MODAL ── */}
      {viewingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl border border-stone-200 w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between p-5 bg-[#faf8f4] border-b border-stone-200">
              <div className="flex items-center gap-2">
                <Trophy className="w-4 h-4 text-amber-800" />
                <h3 className="text-base font-black text-stone-900 font-serif">{viewingItem.title}</h3>
              </div>
              <button
                onClick={() => setViewingItem(null)}
                className="p-1.5 text-stone-400 hover:text-stone-700 rounded-xl hover:bg-stone-200/60 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div
              className="p-6 sm:p-8 overflow-y-auto prose prose-stone max-w-none text-xs sm:text-sm leading-relaxed text-stone-700"
              dangerouslySetInnerHTML={{ __html: viewingItem.html }}
            />
            <div className="p-4 bg-[#faf8f4] border-t border-stone-200 text-right">
              <button
                onClick={() => setViewingItem(null)}
                className="px-5 py-2 bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer shadow-xs"
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

