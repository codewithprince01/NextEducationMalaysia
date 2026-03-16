'use client'

import React, { useState, useEffect } from "react"
import { FaUser, FaEnvelope, FaMobileAlt, FaBriefcase, FaPen, FaStar } from "react-icons/fa"
import { toast } from "react-toastify"

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://admin.educationmalaysia.in/api'

export default function WriteReviewClient() {
  const [rating, setRating] = useState(0)
  const [hover, setHover] = useState(0)
  const [universities, setUniversities] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    mobile: "",
    university: "",
    program: "",
    year: "",
    title: "",
    review: "",
  })

  useEffect(() => {
    const fetchUniversities = async () => {
      try {
        const res = await fetch(`${API_BASE}/universities`)
        const data = await res.json()
        setUniversities(Array.isArray(data.data) ? data.data : [])
      } catch (err) {
        console.error("Error fetching universities:", err)
      }
    }
    fetchUniversities()
    window.scrollTo({ top: 0, behavior: "smooth" })
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (rating === 0) {
      toast.error("Please provide a star rating.")
      return
    }

    if (formData.title.length < 20 || formData.title.length > 100) {
      toast.error("Title must be between 20 and 100 characters.")
      return
    }

    if (formData.review.length < 150) {
      toast.error("Description must be at least 150 characters.")
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`${API_BASE}/submit-review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, rating })
      })
      const data = await response.json()
      if (data.status) {
        toast.success("Thank you! Your review has been submitted for approval.")
        setFormData({
          name: "", email: "", mobile: "", university: "", program: "", year: "", title: "", review: ""
        })
        setRating(0)
      } else {
        toast.error(data.message || "Failed to submit review.")
      }
    } catch (error) {
      toast.error("An error occurred. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 bg-white ">
      {/* Heading Section */}
      <div className="mb-8 bg-gray-100 p-6 rounded-md shadow-sm text-blue-500">
        <h1 className="text-2xl font-bold mb-2 text-blue-500 uppercase">
          Your Review of Your Institution Experience Can Help Others
        </h1>
        <p className="text-sm text-gray-700">
          Thank you for writing a review of your experience at{" "}
          <strong>University Name</strong>. Your honest feedback can help future
          students make the right decision about their choice of institution and
          course.
        </p>
      </div>

      {/* Form Section */}
      <div className="p-6 bg-white rounded-md shadow-md border">
        <h2 className="text-xl font-semibold mb-2">Rate the University -</h2>
        <p className="text-sm text-gray-600 mb-4">
          Your email address will not be published. Required fields are marked{" "}
          <span className="text-red-500">*</span>
        </p>

        <form onSubmit={handleSubmit}>
          {/* Input Fields */}
          <div className="grid md:grid-cols-3 gap-4 mb-4">
            <div className="relative">
              <FaUser className="absolute top-3 left-3 text-gray-500" />
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter your name"
                className="w-full pl-10 p-2 border rounded"
              />
            </div>
            <div className="relative">
              <FaEnvelope className="absolute top-3 left-3 text-gray-500" />
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                className="w-full pl-10 p-2 border rounded"
              />
            </div>
            <div className="relative">
              <FaMobileAlt className="absolute top-3 left-3 text-gray-500" />
              <input
                type="tel"
                name="mobile"
                required
                value={formData.mobile}
                onChange={handleChange}
                placeholder="Enter your mobile no."
                className="w-full pl-10 p-2 border rounded"
              />
            </div>
          </div>

          {/* Dropdowns */}
          <div className="grid md:grid-cols-3 gap-4 mb-4">
            <select
              name="university"
              required
              value={formData.university}
              onChange={handleChange}
              className="w-full p-2 border rounded text-gray-600"
            >
              <option value="">Select University</option>
              {universities.map((u: any) => (
                <option key={u.id} value={u.name}>
                  {u.name}
                </option>
              ))}
              {universities.length === 0 && (
                <>
                  <option value="ABESIT">ABESIT</option>
                  <option value="MMU">MMU</option>
                </>
              )}
            </select>
            <select
              name="program"
              required
              value={formData.program}
              onChange={handleChange}
              className="w-full p-2 border rounded text-gray-600"
            >
              <option value="">Select Program</option>
              <option value="BCA">BCA</option>
              <option value="MCA">MCA</option>
              <option value="B.Tech">B.Tech</option>
              <option value="MBA">MBA</option>
            </select>
            <select
              name="year"
              required
              value={formData.year}
              onChange={handleChange}
              className="w-full p-2 border rounded text-gray-600"
            >
              <option value="">Select Year</option>
              {[2025, 2024, 2023, 2022, 2021, 2020].map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>

          {/* Review Title */}
          <div className="relative mb-4">
            <FaBriefcase className="absolute top-3 left-3 text-gray-500" />
            <input
              type="text"
              name="title"
              required
              value={formData.title}
              onChange={handleChange}
              placeholder="How would you sum up your experience studying at this institution in a sentence?"
              className="w-full pl-10 p-2 border rounded"
            />
            <p className="text-xs text-blue-600 mt-1 ml-1">
              (Title cannot be less than 20 and more than 100 characters.)
            </p>
          </div>

          {/* Write a Review */}
          <div className="relative mb-4">
            <FaPen className="absolute top-3 left-3 text-gray-500" />
            <textarea
              name="review"
              required
              rows={4}
              value={formData.review}
              onChange={handleChange}
              placeholder="Share your experience at this institution from the time you first enrolled to its various course subjects, student lifestyle, teaching and facilities."
              className="w-full pl-10 p-2 border rounded"
            ></textarea>
            <p className="text-xs text-blue-600 mt-1 ml-1">
              (Description cannot be less than 150 characters.)
            </p>
          </div>

          {/* Star Rating */}
          <div className="flex items-center mb-6 space-x-2">
            {[...Array(5)].map((_, i) => (
              <span
                key={i}
                onClick={() => setRating(i + 1)}
                onMouseEnter={() => setHover(i + 1)}
                onMouseLeave={() => setHover(0)}
                className={`text-3xl cursor-pointer transition-colors duration-200 ${
                  (hover || rating) > i ? "text-yellow-500" : "text-gray-300"
                }`}
              >
                ★
              </span>
            ))}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded font-semibold transition-colors disabled:opacity-70"
          >
            {loading ? "SUBMITTING..." : "SUBMIT YOUR REVIEW"}
          </button>
        </form>
      </div>
    </div>
  )
}
