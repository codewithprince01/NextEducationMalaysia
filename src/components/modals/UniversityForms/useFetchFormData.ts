'use client'

import { useEffect, useState } from 'react'
import axios from 'axios'

export type FormOption = { id?: number; name?: string; level?: string; phonecode?: string | number; phone_code?: string | number }
const API_KEY = process.env.NEXT_PUBLIC_FRONTEND_API_KEY || ''
const API_BASE = process.env.NEXT_PUBLIC_API_URL || ''

function pickList(res: any): any[] {
  if (Array.isArray(res?.data)) return res.data
  if (Array.isArray(res?.data?.data)) return res.data.data
  if (Array.isArray(res?.data?.data?.data)) return res.data.data.data
  return []
}

function uniqByName(list: any[]) {
  const out: any[] = []
  const seen = new Set<string>()
  for (const item of list || []) {
    const name = String(item?.name || item?.level || '').trim()
    if (!name) continue
    const key = name.toLowerCase()
    if (seen.has(key)) continue
    seen.add(key)
    out.push(item)
  }
  return out
}

async function firstNonEmpty(urls: string[], headers?: Record<string, string>) {
  for (const url of urls) {
    try {
      const res = await axios.get(url, { headers })
      const list = pickList(res)
      if (Array.isArray(list) && list.length > 0) return list
    } catch {}
  }
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
      const localOrRemote = (path: string) => {
        if (!API_BASE) return [path]
        const base = API_BASE.replace(/\/+$/, '')
        return [path, `${base}${path.replace(/^\/api\/v1/, '')}`]
      }

      const [fetchedPhonecodes, fetchedCountries, fetchedLevels, fetchedCategories] = await Promise.all([
        firstNonEmpty(['/api/v1/countries/phonecodes', '/api/v1/phonecodes'], headers),
        firstNonEmpty(['/api/v1/countries'], headers),
        firstNonEmpty(['/api/v1/levels', '/api/v1/dropdowns/levels'], headers),
        firstNonEmpty(
          [
            ...localOrRemote('/api/v1/course-categories'),
            ...localOrRemote('/api/v1/dropdowns/course-categories'),
          ],
          headers,
        ),
      ])

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
      setCourseCategories(
        uniqByName(
          fetchedCategories.map((c: any) => ({
            ...c,
            name: c?.name || c?.title || c?.course_name || '',
          })),
        ),
      )
    }

    fetchData().catch(() => {})
  }, [])

  return { phonecode, levels, courseCategories, countriesData: countries }
}
