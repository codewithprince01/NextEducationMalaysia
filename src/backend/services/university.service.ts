import { prisma } from '@/lib/db-fresh';
import { seoService } from './seo.service';
import { slugify, unslugify } from '../utils/seo-tags';
import { contentRepo } from '../repositories';
import { serializeBigInt } from '@/lib/utils';

/**
 * Enterprise University Service (Singleton)
 */
export class UniversityService {
  private static instance: UniversityService;

  private constructor() {}

  static getInstance(): UniversityService {
    if (!UniversityService.instance) {
      UniversityService.instance = new UniversityService();
    }
    return UniversityService.instance;
  }

  /**
   * Data for the "Select University" landing/hub page.
   */
  async getSelectUniversityData() {
    const [banner, contents, seo] = await Promise.all([
      prisma.pageBanner.findFirst({ where: { page: 'select-university' } } as any),
      contentRepo.findByPage('select-university'),
      seoService.getStaticPageSeo('universities'),
    ]);

    return serializeBigInt({
      data: {
        banner,
        pageContentTop: contents.find((c: any) => c.position === 'top'),
        pageContentBottom: contents.find((c: any) => c.position === 'bottom'),
        pageContentPrivate: contents.find((c: any) => c.position === 'private-university'),
        pageContentPublic: contents.find((c: any) => c.position === 'public-university'),
        pageContentForeign: contents.find((c: any) => c.position === 'foreign-university'),
      },
      seo,
    });
  }

  /**
   * Paginated list of universities in Malaysia with filters.
   */
  async getUniversitiesInMalaysia(params: {
    search?: string;
    institute_type?: string;
    state?: string;
    page?: number;
    limit?: number;
    type_slug?: string;
  }) {
    const page = params.page || 1;
    const limit = params.limit || 21;
    const skip = (page - 1) * limit;

    let whereSql = `WHERE u.status = 1 AND u.website = 'MYS'`;
    const args: any[] = [];

    if (params.search) {
      whereSql += ` AND u.name LIKE ?`;
      args.push(`%${params.search}%`);
    }

    if (params.state) {
      whereSql += ` AND u.state = ?`;
      args.push(unslugify(params.state));
    }

    let currentInstituteType: any = null;
    if (params.institute_type || params.type_slug) {
      const typeFilter = params.institute_type || params.type_slug;
      
      // Clean type slug if it has "-in-malaysia"
      const cleanType = typeFilter?.replace(/-in-malaysia$/, '');
      const base = cleanType?.replace(/-universities$/, '-university').replace(/-institutions$/, '-institution');

      let itRes: any[] = [];
      if (/^\d+$/.test(typeFilter!)) {
        itRes = await prisma.$queryRawUnsafe(`SELECT * FROM institute_types WHERE id = ?`, parseInt(typeFilter!));
      }
      
      if (itRes.length === 0) {
        itRes = await prisma.$queryRawUnsafe(`
          SELECT * FROM institute_types 
          WHERE type = ? OR slug = ? OR seo_title_slug = ? OR slug = ? OR seo_title_slug = ?
          LIMIT 1
        `, typeFilter, typeFilter, typeFilter, base, base);
      }

      if (itRes.length > 0) {
        const it = itRes[0];
        whereSql += ` AND u.institute_type = ?`;
        args.push(it.id);
        currentInstituteType = { id: it.id, name: it.type, slug: it.seo_title_slug };
      }
    }

    // Use raw SQL to fetch universities (exclude missing columns)
    const universities: any = await prisma.$queryRawUnsafe(`
      SELECT u.id, u.name, u.uname, u.logo_path, u.banner_path, u.city, u.state, u.qs_rank, u.rating, u.featured,
             u.shortnote, u.established_year, u.click,
             it.type as institute_type_name, it.seo_title_slug as institute_type_slug,
             (SELECT COUNT(*) FROM university_programs WHERE university_id = u.id AND status = 1) as active_programs_count
      FROM universities u
      LEFT JOIN institute_types it ON u.institute_type = it.id
      ${whereSql}
      ORDER BY u.name ASC
      LIMIT ${limit} OFFSET ${skip}
    `, ...args);

    const countRes: any = await prisma.$queryRawUnsafe(`
      SELECT COUNT(*) as total FROM universities u ${whereSql}
    `, ...args);

    const total = Number(countRes[0]?.total || 0);

    const [allTypes, rawStates] = await Promise.all([
      prisma.instituteType.findMany(),
      prisma.$queryRawUnsafe(`SELECT DISTINCT state FROM universities WHERE status = 1 AND state IS NOT NULL AND website = 'MYS'`) as Promise<any[]>,
    ]);

    return {
      data: serializeBigInt(universities.map((u: any) => ({
        ...u,
        instituteType: { type: u.institute_type_name, seo_title_slug: u.institute_type_slug }
      }))),
      pagination: { total, current_page: page, last_page: Math.ceil(total / limit), per_page: limit },
      filters: serializeBigInt({
        institute_types: allTypes.map((it) => ({ id: it.id, name: it.type, slug: it.seo_title_slug })),
        states: rawStates.map((s) => ({ name: s.state, slug: slugify(s.state!) })),
      }),
      seo: await seoService.getStaticPageSeo('universities-in-malaysia', {
        title: 'universities',
        nou: total.toString(),
        institute_type: currentInstituteType?.name || '',
      }),
    };
  }

  /**
   * Detailed info for a single university.
   */
  async getUniversityDetail(uname: string) {
    // Explicitly exclude parent_university_id and other potentially missing cols
    const universities: any = await prisma.$queryRawUnsafe(`
      SELECT u.id, u.name, u.uname, u.logo_path, u.banner_path, u.address, u.city, u.state, u.zip,
             u.qs_rank, u.rating, u.shortnote, u.page_content, u.featured, u.status,
             it.type as it_name, it.seo_title_slug as it_slug,
             c.name as country_name,
             (SELECT COUNT(*) FROM university_programs WHERE university_id = u.id AND status = 1) as active_programs_count
      FROM universities u
      LEFT JOIN institute_types it ON u.institute_type = it.id
      LEFT JOIN countries c ON u.country_id = c.id
      WHERE u.uname = ? AND u.status = 1
      LIMIT 1
    `, uname);

    if (!universities.length) return null;
    const university = universities[0];

    const [photos, videos, reviews] = await Promise.all([
      prisma.universityPhoto.findMany({ where: { university_id: university.id } }),
      prisma.universityVideo.findMany({ where: { university_id: university.id } }),
      prisma.review.findMany({ where: { university_id: university.id, status: 1 }, take: 5, orderBy: { created_at: 'desc' } }),
    ]);

    const faculties = await prisma.$queryRawUnsafe(`
      SELECT DISTINCT cc.id, cc.name, cc.slug
      FROM course_categories cc
      JOIN university_programs up ON up.course_category_id = cc.id
      WHERE up.university_id = ? AND up.status = 1
    `, university.id);

    const seo = await seoService.getStaticPageSeo('university-detail', {
      title: university.name,
      universityname: university.name,
    });

    return {
      data: serializeBigInt({
        ...university,
        instituteType: { type: university.it_name, seo_title_slug: university.it_slug },
        country: university.country_name ? { name: university.country_name } : null,
        universityPhotos: photos,
        universityVideos: videos,
        universityReviews: reviews,
        _count: { programs: university.active_programs_count }
      }),
      faculties: serializeBigInt(faculties),
      seo
    };
  }

  async getUniversityOverview(uname: string) {
    const res: any = await prisma.$queryRawUnsafe(`SELECT id, name, city, shortnote FROM universities WHERE uname = ? AND status = 1 LIMIT 1`, uname);
    if (!res.length) return null;
    const university = res[0];

    const [overviews, universitySpecsRaw, allSpecsRaw, specWithContentsRaw] = await Promise.all([
      prisma.universityOverview.findMany({
        where: { university_id: university.id } as any,
        orderBy: { position: 'asc' },
      }),
      prisma.$queryRawUnsafe(`
        SELECT DISTINCT cs.id, cs.name, cs.slug, up.specialization_id, up.course_category_id
        FROM course_specializations cs
        JOIN university_programs up ON up.specialization_id = cs.id
        WHERE up.university_id = ?
        LIMIT 15
      `, university.id),
      prisma.$queryRawUnsafe(`
        SELECT DISTINCT cs.id, cs.name, cs.slug, up.specialization_id, up.course_category_id
        FROM course_specializations cs
        JOIN university_programs up ON up.specialization_id = cs.id
        WHERE up.status = 1
        LIMIT 15
      `),
      prisma.courseSpecialization.findMany({
        where: { contents: { some: {} } },
        select: { id: true, name: true, slug: true },
        take: 15,
      }),
    ]);

    let universitySpecs: any[] = Array.isArray(universitySpecsRaw) ? universitySpecsRaw as any[] : [];
    let allSpecs: any[] = Array.isArray(allSpecsRaw) ? allSpecsRaw as any[] : [];
    let specWithContents: any[] = Array.isArray(specWithContentsRaw) ? specWithContentsRaw as any[] : [];

    // Fallback: some DB rows have missing specialization joins; derive streams from programs directly.
    if (universitySpecs.length === 0) {
      const universityProgramFallback: any = await prisma.$queryRawUnsafe(`
        SELECT DISTINCT
          COALESCE(cs.id, up.specialization_id, 0) AS id,
          COALESCE(NULLIF(cs.name, ''), NULLIF(up.course_name, ''), 'General') AS name,
          cs.slug,
          up.specialization_id,
          up.course_category_id
        FROM university_programs up
        LEFT JOIN course_specializations cs ON cs.id = up.specialization_id
        WHERE up.university_id = ?
        ORDER BY up.id DESC
        LIMIT 15
      `, university.id);
      universitySpecs = Array.isArray(universityProgramFallback) ? universityProgramFallback : [];
    }
    if (universitySpecs.length === 0) {
      const universityCourseNameFallback: any = await prisma.$queryRawUnsafe(`
        SELECT DISTINCT
          up.id,
          TRIM(up.course_name) AS name,
          NULL AS slug,
          up.specialization_id,
          up.course_category_id
        FROM university_programs up
        WHERE up.university_id = ?
          AND up.course_name IS NOT NULL
          AND TRIM(up.course_name) <> ''
        ORDER BY up.id DESC
        LIMIT 15
      `, university.id);
      universitySpecs = Array.isArray(universityCourseNameFallback) ? universityCourseNameFallback : [];
    }

    if (allSpecs.length === 0) {
      const allProgramFallback: any = await prisma.$queryRawUnsafe(`
        SELECT DISTINCT
          COALESCE(cs.id, up.specialization_id, 0) AS id,
          COALESCE(NULLIF(cs.name, ''), NULLIF(up.course_name, ''), 'General') AS name,
          cs.slug,
          up.specialization_id,
          up.course_category_id
        FROM university_programs up
        LEFT JOIN course_specializations cs ON cs.id = up.specialization_id
        WHERE up.status = 1
        ORDER BY up.id DESC
        LIMIT 15
      `);
      allSpecs = Array.isArray(allProgramFallback) ? allProgramFallback : [];
    }
    if (allSpecs.length === 0) {
      const allCourseNameFallback: any = await prisma.$queryRawUnsafe(`
        SELECT DISTINCT
          up.id,
          TRIM(up.course_name) AS name,
          NULL AS slug,
          up.specialization_id,
          up.course_category_id
        FROM university_programs up
        WHERE up.status = 1
          AND up.course_name IS NOT NULL
          AND TRIM(up.course_name) <> ''
        ORDER BY up.id DESC
        LIMIT 15
      `);
      allSpecs = Array.isArray(allCourseNameFallback) ? allCourseNameFallback : [];
    }

    if (specWithContents.length === 0) {
      specWithContents = allSpecs.slice(0, 15).map((s: any) => ({
        id: s.id,
        name: s.name,
        slug: s.slug || (typeof s.name === 'string' ? s.name.toLowerCase().trim().replace(/\s+/g, '-') : null),
      }));
    }

    const seo = await seoService.getStaticPageSeo('university-overview', {
      title: university.name || '',
      address: university.city || '',
      shortnote: university.shortnote || '',
      universityname: university.name || '',
    });

    return {
      data: serializeBigInt({
        overviews,
        university_specializations_for_courses: universitySpecs,
        all_specializations_for_courses: allSpecs,
        specializations_with_contents: specWithContents
      }),
      seo
    };
  }

  async getUniversityRanking(uname: string) {
    const res: any = await prisma.$queryRawUnsafe(`SELECT id, name FROM universities WHERE uname = ? AND status = 1 LIMIT 1`, uname);
    if (!res.length) return null;
    const university = res[0];

    const rankings = await prisma.universityRanking.findMany({
      where: { university_id: university.id },
      orderBy: { position: 'asc' },
    });

    const seo = await seoService.getStaticPageSeo('university-ranking', {
      title: university.name || '',
      universityname: university.name || '',
    });

    return {
      data: serializeBigInt(rankings),
      seo
    };
  }

  async getUniversityGallery(uname: string) {
    const res: any = await prisma.$queryRawUnsafe(`SELECT id, name FROM universities WHERE uname = ? AND status = 1 LIMIT 1`, uname);
    if (!res.length) return null;
    const university = res[0];

    const photos = await prisma.universityPhoto.findMany({
      where: { university_id: university.id },
    });

    return {
      data: serializeBigInt(photos),
      seo: await seoService.getStaticPageSeo('university-gallery', {
        title: university.name || '',
        universityname: university.name || '',
      }),
    };
  }

  async getUniversityVideos(uname: string) {
    const res: any = await prisma.$queryRawUnsafe(`SELECT id, name FROM universities WHERE uname = ? AND status = 1 LIMIT 1`, uname);
    if (!res.length) return null;
    const university = res[0];

    const videos = await prisma.universityVideo.findMany({
      where: { university_id: university.id },
    });

    return {
      data: serializeBigInt(videos),
      seo: await seoService.getStaticPageSeo('university-videos', {
        title: university.name || '',
        universityname: university.name || '',
      }),
    };
  }

  async getUniversityReviews(uname: string) {
    const res: any = await prisma.$queryRawUnsafe(`SELECT id, name FROM universities WHERE uname = ? AND status = 1 LIMIT 1`, uname);
    if (!res.length) return null;
    const university = res[0];

    const reviews = await prisma.review.findMany({
      where: { university_id: university.id, status: 1 },
      orderBy: { created_at: 'desc' },
    });

    const seo = await seoService.getStaticPageSeo('university-reviews', {
      title: university.name || '',
      universityname: university.name || '',
    });

    return {
      data: serializeBigInt(reviews),
      seo
    };
  }

  async getUniversityCourses(uname: string, params: {
    level?: string;
    course_category_id?: string;
    specialization_id?: string;
    study_mode?: string;
    page?: number;
    limit?: number;
  }) {
    const res: any = await prisma.$queryRawUnsafe(`SELECT id FROM universities WHERE uname = ? AND status = 1 LIMIT 1`, uname);
    if (!res.length) return null;
    const university = res[0];

    const page = params.page || 1;
    const limit = params.limit || 10;
    const skip = (page - 1) * limit;

    let whereSql = `WHERE up.university_id = ? AND up.status = 1`;
    const args: any[] = [university.id];

    if (params.level) {
      whereSql += ` AND up.level = ?`;
      args.push(params.level);
    }
    if (params.course_category_id) {
      whereSql += ` AND up.course_category_id = ?`;
      args.push(Number(params.course_category_id));
    }
    if (params.specialization_id) {
      whereSql += ` AND up.specialization_id = ?`;
      args.push(Number(params.specialization_id));
    }
    if (params.study_mode) {
      whereSql += ` AND up.study_mode LIKE ?`;
      args.push(`%${params.study_mode}%`);
    }

    const courses: any = await prisma.$queryRawUnsafe(`
      SELECT up.*, cc.name as category_name, cc.slug as category_slug, cs.name as spec_name, cs.slug as spec_slug
      FROM university_programs up
      LEFT JOIN course_categories cc ON up.course_category_id = cc.id
      LEFT JOIN course_specializations cs ON up.specialization_id = cs.id
      ${whereSql}
      ORDER BY up.id DESC
      LIMIT ${limit} OFFSET ${skip}
    `, ...args);

    const countRes: any = await prisma.$queryRawUnsafe(`
      SELECT COUNT(*) as total FROM university_programs up ${whereSql}
    `, ...args);

    const total = Number(countRes[0]?.total || 0);

    return {
      data: serializeBigInt(courses.map((c: any) => ({
        ...c,
        tution_fee: c.tution_fee != null ? String(c.tution_fee) : null,
        courseCategory: c.category_name ? { name: c.category_name, slug: c.category_slug } : null,
        courseSpecialization: c.spec_name ? { name: c.spec_name, slug: c.spec_slug } : null
      }))),
      pagination: {
        total,
        current_page: page,
        last_page: Math.ceil(total / limit),
        per_page: limit
      }
    };
  }

  async getUniversityCourseDetail(university_slug: string, program_slug: string) {
    const res: any = await prisma.$queryRawUnsafe(`SELECT id, name, shortnote FROM universities WHERE uname = ? AND status = 1 LIMIT 1`, university_slug);
    if (!res.length) return null;
    const university = res[0];

    const programs: any = await prisma.$queryRawUnsafe(`
      SELECT up.*, 
             u.id as u_id, u.name as u_name, u.uname as u_uname, u.logo_path as u_logo_path, u.city as u_city,
             cc.name as category_name, cc.slug as category_slug,
             cs.name as spec_name, cs.slug as spec_slug
      FROM university_programs up
      JOIN universities u ON up.university_id = u.id
      LEFT JOIN course_categories cc ON up.course_category_id = cc.id
      LEFT JOIN course_specializations cs ON up.specialization_id = cs.id
      WHERE up.slug = ? AND up.university_id = ? AND up.status = 1
      LIMIT 1
    `, program_slug, university.id);

    const program = programs[0];
    if (!program) return null;

    const reshaped = {
      ...program,
      tution_fee: program.tution_fee != null ? String(program.tution_fee) : null,
      courseCategory: program.category_name ? { name: program.category_name, slug: program.category_slug } : null,
      courseSpecialization: program.spec_name ? { name: program.spec_name, slug: program.spec_slug } : null,
      university: {
        id: program.u_id,
        name: program.u_name,
        uname: program.u_uname,
        logo_path: program.u_logo_path,
        city: program.u_city
      }
    };

    const seo = await seoService.getStaticPageSeo('university-program-detail', {
      title: program.course_name,
      universityname: university.name || '',
      shortnote: university.shortnote || ''
    });

    return {
      data: serializeBigInt(reshaped),
      university: serializeBigInt(university),
      seo
    };
  }
}

export const universityService = UniversityService.getInstance();
