'use client'

import React from "react";
import { User, MapPin } from "lucide-react";

const FieldError = ({ msg }: { msg?: string }) =>
  msg ? (
    <p className="text-red-600 text-xs ml-0.5 mt-1 font-medium flex items-center gap-1">
      <span className="inline-block w-1 h-1 bg-red-600 rounded-full" />
      {msg}
    </p>
  ) : null;

const inputCls = (hasError: boolean) =>
  `w-full border rounded-xl px-3.5 py-2.5 text-sm font-medium outline-none transition-all ${
    hasError
      ? "border-red-300 bg-red-50/30 focus:border-red-500 focus:ring-2 focus:ring-red-100 text-slate-900"
      : "border-slate-200 bg-slate-50/50 hover:bg-white focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-500/15 text-slate-900"
  }`;

interface PersonalInfoFormProps {
  formData: any;
  errors: any;
  countriesData: any[];
  phoneCode: any[];
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  onBlur: (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => void;
  onNationalityChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  onCountryCodeChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  onSave: () => void;
  onCancel: () => void;
}

const PersonalInfoForm = ({
  formData,
  errors,
  countriesData,
  phoneCode,
  onChange,
  onBlur,
  onNationalityChange,
  onCountryCodeChange,
  onSave,
  onCancel,
}: PersonalInfoFormProps) => (
  <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 sm:p-7">
    {/* Section Header */}
    <div className="flex items-center gap-3 pb-4 mb-6 border-b border-slate-100">
      <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center shrink-0">
        <User className="w-5 h-5" />
      </div>
      <div>
        <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
          Personal Information
        </h3>
        <p className="text-xs text-slate-500 font-medium">
          Fill in your personal identity, contact, and passport details
        </p>
      </div>
    </div>

    {/* Form Fields Grid */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
      {/* Full Name */}
      <div>
        <label className="block text-xs font-semibold text-slate-700 mb-1">
          Full Name <span className="text-rose-500">*</span>
        </label>
        <input
          type="text"
          name="name"
          placeholder="e.g. John Doe"
          value={formData.name || ''}
          onChange={onChange}
          onBlur={onBlur}
          className={inputCls(!!errors.name)}
        />
        <FieldError msg={errors.name} />
      </div>

      {/* Email */}
      <div>
        <label className="block text-xs font-semibold text-slate-700 mb-1">
          Email Address <span className="text-rose-500">*</span>
        </label>
        <input
          type="email"
          name="email"
          placeholder="e.g. john@example.com"
          value={formData.email || ''}
          onChange={onChange}
          onBlur={onBlur}
          className={inputCls(!!errors.email)}
        />
        <FieldError msg={errors.email} />
      </div>

      {/* Mobile with Country Code */}
      <div>
        <label className="block text-xs font-semibold text-slate-700 mb-1">
          Mobile Number <span className="text-rose-500">*</span>
        </label>
        <div className="flex gap-2">
          <select
            name="c_code"
            value={formData.c_code || ''}
            onChange={onCountryCodeChange}
            onBlur={onBlur}
            className={`w-28 shrink-0 border rounded-xl px-2.5 py-2.5 text-sm font-medium outline-none transition-all ${
              errors.c_code
                ? "border-red-300 bg-red-50/30 focus:border-red-500"
                : "border-slate-200 bg-slate-50/50 focus:bg-white focus:border-blue-600"
            }`}
          >
            <option value="">Code</option>
            {Array.isArray(phoneCode) &&
              phoneCode.map((code, idx) => (
                <option
                  key={`${code?.id ?? code?.iso ?? code?.phonecode ?? 'pc'}-${idx}`}
                  value={code.phonecode}
                >
                  +{code.phonecode}
                </option>
              ))}
          </select>
          <input
            type="text"
            name="mobile"
            placeholder="Mobile Number"
            value={formData.mobile || ''}
            onChange={onChange}
            onBlur={onBlur}
            className={`flex-1 ${inputCls(!!errors.mobile)}`}
          />
        </div>
        <FieldError msg={errors.c_code || errors.mobile} />
      </div>

      {/* Father Name */}
      <div>
        <label className="block text-xs font-semibold text-slate-700 mb-1">
          Father Name <span className="text-rose-500">*</span>
        </label>
        <input
          type="text"
          name="father"
          placeholder="Enter Father Name"
          value={formData.father || ''}
          onChange={onChange}
          onBlur={onBlur}
          className={inputCls(!!errors.father)}
        />
        <FieldError msg={errors.father} />
      </div>

      {/* Mother Name */}
      <div>
        <label className="block text-xs font-semibold text-slate-700 mb-1">
          Mother Name <span className="text-rose-500">*</span>
        </label>
        <input
          type="text"
          name="mother"
          placeholder="Enter Mother Name"
          value={formData.mother || ''}
          onChange={onChange}
          onBlur={onBlur}
          className={inputCls(!!errors.mother)}
        />
        <FieldError msg={errors.mother} />
      </div>

      {/* Date of Birth */}
      <div>
        <label className="block text-xs font-semibold text-slate-700 mb-1">
          Date of Birth <span className="text-rose-500">*</span>
        </label>
        <input
          type="date"
          name="dob"
          value={formData.dob || ''}
          onChange={onChange}
          onBlur={onBlur}
          className={inputCls(!!errors.dob)}
        />
        <FieldError msg={errors.dob} />
      </div>

      {/* First Language */}
      <div>
        <label className="block text-xs font-semibold text-slate-700 mb-1">
          First Language <span className="text-rose-500">*</span>
        </label>
        <input
          type="text"
          name="first_language"
          placeholder="e.g. English, Malay, Hindi"
          value={formData.first_language || ''}
          onChange={onChange}
          onBlur={onBlur}
          className={inputCls(!!errors.first_language)}
        />
        <FieldError msg={errors.first_language} />
      </div>

      {/* Country of Citizenship */}
      <div>
        <label className="block text-xs font-semibold text-slate-700 mb-1">
          Country of Citizenship <span className="text-rose-500">*</span>
        </label>
        <select
          name="nationality"
          value={formData.nationality || ''}
          onChange={onNationalityChange}
          onBlur={onBlur}
          className={inputCls(!!errors.nationality)}
        >
          <option value="">Select Country</option>
          {Array.isArray(countriesData) &&
            countriesData.map((c, idx) => (
              <option
                key={`${c?.id ?? c?.code ?? c?.name ?? 'country'}-${idx}`}
                value={c.name}
              >
                {c.name}
              </option>
            ))}
        </select>
        <FieldError msg={errors.nationality} />
      </div>

      {/* Passport Number */}
      <div>
        <label className="block text-xs font-semibold text-slate-700 mb-1">
          Passport Number <span className="text-rose-500">*</span>
        </label>
        <input
          type="text"
          name="passport_number"
          placeholder="e.g. A12345678"
          value={formData.passport_number || ''}
          onChange={onChange}
          onBlur={onBlur}
          className={inputCls(!!errors.passport_number)}
        />
        <FieldError msg={errors.passport_number} />
      </div>

      {/* Passport Expiry */}
      <div>
        <label className="block text-xs font-semibold text-slate-700 mb-1">
          Passport Expiry Date <span className="text-rose-500">*</span>
        </label>
        <input
          type="date"
          name="passport_expiry"
          value={formData.passport_expiry || ''}
          onChange={onChange}
          onBlur={onBlur}
          className={inputCls(!!errors.passport_expiry)}
        />
        <FieldError msg={errors.passport_expiry} />
      </div>

      {/* Marital Status */}
      <div>
        <label className="block text-xs font-semibold text-slate-700 mb-1">
          Marital Status <span className="text-rose-500">*</span>
        </label>
        <select
          name="marital_status"
          value={formData.marital_status || ''}
          onChange={onChange}
          onBlur={onBlur}
          className={inputCls(!!errors.marital_status)}
        >
          <option value="">Select Status</option>
          <option value="Single">Single</option>
          <option value="Married">Married</option>
          <option value="Divorced">Divorced</option>
        </select>
        <FieldError msg={errors.marital_status} />
      </div>

      {/* Gender */}
      <div>
        <label className="block text-xs font-semibold text-slate-700 mb-1">
          Gender <span className="text-rose-500">*</span>
        </label>
        <select
          name="gender"
          value={formData.gender || ''}
          onChange={onChange}
          onBlur={onBlur}
          className={inputCls(!!errors.gender)}
        >
          <option value="">Select Gender</option>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
          <option value="Other">Other</option>
        </select>
        <FieldError msg={errors.gender} />
      </div>
    </div>

    {/* Address Detail Sub-section */}
    <div className="mt-8 pt-6 border-t border-slate-100">
      <div className="flex items-center gap-2.5 mb-4">
        <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
          <MapPin className="w-4 h-4" />
        </div>
        <div>
          <h4 className="text-sm font-bold text-slate-900">Residential Address</h4>
          <p className="text-xs text-slate-500">Please make sure to enter the student&apos;s current residential address.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
        <div className="col-span-1 md:col-span-2">
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Home Address <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            name="home_address"
            placeholder="Street address, building, apartment..."
            value={formData.home_address || ''}
            onChange={onChange}
            onBlur={onBlur}
            className={inputCls(!!errors.home_address)}
          />
          <FieldError msg={errors.home_address} />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            City <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            name="city"
            placeholder="Enter City"
            value={formData.city || ''}
            onChange={onChange}
            onBlur={onBlur}
            className={inputCls(!!errors.city)}
          />
          <FieldError msg={errors.city} />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            State / Province <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            name="state"
            placeholder="Enter State"
            value={formData.state || ''}
            onChange={onChange}
            onBlur={onBlur}
            className={inputCls(!!errors.state)}
          />
          <FieldError msg={errors.state} />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Country <span className="text-rose-500">*</span>
          </label>
          <select
            name="country"
            value={formData.country || ''}
            onChange={onChange}
            onBlur={onBlur}
            className={inputCls(!!errors.country)}
          >
            <option value="">Select Country</option>
            {Array.isArray(countriesData) &&
              countriesData.map((c, idx) => (
                <option
                  key={`${c?.id ?? c?.code ?? c?.name ?? 'country2'}-${idx}`}
                  value={c.name}
                >
                  {c.name}
                </option>
              ))}
          </select>
          <FieldError msg={errors.country} />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Postal / Zip Code <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            name="zipcode"
            placeholder="Enter Zipcode"
            value={formData.zipcode || ''}
            onChange={onChange}
            onBlur={onBlur}
            className={inputCls(!!errors.zipcode)}
          />
          <FieldError msg={errors.zipcode} />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Home Contact Number <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            name="home_contact_number"
            placeholder="Enter Contact Number"
            value={formData.home_contact_number || ''}
            onChange={onChange}
            onBlur={onBlur}
            className={inputCls(!!errors.home_contact_number)}
          />
          <FieldError msg={errors.home_contact_number} />
        </div>
      </div>
    </div>

    {/* Actions */}
    <div className="flex items-center justify-end gap-3 pt-6 mt-6 border-t border-slate-100">
      <button
        type="button"
        onClick={onCancel}
        className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs sm:text-sm transition-all cursor-pointer"
      >
        Reset Form
      </button>
      <button
        type="button"
        onClick={onSave}
        className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm shadow-sm hover:shadow transition-all active:scale-95 cursor-pointer"
      >
        Save Personal Info
      </button>
    </div>
  </div>
);

export default PersonalInfoForm;

