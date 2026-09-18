import React, { useEffect, useState } from 'react';
import { confirmDelete } from '@/lib/swal';
import Pagination from '@/components/common/Pagination';
import { getStorageUrl } from '@/lib/uploadHelper';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Loader2,
  X,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Handshake,
  Eye,
  EyeOff,
  ShieldCheck,
  Star,
  Phone,
  Mail,
  MapPin,
  Briefcase,
  Users
} from 'lucide-react';
import { uploadFileToStorage } from '@/lib/uploadHelper';

interface PartnerItem {
  id: number;
  name: string;
  designation: string;
  company?: string;
  phone?: string;
  email?: string;
  city?: string;
  state?: string;
  country?: string;
  experience_years?: number | string;
  students_placed?: number | string;
  rating?: number | string;
  profile_image?: string;
  specializations?: string;
  is_verified?: boolean | number;
  is_active?: boolean | number;
  created_at?: string;
}

const initialSamplePartners: PartnerItem[] = [
  {
    id: 1,
    name: 'Mohd Faraz Faraz',
    designation: 'WEB DEVELOPER',
    company: 'Britannica Overseas',
    is_verified: false,
    rating: 4.0,
    phone: '9548470490',
    email: 'farazahmad280@gmail.com',
    city: 'Mawana',
    state: 'Uttar Pradesh',
    country: 'INDIA',
    experience_years: 8,
    students_placed: 100,
    specializations: 'Laravel , Node',
    is_active: true,
  },
  {
    id: 2,
    name: 'Aman Ahlawat',
    designation: 'Director',
    company: 'Britannica Overseas Education',
    is_verified: true,
    rating: 5.0,
    phone: '9870406867',
    email: 'amanahlawat1918@gmail.com',
    city: 'Gurgaon',
    state: 'Haryana',
    country: 'INDIA',
    experience_years: 15,
    students_placed: 100,
    specializations: 'Study Abroad',
    is_active: true,
  },
];

export default function OurPartners() {
  const [items, setItems] = useState<PartnerItem[]>(initialSamplePartners);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [profileImageFile, setProfileImageFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    designation: '',
    company: '',
    phone: '',
    email: '',
    city: '',
    state: '',
    country: '',
    experience_years: '0',
    students_placed: '0',
    rating: '5.0',
    profile_image: '',
    specializations: '',
    is_verified: true,
    is_active: true,
  });

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/v1/admin/our-partners');
      if (res.ok) {
        const json = await res.json();
        if ((json.status || json.success) && Array.isArray(json.data) && json.data.length > 0) {
          setItems(json.data);
        } else {
          setItems(initialSamplePartners);
        }
      } else {
        setItems(initialSamplePartners);
      }
    } catch {
      setItems(initialSamplePartners);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenAdd = () => {
    setEditingId(null);
    setProfileImageFile(null);
    setFormData({
      name: '',
      designation: '',
      company: '',
      phone: '',
      email: '',
      city: '',
      state: '',
      country: '',
      experience_years: '0',
      students_placed: '0',
      rating: '5.0',
      profile_image: '',
      specializations: '',
      is_verified: true,
      is_active: true,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: PartnerItem) => {
    setEditingId(item.id);
    setProfileImageFile(null);
    setFormData({
      name: item.name || '',
      designation: item.designation || '',
      company: item.company || '',
      phone: item.phone || '',
      email: item.email || '',
      city: item.city || '',
      state: item.state || '',
      country: item.country || '',
      experience_years: (item.experience_years ?? 0).toString(),
      students_placed: (item.students_placed ?? 0).toString(),
      rating: (item.rating ?? 5.0).toString(),
      profile_image: item.profile_image || '',
      specializations: item.specializations || '',
      is_verified: Boolean(item.is_verified ?? true),
      is_active: Boolean(item.is_active ?? true),
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    const isConfirmed = await confirmDelete('Are you sure you want to delete this partner profile?');
    if (!isConfirmed) return;

    try {
      const res = await fetch(`/api/v1/admin/our-partners/${id}`, { method: 'DELETE' });
      const json = await res.json();

      if (res.ok && (json.status || json.success)) {
        showToast('success', 'Deleted successfully');
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
    if (!formData.name.trim()) {
      showToast('error', 'Partner Name is required');
      return;
    }
    if (!formData.designation.trim()) {
      showToast('error', 'Designation is required');
      return;
    }

    setSubmitting(true);
    try {
      const currentFormData = { ...formData };
      if (profileImageFile) {
        const res = await uploadFileToStorage(profileImageFile, 'our-partners');
        currentFormData.profile_image = res.file_path;
      }

      const url = editingId
        ? `/api/v1/admin/our-partners/${editingId}`
        : '/api/v1/admin/our-partners';
      const method = editingId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(currentFormData),
      });

      const json = await res.json();
      if (res.ok && (json.status || json.success)) {
        showToast('success', editingId ? 'Updated successfully' : 'Created successfully');
        setIsModalOpen(false);
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
    (item.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (item.designation || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (item.company || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (item.country || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (item.email || '').toLowerCase().includes(searchQuery.toLowerCase())
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
            <Handshake className="w-5 h-5 text-emerald-800" /> Our Partners &amp; Representatives
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage university partner representatives, study counselors, experience metrics, and ratings.
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
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-[#14532d] hover:bg-[#0f3e21] text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4 text-emerald-300" />
            <span>Add Partner</span>
          </button>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row gap-4 justify-between items-center">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search name, designation, company..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50/70 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-1 focus:ring-emerald-500 focus:border-emerald-600 focus:bg-white transition-all"
          />
        </div>
        <div className="text-xs text-slate-500">
          Showing <span className="font-bold text-slate-700">{filtered.length}</span> entries
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-[#effaf2] border-b-2 border-[#c8ebd2] text-[#14532d] font-extrabold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3.5 px-4 w-16 text-center text-emerald-700">Sr. No.</th>
                <th className="py-3.5 px-4">Partner Name</th>
                <th className="py-3.5 px-4">Designation &amp; Company</th>
                <th className="py-3.5 px-4">Verified</th>
                <th className="py-3.5 px-4">Rating</th>
                <th className="py-3.5 px-4">Contact</th>
                <th className="py-3.5 px-4">Location</th>
                <th className="py-3.5 px-4">Experience / Placed</th>
                <th className="py-3.5 px-4">Specializations</th>
                <th className="py-3.5 px-4 w-24">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={11} className="py-12 text-center text-slate-400">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-emerald-700" />
                    Loading partners...
                  </td>
                </tr>
              ) : paginated.length === 0 ? (
                <tr>
                  <td colSpan={11} className="py-12 text-center text-slate-400 font-medium">
                    No partners found.
                  </td>
                </tr>
              ) : (
                paginated.map((item, idx) => (
                  <tr key={item.id} className="hover:bg-[#f6fcf8] transition-colors">
                    <td className="py-3.5 px-4 text-center font-bold text-emerald-700">
                      {(currentPage - 1) * itemsPerPage + idx + 1}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-800 flex items-center gap-2">
                      {item.profile_image ? (
                        <img src={getStorageUrl(item.profile_image)} alt={item.name} className="w-8 h-8 rounded-full object-cover border border-[#c8ebd2]" />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-[#effaf2] text-[#14532d] border border-[#c8ebd2] flex items-center justify-center font-bold text-xs">
                          {item.name ? item.name.charAt(0).toUpperCase() : 'P'}
                        </div>
                      )}
                      <span>{item.name}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-800 text-xs">{item.designation}</div>
                      <div className="text-slate-500 text-[11px] flex items-center gap-1 mt-0.5">
                        <Briefcase className="w-3 h-3 text-slate-400" /> {item.company || 'N/A'}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      {Boolean(item.is_verified) ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#effaf2] text-[#14532d] border border-[#c8ebd2] text-[11px] font-bold">
                          <ShieldCheck className="w-3 h-3" /> Yes
                        </span>
                      ) : (
                        <span className="text-slate-400 text-xs">No</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1 text-amber-500 font-bold text-xs">
                        <Star className="w-3 h-3 fill-amber-400" /> {item.rating ?? '0.0'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-xs font-mono">
                      <div className="text-slate-600 flex items-center gap-1">
                        <Phone className="w-3 h-3 text-slate-400" /> {item.phone || '-'}
                      </div>
                      <div className="text-emerald-700 flex items-center gap-1">
                        <Mail className="w-3 h-3 text-emerald-600" /> {item.email || '-'}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-xs text-slate-600">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        {[item.city, item.state, item.country].filter(Boolean).join(', ') || '-'}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-xs">
                      <div className="font-semibold text-slate-700">{item.experience_years ?? 0} yrs exp</div>
                      <div className="text-emerald-700 font-bold flex items-center gap-1 text-[11px]">
                        <Users className="w-3 h-3 text-emerald-600" /> {item.students_placed ?? 0} placed
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-xs text-slate-500 max-w-xs truncate">
                      {item.specializations || '-'}
                    </td>
                    <td className="py-3.5 px-4">
                      {Boolean(item.is_active ?? true) ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-[#effaf2] text-[#14532d] border border-[#c8ebd2] font-bold text-[11px]">
                          <Eye className="w-3 h-3" /> Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-100 text-slate-500 font-bold text-[11px]">
                          <EyeOff className="w-3 h-3" /> Inactive
                        </span>
                      )}
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

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#c8ebd2] bg-[#effaf2]">
              <h3 className="text-sm font-bold text-[#14532d] flex items-center gap-2">
                <Handshake className="w-4 h-4 text-emerald-700" />
                {editingId ? 'Edit Partner Profile' : 'Add Partner Profile'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto flex-1">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1.5">
                    Partner Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Dr. Alex Wong"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs bg-slate-50/70 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-1 focus:ring-emerald-500 focus:border-emerald-600 focus:bg-white transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1.5">
                    Designation <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Senior Representative"
                    value={formData.designation}
                    onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs bg-slate-50/70 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-1 focus:ring-emerald-500 focus:border-emerald-600 focus:bg-white transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1.5">
                    Company / Agency
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. EduGlobal Malaysia"
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs bg-slate-50/70 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-1 focus:ring-emerald-500 focus:border-emerald-600 focus:bg-white transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1.5">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    placeholder="+60 12-345 6789"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs bg-slate-50/70 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-1 focus:ring-emerald-500 focus:border-emerald-600 focus:bg-white transition-all font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1.5">
                    Email Address
                  </label>
                  <input
                    type="email"
                    placeholder="alex@eduglobal.my"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs bg-slate-50/70 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-1 focus:ring-emerald-500 focus:border-emerald-600 focus:bg-white transition-all font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1.5">
                    City
                  </label>
                  <input
                    type="text"
                    placeholder="Kuala Lumpur"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs bg-slate-50/70 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-1 focus:ring-emerald-500 focus:border-emerald-600 focus:bg-white transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1.5">
                    State
                  </label>
                  <input
                    type="text"
                    placeholder="Selangor"
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs bg-slate-50/70 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-1 focus:ring-emerald-500 focus:border-emerald-600 focus:bg-white transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1.5">
                    Country
                  </label>
                  <input
                    type="text"
                    placeholder="Malaysia"
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs bg-slate-50/70 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-1 focus:ring-emerald-500 focus:border-emerald-600 focus:bg-white transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1.5">
                    Experience (Years)
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="e.g. 5"
                    value={formData.experience_years}
                    onChange={(e) => setFormData({ ...formData, experience_years: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs bg-slate-50/70 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-1 focus:ring-emerald-500 focus:border-emerald-600 focus:bg-white transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1.5">
                    Students Placed
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="e.g. 250"
                    value={formData.students_placed}
                    onChange={(e) => setFormData({ ...formData, students_placed: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs bg-slate-50/70 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-1 focus:ring-emerald-500 focus:border-emerald-600 focus:bg-white transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1.5">
                    Star Rating (0-5)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="5"
                    placeholder="e.g. 4.9"
                    value={formData.rating}
                    onChange={(e) => setFormData({ ...formData, rating: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs bg-slate-50/70 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-1 focus:ring-emerald-500 focus:border-emerald-600 focus:bg-white transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1.5">
                  Profile Image
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0] || null;
                    setProfileImageFile(file);
                  }}
                  className="w-full text-xs text-slate-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-[#effaf2] file:text-[#14532d] hover:file:bg-[#dcfce7] cursor-pointer border border-slate-200 rounded-xl bg-slate-50/70"
                />
                {(profileImageFile || formData.profile_image) && (
                  <span className="text-[11px] text-slate-600 mt-1 block truncate">
                    {profileImageFile ? `Selected: ${profileImageFile.name}` : `Current: ${formData.profile_image}`}
                  </span>
                )}
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1.5">
                  Specializations (pipe | or comma separated)
                </label>
                <input
                  type="text"
                  placeholder="e.g. MBBS Admissions | Medical Counseling"
                  value={formData.specializations}
                  onChange={(e) => setFormData({ ...formData, specializations: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs bg-slate-50/70 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-1 focus:ring-emerald-500 focus:border-emerald-600 focus:bg-white transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <label className="flex items-center gap-2 p-3 border border-[#c8ebd2]/70 rounded-xl bg-[#effaf2]/40 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_verified}
                    onChange={(e) => setFormData({ ...formData, is_verified: e.target.checked })}
                    className="w-4 h-4 text-[#14532d] accent-emerald-700 rounded focus:ring-emerald-500"
                  />
                  <span className="text-xs font-bold text-slate-700">Verified Representative Badge</span>
                </label>

                <label className="flex items-center gap-2 p-3 border border-[#c8ebd2]/70 rounded-xl bg-[#effaf2]/40 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    className="w-4 h-4 text-[#14532d] accent-emerald-700 rounded focus:ring-emerald-500"
                  />
                  <span className="text-xs font-bold text-slate-700">Active Public Status</span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center gap-1.5 px-5 py-2 bg-[#14532d] hover:bg-[#0f3e21] text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer disabled:opacity-50"
                >
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>{editingId ? 'Save Changes' : 'Create Partner'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
