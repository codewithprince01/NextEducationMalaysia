'use client'

import React, { useEffect, useMemo, useState } from "react";
import { FaEnvelope, FaArrowRight, FaArrowLeft, FaLock, FaEye, FaEyeSlash, FaCheck } from "react-icons/fa";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

const API_BASE = (process.env.NEXT_PUBLIC_API_URL || '/api/v1').replace(/\/$/, '');
const API_KEY = process.env.NEXT_PUBLIC_FRONTEND_API_KEY || "";

// Mirrors `strongPassword` in src/backend/validators/auth.ts. The server rejects
// anything these miss, so showing them up front saves a round trip — keep the
// two lists in step.
const PASSWORD_RULES: { id: string; label: string; test: (value: string) => boolean }[] = [
  { id: "length", label: "At least 8 characters", test: (v) => v.length >= 8 },
  { id: "upper", label: "One uppercase letter (A-Z)", test: (v) => /[A-Z]/.test(v) },
  { id: "lower", label: "One lowercase letter (a-z)", test: (v) => /[a-z]/.test(v) },
  { id: "number", label: "One number (0-9)", test: (v) => /\d/.test(v) },
  { id: "special", label: "One special character (! @ # $ % & …)", test: (v) => /[^A-Za-z0-9]/.test(v) },
];

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
  isVisible,
  onToggleVisibility,
}: {
  label: string;
  type: string;
  name: string;
  placeholder: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: () => void;
  icon: React.ReactNode;
  required?: boolean;
  error?: string;
  isVisible?: boolean;
  onToggleVisibility?: () => void;
}) => (
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
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${name}-error` : undefined}
        className={`w-full pl-11 ${onToggleVisibility ? "pr-12" : "pr-4"} py-3.5 border rounded-xl text-gray-900 placeholder:text-gray-400 focus:bg-white focus:ring-4 transition-all outline-none text-sm font-medium ${
          error
            ? "bg-red-50/40 border-red-300 focus:border-red-500 focus:ring-red-500/10"
            : "bg-gray-50 border-gray-200 focus:border-blue-500 focus:ring-blue-500/10"
        }`}
      />
      {onToggleVisibility && (
        <button
          type="button"
          onClick={onToggleVisibility}
          tabIndex={-1}
          aria-label={isVisible ? "Hide password" : "Show password"}
          title={isVisible ? "Hide password" : "Show password"}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-600 transition-colors cursor-pointer"
        >
          {isVisible ? <FaEyeSlash size={15} /> : <FaEye size={15} />}
        </button>
      )}
    </div>
    {error && (
      <p id={`${name}-error`} className="flex items-center gap-1.5 text-xs font-medium text-red-600 ml-1">
        <span className="w-1 h-1 rounded-full bg-red-600 shrink-0" />
        {error}
      </p>
    )}
  </div>
);

export default function ResetPasswordClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const uid = searchParams.get("uid") || "";
  const token = searchParams.get("token") || "";
  const isResetMode = useMemo(() => Boolean(uid && token), [uid, token]);

  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [touched, setTouched] = useState<{ newPassword?: boolean; confirmNewPassword?: boolean }>({});
  const [submitAttempted, setSubmitAttempted] = useState(false);

  const failedRules = PASSWORD_RULES.filter((rule) => !rule.test(newPassword));
  const passwordsMatch = newPassword === confirmNewPassword;

  // Held back until the field has been left or the form submitted, so the
  // errors do not fire on the very first keystroke.
  const newPasswordError =
    (submitAttempted || touched.newPassword) && newPassword.length > 0 && failedRules.length > 0
      ? "Password does not meet the requirements below."
      : "";
  const confirmPasswordError =
    (submitAttempted || touched.confirmNewPassword) && confirmNewPassword.length > 0 && !passwordsMatch
      ? "Passwords don't match."
      : "";

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const handleSendResetLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");

    try {
      const response = await fetch(`${API_BASE}/student/forget-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(API_KEY ? { "x-api-key": API_KEY } : {}),
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      if (!response.ok || data?.status === false) {
        setError(data?.message || "Something went wrong, please try again.");
        return;
      }

      setMessage(data?.message || "Password reset email sent successfully.");
    } catch {
      setError("Something went wrong, please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitAttempted(true);
    setMessage("");
    setError("");

    // The inline field errors and the checklist above the button already say
    // what is wrong, so the form simply refuses to submit.
    if (failedRules.length > 0 || !passwordsMatch) {
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_BASE}/student/reset-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(API_KEY ? { "x-api-key": API_KEY } : {}),
        },
        body: JSON.stringify({
          uid: Number(uid),
          token,
          new_password: newPassword,
          confirm_new_password: confirmNewPassword,
        }),
      });

      const data = await response.json();
      if (!response.ok || data?.status === false) {
        setError(data?.message || "Failed to reset password.");
        return;
      }

      setMessage(data?.message || "Password reset successful. You are now logged in.");
      setTimeout(() => router.push("/login"), 1200);
    } catch {
      setError("Failed to reset password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-white font-sans">
      <div className="hidden lg:flex lg:w-1/2 bg-blue-600 relative overflow-hidden flex-col justify-between p-16 text-white text-left">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-blue-500 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/3 opacity-50"></div>
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-indigo-600 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/3 opacity-60"></div>

        <div className="relative z-10">
          <div className="mb-6 inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full border border-white/20">
            <span className="text-xl">🔑</span>
            <span className="text-xs font-semibold tracking-wide uppercase">Secure Recovery</span>
          </div>
          <h1 className="text-5xl font-extrabold leading-tight mb-6 tracking-tight">
            Lost Your <br />{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-200 to-white">
              Password?
            </span>
          </h1>
          <p className="text-lg text-blue-100 max-w-lg leading-relaxed font-light">
            No worries! It happens to the best of us. We will help you recover your account securely.
          </p>
        </div>

        <div className="relative z-10 mt-auto pt-10 border-t border-white/10">
          <p className="text-sm font-medium text-blue-100">
            Need help? Contact support at support@educationmalaysia.com
          </p>
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12 relative bg-white">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center lg:text-left">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-blue-600 mb-6 transition-colors"
            >
              <FaArrowLeft size={12} /> Back to Login
            </Link>
            <h2 className="text-3xl font-bold text-gray-900 tracking-tight">
              {isResetMode ? "Set New Password" : "Recover Account"}
            </h2>
            <p className="mt-2 text-gray-500">
              {isResetMode
                ? "Enter your new password below."
                : "Enter your registered email address."}
            </p>
          </div>

          <form onSubmit={isResetMode ? handleResetPassword : handleSendResetLink} className="mt-8 space-y-6">
            {!isResetMode ? (
              <ModernInput
                label="Email Address"
                icon={<FaEnvelope />}
                placeholder="Enter your registered email"
                name="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            ) : (
              <>
                <ModernInput
                  label="New Password"
                  icon={<FaLock />}
                  placeholder="Enter new password"
                  name="new_password"
                  type={showNewPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  onBlur={() => setTouched((t) => ({ ...t, newPassword: true }))}
                  error={newPasswordError}
                  isVisible={showNewPassword}
                  onToggleVisibility={() => setShowNewPassword((v) => !v)}
                  required
                />
                <ModernInput
                  label="Confirm New Password"
                  icon={<FaLock />}
                  placeholder="Confirm new password"
                  name="confirm_new_password"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  onBlur={() => setTouched((t) => ({ ...t, confirmNewPassword: true }))}
                  error={confirmPasswordError}
                  isVisible={showConfirmPassword}
                  onToggleVisibility={() => setShowConfirmPassword((v) => !v)}
                  required
                />

                {/* Requirements, right above the submit button, ticking off as
                    they are met. */}
                <div className="rounded-xl border border-gray-200 bg-gray-50/70 p-4">
                  <p className="text-xs font-semibold text-gray-700 mb-2.5">Your password must contain:</p>
                  <ul className="space-y-1.5">
                    {PASSWORD_RULES.map((rule) => {
                      const passed = rule.test(newPassword);
                      return (
                        <li
                          key={rule.id}
                          className={`flex items-center gap-2 text-xs font-medium transition-colors ${
                            passed ? "text-green-600" : "text-gray-500"
                          }`}
                        >
                          {passed ? (
                            <FaCheck size={10} className="shrink-0" />
                          ) : (
                            <span className="w-1.5 h-1.5 rounded-full bg-gray-300 shrink-0" />
                          )}
                          {rule.label}
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </>
            )}

            {/* Server-side outcome sits above the button so it is not missed
                below the fold. */}
            {message && (
              <div className="p-4 rounded-xl bg-green-50 border border-green-200 text-green-700 text-sm flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                {message}
              </div>
            )}
            {error && (
              <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-red-500"></div>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-600/20 transition-all transform active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed text-base"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  {isResetMode ? "Reset Password" : "Send Recovery Link"} <FaArrowRight />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

