"use client"

import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import ModalSignUp from "./ModalSignUp";
import ModalLogin from "./ModalLogin";
import ModalOTP from "./ModalOTP";
import axios from "axios";
import { toast } from "react-toastify";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://admin.educationmalaysia.in/api';
const API_KEY = process.env.NEXT_PUBLIC_FRONTEND_API_KEY || '';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  courseId: number | string | null;
  onSuccess?: () => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, courseId, onSuccess }) => {
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

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
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
      const headers: Record<string, string> = {
        Authorization: `Bearer ${token}`,
      };
      if (API_KEY) headers['x-api-key'] = API_KEY;

      await axios.get(`${API_BASE}/student/apply-program/${courseId}`, {
        headers,
      });

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
    <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/50 px-4 overflow-y-auto py-8">
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-3xl my-auto max-h-[95vh] overflow-y-auto animate-fadeIn transform transition-all [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-red-500 transition z-10 cursor-pointer"
          aria-label="Close modal"
        >
          <X size={24} />
        </button>

        {isApplying ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-lg font-semibold text-gray-700">
              Applying for course...
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
