import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { confirmDelete } from '@/lib/swal';
import { getStorageUrl } from '@/lib/uploadHelper';
import Pagination from '@/components/common/Pagination';
import {
  Building2,
  Plus,
  Search,
  Edit2,
  Trash2,
  Loader2,
  X,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  ExternalLink,
  MapPin,
  MoreVertical,
  GraduationCap,
  Award,
  FileSpreadsheet,
  Layers,
  Image as ImageIcon,
  Video as VideoIcon,
  Sparkles,
  ChevronDown,
  Star
} from 'lucide-react';

interface UniversityItem {
  id: number;
  name: string;
  uname: string;
  city?: string;
  state?: string;
  rank?: string;
  qs_rank?: string;
  qs_asia_rank?: string;
  times_rank?: string;
  institute_type?: number;
  institute_type_name?: string;
  established_year?: string;
  email?: string;
  cc?: string;
  contact_number1?: string;
  shortnote?: string;
  logo_path?: string;
  banner_path?: string;
  og_image_path?: string;
  meta_title?: string;
  meta_description?: string;
  meta_keyword?: string;
  status?: number;
  homeview?: number;
  featured?: number;
  programs_count?: number;
  overviews_count?: number;
  photos_count?: number;
  videos_count?: number;
  facilities_count?: number;
  created_at?: string;
  updated_at?: string;
}

export default function Universities() {
  const navigate = useNavigate();
  const [universities, setUniversities] = useState<UniversityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [stateFilter, setStateFilter] = useState('');
  const [websiteFilter, setWebsiteFilter] = useState('MYS');
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [openDropdownId, setOpenDropdownId] = useState<number | null>(null);
  const [showImportBox, setShowImportBox] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Pagination State (20 per page)
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  // Excel Import State
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);

  // Preview Modals
  const [previewSeo, setPreviewSeo] = useState<UniversityItem | null>(null);
  const [previewImage, setPreviewImage] = useState<{ title: string; url: string } | null>(null);

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchData = async (showLoading = true, website = websiteFilter) => {
    if (showLoading) setLoading(true);
    try {
      const q = website ? `?website=${website}` : '';
      const univRes = await fetch(`/api/v1/admin/universities${q}`);
      const univJson = await univRes.json();

      if (univRes.ok && (univJson.status || univJson.success)) {
        setUniversities(univJson.data || []);
      } else {
        showToast('error', univJson.message || 'Failed to fetch universities');
      }
    } catch {
      showToast('error', 'Network error while fetching data');
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(true, websiteFilter);
  }, [websiteFilter]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleGlobalClick = () => setOpenDropdownId(null);
    window.addEventListener('click', handleGlobalClick);
    return () => window.removeEventListener('click', handleGlobalClick);
  }, []);

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(paginated.map((u) => u.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id: number) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((item) => item !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleDownloadFormat = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      'name,city,state,rank,shortnote\n' +
      'Sunway University,Bandar Sunway,Selangor,1,Leading private university\n' +
      "Taylor's University,Subang Jaya,Selangor,2,Top ranked private university in Malaysia";
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'universities_format.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleBulkImport = async () => {
    if (!importFile) {
      showToast('error', 'Please select a CSV or Excel file to import');
      return;
    }
    setImporting(true);
    const formData = new FormData();
    formData.append('file', importFile);

    try {
      const res = await fetch('/api/v1/admin/universities/import', {
        method: 'POST',
        body: formData,
      });
      const json = await res.json();
      if (res.ok && (json.status || json.success)) {
        showToast('success', json.message || 'Bulk data imported successfully');
        setImportFile(null);
        fetchData(false);
      } else {
        showToast('error', json.message || 'Failed to import data');
      }
    } catch {
      showToast('error', 'Network error during bulk import');
    } finally {
      setImporting(false);
    }
  };

  const handleDelete = async (id: number, name: string) => {
    const isConfirmed = await confirmDelete(
      'Delete University?',
      `Are you sure you want to delete "${name}"?`
    );
    if (!isConfirmed) return;

    // Optimistic removal
    setUniversities((prev) => prev.filter((item) => item.id !== id));
    setSelectedIds((prev) => prev.filter((item) => item !== id));

    try {
      const res = await fetch(`/api/v1/admin/universities/${id}`, { method: 'DELETE' });
      const json = await res.json();
      if (res.ok && (json.status || json.success)) {
        showToast('success', 'University deleted successfully');
        fetchData(false);
      } else {
        showToast('error', json.message || 'Failed to delete university');
        fetchData(false);
      }
    } catch {
      showToast('error', 'Network error while deleting university');
      fetchData(false);
    }
  };

  const stateOptions = useMemo(() => {
    return Array.from(new Set(universities.map((u) => u.state).filter(Boolean))) as string[];
  }, [universities]);

  // Statistics calculation for the classic summary bar
  const summaryStats = useMemo(() => {
    const total = universities.length;
    const active = universities.filter((u) => u.status !== 0).length;
    const qsRanked = universities.filter((u) => u.qs_rank && u.qs_rank !== '0' && u.qs_rank !== 'N/A').length;
    const totalPrograms = universities.reduce((acc, u) => acc + (u.programs_count || 0), 0);
    return { total, active, qsRanked, totalPrograms };
  }, [universities]);

  const filtered = useMemo(() => {
    return universities.filter((item) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        item.name?.toLowerCase().includes(q) ||
        item.uname?.toLowerCase().includes(q) ||
        item.city?.toLowerCase().includes(q) ||
        item.state?.toLowerCase().includes(q) ||
        String(item.id).includes(q);
      const matchesState = stateFilter ? item.state === stateFilter : true;
      return matchesSearch && matchesState;
    });
  }, [universities, searchQuery, stateFilter]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, stateFilter]);

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginated = filtered.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '—';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="space-y-5">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl text-xs font-semibold text-white animate-in slide-in-from-bottom-5 duration-200 ${
            toast.type === 'success' ? 'bg-stone-900 border border-emerald-500/40' : 'bg-rose-900 border border-rose-500/40'
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
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-900 text-[11px] font-bold tracking-wider uppercase">
                <Sparkles className="w-3 h-3 text-amber-700" />
                <span>Institutional Directory</span>
              </span>
              <span className="text-[11px] font-bold text-stone-600 bg-stone-100 px-2.5 py-0.5 rounded-full border border-stone-200">
                {websiteFilter} Region
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight font-serif">
              Universities & Colleges
            </h1>
            <p className="text-xs sm:text-sm text-stone-500 font-medium leading-relaxed">
              Official catalog of recognized universities, campuses, QS rankings, accreditation details, and published study programs in Malaysia.
            </p>
          </div>

          {/* Action Toolbar */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              onClick={() => fetchData()}
              disabled={loading}
              className="p-2.5 rounded-xl border border-stone-200 bg-stone-50/70 hover:bg-stone-100 text-stone-700 transition-colors cursor-pointer disabled:opacity-50 shadow-2xs"
              title="Refresh university records"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-stone-600' : ''}`} />
            </button>

            <button
              type="button"
              onClick={() => setShowImportBox((prev) => !prev)}
              className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer shadow-2xs ${
                showImportBox
                  ? 'border-stone-400 bg-stone-100 text-stone-900'
                  : 'border-stone-200 bg-white hover:bg-stone-50 text-stone-700'
              }`}
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              <span>Import Data</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showImportBox ? 'rotate-180' : ''}`} />
            </button>

            <button
              onClick={() => navigate('/university/add')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs shadow-md shadow-stone-900/15 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4 text-amber-300" />
              <span>Add University</span>
            </button>
          </div>
        </div>

        {/* ── CLASSIC METRIC STAT CARDS ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 mt-6 pt-6 border-t border-stone-100">
          <div className="p-3.5 rounded-2xl bg-[#faf8f4] border border-stone-200/80">
            <div className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">Total Institutions</div>
            <div className="text-2xl font-black text-stone-900 tracking-tight mt-0.5">
              {loading ? '...' : summaryStats.total}
            </div>
            <div className="text-[10.5px] font-semibold text-stone-600 mt-1">Listed in directory</div>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#faf8f4] border border-stone-200/80">
            <div className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">Active Published</div>
            <div className="text-2xl font-black text-emerald-800 tracking-tight mt-0.5">
              {loading ? '...' : summaryStats.active}
            </div>
            <div className="text-[10.5px] font-semibold text-emerald-700 mt-1">Visible on live portal</div>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#faf8f4] border border-stone-200/80">
            <div className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">QS Ranked</div>
            <div className="text-2xl font-black text-amber-800 tracking-tight mt-0.5">
              {loading ? '...' : summaryStats.qsRanked}
            </div>
            <div className="text-[10.5px] font-semibold text-amber-700 mt-1">Rankings verified</div>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#faf8f4] border border-stone-200/80">
            <div className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">Linked Programs</div>
            <div className="text-2xl font-black text-indigo-900 tracking-tight mt-0.5">
              {loading ? '...' : summaryStats.totalPrograms}
            </div>
            <div className="text-[10.5px] font-semibold text-indigo-700 mt-1">Course offerings</div>
          </div>
        </div>
      </div>

      {/* ── EXPANDABLE EXCEL / CSV BULK IMPORT CARD ── */}
      {showImportBox && (
        <div className="bg-white p-5 rounded-3xl border border-stone-200/90 shadow-xs space-y-3 animate-in slide-in-from-top-3 duration-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4 text-emerald-700" />
              <h3 className="text-xs font-black text-stone-800 uppercase tracking-wider font-serif">
                Bulk Excel / CSV University Importer
              </h3>
            </div>
            <button
              onClick={() => setShowImportBox(false)}
              className="text-stone-400 hover:text-stone-600 p-1 rounded-lg cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full flex items-center border border-stone-200 rounded-xl overflow-hidden bg-stone-50/60">
              <input
                type="file"
                accept=".xlsx, .xls, .csv"
                onChange={(e) => setImportFile(e.target.files?.[0] || null)}
                className="w-full text-xs text-stone-600 file:mr-4 file:py-2.5 file:px-4 file:rounded-l-xl file:border-0 file:text-xs file:font-bold file:bg-stone-200 file:text-stone-800 hover:file:bg-stone-300 cursor-pointer"
              />
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
              <button
                onClick={handleBulkImport}
                disabled={importing || !importFile}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition-all disabled:opacity-50 cursor-pointer shadow-xs"
              >
                {importing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                <span>Upload & Import</span>
              </button>
              <button
                onClick={handleDownloadFormat}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-stone-200 hover:bg-stone-50 text-stone-700 text-xs font-bold transition-all cursor-pointer"
              >
                <span>Download Sample CSV</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── SEARCH & FILTER CONTROLS ── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-stone-200/90 shadow-xs">
        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          {/* Search Input */}
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search by name, ID, city, state..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-stone-50/70 border border-stone-200/90 rounded-xl pl-10 pr-8 py-2 text-xs font-medium text-stone-800 placeholder-stone-400 focus:outline-none focus:border-amber-600 focus:bg-white focus:ring-2 focus:ring-amber-500/20 transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 text-stone-400 hover:text-stone-700 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Region / Country Selector */}
          <div className="relative w-full sm:w-44">
            <select
              value={websiteFilter}
              onChange={(e) => setWebsiteFilter(e.target.value)}
              className="w-full bg-stone-50/70 border border-stone-200/90 rounded-xl px-3 py-2 text-xs font-bold text-stone-700 focus:outline-none focus:border-amber-600 focus:bg-white cursor-pointer"
            >
              <option value="MYS">Malaysia (MYS)</option>
              <option value="USA">United States (USA)</option>
              <option value="IND">India (IND)</option>
              <option value="CAN">Canada (CAN)</option>
              <option value="DEU">Germany (DEU)</option>
              <option value="ALL">All Countries</option>
            </select>
          </div>

          {/* State Selector */}
          <div className="relative w-full sm:w-44">
            <select
              value={stateFilter}
              onChange={(e) => setStateFilter(e.target.value)}
              className="w-full bg-stone-50/70 border border-stone-200/90 rounded-xl px-3 py-2 text-xs font-bold text-stone-700 focus:outline-none focus:border-amber-600 focus:bg-white cursor-pointer"
            >
              <option value="">All States ({stateOptions.length})</option>
              {stateOptions.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
          </div>

          {(searchQuery || stateFilter) && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setStateFilter('');
              }}
              className="px-3 py-2 rounded-xl text-xs font-bold text-amber-800 hover:bg-amber-50 cursor-pointer transition-colors"
            >
              Reset Filters
            </button>
          )}
        </div>

        <div className="flex items-center gap-3 text-xs font-semibold text-stone-500 shrink-0">
          <span>Showing</span>
          <span className="px-2.5 py-1 rounded-lg bg-stone-100 font-bold text-stone-900 border border-stone-200">
            {filtered.length} {filtered.length === 1 ? 'University' : 'Universities'}
          </span>
        </div>
      </div>

      {/* ── CLASSIC MAIN DATA TABLE ── */}
      <div className="bg-white rounded-3xl border border-stone-200/90 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-16 flex flex-col items-center justify-center text-stone-400">
            <Loader2 className="w-8 h-8 animate-spin text-amber-700 mb-3" />
            <p className="text-xs font-bold text-stone-700">Loading university catalog...</p>
            <p className="text-[11px] text-stone-400 mt-0.5">Please wait a moment</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-16 text-center text-stone-400">
            <div className="w-14 h-14 rounded-2xl bg-stone-100 flex items-center justify-center text-stone-400 mx-auto mb-3">
              <Building2 className="w-7 h-7" />
            </div>
            <p className="text-sm font-black text-stone-800 font-serif">No Universities Found</p>
            <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto">
              No matching institutions found for your query. Try resetting filters or adding a new record.
            </p>
            {(searchQuery || stateFilter) && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setStateFilter('');
                }}
                className="mt-4 px-4 py-2 rounded-xl text-xs font-bold bg-stone-900 text-white hover:bg-stone-800 cursor-pointer transition-colors"
              >
                Clear all filters
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#faf8f4] border-b border-stone-200 text-stone-600 font-black uppercase tracking-wider text-[10.5px]">
                  <th className="py-4 px-3 w-10 text-center">
                    <input
                      type="checkbox"
                      onChange={handleSelectAll}
                      checked={selectedIds.length === paginated.length && paginated.length > 0}
                      className="rounded border-stone-300 text-amber-700 focus:ring-amber-500"
                    />
                  </th>
                  <th className="py-4 px-3 w-12 text-center">#</th>
                  <th className="py-4 px-4 min-w-[280px]">Institution Profile</th>
                  <th className="py-4 px-4 min-w-[150px]">Location</th>
                  <th className="py-4 px-4 min-w-[170px]">Rankings & Accreditations</th>
                  <th className="py-4 px-4 min-w-[120px]">Media</th>
                  <th className="py-4 px-4 text-center min-w-[130px]">Status</th>
                  <th className="py-4 px-4 text-center min-w-[150px]">Content Modules</th>
                  <th className="py-4 px-4 min-w-[130px]">Updated</th>
                  <th className="py-4 px-4 text-right min-w-[120px]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 font-medium text-stone-700">
                {paginated.map((item, index) => {
                  const srNo = (currentPage - 1) * itemsPerPage + index + 1;
                  const isDropdownOpen = openDropdownId === item.id;

                  return (
                    <tr key={item.id} className="hover:bg-[#fbfaf7] transition-colors group">
                      {/* Checkbox */}
                      <td className="py-4 px-3 text-center">
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(item.id)}
                          onChange={() => handleSelectOne(item.id)}
                          className="rounded border-stone-300 text-amber-700 focus:ring-amber-500 cursor-pointer"
                        />
                      </td>

                      {/* Sr. No */}
                      <td className="py-4 px-3 text-center">
                        <span className="text-[11px] font-bold text-stone-400 font-mono">
                          {srNo}
                        </span>
                      </td>

                      {/* Institution Profile */}
                      <td className="py-4 px-4">
                        <div className="flex items-start gap-3">
                          {/* Logo or Initial Seal */}
                          <div className="w-10 h-10 rounded-xl bg-stone-100 border border-stone-200/80 flex items-center justify-center shrink-0 overflow-hidden shadow-2xs">
                            {item.logo_path ? (
                              <img
                                src={getStorageUrl(item.logo_path)}
                                alt={item.name}
                                className="w-full h-full object-contain p-0.5"
                                onError={(e) => {
                                  (e.target as HTMLElement).style.display = 'none';
                                }}
                              />
                            ) : (
                              <span className="font-serif font-black text-sm text-stone-500">
                                {item.name?.charAt(0) || 'U'}
                              </span>
                            )}
                          </div>

                          <div className="space-y-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-[10px] font-mono font-bold text-stone-400 bg-stone-100 px-1.5 py-0.5 rounded">
                                ID #{item.id}
                              </span>
                              {item.institute_type_name && (
                                <span className="text-[10px] font-bold text-amber-900 bg-amber-50 border border-amber-200/60 px-2 py-0.5 rounded-md">
                                  {item.institute_type_name}
                                </span>
                              )}
                            </div>

                            <div className="font-extrabold text-stone-900 text-xs sm:text-sm leading-snug hover:text-amber-800 transition-colors">
                              {item.name}
                            </div>

                            <div className="flex items-center gap-3 text-[11px] text-stone-500">
                              {item.established_year && (
                                <span>
                                  Est. <strong className="text-stone-700">{item.established_year}</strong>
                                </span>
                              )}
                              {item.email && (
                                <span className="truncate max-w-[160px]" title={item.email}>
                                  {item.email}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Location */}
                      <td className="py-4 px-4 space-y-1">
                        <div className="font-bold text-stone-900 text-xs">
                          {item.city || '—'}
                        </div>
                        <div className="text-[11px] font-medium text-stone-500">
                          {item.state || '—'}
                        </div>
                        {(item.city || item.state) && (
                          <a
                            href={`https://maps.google.com/?q=${encodeURIComponent(
                              (item.name || '') + ' ' + (item.city || '') + ' ' + (item.state || '')
                            )}`}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-[10.5px] font-bold text-amber-800 hover:text-amber-950 pt-0.5"
                          >
                            <MapPin className="w-3 h-3 text-amber-700" />
                            <span>Map View</span>
                          </a>
                        )}
                      </td>

                      {/* Rankings */}
                      <td className="py-4 px-4 space-y-1.5 text-[11px]">
                        {item.qs_rank && item.qs_rank !== '0' ? (
                          <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50 border border-amber-200 text-amber-900 font-black text-[11px]">
                            <Award className="w-3 h-3 text-amber-700" />
                            <span>QS MYS: #{item.qs_rank}</span>
                          </div>
                        ) : null}

                        {item.rank && item.rank !== '0' && (
                          <div className="text-[11px] text-stone-600">
                            <span className="font-bold text-stone-400">QS World:</span>{' '}
                            <span className="font-bold text-stone-800">#{item.rank}</span>
                          </div>
                        )}

                        {item.times_rank && (
                          <div className="text-[11px] text-stone-600">
                            <span className="font-bold text-stone-400">Times:</span>{' '}
                            <span className="font-bold text-stone-800">{item.times_rank}</span>
                          </div>
                        )}

                        {!item.qs_rank && !item.rank && !item.times_rank && (
                          <span className="text-stone-400 text-[11px] italic">Unranked</span>
                        )}
                      </td>

                      {/* Media Links */}
                      <td className="py-4 px-4 space-y-1 text-[11px]">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-stone-400">Logo:</span>
                          {item.logo_path ? (
                            <button
                              onClick={() => setPreviewImage({ title: `${item.name} Logo`, url: item.logo_path! })}
                              className="text-amber-800 font-bold hover:underline cursor-pointer inline-flex items-center gap-0.5"
                            >
                              <span>View</span>
                              <ExternalLink className="w-2.5 h-2.5" />
                            </button>
                          ) : (
                            <span className="text-stone-400">—</span>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-stone-400">Banner:</span>
                          {item.banner_path ? (
                            <button
                              onClick={() => setPreviewImage({ title: `${item.name} Banner`, url: item.banner_path! })}
                              className="text-amber-800 font-bold hover:underline cursor-pointer inline-flex items-center gap-0.5"
                            >
                              <span>View</span>
                              <ExternalLink className="w-2.5 h-2.5" />
                            </button>
                          ) : (
                            <span className="text-stone-400">—</span>
                          )}
                        </div>
                      </td>

                      {/* Status Badges */}
                      <td className="py-4 px-4 text-center space-y-1.5">
                        <div>
                          {item.status !== 0 ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold text-[10px]">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                              Active
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-stone-100 text-stone-500 border border-stone-200 font-bold text-[10px]">
                              Inactive
                            </span>
                          )}
                        </div>

                        {item.featured === 1 && (
                          <div>
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50 text-amber-900 border border-amber-200/80 font-extrabold text-[9.5px]">
                              <Star className="w-2.5 h-2.5 fill-amber-500 text-amber-500" />
                              Featured
                            </span>
                          </div>
                        )}
                      </td>

                      {/* Content Sub Modules */}
                      <td className="py-4 px-4 text-center space-y-1.5">
                        <div>
                          <button
                            onClick={() => navigate(`/programs?university_id=${item.id}`)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold text-[10.5px] transition-colors cursor-pointer border border-stone-200/80"
                            title="View linked programs"
                          >
                            <GraduationCap className="w-3 h-3 text-indigo-700" />
                            <span>{item.programs_count || 0} Programs</span>
                          </button>
                        </div>
                        <div>
                          <button
                            onClick={() => navigate(`/university-overviews?university_id=${item.id}`)}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-stone-50 hover:bg-stone-100 text-stone-600 font-semibold text-[10px] transition-colors cursor-pointer border border-stone-200/60"
                          >
                            <Layers className="w-2.5 h-2.5 text-stone-500" />
                            <span>{item.overviews_count || 0} Overview</span>
                          </button>
                        </div>
                      </td>

                      {/* Timestamp */}
                      <td className="py-4 px-4 text-[11px] text-stone-500 space-y-0.5">
                        <div className="font-semibold text-stone-700">{formatDate(item.updated_at || item.created_at)}</div>
                        <div className="text-[10px] text-stone-400">Last updated</div>
                      </td>

                      {/* Actions Cluster */}
                      <td className="py-4 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                          {/* Sub-modules dropdown */}
                          <div className="relative">
                            <button
                              type="button"
                              onClick={() => setOpenDropdownId(isDropdownOpen ? null : item.id)}
                              className="p-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 transition-colors cursor-pointer border border-stone-200"
                              title="More modules & links"
                            >
                              <MoreVertical className="w-4 h-4" />
                            </button>

                            {isDropdownOpen && (
                              <div className="absolute right-0 top-9 z-50 w-48 bg-white border border-stone-200 rounded-2xl shadow-xl p-1.5 text-left space-y-1 text-xs animate-in fade-in-50 duration-150">
                                <button
                                  onClick={() => {
                                    setOpenDropdownId(null);
                                    navigate(`/university-overviews?university_id=${item.id}`);
                                  }}
                                  className="w-full flex items-center justify-between px-3 py-2 rounded-xl hover:bg-stone-50 font-bold text-stone-700 cursor-pointer"
                                >
                                  <span className="flex items-center gap-2">
                                    <Layers className="w-3.5 h-3.5 text-stone-500" />
                                    <span>Overviews</span>
                                  </span>
                                  <span className="px-1.5 py-0.5 rounded-md bg-stone-100 text-stone-700 text-[10px] font-bold">
                                    {item.overviews_count || 0}
                                  </span>
                                </button>

                                <button
                                  onClick={() => {
                                    setOpenDropdownId(null);
                                    navigate(`/programs?university_id=${item.id}`);
                                  }}
                                  className="w-full flex items-center justify-between px-3 py-2 rounded-xl hover:bg-stone-50 font-bold text-stone-700 cursor-pointer"
                                >
                                  <span className="flex items-center gap-2">
                                    <GraduationCap className="w-3.5 h-3.5 text-indigo-600" />
                                    <span>Programs</span>
                                  </span>
                                  <span className="px-1.5 py-0.5 rounded-md bg-stone-100 text-stone-700 text-[10px] font-bold">
                                    {item.programs_count || 0}
                                  </span>
                                </button>

                                <button
                                  onClick={() => {
                                    setOpenDropdownId(null);
                                    navigate(`/university-gallery?university_id=${item.id}`);
                                  }}
                                  className="w-full flex items-center justify-between px-3 py-2 rounded-xl hover:bg-stone-50 font-bold text-stone-700 cursor-pointer"
                                >
                                  <span className="flex items-center gap-2">
                                    <ImageIcon className="w-3.5 h-3.5 text-amber-600" />
                                    <span>Photo Gallery</span>
                                  </span>
                                  <span className="px-1.5 py-0.5 rounded-md bg-stone-100 text-stone-700 text-[10px] font-bold">
                                    {item.photos_count || 0}
                                  </span>
                                </button>

                                <button
                                  onClick={() => {
                                    setOpenDropdownId(null);
                                    navigate(`/university-gallery?university_id=${item.id}`);
                                  }}
                                  className="w-full flex items-center justify-between px-3 py-2 rounded-xl hover:bg-stone-50 font-bold text-stone-700 cursor-pointer"
                                >
                                  <span className="flex items-center gap-2">
                                    <VideoIcon className="w-3.5 h-3.5 text-rose-600" />
                                    <span>Video Gallery</span>
                                  </span>
                                  <span className="px-1.5 py-0.5 rounded-md bg-stone-100 text-stone-700 text-[10px] font-bold">
                                    {item.videos_count || 0}
                                  </span>
                                </button>

                                <button
                                  onClick={() => {
                                    setOpenDropdownId(null);
                                    navigate(`/university-facilities?university_id=${item.id}`);
                                  }}
                                  className="w-full flex items-center justify-between px-3 py-2 rounded-xl hover:bg-stone-50 font-bold text-stone-700 cursor-pointer"
                                >
                                  <span className="flex items-center gap-2">
                                    <Building2 className="w-3.5 h-3.5 text-emerald-600" />
                                    <span>Facilities</span>
                                  </span>
                                  <span className="px-1.5 py-0.5 rounded-md bg-stone-100 text-stone-700 text-[10px] font-bold">
                                    {item.facilities_count || 0}
                                  </span>
                                </button>
                              </div>
                            )}
                          </div>

                          {/* Edit Button */}
                          <button
                            onClick={() => navigate(`/university/edit/${item.id}`)}
                            className="p-1.5 rounded-lg bg-stone-900 hover:bg-stone-800 text-white transition-colors cursor-pointer"
                            title="Edit University"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>

                          {/* Delete Button */}
                          <button
                            onClick={() => handleDelete(item.id, item.name)}
                            className="p-1.5 rounded-lg bg-stone-100 hover:bg-rose-50 text-stone-500 hover:text-rose-600 border border-stone-200 transition-colors cursor-pointer"
                            title="Delete University"
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
          </div>
        )}

        {/* Pagination Footer */}
        {filtered.length > itemsPerPage && (
          <div className="border-t border-stone-100 bg-[#faf8f4]/60">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={filtered.length}
              itemsPerPage={itemsPerPage}
              onPageChange={setCurrentPage}
            />
          </div>
        )}
      </div>

      {/* ── SEO PREVIEW MODAL ── */}
      {previewSeo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/50 backdrop-blur-xs">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-stone-200 overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="px-6 py-4.5 border-b border-stone-100 flex items-center justify-between bg-[#faf8f4]">
              <h3 className="font-serif font-black text-stone-900 text-sm">
                SEO Metadata — {previewSeo.name}
              </h3>
              <button
                onClick={() => setPreviewSeo(null)}
                className="text-stone-400 hover:text-stone-700 p-1.5 rounded-lg cursor-pointer transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4 text-xs">
              <div>
                <span className="font-bold text-stone-600 block mb-1">Meta Title:</span>
                <div className="bg-stone-50 p-3 rounded-xl border border-stone-200 text-stone-900 font-semibold leading-relaxed">
                  {previewSeo.meta_title || 'N/A'}
                </div>
              </div>
              <div>
                <span className="font-bold text-stone-600 block mb-1">Meta Keywords:</span>
                <div className="bg-stone-50 p-3 rounded-xl border border-stone-200 text-stone-700 font-mono text-[11px]">
                  {previewSeo.meta_keyword || 'N/A'}
                </div>
              </div>
              <div>
                <span className="font-bold text-stone-600 block mb-1">Meta Description:</span>
                <div className="bg-stone-50 p-3 rounded-xl border border-stone-200 text-stone-700 font-medium leading-relaxed">
                  {previewSeo.meta_description || 'N/A'}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── IMAGE PREVIEW MODAL ── */}
      {previewImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/50 backdrop-blur-xs">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-stone-200 overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="px-6 py-4.5 border-b border-stone-100 flex items-center justify-between bg-[#faf8f4]">
              <h3 className="font-serif font-black text-stone-900 text-sm">{previewImage.title} Preview</h3>
              <button
                onClick={() => setPreviewImage(null)}
                className="text-stone-400 hover:text-stone-700 p-1.5 rounded-lg cursor-pointer transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 flex flex-col items-center justify-center bg-[#faf8f4]/50 min-h-[220px]">
              <img
                src={getStorageUrl(previewImage.url)}
                alt={previewImage.title}
                className="max-h-80 w-auto rounded-2xl shadow-md border border-stone-200 object-contain bg-white p-2"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                  const parent = (e.target as HTMLElement).parentElement;
                  if (parent && !parent.querySelector('.img-error-msg')) {
                    const msg = document.createElement('div');
                    msg.className = 'img-error-msg text-xs text-rose-500 font-medium py-4 text-center';
                    msg.innerText = 'Unable to load image from storage.';
                    parent.appendChild(msg);
                  }
                }}
              />
              <a
                href={getStorageUrl(previewImage.url)}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-mono text-amber-800 hover:text-amber-950 hover:underline mt-4 break-all flex items-center gap-1 font-semibold"
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
