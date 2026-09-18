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
  Image as ImageIcon,
  Video as VideoIcon,
  Eye,
  Download,
  RotateCcw,
  ExternalLink,
  Search,
  Calendar,
  Clock,
  Upload,
  GraduationCap,
  FileText,
  Trophy,
  Star
} from 'lucide-react';
import { uploadFileToStorage, getStorageUrl } from '@/lib/uploadHelper';

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
  const [searchQuery, setSearchQuery] = useState('');
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Preview Modal
  const [previewMedia, setPreviewMedia] = useState<{ type: 'photo' | 'video'; url: string; title?: string } | null>(null);

  // Modals
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreviewUrl, setPhotoPreviewUrl] = useState<string | null>(null);

  const [photoForm, setPhotoForm] = useState({
    university_id: queryUnivId,
    title: '',
    photo_path: '',
    is_featured: 0,
  });

  const [videoForm, setVideoForm] = useState({
    university_id: queryUnivId,
    title: '',
    video_url: '',
  });

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchUniversities = async () => {
    try {
      const res = await fetch('/api/v1/admin/universities?minimal=true');
      const json = await res.json();
      if (res.ok && (json.status || json.success)) {
        setUniversities(json.data || []);
      }
    } catch {
      console.error('Failed to fetch universities list');
    }
  };

  const fetchGallery = async (targetUnivId?: string, showLoading = true) => {
    const univId = targetUnivId !== undefined ? targetUnivId : selectedUnivId;
    if (!univId) {
      setPhotos([]);
      setVideos([]);
      setLoading(false);
      return;
    }

    if (showLoading) setLoading(true);
    try {
      const [photosRes, videosRes] = await Promise.all([
        fetch(`/api/v1/admin/university-photos?university_id=${univId}`),
        fetch(`/api/v1/admin/university-videos?university_id=${univId}`),
      ]);

      const photosJson = await photosRes.json();
      const videosJson = await videosRes.json();

      if (photosRes.ok && photosJson.success) {
        setPhotos(photosJson.data || []);
      }
      if (videosRes.ok && videosJson.success) {
        setVideos(videosJson.data || []);
      }
    } catch {
      showToast('error', 'Failed to fetch gallery items');
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  useEffect(() => {
    fetchUniversities();
    if (selectedUnivId) {
      fetchGallery(selectedUnivId);
    }
  }, []);

  const handleUnivChange = (val: string) => {
    setSelectedUnivId(val);
    setPhotoForm((prev) => ({ ...prev, university_id: val }));
    setVideoForm((prev) => ({ ...prev, university_id: val }));
    if (val) {
      navigate(`/university-gallery?university_id=${val}`);
    }
    fetchGallery(val);
  };

  const handleAddPhotoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const currentPhotoForm = { ...photoForm };
      if (photoFile) {
        const res = await uploadFileToStorage(photoFile, 'university-photos');
        currentPhotoForm.photo_path = res.file_path;
      }

      if (!currentPhotoForm.university_id || !currentPhotoForm.photo_path.trim()) {
        showToast('error', 'University and photo file are required');
        setSubmitting(false);
        return;
      }

      const res = await fetch('/api/v1/admin/university-photos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(currentPhotoForm),
      });
      const json = await res.json();

      if (res.ok && json.success) {
        showToast('success', 'Photo added successfully');
        setIsPhotoModalOpen(false);
        setPhotoFile(null);
        setPhotoPreviewUrl(null);
        fetchGallery(selectedUnivId);
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
        fetchGallery(selectedUnivId);
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
    const confirmed = await confirmDelete(item.title || 'this photo');
    if (!confirmed) return;

    setPhotos((prev) => prev.filter((p) => p.id !== item.id));

    try {
      const res = await fetch(`/api/v1/admin/university-photos/${item.id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        showToast('success', 'Photo deleted');
      } else {
        showToast('error', 'Failed to delete photo');
        fetchGallery(selectedUnivId, false);
      }
    } catch {
      showToast('error', 'Failed to delete photo');
      fetchGallery(selectedUnivId, false);
    }
  };

  const handleDeleteVideo = async (item: VideoItem) => {
    const confirmed = await confirmDelete(item.title || 'this video');
    if (!confirmed) return;

    setVideos((prev) => prev.filter((v) => v.id !== item.id));

    try {
      const res = await fetch(`/api/v1/admin/university-videos/${item.id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        showToast('success', 'Video deleted');
      } else {
        showToast('error', 'Failed to delete video');
        fetchGallery(selectedUnivId, false);
      }
    } catch {
      showToast('error', 'Failed to delete video');
      fetchGallery(selectedUnivId, false);
    }
  };

  const handleDownload = (pathOrUrl: string) => {
    const fullUrl = getStorageUrl(pathOrUrl);
    const link = document.createElement('a');
    link.href = fullUrl;
    link.target = '_blank';
    link.download = pathOrUrl.split('/').pop() || 'download';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatDateString = (dateStr?: string) => {
    if (!dateStr) return 'N/A';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      const day = String(d.getDate()).padStart(2, '0');
      const month = d.toLocaleString('en-US', { month: 'short' });
      const year = d.getFullYear();
      return `${day} ${month} ${year}`;
    } catch {
      return dateStr;
    }
  };

  const selectedUniv = universities.find((u) => u.id.toString() === selectedUnivId);

  const filteredPhotos = photos.filter((item) =>
    (item.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (item.photo_path || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredVideos = videos.filter((item) =>
    (item.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (item.video_url || item.video_link || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const featuredPhotosCount = photos.filter((p) => p.is_featured === 1).length;

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto pb-10">
      {/* Toast */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl text-xs font-semibold text-white animate-in slide-in-from-bottom-5 duration-200 ${
            toast.type === 'success' ? 'bg-stone-900 border border-emerald-500/40' : 'bg-rose-900 border border-rose-500/40'
          }`}
        >
          {toast.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <AlertCircle className="w-4 h-4 text-rose-400" />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* ── CLASSIC EDITORIAL HEADER ── */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-stone-200/90 shadow-xs relative overflow-hidden">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-1.5 max-w-2xl">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-900 text-[11px] font-bold tracking-wider uppercase">
                <ImageIcon className="w-3 h-3 text-amber-700" />
                <span>Media Assets & Campus Imagery</span>
              </span>
              {selectedUniv && (
                <span className="text-[11px] font-bold text-stone-700 bg-amber-50 border border-amber-200/80 px-2.5 py-0.5 rounded-full">
                  {selectedUniv.name}
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight font-serif">
              Photos & Videos Gallery
            </h1>
            <p className="text-xs sm:text-sm text-stone-500 font-medium leading-relaxed">
              Curate institutional photo galleries, featured campus highlights, virtual video tours, and downloadable media resources.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-3 shrink-0">
            {/* Select University Dropdown */}
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-amber-800 shrink-0" />
              <select
                value={selectedUnivId}
                onChange={(e) => handleUnivChange(e.target.value)}
                className="w-full sm:w-72 bg-stone-50/70 border border-stone-200/90 rounded-xl px-3 py-2 text-xs font-bold text-stone-800 focus:outline-none focus:border-amber-600 focus:bg-white cursor-pointer shadow-2xs"
              >
                <option value="">-- Select a University ({universities.length}) --</option>
                {universities.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={() => fetchGallery(selectedUnivId)}
              disabled={loading || !selectedUnivId}
              className="p-2.5 rounded-xl border border-stone-200 bg-stone-50/70 hover:bg-stone-100 text-stone-700 transition-colors cursor-pointer disabled:opacity-40 shadow-2xs self-start sm:self-auto"
              title="Refresh gallery items"
            >
              <RotateCcw className={`w-4 h-4 ${loading ? 'animate-spin text-stone-600' : ''}`} />
            </button>
          </div>
        </div>

        {/* University Sub-Navigation Bar */}
        {selectedUnivId && (
          <div className="flex flex-wrap items-center gap-2 mt-5 pt-4 border-t border-stone-100">
            <button
              onClick={() => navigate(`/university-overviews?university_id=${selectedUnivId}`)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-stone-600 bg-stone-100 hover:bg-stone-200 transition-all cursor-pointer border border-stone-200/60"
            >
              <FileText className="w-3.5 h-3.5 text-stone-500" />
              <span>Overview</span>
            </button>
            <button
              onClick={() => navigate(`/programs?university_id=${selectedUnivId}`)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-stone-600 bg-stone-100 hover:bg-stone-200 transition-all cursor-pointer border border-stone-200/60"
            >
              <GraduationCap className="w-3.5 h-3.5 text-stone-500" />
              <span>Programs</span>
            </button>
            <button
              onClick={() => navigate(`/university-gallery?university_id=${selectedUnivId}`)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-stone-900 text-white shadow-xs transition-all"
            >
              <ImageIcon className="w-3.5 h-3.5 text-amber-300" />
              <span>Gallery ({photos.length + videos.length})</span>
            </button>
            <button
              onClick={() => navigate(`/university-facilities?university_id=${selectedUnivId}`)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-stone-600 bg-stone-100 hover:bg-stone-200 transition-all cursor-pointer border border-stone-200/60"
            >
              <Building2 className="w-3.5 h-3.5 text-stone-500" />
              <span>Facilities</span>
            </button>
            <button
              onClick={() => navigate(`/university-reviews?university_id=${selectedUnivId}`)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-stone-600 bg-stone-100 hover:bg-stone-200 transition-all cursor-pointer border border-stone-200/60"
            >
              <Trophy className="w-3.5 h-3.5 text-amber-600" />
              <span>Rankings & Reviews</span>
            </button>
          </div>
        )}

        {/* ── COMPACT METRIC STAT PILLS ── */}
        {selectedUnivId && (
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-4 pt-3.5 border-t border-stone-100 text-xs">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#faf8f4] border border-stone-200/90 text-stone-700">
              <span className="text-stone-500 text-[11px] font-medium uppercase tracking-wider">Campus Photos:</span>
              <span className="font-extrabold text-stone-900">{photos.length}</span>
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-amber-50/70 border border-amber-200/80 text-amber-900">
              <span className="text-amber-700 text-[11px] font-medium uppercase tracking-wider">Featured:</span>
              <span className="font-extrabold text-amber-900">{featuredPhotosCount}</span>
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-50/70 border border-emerald-200/80 text-emerald-900">
              <span className="text-emerald-700 text-[11px] font-medium uppercase tracking-wider">Video Tours:</span>
              <span className="font-extrabold text-emerald-800">{videos.length}</span>
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-indigo-50/70 border border-indigo-200/80 text-indigo-900">
              <span className="text-indigo-700 text-[11px] font-medium uppercase tracking-wider">Media Total:</span>
              <span className="font-extrabold text-indigo-900">{photos.length + videos.length}</span>
            </div>
          </div>
        )}
      </div>

      {/* ── CARD: MAIN DATA TABLE & MEDIA SWITCHER ── */}
      <div className="bg-white rounded-3xl border border-stone-200/90 shadow-xs overflow-hidden">
        {/* Table Top Controls Bar */}
        <div className="p-5 sm:p-6 bg-[#faf8f4] border-b border-stone-200/90 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Tab Switcher */}
          <div className="flex items-center gap-2">
            <div className="flex items-center bg-stone-100 p-1 rounded-2xl border border-stone-200/80">
              <button
                onClick={() => setActiveTab('photos')}
                className={`flex items-center gap-2 px-4 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'photos'
                    ? 'bg-stone-900 text-white shadow-xs'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/60'
                }`}
              >
                <ImageIcon className="w-3.5 h-3.5" />
                <span>Photos ({photos.length})</span>
              </button>
              <button
                onClick={() => setActiveTab('videos')}
                className={`flex items-center gap-2 px-4 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'videos'
                    ? 'bg-stone-900 text-white shadow-xs'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/60'
                }`}
              >
                <VideoIcon className="w-3.5 h-3.5" />
                <span>Videos ({videos.length})</span>
              </button>
            </div>
          </div>

          {/* Search Toolbar & Action Buttons */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                type="text"
                placeholder={activeTab === 'photos' ? 'Search photos...' : 'Search videos...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs bg-white border border-stone-200 rounded-xl focus:outline-none focus:border-amber-600 transition-all text-stone-800 placeholder-stone-400 shadow-2xs font-medium"
              />
            </div>

            <div className="flex items-center gap-2 shrink-0">
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
                    is_featured: 0,
                  });
                  setPhotoFile(null);
                  setPhotoPreviewUrl(null);
                  setIsPhotoModalOpen(true);
                }}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs shadow-xs transition-all cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 text-amber-400" />
                <span>Add Photo</span>
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
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-stone-300 bg-white hover:bg-stone-50 text-stone-800 font-bold text-xs shadow-2xs transition-all cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 text-amber-700" />
                <span>Add Video</span>
              </button>
            </div>
          </div>
        </div>

        {/* Content Body */}
        {!selectedUnivId ? (
          <div className="p-16 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200/80 flex items-center justify-center text-amber-800 mb-4 shadow-inner">
              <Building2 className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-black text-stone-900 font-serif">Select an Institution</h3>
            <p className="text-xs sm:text-sm text-stone-500 mt-1.5 max-w-md font-medium leading-relaxed">
              Please choose a university from the dropdown header above to manage its photography and video assets.
            </p>
          </div>
        ) : loading ? (
          <div className="py-20 flex flex-col items-center justify-center text-stone-400 font-medium">
            <Loader2 className="w-8 h-8 animate-spin text-amber-800 mb-3" />
            <p className="text-xs font-bold text-stone-600">Loading gallery media...</p>
          </div>
        ) : activeTab === 'photos' ? (
          filteredPhotos.length === 0 ? (
            <div className="py-16 text-center text-stone-400 font-medium">
              <ImageIcon className="w-8 h-8 text-stone-300 mx-auto mb-2" />
              <p className="text-xs font-bold text-stone-600">
                {searchQuery ? 'No photos matched your search query.' : 'No photos found for this institution.'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-stone-600">
                <thead>
                  <tr className="bg-[#ece5d8] border-b-2 border-stone-300 text-stone-800 font-extrabold uppercase tracking-wider text-[11px]">
                    <th className="py-3.5 px-5 w-16 text-center text-stone-600">ID</th>
                    <th className="py-3.5 px-4 w-20 text-center text-stone-900">Preview</th>
                    <th className="py-3.5 px-5 text-stone-900">Photo Title / Caption</th>
                    <th className="py-3.5 px-5 text-stone-900">Media Actions</th>
                    <th className="py-3.5 px-5 text-stone-900">Status</th>
                    <th className="py-3.5 px-5 text-stone-900">Timestamps</th>
                    <th className="py-3.5 px-5 w-24 text-right text-stone-900">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 font-medium text-stone-700">
                  {filteredPhotos.map((item) => (
                    <tr key={item.id} className="hover:bg-[#fbfaf7] transition-colors group">
                      <td className="py-4 px-5 text-center font-bold text-stone-400 font-mono text-[11px]">
                        #{item.id}
                      </td>

                      {/* Image Thumbnail */}
                      <td className="py-4 px-4 text-center">
                        <div
                          onClick={() => setPreviewMedia({ type: 'photo', url: item.photo_path, title: item.title })}
                          className="w-12 h-12 mx-auto rounded-xl overflow-hidden border border-stone-200 bg-stone-100 cursor-pointer shadow-2xs hover:scale-105 transition-transform"
                        >
                          <img
                            src={getStorageUrl(item.photo_path)}
                            alt={item.title || 'Photo'}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src =
                                'https://images.unsplash.com/photo-1541829070764-84a7d30dd3f3?q=80&w=400&auto=format&fit=crop';
                            }}
                          />
                        </div>
                      </td>

                      {/* Title */}
                      <td className="py-4 px-5">
                        <div className="font-bold text-stone-900 text-xs sm:text-sm font-serif">
                          {item.title || <span className="text-stone-400 italic font-sans">Untitled Photo</span>}
                        </div>
                        <div className="text-[10px] text-stone-400 font-mono mt-0.5 truncate max-w-xs">
                          {item.photo_path}
                        </div>
                      </td>

                      {/* Media File Actions */}
                      <td className="py-4 px-5">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setPreviewMedia({ type: 'photo', url: item.photo_path, title: item.title })}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-amber-900 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 rounded-xl transition-colors cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" /> View Photo
                          </button>
                          <button
                            onClick={() => handleDownload(item.photo_path)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-stone-700 bg-stone-100 hover:bg-stone-200 border border-stone-200 rounded-xl transition-colors cursor-pointer"
                          >
                            <Download className="w-3.5 h-3.5" /> Download
                          </button>
                        </div>
                      </td>

                      {/* Featured Pill */}
                      <td className="py-4 px-5">
                        {item.is_featured === 1 ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200/80 text-amber-900 font-extrabold text-[10.5px] uppercase tracking-wider">
                            <Star className="w-3 h-3 text-amber-700 fill-amber-700" />
                            Featured
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-full bg-stone-100 border border-stone-200 text-stone-600 font-bold text-[10.5px] uppercase tracking-wider">
                            Standard
                          </span>
                        )}
                      </td>

                      {/* Timestamps */}
                      <td className="py-4 px-5 text-[11px] text-stone-500 space-y-1">
                        <div className="flex items-center gap-1 text-stone-600 font-medium">
                          <Calendar className="w-3 h-3 text-stone-400 shrink-0" />
                          <span>{formatDateString(item.created_at)}</span>
                        </div>
                        {item.updated_at && item.updated_at !== item.created_at && (
                          <div className="flex items-center gap-1 text-[10px] text-stone-400">
                            <Clock className="w-2.5 h-2.5 text-stone-400 shrink-0" />
                            <span>Updated: {formatDateString(item.updated_at)}</span>
                          </div>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-5 text-right">
                        <button
                          onClick={() => handleDeletePhoto(item)}
                          className="p-2 bg-rose-50 hover:bg-rose-600 text-rose-600 hover:text-white rounded-xl transition-all shadow-2xs cursor-pointer"
                          title="Delete photo"
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
          filteredVideos.length === 0 ? (
            <div className="py-16 text-center text-stone-400 font-medium">
              <VideoIcon className="w-8 h-8 text-stone-300 mx-auto mb-2" />
              <p className="text-xs font-bold text-stone-600">
                {searchQuery ? 'No videos matched your search query.' : 'No videos configured for this institution.'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-stone-600">
                <thead>
                  <tr className="bg-[#ece5d8] border-b-2 border-stone-300 text-stone-800 font-extrabold uppercase tracking-wider text-[11px]">
                    <th className="py-3.5 px-5 w-16 text-center text-stone-600">ID</th>
                    <th className="py-3.5 px-5 text-stone-900">Video Title</th>
                    <th className="py-3.5 px-5 text-stone-900">Video Media Stream</th>
                    <th className="py-3.5 px-5 text-stone-900">Timestamps</th>
                    <th className="py-3.5 px-5 w-24 text-right text-stone-900">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 font-medium text-stone-700">
                  {filteredVideos.map((item) => {
                    const vUrl = item.video_url || item.video_link || '';
                    return (
                      <tr key={item.id} className="hover:bg-[#fbfaf7] transition-colors group">
                        <td className="py-4 px-5 text-center font-bold text-stone-400 font-mono text-[11px]">
                          #{item.id}
                        </td>

                        {/* Title */}
                        <td className="py-4 px-5">
                          <div className="font-bold text-stone-900 text-xs sm:text-sm font-serif">
                            {item.title || <span className="text-stone-400 italic font-sans">Untitled Video</span>}
                          </div>
                          <div className="text-[10px] text-stone-400 font-mono mt-0.5 truncate max-w-xs">
                            {vUrl}
                          </div>
                        </td>

                        {/* Video Media Actions */}
                        <td className="py-4 px-5">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => setPreviewMedia({ type: 'video', url: vUrl, title: item.title })}
                              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-amber-900 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 rounded-xl transition-colors cursor-pointer"
                            >
                              <Eye className="w-3.5 h-3.5" /> Watch Video
                            </button>
                            {vUrl.startsWith('http') && (
                              <a
                                href={vUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-stone-700 bg-stone-100 hover:bg-stone-200 border border-stone-200 rounded-xl transition-colors cursor-pointer"
                              >
                                <ExternalLink className="w-3.5 h-3.5" /> Open Link
                              </a>
                            )}
                          </div>
                        </td>

                        {/* Timestamps */}
                        <td className="py-4 px-5 text-[11px] text-stone-500 space-y-1">
                          <div className="flex items-center gap-1 text-stone-600 font-medium">
                            <Calendar className="w-3 h-3 text-stone-400 shrink-0" />
                            <span>{formatDateString(item.created_at)}</span>
                          </div>
                          {item.updated_at && item.updated_at !== item.created_at && (
                            <div className="flex items-center gap-1 text-[10px] text-stone-400">
                              <Clock className="w-2.5 h-2.5 text-stone-400 shrink-0" />
                              <span>Updated: {formatDateString(item.updated_at)}</span>
                            </div>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="py-4 px-5 text-right">
                          <button
                            onClick={() => handleDeleteVideo(item)}
                            className="p-2 bg-rose-50 hover:bg-rose-600 text-rose-600 hover:text-white rounded-xl transition-all shadow-2xs cursor-pointer"
                            title="Delete video"
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

      {/* ── MEDIA PREVIEW MODAL ── */}
      {previewMedia && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl border border-stone-200 w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between p-5 bg-[#faf8f4] border-b border-stone-200">
              <div className="flex items-center gap-2">
                {previewMedia.type === 'photo' ? (
                  <ImageIcon className="w-4 h-4 text-amber-800" />
                ) : (
                  <VideoIcon className="w-4 h-4 text-amber-800" />
                )}
                <h3 className="text-base font-black text-stone-900 font-serif">
                  {previewMedia.title || (previewMedia.type === 'photo' ? 'Photo Preview' : 'Video Player')}
                </h3>
              </div>
              <button
                onClick={() => setPreviewMedia(null)}
                className="p-1.5 text-stone-400 hover:text-stone-700 rounded-xl hover:bg-stone-200/60 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 flex items-center justify-center bg-stone-950 min-h-[320px]">
              {previewMedia.type === 'photo' ? (
                <img
                  src={getStorageUrl(previewMedia.url)}
                  alt="Gallery Preview"
                  className="max-h-[70vh] max-w-full object-contain rounded-2xl shadow-lg"
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
                  className="w-full aspect-video rounded-2xl shadow-lg border border-stone-800"
                  allowFullScreen
                />
              )}
            </div>

            <div className="p-4 bg-[#faf8f4] border-t border-stone-200 flex flex-col sm:flex-row justify-between items-center gap-3 text-xs">
              <span className="font-mono text-stone-500 truncate max-w-md">{previewMedia.url}</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleDownload(previewMedia.url)}
                  className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                >
                  <Download className="w-3.5 h-3.5" /> Download Media
                </button>
                <button
                  onClick={() => setPreviewMedia(null)}
                  className="px-4 py-2 bg-stone-200 hover:bg-stone-300 text-stone-700 font-bold text-xs rounded-xl transition-colors cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── ADD PHOTO MODAL ── */}
      {isPhotoModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white border border-stone-200 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl space-y-0 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between p-5 bg-[#faf8f4] border-b border-stone-200">
              <div className="flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-amber-800" />
                <h3 className="text-base font-black text-stone-900 font-serif">Add Gallery Photo</h3>
              </div>
              <button
                onClick={() => setIsPhotoModalOpen(false)}
                className="p-1.5 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-stone-200/60 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddPhotoSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1.5 uppercase tracking-wider font-serif">
                  University <span className="text-rose-500">*</span>
                </label>
                <select
                  value={photoForm.university_id}
                  onChange={(e) => setPhotoForm({ ...photoForm, university_id: e.target.value })}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs font-bold text-stone-800 bg-stone-50/70 focus:outline-none focus:border-amber-600 focus:bg-white cursor-pointer"
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
                <label className="block text-xs font-bold text-stone-700 mb-1.5 uppercase tracking-wider font-serif">
                  Photo Title / Caption
                </label>
                <input
                  type="text"
                  placeholder="e.g. Main Campus Library, Research Complex, Student Center..."
                  value={photoForm.title}
                  onChange={(e) => setPhotoForm({ ...photoForm, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs font-medium text-stone-800 bg-stone-50/70 focus:outline-none focus:border-amber-600 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1.5 uppercase tracking-wider font-serif">
                  Upload Photo <span className="text-rose-500">*</span>
                </label>
                <label className="flex flex-col items-center justify-center p-4 border border-dashed border-stone-300 rounded-2xl bg-stone-50 hover:bg-stone-100/80 cursor-pointer transition-colors">
                  <Upload className="w-5 h-5 text-stone-500 mb-1" />
                  <span className="text-xs font-bold text-stone-700">
                    {photoFile ? photoFile.name : 'Choose an image file'}
                  </span>
                  <span className="text-[10px] text-stone-400 mt-0.5">JPG, PNG, WebP up to 10MB</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0] || null;
                      setPhotoFile(file);
                      if (file) {
                        setPhotoPreviewUrl(URL.createObjectURL(file));
                        const autoTitle = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
                        setPhotoForm((prev) => ({
                          ...prev,
                          title: prev.title.trim() ? prev.title : autoTitle,
                        }));
                      } else {
                        setPhotoPreviewUrl(null);
                      }
                    }}
                  />
                </label>

                {photoPreviewUrl && (
                  <div className="mt-3 relative inline-block">
                    <img
                      src={photoPreviewUrl}
                      alt="Preview"
                      className="w-20 h-20 rounded-xl object-cover border border-stone-200 shadow-xs"
                    />
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="is_featured"
                  checked={Boolean(photoForm.is_featured)}
                  onChange={(e) => setPhotoForm({ ...photoForm, is_featured: e.target.checked ? 1 : 0 })}
                  className="rounded border-stone-300 text-amber-700 focus:ring-amber-500 cursor-pointer"
                />
                <label htmlFor="is_featured" className="text-xs font-bold text-stone-700 cursor-pointer select-none">
                  Set as Featured Campus Photo
                </label>
              </div>

              <div className="pt-4 border-t border-stone-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsPhotoModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-stone-200 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs shadow-xs transition-all disabled:opacity-50 cursor-pointer"
                >
                  {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-400" />}
                  <span>{submitting ? 'Uploading...' : 'Add Photo'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── ADD VIDEO MODAL ── */}
      {isVideoModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white border border-stone-200 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl space-y-0 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between p-5 bg-[#faf8f4] border-b border-stone-200">
              <div className="flex items-center gap-2">
                <VideoIcon className="w-4 h-4 text-amber-800" />
                <h3 className="text-base font-black text-stone-900 font-serif">Add University Video</h3>
              </div>
              <button
                onClick={() => setIsVideoModalOpen(false)}
                className="p-1.5 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-stone-200/60 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddVideoSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1.5 uppercase tracking-wider font-serif">
                  University <span className="text-rose-500">*</span>
                </label>
                <select
                  value={videoForm.university_id}
                  onChange={(e) => setVideoForm({ ...videoForm, university_id: e.target.value })}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs font-bold text-stone-800 bg-stone-50/70 focus:outline-none focus:border-amber-600 focus:bg-white cursor-pointer"
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
                <label className="block text-xs font-bold text-stone-700 mb-1.5 uppercase tracking-wider font-serif">
                  Video Title / Caption
                </label>
                <input
                  type="text"
                  placeholder="e.g. Official Campus Tour 2026, Student Life Documentary..."
                  value={videoForm.title}
                  onChange={(e) => setVideoForm({ ...videoForm, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs font-medium text-stone-800 bg-stone-50/70 focus:outline-none focus:border-amber-600 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1.5 uppercase tracking-wider font-serif">
                  Video Embed / URL <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="https://www.youtube.com/watch?v=..."
                  value={videoForm.video_url}
                  onChange={(e) => setVideoForm({ ...videoForm, video_url: e.target.value })}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs font-medium text-stone-800 bg-stone-50/70 focus:outline-none focus:border-amber-600 focus:bg-white font-mono"
                />
              </div>

              <div className="pt-4 border-t border-stone-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsVideoModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-stone-200 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs shadow-xs transition-all disabled:opacity-50 cursor-pointer"
                >
                  {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-400" />}
                  <span>{submitting ? 'Saving...' : 'Add Video'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

