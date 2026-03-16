'use client'

import React from "react";

const FieldError = ({ msg }: { msg?: string }) =>
  msg ? (
    <p className="text-red-600 text-xs ml-1 font-medium flex items-center gap-1">
      <span className="inline-block w-1 h-1 bg-red-600 rounded-full" />
      {msg}
    </p>
  ) : null;

const inputCls = (hasError: boolean) =>
  `w-full border rounded-xl p-3 focus:ring-2 outline-none transition ${
    hasError
      ? "border-red-300 focus:border-red-500 focus:ring-red-100"
      : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
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
  <div className="w-full max-w-5xl mx-auto bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-lg border border-gray-200 p-4 md:p-8">
    <div className="mb-6">
      <h3 className="text-2xl font-semibold text-blue-700">👤 Personal Information</h3>
      <p className="text-gray-500 text-sm mt-1">Fill in your personal and passport details</p>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="space-y-1">
        <input type="text" name="name" placeholder="Full Name" value={formData.name || ''} onChange={onChange} onBlur={onBlur} className={inputCls(!!errors.name)} />
        <FieldError msg={errors.name} />
      </div>

      <div className="space-y-1">
        <input type="email" name="email" placeholder="Email" value={formData.email || ''} onChange={onChange} onBlur={onBlur} className={inputCls(!!errors.email)} />
        <FieldError msg={errors.email} />
      </div>

      <div className="space-y-1">
        <div className="flex">
          <select name="c_code" value={formData.c_code || ''} onChange={onCountryCodeChange} onBlur={onBlur} className={`border rounded-l-xl p-3 focus:ring-2 outline-none transition ${errors.c_code ? "border-red-300 focus:border-red-500 focus:ring-red-100" : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"}`}>
            <option value="">Code</option>
            {Array.isArray(phoneCode) && phoneCode.map((code, idx) => (<option key={idx} value={code.phonecode}>+{code.phonecode}</option>))}
          </select>
          <input type="text" name="mobile" placeholder="Mobile" value={formData.mobile || ''} onChange={onChange} onBlur={onBlur} className={`border rounded-r-xl p-3 w-full focus:ring-2 outline-none transition ${errors.mobile ? "border-red-300 focus:border-red-500 focus:ring-red-100" : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"}`} />
        </div>
        <FieldError msg={errors.c_code || errors.mobile} />
      </div>

      <div className="space-y-1"><input type="text" name="father" placeholder="Father Name" value={formData.father || ''} onChange={onChange} onBlur={onBlur} className={inputCls(!!errors.father)} /><FieldError msg={errors.father} /></div>
      <div className="space-y-1"><input type="text" name="mother" placeholder="Mother Name" value={formData.mother || ''} onChange={onChange} onBlur={onBlur} className={inputCls(!!errors.mother)} /><FieldError msg={errors.mother} /></div>
      <div className="space-y-1"><input type="date" name="dob" value={formData.dob || ''} onChange={onChange} onBlur={onBlur} className={inputCls(!!errors.dob)} /><FieldError msg={errors.dob} /></div>
      <div className="space-y-1"><input type="text" name="first_language" placeholder="First Language" value={formData.first_language || ''} onChange={onChange} onBlur={onBlur} className={inputCls(!!errors.first_language)} /><FieldError msg={errors.first_language} /></div>

      <div className="space-y-1">
        <select name="nationality" value={formData.nationality || ''} onChange={onNationalityChange} onBlur={onBlur} className={inputCls(!!errors.nationality)}>
          <option value="">Country of Citizenship</option>
          {Array.isArray(countriesData) && countriesData.map((c) => (<option key={c.code} value={c.name}>{c.name}</option>))}
        </select>
        <FieldError msg={errors.nationality} />
      </div>

      <div className="space-y-1"><input type="text" name="passport_number" placeholder="Passport Number" value={formData.passport_number || ''} onChange={onChange} onBlur={onBlur} className={inputCls(!!errors.passport_number)} /><FieldError msg={errors.passport_number} /></div>
      <div className="space-y-1"><input type="date" name="passport_expiry" value={formData.passport_expiry || ''} onChange={onChange} onBlur={onBlur} className={inputCls(!!errors.passport_expiry)} /><FieldError msg={errors.passport_expiry} /></div>

      <div className="space-y-1">
        <select name="marital_status" value={formData.marital_status || ''} onChange={onChange} onBlur={onBlur} className={inputCls(!!errors.marital_status)}>
          <option value="">Select</option>
          <option value="Single">Single</option>
          <option value="Married">Married</option>
          <option value="Divorced">Divorced</option>
        </select>
        <FieldError msg={errors.marital_status} />
      </div>

      <div className="space-y-1">
        <select name="gender" value={formData.gender || ''} onChange={onChange} onBlur={onBlur} className={inputCls(!!errors.gender)}>
          <option value="">Select</option>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
          <option value="Other">Other</option>
        </select>
        <FieldError msg={errors.gender} />
      </div>
    </div>

    <div className="mt-10">
      <h3 className="text-2xl font-semibold text-blue-700 mb-2">📍 Address Detail</h3>
      <p className="text-sm text-gray-500 mb-6">ℹ️ Please make sure to enter the student's <b>residential address</b>.</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="col-span-2 space-y-1"><input type="text" name="home_address" placeholder="Enter Address" value={formData.home_address || ''} onChange={onChange} onBlur={onBlur} className={inputCls(!!errors.home_address)} /><FieldError msg={errors.home_address} /></div>
        <div className="space-y-1"><input type="text" name="city" placeholder="Enter City" value={formData.city || ''} onChange={onChange} onBlur={onBlur} className={inputCls(!!errors.city)} /><FieldError msg={errors.city} /></div>
        <div className="space-y-1"><input type="text" name="state" placeholder="Enter State" value={formData.state || ''} onChange={onChange} onBlur={onBlur} className={inputCls(!!errors.state)} /><FieldError msg={errors.state} /></div>
        <div className="space-y-1">
          <select name="country" value={formData.country || ''} onChange={onChange} onBlur={onBlur} className={inputCls(!!errors.country)}>
            <option value="">Select Country</option>
            {Array.isArray(countriesData) && countriesData.map((c) => (<option key={c.id || c.code} value={c.name}>{c.name}</option>))}
          </select>
          <FieldError msg={errors.country} />
        </div>
        <div className="space-y-1"><input type="text" name="zipcode" placeholder="Enter Postal / Zipcode" value={formData.zipcode || ''} onChange={onChange} onBlur={onBlur} className={inputCls(!!errors.zipcode)} /><FieldError msg={errors.zipcode} /></div>
        <div className="space-y-1"><input type="text" name="home_contact_number" placeholder="Enter Home Contact Number" value={formData.home_contact_number || ''} onChange={onChange} onBlur={onBlur} className={inputCls(!!errors.home_contact_number)} /><FieldError msg={errors.home_contact_number} /></div>
      </div>
    </div>

    <div className="flex justify-end gap-4 mt-8">
      <button onClick={onSave} className="px-6 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-md transition">Save</button>
      <button onClick={onCancel} className="px-6 py-2 rounded-xl bg-gray-500 hover:bg-gray-700 text-white shadow-md transition">Cancel</button>
    </div>
  </div>
);

export default PersonalInfoForm;
