import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { confirmDelete } from '@/lib/swal';
import Pagination from '@/components/common/Pagination';
import RichTextEditor from '@/components/common/RichTextEditor';
import {
  Plus,
  Minus,
  Edit2,
  Trash2,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Building2,
  FileSpreadsheet,
  Download,
  Search,
  RotateCcw,
  BookOpen,
  FileText,
  GraduationCap,
  Image as ImageIcon,
  Video,
  Trophy,
  Layers,
  Calendar,
  Clock,
  DollarSign,
  Tag,
  Globe,
  Info
} from 'lucide-react';

interface UniversityItem {
  id: number;
  name: string;
}

interface CategoryItem {
  id: number;
  name: string;
}

interface SpecializationItem {
  id: number;
  name: string;
  course_category_id?: number;
}

interface ProgramItem {
  id: number;
  course_name: string;
  slug?: string;
  level?: string;
  duration?: string;
  study_mode?: string;
  intake?: string;
  application_deadline?: string;
  campus?: string;
  accreditations?: string;
  is_local?: number;
  is_international?: number;

  overview?: string;
  entry_requirement?: string;
  exam_required?: string;
  mode_of_instruction?: string;
  scholarship_info?: string;
  courses_description?: string;

  tution_fee?: string;
  total_fee?: string;
  total_tuition_fee?: string;
  annual_tuition_fee?: string;
  year1_tuition_fee?: string;
  year2_tuition_fee?: string;
  year3_tuition_fee?: string;
  year4_tuition_fee?: string;
  registration_fee?: string;
  laboratory_fee?: string;
  library_fee?: string;
  technology_fee?: string;
  student_activity_fee?: string;
  insurance_fee?: string;
  examination_fee?: string;
  application_fee?: string;
  emgs_processing_fee?: string;
  international_student_fee?: string;
  international_security_deposit?: string;
  international_student_charge?: string;
  international_administration_fee?: string;
  personal_bond_fee?: string;
  resources_fee?: string;
  commitment_fee?: string;
  facilities_fee?: string;
  accommodation_fee?: string;
  airport_pickup_fee?: string;
  other_fee?: string;
  scholarship_amount?: string;
  tution_fee_after_scholarship?: string;
  currency?: string;
  additional_note?: string;

  anual_tuition_fee_local?: string;
  year1_tuition_fee_local?: string;
  year2_tuition_fee_local?: string;
  year3_tuition_fee_local?: string;
  year4_tuition_fee_local?: string;
  total_tuition_fee_local?: string;

  meta_title?: string;
  meta_keyword?: string;
  meta_description?: string;
  page_content?: string;

  university_id?: number;
  university_name?: string;
  course_category_id?: number;
  category_name?: string;
  specialization_id?: number;
  specialization_name?: string;
  status?: number;
  created_at?: string;
}

export default function Programs() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const queryUnivId = searchParams.get('university_id') || '';

  const [programs, setPrograms] = useState<ProgramItem[]>([]);
  const [universities, setUniversities] = useState<UniversityItem[]>([]);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [specializations, setSpecializations] = useState<SpecializationItem[]>([]);
  const [selectedUnivId, setSelectedUnivId] = useState<string>(queryUnivId);

  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Form Visibility & Sub-Tabs
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [activeFormTab, setActiveFormTab] = useState<'basic' | 'overview' | 'intl_fees' | 'local_fees' | 'seo'>('basic');

  // Pagination & Sorting
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [sortBy, setSortBy] = useState<'Date' | 'Name'>('Date');
  const [sortOrder, setSortOrder] = useState<'DESC' | 'ASC'>('DESC');

  // Form State
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const initialFormState = {
    university_id: '',
    course_category_id: '',
    specialization_id: '',
    course_name: '',
    level: 'Bachelor',
    duration: '',
    study_mode: 'BY COURSEWORK, FULL TIME',
    intake: 'Jan, Mar, Sep',
    application_deadline: 'Dec, Feb, Aug',
    campus: '',
    accreditations: 'N/A',
    is_local: false,
    is_international: false,

    overview: '',
    entry_requirement: '',
    exam_required: '',
    mode_of_instruction: '',
    scholarship_info: '',
    courses_description: '',

    tution_fee: '',
    total_fee: '',
    total_tuition_fee: '',
    annual_tuition_fee: '',
    year1_tuition_fee: '',
    year2_tuition_fee: '',
    year3_tuition_fee: '',
    year4_tuition_fee: '',
    registration_fee: '',
    laboratory_fee: '',
    library_fee: '',
    technology_fee: '',
    student_activity_fee: '',
    insurance_fee: '',
    examination_fee: '',
    application_fee: '',
    emgs_processing_fee: '',
    international_student_fee: '',
    international_security_deposit: '',
    international_student_charge: '',
    international_administration_fee: '',
    personal_bond_fee: '',
    resources_fee: '',
    commitment_fee: '',
    facilities_fee: '',
    accommodation_fee: '',
    airport_pickup_fee: '',
    other_fee: '',
    scholarship_amount: '',
    tution_fee_after_scholarship: '',
    currency: 'MYR',
    additional_note: '',

    anual_tuition_fee_local: '',
    year1_tuition_fee_local: '',
    year2_tuition_fee_local: '',
    year3_tuition_fee_local: '',
    year4_tuition_fee_local: '',
    total_tuition_fee_local: '',

    meta_title: '',
    meta_keyword: '',
    meta_description: '',
    page_content: '',
    status: 1,
  };

  const [formData, setFormData] = useState(initialFormState);

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchDropdownData = async () => {
    try {
      const [uRes, cRes, sRes] = await Promise.all([
        fetch('/api/v1/admin/universities'),
        fetch('/api/v1/admin/course-categories'),
        fetch('/api/v1/admin/course-specializations'),
      ]);

      const [uJson, cJson, sJson] = await Promise.all([uRes.json(), cRes.json(), sRes.json()]);

      if (uRes.ok && (uJson.status || uJson.success)) setUniversities(uJson.data || []);
      if (cRes.ok && (cJson.status || cJson.success)) setCategories(cJson.data || []);
      if (sRes.ok && (sJson.status || sJson.success)) setSpecializations(sJson.data || []);
    } catch {
      console.error('Failed to fetch dropdown datasets');
    }
  };

  const fetchPrograms = async (univId?: string) => {
    const targetId = univId !== undefined ? univId : selectedUnivId;
    setLoading(true);
    try {
      const url = targetId
        ? `/api/v1/admin/programs?university_id=${targetId}`
        : '/api/v1/admin/programs';
      const res = await fetch(url);
      const json = await res.json();
      if (res.ok && json.status) {
        setPrograms(json.data || []);
      } else {
        showToast('error', json.message || 'Failed to load degree programs');
      }
    } catch {
      showToast('error', 'Connection error while fetching programs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDropdownData();
    if (queryUnivId) {
      setSelectedUnivId(queryUnivId);
    }
  }, [queryUnivId]);

  useEffect(() => {
    fetchPrograms(selectedUnivId);
  }, [selectedUnivId]);

  const handleUniversityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setSelectedUnivId(val);
    if (val) {
      navigate(`/programs?university_id=${val}`);
    } else {
      navigate('/programs');
    }
  };

  const handleResetForm = () => {
    setEditingId(null);
    setFormData({
      ...initialFormState,
      university_id: selectedUnivId,
      course_category_id: categories[0]?.id ? String(categories[0].id) : '',
      specialization_id: specializations[0]?.id ? String(specializations[0].id) : '',
    });
  };

  const handleOpenEdit = (item: ProgramItem) => {
    setEditingId(item.id);
    setFormData({
      university_id: item.university_id ? String(item.university_id) : selectedUnivId,
      course_category_id: item.course_category_id ? String(item.course_category_id) : '',
      specialization_id: item.specialization_id ? String(item.specialization_id) : '',
      course_name: item.course_name || '',
      level: item.level || 'Bachelor',
      duration: item.duration || '',
      study_mode: item.study_mode || 'BY COURSEWORK, FULL TIME',
      intake: item.intake || '',
      application_deadline: item.application_deadline || '',
      campus: item.campus || '',
      accreditations: item.accreditations || 'N/A',
      is_local: item.is_local === 1,
      is_international: item.is_international === 1,

      overview: item.overview || '',
      entry_requirement: item.entry_requirement || '',
      exam_required: item.exam_required || '',
      mode_of_instruction: item.mode_of_instruction || '',
      scholarship_info: item.scholarship_info || '',
      courses_description: item.courses_description || '',

      tution_fee: item.tution_fee || '',
      total_fee: item.total_fee || '',
      total_tuition_fee: item.total_tuition_fee || '',
      annual_tuition_fee: item.annual_tuition_fee || '',
      year1_tuition_fee: item.year1_tuition_fee || '',
      year2_tuition_fee: item.year2_tuition_fee || '',
      year3_tuition_fee: item.year3_tuition_fee || '',
      year4_tuition_fee: item.year4_tuition_fee || '',
      registration_fee: item.registration_fee || '',
      laboratory_fee: item.laboratory_fee || '',
      library_fee: item.library_fee || '',
      technology_fee: item.technology_fee || '',
      student_activity_fee: item.student_activity_fee || '',
      insurance_fee: item.insurance_fee || '',
      examination_fee: item.examination_fee || '',
      application_fee: item.application_fee || '',
      emgs_processing_fee: item.emgs_processing_fee || '',
      international_student_fee: item.international_student_fee || '',
      international_security_deposit: item.international_security_deposit || '',
      international_student_charge: item.international_student_charge || '',
      international_administration_fee: item.international_administration_fee || '',
      personal_bond_fee: item.personal_bond_fee || '',
      resources_fee: item.resources_fee || '',
      commitment_fee: item.commitment_fee || '',
      facilities_fee: item.facilities_fee || '',
      accommodation_fee: item.accommodation_fee || '',
      airport_pickup_fee: item.airport_pickup_fee || '',
      other_fee: item.other_fee || '',
      scholarship_amount: item.scholarship_amount || '',
      tution_fee_after_scholarship: item.tution_fee_after_scholarship || '',
      currency: item.currency || 'MYR',
      additional_note: item.additional_note || '',

      anual_tuition_fee_local: item.anual_tuition_fee_local || '',
      year1_tuition_fee_local: item.year1_tuition_fee_local || '',
      year2_tuition_fee_local: item.year2_tuition_fee_local || '',
      year3_tuition_fee_local: item.year3_tuition_fee_local || '',
      year4_tuition_fee_local: item.year4_tuition_fee_local || '',
      total_tuition_fee_local: item.total_tuition_fee_local || '',

      meta_title: item.meta_title || '',
      meta_keyword: item.meta_keyword || '',
      meta_description: item.meta_description || '',
      page_content: item.page_content || '',
      status: item.status !== undefined ? item.status : 1,
    });
    setIsFormOpen(true);
    setActiveFormTab('basic');
    window.scrollTo({ top: 350, behavior: 'smooth' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.course_name.trim()) {
      showToast('error', 'Please enter a course name');
      return;
    }

    setSubmitting(true);
    try {
      const url = editingId ? `/api/v1/admin/programs/${editingId}` : '/api/v1/admin/programs';
      const method = editingId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          university_id: formData.university_id || selectedUnivId,
        }),
      });

      const json = await res.json();
      if (res.ok && json.status) {
        showToast('success', json.message || (editingId ? 'Program updated!' : 'Program created!'));
        handleResetForm();
        setIsFormOpen(false);
        fetchPrograms(selectedUnivId);
      } else {
        showToast('error', json.message || 'Action failed');
      }
    } catch {
      showToast('error', 'Connection error occurred');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number, name: string) => {
    const isConfirmed = await confirmDelete(
      'Delete Program / Course?',
      `Are you sure you want to delete program "${name}"? This action cannot be undone.`
    );
    if (!isConfirmed) return;

    try {
      const res = await fetch(`/api/v1/admin/programs/${id}`, { method: 'DELETE' });
      const json = await res.json();
      if (res.ok && json.status) {
        showToast('success', `Program "${name}" deleted successfully`);
        fetchPrograms(selectedUnivId);
      } else {
        showToast('error', json.message || 'Failed to delete program');
      }
    } catch {
      showToast('error', 'Connection error while deleting program');
    }
  };

  const selectedUniv = universities.find((u) => u.id.toString() === selectedUnivId);

  // Filtered & Sorted
  const filtered = programs.filter(
    (item) =>
      item.course_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.specialization_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.level?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === 'Name') {
      const comp = (a.course_name || '').localeCompare(b.course_name || '');
      return sortOrder === 'ASC' ? comp : -comp;
    } else {
      const idA = a.id || 0;
      const idB = b.id || 0;
      return sortOrder === 'ASC' ? idA - idB : idB - idA;
    }
  });

  const paginated = sorted.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // CSV Export Helper
  const escapeCSV = (val: any) => {
    if (val === null || val === undefined) return '""';
    const str = String(val).replace(/"/g, '""');
    return `"${str}"`;
  };

  const downloadCSV = (filename: string, headers: string[], rows: (string | number)[][]) => {
    const csvContent = '\uFEFF' + [
      headers.join(','),
      ...rows.map((row) => row.map(escapeCSV).join(','))
    ].join('\r\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleExportDetails = () => {
    if (sorted.length === 0) {
      showToast('error', 'No program records available to export.');
      return;
    }
    const headers = [
      'id', 'course_name', 'course_category_id', 'specialization_id', 'level',
      'duration', 'study_mode', 'intake', 'application_deadline', 'campus',
      'overview', 'entry_requirement', 'exam_required', 'mode_of_instruction',
      'scholarship_info', 'is_local', 'is_international', 'accreditations'
    ];

    const rows = sorted.map((item) => [
      item.id,
      item.course_name || '',
      item.course_category_id || '',
      item.specialization_id || '',
      item.level || '',
      item.duration || '',
      item.study_mode || '',
      item.intake || '',
      item.application_deadline || '',
      item.campus || '',
      item.overview || '',
      item.entry_requirement || '',
      item.exam_required || '',
      item.mode_of_instruction || '',
      item.scholarship_info || '',
      item.is_local ? 1 : 0,
      item.is_international ? 1 : 0,
      item.accreditations || ''
    ]);

    const univName = selectedUniv?.name ? selectedUniv.name.toLowerCase().replace(/[^a-z0-9]/g, '_') : 'all';
    const filename = `${univName}-programs-details-${new Date().toISOString().slice(0, 10)}.csv`;
    downloadCSV(filename, headers, rows);
    showToast('success', `Exported ${sorted.length} program detail records to ${filename}`);
  };

  const handleExportFees = () => {
    if (sorted.length === 0) {
      showToast('error', 'No program records available to export.');
      return;
    }
    const headers = [
      'id', 'course_name', 'tution_fee', 'total_fee', 'total_tuition_fee',
      'annual_tuition_fee', 'year1_tuition_fee', 'year2_tuition_fee', 'year3_tuition_fee',
      'year4_tuition_fee', 'registration_fee', 'laboratory_fee', 'library_fee',
      'technology_fee', 'student_activity_fee', 'insurance_fee', 'examination_fee',
      'application_fee', 'emgs_processing_fee', 'international_student_fee',
      'international_security_deposit', 'international_student_charge',
      'international_administration_fee', 'personal_bond_fee', 'resources_fee',
      'commitment_fee', 'facilities_fee', 'accommodation_fee', 'airport_pickup_fee',
      'other_fee', 'scholarship_amount', 'tution_fee_after_scholarship', 'currency',
      'additional_note', 'anual_tuition_fee_local', 'year1_tuition_fee_local',
      'year2_tuition_fee_local', 'year3_tuition_fee_local', 'year4_tuition_fee_local',
      'total_tuition_fee_local'
    ];

    const rows = sorted.map((item) => [
      item.id,
      item.course_name || '',
      item.tution_fee || '',
      item.total_fee || '',
      item.total_tuition_fee || '',
      item.annual_tuition_fee || '',
      item.year1_tuition_fee || '',
      item.year2_tuition_fee || '',
      item.year3_tuition_fee || '',
      item.year4_tuition_fee || '',
      item.registration_fee || '',
      item.laboratory_fee || '',
      item.library_fee || '',
      item.technology_fee || '',
      item.student_activity_fee || '',
      item.insurance_fee || '',
      item.examination_fee || '',
      item.application_fee || '',
      item.emgs_processing_fee || '',
      item.international_student_fee || '',
      item.international_security_deposit || '',
      item.international_student_charge || '',
      item.international_administration_fee || '',
      item.personal_bond_fee || '',
      item.resources_fee || '',
      item.commitment_fee || '',
      item.facilities_fee || '',
      item.accommodation_fee || '',
      item.airport_pickup_fee || '',
      item.other_fee || '',
      item.scholarship_amount || '',
      item.tution_fee_after_scholarship || '',
      item.currency || '',
      item.additional_note || '',
      item.anual_tuition_fee_local || '',
      item.year1_tuition_fee_local || '',
      item.year2_tuition_fee_local || '',
      item.year3_tuition_fee_local || '',
      item.year4_tuition_fee_local || '',
      item.total_tuition_fee_local || ''
    ]);

    const univName = selectedUniv?.name ? selectedUniv.name.toLowerCase().replace(/[^a-z0-9]/g, '_') : 'all';
    const filename = `${univName}-programs-fees-${new Date().toISOString().slice(0, 10)}.csv`;
    downloadCSV(filename, headers, rows);
    showToast('success', `Exported ${sorted.length} program fee records to ${filename}`);
  };

  return (
    <div className="space-y-2 max-w-[1600px] mx-auto text-slate-700">
      {/* Toast Alert */}
      {toast && (
        <div
          className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 text-sm font-semibold text-white backdrop-blur-md transition-all animate-in slide-in-from-top-2 ${
            toast.type === 'success' ? 'bg-emerald-600/95 ring-1 ring-emerald-400/30' : 'bg-rose-600/95 ring-1 ring-rose-400/30'
          }`}
        >
          {toast.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* ── UNIFIED PAGE HEADER & FILTER CARD ── */}
      <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-slate-200/80 shadow-xs space-y-2.5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-2.5 border-b border-slate-100">
          <div className="space-y-0.5">
            <h1 className="text-base font-black text-slate-900 tracking-tight flex items-center gap-2.5 flex-wrap">
              <span>University Programs</span>
              {selectedUniv && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-50 border border-rose-200 text-rose-600">
                  {selectedUniv.name}
                </span>
              )}
            </h1>
          </div>

          {/* Select University Dropdown */}
          <div className="flex items-center gap-2">
            <label className="text-xs font-bold text-slate-700 shrink-0 flex items-center gap-1.5">
              <Building2 className="w-4 h-4 text-indigo-600" />
              University:
            </label>
            <select
              value={selectedUnivId}
              onChange={handleUniversityChange}
              className="w-full md:w-80 px-3 py-1.5 rounded-xl border border-slate-200 text-slate-800 text-xs font-bold bg-slate-50/80 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all cursor-pointer"
            >
              <option value="">-- All Universities --</option>
              {universities.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Sub-Navigation Pills */}
        {selectedUnivId && (
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              onClick={() => navigate(`/university-overviews?university_id=${selectedUnivId}`)}
              className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold text-slate-600 hover:text-indigo-600 hover:bg-indigo-50/80 transition-all cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5 text-slate-400" />
              <span>Overview</span>
            </button>
            <button
              onClick={() => navigate(`/programs?university_id=${selectedUnivId}`)}
              className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-xs transition-all"
            >
              <GraduationCap className="w-3.5 h-3.5 text-white" />
              <span>Courses</span>
            </button>
            <button
              onClick={() => navigate(`/university-gallery?university_id=${selectedUnivId}`)}
              className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold text-slate-600 hover:text-indigo-600 hover:bg-indigo-50/80 transition-all cursor-pointer"
            >
              <ImageIcon className="w-3.5 h-3.5 text-slate-400" />
              <span>Gallery</span>
            </button>
            <button
              onClick={() => navigate(`/university-gallery?university_id=${selectedUnivId}`)}
              className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold text-slate-600 hover:text-indigo-600 hover:bg-indigo-50/80 transition-all cursor-pointer"
            >
              <Video className="w-3.5 h-3.5 text-slate-400" />
              <span>Videos</span>
            </button>
            <button
              onClick={() => navigate(`/university-facilities?university_id=${selectedUnivId}`)}
              className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold text-slate-600 hover:text-indigo-600 hover:bg-indigo-50/80 transition-all cursor-pointer"
            >
              <Building2 className="w-3.5 h-3.5 text-slate-400" />
              <span>Facilities</span>
            </button>
            <button
              onClick={() => navigate(`/university-reviews?university_id=${selectedUnivId}`)}
              className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold text-slate-600 hover:text-indigo-600 hover:bg-indigo-50/80 transition-all cursor-pointer"
            >
              <Trophy className="w-3.5 h-3.5 text-slate-400" />
              <span>Rankings</span>
            </button>
          </div>
        )}
      </div>

      {/* ── BULK DATA IMPORT / EXPORT CARDS ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs p-3.5 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4 text-sky-600" />
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Import New Data</h3>
            </div>
            <button
              onClick={handleExportDetails}
              className="flex items-center gap-1 px-2.5 py-1 bg-indigo-50 text-indigo-600 text-xs font-bold rounded-md hover:bg-indigo-100 transition-colors cursor-pointer"
            >
              <Download className="w-3 h-3" /> Formats
            </button>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="file"
              className="w-full text-xs text-slate-500 file:mr-2 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-slate-100 file:text-slate-700 border border-slate-200 rounded-lg bg-slate-50 p-0.5 cursor-pointer"
            />
            <button className="px-4 py-1.5 bg-sky-600 text-white text-xs font-bold rounded-lg hover:bg-sky-700 shadow-xs cursor-pointer">
              Import
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs p-3.5 space-y-2">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-violet-600" />
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Update Bulk Data</h3>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="file"
              className="w-full text-xs text-slate-500 file:mr-2 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-slate-100 file:text-slate-700 border border-slate-200 rounded-lg bg-slate-50 p-0.5 cursor-pointer"
            />
            <button className="px-4 py-1.5 bg-violet-600 text-white text-xs font-bold rounded-lg hover:bg-violet-700 shadow-xs cursor-pointer">
              Update
            </button>
          </div>
        </div>
      </div>

      {/* ── ADD / EDIT PROGRAM FORM (COLLAPSIBLE WITH SUB-TABS) ── */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div
          className="flex items-center justify-between p-3.5 bg-slate-50/80 border-b border-slate-200/80 cursor-pointer select-none"
          onClick={() => setIsFormOpen(!isFormOpen)}
        >
          <div className="flex items-center gap-2.5">
            <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-white font-bold text-xs ${editingId ? 'bg-amber-500' : 'bg-indigo-600'}`}>
              {editingId ? <Edit2 className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
            </div>
            <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              {editingId ? 'Edit Program Record' : 'Add New Program Record'}
            </h2>
          </div>
          <button type="button" className="p-1 rounded-md border border-slate-200 text-slate-600 hover:bg-slate-100">
            {isFormOpen ? <Minus className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
          </button>
        </div>

        {isFormOpen && (
          <form onSubmit={handleSubmit} className="p-4 space-y-4">
            {/* Form Section Navigation Tabs */}
            <div className="flex flex-wrap items-center gap-1.5 border-b border-slate-100 pb-2.5">
              <button
                type="button"
                onClick={() => setActiveFormTab('basic')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  activeFormTab === 'basic' ? 'bg-indigo-600 text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <Info className="w-3.5 h-3.5" /> Basic Info
              </button>
              <button
                type="button"
                onClick={() => setActiveFormTab('overview')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  activeFormTab === 'overview' ? 'bg-indigo-600 text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <FileText className="w-3.5 h-3.5" /> Overview & Descriptions
              </button>
              <button
                type="button"
                onClick={() => setActiveFormTab('intl_fees')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  activeFormTab === 'intl_fees' ? 'bg-indigo-600 text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <DollarSign className="w-3.5 h-3.5" /> International Fees
              </button>
              <button
                type="button"
                onClick={() => setActiveFormTab('local_fees')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  activeFormTab === 'local_fees' ? 'bg-indigo-600 text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <Building2 className="w-3.5 h-3.5" /> Local Fees
              </button>
              <button
                type="button"
                onClick={() => setActiveFormTab('seo')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  activeFormTab === 'seo' ? 'bg-indigo-600 text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <Globe className="w-3.5 h-3.5" /> SEO Settings
              </button>
            </div>

            {/* TAB 1: BASIC INFO */}
            {activeFormTab === 'basic' && (
              <div className="space-y-4 animate-in fade-in-50 duration-150">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">University</label>
                    <select
                      value={formData.university_id}
                      onChange={(e) => setFormData({ ...formData, university_id: e.target.value })}
                      className="w-full px-3 py-2 text-xs font-semibold border border-slate-200 rounded-lg bg-slate-50"
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
                    <label className="block text-xs font-bold text-slate-700 mb-1">Course Category <span className="text-rose-500">*</span></label>
                    <select
                      value={formData.course_category_id}
                      onChange={(e) => setFormData({ ...formData, course_category_id: e.target.value })}
                      className="w-full px-3 py-2 text-xs font-semibold border border-slate-200 rounded-lg bg-slate-50"
                    >
                      <option value="">-- Select Category --</option>
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Specialization <span className="text-rose-500">*</span></label>
                    <select
                      value={formData.specialization_id}
                      onChange={(e) => setFormData({ ...formData, specialization_id: e.target.value })}
                      className="w-full px-3 py-2 text-xs font-semibold border border-slate-200 rounded-lg bg-slate-50"
                    >
                      <option value="">-- Select Specialization --</option>
                      {specializations.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
                  <div className="sm:col-span-6">
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Course / Program Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Foundation in Arts / Bachelor of Computer Science"
                      value={formData.course_name}
                      onChange={(e) => setFormData({ ...formData, course_name: e.target.value })}
                      className="w-full px-3 py-2 text-xs font-bold border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div className="sm:col-span-3">
                    <label className="block text-xs font-bold text-slate-700 mb-1">Level</label>
                    <select
                      value={formData.level}
                      onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                      className="w-full px-3 py-2 text-xs font-semibold border border-slate-200 rounded-lg bg-slate-50"
                    >
                      <option value="Pre-University">Pre-University</option>
                      <option value="DIPLOMA">DIPLOMA</option>
                      <option value="Bachelor">Bachelor</option>
                      <option value="Master">Master</option>
                      <option value="PhD">PhD</option>
                    </select>
                  </div>

                  <div className="sm:col-span-3">
                    <label className="block text-xs font-bold text-slate-700 mb-1">Duration</label>
                    <input
                      type="text"
                      placeholder="e.g. 1 Year, 3.5 Years"
                      value={formData.duration}
                      onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                      className="w-full px-3 py-2 text-xs font-medium border border-slate-200 rounded-lg"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Study Mode</label>
                    <input
                      type="text"
                      placeholder="e.g. BY COURSEWORK, FULL TIME"
                      value={formData.study_mode}
                      onChange={(e) => setFormData({ ...formData, study_mode: e.target.value })}
                      className="w-full px-3 py-2 text-xs font-medium border border-slate-200 rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Intake Months</label>
                    <input
                      type="text"
                      placeholder="e.g. Jan, Mar, Sep"
                      value={formData.intake}
                      onChange={(e) => setFormData({ ...formData, intake: e.target.value })}
                      className="w-full px-3 py-2 text-xs font-medium border border-slate-200 rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Application Deadline</label>
                    <input
                      type="text"
                      placeholder="e.g. Dec, Feb, Aug"
                      value={formData.application_deadline}
                      onChange={(e) => setFormData({ ...formData, application_deadline: e.target.value })}
                      className="w-full px-3 py-2 text-xs font-medium border border-slate-200 rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Campus</label>
                    <input
                      type="text"
                      placeholder="e.g. Main Campus / Cyberjaya"
                      value={formData.campus}
                      onChange={(e) => setFormData({ ...formData, campus: e.target.value })}
                      className="w-full px-3 py-2 text-xs font-medium border border-slate-200 rounded-lg"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
                  <div className="sm:col-span-8">
                    <label className="block text-xs font-bold text-slate-700 mb-1">Accreditations (Separated by |)</label>
                    <input
                      type="text"
                      placeholder="e.g. MQA/FA1234 | MQA/PA5678"
                      value={formData.accreditations}
                      onChange={(e) => setFormData({ ...formData, accreditations: e.target.value })}
                      className="w-full px-3 py-2 text-xs font-medium border border-slate-200 rounded-lg"
                    />
                  </div>

                  <div className="sm:col-span-4 flex items-center gap-6 pt-5">
                    <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700 select-none">
                      <input
                        type="checkbox"
                        checked={formData.is_local}
                        onChange={(e) => setFormData({ ...formData, is_local: e.target.checked })}
                        className="w-4 h-4 text-indigo-600 rounded"
                      />
                      Is Local
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700 select-none">
                      <input
                        type="checkbox"
                        checked={formData.is_international}
                        onChange={(e) => setFormData({ ...formData, is_international: e.target.checked })}
                        className="w-4 h-4 text-indigo-600 rounded"
                      />
                      Is International
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: OVERVIEW & DESCRIPTIONS */}
            {activeFormTab === 'overview' && (
              <div className="space-y-4 animate-in fade-in-50 duration-150">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Overview</label>
                  <RichTextEditor
                    value={formData.overview}
                    onChange={(val) => setFormData({ ...formData, overview: val })}
                    placeholder="General program overview..."
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Entry Requirement</label>
                  <RichTextEditor
                    value={formData.entry_requirement}
                    onChange={(val) => setFormData({ ...formData, entry_requirement: val })}
                    placeholder="Academic and language entry criteria..."
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Exam Required</label>
                  <RichTextEditor
                    value={formData.exam_required}
                    onChange={(val) => setFormData({ ...formData, exam_required: val })}
                    placeholder="IELTS, TOEFL, MUET, SAT details..."
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Mode of Instruction</label>
                  <RichTextEditor
                    value={formData.mode_of_instruction}
                    onChange={(val) => setFormData({ ...formData, mode_of_instruction: val })}
                    placeholder="Lecture, lab, online sessions info..."
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Scholarship Info</label>
                  <RichTextEditor
                    value={formData.scholarship_info}
                    onChange={(val) => setFormData({ ...formData, scholarship_info: val })}
                    placeholder="Available waivers, bursaries, and merit scholarships..."
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Full Course Description</label>
                  <RichTextEditor
                    value={formData.courses_description}
                    onChange={(val) => setFormData({ ...formData, courses_description: val })}
                    placeholder="Detailed program structure, modules, career pathways..."
                  />
                </div>
              </div>
            )}

            {/* TAB 3: INTERNATIONAL FEES */}
            {activeFormTab === 'intl_fees' && (
              <div className="space-y-4 animate-in fade-in-50 duration-150">
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Tuition Fee</label>
                    <input
                      type="number"
                      placeholder="0.00"
                      value={formData.tution_fee}
                      onChange={(e) => setFormData({ ...formData, tution_fee: e.target.value })}
                      className="w-full px-3 py-1.5 text-xs font-mono border border-slate-200 rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Total Fee</label>
                    <input
                      type="number"
                      placeholder="0.00"
                      value={formData.total_fee}
                      onChange={(e) => setFormData({ ...formData, total_fee: e.target.value })}
                      className="w-full px-3 py-1.5 text-xs font-mono border border-slate-200 rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Total Tuition Fee</label>
                    <input
                      type="number"
                      placeholder="0.00"
                      value={formData.total_tuition_fee}
                      onChange={(e) => setFormData({ ...formData, total_tuition_fee: e.target.value })}
                      className="w-full px-3 py-1.5 text-xs font-mono border border-slate-200 rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Annual Tuition Fee</label>
                    <input
                      type="number"
                      placeholder="0.00"
                      value={formData.annual_tuition_fee}
                      onChange={(e) => setFormData({ ...formData, annual_tuition_fee: e.target.value })}
                      className="w-full px-3 py-1.5 text-xs font-mono border border-slate-200 rounded-lg"
                    />
                  </div>
                </div>

                {/* Yearly Breakdown */}
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Year 1 Tuition Fee</label>
                    <input
                      type="number"
                      placeholder="0.00"
                      value={formData.year1_tuition_fee}
                      onChange={(e) => setFormData({ ...formData, year1_tuition_fee: e.target.value })}
                      className="w-full px-3 py-1.5 text-xs font-mono border border-slate-200 rounded-lg bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Year 2 Tuition Fee</label>
                    <input
                      type="number"
                      placeholder="0.00"
                      value={formData.year2_tuition_fee}
                      onChange={(e) => setFormData({ ...formData, year2_tuition_fee: e.target.value })}
                      className="w-full px-3 py-1.5 text-xs font-mono border border-slate-200 rounded-lg bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Year 3 Tuition Fee</label>
                    <input
                      type="number"
                      placeholder="0.00"
                      value={formData.year3_tuition_fee}
                      onChange={(e) => setFormData({ ...formData, year3_tuition_fee: e.target.value })}
                      className="w-full px-3 py-1.5 text-xs font-mono border border-slate-200 rounded-lg bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Year 4 Tuition Fee</label>
                    <input
                      type="number"
                      placeholder="0.00"
                      value={formData.year4_tuition_fee}
                      onChange={(e) => setFormData({ ...formData, year4_tuition_fee: e.target.value })}
                      className="w-full px-3 py-1.5 text-xs font-mono border border-slate-200 rounded-lg bg-white"
                    />
                  </div>
                </div>

                {/* Additional Fee Component Breakdown */}
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Registration Fee</label>
                    <input
                      type="number"
                      placeholder="0.00"
                      value={formData.registration_fee}
                      onChange={(e) => setFormData({ ...formData, registration_fee: e.target.value })}
                      className="w-full px-3 py-1.5 text-xs font-mono border border-slate-200 rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Laboratory Fee</label>
                    <input
                      type="number"
                      placeholder="0.00"
                      value={formData.laboratory_fee}
                      onChange={(e) => setFormData({ ...formData, laboratory_fee: e.target.value })}
                      className="w-full px-3 py-1.5 text-xs font-mono border border-slate-200 rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Library Fee</label>
                    <input
                      type="number"
                      placeholder="0.00"
                      value={formData.library_fee}
                      onChange={(e) => setFormData({ ...formData, library_fee: e.target.value })}
                      className="w-full px-3 py-1.5 text-xs font-mono border border-slate-200 rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Technology Fee</label>
                    <input
                      type="number"
                      placeholder="0.00"
                      value={formData.technology_fee}
                      onChange={(e) => setFormData({ ...formData, technology_fee: e.target.value })}
                      className="w-full px-3 py-1.5 text-xs font-mono border border-slate-200 rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Student Activity Fee</label>
                    <input
                      type="number"
                      placeholder="0.00"
                      value={formData.student_activity_fee}
                      onChange={(e) => setFormData({ ...formData, student_activity_fee: e.target.value })}
                      className="w-full px-3 py-1.5 text-xs font-mono border border-slate-200 rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Insurance Fee</label>
                    <input
                      type="number"
                      placeholder="0.00"
                      value={formData.insurance_fee}
                      onChange={(e) => setFormData({ ...formData, insurance_fee: e.target.value })}
                      className="w-full px-3 py-1.5 text-xs font-mono border border-slate-200 rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Examination Fee</label>
                    <input
                      type="number"
                      placeholder="0.00"
                      value={formData.examination_fee}
                      onChange={(e) => setFormData({ ...formData, examination_fee: e.target.value })}
                      className="w-full px-3 py-1.5 text-xs font-mono border border-slate-200 rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Application Fee</label>
                    <input
                      type="number"
                      placeholder="0.00"
                      value={formData.application_fee}
                      onChange={(e) => setFormData({ ...formData, application_fee: e.target.value })}
                      className="w-full px-3 py-1.5 text-xs font-mono border border-slate-200 rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">EMGS Processing Fee</label>
                    <input
                      type="number"
                      placeholder="0.00"
                      value={formData.emgs_processing_fee}
                      onChange={(e) => setFormData({ ...formData, emgs_processing_fee: e.target.value })}
                      className="w-full px-3 py-1.5 text-xs font-mono border border-slate-200 rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Intl. Student Fee</label>
                    <input
                      type="number"
                      placeholder="0.00"
                      value={formData.international_student_fee}
                      onChange={(e) => setFormData({ ...formData, international_student_fee: e.target.value })}
                      className="w-full px-3 py-1.5 text-xs font-mono border border-slate-200 rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Intl. Security Deposit</label>
                    <input
                      type="number"
                      placeholder="0.00"
                      value={formData.international_security_deposit}
                      onChange={(e) => setFormData({ ...formData, international_security_deposit: e.target.value })}
                      className="w-full px-3 py-1.5 text-xs font-mono border border-slate-200 rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Intl. Admin Fee</label>
                    <input
                      type="number"
                      placeholder="0.00"
                      value={formData.international_administration_fee}
                      onChange={(e) => setFormData({ ...formData, international_administration_fee: e.target.value })}
                      className="w-full px-3 py-1.5 text-xs font-mono border border-slate-200 rounded-lg"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Scholarship Amount</label>
                    <input
                      type="number"
                      placeholder="0.00"
                      value={formData.scholarship_amount}
                      onChange={(e) => setFormData({ ...formData, scholarship_amount: e.target.value })}
                      className="w-full px-3 py-1.5 text-xs font-mono border border-slate-200 rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Fee After Scholarship</label>
                    <input
                      type="number"
                      placeholder="0.00"
                      value={formData.tution_fee_after_scholarship}
                      onChange={(e) => setFormData({ ...formData, tution_fee_after_scholarship: e.target.value })}
                      className="w-full px-3 py-1.5 text-xs font-mono border border-slate-200 rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Currency</label>
                    <input
                      type="text"
                      placeholder="MYR, USD..."
                      value={formData.currency}
                      onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                      className="w-full px-3 py-1.5 text-xs font-bold uppercase border border-slate-200 rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Additional Note</label>
                    <input
                      type="text"
                      placeholder="Extra fee notes..."
                      value={formData.additional_note}
                      onChange={(e) => setFormData({ ...formData, additional_note: e.target.value })}
                      className="w-full px-3 py-1.5 text-xs font-medium border border-slate-200 rounded-lg"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: LOCAL FEES */}
            {activeFormTab === 'local_fees' && (
              <div className="space-y-4 animate-in fade-in-50 duration-150">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Annual Tuition Fee (Local)</label>
                    <input
                      type="number"
                      placeholder="0.00"
                      value={formData.anual_tuition_fee_local}
                      onChange={(e) => setFormData({ ...formData, anual_tuition_fee_local: e.target.value })}
                      className="w-full px-3 py-2 text-xs font-mono border border-slate-200 rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Total Tuition Fee (Local)</label>
                    <input
                      type="number"
                      placeholder="0.00"
                      value={formData.total_tuition_fee_local}
                      onChange={(e) => setFormData({ ...formData, total_tuition_fee_local: e.target.value })}
                      className="w-full px-3 py-2 text-xs font-mono border border-slate-200 rounded-lg"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Year 1 Tuition Fee Local</label>
                    <input
                      type="number"
                      placeholder="0.00"
                      value={formData.year1_tuition_fee_local}
                      onChange={(e) => setFormData({ ...formData, year1_tuition_fee_local: e.target.value })}
                      className="w-full px-3 py-1.5 text-xs font-mono border border-slate-200 rounded-lg bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Year 2 Tuition Fee Local</label>
                    <input
                      type="number"
                      placeholder="0.00"
                      value={formData.year2_tuition_fee_local}
                      onChange={(e) => setFormData({ ...formData, year2_tuition_fee_local: e.target.value })}
                      className="w-full px-3 py-1.5 text-xs font-mono border border-slate-200 rounded-lg bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Year 3 Tuition Fee Local</label>
                    <input
                      type="number"
                      placeholder="0.00"
                      value={formData.year3_tuition_fee_local}
                      onChange={(e) => setFormData({ ...formData, year3_tuition_fee_local: e.target.value })}
                      className="w-full px-3 py-1.5 text-xs font-mono border border-slate-200 rounded-lg bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Year 4 Tuition Fee Local</label>
                    <input
                      type="number"
                      placeholder="0.00"
                      value={formData.year4_tuition_fee_local}
                      onChange={(e) => setFormData({ ...formData, year4_tuition_fee_local: e.target.value })}
                      className="w-full px-3 py-1.5 text-xs font-mono border border-slate-200 rounded-lg bg-white"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* TAB 5: SEO SETTINGS */}
            {activeFormTab === 'seo' && (
              <div className="space-y-4 animate-in fade-in-50 duration-150">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Meta Title</label>
                  <input
                    type="text"
                    placeholder="Program SEO Meta Title..."
                    value={formData.meta_title}
                    onChange={(e) => setFormData({ ...formData, meta_title: e.target.value })}
                    className="w-full px-3 py-2 text-xs font-medium border border-slate-200 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Meta Keywords</label>
                  <input
                    type="text"
                    placeholder="Keywords separated by comma..."
                    value={formData.meta_keyword}
                    onChange={(e) => setFormData({ ...formData, meta_keyword: e.target.value })}
                    className="w-full px-3 py-2 text-xs font-medium border border-slate-200 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Meta Description</label>
                  <textarea
                    rows={3}
                    placeholder="Short SEO snippet description..."
                    value={formData.meta_description}
                    onChange={(e) => setFormData({ ...formData, meta_description: e.target.value })}
                    className="w-full px-3 py-2 text-xs font-medium border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Page SEO Content / Extra Body HTML</label>
                  <RichTextEditor
                    value={formData.page_content}
                    onChange={(val) => setFormData({ ...formData, page_content: val })}
                    placeholder="Bottom page SEO text content..."
                  />
                </div>
              </div>
            )}

            {/* Form Action Controls */}
            <div className="flex items-center gap-2.5 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={handleResetForm}
                className="flex items-center gap-1 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Reset
              </button>
              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
                className="px-3.5 py-2 border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-bold rounded-lg transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex items-center gap-1.5 px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg shadow-xs transition-all cursor-pointer disabled:opacity-50"
              >
                {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>{editingId ? 'Update Program' : 'Submit Program'}</span>
              </button>
            </div>
          </form>
        )}
      </div>

      {/* ── TABLE SEARCH & TOOLBAR ── */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-3.5 border-b border-slate-200/80 flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by program name, category, or level..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-8 py-1.5 text-xs font-medium border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:outline-none focus:border-indigo-500 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 font-bold"
              >
                ×
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto justify-between md:justify-end">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider hidden sm:inline">Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'Date' | 'Name')}
                className="px-2.5 py-1 border border-slate-200 rounded-lg bg-slate-50 text-xs font-bold text-slate-700 cursor-pointer focus:outline-none"
              >
                <option value="Date">Date Added</option>
                <option value="Name">Program Name</option>
              </select>
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as 'DESC' | 'ASC')}
                className="px-2.5 py-1 border border-slate-200 rounded-lg bg-slate-50 text-xs font-bold text-slate-700 cursor-pointer focus:outline-none"
              >
                <option value="DESC">DESC</option>
                <option value="ASC">ASC</option>
              </select>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={handleExportDetails}
                className="flex items-center gap-1 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200/80 rounded-lg text-xs font-bold transition-all cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" /> Export
              </button>
              <button
                onClick={handleExportFees}
                className="flex items-center gap-1 px-3 py-1.5 bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200/80 rounded-lg text-xs font-bold transition-all cursor-pointer"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" /> Fees Export
              </button>
            </div>
          </div>
        </div>

        {/* ── PROGRAM LIST TABLE ── */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-200/80 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-3 w-12 text-center">Sr.</th>
                <th className="py-3 px-3">Program Name</th>
                <th className="py-3 px-3">Category & Specialization</th>
                <th className="py-3 px-3 w-28">Duration & Mode</th>
                <th className="py-3 px-3 w-28">Intake / Fee</th>
                <th className="py-3 px-3 w-20 text-center">Status</th>
                <th className="py-3 px-3 w-24 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-indigo-600" />
                    <span className="text-xs font-bold">Loading university programs...</span>
                  </td>
                </tr>
              ) : paginated.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400 space-y-1">
                    <BookOpen className="w-7 h-7 text-slate-300 mx-auto mb-1" />
                    <div className="text-xs font-bold text-slate-600">No programs found</div>
                    <p className="text-[11px]">Try adjusting search filters or select another university.</p>
                  </td>
                </tr>
              ) : (
                paginated.map((item, index) => {
                  const srNo = (currentPage - 1) * itemsPerPage + index + 1;
                  return (
                    <tr key={item.id} className="hover:bg-slate-50/80 transition-colors group">
                      <td className="py-3 px-3 text-center font-bold text-slate-400 text-[11px]">{srNo}</td>
                      <td className="py-3 px-3 space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 border border-indigo-100 px-1.5 py-0.5 rounded">
                            #{item.id}
                          </span>
                          <span className="font-extrabold text-slate-900 text-xs group-hover:text-indigo-600 transition-colors">
                            {item.course_name}
                          </span>
                        </div>
                        {item.level && (
                          <div className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                            <Tag className="w-2.5 h-2.5 text-slate-400" /> {item.level}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-3 space-y-0.5">
                        <div className="text-xs font-bold text-slate-700">{item.category_name || '-'}</div>
                        <div className="text-[11px] font-medium text-slate-400">{item.specialization_name || '-'}</div>
                      </td>
                      <td className="py-3 px-3 space-y-0.5">
                        <div className="flex items-center gap-1 text-xs font-bold text-slate-700">
                          <Clock className="w-3 h-3 text-slate-400" /> {item.duration || '-'}
                        </div>
                        <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-tight">
                          {item.study_mode || '-'}
                        </div>
                      </td>
                      <td className="py-3 px-3 space-y-0.5">
                        <div className="flex items-center gap-1 text-xs font-bold text-slate-800 font-mono">
                          <DollarSign className="w-3 h-3 text-emerald-600" /> {item.tution_fee || '-'}
                        </div>
                        <div className="flex items-center gap-1 text-[10px] font-semibold text-slate-400">
                          <Calendar className="w-2.5 h-2.5" /> {item.intake || '-'}
                        </div>
                      </td>
                      <td className="py-3 px-3 text-center">
                        {item.status === 1 ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-200/80">
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-500 border border-slate-200">
                            Inactive
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleOpenEdit(item)}
                            className="p-1.5 bg-indigo-50 hover:bg-indigo-600 text-indigo-600 hover:text-white rounded-lg transition-all cursor-pointer"
                            title="Edit Program"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(item.id, item.course_name)}
                            className="p-1.5 bg-rose-50 hover:bg-rose-600 text-rose-600 hover:text-white rounded-lg transition-all cursor-pointer"
                            title="Delete Program"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => navigate(`/course-category-contents?program_id=${item.id}`)}
                            className="px-2 py-1 bg-violet-50 hover:bg-violet-600 text-violet-700 hover:text-white text-[10px] font-bold rounded-lg border border-violet-200/80 transition-all cursor-pointer"
                            title="Manage Detailed Content"
                          >
                            Content
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

        {/* ── PAGINATION FOOTER ── */}
        {!loading && filtered.length > 0 && (
          <div className="p-3 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-3 text-xs text-slate-500">
            <div className="font-semibold text-slate-600">
              Showing <span className="font-bold text-slate-800">{(currentPage - 1) * itemsPerPage + 1}</span> to{' '}
              <span className="font-bold text-slate-800">{Math.min(currentPage * itemsPerPage, filtered.length)}</span> of{' '}
              <span className="font-bold text-slate-800">{filtered.length}</span> programs
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
