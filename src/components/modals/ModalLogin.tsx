"use client"

import React, { useState } from 'react'
import { 
  FaEnvelope, 
  FaLock, 
  FaEye, 
  FaEyeSlash, 
  FaArrowRight 
} from 'react-icons/fa'
import axios from 'axios'
import { toast } from 'react-toastify'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://admin.educationmalaysia.in/api';
const API_KEY = process.env.NEXT_PUBLIC_FRONTEND_API_KEY || '';

interface ModalLoginProps {
  onSuccess: (data: any) => void;
  onSwitchToSignUp: () => void;
}

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

const ModalLogin: React.FC<ModalLoginProps> = ({ onSuccess, onSwitchToSignUp }) => {
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    const emailError = validateEmail(formData.email);
    const passwordError = validateRequired(formData.password, "Password");
    
    if (emailError || passwordError) {
      setErrors({ email: emailError, password: passwordError });
      setTouched({ email: true, password: true });
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(`${API_BASE}/student/login`, formData, {
        headers: API_KEY ? { 'x-api-key': API_KEY } : undefined,
      });
      const resData: any = response.data;
      const responseData = resData.data || resData;
      const responseName =
        responseData?.name ||
        responseData?.student?.name ||
        responseData?.student_name ||
        "";

      if (responseData.token) {
        localStorage.setItem("token", responseData.token);
        localStorage.setItem("student_id", String(responseData.id));
        if (responseData.email) localStorage.setItem("student_email", String(responseData.email));
        if (responseName) localStorage.setItem("student_name", String(responseName).trim());
        
        toast.success("Login successful!");
        onSuccess({ token: responseData.token, studentId: responseData.id });
      } else if (responseData.needs_otp || responseData.otp_required) {
        if (responseData.id) localStorage.setItem("student_id", String(responseData.id));
        if (responseData.email) localStorage.setItem("student_email", String(responseData.email));
        if (responseName) localStorage.setItem("student_name", String(responseName).trim());
        onSuccess({ needsOTP: true, studentId: responseData.id });
      } else {
        toast.error(resData.message || "Login failed. Please try again.");
      }
    } catch (error: any) {
      console.error("Login failed:", error);
      toast.error(error.response?.data?.message || "Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-4 sm:p-6">
      <div className="text-center mb-5">
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">Sign In</h2>
        <p className="mt-1 text-slate-500 text-xs sm:text-sm">
          Please enter your details to sign in.
        </p>
      </div>

      <form className="space-y-4" onSubmit={handleSubmit}>
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
          required
        />

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
          required
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 bg-linear-to-r from-[#003893] to-blue-600 hover:from-blue-700 hover:to-blue-800 text-white font-bold py-2.5 sm:py-3 rounded-xl shadow-md shadow-blue-600/20 transition-all transform active:scale-[0.99] disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer text-sm"
        >
          {loading ? (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              Sign In <FaArrowRight className="text-xs" />
            </>
          )}
        </button>

        {onSwitchToSignUp && (
          <p className="text-center text-xs text-slate-500 pt-0.5">
            Don&apos;t have an account?
            <button
              type="button"
              onClick={onSwitchToSignUp}
              className="font-bold text-[#003893] hover:text-blue-700 hover:underline ml-1 cursor-pointer"
            >
              Sign Up
            </button>
          </p>
        )}
      </form>
    </div>
  );
};

export default ModalLogin;
