import React, { useEffect, useState } from 'react';
import { confirmDelete } from '@/lib/swal';
import Pagination from '@/components/common/Pagination';
import {
  MapPin,
  Search,
  Edit2,
  Trash2,
  Loader2,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Plus,
  RotateCcw,
  X,
  Building2,
  Phone,
  Mail,
  Globe2,
  Compass
} from 'lucide-react';

interface AddressItem {
  id: number;
  country: string;
  city: string;
  mobile: string;
  email: string;
  address: string;
  created_at?: string;
}

interface CountryOption {
  id: number;
  name: string;
}

export default function Addresses() {
  const [items, setItems] = useState<AddressItem[]>([]);
  const [countries, setCountries] = useState<CountryOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [countryFilter, setCountryFilter] = useState('');
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Form State (Default Closed)
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    country: '',
    city: '',
    mobile: '',
    email: '',
    address: '',
  });

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchCountries = async () => {
    try {
      const res = await fetch('/api/v1/countries');
      if (res.ok) {
        const json = await res.json();
        const list = json.data || json || [];
        if (Array.isArray(list)) {
          setCountries(list);
        }
      }
    } catch {
      // Fallback: manual entry allowed
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/v1/admin/addresses');
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
      showToast('error', 'Failed to load addresses');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCountries();
    fetchData();
  }, []);

  const handleOpenAdd = () => {
    setEditingId(null);
    setFormData({
      country: countries[0]?.name || '',
      city: '',
      mobile: '',
      email: '',
      address: '',
    });
    setIsFormOpen(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenEdit = (item: AddressItem) => {
    setEditingId(item.id);
    setFormData({
      country: item.country || '',
      city: item.city || '',
      mobile: item.mobile || '',
      email: item.email || '',
      address: item.address || '',
    });
    setIsFormOpen(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingId(null);
    setFormData({
      country: '',
      city: '',
      mobile: '',
      email: '',
      address: '',
    });
  };

  const handleResetForm = () => {
    if (editingId) {
      const original = items.find((i) => i.id === editingId);
      if (original) {
        setFormData({
          country: original.country || '',
          city: original.city || '',
          mobile: original.mobile || '',
          email: original.email || '',
          address: original.address || '',
        });
        return;
      }
    }
    setFormData({
      country: countries[0]?.name || '',
      city: '',
      mobile: '',
      email: '',
      address: '',
    });
  };

  const handleDelete = async (id: number) => {
    const isConfirmed = await confirmDelete('Are you sure you want to delete this address record?');
    if (!isConfirmed) return;

    try {
      const res = await fetch(`/api/v1/admin/addresses/${id}`, { method: 'DELETE' });
      const json = await res.json();

      if (res.ok && (json.status || json.success)) {
        showToast('success', 'Record deleted successfully');
        if (editingId === id) handleCloseForm();
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
    if (!formData.country.trim() || !formData.city.trim() || !formData.mobile.trim() || !formData.email.trim() || !formData.address.trim()) {
      showToast('error', 'All fields (country, city, mobile, email, address) are required');
      return;
    }

    setSubmitting(true);
    try {
      const url = editingId
        ? `/api/v1/admin/addresses/${editingId}`
        : '/api/v1/admin/addresses';
      const method = editingId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const json = await res.json();
      if (res.ok && (json.status || json.success)) {
        showToast('success', json.message || (editingId ? 'Record has been updated successfully.' : 'Record has been added successfully.'));
        handleCloseForm();
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

  // Unique country values for quick filter
  const uniqueCountries = Array.from(new Set(items.map((i) => i.country).filter(Boolean)));
  const uniqueCities = Array.from(new Set(items.map((i) => i.city).filter(Boolean)));

  const filtered = items.filter((item) => {
    const matchCountry = !countryFilter || item.country === countryFilter;
    const matchSearch =
      (item.country || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.city || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.mobile || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.email || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.address || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchCountry && matchSearch;
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
          className={`fixed top-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-xl text-white text-sm font-semibold transition-all duration-300 ${
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
                <MapPin className="w-3.5 h-3.5 text-amber-700" />
                <span>Physical Locations & Directories</span>
              </span>
              <span className="text-[11px] font-bold text-amber-900 bg-amber-50 border border-amber-200/80 px-2.5 py-0.5 rounded-full">
                Website: MYS Region
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight font-serif">
              Branch & Office Addresses
            </h1>
            <p className="text-xs sm:text-sm text-stone-500 font-medium leading-relaxed">
              Manage physical office locations, contact phones, email channels, and branch address details for student inquiries.
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
                  handleCloseForm();
                } else {
                  handleOpenAdd();
                }
              }}
              className="flex items-center gap-2 px-4.5 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs shadow-md shadow-stone-900/15 transition-all cursor-pointer whitespace-nowrap"
            >
              {isFormOpen && !editingId ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              <span>{isFormOpen && !editingId ? 'Close Form' : '+ Add New Address'}</span>
            </button>
          </div>
        </div>

        {/* ── COMPACT INLINE STAT PILLS ── */}
        <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t border-stone-100">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-stone-50 border border-stone-200/80 text-xs">
            <span className="text-stone-500 font-medium">Total Locations:</span>
            <span className="font-extrabold text-stone-900">{items.length}</span>
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-stone-50 border border-stone-200/80 text-xs">
            <span className="text-stone-500 font-medium">Countries:</span>
            <span className="font-extrabold text-amber-900">{uniqueCountries.length}</span>
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-stone-50 border border-stone-200/80 text-xs">
            <span className="text-stone-500 font-medium">Cities:</span>
            <span className="font-extrabold text-emerald-900">{uniqueCities.length}</span>
          </div>

          {searchQuery && (
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200/80 text-xs">
              <span className="text-amber-800 font-medium">Filtered:</span>
              <span className="font-extrabold text-amber-950">{filtered.length} entries</span>
            </div>
          )}
        </div>
      </div>

      {/* ── COLLAPSIBLE ADD / EDIT FORM CARD ── */}
      {isFormOpen && (
        <div className="bg-white rounded-3xl border border-stone-200/90 shadow-sm p-6 sm:p-7 relative transition-all duration-300">
          <div className="flex items-center justify-between border-b border-stone-100 pb-4 mb-5">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#eef5ff] border border-[#cfe0fc] flex items-center justify-center text-[#1e40af] shadow-2xs">
                {editingId ? <Edit2 className="w-4.5 h-4.5" /> : <Plus className="w-4.5 h-4.5" />}
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-bold text-stone-900 font-serif">
                  {editingId ? `Update Address Location #${editingId}` : 'Add New Address Location'}
                </h2>
                <p className="text-xs text-stone-400 font-medium">
                  {editingId ? 'Modify office details and save changes' : 'Provide accurate contact and address details for public directories'}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleCloseForm}
              className="p-2 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-xl transition-colors cursor-pointer"
              title="Close editor"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <Globe2 className="w-3.5 h-3.5 text-stone-400" />
                  <span>Country</span>
                  <span className="text-rose-500">*</span>
                </label>
                {countries.length > 0 ? (
                  <select
                    required
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-xs font-medium bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-stone-400 focus:bg-white transition-all shadow-2xs"
                  >
                    <option value="">Select Country</option>
                    {countries.map((c) => (
                      <option key={c.id || c.name} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    required
                    placeholder="e.g. Malaysia"
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-xs font-medium bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-stone-400 focus:bg-white transition-all shadow-2xs"
                  />
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <Compass className="w-3.5 h-3.5 text-stone-400" />
                  <span>City</span>
                  <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Kuala Lumpur"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs font-medium bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-stone-400 focus:bg-white transition-all shadow-2xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-stone-400" />
                  <span>Mobile / Phone</span>
                  <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="+60 12-345 6789"
                  value={formData.mobile}
                  onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs font-mono font-medium bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-stone-400 focus:bg-white transition-all shadow-2xs text-stone-800"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-stone-400" />
                  <span>Email Address</span>
                  <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  placeholder="info@educationmalaysia.in"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs font-mono font-medium bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-stone-400 focus:bg-white transition-all shadow-2xs text-stone-800"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-stone-400" />
                <span>Full Street Address</span>
                <span className="text-rose-500">*</span>
              </label>
              <textarea
                required
                rows={2}
                placeholder="Suite / Level / Building Name, Street Road, Postal Code..."
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full px-3.5 py-2.5 text-xs font-medium bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-stone-400 focus:bg-white transition-all shadow-2xs resize-none"
              />
            </div>

            <div className="flex items-center justify-between gap-3 pt-2 border-t border-stone-100">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleResetForm}
                  className="flex items-center gap-1.5 px-3.5 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Reset
                </button>
                <button
                  type="button"
                  onClick={handleCloseForm}
                  className="flex items-center gap-1.5 px-3.5 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" /> Cancel
                </button>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="flex items-center gap-2 px-6 py-2.5 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-bold shadow-md shadow-stone-900/15 transition-all cursor-pointer disabled:opacity-50"
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                <span>{editingId ? 'Update Address' : 'Save Address'}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ── TABLE CARD ── */}
      <div className="bg-white rounded-3xl border border-stone-200/90 shadow-xs overflow-hidden">
        {/* Controls Bar */}
        <div className="p-4 sm:p-5 border-b border-stone-100 flex flex-col sm:flex-row gap-3 justify-between items-center bg-[#faf8f4]/60">
          <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
            {/* Search Input */}
            <div className="relative flex-1 sm:w-80">
              <Search className="w-3.5 h-3.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Search country, city, phone, email, address..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-9 pr-8 py-2 text-xs font-medium bg-white border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-stone-400 transition-all shadow-2xs placeholder-stone-400"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 text-stone-400 hover:text-stone-700 rounded-md"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Country Filter Dropdown */}
            {uniqueCountries.length > 1 && (
              <select
                value={countryFilter}
                onChange={(e) => {
                  setCountryFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-3 py-2 text-xs font-bold bg-white border border-stone-200 rounded-xl text-stone-700 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-stone-400 shadow-2xs cursor-pointer"
              >
                <option value="">All Countries ({uniqueCountries.length})</option>
                {uniqueCountries.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="flex items-center gap-2 text-xs text-stone-500 shrink-0 w-full sm:w-auto justify-between sm:justify-end">
            <span>
              Showing <strong className="text-stone-900 font-extrabold">{filtered.length}</strong> {filtered.length === 1 ? 'entry' : 'entries'}
            </span>
            {!isFormOpen && (
              <button
                type="button"
                onClick={handleOpenAdd}
                className="inline-flex sm:hidden items-center gap-1.5 px-3 py-1.5 bg-stone-900 text-white rounded-lg text-xs font-bold"
              >
                <Plus className="w-3.5 h-3.5" /> Add
              </button>
            )}
          </div>
        </div>

        {/* Table View */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-stone-600">
            <thead className="bg-[#eef5ff] border-b border-[#cfe0fc] text-[#1e40af] font-extrabold uppercase text-[10.5px] tracking-wider">
              <tr>
                <th className="py-3.5 px-4 w-16">Sr. No.</th>
                <th className="py-3.5 px-4">Country</th>
                <th className="py-3.5 px-4">City</th>
                <th className="py-3.5 px-4">Mobile / Phone</th>
                <th className="py-3.5 px-4">Email Address</th>
                <th className="py-3.5 px-4">Full Address</th>
                <th className="py-3.5 px-4 text-center w-28">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-14 text-center text-stone-400">
                    <Loader2 className="w-7 h-7 animate-spin mx-auto mb-2.5 text-stone-700" />
                    <span className="font-semibold text-xs text-stone-600">Loading branch address records...</span>
                  </td>
                </tr>
              ) : paginated.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-14 text-center text-stone-400">
                    <div className="w-12 h-12 rounded-2xl bg-stone-100 border border-stone-200 text-stone-400 flex items-center justify-center mx-auto mb-3">
                      <MapPin className="w-6 h-6" />
                    </div>
                    <p className="text-sm font-bold text-stone-700">No Address Records Found</p>
                    <p className="text-xs text-stone-400 mt-1">
                      {searchQuery ? `No results matching "${searchQuery}"` : 'Get started by creating your first office location'}
                    </p>
                    {!isFormOpen && (
                      <button
                        type="button"
                        onClick={handleOpenAdd}
                        className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-sm"
                      >
                        <Plus className="w-3.5 h-3.5" /> Add First Address
                      </button>
                    )}
                  </td>
                </tr>
              ) : (
                paginated.map((item, index) => {
                  const srNo = (currentPage - 1) * itemsPerPage + index + 1;
                  const isEditingThis = editingId === item.id;
                  return (
                    <tr
                      key={item.id}
                      className={`transition-colors ${
                        isEditingThis ? 'bg-blue-50/60' : 'hover:bg-[#faf8f4]/80'
                      }`}
                    >
                      <td className="py-3.5 px-4 font-bold text-stone-400">{srNo}</td>
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-stone-100 border border-stone-200/80 font-bold text-stone-900 text-xs">
                          <Globe2 className="w-3.5 h-3.5 text-blue-700 shrink-0" />
                          <span>{item.country}</span>
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-bold text-stone-900">{item.city}</td>
                      <td className="py-3.5 px-4 font-mono font-medium text-stone-700">
                        <div className="flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                          <span>{item.mobile}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-mono font-medium text-stone-800">
                        <div className="flex items-center gap-1.5">
                          <Mail className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                          <span className="truncate max-w-[200px]">{item.email}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-stone-600 max-w-xs truncate" title={item.address}>
                        {item.address}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => handleOpenEdit(item)}
                            className="p-1.5 bg-[#eef5ff] text-[#1e40af] hover:bg-[#dbeafe] rounded-lg transition-colors cursor-pointer shadow-2xs"
                            title="Edit Address"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="p-1.5 bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white rounded-lg transition-colors cursor-pointer"
                            title="Delete Address"
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
          <div className="p-4 border-t border-stone-100 flex flex-col sm:flex-row items-center justify-between gap-3 bg-stone-50/50">
            <div className="text-xs text-stone-500 font-medium">
              Showing <span className="font-bold text-stone-800">{(currentPage - 1) * itemsPerPage + 1}</span> to{' '}
              <span className="font-bold text-stone-800">
                {Math.min(currentPage * itemsPerPage, filtered.length)}
              </span>{' '}
              of <span className="font-bold text-stone-800">{filtered.length}</span> total entries
            </div>
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
