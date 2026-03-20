"use client"

import React, { useState, useEffect } from "react";
import { X, RefreshCw } from "lucide-react";
import axios from "axios";
import { CommonFields, CaptchaSection } from "./FormFields";
import { usePopupFormState } from "./usePopupFormState";
import SuccessView from "./SuccessView";

interface CompareFormProps {
  isOpen: boolean;
  onClose: () => void;
  universities: any[];
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://admin.educationmalaysia.in/api';

export default function CompareForm({ isOpen, onClose, universities }: CompareFormProps) {
  const [compareSelection, setCompareSelection] = useState({
    u1: "",
    u2: "",
    u3: "",
  });
  const [comparisonResult, setComparisonResult] = useState<any[] | null>(null);

  const {
    captcha,
    userInput,
    setUserInput,
    countriesData,
    phonecode,
    levels,
    loading,
    setLoading,
    showSuccess,
    setShowSuccess,
    formData,
    generateCaptcha,
    handleChange,
    handleCountryCodeChange,
    handleNationalityChange,
    onSuccessOk,
  } = usePopupFormState(isOpen, "compare", onClose);

  useEffect(() => {
    if (isOpen) {
      setCompareSelection({ u1: "", u2: "", u3: "" });
      setComparisonResult(null);
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Captcha validation
    const [num1, op, num2] = captcha.split(" ");
    let expected = 0;
    if (op === "+") expected = parseInt(num1) + parseInt(num2);
    if (op === "-") expected = parseInt(num1) - parseInt(num2);
    if (op === "*") expected = parseInt(num1) * parseInt(num2);

    if (parseInt(userInput) !== expected) {
      alert("❌ Wrong answer! Please solve the math problem correctly.");
      return;
    }

    setLoading(true);
    try {
      const selectedIds = [compareSelection.u1, compareSelection.u2, compareSelection.u3].filter(Boolean);
      const results = selectedIds.map(id => universities.find(u => String(u.id) === String(id)));
      
      // Submit lead to backend
      await axios.post(`${API_BASE}/contact-form`, {
        ...formData,
        message: `Comparison Request for: ${results.map(r => r?.name).join(", ")}`,
        requestfor: "comparison",
      });

      setComparisonResult(results);
      setShowSuccess(true);
    } catch (error) {
      console.error("Submission error:", error);
      alert("Failed to submit comparison request. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const uniSelect = (key: 'u1' | 'u2' | 'u3', label: string, required = true) => (
    <div className="flex flex-col gap-1">
      <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wide ml-1">
        {label}
      </label>
      <select
        required={required}
        value={compareSelection[key]}
        onChange={(e) => setCompareSelection({ ...compareSelection, [key]: e.target.value })}
        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm font-medium transition-all"
      >
        <option value="">Choose University</option>
        {universities?.map((u, i) => (
          <option key={i} value={u.id}>
            {u.name}
          </option>
        ))}
      </select>
    </div>
  );

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden relative animate-in zoom-in-95 duration-300">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-2 hover:bg-gray-100 rounded-full transition-colors z-10"
        >
          <X className="w-6 h-6 text-gray-400" />
        </button>

        <div className="p-6 md:p-8 max-h-[90vh] overflow-y-auto scrollbar-hide">
          <div className="text-center mb-6">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Compare Universities</h3>
            <p className="text-gray-500">Select up to 3 universities to compare their features</p>
          </div>

          {!showSuccess ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                {uniSelect("u1", "First University")}
                {uniSelect("u2", "Second University")}
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                {uniSelect("u3", "Third University (Optional)", false)}
                <div className="flex flex-col gap-1">
                   <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wide ml-1">Nationality</label>
                   <select
                      name="nationality"
                      value={formData.nationality}
                      onChange={handleNationalityChange}
                      className="border border-gray-300 p-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm"
                      required
                    >
                      <option value="">Select Nationality*</option>
                      {countriesData.map((country, idx) => (
                        <option key={idx} value={country.name}>{country.name}</option>
                      ))}
                    </select>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wide ml-1">Full Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter full name"
                    className="border border-gray-300 p-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm"
                    required
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wide ml-1">Email Address</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter email"
                    className="border border-gray-300 p-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm"
                    required
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wide ml-1">Mobile Number</label>
                <div className="flex gap-2">
                  <select
                    name="c_code"
                    value={formData.c_code}
                    onChange={handleCountryCodeChange}
                    className="border border-gray-300 rounded-lg p-2 bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm w-24"
                    required
                  >
                    <option value="">Code</option>
                    {phonecode.map((code, idx) => (
                      <option key={idx} value={code.phonecode}>+{code.phonecode}</option>
                    ))}
                  </select>
                  <input
                    type="text"
                    name="mobile"
                    value={formData.mobile}
                    onChange={handleChange}
                    placeholder="Phone number"
                    className="border border-gray-300 p-2 rounded-lg flex-1 focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm"
                    required
                  />
                </div>
              </div>

              <CaptchaSection
                captcha={captcha}
                userInput={userInput}
                setUserInput={setUserInput}
                generateCaptcha={generateCaptcha}
              />

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#003893] hover:bg-[#002966] text-white font-bold py-3.5 rounded-xl shadow-lg transition-all transform hover:scale-[1.02] disabled:opacity-50"
              >
                {loading ? "Processing..." : "Compare Universities"}
              </button>
            </form>
          ) : (
            <SuccessView
              formType="compare"
              onOk={onSuccessOk}
            />
          )}
        </div>
      </div>
    </div>
  );
}
