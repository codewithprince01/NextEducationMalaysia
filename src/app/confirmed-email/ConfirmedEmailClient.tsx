'use client'

import { useState, useEffect } from "react"
import { KeyRound } from "lucide-react"
import { useRouter } from "next/navigation"
import Link from 'next/link'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://admin.educationmalaysia.in/api'
const API_KEY = process.env.NEXT_PUBLIC_FRONTEND_API_KEY || ''

export default function ConfirmedEmailClient() {
  const [otp, setOtp] = useState("")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [errorVisible, setErrorVisible] = useState(false)
  const router = useRouter()

  useEffect(() => {
    // Check if we have a student_id to verify
    const studentId = typeof window !== 'undefined' ? localStorage.getItem("student_id") : null
    if (!studentId) {
      setMessage("No registration data found. Please register first.")
      setErrorVisible(true)
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage("")
    setErrorVisible(false)

    try {
      const studentId = localStorage.getItem("student_id")
      if (!studentId) {
        setMessage("No student ID found. Please register first.")
        setErrorVisible(true)
        setLoading(false)
        return
      }

      const response = await fetch(`${API_BASE}/student/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(API_KEY ? { 'x-api-key': API_KEY } : {}) },
        body: JSON.stringify({ id: studentId, otp }),
      })

      const resData = await response.json()

      if (response.ok && resData?.data?.token) {
        localStorage.setItem("token", resData.data.token)
        if (resData?.data?.id) localStorage.setItem("student_id", String(resData.data.id))
        if (resData?.data?.email) localStorage.setItem("student_email", resData.data.email)
        setMessage(resData.message || "OTP Verified Successfully!")
        
        // Wait a bit before redirecting
        setTimeout(() => {
          router.push("/student/profile")
          router.refresh()
        }, 1500)
      } else {
        setMessage(resData?.message || "OTP Verification Failed")
        setErrorVisible(true)
      }
    } catch (error) {
      console.error("OTP Verification failed:", error)
      setMessage("Network error. Please try again.")
      setErrorVisible(true)
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    setLoading(true)
    setMessage("")
    setErrorVisible(false)
    
    try {
      const studentId = localStorage.getItem("student_id")
      if (!studentId) {
        setMessage("No student ID found.")
        setErrorVisible(true)
        setLoading(false)
        return
      }

      const response = await fetch(`${API_BASE}/student/resend-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(API_KEY ? { 'x-api-key': API_KEY } : {}) },
        body: JSON.stringify({ id: studentId }),
      })
      
      const resData = await response.json()
      if (response.ok) {
        setMessage("📩 New OTP sent to your email!")
      } else {
        setMessage(resData?.message || "Failed to resend OTP")
        setErrorVisible(true)
      }
    } catch (error) {
      console.error("Resend OTP failed:", error)
      setMessage("Failed to resend OTP")
      setErrorVisible(true)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-linear-to-r from-blue-600 via-blue-500 to-blue-500 px-4">
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-md p-8">
        <h2 className="text-2xl font-bold text-center text-gray-800">
          Confirm Email
        </h2>
        <p className="text-sm text-gray-600 text-center mt-1">
          An OTP has been sent to your registered email
        </p>
        <p className="text-xs text-gray-500 text-center mt-1">
          OTP will expire in <span className="font-semibold">5 minutes</span>
        </p>
        <form onSubmit={handleSubmit} className="mt-6">
          <div className="flex items-center border border-gray-200 rounded-lg px-3 py-2 focus-within:border-blue-500 transition-colors">
            <KeyRound className="w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Enter OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="w-full ml-2 outline-none text-gray-800"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-6 bg-linear-to-r from-blue-600 to-blue-500 text-white font-semibold py-2.5 rounded-lg hover:opacity-90 transition shadow-md disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? "Verifying..." : "Submit"}
          </button>
        </form>

        <button
          onClick={handleResend}
          disabled={loading}
          className="w-full mt-3 bg-gray-100 text-gray-700 font-semibold py-2.5 rounded-lg hover:bg-gray-200 transition disabled:opacity-70"
        >
          Resend OTP
        </button>

        {message && (
          <p className={`mt-4 text-center text-sm font-medium ${errorVisible ? 'text-red-600' : 'text-green-600'}`}>
            {message}
          </p>
        )}

        <div className="mt-8 pt-6 border-t border-gray-100 text-center">
          <Link href="/login" className="text-sm text-blue-600 hover:underline">
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  )
}
