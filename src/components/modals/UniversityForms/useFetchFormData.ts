'use client'

import { useEffect, useState, useMemo } from 'react'
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
    const name = String(item?.name || item?.course_name || item?.level || '').trim()
    if (!name) continue
    const key = name.toLowerCase()
    if (seen.has(key)) continue
    seen.add(key)
    out.push(item)
  }
  return out
}

export function isLevelMatch(progLevel: string, selectedLevel: string): boolean {
  if (!selectedLevel) return true
  if (!progLevel) return false

  const normalize = (s: string) =>
    String(s || '')
      .toLowerCase()
      .replace(/['’]/g, '')
      .replace(/[^a-z0-9]/g, '')

  const nProg = normalize(progLevel)
  const nSel = normalize(selectedLevel)

  if (nProg === nSel) return true
  if (nProg.includes(nSel) || nSel.includes(nProg)) return true

  // Diploma match
  if (nSel.includes('diploma') && nProg.includes('diploma')) return true

  // Bachelor / Under-Graduate match
  if (
    (nSel.includes('under') || nSel.includes('bachelor') || nSel.includes('ug') || nSel.includes('degree')) &&
    (nProg.includes('under') || nProg.includes('bachelor') || nProg.includes('ug') || nProg.includes('degree'))
  ) return true

  // Master / Post-Graduate match
  if (
    (nSel.includes('post') || nSel.includes('master') || nSel.includes('pg')) &&
    (nProg.includes('post') || nProg.includes('master') || nProg.includes('pg'))
  ) return true

  // Doctorate / PhD match
  if (
    (nSel.includes('phd') || nSel.includes('doctor')) &&
    (nProg.includes('phd') || nProg.includes('doctor'))
  ) return true

  // Certificate match
  if (nSel.includes('cert') && nProg.includes('cert')) return true

  // Pre-University / Foundation match
  if (
    (nSel.includes('pre') || nSel.includes('foundation')) &&
    (nProg.includes('pre') || nProg.includes('foundation'))
  ) return true

  return false
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

export function useFetchFormData(universitySlugOrName?: string | null, selectedLevel?: string | null) {
  const [phonecode, setPhonecode] = useState<FormOption[]>([])
  const [countries, setCountries] = useState<FormOption[]>([])
  const [levels, setLevels] = useState<FormOption[]>([])
  const [allUniversityPrograms, setAllUniversityPrograms] = useState<Array<{ name: string; level: string; category: string }>>([])
  const [universityCategories, setUniversityCategories] = useState<FormOption[]>([])
  const [genericCategories, setGenericCategories] = useState<FormOption[]>([])

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

      let resolvedAllProgs: Array<{ name: string; level: string; category: string }> = []
      let resolvedUniCategories: FormOption[] = []
      let resolvedCategories = uniqByName(
        fetchedCategories.map((c: any) => ({
          ...c,
          name: c?.name || c?.title || c?.course_name || '',
          level: c?.level || '',
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
            if (Array.isArray(data.categories) && data.categories.length > 0) {
              resolvedUniCategories = uniqByName(data.categories)
            }
            if (Array.isArray(data.all_programs) && data.all_programs.length > 0) {
              resolvedAllProgs = data.all_programs
                .map((p: any) => ({
                  name: String(p.name || p.course_name || '').trim(),
                  level: String(p.level || '').trim(),
                  category: String(p.category_name || p.category || '').trim(),
                }))
                .filter((p: any) => p.name)
            } else if (Array.isArray(data.programs?.data) && data.programs.data.length > 0) {
              resolvedAllProgs = data.programs.data
                .map((p: any) => ({
                  name: String(p.course_name || p.name || p.title || '').trim(),
                  level: String(p.level || '').trim(),
                  category: String(p.category_name || p.category || '').trim(),
                }))
                .filter((p: any) => p.name)
            }
          }
        } catch {}
      }

      setLevels(resolvedLevels)
      setAllUniversityPrograms(resolvedAllProgs)
      setUniversityCategories(resolvedUniCategories)
      setGenericCategories(resolvedCategories)
    }

    fetchData().catch(() => {})
  }, [universitySlugOrName])

  // What the visitor picks is a field of study, not a specific programme, so
  // the dropdown lists course categories (Engineering, Business, ...) rather
  // than the hundreds of individual course names a university publishes.
  //
  // The categories are still derived from the programmes wherever possible, so
  // choosing an education level narrows the list to the categories that
  // university actually teaches at that level. The falls-back chain matters: a
  // university whose programmes carry no category still gets its own category
  // list from the API, and a form opened outside a university page gets the
  // site-wide list.
  const filteredCourseCategories = useMemo(() => {
    if (allUniversityPrograms.length > 0) {
      const matching = selectedLevel
        ? allUniversityPrograms.filter((p) => isLevelMatch(p.level, selectedLevel))
        : []
      const pool = matching.length > 0 ? matching : allUniversityPrograms
      const categories = uniqByName(
        pool.map((p) => ({ name: p.category })).filter((c) => c.name),
      )
      if (categories.length > 0) return categories
    }
    if (universityCategories.length > 0) return universityCategories
    return genericCategories
  }, [allUniversityPrograms, selectedLevel, universityCategories, genericCategories])

  return {
    phonecode,
    levels,
    courseCategories: filteredCourseCategories,
    countriesData: countries,
  }
}
