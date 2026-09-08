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
    <div className="fixed inset-0 z-[100000] flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-2 sm:p-4 overflow-y-auto">
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg sm:max-w-xl my-auto border border-slate-200 overflow-hidden animate-fadeIn max-h-[95vh] flex flex-col">
        
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-3 right-3 sm:top-4 sm:right-4 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-400 hover:text-slate-700 transition-colors flex items-center justify-center cursor-pointer outline-none focus:outline-none z-20"
          aria-label="Close modal"
        >
          <X size={16} />
        </button>

        {/* ── CLEAN CENTERED TOP HEADER ── */}
        <div className="px-4 sm:px-6 pt-4 pb-1 sm:pt-4.5 sm:pb-1.5 bg-white text-center shrink-0">
          {/* Main Headline */}
          <h2 className="text-[16px] sm:text-[19px] md:text-[21px] font-extrabold text-slate-900 tracking-tight leading-snug text-center max-w-lg mx-auto">
            Apply to <span className="text-blue-600">Malaysian Universities</span><br className="hidden sm:inline" /> through one application process.
          </h2>

          {/* Subtitle */}
          <p className="text-[11px] sm:text-[12px] text-slate-500 mt-1 sm:mt-1.5 leading-relaxed max-w-md mx-auto text-center font-normal">
            Receive personalised guidance and, subject to eligibility and document verification, receive your offer letter in as little as{" "}
            <span className="font-semibold text-blue-600 whitespace-nowrap">7 working days.</span>
          </p>
        </div>

        {/* ── CLEAN CENTERED TABS ── */}
        {authStep !== "otp" && !isApplying && (
          <div className="flex justify-center border-b border-slate-200 px-4 bg-white gap-6 sm:gap-8 shrink-0">
            <button
              type="button"
              onClick={() => setAuthStep("signup")}
              className={`pb-2 pt-0.5 text-xs sm:text-[13px] font-bold border-b-2 transition-all outline-none focus:outline-none select-none cursor-pointer ${
                authStep === "signup"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-slate-400 hover:text-slate-700"
              }`}
            >
              Create Account
            </button>
            <button
              type="button"
              onClick={() => setAuthStep("login")}
              className={`pb-2 pt-0.5 text-xs sm:text-[13px] font-bold border-b-2 transition-all outline-none focus:outline-none select-none cursor-pointer ${
                authStep === "login"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-slate-400 hover:text-slate-700"
              }`}
            >
              Sign In
            </button>
          </div>
        )}

        {/* ── MODAL BODY (SIGNUP / LOGIN / OTP) ── */}
        <div className="overflow-y-auto flex-1">
          {isApplying ? (
            <div className="p-8 text-center">
              <div className="w-12 h-12 border-4 border-[#003893] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-sm font-bold text-slate-800">
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
                  courseData={courseData}
                  courseId={courseId}
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
    </div>
  );
};

export default AuthModal;
