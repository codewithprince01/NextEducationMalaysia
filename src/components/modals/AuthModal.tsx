"use client"

import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import ModalSignUp from "./ModalSignUp";
import ModalLogin from "./ModalLogin";
import ModalOTP from "./ModalOTP";
import { apiGetWithFallback } from "./authApi";
import { toast } from "react-toastify";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  courseId: number | string | null;
  courseData?: any;
  onSuccess?: () => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, courseId, courseData, onSuccess }) => {
  const [authStep, setAuthStep] = useState<"signup" | "login" | "otp">("signup");
  const [studentId, setStudentId] = useState<any>(null);
  const [isApplying, setIsApplying] = useState(false);

  // Check if user is already registered on mount
  useEffect(() => {
    if (isOpen) {
      const token = localStorage.getItem("token");
      if (token) {
        // User is already logged in, shouldn't show modal
        onClose();
        return;
      }
      // Default to signup for new users
      setAuthStep("signup");
    }
  }, [isOpen, onClose]);

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setAuthStep("signup");
      setStudentId(null);
      setIsApplying(false);
    }
  }, [isOpen]);

  // Prevent body & html scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      const prevBodyOverflow = document.body.style.overflow;
      const prevHtmlOverflow = document.documentElement.style.overflow;
      document.body.style.overflow = "hidden";
      document.documentElement.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prevBodyOverflow || "unset";
        document.documentElement.style.overflow = prevHtmlOverflow || "unset";
      };
    }
  }, [isOpen]);

  const applyCourse = async (token: string, showLoader = true) => {
    if (!courseId) {
      console.error("No course ID provided");
      return;
    }

    if (showLoader) {
      setIsApplying(true);
    }

    try {
      await apiGetWithFallback(`/student/apply-program/${courseId}`, token);

      toast.success("Course applied successfully!");

      if (onSuccess) {
        onSuccess();
      }

      onClose();
    } catch (error: any) {
      if (error.response?.status === 409) {
        toast.warn("You have already applied for this course.");
        if (onSuccess) {
          onSuccess();
        }
        onClose();
      } else {
        console.error("Course application failed:", error);
        toast.error("Failed to apply for course. Please try again.");
      }
    } finally {
      if (showLoader) {
        setIsApplying(false);
      }
    }
  };

  const handleSignUpSuccess = (sId: any) => {
    setStudentId(sId);
    setAuthStep("otp");
  };

  const handleLoginSuccess = (data: any) => {
    if (data.needsOTP) {
      setStudentId(data.studentId);
      setAuthStep("otp");
    } else if (data.token) {
      toast.success("Login successfully!");
      onClose();
      // Login successful, apply course in background
      applyCourse(data.token, false);
    }
  };

  const handleOTPSuccess = (data: any) => {
    if (data.token) {
      toast.success("Login successfully!");
      onClose();
      // OTP verified, apply course in background
      applyCourse(data.token, false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100000] flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-3 overflow-y-auto sm:overflow-hidden">
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-xl sm:max-w-2xl my-auto border border-slate-200 overflow-hidden animate-fadeIn">
        
        {/* ── HEADER (CENTERED CONTENT) ── */}
        <div className="relative px-5 sm:px-10 pt-4 pb-3 sm:pt-7 sm:pb-5 bg-slate-50/70 border-b border-slate-150 text-center">
          {/* Close Button */}
          <button
            type="button"
            onClick={onClose}
            className="absolute top-3 right-3 sm:top-5 sm:right-5 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors flex items-center justify-center border border-slate-200 shadow-2xs cursor-pointer outline-none focus:outline-none z-10"
            aria-label="Close modal"
          >
            <X size={15} className="sm:hidden" />
            <X size={18} className="hidden sm:block" />
          </button>

          {/* Main Headline */}
          <h2 className="font-bold text-slate-900 leading-snug max-w-lg mx-auto">
            <span className="block text-[15px] sm:text-[19px] md:text-[21px]">Apply to up to 5</span>
            <span className="block text-[15px] sm:text-[19px] md:text-[21px]">Malaysian universities</span>
            <span className="block text-[13.5px] sm:text-[17px] md:text-[19px] whitespace-nowrap">through one application process.</span>
          </h2>

          {/* Subtitle */}
          <p className="text-[11.5px] sm:text-[13.5px] text-slate-600 mt-1.5 sm:mt-2 leading-normal sm:leading-relaxed max-w-lg mx-auto">
            Receive personalised guidance and, subject to eligibility and document verification, receive your offer letter in as little as{" "}
            <span className="font-semibold text-[#003893] whitespace-nowrap">7 working days.</span>
          </p>
        </div>

        {/* ── CLEAN CENTERED TABS ── */}
        {authStep !== "otp" && !isApplying && (
          <div className="flex justify-center border-b border-slate-200 px-6 bg-white gap-8 sm:gap-12">
            <button
              type="button"
              onClick={() => setAuthStep("signup")}
              className={`pb-2 pt-2 sm:pb-2.5 sm:pt-2.5 text-xs sm:text-[13.5px] font-bold border-b-2 transition-all outline-none focus:outline-none select-none cursor-pointer ${
                authStep === "signup"
                  ? "border-[#003893] text-[#003893]"
                  : "border-transparent text-slate-400 hover:text-slate-700"
              }`}
            >
              Create Account
            </button>
            <button
              type="button"
              onClick={() => setAuthStep("login")}
              className={`pb-2 pt-2 sm:pb-2.5 sm:pt-2.5 text-xs sm:text-[13.5px] font-bold border-b-2 transition-all outline-none focus:outline-none select-none cursor-pointer ${
                authStep === "login"
                  ? "border-[#003893] text-[#003893]"
                  : "border-transparent text-slate-400 hover:text-slate-700"
              }`}
            >
              Sign In
            </button>
          </div>
        )}

        {/* ── MODAL BODY (SIGNUP / LOGIN / OTP) ── */}
        {isApplying ? (
          <div className="p-12 text-center">
            <div className="w-14 h-14 border-4 border-[#003893] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-base font-bold text-slate-800">
              Submitting your application...
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Please wait while we connect with the university admissions system.
            </p>
          </div>
        ) : (
          <>
            {authStep === "signup" && (
              <ModalSignUp
                onSuccess={handleSignUpSuccess}
                onSwitchToLogin={() => setAuthStep("login")}
              />
            )}

            {authStep === "login" && (
              <ModalLogin
                onSuccess={handleLoginSuccess}
                onSwitchToSignUp={() => setAuthStep("signup")}
              />
            )}

            {authStep === "otp" && (
              <ModalOTP studentId={studentId} onSuccess={handleOTPSuccess} />
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AuthModal;
