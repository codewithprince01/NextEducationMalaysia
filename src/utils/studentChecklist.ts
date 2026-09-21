export interface ChecklistItem {
  id: string
  title: string
  name: string
  missingTitle: string
  description: string
  category: 'Required Documents' | 'Profile Details' | 'Academic Records'
  priority: 'high' | 'medium' | 'recommended'
  isCompleted: boolean
  actionType: 'upload' | 'profile' | 'photo'
  actionLabel: string
  documentName: string
  documentUrl?: string
  targetTab?: string
  completedInfo?: string
}

export interface StudentChecklistResult {
  checklist: ChecklistItem[]
  completedCount: number
  missingCount: number
  totalCount: number
  progressPercent: number
  completedItems: ChecklistItem[]
  missingItems: ChecklistItem[]
}

/**
 * Centralized helpers to distinguish official staff/CRM issued documents (e.g. Joining Letter,
 * Offer Letter, VAL, Fee Receipts) from student-uploaded admission credentials.
 */
export function isStaffDocTitle(name: string): boolean {
  const n = String(name || '').toLowerCase().trim()
  return (
    n.includes('offer letter') ||
    n.includes('conditional offer') ||
    n.includes('joining letter') ||
    n.includes('visa approval letter') ||
    n === 'val' ||
    n.includes('val copy') ||
    n.includes('pre-arrival') ||
    n.includes('emgs payment receipt') ||
    n.includes('tuition fee invoice') ||
    n.includes('fee invoice')
  )
}

export function isStaffUploaded(doc: any): boolean {
  if (!doc) return false
  if (doc?.upload_by != null && Number(doc.upload_by) > 0) return true
  const src = String(doc?.upload_source || '').toLowerCase().trim()
  if (
    src.includes('crm') ||
    src.includes('portal.britannicaoverseas') ||
    src.includes(':3010') ||
    src.includes(':5173')
  ) {
    return true
  }
  const imgPath = String(doc?.imgpath || '').toLowerCase().trim()
  if (imgPath.startsWith('student-documents/')) {
    return true
  }
  const title = String(doc?.document_name || doc?.doc_name || doc?.imgname || '')
  return isStaffDocTitle(title)
}

/**
 * Centralized matcher that accurately correlates document titles, database names,
 * and user-uploaded filenames across /student/profile, /student/tasks, and /student/applications/[id].
 */
export function matchesDocumentRequirement(requirementTitle: string, uploadedDocName: string): boolean {
  const req = String(requirementTitle || '').toLowerCase().trim()
  const doc = String(uploadedDocName || '').toLowerCase().trim()
  if (!req || !doc) return false
  if (req === doc) return true

  // 1. Photo isolation: if one is photo/photograph/pic and the other is not, NEVER match
  const isReqPhoto = req.includes('photo') || req.includes('photograph') || req.includes('picture') || req.includes('pic')
  const isDocPhoto = doc.includes('photo') || doc.includes('photograph') || doc.includes('picture') || doc.includes('pic')
  if (isReqPhoto || isDocPhoto) {
    return isReqPhoto && isDocPhoto
  }

  // 2. Passport (non-photo): International Passport Copy, Passport Copy, Passport
  const isReqPassport = req.includes('passport')
  const isDocPassport = doc.includes('passport')
  if (isReqPassport || isDocPassport) {
    return isReqPassport && isDocPassport
  }

  // 3. Grade 12 / High School vs Grade 10 / Secondary isolation
  const isReq12 = req.includes('12th') || req.includes('grade 12') || req.includes('high school') || req.includes('senior secondary') || req.includes('intermediate') || req.includes('a-level') || req.includes('a level')
  const isDoc12 = doc.includes('12th') || doc.includes('grade 12') || doc.includes('high school') || doc.includes('senior secondary') || doc.includes('intermediate') || doc.includes('a-level') || doc.includes('a level')

  const isReq10 = req.includes('10th') || req.includes('grade 10') || req.includes('secondary') || req.includes('matric') || req.includes('o-level') || req.includes('o level')
  const isDoc10 = doc.includes('10th') || doc.includes('grade 10') || doc.includes('secondary') || doc.includes('matric') || doc.includes('o-level') || doc.includes('o level')

  if (isReq12 || isDoc12 || isReq10 || isDoc10) {
    if (isReq12 && isDoc12) return true
    if (isReq10 && isDoc10) return true
    return false
  }

  // 4. English Language Proficiency
  const isReqEnglish = req.includes('english') || req.includes('ielts') || req.includes('toefl') || req.includes('pte') || req.includes('duolingo') || req.includes('moi') || req.includes('language')
  const isDocEnglish = doc.includes('english') || doc.includes('ielts') || doc.includes('toefl') || doc.includes('pte') || doc.includes('duolingo') || doc.includes('moi') || doc.includes('language')
  if (isReqEnglish || isDocEnglish) {
    return isReqEnglish && isDocEnglish
  }

  // 5. Resume / CV
  const isReqResume = req.includes('resume') || req.includes('cv') || req.includes('curriculum')
  const isDocResume = doc.includes('resume') || doc.includes('cv') || doc.includes('curriculum')
  if (isReqResume || isDocResume) {
    return isReqResume && isDocResume
  }

  // 6. Health Declaration
  const isReqHealth = req.includes('health') || req.includes('medical')
  const isDocHealth = doc.includes('health') || doc.includes('medical')
  if (isReqHealth || isDocHealth) {
    return isReqHealth && isDocHealth
  }

  // 7. Substring fallback for other custom document types
  return req.includes(doc) || doc.includes(req)
}

/**
 * Searches documents array for any item that matches the given requirement title.
 */
export function findMatchingUploadedDoc(requirementTitle: string, documents: any[] = []): any | undefined {
  if (!Array.isArray(documents)) return undefined
  return documents.find((d: any) => {
    const docName = String(d?.doc_name || d?.document_name || d?.title || d?.imgname || '').trim()
    return matchesDocumentRequirement(requirementTitle, docName)
  })
}

/**
 * Unified evaluator for student profile and documents completion.
 * Used identically across /student/tasks, /student/overview, and /student/profile.
 */
export function evaluateStudentChecklist(
  student: any,
  documents: any[] = [],
  customHasAvatar?: boolean,
  serverRequirements?: any[]
): StudentChecklistResult {
  const docList = Array.isArray(documents) ? documents : []

  // If server-configured requirements exist from CRM, evaluate dynamically
  if (Array.isArray(serverRequirements) && serverRequirements.length > 0) {
    const dynamicChecklist: ChecklistItem[] = serverRequirements.map((r: any) => {
      const titleClean = String(r.title || '').trim()
      const uploadedDoc = findMatchingUploadedDoc(titleClean, docList)

      const isProfile =
        r.action_type === 'profile' ||
        titleClean.toLowerCase().includes('parent') ||
        titleClean.toLowerCase().includes('date of birth') ||
        titleClean.toLowerCase().includes('address')

      let isCompleted = false
      if (isProfile) {
        const hasFather = Boolean(student?.father && String(student.father).trim() !== '')
        const hasMother = Boolean(student?.mother && String(student.mother).trim() !== '')
        const hasDOB = Boolean(student?.dob && String(student.dob).trim() !== '')
        isCompleted = hasFather && hasMother && hasDOB
      } else {
        isCompleted = Boolean(
          uploadedDoc ||
          r.doc_status === 'Approved' ||
          r.doc_status === 'Completed' ||
          r.doc_status === 'Reviewing'
        )
      }

      return {
        id: `dyn_${r.id || titleClean.toLowerCase().replace(/[^a-z0-9]/g, '_')}`,
        title: titleClean,
        name: titleClean,
        missingTitle: `${titleClean} Missing`,
        description: r.description || `Required document for application processing.`,
        category: isProfile ? 'Profile Details' : 'Required Documents',
        priority: (r.tag === 'Required' ? 'high' : 'recommended') as any,
        isCompleted,
        actionType: isProfile ? 'profile' : 'upload',
        actionLabel: isCompleted ? (isProfile ? 'View Profile' : 'View Document') : (isProfile ? 'Update Profile' : `Upload ${titleClean}`),
        documentName: titleClean,
        documentUrl: uploadedDoc ? getFullDocUrl(uploadedDoc) : undefined,
        targetTab: isProfile ? 'general' : 'Upload Documents',
        completedInfo: isCompleted
          ? (isProfile ? 'Profile details submitted' : `Uploaded: ${uploadedDoc?.document_name || uploadedDoc?.doc_name || uploadedDoc?.imgname || titleClean}`)
          : undefined,
      }
    })

    const completedItems = dynamicChecklist.filter(item => item.isCompleted)
    const missingItems = dynamicChecklist.filter(item => !item.isCompleted)
    const totalCount = dynamicChecklist.length
    const completedCount = completedItems.length
    const missingCount = missingItems.length
    const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0

    return {
      checklist: dynamicChecklist,
      completedCount,
      missingCount,
      totalCount,
      progressPercent,
      completedItems,
      missingItems,
    }
  }

  // Check avatar in local storage or student object
  const hasAvatar =
    customHasAvatar !== undefined
      ? customHasAvatar
      : Boolean(
          (typeof window !== 'undefined' && localStorage.getItem('student_profile_avatar')) ||
            student?.profile_image ||
            student?.photo ||
            student?.avatar
        )

  // 1. Passport Copy (Mandatory for International Visa)
  // 1. Passport Copy (Mandatory for International Visa)
  const passportDoc = findMatchingUploadedDoc('Passport', docList)
  const isPassportComplete = Boolean(passportDoc)

  // 2. 12th / High School Marksheet & Certificate
  const highSchoolDoc = findMatchingUploadedDoc('12th Certificate', docList)
  const isHighSchoolComplete = Boolean(highSchoolDoc)

  // 3. 10th / Secondary School Certificate
  const secondaryDoc = findMatchingUploadedDoc('10th Certificate', docList)
  const isSecondaryComplete = Boolean(secondaryDoc)

  // 4. Passport Size Photo (White Background)
  const photoDoc = findMatchingUploadedDoc('Passport Size Photo', docList)
  const isPhotoComplete = Boolean(hasAvatar || photoDoc)

  // 5. English Language Proficiency (IELTS / TOEFL / MOI)
  const englishDoc = findMatchingUploadedDoc('English Language', docList)
  const isEnglishComplete = Boolean(englishDoc)

  // 6. Resume / Curriculum Vitae (CV)
  const resumeDoc = findMatchingUploadedDoc('Resume', docList)
  const isResumeComplete = Boolean(resumeDoc)

  // 7. Health declaration form
  const healthDoc = findMatchingUploadedDoc('Health Declaration Form', docList)
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

  const checklist: ChecklistItem[] = [
    {
      id: 'passport',
      title: 'International Passport Copy',
      name: 'Passport Copy',
      missingTitle: 'Passport Copy Not Uploaded',
      description: 'Scanned clear copy of your international passport bio-data and address page. Mandatory by EMGS for Malaysian student visa issuance.',
      category: 'Required Documents',
      priority: 'high',
      isCompleted: isPassportComplete,
      actionType: 'upload',
      actionLabel: 'Upload Passport Now',
      documentName: 'Passport',
      documentUrl: passportDoc ? getFullDocUrl(passportDoc) : undefined,
      targetTab: 'Upload Documents',
      completedInfo: passportDoc ? `Uploaded: ${passportDoc.doc_name || passportDoc.document_name || 'Passport'}` : 'Passport file uploaded',
    },
    {
      id: '12th_certificate',
      title: 'Grade 12 / High School Certificate & Transcript',
      name: '12th Marksheet',
      missingTitle: '12th / High School Marksheet Missing',
      description: 'Official Grade 12 or High School transcript and completion certificate. Required by university admission committees to evaluate eligibility.',
      category: 'Required Documents',
      priority: 'high',
      isCompleted: isHighSchoolComplete,
      actionType: 'upload',
      actionLabel: 'Upload 12th Marksheet',
      documentName: '12th Certificate',
      documentUrl: highSchoolDoc ? getFullDocUrl(highSchoolDoc) : undefined,
      targetTab: 'Upload Documents',
      completedInfo: highSchoolDoc ? `Uploaded: ${highSchoolDoc.doc_name || highSchoolDoc.document_name || '12th Certificate'}` : 'Document uploaded',
    },
    {
      id: 'passport_photo',
      title: 'Passport-Sized Photograph (White Background)',
      name: 'Passport Photo',
      missingTitle: 'Passport-Size Photo Missing',
      description: 'Formal passport-size photo with white background. Needed for student identification card and EMGS visa clearance.',
      category: 'Required Documents',
      priority: 'high',
      isCompleted: isPhotoComplete,
      actionType: 'upload',
      actionLabel: 'Upload Photo Now',
      documentName: 'Passport Size Photo',
      documentUrl: photoDoc ? getFullDocUrl(photoDoc) : undefined,
      targetTab: 'Upload Documents',
      completedInfo: photoDoc ? `Uploaded: ${photoDoc.doc_name || photoDoc.document_name || 'Photo'}` : 'Profile photo active',
    },
    {
      id: '10th_certificate',
      title: 'Grade 10 / Secondary School Certificate',
      name: '10th Certificate',
      missingTitle: '10th / Secondary Certificate Missing',
      description: 'Grade 10 passing certificate and marksheet used for date of birth verification and academic foundation records.',
      category: 'Required Documents',
      priority: 'medium',
      isCompleted: isSecondaryComplete,
      actionType: 'upload',
      actionLabel: 'Upload 10th Certificate',
      documentName: '10th Certificate',
      documentUrl: secondaryDoc ? getFullDocUrl(secondaryDoc) : undefined,
      targetTab: 'Upload Documents',
      completedInfo: secondaryDoc ? `Uploaded: ${secondaryDoc.doc_name || secondaryDoc.document_name || '10th Certificate'}` : 'Document uploaded',
    },
    {
      id: 'english_proficiency',
      title: 'English Language Proficiency Proof',
      name: 'English Proof',
      missingTitle: 'English Proficiency Proof Not Provided',
      description: 'IELTS, TOEFL, Duolingo, PTE score or Medium of Instruction (MOI) certificate to satisfy university English language requirements.',
      category: 'Required Documents',
      priority: 'medium',
      isCompleted: isEnglishComplete,
      actionType: 'upload',
      actionLabel: 'Upload English Proof',
      documentName: 'English Language',
      documentUrl: englishDoc ? getFullDocUrl(englishDoc) : undefined,
      targetTab: 'Upload Documents',
      completedInfo: englishDoc ? `Uploaded: ${englishDoc.doc_name || englishDoc.document_name || 'English Proof'}` : 'Certificate uploaded',
    },
    {
      id: 'resume',
      title: 'Resume / Curriculum Vitae (CV)',
      name: 'Resume / CV',
      missingTitle: 'Resume / CV Not Uploaded',
      description: 'An updated resume highlighting your academic achievements, extracurriculars, and skills for scholarship consideration.',
      category: 'Required Documents',
      priority: 'recommended',
      isCompleted: isResumeComplete,
      actionType: 'upload',
      actionLabel: 'Upload Resume / CV',
      documentName: 'Resume',
      documentUrl: resumeDoc ? getFullDocUrl(resumeDoc) : undefined,
      targetTab: 'Upload Documents',
      completedInfo: resumeDoc ? `Uploaded: ${resumeDoc.doc_name || resumeDoc.document_name || 'Resume'}` : 'Resume added',
    },
    {
      id: 'health_declaration',
      title: 'Health Declaration Form',
      name: 'Health Declaration',
      missingTitle: 'Health Declaration Form Missing',
      description: '',
      category: 'Required Documents',
      priority: 'recommended',
      isCompleted: isHealthComplete,
      actionType: 'upload',
      actionLabel: 'Upload Health Form',
      documentName: 'Health declaration form',
      documentUrl: healthDoc ? getFullDocUrl(healthDoc) : undefined,
      targetTab: 'Upload Documents',
      completedInfo: healthDoc ? `Uploaded: ${healthDoc.doc_name || healthDoc.document_name || 'Health Form'}` : 'Health form uploaded',
    },
    {
      id: 'personal_details',
      title: 'Parent Details & Date of Birth',
      name: 'Parent Details & DOB',
      missingTitle: 'Parent & Date of Birth Details Incomplete',
      description: "Father's name, mother's name, date of birth, and nationality must be filled in your student profile.",
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
      name: 'Residential Address',
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
      name: 'Education History',
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

  const completedItems = checklist.filter(item => item.isCompleted)
  const missingItems = checklist.filter(item => !item.isCompleted)
  const totalCount = checklist.length
  const completedCount = completedItems.length
  const missingCount = missingItems.length
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0

  return {
    checklist,
    completedCount,
    missingCount,
    totalCount,
    progressPercent,
    completedItems,
    missingItems,
  }
}

/**
 * Resolves full document file URL for preview across local dev and production.
 */
export function getFullDocUrl(doc: any): string {
  const raw = String(doc?.imgpath || doc?.imgname || '').trim()
  if (!raw) return '#'
  if (/^https?:\/\//i.test(raw)) return raw

  const cleaned = raw.replace(/\\/g, '/').replace(/^\/+/, '')
  const runtimeOrigin = typeof window !== 'undefined' ? window.location.origin : ''
  const isLocalRuntime = typeof window !== 'undefined' 
    ? /localhost|127\.0\.0\.1/i.test(window.location.hostname)
    : process.env.NODE_ENV !== 'production'

  const rawUploadSource = String(doc?.upload_source || '').trim()

  // 1. Detect if this document was uploaded via CRM / Admissions
  const isCrmDoc =
    cleaned.startsWith('student-documents/') ||
    rawUploadSource.includes('3010') ||
    rawUploadSource.toLowerCase().includes('crm') ||
    rawUploadSource.toLowerCase().includes('portal.britannicaoverseas') ||
    (doc?.upload_by != null && Number(doc?.upload_by) > 0)

  if (isCrmDoc) {
    let crmBase = ''
    if (/^https?:\/\//i.test(rawUploadSource) && !rawUploadSource.includes('3000') && !rawUploadSource.includes('educationmalaysia.in')) {
      crmBase = rawUploadSource.replace(/\/+$/, '')
    } else if (isLocalRuntime) {
      crmBase = 'http://localhost:3010'
    } else {
      crmBase = (process.env.NEXT_PUBLIC_CRM_PUBLIC_URL || process.env.NEXT_PUBLIC_CRM_API_URL || 'https://portal.britannicaoverseas.com').replace(/\/+$/, '')
    }

    const crmRelativePath = cleaned.replace(/^(uploads\/|storage\/)+/, '')
    return `${crmBase}/uploads/${crmRelativePath}`
  }

  // 2. Student-uploaded documents hosted on NextEducationMalaysia
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || '').trim().replace(/\/+$/, '')
  const baseDomain = runtimeOrigin || siteUrl || 'https://www.educationmalaysia.in'

  const basePath = cleaned.startsWith('storage/')
    ? cleaned
    : cleaned.startsWith('uploads/')
      ? `storage/${cleaned}`
      : `storage/uploads/${cleaned}`

  return `${baseDomain.replace(/\/+$/, '')}/${basePath}`
}
