'use client'

import React, { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Send, User, Mail, Phone, Briefcase, GraduationCap, Building, Globe, Calendar, Target, Award, FileText, AlertCircle } from "lucide-react"
import { toast } from "react-toastify"

const TOTAL_STEPS = 5

const STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Delhi", "Goa", "Gujarat", 
  "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", 
  "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", 
  "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal"
]

const SPECIALIZATION_OPTIONS = [
  "MBBS Admissions", "Medical Counseling", "Visa Assistance", "International Admissions", 
  "Student Support", "Career Guidance", "NEET Coaching", "Abroad Studies", "Scholarship Guidance", 
  "University Partnerships", "Student Mentoring", "Documentation", "Pre-departure Support"
]

const SERVICES_OPTIONS = [
  "Admission Counseling", "Visa Processing", "Accommodation Assistance", "Travel Arrangements", 
  "Document Verification", "Scholarship Guidance", "Career Counseling", "Test Preparation", 
  "University Selection", "Application Processing", "Financial Planning", "Post-arrival Support"
]

const INITIAL_FORM = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  alternatePhone: "",
  companyName: "",
  companyType: "",
  registrationNumber: "",
  establishedYear: "",
  website: "",
  address: "",
  city: "",
  state: "",
  pincode: "",
  country: "India",
  designation: "",
  experience: "",
  qualification: "",
  specialization: [] as string[],
  currentStudents: "",
  annualRevenue: "",
  teamSize: "",
  servicesOffered: [] as string[],
  partnershipType: "",
  expectedStudents: "",
  marketingBudget: "",
  references: "",
  whyPartner: "",
  additionalInfo: "",
  termsAccepted: false,
  dataConsent: false,
}

const Step1 = ({ formData, onChange }: { formData: typeof INITIAL_FORM, onChange: (field: string, value: any) => void }) => (
  <div className="space-y-6 animate-fade-in-up">
    <div className="flex items-center mb-6 border-b pb-4">
      <User className="w-6 h-6 text-blue-600 mr-3" />
      <h2 className="text-xl font-bold text-gray-900">Personal Information</h2>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">First Name *</label>
        <input type="text" required value={formData.firstName} onChange={(e) => onChange("firstName", e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 transition-all outline-none" placeholder="Enter your first name" />
      </div>
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">Last Name *</label>
        <input type="text" required value={formData.lastName} onChange={(e) => onChange("lastName", e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 transition-all outline-none" placeholder="Enter your last name" />
      </div>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address *</label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input type="email" required value={formData.email} onChange={(e) => onChange("email", e.target.value)} className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 transition-all outline-none" placeholder="your.email@example.com" />
        </div>
      </div>
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">Phone Number *</label>
        <div className="relative">
          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input type="tel" required value={formData.phone} onChange={(e) => onChange("phone", e.target.value)} className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 transition-all outline-none" placeholder="+91 98765 43210" />
        </div>
      </div>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">Designation *</label>
        <div className="relative">
          <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input type="text" required value={formData.designation} onChange={(e) => onChange("designation", e.target.value)} className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 transition-all outline-none" placeholder="e.g., Director" />
        </div>
      </div>
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">Experience *</label>
        <select required value={formData.experience} onChange={(e) => onChange("experience", e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none">
          <option value="">Select experience</option>
          <option value="1-2 years">1-2 years</option>
          <option value="3-5 years">3-5 years</option>
          <option value="6-10 years">6-10 years</option>
          <option value="15+ years">15+ years</option>
        </select>
      </div>
    </div>
  </div>
)

const Step2 = ({ formData, onChange }: { formData: typeof INITIAL_FORM, onChange: (field: string, value: any) => void }) => (
  <div className="space-y-6 animate-fade-in-up">
    <div className="flex items-center mb-6 border-b pb-4">
      <Building className="w-6 h-6 text-blue-600 mr-3" />
      <h2 className="text-xl font-bold text-gray-900">Company Information</h2>
    </div>
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-2">Company Name *</label>
      <input type="text" required value={formData.companyName} onChange={(e) => onChange("companyName", e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 transition-all outline-none" placeholder="Enter your company name" />
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">Year Established *</label>
        <div className="relative">
          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input type="number" required min="1950" max="2024" value={formData.establishedYear} onChange={(e) => onChange("establishedYear", e.target.value)} className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="2020" />
        </div>
      </div>
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">Website</label>
        <div className="relative">
          <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input type="url" value={formData.website} onChange={(e) => onChange("website", e.target.value)} className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="https://www.yourcompany.com" />
        </div>
      </div>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">City *</label>
        <input type="text" required value={formData.city} onChange={(e) => onChange("city", e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="City" />
      </div>
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">State *</label>
        <select required value={formData.state} onChange={(e) => onChange("state", e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none">
          <option value="">Select state</option>
          {STATES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">PIN Code *</label>
        <input type="text" required pattern="[0-9]{6}" value={formData.pincode} onChange={(e) => onChange("pincode", e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="123456" />
      </div>
    </div>
  </div>
)

const Step3 = ({ formData, onArrayChange, onChange }: { formData: typeof INITIAL_FORM, onArrayChange: (field: string, value: string, checked: boolean) => void, onChange: (field: string, value: any) => void }) => (
  <div className="space-y-6 animate-fade-in-up">
    <div className="flex items-center mb-6 border-b pb-4">
      <Target className="w-6 h-6 text-blue-600 mr-3" />
      <h2 className="text-xl font-bold text-gray-900">Specialization & Services</h2>
    </div>
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-4">Areas of Specialization *</label>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {SPECIALIZATION_OPTIONS.map(spec => (
          <label key={spec} className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
            <input type="checkbox" checked={formData.specialization.includes(spec)} onChange={(e) => onArrayChange("specialization", spec, e.target.checked)} className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
            <span className="ml-3 text-xs font-medium text-gray-700">{spec}</span>
          </label>
        ))}
      </div>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">Team Size *</label>
        <select required value={formData.teamSize} onChange={(e) => onChange("teamSize", e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none">
          <option value="">Select size</option>
          <option value="1-5">1-5 members</option>
          <option value="6-10">6-10 members</option>
          <option value="11-25">11-25 members</option>
          <option value="50+">50+ members</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">Annual Revenue</label>
        <select value={formData.annualRevenue} onChange={(e) => onChange("annualRevenue", e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none">
          <option value="">Select range</option>
          <option value="Under 10 Lakhs">Under 10 Lakhs</option>
          <option value="10-50 Lakhs">10-50 Lakhs</option>
          <option value="50 Lakhs - 1 Crore">50 Lakhs - 1 Crore</option>
          <option value="1 Crore+">1 Crore+</option>
        </select>
      </div>
    </div>
  </div>
)

const Step4 = ({ formData, onChange }: { formData: typeof INITIAL_FORM, onChange: (field: string, value: any) => void }) => (
  <div className="space-y-6 animate-fade-in-up">
    <div className="flex items-center mb-6 border-b pb-4">
      <Award className="w-6 h-6 text-blue-600 mr-3" />
      <h2 className="text-xl font-bold text-gray-900">Partnership Details</h2>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">Partnership Type *</label>
        <select required value={formData.partnershipType} onChange={(e) => onChange("partnershipType", e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none">
          <option value="">Select type</option>
          <option value="Authorized Representative">Authorized Representative</option>
          <option value="Regional Partner">Regional Partner</option>
          <option value="Franchise Partner">Franchise Partner</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">Expected Students *</label>
        <select required value={formData.expectedStudents} onChange={(e) => onChange("expectedStudents", e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none">
          <option value="">Select range</option>
          <option value="10-25">10-25 students</option>
          <option value="26-50">26-50 students</option>
          <option value="50+">50+ students</option>
        </select>
      </div>
    </div>
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-2">Why partner with us? *</label>
      <textarea required rows={4} value={formData.whyPartner} onChange={(e) => onChange("whyPartner", e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 transition-all outline-none" placeholder="Explain your motivation..." />
    </div>
  </div>
)

const Step5 = ({ formData, onChange }: { formData: typeof INITIAL_FORM, onChange: (field: string, value: any) => void }) => (
  <div className="space-y-6">
    <div className="flex items-center mb-6 border-b pb-4">
      <FileText className="w-6 h-6 text-blue-600 mr-3" />
      <h2 className="text-xl font-bold text-gray-900">Final Confirmation</h2>
    </div>
    <div className="bg-gray-50 rounded-lg p-6 border border-gray-100">
      <h3 className="text-lg font-bold text-gray-900 mb-4">Application Summary</h3>
      <div className="grid grid-cols-2 gap-4 text-sm font-semibold tracking-tight">
        <div><span className="text-gray-500">Name:</span> <span className="text-gray-900 ml-2">{formData.firstName} {formData.lastName}</span></div>
        <div><span className="text-gray-500">Company:</span> <span className="text-gray-900 ml-2">{formData.companyName}</span></div>
        <div><span className="text-gray-500">Location:</span> <span className="text-gray-900 ml-2">{formData.city}, {formData.state}</span></div>
        <div><span className="text-gray-500">Type:</span> <span className="text-gray-900 ml-2">{formData.partnershipType}</span></div>
      </div>
    </div>
    <div className="space-y-4">
      <label className="flex items-start group cursor-pointer">
        <input type="checkbox" required checked={formData.termsAccepted} onChange={(e) => onChange("termsAccepted", e.target.checked)} className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mt-1" />
        <span className="ml-3 text-sm text-gray-600 font-medium">I agree to the <span className="text-blue-600">Terms and Conditions</span> and <span className="text-blue-600">Partnership Agreement</span>.</span>
      </label>
      <label className="flex items-start group cursor-pointer">
        <input type="checkbox" required checked={formData.dataConsent} onChange={(e) => onChange("dataConsent", e.target.checked)} className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mt-1" />
        <span className="ml-3 text-sm text-gray-600 font-medium">I consent to the collection and storage of my business information per the <span className="text-blue-600">Privacy Policy</span>.</span>
      </label>
    </div>
    <div className="bg-blue-50 border border-blue-100 rounded-lg p-5 flex gap-4">
      <AlertCircle className="w-6 h-6 text-blue-600 shrink-0" />
      <div className="text-sm">
        <p className="font-bold text-blue-900 mb-2">Review Process Notice</p>
        <ul className="space-y-1 text-blue-700 font-medium list-disc list-inside">
          <li>Initial review within 3-5 business days</li>
          <li>Verification of provided documentation</li>
          <li>Team interview for shortlisted partners</li>
        </ul>
      </div>
    </div>
  </div>
)

export default function PartnerApplicationClient() {
  const router = useRouter()
  const [formData, setFormData] = useState(INITIAL_FORM)
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" })
  }, [currentStep])

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleArrayChange = (field: string, value: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: checked 
        ? [...(prev[field as keyof typeof INITIAL_FORM] as string[]), value]
        : (prev[field as keyof typeof INITIAL_FORM] as string[]).filter(item => item !== value)
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      const response = await fetch('/api/v1/inquiry/partner-application', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      const contentType = response.headers.get('content-type') || ''
      const isJson = contentType.includes('application/json')
      const data = isJson ? await response.json() : null

      if (!response.ok) {
        const fallbackText = isJson ? '' : await response.text().catch(() => '')
        const message = data?.message || (fallbackText ? 'Route not found (HTML response)' : 'Submission failed.')
        throw new Error(message)
      }

      if (data?.status) {
        toast.success(data.message || "Application submitted successfully!")
        router.push("/view-our-partners")
      } else {
        toast.error(data?.message || "Submission failed.")
      }
    } catch (error) {
      console.error("Submission error:", error)
      toast.error((error as Error)?.message || "Submission failed. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <button
          onClick={() => router.push("/view-our-partners")}
          className="mb-8 group flex items-center text-blue-600 font-semibold text-sm transition-all hover:translate-x-[-4px]"
        >
          <ArrowLeft className="w-5 h-5 mr-3" /> Back to Partners
        </button>

        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-6 tracking-tight">
            Partner Application <span className="text-blue-600">Form</span>
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto font-medium">
            Join our global network of trusted education partners and scale your student admissions confidently.
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-12 relative max-w-2xl mx-auto">
          <div className="flex justify-between relative z-10">
            {[1, 2, 3, 4, 5].map((step) => (
              <div key={step} className="flex flex-col items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                    step <= currentStep
                      ? "bg-blue-600 text-white shadow-lg"
                      : "bg-white text-gray-400 border border-gray-200"
                  }`}
                >
                  {step}
                </div>
              </div>
            ))}
          </div>
          <div className="absolute top-5 left-0 w-full h-1 bg-gray-200 -z-10 rounded-full">
            <div
              className="h-full bg-blue-600 transition-all duration-500 ease-in-out"
              style={{ width: `${((currentStep - 1) / 4) * 100}%` }}
            />
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 border border-gray-100">
          <form onSubmit={handleSubmit}>
            {currentStep === 1 && <Step1 formData={formData} onChange={handleInputChange} />}
            {currentStep === 2 && <Step2 formData={formData} onChange={handleInputChange} />}
            {currentStep === 3 && (
              <Step3
                formData={formData}
                onChange={handleInputChange}
                onArrayChange={handleArrayChange}
              />
            )}
            {currentStep === 4 && <Step4 formData={formData} onChange={handleInputChange} />}
            {currentStep === 5 && <Step5 formData={formData} onChange={handleInputChange} />}

            <div className="flex justify-between pt-12 mt-12 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setCurrentStep((s) => s - 1)}
                disabled={currentStep === 1}
                className={`px-8 py-3 rounded-lg font-semibold text-sm transition-all ${
                  currentStep === 1
                    ? "bg-gray-100 text-gray-300 cursor-not-allowed"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                Previous
              </button>

              {currentStep < TOTAL_STEPS ? (
                <button
                  type="button"
                  onClick={() => setCurrentStep((s) => s + 1)}
                  className="px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold text-sm hover:bg-blue-700 transition-all shadow-md"
                >
                  Next Step
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isSubmitting || !formData.termsAccepted || !formData.dataConsent}
                  className={`px-8 py-3 rounded-lg font-semibold text-sm transition-all flex items-center shadow-md ${
                    isSubmitting || !formData.termsAccepted || !formData.dataConsent
                      ? "bg-gray-300 text-white cursor-not-allowed"
                      : "bg-green-600 text-white hover:bg-green-700 shadow-green-200"
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/30 border-t-white mr-3" />
                      Submitting
                    </>
                  ) : (
                    <>
                      <Send size={16} className="mr-3" /> Submit Application
                    </>
                  )}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
