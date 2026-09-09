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
  Share2,
  Activity,
  Send,
  UploadCloud,
} from 'lucide-react'
import { toast } from 'react-toastify'
import { evaluateStudentChecklist, ChecklistItem } from '@/utils/studentChecklist'

const API_BASE = (process.env.NEXT_PUBLIC_API_URL || '/api/v1').replace(/\/$/, '')
const API_KEY = process.env.NEXT_PUBLIC_FRONTEND_API_KEY || ''

interface RequirementItem {
  id: string
  title: string
  name?: string
  missingTitle?: string
  description: string
  category?: string
  priority?: string
  isCompleted: boolean
  actionType?: 'upload' | 'profile' | 'photo'
  actionLabel?: string
  documentName?: string
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

  // Tabs: Requirements & Student Activity
  const [activeTab, setActiveTab] = useState<'requirements' | 'activity'>('requirements')
  const [filterType, setFilterType] = useState<'all' | 'pending' | 'approved' | 'rejected' | 'in_review'>('pending')
  const [filterDropdownOpen, setFilterDropdownOpen] = useState(false)
  const [pendingAccordionOpen, setPendingAccordionOpen] = useState(true)

  // Upload Modal
  const [uploadModalOpen, setUploadModalOpen] = useState(false)
  const [selectedReq, setSelectedReq] = useState<RequirementItem | null>(null)
  const [uploadFile, setUploadFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadDocName, setUploadDocName] = useState('')
  const [uploadError, setUploadError] = useState('')

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

  const [serverRequirements, setServerRequirements] = useState<any[]>([]);

  const loadData = async () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
    if (!token) {
      router.push('/login')
      return
    }

    const headers: Record<string, string> = {
      Authorization: `Bearer ${token}`,
      ...(API_KEY ? { 'x-api-key': API_KEY } : {}),
    }

    try {
      const [appRes, profileRes, docRes, reqRes] = await Promise.all([
        fetch(`${API_BASE}/student/applied-college`, { headers }).catch(() => null),
        fetch(`${API_BASE}/student/profile`, { headers }).catch(() => null),
        fetch(`${API_BASE}/student/documents`, { headers }).catch(() => null),
        fetch(`${API_BASE}/student/applications/${applicationId}/requirements`, { headers }).catch(() => null),
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

      const reqJson = reqRes ? await reqRes.json().catch(() => null) : null
      const reqList = Array.isArray(reqJson?.data?.requirements)
        ? reqJson.data.requirements
        : Array.isArray(reqJson?.requirements)
        ? reqJson.requirements
        : []
      if (reqList.length > 0) {
        setServerRequirements(reqList)
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

  // Map checklist or dynamic server requirements into ApplyBoard-style requirements
  const requirementsList: RequirementItem[] = useMemo(() => {
    if (serverRequirements.length > 0) {
      return serverRequirements.map((r: any) => {
        const uploadedDoc = documents.find(
          (d: any) => String(d.doc_name || '').toLowerCase().trim() === String(r.title || '').toLowerCase().trim()
        )

        let statusType: 'pending' | 'approved' | 'rejected' | 'in_review' = 'pending'
        let isCompleted = false

        if (r.doc_status === 'Not Approved' || r.doc_status === 'Rejected') {
          statusType = 'rejected'
          isCompleted = false // Re-upload required!
        } else if (r.doc_status === 'Approved' || r.doc_status === 'Completed') {
          statusType = 'approved'
          isCompleted = true
        } else if (r.doc_status === 'Reviewing') {
          statusType = 'in_review'
          isCompleted = false
        } else {
          // r.doc_status is 'Pending'
          if (uploadedDoc) {
            statusType = 'in_review'
            isCompleted = false
          } else {
            statusType = 'pending'
            isCompleted = false
          }
        }

        const actionType = (r.action_type || (r.title.includes('Parent') ? 'profile' : 'upload')) as 'upload' | 'profile'

        let actionText = 'Upload'
        if (statusType === 'rejected') actionText = 'Upload Again'
        else if (statusType === 'approved') actionText = 'Approved'
        else if (statusType === 'in_review') actionText = 'Under Review'
        else if (actionType === 'profile') actionText = 'Go to profile'

        return {
          id: String(r.id),
          title: r.title,
          description: `Requirement for ${r.stage_tag || 'application processing'}.`,
          tag: r.tag || 'Required',
          timing: r.stage_tag || 'Before payment',
          isCompleted,
          statusType,
          documentName: r.title,
          actionType,
          actionText,
        }
      })
    }

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
  }, [serverRequirements, documents, evaluatedChecklist])

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

  // Document status evaluations
  const docRequirements = useMemo(() => {
    return requirementsList.filter((r) => r.actionType === 'upload')
  }, [requirementsList])

  const requiredDocList = useMemo(() => {
    return docRequirements.filter((r) => r.tag === 'Required')
  }, [docRequirements])

  const pendingRequiredDocs = useMemo(() => {
    return requiredDocList.filter((r) => !r.isCompleted)
  }, [requiredDocList])

  const allRequiredDocsUploaded = useMemo(() => {
    if (requiredDocList.length === 0) {
      return docRequirements.length > 0 && docRequirements.every((r) => r.isCompleted)
    }
    return requiredDocList.every((r) => r.isCompleted)
  }, [requiredDocList, docRequirements])

  const allDocumentsUploaded = useMemo(() => {
    return docRequirements.length > 0 && docRequirements.every((r) => r.isCompleted)
  }, [docRequirements])

  // Dynamic Pipeline Stages State
  const [dynamicStages, setDynamicStages] = useState<any[]>([]);

  useEffect(() => {
    const fetchStages = async () => {
      try {
        const res = await fetch(`${API_BASE}/student/pipeline-stages`, {
          headers: { ...(API_KEY ? { 'x-api-key': API_KEY } : {}) },
        });
        const json = await res.json();
        const list = Array.isArray(json?.data?.stages)
          ? json.data.stages
          : Array.isArray(json?.stages)
          ? json.stages
          : [];
        if (list.length > 0) setDynamicStages(list);
      } catch (err) {
        console.error('Failed to fetch dynamic pipeline stages:', err);
      }
    };
    fetchStages();
  }, []);

  const STAGES = useMemo(() => {
    if (dynamicStages.length > 0) {
      return dynamicStages.map((s, i) => ({
        title: s.name,
        subtitle: s.description || `Step ${i + 1}`,
        position: s.position ?? i + 1,
      }));
    }
    return [
      { title: 'Application created', subtitle: 'Record created', position: 1 },
      { title: 'Application Started', subtitle: `Deadline is ${deadlineStr}`, position: 2 },
      { title: 'Application Review (By Education Malaysia)', subtitle: 'By Education Malaysia', position: 3 },
      { title: 'Submitting to School', subtitle: 'University portal', position: 4 },
      { title: 'Awaiting School Decision', subtitle: 'Admissions committee', position: 5 },
      { title: 'Admission Processing', subtitle: 'Offer letter', position: 6 },
      { title: 'Pre-Arrival', subtitle: 'EMGS Visa approval', position: 7 },
      { title: 'Arrival', subtitle: 'Fly to Malaysia', position: 8 },
    ];
  }, [dynamicStages, deadlineStr]);

  const currentStageIndex = useMemo(() => {
    const rawStage = String(application?.stage || '').trim();
    const appStage = rawStage.toLowerCase();

    if (appStage) {
      // 1. Exact match by title
      const foundIdx = STAGES.findIndex(
        (st) => st.title.toLowerCase().trim() === appStage
      );
      if (foundIdx !== -1) return foundIdx;

      // 2. Match by position if stage is numeric (e.g. "3")
      const numPos = parseInt(rawStage, 10);
      if (!isNaN(numPos) && numPos > 0 && numPos <= STAGES.length) {
        return numPos - 1;
      }

      // 3. Partial / slug matching
      const cleanAppStage = appStage.replace(/[^a-z0-9]/g, '');
      const partialIdx = STAGES.findIndex((st) => {
        const cleanTitle = st.title.toLowerCase().replace(/[^a-z0-9]/g, '');
        return cleanTitle.includes(cleanAppStage) || cleanAppStage.includes(cleanTitle);
      });
      if (partialIdx !== -1) return partialIdx;

      // 4. Common legacy mapping
      if (appStage === 'pre-payment' || appStage === 'prepayment') return 0;
      if (appStage === 'post-payment' || appStage === 'postpayment') return 3;
    }

    const s = String(application?.app_status || '').toLowerCase().trim();
    if (s === 'accepted' || s === 'approved') return Math.min(5, STAGES.length - 1);
    if (s === 'paid' && allRequiredDocsUploaded) return Math.min(3, STAGES.length - 1);

    if (!allRequiredDocsUploaded) {
      return 0; // Application created
    }

    if (s === 'paid') return Math.min(3, STAGES.length - 1);
    if (allDocumentsUploaded || evaluatedChecklist.progressPercent >= 85) {
      return Math.min(2, STAGES.length - 1);
    }
    return 1;
  }, [application, STAGES, allRequiredDocsUploaded, allDocumentsUploaded, evaluatedChecklist]);

  // Handle Document Upload
  const handleOpenUpload = (req: RequirementItem) => {
    setSelectedReq(req)
    setUploadDocName(req.documentName || req.title)
    setUploadFile(null)
    setUploadError('')
    setUploadModalOpen(true)
  }

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!uploadFile) {
      setUploadError('Please select a file to upload')
      toast.error('Please select a file to upload')
      return
    }

    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
    if (!token) return

    setUploading(true)
    setUploadError('')
    const targetDocName = uploadDocName || selectedReq?.documentName || selectedReq?.title || 'Document'
    const formData = new FormData()
    formData.append('document_name', targetDocName)
    formData.append('doc_name', targetDocName)
    formData.append('document', uploadFile)
    formData.append('doc', uploadFile)
    formData.append('document_file', uploadFile)

    try {
      const res = await fetch(`${API_BASE}/student/upload-documents`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          ...(API_KEY ? { 'x-api-key': API_KEY } : {}),
        },
        body: formData,
      })

      const data = await res.json()
      if (res.ok) {
        if (selectedReq?.id && !isNaN(Number(selectedReq.id))) {
          fetch(`${API_BASE}/student/applications/requirements/${selectedReq.id}`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
              ...(API_KEY ? { 'x-api-key': API_KEY } : {}),
            },
            body: JSON.stringify({ doc_status: 'Reviewing' }),
          }).catch(() => null)
        }

        toast.success(`${uploadDocName || 'Document'} uploaded successfully!`)
        setUploadModalOpen(false)
        setUploadFile(null)
        setUploadError('')
        // Refresh documents
        loadData()
        try {
          localStorage.setItem('student_documents_updated', String(Date.now()))
          window.dispatchEvent(new Event('student_documents_updated'))
        } catch {}
      } else {
        const msg = data?.message || 'Failed to upload document'
        setUploadError(msg)
        toast.error(msg)
      }
    } catch (err) {
      console.error('Upload error:', err)
      setUploadError('Network error while uploading. Please try again.')
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
    toast.success('Activity update posted to timeline')
  }

  // Dynamic Activity Stream (Tracks all events on this student application)
  const activityList = useMemo(() => {
    const list: Array<{
      id: string | number
      type: 'document' | 'milestone' | 'status' | 'note' | 'profile'
      title: string
      description: string
      date: string
      badge: string
      badgeColor: 'blue' | 'emerald' | 'amber' | 'purple' | 'slate'
      linkUrl?: string
      linkText?: string
      author?: string
      isOfficial?: boolean
    }> = []

    // 1. User & Staff Activity Notes
    notes.forEach((n) => {
      list.push({
        id: `note_${n.id}`,
        type: 'note',
        title: n.isOfficial ? 'Official Advisory Note' : `${n.sender || 'Student'} posted an update`,
        description: n.text,
        date: n.date,
        badge: n.isOfficial ? 'Advisory' : 'Student Note',
        badgeColor: n.isOfficial ? 'blue' : 'purple',
        author: n.sender || 'Student',
        isOfficial: n.isOfficial,
      })
    })

    // 2. Payment & Application Submission Status
    if (isPaid) {
      list.push({
        id: 'payment_done',
        type: 'status',
        title: 'Application Payment Completed',
        description: 'Application processing fee successfully paid. University admission dossier unlocked.',
        date: application?.payment_date || 'Fee Paid',
        badge: 'Paid & Active',
        badgeColor: 'emerald',
        author: 'Finance Desk',
      })
    }

    // 3. Milestone: All Required Documents
    if (allRequiredDocsUploaded) {
      list.push({
        id: 'all_docs_ready',
        type: 'milestone',
        title: 'All Required Documents Uploaded',
        description: 'Mandatory document checklist fulfilled. Application pipeline advanced to "Application Started".',
        date: 'Stage Milestone',
        badge: 'Application Started',
        badgeColor: 'emerald',
        author: 'Admissions System',
      })
    } else {
      list.push({
        id: 'docs_pending',
        type: 'status',
        title: `${pendingRequiredDocs.length} Mandatory Document(s) Pending`,
        description: 'Upload required documents in the Requirements tab to advance your application to "Application Started".',
        date: 'Action Required',
        badge: 'Pending Upload',
        badgeColor: 'amber',
        author: 'Admissions Desk',
      })
    }

    // 4. Document Upload Events (from uploaded documents)
    if (Array.isArray(documents) && documents.length > 0) {
      documents.forEach((doc, idx) => {
        const docName = doc.document_name || doc.doc_name || doc.imgname || `Document #${idx + 1}`
        const fileUrl = doc.imgname
          ? (doc.imgname.startsWith('http') ? doc.imgname : `https://admin.educationmalaysia.in/storage/uploads/documents/${doc.imgname}`)
          : undefined
        list.push({
          id: `doc_${doc.id || idx}`,
          type: 'document',
          title: `Document Uploaded: ${docName}`,
          description: `Verified document file attached to student application portfolio.`,
          date: doc.created_at ? new Date(doc.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Verified',
          badge: 'Document Verified',
          badgeColor: 'emerald',
          linkUrl: fileUrl,
          linkText: 'View File',
          author: student?.name || 'Applicant',
        })
      })
    }

    // 5. Profile Sync Event
    if (student?.name) {
      list.push({
        id: 'profile_info',
        type: 'profile',
        title: 'Student Profile Linked',
        description: `Applicant profile on file: ${student.name} (${student.nationality || 'International'}). Passport: ${student.passport_number || 'On file'}.`,
        date: 'Profile Sync',
        badge: 'Identity Recorded',
        badgeColor: 'slate',
        author: 'System',
      })
    }

    // 6. Initial Application Creation
    list.push({
      id: 'app_created',
      type: 'milestone',
      title: 'Application Created',
      description: `Application initiated for ${courseName} at ${universityName}. Selected Intake: ${intakeStr}.`,
      date: application?.created_at ? new Date(application.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Initial Step',
      badge: 'Initiated',
      badgeColor: 'blue',
      author: 'NextEducation Portal',
    })

    return list
  }, [notes, isPaid, application, allRequiredDocsUploaded, pendingRequiredDocs.length, documents, student, courseName, universityName, intakeStr])

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

        {isPaid && (
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Paid & Confirmed</span>
            </span>
          </div>
        )}
      </div>

      {/* 🏛️ Top Header Card (Matching ApplyBoard Reference Screenshot) */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-3 sm:gap-4">
          <div className="space-y-1.5 flex-1 min-w-0">
            {/* University Logo & Name */}
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-blue-50 border border-blue-200/80 text-blue-700 flex items-center justify-center shrink-0">
                <Building2 className="w-4 h-4" />
              </div>
              <div className="flex items-center gap-1.5 min-w-0">
                <span className="text-xs sm:text-sm font-bold text-slate-700 hover:text-blue-600 transition truncate">
                  {universityName}
                </span>
                <ExternalLink className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              </div>
            </div>

            {/* Course Name (Prominent & Bold) */}
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-slate-900 tracking-tight leading-tight">
              {courseName}
            </h1>

            {/* Meta row: App ID & Intake */}
            <div className="flex items-center gap-2.5 sm:gap-3 flex-wrap text-xs text-slate-500">
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
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 sm:py-2 rounded-xl border border-blue-600/30 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs sm:text-sm font-bold shadow-2xs transition cursor-pointer"
            >
              <span>Manage App</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${manageAppOpen ? 'rotate-180' : ''}`} />
            </button>

            {manageAppOpen && (
              <div className="absolute right-0 mt-1.5 w-52 bg-white rounded-2xl border border-slate-200 shadow-xl p-1.5 z-30 space-y-1">
                <Link
                  href="/contact-us"
                  className="w-full flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
                  onClick={() => setManageAppOpen(false)}
                >
                  <PhoneCall className="w-3.5 h-3.5 text-blue-600" />
                  <span>Contact Counselor</span>
                </Link>
                <Link
                  href="/student/profile"
                  className="w-full flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
                  onClick={() => setManageAppOpen(false)}
                >
                  <User className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Update Profile Data</span>
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* 🛣️ Real-Time Stepper Pipeline (Expandable / Collapsible) */}
        <div className="mt-4 pt-3.5 border-t border-slate-100">
          <div className="flex items-center justify-between pb-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
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
            <div className="overflow-x-auto scrollbar-none pt-1 pb-1">
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
                          className={`text-xs font-bold mt-1.5 leading-tight ${
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
                        {isCurrent && Boolean(st.subtitle) && (
                          <span className="mt-1 inline-block px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-200">
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
            onClick={() => setActiveTab('activity')}
            className={`pb-3.5 text-sm sm:text-base font-bold transition-all relative cursor-pointer flex items-center gap-2 ${
              activeTab === 'activity'
                ? 'text-blue-600'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Activity className="w-4 h-4" />
            <span>Student Activity</span>
            <span className="ml-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
              {activityList.length}
            </span>
            {activeTab === 'activity' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-full" />
            )}
          </button>
        </div>
      </div>

      {/* 📌 Tab 1: REQUIREMENTS TAB */}
      {activeTab === 'requirements' && (
        <div className="space-y-5">
          {/* Filter Bar with Functional Dropdown */}
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-700">
                Application Requirements
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
                {filteredRequirements.length} shown
              </span>
            </div>

            {/* Functional Filter Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setFilterDropdownOpen(!filterDropdownOpen)}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 shadow-2xs transition cursor-pointer"
              >
                <Filter className="w-3.5 h-3.5 text-blue-600" />
                <span>
                  Filter: {filterType === 'all'
                    ? 'All'
                    : filterType === 'pending'
                    ? `Pending (${pendingRequirements.length})`
                    : filterType === 'approved'
                    ? 'Approved'
                    : 'In Review'}
                </span>
                <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${filterDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {filterDropdownOpen && (
                <div className="absolute right-0 mt-1.5 w-60 bg-white rounded-2xl border border-slate-200 shadow-xl p-1.5 z-30 space-y-1">
                  {[
                    { id: 'all', label: 'All Requirements', count: requirementsList.length },
                    { id: 'pending', label: 'Pending Requirements', count: pendingRequirements.length },
                    { id: 'approved', label: 'Approved Documents', count: requirementsList.filter((r) => r.statusType === 'approved').length },
                    { id: 'in_review', label: 'In Review', count: requirementsList.filter((r) => r.statusType === 'in_review').length },
                  ].map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => {
                        setFilterType(opt.id as any)
                        setFilterDropdownOpen(false)
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
                        filterType === opt.id
                          ? 'bg-blue-50 text-blue-700 font-bold'
                          : 'text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {filterType === opt.id && <Check className="w-3.5 h-3.5 text-blue-600 stroke-[3]" />}
                        <span>{opt.label}</span>
                      </div>
                      <span
                        className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                          filterType === opt.id
                            ? 'bg-blue-200/70 text-blue-900'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {opt.count}
                      </span>
                    </button>
                  ))}
                </div>
              )}
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
                            {req.statusType === 'approved' ? (
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                                <Check className="w-3 h-3" /> Approved
                              </span>
                            ) : req.statusType === 'rejected' ? (
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200 flex items-center gap-1">
                                <AlertCircle className="w-3 h-3 text-rose-600" /> Not Approved
                              </span>
                            ) : req.statusType === 'in_review' ? (
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200 flex items-center gap-1">
                                <Clock className="w-3 h-3 text-amber-600" /> In Review
                              </span>
                            ) : null}
                          </div>
                        </div>
                      </div>

                      {/* Right Action Button & Menu */}
                      <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                        {req.statusType === 'approved' ? (
                          <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Approved
                          </span>
                        ) : req.statusType === 'rejected' ? (
                          <button
                            type="button"
                            onClick={() => handleOpenUpload(req)}
                            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-2xs transition cursor-pointer"
                          >
                            <Upload className="w-3.5 h-3.5" />
                            <span>Upload Again</span>
                          </button>
                        ) : req.statusType === 'in_review' ? (
                          <button
                            type="button"
                            onClick={() => handleOpenUpload(req)}
                            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-xs font-bold transition cursor-pointer"
                          >
                            <Clock className="w-3.5 h-3.5 text-amber-600" />
                            <span>In Review (Re-upload)</span>
                          </button>
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

      {/* 📌 Tab 2: STUDENT ACTIVITY & APPLICATION TIMELINE */}
      {activeTab === 'activity' && (
        <div className="space-y-6">
          {/* Top Activity Header */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 space-y-6 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-blue-600" />
                  <span>Student Activity & Records Timeline</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Live real-time feed of documents, milestones, status changes, and application logs
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  Live Tracking Active
                </span>
              </div>
            </div>

            {/* Applicant Information Summary Cards */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                Applicant Information Record
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 text-xs">
                <div className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-200/80">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">Full Legal Name</span>
                  <span className="font-bold text-slate-900 text-sm">{student?.name || 'Applicant'}</span>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-200/80">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">Email Address</span>
                  <span className="font-bold text-slate-900 text-sm truncate block">{student?.email || 'N/A'}</span>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-200/80">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">Passport Number</span>
                  <span className="font-bold text-slate-900 text-sm">{student?.passport_number || 'Under Review'}</span>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-200/80">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">Nationality</span>
                  <span className="font-bold text-slate-900 text-sm">{student?.nationality || 'International'}</span>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-200/80">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">Permanent City & Country</span>
                  <span className="font-bold text-slate-900 text-sm">{student?.city || 'City'}, {student?.country || 'Country'}</span>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-200/80">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">Emergency Contact</span>
                  <span className="font-bold text-slate-900 text-sm">{student?.home_contact_number || student?.phone || 'On file'}</span>
                </div>
              </div>
            </div>

            {/* Post Activity Note Box */}
            <div className="p-4 rounded-2xl bg-blue-50/50 border border-blue-100 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-blue-950 flex items-center gap-1.5">
                  <MessageCircle className="w-3.5 h-3.5 text-blue-600" />
                  Log Activity Update or Note
                </span>
                <span className="text-[10px] text-blue-700">Appends to student activity timeline</span>
              </div>
              <form onSubmit={handleAddNote} className="space-y-2.5">
                <textarea
                  rows={2}
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  placeholder="Post an update, question, or note to this student's activity timeline..."
                  className="w-full p-3 rounded-xl border border-blue-200 bg-white text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-2xs transition cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Post Activity</span>
                  </button>
                </div>
              </form>
            </div>

            {/* Live Student Activity Timeline */}
            <div className="space-y-4 pt-2">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <span>Activity Stream</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600">
                    {activityList.length} events
                  </span>
                </h4>
              </div>

              <div className="relative border-l-2 border-slate-200 ml-3.5 pl-6 sm:pl-7 space-y-6 pt-2 pb-2">
                {activityList.map((act) => {
                  return (
                    <div key={act.id} className="relative group">
                      {/* Timeline Node Icon Indicator */}
                      <div
                        className={`absolute -left-[35px] sm:-left-[39px] top-0.5 w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center border-2 bg-white shadow-2xs transition-transform group-hover:scale-110 ${
                          act.badgeColor === 'emerald'
                            ? 'border-emerald-500 text-emerald-600 bg-emerald-50/80'
                            : act.badgeColor === 'blue'
                            ? 'border-blue-500 text-blue-600 bg-blue-50/80'
                            : act.badgeColor === 'amber'
                            ? 'border-amber-500 text-amber-600 bg-amber-50/80'
                            : act.badgeColor === 'purple'
                            ? 'border-purple-500 text-purple-600 bg-purple-50/80'
                            : 'border-slate-400 text-slate-600 bg-slate-50'
                        }`}
                      >
                        {act.type === 'document' ? (
                          <FileCheck2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        ) : act.type === 'milestone' ? (
                          <GraduationCap className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        ) : act.type === 'status' ? (
                          <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        ) : act.type === 'note' ? (
                          <MessageCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        ) : (
                          <User className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        )}
                      </div>

                      {/* Event Card Content */}
                      <div className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/60 hover:bg-white hover:border-slate-300 hover:shadow-xs transition space-y-2">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-slate-900 text-xs sm:text-sm">
                              {act.title}
                            </span>
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                act.badgeColor === 'emerald'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : act.badgeColor === 'blue'
                                  ? 'bg-blue-100 text-blue-800'
                                  : act.badgeColor === 'amber'
                                  ? 'bg-amber-100 text-amber-900'
                                  : act.badgeColor === 'purple'
                                  ? 'bg-purple-100 text-purple-800'
                                  : 'bg-slate-100 text-slate-700'
                              }`}
                            >
                              {act.badge}
                            </span>
                          </div>
                          <span className="text-[11px] font-medium text-slate-400">
                            {act.date}
                          </span>
                        </div>

                        <p className="text-xs text-slate-600 leading-relaxed">
                          {act.description}
                        </p>

                        <div className="flex items-center justify-between pt-1 text-[11px] text-slate-400 border-t border-slate-200/50">
                          <span>Logged by: <strong className="text-slate-700">{act.author}</strong></span>
                          {act.linkUrl && (
                            <a
                              href={act.linkUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 font-bold text-blue-600 hover:text-blue-800 transition"
                            >
                              <span>{act.linkText || 'View File'}</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Submitted Application Documents Grid */}
            <div className="pt-4 border-t border-slate-100 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-slate-900">
                  Attached Portfolio Documents ({documents.length})
                </h4>
                <button
                  type="button"
                  onClick={() => setActiveTab('requirements')}
                  className="text-xs font-bold text-blue-600 hover:text-blue-800"
                >
                  Upload more in Requirements &rarr;
                </button>
              </div>

              {documents.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {documents.map((doc, idx) => (
                    <div
                      key={doc.id || idx}
                      className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 bg-white hover:border-slate-300 hover:shadow-2xs transition"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center shrink-0">
                          <FileText className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-800 truncate">
                            {doc.document_name || doc.doc_name || 'Document'}
                          </p>
                          <p className="text-[10px] text-slate-400">Verified attachment</p>
                        </div>
                      </div>
                      {doc.imgname && (
                        <a
                          href={doc.imgname.startsWith('http') ? doc.imgname : `https://admin.educationmalaysia.in/storage/uploads/documents/${doc.imgname}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs font-bold text-blue-600 hover:text-blue-800 shrink-0 ml-2 inline-flex items-center gap-1"
                        >
                          <span>View</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-6 rounded-xl border border-dashed border-slate-200 text-center text-xs text-slate-400">
                  No documents uploaded yet. Go to the Requirements tab to upload your mandatory documents.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 📤 Upload Document Modal (Identical Design to Profile Page DocumentUploadForm) */}
      {uploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-md w-full border border-slate-200 shadow-xl overflow-hidden animate-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
                  <UploadCloud className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">
                    {selectedReq?.title ? `Upload ${selectedReq.title}` : uploadDocName ? `Upload ${uploadDocName}` : 'Upload Document'}
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    PDF, JPEG, PNG format (up to 10MB)
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setUploadModalOpen(false)}
                className="w-7 h-7 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 flex items-center justify-center transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 sm:p-5 space-y-3.5">
              {uploadError && (
                <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0 text-rose-600" />
                  <span>{uploadError}</span>
                </div>
              )}

              {/* Document Name */}
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700">
                  Document Name <span className="text-rose-500">*</span>
                </label>
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                  <p className="font-bold text-slate-800">{selectedReq?.title || uploadDocName}</p>
                </div>
              </div>

              {/* File Selector (Dashed Drag-and-Drop Area) */}
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700">
                  Select File <span className="text-rose-500">*</span>
                </label>
                <label className="flex flex-col items-center justify-center w-full min-h-[115px] p-3 border-2 border-dashed border-slate-200 hover:border-blue-500/60 rounded-xl cursor-pointer bg-slate-50/50 hover:bg-blue-50/30 transition group">
                  <UploadCloud className="w-6 h-6 text-slate-400 group-hover:text-blue-600 transition mb-1.5" />
                  {uploadFile ? (
                    <div className="text-center">
                      <p className="text-xs font-bold text-slate-800 truncate max-w-xs">
                        {uploadFile.name}
                      </p>
                      <p className="text-[10px] text-emerald-600 font-semibold mt-0.5">
                        {(uploadFile.size / (1024 * 1024)).toFixed(2)} MB &bull; Click to change file
                      </p>
                    </div>
                  ) : (
                    <div className="text-center">
                      <p className="text-xs font-semibold text-slate-700">
                        Choose PDF or Image file
                      </p>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        PDF, JPG, PNG up to 10MB
                      </p>
                    </div>
                  )}
                  <input
                    type="file"
                    accept=".pdf,.jpeg,.jpg,.png"
                    onChange={(e) => {
                      setUploadFile(e.target.files?.[0] || null)
                      setUploadError('')
                    }}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-2.5 p-3.5 sm:p-4 bg-slate-50 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setUploadModalOpen(false)}
                className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-200/60 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleUploadSubmit}
                disabled={uploading}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-xs font-semibold shadow-xs transition active:scale-95 cursor-pointer"
              >
                {uploading ? (
                  <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Check className="w-3.5 h-3.5" />
                )}
                {uploading ? 'Uploading...' : 'Confirm Upload'}
              </button>
            </div>
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
