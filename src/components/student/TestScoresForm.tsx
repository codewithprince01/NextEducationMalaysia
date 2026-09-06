'use client'

import React, { useRef, useState, useEffect } from "react";
import { toast } from "react-toastify";
import { validateSelect } from "@/utils/validation";
import { Award, Check } from "lucide-react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://admin.educationmalaysia.in/api'
const API_KEY = process.env.NEXT_PUBLIC_FRONTEND_API_KEY || ''

export default function TestScoresForm() {
  const testScoresRef = useRef<HTMLDivElement | null>(null);

  const [examType, setExamType] = useState("");
  const [examDate, setExamDate] = useState("");
  const [listening, setListening] = useState("");
  const [reading, setReading] = useState("");
  const [writing, setWriting] = useState("");
  const [speaking, setSpeaking] = useState("");
  const [overall, setOverall] = useState("");

  const [errors, setErrors] = useState<Record<string, string>>({});

  const hasExam =
    examType &&
    examType !== "I don't have this" &&
    examType !== "I dont have this" &&
    examType !== "I will provide this later";

  const scoreMaxByExam: Record<string, { listening?: number; reading?: number; writing?: number; speaking?: number; overall?: number }> = {
    TOEFL: { listening: 30, reading: 30, writing: 30, speaking: 30 },
    IELTS: { listening: 9, reading: 9, writing: 9, speaking: 9 },
    "Duolingo English Test": { overall: 160 },
    PTE: { listening: 90, reading: 90, writing: 90, speaking: 90, overall: 90 },
  };

  const validateScoreWithExamLimit = (field: "listening" | "reading" | "writing" | "speaking" | "overall", value: string) => {
    if (value === "" || value === null || value === undefined) {
      return `${field.charAt(0).toUpperCase() + field.slice(1)} score is required`;
    }

    const num = parseFloat(String(value));
    if (Number.isNaN(num)) return "Must be a valid number";

    const max = scoreMaxByExam[examType]?.[field];
    if (typeof max === "number" && num > max) {
      return `The ${field} score must not be greater than ${max}.`;
    }
    if (num < 0) return `The ${field} score must be at least 0.`;

    return "";
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    newErrors.examType = validateSelect(examType, "English exam type");

    if (hasExam) {
      if (!examDate) newErrors.examDate = "Exam date is required";
      const scoreFields: Array<{ key: "listening" | "reading" | "writing" | "speaking" | "overall"; value: string }> = [
        { key: "listening", value: listening },
        { key: "reading", value: reading },
        { key: "writing", value: writing },
        { key: "speaking", value: speaking },
        { key: "overall", value: overall },
      ];
      scoreFields.forEach(({ key, value }) => {
        const examLimits = scoreMaxByExam[examType] || {};
        if (Object.prototype.hasOwnProperty.call(examLimits, key)) {
          const err = validateScoreWithExamLimit(key, value);
          if (err) newErrors[key] = err;
        }
      });
    }

    setErrors(newErrors);
    return !Object.values(newErrors).some(Boolean);
  };

  const handleSave = async () => {
    if (!validateForm()) {
      toast.error("Please fill all required test score fields");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE}/student/update-test-score`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          ...(API_KEY ? { 'x-api-key': API_KEY } : {}),
        },
        body: JSON.stringify({
          english_exam_type: examType,
          date_of_exam: examDate,
          listening_score: listening,
          reading_score: reading,
          writing_score: writing,
          speaking_score: speaking,
          overall_score: overall,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        const backendErrors: Record<string, string> = {};
        if (data?.errors) {
          Object.keys(data.errors).forEach((key) => {
            const errorMessages = data.errors[key];
            const errorText = Array.isArray(errorMessages) ? errorMessages[0] : errorMessages;
            const fieldMap: Record<string, string> = {
              date_of_exam: "examDate",
              speaking_score: "speaking",
              listening_score: "listening",
              reading_score: "reading",
              writing_score: "writing",
              overall_score: "overall",
              english_exam_type: "examType",
            };
            backendErrors[fieldMap[key] || key] = errorText;
          });
          setErrors((prev) => ({ ...prev, ...backendErrors }));
          toast.error("Please fix the errors below");
          return;
        }
        toast.error(data?.message || "Failed to update test scores");
        return;
      }

      toast.success("Test scores updated successfully");
    } catch (error) {
      toast.error("Failed to update test scores");
    }
  };

  const handleCancel = () => {
    setExamType("");
    setExamDate("");
    setListening("");
    setReading("");
    setWriting("");
    setSpeaking("");
    setOverall("");
    setErrors({});
  };

  useEffect(() => {
    const fetchTestScores = async () => {
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
          setExamType(student.english_exam_type || "");
          setExamDate(student.date_of_exam || "");
          setListening(student.listening_score || "");
          setReading(student.reading_score || "");
          setWriting(student.writing_score || "");
          setSpeaking(student.speaking_score || "");
          setOverall(student.overall_score || "");
        }
      } catch (error) {
        console.error("Error fetching test scores:", error);
      }
    };

    fetchTestScores();
  }, []);

  const inputClass = (key: string) =>
    `w-full rounded-xl border px-3.5 py-2.5 text-sm transition-all outline-none ${
      errors[key]
        ? "border-rose-300 bg-rose-50/40 text-rose-900 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/15"
        : "border-slate-200 bg-slate-50/50 text-slate-800 hover:border-slate-300 focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-500/15"
    }`;

  return (
    <div ref={testScoresRef} className="w-full">
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 sm:p-7">
        <div className="flex items-center gap-3 pb-5 mb-6 border-b border-slate-100">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900">English Language Test Scores</h3>
            <p className="text-xs text-slate-500">Add your official standardized English proficiency exam results</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700">
              English Exam Type <span className="text-rose-500">*</span>
            </label>
            <select
              value={examType}
              onChange={(e) => {
                setExamType(e.target.value);
                setErrors({});
              }}
              className={inputClass("examType")}
            >
              <option value="">Select English Exam Type</option>
              <option value="IELTS">IELTS</option>
              <option value="TOEFL">TOEFL</option>
              <option value="PTE">PTE (Pearson)</option>
              <option value="Duolingo English Test">Duolingo English Test</option>
              <option value="I don't have this">I don't have this</option>
              <option value="I will provide this later">I will provide this later</option>
            </select>
            {errors.examType && <p className="text-rose-600 text-xs font-medium">{errors.examType}</p>}
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700">
              Exam Date {hasExam && <span className="text-rose-500">*</span>}
            </label>
            <input
              type="date"
              value={examDate}
              onChange={(e) => {
                setExamDate(e.target.value);
                setErrors((prev) => ({ ...prev, examDate: "" }));
              }}
              className={inputClass("examDate")}
            />
            {errors.examDate && <p className="text-rose-600 text-xs font-medium">{errors.examDate}</p>}
          </div>
        </div>

        {hasExam && (
          <div className="pt-5 border-t border-slate-100">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-4">
              Individual Band / Module Scores
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700">
                  Listening {scoreMaxByExam[examType]?.listening ? `(Max ${scoreMaxByExam[examType]?.listening})` : ""}
                </label>
                <input
                  type="text"
                  value={listening}
                  onChange={(e) => setListening(e.target.value)}
                  placeholder="0.0"
                  className={inputClass("listening")}
                />
                {errors.listening && <p className="text-rose-600 text-[11px] font-medium">{errors.listening}</p>}
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700">
                  Reading {scoreMaxByExam[examType]?.reading ? `(Max ${scoreMaxByExam[examType]?.reading})` : ""}
                </label>
                <input
                  type="text"
                  value={reading}
                  onChange={(e) => setReading(e.target.value)}
                  placeholder="0.0"
                  className={inputClass("reading")}
                />
                {errors.reading && <p className="text-rose-600 text-[11px] font-medium">{errors.reading}</p>}
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700">
                  Writing {scoreMaxByExam[examType]?.writing ? `(Max ${scoreMaxByExam[examType]?.writing})` : ""}
                </label>
                <input
                  type="text"
                  value={writing}
                  onChange={(e) => setWriting(e.target.value)}
                  placeholder="0.0"
                  className={inputClass("writing")}
                />
                {errors.writing && <p className="text-rose-600 text-[11px] font-medium">{errors.writing}</p>}
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700">
                  Speaking {scoreMaxByExam[examType]?.speaking ? `(Max ${scoreMaxByExam[examType]?.speaking})` : ""}
                </label>
                <input
                  type="text"
                  value={speaking}
                  onChange={(e) => setSpeaking(e.target.value)}
                  placeholder="0.0"
                  className={inputClass("speaking")}
                />
                {errors.speaking && <p className="text-rose-600 text-[11px] font-medium">{errors.speaking}</p>}
              </div>

              <div className="space-y-1.5 col-span-2 sm:col-span-1">
                <label className="block text-xs font-semibold text-slate-700">
                  Overall {scoreMaxByExam[examType]?.overall ? `(Max ${scoreMaxByExam[examType]?.overall})` : ""}
                </label>
                <input
                  type="text"
                  value={overall}
                  onChange={(e) => setOverall(e.target.value)}
                  placeholder="0.0"
                  className={inputClass("overall")}
                />
                {errors.overall && <p className="text-rose-600 text-[11px] font-medium">{errors.overall}</p>}
              </div>
            </div>
          </div>
        )}

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
            Save Test Scores
          </button>
        </div>
      </div>
    </div>
  );
}
