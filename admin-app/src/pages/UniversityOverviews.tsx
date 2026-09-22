import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { confirmDelete } from '@/lib/swal';
import RichTextEditor from '@/components/common/RichTextEditor';
import Pagination from '@/components/common/Pagination';
import { uploadFileToStorage, getStorageUrl } from '@/lib/uploadHelper';
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
  ExternalLink,
  FileText,
  Image as ImageIcon,
  RotateCcw,
  Layers,
  Clock,
  Calendar,
  Upload,
  GraduationCap,
  Trophy
} from 'lucide-react';

interface UniversityOverviewItem {
  id: number;
  university_id: number;
  title?: string;
  tab?: string;
  description: string;
  position: number;
  thumbnail_path?: string;
  created_at?: string;
  updated_at?: string;
}

interface UniversityItem {
  id: number;
  name: string;
}

export default function UniversityOverviews() {
  const { id } = useParams<{ id?: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const queryUnivId = searchParams.get('university_id') || id || '';

  const [overviews, setOverviews] = useState<UniversityOverviewItem[]>([]);
  const [universities, setUniversities] = useState<UniversityItem[]>([]);
  const [selectedUnivId, setSelectedUnivId] = useState<string>(queryUnivId);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Form Section Visibility (Default Closed)
  const [isFormOpen, setIsFormOpen] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // View Description Modal & Image Preview Modal
  const [viewingDescription, setViewingDescription] = useState<{ title: string; html: string } | null>(null);
  const [previewImage, setPreviewImage] = useState<{ title: string; url: string } | null>(null);

  // Form State
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreviewUrl, setThumbnailPreviewUrl] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    university_id: '',
    title: '',
    description: '',
    position: '1',
    thumbnail_path: '',
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
      console.error('Failed to fetch universities list');
    }
  };

  const fetchOverviews = async (targetUnivId?: string, showLoading = true) => {
    const univId = targetUnivId !== undefined ? targetUnivId : selectedUnivId;
    if (!univId) {
      setOverviews([]);
      if (showLoading) setLoading(false);
      return;
    }

    if (showLoading) setLoading(true);
    try {
      const res = await fetch(`/api/v1/admin/university-overviews?university_id=${univId}`);
      const json = await res.json();
      if (res.ok && json.success) {
        const data: UniversityOverviewItem[] = json.data || [];
        setOverviews(data);
        if (!editingId) {
          setFormData((prev) => ({
            ...prev,
            university_id: univId,
            position: (data.length + 1).toString(),
          }));
        }
      } else {
        showToast('error', json.error || 'Failed to fetch overviews');
      }
    } catch {
      showToast('error', 'Network error while fetching overviews');
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  useEffect(() => {
    fetchUniversities();
    if (queryUnivId) {
      setSelectedUnivId(queryUnivId);
      fetchOverviews(queryUnivId);
    }
  }, [queryUnivId]);

  const handleUniversityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setSelectedUnivId(val);
    if (val) {
      navigate(`/university-overviews?university_id=${val}`);
    }
    handleResetForm();
    fetchOverviews(val);
  };

  const handleResetForm = () => {
    setEditingId(null);
    setThumbnailFile(null);
    setThumbnailPreviewUrl(null);
    setFormData({
      university_id: selectedUnivId,
      title: '',
      description: '',
      position: (overviews.length + 1).toString(),
      thumbnail_path: '',
    });
  };

  const handleEditClick = (item: UniversityOverviewItem) => {
    setEditingId(item.id);
    setThumbnailFile(null);
    setThumbnailPreviewUrl(null);
    setFormData({
      university_id: item.university_id.toString(),
      title: item.title || item.tab || '',
      description: item.description || '',
      position: (item.position || 1).toString(),
      thumbnail_path: item.thumbnail_path || '',
    });
    setIsFormOpen(true);
    window.scrollTo({ top: 320, behavior: 'smooth' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUnivId) {
      showToast('error', 'Please select a university first');
      return;
    }
    if (!formData.title.trim()) {
      showToast('error', 'Title is required');
      return;
    }

    setSubmitting(true);
    try {
      let thumbnailPath = formData.thumbnail_path;
      if (thumbnailFile) {
        const uploadRes = await uploadFileToStorage(thumbnailFile, 'university');
        thumbnailPath = uploadRes.file_path;
      }

      const url = editingId
        ? `/api/v1/admin/university-overviews/${editingId}`
        : '/api/v1/admin/university-overviews';
      const method = editingId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          university_id: selectedUnivId,
          title: formData.title,
          tab: formData.title,
          description: formData.description,
          position: formData.position,
          thumbnail_path: thumbnailPath,
        }),
      });
      const json = await res.json();

      if (res.ok && json.success) {
        showToast('success', editingId ? 'Overview updated successfully' : 'Overview created successfully');
        handleResetForm();
        fetchOverviews(selectedUnivId);
      } else {
        showToast('error', json.error || 'Failed to save overview');
      }
    } catch {
      showToast('error', 'Error submitting overview data');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (item: UniversityOverviewItem) => {
    const confirmed = await confirmDelete(
      'Delete Overview Tab?',
      `Are you sure you want to delete tab "${item.title || item.tab || 'Overview Record'}"? This action cannot be undone.`
    );
    if (!confirmed) return;

    // Optimistic removal
    setOverviews((prev) => prev.filter((o) => o.id !== item.id));

    try {
      const res = await fetch(`/api/v1/admin/university-overviews/${item.id}`, {
        method: 'DELETE',
      });
      const json = await res.json();
      if (res.ok && json.success) {
        showToast('success', 'Overview tab deleted successfully');
        fetchOverviews(selectedUnivId, false);
      } else {
        showToast('error', json.error || 'Failed to delete overview');
        fetchOverviews(selectedUnivId, false);
      }
    } catch {
      showToast('error', 'Error deleting overview');
      fetchOverviews(selectedUnivId, false);
    }
  };

  const formatDateString = (dateStr?: string) => {
    if (!dateStr) return 'N/A';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      const timeStr = d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
      const day = String(d.getDate()).padStart(2, '0');
      const month = d.toLocaleString('en-US', { month: 'short' });
      const year = d.getFullYear();
      return `${day} ${month} ${year}, ${timeStr}`;
    } catch {
      return dateStr;
    }
  };

  const getCleanSnippet = (htmlStr?: string) => {
    if (!htmlStr) return 'No content provided';
    const clean = htmlStr.replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').trim();
    return clean.length > 90 ? clean.substring(0, 90) + '...' : clean || 'No content provided';
  };

  const selectedUniv = universities.find((u) => u.id.toString() === selectedUnivId);

  const filtered = overviews.filter((item) =>
    (item.title || item.tab || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (item.description || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const paginated = filtered.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalWordsCount = overviews.reduce((acc, curr) => {
    const text = (curr.description || '').replace(/<[^>]+>/g, ' ').trim();
    return acc + (text ? text.split(/\s+/).filter(Boolean).length : 0);
  }, 0);

  const withThumbnailsCount = overviews.filter((o) => Boolean(o.thumbnail_path)).length;

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto pb-10">
      {/* Toast Alert */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl text-xs font-semibold text-white animate-in slide-in-from-bottom-5 duration-200 ${toast.type === 'success' ? 'bg-stone-900 border border-emerald-500/40' : 'bg-rose-900 border border-rose-500/40'
            }`}
        >
          {toast.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <AlertCircle className="w-4 h-4 text-rose-400" />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* ── CLASSIC EDITORIAL HEADER ── */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-stone-200/90 shadow-xs relative overflow-hidden">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-1.5 max-w-2xl">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-900 text-[11px] font-bold tracking-wider uppercase">
                <FileText className="w-3 h-3 text-amber-700" />
                <span>Institutional Profile Sections</span>
              </span>
              {selectedUniv && (
                <span className="text-[11px] font-bold text-stone-700 bg-amber-50 border border-amber-200/80 px-2.5 py-0.5 rounded-full">
                  {selectedUniv.name}
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight font-serif">
              University Overviews & Tabs
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
              onClick={() => fetchOverviews(selectedUnivId)}
              disabled={loading || !selectedUnivId}
              className="p-2.5 rounded-xl border border-stone-200 bg-stone-50/70 hover:bg-stone-100 text-stone-700 transition-colors cursor-pointer disabled:opacity-40 shadow-2xs self-start sm:self-auto"
              title="Refresh overview items"
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
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-stone-900 text-white shadow-xs transition-all"
            >
              <FileText className="w-3.5 h-3.5 text-amber-300" />
              <span>Overview Tabs ({overviews.length})</span>
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
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-stone-600 bg-stone-100 hover:bg-stone-200 transition-all cursor-pointer border border-stone-200/60"
            >
              <Trophy className="w-3.5 h-3.5 text-amber-600" />
              <span>Rankings</span>
            </button>
          </div>
        )}

        {/* ── COMPACT METRIC STAT PILLS ── */}
        {selectedUnivId && (
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-4 pt-3.5 border-t border-stone-100 text-xs">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#faf8f4] border border-stone-200/90 text-stone-700">
              <span className="text-stone-500 text-[11px] font-medium uppercase tracking-wider">Overview Tabs:</span>
              <span className="font-extrabold text-stone-900">{overviews.length}</span>
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-50/70 border border-emerald-200/80 text-emerald-900">
              <span className="text-emerald-700 text-[11px] font-medium uppercase tracking-wider">With Thumbnail:</span>
              <span className="font-extrabold text-emerald-800">{withThumbnailsCount}</span>
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-amber-50/70 border border-amber-200/80 text-amber-900">
              <span className="text-amber-700 text-[11px] font-medium uppercase tracking-wider">Words:</span>
              <span className="font-extrabold text-amber-900">{totalWordsCount.toLocaleString()}</span>
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-indigo-50/70 border border-indigo-200/80 text-indigo-900">
              <span className="text-indigo-700 text-[11px] font-medium uppercase tracking-wider">Total Tabs:</span>
              <span className="font-extrabold text-indigo-900">{overviews.length}</span>
            </div>
          </div>
        )}
      </div>

      {!selectedUnivId ? (
        /* Empty State: No University Selected */
        <div className="bg-white rounded-3xl p-16 border border-stone-200/90 text-center flex flex-col items-center justify-center max-w-2xl mx-auto shadow-xs">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200/80 flex items-center justify-center text-amber-800 mb-4 shadow-inner">
            <Building2 className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-black text-stone-900 font-serif">Select an Institution</h3>
          <p className="text-xs sm:text-sm text-stone-500 mt-1.5 max-w-md font-medium leading-relaxed">
            Please choose a university from the dropdown header above to manage its overview sections, campus descriptions, and custom tabs.
          </p>
        </div>
      ) : (
        <>
          {/* ── CARD 1: FORM SECTION (ADD / EDIT RECORD) ── */}
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
                    {editingId ? 'Edit Overview Tab' : 'Create New Overview Tab'}
                  </h2>
                  <p className="text-[11px] text-stone-500 font-medium">
                    {editingId ? 'Update existing content, thumbnail, or display position' : 'Add a new rich content tab to this university profile'}
                  </p>
                </div>
              </div>

              <button
                type="button"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#effaf2] hover:bg-[#dcfce7] text-[#14532d] border border-[#c8ebd2] text-xs font-bold transition-all"
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
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-5">
                  {/* Title */}
                  <div className="sm:col-span-6">
                    <label className="block text-xs font-bold text-stone-700 mb-2 uppercase tracking-wider font-serif">
                      Tab Title / Header <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. About University, Campus Life, Accommodation, Scholarships..."
                      value={formData.title}
                      onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                      className="w-full px-4 py-2.5 text-xs sm:text-sm bg-stone-50/50 border border-stone-200 rounded-xl focus:outline-none focus:border-amber-600 focus:bg-white transition-all text-stone-800 font-medium"
                    />
                  </div>

                  {/* Position */}
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-stone-700 mb-2 uppercase tracking-wider font-serif">
                      Display Position
                    </label>
                    <input
                      type="number"
                      value={formData.position}
                      onChange={(e) => setFormData((prev) => ({ ...prev, position: e.target.value }))}
                      className="w-full px-4 py-2.5 text-xs sm:text-sm bg-stone-50/50 border border-stone-200 rounded-xl focus:outline-none focus:border-amber-600 focus:bg-white transition-all text-stone-800 font-mono font-bold"
                    />
                  </div>

                  {/* Thumbnail File / Image */}
                  <div className="sm:col-span-4">
                    <label className="block text-xs font-bold text-stone-700 mb-2 uppercase tracking-wider font-serif">
                      Section Thumbnail
                    </label>
                    <div className="flex items-center gap-3">
                      <label className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-stone-50 hover:bg-stone-100 border border-dashed border-stone-300 rounded-xl cursor-pointer text-xs font-bold text-stone-700 transition-colors">
                        <Upload className="w-3.5 h-3.5 text-stone-500" />
                        <span>{thumbnailFile ? thumbnailFile.name : 'Upload Image'}</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0] || null;
                            setThumbnailFile(file);
                            if (file) {
                              setThumbnailPreviewUrl(URL.createObjectURL(file));
                              const autoTitle = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
                              setFormData((prev) => ({
                                ...prev,
                                title: prev.title.trim() ? prev.title : autoTitle,
                              }));
                            } else {
                              setThumbnailPreviewUrl(null);
                            }
                          }}
                        />
                      </label>

                      {/* Current / Preview Thumbnail Badge */}
                      {(thumbnailPreviewUrl || formData.thumbnail_path) && (
                        <div className="relative group shrink-0">
                          <img
                            src={thumbnailPreviewUrl || getStorageUrl(formData.thumbnail_path)}
                            alt="Thumbnail Preview"
                            className="w-10 h-10 rounded-xl object-cover border border-stone-200 shadow-xs cursor-pointer"
                            onClick={() => {
                              const url = thumbnailPreviewUrl || formData.thumbnail_path;
                              if (url) setPreviewImage({ title: formData.title || 'Thumbnail', url });
                            }}
                          />
                          <button
                            type="button"
                            onClick={() => {
                              setThumbnailFile(null);
                              setThumbnailPreviewUrl(null);
                              setFormData((prev) => ({ ...prev, thumbnail_path: '' }));
                            }}
                            className="absolute -top-1.5 -right-1.5 w-4.5 h-4.5 bg-rose-600 text-white rounded-full flex items-center justify-center text-[10px] opacity-0 group-hover:opacity-100 transition-opacity shadow-xs"
                            title="Remove image"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Description Rich Text Editor */}
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-2 uppercase tracking-wider font-serif">
                    Overview Tab Description Content
                  </label>
                  <div className="border border-stone-200 rounded-2xl overflow-hidden bg-white shadow-2xs">
                    <RichTextEditor
                      value={formData.description}
                      onChange={(val) => setFormData((prev) => ({ ...prev, description: val }))}
                      placeholder="Write comprehensive profile information, admission requirements, highlights, campus facilities..."
                    />
                  </div>
                </div>

                {/* Submit & Reset Buttons */}
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
                    <span>{editingId ? 'Update Overview' : 'Create Overview Tab'}</span>
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* ── CARD 2: DATA TABLE SECTION ── */}
          <div className="bg-white rounded-3xl border border-stone-200/90 shadow-xs overflow-hidden">
            {/* Table Header Bar */}
            <div className="p-5 sm:p-6 bg-[#faf8f4] border-b border-stone-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-lg bg-[#effaf2] border border-[#c8ebd2] text-[#14532d] flex items-center justify-center font-bold">
                  <Layers className="w-3.5 h-3.5" />
                </span>
                <div>
                  <h2 className="text-base font-black text-stone-900 font-serif">University Overview Tabs</h2>
                  <p className="text-[11px] text-stone-500 font-medium">
                    {filtered.length} tab{filtered.length !== 1 ? 's' : ''} configured for this institution
                  </p>
                </div>
              </div>

              {/* Action and Search Toolbar */}
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <div className="relative flex-1 sm:w-64">
                  <Search className="w-3.5 h-3.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                  <input
                    type="text"
                    placeholder="Search overview tabs..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 text-xs bg-white border border-stone-200 rounded-xl focus:outline-none focus:border-emerald-600 transition-all text-stone-800 placeholder-stone-400 shadow-2xs font-medium"
                  />
                </div>
                {!isFormOpen && (
                  <button
                    type="button"
                    onClick={() => {
                      handleResetForm();
                      setIsFormOpen(true);
                      window.scrollTo({ top: 200, behavior: 'smooth' });
                    }}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#14532d] hover:bg-[#0f3e21] text-white rounded-xl text-xs font-bold transition-all shadow-xs shrink-0 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Tab
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
                    <th className="py-3.5 px-4 w-20 text-center text-[#14532d]">Pos</th>
                    <th className="py-3.5 px-5 text-[#14532d]">Tab / Title</th>
                    <th className="py-3.5 px-5 text-[#14532d]">Content Preview</th>
                    <th className="py-3.5 px-5 w-32 text-center text-[#14532d]">Thumbnail</th>
                    <th className="py-3.5 px-5 w-48 text-[#14532d]">Timestamps</th>
                    <th className="py-3.5 px-5 w-28 text-right text-[#14532d]">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {loading ? (
                    <tr>
                      <td colSpan={7} className="py-16 text-center text-stone-400 font-medium">
                        <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-amber-800" />
                        Loading overview content...
                      </td>
                    </tr>
                  ) : paginated.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-16 text-center text-stone-400 font-medium">
                        {searchQuery ? 'No overview tabs matched your search.' : 'No overview sections configured yet for this university.'}
                      </td>
                    </tr>
                  ) : (
                    paginated.map((item, index) => {
                      const srNo = (currentPage - 1) * itemsPerPage + index + 1;
                      const cleanSnippet = getCleanSnippet(item.description);

                      return (
                        <tr key={item.id} className="hover:bg-[#fbfaf7] transition-colors group">
                          {/* Sr. No */}
                          <td className="py-4 px-5 text-center font-bold text-stone-400 font-mono text-[11px]">
                            {srNo}
                          </td>

                          {/* Position Badge */}
                          <td className="py-4 px-4 text-center">
                            <span className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-lg bg-stone-100 border border-stone-200 text-stone-800 font-mono font-bold text-[11px]">
                              #{item.position}
                            </span>
                          </td>

                          {/* Title / Tab Name */}
                          <td className="py-4 px-5">
                            <div className="font-bold text-stone-900 text-xs sm:text-sm font-serif">
                              {item.title || item.tab}
                            </div>
                            <div className="text-[10.5px] text-stone-400 font-mono mt-0.5">
                              ID: #{item.id}
                            </div>
                          </td>

                          {/* Content & View Modal Trigger */}
                          <td className="py-4 px-5 max-w-xs">
                            <p className="text-[11px] text-stone-500 truncate leading-relaxed">
                              {cleanSnippet}
                            </p>
                            <button
                              onClick={() =>
                                setViewingDescription({
                                  title: item.title || item.tab || 'Overview Description',
                                  html: item.description || '<p>No content provided.</p>',
                                })
                              }
                              className="inline-flex items-center gap-1 mt-1 text-[11px] font-bold text-amber-900 hover:text-amber-800 hover:underline cursor-pointer"
                            >
                              <Eye className="w-3 h-3" /> Read Full Content
                            </button>
                          </td>

                          {/* Thumbnail */}
                          <td className="py-4 px-5 text-center">
                            {item.thumbnail_path ? (
                              <button
                                onClick={() => setPreviewImage({ title: item.title || item.tab || 'Thumbnail', url: item.thumbnail_path! })}
                                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-stone-50 hover:bg-stone-100 border border-stone-200 text-[11px] font-bold text-stone-700 transition-colors cursor-pointer group-hover:border-amber-400"
                              >
                                <img
                                  src={getStorageUrl(item.thumbnail_path)}
                                  alt="Thumb"
                                  className="w-4 h-4 rounded object-cover"
                                />
                                <span>Preview</span>
                                <ExternalLink className="w-2.5 h-2.5 text-stone-400" />
                              </button>
                            ) : (
                              <span className="text-[11px] font-medium text-stone-300">—</span>
                            )}
                          </td>

                          {/* Timestamps */}
                          <td className="py-4 px-5 text-[11px] text-stone-500 space-y-1">
                            <div className="flex items-center gap-1 text-stone-600 font-medium">
                              <Calendar className="w-3 h-3 text-stone-400 shrink-0" />
                              <span>{formatDateString(item.created_at)}</span>
                            </div>
                            {item.updated_at && item.updated_at !== item.created_at && (
                              <div className="flex items-center gap-1 text-[10px] text-stone-400">
                                <Clock className="w-2.5 h-2.5 text-stone-400 shrink-0" />
                                <span>Updated: {formatDateString(item.updated_at)}</span>
                              </div>
                            )}
                          </td>

                          {/* Actions */}
                          <td className="py-4 px-5 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => handleEditClick(item)}
                                className="p-2 bg-stone-100 hover:bg-stone-900 text-stone-700 hover:text-white rounded-xl transition-all shadow-2xs cursor-pointer"
                                title="Edit Overview Tab"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDelete(item)}
                                className="p-2 bg-rose-50 hover:bg-rose-600 text-rose-600 hover:text-white rounded-xl transition-all shadow-2xs cursor-pointer"
                                title="Delete Tab"
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
                  <span className="font-bold text-stone-800">{filtered.length}</span> tabs
                </div>
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
        </>
      )}

      {/* ── DESCRIPTION PREVIEW MODAL ── */}
      {viewingDescription && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl border border-stone-200 w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between p-5 bg-[#faf8f4] border-b border-stone-200">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-amber-800" />
                <h3 className="text-base font-black text-stone-900 font-serif">{viewingDescription.title}</h3>
              </div>
              <button
                onClick={() => setViewingDescription(null)}
                className="p-1.5 text-stone-400 hover:text-stone-700 rounded-xl hover:bg-stone-200/60 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div
              className="p-6 sm:p-8 overflow-y-auto prose prose-stone max-w-none text-xs sm:text-sm leading-relaxed text-stone-700"
              dangerouslySetInnerHTML={{ __html: viewingDescription.html }}
            />
            <div className="p-4 bg-[#faf8f4] border-t border-stone-200 text-right">
              <button
                onClick={() => setViewingDescription(null)}
                className="px-5 py-2 bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer shadow-xs"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── IMAGE PREVIEW MODAL ── */}
      {previewImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-stone-200 overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-stone-200 flex items-center justify-between bg-[#faf8f4]">
              <div className="flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-amber-800" />
                <h3 className="font-black text-stone-900 text-sm font-serif">{previewImage.title} Preview</h3>
              </div>
              <button
                onClick={() => setPreviewImage(null)}
                className="text-stone-400 hover:text-stone-700 p-1.5 rounded-xl hover:bg-stone-200/60 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-6 flex flex-col items-center justify-center bg-stone-50/50 min-h-[240px]">
              <img
                src={getStorageUrl(previewImage.url)}
                alt={previewImage.title}
                className="max-h-80 w-auto rounded-2xl shadow-sm border border-stone-200 object-contain bg-white p-1"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
              <a
                href={getStorageUrl(previewImage.url)}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-mono text-amber-900 hover:underline mt-4 break-all flex items-center gap-1 font-bold"
              >
                {getStorageUrl(previewImage.url)} <ExternalLink className="w-3 h-3 shrink-0" />
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

