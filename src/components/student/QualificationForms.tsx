'use client'

import React from "react";

interface QualificationFormProps {
  isOpen: boolean;
  data: any;
  errors: any;
  onChange: (e: React.ChangeEvent<any>) => void;
  onBlur: (section: string, field: string) => void;
  onSave: () => void;
  onCancel: () => void;
}

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
  <div className="grid grid-cols-3 gap-4 items-start">
    <label className="text-sm font-medium pt-2">{label}</label>
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
            className={`w-full border p-2 rounded outline-none transition ${errors?.[field] ? "border-red-300 focus:border-red-500" : "border-gray-300 focus:border-blue-500"}`}
            placeholder={isScore ? "Score" : "Rank"}
          />
          {errors?.[field] && <p className="text-red-600 text-xs ml-1 font-medium">{errors[field]}</p>}
        </div>
      );
    })}
  </div>
);

export const GreForm: React.FC<QualificationFormProps> = ({ isOpen, data, errors, onChange, onBlur, onSave, onCancel }) => {
  if (!isOpen) return null;
  return (
    <div className="mt-4 space-y-4">
      <div className="grid grid-cols-3 gap-4 items-start">
        <label className="text-sm font-medium pt-2">Date of Exam *</label>
        <div className="col-span-2 space-y-1">
          <input
            name="gre_exam_date"
            value={data.gre_exam_date || ""}
            onChange={onChange}
            onBlur={() => onBlur("gre", "gre_exam_date")}
            type="date"
            className={`w-full border p-2 rounded outline-none transition ${errors?.gre_exam_date ? "border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-100" : "border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"}`}
          />
          {errors?.gre_exam_date && <p className="text-red-600 text-xs ml-1 font-medium">{errors.gre_exam_date}</p>}
        </div>
      </div>
      <ScoreRankRow label="Verbal" scoreField="gre_v_score" rankField="gre_v_rank" data={data} errors={errors} onChange={onChange} onBlur={onBlur} section="gre" />
      <ScoreRankRow label="Quantitative" scoreField="gre_q_score" rankField="gre_q_rank" data={data} errors={errors} onChange={onChange} onBlur={onBlur} section="gre" />
      <ScoreRankRow label="Writing" scoreField="gre_w_score" rankField="gre_w_rank" data={data} errors={errors} onChange={onChange} onBlur={onBlur} section="gre" />
      <div className="flex gap-3">
        <button onClick={onSave} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition">Save</button>
        <button onClick={onCancel} className="bg-black hover:bg-gray-800 text-white px-4 py-2 rounded transition">Cancel</button>
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
    <div className="mt-4 space-y-4">
      <div className="grid grid-cols-3 gap-4 items-start">
        <label className="text-sm font-medium pt-2">Date of Exam *</label>
        <div className="col-span-2 space-y-1">
          <input
            name="gmat_exam_date"
            value={data.gmat_exam_date || ""}
            onChange={onChange}
            onBlur={() => onBlur("gmat", "gmat_exam_date")}
            type="date"
            className={`w-full border p-2 rounded outline-none transition ${errors?.gmat_exam_date ? "border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-100" : "border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"}`}
          />
          {errors?.gmat_exam_date && <p className="text-red-600 text-xs ml-1 font-medium">{errors.gmat_exam_date}</p>}
        </div>
      </div>

      {rows.map(({ label, score, rank }) => (
        <ScoreRankRow key={score} label={label} scoreField={score} rankField={rank} data={data} errors={errors} onChange={onChange} onBlur={onBlur} section="gmat" />
      ))}

      <div className="flex gap-3">
        <button onClick={onSave} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition">Save</button>
        <button onClick={onCancel} className="bg-black hover:bg-gray-800 text-white px-4 py-2 rounded transition">Cancel</button>
      </div>
    </div>
  );
};

export const SatForm: React.FC<QualificationFormProps> = ({ isOpen, data, errors, onChange, onBlur, onSave, onCancel }) => {
  if (!isOpen) return null;

  const fields = [
    { name: "sat_exam_date", label: "Date of Exam *", type: "date", placeholder: "dd-mm-yyyy" },
    { name: "sat_reasoning_point", label: "Reasoning Test Points", type: "number", placeholder: "SAT Reasoning Point" },
    { name: "sat_subject_point", label: "SAT Subject Test Point", type: "number", placeholder: "SAT Subject Point" },
  ];

  return (
    <div className="mt-4 grid grid-cols-3 gap-4">
      {fields.map(({ name, label, type, placeholder }) => (
        <div key={name} className="flex flex-col space-y-1">
          <label className="text-sm font-medium mb-1">{label}</label>
          <input
            name={name}
            value={data[name] || ""}
            onChange={onChange}
            onBlur={() => onBlur("sat", name)}
            type={type}
            className={`border p-2 rounded outline-none ${errors?.[name] ? "border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-100" : "border-gray-300 focus:border-blue-500"}`}
            placeholder={placeholder}
          />
          {errors?.[name] && <p className="text-red-600 text-xs ml-1 font-medium">{errors[name]}</p>}
        </div>
      ))}
      <div className="col-span-3 flex justify-end gap-3 mt-4">
        <button onClick={onSave} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition">Save</button>
        <button onClick={onCancel} className="bg-black hover:bg-gray-800 text-white px-4 py-2 rounded transition">Cancel</button>
      </div>
    </div>
  );
};
