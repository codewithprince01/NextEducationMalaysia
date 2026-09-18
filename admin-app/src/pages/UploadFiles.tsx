import React, { useEffect, useState, useRef } from 'react';
import { confirmDelete } from '@/lib/swal';
import Pagination from '@/components/common/Pagination';
import { getStorageUrl } from '@/lib/uploadHelper';
import {
  UploadCloud,
  Search,
  Trash2,
  Loader2,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Copy,
  ExternalLink,
  Download,
  File,
  Plus
} from 'lucide-react';

interface UploadFileItem {
  id: number;
  title: string;
  file_name?: string;
  file_path: string;
  created_at?: string;
}

export default function UploadFiles() {
  const [items, setItems] = useState<UploadFileItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  // Form State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [titleInput, setTitleInput] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/v1/admin/upload-files');
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

  const handleCopy = (path: string) => {
    const fullUrl = window.location.origin + (path.startsWith('/') ? path : `/${path}`);
    navigator.clipboard.writeText(fullUrl);
    showToast('success', `Copied URL to clipboard: ${fullUrl}`);
  };

  const handleDelete = async (id: number) => {
    const isConfirmed = await confirmDelete('Are you sure you want to delete this uploaded file?');
    if (!isConfirmed) return;

    try {
      const res = await fetch(`/api/v1/admin/upload-files/${id}`, { method: 'DELETE' });
      const json = await res.json();

      if (res.ok && (json.status || json.success)) {
        showToast('success', 'Record deleted successfully');
        fetchData();
      } else {
        showToast('error', json.message || json.error || 'Failed to delete file');
      }
    } catch {
      showToast('error', 'Error deleting record');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!titleInput.trim()) {
      showToast('error', 'Please enter a title');
      return;
    }

    if (!selectedFile) {
      showToast('error', 'Please select a file to upload');
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('title', titleInput.trim());
      formData.append('file', selectedFile);

      const res = await fetch('/api/v1/admin/upload-files', {
        method: 'POST',
        body: formData,
      });

      const json = await res.json();
      if (res.ok && (json.status || json.success)) {
        showToast('success', 'Record has been added successfully');
        setTitleInput('');
        setSelectedFile(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        setIsFormOpen(false);
        fetchData();
      } else {
        showToast('error', json.message || json.error || 'Upload failed');
      }
    } catch {
      showToast('error', 'Network error while uploading');
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '-';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      });
    } catch {
      return dateStr;
    }
  };

  const filtered = items.filter((item) =>
    (item.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (item.file_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (item.file_path || '').toLowerCase().includes(searchQuery.toLowerCase())
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-2xl border border-slate-100 shadow-2xs">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
            <span className="p-2 rounded-xl bg-[#effaf2] text-[#14532d] border border-[#c8ebd2]/60 shadow-2xs">
              <UploadCloud className="w-5 h-5 text-emerald-700" />
            </span>
            Upload Files
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Upload images, PDFs, and assets to generate direct accessible media URLs.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchData}
            className="p-2 text-slate-600 hover:text-[#14532d] hover:bg-[#effaf2] rounded-xl border border-slate-200 hover:border-[#c8ebd2] transition-colors cursor-pointer"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => setIsFormOpen(!isFormOpen)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#14532d] hover:bg-[#0f3e21] text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 text-emerald-300" /> {isFormOpen ? 'Close Form' : 'Upload New File'}
          </button>
        </div>
      </div>

      {/* Upload Form Card */}
      {isFormOpen && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-2xs p-5 animate-fadeIn">
          <h2 className="text-xs font-bold text-[#14532d] uppercase tracking-wider border-b border-slate-100 pb-3 mb-4 flex items-center gap-2">
            <Plus className="w-4 h-4 text-emerald-700" /> Upload Media / File
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
                  Enter Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Brochure PDF 2026"
                  value={titleInput}
                  onChange={(e) => setTitleInput(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-1 focus:ring-emerald-500 focus:border-emerald-600 focus:bg-white transition-all font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
                  Upload Image / File <span className="text-rose-500">*</span>
                </label>
                <input
                  type="file"
                  ref={fileInputRef}
                  required
                  accept="image/*,.pdf,.doc,.docx,.webp"
                  onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                  className="w-full text-xs text-slate-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-[#effaf2] file:text-[#14532d] hover:file:bg-[#dcfce7] border border-slate-200 rounded-xl cursor-pointer bg-slate-50"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex items-center gap-2 px-5 py-2 bg-[#14532d] hover:bg-[#0f3e21] text-white rounded-xl text-xs font-bold shadow-xs transition-colors disabled:opacity-50 cursor-pointer"
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin text-emerald-300" /> : <Plus className="w-4 h-4 text-emerald-300" />}
                Upload
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Table Card */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-2xs overflow-hidden">
        {/* Controls */}
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row gap-4 justify-between items-center">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search title or file path..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-1 focus:ring-emerald-500 focus:border-emerald-600 transition-all"
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
                <th className="py-3.5 px-4">Title</th>
                <th className="py-3.5 px-4">Date</th>
                <th className="py-3.5 px-4">File</th>
                <th className="py-3.5 px-4">Url</th>
                <th className="py-3.5 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-emerald-600" />
                    Loading uploaded files...
                  </td>
                </tr>
              ) : paginated.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400 font-medium">
                    No data found.
                  </td>
                </tr>
              ) : (
                paginated.map((item, index) => {
                  const storagePath = getStorageUrl(item.file_path);
                  const fullUrl = window.location.origin + storagePath;
                  const srNo = (currentPage - 1) * itemsPerPage + index + 1;

                  return (
                    <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4 text-center font-bold text-emerald-700">{srNo}</td>
                      <td className="py-3.5 px-4 font-bold text-slate-800 flex items-center gap-2">
                        <File className="w-4 h-4 text-emerald-700" />
                        {item.title}
                      </td>
                      <td className="py-3.5 px-4 text-xs text-slate-500 font-medium">{formatDate(item.created_at)}</td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <a
                            href={storagePath}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#effaf2] hover:bg-[#dcfce7] text-[#14532d] rounded-lg text-xs font-bold border border-[#c8ebd2]/60 transition-colors"
                          >
                            <ExternalLink className="w-3 h-3 text-emerald-700" /> View
                          </a>
                          <a
                            href={storagePath}
                            download
                            className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold border border-slate-200 transition-colors"
                          >
                            <Download className="w-3 h-3" /> Download
                          </a>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-xs text-slate-500">
                        <div className="flex items-center gap-2 max-w-sm">
                          <input
                            type="text"
                            readOnly
                            id={`url${item.id}`}
                            value={fullUrl}
                            className="w-full px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs truncate font-mono text-slate-700"
                          />
                          <button
                            onClick={() => handleCopy(item.file_path)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#effaf2] hover:bg-[#dcfce7] text-[#14532d] rounded-lg text-xs font-bold border border-[#c8ebd2]/60 transition-colors whitespace-nowrap cursor-pointer shadow-2xs"
                            title="Copy to clipboard"
                          >
                            <Copy className="w-3 h-3 text-emerald-700" /> Copy
                          </button>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="p-1.5 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200/60 shadow-2xs transition-colors cursor-pointer"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
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
          <div className="p-4 border-t border-slate-100 bg-slate-50/50">
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
