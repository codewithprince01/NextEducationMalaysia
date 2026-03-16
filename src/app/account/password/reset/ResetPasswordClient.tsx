'use client'

import React, { useState, useEffect } from "react"
import Link from "next/link"
import { FaEnvelope, FaArrowRight, FaArrowLeft, FaKey } from "react-icons/fa"
import { toast } from "react-toastify"

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://admin.educationmalaysia.in/api'

export default function ResetPasswordClient() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" })
  }, [])

  const handleRecover = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage("")
    setError("")

    try {
      const response = await fetch(`${API_BASE}/student/forget-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })
      const data = await response.json()
      
      if (data.status || response.ok) {
        setMessage(data.message || "Recovery link sent to your email.")
        toast.success("Recovery link sent!")
      } else {
        setError(data.message || "Something went wrong, please try again.")
      }
    } catch (err) {
      setError("An error occurred. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen w-full flex bg-white font-sans">
      {/* Left Side - Visual Section */}
      <div className="hidden lg:flex lg:w-1/2 bg-blue-600 relative overflow-hidden flex-col justify-between p-16 text-white text-left">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-blue-500 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/3 opacity-50" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-indigo-600 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/3 opacity-60" />

        <div className="relative z-10 animate-fade-in-right">
          <div className="mb-6 inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full border border-white/20">
            <FaKey className="text-sm" />
            <span className="text-[10px] font-black tracking-widest uppercase">Secure Recovery</span>
          </div>
          <h1 className="text-5xl font-black leading-tight mb-6 tracking-tight uppercase">
            Lost Your <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-200 to-white">Password?</span>
          </h1>
          <p className="text-lg text-blue-100 max-w-lg leading-relaxed font-bold opacity-80">
            Don't worry. It happens. Enter your email and we'll help you get back into your account in no time.
          </p>
        </div>

        <div className="relative z-10 mt-auto pt-10 border-t border-white/10">
          <p className="text-xs font-black uppercase tracking-widest text-blue-100/60">
            Need assistance? <span className="text-white">support@educationmalaysia.in</span>
          </p>
        </div>
      </div>

      {/* Right Side - Form Section */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12 relative bg-white">
        <div className="w-full max-w-md space-y-10 animate-fade-in-up">
          <div className="text-center lg:text-left">
            <Link href="/login" className="inline-flex items-center gap-3 text-xs font-black uppercase tracking-widest text-slate-400 hover:text-blue-600 mb-10 transition-all hover:-translate-x-2">
              <FaArrowLeft size={10} /> Back to Login
            </Link>
            <h2 className="text-3xl font-black text-gray-900 tracking-tighter uppercase mb-4">Recover Account</h2>
            <p className="text-gray-500 font-medium">Enter your registered email address to receive recovery instructions.</p>
          </div>

          <form onSubmit={handleRecover} className="space-y-8">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Email Address</label>
              <div className="relative group">
                <FaEnvelope className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-600 transition-colors" />
                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="your.email@example.com" className="w-full pl-14 pr-6 py-6 bg-slate-50 border border-transparent rounded-3xl text-sm font-bold placeholder:text-slate-300 focus:bg-white focus:border-blue-500 transition-all outline-none" />
              </div>
            </div>

            <button type="submit" disabled={loading} className="w-full flex items-center justify-center gap-3 bg-blue-600 hover:bg-blue-700 text-white font-black py-6 rounded-3xl shadow-2xl shadow-blue-500/20 transition-all transform active:scale-[0.98] disabled:opacity-70 text-xs uppercase tracking-widest">
              {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <>Send Recovery Link <FaArrowRight size={14} /></>}
            </button>

            {/* Status Messages */}
            {message && (
              <div className="p-6 rounded-3xl bg-green-50 border border-green-100 text-green-700 text-sm font-bold flex items-center gap-4 animate-fade-in">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                {message}
              </div>
            )}
            {error && (
              <div className="p-6 rounded-3xl bg-red-50 border border-red-100 text-red-700 text-sm font-bold flex items-center gap-4 animate-fade-in">
                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                {error}
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  )
}
