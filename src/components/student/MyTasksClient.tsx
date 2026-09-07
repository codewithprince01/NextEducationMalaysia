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

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://admin.educationmalaysia.in/api'
const API_KEY = process.env.NEXT_PUBLIC_FRONTEND_API_KEY || ''

export interface RequiredItem {
  id: string
  title: string
  missingTitle: string
  description: string
  category: 'Required Documents' | 'Profile Details' | 'Academic Records'
  priority: 'high' | 'medium' | 'recommended'
  isCompleted: boolean
  actionType: 'upload' | 'profile' | 'photo'
  actionLabel: string
  documentName: string
  targetTab?: string
  completedInfo?: string
}

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

  // Load student profile & documents
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
      const [profileRes, docRes] = await Promise.all([
        fetch(`${API_BASE}/student/profile`, { headers }).then(r => r.json()).catch(() => null),
        fetch(`${API_BASE}/student/documents`, { headers }).then(r => r.json()).catch(() => null),
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
  const checklist: RequiredItem[] = useMemo(() => {
    const docList = documents || []
    const docNames = docList.map(d => {
      return String(d?.document_name || d?.doc_name || d?.imgname || '').toLowerCase()
    })

    const findUploadedDoc = (pattern: RegExp) => {
      return docList.find(d => {
        const name = String(d?.document_name || d?.doc_name || d?.imgname || '').toLowerCase()
        return pattern.test(name)
      })
    }

    // 1. Passport Copy (Mandatory for International Visa)
    const passportDoc = docList.find(d => {
      const name = String(d?.document_name || d?.doc_name || d?.imgname || '').toLowerCase().trim()
      if (name === 'passport') return true
      return name.includes('passport') && !name.includes('photo') && !name.includes('size') && !name.includes('pic')
    })
    const isPassportComplete = Boolean(passportDoc)

    // 2. 12th / High School Marksheet & Certificate
    const highSchoolDoc = docList.find(d => {
      const name = String(d?.document_name || d?.doc_name || d?.imgname || '').toLowerCase().trim()
      if (name === '12th certificate' || name === 'grade 12/high school') return true
      return (
        name.includes('12th') ||
        name.includes('high school') ||
        name.includes('senior secondary') ||
        name.includes('intermediate') ||
        name.includes('a-level') ||
        name.includes('a level') ||
        name.includes('grade 12')
      )
    })
    const isHighSchoolComplete = Boolean(highSchoolDoc)

    // 3. 10th / Secondary School Certificate
    const secondaryDoc = docList.find(d => {
      const name = String(d?.document_name || d?.doc_name || d?.imgname || '').toLowerCase().trim()
      if (name === '10th certificate') return true
      return (
        name.includes('10th') ||
        name.includes('secondary') ||
        name.includes('matric') ||
        name.includes('o-level') ||
        name.includes('o level') ||
        name.includes('grade 10')
      )
    })
    const isSecondaryComplete = Boolean(secondaryDoc)

    // 4. Passport Size Photo (White Background)
    const photoDoc = docList.find(d => {
      const name = String(d?.document_name || d?.doc_name || d?.imgname || '').toLowerCase().trim()
      if (name === 'passport size photo') return true
      return (
        name.includes('photo') ||
        name.includes('picture') ||
        (name.includes('passport') && (name.includes('photo') || name.includes('size') || name.includes('pic')))
      )
    })
    const isPhotoComplete = Boolean(hasAvatar || photoDoc)

    // 5. English Language Proficiency (IELTS / TOEFL / MOI)
    const englishDoc = docList.find(d => {
      const name = String(d?.document_name || d?.doc_name || d?.imgname || '').toLowerCase().trim()
      if (name === 'english language') return true
      return (
        name.includes('english') ||
        name.includes('ielts') ||
        name.includes('toefl') ||
        name.includes('pte') ||
        name.includes('duolingo') ||
        name.includes('moi')
      )
    })
    const isEnglishComplete = Boolean(englishDoc)

    // 6. Resume / Curriculum Vitae (CV)
    const resumeDoc = docList.find(d => {
      const name = String(d?.document_name || d?.doc_name || d?.imgname || '').toLowerCase().trim()
      if (name === 'resume' || name === 'cv') return true
      return name.includes('resume') || name.includes('cv') || name.includes('curriculum')
    })
    const isResumeComplete = Boolean(resumeDoc)

    // 7. Health declaration form
    const healthDoc = docList.find(d => {
      const name = String(d?.document_name || d?.doc_name || d?.imgname || '').toLowerCase().trim()
      if (name === 'health declaration form') return true
      return name.includes('health') || name.includes('medical')
    })
    const isHealthComplete = Boolean(healthDoc)

    // 8. General Personal Information (Father, Mother, DOB, Gender, Nationality)
    const hasFather = Boolean(student?.father && String(student.father).trim() !== '')
    const hasMother = Boolean(student?.mother && String(student.mother).trim() !== '')
    const hasDOB = Boolean(student?.dob && String(student.dob).trim() !== '')
    const hasNationality = Boolean(student?.nationality && String(student.nationality).trim() !== '')
    const hasGender = Boolean(student?.gender && String(student.gender).trim() !== '')
    const isGeneralInfoComplete = hasFather && hasMother && hasDOB && hasNationality && hasGender

    // 9. Permanent Address & Emergency Contact
    const hasAddress = Boolean(student?.home_address && String(student.home_address).trim() !== '')
    const hasCity = Boolean(student?.city && String(student.city).trim() !== '')
    const hasCountry = Boolean(student?.country && String(student.country).trim() !== '')
    const hasEmergencyContact = Boolean(student?.home_contact_number && String(student.home_contact_number).trim() !== '')
    const isAddressComplete = hasAddress && hasCity && hasCountry && hasEmergencyContact

    // 10. Education History Qualifications
    const hasEducationRecords = Array.isArray(student?.student_educations) && student.student_educations.length > 0

    return [
      {
        id: 'passport',
        title: 'International Passport Copy',
        missingTitle: 'Passport Copy Not Uploaded',
        description: 'Scanned clear copy of your international passport bio-data and address page. Mandatory by EMGS for Malaysian student visa issuance.',
        category: 'Required Documents',
        priority: 'high',
        isCompleted: isPassportComplete,
        actionType: 'upload',
        actionLabel: 'Upload Passport Now',
        documentName: 'Passport',
        targetTab: 'Upload Documents',
        completedInfo: passportDoc ? `Uploaded: ${passportDoc.doc_name || passportDoc.document_name || 'Passport'}` : 'Passport file uploaded',
      },
      {
        id: '12th_certificate',
        title: 'Grade 12 / High School Certificate & Transcript',
        missingTitle: '12th / High School Marksheet Missing',
        description: 'Official Grade 12 or High School transcript and completion certificate. Required by university admission committees to evaluate eligibility.',
        category: 'Required Documents',
        priority: 'high',
        isCompleted: isHighSchoolComplete,
        actionType: 'upload',
        actionLabel: 'Upload 12th Marksheet',
        documentName: '12th Certificate',
        targetTab: 'Upload Documents',
        completedInfo: highSchoolDoc ? `Uploaded: ${highSchoolDoc.doc_name || highSchoolDoc.document_name || '12th Certificate'}` : 'Document uploaded',
      },
      {
        id: 'passport_photo',
        title: 'Passport-Sized Photograph (White Background)',
        missingTitle: 'Passport-Size Photo Missing',
        description: 'Formal passport-size photo with white background. Needed for student identification card and EMGS visa clearance.',
        category: 'Required Documents',
        priority: 'high',
        isCompleted: isPhotoComplete,
        actionType: 'upload',
        actionLabel: 'Upload Photo Now',
        documentName: 'Passport Size Photo',
        targetTab: 'Upload Documents',
        completedInfo: photoDoc ? `Uploaded: ${photoDoc.doc_name || photoDoc.document_name || 'Photo'}` : 'Profile photo active',
      },
      {
        id: '10th_certificate',
        title: 'Grade 10 / Secondary School Certificate',
        missingTitle: '10th / Secondary Certificate Missing',
        description: 'Grade 10 passing certificate and marksheet used for date of birth verification and academic foundation records.',
        category: 'Required Documents',
        priority: 'medium',
        isCompleted: isSecondaryComplete,
        actionType: 'upload',
        actionLabel: 'Upload 10th Certificate',
        documentName: '10th Certificate',
        targetTab: 'Upload Documents',
        completedInfo: secondaryDoc ? `Uploaded: ${secondaryDoc.doc_name || secondaryDoc.document_name || '10th Certificate'}` : 'Document uploaded',
      },
      {
        id: 'english_proficiency',
        title: 'English Language Proficiency Proof',
        missingTitle: 'English Proficiency Proof Not Provided',
        description: 'IELTS, TOEFL, Duolingo, PTE score or Medium of Instruction (MOI) certificate to satisfy university English language requirements.',
        category: 'Required Documents',
        priority: 'medium',
        isCompleted: isEnglishComplete,
        actionType: 'upload',
        actionLabel: 'Upload English Proof',
        documentName: 'English Language',
        targetTab: 'Upload Documents',
        completedInfo: englishDoc ? `Uploaded: ${englishDoc.doc_name || englishDoc.document_name || 'English Proof'}` : 'Certificate uploaded',
      },
      {
        id: 'resume',
        title: 'Resume / Curriculum Vitae (CV)',
        missingTitle: 'Resume / CV Not Uploaded',
        description: 'An updated resume highlighting your academic achievements, extracurriculars, and skills for scholarship consideration.',
        category: 'Required Documents',
        priority: 'recommended',
        isCompleted: isResumeComplete,
        actionType: 'upload',
        actionLabel: 'Upload Resume / CV',
        documentName: 'Resume',
        targetTab: 'Upload Documents',
        completedInfo: resumeDoc ? `Uploaded: ${resumeDoc.doc_name || resumeDoc.document_name || 'Resume'}` : 'Resume added',
      },
      {
        id: 'health_declaration',
        title: 'Health Declaration Form',
        missingTitle: 'Health Declaration Form Missing',
        description: 'Completed medical health declaration form in accordance with Education Malaysia Global Services (EMGS) visa protocols.',
        category: 'Required Documents',
        priority: 'recommended',
        isCompleted: isHealthComplete,
        actionType: 'upload',
        actionLabel: 'Upload Health Form',
        documentName: 'Health declaration form',
        targetTab: 'Upload Documents',
        completedInfo: healthDoc ? `Uploaded: ${healthDoc.doc_name || healthDoc.document_name || 'Health Form'}` : 'Health form uploaded',
      },
      {
        id: 'personal_details',
        title: 'Parent Details & Date of Birth',
        missingTitle: 'Parent & Date of Birth Details Incomplete',
        description: 'Father\'s name, mother\'s name, date of birth, and nationality must be filled in your student profile.',
        category: 'Profile Details',
        priority: 'high',
        isCompleted: isGeneralInfoComplete,
        actionType: 'profile',
        actionLabel: 'Complete Profile Details',
        documentName: '',
        targetTab: 'general',
        completedInfo: 'Parent names and personal details filled',
      },
      {
        id: 'address_contact',
        title: 'Permanent Residential Address & Contact',
        missingTitle: 'Address & Contact Details Incomplete',
        description: 'Full residential address, postal city, country, and emergency contact phone number are required for your file.',
        category: 'Profile Details',
        priority: 'medium',
        isCompleted: isAddressComplete,
        actionType: 'profile',
        actionLabel: 'Fill Address & Contact',
        documentName: '',
        targetTab: 'general',
        completedInfo: `${student?.city || 'City'}, ${student?.country || 'Country'} on file`,
      },
      {
        id: 'education_history',
        title: 'Past Education Qualifications',
        missingTitle: 'Education History Not Added',
        description: 'Add your previous school, college, passing year, and marks achieved under the Education History section.',
        category: 'Academic Records',
        priority: 'high',
        isCompleted: hasEducationRecords,
        actionType: 'profile',
        actionLabel: 'Add Education Records',
        documentName: '',
        targetTab: 'education',
        completedInfo: `${student?.student_educations?.length || 1} qualification(s) recorded`,
      },
    ]
  }, [student, documents, hasAvatar])

  // Counts
  const totalCount = checklist.length
  const completedItems = checklist.filter(item => item.isCompleted)
  const missingItems = checklist.filter(item => !item.isCompleted)
  const completedCount = completedItems.length
  const missingCount = missingItems.length
  const progressPercent = Math.round((completedCount / totalCount) * 100)

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
