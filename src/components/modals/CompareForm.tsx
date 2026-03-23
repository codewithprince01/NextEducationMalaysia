"use client";

import { useEffect, useMemo, useState } from "react";
import ModalWrapper from "./UniversityForms/ModalWrapper";
import { CaptchaWidget } from "./UniversityForms/Fields";

type University = {
  id?: number | string;
  _id?: number | string;
  uname?: string | null;
  name?: string | null;
  city?: string | null;
  state?: string | null;
  established_year?: string | number | null;
  rating?: string | number | null;
  qs_rank?: string | number | null;
  active_programs_count?: number | null;
  click?: number | null;
  institute_type?: { type?: string | null } | string | null;
  rank?: number | string | null;
};

interface CompareFormProps {
  isOpen: boolean;
  onClose: () => void;
  universities: University[];
}

const COUNTRY_CODES: Record<string, string> = {
  Afghanistan: "+93",
  Bangladesh: "+880",
  China: "+86",
  India: "+91",
  Indonesia: "+62",
  Nepal: "+977",
  Pakistan: "+92",
  Philippines: "+63",
  "Sri Lanka": "+94",
  Thailand: "+66",
  Vietnam: "+84",
  Other: "",
};

type Selection = { u1: string; u2: string; u3: string };
type CaptchaQ = { num1: number; num2: number; answer: number };

export default function CompareForm({ isOpen, onClose, universities }: CompareFormProps) {
  const [captchaQuestion, setCaptchaQuestion] = useState<CaptchaQ>({ num1: 0, num2: 0, answer: 0 });
  const [captchaInput, setCaptchaInput] = useState("");
  const [captchaError, setCaptchaError] = useState(false);
  const [compareSelection, setCompareSelection] = useState<Selection>({ u1: "", u2: "", u3: "" });
  const [comparisonResult, setComparisonResult] = useState<University[] | null>(null);
  const [compareLoading, setCompareLoading] = useState(false);
  const [nationality, setNationality] = useState("");
  const [countryCode, setCountryCode] = useState("");

  const filteredUniversities = useMemo(() => (Array.isArray(universities) ? universities.filter((u) => !!u?.name) : []), [universities]);

  const generateCaptcha = () => {
    const n1 = Math.floor(Math.random() * 10) + 1;
    const n2 = Math.floor(Math.random() * 10) + 1;
    setCaptchaQuestion({ num1: n1, num2: n2, answer: n1 + n2 });
    setCaptchaInput("");
    setCaptchaError(false);
  };

  useEffect(() => {
    if (!isOpen) return;
    generateCaptcha();
    setCompareSelection({ u1: "", u2: "", u3: "" });
    setComparisonResult(null);
    setNationality("");
    setCountryCode("");
  }, [isOpen]);

  const handleNationalityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setNationality(value);
    if (COUNTRY_CODES[value]) setCountryCode(COUNTRY_CODES[value]);
  };

  const handleCountryCodeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setCountryCode(value);
    const matched = Object.keys(COUNTRY_CODES).find((key) => COUNTRY_CODES[key] === value);
    if (matched) setNationality(matched);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (parseInt(captchaInput || "0", 10) !== captchaQuestion.answer) {
      setCaptchaError(true);
      return;
    }

    const selected = [compareSelection.u1, compareSelection.u2, compareSelection.u3].filter(Boolean);
    const baseSelectedRaw = selected
      .map((id) => filteredUniversities.find((u) => String(u.id ?? u._id ?? u.name) === String(id)))
      .filter(Boolean) as University[];
    const baseSelected: University[] = [];
    const seen = new Set<string>();
    for (const u of baseSelectedRaw) {
      const key = String(u.id ?? u._id ?? u.uname ?? u.name ?? "");
      if (!key || seen.has(key)) continue;
      seen.add(key);
      baseSelected.push(u);
    }

    if (baseSelected.length < 2) {
      alert("Please select at least 2 different universities.");
      return;
    }
    const selectedUnames = baseSelected.map((u) => u?.uname).filter(Boolean) as string[];

    if (selectedUnames.length === 0) {
      setComparisonResult(baseSelected);
      return;
    }

    setCompareLoading(true);
    try {
      const q = encodeURIComponent(selectedUnames.join(","));
      const res = await fetch(`/api/v1/university-compare?unames=${q}`, { cache: "no-store" });
      const json = await res.json().catch(() => null);
      const apiRows = Array.isArray(json?.data) ? (json.data as University[]) : [];
      setComparisonResult(apiRows.length ? apiRows : baseSelected);
    } catch {
      setComparisonResult(baseSelected);
    } finally {
      setCompareLoading(false);
    }
  };

  if (!isOpen) return null;

  const uniSelect = (key: keyof Selection, label: string, required = true) => (
    <div className="space-y-1">
      <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wide ml-1">{label}</label>
      <select
        required={required}
        value={compareSelection[key]}
        onChange={(e) => setCompareSelection({ ...compareSelection, [key]: e.target.value })}
        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none text-sm text-gray-800 font-medium appearance-none"
      >
        <option value="">Choose University</option>
        {filteredUniversities.map((u, i) => (
          <option key={i} value={String(u.id ?? u._id ?? u.name)}>
            {u.name}
          </option>
        ))}
      </select>
    </div>
  );

  const getType = (u: University) => {
    if (typeof u?.institute_type === "string") return u.institute_type;
    return u?.institute_type?.type || "N/A";
  };

  const formatRating = (u: University) => {
    const val = u?.rating;
    if (val === null || val === undefined || val === "") return "N/A";
    const num = Number(val);
    return Number.isFinite(num) ? num.toFixed(1) : String(val);
  };

  const rows: { label: string; getValue: (u: University) => string }[] = [
    {
      label: "City / State",
      getValue: (u) => {
        const raw = [u?.city, u?.state].filter(Boolean).join(", ");
        if (!raw) return "N/A";
        const parts = raw
          .split(",")
          .map((p) => p.trim())
          .filter(Boolean);
        const out: string[] = [];
        const seenParts = new Set<string>();
        for (const p of parts) {
          const key = p.toLowerCase();
          if (seenParts.has(key)) continue;
          seenParts.add(key);
          out.push(p);
        }
        return out.join(", ");
      },
    },
    { label: "Institute Type", getValue: (u) => getType(u) },
    { label: "Established Year", getValue: (u) => String(u?.established_year ?? "N/A") },
    { label: "QS Rank", getValue: (u) => String(u?.qs_rank ?? "N/A") },
    { label: "Rating", getValue: (u) => formatRating(u) },
    { label: "Programs", getValue: (u) => String(u?.active_programs_count ?? "N/A") },
    { label: "Views", getValue: (u) => String(u?.click ?? "N/A") },
  ];

  return (
    <ModalWrapper open={isOpen} onClose={onClose} wide>
      <div className="w-full px-2">
        <div className="text-center mb-5">
          <h3 className="text-lg md:text-2xl font-bold text-gray-900 mb-2">Compare Universities</h3>
          <p className="text-gray-500 text-sm md:text-base">Select up to 3 universities to compare their features</p>
        </div>

        {!comparisonResult ? (
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="grid md:grid-cols-2 gap-3">
              {uniSelect("u1", "Select First University")}
              {uniSelect("u2", "Select Second University")}
            </div>

            <div className="grid md:grid-cols-2 gap-3">
              {uniSelect("u3", "Select Third University (Optional)", false)}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wide ml-1">Nationality</label>
                <select
                  name="nationality"
                  required
                  value={nationality}
                  onChange={handleNationalityChange}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none text-sm text-gray-800 font-medium appearance-none"
                >
                  <option value="">Select Nationality</option>
                  {Object.keys(COUNTRY_CODES).map((country) => (
                    <option key={country} value={country}>
                      {country}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wide ml-1">Full Name</label>
                <input
                  type="text"
                  name="firstName"
                  required
                  placeholder="Enter your full name"
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none text-sm text-gray-800 placeholder:text-gray-400 font-medium"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wide ml-1">Your Email</label>
                <input
                  type="email"
                  name="email"
                  required
                  placeholder="Enter your email"
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none text-sm text-gray-800 placeholder:text-gray-400 font-medium"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wide ml-1">Phone Number</label>
              <div className="flex gap-2">
                <select
                  name="countryCode"
                  required
                  value={countryCode}
                  onChange={handleCountryCodeChange}
                  className="px-2 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white w-24 text-sm appearance-none"
                >
                  <option value="">Code</option>
                  {Object.entries(COUNTRY_CODES).map(([country, code]) => (
                    <option key={country} value={code}>
                      {code}
                    </option>
                  ))}
                </select>
                <input
                  type="tel"
                  name="phone"
                  required
                  placeholder="Enter your mobile number"
                  className="flex-1 px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wide ml-1">
                Comparison Criteria (Optional)
              </label>
              <textarea
                name="comparisonCriteria"
                rows={3}
                placeholder="What specific aspects would you like to compare?"
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none text-sm text-gray-800 placeholder:text-gray-400 font-medium resize-none"
              />
            </div>

            <CaptchaWidget
              captchaQuestion={captchaQuestion}
              captchaInput={captchaInput}
              setCaptchaInput={setCaptchaInput}
              captchaError={captchaError}
              setCaptchaError={setCaptchaError}
              generateCaptcha={generateCaptcha}
              accentColor="blue"
            />

            <button
              type="submit"
              disabled={compareLoading}
              className={`w-full font-bold py-3.5 rounded-xl shadow-md transition-all ${
                compareLoading
                  ? "bg-gray-400 text-white cursor-not-allowed"
                  : "bg-linear-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white"
              }`}
            >
              {compareLoading ? "Preparing Comparison..." : "Compare Universities"}
            </button>
          </form>
        ) : (
          <div>
            <p className="text-center text-green-600 font-bold mb-4">Comparison ready</p>
            <div className="overflow-x-auto rounded-xl border border-gray-200">
              <table className="w-full table-fixed bg-white">
                <thead>
                  <tr className="bg-blue-50">
                    <th className="px-4 py-3 text-left text-sm font-bold text-gray-700 border-b border-gray-200 w-[180px]">Criteria</th>
                    {comparisonResult.map((u, i) => (
                      <th key={i} className="px-4 py-3 text-left text-sm font-bold text-blue-800 border-b border-gray-200">
                        {u?.name || "University"}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, rowIdx) => (
                    <tr key={row.label} className={rowIdx % 2 === 0 ? "bg-white" : "bg-gray-50/60"}>
                      <td className="px-4 py-3 text-sm font-semibold text-gray-800 border-b border-gray-100">{row.label}</td>
                      {comparisonResult.map((u, colIdx) => (
                        <td key={`${row.label}-${colIdx}`} className="px-4 py-3 text-sm text-gray-700 border-b border-gray-100">
                          {row.getValue(u)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <button
                onClick={() => setComparisonResult(null)}
                className="w-full py-3 border border-blue-200 rounded-xl text-blue-700 font-semibold hover:bg-blue-50"
                type="button"
              >
                Compare Again
              </button>
              <button
                onClick={onClose}
                className="w-full py-3 border border-gray-200 rounded-xl text-gray-600 font-semibold hover:bg-gray-50"
                type="button"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </ModalWrapper>
  );
}
