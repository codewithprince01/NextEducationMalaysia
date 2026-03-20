'use client'

import { useEffect, useState } from 'react'
import axios from 'axios'

export type FormOption = { id?: number; name?: string; level?: string; phonecode?: string | number; phone_code?: string | number }
const API_KEY = process.env.NEXT_PUBLIC_FRONTEND_API_KEY || ''

function pickList(res: any): any[] {
  if (Array.isArray(res?.data)) return res.data
  if (Array.isArray(res?.data?.data)) return res.data.data
  if (Array.isArray(res?.data?.data?.data)) return res.data.data.data
  return []
}

export function useFetchFormData() {
  const [phonecode, setPhonecode] = useState<FormOption[]>([])
  const [countries, setCountries] = useState<FormOption[]>([])
  const [levels, setLevels] = useState<FormOption[]>([])
  const [courseCategories, setCourseCategories] = useState<FormOption[]>([])

  useEffect(() => {
    const headers = API_KEY ? { 'x-api-key': API_KEY } : undefined

    const fetchData = async () => {
      const [phonecodesRes, countriesRes, levelsRes, categoriesRes] = await Promise.allSettled([
        axios.get('/api/v1/countries/phonecodes', { headers }),
        axios.get('/api/v1/countries', { headers }),
        axios.get('/api/v1/levels', { headers }),
        axios.get('/api/v1/course-categories', { headers }),
      ])

      const fetchedPhonecodes = phonecodesRes.status === 'fulfilled' ? pickList(phonecodesRes.value) : []
      const fetchedCountries = countriesRes.status === 'fulfilled' ? pickList(countriesRes.value) : []
      const fetchedLevels = levelsRes.status === 'fulfilled' ? pickList(levelsRes.value) : []
      const categories = categoriesRes.status === 'fulfilled' ? pickList(categoriesRes.value) : []

      setPhonecode(fetchedPhonecodes)
      setCountries(fetchedCountries)
      setLevels(
        fetchedLevels.length > 0
          ? fetchedLevels
          : [
              { level: 'Secondary School' },
              { level: 'Foundation / Diploma' },
              { level: "Bachelor's Degree" },
              { level: "Master's Degree" },
              { level: 'PhD / Doctorate' },
            ],
      )
      setCourseCategories(categories)
    }

    fetchData().catch(() => {})
  }, [])

  return { phonecode, levels, courseCategories, countriesData: countries }
}
