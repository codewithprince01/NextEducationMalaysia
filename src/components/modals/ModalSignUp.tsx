"use client"

import React, { useEffect, useState } from "react";
import {
  FaUser,
  FaEnvelope,
  FaLock,
  FaPhoneAlt,
  FaGraduationCap,
  FaGlobe,
  FaBookOpen,
  FaArrowRight,
} from "react-icons/fa";
import { FiChevronDown } from "react-icons/fi";
import { LuRefreshCw } from "react-icons/lu";
import { MdError, MdCheckCircle } from "react-icons/md";
import { parsePhoneNumber, isValidPhoneNumber } from "libphonenumber-js";
import { toast } from "react-toastify";
import {
  validateEmail,
  validatePassword,
  validateConfirmPassword,
  validateRequired,
  getPasswordStrength,
} from "@/utils/validation";
import {
  ModernInput,
  ModernSelect,
  PasswordInput,
} from "@/components/auth/AuthFormInputs";
import {
  apiGetWithFallback,
  apiPostWithFallback,
  parseApiList,
  DEFAULT_LEVELS,
  DEFAULT_COURSE_CATEGORIES,
} from "./authApi";

interface ModalSignUpProps {
  onSuccess: (studentId: any) => void;
  onSwitchToLogin: () => void;
}

const ModalSignUp: React.FC<ModalSignUpProps> = ({ onSuccess, onSwitchToLogin }) => {
  const [captcha, setCaptcha] = useState("");
  const [userCaptcha, setUserCaptcha] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [countriesData, setCountriesData] = useState<any[]>([]);
  const [phonecode, setPhonecode] = useState<any[]>([]);
  const [levels, setLevels] = useState<any[]>([]);
  const [courseCategories, setCourseCategories] = useState<any[]>([]);
  const [phoneError, setPhoneError] = useState("");
  const [phoneValid, setPhoneValid] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<any>({});
  const [touched, setTouched] = useState<any>({});
  const [passwordStrength, setPasswordStrength] = useState({
    level: 0,
    color: "gray",
    text: "",
  });

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    country_code: "",
    mobile: "",
    password: "",
    confirm_password: "",
    highest_qualification: "",
    interested_course_category: "",
    nationality: "",
    source_path: "",
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [pcRes, cRes, lRes, catRes] = await Promise.allSettled([
          apiGetWithFallback("/phonecodes"),
          apiGetWithFallback("/countries"),
          apiGetWithFallback("/levels"),
          apiGetWithFallback("/course-categories"),
        ]);

        const pcData = pcRes.status === "fulfilled" ? parseApiList(pcRes.value.data) : [];
        const cData = cRes.status === "fulfilled" ? parseApiList(cRes.value.data) : [];
        const lData = lRes.status === "fulfilled" ? parseApiList(lRes.value.data) : [];
        const catData = catRes.status === "fulfilled" ? parseApiList(catRes.value.data) : [];

        setPhonecode(pcData);
        setCountriesData(cData);
        setLevels(lData.length > 0 ? lData : DEFAULT_LEVELS);
        setCourseCategories(catData.length > 0 ? catData : DEFAULT_COURSE_CATEGORIES);
      } catch (error) {
        console.error("Error fetching data:", error);
        setLevels(DEFAULT_LEVELS);
        setCourseCategories(DEFAULT_COURSE_CATEGORIES);
      }
    };
    fetchData();
    generateCaptcha();
    if (typeof window !== "undefined") {
      setFormData((prev) => ({ ...prev, source_path: window.location.href }));
    }
  }, []);

  const generateCaptcha = () => {
    const operators = ["+", "-", "×"];
    const num1 = Math.floor(Math.random() * 10) + 1;
    const num2 = Math.floor(Math.random() * 10) + 1;
    const operator = operators[Math.floor(Math.random() * operators.length)];
    setCaptcha(`${num1} ${operator} ${num2}`);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    if (name === "password") {
      setPasswordStrength(getPasswordStrength(value));
    }

    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }

    if (touched[name]) {
      validateField(name, value);
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setTouched({ ...touched, [name]: true });
    validateField(name, value);
  };

  const validateField = (name: string, value: string) => {
    let error = "";

    if (name === "name") {
      error = validateRequired(value, "Full name");
    } else if (name === "email") {
      error = validateEmail(value);
    } else if (name === "password") {
      error = validatePassword(value);
    } else if (name === "confirm_password") {
      error = validateConfirmPassword(formData.password, value);
    } else if (name === "highest_qualification") {
      error = validateRequired(value, "Qualification level");
    } else if (name === "interested_course_category") {
      error = validateRequired(value, "Interested course");
    } else if (name === "nationality") {
      error = validateRequired(value, "Nationality");
    }

    setErrors((prev: any) => ({ ...prev, [name]: error }));
    return error;
  };

  const getAlphaCodeFromName = (name: string): string => {
    const cleaned = String(name || "").trim();
    if (!cleaned) return "";
    const words = cleaned.split(/[\s-]+/).filter(Boolean);
    if (!words.length) return "";
    if (words.length === 1) {
      return words[0].slice(0, 2).toUpperCase();
    }
    return `${words[0][0] || ""}${words[1][0] || ""}`.toUpperCase();
  };

  const getCountryIsoByPhoneCode = (phoneCodeValue: string): string => {
    if (!phoneCodeValue) return "";
    const pc = phonecode.find((p) => String(p.phonecode) === String(phoneCodeValue));
    if (!pc) return "";

    const directIso = String(pc.iso || pc.country_code || pc.sortname || "").toUpperCase().trim();
    if (directIso) return directIso;

    const pcName = String(pc.name || pc.country || "").toLowerCase().trim();
    if (pcName) {
      const byName = countriesData.find((c) => String(c.name || "").toLowerCase().trim() === pcName);
      if (byName) {
        const iso = String(byName.iso || byName.sortname || byName.code || "").toUpperCase().trim();
        if (iso) return iso;
      }
    }

    return getAlphaCodeFromName(String(pc.name || pc.country || ""));
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const phoneNumber = e.target.value.replace(/\D/g, "");
    const newFormData = { ...formData, mobile: phoneNumber };
    let newPhoneError = "";
    let newPhoneValid = false;

    if (phoneNumber.length >= 6 && formData.country_code) {
      try {
        const fullNumber = `+${formData.country_code}${phoneNumber}`;
        if (isValidPhoneNumber(fullNumber)) {
          newPhoneValid = true;
        } else {
          newPhoneError = "Invalid phone number for selected country";
        }
      } catch (err) {
        newPhoneError = "Invalid phone number";
      }
    } else if (phoneNumber.length >= 6 && !formData.country_code) {
      newPhoneError = "Please select a country code";
    }

    setPhoneError(newPhoneError);
    setPhoneValid(newPhoneValid);
    setFormData(newFormData);
  };

  const handleCountryCodeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const code = e.target.value;
    const newFormData = { ...formData, country_code: code };

    if (code) {
      const matchedPhoneObj = phonecode.find((p) => String(p.phonecode) === String(code));
      if (matchedPhoneObj) {
        let matchedCountry = null;
        const pIso = (
          matchedPhoneObj.iso ||
          matchedPhoneObj.country_code ||
          matchedPhoneObj.sortname ||
          ""
        ).toUpperCase();

        if (pIso && countriesData.length > 0) {
          matchedCountry = countriesData.find((c) => {
            const cIso = (c.iso || c.sortname || c.code || "").toUpperCase();
            return cIso === pIso;
          });
        }

        if (!matchedCountry && matchedPhoneObj.name) {
          const pName = matchedPhoneObj.name.toLowerCase().trim();
          matchedCountry = countriesData.find(
            (c) => (c.name || "").toLowerCase().trim() === pName,
          );
        }

        if (matchedCountry) newFormData.nationality = matchedCountry.name;
      }
    }

    let newPhoneError = "";
    let newPhoneValid = false;
    if (newFormData.mobile && code) {
      try {
        const fullNumber = `+${code}${newFormData.mobile}`;
        if (isValidPhoneNumber(fullNumber)) newPhoneValid = true;
        else newPhoneError = "Phone number doesn't match this country code";
      } catch (err) {
        newPhoneError = "Invalid phone number";
      }
    }

    setFormData(newFormData);
    setPhoneError(newPhoneError);
    setPhoneValid(newPhoneValid);
  };

  const handleNationalityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedName = e.target.value;
    let newCountryCode = formData.country_code;

    const matchedCountry = countriesData.find((c) => c.name === selectedName);

    if (matchedCountry) {
      if (matchedCountry.phonecode) {
        newCountryCode = String(matchedCountry.phonecode);
      } else {
        const cIso = (
          matchedCountry.iso ||
          matchedCountry.sortname ||
          matchedCountry.code ||
          ""
        ).toUpperCase();

        let matchingPhone = null;
        if (cIso) {
          matchingPhone = phonecode.find((p) => {
            const pIso = (p.iso || p.country_code || p.sortname || "").toUpperCase();
            return pIso === cIso;
          });
        }

        if (!matchingPhone) {
          matchingPhone = phonecode.find(
            (p) => p.name && p.name.toLowerCase() === selectedName.toLowerCase(),
          );
        }

        if (matchingPhone) {
          newCountryCode = String(matchingPhone.phonecode);
        }
      }
    }

    const newFormData = {
      ...formData,
      nationality: selectedName,
      country_code: newCountryCode,
    };

    let newPhoneError = "";
    let newPhoneValid = false;
    if (newFormData.mobile && newCountryCode) {
      try {
        const fullNumber = `+${newCountryCode}${newFormData.mobile}`;
        if (isValidPhoneNumber(fullNumber)) newPhoneValid = true;
        else newPhoneError = "Phone number doesn't match this country code";
      } catch (err) {
        newPhoneError = "Invalid phone number";
      }
    }

    setFormData(newFormData);
    setPhoneError(newPhoneError);
    setPhoneValid(newPhoneValid);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: any = {};
    newErrors.name = validateRequired(formData.name, "Full name");
    newErrors.email = validateEmail(formData.email);
    newErrors.password = validatePassword(formData.password);
    newErrors.confirm_password = validateConfirmPassword(
      formData.password,
      formData.confirm_password,
    );
    newErrors.highest_qualification = validateRequired(
      formData.highest_qualification,
      "Qualification level",
    );
    newErrors.interested_course_category = validateRequired(
      formData.interested_course_category,
      "Interested course",
    );
    newErrors.nationality = validateRequired(
      formData.nationality,
      "Nationality",
    );

    setErrors(newErrors);
    setTouched({
      name: true,
      email: true,
      password: true,
      confirm_password: true,
      highest_qualification: true,
      interested_course_category: true,
      nationality: true,
    });

    if (Object.values(newErrors).some((error) => error !== "")) {
      toast.error("Please fix all errors before submitting");
      return;
    }

    setLoading(true);

    if (phoneError || (!phoneValid && formData.mobile)) {
      toast.error(phoneError || "Please enter a valid phone number");
      setLoading(false);
      return;
    }

    const [num1, operator, num2] = captcha.split(" ");
    let expectedAnswer;
    if (operator === "+") expectedAnswer = parseInt(num1) + parseInt(num2);
    else if (operator === "-") expectedAnswer = parseInt(num1) - parseInt(num2);
    else if (operator === "×") expectedAnswer = parseInt(num1) * parseInt(num2);

    if (parseInt(userCaptcha) !== expectedAnswer) {
      toast.error("Incorrect captcha value.");
      generateCaptcha();
      setUserCaptcha("");
      setLoading(false);
      return;
    }

    try {
      const response = await apiPostWithFallback("/student/register", formData);
      const resData: any = response.data;
      const studentId =
        resData?.id ||
        resData?.data?.id ||
        resData?.student_id;

      if (studentId) {
        localStorage.setItem("student_id", String(studentId));
        localStorage.setItem("student_email", formData.email);
        if (formData.name) localStorage.setItem("student_name", String(formData.name).trim());
        const token = resData?.token || resData?.data?.token;
        if (token) localStorage.setItem("token", token);

        toast.success("Registration successful!");

        if (onSuccess) {
          onSuccess(studentId);
        }
      } else {
        toast.error(resData?.message || "Registration failed. Please check your details.");
      }
    } catch (error: any) {
      if (error.response?.data?.errors) {
        toast.error(Object.values(error.response.data.errors).flat().join("\n"));
      } else if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Registration failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const getCountryFlag = (phoneCodeValue: string) => {
    const iso = getCountryIsoByPhoneCode(phoneCodeValue) || "MY";
    try {
      return iso.toUpperCase().replace(/./g, (char: string) => 
        String.fromCodePoint(char.charCodeAt(0) + 127397)
      );
    } catch (e) { return "🇲🇾"; }
  };

  return (
    <div className="w-full max-w-xl mx-auto px-4 sm:px-6 py-2.5 sm:py-3">
      <form className="space-y-2 sm:space-y-2.5" onSubmit={handleSubmit}>
        {/* Row 1: Full Name & Email Address */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-2.5">
          <ModernInput
            label="Full Name"
            icon={<FaUser />}
            placeholder="Enter your full name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            onBlur={handleBlur}
            required
            error={errors.name}
            compact
          />

          <ModernInput
            label="Email Address"
            icon={<FaEnvelope />}
            type="email"
            placeholder="Enter your email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            onBlur={handleBlur}
            required
            error={errors.email}
            compact
          />
        </div>

        {/* Row 2: Phone Number & Nationality */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-2.5">
          {/* Phone Number */}
          <div className="space-y-0.5">
            <label className="text-[11px] sm:text-xs font-semibold text-slate-700 ml-0.5">
              Phone Number <span className="text-rose-500">*</span>
            </label>
            <div className="flex gap-1.5 sm:gap-2">
              <div className="relative w-24 sm:w-28 shrink-0">
                <div className="absolute left-2 top-1/2 -translate-y-1/2 text-xs pointer-events-none z-10">
                  {formData.country_code && getCountryFlag(formData.country_code)}
                </div>
                <select
                  name="country_code"
                  value={formData.country_code}
                  onChange={handleCountryCodeChange}
                  className="appearance-none w-full pl-6 pr-5 py-1.5 sm:py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 font-medium focus:bg-white focus:border-blue-600 focus:ring-1 focus:ring-blue-500/20 transition-all text-xs sm:text-[13px] outline-none cursor-pointer"
                  required
                >
                  <option value="">Code</option>
                  {phonecode.map((code, idx) => {
                    const iso = getCountryIsoByPhoneCode(String(code.phonecode)) || code.name || "NA";
                    return (
                      <option key={idx} value={code.phonecode}>
                        {iso} (+{code.phonecode})
                      </option>
                    );
                  })}
                </select>
                <FiChevronDown className="absolute right-1.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none text-xs" />
              </div>
              <div className="relative flex-1 group">
                <FaPhoneAlt className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors text-[10px]" />
                <input
                  type="tel"
                  placeholder="Phone number"
                  name="mobile"
                  value={formData.mobile}
                  onChange={handlePhoneChange}
                  className={`w-full pl-7 pr-7 py-1.5 sm:py-2 bg-gray-50 border rounded-lg text-gray-900 font-medium focus:bg-white focus:ring-1 transition-all text-xs sm:text-[13px] outline-none ${
                    phoneError
                      ? "border-red-300 focus:border-red-500"
                      : phoneValid
                      ? "border-green-300 focus:border-green-500"
                      : "border-gray-200 focus:border-blue-600"
                  }`}
                  required
                />
                {phoneValid && (
                  <MdCheckCircle className="absolute right-2 top-1/2 -translate-y-1/2 text-green-500 text-xs" />
                )}
                {phoneError && (
                  <MdError className="absolute right-2 top-1/2 -translate-y-1/2 text-red-500 text-xs" />
                )}
              </div>
            </div>
            {phoneError && (
              <p className="text-red-500 text-[10px] ml-1 font-medium">
                {phoneError}
              </p>
            )}
          </div>

          <ModernSelect
            label="Nationality"
            icon={<FaGlobe />}
            name="nationality"
            value={formData.nationality}
            onChange={handleNationalityChange}
            onBlur={handleBlur}
            options={countriesData.map((country) => country.name)}
            required
            error={errors.nationality}
            compact
          />
        </div>

        {/* Row 3: Qualification Level & Interested Course */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-2.5">
          <ModernSelect
            label="Qualification Level"
            icon={<FaGraduationCap />}
            name="highest_qualification"
            value={formData.highest_qualification}
            onChange={handleChange}
            onBlur={handleBlur}
            options={levels.map((level) => level.level || level.name)}
            required
            error={errors.highest_qualification}
            compact
          />

          <ModernSelect
            label="Interested Course"
            icon={<FaBookOpen />}
            name="interested_course_category"
            value={formData.interested_course_category}
            onChange={handleChange}
            onBlur={handleBlur}
            options={courseCategories.map((cat) => cat.name)}
            required
            error={errors.interested_course_category}
            compact
          />
        </div>

        {/* Row 4: Password & Confirm Password */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-2.5">
          <PasswordInput
            label="Password"
            icon={<FaLock />}
            placeholder="Create password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            onBlur={handleBlur}
            showPassword={showPassword}
            setShowPassword={setShowPassword}
            required
            error={errors.password}
            showStrength={false}
            compact
          />
          <PasswordInput
            label="Confirm Password"
            icon={<FaLock />}
            placeholder="Confirm password"
            name="confirm_password"
            value={formData.confirm_password}
            onChange={handleChange}
            onBlur={handleBlur}
            showPassword={showConfirmPassword}
            setShowPassword={setShowConfirmPassword}
            required
            error={errors.confirm_password}
            compact
          />
        </div>

        {/* Row 5: Captcha */}
        <div className="flex items-center gap-2 p-1.5 sm:p-2 bg-slate-50/90 rounded-lg border border-slate-200/90">
          <span className="text-[11px] sm:text-xs font-bold text-slate-700 shrink-0">Security:</span>
          <div className="bg-white px-2.5 py-1 rounded-md border border-slate-200 font-bold text-slate-800 tracking-wider shadow-2xs select-none text-xs min-w-[65px] text-center">
            {captcha}
          </div>
          <button
            type="button"
            onClick={generateCaptcha}
            className="p-1 text-slate-400 hover:text-blue-600 hover:bg-white rounded-md transition-all border border-transparent hover:border-slate-200 cursor-pointer text-xs outline-none focus:outline-none"
            title="New captcha"
          >
            <LuRefreshCw size={12} />
          </button>
          <input
            type="text"
            placeholder="Answer"
            value={userCaptcha}
            onChange={(e) => setUserCaptcha(e.target.value)}
            className="flex-1 px-2.5 py-1 sm:py-1.5 bg-white border border-slate-200 rounded-md text-xs focus:border-blue-600 focus:ring-1 focus:ring-blue-100 outline-none transition-all placeholder:text-slate-400 font-medium"
            required
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 sm:py-3 rounded-xl shadow-md shadow-blue-500/20 hover:shadow-lg transition-all transform active:scale-[0.99] disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer text-xs sm:text-[13px] outline-none focus:outline-none tracking-wide"
        >
          {loading ? (
            <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              Create Account & Apply <FaArrowRight className="text-[10px]" />
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default ModalSignUp;
