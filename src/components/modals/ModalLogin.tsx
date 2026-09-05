"use client"

import React, { useState } from 'react'
import { FaEnvelope, FaLock, FaArrowRight } from 'react-icons/fa'
import { ModernInput, PasswordInput } from '@/components/auth/AuthFormInputs'
import { apiPostWithFallback } from './authApi'
import { toast } from 'react-toastify'

interface ModalLoginProps {
  onSuccess: (data: any) => void;
  onSwitchToSignUp: () => void;
}

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
      const response = await apiPostWithFallback('/student/login', formData);
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
    <div className="w-full max-w-md mx-auto px-5 sm:px-6 py-4">
      <form className="space-y-3" onSubmit={handleSubmit}>
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
          compact
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
          compact
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 bg-linear-to-r from-[#003893] to-blue-600 hover:from-blue-700 hover:to-blue-800 text-white font-bold py-2 sm:py-2.5 rounded-lg shadow-md shadow-blue-600/20 transition-all transform active:scale-[0.99] disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer text-xs sm:text-[13px]"
        >
          {loading ? (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              Sign In <FaArrowRight className="text-[11px]" />
            </>
          )}
        </button>

        {onSwitchToSignUp && (
          <p className="text-center text-[11px] text-slate-500 pt-0.5">
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
