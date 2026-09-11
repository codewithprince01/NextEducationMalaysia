import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { confirmDelete } from '@/lib/swal';
import {
  Building2,
  Plus,
  Trash2,
  Loader2,
  X,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  Image as ImageIcon,
  Video as VideoIcon,
  Eye,
  Download
} from 'lucide-react';

interface PhotoItem {
  id: number;
  university_id: number;
  title?: string;
  photo_path: string;
  is_featured: number;
  created_at?: string;
  updated_at?: string;
}

interface VideoItem {
  id: number;
  university_id: number;
  title?: string;
  video_url: string;
  video_link?: string;
  created_at?: string;
  updated_at?: string;
}

interface UniversityItem {
  id: number;
  name: string;
}

export default function UniversityGallery() {
  const { id } = useParams<{ id?: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const queryUnivId = searchParams.get('university_id') || id || '';

  const [activeTab, setActiveTab] = useState<'photos' | 'videos'>('photos');
  const [photos, setPhotos] = useState<PhotoItem[]>([]);
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [universities, setUniversities] = useState<UniversityItem[]>([]);
  const [selectedUnivId, setSelectedUnivId] = useState<string>(queryUnivId);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Preview Modal
  const [previewMedia, setPreviewMedia] = useState<{ type: 'photo' | 'video'; url: string } | null>(null);

  // Modals
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [photoForm, setPhotoForm] = useState({
    university_id: '',
    title: '',
    photo_path: '',
    is_featured: false,
  });

  const [videoForm, setVideoForm] = useState({
    university_id: '',
    title: '',
    video_url: '',
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

  const fetchGallery = async (targetUnivId?: string) => {
    const univId = targetUnivId !== undefined ? targetUnivId : selectedUnivId;
    if (!univId) {
      setPhotos([]);
      setVideos([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const [photoRes, videoRes] = await Promise.all([
        fetch(`/api/v1/admin/university-photos?university_id=${univId}`),
        fetch(`/api/v1/admin/university-videos?university_id=${univId}`),
      ]);

      const photoJson = await photoRes.json();
      const videoJson = await videoRes.json();

      if (photoRes.ok && photoJson.success) setPhotos(photoJson.data || []);
      if (videoRes.ok && videoJson.success) setVideos(videoJson.data || []);
    } catch {
      showToast('error', 'Error loading gallery items');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUniversities();
    if (queryUnivId) {
      setSelectedUnivId(queryUnivId);
      fetchGallery(queryUnivId);
    }
  }, [queryUnivId]);

  const handleUniversityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setSelectedUnivId(val);
    if (val) {
      navigate(`/university-gallery?university_id=${val}`);
    }
    fetchGallery(val);
  };

  const handleAddPhotoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!photoForm.university_id || !photoForm.photo_path.trim()) {
      showToast('error', 'University and photo URL/path are required');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/v1/admin/university-photos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(photoForm),
      });
      const json = await res.json();

      if (res.ok && json.success) {
        showToast('success', 'Photo added successfully');
        setIsPhotoModalOpen(false);
        fetchGallery();
      } else {
        showToast('error', json.error || 'Failed to add photo');
      }
    } catch {
      showToast('error', 'Error submitting photo');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddVideoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!videoForm.university_id || !videoForm.video_url.trim()) {
      showToast('error', 'University and video URL are required');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/v1/admin/university-videos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(videoForm),
      });
      const json = await res.json();

      if (res.ok && json.success) {
        showToast('success', 'Video added successfully');
        setIsVideoModalOpen(false);
        fetchGallery();
      } else {
        showToast('error', json.error || 'Failed to add video');
      }
    } catch {
      showToast('error', 'Error submitting video');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeletePhoto = async (item: PhotoItem) => {
    const confirmed = await confirmDelete('this photo');
    if (!confirmed) return;

    try {
      const res = await fetch(`/api/v1/admin/university-photos/${item.id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        showToast('success', 'Photo deleted');
        setPhotos((prev) => prev.filter((p) => p.id !== item.id));
      }
    } catch {
      showToast('error', 'Failed to delete photo');
    }
  };

  const handleDeleteVideo = async (item: VideoItem) => {
    const confirmed = await confirmDelete('this video');
    if (!confirmed) return;

    try {
      const res = await fetch(`/api/v1/admin/university-videos/${item.id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        showToast('success', 'Video deleted');
        setVideos((prev) => prev.filter((v) => v.id !== item.id));
      }
    } catch {
      showToast('error', 'Failed to delete video');
    }
  };

  const handleDownload = (pathOrUrl: string) => {
    const link = document.createElement('a');
    link.href = pathOrUrl.startsWith('http') ? pathOrUrl : `/${pathOrUrl.replace(/^\//, '')}`;
    link.target = '_blank';
    link.download = pathOrUrl.split('/').pop() || 'download';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const selectedUnivName = universities.find((u) => u.id.toString() === selectedUnivId)?.name;

  return (
    <div className="space-y-2">
      {/* Toast */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-2xl shadow-xl flex items-center gap-3 text-sm font-semibold transition-all ${
            toast.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'
          }`}
        >
          {toast.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Unified Header & Filter Card */}
      <div className="bg-white border border-slate-200/80 rounded-xl p-3.5 shadow-xs space-y-2.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => navigate('/university')}
              className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
            </button>
            <div>
              <h1 className="text-base font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                <span>University Photos & Videos</span>
                {selectedUnivName && (
                  <span className="text-xs font-bold text-indigo-600 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-full">
                    {selectedUnivName}
                  </span>
                )}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                if (!selectedUnivId && universities.length > 0) {
                  showToast('error', 'Please select a university first');
                  return;
                }
                setPhotoForm({
                  university_id: selectedUnivId || (universities[0]?.id.toString() || ''),
                  title: '',
                  photo_path: '',
                  is_featured: false,
                });
                setIsPhotoModalOpen(true);
              }}
              className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Photo
            </button>
            <button
              onClick={() => {
                if (!selectedUnivId && universities.length > 0) {
                  showToast('error', 'Please select a university first');
                  return;
                }
                setVideoForm({
                  university_id: selectedUnivId || (universities[0]?.id.toString() || ''),
                  title: '',
                  video_url: '',
                });
                setIsVideoModalOpen(true);
              }}
              className="px-3.5 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Video
            </button>
          </div>
        </div>

        {/* Filter and Tab Pills */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <label className="text-xs font-bold text-slate-700 shrink-0 flex items-center gap-1.5">
              <Building2 className="w-4 h-4 text-indigo-600" />
              Select University:
            </label>
            <select
              value={selectedUnivId}
              onChange={handleUniversityChange}
              className="w-full sm:w-80 px-3 py-1 rounded-lg border border-slate-200 text-slate-800 text-xs font-semibold focus:outline-none focus:border-indigo-600 bg-slate-50"
            >
              <option value="">-- Select a University --</option>
              {universities.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center bg-slate-100 p-1 rounded-lg shrink-0">
            <button
              onClick={() => setActiveTab('photos')}
              className={`px-3 py-1 rounded-md text-xs font-bold flex items-center gap-1.5 transition-all ${
                activeTab === 'photos'
                  ? 'bg-white text-indigo-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ImageIcon className="w-3.5 h-3.5" />
              <span>Photos ({photos.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('videos')}
              className={`px-3 py-1 rounded-md text-xs font-bold flex items-center gap-1.5 transition-all ${
                activeTab === 'videos'
                  ? 'bg-white text-purple-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <VideoIcon className="w-3.5 h-3.5" />
              <span>Videos ({videos.length})</span>
            </button>
          </div>
        </div>
      </div>
      {/* Content */}
      <div className="bg-white border border-slate-200/80 rounded-3xl overflow-hidden shadow-sm">
        {!selectedUnivId ? (
          <div className="p-16 flex flex-col items-center justify-center text-slate-400 text-center">
            <Building2 className="w-12 h-12 mb-3 text-slate-300 animate-bounce" />
            <h3 className="text-sm font-bold text-slate-700">No University Selected</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm">
              Please select a university from the dropdown above to view and manage its photos and videos.
            </p>
          </div>
        ) : loading ? (
          <div className="p-12 flex flex-col items-center justify-center text-slate-500">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mb-3" />
            <p className="text-xs font-semibold">Loading gallery content...</p>
          </div>
        ) : activeTab === 'photos' ? (
          photos.length === 0 ? (
            <div className="p-12 text-center text-slate-500">
              <p className="text-sm font-semibold">No photos found for this university.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/50 text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                    <th className="py-4 px-6 w-16">ID</th>
                    <th className="py-4 px-6">Title</th>
                    <th className="py-4 px-6">Media File</th>
                    <th className="py-4 px-6">Date</th>
                    <th className="py-4 px-6">Featured</th>
                    <th className="py-4 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
                  {photos.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-4 px-6 font-bold text-slate-400">#{item.id}</td>
                      <td className="py-4 px-6 font-extrabold text-slate-900 text-xs">
                        {item.title || <span className="text-slate-400 italic">No Title</span>}
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setPreviewMedia({ type: 'photo', url: item.photo_path })}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-600 border border-indigo-500 hover:bg-indigo-50 rounded-md transition-colors"
                          >
                            <Eye className="w-3.5 h-3.5" /> View
                          </button>
                          <button
                            onClick={() => handleDownload(item.photo_path)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 border border-slate-300 hover:bg-slate-50 rounded-md transition-colors"
                          >
                            <Download className="w-3.5 h-3.5" /> Download
                          </button>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-[11px] text-slate-500 font-medium">
                        <div>Created: <b className="text-slate-700">{item.created_at ? new Date(item.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }) : 'N/A'}</b></div>
                        {item.updated_at && (
                          <div>Updated: <b className="text-slate-700">{new Date(item.updated_at).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })}</b></div>
                        )}
                      </td>
                      <td className="py-4 px-6">
                        {item.is_featured === 1 ? (
                          <span className="px-2.5 py-1 rounded-full bg-amber-50 text-amber-600 font-extrabold text-[10px] uppercase">
                            Featured
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-500 font-bold text-[10px] uppercase">
                            Standard
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-6 text-right">
                        <button
                          onClick={() => handleDeletePhoto(item)}
                          className="p-2 rounded-lg border border-slate-200 text-slate-500 hover:text-rose-600 hover:border-rose-200 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        ) : (
          videos.length === 0 ? (
            <div className="p-12 text-center text-slate-500">
              <p className="text-sm font-semibold">No videos found for this university.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/50 text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                    <th className="py-4 px-6 w-16">ID</th>
                    <th className="py-4 px-6">Title</th>
                    <th className="py-4 px-6">Video Media</th>
                    <th className="py-4 px-6">Date</th>
                    <th className="py-4 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
                  {videos.map((item) => {
                    const vUrl = item.video_url || item.video_link || '';
                    return (
                    <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-4 px-6 font-bold text-slate-400">#{item.id}</td>
                      <td className="py-4 px-6 font-extrabold text-slate-900 text-xs">
                        {item.title || <span className="text-slate-400 italic">No Title</span>}
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setPreviewMedia({ type: 'video', url: vUrl })}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-purple-600 border border-purple-500 hover:bg-purple-50 rounded-md transition-colors"
                          >
                            <Eye className="w-3.5 h-3.5" /> View Video
                          </button>
                          <button
                            onClick={() => handleDownload(vUrl)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 border border-slate-300 hover:bg-slate-50 rounded-md transition-colors"
                          >
                            <Download className="w-3.5 h-3.5" /> Download
                          </button>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-[11px] text-slate-500 font-medium">
                        <div>Created: <b className="text-slate-700">{item.created_at ? new Date(item.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }) : 'N/A'}</b></div>
                        {item.updated_at && (
                          <div>Updated: <b className="text-slate-700">{new Date(item.updated_at).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })}</b></div>
                        )}
                      </td>
                      <td className="py-4 px-6 text-right">
                        <button
                          onClick={() => handleDeleteVideo(item)}
                          className="p-2 rounded-lg border border-slate-200 text-slate-500 hover:text-rose-600 hover:border-rose-200 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
                </tbody>
              </table>
            </div>
          )
        )}
      </div>

      {/* Media Preview Modal */}
      {previewMedia && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-slate-200 w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col">
            <div className="flex items-center justify-between p-4 bg-slate-50 border-b border-slate-200">
              <h3 className="text-sm font-bold text-slate-800">
                Media Preview ({previewMedia.type === 'photo' ? 'Image' : 'Video'})
              </h3>
              <button
                onClick={() => setPreviewMedia(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 flex items-center justify-center bg-slate-950 min-h-[300px]">
              {previewMedia.type === 'photo' ? (
                <img
                  src={
                    previewMedia.url.startsWith('http')
                      ? previewMedia.url
                      : `/${previewMedia.url.replace(/^\//, '')}`
                  }
                  alt="Gallery Preview"
                  className="max-h-[70vh] max-w-full object-contain rounded-lg shadow-lg"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      'https://images.unsplash.com/photo-1541829070764-84a7d30dd3f3?q=80&w=800&auto=format&fit=crop';
                  }}
                />
              ) : (
                <iframe
                  src={
                    previewMedia.url.includes('youtube.com/watch?v=')
                      ? previewMedia.url.replace('watch?v=', 'embed/')
                      : previewMedia.url
                  }
                  title="Video Preview"
                  className="w-full aspect-video rounded-lg shadow-lg"
                  allowFullScreen
                />
              )}
            </div>
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-between items-center text-xs">
              <span className="font-mono text-slate-500 truncate max-w-md">{previewMedia.url}</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleDownload(previewMedia.url)}
                  className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" /> Download File
                </button>
                <button
                  onClick={() => setPreviewMedia(null)}
                  className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold rounded"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Photo Modal */}
      {isPhotoModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-md p-6 shadow-2xl space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-extrabold text-slate-900">Add Gallery Photo</h3>
              <button
                onClick={() => setIsPhotoModalOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleAddPhotoSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">University *</label>
                <select
                  value={photoForm.university_id}
                  onChange={(e) => setPhotoForm({ ...photoForm, university_id: e.target.value })}
                  required
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold"
                >
                  <option value="">-- Select University --</option>
                  {universities.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Title</label>
                <input
                  type="text"
                  placeholder="Photo Title / Caption"
                  value={photoForm.title}
                  onChange={(e) => setPhotoForm({ ...photoForm, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Photo URL / Path *</label>
                <input
                  type="text"
                  placeholder="/storage/photos/univ1.jpg or https://..."
                  value={photoForm.photo_path}
                  onChange={(e) => setPhotoForm({ ...photoForm, photo_path: e.target.value })}
                  required
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="is_featured"
                  checked={photoForm.is_featured}
                  onChange={(e) => setPhotoForm({ ...photoForm, is_featured: e.target.checked })}
                  className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
                <label htmlFor="is_featured" className="text-xs font-bold text-slate-700">
                  Set as Featured Photo
                </label>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsPhotoModalOpen(false)}
                  className="px-4 py-2 rounded-xl border text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-bold text-xs cursor-pointer"
                >
                  {submitting ? 'Saving...' : 'Add Photo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Video Modal */}
      {isVideoModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-md p-6 shadow-2xl space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-extrabold text-slate-900">Add University Video</h3>
              <button
                onClick={() => setIsVideoModalOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleAddVideoSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">University *</label>
                <select
                  value={videoForm.university_id}
                  onChange={(e) => setVideoForm({ ...videoForm, university_id: e.target.value })}
                  required
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold"
                >
                  <option value="">-- Select University --</option>
                  {universities.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Title</label>
                <input
                  type="text"
                  placeholder="Video Title / Caption"
                  value={videoForm.title}
                  onChange={(e) => setVideoForm({ ...videoForm, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Video Embed / URL *</label>
                <input
                  type="text"
                  placeholder="https://www.youtube.com/watch?v=..."
                  value={videoForm.video_url}
                  onChange={(e) => setVideoForm({ ...videoForm, video_url: e.target.value })}
                  required
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsVideoModalOpen(false)}
                  className="px-4 py-2 rounded-xl border text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 rounded-xl bg-purple-600 text-white font-bold text-xs cursor-pointer"
                >
                  {submitting ? 'Saving...' : 'Add Video'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
