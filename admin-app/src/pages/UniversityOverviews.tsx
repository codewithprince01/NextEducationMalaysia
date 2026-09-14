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
  Search
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

  // Form Section Visibility
  const [isFormOpen, setIsFormOpen] = useState(true);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // View Description Modal
  const [viewingDescription, setViewingDescription] = useState<{ title: string; html: string } | null>(null);

  // Form State
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
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
      const res = await fetch('/api/v1/admin/universities');
      const json = await res.json();
      if (res.ok && (json.status || json.success)) {
        setUniversities(json.data || []);
      }
    } catch {
      console.error('Failed to fetch universities list');
    }
  };

  const fetchOverviews = async (targetUnivId?: string) => {
    const univId = targetUnivId !== undefined ? targetUnivId : selectedUnivId;
    if (!univId) {
      setOverviews([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/v1/admin/university-overviews?university_id=${univId}`);
      const json = await res.json();
      if (res.ok && json.success) {
        const data: UniversityOverviewItem[] = json.data || [];
        setOverviews(data);
        setFormData((prev) => ({
          ...prev,
          university_id: univId,
          position: (data.length + 1).toString(),
        }));
      } else {
        showToast('error', json.error || 'Failed to fetch overviews');
      }
    } catch {
      showToast('error', 'Network error while fetching overviews');
    } finally {
      setLoading(false);
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
    fetchOverviews(val);
  };

  const handleResetForm = () => {
    setEditingId(null);
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
    setFormData({
      university_id: item.university_id.toString(),
      title: item.title || item.tab || '',
      description: item.description || '',
      position: (item.position || 1).toString(),
      thumbnail_path: item.thumbnail_path || '',
    });
    setIsFormOpen(true);
    window.scrollTo({ top: 200, behavior: 'smooth' });
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
        }),
      });
      const json = await res.json();

      if (res.ok && json.success) {
        showToast('success', editingId ? 'Updated successfully' : 'Created successfully');
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
    const confirmed = await confirmDelete(item.title || item.tab || 'Overview Record');
    if (!confirmed) return;

    try {
      const res = await fetch(`/api/v1/admin/university-overviews/${item.id}`, {
        method: 'DELETE',
      });
      const json = await res.json();
      if (res.ok && json.success) {
        showToast('success', 'Overview deleted successfully');
        fetchOverviews(selectedUnivId);
      } else {
        showToast('error', json.error || 'Failed to delete overview');
      }
    } catch {
      showToast('error', 'Error deleting overview');
    }
  };

  const formatDateString = (dateStr?: string) => {
    if (!dateStr) return 'Created at : N/A';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return `Created at : ${dateStr}`;
      const timeStr = d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const year = d.getFullYear();
      return `${timeStr} - ${day}-${month}-${year}`;
    } catch {
      return `Created at : ${dateStr}`;
    }
  };

  const selectedUniv = universities.find((u) => u.id.toString() === selectedUnivId);

  const filtered = overviews.filter((item) =>
    (item.title || item.tab || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const paginated = filtered.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="space-y-2 max-w-[1600px] mx-auto text-slate-700">
      {/* Toast Alert */}
      {toast && (
        <div
          className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-xl flex items-center gap-3 text-sm font-medium text-white transition-all ${
            toast.type === 'success' ? 'bg-emerald-600' : 'bg-rose-600'
          }`}
        >
          {toast.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Unified Header, University Dropdown & Navigation Bar */}
      <div className="bg-white p-3 sm:p-3.5 rounded-xl border border-slate-200 shadow-xs space-y-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Building2 className="w-4.5 h-4.5 text-indigo-600 shrink-0" />
            <h1 className="text-base font-bold text-slate-800 tracking-tight">
              University Overview{' '}
              <span className="text-rose-600 font-extrabold">
                ({selectedUniv ? selectedUniv.name : 'Select a University'})
              </span>
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-xs font-bold text-slate-700 shrink-0">
              Select University:
            </label>
            <select
              value={selectedUnivId}
              onChange={handleUniversityChange}
              className="w-full sm:w-80 px-3 py-1.5 rounded-lg border border-slate-200 text-slate-800 text-xs font-bold bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
            >
              <option value="">-- Select a University --</option>
              {universities.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {selectedUnivId && (
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              onClick={() => navigate(`/university-overviews?university_id=${selectedUnivId}`)}
              className="px-3 py-1 rounded-md bg-indigo-600 text-white text-xs font-bold shadow-xs"
            >
              Overview
            </button>
            <button
              onClick={() => navigate(`/programs?university_id=${selectedUnivId}`)}
              className="px-3 py-1 rounded-md border border-indigo-600 text-indigo-600 hover:bg-indigo-50 text-xs font-semibold transition-colors"
            >
              Courses
            </button>
            <button
              onClick={() => navigate(`/university-gallery?university_id=${selectedUnivId}`)}
              className="px-3 py-1 rounded-md border border-indigo-600 text-indigo-600 hover:bg-indigo-50 text-xs font-semibold transition-colors"
            >
              Gallery
            </button>
            <button
              onClick={() => navigate(`/university-gallery?university_id=${selectedUnivId}`)}
              className="px-3 py-1 rounded-md border border-indigo-600 text-indigo-600 hover:bg-indigo-50 text-xs font-semibold transition-colors"
            >
              Videos
            </button>
            <button
              onClick={() => navigate(`/university-facilities?university_id=${selectedUnivId}`)}
              className="px-3 py-1 rounded-md border border-indigo-600 text-indigo-600 hover:bg-indigo-50 text-xs font-semibold transition-colors"
            >
              Facilities
            </button>
            <button
              onClick={() => navigate(`/university-reviews?university_id=${selectedUnivId}`)}
              className="px-3 py-1 rounded-md border border-indigo-600 text-indigo-600 hover:bg-indigo-50 text-xs font-semibold transition-colors"
            >
              Rankings
            </button>
          </div>
        )}
      </div>

      {!selectedUnivId ? (
        <div className="bg-white p-16 rounded-xl border border-slate-200 text-center flex flex-col items-center justify-center text-slate-400">
          <Building2 className="w-12 h-12 mb-3 text-slate-300 animate-bounce" />
          <h3 className="text-base font-bold text-slate-700">No University Selected</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-md">
            Please select a university from the dropdown list above to manage its overview tabs.
          </p>
        </div>
      ) : (
        <>
          {/* Card 1: Add New Record / Edit Record Form */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div
              className="flex items-center justify-between p-4 bg-slate-50/80 border-b border-slate-200 cursor-pointer select-none"
              onClick={() => setIsFormOpen(!isFormOpen)}
            >
              <h2 className="text-sm font-bold text-slate-800">
                {editingId ? 'Edit Record' : 'Add New Record'}
              </h2>
              <button
                type="button"
                className="p-1 rounded bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
              >
                {isFormOpen ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              </button>
            </div>

            {isFormOpen && (
              <form onSubmit={handleSubmit} className="p-5 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
                  <div className="sm:col-span-6">
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Title
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Title"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full px-3.5 py-2 text-sm bg-white border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div className="sm:col-span-4">
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Thumbnail
                    </label>
                    <input
                      type="file"
                      disabled
                      className="w-full text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-slate-100 file:text-slate-700 border border-slate-300 rounded-md bg-slate-50 cursor-not-allowed"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Position
                    </label>
                    <input
                      type="number"
                      value={formData.position}
                      onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                      className="w-full px-3.5 py-2 text-sm bg-white border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Description
                  </label>
                  <RichTextEditor
                    value={formData.description}
                    onChange={(val) => setFormData({ ...formData, description: val })}
                    placeholder="Enter description content..."
                  />
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <button
                    type="button"
                    onClick={handleResetForm}
                    className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold rounded-md shadow-xs transition-colors"
                  >
                    Reset
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex items-center gap-1.5 px-5 py-2 bg-indigo-700 hover:bg-indigo-800 text-white text-xs font-semibold rounded-md shadow-xs transition-colors disabled:opacity-50"
                  >
                    {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    <span>{editingId ? 'Update' : 'Submit'}</span>
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Card 2: University Overview List Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 bg-slate-50/80 border-b border-slate-200">
              <h2 className="text-sm font-bold text-slate-800">University Overview List</h2>
            </div>

            {/* Controls */}
            <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row gap-4 justify-between items-center text-xs text-slate-600">
              <div className="flex items-center gap-2">
                <span>Show</span>
                <span className="font-semibold text-slate-800 px-2 py-1 bg-slate-100 border border-slate-200 rounded">10</span>
                <span>entries</span>
              </div>
              <div className="relative w-full sm:w-64">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase text-[11px] tracking-wider">
                  <tr>
                    <th className="py-3 px-4 w-16">Sr. No.</th>
                    <th className="py-3 px-4 w-20">Position</th>
                    <th className="py-3 px-4">Title</th>
                    <th className="py-3 px-4 w-28">Description</th>
                    <th className="py-3 px-4 w-24">Thumbnail</th>
                    <th className="py-3 px-4 w-64">Date</th>
                    <th className="py-3 px-4 w-24 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loading ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-400">
                        <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-indigo-600" />
                        Loading overviews...
                      </td>
                    </tr>
                  ) : paginated.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-400">
                        No overview entries found.
                      </td>
                    </tr>
                  ) : (
                    paginated.map((item, index) => {
                      const srNo = (currentPage - 1) * itemsPerPage + index + 1;
                      return (
                        <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3.5 px-4 font-medium text-slate-500">{srNo}</td>
                          <td className="py-3.5 px-4 font-medium text-slate-700">{item.position}</td>
                          <td className="py-3.5 px-4 font-medium text-slate-800">
                            {item.title || item.tab}
                          </td>
                          <td className="py-3.5 px-4">
                            <button
                              onClick={() =>
                                setViewingDescription({
                                  title: item.title || item.tab || 'Overview Description',
                                  html: item.description || '<p>No content provided.</p>',
                                })
                              }
                              className="inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold text-sky-600 border border-sky-500 hover:bg-sky-50 rounded transition-colors"
                            >
                              <Eye className="w-3 h-3" /> View
                            </button>
                          </td>
                          <td className="py-3.5 px-4 text-slate-400 font-semibold">N/A</td>
                          <td className="py-3.5 px-4 text-[11px] text-slate-500 space-y-0.5">
                            <div>Created at : {formatDateString(item.created_at)}</div>
                            <div>Updated at : {formatDateString(item.updated_at || item.created_at)}</div>
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => handleEditClick(item)}
                                className="p-1.5 bg-rose-500 hover:bg-rose-600 text-white rounded text-xs transition-colors"
                                title="Edit"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDelete(item)}
                                className="p-1.5 bg-sky-500 hover:bg-sky-600 text-white rounded text-xs transition-colors"
                                title="Delete"
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
              <div className="p-4 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-slate-500">
                <div>
                  Showing {(currentPage - 1) * itemsPerPage + 1} to{' '}
                  {Math.min(currentPage * itemsPerPage, filtered.length)} of {filtered.length} entries
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

      {/* Description Preview Modal */}
      {viewingDescription && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-xl border border-slate-200 w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between p-4 bg-slate-50 border-b border-slate-200">
              <h3 className="text-sm font-bold text-slate-800">{viewingDescription.title}</h3>
              <button
                onClick={() => setViewingDescription(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div
              className="p-6 overflow-y-auto prose prose-slate max-w-none text-xs leading-relaxed"
              dangerouslySetInnerHTML={{ __html: viewingDescription.html }}
            />
            <div className="p-3 bg-slate-50 border-t border-slate-200 text-right">
              <button
                onClick={() => setViewingDescription(null)}
                className="px-4 py-1.5 bg-slate-700 hover:bg-slate-800 text-white text-xs font-semibold rounded transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
