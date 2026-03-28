'use client'

import { useState, useEffect, useCallback } from 'react'

type CaptchaQuestion = { num1: number; num2: number; answer: number }

type AnyOption = Record<string, any>

const norm = (v: unknown) => String(v ?? '').trim().toLowerCase()
const toCode = (item: AnyOption) =>
  String(
    item?.phonecode ??
      item?.phone_code ??
      item?.country_code ??
      item?.dial_code ??
      item?.code ??
      ''
  ).replace('+', '').trim()

const toName = (item: AnyOption) =>
  String(item?.name ?? item?.country ?? item?.country_name ?? '').trim()

export function useFormState(isOpen: boolean, countriesData: AnyOption[] = [], phonecode: AnyOption[] = []) {
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

  const findCodeByNationality = useCallback(
    (nationalityName: string) => {
      const needle = norm(nationalityName)
      if (!needle) return ''

      const fromCountries = (countriesData || []).find((c) => norm(toName(c)) === needle)
      const fromPhonecodes = (phonecode || []).find((c) => norm(toName(c)) === needle)
      return toCode(fromCountries || fromPhonecodes || {})
    },
    [countriesData, phonecode],
  )

  const findNationalityByCode = useCallback(
    (code: string) => {
      const needle = String(code || '').replace('+', '').trim()
      if (!needle) return ''

      const fromPhonecodes = (phonecode || []).find((c) => toCode(c) === needle)
      const nameFromPhonecode = toName(fromPhonecodes || {})
      if (nameFromPhonecode) return nameFromPhonecode

      const fromCountries = (countriesData || []).find((c) => toCode(c) === needle)
      return toName(fromCountries || {})
    },
    [countriesData, phonecode],
  )

  const handleNationalityChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const nextNationality = e.target.value
      setNationality(nextNationality)
      const mappedCode = findCodeByNationality(nextNationality)
      if (mappedCode) setCountryCode(mappedCode)
    },
    [findCodeByNationality],
  )

  const handleCountryCodeChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const nextCode = String(e.target.value || '').replace('+', '').trim()
      setCountryCode(nextCode)
      const mappedNationality = findNationalityByCode(nextCode)
      if (mappedNationality) setNationality(mappedNationality)
    },
    [findNationalityByCode],
  )

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
    handleNationalityChange,
    handleCountryCodeChange,
    validateCaptcha,
    reset() {
      setCaptchaInput('')
      setCaptchaError(false)
      generateCaptcha()
    },
  }
}
