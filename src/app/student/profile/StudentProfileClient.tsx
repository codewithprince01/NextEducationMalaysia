'use client'

import React, { useState, useRef, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import PersonalInfoForm from "@/components/student/PersonalInfoForm";
import EducationForm from "@/components/student/EducationForm";
import TestScoresForm from "@/components/student/TestScoresForm";
import BackgroundForm from "@/components/student/BackgroundForm";
import DocumentUploadForm from "@/components/student/DocumentUploadForm";
import {
  validateEmail,
  validateRequired,
} from "@/utils/validation";
import { toast } from "react-toastify";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://admin.educationmalaysia.in/api'

const INITIAL_FORM = {
  name: "",
  email: "",
  mobile: "",
  c_code: "",
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
  { id: "background", label: "Background Information" },
  { id: "documents", label: "Upload Documents" },
];

export default function StudentProfileClient() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("general");
  const [formData, setFormData] = useState<any>(INITIAL_FORM);
  const [errors, setErrors] = useState<any>({});
  const [touched, setTouched] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [countriesData, setCountriesData] = useState<any[]>([]);
  const [phoneCode, setPhoneCode] = useState<any[]>([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const [pRes, cRes, pcRes] = await Promise.all([
          fetch(`${API_BASE}/student/profile`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
          fetch(`${API_BASE}/countries`).then(r => r.json()),
          fetch(`${API_BASE}/phonecodes`).then(r => r.json())
        ]);

        const safeArray = (res: any) => Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
        
        if (pRes.data?.student) {
          setFormData({ ...INITIAL_FORM, ...pRes.data.student });
        }
        setCountriesData(safeArray(cRes));
        setPhoneCode(safeArray(pcRes));
      } catch (error) {
        console.error("Error loading profile data:", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const validateField = (name: string, value: any) => {
    let error = "";
    if (name === "name") error = validateRequired(value, "Full name");
    else if (name === "email") error = validateEmail(value);
    else if (["mobile", "father", "mother", "dob", "nationality", "home_address", "city", "state", "country", "zipcode"].includes(name)) {
      error = validateRequired(value, name.replace('_', ' '));
    }
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
    const val = e.target.value;
    setFormData((p: any) => ({ ...p, nationality: val }));
    // Auto-sync country code
    if (val && Array.isArray(countriesData)) {
      const match = countriesData.find(c => c.name?.toLowerCase() === val.toLowerCase());
      if (match && Array.isArray(phoneCode)) {
        const codeMatch = phoneCode.find(c => c.iso === match.code || c.name?.toLowerCase() === match.name?.toLowerCase());
        if (codeMatch) setFormData((p: any) => ({ ...p, c_code: codeMatch.phonecode }));
      }
    }
  };

  const handleCountryCodeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setFormData((p: any) => ({ ...p, c_code: val }));
    if (val && Array.isArray(phoneCode)) {
      const phoneMatch = phoneCode.find(c => String(c.phonecode) === String(val));
      if (phoneMatch && Array.isArray(countriesData)) {
        const countryMatch = countriesData.find(c => 
          c.name?.toLowerCase() === phoneMatch.name?.toLowerCase() || 
          c.name?.toLowerCase() === phoneMatch.country?.toLowerCase()
        );
        if (countryMatch) setFormData((p: any) => ({ ...p, nationality: countryMatch.name }));
      }
    }
  };

  const handleSave = async () => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${API_BASE}/student/personal-information`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        toast.success("Profile updated successfully! ✅");
      } else {
        toast.error("Failed to update profile.");
      }
    } catch (error) {
      toast.error("An error occurred.");
    }
  };

  if (loading) return <div className="flex justify-center py-24"><div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Complete Profile</h1>
          <p className="text-gray-500 mt-1 font-medium">Keep your professional and educational info up to date</p>
        </div>
      </div>

      {/* Sticky Tabs */}
      <div className="sticky top-0 md:top-4 z-40 bg-white/80 backdrop-blur-md p-2 rounded-2xl shadow-lg border border-white/20">
        <div className="flex overflow-x-auto gap-2 scrollbar-hide">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-5 py-2.5 rounded-xl whitespace-nowrap transition-all duration-300 font-bold text-sm ${
                activeTab === tab.id
                  ? "bg-blue-600 text-white shadow-md shadow-blue-600/30 scale-105"
                  : "text-gray-500 hover:bg-gray-100 hover:text-blue-600"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="min-h-[500px]">
        {activeTab === 'general' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
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
              onCancel={() => setFormData(INITIAL_FORM)}
            />
          </div>
        )}

        {activeTab === 'education' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <EducationForm />
          </div>
        )}

        {activeTab === 'testScores' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <TestScoresForm />
          </div>
        )}

        {activeTab === 'background' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <BackgroundForm />
          </div>
        )}

        {activeTab === 'documents' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <DocumentUploadForm />
          </div>
        )}
      </div>
    </div>
  );
}
