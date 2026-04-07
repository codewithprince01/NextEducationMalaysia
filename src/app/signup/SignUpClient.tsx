'use client'

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
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FiChevronDown } from "react-icons/fi";
import { LuRefreshCw } from "react-icons/lu";
import { MdError, MdCheckCircle } from "react-icons/md";
import { isValidPhoneNumber } from "libphonenumber-js";
import { useAuth } from "@/context/AuthContext";
import {
  validateEmail,
  validatePassword,
  validateConfirmPassword,
  validateRequired,
  getPasswordStrength,
} from "@/utils/validation";
import { toast } from "react-toastify";
import {
  ModernInput,
  ModernSelect,
  PasswordInput,
} from "@/components/auth/AuthFormInputs";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://admin.educationmalaysia.in/api'
const API_KEY = process.env.NEXT_PUBLIC_FRONTEND_API_KEY || ''

export default function SignUpClient() {
  const { login } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const params = typeof window !== 'undefined' ? window.location.pathname.split('/') : [];
  const applyIndex = params.indexOf('apply');
  const pathProgramId = applyIndex !== -1 ? params[applyIndex + 1] : null;
  const pathRedirect = applyIndex !== -1 ? params[applyIndex + 2] : null;
  
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
          fetch(`${API_BASE}/phonecodes`, { headers: API_KEY ? { 'x-api-key': API_KEY } : undefined }).then(r => r.json()),
          fetch(`${API_BASE}/countries`, { headers: API_KEY ? { 'x-api-key': API_KEY } : undefined }).then(r => r.json()),
          fetch(`${API_BASE}/levels`, { headers: API_KEY ? { 'x-api-key': API_KEY } : undefined }).then(r => r.json()),
          fetch(`${API_BASE}/course-categories`, { headers: API_KEY ? { 'x-api-key': API_KEY } : undefined }).then(r => r.json())
        ]);

        const safeArray = (res: any) => Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];

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
    window.scrollTo({ top: 0, behavior: "smooth" });
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
    if (name === "name") error = validateRequired(value, "Full name");
    else if (name === "email") error = validateEmail(value);
    else if (name === "password") error = validatePassword(value);
    else if (name === "confirm_password") error = validateConfirmPassword(formData.password, value);
    else if (name === "highest_qualification") error = validateRequired(value, "Qualification level");
    else if (name === "interested_course_category") error = validateRequired(value, "Interested course");
    else if (name === "nationality") error = validateRequired(value, "Nationality");

    setErrors((prev: any) => ({ ...prev, [name]: error }));
    return error;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const phoneNumber = e.target.value.replace(/\D/g, "");
    const newFormData = { ...formData, mobile: phoneNumber };
    let newPhoneError = "";
    let newPhoneValid = false;

    // Phone typing should never auto-change country or country code.
    if (phoneNumber.length >= 6 && formData.country_code) {
      try {
        const fullNumber = `+${formData.country_code}${phoneNumber}`;
        if (isValidPhoneNumber(fullNumber)) newPhoneValid = true;
        else newPhoneError = "Invalid phone number for selected country";
      } catch (error) {}
    } else if (phoneNumber.length >= 6 && !formData.country_code) {
      newPhoneError = "Please select a country code";
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
        const pIso = (matchedPhoneObj.iso || matchedPhoneObj.country_code || matchedPhoneObj.sortname || "").toUpperCase();

        if (pIso && countriesData.length > 0) {
          matchedCountry = countriesData.find((c) => {
            const cIso = (c.iso || c.sortname || c.code || "").toUpperCase();
            return cIso === pIso;
          });
        }

        if (!matchedCountry && matchedPhoneObj.name) {
          const pName = matchedPhoneObj.name.toLowerCase();
          matchedCountry = countriesData.find((c) => c.name.toLowerCase() === pName);
        }

        if (matchedCountry) newFormData.nationality = matchedCountry.name;
      }
    }

    let newPhoneError = "";
    let newPhoneValid = false;
    if (newFormData.mobile && code) {
      const fullNumber = `+${code}${newFormData.mobile}`;
      try {
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
      let matchingPhone = null;
      const cIso = (matchedCountry.iso || matchedCountry.sortname || matchedCountry.code || "").toUpperCase();

      if (cIso) {
        matchingPhone = phonecode.find((p) => {
          const pIso = (p.iso || p.country_code || p.sortname || "").toUpperCase();
          return pIso === cIso;
        });
      }

      if (!matchingPhone) {
        matchingPhone = phonecode.find((p) => p.name && p.name.toLowerCase() === selectedName.toLowerCase());
      }

      if (matchingPhone) newCountryCode = matchingPhone.phonecode;
    }

    setFormData({ ...formData, nationality: selectedName, country_code: newCountryCode });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const newErrors: any = {};
    newErrors.name = validateRequired(formData.name, "Full name");
    newErrors.email = validateEmail(formData.email);
    newErrors.password = validatePassword(formData.password);
    newErrors.confirm_password = validateConfirmPassword(formData.password, formData.confirm_password);
    newErrors.highest_qualification = validateRequired(formData.highest_qualification, "Qualification level");
    newErrors.interested_course_category = validateRequired(formData.interested_course_category, "Interested course");
    newErrors.nationality = validateRequired(formData.nationality, "Nationality");

    setErrors(newErrors);
    setTouched({
      name: true, email: true, password: true, confirm_password: true,
      highest_qualification: true, interested_course_category: true, nationality: true,
    });

    if (Object.values(newErrors).some((error) => error !== "")) {
      setLoading(false);
      return;
    }

    if (phoneError || (!phoneValid && formData.mobile)) {
      setLoading(false);
      return;
    }

    const [num1, operator, num2] = captcha.split(" ");
    let expectedAnswer;
    if (operator === "+") expectedAnswer = parseInt(num1) + parseInt(num2);
    else if (operator === "-") expectedAnswer = parseInt(num1) - parseInt(num2);
    else if (operator === "×") expectedAnswer = parseInt(num1) * parseInt(num2);

    if (parseInt(userCaptcha) !== expectedAnswer) {
      generateCaptcha();
      setUserCaptcha("");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/student/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(API_KEY ? { 'x-api-key': API_KEY } : {}) },
        body: JSON.stringify(formData)
      });

      const resData: any = await response.json();
      if (!response.ok) {
        const message = resData?.message || "Registration failed";
        const isEmailAlreadyExists =
          /email/i.test(message) && /already/i.test(message);

        if (isEmailAlreadyExists) {
          setErrors((prev: any) => ({
            ...prev,
            email: "Email already registered. Please login.",
          }));
        }

        toast.error(message);
        return;
      }

      const studentId = resData.id || resData.data?.id || resData.student_id;

      if (studentId) {
        localStorage.setItem('student_id', String(studentId));
        localStorage.setItem('student_email', formData.email);
        if (formData.name) localStorage.setItem('student_name', String(formData.name).trim());
        if (resData.token || resData.data?.token) {
          login(resData.token || resData.data?.token, String(studentId), formData.email, formData.name);
        }
        const programId = pathProgramId || searchParams.get("program_id");
        const redirect = pathRedirect || searchParams.get("redirect");

        if (programId && redirect === "courses") {
          router.push(`/courses-in-malaysia?program_id=${programId}&redirect=courses`);
        } else {
          router.push("/confirmed-email");
        }
      } else {
        toast.error(resData?.message || "Registration failed");
      }
    } catch (error) {
      console.error(error);
      toast.error("Unable to register right now. Please try again.");
    } finally {
      setLoading(false);
    }
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

  return (
    <div className="min-h-screen w-full flex bg-white font-sans">
      {/* Left Side - Visual Section */}
      <div className="hidden lg:flex lg:w-1/2 bg-blue-600 sticky top-0 min-h-screen h-fit flex-col justify-between px-8 pb-8 pt-24 text-white text-left">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-blue-500 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/3 opacity-50"></div>
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-indigo-600 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/3 opacity-60"></div>

        <div className="relative z-10">
          <div className="mb-4 inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full border border-white/20">
            <span className="text-xl">🇲🇾</span>
            <span className="text-xs font-semibold tracking-wide uppercase">Study in Malaysia</span>
          </div>
          <h1 className="text-5xl font-extrabold leading-tight mb-4 tracking-tight">
            Start Your <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-200 to-white">Study in Malaysia</span> <br />
            Journey Today!
          </h1>
          <p className="text-lg text-blue-100 max-w-lg leading-relaxed font-light">
            Sign up to get university options, fees, scholarships & visa guidance.
          </p>
        </div>

        <div className="relative z-10 mt-auto pt-8 border-t border-white/10 grid grid-cols-2 gap-4">
          <div><h3 className="text-3xl font-bold">12+</h3><p className="text-sm text-blue-200">Years of Experience</p></div>
          <div><h3 className="text-3xl font-bold">5000+</h3><p className="text-sm text-blue-200">Students Guided</p></div>
          <div><h3 className="text-3xl font-bold">97%</h3><p className="text-sm text-blue-200">Visa Success Rate</p></div>
          <div><h3 className="text-3xl font-bold">Tie-ups</h3><p className="text-sm text-blue-200">With Malaysian Universities</p></div>
        </div>
      </div>

      {/* Right Side - Form Section */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12 relative bg-white">
        <div className="w-full max-w-lg space-y-8 my-auto">
          <div className="text-center lg:text-left">
            <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Create Account</h2>
            <p className="mt-2 text-gray-500">Enter your details to register as a student.</p>
          </div>

          <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
            <ModernInput label="Full Name" icon={<FaUser />} placeholder="Enter your full name" name="name" value={formData.name} onChange={handleChange} onBlur={handleBlur} required error={errors.name} />
            <ModernInput label="Email Address" icon={<FaEnvelope />} type="email" placeholder="Enter your email" name="email" value={formData.email} onChange={handleChange} onBlur={handleBlur} required error={errors.email} />

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-gray-700 ml-1">Phone Number</label>
              <div className="flex gap-3">
                <div className="relative w-1/3">
                  <select name="country_code" value={formData.country_code} onChange={handleCountryCodeChange} className="appearance-none w-full pl-4 pr-8 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 font-medium focus:bg-white focus:border-blue-500 transition-all text-sm outline-none cursor-pointer">
                    <option value="">Code</option>
                    {Array.isArray(phonecode) && phonecode.map((code, idx) => (
                      <option key={idx} value={code.phonecode}>
                        {(getCountryIsoByPhoneCode(String(code.phonecode)) || "NA")} (+{code.phonecode})
                      </option>
                    ))}
                  </select>
                  <FiChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
                <div className="relative flex-1 group">
                  <FaPhoneAlt className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
                  <input type="tel" placeholder="Phone Number" name="mobile" value={formData.mobile} onChange={handlePhoneChange} className={`w-full pl-11 pr-10 py-3.5 bg-gray-50 border rounded-xl text-gray-900 font-medium focus:bg-white transition-all text-sm outline-none ${phoneError ? "border-red-300 focus:border-red-500" : phoneValid ? "border-green-300 focus:border-green-500" : "border-gray-200 focus:border-blue-500"}`} required />
                  {phoneValid && <MdCheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500" />}
                  {phoneError && <MdError className="absolute right-3 top-1/2 -translate-y-1/2 text-red-500" />}
                </div>
              </div>
              {phoneError && <p className="text-red-500 text-xs ml-1 font-medium">{phoneError}</p>}
            </div>

            <ModernSelect label="Qualification Level" icon={<FaGraduationCap />} name="highest_qualification" value={formData.highest_qualification} onChange={handleChange} onBlur={handleBlur} options={Array.isArray(levels) ? levels.map((level) => level.level || level.name) : []} required error={errors.highest_qualification} />
            <ModernSelect label="Interested Course" icon={<FaBookOpen />} name="interested_course_category" value={formData.interested_course_category} onChange={handleChange} onBlur={handleBlur} options={Array.isArray(courseCategories) ? courseCategories.map((cat) => cat.name) : []} required error={errors.interested_course_category} />
            <ModernSelect label="Nationality" icon={<FaGlobe />} name="nationality" value={formData.nationality} onChange={handleNationalityChange} onBlur={handleBlur} options={Array.isArray(countriesData) ? countriesData.map((country) => country.name) : []} required error={errors.nationality} />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <PasswordInput label="Password" icon={<FaLock />} placeholder="Create password" name="password" value={formData.password} onChange={handleChange} onBlur={handleBlur} showPassword={showPassword} setShowPassword={setShowPassword} required error={errors.password} showStrength={true} strength={passwordStrength} />
              <PasswordInput label="Confirm Password" icon={<FaLock />} placeholder="Confirm password" name="confirm_password" value={formData.confirm_password} onChange={handleChange} onBlur={handleBlur} showPassword={showConfirmPassword} setShowPassword={setShowConfirmPassword} required error={errors.confirm_password} />
            </div>

            {/* Captcha */}
            <div className="space-y-1.5 p-4 bg-gray-50 rounded-xl border border-gray-100">
              <label className="text-sm font-semibold text-gray-700">Verify Security</label>
              <div className="flex items-center gap-3">
                <div className="bg-white px-4 py-2.5 rounded-lg border border-gray-200 font-bold text-gray-800 tracking-wider shadow-sm select-none min-w-[80px] text-center">{captcha}</div>
                <button type="button" onClick={generateCaptcha} className="p-2.5 text-gray-500 hover:text-blue-600 hover:bg-white rounded-lg transition-all border border-transparent hover:border-gray-200 hover:shadow-sm"><LuRefreshCw /></button>
                <input type="text" placeholder="Result?" value={userCaptcha} onChange={(e) => setUserCaptcha(e.target.value)} className="flex-1 px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:border-blue-500 outline-none transition-all placeholder:text-gray-400" required />
              </div>
            </div>

            <button type="submit" disabled={loading} className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-600/20 transition-all transform active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed mt-4">
              {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <>Create Account <FaArrowRight /></>}
            </button>
            {loading && (
              <p className="text-xs text-center text-blue-600 font-medium -mt-1">Creating your account...</p>
            )}

            <p className="text-center text-sm text-gray-500">
              Already have an account? <Link href="/login" className="font-bold text-blue-600 hover:text-blue-700 hover:underline ml-1">Sign In</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
