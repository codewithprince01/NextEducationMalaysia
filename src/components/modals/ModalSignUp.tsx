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
import axios from "axios";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://admin.educationmalaysia.in/api';

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
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [pcRes, cRes, lRes, catRes] = await Promise.all([
          axios.get(`${API_BASE}/phonecodes`),
          axios.get(`${API_BASE}/countries`),
          axios.get(`${API_BASE}/levels`),
          axios.get(`${API_BASE}/course-categories`),
        ]);

        const safeArray = (res: any) => Array.isArray(res.data) ? res.data : Array.isArray(res.data?.data) ? res.data.data : [];

        setPhonecode(safeArray(pcRes));
        setCountriesData(safeArray(cRes));
        setLevels(safeArray(lRes));
        setCourseCategories(safeArray(catRes));
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
    generateCaptcha();
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

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const phoneNumber = e.target.value.replace(/\D/g, "");
    let newFormData = { ...formData, mobile: phoneNumber };
    let newPhoneError = "";
    let newPhoneValid = false;

    if (phoneNumber.length >= 6) {
      try {
        let detectedCountryCode = null;
        for (const code of phonecode) {
          const fullNumber = `+${code.phonecode}${phoneNumber}`;
          try {
            if (isValidPhoneNumber(fullNumber)) {
              const parsed = parsePhoneNumber(fullNumber);
              if (parsed && parsed.country) {
                detectedCountryCode = code.phonecode;
                newPhoneValid = true;
                break;
              }
            }
          } catch (err) {}
        }

        if (detectedCountryCode) {
          if (!formData.country_code || formData.country_code !== detectedCountryCode) {
            newFormData.country_code = detectedCountryCode;
          }
        } else if (formData.country_code) {
          if (isValidPhoneNumber(`+${formData.country_code}${phoneNumber}`)) {
            newPhoneValid = true;
          } else {
            newPhoneError = "Invalid phone number for selected country";
          }
        }
      } catch (error) {}
    }

    setPhoneError(newPhoneError);
    setPhoneValid(newPhoneValid);
    setFormData(newFormData);
  };

  const handleCountryCodeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const code = e.target.value;
    let newFormData = { ...formData, country_code: code };

    if (code) {
      const matchedPhoneObj = phonecode.find((p) => p.phonecode == code);
      if (matchedPhoneObj) {
        let matchedCountry = null;
        const pIso = (
          matchedPhoneObj.iso ||
          matchedPhoneObj.country_code ||
          matchedPhoneObj.sortname ||
          ""
        ).toUpperCase();
        if (pIso && countriesData.length > 0) {
          matchedCountry = countriesData.find(
            (c) => (c.iso || c.sortname || c.code || "").toUpperCase() === pIso,
          );
        }
        if (matchedCountry) newFormData.nationality = matchedCountry.name;
      }
    }

    if (newFormData.mobile && code && newFormData.mobile.length >= 6) {
        try {
          if (isValidPhoneNumber(`+${code}${newFormData.mobile}`))
            setPhoneValid(true);
          else setPhoneError("Phone number doesn't match this country code");
        } catch (err) {}
    }

    setFormData(newFormData);
  };

  const handleNationalityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedName = e.target.value;
    let newCountryCode = formData.country_code;

    const matchedCountry = countriesData.find((c) => c.name === selectedName);

    if (matchedCountry) {
      let matchingPhone = null;
      const cIso = (
        matchedCountry.iso ||
        matchedCountry.sortname ||
        matchedCountry.code ||
        ""
      ).toUpperCase();

      if (cIso) {
        matchingPhone = phonecode.find((p) => {
          const pIso = (
            p.iso ||
            p.country_code ||
            p.sortname ||
            ""
          ).toUpperCase();
          return pIso === cIso;
        });
      }

      if (!matchingPhone) {
        matchingPhone = phonecode.find(
          (p) => p.name && p.name.toLowerCase() === selectedName.toLowerCase(),
        );
      }

      if (matchingPhone) {
        newCountryCode = matchingPhone.phonecode;
      }
    }

    setFormData({
      ...formData,
      nationality: selectedName,
      country_code: newCountryCode,
    });
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
      const response = await axios.post(`${API_BASE}/student/register`, formData);
      const resData: any = response.data;
      const studentId =
        resData?.id ||
        resData?.data?.id ||
        resData?.student_id;

      if (studentId) {
        localStorage.setItem("student_id", studentId);
        const token = resData?.token || resData?.data?.token;
        if (token) localStorage.setItem("token", token);

        toast.success("Registration successful!");

        if (onSuccess) {
          onSuccess(studentId);
        }
      } else {
        toast.error("Registration failed. Please check your details.");
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
    const pc = phonecode.find((p) => p.phonecode == phoneCodeValue);
    const iso = pc?.iso || pc?.country_code || pc?.sortname || "US";
    try {
      return iso.toUpperCase().replace(/./g, (char: string) => 
        String.fromCodePoint(char.charCodeAt(0) + 127397)
      );
    } catch (e) { return "🏳️"; }
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Create Account</h2>
        <p className="mt-2 text-gray-500 text-sm">
          Enter your details to register and apply for the course.
        </p>
      </div>

      <form className="space-y-4" onSubmit={handleSubmit}>
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
        />

        {/* Phone Number */}
        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-gray-700 ml-1">
            Phone Number
          </label>
          <div className="flex gap-3">
            <div className="relative w-1/3">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-lg pointer-events-none z-10">
                {formData.country_code && getCountryFlag(formData.country_code)}
              </div>
              <select
                name="country_code"
                value={formData.country_code}
                onChange={handleCountryCodeChange}
                className="appearance-none w-full pl-10 pr-8 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 font-medium focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all text-sm outline-none cursor-pointer"
                required
              >
                <option value="">Code</option>
                {phonecode.map((code, idx) => (
                  <option key={idx} value={code.phonecode}>
                    {code.iso || code.country_code} (+{code.phonecode})
                  </option>
                ))}
              </select>
              <FiChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
            <div className="relative flex-1 group">
              <FaPhoneAlt className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
              <input
                type="tel"
                placeholder="Phone Number"
                name="mobile"
                value={formData.mobile}
                onChange={handlePhoneChange}
                className={`w-full pl-11 pr-10 py-3 bg-gray-50 border rounded-xl text-gray-900 font-medium focus:bg-white focus:ring-4 transition-all text-sm outline-none ${phoneError ? "border-red-300 focus:border-red-500 focus:ring-red-100" : phoneValid ? "border-green-300 focus:border-green-500 focus:ring-green-100" : "border-gray-200 focus:border-blue-500 focus:ring-blue-500/10"}`}
                required
              />
              {phoneValid && (
                <MdCheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500" />
              )}
              {phoneError && (
                <MdError className="absolute right-3 top-1/2 -translate-y-1/2 text-red-500" />
              )}
            </div>
          </div>
          {phoneError && (
            <p className="text-red-500 text-xs ml-1 font-medium">
              {phoneError}
            </p>
          )}
        </div>

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
        />

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
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            showStrength={true}
            strength={passwordStrength}
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
          />
        </div>

        <div className="space-y-1.5 p-4 bg-gray-50 rounded-xl border border-gray-100">
          <label className="text-sm font-semibold text-gray-700">
            Verify Security
          </label>
          <div className="flex items-center gap-3">
            <div className="bg-white px-4 py-2.5 rounded-lg border border-gray-200 font-bold text-gray-800 tracking-wider shadow-sm select-none min-w-[80px] text-center">
              {captcha}
            </div>
            <button
              type="button"
              onClick={generateCaptcha}
              className="p-2.5 text-gray-500 hover:text-blue-600 hover:bg-white rounded-lg transition-all border border-transparent hover:border-gray-200 hover:shadow-sm cursor-pointer"
            >
              <LuRefreshCw />
            </button>
            <input
              type="text"
              placeholder="Result?"
              value={userCaptcha}
              onChange={(e) => setUserCaptcha(e.target.value)}
              className="flex-1 px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all placeholder:text-gray-400"
              required
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-blue-600/20 transition-all transform active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              Create Account <FaArrowRight />
            </>
          )}
        </button>

        {onSwitchToLogin && (
          <p className="text-center text-sm text-gray-500">
            Already have an account?
            <button
              type="button"
              onClick={onSwitchToLogin}
              className="font-bold text-blue-600 hover:text-blue-700 hover:underline ml-1 cursor-pointer"
            >
              Sign In
            </button>
          </p>
        )}
      </form>
    </div>
  );
};

export default ModalSignUp;
