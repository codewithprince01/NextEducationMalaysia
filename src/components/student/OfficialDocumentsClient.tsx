'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  Building2,
  FileCheck2,
  Download,
  Eye,
  RefreshCw,
  UserCheck,
  ShieldCheck,
  Calendar,
  FileText,
  Clock,
  Sparkles,
  ArrowRight,
  HelpCircle,
  CheckCircle2,
  Inbox,
  Share2,
} from 'lucide-react'
import { getFullDocUrl, isStaffUploaded } from '@/utils/studentChecklist'

const API_BASE = (process.env.NEXT_PUBLIC_API_URL || '/api/v1').replace(/\/$/, '')
const API_KEY = process.env.NEXT_PUBLIC_FRONTEND_API_KEY || ''

export default function OfficialDocumentsClient() {
  const [documents, setDocuments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [downloadingId, setDownloadingId] = useState<string | number | null>(null)

  const fetchDocuments = async () => {
    setLoading(true)
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
      if (!token) {
        setLoading(false)
        return
      }

      const res = await fetch(`${API_BASE}/student/documents`, {
        headers: {
          Authorization: `Bearer ${token}`,
          ...(API_KEY ? { 'x-api-key': API_KEY } : {}),
        },
      })
      const data = await res.json()
      const allDocs = Array.isArray(data?.data?.student_documents)
        ? data.data.student_documents
        : []

      // Strictly filter official / CRM documents issued for student
      const officialDocs = allDocs.filter(isStaffUploaded)
      setDocuments(officialDocs)
    } catch (err) {
      console.error('Error fetching official documents:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDocuments()
  }, [])

  // Download helper with blob fallback so cross-origin file downloads properly save to disk
  const handleDownload = async (doc: any) => {
    const url = getFullDocUrl(doc)
    if (!url || url === '#') return

    const fileName = doc.imgname || `${doc.document_name || doc.doc_name || 'official-document'}.pdf`
    setDownloadingId(doc.id || fileName)

    try {
      const res = await fetch(url, { mode: 'cors' })
      if (!res.ok) throw new Error('Fetch failed')
      const blob = await res.blob()
      const blobUrl = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = blobUrl
      a.download = fileName
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(blobUrl)
      document.body.removeChild(a)
    } catch (err) {
      console.warn('Direct blob download failed, falling back to window.open:', err)
      // Fallback: open file in new tab or trigger download via direct URL
      const a = document.createElement('a')
      a.href = url
      a.download = fileName
      a.target = '_blank'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
    } finally {
      setDownloadingId(null)
    }
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
        <Link href="/student/overview" className="hover:text-blue-600 transition">
          Dashboard
        </Link>
        <span>/</span>
        <span className="text-slate-900 font-semibold">Official Documents</span>
      </div>

      {/* Page Header */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 sm:p-7">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-600 to-blue-700 text-white flex items-center justify-center shrink-0 shadow-md">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                  Official Documents Issued for You
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                  {documents.length} Document{documents.length !== 1 ? 's' : ''}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  From Admissions / CRM
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-3xl leading-relaxed">
                Official letters, university offers, joining letters, visa approval letters (VAL), and official fee receipts issued directly to you by your counselor and university admissions desk.
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
            <button
              type="button"
              onClick={fetchDocuments}
              disabled={loading}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-2xs transition disabled:opacity-50 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Documents Content */}
      {loading ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center shadow-xs">
          <div className="w-10 h-10 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm font-semibold text-slate-700">Loading your official documents...</p>
        </div>
      ) : documents.length > 0 ? (
        <div className="space-y-6">
          {/* Card Grid View */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {documents.map((doc, idx) => {
              const fullUrl = getFullDocUrl(doc)
              const title = doc.document_name || doc.doc_name || 'Official Document'
              const fileName = doc.imgname || 'Document File'
              const dateStr = doc.created_at
                ? new Date(doc.created_at).toLocaleDateString(undefined, {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })
                : 'Recently Issued'
              const isDownloading = downloadingId === (doc.id || fileName)

              return (
                <div
                  key={doc.id || idx}
                  className="bg-white rounded-2xl border-2 border-indigo-100/90 hover:border-indigo-300 hover:shadow-md transition-all p-5 flex flex-col justify-between gap-4 group"
                >
                  <div className="flex items-start gap-3.5">
                    <div className="w-11 h-11 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 border border-indigo-100 group-hover:scale-105 transition-transform">
                      <FileCheck2 className="w-5 h-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition truncate">
                          {title}
                        </h3>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
                          Official Copy
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 truncate mt-1 font-medium" title={fileName}>
                        {fileName}
                      </p>
                      <div className="flex items-center gap-2.5 mt-2 text-[11px] text-slate-400">
                        <span className="inline-flex items-center gap-1 font-semibold text-indigo-900/80">
                          <UserCheck className="w-3.5 h-3.5 text-indigo-600" /> Issued by Admissions Desk
                        </span>
                        <span>•</span>
                        <span className="inline-flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {dateStr}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-end gap-2.5 pt-3.5 border-t border-slate-100">
                    {fullUrl !== '#' && (
                      <>
                        <a
                          href={fullUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-600 hover:text-white text-indigo-700 text-xs font-semibold shadow-2xs transition cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View Document</span>
                        </a>

                        <button
                          type="button"
                          onClick={() => handleDownload(doc)}
                          disabled={isDownloading}
                          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition disabled:opacity-50 cursor-pointer"
                        >
                          <Download className={`w-3.5 h-3.5 ${isDownloading ? 'animate-bounce' : ''}`} />
                          <span>{isDownloading ? 'Downloading...' : 'Download'}</span>
                        </button>
                      </>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Detailed Table View */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Official Documents Register
              </h4>
              <span className="text-[11px] text-slate-400">
                Directly synchronized with CRM
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[10px] font-bold">
                  <tr>
                    <th className="px-4 py-3 w-12 text-slate-400">#</th>
                    <th className="px-4 py-3">Document Title</th>
                    <th className="px-4 py-3">File Name</th>
                    <th className="px-4 py-3">Issue Date</th>
                    <th className="px-4 py-3">Origin</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {documents.map((doc, idx) => {
                    const fullUrl = getFullDocUrl(doc)
                    const title = doc.document_name || doc.doc_name || 'Official Document'
                    const fileName = doc.imgname || 'Document File'
                    const dateStr = doc.created_at
                      ? new Date(doc.created_at).toLocaleDateString(undefined, {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })
                      : 'Recently Issued'
                    const isDownloading = downloadingId === (doc.id || fileName)

                    return (
                      <tr key={doc.id || idx} className="hover:bg-indigo-50/30 transition">
                        <td className="px-4 py-3.5 font-medium text-slate-400">
                          {idx + 1}
                        </td>
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 border border-indigo-100">
                              <FileCheck2 className="w-3.5 h-3.5" />
                            </div>
                            <div>
                              <p className="font-bold text-slate-900">{title}</p>
                              <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-100">
                                Verified
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3.5 text-slate-600 font-medium">
                          <span className="truncate max-w-[220px] block" title={fileName}>
                            {fileName}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-slate-500 whitespace-nowrap">
                          {dateStr}
                        </td>
                        <td className="px-4 py-3.5 whitespace-nowrap">
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                            <UserCheck className="w-3 h-3 text-indigo-600" />
                            Admissions / CRM
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-right space-x-1.5 whitespace-nowrap">
                          {fullUrl !== '#' && (
                            <>
                              <a
                                href={fullUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-600 hover:text-white text-xs font-semibold transition cursor-pointer"
                              >
                                <Eye className="w-3 h-3" />
                                <span>View</span>
                              </a>
                              <button
                                type="button"
                                onClick={() => handleDownload(doc)}
                                disabled={isDownloading}
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 text-xs font-semibold transition disabled:opacity-50 cursor-pointer"
                              >
                                <Download className="w-3 h-3" />
                                <span>{isDownloading ? 'Saving...' : 'Download'}</span>
                              </button>
                            </>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Helpful Information Notice */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-100 p-5 flex flex-col sm:flex-row items-start gap-4 shadow-2xs">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-slate-900">
                Important Travel & Verification Notice
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Please keep digital copies of all issued documents on your mobile device and print physical copies before your departure to Malaysia. Immigration and EMGS require physical copies of your Joining Letter, Visa Approval Letter (VAL), and Offer Letter upon airport arrival.
              </p>
            </div>
          </div>
        </div>
      ) : (
        /* Empty State */
        <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center shadow-xs">
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-4 border border-indigo-100">
            <Building2 className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-slate-900">
            No Official Documents Issued Yet
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto mt-1 leading-relaxed">
            When your admissions counselor issues your university offer letter, joining letter, visa approval letter (VAL), or fee receipt, it will appear here for instant download.
          </p>
          <div className="mt-6 flex items-center justify-center gap-3">
            <Link
              href="/student/profile"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition"
            >
              <span>View My Profile & Credentials</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
