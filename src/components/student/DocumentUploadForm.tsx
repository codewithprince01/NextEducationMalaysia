'use client'

import React, { useRef, useState, useEffect } from "react";
import { toast } from "react-toastify";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://admin.educationmalaysia.in/api'
const API_KEY = process.env.NEXT_PUBLIC_FRONTEND_API_KEY || ''

export default function DocumentUploadForm() {
  const uploadRef = useRef<HTMLDivElement | null>(null);
  const [documentName, setDocumentName] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [documents, setDocuments] = useState<any[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const fetchDocuments = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/student/documents`, {
        headers: {
          Authorization: `Bearer ${token}`,
          ...(API_KEY ? { 'x-api-key': API_KEY } : {}),
        },
      });
      const json = await res.json();
      if (json?.data?.student_documents) setDocuments(json.data.student_documents);
      else if (json?.student_documents) setDocuments(json.student_documents);
      else setDocuments([]);
    } catch (error) {
      console.error("Error fetching documents:", error);
      setDocuments([]);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!documentName.trim()) newErrors.documentName = "Document name is required";
    if (!file) newErrors.file = "Please select a file to upload";
    setErrors(newErrors);
    return !Object.values(newErrors).some(Boolean);
  };

  const handleSave = async () => {
    if (!validateForm()) {
      toast.warn("Please provide document name and file");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();
      formData.append("document_name", documentName);
      if (file) formData.append("doc", file);

      const response = await fetch(`${API_BASE}/student/upload-documents`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          ...(API_KEY ? { 'x-api-key': API_KEY } : {}),
        },
        body: formData,
      });

      const data = await response.json();
      if (!response.ok) {
        toast.error(data?.message || "Failed to upload document");
        return;
      }

      toast.success("Document uploaded successfully");
      setDocumentName("");
      setFile(null);
      setErrors({});
      fetchDocuments();
    } catch (error: any) {
      toast.error("Failed to upload document");
    }
  };

  const getFullUrl = (doc: any) => {
    const raw = doc?.imgpath || "";
    if (!raw) return "#";
    if (/^https?:\/\//i.test(raw)) return raw;

    const normalizeOrigin = (value: string) => {
      if (!value) return "";
      return /^https?:\/\//i.test(value) ? value : `https://${value}`;
    };

    const cleaned = raw.startsWith("/") ? raw.slice(1) : raw;

    const runtimeOrigin = typeof window !== "undefined" ? window.location.origin : "";
    const isLocalRuntime = /localhost|127\.0\.0\.1/i.test(runtimeOrigin);
    const uploadSource = normalizeOrigin(String(doc?.upload_source || "").trim());
    const imageBase = normalizeOrigin(process.env.NEXT_PUBLIC_IMAGE_BASE_URL || "");
    const siteUrl = normalizeOrigin(process.env.NEXT_PUBLIC_SITE_URL || "");

    // Live fix:
    // - In production prefer admin storage domain first (old + shared uploads live there)
    // - In local keep localhost first so locally uploaded files still open
    const candidateOrigins = isLocalRuntime
      ? [runtimeOrigin, uploadSource, imageBase, siteUrl].filter(Boolean)
      : [imageBase, uploadSource, siteUrl, runtimeOrigin].filter(Boolean);
    const basePath = cleaned.startsWith("storage/")
      ? cleaned
      : cleaned.startsWith("uploads/")
        ? `storage/${cleaned}`
        : cleaned;

    return `${candidateOrigins[0]}/${basePath}`;
  };

  const inputClass = (key: string) =>
    `w-full border rounded-xl p-3 focus:ring-2 outline-none transition ${
      errors[key]
        ? "border-red-300 focus:border-red-500 focus:ring-red-100"
        : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
    }`;

  return (
    <div ref={uploadRef} className="mb-10">
      <div className="w-full max-w-4xl mx-auto bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-lg border border-gray-200 p-4 md:p-8">
        <div className="mb-6">
          <h2 className="text-2xl font-semibold text-blue-700">Upload Your Documents</h2>
          <p className="text-gray-500 mt-2 text-sm">
            Accepted formats: <span className="font-semibold text-gray-700">.PDF, .JPEG, .PNG</span>
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="space-y-1">
            <label className="block font-medium text-gray-700 mb-2">Document Name</label>
            <input
              type="text"
              value={documentName}
              onChange={(e) => {
                setDocumentName(e.target.value);
                setErrors((prev) => ({ ...prev, documentName: "" }));
              }}
              placeholder="Enter Document Name..."
              className={inputClass("documentName")}
            />
            {errors.documentName && <p className="text-red-600 text-xs ml-1 font-medium">{errors.documentName}</p>}
          </div>

          <div className="space-y-1">
            <label className="block font-medium text-gray-700 mb-2">Upload Document</label>
            <label className={`flex flex-col items-center justify-center w-full h-[52px] border-2 border-dashed rounded-xl cursor-pointer transition ${
              errors.file
                ? "border-red-400 bg-red-50 hover:bg-red-100 text-red-700"
                : "border-blue-400 bg-blue-50 hover:bg-blue-100 text-blue-700"
            }`}>
              <span className="flex items-center gap-2 text-sm font-medium">
                <span className="text-lg">File</span>
                {file ? file.name : "Browse File"}
              </span>
              <input
                type="file"
                accept=".pdf,.jpeg,.jpg,.png"
                onChange={(e) => {
                  setFile(e.target.files?.[0] || null);
                  setErrors((prev) => ({ ...prev, file: "" }));
                }}
                className="hidden"
              />
            </label>
            {errors.file && <p className="text-red-600 text-xs ml-1 font-medium">{errors.file}</p>}
          </div>
        </div>

        <div className="flex justify-end gap-4">
          <button onClick={handleSave} className="px-6 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-md transition">Save</button>
          <button className="px-6 py-2 rounded-xl bg-gray-500 hover:bg-gray-700 text-white shadow-md transition">Cancel</button>
        </div>
      </div>

      <div className="w-full max-w-4xl mx-auto mt-10">
        <h3 className="text-2xl font-bold text-gray-900 mb-6">Uploaded Documents</h3>

        <div className="overflow-x-auto rounded-xl shadow-md border border-gray-200">
          <table className="w-full text-sm text-left">
            <thead className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm uppercase tracking-wide">
              <tr>
                <th className="px-6 py-3">S.N.</th>
                <th className="px-6 py-3">Document Name</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {documents.length > 0 ? (
                documents.map((doc, index) => {
                  const fullUrl = getFullUrl(doc);
                  return (
                    <tr key={doc.id || index} className="border-b hover:bg-gray-50 transition">
                      <td className="px-6 py-4 font-medium text-gray-700">{index + 1}</td>
                      <td className="px-6 py-4 text-gray-800">{doc.document_name || doc.doc_name || "Document"}</td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          doc.doc_status === "Approved"
                            ? "bg-emerald-100 text-emerald-700"
                            : doc.doc_status === "Pending" || doc.doc_status === "Reviewing"
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-red-100 text-red-700"
                        }`}>
                          {doc.doc_status || "Pending"}
                        </span>
                      </td>
                      <td className="px-6 py-4 flex gap-3">
                        {fullUrl !== "#" ? (
                          <a href={fullUrl} target="_blank" rel="noopener noreferrer" className="px-4 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-medium shadow hover:bg-blue-700 transition">
                            View
                          </a>
                        ) : (
                          <span className="text-xs text-gray-500 italic">No file</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td className="px-4 py-2 border text-center" colSpan={4}>
                    No documents uploaded yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
