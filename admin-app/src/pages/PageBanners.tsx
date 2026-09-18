import React, { useEffect, useState, useRef } from 'react';
import { confirmDelete } from '@/lib/swal';
import Pagination from '@/components/common/Pagination';
import { getStorageUrl } from '@/lib/uploadHelper';
import {
  Image as ImageIcon,
  Search,
  Edit2,
  Trash2,
  Loader2,
  X,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Plus,
  RotateCcw,
  Eye
} from 'lucide-react';

interface PageBannerItem {
  id: number;
  website?: string;
  page: string;
  alt_text: string;
  title?: string;
  description?: string;
  banner_name?: string;
  banner_path?: string;
  created_at?: string;
}

export default function PageBanners() {
  const [items, setItems] = useState<PageBannerItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Form toggle state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  // View Modals for Title & Description
  const [titleModal, setTitleModal] = useState<string | null>(null);
  const [descModal, setDescModal] = useState<string | null>(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Form State
  const [formData, setFormData] = useState({
    page: 'home',
    alt_text: '',
    title: '',
    description: '',
  });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [existingBanner, setExistingBanner] = useState<string>('');

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/v1/admin/page-banners');
      if (res.ok) {
        const json = await res.json();
        if (json.status || json.success) {
          const rawItems: PageBannerItem[] = json.data || [];
          // Strict filter to only include website = 'MYS'
          setItems(rawItems.filter((item) => !item.website || item.website === 'MYS'));
        } else {
          setItems([]);
        }
      } else {
        setItems([]);
      }
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenAdd = () => {
    setEditingId(null);
    setFormData({
      page: 'home',
      alt_text: '',
      title: '',
      description: '',
    });
    setExistingBanner('');
    if (fileInputRef.current) fileInputRef.current.value = '';
    setIsFormOpen(true);
  };

  const handleOpenEdit = (item: PageBannerItem) => {
    setEditingId(item.id);
    setFormData({
      page: item.page || 'home',
      alt_text: item.alt_text || '',
      title: item.title || '',
      description: item.description || '',
    });
    setExistingBanner(item.banner_path || '');
    if (fileInputRef.current) fileInputRef.current.value = '';
    setIsFormOpen(true);
  };

  const handleReset = () => {
    setFormData({
      page: 'home',
      alt_text: '',
      title: '',
      description: '',
    });
    setExistingBanner('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDelete = async (id: number) => {
    const isConfirmed = await confirmDelete('Are you sure you want to delete this page banner?');
    if (!isConfirmed) return;

    try {
      const res = await fetch(`/api/v1/admin/page-banners/${id}`, { method: 'DELETE' });
      const json = await res.json();

      if (res.ok && (json.status || json.success)) {
        showToast('success', 'Banner deleted successfully');
        fetchData();
      } else {
        showToast('error', json.message || json.error || 'Failed to delete');
      }
    } catch {
      showToast('error', 'Error deleting record');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.alt_text.trim()) {
      showToast('error', 'Alt text is required');
      return;
    }

    setSubmitting(true);
    try {
      const payload = new FormData();
      payload.append('website', 'MYS');
      payload.append('page', formData.page);
      payload.append('alt_text', formData.alt_text);
      payload.append('title', formData.title);
      payload.append('description', formData.description);

      if (fileInputRef.current?.files?.[0]) {
        payload.append('banner', fileInputRef.current.files[0]);
      }

      const url = editingId
        ? `/api/v1/admin/page-banners/${editingId}`
        : '/api/v1/admin/page-banners';
      const method = editingId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        body: payload,
      });

      const json = await res.json();
      if (res.ok && (json.status || json.success)) {
        showToast('success', editingId ? 'Updated successfully' : 'Created successfully');
        setIsFormOpen(false);
        setEditingId(null);
        handleReset();
        fetchData();
      } else {
        showToast('error', json.message || json.error || 'Action failed');
      }
    } catch {
      showToast('error', 'Network error');
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = items.filter((item) => {
    const matchesWebsite = !item.website || item.website === 'MYS';
    const matchesQuery =
      (item.alt_text || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.page || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchesWebsite && matchesQuery;
  });

  const paginated = filtered.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="space-y-4 max-w-[1600px] mx-auto pb-10">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed top-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-lg shadow-xl text-white text-sm font-medium transition-all duration-300 ${
            toast.type === 'success' ? 'bg-emerald-600' : 'bg-rose-600'
          }`}
        >
          {toast.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* ── CLASSIC EDITORIAL HEADER ── */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-stone-200/90 shadow-xs relative overflow-hidden">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="space-y-1.5 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-900 text-[11px] font-bold tracking-wider uppercase">
                <ImageIcon className="w-3.5 h-3.5 text-amber-700" />
                <span>Visual Hero Assets</span>
              </span>
              <span className="text-[11px] font-bold text-amber-900 bg-amber-50 border border-amber-200/80 px-2.5 py-0.5 rounded-full">
                Website: MYS Region
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight font-serif">
              Page Banners & Hero Sliders
            </h1>
            <p className="text-xs sm:text-sm text-stone-500 font-medium leading-relaxed">
              Manage top promotional banners, hero headlines, alt tags, and graphic media across Malaysia (MYS) web pages.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              onClick={fetchData}
              className="p-2.5 rounded-xl border border-stone-200 text-stone-600 hover:bg-stone-50 hover:text-stone-900 transition-colors cursor-pointer"
              title="Refresh"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-amber-800' : ''}`} />
            </button>
            <button
              onClick={() => {
                if (isFormOpen && !editingId) {
                  setIsFormOpen(false);
                } else {
                  handleOpenAdd();
                }
              }}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs shadow-md shadow-stone-900/15 transition-all cursor-pointer whitespace-nowrap"
            >
              {isFormOpen ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              <span>{isFormOpen ? 'Close Editor' : 'Add New Banner'}</span>
            </button>
          </div>
        </div>

        {/* ── TOP STAT METRICS (4 CARDS) ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 mt-6 pt-6 border-t border-stone-100">
          <div className="p-3.5 rounded-2xl bg-[#faf8f4] border border-stone-200/80">
            <div className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">Total Banners</div>
            <div className="text-2xl font-black text-stone-900 tracking-tight mt-0.5">
              {items.length}
            </div>
            <div className="text-[10.5px] font-semibold text-stone-500 mt-1">Configured banners</div>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#faf8f4] border border-stone-200/80">
            <div className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">Active Pages</div>
            <div className="text-2xl font-black text-amber-900 tracking-tight mt-0.5">
              {Array.from(new Set(items.map((i) => i.page || 'home'))).length}
            </div>
            <div className="text-[10.5px] font-semibold text-amber-700 mt-1">Target portal routes</div>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#faf8f4] border border-stone-200/80">
            <div className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">Graphic Assets</div>
            <div className="text-2xl font-black text-emerald-800 tracking-tight mt-0.5">
              {items.filter((i) => Boolean(i.banner_path)).length}
            </div>
            <div className="text-[10.5px] font-semibold text-emerald-700 mt-1">Published hero images</div>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#faf8f4] border border-stone-200/80">
            <div className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">Target Scope</div>
            <div className="text-2xl font-black text-indigo-950 tracking-tight mt-0.5">
              MYS
            </div>
            <div className="text-[10.5px] font-semibold text-indigo-800 mt-1">Malaysia domain scope</div>
          </div>
        </div>
      </div>

      {/* ── COLLAPSIBLE BANNER FORM CARD ── */}
      {isFormOpen && (
        <div className="bg-white rounded-3xl border border-stone-200/90 shadow-xs overflow-hidden animate-fadeIn">
          <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200/80 bg-[#faf8f4]">
            <h2 className="text-xs font-bold text-stone-900 uppercase tracking-wider flex items-center gap-2 font-serif">
              {editingId ? <Edit2 className="w-4 h-4 text-amber-800" /> : <Plus className="w-4 h-4 text-amber-800" />}
              <span>{editingId ? 'Edit Hero Banner Record' : 'Create New Page Banner'}</span>
            </h2>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                  Alt Text <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Study in Malaysia Leading Universities Banner"
                  value={formData.alt_text}
                  onChange={(e) => setFormData({ ...formData, alt_text: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs bg-stone-50/70 border border-stone-200/90 rounded-xl focus:outline-none focus:border-amber-600 focus:bg-white transition-all font-medium text-stone-800"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                  Upload Banner Image
                </label>
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  className="w-full text-xs text-stone-600 file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-stone-200 file:text-stone-800 hover:file:bg-stone-300 cursor-pointer border border-stone-200 rounded-xl bg-stone-50/70 p-1"
                />
                {existingBanner && (
                  <div className="mt-2 flex items-center gap-2 p-1.5 bg-[#faf8f4] border border-stone-200 rounded-xl">
                    <img src={existingBanner} alt="Current Banner" className="h-8 w-14 object-cover rounded-lg border border-stone-200" />
                    <span className="text-[11px] text-stone-600 font-mono truncate">{existingBanner}</span>
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                Banner Headline Title
              </label>
              <input
                type="text"
                placeholder="e.g. Explore Top Universities in Malaysia"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3.5 py-2 text-xs bg-stone-50/70 border border-stone-200/90 rounded-xl focus:outline-none focus:border-amber-600 focus:bg-white transition-all font-medium text-stone-800"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                Banner Subtitle / Description
              </label>
              <textarea
                rows={3}
                placeholder="Brief promotional subtitle or narrative text displayed over banner..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3.5 py-2 text-xs bg-stone-50/70 border border-stone-200/90 rounded-xl focus:outline-none focus:border-amber-600 focus:bg-white transition-all resize-none font-medium text-stone-800"
              />
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-stone-100">
              <button
                type="button"
                onClick={handleReset}
                className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-stone-600 bg-stone-100 hover:bg-stone-200 rounded-xl transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Reset
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsFormOpen(false);
                  setEditingId(null);
                }}
                className="px-4 py-2 text-xs font-bold text-stone-600 border border-stone-200 hover:bg-stone-50 rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex items-center gap-2 px-5 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-bold shadow-md shadow-stone-900/15 transition-all disabled:opacity-50 cursor-pointer"
              >
                {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>{editingId ? 'Update Banner' : 'Submit Banner'}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ── TABLE SEARCH & TOOLBAR ── */}
      <div className="bg-white rounded-3xl border border-stone-200/90 shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-stone-200/90 flex flex-col sm:flex-row gap-4 justify-between items-center bg-[#faf8f4]">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              placeholder="Search alt text, title, or page..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-xs bg-white border border-stone-200/90 rounded-xl focus:outline-none focus:border-amber-600 transition-all font-medium text-stone-800 placeholder-stone-400"
            />
          </div>
          <div className="text-xs font-bold text-stone-500">
            Showing <span className="font-extrabold text-stone-900">{filtered.length}</span> page banners
          </div>
        </div>

        {/* ── DATA TABLE ── */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-stone-700">
            <thead>
              <tr className="bg-[#ece5d8] border-b-2 border-stone-300 text-stone-800 font-extrabold uppercase tracking-wider text-[11px]">
                <th className="py-3.5 px-4 w-16 text-center text-stone-600">Sr. No.</th>
                <th className="py-3.5 px-4 text-stone-900">Page Route</th>
                <th className="py-3.5 px-4 text-stone-900">Alt Text</th>
                <th className="py-3.5 px-4 text-stone-900">Banner Graphic</th>
                <th className="py-3.5 px-4 text-stone-900">Headline Title</th>
                <th className="py-3.5 px-4 text-stone-900">Description</th>
                <th className="py-3.5 px-4 text-right text-stone-900">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 font-medium text-stone-700">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-stone-400">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-amber-800" />
                    <span className="text-xs font-bold">Loading page banners...</span>
                  </td>
                </tr>
              ) : paginated.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-stone-400">
                    <ImageIcon className="w-10 h-10 mx-auto mb-2 text-stone-300" />
                    <p className="text-sm font-bold text-stone-700">No Banners Found</p>
                    <p className="text-xs text-stone-400 mt-1">Try adjusting search term or create a new banner.</p>
                  </td>
                </tr>
              ) : (
                paginated.map((item, index) => (
                  <tr key={item.id} className="hover:bg-[#fbfaf7] transition-colors group">
                    <td className="py-4 px-4 text-center font-extrabold text-stone-500">
                      {(currentPage - 1) * itemsPerPage + index + 1}
                    </td>
                    <td className="py-4 px-4 font-mono text-[11px] text-amber-900 uppercase font-bold">
                      <span className="px-2 py-0.5 rounded-md bg-stone-100 border border-stone-200">
                        {item.page || 'home'}
                      </span>
                    </td>
                    <td className="py-4 px-4 font-bold text-stone-900 group-hover:text-amber-800 transition-colors">{item.alt_text}</td>
                    <td className="py-4 px-4">
                      {item.banner_path ? (
                        <a
                          href={getStorageUrl(item.banner_path)}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-lg text-xs font-bold transition-colors border border-stone-200"
                        >
                          <Eye className="w-3.5 h-3.5 text-stone-500" /> View Image
                        </a>
                      ) : (
                        <span className="text-stone-400 text-xs italic">N/A</span>
                      )}
                    </td>
                    <td className="py-4 px-4">
                      {item.title ? (
                        <button
                          onClick={() => setTitleModal(item.title || '')}
                          className="px-2.5 py-1 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg text-xs font-bold transition-colors border border-stone-200 cursor-pointer"
                        >
                          View Title
                        </button>
                      ) : (
                        <span className="text-stone-400 text-xs italic">N/A</span>
                      )}
                    </td>
                    <td className="py-4 px-4">
                      {item.description ? (
                        <button
                          onClick={() => setDescModal(item.description || '')}
                          className="px-2.5 py-1 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg text-xs font-bold transition-colors border border-stone-200 cursor-pointer"
                        >
                          View Subtitle
                        </button>
                      ) : (
                        <span className="text-stone-400 text-xs italic">N/A</span>
                      )}
                    </td>
                    <td className="py-4 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenEdit(item)}
                          className="p-1.5 text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-colors cursor-pointer"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="p-4 border-t border-stone-200/80 bg-[#faf8f4]">
          <Pagination
            currentPage={currentPage}
            totalPages={Math.ceil(filtered.length / itemsPerPage)}
            totalItems={filtered.length}
            itemsPerPage={itemsPerPage}
            onPageChange={(p) => setCurrentPage(p)}
          />
        </div>
      </div>

      {/* Title View Modal */}
      {titleModal !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-100 w-full max-w-md overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-slate-50/50">
              <h3 className="text-sm font-bold text-slate-800">Banner Title</h3>
              <button
                onClick={() => setTitleModal(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-5 max-h-80 overflow-y-auto text-xs leading-relaxed text-slate-700 font-medium">
              {titleModal}
            </div>
            <div className="p-3 border-t border-slate-100 bg-slate-50/50 flex justify-end">
              <button
                onClick={() => setTitleModal(null)}
                className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded text-xs font-medium transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Description View Modal */}
      {descModal !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-100 w-full max-w-md overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-slate-50/50">
              <h3 className="text-sm font-bold text-slate-800">Banner Description</h3>
              <button
                onClick={() => setDescModal(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-5 max-h-80 overflow-y-auto text-xs leading-relaxed text-slate-600">
              {descModal}
            </div>
            <div className="p-3 border-t border-slate-100 bg-slate-50/50 flex justify-end">
              <button
                onClick={() => setDescModal(null)}
                className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded text-xs font-medium transition-colors"
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
