import React from "react";

interface SuccessViewProps {
  formType: string;
  onOk: () => void;
}

const SuccessView: React.FC<SuccessViewProps> = ({ formType, onOk }) => {
  return (
    <div className="bg-white rounded-2xl shadow-2xl p-8 w-[90%] max-w-md text-center">
      <div className="flex flex-col items-center mb-4">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-16 w-16 text-green-500 mb-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M5 13l4 4L19 7"
          />
        </svg>
        <h2 className="text-2xl font-bold text-gray-800">Success!</h2>
        <p className="text-gray-600 mt-2 text-sm">
          {formType === "counselling"
            ? "Your counselling session has been booked successfully. We will contact you soon."
            : formType === "compare" || formType === "comparison"
            ? "Your comparison request has been submitted successfully. We will contact you soon."
            : "Your inquiry has been submitted successfully. We will contact you soon."}
        </p>
      </div>
      <button
        onClick={onOk}
        className="bg-indigo-500 text-white font-semibold px-6 py-2 rounded-lg hover:bg-indigo-600 transition cursor-pointer"
      >
        OK
      </button>
    </div>
  );
};

export default SuccessView;
