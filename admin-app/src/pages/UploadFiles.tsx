import React, { useEffect, useState } from 'react';
import { confirmDelete } from '@/lib/swal';
import Pagination from '@/components/common/Pagination';
import {
  UploadCloud,
  Search,
  Trash2,
  Loader2,
  X,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Copy,
  ExternalLink,
  Download,
  File
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

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    file_path: '',
  });

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

  const handleOpenAdd = () => {
    setFormData({
      title: '',
      file_path: '',
    });
    setIsModalOpen(true);
  };

  const handleCopy = (url: string) => {
    navigator.clipboard.writeText(url);
    showToast('success', 'URL copied to clipboard');
  };

  const handleDelete = async (id: number) => {
    const isConfirmed = await confirmDelete('Are you sure you want to delete this uploaded file?');
    if (!isConfirmed) return;

    try {
      const res = await fetch(`/api/v1/admin/upload-files/${id}`, { method: 'DELETE' });
      const json = await res.json();

      if (res.ok && (json.status || json.success)) {
        showToast('success', 'File deleted successfully');
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
    if (!formData.title.trim()) {
      showToast('error', 'Title is required');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/v1/admin/upload-files', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const json = await res.json();
      if (res.ok && (json.status || json.success)) {
        showToast('success', 'File uploaded successfully');
        setIsModalOpen(false);
        fetchData();
      } else {
        showToast('error', json.message || json.error || 'Upload failed');
      }
    } catch {
      showToast('error', 'Network error');
    } finally {
      setSubmitting(false);
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
    <div className="space-y-3 max-w-[1600px] mx-auto">
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-slate-200/80 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
            <UploadCloud className="w-6 h-6 text-indigo-600" /> Upload Files
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage media documents, PDFs, and assets uploaded for public CDN access.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchData}
            className="p-2.5 text-slate-600 hover:text-indigo-600 hover:bg-slate-50 rounded-lg border border-slate-200 transition-colors"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium shadow-sm transition-colors"
          >
            <UploadCloud className="w-4 h-4" /> Upload File
          </button>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row gap-4 justify-between items-center">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search title or file path..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
          />
        </div>
        <div className="text-xs text-slate-500">
          Showing <span className="font-semibold text-slate-700">{filtered.length}</span> entries
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold text-xs uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4 w-16">ID</th>
                <th className="py-3.5 px-4">Title</th>
                <th className="py-3.5 px-4">Date</th>
                <th className="py-3.5 px-4">File Link</th>
                <th className="py-3.5 px-4">URL Copy</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-indigo-600" />
                    Loading uploaded files...
                  </td>
                </tr>
              ) : paginated.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    No files found.
                  </td>
                </tr>
              ) : (
                paginated.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-medium text-slate-400">#{item.id}</td>
                    <td className="py-3.5 px-4 font-semibold text-slate-800 flex items-center gap-2">
                      <File className="w-4 h-4 text-indigo-500" />
                      {item.title}
                    </td>
                    <td className="py-3.5 px-4 text-xs text-slate-500">{item.created_at || '-'}</td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <a
                          href={item.file_path}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 px-2.5 py-1 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded text-xs font-semibold transition-colors"
                        >
                          <ExternalLink className="w-3 h-3" /> View
                        </a>
                        <a
                          href={item.file_path}
                          download
                          className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 text-slate-600 hover:bg-slate-200 rounded text-xs font-semibold transition-colors"
                        >
                          <Download className="w-3 h-3" /> Download
                        </a>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-xs text-slate-500">
                      <div className="flex items-center gap-2 max-w-xs">
                        <input
                          type="text"
                          readOnly
                          value={item.file_path}
                          className="w-full px-2 py-1 bg-slate-50 border border-slate-200 rounded text-xs truncate"
                        />
                        <button
                          onClick={() => handleCopy(item.file_path)}
                          className="p-1.5 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors"
                          title="Copy URL"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
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

      {/* Upload Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-100 w-full max-w-md overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50/50">
              <h3 className="text-base font-semibold text-slate-800">Upload New File</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1.5">
                  File Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Brochure 2026 PDF"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1.5">
                  File URL / Path
                </label>
                <input
                  type="text"
                  placeholder="/uploads/files/brochure.pdf"
                  value={formData.file_path}
                  onChange={(e) => setFormData({ ...formData, file_path: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all font-mono"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium shadow-sm transition-colors disabled:opacity-50"
                >
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  Save File
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
