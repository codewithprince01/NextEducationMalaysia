'use client'

import React, { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import PersonalInfoForm from "@/components/student/PersonalInfoForm";
import EducationForm from "@/components/student/EducationForm";
import TestScoresForm from "@/components/student/TestScoresForm";
import BackgroundForm from "@/components/student/BackgroundForm";
import DocumentUploadForm from "@/components/student/DocumentUploadForm";
import { User, GraduationCap, Award, ShieldCheck, FileText } from "lucide-react";
import {
  validateDateOfBirth,
  validateEmail,
  validateName,
  validatePassport,
  validatePhone,
  validateRequired,
  validateSelect,
  validateZipcode,
} from "@/utils/validation";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://admin.educationmalaysia.in/api";
const API_KEY = process.env.NEXT_PUBLIC_FRONTEND_API_KEY || "";

const INITIAL_FORM = {
  name: "",
  email: "",
  mobile: "",
  c_code: "",
  country_code: "",
  father: "",
  mother: "",
  dob: "",
  first_language: "",
  nationality: "",
  passport_number: "",
  passport_expiry: "",
  marital_status: "",
  gender: "",
  home_address: "",
  city: "",
  state: "",
  country: "",
  zipcode: "",
  home_contact_number: "",
};

const TABS = [
  { id: "general", label: "General Information" },
  { id: "education", label: "Education History" },
  { id: "testScores", label: "Test Scores" },
  { id: "Background Information", label: "Background Information" },
  { id: "Upload Documents", label: "Upload Documents" },
];

const normalizeDateForInput = (value: unknown): string => {
  if (!value) return "";

  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value.toISOString().slice(0, 10);
  }

  const raw = String(value).trim();
  if (!raw) return "";

  // Already in yyyy-mm-dd or full datetime
  if (/^\d{4}-\d{2}-\d{2}/.test(raw)) {
    return raw.slice(0, 10);
  }

  // dd-mm-yyyy -> yyyy-mm-dd
  const dmy = raw.match(/^(\d{2})-(\d{2})-(\d{4})$/);
  if (dmy) {
    const [, dd, mm, yyyy] = dmy;
    return `${yyyy}-${mm}-${dd}`;
  }

  // Fallback parse
  const parsed = new Date(raw);
  if (Number.isNaN(parsed.getTime())) return "";
  return parsed.toISOString().slice(0, 10);
};

export default function StudentProfileClient() {
  const [activeTab, setActiveTab] = useState("general");
  const [formData, setFormData] = useState<any>(INITIAL_FORM);
  const [errors, setErrors] = useState<any>({});
  const [touched, setTouched] = useState<any>({});
  const [student, setStudent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [countriesData, setCountriesData] = useState<any[]>([]);
  const [phoneCode, setPhoneCode] = useState<any[]>([]);

  const refs = {
    general: useRef<HTMLDivElement | null>(null),
    education: useRef<HTMLDivElement | null>(null),
    testScores: useRef<HTMLDivElement | null>(null),
    "Background Information": useRef<HTMLDivElement | null>(null),
    "Upload Documents": useRef<HTMLDivElement | null>(null),
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setLoading(false);
      window.location.href = "/login";
      return;
    }

    const headers = {
      Authorization: `Bearer ${token}`,
      ...(API_KEY ? { "x-api-key": API_KEY } : {}),
    };

    const loadProfile = async () => {
      try {
        const res = await fetch(`${API_BASE}/student/profile`, { headers });
        const json = await res.json();
        if (!res.ok || !json?.data?.student) {
          toast.error(json?.message || "Failed to load profile");
          return;
        }

        const studentData = json.data.student;
        setStudent(studentData);
        setFormData({
          ...INITIAL_FORM,
          ...studentData,
          dob: normalizeDateForInput(studentData?.dob),
          passport_expiry: normalizeDateForInput(studentData?.passport_expiry),
          c_code: studentData.c_code || studentData.country_code || "",
          country_code: studentData.country_code || studentData.c_code || "",
        });
      } catch (err) {
        toast.error("Failed to load profile detail");
      } finally {
        setLoading(false);
      }
    };

    const loadMeta = async () => {
      try {
        const [countriesRes, phoneRes] = await Promise.all([
          fetch(`${API_BASE}/countries`, { headers: API_KEY ? { "x-api-key": API_KEY } : undefined }).then((r) => r.json()),
          fetch(`${API_BASE}/phonecodes`, { headers: API_KEY ? { "x-api-key": API_KEY } : undefined }).then((r) => r.json()),
        ]);
        const safeArray = (res: any) => (Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : []);
        setCountriesData(safeArray(countriesRes));
        setPhoneCode(safeArray(phoneRes));
      } catch (err) {
        console.error("Error fetching profile meta:", err);
      }
    };

    loadProfile();
    loadMeta();
  }, []);

  useEffect(() => {
    const handler = () => {
      for (const [id, ref] of Object.entries(refs)) {
        const el = ref.current;
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= 180 && rect.bottom >= 180) {
            setActiveTab((prev) => (prev !== id ? id : prev));
            break;
          }
        }
      }
    };
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  const validateField = (name: string, value: any) => {
    let error = "";
    if (name === "name") error = validateName(value, "Full name");
    else if (name === "email") error = validateEmail(value);
    else if (name === "mobile") error = validatePhone(value, "Mobile number");
    else if (name === "home_contact_number") error = validatePhone(value, "Home contact number");
    else if (name === "c_code") error = validateSelect(value, "code");
    else if (name === "nationality") error = validateSelect(value, "nationality");
    else if (name === "country") error = validateSelect(value, "country");
    else if (name === "marital_status") error = validateSelect(value, "marital status");
    else if (name === "gender") error = validateSelect(value, "gender");
    else if (name === "father") error = validateName(value, "Father name");
    else if (name === "mother") error = validateName(value, "Mother name");
    else if (name === "dob") error = validateDateOfBirth(value, "Date of birth");
    else if (name === "first_language") error = validateRequired(value, "First language");
    else if (name === "home_address") error = validateRequired(value, "Home address");
    else if (name === "city") error = validateRequired(value, "City");
    else if (name === "state") error = validateRequired(value, "State");
    else if (name === "passport_expiry") error = validateRequired(value, "Passport expiry");
    else if (name === "passport_number") error = validatePassport(value);
    else if (name === "zipcode") error = validateZipcode(value);

    setErrors((p: any) => ({ ...p, [name]: error }));
    return error;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((p: any) => ({ ...p, [name]: value }));
    if (errors[name]) setErrors((p: any) => ({ ...p, [name]: "" }));
    if (touched[name]) validateField(name, value);
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setTouched((p: any) => ({ ...p, [name]: true }));
    validateField(name, value);
  };

  const handleNationalityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedCountry = e.target.value;
    setFormData((p: any) => ({ ...p, nationality: selectedCountry }));
    if (selectedCountry && Array.isArray(countriesData)) {
      const match = countriesData.find((c) => c.name?.toLowerCase() === selectedCountry.toLowerCase());
      if (match && Array.isArray(phoneCode)) {
        const codeMatch = phoneCode.find(
          (c) => c.iso === match.code || c.name?.toLowerCase() === match.name?.toLowerCase(),
        );
        if (codeMatch) {
          setFormData((p: any) => ({
            ...p,
            c_code: codeMatch.phonecode,
            country_code: codeMatch.phonecode,
            nationality: selectedCountry,
          }));
        }
      }
    }
    if (touched.nationality) validateField("nationality", selectedCountry);
  };

  const handleCountryCodeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedCode = e.target.value;
    setFormData((p: any) => ({ ...p, c_code: selectedCode, country_code: selectedCode }));
    if (selectedCode && Array.isArray(phoneCode)) {
      const phoneMatch = phoneCode.find((c) => String(c.phonecode) === String(selectedCode));
      if (phoneMatch && Array.isArray(countriesData)) {
        const countryMatch = countriesData.find(
          (c) =>
            c.name?.toLowerCase() === phoneMatch.name?.toLowerCase() ||
            c.name?.toLowerCase() === phoneMatch.country?.toLowerCase(),
        );
        if (countryMatch) {
          setFormData((p: any) => ({ ...p, nationality: countryMatch.name, c_code: selectedCode, country_code: selectedCode }));
        }
      }
    }
    if (touched.c_code) validateField("c_code", selectedCode);
  };

  const validateForm = () => {
    const requiredFields = [
      "name",
      "email",
      "mobile",
      "home_contact_number",
      "c_code",
      "father",
      "mother",
      "dob",
      "first_language",
      "nationality",
      "passport_number",
      "passport_expiry",
      "marital_status",
      "gender",
      "home_address",
      "city",
      "state",
      "country",
      "zipcode",
    ];
    const newErrors: any = {};
    requiredFields.forEach((k) => {
      newErrors[k] = validateField(k, formData[k]);
    });
    setErrors(newErrors);
    setTouched((prev: any) => ({ ...prev, ...Object.fromEntries(requiredFields.map((k) => [k, true])) }));
    return !Object.values(newErrors).some(Boolean);
  };

  const handleSave = async () => {
    if (!validateForm()) {
      toast.error("Please fix the errors before submitting");
      return;
    }
    const token = localStorage.getItem("token");
    if (!token) return;
    const payload = {
      ...formData,
      dob: normalizeDateForInput(formData?.dob),
      passport_expiry: normalizeDateForInput(formData?.passport_expiry),
      country_code: formData.country_code || formData.c_code || "",
    };

    try {
      const res = await fetch(`${API_BASE}/student/personal-information`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          ...(API_KEY ? { "x-api-key": API_KEY } : {}),
        },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) {
        toast.error(json?.message || "Failed to update profile");
        return;
      }
      toast.success("Personal Information Updated Successfully!");
    } catch (err) {
      toast.error("Failed to update. Please try again.");
    }
  };

  const handleCancel = () => setFormData(INITIAL_FORM);

  const handleTabClick = (id: string, ref: React.RefObject<HTMLDivElement | null>) => {
    setActiveTab(id);
    ref.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="w-12 h-12 rounded-full border-4 border-blue-100 border-t-blue-600 animate-spin mb-4" />
        <p className="text-sm font-medium text-slate-600">Loading student profile...</p>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="text-center py-16 bg-white rounded-2xl border border-slate-200/80 p-8 shadow-xs">
        <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-3">
          <User className="w-6 h-6" />
        </div>
        <h3 className="text-lg font-bold text-slate-900 mb-1">Profile Not Found</h3>
        <p className="text-sm text-slate-500 mb-4">We couldn't retrieve your student profile information.</p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition shadow-xs"
        >
          Retry
        </button>
      </div>
    );
  }

  const tabIcons: Record<string, React.ReactNode> = {
    general: <User className="w-4 h-4" />,
    education: <GraduationCap className="w-4 h-4" />,
    testScores: <Award className="w-4 h-4" />,
    "Background Information": <ShieldCheck className="w-4 h-4" />,
    "Upload Documents": <FileText className="w-4 h-4" />,
  };

  return (
    <div className="relative w-full space-y-6">

      {/* Sticky Quick-Nav Tabs */}
      <div className="sticky top-16 md:top-20 z-20 -mx-1 px-1 sm:mx-0 sm:px-0">
        <div className="bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200/80 p-1.5 shadow-sm">
          <div className="flex items-center gap-1 overflow-x-auto scrollbar-none">
            {TABS.map(({ id, label }) => {
              const isActive = activeTab === id;
              return (
                <button
                  key={id}
                  onClick={() => handleTabClick(id, (refs as any)[id])}
                  className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 transition-all whitespace-nowrap ${
                    isActive
                      ? "bg-blue-600 text-white shadow-xs"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/80"
                  }`}
                >
                  <span className={isActive ? "text-white" : "text-slate-400"}>
                    {tabIcons[id]}
                  </span>
                  {label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Sections */}
      <div className="space-y-8">
        <div ref={refs.general} className="scroll-mt-36">
          <PersonalInfoForm
            formData={formData}
            errors={errors}
            countriesData={countriesData}
            phoneCode={phoneCode}
            onChange={handleChange}
            onBlur={handleBlur}
            onNationalityChange={handleNationalityChange}
            onCountryCodeChange={handleCountryCodeChange}
            onSave={handleSave}
            onCancel={handleCancel}
          />
        </div>

        <div ref={refs.education} className="scroll-mt-36">
          <EducationForm />
        </div>

        <div ref={refs.testScores} className="scroll-mt-36">
          <TestScoresForm />
        </div>

        <div ref={refs["Background Information"]} className="scroll-mt-36">
          <BackgroundForm />
        </div>

        <div ref={refs["Upload Documents"]} className="scroll-mt-36">
          <DocumentUploadForm />
        </div>
      </div>
    </div>
  );
}
