import React, { useEffect, useState, useRef } from 'react';
import { confirmDelete } from '@/lib/swal';
import Pagination from '@/components/common/Pagination';
import { getStorageUrl } from '@/lib/uploadHelper';
import {
  Layout,
  Search,
  Edit2,
  Trash2,
  Loader2,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Plus,
  Image as ImageIcon,
  HelpCircle,
  Building2,
  RotateCcw,
  X
} from 'lucide-react';

interface LandingPageItem {
  id: number;
  page_name: string;
  page_slug: string;
  date_and_address?: string;
  date_and_address_image?: string;
  banners_count?: number;
  universities_count?: number;
  faqs_count?: number;
  created_at?: string;
}

export default function LandingPages() {
  const [items, setItems] = useState<LandingPageItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Form state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    page_name: '',
    page_slug: '',
    date_and_address: '',
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/v1/admin/landing-pages');
      if (res.ok) {
        const json = await res.json();
        if (json.status || json.success) {
          setItems(json.data || []);
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
      page_name: '',
      page_slug: '',
      date_and_address: '',
    });
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    setIsFormOpen(true);
  };

  const handleResetForm = () => {
    setEditingId(null);
    setFormData({
      page_name: '',
      page_slug: '',
      date_and_address: '',
    });
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    setIsFormOpen(false);
  };

  const handleOpenEdit = (item: LandingPageItem) => {
    setEditingId(item.id);
    setFormData({
      page_name: item.page_name || '',
      page_slug: item.page_slug || '',
      date_and_address: item.date_and_address || '',
    });
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    setIsFormOpen(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id: number) => {
    const isConfirmed = await confirmDelete('Are you sure you want to delete this landing page?');
    if (!isConfirmed) return;

    try {
      const res = await fetch(`/api/v1/admin/landing-pages/${id}`, { method: 'DELETE' });
      const json = await res.json();

      if (res.ok && (json.status || json.success)) {
        showToast('success', 'Record deleted successfully');
        if (editingId === id) handleResetForm();
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
    if (!formData.page_name.trim()) {
      showToast('error', 'Enter Page Name is required');
      return;
    }

    setSubmitting(true);
    try {
      const url = editingId
        ? `/api/v1/admin/landing-pages/${editingId}`
        : '/api/v1/admin/landing-pages';
      const method = editingId ? 'PUT' : 'POST';

      const payload = new FormData();
      payload.append('page_name', formData.page_name.trim());
      payload.append('page_slug', formData.page_slug.trim());
      payload.append('date_and_address', formData.date_and_address.trim());
      if (selectedFile) {
        payload.append('date_and_address_image', selectedFile);
      }

      const res = await fetch(url, {
        method,
        body: payload,
      });

      const json = await res.json();
      if (res.ok && (json.status || json.success)) {
        showToast('success', json.message || (editingId ? 'Record has been updated successfully.' : 'Record has been added successfully.'));
        handleResetForm();
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

  const filtered = items.filter((item) =>
    (item.page_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (item.page_slug || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (item.date_and_address || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const paginated = filtered.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="space-y-4 max-w-[1600px] mx-auto">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed top-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-lg shadow-xl text-white text-sm font-medium transition-all duration-300 ${toast.type === 'success' ? 'bg-emerald-600' : 'bg-rose-600'
            }`}
        >
          {toast.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
            <Layout className="w-5 h-5 text-emerald-800" /> Landing Pages
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage custom event landing pages, microsites, banners, participating universities, and FAQs.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchData}
            className="p-2 text-slate-600 hover:text-emerald-800 hover:bg-[#effaf2] rounded-xl border border-slate-200 transition-colors cursor-pointer"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => {
              if (isFormOpen && !editingId) {
                setIsFormOpen(false);
              } else {
                handleOpenAdd();
              }
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-[#14532d] hover:bg-[#0f3e21] text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
          >
            {isFormOpen && !editingId ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4 text-emerald-300" />}
            <span>{isFormOpen && !editingId ? 'Close Form' : 'Add Landing Page'}</span>
          </button>
        </div>
      </div>

      {/* Form Card */}
      {isFormOpen && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden animate-fadeIn">
          <div className="flex items-center justify-between px-6 py-4 border-b border-[#c8ebd2] bg-[#effaf2]">
            <h2 className="text-sm font-bold text-[#14532d] flex items-center gap-2">
              {editingId ? <Edit2 className="w-4 h-4 text-emerald-700" /> : <Plus className="w-4 h-4 text-emerald-700" />}
              <span>{editingId ? 'Update Landing Page Record' : 'Add New Landing Page Record'}</span>
            </h2>
            <button
              onClick={() => setIsFormOpen(false)}
              className="p-1 text-slate-400 hover:text-slate-600 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1.5">
                  Enter Page Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Enter Page Name"
                  value={formData.page_name}
                  onChange={(e) => setFormData({ ...formData, page_name: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs bg-slate-50/70 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-1 focus:ring-emerald-500 focus:border-emerald-600 focus:bg-white transition-all"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1.5">
                  Enter Page Slug
                </label>
                <input
                  type="text"
                  placeholder="Enter Page Slug"
                  value={formData.page_slug}
                  onChange={(e) => setFormData({ ...formData, page_slug: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs bg-slate-50/70 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-1 focus:ring-emerald-500 focus:border-emerald-600 focus:bg-white transition-all font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-3">
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1.5">
                  Enter Date and Address
                </label>
                <input
                  type="text"
                  placeholder="Enter Date and Address"
                  value={formData.date_and_address}
                  onChange={(e) => setFormData({ ...formData, date_and_address: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs bg-slate-50/70 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-1 focus:ring-emerald-500 focus:border-emerald-600 focus:bg-white transition-all"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1.5">
                  Upload Date and Address Image
                </label>
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                  className="w-full text-xs text-slate-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-[#effaf2] file:text-[#14532d] hover:file:bg-[#dcfce7] cursor-pointer border border-slate-200 rounded-xl bg-slate-50/70"
                />
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              {!editingId ? (
                <button
                  type="button"
                  onClick={handleResetForm}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Reset
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleResetForm}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" /> Cancel
                </button>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center gap-1.5 px-5 py-2 bg-[#14532d] hover:bg-[#0f3e21] text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer disabled:opacity-50"
              >
                {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                <span>{editingId ? 'Update Record' : 'Submit'}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Table Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        {/* Controls */}
        <div className="p-3.5 border-b border-slate-100 flex flex-col sm:flex-row gap-4 justify-between items-center bg-slate-50/50">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search page name, slug or address..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:ring-1 focus:ring-emerald-500 focus:border-emerald-600 transition-all"
            />
          </div>
          <div className="text-xs text-slate-500">
            Showing <span className="font-bold text-slate-700">{filtered.length}</span> entries
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-[#effaf2] border-b-2 border-[#c8ebd2] text-[#14532d] font-extrabold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3.5 px-4 w-16 text-center text-emerald-700">Sr. No.</th>
                <th className="py-3.5 px-4">Page Name</th>
                <th className="py-3.5 px-4">Date And Address</th>
                <th className="py-3.5 px-4">Image</th>
                <th className="py-3.5 px-4">Content</th>
                <th className="py-3.5 px-4 text-right w-28">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-emerald-700" />
                    Loading landing pages...
                  </td>
                </tr>
              ) : paginated.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400 font-medium">
                    No data found
                  </td>
                </tr>
              ) : (
                paginated.map((item, index) => {
                  const srNo = (currentPage - 1) * itemsPerPage + index + 1;
                  return (
                    <tr key={item.id} className="hover:bg-[#f6fcf8] transition-colors">
                      <td className="py-3.5 px-4 text-center font-bold text-emerald-700">{srNo}</td>
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-800">{item.page_name}</div>
                        {item.page_slug && (
                          <div className="text-xs font-mono text-emerald-700 mt-0.5">/{item.page_slug}</div>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-xs text-slate-700 max-w-xs">{item.date_and_address || '-'}</td>
                      <td className="py-3.5 px-4">
                        {item.date_and_address_image ? (
                          <a
                            href={getStorageUrl(item.date_and_address_image)}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-block hover:opacity-80 transition-opacity"
                          >
                            <img
                              src={getStorageUrl(item.date_and_address_image)}
                              alt={item.page_name}
                              className="w-8 h-8 object-cover rounded-md border border-[#c8ebd2] shadow-2xs"
                            />
                          </a>
                        ) : (
                          <span className="text-slate-400 text-xs">-</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex flex-col gap-1 items-start">
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-[#effaf2] text-[#14532d] text-[11px] font-bold border border-[#c8ebd2]">
                            <ImageIcon className="w-3 h-3 text-emerald-700" /> Banners ({item.banners_count ?? 0})
                          </span>
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-[#effaf2] text-[#14532d] text-[11px] font-bold border border-[#c8ebd2]">
                            <Building2 className="w-3 h-3 text-emerald-700" /> Universities ({item.universities_count ?? 0})
                          </span>
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-[#effaf2] text-[#14532d] text-[11px] font-bold border border-[#c8ebd2]">
                            <HelpCircle className="w-3 h-3 text-emerald-700" /> Faqs ({item.faqs_count ?? 0})
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenEdit(item)}
                            className="p-1.5 rounded-lg bg-[#effaf2] text-[#14532d] hover:bg-[#dcfce7] border border-[#c8ebd2]/60 shadow-2xs transition-colors cursor-pointer"
                            title="Edit"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="p-1.5 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200/60 shadow-2xs transition-colors cursor-pointer"
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

        {/* Pagination */}
        {!loading && filtered.length > 0 && (
          <div className="p-4 border-t border-slate-100">
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
    </div>
  );
}
