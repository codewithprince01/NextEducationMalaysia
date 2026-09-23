import React, { useEffect, useState } from 'react';
import { confirmDelete } from '@/lib/swal';
import Pagination from '@/components/common/Pagination';
import { Link, useSearchParams } from 'react-router-dom';
import {
  FileText,
  Upload,
  Tags,
  Filter,
  RefreshCw,
  Search,
  ExternalLink,
  Copy,
  Check,
  Edit2,
  Trash2,
  Loader2,
  X,
  CheckCircle2,
  AlertCircle,
  FolderOpen,
  FileCode,
  Video,
  HardDrive,
  BookOpen,
  Lock,
  Users,
  CloudUpload,
  CloudCheck,
  Server,
  Zap,
  Eye,
  EyeOff,
  Building2,
} from 'lucide-react';

interface UniversityOption {
  id: number;
  name: string;
}

interface CategoryOption {
  id: number;
  name: string;
  icon?: string;
  slug?: string;
}

interface DocumentItem {
  id: number;
  university_id: number;
  category_id: number;
  title: string;
  description?: string;
  file_path: string;
  file_url: string;
  original_name: string;
  extension: string;
  file_size?: number;
  formatted_file_size?: string;
  mime_type?: string;
  storage_driver: string;
  visibility: 'admin_only' | 'counsellor' | 'counsellors_only' | 'agent' | 'agents_only' | 'all';
  downloads_count: number;
  uploaded_by?: number;
  status: number;
  created_at?: string;
  is_image: boolean;
  is_video: boolean;
  is_pdf: boolean;
  university_name?: string;
  category_name?: string;
  category_icon?: string;
  uploader_name?: string;
}

interface StatsData {
  totalDocs: number;
  brochuresCount: number;
  videosCount: number;
  totalSize: number;
  formattedTotalSize: string;
}

function cleanDocUrl(url: string | null | undefined): string {
  if (!url) return '';
  return url
    .replace(/\/uploads\/uploads\//g, '/uploads/')
    .replace(/\/storage\/storage\//g, '/storage/')
    .replace(/\/storage\/uploads\/uploads\//g, '/storage/uploads/');
}


export default function UniversityDocuments() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialUniId = searchParams.get('university_id') || '';

  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [stats, setStats] = useState<StatsData>({
    totalDocs: 0,
    brochuresCount: 0,
    videosCount: 0,
    totalSize: 0,
    formattedTotalSize: '0 KB',
  });

  const [universities, setUniversities] = useState<UniversityOption[]>([]);
  const [filterUniversities, setFilterUniversities] = useState<UniversityOption[]>([]);
  const [categories, setCategories] = useState<CategoryOption[]>([]);

  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [copiedId, setCopiedId] = useState<number | null>(null);

  // Filters state
  const [selectedUni, setSelectedUni] = useState(initialUniId);
  const [selectedCat, setSelectedCat] = useState('');
  const [selectedFileType, setSelectedFileType] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);

  // Upload Modal State
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadForm, setUploadForm] = useState({
    university_id: initialUniId,
    category_id: '',
    title: '',
    visibility: 'admin_only',
    description: '',
  });
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);

  // Edit Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [submittingEdit, setSubmittingEdit] = useState(false);
  const [editingDoc, setEditingDoc] = useState<DocumentItem | null>(null);
  const [editForm, setEditForm] = useState({
    university_id: '',
    category_id: '',
    title: '',
    visibility: 'admin_only',
    description: '',
    status: 1,
  });
  const [replacementFile, setReplacementFile] = useState<File | null>(null);

  // Manual FTP Sync state
  const [syncingDocId, setSyncingDocId] = useState<number | null>(null);
  const [syncingAll, setSyncingAll] = useState(false);

  // Storage Modal state
  const [storageModalOpen, setStorageModalOpen] = useState(false);
  const [loadingStorage, setLoadingStorage] = useState(false);
  const [savingStorage, setSavingStorage] = useState(false);
  const [testingStorage, setTestingStorage] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [showStoragePassword, setShowStoragePassword] = useState(false);
  const [storageConfig, setStorageConfig] = useState({
    sftp_host: '103.212.121.117',
    sftp_port: 21,
    sftp_username: 'ftpimages@images.britannicaoverseas.com',
    sftp_password: '',
    sftp_root: '/em/',
    remote_storage_cdn_url: 'https://www.images.britannicaoverseas.com/em',
  });

  const fetchStorageConfig = async () => {
    setLoadingStorage(true);
    try {
      const res = await fetch('/api/v1/admin/storage-settings');
      if (res.ok) {
        const json = await res.json();
        if (json.config) setStorageConfig(json.config);
      }
    } catch {
      // Keep fallback
    } finally {
      setLoadingStorage(false);
    }
  };

  const handleOpenStorageModal = () => {
    setTestResult(null);
    setStorageModalOpen(true);
    fetchStorageConfig();
  };

  const handleSaveStorage = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingStorage(true);
    try {
      const res = await fetch('/api/v1/admin/storage-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(storageConfig),
      });
      const json = await res.json();
      if (res.ok && (json.status || json.success)) {
        showToast('success', json.message || 'Storage settings saved successfully!');
        setStorageModalOpen(false);
      } else {
        showToast('error', json.message || 'Failed to save storage settings');
      }
    } catch {
      showToast('error', 'Network error while saving storage settings');
    } finally {
      setSavingStorage(false);
    }
  };

  const handleTestStorage = async () => {
    setTestingStorage(true);
    setTestResult(null);
    try {
      const res = await fetch('/api/v1/admin/storage-settings/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(storageConfig),
      });
      const json = await res.json();
      setTestResult({
        success: Boolean(res.ok && (json.status || json.success)),
        message: json.message || (res.ok ? 'Connection successful!' : 'Connection failed!'),
      });
    } catch {
      setTestResult({
        success: false,
        message: 'Network error while testing connection',
      });
    } finally {
      setTestingStorage(false);
    }
  };

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  const handleManualSync = async (docId: number) => {
    setSyncingDocId(docId);
    showToast('success', 'Initiating FTP sync...');
    try {
      const res = await fetch(`/api/v1/admin/university-documents/${docId}/sync`, {
        method: 'POST',
      });
      const json = await res.json();
      if (res.ok && json.success) {
        showToast('success', json.message || 'File uploaded to FTP successfully!');
        fetchDocuments(currentPage, false);
      } else {
        showToast('error', json.message || 'FTP sync failed');
      }
    } catch (err: any) {
      showToast('error', err.message || 'Failed to sync with FTP server');
    } finally {
      setSyncingDocId(null);
    }
  };

  const handleSyncAllPending = async () => {
    setSyncingAll(true);
    showToast('success', 'Syncing all pending files to FTP...');
    try {
      const res = await fetch('/api/v1/admin/university-documents/sync-all', {
        method: 'POST',
      });
      const json = await res.json();
      if (res.ok && json.success) {
        showToast('success', json.message);
        fetchDocuments(currentPage, false);
      } else {
        showToast('error', json.message || 'Sync failed');
      }
    } catch (err: any) {
      showToast('error', err.message || 'Failed to sync with FTP server');
    } finally {
      setSyncingAll(false);
    }
  };

  const pendingSyncCount = documents.filter(
    (d) => d.storage_driver === 'local' || d.storage_driver === 'pending_remote_ftp',
  ).length;

  const fetchDocuments = async (page = currentPage, showSpinner = true) => {
    if (showSpinner) setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedUni) params.append('university_id', selectedUni);
      if (selectedCat) params.append('category_id', selectedCat);
      if (selectedFileType) params.append('file_type', selectedFileType);
      if (searchQuery) params.append('search', searchQuery);
      params.append('page', String(page));
      params.append('limit', '15');

      const res = await fetch(`/api/v1/admin/university-documents?${params.toString()}`);
      const json = await res.json();

      if (res.ok && json.success) {
        setDocuments(json.data || []);
        if (json.pagination) {
          setTotalPages(json.pagination.totalPages || 1);
          setTotalRecords(json.pagination.total || 0);
        }
        if (json.stats) {
          setStats(json.stats);
        }
        if (json.universities) setUniversities(json.universities);
        if (json.filterUniversities) setFilterUniversities(json.filterUniversities);
        if (json.categories) setCategories(json.categories);
      } else {
        showToast('error', json.message || 'Failed to fetch documents');
      }
    } catch {
      showToast('error', 'Network error while loading documents');
    } finally {
      if (showSpinner) setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments(1);
    setCurrentPage(1);
  }, [selectedUni, selectedCat, selectedFileType]);

  // Auto-poll silently every 3s if any document in the list is still syncing to FTP
  useEffect(() => {
    const hasSyncingDoc = documents.some(
      (d) => d.storage_driver === 'local' || d.storage_driver === 'pending_remote_ftp',
    );
    if (!hasSyncingDoc) return;

    const interval = setInterval(() => {
      fetchDocuments(currentPage, false);
    }, 3000);

    return () => clearInterval(interval);
  }, [documents, currentPage, selectedUni, selectedCat, selectedFileType, searchQuery]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchDocuments(1);
    setCurrentPage(1);
  };

  const handleResetFilters = () => {
    setSelectedUni('');
    setSelectedCat('');
    setSelectedFileType('');
    setSearchQuery('');
    setSearchParams({});
    fetchDocuments(1);
    setCurrentPage(1);
  };

  const handleCopyLink = (doc: DocumentItem) => {
    const targetUrl = cleanDocUrl(doc.file_url);
    const fullUrl = targetUrl.startsWith('http')
      ? targetUrl
      : `${window.location.origin}${targetUrl}`;

    navigator.clipboard.writeText(fullUrl).then(() => {
      setCopiedId(doc.id);
      showToast('success', 'Document URL copied to clipboard!');
      setTimeout(() => setCopiedId(null), 2000);
    }).catch(() => {
      showToast('error', 'Failed to copy URL to clipboard');
    });
  };

  const handleDelete = async (id: number) => {
    const isConfirmed = await confirmDelete('This document file will be deleted permanently!');
    if (!isConfirmed) return;

    try {
      const res = await fetch(`/api/v1/admin/university-documents/${id}`, {
        method: 'DELETE',
      });
      const json = await res.json();
      if (res.ok && json.success) {
        showToast('success', 'Document deleted successfully');
        fetchDocuments(currentPage);
      } else {
        showToast('error', json.message || 'Failed to delete document');
      }
    } catch {
      showToast('error', 'Network error while deleting document');
    }
  };

  // Handle Upload Form Submission
  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadForm.university_id) {
      showToast('error', 'Please select a university');
      return;
    }
    if (!uploadForm.category_id) {
      showToast('error', 'Please select a document category');
      return;
    }
    if (!selectedFiles || selectedFiles.length === 0) {
      showToast('error', 'Please select at least one document file to upload');
      return;
    }

    setUploading(true);
    setUploadProgress(10);

    try {
      const formData = new FormData();
      formData.append('university_id', uploadForm.university_id);
      formData.append('category_id', uploadForm.category_id);
      if (uploadForm.title) formData.append('title', uploadForm.title);
      formData.append('visibility', uploadForm.visibility);
      if (uploadForm.description) formData.append('description', uploadForm.description);

      for (let i = 0; i < selectedFiles.length; i++) {
        formData.append('documents', selectedFiles[i]);
      }

      setUploadProgress(50);

      const res = await fetch('/api/v1/admin/university-documents', {
        method: 'POST',
        body: formData,
      });

      setUploadProgress(90);
      const json = await res.json();

      if (res.ok && json.success) {
        setUploadProgress(100);
        showToast('success', json.message || 'Document uploaded successfully');
        setIsUploadModalOpen(false);
        setSelectedFiles(null);
        setUploadForm({
          university_id: '',
          category_id: '',
          title: '',
          visibility: 'all',
          description: '',
        });
        fetchDocuments(1);
      } else {
        showToast('error', json.message || 'Failed to upload document');
      }
    } catch {
      showToast('error', 'Network error while uploading files');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  // Open Edit Modal
  const handleOpenEdit = (doc: DocumentItem) => {
    setEditingDoc(doc);
    setEditForm({
      university_id: String(doc.university_id),
      category_id: String(doc.category_id),
      title: doc.title || '',
      visibility: doc.visibility || 'all',
      description: doc.description || '',
      status: doc.status !== undefined ? doc.status : 1,
    });
    setReplacementFile(null);
    setIsEditModalOpen(true);
  };

  // Handle Edit Submit
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDoc) return;

    setSubmittingEdit(true);
    try {
      const formData = new FormData();
      formData.append('university_id', editForm.university_id);
      formData.append('category_id', editForm.category_id);
      formData.append('title', editForm.title);
      formData.append('visibility', editForm.visibility);
      formData.append('description', editForm.description);
      formData.append('status', String(editForm.status));

      if (replacementFile) {
        formData.append('document_file', replacementFile);
      }

      const res = await fetch(`/api/v1/admin/university-documents/${editingDoc.id}`, {
        method: 'PUT',
        body: formData,
      });
      const json = await res.json();

      if (res.ok && json.success) {
        showToast('success', 'Document updated successfully');
        setIsEditModalOpen(false);
        fetchDocuments(currentPage);
      } else {
        showToast('error', json.message || 'Failed to update document');
      }
    } catch {
      showToast('error', 'Network error while updating document');
    } finally {
      setSubmittingEdit(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg text-white ${toast.type === 'success' ? 'bg-emerald-600' : 'bg-red-600'
            }`}
        >
          {toast.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5" />
          ) : (
            <AlertCircle className="w-5 h-5" />
          )}
          <span className="font-medium text-sm">{toast.message}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <FolderOpen className="w-7 h-7 text-indigo-600" />
            University Documents
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage university prospectuses, fee brochures, admission guidelines, videos & document downloads.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {pendingSyncCount > 0 && (
            <button
              onClick={handleSyncAllPending}
              disabled={syncingAll}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-sm font-semibold shadow-sm transition-all cursor-pointer disabled:opacity-60"
              title="Click to manually retry uploading all pending files to FTP"
            >
              <RefreshCw className={`w-4 h-4 ${syncingAll ? 'animate-spin' : ''}`} />
              <span>Sync All Pending ({pendingSyncCount})</span>
            </button>
          )}
          <Link
            to="/document-categories"
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg text-sm font-medium transition-colors"
          >
            <Tags className="w-4 h-4" />
            Categories
          </Link>
          <button
            type="button"
            onClick={handleOpenStorageModal}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg text-sm font-medium transition-colors cursor-pointer"
            title="Configure FTP Server IP & Credentials"
          >
            <Server className="w-4 h-4 text-emerald-600" />
            <span>Storage Config</span>
          </button>
          <button
            onClick={() => setIsUploadModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium shadow-sm"
          >
            <Upload className="w-4 h-4" />
            Upload New Document
          </button>
        </div>
      </div>

      {/* Summary Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 mb-4">
        <div className="bg-white px-3.5 py-2.5 rounded-xl border border-gray-200 shadow-2xs flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
            <FolderOpen className="w-4 h-4" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider truncate">Total Documents</p>
            <h3 className="text-base sm:text-lg font-black text-gray-900 leading-tight">{stats.totalDocs.toLocaleString()}</h3>
          </div>
        </div>

        <div className="bg-white px-3.5 py-2.5 rounded-xl border border-gray-200 shadow-2xs flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <BookOpen className="w-4 h-4" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider truncate">Brochures & Fees</p>
            <h3 className="text-base sm:text-lg font-black text-gray-900 leading-tight">{stats.brochuresCount.toLocaleString()}</h3>
          </div>
        </div>

        <div className="bg-white px-3.5 py-2.5 rounded-xl border border-gray-200 shadow-2xs flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <Video className="w-4 h-4" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider truncate">Video Tours</p>
            <h3 className="text-base sm:text-lg font-black text-gray-900 leading-tight">{stats.videosCount.toLocaleString()}</h3>
          </div>
        </div>

        <div className="bg-white px-3.5 py-2.5 rounded-xl border border-gray-200 shadow-2xs flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <HardDrive className="w-4 h-4" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider truncate">Storage Size</p>
            <h3 className="text-base sm:text-lg font-black text-gray-900 leading-tight">{stats.formattedTotalSize}</h3>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 mb-6">
        <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">University</label>
            <select
              value={selectedUni}
              onChange={(e) => setSelectedUni(e.target.value)}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            >
              <option value="">-- All Universities --</option>
              {(filterUniversities.length > 0 ? filterUniversities : universities).map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Document Category</label>
            <select
              value={selectedCat}
              onChange={(e) => setSelectedCat(e.target.value)}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            >
              <option value="">-- All Categories --</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">File Format</label>
            <select
              value={selectedFileType}
              onChange={(e) => setSelectedFileType(e.target.value)}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            >
              <option value="">-- All Types --</option>
              <option value="pdf">PDF Documents</option>
              <option value="image">Photos / Images</option>
              <option value="video">Videos</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Search Keyword</label>
            <div className="relative">
              <input
                type="text"
                placeholder="Title, filename..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
              <Search className="w-4 h-4 absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>
          </div>

          <div className="flex items-end gap-2">
            <button
              type="submit"
              className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2 bg-[#14532d] text-white rounded-lg hover:bg-[#0f3e21] text-sm font-medium transition-colors shadow-xs"
            >
              <Filter className="w-4 h-4" />
              Filter
            </button>
            <button
              type="button"
              onClick={handleResetFilters}
              className="p-2 border border-gray-300 hover:bg-gray-100 rounded-lg text-gray-600 transition-colors"
              title="Reset Filters"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>

      {/* Sync All Pending Alert Banner */}
      {pendingSyncCount > 0 && (
        <div className="bg-amber-50 border border-amber-300 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm mb-4">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
              <CloudUpload className="h-5 w-5 animate-pulse" />
            </div>
            <div>
              <p className="text-sm font-bold text-amber-900">
                {pendingSyncCount} document{pendingSyncCount > 1 ? 's' : ''} pending FTP sync
              </p>
              <p className="text-xs text-amber-700">
                Files are stored locally and will sync to FTP. Click button to sync now.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleSyncAllPending}
            disabled={syncingAll}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white shadow-sm transition-all cursor-pointer shrink-0 disabled:opacity-60"
          >
            <RefreshCw className={`h-4 w-4 ${syncingAll ? 'animate-spin' : ''}`} />
            <span>{syncingAll ? 'Syncing Now...' : `Sync All Pending (${pendingSyncCount})`}</span>
          </button>
        </div>
      )}

      {/* Main Documents Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-gray-50/50">
          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold text-gray-700">
              Found <span className="text-indigo-600 font-bold">{totalRecords}</span> document(s)
            </span>
            {pendingSyncCount > 0 && (
              <button
                type="button"
                onClick={handleSyncAllPending}
                disabled={syncingAll}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold bg-amber-500 hover:bg-amber-600 text-white shadow-xs transition-all cursor-pointer disabled:opacity-60"
                title="Retry syncing all pending files"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${syncingAll ? 'animate-spin' : ''}`} />
                <span>Sync All Pending ({pendingSyncCount})</span>
              </button>
            )}
          </div>
          <span className="text-xs text-gray-500">
            Page {currentPage} of {totalPages}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#effaf2] border-b-2 border-[#c8ebd2] text-[#14532d] font-extrabold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3.5 px-4 w-12 text-center text-emerald-700">#</th>
                <th className="py-3.5 px-4 w-16 text-center text-[#14532d]">Format</th>
                <th className="py-3.5 px-4 text-[#14532d]">Title & Original File</th>
                <th className="py-3.5 px-4 text-[#14532d]">University</th>
                <th className="py-3.5 px-4 text-[#14532d]">Category</th>
                <th className="py-3.5 px-4 text-center text-[#14532d]">Access</th>
                <th className="py-3.5 px-4 text-center text-[#14532d]">Size</th>
                <th className="py-3.5 px-4 text-[#14532d]">Date</th>
                <th className="py-3.5 px-4 text-right w-36 text-[#14532d]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-gray-500">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-indigo-600 mb-2" />
                    Loading documents...
                  </td>
                </tr>
              ) : documents.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-gray-500">
                    No university documents found matching criteria.
                  </td>
                </tr>
              ) : (
                documents.map((doc, idx) => (
                  <tr key={doc.id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="py-3 px-4 text-center text-gray-500 font-mono text-xs">
                      {(currentPage - 1) * 15 + idx + 1}
                    </td>

                    {/* Thumbnail / Format Icon */}
                    <td className="py-3 px-4 text-center">
                      {doc.is_image ? (
                        <a href={cleanDocUrl(doc.file_url)} target="_blank" rel="noreferrer">
                          <img
                            src={cleanDocUrl(doc.file_url)}
                            alt="thumb"
                            className="w-10 h-10 object-cover rounded-md border border-gray-200 mx-auto hover:opacity-90"
                          />
                        </a>
                      ) : doc.is_pdf ? (
                        <div className="w-10 h-10 rounded-md bg-red-50 text-red-600 flex items-center justify-center font-bold text-xs mx-auto border border-red-100">
                          PDF
                        </div>
                      ) : doc.is_video ? (
                        <div className="w-10 h-10 rounded-md bg-amber-50 text-amber-600 flex items-center justify-center mx-auto border border-amber-100">
                          <Video className="w-5 h-5" />
                        </div>
                      ) : (
                        <div className="w-10 h-10 rounded-md bg-gray-100 text-gray-500 flex items-center justify-center mx-auto border border-gray-200">
                          <FileCode className="w-5 h-5" />
                        </div>
                      )}
                    </td>

                    {/* Title & File Name */}
                    <td className="py-3 px-4 max-w-xs">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-semibold text-gray-900 line-clamp-1">{doc.title}</span>
                        {doc.storage_driver === 'local' && (
                          <button
                            type="button"
                            onClick={() => handleManualSync(doc.id)}
                            disabled={syncingDocId === doc.id}
                            className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 shadow-2xs transition-all cursor-pointer group disabled:opacity-60"
                            title="Pending FTP upload. Click to retry sync now!"
                          >
                            {syncingDocId === doc.id ? (
                              <Loader2 className="w-2.5 h-2.5 text-amber-600 animate-spin" />
                            ) : (
                              <CloudUpload className="w-2.5 h-2.5 text-amber-600 animate-pulse group-hover:scale-110 transition-transform" />
                            )}
                            <span>{syncingDocId === doc.id ? 'Syncing...' : 'Syncing FTP'}</span>
                            <RefreshCw className="w-2 h-2 text-amber-600 ml-0.5 opacity-70 group-hover:opacity-100 group-hover:rotate-180 transition-all" />
                          </button>
                        )}
                        {doc.storage_driver === 'remote_ftp' && (
                          <span
                            className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/80"
                            title="Stored safely on remote FTP cloud storage"
                          >
                            <CloudCheck className="w-2.5 h-2.5 text-emerald-600" />
                            <span>FTP Upload</span>
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-gray-500 flex items-center gap-1 mt-0.5 font-mono line-clamp-1">
                        <FileText className="w-3 h-3 text-gray-400 shrink-0" />
                        {doc.original_name}
                      </div>
                      {doc.description && (
                        <div className="text-xs text-gray-500 line-clamp-1 mt-0.5">
                          {doc.description}
                        </div>
                      )}
                    </td>

                    {/* University */}
                    <td className="py-3 px-4 text-xs font-medium text-gray-700">
                      {doc.university_name ? (
                        <button
                          onClick={() => {
                            setSelectedUni(String(doc.university_id));
                          }}
                          className="text-indigo-600 hover:underline flex items-center gap-1 font-semibold"
                        >
                          <Building2 className="w-3.5 h-3.5 text-indigo-500" />
                          {doc.university_name}
                        </button>
                      ) : (
                        <span className="text-gray-400">N/A</span>
                      )}
                    </td>

                    {/* Category */}
                    <td className="py-3 px-4">
                      {doc.category_name ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
                          <Tags className="w-3 h-3" />
                          {doc.category_name}
                        </span>
                      ) : (
                        <span className="text-xs text-gray-400">Uncategorized</span>
                      )}
                    </td>

                    {/* Visibility */}
                    <td className="py-3 px-4 text-center">
                      {doc.visibility === 'admin_only' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
                          <Lock className="w-3 h-3" /> Admin Only
                        </span>
                      ) : (doc.visibility === 'counsellor' || doc.visibility === 'counsellors_only') ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-200">
                          <Users className="w-3 h-3" /> Counsellor
                        </span>
                      ) : (doc.visibility === 'agent' || doc.visibility === 'agents_only') ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-purple-50 text-purple-700 border border-purple-200">
                          <Users className="w-3 h-3" /> Agent
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-100">
                          <Users className="w-3 h-3" /> Public
                        </span>
                      )}
                    </td>

                    {/* File Size */}
                    <td className="py-3 px-4 text-center font-mono text-xs text-gray-600">
                      {doc.formatted_file_size || 'N/A'}
                    </td>

                    {/* Uploaded Date */}
                    <td className="py-3 px-4 text-xs text-gray-500 whitespace-nowrap">
                      {doc.created_at ? new Date(doc.created_at).toLocaleDateString() : 'N/A'}
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        {doc.storage_driver === 'local' && (
                          <button
                            type="button"
                            onClick={() => handleManualSync(doc.id)}
                            disabled={syncingDocId === doc.id}
                            className="p-1.5 text-amber-700 border border-amber-300 bg-amber-50 hover:bg-amber-100 rounded-lg transition-colors cursor-pointer"
                            title="Retry FTP Sync"
                          >
                            {syncingDocId === doc.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <RefreshCw className="w-4 h-4" />
                            )}
                          </button>
                        )}
                        <a
                          href={cleanDocUrl(doc.file_url)}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                          title="View / Download File"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                        <button
                          onClick={() => handleCopyLink(doc)}
                          className="p-1.5 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                          title="Copy Link"
                        >
                          {copiedId === doc.id ? (
                            <Check className="w-4 h-4 text-emerald-600" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </button>
                        <button
                          onClick={() => handleOpenEdit(doc)}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit Document"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(doc.id)}
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete Document"
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

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="p-4 border-t border-gray-200">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={(p) => {
                setCurrentPage(p);
                fetchDocuments(p);
              }}
            />
          </div>
        )}
      </div>

      {/* Upload Document Modal */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Upload className="w-5 h-5 text-indigo-600" />
                Upload University Documents
              </h3>
              <button
                onClick={() => setIsUploadModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Select University <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    value={uploadForm.university_id}
                    onChange={(e) => setUploadForm({ ...uploadForm, university_id: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  >
                    <option value="">-- Choose University --</option>
                    {universities.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Document Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    value={uploadForm.category_id}
                    onChange={(e) => setUploadForm({ ...uploadForm, category_id: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  >
                    <option value="">-- Choose Category --</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Document Title (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 2026 International Student Prospectus"
                    value={uploadForm.title}
                    onChange={(e) => setUploadForm({ ...uploadForm, title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    If multiple files are selected, original filenames will be used if title is empty.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Sharing Access <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={uploadForm.visibility}
                    onChange={(e) => setUploadForm({ ...uploadForm, visibility: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  >
                    <option value="admin_only">Admin Only</option>
                    <option value="counsellor">Counsellor</option>
                    <option value="agent">Agent</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description / Notes
                </label>
                <textarea
                  rows={2}
                  placeholder="Brief summary of document content..."
                  value={uploadForm.description}
                  onChange={(e) => setUploadForm({ ...uploadForm, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                ></textarea>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Choose File(s) to Upload <span className="text-red-500">*</span>
                </label>
                <input
                  type="file"
                  multiple
                  required
                  accept=".jpg,.jpeg,.webp,.png,.pdf,.mp4,.webm,.mkv,.avi,.mov"
                  onChange={(e) => setSelectedFiles(e.target.files)}
                  className="w-full text-sm text-gray-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer"
                />
                <p className="text-xs text-gray-400 mt-1">
                  Allowed formats: PDF, Images (JPG, PNG, WEBP), Videos (MP4, WEBM).
                </p>
              </div>

              {/* Upload Progress Bar */}
              {uploading && (
                <div className="space-y-1 pt-2">
                  <div className="flex justify-between text-xs font-semibold text-indigo-700">
                    <span>Uploading files...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                    <div
                      className="bg-indigo-600 h-2.5 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setIsUploadModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="flex items-center gap-2 px-5 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-medium transition-colors disabled:opacity-50"
                >
                  {uploading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4" />
                      Start Upload
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Document Modal */}
      {isEditModalOpen && editingDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Edit2 className="w-5 h-5 text-indigo-600" />
                Edit Document Details
              </h3>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    University <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    value={editForm.university_id}
                    onChange={(e) => setEditForm({ ...editForm, university_id: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  >
                    {universities.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    value={editForm.category_id}
                    onChange={(e) => setEditForm({ ...editForm, category_id: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Document Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={editForm.title}
                  onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sharing Access <span className="text-red-500">*</span>
                </label>
                <select
                  value={editForm.visibility}
                  onChange={(e) => setEditForm({ ...editForm, visibility: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                >
                  <option value="admin_only">Admin Only</option>
                  <option value="counsellor">Counsellor</option>
                  <option value="agent">Agent</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description / Notes
                </label>
                <textarea
                  rows={2}
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                ></textarea>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Replace File (Optional)
                </label>
                <input
                  type="file"
                  accept=".jpg,.jpeg,.webp,.png,.pdf,.mp4,.webm,.mkv,.avi,.mov"
                  onChange={(e) => setReplacementFile(e.target.files ? e.target.files[0] : null)}
                  className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-gray-100 file:text-gray-700 cursor-pointer"
                />
                <p className="text-xs text-gray-400 mt-1">
                  Current file: <span className="font-mono">{editingDoc.original_name}</span>
                </p>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingEdit}
                  className="flex items-center gap-2 px-5 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-medium transition-colors disabled:opacity-50"
                >
                  {submittingEdit && <Loader2 className="w-4 h-4 animate-spin" />}
                  Update Document
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Storage Settings Modal */}
      {storageModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-200 p-6">
            <div className="flex items-center justify-between pb-4 border-b border-gray-200">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-200/80">
                  <Server className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900">Remote SFTP / FTP Storage Config</h3>
                  <p className="text-xs text-gray-500">Update host IP, credentials & CDN domain dynamically</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setStorageModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {loadingStorage ? (
              <div className="py-12 text-center text-gray-500">
                <Loader2 className="w-8 h-8 animate-spin mx-auto text-emerald-600 mb-2" />
                Loading current storage configuration...
              </div>
            ) : (
              <form onSubmit={handleSaveStorage} className="space-y-4 pt-4">
                {/* Test Result Banner */}
                {testResult && (
                  <div
                    className={`p-3.5 rounded-xl border flex items-start gap-2.5 text-xs ${
                      testResult.success
                        ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                        : 'bg-rose-50 border-rose-300 text-rose-900'
                    }`}
                  >
                    {testResult.success ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    )}
                    <div>
                      <span className="font-bold">{testResult.success ? 'Success: ' : 'Error: '}</span>
                      <span>{testResult.message}</span>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                  <div className="sm:col-span-2 space-y-1">
                    <label className="block text-xs font-semibold text-gray-700">
                      FTP Host IP / Domain <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={storageConfig.sftp_host}
                      onChange={(e) => setStorageConfig({ ...storageConfig, sftp_host: e.target.value })}
                      className="w-full px-3 py-2 text-xs font-mono border border-gray-300 rounded-lg focus:ring-1 focus:ring-emerald-500 focus:border-emerald-600"
                      placeholder="e.g. 103.212.121.117"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-gray-700">
                      Port <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="number"
                      required
                      value={storageConfig.sftp_port}
                      onChange={(e) => setStorageConfig({ ...storageConfig, sftp_port: parseInt(e.target.value, 10) || 21 })}
                      className="w-full px-3 py-2 text-xs font-mono border border-gray-300 rounded-lg focus:ring-1 focus:ring-emerald-500 focus:border-emerald-600"
                      placeholder="21"
                    />
                  </div>

                  <div className="sm:col-span-3 space-y-1">
                    <label className="block text-xs font-semibold text-gray-700">
                      FTP Username <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={storageConfig.sftp_username}
                      onChange={(e) => setStorageConfig({ ...storageConfig, sftp_username: e.target.value })}
                      className="w-full px-3 py-2 text-xs font-mono border border-gray-300 rounded-lg focus:ring-1 focus:ring-emerald-500 focus:border-emerald-600"
                      placeholder="ftpimages@images.britannicaoverseas.com"
                    />
                  </div>

                  <div className="sm:col-span-3 space-y-1">
                    <label className="block text-xs font-semibold text-gray-700">
                      FTP Password <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type={showStoragePassword ? 'text' : 'password'}
                        required
                        value={storageConfig.sftp_password}
                        onChange={(e) => setStorageConfig({ ...storageConfig, sftp_password: e.target.value })}
                        className="w-full pl-3 pr-10 py-2 text-xs font-mono border border-gray-300 rounded-lg focus:ring-1 focus:ring-emerald-500 focus:border-emerald-600"
                        placeholder="••••••••••••"
                      />
                      <button
                        type="button"
                        onClick={() => setShowStoragePassword(!showStoragePassword)}
                        className="absolute right-2.5 top-2 text-gray-400 hover:text-gray-600 cursor-pointer"
                      >
                        {showStoragePassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="sm:col-span-3 space-y-1">
                    <label className="block text-xs font-semibold text-gray-700">
                      Root Directory <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={storageConfig.sftp_root}
                      onChange={(e) => setStorageConfig({ ...storageConfig, sftp_root: e.target.value })}
                      className="w-full px-3 py-2 text-xs font-mono border border-gray-300 rounded-lg focus:ring-1 focus:ring-emerald-500 focus:border-emerald-600"
                      placeholder="/em/"
                    />
                  </div>

                  <div className="sm:col-span-3 space-y-1">
                    <label className="block text-xs font-semibold text-gray-700">
                      CDN / Remote File URL Base <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="url"
                      required
                      value={storageConfig.remote_storage_cdn_url}
                      onChange={(e) => setStorageConfig({ ...storageConfig, remote_storage_cdn_url: e.target.value })}
                      className="w-full px-3 py-2 text-xs font-mono border border-gray-300 rounded-lg focus:ring-1 focus:ring-emerald-500 focus:border-emerald-600"
                      placeholder="https://www.images.britannicaoverseas.com/em"
                    />
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={handleTestStorage}
                    disabled={testingStorage}
                    className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 text-xs font-semibold text-gray-700 transition-colors cursor-pointer disabled:opacity-50"
                  >
                    {testingStorage ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5 text-amber-500" />}
                    <span>{testingStorage ? 'Testing Connection...' : 'Test FTP Connection'}</span>
                  </button>

                  <div className="flex items-center justify-end gap-2.5">
                    <button
                      type="button"
                      onClick={() => setStorageModalOpen(false)}
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-xs font-medium transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={savingStorage}
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 text-xs font-semibold shadow-xs transition-colors cursor-pointer disabled:opacity-50"
                    >
                      {savingStorage ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                      Save Storage Settings
                    </button>
                  </div>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
