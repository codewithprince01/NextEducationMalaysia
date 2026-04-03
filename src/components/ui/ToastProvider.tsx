'use client'

// Deferred toast provider — CSS + component loaded lazily to reduce
// initial CSS parse cost on mobile (removes ~20KB from critical path).
import 'react-toastify/dist/ReactToastify.css'
import { ToastContainer } from 'react-toastify'

export default function ToastProvider() {
  return (
    <ToastContainer
      position="top-right"
      autoClose={3000}
      hideProgressBar={false}
    />
  )
}
