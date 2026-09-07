'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { toast } from 'react-toastify'
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
  ArrowUpRight
} from 'lucide-react'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://admin.educationmalaysia.in/api'
const API_KEY = process.env.NEXT_PUBLIC_FRONTEND_API_KEY || ''

export interface RequiredDocConfig {
  key: string
  dbName: string
  title: string
  description: string
  category: string
  priority: 'Mandatory' | 'Required' | 'Recommended'
  match: (name: string) => boolean
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
  const [loading, setLoading] = useState(true)

  // Filter view: 'missing' | 'uploaded'
  const [activeTab, setActiveTab] = useState<'missing' | 'uploaded'>('missing')

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
    } catch (error) {
      console.error('Error fetching documents:', error)
      setDocuments([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDocuments()
  }, [])

  // Helper to find if a required document is uploaded in student_documents
  const findMatchingUploadedDoc = (req: RequiredDocConfig) => {
    return documents.find(d => {
      const name = String(d?.document_name || d?.doc_name || d?.imgname || '')
      return req.match(name)
    })
  }

  // Missing documents list: ONLY those that are NOT uploaded
  const missingDocuments = useMemo(() => {
    return OFFICIAL_REQUIRED_DOCUMENTS.filter(req => {
      const match = findMatchingUploadedDoc(req)
      return !match
    })
  }, [documents])

  // Completed / Uploaded required documents mapping
  const completedRequiredDocuments = useMemo(() => {
    return OFFICIAL_REQUIRED_DOCUMENTS.filter(req => {
      const match = findMatchingUploadedDoc(req)
      return Boolean(match)
    }).map(req => {
      const uploadedItem = findMatchingUploadedDoc(req)
      return {
        ...req,
        uploadedItem,
      }
    })
  }, [documents])

  // Calculate progress
  const totalRequired = OFFICIAL_REQUIRED_DOCUMENTS.length
  const completedCount = completedRequiredDocuments.length
  const progressPercent = Math.round((completedCount / totalRequired) * 100)

  // Switch to 'uploaded' tab if all documents are uploaded
  useEffect(() => {
    if (!loading && missingDocuments.length === 0 && documents.length > 0 && activeTab === 'missing') {
      setActiveTab('uploaded')
    }
  }, [missingDocuments.length, documents.length, loading])

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
    } catch (error: any) {
      console.error('Upload error:', error)
      setModalError('Network error while uploading. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  const getFullUrl = (doc: any) => {
    const raw = doc?.imgpath || ''
    if (!raw) return '#'
    if (/^https?:\/\//i.test(raw)) return raw

    const normalizeOrigin = (value: string) => {
      if (!value) return ''
      return /^https?:\/\//i.test(value) ? value : `https://${value}`
    }

    const cleaned = raw.startsWith('/') ? raw.slice(1) : raw

    const runtimeOrigin = typeof window !== 'undefined' ? window.location.origin : ''
    const isLocalRuntime = /localhost|127\.0\.0\.1/i.test(runtimeOrigin)
    const uploadSource = normalizeOrigin(String(doc?.upload_source || '').trim())
    const imageBase = normalizeOrigin(process.env.NEXT_PUBLIC_IMAGE_BASE_URL || '')
    const siteUrl = normalizeOrigin(process.env.NEXT_PUBLIC_SITE_URL || '')

    const candidateOrigins = isLocalRuntime
      ? [runtimeOrigin, uploadSource, imageBase, siteUrl].filter(Boolean)
      : [imageBase, uploadSource, siteUrl, runtimeOrigin].filter(Boolean)
    const basePath = cleaned.startsWith('storage/')
      ? cleaned
      : cleaned.startsWith('uploads/')
        ? `storage/${cleaned}`
        : cleaned

    return `${candidateOrigins[0]}/${basePath}`
  }

  return (
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
            <span>Uploaded Documents</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
              activeTab === 'uploaded' ? 'bg-white/25 text-white' : 'bg-emerald-100 text-emerald-800'
            }`}>
              {documents.length}
            </span>
          </button>
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
              {missingDocuments.map((req) => (
                <div
                  key={req.key}
                  className="bg-white rounded-xl border border-slate-200/90 hover:border-rose-300 hover:bg-rose-50/20 p-3.5 sm:p-4 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs group"
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
              ))}
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
                <span>View Uploaded Files ({documents.length})</span>
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
                Uploaded Credentials ({documents.length})
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
                  {documents.length > 0 ? (
                    documents.map((doc, index) => {
                      const fullUrl = getFullUrl(doc)
                      const isApproved = doc.doc_status === 'Approved'
                      const isPending =
                        doc.doc_status === 'Pending' ||
                        doc.doc_status === 'Reviewing' ||
                        !doc.doc_status

                      // Check if matches one of the canonical requirements
                      const matchingReq = OFFICIAL_REQUIRED_DOCUMENTS.find(req =>
                        req.match(String(doc.doc_name || doc.document_name || ''))
                      )

                      return (
                        <tr key={doc.id || index} className="hover:bg-slate-50/70 transition">
                          <td className="px-4 py-3 font-medium text-slate-400">
                            {index + 1}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2.5">
                              <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100">
                                <FileCheck2 className="w-3.5 h-3.5" />
                              </div>
                              <div>
                                <p className="font-bold text-slate-900 leading-tight">
                                  {doc.document_name || doc.doc_name || 'Document'}
                                </p>
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
                              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                                isApproved
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  : isPending
                                  ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                  : 'bg-rose-50 text-rose-700 border border-rose-200'
                              }`}
                            >
                              <span
                                className={`w-1.5 h-1.5 rounded-full ${
                                  isApproved
                                    ? 'bg-emerald-500'
                                    : isPending
                                    ? 'bg-amber-500'
                                    : 'bg-rose-500'
                                }`}
                              />
                              {doc.doc_status || 'Under Review'}
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
                          <p className="font-semibold text-slate-700 text-xs">No documents uploaded yet</p>
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
