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
      const uploadedDoc = docList.find(d => {
        const name = String(d?.document_name || d?.doc_name || d?.imgname || '').toLowerCase().trim()
        const reqName = titleClean.toLowerCase()
        if (!name || !reqName) return false
        return name === reqName || name.includes(reqName) || reqName.includes(name)
      })

      const isCompleted = Boolean(uploadedDoc || r.doc_status === 'Approved' || r.doc_status === 'Completed')
      const isProfile =
        r.action_type === 'profile' ||
        titleClean.toLowerCase().includes('parent') ||
        titleClean.toLowerCase().includes('date of birth') ||
        titleClean.toLowerCase().includes('address')

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
        actionLabel: isCompleted ? 'View Document' : isProfile ? 'Update Profile' : `Upload ${titleClean}`,
        documentName: titleClean,
        targetTab: isProfile ? 'general' : 'Upload Documents',
        completedInfo: isCompleted ? `Uploaded: ${uploadedDoc?.document_name || uploadedDoc?.doc_name || uploadedDoc?.imgname || titleClean}` : undefined,
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
