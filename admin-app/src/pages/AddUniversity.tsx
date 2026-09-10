import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Building2,
  ArrowLeft,
  Save,
  RotateCcw,
  Loader2,
  CheckCircle2,
  AlertCircle,
  FileText,
  Search,
  Image as ImageIcon
} from 'lucide-react';

interface InstituteTypeOption {
  id: number;
  type: string;
}

export default function AddUniversity() {
  const navigate = useNavigate();
  const { id } = useParams<{ id?: string }>();
  const isEdit = Boolean(id);

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [instituteTypes, setInstituteTypes] = useState<InstituteTypeOption[]>([]);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    uname: '',
    views: '0',
    city: '',
    state: '',
    institute_type: '',
    rating: '',
    qs_rank: '',
    qs_asia_rank: '',
    times_rank: '',
    author_id: '',
    logo_path: '',
    banner_path: '',
    latitude_longitude: '',
    local_students: '',
    international_students: '',
    contact_number1: '',
    contact_number2: '',
    established_year: '',
    email: '',
    cc: '',
    bcc: '',
    featured: false,
    is_local: false,
    is_international: false,
    scholarship_available: false,
    shortnote: '',
    approved_by: '',
    accredited_by: '',
    hostel_facility: '',
    page_content: '',
    meta_title: '',
    meta_keyword: '',
    meta_description: '',
    seo_rating: '',
    best_rating: '',
    review_number: '',
    og_image_path: '',
    status: 1
  });

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  useEffect(() => {
    fetchInstituteTypes();
    if (id) {
      fetchUniversityData(id);
    }
  }, [id]);

  const fetchInstituteTypes = async () => {
    try {
      const res = await fetch('/api/v1/admin/institute-types');
      const json = await res.json();
      if (res.ok && json.data) {
        setInstituteTypes(json.data);
      }
    } catch (e) {
      console.error('Failed to load institute types', e);
    }
  };

  const fetchUniversityData = async (uniId: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/v1/admin/universities/${uniId}`);
      const json = await res.json();
      if (res.ok && json.data) {
        const d = json.data;
        setFormData({
          name: d.name || '',
          uname: d.uname || '',
          views: d.views || '0',
          city: d.city || '',
          state: d.state || '',
          institute_type: d.institute_type ? String(d.institute_type) : '',
          rating: d.rating !== null && d.rating !== undefined ? String(d.rating) : '',
          qs_rank: d.qs_rank || '',
          qs_asia_rank: d.qs_asia_rank || '',
          times_rank: d.times_rank || '',
          author_id: d.author_id ? String(d.author_id) : '',
          logo_path: d.logo_path || '',
          banner_path: d.banner_path || '',
          latitude_longitude: d.latitude_longitude || '',
          local_students: d.local_students !== null && d.local_students !== undefined ? String(d.local_students) : '',
          international_students: d.international_students !== null && d.international_students !== undefined ? String(d.international_students) : '',
          contact_number1: d.contact_number1 || '',
          contact_number2: d.contact_number2 || '',
          established_year: d.established_year || '',
          email: d.email || '',
          cc: d.cc || '',
          bcc: d.bcc || '',
          featured: Boolean(d.featured),
          is_local: Boolean(d.is_local),
          is_international: Boolean(d.is_international),
          scholarship_available: Boolean(d.scholarship_available),
          shortnote: d.shortnote || '',
          approved_by: d.approved_by || '',
          accredited_by: d.accredited_by || '',
          hostel_facility: d.hostel_facility || '',
          page_content: d.page_content || '',
          meta_title: d.meta_title || '',
          meta_keyword: d.meta_keyword || '',
          meta_description: d.meta_description || '',
          seo_rating: d.seo_rating !== null && d.seo_rating !== undefined ? String(d.seo_rating) : '',
          best_rating: d.best_rating !== null && d.best_rating !== undefined ? String(d.best_rating) : '',
          review_number: d.review_number !== null && d.review_number !== undefined ? String(d.review_number) : '',
          og_image_path: d.og_image_path || '',
          status: d.status !== undefined ? Number(d.status) : 1
        });
      } else {
        showToast('error', 'University not found');
      }
    } catch {
      showToast('error', 'Failed to fetch university details');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      showToast('error', 'University name is required');
      return;
    }

    setSubmitting(true);
    try {
      const url = isEdit ? `/api/v1/admin/universities/${id}` : '/api/v1/admin/universities';
      const method = isEdit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const json = await res.json();
      if (res.ok && json.status) {
        showToast('success', isEdit ? 'University updated successfully' : 'University created successfully');
        setTimeout(() => {
          navigate('/universities');
        }, 1200);
      } else {
        showToast('error', json.message || 'Failed to save university');
      }
    } catch {
      showToast('error', 'Connection error while saving university');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed top-5 right-5 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg text-white font-semibold text-sm transition-all ${
            toast.type === 'success' ? 'bg-emerald-600' : 'bg-rose-600'
          }`}
        >
          {toast.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          {toast.message}
        </div>
      )}

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/universities')}
            className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            title="Back to Universities"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Building2 className="w-6 h-6 text-indigo-600" />
              {isEdit ? 'Edit University' : 'Add New University'}
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Fill in all details to {isEdit ? 'update' : 'create'} a university record
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information Card */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-6">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Building2 className="w-5 h-5 text-indigo-600" />
            <h3 className="font-extrabold text-sm text-slate-900 uppercase tracking-wider">Basic Information</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="e.g. Universiti Malaya"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Slug (uname)
              </label>
              <input
                type="text"
                name="uname"
                value={formData.uname}
                onChange={handleChange}
                placeholder="Auto-generated if left blank"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Views</label>
              <input
                type="text"
                name="views"
                value={formData.views}
                onChange={handleChange}
                placeholder="0"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">City</label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                placeholder="e.g. Kuala Lumpur"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">State</label>
              <input
                type="text"
                name="state"
                value={formData.state}
                onChange={handleChange}
                placeholder="e.g. Selangor"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Institute Type</label>
              <select
                name="institute_type"
                value={formData.institute_type}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              >
                <option value="">-- Select Type --</option>
                {instituteTypes.map((it) => (
                  <option key={it.id} value={it.id}>
                    {it.type}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">SETARA Rating</label>
              <input
                type="number"
                step="0.1"
                min="1"
                max="5"
                name="rating"
                value={formData.rating}
                onChange={handleChange}
                placeholder="e.g. 5"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">QS World Ranking</label>
              <input
                type="text"
                name="qs_rank"
                value={formData.qs_rank}
                onChange={handleChange}
                placeholder="e.g. 58"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">QS Asia Ranking</label>
              <input
                type="text"
                name="qs_asia_rank"
                value={formData.qs_asia_rank}
                onChange={handleChange}
                placeholder="e.g. 15"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">The Times</label>
              <input
                type="text"
                name="times_rank"
                value={formData.times_rank}
                onChange={handleChange}
                placeholder="e.g. 201-250"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Author ID</label>
              <input
                type="number"
                name="author_id"
                value={formData.author_id}
                onChange={handleChange}
                placeholder="Author ID"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Established Year</label>
              <input
                type="text"
                name="established_year"
                value={formData.established_year}
                onChange={handleChange}
                placeholder="e.g. 1961"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Latitude Longitude</label>
              <input
                type="text"
                name="latitude_longitude"
                value={formData.latitude_longitude}
                onChange={handleChange}
                placeholder="e.g. 3.1222, 101.6569"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Local Students</label>
              <input
                type="number"
                name="local_students"
                value={formData.local_students}
                onChange={handleChange}
                placeholder="0"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">International Students</label>
              <input
                type="number"
                name="international_students"
                value={formData.international_students}
                onChange={handleChange}
                placeholder="0"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Contact Number 1</label>
              <input
                type="text"
                name="contact_number1"
                value={formData.contact_number1}
                onChange={handleChange}
                placeholder="Primary phone"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Contact Number 2</label>
              <input
                type="text"
                name="contact_number2"
                value={formData.contact_number2}
                onChange={handleChange}
                placeholder="Secondary phone"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Contact Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="info@university.edu.my"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">Email CC (comma separated)</label>
              <input
                type="text"
                name="cc"
                value={formData.cc}
                onChange={handleChange}
                placeholder="cc1@example.com, cc2@example.com"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">Email BCC (comma separated)</label>
              <input
                type="text"
                name="bcc"
                value={formData.bcc}
                onChange={handleChange}
                placeholder="bcc1@example.com, bcc2@example.com"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Feature Checkboxes */}
          <div className="pt-4 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-4 gap-4">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                name="featured"
                checked={formData.featured}
                onChange={handleChange}
                className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500 cursor-pointer"
              />
              <span className="text-xs font-bold text-slate-700">Featured</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                name="is_local"
                checked={formData.is_local}
                onChange={handleChange}
                className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500 cursor-pointer"
              />
              <span className="text-xs font-bold text-slate-700">Is Local</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                name="is_international"
                checked={formData.is_international}
                onChange={handleChange}
                className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500 cursor-pointer"
              />
              <span className="text-xs font-bold text-slate-700">Is International</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                name="scholarship_available"
                checked={formData.scholarship_available}
                onChange={handleChange}
                className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500 cursor-pointer"
              />
              <span className="text-xs font-bold text-slate-700">Scholarship Available</span>
            </label>
          </div>
        </div>

        {/* Notes & Facilities Card */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-6">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <FileText className="w-5 h-5 text-indigo-600" />
            <h3 className="font-extrabold text-sm text-slate-900 uppercase tracking-wider">Notes & Facilities</h3>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Shortnote</label>
              <textarea
                name="shortnote"
                rows={3}
                value={formData.shortnote}
                onChange={handleChange}
                placeholder="Brief summary about the university"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 resize-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Approved By (Separated by |)
              </label>
              <input
                type="text"
                name="approved_by"
                value={formData.approved_by}
                onChange={handleChange}
                placeholder="MQA | Ministry of Higher Education"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Accredited by (Separated by |)
                </label>
                <textarea
                  name="accredited_by"
                  rows={3}
                  value={formData.accredited_by}
                  onChange={handleChange}
                  placeholder="Accreditation body 1 | Accreditation body 2"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Hostel Facility (Separated by |)
                </label>
                <textarea
                  name="hostel_facility"
                  rows={3}
                  value={formData.hostel_facility}
                  onChange={handleChange}
                  placeholder="Single Room | Twin Sharing | On-campus WiFi"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 resize-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Media Assets Card */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-6">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <ImageIcon className="w-5 h-5 text-indigo-600" />
            <h3 className="font-extrabold text-sm text-slate-900 uppercase tracking-wider">Images & Media Assets</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Logo Path / URL</label>
              <input
                type="text"
                name="logo_path"
                value={formData.logo_path}
                onChange={handleChange}
                placeholder="uploads/university/logo.png"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Banner Path / URL</label>
              <input
                type="text"
                name="banner_path"
                value={formData.banner_path}
                onChange={handleChange}
                placeholder="uploads/university/banner.jpg"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">OG Image Path / URL</label>
              <input
                type="text"
                name="og_image_path"
                value={formData.og_image_path}
                onChange={handleChange}
                placeholder="https://www.educationmalaysia.in/..."
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* SEO & Page Content Card */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-6">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Search className="w-5 h-5 text-indigo-600" />
            <h3 className="font-extrabold text-sm text-slate-900 uppercase tracking-wider">SEO & Page Content</h3>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Page Content</label>
              <textarea
                name="page_content"
                rows={4}
                value={formData.page_content}
                onChange={handleChange}
                placeholder="Detailed page content HTML or text"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 resize-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Meta Title</label>
              <input
                type="text"
                name="meta_title"
                value={formData.meta_title}
                onChange={handleChange}
                placeholder="Study at Universiti Malaya 2026"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Meta Keywords</label>
              <input
                type="text"
                name="meta_keyword"
                value={formData.meta_keyword}
                onChange={handleChange}
                placeholder="Universiti Malaya, Courses, Fees, Malaysia"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Meta Description</label>
              <textarea
                name="meta_description"
                rows={3}
                value={formData.meta_description}
                onChange={handleChange}
                placeholder="A top-ranked institution offering world-class education..."
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 resize-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">SEO Rating</label>
                <input
                  type="number"
                  name="seo_rating"
                  value={formData.seo_rating}
                  onChange={handleChange}
                  placeholder="e.g. 5"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Best Rating</label>
                <input
                  type="number"
                  name="best_rating"
                  value={formData.best_rating}
                  onChange={handleChange}
                  placeholder="e.g. 5"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Review Number</label>
                <input
                  type="number"
                  name="review_number"
                  value={formData.review_number}
                  onChange={handleChange}
                  placeholder="Total reviews count"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4">
          <button
            type="button"
            onClick={() => navigate('/universities')}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20 transition-all disabled:opacity-50 cursor-pointer"
          >
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {isEdit ? 'Update University' : 'Submit University'}
          </button>
        </div>
      </form>
    </div>
  );
}
