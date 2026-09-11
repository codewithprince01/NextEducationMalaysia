import { useEffect, useState } from 'react';
import { confirmDelete } from '@/lib/swal';
import Pagination from '@/components/common/Pagination';
import {
  MessageSquare,
  Search,
  Trash2,
  Loader2,
  X,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Eye,
  Star,
  User,
  Building2,
  Mail,
  Phone
} from 'lucide-react';

interface ReviewItem {
  id: number;
  university_id?: number;
  university_name?: string;
  name: string;
  email?: string;
  mobile?: string;
  program?: string;
  passing_year?: string;
  review_title?: string;
  description?: string;
  rating?: number;
  status: number;
  created_at?: string;
}

export default function UniversityReviews() {
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [previewReview, setPreviewReview] = useState<ReviewItem | null>(null);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Pagination State (20 per page)
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const url = statusFilter !== 'all'
        ? `/api/v1/admin/university-reviews?status=${statusFilter}`
        : '/api/v1/admin/university-reviews';
      const res = await fetch(url);
      const json = await res.json();
      if (res.ok && json.status) {
        setReviews(json.data || []);
      } else {
        showToast('error', json.message || 'Failed to fetch reviews');
      }
    } catch {
      showToast('error', 'Network error while fetching data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [statusFilter]);

  const handleToggleStatus = async (item: ReviewItem) => {
    const newStatus = item.status === 1 ? 0 : 1;
    try {
      const res = await fetch(`/api/v1/admin/university-reviews/${item.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      const json = await res.json();
      if (res.ok && json.status) {
        showToast('success', `Review marked as ${newStatus === 1 ? 'Active' : 'Inactive'}`);
        fetchData();
      } else {
        showToast('error', json.message || 'Failed to update status');
      }
    } catch {
      showToast('error', 'Network error while updating status');
    }
  };

  const handleDelete = async (id: number, reviewer: string) => {
    const isConfirmed = await confirmDelete(
      'Delete University Review?',
      `Are you sure you want to delete review by "${reviewer}"?`
    );
    if (!isConfirmed) return;

    try {
      const res = await fetch(`/api/v1/admin/university-reviews/${id}`, { method: 'DELETE' });
      const json = await res.json();
      if (res.ok && json.status) {
        showToast('success', 'Review deleted successfully');
        fetchData();
      } else {
        showToast('error', json.message || 'Failed to delete review');
      }
    } catch {
      showToast('error', 'Network error while deleting review');
    }
  };

  // Filter & Pagination
  const filtered = reviews.filter(
    (item) =>
      item.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.university_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.program?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.review_title?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter]);

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
            <MessageSquare className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-extrabold text-indigo-600 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-full uppercase tracking-wider">
                Student Feedback
              </span>
            </div>
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight mt-0.5">University Reviews List</h1>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Manage student ratings, overall experiences, and review status approvals.
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
        </div>
      </div>

      {/* Search & Status Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search reviewer, university, program..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-100 transition-all"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-bold">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                statusFilter === 'all' ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setStatusFilter('1')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                statusFilter === '1' ? 'bg-white text-emerald-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Active
            </button>
            <button
              onClick={() => setStatusFilter('0')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                statusFilter === '0' ? 'bg-white text-rose-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Inactive
            </button>
          </div>

          <div className="text-xs font-semibold text-slate-500 hidden sm:block">
            Total Reviews: <span className="text-slate-900 font-bold">{filtered.length}</span>
          </div>
        </div>
      </div>

      {/* Main Data Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 flex flex-col items-center justify-center text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mb-3" />
            <p className="text-xs font-semibold">Loading university reviews...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <MessageSquare className="w-12 h-12 mx-auto mb-3 text-slate-300" />
            <p className="text-sm font-bold text-slate-700">No Reviews Found</p>
            <p className="text-xs text-slate-400 mt-1">Try changing search filter or check again later.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200/80 text-slate-500 font-extrabold uppercase tracking-wider text-[10.5px]">
                  <th className="py-3.5 px-4 w-14 text-center">Sr. No.</th>
                  <th className="py-3.5 px-4 w-14 text-center">ID</th>
                  <th className="py-3.5 px-5">University & Program</th>
                  <th className="py-3.5 px-5">Reviewer Info</th>
                  <th className="py-3.5 px-4 text-center">Rating & Content</th>
                  <th className="py-3.5 px-4 text-center">Status</th>
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

                      {/* University & Program */}
                      <td className="py-4 px-5">
                        <div className="flex items-center gap-1.5 font-bold text-slate-900 text-xs">
                          <Building2 className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                          <span>{item.university_name || 'N/A'}</span>
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          Prog: <span className="font-semibold text-slate-700">{item.program || 'N/A'}</span>
                          {item.passing_year && <span className="text-slate-400 font-mono ml-1.5">({item.passing_year})</span>}
                        </div>
                      </td>

                      {/* Reviewer Info */}
                      <td className="py-4 px-5">
                        <div className="flex items-center gap-1.5 font-bold text-slate-800 text-xs">
                          <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>{item.name}</span>
                        </div>
                        <div className="space-y-0.5 text-[11px] text-slate-500 mt-0.5">
                          {item.email && (
                            <div className="flex items-center gap-1">
                              <Mail className="w-3 h-3 text-slate-400" />
                              <span>{item.email}</span>
                            </div>
                          )}
                          {item.mobile && (
                            <div className="flex items-center gap-1 font-mono text-slate-500">
                              <Phone className="w-3 h-3 text-slate-400" />
                              <span>{item.mobile}</span>
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Rating & Content */}
                      <td className="py-4 px-4 text-center">
                        <div className="space-y-1 inline-flex flex-col items-center">
                          <div className="flex items-center gap-0.5 text-amber-500">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-3.5 h-3.5 ${
                                  i < (item.rating || 5) ? 'fill-amber-400 text-amber-400' : 'text-slate-200'
                                }`}
                              />
                            ))}
                          </div>
                          {item.review_title ? (
                            <button
                              onClick={() => setPreviewReview(item)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-sky-200 bg-sky-50 text-sky-700 text-[10.5px] font-bold hover:bg-sky-100 transition-colors cursor-pointer"
                            >
                              <Eye className="w-3 h-3" />
                              <span>View Review</span>
                            </button>
                          ) : (
                            <span className="text-slate-400 italic text-[11px]">No Title</span>
                          )}
                        </div>
                      </td>

                      {/* Status Column */}
                      <td className="py-4 px-4 text-center">
                        <button
                          onClick={() => handleToggleStatus(item)}
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10.5px] font-extrabold cursor-pointer transition-all ${
                            item.status === 1
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                              : 'bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100'
                          }`}
                          title="Click to toggle active status"
                        >
                          {item.status === 1 ? 'Active' : 'Inactive'}
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-5 text-right">
                        <button
                          onClick={() => handleDelete(item.id, item.name)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                          title="Delete Review"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
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

      {/* Review Content Modal */}
      {previewReview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-100 overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h3 className="font-extrabold text-slate-900 text-sm">Overall Review Details</h3>
              <button
                onClick={() => setPreviewReview(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div>
                <span className="font-bold text-slate-500 block mb-1">Review Title:</span>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 font-bold text-slate-900 text-sm">
                  {previewReview.review_title || 'N/A'}
                </div>
              </div>

              <div>
                <span className="font-bold text-slate-500 block mb-1">Review Description:</span>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-slate-700 font-medium leading-relaxed whitespace-pre-line">
                  {previewReview.description || 'No detailed description provided.'}
                </div>
              </div>

              <div className="flex items-center justify-between bg-slate-50 p-3 rounded-xl border border-slate-200">
                <span className="font-bold text-slate-600">Overall Rating:</span>
                <div className="flex items-center gap-1 text-amber-500 font-extrabold text-sm">
                  <Star className="w-4 h-4 fill-amber-400" />
                  <span>{previewReview.rating || 5} / 5 Stars</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
