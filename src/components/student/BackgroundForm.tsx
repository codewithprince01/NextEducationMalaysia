'use client'

import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://admin.educationmalaysia.in/api'

export default function BackgroundForm() {
  const [refusedVisa, setRefusedVisa] = useState("");
  const [validPermit, setValidPermit] = useState("");
  const [visaNote, setVisaNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<any>({});

  useEffect(() => {
    const fetchBackgroundInfo = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;
        const response = await fetch(`${API_BASE}/student/profile`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }).then(r => r.json());
        
        const student = response.data?.student;
        if (student) {
          setRefusedVisa(student.refused_visa || "");
          setValidPermit(student.valid_study_permit || "");
          setVisaNote(student.visa_note || "");
        }
      } catch (error) {
        console.error("Error fetching background info:", error);
      }
    };
    fetchBackgroundInfo();
  }, []);

  const handleSave = async () => {
    setLoading(true);
    setErrors({});
    try {
      const token = localStorage.getItem("token");
      // Old project used query params for this POST request
      const url = `${API_BASE}/student/update-background-info?refused_visa=${encodeURIComponent(refusedVisa)}&valid_study_permit=${encodeURIComponent(validPermit)}&visa_note=${encodeURIComponent(visaNote)}`;
      
      const res = await fetch(url, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (res.ok) {
        toast.success("Background info updated successfully! 📝");
      } else {
        toast.error("Failed to update background information.");
      }
    } catch (error) {
      toast.error("An error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const inputClass = (field: string) =>
    `w-full border rounded-xl p-3 focus:ring-2 outline-none transition text-sm ${
      errors[field]
        ? "border-red-300 focus:border-red-500 focus:ring-red-100"
        : "border-gray-200 focus:ring-blue-500 focus:border-blue-500 bg-white"
    }`;

  const isNoteRequired = refusedVisa === "YES" || validPermit === "YES";

  return (
    <div className="bg-gradient-to-br from-white to-gray-50 rounded-3xl shadow-xl border border-gray-100 p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-blue-700 flex items-center gap-3">
          📝 Background Information
        </h2>
        <p className="text-gray-500 text-sm mt-1">Please answer the following visa-related questions accurately</p>
      </div>

      <div className="space-y-8">
        {/* Q1 */}
        <div className="space-y-3">
          <label className="block font-bold text-gray-700 text-sm">
            Have you been refused a visa from Canada, USA, UK, Australia, or any other country?
            <span className="text-red-500 ml-1 font-bold">*</span>
          </label>
          <select
            value={refusedVisa}
            onChange={(e) => setRefusedVisa(e.target.value)}
            className={inputClass("refusedVisa")}
          >
            <option value="">Select Option</option>
            <option value="YES">Yes</option>
            <option value="NO">No</option>
          </select>
        </div>

        {/* Q2 */}
        <div className="space-y-3">
          <label className="block font-bold text-gray-700 text-sm">
            Do you have a valid Study Permit / Visa?
            <span className="text-red-500 ml-1 font-bold">*</span>
          </label>
          <select
            value={validPermit}
            onChange={(e) => setValidPermit(e.target.value)}
            className={inputClass("validPermit")}
          >
            <option value="">Select Option</option>
            <option value="YES">Yes</option>
            <option value="NO">No</option>
          </select>
        </div>

        {/* Q3 */}
        <div className="space-y-3 animate-in fade-in duration-500">
          <label className="block font-bold text-gray-700 text-sm">
            If you answered "Yes" to any of the questions above, please provide more details below:
            {isNoteRequired && <span className="text-red-500 ml-1 font-bold">*</span>}
          </label>
          <textarea
            rows={4}
            value={visaNote}
            onChange={(e) => setVisaNote(e.target.value)}
            placeholder="Type details here..."
            className={`${inputClass("visaNote")} resize-none`}
          />
          {isNoteRequired && !visaNote.trim() && (
            <p className="text-amber-600 text-[10px] font-semibold italic">Details are recommended since you answered 'Yes' to a question.</p>
          )}
        </div>
      </div>

      <div className="mt-10 flex justify-end gap-4">
        <button
          onClick={() => {
            setRefusedVisa("");
            setValidPermit("");
            setVisaNote("");
          }}
          className="px-6 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold transition active:scale-95 text-sm"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          disabled={loading}
          className="px-10 py-2.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold shadow-lg shadow-blue-700/20 transition active:scale-95 disabled:opacity-50 text-sm"
        >
          {loading ? "Saving..." : "Save Information"}
        </button>
      </div>
    </div>
  );
}
