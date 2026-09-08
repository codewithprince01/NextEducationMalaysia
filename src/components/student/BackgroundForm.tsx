'use client'

import React, { useRef, useState, useEffect } from "react";
import { toast } from "react-toastify";
import { validateSelect } from "@/utils/validation";
import { ShieldCheck, Info, Check } from "lucide-react";

const API_BASE = (process.env.NEXT_PUBLIC_API_URL || '/api/v1').replace(/\/$/, '')
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

  const handleCancel = () => {
    setRefusedVisa("");
    setValidPermit("");
    setVisaNote("");
    setErrors({});
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
    `w-full rounded-xl border px-3.5 py-2.5 text-sm transition-all outline-none ${
      errors[key]
        ? "border-rose-300 bg-rose-50/40 text-rose-900 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/15"
        : "border-slate-200 bg-slate-50/50 text-slate-800 hover:border-slate-300 focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-500/15"
    }`;

  return (
    <div ref={backgroundRef} className="w-full">
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 sm:p-7">
        <div className="flex items-center gap-3 pb-5 mb-6 border-b border-slate-100">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900">Background Information</h2>
            <p className="text-xs text-slate-500">Provide immigration history and current study permit status</p>
          </div>
        </div>

        <div className="space-y-5">
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700">
              Have you been refused a visa from Canada, USA, UK, Australia or any other country?
              <span className="text-rose-500 ml-1">*</span>
            </label>
            <select
              value={refusedVisa}
              onChange={(e) => {
                setRefusedVisa(e.target.value);
                setErrors((prev) => ({ ...prev, refusedVisa: "" }));
              }}
              className={inputClass("refusedVisa")}
            >
              <option value="">Select an option</option>
              <option value="YES">Yes</option>
              <option value="NO">No</option>
            </select>
            {errors.refusedVisa && <p className="text-rose-600 text-xs font-medium">{errors.refusedVisa}</p>}
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
              <span>Do you have a valid Study Permit / Visa?</span>
              <span className="inline-flex items-center text-slate-400" title="Valid student visa or permit">
                <Info className="w-3.5 h-3.5" />
              </span>
            </label>
            <select
              value={validPermit}
              onChange={(e) => {
                setValidPermit(e.target.value);
                setErrors((prev) => ({ ...prev, validPermit: "" }));
              }}
              className={inputClass("validPermit")}
            >
              <option value="">Select an option</option>
              <option value="YES">Yes</option>
              <option value="NO">No</option>
            </select>
            {errors.validPermit && <p className="text-rose-600 text-xs font-medium">{errors.validPermit}</p>}
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700">
              If you answered "Yes" to any of the questions above, please provide more details below:
              {(refusedVisa === "YES" || validPermit === "YES") && <span className="text-rose-500 ml-1">*</span>}
            </label>
            <textarea
              rows={4}
              value={visaNote}
              onChange={(e) => {
                setVisaNote(e.target.value);
                setErrors((prev) => ({ ...prev, visaNote: "" }));
              }}
              placeholder="Provide visa application reference numbers, refusal dates, or details of your current study permit..."
              className={inputClass("visaNote")}
            />
            {errors.visaNote && <p className="text-rose-600 text-xs font-medium">{errors.visaNote}</p>}
          </div>
        </div>

        <div className="flex flex-wrap justify-end gap-3 pt-6 mt-6 border-t border-slate-100">
          <button
            type="button"
            onClick={handleCancel}
            className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs sm:text-sm transition"
          >
            Reset
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs sm:text-sm shadow-sm hover:shadow transition active:scale-95 flex items-center gap-2"
          >
            <Check className="w-4 h-4" />
            Save Background Info
          </button>
        </div>
      </div>
    </div>
  );
}
