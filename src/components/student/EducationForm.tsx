'use client'

import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { SchoolListItem, SchoolFormFields } from "./SchoolComponents";
import { GreForm, GmatForm, SatForm } from "./QualificationForms";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://admin.educationmalaysia.in/api'

// Simple toggle component for qualifications
const ToggleRow = ({ label, isOn, onToggle }: { label: string; isOn: boolean; onToggle: () => void }) => (
  <div className="flex items-center justify-between p-4 bg-white rounded-xl shadow-sm border border-gray-100 hover:border-blue-200 transition">
    <span className="font-semibold text-gray-800">{label}</span>
    <button
      onClick={onToggle}
      className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors duration-300 ${isOn ? "bg-blue-600" : "bg-gray-300"}`}
    >
      <div
        className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ${isOn ? "translate-x-6" : "translate-x-0"}`}
      />
    </button>
  </div>
);

export default function EducationForm() {
  // --- Education Summary State ---
  const [summaryData, setSummaryData] = useState({
    country_of_education: "",
    highest_level_of_education: "",
    grading_scheme: "",
    grade_average: "",
  });
  const [countriesData, setCountriesData] = useState<any[]>([]);
  const [levels, setLevels] = useState<any[]>([]);
  const [summaryErrors, setSummaryErrors] = useState<any>({});
  const [summaryLoading, setSummaryLoading] = useState(false);

  // --- Schools State ---
  const [schools, setSchools] = useState<any[]>([]);
  const [showSchoolForm, setShowSchoolForm] = useState(false);
  const [editingSchoolId, setEditingSchoolId] = useState<number | null>(null);
  const [schoolFormData, setSchoolFormData] = useState({
    country_of_institution: "",
    name_of_institution: "",
    level_of_education: "",
    primary_language_of_instruction: "",
    attended_institution_from: "",
    attended_institution_to: "",
    graduation_date: "",
    degree_name: "",
    graduated: "YES",
    graduated_from_this: false,
    address: "",
    city: "",
    state: "",
    zipcode: "",
  });
  const [schoolErrors, setSchoolErrors] = useState<any>({});
  const [schoolLoading, setSchoolLoading] = useState(false);

  // --- Qualifications State ---
  const [qualToggles, setQualToggles] = useState({ gre: false, gmat: false, sat: false });
  const [greData, setGreData] = useState({
    gre_exam_date: "",
    gre_v_score: "",
    gre_v_rank: "",
    gre_q_score: "",
    gre_q_rank: "",
    gre_w_score: "",
    gre_w_rank: "",
  });
  const [gmatData, setGmatData] = useState({
    gmat_exam_date: "",
    gmat_v_score: "",
    gmat_v_rank: "",
    gmat_q_score: "",
    gmat_q_rank: "",
    gmat_w_score: "",
    gmat_w_rank: "",
    gmat_ir_score: "",
    gmat_ir_rank: "",
    gmat_total_score: "",
    gmat_total_rank: "",
  });
  const [satData, setSatData] = useState({
    sat_exam_date: "",
    sat_reasoning_point: "",
    sat_subject_point: "",
  });
  const [qualErrors, setQualErrors] = useState<any>({ gre: {}, gmat: {}, sat: {} });

  // --- Initial Fetch ---
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        // Fetch meta data
        const [countriesRes, levelsRes, profileRes, schoolsRes] = await Promise.all([
          fetch(`${API_BASE}/countries`).then(r => r.json()),
          fetch(`${API_BASE}/levels`).then(r => r.json()),
          fetch(`${API_BASE}/student/profile`, { headers: { 'Authorization': `Bearer ${token}` } }).then(r => r.json()),
          fetch(`${API_BASE}/student/schools`, { headers: { 'Authorization': `Bearer ${token}` } }).then(r => r.json()),
        ]);

        setCountriesData(Array.isArray(countriesRes.data) ? countriesRes.data : countriesRes);
        setLevels(levelsRes.data || []);
        
        const student = profileRes.data?.student;
        if (student) {
          setSummaryData({
            country_of_education: student.country_of_education || "",
            highest_level_of_education: student.highest_level_of_education || "",
            grading_scheme: student.grading_scheme || "",
            grade_average: student.grade_average || "",
          });
          
          setGreData({
            gre_exam_date: student.gre_exam_date || "",
            gre_v_score: student.gre_v_score || "",
            gre_v_rank: student.gre_v_rank || "",
            gre_q_score: student.gre_q_score || "",
            gre_q_rank: student.gre_q_rank || "",
            gre_w_score: student.gre_w_score || "",
            gre_w_rank: student.gre_w_rank || "",
          });

          setGmatData({
            gmat_exam_date: student.gmat_exam_date || "",
            gmat_v_score: student.gmat_v_score || "",
            gmat_v_rank: student.gmat_v_rank || "",
            gmat_q_score: student.gmat_q_score || "",
            gmat_q_rank: student.gmat_q_rank || "",
            gmat_w_score: student.gmat_w_score || "",
            gmat_w_rank: student.gmat_w_rank || "",
            gmat_ir_score: student.gmat_ir_score || "",
            gmat_ir_rank: student.gmat_ir_rank || "",
            gmat_total_score: student.gmat_total_score || "",
            gmat_total_rank: student.gmat_total_rank || "",
          });

          setSatData({
            sat_exam_date: student.sat_exam_date || "",
            sat_reasoning_point: student.sat_reasoning_point || "",
            sat_subject_point: student.sat_subject_point || "",
          });
        }

        if (schoolsRes.data?.schools) {
          setSchools(schoolsRes.data.schools);
        }
      } catch (err) {
        console.error("Education form load error:", err);
      }
    };
    fetchData();
    
    // Load toggles from localStorage for persistence
    const savedToggles = localStorage.getItem("qualificationsToggle");
    if (savedToggles) {
      const parsed = JSON.parse(savedToggles);
      setQualToggles({
        gre: !!parsed.gre1,
        gmat: !!parsed.gre2,
        sat: !!parsed.sat
      });
    }
  }, []);

  // --- Handlers ---
  
  // Summary Handlers
  const handleSummary_Save = async () => {
    setSummaryLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/student/education-summary`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(summaryData)
      });
      if (res.ok) {
        toast.success("Education summary updated successfully! ✅");
      } else {
        toast.error("Failed to update summary.");
      }
    } catch (err) {
      toast.error("An error occurred.");
    } finally {
      setSummaryLoading(false);
    }
  };

  // School Handlers
  const fetchSchools = async () => {
    const token = localStorage.getItem("token");
    const res = await fetch(`${API_BASE}/student/schools`, { headers: { 'Authorization': `Bearer ${token}` } }).then(r => r.json());
    if (res.data?.schools) setSchools(res.data.schools);
  };

  const handleSchool_AddEdit = async () => {
    setSchoolLoading(true);
    const token = localStorage.getItem("token");
    const endpoint = editingSchoolId ? `${API_BASE}/student/update-school` : `${API_BASE}/student/add-school`;
    
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(editingSchoolId ? { ...schoolFormData, id: editingSchoolId } : schoolFormData)
      });
      
      if (res.ok) {
        toast.success(editingSchoolId ? "School updated! ✅" : "School added! ✅");
        setShowSchoolForm(false);
        setEditingSchoolId(null);
        setSchoolFormData({
          country_of_institution: "",
          name_of_institution: "",
          level_of_education: "",
          primary_language_of_instruction: "",
          attended_institution_from: "",
          attended_institution_to: "",
          graduation_date: "",
          degree_name: "",
          graduated: "YES",
          graduated_from_this: false,
          address: "",
          city: "",
          state: "",
          zipcode: "",
        });
        fetchSchools();
      } else {
        toast.error("Failed to save school details.");
      }
    } catch (err) {
      toast.error("An error occurred.");
    } finally {
      setSchoolLoading(false);
    }
  };

  const handleSchool_Delete = async (id: number) => {
    if (!window.confirm("Are you sure?")) return;
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${API_BASE}/student/delete-school/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        toast.success("School deleted! ✅");
        fetchSchools();
      }
    } catch (err) {
      toast.error("Delete failed.");
    }
  };

  const handleSchool_Expand = async (id: number) => {
    const token = localStorage.getItem("token");
    const res = await fetch(`${API_BASE}/student/school/${id}`, { headers: { 'Authorization': `Bearer ${token}` } }).then(r => r.json());
    if (res.data?.school) {
      setSchoolFormData(res.data.school);
      setEditingSchoolId(id);
      setShowSchoolForm(true);
    }
  };

  // Qualification Handlers
  const handleQual_Save = async (section: string) => {
    const token = localStorage.getItem("token");
    const endpoints: any = {
      gre: `${API_BASE}/student/update-gre-score`,
      gmat: `${API_BASE}/student/update-gmat-score`,
      sat: `${API_BASE}/student/update-sat-score`,
    };
    const payloads: any = { gre: greData, gmat: gmatData, sat: satData };

    try {
      const res = await fetch(endpoints[section], {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payloads[section])
      });
      if (res.ok) {
        toast.success(`${section.toUpperCase()} details saved! ✅`);
      } else {
        toast.error(`Failed to save ${section.toUpperCase()} details.`);
      }
    } catch (err) {
      toast.error("An error occurred.");
    }
  };

  const toggleQual = (key: 'gre' | 'gmat' | 'sat') => {
    setQualToggles(prev => {
      const next = { ...prev, [key]: !prev[key] };
      localStorage.setItem("qualificationsToggle", JSON.stringify({
        gre1: next.gre,
        gre2: next.gmat,
        sat: next.sat
      }));
      return next;
    });
  };

  return (
    <div className="space-y-12">
      {/* 1. Education Summary */}
      <section className="bg-gradient-to-br from-white to-gray-50 rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
        <div className="bg-blue-700 p-6 text-white">
          <h3 className="text-xl md:text-2xl font-bold flex items-center gap-3">
            🎓 Education Summary
          </h3>
          <p className="text-blue-100 text-sm opacity-90">Provide your latest education details for application profile</p>
        </div>
        
        <div className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Country */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Country of Education</label>
              <select
                value={summaryData.country_of_education}
                onChange={(e) => setSummaryData({ ...summaryData, country_of_education: e.target.value })}
                className="w-full border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 outline-none transition text-sm bg-white"
              >
                <option value="">Select Country</option>
                {countriesData.map((c) => (
                  <option key={c.id} value={c.name}>{c.name}</option>
                ))}
              </select>
            </div>

            {/* Level */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Highest Level</label>
              <select
                value={summaryData.highest_level_of_education}
                onChange={(e) => setSummaryData({ ...summaryData, highest_level_of_education: e.target.value })}
                className="w-full border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 outline-none transition text-sm bg-white"
              >
                <option value="">Select Level</option>
                {levels.map((l) => (
                  <option key={l.id} value={l.level}>{l.level}</option>
                ))}
              </select>
            </div>

            {/* Grading */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Grading Scheme</label>
              <select
                value={summaryData.grading_scheme}
                onChange={(e) => setSummaryData({ ...summaryData, grading_scheme: e.target.value })}
                className="w-full border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 outline-none transition text-sm bg-white"
              >
                <option value="">Select Scheme</option>
                <option value="Percentage">Percentage</option>
                <option value="CGPA">CGPA (10 pt)</option>
                <option value="GPA">GPA (4 pt)</option>
                <option value="Grade (A to E)">Grade (A to E)</option>
              </select>
            </div>

            {/* Average */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Grade Average</label>
              <input
                type="text"
                placeholder="Enter Average"
                value={summaryData.grade_average}
                onChange={(e) => setSummaryData({ ...summaryData, grade_average: e.target.value })}
                className="w-full border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 outline-none transition text-sm bg-white"
              />
            </div>
          </div>

          <div className="mt-8 flex justify-end gap-4">
            <button
              onClick={handleSummary_Save}
              disabled={summaryLoading}
              className="px-8 py-3 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold shadow-lg shadow-blue-700/20 transition active:scale-95 disabled:opacity-50"
            >
              {summaryLoading ? "Saving..." : "Save Summary"}
            </button>
          </div>
        </div>
      </section>

      {/* 2. Schools Attended */}
      <section className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h3 className="text-xl md:text-2xl font-bold text-gray-900">🏫 Schools Attended</h3>
            <p className="text-gray-500 text-sm">List all institutions you've previously attended</p>
          </div>
          <button
            onClick={() => {
              setEditingSchoolId(null);
              setSchoolFormData({
                country_of_institution: "",
                name_of_institution: "",
                level_of_education: "",
                primary_language_of_instruction: "",
                attended_institution_from: "",
                attended_institution_to: "",
                graduation_date: "",
                degree_name: "",
                graduated: "YES",
                graduated_from_this: false,
                address: "",
                city: "",
                state: "",
                zipcode: "",
              });
              setShowSchoolForm(true);
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-3 rounded-xl shadow-lg shadow-blue-600/20 transition flex items-center gap-2 active:scale-95 text-sm"
          >
            <span className="text-lg">＋</span> Add Institution
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {schools.length > 0 ? (
            schools.map((school) => (
              <SchoolListItem
                key={school.id}
                school={school}
                onExpand={handleSchool_Expand}
                onDelete={handleSchool_Delete}
              />
            ))
          ) : (
            <div className="col-span-full py-12 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-300">
              <p className="text-gray-400 font-medium italic">No schools added yet. Click above to add your first school.</p>
            </div>
          )}
        </div>

        {showSchoolForm && (
          <div className="mt-12 p-8 bg-blue-50/50 rounded-3xl border border-blue-100 shadow-inner relative animate-in fade-in zoom-in duration-300">
            <h4 className="text-lg font-bold text-blue-900 mb-8 flex items-center gap-2">
              {editingSchoolId ? "Edit School Details" : "Add New School"}
            </h4>
            
            <SchoolFormFields
              formData={schoolFormData}
              handleChange={(e) => {
                const { name, value, type, checked } = e.target;
                setSchoolFormData({ ...schoolFormData, [name]: type === 'checkbox' ? checked : value });
              }}
              handleBlur={() => {}}
              errors={schoolErrors}
            />

            <div className="mt-8 flex justify-end gap-3">
              <button
                onClick={() => setShowSchoolForm(false)}
                className="px-6 py-3 rounded-xl bg-white text-gray-700 font-bold border border-gray-200 hover:bg-gray-100 transition active:scale-95"
              >
                Cancel
              </button>
              <button
                onClick={handleSchool_AddEdit}
                disabled={schoolLoading}
                className="px-10 py-3 rounded-xl bg-blue-700 text-white font-bold shadow-lg shadow-blue-700/30 hover:bg-blue-800 transition active:scale-95 disabled:opacity-50"
              >
                {schoolLoading ? "Saving..." : editingSchoolId ? "Update Details" : "Save Institution"}
              </button>
            </div>
          </div>
        )}
      </section>

      {/* 3. Additional Qualifications */}
      <section className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
        <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">📜 Additional Qualifications</h3>
        <p className="text-gray-500 text-sm mb-8">Optional competitive exam scores (GRE, GMAT, SAT)</p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-6">
            <ToggleRow label="I have GRE Scores" isOn={qualToggles.gre} onToggle={() => toggleQual('gre')} />
            <ToggleRow label="I have GMAT Scores" isOn={qualToggles.gmat} onToggle={() => toggleQual('gmat')} />
            <ToggleRow label="I have SAT Scores" isOn={qualToggles.sat} onToggle={() => toggleQual('sat')} />
          </div>

          <div className="md:col-span-2">
            <GreForm
              isOpen={qualToggles.gre}
              data={greData}
              errors={qualErrors.gre}
              onChange={(e) => setGreData({ ...greData, [e.target.name]: e.target.value })}
              onBlur={() => {}}
              onSave={() => handleQual_Save('gre')}
              onCancel={() => toggleQual('gre')}
            />
            <GmatForm
              isOpen={qualToggles.gmat}
              data={gmatData}
              errors={qualErrors.gmat}
              onChange={(e) => setGmatData({ ...gmatData, [e.target.name]: e.target.value })}
              onBlur={() => {}}
              onSave={() => handleQual_Save('gmat')}
              onCancel={() => toggleQual('gmat')}
            />
            <SatForm
              isOpen={qualToggles.sat}
              data={satData}
              errors={qualErrors.sat}
              onChange={(e) => setSatData({ ...satData, [e.target.name]: e.target.value })}
              onBlur={() => {}}
              onSave={() => handleQual_Save('sat')}
              onCancel={() => toggleQual('sat')}
            />
            
            {!qualToggles.gre && !qualToggles.gmat && !qualToggles.sat && (
              <div className="h-full min-h-[200px] flex items-center justify-center border-2 border-dashed border-gray-100 rounded-3xl bg-gray-50/50">
                <p className="text-gray-400 text-sm italic">Toggle an exam to enter your scores</p>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
