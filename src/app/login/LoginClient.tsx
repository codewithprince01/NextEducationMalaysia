'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { 
  FaEnvelope, 
  FaLock, 
  FaEye, 
  FaEyeSlash, 
  FaArrowRight 
} from 'react-icons/fa'
import { useAuth } from '@/context/AuthContext'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://admin.educationmalaysia.in/api'
const API_KEY = process.env.NEXT_PUBLIC_FRONTEND_API_KEY || ''

// Modern Clean Input
const ModernInput = ({
  label,
  type,
  name,
  placeholder,
  value,
  onChange,
  onBlur,
  icon,
  required,
  error,
}: any) => (
  <div className="space-y-1.5">
    <label className="text-sm font-semibold text-gray-700 ml-1">{label}</label>
    <div className="relative group">
      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors">
        {icon}
      </div>
      <input
        type={type}
        name={name}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        required={required}
        className={`w-full pl-11 pr-4 py-3.5 bg-gray-50 border rounded-xl text-gray-900 placeholder:text-gray-400 focus:bg-white focus:ring-4 transition-all outline-none text-sm font-medium ${
          error
            ? "border-red-300 focus:border-red-500 focus:ring-red-100"
            : "border-gray-200 focus:border-blue-500 focus:ring-blue-500/10"
        }`}
      />
    </div>
    {error && (
      <p className="text-red-600 text-xs mt-1 ml-1 font-medium flex items-center gap-1">
        <span className="inline-block w-1 h-1 bg-red-600 rounded-full"></span>
        {error}
      </p>
    )}
  </div>
);

// Modern Password Input
const PasswordInput = ({
  label,
  name,
  placeholder,
  value,
  onChange,
  onBlur,
  showPassword,
  setShowPassword,
  icon,
  error,
}: any) => (
  <div className="space-y-1.5">
    <label className="text-sm font-semibold text-gray-700 ml-1">{label}</label>
    <div className="relative group">
      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors">
        {icon}
      </div>
      <input
        type={showPassword ? "text" : "password"}
        name={name}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        required
        className={`w-full pl-11 pr-12 py-3.5 bg-gray-50 border rounded-xl text-gray-900 placeholder:text-gray-400 focus:bg-white focus:ring-4 transition-all outline-none text-sm font-medium ${
          error
            ? "border-red-300 focus:border-red-500 focus:ring-red-100"
            : "border-gray-200 focus:border-blue-500 focus:ring-blue-500/10"
        }`}
      />
      <button
        type="button"
        onClick={() => setShowPassword(!showPassword)}
        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
      >
        {showPassword ? <FaEyeSlash /> : <FaEye />}
      </button>
    </div>
    {error && (
      <p className="text-red-600 text-xs mt-1 ml-1 font-medium flex items-center gap-1">
        <span className="inline-block w-1 h-1 bg-red-600 rounded-full"></span>
        {error}
      </p>
    )}
  </div>
);

export default function LoginClient() {
  const { login } = useAuth();
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<any>({});
  const [touched, setTouched] = useState<any>({});

  const validateEmail = (email: string) => {
    if (!email) return "Email is required";
    if (!/\S+@\S+\.\S+/.test(email)) return "Email is invalid";
    return "";
  };

  const validateRequired = (value: string, fieldName: string) => {
    if (!value) return `${fieldName} is required`;
    return "";
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }

    if (touched[name]) {
      validateField(name, value);
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setTouched({ ...touched, [name]: true });
    validateField(name, value);
  };

  const validateField = (name: string, value: string) => {
    let error = "";
    if (name === "email") {
      error = validateEmail(value);
    } else if (name === "password") {
      error = validateRequired(value, "Password");
    }
    setErrors((prev: any) => ({ ...prev, [name]: error }));
    return error;
  };

  const validateForm = () => {
    const newErrors: any = {};
    newErrors.email = validateEmail(formData.email);
    newErrors.password = validateRequired(formData.password, "Password");
    setErrors(newErrors);
    setTouched({ email: true, password: true });
    return !Object.values(newErrors).some((error) => error !== "");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);

    try {
      const response = await fetch(`${API_BASE}/student/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(API_KEY ? { 'x-api-key': API_KEY } : {}) },
        body: JSON.stringify(formData),
      });

      const resData: any = await response.json();
      const responseData = resData.data || resData;
      const responseName =
        responseData?.name ||
        responseData?.student?.name ||
        responseData?.student_name ||
        "";

      if (response.ok && responseData.token) {
        if (responseName) localStorage.setItem('student_name', String(responseName).trim());
        login(responseData.token, String(responseData.id), responseData.email, responseName);
        router.push('/student/profile');
      } else if (response.ok && (responseData.needs_otp || responseData.otp_required || responseData.id)) {
        if (responseData.id) localStorage.setItem('student_id', String(responseData.id));
        if (responseData.email) localStorage.setItem('student_email', String(responseData.email));
        if (responseName) localStorage.setItem('student_name', String(responseName).trim());
        router.push('/confirmed-email');
      } else {
        setErrors({ form: resData.message || "Login failed. Please try again." });
      }
    } catch (error) {
      setErrors({ form: "Login failed. Please check your connection." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-white font-sans overflow-x-hidden">
      {/* Left Side - Brand/Visual Section (Full Height) */}
      <div className="hidden lg:flex lg:w-1/2 bg-blue-600 sticky top-0 min-h-screen h-fit flex-col justify-between px-8 pb-8 pt-24 text-white text-left overflow-hidden">
        {/* Abstract Background Shapes */}
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-blue-500 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/3 opacity-50"></div>
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-indigo-600 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/3 opacity-60"></div>

        {/* Content */}
        <div className="relative z-10">
          <div className="mb-4 inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full border border-white/20">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
            <span className="text-xs font-semibold tracking-wide uppercase">
              Education Malaysia
            </span>
          </div>
          <h1 className="text-5xl font-extrabold leading-tight mb-4 tracking-tight">
            Unlock Your <br />{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-200 to-white">
              Global Future.
            </span>
          </h1>
          <p className="text-lg text-blue-100 max-w-lg leading-relaxed font-light">
            Access world-class universities, manage applications, and get
            expert guidance—all in one place.
          </p>
        </div>

        {/* Footer/Testimonial */}
        <div className="relative z-10 mt-auto pt-8 border-t border-white/10 grid grid-cols-2 gap-6">
          <div>
            <h3 className="text-3xl font-bold">12+</h3>
            <p className="text-sm text-blue-200">Years of Experience</p>
          </div>
          <div>
            <h3 className="text-3xl font-bold">5000+</h3>
            <p className="text-sm text-blue-200">Students Guided</p>
          </div>
          <div>
            <h3 className="text-3xl font-bold">97%</h3>
            <p className="text-sm text-blue-200">Visa Success Rate</p>
          </div>
          <div>
            <h3 className="text-3xl font-bold">Tie-ups</h3>
            <p className="text-sm text-blue-200">
              With Malaysian Universities
            </p>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form (Clean White) */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12 relative bg-white">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center lg:text-left">
            <h2 className="text-3xl font-bold text-gray-900 tracking-tight">
              Welcome Back
            </h2>
            <p className="mt-2 text-gray-500">
              Please enter your details to sign in.
            </p>
          </div>

          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            {errors.form && (
              <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-medium border border-red-100 animate-fade-in">
                {errors.form}
              </div>
            )}

            <div className="space-y-5">
              <ModernInput
                label="Email"
                type="email"
                name="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
                onBlur={handleBlur}
                icon={<FaEnvelope />}
                error={errors.email}
              />

              <div>
                <PasswordInput
                  label="Password"
                  name="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  showPassword={showPassword}
                  setShowPassword={setShowPassword}
                  icon={<FaLock />}
                  error={errors.password}
                />
                <div className="flex items-center justify-between mt-3 font-medium text-sm">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="remember"
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <label
                      htmlFor="remember"
                      className="text-gray-500 cursor-pointer select-none"
                    >
                      Remember for 30 days
                    </label>
                  </div>
                  <Link
                    href="/account/password/reset"
                    className="text-blue-600 hover:text-blue-700 hover:underline transition-colors"
                  >
                    Forgot password?
                  </Link>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-600/20 transition-all transform active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed text-base"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  Sign In <FaArrowRight />
                </>
              )}
            </button>

            <button
              type="button"
              className="w-full bg-white border border-gray-200 text-gray-700 font-semibold py-3.5 rounded-xl hover:bg-gray-50 transition-colors flex items-center justify-center gap-3"
            >
              <img
                src="https://www.svgrepo.com/show/475656/google-color.svg"
                alt="Google"
                className="w-5 h-5"
              />
              Sign in with Google
            </button>
          </form>

          <p className="text-center text-sm text-gray-500">
            Don't have an account?
            <Link
              href="/signup"
              className="font-bold text-blue-600 hover:text-blue-700 hover:underline ml-1"
            >
              Sign up for free
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
