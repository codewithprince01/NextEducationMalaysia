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

export function useFetchFormData(universitySlugOrName?: string | null) {
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

      let resolvedLevels = fetchedLevels.length > 0
        ? fetchedLevels
        : [
            { level: 'Secondary School' },
            { level: 'Foundation / Diploma' },
            { level: "Bachelor's Degree" },
            { level: "Master's Degree" },
            { level: 'PhD / Doctorate' },
          ]

      let resolvedCategories = uniqByName(
        fetchedCategories.map((c: any) => ({
          ...c,
          name: c?.name || c?.title || c?.course_name || '',
        })),
      )

      const uniSlug = universitySlugOrName
        ? String(universitySlugOrName).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
        : ''

      if (uniSlug) {
        try {
          const uniRes = await axios.get(`/api/university/${uniSlug}/courses`)
          const data = uniRes.data as any
          if (data && !data.error) {
            if (Array.isArray(data.levels) && data.levels.length > 0) {
              resolvedLevels = data.levels
            }
            if (Array.isArray(data.all_programs) && data.all_programs.length > 0) {
              const allProgCats = data.all_programs.map((p: any) => ({ name: p.name || p.course_name || '' })).filter((p: any) => p.name)
              resolvedCategories = uniqByName(allProgCats)
            } else if (Array.isArray(data.categories) && data.categories.length > 0) {
              const uniCats = data.categories.map((c: any) => ({ name: c.name || c.title || '' })).filter((c: any) => c.name)
              if (Array.isArray(data.programs?.data) && data.programs.data.length > 0) {
                const progCats = data.programs.data.map((p: any) => ({ name: p.course_name || p.name || p.title || '' })).filter((p: any) => p.name)
                resolvedCategories = uniqByName([...uniCats, ...progCats])
              } else {
                resolvedCategories = uniqByName(uniCats)
              }
            }
          }
        } catch {}
      }

      setLevels(resolvedLevels)
      setCourseCategories(resolvedCategories)
    }

    fetchData().catch(() => {})
  }, [universitySlugOrName])

  return { phonecode, levels, courseCategories, countriesData: countries }
}
