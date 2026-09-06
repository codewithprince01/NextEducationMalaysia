'use client'

import React, { useRef, useState, useEffect } from "react";
import { toast } from "react-toastify";
import { FileUp, FileText, Check, Eye, UploadCloud } from "lucide-react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://admin.educationmalaysia.in/api'
const API_KEY = process.env.NEXT_PUBLIC_FRONTEND_API_KEY || ''

export default function DocumentUploadForm() {
  const uploadRef = useRef<HTMLDivElement | null>(null);
  const [documentName, setDocumentName] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [documents, setDocuments] = useState<any[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [uploading, setUploading] = useState(false);

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
      setUploading(true);
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
    } finally {
      setUploading(false);
    }
  };

  const handleCancel = () => {
    setDocumentName("");
    setFile(null);
    setErrors({});
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
    `w-full rounded-xl border px-3.5 py-2.5 text-sm transition-all outline-none ${
      errors[key]
        ? "border-rose-300 bg-rose-50/40 text-rose-900 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/15"
        : "border-slate-200 bg-slate-50/50 text-slate-800 hover:border-slate-300 focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-500/15"
    }`;

  return (
    <div ref={uploadRef} className="w-full space-y-8">
      {/* Upload Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 sm:p-7">
        <div className="flex items-center gap-3 pb-5 mb-6 border-b border-slate-100">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <FileUp className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900">Upload Your Documents</h2>
            <p className="text-xs text-slate-500">
              Accepted formats: <span className="font-semibold text-slate-700">PDF, JPEG, PNG</span> (up to 10MB)
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700">
              Document Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={documentName}
              onChange={(e) => {
                setDocumentName(e.target.value);
                setErrors((prev) => ({ ...prev, documentName: "" }));
              }}
              placeholder="e.g. Passport Copy, Academic Transcript, IELTS Result"
              className={inputClass("documentName")}
            />
            {errors.documentName && <p className="text-rose-600 text-xs font-medium">{errors.documentName}</p>}
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700">
              Choose Document File <span className="text-rose-500">*</span>
            </label>
            <label
              className={`flex items-center justify-between w-full h-[42px] px-3.5 border rounded-xl cursor-pointer transition text-xs ${
                errors.file
                  ? "border-rose-300 bg-rose-50/40 text-rose-700"
                  : "border-slate-200 bg-slate-50/50 hover:bg-slate-100/70 text-slate-700"
              }`}
            >
              <div className="flex items-center gap-2 truncate">
                <UploadCloud className="w-4 h-4 text-blue-600 shrink-0" />
                <span className="truncate font-medium">{file ? file.name : "Select PDF or Image..."}</span>
              </div>
              <span className="shrink-0 px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-600 font-semibold text-[11px] shadow-2xs">
                Browse
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
            {errors.file && <p className="text-rose-600 text-xs font-medium">{errors.file}</p>}
          </div>
        </div>

        <div className="flex flex-wrap justify-end gap-3 pt-6 border-t border-slate-100">
          <button
            type="button"
            onClick={handleCancel}
            className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs sm:text-sm transition"
          >
            Reset
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={uploading}
            className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-semibold text-xs sm:text-sm shadow-sm hover:shadow transition active:scale-95 flex items-center gap-2"
          >
            {uploading ? (
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Check className="w-4 h-4" />
            )}
            {uploading ? "Uploading..." : "Upload Document"}
          </button>
        </div>
      </div>

      {/* Uploaded Documents List */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 sm:p-7">
        <div className="flex items-center gap-3 pb-5 mb-5 border-b border-slate-100">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900">Uploaded Documents</h3>
            <p className="text-xs text-slate-500">Track and review your submitted application credentials</p>
          </div>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-200/80">
          <table className="w-full text-xs sm:text-sm text-left">
            <thead className="bg-slate-50/80 border-b border-slate-200/80 text-slate-600 uppercase tracking-wider text-[11px] font-bold">
              <tr>
                <th className="px-5 py-3 w-16">#</th>
                <th className="px-5 py-3">Document Name</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {documents.length > 0 ? (
                documents.map((doc, index) => {
                  const fullUrl = getFullUrl(doc);
                  const isApproved = doc.doc_status === "Approved";
                  const isPending = doc.doc_status === "Pending" || doc.doc_status === "Reviewing" || !doc.doc_status;
                  return (
                    <tr key={doc.id || index} className="hover:bg-slate-50/60 transition">
                      <td className="px-5 py-3.5 font-medium text-slate-400">{index + 1}</td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                            <FileText className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="font-semibold text-slate-800 leading-tight">
                              {doc.document_name || doc.doc_name || "Document"}
                            </p>
                            {doc.created_at && (
                              <p className="text-[11px] text-slate-400 mt-0.5">
                                Uploaded {new Date(doc.created_at).toLocaleDateString()}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                            isApproved
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200/70"
                              : isPending
                              ? "bg-amber-50 text-amber-700 border border-amber-200/70"
                              : "bg-rose-50 text-rose-700 border border-rose-200/70"
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              isApproved ? "bg-emerald-500" : isPending ? "bg-amber-500" : "bg-rose-500"
                            }`}
                          />
                          {doc.doc_status || "Pending"}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        {fullUrl !== "#" ? (
                          <a
                            href={fullUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white text-xs font-semibold transition shadow-2xs"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            View
                          </a>
                        ) : (
                          <span className="text-xs text-slate-400 italic">No file preview</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td className="px-5 py-8 text-center text-slate-500 text-xs sm:text-sm" colSpan={4}>
                    <div className="flex flex-col items-center justify-center">
                      <FileUp className="w-8 h-8 text-slate-300 mb-2" />
                      <p className="font-semibold text-slate-700">No documents uploaded yet</p>
                      <p className="text-xs text-slate-400 mt-0.5">Upload your ID proof, transcripts, or certificates above.</p>
                    </div>
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
