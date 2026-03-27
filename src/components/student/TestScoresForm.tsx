'use client'

import React, { useRef, useState, useEffect } from "react";
import { toast } from "react-toastify";
import { validateSelect } from "@/utils/validation";

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
      return `The ${field} score field must not be greater than ${max}.`;
    }
    if (num < 0) return `The ${field} score field must be at least 0.`;

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
      toast.error("Please select an exam type");
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
    `w-full border rounded-xl p-3 focus:ring-2 outline-none transition ${
      errors[key]
        ? "border-red-300 focus:border-red-500 focus:ring-red-100"
        : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
    }`;

  return (
    <div ref={testScoresRef} className="mb-10">
      <div className="w-full max-w-5xl mx-auto bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-lg border border-gray-200 p-4 md:p-8">
        <div className="mb-6">
          <h3 className="text-2xl font-semibold text-blue-700">🎯 Test Scores</h3>
          <p className="text-gray-500 text-sm mt-1">Enter your latest English exam scores</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="space-y-1 col-span-4 md:col-span-2">
            <select
              value={examType}
              onChange={(e) => {
                setExamType(e.target.value);
                setErrors({});
              }}
              className={inputClass("examType")}
            >
              <option value="">Select English Exam Type</option>
              <option>I don't have this</option>
              <option>I dont have this</option>
              <option>I will provide this later</option>
              <option>IELTS</option>
              <option>TOEFL</option>
              <option>PTE</option>
              <option>Duolingo English Test</option>
            </select>
            {errors.examType && <p className="text-red-600 text-xs ml-1 font-medium">{errors.examType}</p>}
          </div>

          <div className="col-span-4 md:col-span-2 space-y-1">
            <input
              type="date"
              value={examDate}
              onChange={(e) => {
                setExamDate(e.target.value);
                setErrors((prev) => ({ ...prev, examDate: "" }));
              }}
              className={inputClass("examDate")}
            />
            {errors.examDate && <p className="text-red-600 text-xs ml-1 font-medium">{errors.examDate}</p>}
          </div>

          <div className="col-span-4 md:col-span-1 space-y-1">
            <input type="text" value={listening} onChange={(e) => setListening(e.target.value)} placeholder="Listening Score" className={inputClass("listening")} />
            {errors.listening && <p className="text-red-600 text-xs ml-1 font-medium">{errors.listening}</p>}
          </div>
          <div className="col-span-4 md:col-span-1 space-y-1">
            <input type="text" value={reading} onChange={(e) => setReading(e.target.value)} placeholder="Reading Score" className={inputClass("reading")} />
            {errors.reading && <p className="text-red-600 text-xs ml-1 font-medium">{errors.reading}</p>}
          </div>
          <div className="col-span-4 md:col-span-1 space-y-1">
            <input type="text" value={writing} onChange={(e) => setWriting(e.target.value)} placeholder="Writing Score" className={inputClass("writing")} />
            {errors.writing && <p className="text-red-600 text-xs ml-1 font-medium">{errors.writing}</p>}
          </div>
          <div className="col-span-4 md:col-span-1 space-y-1">
            <input type="text" value={speaking} onChange={(e) => setSpeaking(e.target.value)} placeholder="Speaking Score" className={inputClass("speaking")} />
            {errors.speaking && <p className="text-red-600 text-xs ml-1 font-medium">{errors.speaking}</p>}
          </div>
          <div className="col-span-4 md:col-span-1 space-y-1">
            <input type="text" value={overall} onChange={(e) => setOverall(e.target.value)} placeholder="Overall Score" className={inputClass("overall")} />
            {errors.overall && <p className="text-red-600 text-xs ml-1 font-medium">{errors.overall}</p>}
          </div>
        </div>

        <div className="flex justify-end gap-4 mt-8">
          <button onClick={handleSave} className="px-6 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-md transition">
            Save
          </button>
          <button className="px-6 py-2 rounded-xl bg-gray-500 hover:bg-gray-700 text-white shadow-md transition">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
