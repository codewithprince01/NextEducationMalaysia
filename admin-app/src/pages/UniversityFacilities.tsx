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

interface FacilityItem {
  id: number;
  u_id: number;
  facility?: string;
  title?: string;
  description?: string;
  university_name?: string;
}

interface UniversityItem {
  id: number;
  name: string;
}

export default function UniversityFacilities() {
  const { id } = useParams<{ id?: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const queryUnivId = searchParams.get('university_id') || id || '';

  const [facilities, setFacilities] = useState<FacilityItem[]>([]);
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

  const fetchFacilities = async (targetUnivId?: string) => {
    const univId = targetUnivId !== undefined ? targetUnivId : selectedUnivId;
    if (!univId) {
      setFacilities([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/v1/admin/university-facilities?university_id=${univId}`);
      const json = await res.json();
      if (res.ok && json.success) {
        setFacilities(json.data || []);
      } else {
        showToast('error', json.error || 'Failed to fetch facilities');
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
      fetchFacilities(queryUnivId);
    }
  }, [queryUnivId]);

  const handleUniversityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setSelectedUnivId(val);
    if (val) {
      navigate(`/university-facilities?university_id=${val}`);
    }
    fetchFacilities(val);
  };

  const handleResetForm = () => {
    setEditingId(null);
    setFormData({
      university_id: selectedUnivId,
      title: '',
      description: '',
    });
  };

  const handleEditClick = (item: FacilityItem) => {
    setEditingId(item.id);
    setFormData({
      university_id: item.u_id ? String(item.u_id) : selectedUnivId,
      title: item.title || item.facility || '',
      description: item.description || '',
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
        ? `/api/v1/admin/university-facilities/${editingId}`
        : '/api/v1/admin/university-facilities';
      const method = editingId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          university_id: selectedUnivId,
          facility: formData.title,
          title: formData.title,
          description: formData.description,
        }),
      });
      const json = await res.json();

      if (res.ok && json.success) {
        showToast('success', editingId ? 'Updated successfully' : 'Created successfully');
        handleResetForm();
        fetchFacilities(selectedUnivId);
      } else {
        showToast('error', json.error || 'Failed to save facility');
      }
    } catch {
      showToast('error', 'Error submitting facility data');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (item: FacilityItem) => {
    const confirmed = await confirmDelete(item.title || item.facility || 'Facility');
    if (!confirmed) return;

    try {
      const res = await fetch(`/api/v1/admin/university-facilities/${item.id}`, {
        method: 'DELETE',
      });
      const json = await res.json();
      if (res.ok && json.success) {
        showToast('success', 'Facility deleted successfully');
        fetchFacilities(selectedUnivId);
      } else {
        showToast('error', json.error || 'Failed to delete facility');
      }
    } catch {
      showToast('error', 'Error deleting facility');
    }
  };

  const selectedUniv = universities.find((u) => u.id.toString() === selectedUnivId);

  const filtered = facilities.filter((item) =>
    (item.title || item.facility || '').toLowerCase().includes(searchQuery.toLowerCase())
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

      {/* Unified Header, Dropdown & Navigation Bar */}
      <div className="bg-white p-3 sm:p-3.5 rounded-xl border border-slate-200 shadow-xs space-y-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Building2 className="w-4.5 h-4.5 text-indigo-600 shrink-0" />
            <h1 className="text-base font-bold text-slate-800 tracking-tight">
              University Facilities{' '}
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
              className="px-3 py-1 rounded-md border border-indigo-600 text-indigo-600 hover:bg-indigo-50 text-xs font-semibold transition-colors"
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
              className="px-3 py-1 rounded-md bg-indigo-600 text-white text-xs font-bold shadow-xs"
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
            Please select a university from the dropdown list above to manage its facilities.
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
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Enter Title
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Enter Title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm bg-white border border-emerald-500 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Enter Description
                  </label>
                  <RichTextEditor
                    value={formData.description}
                    onChange={(val) => setFormData({ ...formData, description: val })}
                    placeholder="Enter description..."
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

          {/* Card 2: Facilities List Data Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            {/* Table Header Controls */}
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
                  placeholder="Search title..."
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
                    <th className="py-3.5 px-4 w-16">Sr. No.</th>
                    <th className="py-3.5 px-4">Title</th>
                    <th className="py-3.5 px-4 w-32">Description</th>
                    <th className="py-3.5 px-4 w-24 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loading ? (
                    <tr>
                      <td colSpan={4} className="py-12 text-center text-slate-400">
                        <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-indigo-600" />
                        Loading facilities...
                      </td>
                    </tr>
                  ) : paginated.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-12 text-center text-slate-400">
                        No facility entries found.
                      </td>
                    </tr>
                  ) : (
                    paginated.map((item, index) => {
                      const srNo = (currentPage - 1) * itemsPerPage + index + 1;
                      return (
                        <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3.5 px-4 font-medium text-slate-500">{srNo}</td>
                          <td className="py-3.5 px-4 font-semibold text-slate-800">
                            {item.title || item.facility}
                          </td>
                          <td className="py-3.5 px-4">
                            <button
                              onClick={() =>
                                setViewingDescription({
                                  title: item.title || item.facility || 'Facility Description',
                                  html: item.description || '<p>No description provided.</p>',
                                })
                              }
                              className="inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold text-sky-600 border border-sky-500 hover:bg-sky-50 rounded transition-colors"
                            >
                              <Eye className="w-3 h-3" /> View
                            </button>
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
