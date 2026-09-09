'use client'

import React, { useState, useEffect, useMemo } from 'react'
import {
  CheckCircle2,
  Clock,
  AlertCircle,
  FileText,
  Upload,
  User,
  GraduationCap,
  Award,
  ShieldAlert,
  Sparkles,
  ArrowRight,
  ExternalLink,
  X,
  FileUp,
  ChevronRight,
  Filter,
  CheckCircle,
  FolderUp,
  FileCheck2,
  AlertTriangle,
  UploadCloud,
  Check
} from 'lucide-react'
import { toast } from 'react-toastify'
import Link from 'next/link'

const API_BASE = (process.env.NEXT_PUBLIC_API_URL || '/api/v1').replace(/\/$/, '')
const API_KEY = process.env.NEXT_PUBLIC_FRONTEND_API_KEY || ''

import { evaluateStudentChecklist, ChecklistItem } from '@/utils/studentChecklist'

export type RequiredItem = ChecklistItem


export default function MyTasksClient() {
  const [student, setStudent] = useState<any>(null)
  const [documents, setDocuments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activeView, setActiveView] = useState<'missing' | 'completed' | 'all'>('missing')

  // Quick Upload Modal
  const [uploadModalOpen, setUploadModalOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState<RequiredItem | null>(null)
  const [uploadDocName, setUploadDocName] = useState('')
  const [uploadFile, setUploadFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)

  // Local storage profile avatar detection
  const [hasAvatar, setHasAvatar] = useState(false)

  const [serverRequirements, setServerRequirements] = useState<any[]>([])

  // Load student profile, documents & application requirements
  const loadData = async () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
    if (!token) {
      setLoading(false)
      return
    }

    const headers = {
      Authorization: `Bearer ${token}`,
      ...(API_KEY ? { 'x-api-key': API_KEY } : {}),
    }

    try {
      const [profileRes, docRes, appRes] = await Promise.all([
        fetch(`${API_BASE}/student/profile`, { headers }).then(r => r.json()).catch(() => null),
        fetch(`${API_BASE}/student/documents`, { headers }).then(r => r.json()).catch(() => null),
        fetch(`${API_BASE}/student/applied-college`, { headers }).then(r => r.json()).catch(() => null),
      ])

      if (profileRes?.data?.student) {
        setStudent(profileRes.data.student)
      } else if (profileRes?.student) {
        setStudent(profileRes.student)
      }

      if (Array.isArray(docRes?.data?.student_documents)) {
        setDocuments(docRes.data.student_documents)
      } else if (Array.isArray(docRes?.student_documents)) {
        setDocuments(docRes.student_documents)
      }

      const allServerReqs: any[] = []
      if (Array.isArray(docRes?.data?.student_requirements)) {
        allServerReqs.push(...docRes.data.student_requirements)
      } else if (Array.isArray(docRes?.student_requirements)) {
        allServerReqs.push(...docRes.student_requirements)
      }

      const courses = Array.isArray(appRes?.data?.applied_programs)
        ? appRes.data.applied_programs
        : Array.isArray(appRes?.applied_programs)
        ? appRes.applied_programs
        : []

      if (courses.length > 0) {
        const reqPromises = courses.map((app: any) =>
          fetch(`${API_BASE}/student/applications/${app.id}/requirements`, { headers })
            .then(r => r.json())
            .catch(() => null)
        )
        const reqResults = await Promise.all(reqPromises)
        reqResults.forEach((reqJson: any) => {
          const list = Array.isArray(reqJson?.data?.requirements)
            ? reqJson.data.requirements
            : Array.isArray(reqJson?.requirements)
            ? reqJson.requirements
            : []
          allServerReqs.push(...list)
        })
      }

      // Deduplicate server requirements by clean lowercased title
      const uniqueServerReqs: any[] = []
      allServerReqs.forEach((sr) => {
        const titleClean = String(sr.title || '').trim().toLowerCase()
        if (!titleClean) return
        if (!uniqueServerReqs.some((item) => String(item.title || '').trim().toLowerCase() === titleClean)) {
          uniqueServerReqs.push(sr)
        }
      })

      setServerRequirements(uniqueServerReqs)
    } catch (err) {
      console.error('Error loading tasks data:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    const checkAvatar = () => {
      const localAvatar = typeof window !== 'undefined' ? localStorage.getItem('student_profile_avatar') : null
      setHasAvatar(Boolean(localAvatar || student?.profile_image || student?.photo || student?.avatar))
    }
    checkAvatar()
    window.addEventListener('student_avatar_updated', checkAvatar)
    return () => window.removeEventListener('student_avatar_updated', checkAvatar)
  }, [student])

  // Required Checklist Definition & Evaluation
  const evaluated = useMemo(() => {
    return evaluateStudentChecklist(student, documents, hasAvatar)
  }, [student, documents, hasAvatar])

  const checklist: RequiredItem[] = useMemo(() => {
    const defaultItems = evaluated.checklist
    if (!serverRequirements || serverRequirements.length === 0) {
      return defaultItems
    }

    const dynamicItems: RequiredItem[] = serverRequirements.map((r: any) => {
      const uploadedDoc = documents.find((d: any) => {
        const docName = String(d?.document_name || d?.doc_name || d?.imgname || '').toLowerCase().trim()
        const reqName = String(r.title || '').toLowerCase().trim()
        if (!docName || !reqName) return false
        return docName === reqName || docName.includes(reqName) || reqName.includes(docName)
      })

      const isCompleted = !!uploadedDoc || r.doc_status === 'Approved' || r.doc_status === 'Completed'
      const isProfile =
        r.action_type === 'profile' ||
        String(r.title || '').toLowerCase().includes('parent') ||
        String(r.title || '').toLowerCase().includes('date of birth')

      return {
        id: `dynamic_req_${r.id}`,
        title: r.title,
        name: r.title,
        missingTitle: `${r.title} Missing`,
        description: r.description || `Required document for ${r.stage_tag || 'application processing'}.`,
        category: isProfile ? 'Profile Details' : 'Required Documents',
        priority: r.tag === 'Required' ? 'high' : 'recommended',
        isCompleted,
        actionType: isProfile ? 'profile' : 'upload',
        actionLabel: isCompleted ? 'View Document' : isProfile ? 'Update Profile' : `Upload ${r.title}`,
        documentName: r.title,
        targetTab: isProfile ? 'personal' : undefined,
      }
    })

    const mergedMap = new Map<string, RequiredItem>()
    defaultItems.forEach((item) => {
      mergedMap.set(item.title.toLowerCase().trim(), item)
    })

    dynamicItems.forEach((dItem) => {
      const key = dItem.title.toLowerCase().trim()
      let matchedKey: string | null = null
      for (const k of mergedMap.keys()) {
        if (k === key || k.includes(key) || key.includes(k)) {
          matchedKey = k
          break
        }
      }
      if (matchedKey) {
        mergedMap.set(matchedKey, {
          ...mergedMap.get(matchedKey)!,
          ...dItem,
        })
      } else {
        mergedMap.set(key, dItem)
      }
    })

    return Array.from(mergedMap.values())
  }, [evaluated.checklist, serverRequirements, documents])

  const totalCount = checklist.length
  const completedItems = useMemo(() => checklist.filter(i => i.isCompleted), [checklist])
  const missingItems = useMemo(() => checklist.filter(i => !i.isCompleted), [checklist])
  const completedCount = completedItems.length
  const missingCount = missingItems.length
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0

  // Items to display based on view
  const displayedItems = useMemo(() => {
    if (activeView === 'missing') return missingItems
    if (activeView === 'completed') return completedItems
    return checklist
  }, [activeView, missingItems, completedItems, checklist])

  // Open direct upload modal
  const handleOpenUpload = (item: RequiredItem) => {
    setSelectedItem(item)
    setUploadDocName(item.documentName || item.title)
    setUploadFile(null)
    setUploadModalOpen(true)
  }

  // Handle direct file upload
  const handleDirectUpload = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!uploadDocName.trim()) {
      toast.warn('Please enter a document name')
      return
    }
    if (!uploadFile) {
      toast.warn('Please select a file to upload')
      return
    }

    const token = localStorage.getItem('token')
    if (!token) {
      toast.error('Session expired. Please log in again.')
      return
    }

    try {
      setUploading(true)
      const formData = new FormData()
      formData.append('document_name', uploadDocName)
      formData.append('doc', uploadFile)

      const res = await fetch(`${API_BASE}/student/upload-documents`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          ...(API_KEY ? { 'x-api-key': API_KEY } : {}),
        },
        body: formData,
      })

      const data = await res.json()
      if (!res.ok) {
        toast.error(data?.message || 'Failed to upload document')
        return
      }

      toast.success(`${uploadDocName} uploaded successfully! Task marked complete and removed from missing list. 🎉`)
      setUploadModalOpen(false)
      setUploadFile(null)
      loadData()
    } catch (err) {
      toast.error('Network error while uploading document')
    } finally {
      setUploading(false)
    }
  }

  const handleActionClick = (item: RequiredItem) => {
    if (item.actionType === 'upload') {
      handleOpenUpload(item)
      return
    }

    if (item.actionType === 'profile') {
      window.location.href = `/student/profile#${item.targetTab || 'general'}`
      return
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-slate-200/80 shadow-xs">
        <div className="w-10 h-10 rounded-full border-3 border-blue-100 border-t-blue-600 animate-spin mb-3" />
        <p className="text-sm font-medium text-slate-500">Checking your uploaded documents & profile status...</p>
      </div>
    )
  }

  return (
    <div className="space-y-5 w-full">
      {/* Compact, Sleek Header Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
          {/* Title & Info */}
          <div className="space-y-1.5 max-w-xl">
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-blue-50 border border-blue-100 text-[11px] font-bold text-blue-700">
              <Sparkles className="w-3 h-3 text-blue-600" />
              <span>Document & Profile Verification</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
              My Tasks & Document Checklist
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
              Showing only pending items. Once you upload or complete an item, it is automatically removed from this list.
            </p>
          </div>

          {/* Compact Progress Widget */}
          <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200/80 sm:min-w-[260px] flex flex-col justify-center shrink-0">
            <div className="flex items-center justify-between gap-3 mb-1.5">
              <span className="text-xs font-semibold text-slate-600">Application Readiness</span>
              <span className="text-base font-black text-blue-600">{progressPercent}%</span>
            </div>

            {/* Compact Progress Bar */}
            <div className="w-full h-2 rounded-full bg-slate-200/80 overflow-hidden mb-2">
              <div
                className={`h-full rounded-full transition-all duration-500 ease-out ${
                  progressPercent === 100 ? 'bg-emerald-500' : 'bg-blue-600'
                }`}
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-[11px] font-medium text-slate-500">
              <span>{completedCount} of {totalCount} Completed</span>
              {missingCount === 0 ? (
                <span className="font-bold text-emerald-600 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> All Done!
                </span>
              ) : (
                <span className="font-bold text-rose-600 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {missingCount} Pending
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Compact Quick Metric Pills */}
        <div className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap items-center gap-2 sm:gap-3 text-xs">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-rose-50 border border-rose-100 text-rose-800 font-semibold">
            <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
            <span>Missing Requirements: <strong className="text-rose-950 font-black">{missingCount}</strong></span>
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-100 text-emerald-800 font-semibold">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Completed / Uploaded: <strong className="text-emerald-950 font-black">{completedCount}</strong></span>
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-700 font-medium">
            <FileText className="w-3.5 h-3.5 text-slate-500" />
            <span>Total Checklist: <strong className="text-slate-900 font-bold">{totalCount}</strong></span>
          </div>
        </div>
      </div>

      {/* Filter Tabs & Quick Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white rounded-xl border border-slate-200/80 p-1.5 shadow-xs">
        <div className="flex items-center gap-1 overflow-x-auto scrollbar-none">
          <button
            type="button"
            onClick={() => setActiveView('missing')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2 cursor-pointer ${
              activeView === 'missing'
                ? 'bg-rose-600 text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <AlertCircle className="w-3.5 h-3.5" />
            <span>Pending Requirements</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
              activeView === 'missing' ? 'bg-white/25 text-white' : 'bg-rose-100 text-rose-700'
            }`}>
              {missingCount}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveView('completed')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2 cursor-pointer ${
              activeView === 'completed'
                ? 'bg-emerald-600 text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Completed Items</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
              activeView === 'completed' ? 'bg-white/25 text-white' : 'bg-emerald-100 text-emerald-700'
            }`}>
              {completedCount}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveView('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeView === 'all'
                ? 'bg-blue-600 text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            All Items ({totalCount})
          </button>
        </div>

        {/* Upload Custom Doc button */}
        <button
          type="button"
          onClick={() => {
            setSelectedItem(null)
            setUploadDocName('')
            setUploadFile(null)
            setUploadModalOpen(true)
          }}
          className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition shadow-xs cursor-pointer shrink-0"
        >
          <Upload className="w-3 h-3" />
          <span>Upload Other Document</span>
        </button>
      </div>

      {/* Notice Banner - Clean & in English */}
      {activeView === 'missing' && missingCount > 0 && (
        <div className="bg-amber-50/80 border border-amber-200/80 rounded-xl p-3 sm:p-3.5 flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-xs text-amber-900 leading-relaxed">
            <strong className="font-bold">Required Credentials:</strong> You have <strong>{missingCount}</strong> pending items. Uploading these documents completes your admission file for Malaysian university review.
          </div>
        </div>
      )}

      {/* Task Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {displayedItems.map((item) => {
          return (
            <div
              key={item.id}
              className={`rounded-xl border p-4 sm:p-4.5 transition-all flex flex-col justify-between group ${
                item.isCompleted
                  ? 'bg-white border-emerald-200/70 hover:border-emerald-300 shadow-2xs'
                  : item.priority === 'high'
                  ? 'bg-white border-rose-200/80 hover:border-rose-300 shadow-2xs hover:shadow-xs'
                  : 'bg-white border-amber-200/80 hover:border-amber-300 shadow-2xs hover:shadow-xs'
              }`}
            >
              <div>
                {/* Header: Category & Status */}
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                      {item.category}
                    </span>

                    {!item.isCompleted && (
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${
                        item.priority === 'high'
                          ? 'bg-rose-50 text-rose-700 border border-rose-200/60'
                          : 'bg-amber-50 text-amber-700 border border-amber-200/60'
                      }`}>
                        {item.priority === 'high' ? 'Mandatory' : 'Required'}
                      </span>
                    )}
                  </div>

                  {/* Status Pill */}
                  {item.isCompleted ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      Uploaded
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold text-rose-700 bg-rose-50 border border-rose-200">
                      <AlertCircle className="w-3 h-3 text-rose-600" />
                      Pending
                    </span>
                  )}
                </div>

                {/* Title & Description */}
                <h3 className={`font-bold text-sm leading-snug mb-1 ${
                  item.isCompleted ? 'text-slate-800' : 'text-slate-900 group-hover:text-blue-600 transition'
                }`}>
                  {item.isCompleted ? item.title : item.missingTitle}
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed font-normal mb-3 line-clamp-2">
                  {item.description}
                </p>
              </div>

              {/* Card Footer */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                {item.isCompleted ? (
                  <div className="text-[11px] text-emerald-700 flex items-center gap-1 font-semibold truncate">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span className="truncate">{item.completedInfo}</span>
                  </div>
                ) : (
                  <div className="text-[11px] text-rose-600 flex items-center gap-1 font-semibold truncate">
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-rose-500" />
                    <span>Upload Required</span>
                  </div>
                )}

                {!item.isCompleted ? (
                  <button
                    type="button"
                    onClick={() => handleActionClick(item)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white transition shadow-2xs cursor-pointer active:scale-95 shrink-0"
                  >
                    {item.actionType === 'upload' ? <UploadCloud className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                    <span>{item.actionLabel}</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      if (item.actionType === 'upload') {
                        handleOpenUpload(item)
                      } else {
                        handleActionClick(item)
                      }
                    }}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer shrink-0"
                  >
                    <span>Re-upload</span>
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Clean Celebration Card when 0 items are missing */}
      {activeView === 'missing' && missingCount === 0 && (
        <div className="bg-emerald-50/80 border border-emerald-200 rounded-2xl p-6 sm:p-8 text-center shadow-xs">
          <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-xl mx-auto mb-3">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-emerald-950 mb-1.5">
            All Documents & Profile Details Complete! 🎉
          </h2>
          <p className="text-xs sm:text-sm text-emerald-700 max-w-md mx-auto mb-5 leading-relaxed">
            You have successfully uploaded all required credentials. Your profile is ready for university admissions and visa processing.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2.5">
            <Link
              href="/courses-in-malaysia"
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition shadow-xs text-xs cursor-pointer"
            >
              Browse Courses & Apply Now
            </Link>
            <button
              type="button"
              onClick={() => setActiveView('completed')}
              className="px-4 py-2 rounded-xl bg-white hover:bg-slate-50 border border-emerald-200 text-emerald-800 font-bold transition text-xs cursor-pointer shadow-2xs"
            >
              View Completed Items ({completedCount})
            </button>
          </div>
        </div>
      )}

      {/* Direct Upload Modal */}
      {uploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-lg p-6 relative">
            <button
              type="button"
              onClick={() => setUploadModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-5">
              <div className="w-11 h-11 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <FileUp className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  {selectedItem ? `Upload ${selectedItem.title}` : 'Upload Document'}
                </h3>
                <p className="text-xs text-slate-500">
                  Accepted formats: PDF, JPEG, PNG (Up to 10MB)
                </p>
              </div>
            </div>

            <form onSubmit={handleDirectUpload} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Document Category / Name *
                </label>
                <input
                  type="text"
                  required
                  value={uploadDocName}
                  onChange={(e) => setUploadDocName(e.target.value)}
                  placeholder="e.g. Passport, 12th Certificate, English Language"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-slate-50/50"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Select File from Computer / Phone *
                </label>
                <div className="border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-2xl p-6 text-center transition bg-slate-50/50 hover:bg-blue-50/30 cursor-pointer relative">
                  <input
                    type="file"
                    required
                    accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                    onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <UploadCloud className="w-9 h-9 text-blue-600 mx-auto mb-2" />
                  {uploadFile ? (
                    <p className="text-sm font-bold text-blue-600 truncate max-w-xs mx-auto">
                      Selected: {uploadFile.name}
                    </p>
                  ) : (
                    <>
                      <p className="text-sm font-bold text-slate-800 mb-0.5">
                        Click to choose file or drag & drop here
                      </p>
                      <p className="text-xs text-slate-400">PDF, JPG, PNG (Max 10MB)</p>
                    </>
                  )}
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setUploadModalOpen(false)}
                  disabled={uploading}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs sm:text-sm hover:bg-slate-50 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm transition shadow-md shadow-blue-500/20 cursor-pointer flex items-center gap-2 disabled:opacity-50"
                >
                  {uploading ? (
                    <>
                      <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                      <span>Uploading...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4" />
                      <span>Upload & Complete Task</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
