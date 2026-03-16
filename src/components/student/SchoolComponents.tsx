'use client'

import React from "react";

const formatDate = (dateString: string) => {
  if (!dateString) return null;
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, "0");
  const month = date.toLocaleString("en-US", { month: "short" });
  const year = date.getFullYear();
  return `${day} ${month} , ${year}`;
};

interface SchoolListItemProps {
  school: any;
  onExpand: (id: number) => void;
  onDelete: (id: number) => void;
}

export const SchoolListItem: React.FC<SchoolListItemProps> = ({ school, onExpand, onDelete }) => (
  <div className="p-4 border border-gray-100 rounded-xl shadow-sm bg-white flex justify-between items-start transition hover:shadow-md">
    <div className="space-y-1">
      <p className="font-bold text-gray-900 text-lg">{school.name_of_institution}</p>
      <p className="text-blue-700 font-medium">{school.degree_name}</p>
      {school.graduation_date && (
        <p className="text-sm text-gray-600">
          Graduated: {formatDate(school.graduation_date)}
        </p>
      )}
      <p className="text-sm text-gray-600">
        <span className="font-semibold text-gray-700">Level:</span> {school.level_of_education}
      </p>
      {school.attended_institution_from && school.attended_institution_to && (
        <p className="text-sm text-gray-600">
          Attended: {formatDate(school.attended_institution_from)} to {formatDate(school.attended_institution_to)}
        </p>
      )}
      <p className="text-sm text-gray-600">
        <span className="font-semibold text-gray-700">Language:</span> {school.primary_language_of_instruction}
      </p>
      <p className="text-sm text-gray-600">
        <span className="font-semibold text-gray-700">Address:</span> {school.address}, {school.city}, {school.state} {school.zipcode}
      </p>
      <p className="text-xs text-blue-600 font-semibold uppercase tracking-wider">{school.country_of_institution}</p>
    </div>

    <div className="flex flex-col gap-2 items-end">
      <button
        onClick={() => onExpand(school.id)}
        className="bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold px-4 py-1.5 rounded-lg transition active:scale-95"
      >
        Expand
      </button>
      <button
        onClick={() => onDelete(school.id)}
        className="bg-red-50 hover:bg-red-100 text-red-600 text-xs font-semibold px-4 py-1.5 rounded-lg transition active:scale-95 border border-red-100"
      >
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
    `w-full rounded-xl border bg-white px-4 py-2.5 shadow-sm focus:ring-2 outline-none transition text-sm ${
      errors[field]
        ? "border-red-300 focus:border-red-500 focus:ring-red-100"
        : "border-gray-200 focus:ring-blue-500/20 focus:border-blue-500"
    }`;

  const renderError = (field: string) =>
    errors[field] && (
      <p className="text-red-600 text-xs ml-1 font-medium flex items-center gap-1">
        <span className="inline-block w-1 h-1 bg-red-600 rounded-full"></span>
        {errors[field]}
      </p>
    );

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Country */}
        <div className="space-y-1">
          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
            Country of Institution *
          </label>
          <select
            name="country_of_institution"
            value={formData.country_of_institution}
            onChange={handleChange}
            onBlur={() => handleBlur("country_of_institution")}
            className={inputClass("country_of_institution")}
          >
            <option value="">Select</option>
            <option value="INDIA">India</option>
            <option value="MALAYSIA">Malaysia</option>
            <option value="BANGLADESH">Bangladesh</option>
            <option value="NEPAL">Nepal</option>
            <option value="NIGERIA">Nigeria</option>
            <option value="PAKISTAN">Pakistan</option>
            <option value="SRI LANKA">Sri Lanka</option>
          </select>
          {renderError("country_of_institution")}
        </div>

        {/* Institution Name */}
        <div className="space-y-1">
          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
            Name of Institution *
          </label>
          <input
            type="text"
            name="name_of_institution"
            value={formData.name_of_institution}
            onChange={handleChange}
            onBlur={() => handleBlur("name_of_institution")}
            placeholder="Enter Institution Name"
            className={inputClass("name_of_institution")}
          />
          {renderError("name_of_institution")}
        </div>

        {/* Level */}
        <div className="space-y-1">
          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
            Level of Education *
          </label>
          <select
            name="level_of_education"
            value={formData.level_of_education}
            onChange={handleChange}
            onBlur={() => handleBlur("level_of_education")}
            className={inputClass("level_of_education")}
          >
            <option value="">Select</option>
            <option value="POST-GRADUATE">Post Graduate</option>
            <option value="UNDER-GRADUATE">Under Graduate</option>
            <option value="SECONDARY">Secondary</option>
            <option value="DIPLOMA">Diploma</option>
          </select>
          {renderError("level_of_education")}
        </div>

        {/* Language */}
        <div className="space-y-1">
          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
            Primary Language *
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

        {/* Dates */}
        <div className="space-y-1">
          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
            Attended From *
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

        <div className="space-y-1">
          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
            Attended To *
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

        <div className="space-y-1">
          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
            Graduation Date
          </label>
          <input
            type="date"
            name="graduation_date"
            value={formData.graduation_date}
            onChange={handleChange}
            className="w-full rounded-xl border border-gray-200 px-4 py-2.5 shadow-sm focus:ring-2 focus:ring-blue-500/20 outline-none transition text-sm bg-white"
          />
        </div>

        <div className="space-y-1">
          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
            Degree Name *
          </label>
          <input
            type="text"
            name="degree_name"
            value={formData.degree_name}
            onChange={handleChange}
            onBlur={() => handleBlur("degree_name")}
            placeholder="e.g. Bachelor of Science"
            className={inputClass("degree_name")}
          />
          {renderError("degree_name")}
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-8">
        <div>
          <p className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-3">
            I have graduated from this institution *
          </p>
          <div className="flex gap-8">
            {["YES", "NO"].map((opt) => (
              <label key={opt} className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="radio"
                  name="graduated"
                  value={opt}
                  checked={formData.graduated === opt}
                  onChange={handleChange}
                  className="w-4 h-4 accent-blue-600 transition group-hover:scale-110"
                />{" "}
                <span className="text-sm font-medium text-gray-600 group-hover:text-gray-900 capitalize">{opt.toLowerCase()}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="flex items-end">
          <label className="flex items-center gap-3 text-sm font-medium text-gray-700 cursor-pointer group">
            <input
              type="checkbox"
              name="graduated_from_this"
              checked={!!formData.graduated_from_this}
              onChange={handleChange}
              className="w-4 h-4 accent-blue-600 rounded transition group-hover:scale-110"
            />
            <span className="group-hover:text-blue-700 transition">I have the physical certificate for this degree</span>
          </label>
        </div>
      </div>

      <div className="pt-4 border-t border-gray-100">
        <h3 className="mb-4 font-bold text-gray-800 flex items-center gap-2">
          <span className="w-1.5 h-1.5 bg-blue-600 rounded-full"></span>
          School Address Detail
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="space-y-1 md:col-span-2">
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
              Address *
            </label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              onBlur={() => handleBlur("address")}
              placeholder="Enter institution address"
              className={inputClass("address")}
            />
            {renderError("address")}
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
              City *
            </label>
            <input
              type="text"
              name="city"
              value={formData.city}
              onChange={handleChange}
              onBlur={() => handleBlur("city")}
              placeholder="Enter city"
              className={inputClass("city")}
            />
            {renderError("city")}
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
              Zip Code
            </label>
            <input
              type="text"
              name="zipcode"
              value={formData.zipcode}
              onChange={handleChange}
              onBlur={() => handleBlur("zipcode")}
              placeholder="Zip code"
              className={inputClass("zipcode")}
            />
            {renderError("zipcode")}
          </div>
        </div>
      </div>
    </div>
  );
};
