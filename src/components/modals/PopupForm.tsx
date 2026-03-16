"use client"

import React from "react";
import Image from "next/image";
import { X } from "lucide-react";
import { usePopupFormState } from "./usePopupFormState";
import SuccessView from "./SuccessView";
import { CommonFields, CounsellingFields, CaptchaSection } from "./FormFields";
import axios from "axios";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://admin.educationmalaysia.in/api';
const IMAGE_BASE = process.env.NEXT_PUBLIC_IMAGE_BASE_URL || 'https://admin.educationmalaysia.in';

interface PopupFormProps {
  isOpen: boolean;
  onClose: () => void;
  universityData: any;
  formType?: "brochure" | "counselling" | "apply" | "fee";
}

const PopupForm: React.FC<PopupFormProps> = ({
  isOpen,
  onClose,
  universityData,
  formType = "brochure",
}) => {
  const {
    captcha,
    userInput,
    setUserInput,
    countriesData,
    phonecode,
    levels,
    courseCategories,
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
  } = usePopupFormState(isOpen, formType, onClose);

  const formTitle =
    formType === "counselling"
      ? "Book Your Counselling Session"
      : formType === "apply"
        ? "Apply For This Course"
        : formType === "fee"
          ? "Download Fee Structure"
          : "Register Now To Download Brochure";

  const submitButtonText =
    formType === "counselling"
      ? "Book Session Now"
      : formType === "apply"
        ? "Submit Application"
        : formType === "fee"
          ? "Download Fee Structure"
          : "Download Brochure";

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formValues = new FormData(e.currentTarget);

    try {
      // Simple captcha validation (supports +, -, *)
      const [n1, op, n2] = captcha.split(" ");
      let correctAnswer;
      if (op === "+") correctAnswer = parseInt(n1) + parseInt(n2);
      else if (op === "-") correctAnswer = parseInt(n1) - parseInt(n2);
      else correctAnswer = parseInt(n1) * parseInt(n2);

      if (parseInt(userInput) !== correctAnswer) {
        alert("Invalid captcha answer");
        generateCaptcha();
        setUserInput("");
        return;
      }
    } catch {
      alert("Captcha error");
      generateCaptcha();
      setUserInput("");
      return;
    }

    setLoading(true);

    try {
      const endpoint =
        formType === "counselling"
          ? "/inquiry/book-session"
          : "/inquiry/brochure-request";

      const submitData: any = {
        name: formValues.get("name")?.toString().trim(),
        email: formValues.get("email")?.toString().trim(),
        country_code: formValues
          .get("c_code")
          ?.toString()
          .replace("+", "")
          .trim(),
        mobile: formValues.get("mobile")?.toString().trim(),
        nationality: formValues.get("nationality")?.toString().trim(),
        highest_qualification: formValues
          .get("highest_qualification")
          ?.toString()
          .trim(),
        interested_course_category: formValues
          .get("interested_course_category")
          ?.toString()
          .trim(),
        university_id: universityData?.id || universityData?.university_id,
        requestfor:
          formType === "counselling"
            ? "counselling"
            : formType === "fee"
              ? "fees"
              : "brochure",
        source_path: typeof window !== "undefined" ? window.location.href : "",
      };

      if (formType === "counselling") {
        submitData.preferred_date = formValues
          .get("preferred_date")
          ?.toString()
          .trim();
        submitData.time_zone = formValues.get("time_zone")?.toString().trim();
        submitData.preferred_time = formValues
          .get("preferred_time")
          ?.toString()
          .trim();
        submitData.message = formValues.get("message")?.toString().trim();
      }

      await axios.post(`${API_BASE}${endpoint}`, submitData);
      setShowSuccess(true);
    } catch (error: any) {
      console.error("❌ Submission Failed:", error);
      let errorMsg = "Something went wrong, please try again.";
      if (error.response?.data?.errors) {
        const errors = error.response.data.errors;
        errorMsg = `Please fix the following:\n${Object.values(errors).flat().join("\n")}`;
      } else if (error.response?.data?.message) {
        errorMsg = error.response.data.message;
      }
      alert(errorMsg);
      generateCaptcha();
      setUserInput("");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const logoUrl = universityData?.logo_path 
    ? (universityData.logo_path.startsWith("http") 
        ? universityData.logo_path 
        : `${IMAGE_BASE}${universityData.logo_path}`)
    : null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/60 z-9999 px-4">
      {showSuccess ? (
        <SuccessView formType={formType} onOk={onSuccessOk} />
      ) : (
        <div className="bg-white w-full max-w-2xl max-h-[90vh] rounded-2xl shadow-2xl p-4 relative flex flex-col overflow-y-auto">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-600 hover:text-red-500 transition z-10 cursor-pointer"
          >
            <X size={28} />
          </button>

          <div className="w-full bg-gray-50 rounded-xl shadow-inner p-4">
            <div className="flex flex-col items-center mb-4">
              {logoUrl && (
                <div className="relative w-20 h-20 mb-2">
                  <Image
                    src={logoUrl}
                    alt={universityData.name || "University Logo"}
                    fill
                    className="object-contain"
                  />
                </div>
              )}
              <h2
                className={`text-xl font-bold text-center ${formType === "counselling" ? "text-green-700" : "text-blue-700"}`}
              >
                {formTitle}
              </h2>
              <p className="text-gray-600 text-sm mb-2 text-center">
                {universityData?.name}
              </p>
            </div>

            <form className="grid grid-cols-1 md:grid-cols-2 gap-4" onSubmit={handleSubmit}>
              <CommonFields
                formData={formData}
                handleChange={handleChange}
                handleCountryCodeChange={handleCountryCodeChange}
                handleNationalityChange={handleNationalityChange}
                phonecode={phonecode}
                countriesData={countriesData}
                levels={levels}
              />

              {formType === "counselling" ? (
                <CounsellingFields
                  formData={formData}
                  handleChange={handleChange}
                  courseCategories={courseCategories}
                />
              ) : (
                <select
                  name="interested_course_category"
                  value={formData.interested_course_category}
                  onChange={handleChange}
                  className="border border-gray-300 p-2 rounded-lg col-span-1 md:col-span-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  required
                >
                  <option value="">Interested Course Category*</option>
                  {courseCategories.map((category, idx) => (
                    <option key={idx} value={category.name}>
                      {category.name}
                    </option>
                  ))}
                </select>
              )}

              <CaptchaSection
                captcha={captcha}
                userInput={userInput}
                setUserInput={setUserInput}
                generateCaptcha={generateCaptcha}
              />

              <p className="text-xs col-span-1 md:col-span-2 text-gray-500 mt-1">
                By Submitting This Form, You Accept And Agree To Our{" "}
                <span className="text-blue-600 cursor-pointer hover:underline">
                  Terms Of Use.
                </span>
              </p>

              <button
                type="submit"
                disabled={loading}
                className={`${
                  formType === "counselling"
                    ? "bg-linear-to-r from-green-600 to-green-800"
                    : "bg-linear-to-r from-blue-600 to-blue-800"
                } text-white px-6 py-3 rounded-lg font-semibold hover:opacity-90 transition col-span-1 md:col-span-2 disabled:opacity-50 cursor-pointer hover:shadow-lg active:scale-95`}
              >
                {loading ? "Submitting..." : submitButtonText}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PopupForm;
