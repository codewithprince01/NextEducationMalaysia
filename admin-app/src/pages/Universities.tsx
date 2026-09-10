import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { confirmDelete } from '@/lib/swal';
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
  Eye,
  Download,
  Upload,
  ExternalLink,
  MapPin,
  Award
} from 'lucide-react';

interface UniversityItem {
  id: number;
  name: string;
  uname: string;
  city?: string;
  state?: string;
  rank?: string;
  qs_rank?: string;
  times_rank?: string;
  institute_type?: number;
  institute_type_name?: string;
  established_year?: string;
  shortnote?: string;
  overview?: string;
  logo_path?: string;
  banner_path?: string;
  og_image_path?: string;
  meta_title?: string;
  meta_description?: string;
  meta_keyword?: string;
  status: number;
  created_at?: string;
}

export default function Universities() {
  const navigate = useNavigate();
  const [universities, setUniversities] = useState<UniversityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [stateFilter, setStateFilter] = useState('');
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

  const fetchData = async () => {
    setLoading(true);
    try {
      const univRes = await fetch('/api/v1/admin/universities');
      const univJson = await univRes.json();

      if (univRes.ok && univJson.status) {
        setUniversities(univJson.data || []);
      } else {
        showToast('error', univJson.message || 'Failed to fetch universities');
      }
    } catch {
      showToast('error', 'Network error while fetching data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDownloadFormat = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      'name,city,state,rank,shortnote\n' +
      '"Universiti Malaya (UM)","Kuala Lumpur","Wilayah Persekutuan","1","Leading public research university in Malaysia."\n' +
      '"Taylor\'s University","Subang Jaya","Selangor","5","Premier private university in Malaysia."';
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'university_import_format.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImport = async () => {
    if (!importFile) {
      showToast('error', 'Please choose an Excel or CSV file first');
      return;
    }
    setImporting(true);
    try {
      const fd = new FormData();
      fd.append('file', importFile);

      const res = await fetch('/api/v1/admin/universities/import', {
        method: 'POST',
        body: fd,
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

  const handleDelete = async (id: number, name: string) => {
    const isConfirmed = await confirmDelete(
      'Delete University?',
      `Are you sure you want to delete "${name}"?`
    );
    if (!isConfirmed) return;

    try {
      const res = await fetch(`/api/v1/admin/universities/${id}`, { method: 'DELETE' });
      const json = await res.json();
      if (res.ok && json.status) {
        showToast('success', 'University deleted successfully');
        fetchData();
      } else {
        showToast('error', json.message || 'Failed to delete university');
      }
    } catch {
      showToast('error', 'Network error while deleting university');
    }
  };

  // Unique States list for filter
  const stateOptions = Array.from(new Set(universities.map((u) => u.state).filter(Boolean)));

  // Filter & Pagination
  const filtered = universities.filter((item) => {
    const matchesSearch =
      item.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.uname?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.city?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.state?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesState = stateFilter ? item.state === stateFilter : true;
    return matchesSearch && matchesState;
  });

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, stateFilter]);

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginated = filtered.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="space-y-6">
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
          <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-extrabold text-indigo-600 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-full uppercase tracking-wider">
                Universities Directory
              </span>
            </div>
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight mt-0.5">Universities List</h1>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Manage Malaysian public and private university profiles, rankings, and SEO metadata.
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
            onClick={() => navigate('/university/add')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add University</span>
          </button>
        </div>
      </div>

      {/* Select Excel File Import Box */}
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

      {/* Search & State Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search university, city, state..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-100 transition-all"
            />
          </div>

          <select
            value={stateFilter}
            onChange={(e) => setStateFilter(e.target.value)}
            className="w-full sm:w-48 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 focus:outline-none focus:border-indigo-500"
          >
            <option value="">All States</option>
            {stateOptions.map((st) => (
              <option key={st} value={st}>{st}</option>
            ))}
          </select>
        </div>

        <div className="text-xs font-semibold text-slate-500">
          Total Universities: <span className="text-slate-900 font-bold">{filtered.length}</span>
        </div>
      </div>

      {/* Main Data Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 flex flex-col items-center justify-center text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mb-3" />
            <p className="text-xs font-semibold">Loading universities...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <Building2 className="w-12 h-12 mx-auto mb-3 text-slate-300" />
            <p className="text-sm font-bold text-slate-700">No Universities Found</p>
            <p className="text-xs text-slate-400 mt-1">Try searching another term or add a new university.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200/80 text-slate-500 font-extrabold uppercase tracking-wider text-[10.5px]">
                  <th className="py-3.5 px-4 w-14 text-center">Sr. No.</th>
                  <th className="py-3.5 px-4 w-14 text-center">ID</th>
                  <th className="py-3.5 px-5">University Name & Slug</th>
                  <th className="py-3.5 px-5">Location</th>
                  <th className="py-3.5 px-4 text-center">Type & Rank</th>
                  <th className="py-3.5 px-4 text-center">SEO</th>
                  <th className="py-3.5 px-5">Images</th>
                  <th className="py-3.5 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {paginated.map((item, index) => {
                  const srNo = (currentPage - 1) * itemsPerPage + index + 1;
                  return (
                    <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-4 px-4 text-center font-extrabold text-slate-700">{srNo}</td>
                      <td className="py-4 px-4 text-center font-bold text-slate-400">#{item.id}</td>

                      {/* Name & Slug */}
                      <td className="py-4 px-5 max-w-xs">
                        <div className="font-bold text-slate-900 text-xs leading-snug">{item.name}</div>
                        <div className="text-[11px] font-mono text-slate-400 mt-0.5 truncate">{item.uname}</div>
                      </td>

                      {/* Location */}
                      <td className="py-4 px-5">
                        <div className="flex items-center gap-1 text-slate-800 font-semibold">
                          <MapPin className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                          <span>{item.city || 'N/A'}</span>
                        </div>
                        <div className="text-[11px] text-slate-400 font-medium mt-0.5">{item.state || 'N/A'}</div>
                      </td>

                      {/* Type & Rank */}
                      <td className="py-4 px-4 text-center">
                        <div className="space-y-1 inline-flex flex-col items-center text-[11px]">
                          <span className="bg-indigo-50 text-indigo-700 border border-indigo-100 px-2 py-0.5 rounded-md font-bold">
                            {item.institute_type_name || 'General'}
                          </span>
                          {item.rank && (
                            <div className="flex items-center gap-1 text-slate-500 font-bold">
                              <Award className="w-3 h-3 text-amber-500" />
                              <span>Rank #{item.rank}</span>
                            </div>
                          )}
                        </div>
                      </td>

                      {/* SEO Column */}
                      <td className="py-4 px-4 text-center">
                        <button
                          onClick={() => setPreviewSeo(item)}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-sky-200 bg-sky-50 text-sky-700 text-[11px] font-bold hover:bg-sky-100 transition-colors cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View</span>
                        </button>
                      </td>

                      {/* Images Column */}
                      <td className="py-4 px-5">
                        <div className="space-y-1 text-[11px]">
                          <div className="flex items-center gap-1.5">
                            <span className="text-slate-400 font-semibold">Logo:</span>
                            {item.logo_path ? (
                              <button
                                onClick={() => setPreviewImage({ title: 'Logo', url: item.logo_path! })}
                                className="text-indigo-600 font-bold hover:underline cursor-pointer flex items-center gap-1"
                              >
                                View <ExternalLink className="w-2.5 h-2.5" />
                              </button>
                            ) : (
                              <span className="text-slate-400">N/A</span>
                            )}
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-slate-400 font-semibold">Banner:</span>
                            {item.banner_path ? (
                              <button
                                onClick={() => setPreviewImage({ title: 'Banner', url: item.banner_path! })}
                                className="text-indigo-600 font-bold hover:underline cursor-pointer flex items-center gap-1"
                              >
                                View <ExternalLink className="w-2.5 h-2.5" />
                              </button>
                            ) : (
                              <span className="text-slate-400">N/A</span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Actions Column */}
                      <td className="py-4 px-5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => navigate(`/university/edit/${item.id}`)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors cursor-pointer"
                            title="Edit University"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(item.id, item.name)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
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
          <div className="p-4 border-t border-slate-100 flex items-center justify-between">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        )}
      </div>

      {/* SEO Preview Modal */}
      {previewSeo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-100 overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h3 className="font-extrabold text-slate-900 text-sm">SEO Details — {previewSeo.name}</h3>
              <button onClick={() => setPreviewSeo(null)} className="text-slate-400 hover:text-slate-600 p-1 rounded-lg cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-3.5 text-xs">
              <div>
                <span className="font-bold text-slate-700 block mb-1">Meta Title:</span>
                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-slate-800 font-semibold">
                  {previewSeo.meta_title || 'N/A'}
                </div>
              </div>
              <div>
                <span className="font-bold text-slate-700 block mb-1">Meta Keywords:</span>
                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-slate-700 font-mono text-[11px]">
                  {previewSeo.meta_keyword || 'N/A'}
                </div>
              </div>
              <div>
                <span className="font-bold text-slate-700 block mb-1">Meta Description:</span>
                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-slate-700 font-medium leading-relaxed">
                  {previewSeo.meta_description || 'N/A'}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Image Preview Modal */}
      {previewImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-100 overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h3 className="font-extrabold text-slate-900 text-sm">{previewImage.title}</h3>
              <button onClick={() => setPreviewImage(null)} className="text-slate-400 hover:text-slate-600 p-1 rounded-lg cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 flex flex-col items-center">
              <img
                src={`/${previewImage.url}`}
                alt={previewImage.title}
                className="max-h-80 w-auto rounded-xl shadow-md border border-slate-200 object-contain"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
              <span className="text-xs font-mono text-slate-500 mt-3">{previewImage.url}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
