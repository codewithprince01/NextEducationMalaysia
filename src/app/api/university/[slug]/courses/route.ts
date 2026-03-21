import { NextRequest, NextResponse } from 'next/server'
import { universityService } from '@/backend'
import { prisma } from '@/lib/db-fresh'
import { serializeBigInt } from '@/lib/utils'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug } = await params
    const { searchParams } = new URL(request.url)
    const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10))
    const level = searchParams.get('level') || undefined
    const courseCategoryId = searchParams.get('course_category_id') || undefined
    const specializationId = searchParams.get('specialization_id') || undefined
    const studyMode = searchParams.get('study_mode') || undefined

    const [result, uniRow] = await Promise.all([
      universityService.getUniversityCourses(slug, {
        level,
        course_category_id: courseCategoryId,
        specialization_id: specializationId,
        study_mode: studyMode,
        page,
        limit: 10,
      }),
      prisma.$queryRawUnsafe(`SELECT id, name FROM universities WHERE uname = ? AND status = 1 LIMIT 1`, slug) as Promise<any[]>,
    ])

    if (!result || !uniRow.length) {
      return NextResponse.json({ error: 'University not found' }, { status: 404 })
    }

    const universityId = Number(uniRow[0].id)
    const courses = Array.isArray(result.data) ? result.data : []

    const buildWhere = ({
      includeLevel = true,
      includeCategory = true,
      includeSpecialization = true,
      includeStudyMode = true,
    }: {
      includeLevel?: boolean
      includeCategory?: boolean
      includeSpecialization?: boolean
      includeStudyMode?: boolean
    }) => {
      let whereSql = `WHERE up.university_id = ? AND up.status = 1`
      const args: any[] = [universityId]

      if (includeLevel && level) {
        whereSql += ` AND up.level = ?`
        args.push(level)
      }
      if (includeCategory && courseCategoryId) {
        whereSql += ` AND up.course_category_id = ?`
        args.push(Number(courseCategoryId))
      }
      if (includeSpecialization && specializationId) {
        whereSql += ` AND up.specialization_id = ?`
        args.push(Number(specializationId))
      }
      if (includeStudyMode && studyMode) {
        whereSql += ` AND up.study_mode LIKE ?`
        args.push(`%${studyMode}%`)
      }

      return { whereSql, args }
    }

    const levelWhere = buildWhere({ includeLevel: false })
    const categoryWhere = buildWhere({ includeCategory: false })
    const specializationWhere = buildWhere({ includeSpecialization: false })
    const studyModeWhere = buildWhere({ includeStudyMode: false })

    const [levelsRaw, categoriesRaw, specializationsRaw, studyModesRaw] = await Promise.all([
      prisma.$queryRawUnsafe(
        `SELECT DISTINCT up.level
         FROM university_programs up
         ${levelWhere.whereSql}
         AND up.level IS NOT NULL AND up.level <> ''
         ORDER BY up.level ASC`,
        ...levelWhere.args
      ) as Promise<any[]>,
      prisma.$queryRawUnsafe(
        `SELECT DISTINCT cc.id, cc.name
         FROM university_programs up
         JOIN course_categories cc ON up.course_category_id = cc.id
         ${categoryWhere.whereSql}
         AND up.course_category_id IS NOT NULL
         ORDER BY cc.name ASC`,
        ...categoryWhere.args
      ) as Promise<any[]>,
      prisma.$queryRawUnsafe(
        `SELECT DISTINCT cs.id, cs.name
         FROM university_programs up
         JOIN course_specializations cs ON up.specialization_id = cs.id
         ${specializationWhere.whereSql}
         AND up.specialization_id IS NOT NULL
         ORDER BY cs.name ASC`,
        ...specializationWhere.args
      ) as Promise<any[]>,
      prisma.$queryRawUnsafe(
        `SELECT DISTINCT up.study_mode
         FROM university_programs up
         ${studyModeWhere.whereSql}
         AND up.study_mode IS NOT NULL AND up.study_mode <> ''`,
        ...studyModeWhere.args
      ) as Promise<any[]>,
    ])

    const levels = levelsRaw.map((r: any) => ({ level: r.level }))
    const categories = categoriesRaw.map((r: any) => ({ id: Number(r.id), name: r.name }))
    const specializations = specializationsRaw.map((r: any) => ({ id: Number(r.id), name: r.name }))
    const studyModes = Array.from(
      new Set(
        studyModesRaw
          .flatMap((r: any) => String(r.study_mode || '').split(','))
          .map((v: string) => v.trim())
          .filter(Boolean)
      )
    ).sort((a: string, b: string) => a.localeCompare(b)).map((study_mode: string) => ({ study_mode }))

    return NextResponse.json({
      programs: {
        data: serializeBigInt(courses),
        current_page: result.pagination.current_page,
        last_page: result.pagination.last_page,
        total: result.pagination.total,
      },
      levels,
      categories,
      specializations,
      study_modes: studyModes,
      university: {
        id: Number(uniRow[0].id),
        name: uniRow[0].name,
      },
    })
  } catch (err) {
    console.error('[University courses API]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
