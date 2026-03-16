'use client'

import React from "react";

interface ScoreRankRowProps {
  label: string;
  scoreField: string;
  rankField: string;
  data: any;
  errors: any;
  onChange: (e: React.ChangeEvent<any>) => void;
  onBlur: (section: string, field: string) => void;
  section: string;
}

const ScoreRankRow: React.FC<ScoreRankRowProps> = ({
  label,
  scoreField,
  rankField,
  data,
  errors,
  onChange,
  onBlur,
  section,
}) => (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center py-2 border-b border-gray-50 last:border-0">
    <label className="text-sm font-semibold text-gray-700">{label}</label>
    {[scoreField, rankField].map((field) => {
      const isScore = field === scoreField;
      return (
        <div key={field} className="space-y-1">
          <input
            name={field}
            value={data[field]}
            onChange={onChange}
            onBlur={() => onBlur(section, field)}
            type="number"
            className={`w-full border p-2.5 rounded-xl outline-none transition text-sm ${
              errors[field] 
                ? "border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-100" 
                : "border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            }`}
            placeholder={isScore ? "Score" : "Rank"}
          />
          {errors[field] && (
            <p className="text-red-600 text-[10px] ml-1 font-medium flex items-center gap-1">
              <span className="inline-block w-1 h-1 bg-red-600 rounded-full" />
              {errors[field]}
            </p>
          )}
        </div>
      );
    })}
  </div>
);

interface QualificationFormProps {
  isOpen: boolean;
  data: any;
  errors: any;
  onChange: (e: React.ChangeEvent<any>) => void;
  onBlur: (section: string, field: string) => void;
  onSave: () => void;
  onCancel: () => void;
}

export const GreForm: React.FC<QualificationFormProps> = ({
  isOpen,
  data,
  errors,
  onChange,
  onBlur,
  onSave,
  onCancel,
}) => {
  if (!isOpen) return null;
  return (
    <div className="mt-6 space-y-4 p-6 bg-gray-50 rounded-2xl border border-gray-100 animate-in fade-in slide-in-from-top-4 duration-300">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center pb-4 border-b border-gray-200">
        <label className="text-sm font-bold text-gray-800 uppercase tracking-wider">Date of Exam *</label>
        <div className="md:col-span-2 space-y-1">
          <input
            name="gre_exam_date"
            value={data.gre_exam_date}
            onChange={onChange}
            onBlur={() => onBlur("gre", "gre_exam_date")}
            type="date"
            className={`w-full border p-2.5 rounded-xl outline-none transition text-sm font-medium ${
              errors.gre_exam_date 
                ? "border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-100" 
                : "border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            }`}
          />
          {errors.gre_exam_date && (
            <p className="text-red-600 text-xs ml-1 font-medium flex items-center gap-1">
              <span className="inline-block w-1 h-1 bg-red-600 rounded-full" />
              {errors.gre_exam_date}
            </p>
          )}
        </div>
      </div>
      
      <div className="space-y-1">
        <ScoreRankRow
          label="Verbal"
          scoreField="gre_v_score"
          rankField="gre_v_rank"
          data={data}
          errors={errors}
          onChange={onChange}
          onBlur={onBlur}
          section="gre"
        />
        <ScoreRankRow
          label="Quantitative"
          scoreField="gre_q_score"
          rankField="gre_q_rank"
          data={data}
          errors={errors}
          onChange={onChange}
          onBlur={onBlur}
          section="gre"
        />
        <ScoreRankRow
          label="Writing"
          scoreField="gre_w_score"
          rankField="gre_w_rank"
          data={data}
          errors={errors}
          onChange={onChange}
          onBlur={onBlur}
          section="gre"
        />
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <button
          onClick={onCancel}
          className="bg-white hover:bg-gray-100 text-gray-700 font-semibold px-6 py-2.5 rounded-xl transition border border-gray-200 text-sm active:scale-95"
        >
          Cancel
        </button>
        <button
          onClick={onSave}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-2.5 rounded-xl shadow-lg shadow-blue-600/20 transition text-sm active:scale-95"
        >
          Save Details
        </button>
      </div>
    </div>
  );
};

export const GmatForm: React.FC<QualificationFormProps> = ({
  isOpen,
  data,
  errors,
  onChange,
  onBlur,
  onSave,
  onCancel,
}) => {
  if (!isOpen) return null;
  const rows = [
    { label: "Verbal", score: "gmat_v_score", rank: "gmat_v_rank" },
    { label: "Quantitative", score: "gmat_q_score", rank: "gmat_q_rank" },
    { label: "Writing", score: "gmat_w_score", rank: "gmat_w_rank" },
    { label: "Integrated Reasoning", score: "gmat_ir_score", rank: "gmat_ir_rank" },
    { label: "Total", score: "gmat_total_score", rank: "gmat_total_rank" },
  ];

  return (
    <div className="mt-6 space-y-4 p-6 bg-gray-50 rounded-2xl border border-gray-100 animate-in fade-in slide-in-from-top-4 duration-300">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center pb-4 border-b border-gray-200">
        <label className="text-sm font-bold text-gray-800 uppercase tracking-wider">Date of Exam *</label>
        <div className="md:col-span-2 space-y-1">
          <input
            name="gmat_exam_date"
            value={data.gmat_exam_date}
            onChange={onChange}
            onBlur={() => onBlur("gmat", "gmat_exam_date")}
            type="date"
            className={`w-full border p-2.5 rounded-xl outline-none transition text-sm font-medium ${
              errors.gmat_exam_date 
                ? "border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-100" 
                : "border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            }`}
          />
          {errors.gmat_exam_date && (
            <p className="text-red-600 text-xs ml-1 font-medium flex items-center gap-1">
              <span className="inline-block w-1 h-1 bg-red-600 rounded-full" />
              {errors.gmat_exam_date}
            </p>
          )}
        </div>
      </div>

      <div className="space-y-1">
        {rows.map((row) => (
          <ScoreRankRow
            key={row.score}
            label={row.label}
            scoreField={row.score}
            rankField={row.rank}
            data={data}
            errors={errors}
            onChange={onChange}
            onBlur={onBlur}
            section="gmat"
          />
        ))}
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <button
          onClick={onCancel}
          className="bg-white hover:bg-gray-100 text-gray-700 font-semibold px-6 py-2.5 rounded-xl transition border border-gray-200 text-sm active:scale-95"
        >
          Cancel
        </button>
        <button
          onClick={onSave}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-2.5 rounded-xl shadow-lg shadow-blue-600/20 transition text-sm active:scale-95"
        >
          Save Details
        </button>
      </div>
    </div>
  );
};

export const SatForm: React.FC<QualificationFormProps> = ({
  isOpen,
  data,
  errors,
  onChange,
  onBlur,
  onSave,
  onCancel,
}) => {
  if (!isOpen) return null;

  const fields = [
    { name: "sat_exam_date", label: "Date of Exam *", type: "date", placeholder: "dd-mm-yyyy" },
    { name: "sat_reasoning_point", label: "Reasoning Test Points", type: "number", placeholder: "SAT Reasoning Point" },
    { name: "sat_subject_point", label: "SAT Subject Test Point", type: "number", placeholder: "SAT Subject Point" },
  ];

  return (
    <div className="mt-6 p-6 bg-gray-50 rounded-2xl border border-gray-100 animate-in fade-in slide-in-from-top-4 duration-300">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {fields.map(({ name, label, type, placeholder }) => (
          <div key={name} className="flex flex-col space-y-2">
            <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">{label}</label>
            <input
              name={name}
              value={data[name]}
              onChange={onChange}
              onBlur={() => onBlur("sat", name)}
              type={type}
              className={`border p-2.5 rounded-xl outline-none transition text-sm ${
                errors[name] 
                  ? "border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-100" 
                  : "border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              }`}
              placeholder={placeholder}
            />
            {errors[name] && (
              <p className="text-red-600 text-[10px] ml-1 font-medium flex items-center gap-1">
                <span className="inline-block w-1 h-1 bg-red-600 rounded-full" />
                {errors[name]}
              </p>
            )}
          </div>
        ))}
      </div>
      <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200">
        <button
          onClick={onCancel}
          className="bg-white hover:bg-gray-100 text-gray-700 font-semibold px-6 py-2.5 rounded-xl transition border border-gray-200 text-sm active:scale-95"
        >
          Cancel
        </button>
        <button
          onClick={onSave}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-2.5 rounded-xl shadow-lg shadow-blue-600/20 transition text-sm active:scale-95"
        >
          Save Details
        </button>
      </div>
    </div>
  );
};
