'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { toast } from 'react-toastify'
import Link from 'next/link'
import { matchesDocumentRequirement, getFullDocUrl, isStaffUploaded } from '@/utils/studentChecklist'
import {
  FileUp,
  FileText,
  Check,
  Eye,
  UploadCloud,
  AlertCircle,
  CheckCircle2,
  X,
  Plus,
  RefreshCw,
  FileCheck2,
  ArrowUpRight,
  ArrowRight,
  Building2,
  Download,
  UserCheck,
  ShieldCheck,
} from 'lucide-react'

const API_BASE = (process.env.NEXT_PUBLIC_API_URL || '/api/v1').replace(/\/$/, '')
const API_KEY = process.env.NEXT_PUBLIC_FRONTEND_API_KEY || ''

export interface RequiredDocConfig {
  key: string
  dbName: string
  title: string
  description: string
  category: string
  priority: 'Mandatory' | 'Required' | 'Recommended'
  match: (name: string) => boolean
  serverReq?: any
}

export const OFFICIAL_REQUIRED_DOCUMENTS: RequiredDocConfig[] = [
  {
    key: 'passport',
    dbName: 'Passport',
    title: 'International Passport Copy',
    description: 'Scanned clear copy of biodata and address pages. Mandatory for EMGS visa clearance.',
    category: 'Identity & Visa',
    priority: 'Mandatory',
    match: (name: string) => {
      const lower = name.toLowerCase().trim()
      if (lower === 'passport') return true
      return lower.includes('passport') && !lower.includes('photo') && !lower.includes('size') && !lower.includes('pic')
    }
  },
  {
    key: '12th_certificate',
    dbName: '12th Certificate',
    title: 'Grade 12 / High School Marksheet & Certificate',
    description: 'Senior secondary passing certificate and marksheet for university qualification eligibility.',
    category: 'Academic Records',
    priority: 'Mandatory',
    match: (name: string) => {
      const lower = name.toLowerCase().trim()
      if (lower === '12th certificate' || lower === 'grade 12/high school') return true
      return (
        lower.includes('12th') ||
        lower.includes('high school') ||
        lower.includes('senior secondary') ||
        lower.includes('intermediate') ||
        lower.includes('a-level') ||
        lower.includes('a level') ||
        lower.includes('grade 12')
      )
    }
  },
  {
    key: 'passport_photo',
    dbName: 'Passport Size Photo',
    title: 'Passport Size Photograph (White Background)',
    description: 'Recent 35mm x 45mm formal photo on pure white background for student ID & visa clearance.',
    category: 'Identity & Visa',
    priority: 'Mandatory',
    match: (name: string) => {
      const lower = name.toLowerCase().trim()
      if (lower === 'passport size photo') return true
      return (
        lower.includes('photo') ||
        lower.includes('picture') ||
        (lower.includes('passport') && (lower.includes('photo') || lower.includes('size') || lower.includes('pic')))
      )
    }
  },
  {
    key: '10th_certificate',
    dbName: '10th Certificate',
    title: 'Grade 10 / Secondary School Certificate',
    description: 'Secondary passing certificate and marksheet for date of birth & academic foundation verification.',
    category: 'Academic Records',
    priority: 'Mandatory',
    match: (name: string) => {
      const lower = name.toLowerCase().trim()
      if (lower === '10th certificate') return true
      return (
        lower.includes('10th') ||
        lower.includes('secondary') ||
        lower.includes('matric') ||
        lower.includes('o-level') ||
        lower.includes('o level') ||
        lower.includes('grade 10')
      )
    }
  },
  {
    key: 'english_language',
    dbName: 'English Language',
    title: 'English Language Proficiency Proof',
    description: 'IELTS, TOEFL, PTE, Duolingo score card, or Medium of Instruction (MOI) letter.',
    category: 'Language Skills',
    priority: 'Required',
    match: (name: string) => {
      const lower = name.toLowerCase().trim()
      if (lower === 'english language') return true
      return (
        lower.includes('english') ||
        lower.includes('ielts') ||
        lower.includes('toefl') ||
        lower.includes('pte') ||
        lower.includes('duolingo') ||
        lower.includes('moi')
      )
    }
  },
  {
    key: 'resume',
    dbName: 'Resume',
    title: 'Updated Resume / Curriculum Vitae (CV)',
    description: 'Academic and extracurricular CV detailing qualifications, experiences, and achievements.',
    category: 'Profile & Background',
    priority: 'Required',
    match: (name: string) => {
      const lower = name.toLowerCase().trim()
      if (lower === 'resume' || lower === 'cv') return true
      return lower.includes('resume') || lower.includes('cv') || lower.includes('curriculum')
    }
  },
  {
    key: 'health_declaration',
    dbName: 'Health declaration form',
    title: 'Health Declaration Form',
    description: 'EMGS standard medical health declaration form for international student entry.',
    category: 'Identity & Visa',
    priority: 'Required',
    match: (name: string) => {
      const lower = name.toLowerCase().trim()
      if (lower === 'health declaration form') return true
      return lower.includes('health') || lower.includes('medical')
    }
  }
]

export default function DocumentUploadForm() {
  const [documents, setDocuments] = useState<any[]>([])
  const [serverRequirements, setServerRequirements] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // Filter view: 'missing' | 'uploaded' | 'official'
  const [activeTab, setActiveTab] = useState<'missing' | 'uploaded' | 'official'>('missing')
  const [highlightedDocKey, setHighlightedDocKey] = useState<string | null>(null)

  // Upload Modal state
  const [uploadModalOpen, setUploadModalOpen] = useState(false)
  const [selectedDocConfig, setSelectedDocConfig] = useState<RequiredDocConfig | null>(null)
  const [customDocName, setCustomDocName] = useState('')
  const [uploadFile, setUploadFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [modalError, setModalError] = useState('')

  const fetchDocuments = async () => {
    try {
      setLoading(true)
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
      if (!token) {
        setLoading(false)
        return
      }

      const res = await fetch(`${API_BASE}/student/documents`, {
        headers: {
          Authorization: `Bearer ${token}`,
          ...(API_KEY ? { 'x-api-key': API_KEY } : {}),
        },
      })
      const json = await res.json()
      if (Array.isArray(json?.data?.student_documents)) {
        setDocuments(json.data.student_documents)
      } else if (Array.isArray(json?.student_documents)) {
        setDocuments(json.student_documents)
      } else {
        setDocuments([])
      }

      if (Array.isArray(json?.data?.student_requirements)) {
        setServerRequirements(json.data.student_requirements)
      } else if (Array.isArray(json?.student_requirements)) {
        setServerRequirements(json.student_requirements)
      } else {
        setServerRequirements([])
      }
    } catch (error) {
      console.error('Error fetching documents:', error)
      setDocuments([])
      setServerRequirements([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDocuments()
    const handleDocsUpdated = () => {
      fetchDocuments()
    }
    window.addEventListener('student_documents_updated', handleDocsUpdated)
    return () => window.removeEventListener('student_documents_updated', handleDocsUpdated)
  }, [])

  // Helper to identify staff-uploaded documents
  const isStaffDocTitle = (title?: string | null) => {
    if (!title) return false
    const t = title.toLowerCase().trim()
    return (
      t.includes('offer letter') ||
      t.includes('conditional offer') ||
      t.includes('joining letter') ||
      t.includes('visa approval letter') ||
      t === 'val' ||
      t.includes('val copy') ||
      t.includes('pre-arrival briefing') ||
      t.includes('emgs payment receipt') ||
      t.includes('tuition fee invoice') ||
      t.includes('fee invoice')
    )
  }

  const isStaffUploaded = (d: any) => {
    const title = String(d?.document_name || d?.doc_name || d?.imgname || '')
    if (isStaffDocTitle(title)) return true
    if (d?.upload_by != null && String(d.upload_by).trim() !== '' && String(d.upload_by) !== '0') return true
    if (d?.upload_source) {
      const s = String(d.upload_source).toLowerCase()
      if (s.includes('crm') || s.includes('portal.britannicaoverseas') || s.includes(':3010') || s.includes(':5173')) {
        return true
      }
    }
    return false
  }

  // Filter student-uploaded documents (strictly excluding staff-issued documents like Joining Letter)
  const studentUploadedDocs = useMemo(() => {
    return documents.filter(d => !isStaffUploaded(d))
  }, [documents])

  // Official documents uploaded by Admin / Counsellor (CRM) for student
  const staffIssuedDocs = useMemo(() => {
    return documents.filter(d => isStaffUploaded(d))
  }, [documents])

  // Use dynamic server requirements from CRM when available, otherwise fallback to official defaults
  const allRequiredDocuments = useMemo(() => {
    if (Array.isArray(serverRequirements) && serverRequirements.length > 0) {
      // Filter out pure profile action items and staff documents
      const docRequirements = serverRequirements.filter((sr) => {
        const titleLower = String(sr.title || '').toLowerCase().trim()
        const actionType = String(sr.action_type || '').toLowerCase()
        if (actionType === 'profile') return false
        if (titleLower.includes('parent') || titleLower.includes('date of birth') || titleLower.includes('address')) return false
        if (isStaffDocTitle(titleLower)) return false
        return true
      })

      if (docRequirements.length > 0) {
        // Robust deduplication by titleClean
        const uniqueDocReqs: typeof docRequirements = []
        const seen = new Set<string>()
        for (const sr of docRequirements) {
          const titleClean = String(sr.title || '').trim().toLowerCase()
          if (!titleClean || seen.has(titleClean)) continue
          seen.add(titleClean)
          uniqueDocReqs.push(sr)
        }

        const seenKeys = new Set<string>()
        const result: RequiredDocConfig[] = []

        for (const sr of uniqueDocReqs) {
          const titleClean = String(sr.title || '').trim()
          const officialMatch = OFFICIAL_REQUIRED_DOCUMENTS.find(
            (std) => matchesDocumentRequirement(std.title, titleClean) || matchesDocumentRequirement(std.dbName, titleClean) || std.match(titleClean)
          )
          if (officialMatch) {
            if (seenKeys.has(officialMatch.key)) continue
            seenKeys.add(officialMatch.key)
            result.push({
              ...officialMatch,
              title: officialMatch.title,
              priority: (sr.tag as any) || officialMatch.priority,
              serverReq: sr,
            })
          } else {
            const key = `custom_${titleClean.toLowerCase().replace(/[^a-z0-9]/g, '_')}`
            if (seenKeys.has(key)) continue
            seenKeys.add(key)
            result.push({
              key,
              dbName: titleClean,
              title: titleClean,
              description: sr.description || `Required document for university admission verification: ${titleClean}`,
              category: sr.tag || 'Admission Requirement',
              priority: (sr.tag as any) || 'Required',
              serverReq: sr,
              match: (name: string) => matchesDocumentRequirement(titleClean, name),
            })
          }
        }
        return result
      }
    }

    return OFFICIAL_REQUIRED_DOCUMENTS
  }, [serverRequirements])

  // Helper to find if a required document is uploaded in student_documents
  const findMatchingUploadedDoc = (req: RequiredDocConfig, excludeIds?: Set<number | string>) => {
    return studentUploadedDocs.find(d => {
      if (d.id && excludeIds && excludeIds.has(d.id)) return false
      const name = String(d?.document_name || d?.doc_name || d?.imgname || '')
      return matchesDocumentRequirement(req.title, name) || matchesDocumentRequirement(req.dbName, name) || req.match(name)
    })
  }

  // Missing documents list: ONLY those that are NOT uploaded
  const missingDocuments = useMemo(() => {
    return allRequiredDocuments.filter(req => {
      const match = findMatchingUploadedDoc(req)
      return !match
    })
  }, [studentUploadedDocs, allRequiredDocuments])

  // Completed / Uploaded required documents mapping (Structured to mirror CRM checklist table 1:1)
  const completedRequiredDocuments = useMemo(() => {
    const list: Array<{
      key: string
      title: string
      category: string
      priority: string
      doc: any
      matchingReq?: RequiredDocConfig
    }> = []

    const matchedDocIds = new Set<number | string>()

    for (const req of allRequiredDocuments) {
      const match = findMatchingUploadedDoc(req, matchedDocIds)
      if (match) {
        if (match.id) matchedDocIds.add(match.id)

        const matchStatusRaw = String(match.doc_status || '').trim().toLowerCase()
        const reqStatusRaw = String((req as any).serverReq?.doc_status || '').trim().toLowerCase()

        let finalStatus = 'Reviewing'
        let finalRejectionNote: string | undefined = undefined

        if (matchStatusRaw === 'completed' || matchStatusRaw === 'approved' || reqStatusRaw === 'completed' || reqStatusRaw === 'approved') {
          finalStatus = 'Approved'
          finalRejectionNote = undefined
        } else if (matchStatusRaw === 'not approved' || matchStatusRaw === 'rejected' || reqStatusRaw === 'not approved' || reqStatusRaw === 'rejected') {
          finalStatus = 'Not Approved'
          finalRejectionNote = match.rejection_note || (req as any).serverReq?.rejection_note || undefined
        } else if (matchStatusRaw === 'reviewing' || reqStatusRaw === 'reviewing') {
          finalStatus = 'Reviewing'
        } else {
          finalStatus = match.doc_status || (req as any).serverReq?.doc_status || 'Reviewing'
        }

        list.push({
          key: req.key || req.title,
          title: req.title,
          category: req.category,
          priority: req.priority,
          doc: {
            ...match,
            document_name: req.title,
            doc_name: req.title,
            doc_status: finalStatus,
            rejection_note: finalRejectionNote,
          },
          matchingReq: req,
        })
      }
    }

    // Any unmapped student uploads (custom uploads not in requirements)
    const unmapped = studentUploadedDocs.filter(d => {
      if (d.id && matchedDocIds.has(d.id)) return false
      return !allRequiredDocuments.some(req => {
        const name = String(d?.document_name || d?.doc_name || d?.imgname || '')
        return matchesDocumentRequirement(req.title, name) || matchesDocumentRequirement(req.dbName, name) || req.match(name)
      })
    })

    for (const d of unmapped) {
      if (d.id && matchedDocIds.has(d.id)) continue
      if (d.id) matchedDocIds.add(d.id)
      list.push({
        key: `custom_${d.id}`,
        title: d.document_name || d.doc_name || 'Additional Document',
        category: 'Additional Upload',
        priority: 'Recommended',
        doc: d,
        matchingReq: {
          key: `custom_${d.id}`,
          dbName: d.document_name || d.doc_name || 'Document',
          title: d.document_name || d.doc_name || 'Document',
          description: 'Uploaded student document',
          category: 'Additional Upload',
          priority: 'Recommended',
          match: () => false,
        },
      })
    }

    return list
  }, [studentUploadedDocs, allRequiredDocuments])

  // Calculate progress
  const totalRequired = allRequiredDocuments.length
  const completedCount = completedRequiredDocuments.length
  const progressPercent = Math.round((completedCount / totalRequired) * 100)

  // Switch to 'uploaded' tab if all documents are uploaded
  useEffect(() => {
    if (!loading && missingDocuments.length === 0 && studentUploadedDocs.length > 0 && activeTab === 'missing') {
      setActiveTab('uploaded')
    }
  }, [missingDocuments.length, studentUploadedDocs.length, loading])

  // Helper to highlight, switch tab, smooth-scroll and optionally open upload modal for a target document
  const focusAndScrollToDocument = (targetDocName?: string | null, shouldOpenModal = false) => {
    if (!targetDocName) return
    const cleanTarget = targetDocName.trim()
    if (!cleanTarget) return

    // Check if target matches missingDocuments
    const missingMatch = missingDocuments.find(
      (m) =>
        matchesDocumentRequirement(m.title, cleanTarget) ||
        matchesDocumentRequirement(m.dbName, cleanTarget) ||
        m.match(cleanTarget)
    )

    // Check if target matches completedRequiredDocuments
    const completedMatch = completedRequiredDocuments.find(
      (c) =>
        matchesDocumentRequirement(c.title, cleanTarget) ||
        matchesDocumentRequirement(c.doc?.document_name || c.doc?.doc_name || '', cleanTarget) ||
        (c.matchingReq && (matchesDocumentRequirement(c.matchingReq.title, cleanTarget) || c.matchingReq.match(cleanTarget)))
    )

    if (missingMatch) {
      setActiveTab('missing')
      const targetKey = missingMatch.key || missingMatch.title
      setHighlightedDocKey(targetKey)

      setTimeout(() => {
        const el = document.getElementById(`doc-missing-${targetKey}`)
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' })
        }
        if (shouldOpenModal) {
          handleOpenUploadModal(missingMatch)
        }
      }, 200)

      setTimeout(() => {
        setHighlightedDocKey((prev) => (prev === targetKey ? null : prev))
      }, 4000)
      return
    }

    if (completedMatch) {
      setActiveTab('uploaded')
      const targetKey = completedMatch.key || completedMatch.title
      setHighlightedDocKey(targetKey)

      setTimeout(() => {
        const el = document.getElementById(`doc-uploaded-${targetKey}`)
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' })
        }
        if (shouldOpenModal && completedMatch.matchingReq) {
          handleOpenUploadModal(completedMatch.matchingReq)
        }
      }, 200)

      setTimeout(() => {
        setHighlightedDocKey((prev) => (prev === targetKey ? null : prev))
      }, 4000)
      return
    }

    // Fallback: search across allRequiredDocuments
    const anyReq = allRequiredDocuments.find(
      (r) =>
        matchesDocumentRequirement(r.title, cleanTarget) ||
        matchesDocumentRequirement(r.dbName, cleanTarget) ||
        r.match(cleanTarget)
    )
    if (anyReq) {
      if (shouldOpenModal) {
        handleOpenUploadModal(anyReq)
      }
    }
  }

  // Handle URL query params (?doc=... or ?reupload=...) on initial mount or update
  useEffect(() => {
    if (loading) return
    if (typeof window === 'undefined') return

    const urlParams = new URLSearchParams(window.location.search)
    const targetDoc = urlParams.get('doc') || urlParams.get('reupload')
    const isReupload = Boolean(urlParams.get('reupload')) || window.location.hash.includes('reupload')

    if (targetDoc) {
      const timer = setTimeout(() => {
        focusAndScrollToDocument(targetDoc, isReupload)
      }, 350)
      return () => clearTimeout(timer)
    }
  }, [loading, missingDocuments.length, completedRequiredDocuments.length])

  // Handle custom window event `student_focus_document` for immediate drawer interaction
  useEffect(() => {
    const handleFocusEvent = (e: any) => {
      const docName = e.detail?.docName
      const shouldOpenModal = e.detail?.action === 'Re-upload' || e.detail?.shouldOpenModal
      if (docName) {
        focusAndScrollToDocument(docName, shouldOpenModal)
      }
    }

    window.addEventListener('student_focus_document', handleFocusEvent)
    return () => window.removeEventListener('student_focus_document', handleFocusEvent)
  }, [missingDocuments, completedRequiredDocuments])

  // Open modal for a specific required document
  const handleOpenUploadModal = (req: RequiredDocConfig) => {
    setSelectedDocConfig(req)
    setCustomDocName(req.dbName)
    setUploadFile(null)
    setModalError('')
    setUploadModalOpen(true)
  }

  // Open modal for a custom document
  const handleOpenCustomUpload = () => {
    setSelectedDocConfig(null)
    setCustomDocName('')
    setUploadFile(null)
    setModalError('')
    setUploadModalOpen(true)
  }

  // Upload handler
  const handleUploadSubmit = async () => {
    const finalDocName = (selectedDocConfig ? selectedDocConfig.dbName : customDocName).trim()

    if (!finalDocName) {
      setModalError('Please specify document name')
      return
    }

    if (!uploadFile) {
      setModalError('Please select a file to upload')
      return
    }

    try {
      setUploading(true)
      setModalError('')
      const token = localStorage.getItem('token')

      const formData = new FormData()
      formData.append('document_name', finalDocName)
      formData.append('doc', uploadFile)

      const response = await fetch(`${API_BASE}/student/upload-documents`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          ...(API_KEY ? { 'x-api-key': API_KEY } : {}),
        },
        body: formData,
      })

      const data = await response.json()
      if (!response.ok) {
        setModalError(data?.message || 'Failed to upload document. Please try again.')
        return
      }

      toast.success(`${finalDocName} uploaded successfully!`)
      setUploadModalOpen(false)
      setUploadFile(null)
      setSelectedDocConfig(null)
      setCustomDocName('')

      // Refetch documents to immediately remove the item from Missing list
      await fetchDocuments()
      try {
        localStorage.setItem('student_documents_updated', String(Date.now()))
        window.dispatchEvent(new Event('student_documents_updated'))
      } catch {}
    } catch (error: any) {
      console.error('Upload error:', error)
      setModalError('Network error while uploading. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  const getFullUrl = (doc: any) => {
    return getFullDocUrl(doc)
  }

  const handleDownload = async (doc: any) => {
    const url = getFullUrl(doc)
    if (!url || url === '#') return
    const fileName = doc.imgname || `${doc.document_name || doc.doc_name || 'document'}.pdf`
    try {
      const res = await fetch(url, { mode: 'cors' })
      if (!res.ok) throw new Error('Fetch failed')
      const blob = await res.blob()
      const blobUrl = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = blobUrl
      a.download = fileName
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(blobUrl)
      document.body.removeChild(a)
    } catch {
      const a = document.createElement('a')
      a.href = url
      a.download = fileName
      a.target = '_blank'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
    }
  }

  return (
    <div className="space-y-6">
      {/* 🏛️ SEPARATE SECTION BANNER: Official Documents Issued by Admissions / CRM */}
      {staffIssuedDocs.length > 0 && (
        <div className="bg-gradient-to-r from-indigo-50/90 via-blue-50/50 to-white rounded-2xl border-2 border-indigo-200/80 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs transition-all">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-xs">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
                  Official Documents Issued for You
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-800 border border-indigo-200">
                  {staffIssuedDocs.length} Document{staffIssuedDocs.length > 1 ? 's' : ''} Issued
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                  From Admissions / CRM
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-0.5">
                Your counselor has issued official documents for you (including <strong>{staffIssuedDocs[0]?.document_name || staffIssuedDocs[0]?.doc_name || 'Joining Letter'}</strong>). These are available in your dedicated Official Documents section.
              </p>
            </div>
          </div>

          <Link
            href="/student/official-documents"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white text-xs font-semibold shadow-xs transition shrink-0 self-start sm:self-center"
          >
            <span>View Official Documents</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

      {/* Main Card: Required Admission Documents */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 sm:p-7">
        {/* Section Header - Clean, Aligned with PersonalInfoForm */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 mb-5 border-b border-slate-100">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center shrink-0">
              <FileUp className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                  Required Admission Documents
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-100">
                  EMGS Visa Ready
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Official certificates and identification required by Malaysian universities & EMGS
              </p>
            </div>
          </div>

          {/* Header Actions */}
          <div className="flex items-center gap-2 self-start sm:self-center">
            <button
              type="button"
              onClick={handleOpenCustomUpload}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Upload Other</span>
            </button>
            <button
              type="button"
              onClick={fetchDocuments}
              disabled={loading}
              title="Refresh documents"
              className="p-1.5 rounded-xl border border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition disabled:opacity-50 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Progress & Compliance Bar */}
        <div className="bg-slate-50/80 rounded-xl p-3 sm:p-4 border border-slate-200/70 mb-5">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-700 mb-1.5">
            <div className="flex items-center gap-2">
              <span>Completion Status:</span>
              <span className="text-blue-600 font-bold">{completedCount} of {totalRequired} Uploaded</span>
            </div>
            <span className="text-slate-500 font-medium">{progressPercent}%</span>
          </div>

          <div className="w-full h-2 bg-slate-200/80 rounded-full overflow-hidden mb-3">
            <div
              className={`h-full transition-all duration-500 rounded-full ${
                progressPercent === 100
                  ? 'bg-emerald-500'
                  : progressPercent > 50
                  ? 'bg-blue-600'
                  : 'bg-amber-500'
              }`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          {/* Clean Filter Segmented Control */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            <button
              type="button"
              onClick={() => setActiveTab('missing')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                activeTab === 'missing'
                  ? 'bg-rose-600 text-white shadow-2xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              <AlertCircle className="w-3.5 h-3.5" />
              <span>Missing Documents</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                activeViewMissingCountBadge(activeTab === 'missing', missingDocuments.length)
              }`}>
                {missingDocuments.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('uploaded')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                activeTab === 'uploaded'
                  ? 'bg-emerald-600 text-white shadow-2xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>My Uploaded Credentials</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                activeTab === 'uploaded' ? 'bg-white/25 text-white' : 'bg-emerald-100 text-emerald-800'
              }`}>
                {completedRequiredDocuments.length}
              </span>
            </button>

            {staffIssuedDocs.length > 0 && (
              <button
                type="button"
                onClick={() => setActiveTab('official')}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                  activeTab === 'official'
                    ? 'bg-indigo-600 text-white shadow-2xs'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                <Building2 className="w-3.5 h-3.5" />
                <span>Official Issued ({staffIssuedDocs.length})</span>
              </button>
            )}
          </div>
        </div>

      {/* VIEW: MISSING DOCUMENTS (Action Required) */}
      {activeTab === 'missing' && (
        <div className="space-y-3 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Pending Documents ({missingDocuments.length})
              </h4>
            </div>
            <span className="text-[11px] text-slate-400">
              Uploaded files will automatically move to completed
            </span>
          </div>

          {missingDocuments.length > 0 ? (
            <div className="space-y-2.5">
              {missingDocuments.map((req, idx) => {
                const missingKey = req.key || req.title
                const isTargetHighlighted =
                  highlightedDocKey === missingKey ||
                  highlightedDocKey === req.title ||
                  highlightedDocKey === req.dbName
                return (
                  <div
                    key={`missing_doc_${missingKey}_${idx}`}
                    id={`doc-missing-${missingKey}`}
                    className={`bg-white rounded-xl border p-3.5 sm:p-4 transition-all duration-300 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs group ${
                      isTargetHighlighted
                        ? 'border-blue-500 ring-4 ring-blue-500/25 bg-blue-50/40 shadow-md scale-[1.01]'
                        : 'border-slate-200/90 hover:border-rose-300 hover:bg-rose-50/20'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-lg bg-rose-50 border border-rose-100 text-rose-600 flex items-center justify-center shrink-0 mt-0.5">
                        <AlertCircle className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h5 className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-blue-600 transition">
                            {req.title}
                          </h5>
                          <span className="text-[10px] font-bold uppercase tracking-wide px-1.5 py-0.2 rounded bg-slate-100 text-slate-600">
                            {req.category}
                          </span>
                          <span className="text-[10px] font-bold uppercase tracking-wide px-1.5 py-0.2 rounded bg-rose-50 text-rose-700 border border-rose-200/60">
                            {req.priority}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                          {req.description}
                        </p>
                      </div>
                    </div>

                    {/* Upload Action */}
                    <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                      <span className="text-[11px] font-semibold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md hidden sm:inline-block">
                        Not Uploaded
                      </span>
                      <button
                        type="button"
                        onClick={() => handleOpenUploadModal(req)}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-xs font-semibold shadow-2xs transition cursor-pointer"
                      >
                        <UploadCloud className="w-3.5 h-3.5" />
                        <span>Upload File</span>
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-xl p-5 text-center shadow-2xs">
              <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-2">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <h5 className="text-sm font-bold text-emerald-900">
                All Required Documents Uploaded! 🎉
              </h5>
              <p className="text-xs text-emerald-700 mt-0.5">
                You have uploaded all mandatory admission credentials. Your profile is complete.
              </p>
              <button
                type="button"
                onClick={() => setActiveTab('uploaded')}
                className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition cursor-pointer"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>View Uploaded Files ({completedRequiredDocuments.length})</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* VIEW: UPLOADED DOCUMENTS (Completed Credentials) */}
      {activeTab === 'uploaded' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Uploaded Credentials ({completedRequiredDocuments.length})
              </h4>
            </div>
            <span className="text-[11px] text-slate-400">
              Verified & pending review files
            </span>
          </div>

          <div className="rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[10px] font-bold">
                  <tr>
                    <th className="px-4 py-2.5 w-12 text-slate-400">#</th>
                    <th className="px-4 py-2.5">Document Details</th>
                    <th className="px-4 py-2.5">File & Upload Date</th>
                    <th className="px-4 py-2.5">Status</th>
                    <th className="px-4 py-2.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {completedRequiredDocuments.length > 0 ? (
                    completedRequiredDocuments.map(({ key, title, priority, doc, matchingReq }, index) => {
                      const fullUrl = getFullUrl(doc)
                      const rawStatus = (doc.doc_status || '').trim().toLowerCase()
                      const isApproved = rawStatus === 'completed' || rawStatus === 'approved'
                      const isRejected = rawStatus === 'not approved' || rawStatus === 'rejected' || rawStatus.includes('not app') || rawStatus.includes('reject')
                      const isReviewing = rawStatus === 'reviewing' || rawStatus === 'in review' || rawStatus === 'in_review' || rawStatus === 'under review'
                      
                      const displayStatus = isApproved 
                        ? 'Approved' 
                        : isRejected 
                        ? 'Not Approved' 
                        : isReviewing 
                        ? 'Reviewing' 
                        : (doc.doc_status || 'Reviewing')

                      const rowKey = key || title
                      const isTargetHighlighted =
                        highlightedDocKey === rowKey ||
                        highlightedDocKey === title ||
                        (matchingReq && (highlightedDocKey === matchingReq.key || highlightedDocKey === matchingReq.title || highlightedDocKey === matchingReq.dbName))

                      return (
                        <tr
                          key={`cred_doc_${key}_${doc.id || 'doc'}_${index}`}
                          id={`doc-uploaded-${rowKey}`}
                          className={`transition-all duration-300 ${
                            isTargetHighlighted
                              ? 'bg-blue-50/90 ring-2 ring-inset ring-blue-500 font-semibold'
                              : 'hover:bg-slate-50/70'
                          }`}
                        >
                          <td className="px-4 py-3 font-medium text-slate-400">
                            {index + 1}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2.5">
                              <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 border ${
                                isApproved 
                                  ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                                  : isRejected
                                  ? 'bg-rose-50 text-rose-600 border-rose-100'
                                  : 'bg-amber-50 text-amber-600 border-amber-100'
                              }`}>
                                <FileCheck2 className="w-3.5 h-3.5" />
                              </div>
                              <div>
                                <p className="font-bold text-slate-900 leading-tight">
                                  {title || doc.document_name || doc.doc_name || 'Document'}
                                </p>
                                {isRejected && doc.rejection_note && (
                                  <p className="text-[11px] text-rose-600 font-medium mt-0.5">
                                    Reason: {doc.rejection_note}
                                  </p>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-slate-500">
                            <div className="truncate max-w-[170px] font-medium text-slate-700">
                              {doc.imgname || 'Uploaded File'}
                            </div>
                            {doc.created_at && (
                              <div className="text-[10px] text-slate-400 mt-0.5">
                                {new Date(doc.created_at).toLocaleDateString(undefined, {
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric',
                                })}
                              </div>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                                isApproved
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  : isRejected
                                  ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                  : 'bg-amber-50 text-amber-700 border border-amber-200'
                              }`}
                            >
                              <span
                                className={`w-1.5 h-1.5 rounded-full ${
                                  isApproved
                                    ? 'bg-emerald-500'
                                    : isRejected
                                    ? 'bg-rose-500'
                                    : 'bg-amber-500'
                                }`}
                              />
                              {displayStatus}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right space-x-1.5">
                            {fullUrl !== '#' ? (
                              <a
                                href={fullUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white text-xs font-semibold transition"
                              >
                                <Eye className="w-3 h-3" />
                                <span>View</span>
                              </a>
                            ) : null}

                            {matchingReq && (
                              <button
                                type="button"
                                onClick={() => handleOpenUploadModal(matchingReq)}
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 text-xs font-semibold transition cursor-pointer"
                              >
                                <span>Re-upload</span>
                              </button>
                            )}
                          </td>
                        </tr>
                      )
                    })
                  ) : (
                    <tr>
                      <td className="px-4 py-8 text-center text-slate-500" colSpan={5}>
                        <div className="flex flex-col items-center justify-center">
                          <FileUp className="w-7 h-7 text-slate-300 mb-1.5" />
                          <p className="font-semibold text-slate-700 text-xs">No student documents uploaded yet</p>
                          <p className="text-[11px] text-slate-400 mt-0.5">
                            Please upload your required admission documents above.
                          </p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* VIEW: OFFICIAL CRM ISSUED DOCUMENTS TAB */}
      {activeTab === 'official' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-indigo-500" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Official Documents Issued for You ({staffIssuedDocs.length})
              </h4>
            </div>
            <span className="text-[11px] text-indigo-700 font-semibold bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-200/80">
              Uploaded via CRM / Admissions
            </span>
          </div>

          <div className="rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[10px] font-bold">
                  <tr>
                    <th className="px-4 py-2.5 w-12 text-slate-400">#</th>
                    <th className="px-4 py-2.5">Document Details</th>
                    <th className="px-4 py-2.5">File & Issued Date</th>
                    <th className="px-4 py-2.5">Origin</th>
                    <th className="px-4 py-2.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {staffIssuedDocs.length > 0 ? (
                    staffIssuedDocs.map((doc, index) => {
                      const fullUrl = getFullUrl(doc)
                      const title = doc.document_name || doc.doc_name || 'Official Document'
                      const fileName = doc.imgname || 'Document File'
                      const dateStr = doc.created_at
                        ? new Date(doc.created_at).toLocaleDateString(undefined, {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })
                        : 'Issued'

                      return (
                        <tr key={doc.id || index} className="hover:bg-indigo-50/40 transition">
                          <td className="px-4 py-3 font-medium text-slate-400">
                            {index + 1}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2.5">
                              <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 border border-indigo-100">
                                <FileCheck2 className="w-3.5 h-3.5" />
                              </div>
                              <div>
                                <p className="font-bold text-slate-900 leading-tight">
                                  {title}
                                </p>
                                <span className="inline-block mt-0.5 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-100">
                                  Verified Official
                                </span>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-slate-500">
                            <div className="truncate max-w-[200px] font-medium text-slate-700">
                              {fileName}
                            </div>
                            <div className="text-[10px] text-slate-400 mt-0.5">
                              {dateStr}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                              <UserCheck className="w-3 h-3 text-indigo-600" />
                              Admissions / CRM
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right space-x-1.5">
                            {fullUrl !== '#' ? (
                              <>
                                <a
                                  href={fullUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-600 hover:text-white text-xs font-semibold transition cursor-pointer"
                                >
                                  <Eye className="w-3 h-3" />
                                  <span>View</span>
                                </a>
                                <button
                                  type="button"
                                  onClick={() => handleDownload(doc)}
                                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 text-xs font-semibold transition cursor-pointer"
                                >
                                  <Download className="w-3 h-3" />
                                  <span>Download</span>
                                </button>
                              </>
                            ) : null}
                          </td>
                        </tr>
                      )
                    })
                  ) : (
                    <tr>
                      <td className="px-4 py-8 text-center text-slate-500" colSpan={5}>
                        <div className="flex flex-col items-center justify-center">
                          <Building2 className="w-7 h-7 text-slate-300 mb-1.5" />
                          <p className="font-semibold text-slate-700 text-xs">No official documents issued yet</p>
                          <p className="text-[11px] text-slate-400 mt-0.5">
                            When your counselor or admin issues offer letters, joining letters, or VAL, they will appear here.
                          </p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
      </div>

      {/* Quick Upload Modal */}
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
                    {selectedDocConfig ? `Upload ${selectedDocConfig.title}` : 'Upload Document'}
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
              {modalError && (
                <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0 text-rose-600" />
                  <span>{modalError}</span>
                </div>
              )}

              {/* Document Name */}
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700">
                  Document Name <span className="text-rose-500">*</span>
                </label>
                {selectedDocConfig ? (
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                    <p className="font-bold text-slate-800">{selectedDocConfig.title}</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">{selectedDocConfig.description}</p>
                  </div>
                ) : (
                  <input
                    type="text"
                    value={customDocName}
                    onChange={(e) => setCustomDocName(e.target.value)}
                    placeholder="e.g. Recommendation Letter, Internship Certificate"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-xs text-slate-800 hover:border-slate-300 focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-500/15 outline-none transition"
                  />
                )}
              </div>

              {/* File Selector */}
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700">
                  Select File <span className="text-rose-500">*</span>
                </label>
                <label className="flex flex-col items-center justify-center w-full min-h-[110px] p-3 border-2 border-dashed border-slate-200 hover:border-blue-500/60 rounded-xl cursor-pointer bg-slate-50/50 hover:bg-blue-50/30 transition group">
                  <UploadCloud className="w-6 h-6 text-slate-400 group-hover:text-blue-600 transition mb-1.5" />
                  {uploadFile ? (
                    <div className="text-center">
                      <p className="text-xs font-bold text-slate-800 truncate max-w-xs">
                        {uploadFile.name}
                      </p>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        {(uploadFile.size / (1024 * 1024)).toFixed(2)} MB - Click to change
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
                      setModalError('')
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
    </div>
  )
}

function activeViewMissingCountBadge(isActive: boolean, count: number) {
  if (isActive) return 'bg-white/25 text-white'
  if (count > 0) return 'bg-rose-100 text-rose-700'
  return 'bg-slate-200 text-slate-600'
}
