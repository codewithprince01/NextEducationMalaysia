'use client'

import { useState, useEffect, useCallback } from 'react'

type CaptchaQuestion = { num1: number; num2: number; answer: number }

export function useFormState(isOpen: boolean) {
  const [captchaQuestion, setCaptchaQuestion] = useState<CaptchaQuestion>({ num1: 0, num2: 0, answer: 0 })
  const [captchaInput, setCaptchaInput] = useState('')
  const [captchaError, setCaptchaError] = useState(false)
  const [loading, setLoading] = useState(false)
  const [nationality, setNationality] = useState('')
  const [countryCode, setCountryCode] = useState('')

  const generateCaptcha = useCallback(() => {
    const n1 = Math.floor(Math.random() * 10) + 1
    const n2 = Math.floor(Math.random() * 10) + 1
    setCaptchaQuestion({ num1: n1, num2: n2, answer: n1 + n2 })
    setCaptchaInput('')
    setCaptchaError(false)
  }, [])

  useEffect(() => {
    if (isOpen) {
      generateCaptcha()
      setNationality('')
      setCountryCode('')
    }
  }, [isOpen, generateCaptcha])

  const validateCaptcha = () => {
    if (parseInt(captchaInput || '0', 10) !== captchaQuestion.answer) {
      setCaptchaError(true)
      return false
    }
    return true
  }

  return {
    captchaQuestion,
    captchaInput,
    setCaptchaInput,
    captchaError,
    setCaptchaError,
    generateCaptcha,
    loading,
    setLoading,
    nationality,
    countryCode,
    handleNationalityChange: (e: React.ChangeEvent<HTMLSelectElement>) => setNationality(e.target.value),
    handleCountryCodeChange: (e: React.ChangeEvent<HTMLSelectElement>) => setCountryCode(e.target.value),
    validateCaptcha,
    reset() {
      setCaptchaInput('')
      setCaptchaError(false)
      generateCaptcha()
    },
  }
}
