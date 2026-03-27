'use client'

import React, { useRef, useState, useEffect } from "react";
import { toast } from "react-toastify";
import { validateSelect } from "@/utils/validation";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://admin.educationmalaysia.in/api'
const API_KEY = process.env.NEXT_PUBLIC_FRONTEND_API_KEY || ''

export default function BackgroundForm() {
  const backgroundRef = useRef<HTMLDivElement | null>(null);

  const [refusedVisa, setRefusedVisa] = useState("");
  const [validPermit, setValidPermit] = useState("");
  const [visaNote, setVisaNote] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    newErrors.refusedVisa = validateSelect(refusedVisa, "visa refusal status");
    newErrors.validPermit = validateSelect(validPermit, "study permit status");
    if ((refusedVisa === "YES" || validPermit === "YES") && !visaNote.trim()) {
      newErrors.visaNote = "Please provide details since you answered 'Yes' above";
    }

    setErrors(newErrors);
    return !Object.values(newErrors).some(Boolean);
  };

  const handleSave = async () => {
    if (!validateForm()) {
      toast.error("Please answer all required questions");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const url = `${API_BASE}/student/update-background-info?refused_visa=${encodeURIComponent(
        refusedVisa.toUpperCase(),
      )}&valid_study_permit=${encodeURIComponent(validPermit.toUpperCase())}&visa_note=${encodeURIComponent(visaNote)}`;

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          ...(API_KEY ? { 'x-api-key': API_KEY } : {}),
        },
      });

      const data = await response.json();
      if (!response.ok) {
        toast.error(data?.message || "Failed to update background information");
        return;
      }

      toast.success("Background information updated successfully!");
    } catch (error) {
      toast.error("Failed to update background information");
    }
  };

  useEffect(() => {
    const fetchBackgroundInfo = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(`${API_BASE}/student/profile`, {
          headers: {
            Authorization: `Bearer ${token}`,
            ...(API_KEY ? { 'x-api-key': API_KEY } : {}),
          },
        });
        const json = await response.json();
        const student = json?.data?.student;
        if (student) {
          setRefusedVisa(student.refused_visa || "");
          setValidPermit(student.valid_study_permit || "");
          setVisaNote(student.visa_note || "");
        }
      } catch (error) {
        console.error("Error fetching background information:", error);
      }
    };

    fetchBackgroundInfo();
  }, []);

  const inputClass = (key: string) =>
    `w-full border rounded-xl p-3 focus:ring-2 outline-none transition ${
      errors[key]
        ? "border-red-300 focus:border-red-500 focus:ring-red-100"
        : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
    }`;

  return (
    <div ref={backgroundRef} className="mb-10">
      <div className="w-full max-w-4xl mx-auto bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-lg border border-gray-200 p-4 md:p-8">
        <div className="mb-6">
          <h2 className="text-2xl font-semibold text-blue-700">Background Information</h2>
        </div>

        <div className="mb-6 space-y-1">
          <label className="block font-medium text-gray-700 mb-2">
            Have you been refused a visa from Canada, USA, UK, Australia more...?
            <span className="text-red-500">*</span>
          </label>
          <select
            value={refusedVisa}
            onChange={(e) => {
              setRefusedVisa(e.target.value);
              setErrors((prev) => ({ ...prev, refusedVisa: "" }));
            }}
            className={inputClass("refusedVisa")}
          >
            <option value="">Select</option>
            <option value="YES">Yes</option>
            <option value="NO">No</option>
          </select>
          {errors.refusedVisa && <p className="text-red-600 text-xs ml-1 font-medium">{errors.refusedVisa}</p>}
        </div>

        <div className="mb-6 space-y-1">
          <label className="font-medium text-gray-700 mb-2 flex items-center gap-2">
            Do you have a valid Study Permit / Visa?
            <span className="text-blue-500 cursor-pointer text-lg">i</span>
          </label>
          <select
            value={validPermit}
            onChange={(e) => {
              setValidPermit(e.target.value);
              setErrors((prev) => ({ ...prev, validPermit: "" }));
            }}
            className={inputClass("validPermit")}
          >
            <option value="">Select</option>
            <option value="YES">Yes</option>
            <option value="NO">No</option>
          </select>
          {errors.validPermit && <p className="text-red-600 text-xs ml-1 font-medium">{errors.validPermit}</p>}
        </div>

        <div className="mb-6 space-y-1">
          <label className="block font-medium text-gray-700 mb-2">
            If you answered "Yes" to any of the questions above, please provide more details below:
            {(refusedVisa === "YES" || validPermit === "YES") && <span className="text-red-500">*</span>}
          </label>
          <textarea
            rows={4}
            value={visaNote}
            onChange={(e) => {
              setVisaNote(e.target.value);
              setErrors((prev) => ({ ...prev, visaNote: "" }));
            }}
            placeholder="Enter details here..."
            className={inputClass("visaNote")}
          />
          {errors.visaNote && <p className="text-red-600 text-xs ml-1 font-medium">{errors.visaNote}</p>}
        </div>

        <div className="flex justify-end gap-4">
          <button onClick={handleSave} className="px-6 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-md transition">
            Save
          </button>
          <button className="px-6 py-2 rounded-xl bg-gray-500 hover:bg-gray-700 text-white shadow-md transition">Cancel</button>
        </div>
      </div>
    </div>
  );
}
