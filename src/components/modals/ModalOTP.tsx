"use client"

import React, { useState } from "react";
import { KeyRound } from "lucide-react";
import axios from "axios";
import { toast } from "react-toastify";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://admin.educationmalaysia.in/api';

interface ModalOTPProps {
  studentId: any;
  onSuccess: (data: any) => void;
}

const ModalOTP: React.FC<ModalOTPProps> = ({ studentId, onSuccess }) => {
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const id = studentId || localStorage.getItem("student_id");
      if (!id) {
        toast.error("No student ID found. Please register first.");
        return;
      }

      setLoading(true);

      const response = await axios.post(`${API_BASE}/student/verify-otp`, {
        id: id,
        otp,
      });

      const resData: any = response.data;
      const responseData = resData.data || resData;

      if (responseData.token) {
        localStorage.setItem("token", responseData.token);
        localStorage.setItem("student_email", responseData.email);

        toast.success(resData.message || "OTP Verified Successfully!");

        // Call onSuccess to trigger course application
        if (onSuccess) {
          onSuccess({ token: responseData.token });
        }
      } else if (resData.message) {
        toast.error(resData.message);
      } else {
        toast.error("OTP Verification Failed");
      }
    } catch (error: any) {
      console.error("OTP Verification failed:", error);
      if (error.response) {
        toast.error(error.response.data.message || "Invalid OTP or expired.");
      } else {
        toast.error("Network error. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    try {
      setLoading(true);
      const id = studentId || localStorage.getItem("student_id");

      const response = await axios.post(`${API_BASE}/student/resend-otp`, {
        id: id,
      });

      if (response.data) {
        setMessage("📩 New OTP sent to your email!");
        toast.success("New OTP sent to your email!");
      }
    } catch (error) {
      console.error("Resend OTP failed:", error);
      setMessage("Failed to resend OTP");
      toast.error("Failed to resend OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Confirm Email</h2>
        <p className="text-sm text-gray-600 mt-2">
          An OTP has been sent to your registered email
        </p>
        <p className="text-xs text-gray-500 mt-1">
          OTP will expire in <span className="font-semibold">5 minutes</span>
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="flex items-center border border-gray-200 rounded-xl px-4 py-3 focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-500/10 transition-all">
          <KeyRound className="w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Enter OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            className="w-full ml-3 outline-none text-gray-900 font-medium"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3.5 rounded-xl transition-all shadow-lg shadow-blue-600/20 disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto" />
          ) : (
            "Verify OTP"
          )}
        </button>

        <button
          type="button"
          onClick={handleResend}
          disabled={loading}
          className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 rounded-xl transition-all disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
        >
          Resend OTP
        </button>

        {message && (
          <p className="text-center text-sm text-gray-700 mt-4">{message}</p>
        )}
      </form>
    </div>
  );
};

export default ModalOTP;
