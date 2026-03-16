import React from "react";
import { FiChevronDown } from "react-icons/fi";
import { FaEye, FaEyeSlash } from "react-icons/fa";

interface ModernInputProps {
  label: string;
  type?: string;
  name: string;
  placeholder: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur: (e: React.FocusEvent<HTMLInputElement>) => void;
  icon: React.ReactNode;
  required?: boolean;
  error?: string;
}

export const ModernInput = ({
  label,
  type = "text",
  name,
  placeholder,
  value,
  onChange,
  onBlur,
  icon,
  required,
  error,
}: ModernInputProps) => (
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
        <span className="inline-block w-1 h-1 bg-red-600 rounded-full" />
        {error}
      </p>
    )}
  </div>
);

interface ModernSelectProps {
  label: string;
  icon: React.ReactNode;
  options: string[];
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  onBlur: (e: React.FocusEvent<HTMLSelectElement>) => void;
  required?: boolean;
  error?: string;
}

export const ModernSelect = ({
  label,
  icon,
  options,
  name,
  value,
  onChange,
  onBlur,
  required,
  error,
}: ModernSelectProps) => (
  <div className="space-y-1.5">
    <label className="text-sm font-semibold text-gray-700 ml-1">{label}</label>
    <div className="relative group">
      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 z-10 transition-colors">
        {icon}
      </div>
      <select
        name={name}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        required={required}
        className={`appearance-none w-full pl-11 pr-10 py-3.5 bg-gray-50 border rounded-xl text-gray-900 font-medium focus:bg-white focus:ring-4 transition-all outline-none text-sm cursor-pointer ${
          error
            ? "border-red-300 focus:border-red-500 focus:ring-red-100"
            : "border-gray-200 focus:border-blue-500 focus:ring-blue-500/10"
        }`}
      >
        <option value="" disabled hidden>
          Select {label}
        </option>
        {options.map((opt, idx) => (
          <option key={idx} value={opt}>
            {opt}
          </option>
        ))}
      </select>
      <FiChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
    </div>
    {error && (
      <p className="text-red-600 text-xs mt-1 ml-1 font-medium flex items-center gap-1">
        <span className="inline-block w-1 h-1 bg-red-600 rounded-full" />
        {error}
      </p>
    )}
  </div>
);

interface PasswordInputProps {
  label: string;
  name: string;
  placeholder: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur: (e: React.FocusEvent<HTMLInputElement>) => void;
  showPassword: boolean;
  setShowPassword: (show: boolean) => void;
  icon: React.ReactNode;
  required?: boolean;
  error?: string;
  showStrength?: boolean;
  strength?: { level: number; color: string; text: string };
}

export const PasswordInput = ({
  label,
  name,
  placeholder,
  value,
  onChange,
  onBlur,
  showPassword,
  setShowPassword,
  icon,
  required,
  error,
  showStrength,
  strength,
}: PasswordInputProps) => (
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
        required={required}
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
    {showStrength && value && strength && strength.level > 0 && (
      <div className="flex items-center gap-2 mt-1">
        <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-300 ${
              strength.color === "red"
                ? "bg-red-500"
                : strength.color === "yellow"
                  ? "bg-yellow-500"
                  : "bg-green-500"
            }`}
            style={{ width: `${(strength.level / 3) * 100}%` }}
          />
        </div>
        <span
          className={`text-xs font-medium ${
            strength.color === "red"
              ? "text-red-600"
              : strength.color === "yellow"
                ? "text-yellow-600"
                : "text-green-600"
          }`}
        >
          {strength.text}
        </span>
      </div>
    )}
    {error && (
      <p className="text-red-600 text-xs mt-1 ml-1 font-medium flex items-center gap-1">
        <span className="inline-block w-1 h-1 bg-red-600 rounded-full" />
        {error}
      </p>
    )}
  </div>
);
