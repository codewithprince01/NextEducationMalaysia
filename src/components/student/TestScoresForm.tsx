'use client'

import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://admin.educationmalaysia.in/api'

export default function TestScoresForm() {
  const [examType, setExamType] = useState("");
  const [examDate, setExamDate] = useState("");
  const [listening, setListening] = useState("");
  const [reading, setReading] = useState("");
  const [writing, setWriting] = useState("");
  const [speaking, setSpeaking] = useState("");
  const [overall, setOverall] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<any>({});

  useEffect(() => {
    const fetchTestScores = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;
        const response = await fetch(`${API_BASE}/student/profile`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }).then(r => r.json());
        
        const student = response.data?.student;
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

  const handleSave = async () => {
    setLoading(true);
    setErrors({});
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/student/update-test-score`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          english_exam_type: examType,
          date_of_exam: examDate,
          listening_score: listening,
          reading_score: reading,
          writing_score: writing,
          speaking_score: speaking,
          overall_score: overall,
        })
      });

      const data = await res.json();
      if (res.ok) {
        toast.success("Test scores updated successfully! 🎯");
      } else {
        if (data.errors) {
          setErrors(data.errors);
          toast.error("Please fix the validation errors.");
        } else {
          toast.error(data.message || "Failed to update test scores.");
        }
      }
    } catch (error) {
      toast.error("An error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const hasExam = examType && examType !== "I don't have this" && examType !== "I will provide this later";

  const inputClass = (field: string) =>
    `w-full border rounded-xl p-3 focus:ring-2 outline-none transition text-sm ${
      errors[field]
        ? "border-red-300 focus:border-red-500 focus:ring-red-100"
        : "border-gray-200 focus:ring-blue-500 focus:border-blue-500 bg-white"
    }`;

  return (
    <div className="bg-gradient-to-br from-white to-gray-50 rounded-3xl shadow-xl border border-gray-100 p-8 max-w-5xl mx-auto">
      <div className="mb-8 ">
        <h3 className="text-2xl font-bold text-blue-700 flex items-center gap-3">
          🎯 Test Scores
        </h3>
        <p className="text-gray-500 text-sm mt-1">Enter your latest English proficiency exam results</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Exam Type */}
        <div className="md:col-span-2 space-y-2">
          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">English Exam Type</label>
          <select
            value={examType}
            onChange={(e) => setExamType(e.target.value)}
            className={inputClass("english_exam_type")}
          >
            <option value="">Select English Exam Type</option>
            <option>I don't have this</option>
            <option>I will provide this later</option>
            <option>IELTS</option>
            <option>TOEFL</option>
            <option>PTE</option>
            <option>Duolingo English Test</option>
          </select>
          {errors.english_exam_type && <p className="text-red-500 text-[10px] font-medium">{errors.english_exam_type[0]}</p>}
        </div>

        {/* Date */}
        <div className="md:col-span-2 space-y-2">
          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Exam Date</label>
          <input
            type="date"
            value={examDate}
            onChange={(e) => setExamDate(e.target.value)}
            disabled={!hasExam}
            className={`${inputClass("date_of_exam")} disabled:bg-gray-100 disabled:cursor-not-allowed`}
          />
          {errors.date_of_exam && <p className="text-red-500 text-[10px] font-medium">{errors.date_of_exam[0]}</p>}
        </div>

        {/* Scores */}
        {["listening", "reading", "writing", "speaking", "overall"].map((score) => (
          <div key={score} className="space-y-2">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider capitalize">{score} Score</label>
            <input
              type="text"
              placeholder={`${score.charAt(0).toUpperCase() + score.slice(1)} Score`}
              value={(window as any)[score] || eval(score)} // Rough way to access state, better to use a data object
              onChange={(e) => {
                const val = e.target.value;
                if (score === 'listening') setListening(val);
                if (score === 'reading') setReading(val);
                if (score === 'writing') setWriting(val);
                if (score === 'speaking') setSpeaking(val);
                if (score === 'overall') setOverall(val);
              }}
              disabled={!hasExam}
              className={`${inputClass(`${score}_score`)} disabled:bg-gray-100 disabled:cursor-not-allowed`}
            />
            {errors[`${score}_score`] && <p className="text-red-500 text-[10px] font-medium">{errors[`${score}_score`][0]}</p>}
          </div>
        ))}
      </div>

      <div className="mt-10 flex justify-end gap-4">
        <button 
          onClick={() => {
            setExamType("");
            setExamDate("");
            setListening("");
            setReading("");
            setWriting("");
            setSpeaking("");
            setOverall("");
            setErrors({});
          }}
          className="px-6 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold transition active:scale-95 text-sm"
        >
          Reset
        </button>
        <button
          onClick={handleSave}
          disabled={loading}
          className="px-10 py-2.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold shadow-lg shadow-blue-700/20 transition active:scale-95 disabled:opacity-50 text-sm"
        >
          {loading ? "Saving..." : "Save Scores"}
        </button>
      </div>
    </div>
  );
}
