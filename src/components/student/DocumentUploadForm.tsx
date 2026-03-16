'use client'

import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://admin.educationmalaysia.in/api'
const ADMIN_URL = 'https://admin.educationmalaysia.in'

export default function DocumentUploadForm() {
  const [documentName, setDocumentName] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);

  const fetchDocuments = async () => {
    setIsFetching(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) return;
      const res = await fetch(`${API_BASE}/student/documents`, {
        headers: { 'Authorization': `Bearer ${token}` }
      }).then(r => r.json());
      
      if (res.data?.student_documents) {
        setDocuments(res.data.student_documents);
      } else if (res.student_documents) {
        setDocuments(res.student_documents);
      }
    } catch (error) {
      console.error("Error fetching documents:", error);
    } finally {
      setIsFetching(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const handleUpload = async () => {
    if (!documentName || !file) {
      toast.warn("Please provide both document name and a file.");
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();
      formData.append("document_name", documentName);
      formData.append("doc", file);

      const res = await fetch(`${API_BASE}/student/upload-documents`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });

      if (res.ok) {
        toast.success("Document uploaded successfully! 📄");
        setDocumentName("");
        setFile(null);
        fetchDocuments();
      } else {
        const errorData = await res.json();
        toast.error(errorData.message || "Upload failed.");
      }
    } catch (error) {
      toast.error("An error occurred during upload.");
    } finally {
      setLoading(false);
    }
  };

  const getFullUrl = (doc: any) => {
    if (!doc.imgpath) return "#";
    let path = doc.imgpath.startsWith("/") ? doc.imgpath.slice(1) : doc.imgpath;
    
    // Check if path already starts with storage/
    if (path.startsWith("storage/")) {
      return `${ADMIN_URL}/${path}`;
    }
    
    // User instruction: add storage/ if missing
    return `${ADMIN_URL}/storage/${path}`;
  };

  return (
    <div className="space-y-12 max-w-5xl mx-auto">
      {/* Upload Section */}
      <section className="bg-gradient-to-br from-white to-gray-50 rounded-3xl shadow-xl border border-gray-100 p-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-blue-700 flex items-center gap-3">
            📄 Upload Your Documents
          </h2>
          <p className="text-gray-500 mt-2 text-sm">
            Accepted formats: <span className="font-bold text-gray-800">.PDF, .JPEG, .PNG</span> (Max 2MB per file)
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-end">
          {/* Document Name */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Document Name</label>
            <input
              type="text"
              placeholder="e.g. Passport, SSC Certificate..."
              value={documentName}
              onChange={(e) => setDocumentName(e.target.value)}
              className="w-full border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 outline-none transition text-sm bg-white"
            />
          </div>

          {/* File Picker */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Select File</label>
            <label className="flex items-center justify-between w-full h-[46px] border-2 border-dashed border-blue-200 bg-blue-50 rounded-xl cursor-pointer hover:bg-blue-100 transition px-4 text-sm font-medium text-blue-700">
              <span className="truncate max-w-[200px]">{file ? file.name : "Browse Files"}</span>
              <span className="text-xl">📂</span>
              <input
                type="file"
                accept=".pdf,.jpeg,.jpg,.png"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="hidden"
              />
            </label>
          </div>
        </div>

        <div className="mt-8 flex justify-end gap-4">
          <button
            onClick={() => {
              setDocumentName("");
              setFile(null);
            }}
            className="px-6 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold transition active:scale-95 text-sm"
          >
            Cancel
          </button>
          <button
            onClick={handleUpload}
            disabled={loading}
            className="px-10 py-2.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold shadow-lg shadow-blue-700/20 transition active:scale-95 disabled:opacity-50 text-sm"
          >
            {loading ? "Uploading..." : "Upload Document"}
          </button>
        </div>
      </section>

      {/* List Section */}
      <section className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
        <div className="p-8 border-b border-gray-100">
          <h3 className="text-xl font-bold text-gray-900">Uploaded Documents</h3>
          <p className="text-gray-500 text-sm">Review your submitted documentation status</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-blue-700 text-white uppercase tracking-wider text-[11px] font-bold">
              <tr>
                <th className="px-6 py-4">S.N.</th>
                <th className="px-6 py-4">Document Name</th>
                <th className="px-6 py-4 text-center">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isFetching ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center">
                    <div className="inline-block w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-gray-400 mt-2 font-medium">Loading documents...</p>
                  </td>
                </tr>
              ) : documents.length > 0 ? (
                documents.map((doc, idx) => {
                  const url = getFullUrl(doc);
                  return (
                    <tr key={doc.id} className="hover:bg-gray-50/50 transition duration-300">
                      <td className="px-6 py-4 font-bold text-gray-400">{idx + 1}</td>
                      <td className="px-6 py-4 font-semibold text-gray-800">{doc.document_name}</td>
                      <td className="px-6 py-4 text-center">
                        <span className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                          doc.doc_status === 'Approved' ? 'bg-emerald-100 text-emerald-700' :
                          doc.doc_status === 'Pending' ? 'bg-amber-100 text-amber-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {doc.doc_status || "Pending"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right flex justify-end gap-2">
                        {url !== "#" ? (
                          <a
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-blue-50 hover:bg-blue-100 text-blue-700 px-4 py-1.5 rounded-lg text-xs font-bold transition active:scale-95 border border-blue-100"
                          >
                            View
                          </a>
                        ) : (
                          <span className="text-gray-400 italic text-xs">No File</span>
                        )}
                      </td>
                    </tr>
                  )
                })
              ) : (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-gray-400 italic font-medium">
                    No documents uploaded yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
