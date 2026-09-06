'use client'

import React from "react";
import { Check } from "lucide-react";

interface QualificationFormProps {
  isOpen: boolean;
  data: any;
  errors: any;
  onChange: (e: React.ChangeEvent<any>) => void;
  onBlur: (section: string, field: string) => void;
  onSave: () => void;
  onCancel: () => void;
}

const inputClass = (isError?: boolean) =>
  `w-full rounded-xl border px-3.5 py-2.5 text-sm transition-all outline-none ${
    isError
      ? "border-rose-300 bg-rose-50/40 text-rose-900 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/15"
      : "border-slate-200 bg-slate-50/50 text-slate-800 hover:border-slate-300 focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-500/15"
  }`;

const ScoreRankRow = ({
  label,
  scoreField,
  rankField,
  data,
  errors,
  onChange,
  onBlur,
  section,
}: any) => (
  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-center">
    <label className="text-xs font-semibold text-slate-700">{label}</label>
    {[scoreField, rankField].map((field) => {
      const isScore = field === scoreField;
      return (
        <div key={field} className="space-y-1">
          <input
            name={field}
            value={data[field] || ""}
            onChange={onChange}
            onBlur={() => onBlur(section, field)}
            type="number"
            className={inputClass(!!errors?.[field])}
            placeholder={isScore ? "Score" : "Percentile / Rank"}
          />
          {errors?.[field] && <p className="text-rose-600 text-[11px] font-medium">{errors[field]}</p>}
        </div>
      );
    })}
  </div>
);

export const GreForm: React.FC<QualificationFormProps> = ({ isOpen, data, errors, onChange, onBlur, onSave, onCancel }) => {
  if (!isOpen) return null;
  return (
    <div className="mt-5 pt-5 border-t border-slate-100 space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-center">
        <label className="text-xs font-semibold text-slate-700">Date of Exam <span className="text-rose-500">*</span></label>
        <div className="sm:col-span-2 space-y-1">
          <input
            name="gre_exam_date"
            value={data.gre_exam_date || ""}
            onChange={onChange}
            onBlur={() => onBlur("gre", "gre_exam_date")}
            type="date"
            className={inputClass(!!errors?.gre_exam_date)}
          />
          {errors?.gre_exam_date && <p className="text-rose-600 text-[11px] font-medium">{errors.gre_exam_date}</p>}
        </div>
      </div>
      <ScoreRankRow label="Verbal Reasoning" scoreField="gre_v_score" rankField="gre_v_rank" data={data} errors={errors} onChange={onChange} onBlur={onBlur} section="gre" />
      <ScoreRankRow label="Quantitative Reasoning" scoreField="gre_q_score" rankField="gre_q_rank" data={data} errors={errors} onChange={onChange} onBlur={onBlur} section="gre" />
      <ScoreRankRow label="Analytical Writing" scoreField="gre_w_score" rankField="gre_w_rank" data={data} errors={errors} onChange={onChange} onBlur={onBlur} section="gre" />
      <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition"
        >
          Close
        </button>
        <button
          type="button"
          onClick={onSave}
          className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-xs hover:shadow transition flex items-center gap-1.5"
        >
          <Check className="w-3.5 h-3.5" />
          Save GRE
        </button>
      </div>
    </div>
  );
};

export const GmatForm: React.FC<QualificationFormProps> = ({ isOpen, data, errors, onChange, onBlur, onSave, onCancel }) => {
  if (!isOpen) return null;
  const rows = [
    { label: "Verbal", score: "gmat_v_score", rank: "gmat_v_rank" },
    { label: "Quantitative", score: "gmat_q_score", rank: "gmat_q_rank" },
    { label: "Writing", score: "gmat_w_score", rank: "gmat_w_rank" },
    { label: "Integrated Reasoning", score: "gmat_ir_score", rank: "gmat_ir_rank" },
    { label: "Total", score: "gmat_total_score", rank: "gmat_total_rank" },
  ];

  return (
    <div className="mt-5 pt-5 border-t border-slate-100 space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-center">
        <label className="text-xs font-semibold text-slate-700">Date of Exam <span className="text-rose-500">*</span></label>
        <div className="sm:col-span-2 space-y-1">
          <input
            name="gmat_exam_date"
            value={data.gmat_exam_date || ""}
            onChange={onChange}
            onBlur={() => onBlur("gmat", "gmat_exam_date")}
            type="date"
            className={inputClass(!!errors?.gmat_exam_date)}
          />
          {errors?.gmat_exam_date && <p className="text-rose-600 text-[11px] font-medium">{errors.gmat_exam_date}</p>}
        </div>
      </div>

      {rows.map(({ label, score, rank }) => (
        <ScoreRankRow key={score} label={label} scoreField={score} rankField={rank} data={data} errors={errors} onChange={onChange} onBlur={onBlur} section="gmat" />
      ))}

      <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition"
        >
          Close
        </button>
        <button
          type="button"
          onClick={onSave}
          className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-xs hover:shadow transition flex items-center gap-1.5"
        >
          <Check className="w-3.5 h-3.5" />
          Save GMAT
        </button>
      </div>
    </div>
  );
};

export const SatForm: React.FC<QualificationFormProps> = ({ isOpen, data, errors, onChange, onBlur, onSave, onCancel }) => {
  if (!isOpen) return null;

  const fields = [
    { name: "sat_exam_date", label: "Date of Exam *", type: "date", placeholder: "" },
    { name: "sat_reasoning_point", label: "Reasoning Points", type: "number", placeholder: "Score" },
    { name: "sat_subject_point", label: "Subject Points", type: "number", placeholder: "Score" },
  ];

  return (
    <div className="mt-5 pt-5 border-t border-slate-100">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {fields.map(({ name, label, type, placeholder }) => (
          <div key={name} className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700">{label}</label>
            <input
              name={name}
              value={data[name] || ""}
              onChange={onChange}
              onBlur={() => onBlur("sat", name)}
              type={type}
              className={inputClass(!!errors?.[name])}
              placeholder={placeholder}
            />
            {errors?.[name] && <p className="text-rose-600 text-[11px] font-medium">{errors[name]}</p>}
          </div>
        ))}
      </div>
      <div className="flex justify-end gap-2.5 pt-4 mt-4 border-t border-slate-100">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition"
        >
          Close
        </button>
        <button
          type="button"
          onClick={onSave}
          className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-xs hover:shadow transition flex items-center gap-1.5"
        >
          <Check className="w-3.5 h-3.5" />
          Save SAT
        </button>
      </div>
    </div>
  );
};
