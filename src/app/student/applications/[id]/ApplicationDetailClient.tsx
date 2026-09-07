'use client'

import React, { useEffect, useState, useMemo } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  ExternalLink,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Clock,
  AlertCircle,
  Upload,
  User,
  FileText,
  Calendar,
  Building2,
  GraduationCap,
  Sparkles,
  ArrowLeft,
  X,
  FileCheck2,
  MoreVertical,
  Filter,
  Check,
  CreditCard,
  MessageCircle,
  Trash2,
  AlertTriangle,
  Info,
  Edit3,
  HelpCircle,
  PhoneCall,
  Download,
  Share2
} from 'lucide-react'
import { toast } from 'react-toastify'
import { evaluateStudentChecklist, ChecklistItem } from '@/utils/studentChecklist'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://admin.educationmalaysia.in/api'
const API_KEY = process.env.NEXT_PUBLIC_FRONTEND_API_KEY || ''

interface RequirementItem extends ChecklistItem {
  statusType?: 'pending' | 'approved' | 'rejected' | 'in_review'
  tag?: string
  timing?: string
  actionText?: string
}

export default function ApplicationDetailClient({ applicationId }: { applicationId: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [application, setApplication] = useState<any>(null)
  const [student, setStudent] = useState<any>(null)
  const [documents, setDocuments] = useState<any[]>([])
  const [stepperOpen, setStepperOpen] = useState(true)
  const [manageAppOpen, setManageAppOpen] = useState(false)

  // Tabs
  const [activeTab, setActiveTab] = useState<'requirements' | 'records' | 'notes'>('requirements')
  const [filterType, setFilterType] = useState<'all' | 'pending' | 'approved' | 'rejected' | 'in_review'>('pending')
  const [pendingAccordionOpen, setPendingAccordionOpen] = useState(true)

  // Upload Modal
  const [uploadModalOpen, setUploadModalOpen] = useState(false)
  const [selectedReq, setSelectedReq] = useState<RequirementItem | null>(null)
  const [uploadFile, setUploadFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadDocName, setUploadDocName] = useState('')

  // Quick Answer Modal (Emergency contact / Study gap / etc)
  const [answerModalOpen, setAnswerModalOpen] = useState(false)
  const [answerTitle, setAnswerTitle] = useState('')
  const [answerValue, setAnswerValue] = useState('')
  const [savingAnswer, setSavingAnswer] = useState(false)

  // Notes state
  const [notes, setNotes] = useState<any[]>([
    {
      id: 1,
      sender: 'Admissions Team',
      text: 'Application record created. Please ensure all mandatory documents are submitted for fast-track processing.',
      date: 'Just now',
      isOfficial: true,
    },
    {
      id: 2,
      sender: 'System',
      text: 'Intake selection confirmed. Next Education Malaysia counseling desk assigned.',
      date: 'Earlier today',
      isOfficial: true,
    },
  ])
  const [newNote, setNewNote] = useState('')

  const loadData = async () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
    if (!token) {
      router.push('/login')
      return
    }

    const headers = {
      Authorization: `Bearer ${token}`,
      ...(API_KEY ? { 'x-api-key': API_KEY } : {}),
    }

    try {
      const [appRes, profileRes, docRes] = await Promise.all([
        fetch(`${API_BASE}/student/applied-college`, { headers }).catch(() => null),
        fetch(`${API_BASE}/student/profile`, { headers }).catch(() => null),
        fetch(`${API_BASE}/student/documents`, { headers }).catch(() => null),
      ])

      const appJson = appRes ? await appRes.json().catch(() => null) : null
      const apps = Array.isArray(appJson?.data?.applied_programs)
        ? appJson.data.applied_programs
        : Array.isArray(appJson?.applied_programs)
        ? appJson.applied_programs
        : Array.isArray(appJson)
        ? appJson
        : []

      const targetApp = apps.find(
        (a: any) => String(a.id) === String(applicationId) || String(a.prog_id) === String(applicationId)
      ) || apps[0] || null

      setApplication(targetApp)

      const profileJson = profileRes ? await profileRes.json().catch(() => null) : null
      if (profileJson?.data?.student) {
        setStudent(profileJson.data.student)
      } else if (profileJson?.student) {
        setStudent(profileJson.student)
      }

      const docJson = docRes ? await docRes.json().catch(() => null) : null
      if (Array.isArray(docJson?.data?.student_documents)) {
        setDocuments(docJson.data.student_documents)
      } else if (Array.isArray(docJson?.student_documents)) {
        setDocuments(docJson.student_documents)
      }
    } catch (err) {
      console.error('Failed loading application detail:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [applicationId])

  // Evaluated checklist
  const evaluatedChecklist = useMemo(() => {
    return evaluateStudentChecklist(student, documents)
  }, [student, documents])

  // Map checklist into ApplyBoard-style requirements
  const requirementsList: RequirementItem[] = useMemo(() => {
    return evaluatedChecklist.checklist.map((item) => {
      let statusType: 'pending' | 'approved' | 'rejected' | 'in_review' = item.isCompleted ? 'approved' : 'pending'
      let timing = 'Before payment'
      let tag = 'Required'
      let actionText = 'Upload'

      if (item.id === 'personal_details') {
        actionText = 'Go to profile'
        timing = 'Profile'
      } else if (item.id === 'address_contact') {
        actionText = 'Answer'
        timing = 'Contact'
      } else if (item.id === 'resume' || item.id === 'health_declaration') {
        tag = 'Optional now, required later'
        timing = 'Before visa'
      } else if (item.id === 'education_history') {
        actionText = 'Go to profile'
        timing = 'Academic'
      }

      return {
        ...item,
        statusType,
        tag,
        timing,
        actionText: item.isCompleted ? 'View' : actionText,
      }
    })
  }, [evaluatedChecklist])

  // Filtered requirements
  const filteredRequirements = useMemo(() => {
    if (filterType === 'all') return requirementsList
    if (filterType === 'pending') return requirementsList.filter((r) => r.statusType === 'pending')
    if (filterType === 'approved') return requirementsList.filter((r) => r.statusType === 'approved')
    if (filterType === 'in_review') return requirementsList.filter((r) => r.statusType === 'in_review')
    return requirementsList
  }, [requirementsList, filterType])

  const pendingRequirements = useMemo(() => {
    return requirementsList.filter((r) => r.statusType === 'pending')
  }, [requirementsList])

  // Program & University Details
  const program = application?.university_program || application?.university_programs || {}
  const university = program?.university || {}
  const universityName = university?.name || application?.university || 'Malaysian Partner University'
  const courseName = program?.course_name || application?.program || 'University Degree Program'
  const intakeStr = program?.intake || 'September 2026'
  const deadlineStr = program?.application_deadline || 'September 2, 2026'

  // Dynamic Pipeline Stages
  const isPaid = useMemo(() => {
    const s = String(application?.app_status || '').toLowerCase().trim()
    return s === 'paid' || s === 'accepted' || s === 'approved'
  }, [application])

  const currentStageIndex = useMemo(() => {
    const s = String(application?.app_status || '').toLowerCase().trim()
    if (s === 'accepted' || s === 'approved') return 5 // Admission processing
    if (s === 'paid') return 3 // Submitting to school
    if (evaluatedChecklist.completedCount >= 5) return 2 // Application review
    return 1 // Application started
  }, [application, evaluatedChecklist])

  const STAGES = [
    { title: 'Application created', subtitle: 'Account verified' },
    { title: 'Application Started', subtitle: `Deadline is ${deadlineStr}` },
    { title: 'Application Review (By NextEducation)', subtitle: 'Counselor audit' },
    { title: 'Submitting to School', subtitle: 'University portal' },
    { title: 'Awaiting School Decision', subtitle: 'Admissions committee' },
    { title: 'Admission Processing', subtitle: 'Offer letter' },
    { title: 'Pre-Arrival', subtitle: 'EMGS Visa approval' },
    { title: 'Arrival', subtitle: 'Fly to Malaysia' },
  ]

  // Handle Document Upload
  const handleOpenUpload = (req: RequirementItem) => {
    setSelectedReq(req)
    setUploadDocName(req.documentName || req.title)
    setUploadFile(null)
    setUploadModalOpen(true)
  }

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!uploadFile) {
      toast.error('Please select a file to upload')
      return
    }

    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
    if (!token) return

    setUploading(true)
    const formData = new FormData()
    formData.append('document_name', uploadDocName || selectedReq?.documentName || 'Other')
    formData.append('document_file', uploadFile)

    try {
      const res = await fetch(`${API_BASE}/student/document/upload`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          ...(API_KEY ? { 'x-api-key': API_KEY } : {}),
        },
        body: formData,
      })

      const data = await res.json()
      if (res.ok) {
        toast.success(`${uploadDocName || 'Document'} uploaded successfully!`)
        setUploadModalOpen(false)
        setUploadFile(null)
        // Refresh documents
        loadData()
        try {
          localStorage.setItem('student_documents_updated', String(Date.now()))
          window.dispatchEvent(new Event('student_documents_updated'))
        } catch {}
      } else {
        toast.error(data?.message || 'Failed to upload document')
      }
    } catch (err) {
      console.error('Upload error:', err)
      toast.error('Network error while uploading. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  // Handle Quick Answer
  const handleOpenAnswer = (req: RequirementItem) => {
    setAnswerTitle(req.title)
    if (req.id === 'address_contact') {
      setAnswerValue(student?.home_contact_number || student?.home_address || '')
    } else {
      setAnswerValue('')
    }
    setAnswerModalOpen(true)
  }

  const handleSaveAnswer = () => {
    setSavingAnswer(true)
    setTimeout(() => {
      toast.success(`${answerTitle} details recorded!`)
      setSavingAnswer(false)
      setAnswerModalOpen(false)
    }, 600)
  }

  // Add Note
  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newNote.trim()) return
    const noteObj = {
      id: Date.now(),
      sender: student?.name || 'Student',
      text: newNote.trim(),
      date: 'Just now',
      isOfficial: false,
    }
    setNotes((prev) => [noteObj, ...prev])
    setNewNote('')
    toast.success('Note added to application file')
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-80">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="w-full space-y-6 pb-12">
      {/* 🔙 Back navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 transition cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Applications</span>
        </button>

        <div className="flex items-center gap-2">
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
              isPaid
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : 'bg-amber-50 text-amber-800 border border-amber-200'
            }`}
          >
            {isPaid ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
            <span>{isPaid ? 'Paid & Confirmed' : 'Payment Pending'}</span>
          </span>
        </div>
      </div>

      {/* 🏛️ Top Header Card (Matching ApplyBoard Reference Screenshot) */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-7 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
          <div className="space-y-3 flex-1 min-w-0">
            {/* University Logo & Name */}
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-200/80 text-blue-700 flex items-center justify-center shrink-0">
                <Building2 className="w-5 h-5" />
              </div>
              <div className="flex items-center gap-1.5 min-w-0">
                <span className="text-xs sm:text-sm font-bold text-slate-700 hover:text-blue-600 transition truncate">
                  {universityName}
                </span>
                <ExternalLink className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              </div>
            </div>

            {/* Course Name (Prominent & Bold) */}
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-slate-900 tracking-tight leading-snug">
              {courseName}
            </h1>

            {/* Meta row: App ID & Intake */}
            <div className="flex items-center gap-3 sm:gap-4 flex-wrap text-xs text-slate-500 pt-0.5">
              <span className="font-semibold text-slate-800">
                App ID: #{application?.id || applicationId}
              </span>
              <span className="text-slate-300">•</span>
              <div className="flex items-center gap-1.5">
                <span>Main selected intake:</span>
                <span className="font-bold text-slate-900">{intakeStr}</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                  {isPaid ? 'Active' : 'Open'}
                </span>
                <Info className="w-3.5 h-3.5 text-slate-400" />
              </div>
            </div>
          </div>

          {/* Manage App Dropdown */}
          <div className="relative shrink-0 self-start">
            <button
              type="button"
              onClick={() => setManageAppOpen(!manageAppOpen)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-blue-600/30 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs sm:text-sm font-bold shadow-2xs transition cursor-pointer"
            >
              <span>Manage App</span>
              <ChevronDown className={`w-4 h-4 transition-transform ${manageAppOpen ? 'rotate-180' : ''}`} />
            </button>

            {manageAppOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl border border-slate-200 shadow-xl p-2 z-30 space-y-1">
                <Link
                  href="/contact-us"
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
                  onClick={() => setManageAppOpen(false)}
                >
                  <PhoneCall className="w-4 h-4 text-blue-600" />
                  <span>Contact Counselor</span>
                </Link>
                <Link
                  href="/student/profile"
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
                  onClick={() => setManageAppOpen(false)}
                >
                  <User className="w-4 h-4 text-emerald-600" />
                  <span>Update Profile Data</span>
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* 🛣️ Real-Time Stepper Pipeline (Expandable / Collapsible) */}
        <div className="mt-8 pt-6 border-t border-slate-100">
          <div className="flex items-center justify-between pb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Admission Journey Pipeline
            </span>
            <button
              type="button"
              onClick={() => setStepperOpen(!stepperOpen)}
              className="text-xs font-semibold text-slate-500 hover:text-slate-800 inline-flex items-center gap-1 cursor-pointer"
            >
              <span>{stepperOpen ? 'Collapse roadmap' : 'Expand roadmap'}</span>
              {stepperOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>

          {stepperOpen && (
            <div className="overflow-x-auto scrollbar-none pt-2 pb-4">
              <div className="min-w-[820px] relative">
                {/* Connecting Line */}
                <div className="absolute top-4 left-6 right-6 h-0.5 bg-slate-200 -z-0" />

                <div className="grid grid-cols-8 gap-2 relative z-10">
                  {STAGES.map((st, idx) => {
                    const isCompleted = idx < currentStageIndex
                    const isCurrent = idx === currentStageIndex

                    return (
                      <div key={idx} className="flex flex-col items-center text-center">
                        {/* Circle Indicator */}
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                            isCompleted
                              ? 'bg-emerald-600 text-white ring-4 ring-emerald-50 shadow-2xs'
                              : isCurrent
                              ? 'bg-blue-600 text-white ring-4 ring-blue-100 shadow-xs'
                              : 'bg-white border-2 border-slate-300 text-slate-400'
                          }`}
                        >
                          {isCompleted ? (
                            <Check className="w-4 h-4 stroke-[3]" />
                          ) : (
                            <span className="text-[11px] font-bold">{idx + 1}</span>
                          )}
                        </div>

                        {/* Stage Title */}
                        <p
                          className={`text-xs font-bold mt-2.5 leading-tight ${
                            isCompleted
                              ? 'text-slate-900'
                              : isCurrent
                              ? 'text-blue-900 font-black'
                              : 'text-slate-400'
                          }`}
                        >
                          {st.title}
                        </p>

                        {/* Deadline or Subtitle */}
                        {isCurrent && (
                          <span className="mt-1.5 inline-block px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-200">
                            {st.subtitle}
                          </span>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 📑 Main Tabs Navigation (Requirements | Student records | Notes) */}
      <div className="flex items-center justify-between border-b border-slate-200">
        <div className="flex items-center gap-8">
          <button
            type="button"
            onClick={() => setActiveTab('requirements')}
            className={`pb-3.5 text-sm sm:text-base font-bold transition-all relative cursor-pointer ${
              activeTab === 'requirements'
                ? 'text-blue-600'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <span>Requirements</span>
            {activeTab === 'requirements' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-full" />
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('records')}
            className={`pb-3.5 text-sm sm:text-base font-bold transition-all relative cursor-pointer ${
              activeTab === 'records'
                ? 'text-blue-600'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <span>Student records</span>
            {activeTab === 'records' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-full" />
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('notes')}
            className={`pb-3.5 text-sm sm:text-base font-bold transition-all relative cursor-pointer ${
              activeTab === 'notes'
                ? 'text-blue-600'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <span>Notes</span>
            <span className="ml-1.5 px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600">
              {notes.length}
            </span>
            {activeTab === 'notes' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-full" />
            )}
          </button>
        </div>
      </div>

      {/* 📌 Tab 1: REQUIREMENTS TAB */}
      {activeTab === 'requirements' && (
        <div className="space-y-5">
          {/* Sub-Filters Pill Bar */}
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2 flex-wrap">
              {[
                { id: 'all', label: 'All' },
                { id: 'pending', label: `Pending (${pendingRequirements.length})` },
                { id: 'approved', label: 'Approved' },
                { id: 'in_review', label: 'In Review' },
              ].map((pill) => (
                <button
                  key={pill.id}
                  type="button"
                  onClick={() => setFilterType(pill.id as any)}
                  className={`px-4 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                    filterType === pill.id
                      ? 'bg-blue-600 text-white shadow-2xs'
                      : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {pill.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                <Filter className="w-3.5 h-3.5 text-slate-400" />
                <span>Filters</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>
            </div>
          </div>

          {/* Pending Accordion Box (Exact ApplyBoard Visual Structure) */}
          <div className="bg-amber-50/40 rounded-2xl border border-amber-200/80 overflow-hidden shadow-2xs">
            {/* Accordion Header */}
            <div
              onClick={() => setPendingAccordionOpen(!pendingAccordionOpen)}
              className="p-4 sm:p-5 flex items-center justify-between cursor-pointer select-none bg-amber-100/50 hover:bg-amber-100/70 transition"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-full bg-amber-500 text-white flex items-center justify-center">
                  <Clock className="w-4 h-4" />
                </div>
                <h3 className="text-sm sm:text-base font-bold text-amber-950">
                  Pending Requirements ({pendingRequirements.length})
                </h3>
              </div>
              <ChevronDown
                className={`w-5 h-5 text-amber-800 transition-transform ${
                  pendingAccordionOpen ? 'rotate-180' : ''
                }`}
              />
            </div>

            {/* Accordion Item Rows */}
            {pendingAccordionOpen && (
              <div className="divide-y divide-amber-200/60 bg-white">
                {filteredRequirements.length > 0 ? (
                  filteredRequirements.map((req) => (
                    <div
                      key={req.id}
                      className="p-3.5 sm:p-4.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/80 transition"
                    >
                      {/* Left Requirement Icon & Title & Tags */}
                      <div className="flex items-start sm:items-center gap-3 min-w-0 flex-1">
                        <div className="w-8 h-8 rounded-lg bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center shrink-0 mt-0.5 sm:mt-0">
                          <FileText className="w-4 h-4" />
                        </div>
                        <div className="space-y-1 min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-slate-900 text-xs sm:text-sm">
                              {req.title}
                            </span>
                            {req.tag && (
                              <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-purple-50 text-purple-700 border border-purple-200">
                                {req.tag}
                              </span>
                            )}
                            {req.timing && (
                              <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-100 text-amber-800 border border-amber-200">
                                {req.timing}
                              </span>
                            )}
                            {req.isCompleted && (
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                                <Check className="w-3 h-3" /> Approved
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-500 line-clamp-1">
                            {req.description}
                          </p>
                        </div>
                      </div>

                      {/* Right Action Button & Menu */}
                      <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                        {req.isCompleted ? (
                          <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Completed
                          </span>
                        ) : req.actionText === 'Go to profile' ? (
                          <Link
                            href="/student/profile"
                            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-2xs transition"
                          >
                            <User className="w-3.5 h-3.5" />
                            <span>Go to profile</span>
                          </Link>
                        ) : req.actionText === 'Answer' ? (
                          <button
                            type="button"
                            onClick={() => handleOpenAnswer(req)}
                            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-2xs transition cursor-pointer"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            <span>Answer</span>
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleOpenUpload(req)}
                            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-2xs transition cursor-pointer"
                          >
                            <Upload className="w-3.5 h-3.5" />
                            <span>Upload</span>
                          </button>
                        )}

                        <button
                          type="button"
                          className="w-8 h-8 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 flex items-center justify-center transition"
                          title="Options"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center text-slate-500 text-xs">
                    No requirements found for filter "{filterType}".
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 📌 Tab 2: STUDENT RECORDS */}
      {activeTab === 'records' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 space-y-6 shadow-xs">
          <div>
            <h3 className="text-base font-bold text-slate-900">Applicant Information</h3>
            <p className="text-xs text-slate-500 mt-0.5">Records attached to this university application</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/70">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Full Legal Name</span>
              <span className="font-bold text-slate-800 text-sm">{student?.name || 'Applicant'}</span>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/70">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Email Address</span>
              <span className="font-bold text-slate-800 text-sm">{student?.email || 'N/A'}</span>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/70">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Passport Number</span>
              <span className="font-bold text-slate-800 text-sm">{student?.passport_number || 'Under Review'}</span>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/70">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Nationality</span>
              <span className="font-bold text-slate-800 text-sm">{student?.nationality || 'International'}</span>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/70">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Permanent City & Country</span>
              <span className="font-bold text-slate-800 text-sm">{student?.city || 'City'}, {student?.country || 'Country'}</span>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/70">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Emergency Contact</span>
              <span className="font-bold text-slate-800 text-sm">{student?.home_contact_number || student?.phone || 'On file'}</span>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100">
            <h4 className="text-sm font-bold text-slate-900 mb-3">Submitted Application Documents ({documents.length})</h4>
            {documents.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {documents.map((doc, idx) => (
                  <div
                    key={doc.id || idx}
                    className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <FileText className="w-4 h-4 text-blue-600 shrink-0" />
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-800 truncate">
                          {doc.document_name || doc.doc_name || 'Document'}
                        </p>
                        <p className="text-[10px] text-slate-400">Verified file</p>
                      </div>
                    </div>
                    {doc.imgname && (
                      <a
                        href={doc.imgname.startsWith('http') ? doc.imgname : `https://admin.educationmalaysia.in/storage/uploads/documents/${doc.imgname}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs font-bold text-blue-600 hover:text-blue-800"
                      >
                        View &rarr;
                      </a>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic">No files submitted yet. Use the Requirements tab to upload.</p>
            )}
          </div>
        </div>
      )}

      {/* 📌 Tab 3: NOTES & ACTIVITY LOG */}
      {activeTab === 'notes' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 space-y-6 shadow-xs">
          <div>
            <h3 className="text-base font-bold text-slate-900">Application Notes & Activity History</h3>
            <p className="text-xs text-slate-500 mt-0.5">Communicate notes with the university application team</p>
          </div>

          {/* Add Note Box */}
          <form onSubmit={handleAddNote} className="space-y-3">
            <textarea
              rows={3}
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              placeholder="Leave a note or query regarding this application..."
              className="w-full p-3.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
            <div className="flex justify-end">
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-2xs transition cursor-pointer"
              >
                Post Note
              </button>
            </div>
          </form>

          {/* Notes List */}
          <div className="space-y-3 pt-4 border-t border-slate-100">
            {notes.map((n) => (
              <div
                key={n.id}
                className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/60 space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                    {n.sender}
                    {n.isOfficial && (
                      <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-blue-100 text-blue-800">
                        Official
                      </span>
                    )}
                  </span>
                  <span className="text-[10px] text-slate-400">{n.date}</span>
                </div>
                <p className="text-xs text-slate-700 leading-relaxed">{n.text}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 📤 Upload Document Modal */}
      {uploadModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-200 p-6 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Upload className="w-4 h-4" />
                </div>
                <h3 className="text-sm sm:text-base font-bold text-slate-900">Upload Requirement</h3>
              </div>
              <button
                type="button"
                onClick={() => setUploadModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Requirement Name</label>
                <input
                  type="text"
                  value={uploadDocName}
                  onChange={(e) => setUploadDocName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Select File (PDF, JPG, PNG)</label>
                <input
                  type="file"
                  accept=".pdf,image/png,image/jpeg,image/jpg"
                  onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-600 file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setUploadModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs disabled:opacity-60 cursor-pointer"
                >
                  {uploading ? 'Uploading...' : 'Submit Document'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ✍️ Answer Modal */}
      {answerModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-200 p-6 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">{answerTitle}</h3>
              <button
                type="button"
                onClick={() => setAnswerModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <label className="text-xs font-semibold text-slate-600 block">
                Please provide information for {answerTitle}:
              </label>
              <textarea
                rows={3}
                value={answerValue}
                onChange={(e) => setAnswerValue(e.target.value)}
                placeholder="Enter details here..."
                className="w-full p-3 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setAnswerModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveAnswer}
                disabled={savingAnswer}
                className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs disabled:opacity-60 cursor-pointer"
              >
                {savingAnswer ? 'Saving...' : 'Save Answer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
