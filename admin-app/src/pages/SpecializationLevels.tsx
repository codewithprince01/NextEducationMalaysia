import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { confirmDelete } from '@/lib/swal';
import Pagination from '@/components/common/Pagination';
import {
  Layers,
  Plus,
  Minus,
  Search,
  Edit2,
  Trash2,
  Loader2,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  ArrowLeft,
  Eye,
  Save,
  RotateCcw,
  Download,
  Upload,
  X
} from 'lucide-react';

interface SpecializationLevelItem {
  id: number;
  specialization_id?: number;
  specialization_name?: string;
  level: string;
  level_name?: string;
  level_slug?: string;
  url_slug?: string;
  duration?: string;
  tuition_fees?: string;
  intake?: string;
  accreditation?: string;
  contents_count?: number;
  meta_title?: string;
  meta_description?: string;
  meta_keyword?: string;
  og_image_path?: string;
  seo_rating?: number;
  best_rating?: number;
  review_number?: number;
}

interface SpecializationOption {
  id: number;
  name: string;
}

export default function SpecializationLevels() {
  const { id: paramSpecId } = useParams<{ id?: string }>();
  const navigate = useNavigate();

  const [items, setItems] = useState<SpecializationLevelItem[]>([]);
  const [specializations, setSpecializations] = useState<SpecializationOption[]>([]);
  const [specializationInfo, setSpecializationInfo] = useState<{ id: number; name: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Import / Bulk Update File States
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [bulkFile, setBulkFile] = useState<File | null>(null);
  const [bulkUpdating, setBulkUpdating] = useState(false);

  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    specialization_id: paramSpecId || '',
    level: '',
    duration: '',
    tuition_fees: '',
    intake: '',
    accreditation: '',
    meta_title: '',
    meta_keyword: '',
    meta_description: '',
    seo_rating: '',
    best_rating: '',
    review_number: '',
    og_image_path: ''
  });

  // Preview Modals
  const [previewSeo, setPreviewSeo] = useState<SpecializationLevelItem | null>(null);

  // Pagination (20 items/page)
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const url = paramSpecId
        ? `/api/v1/admin/specialization-levels?specialization_id=${paramSpecId}`
        : '/api/v1/admin/specialization-levels';

      const [levelsRes, specRes] = await Promise.all([
        fetch(url),
        fetch('/api/v1/admin/course-specializations')
      ]);

      const levelsJson = await levelsRes.json();
      const specJson = await specRes.json();

      if (levelsRes.ok && levelsJson.status) {
        setItems(levelsJson.data || []);
        if (levelsJson.specialization) {
          setSpecializationInfo(levelsJson.specialization);
        }
      } else {
        showToast('error', levelsJson.message || 'Failed to load specialization levels');
      }

      if (specRes.ok && specJson.status) {
        setSpecializations(specJson.data || []);
      }
    } catch {
      showToast('error', 'Connection error while fetching data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [paramSpecId]);

  const handleResetForm = () => {
    setEditingId(null);
    setFormData({
      specialization_id: paramSpecId || (specializations.length > 0 ? String(specializations[0].id) : ''),
      level: '',
      duration: '',
      tuition_fees: '',
      intake: '',
      accreditation: '',
      meta_title: '',
      meta_keyword: '',
      meta_description: '',
      seo_rating: '',
      best_rating: '',
      review_number: '',
      og_image_path: ''
    });
  };

  const handleOpenEdit = (item: SpecializationLevelItem) => {
    setEditingId(item.id);
    setFormData({
      specialization_id: item.specialization_id ? String(item.specialization_id) : (paramSpecId || ''),
      level: item.level || item.level_name || '',
      duration: item.duration || '',
      tuition_fees: item.tuition_fees || '',
      intake: item.intake || '',
      accreditation: item.accreditation || '',
      meta_title: item.meta_title || '',
      meta_keyword: item.meta_keyword || '',
      meta_description: item.meta_description || '',
      seo_rating: item.seo_rating !== null && item.seo_rating !== undefined ? String(item.seo_rating) : '',
      best_rating: item.best_rating !== null && item.best_rating !== undefined ? String(item.best_rating) : '',
      review_number: item.review_number !== null && item.review_number !== undefined ? String(item.review_number) : '',
      og_image_path: item.og_image_path || ''
    });
    setIsFormVisible(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.level.trim()) {
      showToast('error', 'Enter Level is required');
      return;
    }

    setSubmitting(true);
    try {
      const url = editingId
        ? `/api/v1/admin/specialization-levels/${editingId}`
        : '/api/v1/admin/specialization-levels';
      const method = editingId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          specialization_id: formData.specialization_id || paramSpecId
        })
      });

      const json = await res.json();
      if (res.ok && json.status) {
        showToast('success', editingId ? 'Record updated successfully' : 'Record created successfully');
        handleResetForm();
        fetchData();
      } else {
        showToast('error', json.message || 'Action failed');
      }
    } catch {
      showToast('error', 'Network error occurred');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number, levelName: string) => {
    const isConfirmed = await confirmDelete(
      'Delete Specialization Level?',
      `Are you sure you want to delete "${levelName}"?`
    );
    if (!isConfirmed) return;

    try {
      const res = await fetch(`/api/v1/admin/specialization-levels/${id}`, { method: 'DELETE' });
      const json = await res.json();
      if (res.ok && json.status) {
        showToast('success', 'Record has been deleted');
        fetchData();
      } else {
        showToast('error', json.message || 'Delete failed');
      }
    } catch {
      showToast('error', 'Network error during delete');
    }
  };

  // Excel Format Template Download
  const handleDownloadFormat = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      'specialization_id,level,duration,tuition_fees,intake,accreditation\n' +
      '"797","UNDER-GRADUATE","3 Years","RM 60000-90000","Jan, April, Sept","MQA"\n' +
      '"797","POST-GRADUATE","1 Year","RM 25000-55000","Jan, March, July, Sept","MQA"';
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'course_specialization_level_template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Excel Import Handler
  const handleImport = async () => {
    if (!importFile) {
      showToast('error', 'Please choose an Excel or CSV file first');
      return;
    }
    setImporting(true);
    try {
      const data = new FormData();
      data.append('file', importFile);

      const res = await fetch('/api/v1/admin/specialization-levels/import', {
        method: 'POST',
        body: data,
      });

      const json = await res.json();
      if (res.ok && json.status) {
        showToast('success', json.message || 'Import successful');
        setImportFile(null);
        fetchData();
      } else {
        showToast('error', json.message || 'Import failed');
      }
    } catch {
      showToast('error', 'Network error during import');
    } finally {
      setImporting(false);
    }
  };

  // Bulk Update Import Handler
  const handleBulkUpdate = async () => {
    if (!bulkFile) {
      showToast('error', 'Please choose a bulk update file first');
      return;
    }
    setBulkUpdating(true);
    try {
      const data = new FormData();
      data.append('file', bulkFile);

      const res = await fetch('/api/v1/admin/specialization-levels/bulk-update-import', {
        method: 'POST',
        body: data,
      });

      const json = await res.json();
      if (res.ok && json.status) {
        showToast('success', json.message || 'Bulk update successful');
        setBulkFile(null);
        fetchData();
      } else {
        showToast('error', json.message || 'Bulk update failed');
      }
    } catch {
      showToast('error', 'Network error during bulk update');
    } finally {
      setBulkUpdating(false);
    }
  };

  // Export to CSV
  const handleExportCSV = () => {
    if (items.length === 0) return;

    const headers = ['ID', 'Specialization ID', 'Specialization Name', 'Level', 'Duration', 'Tuition Fees', 'Intake', 'Accreditation', 'Contents Count'];
    const rows = items.map((item) => [
      item.id,
      item.specialization_id || '',
      `"${(item.specialization_name || '').replace(/"/g, '""')}"`,
      `"${(item.level || item.level_name || '').replace(/"/g, '""')}"`,
      `"${(item.duration || '').replace(/"/g, '""')}"`,
      `"${(item.tuition_fees || '').replace(/"/g, '""')}"`,
      `"${(item.intake || '').replace(/"/g, '""')}"`,
      `"${(item.accreditation || '').replace(/"/g, '""')}"`,
      item.contents_count || 0
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `specialization_levels_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredItems = items.filter((item) => {
    const query = searchQuery.toLowerCase();
    return (
      (item.level || '').toLowerCase().includes(query) ||
      (item.specialization_name || '').toLowerCase().includes(query) ||
      (item.duration || '').toLowerCase().includes(query) ||
      (item.accreditation || '').toLowerCase().includes(query) ||
      String(item.specialization_id || '').includes(query)
    );
  });

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  const paginatedItems = filteredItems.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
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
          {paramSpecId && (
            <button
              onClick={() => navigate('/course-specializations')}
              className="p-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
              title="Back to Specializations"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          <div className="w-12 h-12 rounded-xl bg-cyan-50 border border-cyan-100 flex items-center justify-center text-cyan-600 shrink-0">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-extrabold text-cyan-600 bg-cyan-50 border border-cyan-100 px-2 py-0.5 rounded-full uppercase tracking-wider">
                Specialization Levels
              </span>
              {specializationInfo && (
                <span className="text-[10px] font-extrabold text-indigo-600 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-full">
                  Specialization: {specializationInfo.name} (# {specializationInfo.id})
                </span>
              )}
            </div>
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight mt-0.5">
              Specialization Levels {specializationInfo ? `- ${specializationInfo.name}` : ''}
            </h1>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Manage study levels (Diploma, Bachelor, Master, PhD) and tuition fees for specializations.
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
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-xs transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Select Excel File & Bulk Update Boxes (Matching Laravel course-specialization-levels layout) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Import Excel File Box */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
          <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">Select Excel File</h3>
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full flex items-center border border-slate-200 rounded-xl overflow-hidden bg-slate-50">
              <input
                type="file"
                accept=".xlsx, .xls, .csv"
                onChange={(e) => setImportFile(e.target.files?.[0] || null)}
                className="w-full text-xs text-slate-600 file:mr-4 file:py-2 file:px-4 file:rounded-l-xl file:border-0 file:text-xs file:font-bold file:bg-slate-200 file:text-slate-700 hover:file:bg-slate-300 cursor-pointer"
              />
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
              <button
                onClick={handleImport}
                disabled={importing || !importFile}
                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-600 disabled:opacity-50 text-white font-bold text-xs shadow-xs transition-all cursor-pointer"
              >
                {importing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                <span>Import</span>
              </button>
              <button
                onClick={handleDownloadFormat}
                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs transition-all cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Formate</span>
              </button>
            </div>
          </div>
        </div>

        {/* Bulk Update Box */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
          <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">Bulk Update</h3>
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full flex items-center border border-slate-200 rounded-xl overflow-hidden bg-slate-50">
              <input
                type="file"
                accept=".xlsx, .xls, .csv"
                onChange={(e) => setBulkFile(e.target.files?.[0] || null)}
                className="w-full text-xs text-slate-600 file:mr-4 file:py-2 file:px-4 file:rounded-l-xl file:border-0 file:text-xs file:font-bold file:bg-slate-200 file:text-slate-700 hover:file:bg-slate-300 cursor-pointer"
              />
            </div>
            <button
              onClick={handleBulkUpdate}
              disabled={bulkUpdating || !bulkFile}
              className="w-full sm:w-auto shrink-0 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-700 disabled:opacity-50 text-white font-bold text-xs shadow-xs transition-all cursor-pointer"
            >
              {bulkUpdating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
              <span>Bulk Update</span>
            </button>
          </div>
        </div>
      </div>

      {/* Add / Edit Record Form Card (Matching Laravel Layout) */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
            <Layers className="w-4 h-4 text-cyan-600" />
            {editingId ? 'Update Record' : 'Add New Record'}
          </h3>
          <button
            type="button"
            onClick={() => setIsFormVisible(!isFormVisible)}
            className="w-7 h-7 rounded-lg bg-sky-500 hover:bg-sky-600 text-white flex items-center justify-center font-bold transition-all cursor-pointer shadow-xs"
            title={isFormVisible ? 'Collapse form' : 'Expand form'}
          >
            {isFormVisible ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          </button>
        </div>

        {isFormVisible && (
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {!paramSpecId && (
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Select Specialization <span className="text-rose-500">*</span>
                </label>
                <select
                  value={formData.specialization_id}
                  onChange={(e) => setFormData({ ...formData, specialization_id: e.target.value })}
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-800 focus:outline-none focus:border-cyan-500 focus:bg-white"
                >
                  <option value="">-- Select Specialization --</option>
                  {specializations.map((spec) => (
                    <option key={spec.id} value={spec.id}>
                      {spec.name} (# {spec.id})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Main Form Fields Grid (3 Columns) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Enter Level <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Enter Level"
                  value={formData.level}
                  onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-800 focus:outline-none focus:border-cyan-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Enter Duration</label>
                <input
                  type="text"
                  placeholder="Enter Duration"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-800 focus:outline-none focus:border-cyan-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Enter Tuition Fees</label>
                <input
                  type="text"
                  placeholder="Enter Tuition Fees"
                  value={formData.tuition_fees}
                  onChange={(e) => setFormData({ ...formData, tuition_fees: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-800 focus:outline-none focus:border-cyan-500 focus:bg-white"
                />
              </div>
            </div>

            {/* Second Row Grid */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              <div className="md:col-span-4">
                <label className="block text-xs font-bold text-slate-700 mb-1">Enter Intake</label>
                <input
                  type="text"
                  placeholder="Enter Intake"
                  value={formData.intake}
                  onChange={(e) => setFormData({ ...formData, intake: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-800 focus:outline-none focus:border-cyan-500 focus:bg-white"
                />
              </div>

              <div className="md:col-span-8">
                <label className="block text-xs font-bold text-slate-700 mb-1">Enter Accreditation</label>
                <input
                  type="text"
                  placeholder="Enter Accreditation"
                  value={formData.accreditation}
                  onChange={(e) => setFormData({ ...formData, accreditation: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-800 focus:outline-none focus:border-cyan-500 focus:bg-white"
                />
              </div>
            </div>

            <hr className="border-slate-100 my-4" />

            {/* SEO Section (Matching Exact Laravel View Component) */}
            <div className="space-y-4">
              <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">SEO Fields</h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Meta Title</label>
                  <input
                    type="text"
                    placeholder="Enter Meta Title"
                    value={formData.meta_title}
                    onChange={(e) => setFormData({ ...formData, meta_title: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-800 focus:outline-none focus:border-cyan-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Meta Keyword</label>
                  <input
                    type="text"
                    placeholder="Meta Keyword"
                    value={formData.meta_keyword}
                    onChange={(e) => setFormData({ ...formData, meta_keyword: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-800 focus:outline-none focus:border-cyan-500 focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Meta Description</label>
                <textarea
                  rows={3}
                  placeholder="Enter Meta Description"
                  value={formData.meta_description}
                  onChange={(e) => setFormData({ ...formData, meta_description: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-medium text-slate-800 focus:outline-none focus:border-cyan-500 focus:bg-white resize-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Seo Rating</label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="Seo Rating"
                    value={formData.seo_rating}
                    onChange={(e) => setFormData({ ...formData, seo_rating: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-800 focus:outline-none focus:border-cyan-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Best Rating</label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="Best Rating"
                    value={formData.best_rating}
                    onChange={(e) => setFormData({ ...formData, best_rating: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-800 focus:outline-none focus:border-cyan-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Number of Review</label>
                  <input
                    type="number"
                    placeholder="Total Reviews"
                    value={formData.review_number}
                    onChange={(e) => setFormData({ ...formData, review_number: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-800 focus:outline-none focus:border-cyan-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Upload OG Image Path</label>
                  <input
                    type="text"
                    placeholder="Upload OG Image Path"
                    value={formData.og_image_path}
                    onChange={(e) => setFormData({ ...formData, og_image_path: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-800 focus:outline-none focus:border-cyan-500 focus:bg-white"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-start gap-3 pt-3">
              <button
                type="button"
                onClick={handleResetForm}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reset
              </button>
              {editingId && (
                <button
                  type="button"
                  onClick={handleResetForm}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-500 hover:bg-slate-600 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
                >
                  Cancel
                </button>
              )}
              <button
                type="submit"
                disabled={submitting}
                className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20 disabled:opacity-50 transition-all cursor-pointer"
              >
                {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                Submit
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search level, specialization name, duration, intake..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:border-cyan-500 focus:bg-white focus:ring-2 focus:ring-cyan-100 transition-all"
          />
        </div>

        <div className="text-xs font-semibold text-slate-500">
          Total Levels: <span className="text-slate-900 font-bold">{filteredItems.length}</span>
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-3 text-cyan-600" />
            <span className="text-xs font-semibold">Loading specialization levels...</span>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <Layers className="w-10 h-10 mx-auto mb-2 opacity-30" />
            <p className="text-xs font-semibold">No specialization levels found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-100 text-[11px] font-extrabold text-slate-600 uppercase tracking-wider">
                  <th className="py-3.5 px-5">Sr. No.</th>
                  <th className="py-3.5 px-5">Level</th>
                  {!paramSpecId && <th className="py-3.5 px-5">Specialization</th>}
                  <th className="py-3.5 px-5">Duration</th>
                  <th className="py-3.5 px-5">Tuition Fees</th>
                  <th className="py-3.5 px-5">Intake</th>
                  <th className="py-3.5 px-5">Accreditation</th>
                  <th className="py-3.5 px-5">SEO</th>
                  <th className="py-3.5 px-5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
                {paginatedItems.map((item, index) => (
                  <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-4 px-5 font-bold text-slate-400">
                      {(currentPage - 1) * itemsPerPage + index + 1}
                    </td>
                    <td className="py-4 px-5">
                      <span className="font-extrabold text-slate-900 bg-slate-100 border border-slate-200/80 px-2.5 py-1 rounded-lg uppercase text-[10.5px]">
                        {item.level || item.level_name}
                      </span>
                    </td>
                    {!paramSpecId && (
                      <td className="py-4 px-5 font-semibold text-slate-800">
                        {item.specialization_name || 'N/A'}
                      </td>
                    )}
                    <td className="py-4 px-5 text-slate-700 font-semibold">
                      {item.duration || 'N/A'}
                    </td>
                    <td className="py-4 px-5 text-slate-700 font-semibold">
                      {item.tuition_fees || 'N/A'}
                    </td>
                    <td className="py-4 px-5 text-slate-700 font-semibold">
                      {item.intake || 'N/A'}
                    </td>
                    <td className="py-4 px-5 text-slate-700 font-semibold">
                      {item.accreditation || 'N/A'}
                    </td>
                    <td className="py-4 px-5">
                      <button
                        onClick={() => setPreviewSeo(item)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-600 font-bold text-[10.5px] hover:bg-indigo-100 transition-colors cursor-pointer"
                      >
                        <Eye className="w-3 h-3" /> View
                      </button>
                    </td>
                    <td className="py-4 px-5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleDelete(item.id, item.level || item.level_name || 'Level')}
                          className="p-1.5 rounded-lg text-white bg-rose-500 hover:bg-rose-600 shadow-xs transition-colors cursor-pointer"
                          title="Delete Level"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleOpenEdit(item)}
                          className="p-1.5 rounded-lg text-white bg-sky-500 hover:bg-sky-600 shadow-xs transition-colors cursor-pointer"
                          title="Edit Level"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => navigate(`/specialization-level-contents/${item.id}`)}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-indigo-600 text-indigo-600 hover:bg-indigo-50 font-extrabold text-[10.5px] transition-colors cursor-pointer"
                          title="Manage Specialization Level Content Tabs"
                        >
                          <span>Content</span>
                          <span className="bg-rose-500 text-white px-1.5 py-0.2 rounded-full text-[9px]">
                            {item.contents_count || 0}
                          </span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={filteredItems.length}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
        />
      </div>

      {/* SEO Preview Modal */}
      {previewSeo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-100 overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h3 className="font-extrabold text-slate-900 text-sm">
                SEO Metadata: {previewSeo.level}
              </h3>
              <button
                onClick={() => setPreviewSeo(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4 text-xs">
              <div>
                <span className="font-bold text-slate-500 block mb-1">Meta Title:</span>
                <p className="font-semibold text-slate-800 bg-slate-50 p-2.5 rounded-xl border border-slate-200/80">
                  {previewSeo.meta_title || 'Not set'}
                </p>
              </div>
              <div>
                <span className="font-bold text-slate-500 block mb-1">Meta Keywords:</span>
                <p className="font-semibold text-slate-800 bg-slate-50 p-2.5 rounded-xl border border-slate-200/80">
                  {previewSeo.meta_keyword || 'Not set'}
                </p>
              </div>
              <div>
                <span className="font-bold text-slate-500 block mb-1">Meta Description:</span>
                <p className="font-semibold text-slate-800 bg-slate-50 p-2.5 rounded-xl border border-slate-200/80">
                  {previewSeo.meta_description || 'Not set'}
                </p>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center pt-2">
                <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                  <span className="text-[10px] text-slate-400 block font-bold uppercase">SEO Rating</span>
                  <span className="font-extrabold text-slate-800 text-xs">{previewSeo.seo_rating ?? 'N/A'}</span>
                </div>
                <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                  <span className="text-[10px] text-slate-400 block font-bold uppercase">Best Rating</span>
                  <span className="font-extrabold text-slate-800 text-xs">{previewSeo.best_rating ?? 'N/A'}</span>
                </div>
                <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                  <span className="text-[10px] text-slate-400 block font-bold uppercase">Reviews</span>
                  <span className="font-extrabold text-slate-800 text-xs">{previewSeo.review_number ?? 'N/A'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
