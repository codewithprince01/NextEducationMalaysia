'use client'

import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { SchoolListItem, SchoolFormFields } from "./SchoolComponents";
import { GreForm, GmatForm, SatForm } from "./QualificationForms";
import { validateRequired, validateScore, validateSelect, validateZipcode } from "@/utils/validation";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://admin.educationmalaysia.in/api'
const API_KEY = process.env.NEXT_PUBLIC_FRONTEND_API_KEY || ''

const ToggleRow = ({ label, isOn, onToggle }: { label: string; isOn: boolean; onToggle: () => void }) => (
  <div className="flex items-center justify-between">
    <span className="font-medium text-gray-800">{label}</span>
    <button
      onClick={onToggle}
      className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors duration-300 ${isOn ? "bg-blue-700" : "bg-gray-300"}`}
    >
      <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ${isOn ? "translate-x-6" : "translate-x-0"}`} />
    </button>
  </div>
);

export default function EducationForm() {
  const [countriesData, setCountriesData] = useState<any[]>([]);
  const [levels, setLevels] = useState<any[]>([]);

  const [country, setCountry] = useState("");
  const [level, setLevel] = useState("");
  const [gradingScheme, setGradingScheme] = useState("");
  const [gradeAverage, setGradeAverage] = useState("");

  const [schools, setSchools] = useState<any[]>([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [pendingDeleteSchoolId, setPendingDeleteSchoolId] = useState<number | null>(null);
  const [showSchoolForm, setShowSchoolForm] = useState(false);
  const [editingSchoolId, setEditingSchoolId] = useState<number | null>(null);
  const [schoolFormData, setSchoolFormData] = useState<any>({
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

  const [qualifications, setQualifications] = useState(() => {
    if (typeof window === 'undefined') return { gre1: false, gre2: false, sat: false };
    const saved = localStorage.getItem("qualificationsToggle");
    return saved ? JSON.parse(saved) : { gre1: false, gre2: false, sat: false };
  });

  const [greData, setGreData] = useState<any>({
    gre_exam_date: "", gre_v_score: "", gre_v_rank: "", gre_q_score: "", gre_q_rank: "", gre_w_score: "", gre_w_rank: "",
  });
  const [gmatData, setGmatData] = useState<any>({
    gmat_exam_date: "", gmat_v_score: "", gmat_v_rank: "", gmat_q_score: "", gmat_q_rank: "", gmat_w_score: "", gmat_w_rank: "", gmat_ir_score: "", gmat_ir_rank: "", gmat_total_score: "", gmat_total_rank: "",
  });
  const [satData, setSatData] = useState<any>({ sat_exam_date: "", sat_reasoning_point: "", sat_subject_point: "" });

  const [greErrors, setGreErrors] = useState<any>({});
  const [gmatErrors, setGmatErrors] = useState<any>({});
  const [satErrors, setSatErrors] = useState<any>({});
  const [summaryErrors, setSummaryErrors] = useState<any>({});
  const [schoolErrors, setSchoolErrors] = useState<any>({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const headers = { Authorization: `Bearer ${token}`, ...(API_KEY ? { 'x-api-key': API_KEY } : {}) };
        const metaHeaders = API_KEY ? { 'x-api-key': API_KEY } : undefined;

        const [countriesRes, levelsRes, profileRes, schoolsRes] = await Promise.all([
          fetch(`${API_BASE}/countries`, { headers: metaHeaders }).then((r) => r.json()),
          fetch(`${API_BASE}/levels`, { headers: metaHeaders }).then((r) => r.json()),
          fetch(`${API_BASE}/student/profile`, { headers }).then((r) => r.json()),
          fetch(`${API_BASE}/student/schools`, { headers }).then((r) => r.json()),
        ]);

        setCountriesData(Array.isArray(countriesRes?.data) ? countriesRes.data : Array.isArray(countriesRes) ? countriesRes : []);
        setLevels(Array.isArray(levelsRes?.data) ? levelsRes.data : []);

        const student = profileRes?.data?.student;
        if (student) {
          setCountry(student.country_of_education || "");
          setLevel(student.highest_level_of_education || "");
          setGradingScheme(student.grading_scheme || "");
          setGradeAverage(student.grade_average || "");

          setGreData({
            gre_exam_date: student.gre_exam_date || "", gre_v_score: student.gre_v_score || "", gre_v_rank: student.gre_v_rank || "", gre_q_score: student.gre_q_score || "", gre_q_rank: student.gre_q_rank || "", gre_w_score: student.gre_w_score || "", gre_w_rank: student.gre_w_rank || "",
          });
          setGmatData({
            gmat_exam_date: student.gmat_exam_date || "", gmat_v_score: student.gmat_v_score || "", gmat_v_rank: student.gmat_v_rank || "", gmat_q_score: student.gmat_q_score || "", gmat_q_rank: student.gmat_q_rank || "", gmat_w_score: student.gmat_w_score || "", gmat_w_rank: student.gmat_w_rank || "", gmat_ir_score: student.gmat_ir_score || "", gmat_ir_rank: student.gmat_ir_rank || "", gmat_total_score: student.gmat_total_score || "", gmat_total_rank: student.gmat_total_rank || "",
          });
          setSatData({ sat_exam_date: student.sat_exam_date || "", sat_reasoning_point: student.sat_reasoning_point || "", sat_subject_point: student.sat_subject_point || "" });
        }

        if (schoolsRes?.data?.schools) setSchools(schoolsRes.data.schools);
      } catch (error) {
        console.error("Education data fetch error:", error);
      }
    };

    fetchData();
  }, []);

  const validateSummary = () => {
    const next: any = {
      country: validateSelect(country, "country of education"),
      level: validateSelect(level, "highest level of education"),
      gradingScheme: validateSelect(gradingScheme, "grading scheme"),
      gradeAverage: validateRequired(gradeAverage, "grade average"),
    };
    setSummaryErrors(next);
    return !Object.values(next).some(Boolean);
  };

  const validateSchoolField = (field: string, currentData = schoolFormData) => {
    let error = "";
    switch (field) {
      case "country_of_institution":
        error = validateSelect(currentData.country_of_institution, "country of institution");
        break;
      case "name_of_institution":
        error = validateRequired(currentData.name_of_institution, "institution name");
        break;
      case "level_of_education":
        error = validateSelect(currentData.level_of_education, "level of education");
        break;
      case "primary_language_of_instruction":
        error = validateRequired(currentData.primary_language_of_instruction, "primary language");
        break;
      case "attended_institution_from":
        error = validateRequired(currentData.attended_institution_from, "start date");
        break;
      case "attended_institution_to":
        error = validateRequired(currentData.attended_institution_to, "end date");
        if (
          !error &&
          currentData.attended_institution_from &&
          currentData.attended_institution_to &&
          new Date(currentData.attended_institution_to) < new Date(currentData.attended_institution_from)
        ) {
          error = "End date must be after start date";
        }
        break;
      case "degree_name":
        error = validateRequired(currentData.degree_name, "degree name");
        break;
      case "address":
        error = validateRequired(currentData.address, "address");
        break;
      case "city":
        error = validateRequired(currentData.city, "city");
        break;
      case "zipcode":
        if (currentData.zipcode) error = validateZipcode(currentData.zipcode);
        break;
      default:
        break;
    }
    setSchoolErrors((prev: any) => ({ ...prev, [field]: error }));
    return error;
  };

  const validateSchoolForm = () => {
    const fieldsToValidate = [
      "country_of_institution",
      "name_of_institution",
      "level_of_education",
      "primary_language_of_instruction",
      "attended_institution_from",
      "attended_institution_to",
      "degree_name",
      "address",
      "city",
      "zipcode",
    ];
    const nextErrors: any = {};
    fieldsToValidate.forEach((field) => {
      nextErrors[field] = validateSchoolField(field);
    });
    setSchoolErrors(nextErrors);
    return !Object.values(nextErrors).some(Boolean);
  };

  const validateQualificationField = (section: "gre" | "gmat" | "sat", field: string) => {
    let error = "";
    const data = section === "gre" ? greData : section === "gmat" ? gmatData : satData;
    const value = data[field];

    if ((section === "gre" || section === "gmat") && field.endsWith("_exam_date")) {
      error = validateRequired(value, "exam date");
    } else if (field === "gmat_total_score" && value) {
      const n = parseFloat(value);
      if (Number.isNaN(n)) error = "Total score must be a number";
      else if (n > 800 || n < 200) error = "The gmat total score must be between 200 and 800";
    } else if (field.includes("score") || field.includes("rank") || field.includes("point")) {
      if (value) {
        error = validateScore(value);
        const maxByField: Record<string, number> = {
          gre_w_score: 6,
          gmat_v_score: 60,
          gmat_q_score: 60,
          gmat_w_score: 6,
          gmat_ir_score: 8,
        };
        const max = maxByField[field] ?? (field.includes("rank") ? 100 : null);
        if (!error && max && parseFloat(value) > max) {
          error = `The ${field.replace(/_/g, " ")} field must not be greater than ${max}`;
        }
      }
    }

    if (section === "gre") setGreErrors((p: any) => ({ ...p, [field]: error }));
    if (section === "gmat") setGmatErrors((p: any) => ({ ...p, [field]: error }));
    if (section === "sat") setSatErrors((p: any) => ({ ...p, [field]: error }));
    return error;
  };

  const validateGreForm = () => {
    const errs: any = {
      gre_exam_date: validateRequired(greData.gre_exam_date, "exam date"),
    };
    ["gre_v_score", "gre_q_score", "gre_v_rank", "gre_q_rank", "gre_w_score", "gre_w_rank"].forEach((f) => {
      if (greData[f]) {
        errs[f] = validateScore(greData[f]);
        const max = f === "gre_w_score" ? 6 : f.includes("rank") ? 100 : null;
        if (!errs[f] && max && parseFloat(greData[f]) > max) {
          errs[f] = `The ${f.replace(/_/g, " ")} field must not be greater than ${max}`;
        }
      }
    });
    setGreErrors(errs);
    return !Object.values(errs).some(Boolean);
  };

  const validateGmatForm = () => {
    const errs: any = {
      gmat_exam_date: validateRequired(gmatData.gmat_exam_date, "exam date"),
    };

    ["gmat_v_score", "gmat_q_score", "gmat_w_score", "gmat_ir_score"].forEach((f) => {
      if (gmatData[f]) {
        errs[f] = validateScore(gmatData[f]);
        const maxByField: Record<string, number> = {
          gmat_v_score: 60,
          gmat_q_score: 60,
          gmat_w_score: 6,
          gmat_ir_score: 8,
        };
        if (!errs[f] && parseFloat(gmatData[f]) > maxByField[f]) {
          errs[f] = `The ${f.replace(/_/g, " ")} must not be greater than ${maxByField[f]}`;
        }
      }
    });

    if (gmatData.gmat_total_score) {
      const n = parseFloat(gmatData.gmat_total_score);
      if (Number.isNaN(n)) errs.gmat_total_score = "Total score must be a number";
      else if (n > 800 || n < 200) errs.gmat_total_score = "The gmat total score must be between 200 and 800";
    }

    ["gmat_v_rank", "gmat_q_rank", "gmat_w_rank", "gmat_ir_rank", "gmat_total_rank"].forEach((f) => {
      if (gmatData[f]) {
        errs[f] = validateScore(gmatData[f]);
        if (!errs[f] && parseFloat(gmatData[f]) > 100) {
          errs[f] = `The ${f.replace(/_/g, " ")} must not be greater than 100`;
        }
      }
    });

    setGmatErrors(errs);
    return !Object.values(errs).some(Boolean);
  };

  const validateSatForm = () => {
    const errs: any = {};
    if (satData.sat_reasoning_point) errs.sat_reasoning_point = validateScore(satData.sat_reasoning_point);
    if (satData.sat_subject_point) errs.sat_subject_point = validateScore(satData.sat_subject_point);
    setSatErrors(errs);
    return !Object.values(errs).some(Boolean);
  };

  const handleSaveSummary = async () => {
    if (!validateSummary()) {
      toast.error("Please fill all required fields");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/student/education-summary`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          ...(API_KEY ? { 'x-api-key': API_KEY } : {}),
        },
        body: JSON.stringify({
          country_of_education: country,
          highest_level_of_education: level,
          grading_scheme: gradingScheme,
          grade_average: gradeAverage,
        }),
      });
      if (!res.ok) {
        toast.error("Failed to update education summary");
        return;
      }
      toast.success("Education summary updated successfully");
    } catch {
      toast.error("Failed to update education summary");
    }
  };

  const fetchSchools = async () => {
    const token = localStorage.getItem("token");
    const res = await fetch(`${API_BASE}/student/schools`, {
      headers: { Authorization: `Bearer ${token}`, ...(API_KEY ? { 'x-api-key': API_KEY } : {}) },
    }).then((r) => r.json());
    if (res?.data?.schools) setSchools(res.data.schools);
  };

  const handleSchoolAddOrEdit = async () => {
    if (!validateSchoolForm()) {
      toast.error("Please fill all required fields correctly");
      return;
    }
    try {
      const token = localStorage.getItem("token");
      const endpoint = editingSchoolId ? `${API_BASE}/student/update-school` : `${API_BASE}/student/add-school`;
      const payload = editingSchoolId ? { ...schoolFormData, id: editingSchoolId } : schoolFormData;

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          ...(API_KEY ? { 'x-api-key': API_KEY } : {}),
        },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        toast.error("Failed to save school details");
        return;
      }

      toast.success(editingSchoolId ? "School updated" : "School added");
      setShowSchoolForm(false);
      setEditingSchoolId(null);
      setSchoolErrors({});
      setSchoolFormData({
        country_of_institution: "", name_of_institution: "", level_of_education: "", primary_language_of_instruction: "", attended_institution_from: "", attended_institution_to: "", graduation_date: "", degree_name: "", graduated: "YES", graduated_from_this: false, address: "", city: "", state: "", zipcode: "",
      });
      fetchSchools();
    } catch {
      toast.error("Failed to save school details");
    }
  };

  const handleSchoolDelete = async (id: number) => {
    setPendingDeleteSchoolId(id);
    setShowDeleteConfirm(true);
  };

  const confirmSchoolDelete = async () => {
    if (!pendingDeleteSchoolId) return;
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/student/delete-school/${pendingDeleteSchoolId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}`, ...(API_KEY ? { 'x-api-key': API_KEY } : {}) },
      });
      if (!res.ok) {
        toast.error("Delete failed");
        return;
      }
      toast.success("School deleted");
      setShowDeleteConfirm(false);
      setPendingDeleteSchoolId(null);
      fetchSchools();
    } catch {
      toast.error("Delete failed");
    }
  };

  const handleSchoolExpand = async (id: number) => {
    const token = localStorage.getItem("token");
    const res = await fetch(`${API_BASE}/student/school/${id}`, {
      headers: { Authorization: `Bearer ${token}`, ...(API_KEY ? { 'x-api-key': API_KEY } : {}) },
    }).then((r) => r.json());

    if (res?.data?.school) {
      setSchoolFormData(res.data.school);
      setEditingSchoolId(id);
      setShowSchoolForm(true);
      setSchoolErrors({});
    }
  };

  const toggle = (key: 'gre1' | 'gre2' | 'sat') => {
    setQualifications((prev: any) => {
      const next = { ...prev, [key]: !prev[key] };
      localStorage.setItem("qualificationsToggle", JSON.stringify(next));
      return next;
    });
  };

  const saveQualification = async (
    endpoint: string,
    payload: any,
    label: string,
    section: "gre" | "gmat" | "sat",
    validate: () => boolean,
  ) => {
    if (!validate()) {
      toast.error("Please fill all required fields correctly");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}${endpoint}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          ...(API_KEY ? { 'x-api-key': API_KEY } : {}),
        },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data?.errors) {
          const backendErrors: any = {};
          Object.keys(data.errors).forEach((k) => {
            const msgs = data.errors[k];
            backendErrors[k] = Array.isArray(msgs) ? msgs[0] : msgs;
          });
          if (section === "gre") setGreErrors((p: any) => ({ ...p, ...backendErrors }));
          if (section === "gmat") setGmatErrors((p: any) => ({ ...p, ...backendErrors }));
          if (section === "sat") setSatErrors((p: any) => ({ ...p, ...backendErrors }));
          toast.error("Please fix the errors below");
          return;
        }
        toast.error(`Failed to update ${label}`);
        return;
      }
      toast.success(`${label} Score updated successfully`);
    } catch {
      toast.error(`Failed to update ${label}`);
    }
  };

  return (
    <>
      <div className="mb-10">
        <div className="w-full max-w-5xl mx-auto bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-lg border border-gray-200 p-4 md:p-8">
          <div className="mb-6">
            <h3 className="text-2xl font-semibold text-blue-700">Education Summary</h3>
            <p className="text-gray-500 text-sm mt-1">Provide your latest education details</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="space-y-1">
              <select value={country} onChange={(e) => { setCountry(e.target.value); setSummaryErrors((p: any) => ({ ...p, country: '' })); }} className="w-full border rounded-xl p-3 focus:ring-2 outline-none transition border-gray-300 focus:ring-blue-500 focus:border-blue-500">
                <option value="">Select Country of Education</option>
                {countriesData.map((item: any) => (
                  <option key={item.id || item.code || item.name} value={item.name}>{item.name}</option>
                ))}
              </select>
              {summaryErrors.country && <p className="text-red-600 text-xs ml-1 font-medium">{summaryErrors.country}</p>}
            </div>

            <div className="space-y-1">
              <select value={level} onChange={(e) => { setLevel(e.target.value); setSummaryErrors((p: any) => ({ ...p, level: '' })); }} className="w-full border rounded-xl p-3 focus:ring-2 outline-none transition border-gray-300 focus:ring-blue-500 focus:border-blue-500">
                <option value="">Select Highest Level</option>
                {levels.map((item: any) => (
                  <option key={item.id} value={item.level || item.name}>{item.level || item.name}</option>
                ))}
              </select>
              {summaryErrors.level && <p className="text-red-600 text-xs ml-1 font-medium">{summaryErrors.level}</p>}
            </div>

            <div className="space-y-1">
              <select value={gradingScheme} onChange={(e) => { setGradingScheme(e.target.value); setSummaryErrors((p: any) => ({ ...p, gradingScheme: '' })); }} className="w-full border rounded-xl p-3 focus:ring-2 outline-none transition border-gray-300 focus:ring-blue-500 focus:border-blue-500">
                <option value="">Select Grading Scheme</option>
                <option value="Percentage">Percentage</option>
                <option value="CGPA">CGPA</option>
                <option value="GPA">GPA</option>
                <option value="Grade (A to E)">Grade (A to E)</option>
              </select>
              {summaryErrors.gradingScheme && <p className="text-red-600 text-xs ml-1 font-medium">{summaryErrors.gradingScheme}</p>}
            </div>

            <div className="space-y-1">
              <input type="text" value={gradeAverage} onChange={(e) => { setGradeAverage(e.target.value); setSummaryErrors((p: any) => ({ ...p, gradeAverage: '' })); }} placeholder="Enter Grade Average" className="w-full border rounded-xl p-3 focus:ring-2 outline-none transition border-gray-300 focus:ring-blue-500 focus:border-blue-500" />
              {summaryErrors.gradeAverage && <p className="text-red-600 text-xs ml-1 font-medium">{summaryErrors.gradeAverage}</p>}
            </div>
          </div>

          <div className="flex justify-end gap-4 mt-8">
            <button onClick={handleSaveSummary} className="px-6 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-md transition">Save</button>
            <button className="px-6 py-2 rounded-xl bg-gray-500 hover:bg-gray-700 text-white shadow-md transition">Cancel</button>
          </div>
        </div>
      </div>

      <div className="w-full p-4 md:p-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Schools Attended</h2>
          <button
            onClick={() => {
              setEditingSchoolId(null);
              setSchoolFormData({
                country_of_institution: "", name_of_institution: "", level_of_education: "", primary_language_of_instruction: "", attended_institution_from: "", attended_institution_to: "", graduation_date: "", degree_name: "", graduated: "YES", graduated_from_this: false, address: "", city: "", state: "", zipcode: "",
              });
              setShowSchoolForm(true);
            }}
            className="bg-blue-700 hover:bg-blue-800 text-white px-4 py-2 rounded-md flex items-center"
          >
            Add Attended School <span className="ml-1">+</span>
          </button>
        </div>

        <div className="space-y-4">
          {schools.length > 0 ? (
            schools.map((school: any) => (
              <SchoolListItem key={school.id} school={school} onExpand={handleSchoolExpand} onDelete={handleSchoolDelete} />
            ))
          ) : (
            <p className="text-center text-gray-500">No schools have been added yet.</p>
          )}
        </div>

        {showSchoolForm && (
          <div className="mt-6 rounded-2xl p-8 shadow-lg bg-gradient-to-br from-white to-blue-50 border border-gray-100">
            <SchoolFormFields
              formData={schoolFormData}
              handleChange={(e: any) => {
                const { name, value, type, checked } = e.target;
                setSchoolFormData((prev: any) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
                if (schoolErrors[name]) {
                  setSchoolErrors((prev: any) => ({ ...prev, [name]: "" }));
                }
              }}
              handleBlur={(field: string) => validateSchoolField(field)}
              errors={schoolErrors}
            />

            <div className="mt-8 flex gap-4">
              <button onClick={handleSchoolAddOrEdit} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl shadow-md transition">
                Save
              </button>
              <button onClick={() => setShowSchoolForm(false)} className="bg-gray-700 hover:bg-black text-white px-6 py-2.5 rounded-xl shadow-md transition">
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="p-4 md:p-8">
        <h2 className="text-lg font-semibold mb-4">Additional Qualifications</h2>
        <div className="space-y-6 p-4 rounded-lg">
          <div className="p-4 rounded-md bg-white shadow-sm">
            <ToggleRow label="I Have GRE Exam Scores" isOn={qualifications.gre1} onToggle={() => toggle('gre1')} />
            <GreForm
              isOpen={qualifications.gre1}
              data={greData}
              errors={greErrors}
              onChange={(e) => {
                setGreData((prev: any) => ({ ...prev, [e.target.name]: e.target.value }));
                if (greErrors[e.target.name]) {
                  setGreErrors((prev: any) => ({ ...prev, [e.target.name]: "" }));
                }
              }}
              onBlur={(section, field) => validateQualificationField(section as "gre", field)}
              onSave={() => saveQualification('/student/update-gre-score', greData, 'GRE', "gre", validateGreForm)}
              onCancel={() => toggle('gre1')}
            />
          </div>

          <div className="p-4 rounded-md bg-white shadow-sm">
            <ToggleRow label="I Have GMAT Exam Scores" isOn={qualifications.gre2} onToggle={() => toggle('gre2')} />
            <GmatForm
              isOpen={qualifications.gre2}
              data={gmatData}
              errors={gmatErrors}
              onChange={(e) => {
                setGmatData((prev: any) => ({ ...prev, [e.target.name]: e.target.value }));
                if (gmatErrors[e.target.name]) {
                  setGmatErrors((prev: any) => ({ ...prev, [e.target.name]: "" }));
                }
              }}
              onBlur={(section, field) => validateQualificationField(section as "gmat", field)}
              onSave={() => saveQualification('/student/update-gmat-score', gmatData, 'GMAT', "gmat", validateGmatForm)}
              onCancel={() => toggle('gre2')}
            />
          </div>

          <div className="p-4 rounded-md bg-white shadow-sm">
            <ToggleRow label="I Have SAT Exam Scores" isOn={qualifications.sat} onToggle={() => toggle('sat')} />
            <SatForm
              isOpen={qualifications.sat}
              data={satData}
              errors={satErrors}
              onChange={(e) => {
                setSatData((prev: any) => ({ ...prev, [e.target.name]: e.target.value }));
                if (satErrors[e.target.name]) {
                  setSatErrors((prev: any) => ({ ...prev, [e.target.name]: "" }));
                }
              }}
              onBlur={(section, field) => validateQualificationField(section as "sat", field)}
              onSave={() => saveQualification('/student/update-sat-score', satData, 'SAT', "sat", validateSatForm)}
              onCancel={() => toggle('sat')}
            />
          </div>
        </div>
      </div>

      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900">Delete School</h3>
            <p className="mt-2 text-sm text-gray-600">
              Are you sure you want to delete this school record?
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setPendingDeleteSchoolId(null);
                }}
                className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={confirmSchoolDelete}
                className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
