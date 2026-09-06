'use client'

import React from "react";
import { GraduationCap, MapPin, Calendar, Globe, Pencil, Trash2 } from "lucide-react";

const formatDate = (dateString: string) => {
  if (!dateString) return null;
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, "0");
  const month = date.toLocaleString("en-US", { month: "short" });
  const year = date.getFullYear();
  return `${day} ${month} ${year}`;
};

interface SchoolListItemProps {
  school: any;
  onExpand: (id: number) => void;
  onDelete: (id: number) => void;
}

export const SchoolListItem: React.FC<SchoolListItemProps> = ({ school, onExpand, onDelete }) => (
  <div className="p-4 sm:p-5 border border-slate-200/80 rounded-2xl bg-white hover:border-blue-200 transition shadow-xs flex flex-col sm:flex-row justify-between sm:items-start gap-4">
    <div className="flex items-start gap-3.5">
      <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 mt-0.5">
        <GraduationCap className="w-5 h-5" />
      </div>
      <div className="space-y-1.5">
        <div className="flex flex-wrap items-center gap-2">
          <h4 className="font-bold text-slate-900 text-sm sm:text-base">{school.name_of_institution}</h4>
          {school.level_of_education && (
            <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[11px] font-semibold border border-blue-200/60">
              {school.level_of_education}
            </span>
          )}
        </div>
        {school.degree_name && (
          <p className="text-xs sm:text-sm font-medium text-slate-700">{school.degree_name}</p>
        )}
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500 pt-1">
          {(school.attended_institution_from || school.attended_institution_to) && (
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              {formatDate(school.attended_institution_from)} - {formatDate(school.attended_institution_to)}
            </span>
          )}
          {school.primary_language_of_instruction && (
            <span className="flex items-center gap-1">
              <Globe className="w-3.5 h-3.5 text-slate-400" />
              {school.primary_language_of_instruction}
            </span>
          )}
          {(school.city || school.country_of_institution) && (
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              {[school.city, school.state, school.country_of_institution].filter(Boolean).join(", ")}
            </span>
          )}
        </div>
      </div>
    </div>

    <div className="flex sm:flex-col gap-2 shrink-0 self-end sm:self-auto">
      <button
        type="button"
        onClick={() => onExpand(school.id)}
        className="px-3 py-1.5 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white text-xs font-semibold transition flex items-center gap-1.5"
      >
        <Pencil className="w-3.5 h-3.5" />
        Edit
      </button>
      <button
        type="button"
        onClick={() => onDelete(school.id)}
        className="px-3 py-1.5 rounded-xl bg-rose-50 text-rose-700 hover:bg-rose-600 hover:text-white text-xs font-semibold transition flex items-center gap-1.5"
      >
        <Trash2 className="w-3.5 h-3.5" />
        Delete
      </button>
    </div>
  </div>
);

interface SchoolFormFieldsProps {
  formData: any;
  handleChange: (e: React.ChangeEvent<any>) => void;
  handleBlur: (field: string) => void;
  errors: any;
}

export const SchoolFormFields: React.FC<SchoolFormFieldsProps> = ({ formData, handleChange, handleBlur, errors }) => {
  const inputClass = (field: string) =>
    `w-full rounded-xl border px-3.5 py-2.5 text-sm transition-all outline-none ${
      errors[field]
        ? "border-rose-300 bg-rose-50/40 text-rose-900 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/15"
        : "border-slate-200 bg-slate-50/50 text-slate-800 hover:border-slate-300 focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-500/15"
    }`;

  const renderError = (field: string) =>
    errors[field] && (
      <p className="text-rose-600 text-xs ml-1 font-medium flex items-center gap-1">
        <span className="inline-block w-1 h-1 bg-rose-600 rounded-full" />
        {errors[field]}
      </p>
    );

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-slate-700">
            Country of Institution <span className="text-rose-500">*</span>
          </label>
          <select
            name="country_of_institution"
            value={formData.country_of_institution}
            onChange={handleChange}
            onBlur={() => handleBlur("country_of_institution")}
            className={inputClass("country_of_institution")}
          >
            <option value="">Select Country</option>
            <option value="INDIA">India</option>
            <option value="MALAYSIA">Malaysia</option>
            <option value="BANGLADESH">Bangladesh</option>
            <option value="NEPAL">Nepal</option>
            <option value="NIGERIA">Nigeria</option>
            <option value="PAKISTAN">Pakistan</option>
            <option value="SRI LANKA">Sri Lanka</option>
            <option value="INDONESIA">Indonesia</option>
            <option value="CHINA">China</option>
            <option value="UNITED KINGDOM">United Kingdom</option>
            <option value="UNITED STATES">United States</option>
          </select>
          {renderError("country_of_institution")}
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-slate-700">
            Name of Institution <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            name="name_of_institution"
            value={formData.name_of_institution}
            onChange={handleChange}
            onBlur={() => handleBlur("name_of_institution")}
            placeholder="e.g. University of Malaya"
            className={inputClass("name_of_institution")}
          />
          {renderError("name_of_institution")}
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-slate-700">
            Level of Education <span className="text-rose-500">*</span>
          </label>
          <select
            name="level_of_education"
            value={formData.level_of_education}
            onChange={handleChange}
            onBlur={() => handleBlur("level_of_education")}
            className={inputClass("level_of_education")}
          >
            <option value="">Select Level</option>
            <option value="POST-GRADUATE">Post Graduate</option>
            <option value="UNDER-GRADUATE">Under Graduate</option>
            <option value="SECONDARY">Secondary</option>
            <option value="DIPLOMA">Diploma</option>
          </select>
          {renderError("level_of_education")}
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-slate-700">
            Primary Language of Instruction <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            name="primary_language_of_instruction"
            value={formData.primary_language_of_instruction}
            onChange={handleChange}
            onBlur={() => handleBlur("primary_language_of_instruction")}
            placeholder="e.g. English"
            className={inputClass("primary_language_of_instruction")}
          />
          {renderError("primary_language_of_instruction")}
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-slate-700">
            Attended From <span className="text-rose-500">*</span>
          </label>
          <input
            type="date"
            name="attended_institution_from"
            value={formData.attended_institution_from}
            onChange={handleChange}
            onBlur={() => handleBlur("attended_institution_from")}
            className={inputClass("attended_institution_from")}
          />
          {renderError("attended_institution_from")}
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-slate-700">
            Attended To <span className="text-rose-500">*</span>
          </label>
          <input
            type="date"
            name="attended_institution_to"
            value={formData.attended_institution_to}
            onChange={handleChange}
            onBlur={() => handleBlur("attended_institution_to")}
            className={inputClass("attended_institution_to")}
          />
          {renderError("attended_institution_to")}
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-slate-700">Graduation Date</label>
          <input
            type="date"
            name="graduation_date"
            value={formData.graduation_date}
            onChange={handleChange}
            className={inputClass("graduation_date")}
          />
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-slate-700">
            Degree Name <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            name="degree_name"
            value={formData.degree_name}
            onChange={handleChange}
            onBlur={() => handleBlur("degree_name")}
            placeholder="e.g. Bachelor of Computer Science"
            className={inputClass("degree_name")}
          />
          {renderError("degree_name")}
        </div>
      </div>

      <div className="pt-2 flex flex-wrap items-center gap-6">
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold text-slate-700">Graduated:</span>
          {['YES', 'NO'].map((opt) => (
            <label key={opt} className="flex items-center gap-1.5 text-xs text-slate-700 cursor-pointer">
              <input
                type="radio"
                name="graduated"
                value={opt}
                checked={formData.graduated === opt}
                onChange={handleChange}
                className="accent-blue-600"
              />
              {opt === 'YES' ? 'Yes' : 'No'}
            </label>
          ))}
        </div>

        <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
          <input
            type="checkbox"
            name="graduated_from_this"
            checked={!!formData.graduated_from_this}
            onChange={handleChange}
            className="rounded accent-blue-600"
          />
          I have the physical certificate for this degree
        </label>
      </div>

      <div className="pt-4 border-t border-slate-100">
        <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3">Institution Address</h4>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="space-y-1.5 md:col-span-2">
            <label className="block text-xs font-semibold text-slate-700">
              Address <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              onBlur={() => handleBlur("address")}
              placeholder="Campus address / street"
              className={inputClass("address")}
            />
            {renderError("address")}
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700">
              City <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              name="city"
              value={formData.city}
              onChange={handleChange}
              onBlur={() => handleBlur("city")}
              placeholder="City"
              className={inputClass("city")}
            />
            {renderError("city")}
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700">Zip / Postal Code</label>
            <input
              type="text"
              name="zipcode"
              value={formData.zipcode}
              onChange={handleChange}
              onBlur={() => handleBlur("zipcode")}
              placeholder="Postal code"
              className={inputClass("zipcode")}
            />
            {renderError("zipcode")}
          </div>
        </div>
      </div>
    </div>
  );
};
