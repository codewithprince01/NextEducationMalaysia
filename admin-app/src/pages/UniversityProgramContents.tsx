import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams, Link } from 'react-router-dom';
import { confirmDelete } from '@/lib/swal';
import RichTextEditor from '@/components/common/RichTextEditor';
import Pagination from '@/components/common/Pagination';
import { uploadFileToStorage, getStorageUrl } from '@/lib/uploadHelper';
import {
  FileText,
  Plus,
  Minus,
  Edit2,
  Trash2,
  Loader2,
  X,
  CheckCircle2,
  AlertCircle,
  Eye,
  Search,
  ArrowLeft,
  GraduationCap,
  Image as ImageIcon,
  RotateCcw
} from 'lucide-react';

interface ProgramContentItem {
  id: number;
  c_id: number;
  tab_title?: string;
  heading?: string;
  description?: string;
  imgpath?: string;
  imgname?: string;
  status?: number;
  created_at?: string;
  updated_at?: string;
}

interface ProgramDetails {
  id: number;
  course_name: string;
  university_id?: number;
  university_name?: string;
}

export default function UniversityProgramContents() {
  const { id: routeId } = useParams<{ id?: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const cId = routeId || searchParams.get('c_id') || searchParams.get('program_id') || '';

  const [program, setProgram] = useState<ProgramDetails | null>(null);
  const [contents, setContents] = useState<ProgramContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Form Section Visibility
  const [isFormOpen, setIsFormOpen] = useState(true);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // View Modals
  const [viewingDescription, setViewingDescription] = useState<{ title: string; html: string } | null>(null);
  const [previewImage, setPreviewImage] = useState<{ title: string; url: string } | null>(null);

  // Form State
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    tab_title: '',
    heading: '',
    description: '',
    imgpath: '',
    imgname: '',
  });

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchContents = async () => {
    if (!cId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/v1/admin/university-program-contents?c_id=${cId}`);
      const json = await res.json();
      if (res.ok && json.status) {
        setProgram(json.program || null);
        setContents(json.data || []);
      } else {
        showToast('error', json.message || 'Failed to load program contents');
      }
    } catch {
      showToast('error', 'Connection error while fetching program contents');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContents();
  }, [cId]);

  const handleResetForm = () => {
    setEditingId(null);
    setThumbnailFile(null);
    setFormData({
      tab_title: '',
      heading: '',
      description: '',
      imgpath: '',
      imgname: '',
    });
  };

  const handleOpenEdit = (item: ProgramContentItem) => {
    setEditingId(item.id);
    setThumbnailFile(null);
    setFormData({
      tab_title: item.tab_title || '',
      heading: item.heading || '',
      description: item.description || '',
      imgpath: item.imgpath || '',
      imgname: item.imgname || '',
    });
    setIsFormOpen(true);
    window.scrollTo({ top: 180, behavior: 'smooth' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.tab_title.trim()) {
      showToast('error', 'Please enter a tab title');
      return;
    }

    setSubmitting(true);
    try {
      let finalImgPath = formData.imgpath;
      let finalImgName = formData.imgname;

      if (thumbnailFile) {
        try {
          const upRes = await uploadFileToStorage(thumbnailFile, 'university-programs');
          finalImgPath = upRes.file_path;
          finalImgName = thumbnailFile.name;
        } catch (uploadErr: any) {
          showToast('error', uploadErr.message || 'Thumbnail upload failed');
          setSubmitting(false);
          return;
        }
      }

      const url = editingId
        ? `/api/v1/admin/university-program-contents/${editingId}`
        : '/api/v1/admin/university-program-contents';
      const method = editingId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          c_id: cId,
          tab_title: formData.tab_title,
          heading: formData.heading,
          description: formData.description,
          imgpath: finalImgPath,
          imgname: finalImgName,
        }),
      });

      const json = await res.json();
      if (res.ok && json.status) {
        showToast('success', json.message || (editingId ? 'Record updated!' : 'Record created!'));
        handleResetForm();
        fetchContents();
      } else {
        showToast('error', json.message || 'Action failed');
      }
    } catch {
      showToast('error', 'Connection error while saving record');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number, title: string) => {
    const isConfirmed = await confirmDelete(
      'Delete Program Content?',
      `Are you sure you want to delete tab "${title}"? This cannot be undone.`
    );
    if (!isConfirmed) return;

    try {
      const res = await fetch(`/api/v1/admin/university-program-contents/${id}`, {
        method: 'DELETE',
      });
      const json = await res.json();
      if (res.ok && json.status) {
        showToast('success', 'Program content deleted successfully');
        fetchContents();
      } else {
        showToast('error', json.message || 'Failed to delete record');
      }
    } catch {
      showToast('error', 'Connection error while deleting record');
    }
  };

  // Filter & Pagination
  const filtered = contents.filter((c) => {
    const q = searchQuery.toLowerCase();
    return (
      (c.tab_title && c.tab_title.toLowerCase().includes(q)) ||
      (c.heading && c.heading.toLowerCase().includes(q))
    );
  });

  const totalPages = Math.ceil(filtered.length / itemsPerPage) || 1;
  const paginated = filtered.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg border text-sm font-medium transition-all ${
            toast.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-rose-50 text-rose-800 border-rose-200'
          }`}
        >
          {toast.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          )}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Top Header & Breadcrumbs */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <GraduationCap className="w-6 h-6 text-indigo-600" />
            Program Contents
            {program && (
              <span className="text-slate-600 font-semibold text-sm">
                [{program.course_name}
                {program.university_name ? ` , ${program.university_name}` : ''}]
              </span>
            )}
          </h1>
          <div className="flex items-center gap-2 text-xs text-slate-500 mt-1 font-medium">
            <Link to="/universities" className="hover:text-indigo-600 transition-colors">
              Universities
            </Link>
            <span>/</span>
            <Link
              to={program?.university_id ? `/programs?university_id=${program.university_id}` : '/programs'}
              className="hover:text-indigo-600 transition-colors"
            >
              Programs
            </Link>
            <span>/</span>
            <span className="text-slate-700 font-semibold">Program Contents</span>
          </div>
        </div>

        <button
          onClick={() =>
            navigate(
              program?.university_id
                ? `/programs?university_id=${program.university_id}`
                : '/programs'
            )
          }
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Programs
        </button>
      </div>

      {/* University Profile Quick Nav Pills */}
      {program?.university_id && (
        <div className="bg-white p-2.5 rounded-xl border border-slate-200/80 shadow-xs flex flex-wrap items-center gap-2">
          <Link
            to={`/university-overviews/${program.university_id}`}
            className="px-3 py-1 text-xs font-bold rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
          >
            Overview
          </Link>
          <Link
            to={`/programs?university_id=${program.university_id}`}
            className="px-3 py-1 text-xs font-bold rounded-lg bg-indigo-600 text-white shadow-2xs"
          >
            Courses
          </Link>
          <Link
            to={`/university-gallery?university_id=${program.university_id}`}
            className="px-3 py-1 text-xs font-bold rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
          >
            Gallery
          </Link>
          <Link
            to={`/university-facilities?university_id=${program.university_id}`}
            className="px-3 py-1 text-xs font-bold rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
          >
            Facilities
          </Link>
          <Link
            to={`/university-rankings?university_id=${program.university_id}`}
            className="px-3 py-1 text-xs font-bold rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
          >
            Rankings
          </Link>
        </div>
      )}

      {/* Add / Edit Form Card */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div
          className="flex items-center justify-between p-3.5 bg-slate-50/80 border-b border-slate-200/80 cursor-pointer select-none"
          onClick={() => setIsFormOpen(!isFormOpen)}
        >
          <div className="flex items-center gap-2">
            <div
              className={`w-6 h-6 rounded-lg flex items-center justify-center text-white text-xs font-bold ${
                editingId ? 'bg-amber-500' : 'bg-indigo-600'
              }`}
            >
              {editingId ? <Edit2 className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
            </div>
            <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              {editingId ? 'Edit Program Content Record' : 'Add New Record'}
            </h2>
          </div>
          <button
            type="button"
            className="p-1 rounded-md border border-slate-200 text-slate-600 hover:bg-slate-100"
          >
            {isFormOpen ? <Minus className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
          </button>
        </div>

        {isFormOpen && (
          <form onSubmit={handleSubmit} className="p-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              <div className="md:col-span-4">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Enter Tab Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Overview, Curriculum, Requirements"
                  value={formData.tab_title}
                  onChange={(e) => setFormData({ ...formData, tab_title: e.target.value })}
                  className="w-full px-3 py-2 text-xs font-semibold border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="md:col-span-5">
                <label className="block text-xs font-bold text-slate-700 mb-1">Enter Heading</label>
                <input
                  type="text"
                  placeholder="e.g. Program Structure & Specializations"
                  value={formData.heading}
                  onChange={(e) => setFormData({ ...formData, heading: e.target.value })}
                  className="w-full px-3 py-2 text-xs font-medium border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="md:col-span-3">
                <label className="block text-xs font-bold text-slate-700 mb-1">Upload Thumbnail</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0] || null;
                    setThumbnailFile(file);
                  }}
                  className="w-full text-xs text-slate-600 file:mr-2 file:py-1.5 file:px-2.5 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-slate-200 file:text-slate-700 hover:file:bg-slate-300 cursor-pointer border border-slate-200 rounded-lg bg-slate-50"
                />
                {(thumbnailFile || formData.imgpath) && (
                  <div className="flex items-center gap-2 mt-2 p-1.5 bg-slate-50 border border-slate-200 rounded-lg">
                    <img
                      src={thumbnailFile ? URL.createObjectURL(thumbnailFile) : getStorageUrl(formData.imgpath)}
                      alt="Thumbnail Preview"
                      className="w-8 h-8 object-cover rounded border border-slate-200 shrink-0"
                    />
                    <span className="text-[11px] text-slate-600 truncate flex-1">
                      {thumbnailFile ? thumbnailFile.name : formData.imgname || formData.imgpath}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setThumbnailFile(null);
                        setFormData({ ...formData, imgpath: '', imgname: '' });
                      }}
                      className="text-rose-500 hover:text-rose-700 text-xs font-semibold px-1.5 py-0.5"
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Enter Description <span className="text-rose-500">*</span>
              </label>
              <RichTextEditor
                value={formData.description}
                onChange={(val) => setFormData({ ...formData, description: val })}
                placeholder="Enter detailed content description here..."
                minHeight={200}
              />
            </div>

            <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={handleResetForm}
                className="flex items-center gap-1 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Reset
              </button>
              {editingId && (
                <button
                  type="button"
                  onClick={handleResetForm}
                  className="px-3 py-2 border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-bold rounded-lg transition-colors cursor-pointer"
                >
                  Cancel
                </button>
              )}
              <button
                type="submit"
                disabled={submitting}
                className="flex items-center gap-1.5 px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg shadow-xs transition-all cursor-pointer disabled:opacity-50"
              >
                {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>{editingId ? 'Update Record' : 'Submit Record'}</span>
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Program Contents Table Card */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-3.5 border-b border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by Tab Title or Heading..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="flex items-center gap-2 self-end sm:self-center">
            <label className="text-xs text-slate-500 font-medium">Show:</label>
            <select
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="px-2 py-1 text-xs border border-slate-200 rounded-lg bg-slate-50 font-medium"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4 w-16 text-center">Sr. No.</th>
                <th className="py-3 px-4">Tab Title</th>
                <th className="py-3 px-4">Heading</th>
                <th className="py-3 px-4 w-28 text-center">Thumbnail</th>
                <th className="py-3 px-4 w-28 text-center">Description</th>
                <th className="py-3 px-4 w-24 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-indigo-600 mb-2" />
                    Loading program contents...
                  </td>
                </tr>
              ) : paginated.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400 font-medium">
                    No program contents found. Add a record above.
                  </td>
                </tr>
              ) : (
                paginated.map((item, index) => {
                  const srNo = (currentPage - 1) * itemsPerPage + index + 1;
                  return (
                    <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 text-center font-bold text-slate-500 font-mono">
                        {srNo}
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-800">
                        {item.tab_title || '-'}
                      </td>
                      <td className="py-3 px-4 font-medium text-slate-700 max-w-xs truncate">
                        {item.heading || '-'}
                      </td>
                      <td className="py-3 px-4 text-center">
                        {item.imgpath ? (
                          <button
                            type="button"
                            onClick={() =>
                              setPreviewImage({
                                title: item.tab_title || 'Thumbnail',
                                url: getStorageUrl(item.imgpath),
                              })
                            }
                            className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded text-xs font-semibold cursor-pointer transition-colors"
                          >
                            <ImageIcon className="w-3 h-3" /> View
                          </button>
                        ) : (
                          <span className="text-slate-400 font-medium text-xs">N/A</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-center">
                        {item.description ? (
                          <button
                            type="button"
                            onClick={() =>
                              setViewingDescription({
                                title: item.tab_title || 'Content Description',
                                html: item.description || '',
                              })
                            }
                            className="inline-flex items-center gap-1 px-2.5 py-1 bg-cyan-50 text-cyan-700 hover:bg-cyan-100 border border-cyan-200 rounded text-xs font-bold cursor-pointer transition-colors"
                          >
                            <Eye className="w-3 h-3" /> View
                          </button>
                        ) : (
                          <span className="text-slate-400 font-medium text-xs">Empty</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(item)}
                            title="Edit"
                            className="p-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-600 transition-colors cursor-pointer"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(item.id, item.tab_title || 'this tab')}
                            title="Delete"
                            className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 transition-colors cursor-pointer"
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

        {/* Pagination Controls */}
        <div className="p-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <div>
            Showing {filtered.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1} to{' '}
            {Math.min(currentPage * itemsPerPage, filtered.length)} of {filtered.length} entries
          </div>
          {totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={(p) => setCurrentPage(p)}
            />
          )}
        </div>
      </div>

      {/* View Description Modal */}
      {viewingDescription && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in-50">
          <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[85vh]">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <h3 className="font-bold text-sm text-slate-800 flex items-center gap-2">
                <FileText className="w-4 h-4 text-indigo-600" />
                {viewingDescription.title}
              </h3>
              <button
                onClick={() => setViewingDescription(null)}
                className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div
              className="p-5 overflow-y-auto text-xs text-slate-700 leading-relaxed prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{ __html: viewingDescription.html }}
            />
            <div className="p-3 bg-slate-50 border-t border-slate-200 text-right">
              <button
                onClick={() => setViewingDescription(null)}
                className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold rounded-lg transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Image Preview Modal */}
      {previewImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-4 animate-in fade-in-50">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden">
            <div className="p-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <h3 className="font-bold text-xs text-slate-800 flex items-center gap-1.5 truncate">
                <ImageIcon className="w-4 h-4 text-blue-600" />
                {previewImage.title}
              </h3>
              <button
                onClick={() => setPreviewImage(null)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-4 flex items-center justify-center bg-slate-100">
              <img
                src={previewImage.url}
                alt={previewImage.title}
                className="max-h-96 object-contain rounded-lg border border-slate-200 shadow-sm"
              />
            </div>
            <div className="p-3 bg-slate-50 border-t border-slate-200 text-right">
              <button
                onClick={() => setPreviewImage(null)}
                className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold rounded-lg"
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
