import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { serializeBigInt, slugify } from '@/lib/utils';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const minimal = searchParams.get('minimal') === 'true';
    const search = searchParams.get('search') || '';
    const state = searchParams.get('state') || '';
    const city = searchParams.get('city') || '';

    const website = searchParams.get('website');

    if (minimal) {
      let minSql = `SELECT id, name, uname FROM universities`;
      const minParams: any[] = [];
      if (website && website !== 'ALL') {
        minSql += ` WHERE website = ?`;
        minParams.push(website);
      } else if (!website) {
        minSql += ` WHERE website = 'MYS'`;
      }
      minSql += ` ORDER BY name ASC`;

      const minimalRows: any[] = await prisma.$queryRawUnsafe(minSql, ...minParams);
      return NextResponse.json({
        status: true,
        data: serializeBigInt(minimalRows),
      });
    }

    let sql = `
      SELECT u.*, it.type as institute_type_name,
             COALESCE(up.cnt, 0) AS programs_count,
             COALESCE(uo.cnt, 0) AS overviews_count,
             COALESCE(uph.cnt, 0) AS photos_count,
             COALESCE(uv.cnt, 0) AS videos_count,
             COALESCE(uf.cnt, 0) AS facilities_count
      FROM universities u
      LEFT JOIN institute_types it ON u.institute_type = it.id
      LEFT JOIN (SELECT university_id, COUNT(*) as cnt FROM university_programs GROUP BY university_id) up ON up.university_id = u.id
      LEFT JOIN (SELECT university_id, COUNT(*) as cnt FROM university_overviews GROUP BY university_id) uo ON uo.university_id = u.id
      LEFT JOIN (SELECT university_id, COUNT(*) as cnt FROM university_photos GROUP BY university_id) uph ON uph.university_id = u.id
      LEFT JOIN (SELECT university_id, COUNT(*) as cnt FROM university_videos GROUP BY university_id) uv ON uv.university_id = u.id
      LEFT JOIN (SELECT u_id, COUNT(*) as cnt FROM university_facilities GROUP BY u_id) uf ON uf.u_id = u.id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (website && website !== 'ALL') {
      sql += ` AND u.website = ?`;
      params.push(website);
    } else if (!website) {
      sql += ` AND (u.website = 'MYS' OR u.website IS NULL OR u.website = '')`;
    }

    if (search) {
      sql += ` AND (u.name LIKE ? OR u.city LIKE ? OR u.state LIKE ?)`;
      const pattern = `%${search}%`;
      params.push(pattern, pattern, pattern);
    }

    if (state) {
      sql += ` AND u.state = ?`;
      params.push(state);
    }

    if (city) {
      sql += ` AND u.city = ?`;
      params.push(city);
    }

    sql += ` ORDER BY u.id DESC`;

    const universities: any[] = await prisma.$queryRawUnsafe(sql, ...params);

    return NextResponse.json({
      status: true,
      data: serializeBigInt(universities),
    });
  } catch (error: any) {
    console.error('Error fetching universities:', error);
    return NextResponse.json({ status: false, message: 'Failed to fetch universities', error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      name,
      uname: customUname,
      views,
      city,
      state,
      institute_type,
      rating,
      qs_rank,
      qs_asia_rank,
      times_rank,
      author_id,
      logo_path,
      banner_path,
      latitude_longitude,
      local_students,
      international_students,
      contact_number1,
      contact_number2,
      established_year,
      email,
      cc,
      bcc,
      featured,
      is_local,
      is_international,
      scholarship_available,
      shortnote,
      approved_by,
      accredited_by,
      hostel_facility,
      page_content,
      meta_title,
      meta_keyword,
      meta_description,
      seo_rating,
      best_rating,
      review_number,
      og_image_path,
      status
    } = body;

    if (!name) {
      return NextResponse.json({ status: false, message: 'University name is required' }, { status: 400 });
    }

    const uname = customUname ? slugify(customUname) : slugify(name);
    const now = new Date();

    const maxRes: any[] = await prisma.$queryRawUnsafe(`SELECT MAX(id) as max_id FROM universities`);
    const nextId = (Number(maxRes[0]?.max_id) || 0) + 1;

    let inst_type: string | null = null;
    if (institute_type) {
      const itRes: any[] = await prisma.$queryRawUnsafe(
        `SELECT type FROM institute_types WHERE id = ? LIMIT 1`,
        Number(institute_type)
      );
      if (itRes.length > 0) inst_type = itRes[0].type;
    }

    await prisma.$executeRawUnsafe(
      `INSERT INTO universities 
       (id, name, uname, views, city, state, inst_type, institute_type, rating, qs_rank, qs_asia_rank, times_rank, author_id,
        logo_path, banner_path, latitude_longitude, local_students, international_students, contact_number1, contact_number2,
        established_year, email, cc, bcc, featured, is_local, is_international, scholarship_available, shortnote,
        approved_by, accredited_by, hostel_facility, page_content, meta_title, meta_keyword, meta_description,
        seo_rating, best_rating, review_number, og_image_path, website, status, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'MYS', ?, ?, ?)`,
      nextId,
      name,
      uname,
      views ? String(views) : '0',
      city || null,
      state || null,
      inst_type,
      institute_type ? Number(institute_type) : null,
      rating !== undefined && rating !== '' ? Number(rating) : null,
      qs_rank || null,
      qs_asia_rank || null,
      times_rank || null,
      author_id ? Number(author_id) : null,
      logo_path || null,
      banner_path || null,
      latitude_longitude || null,
      local_students !== undefined && local_students !== '' ? Number(local_students) : null,
      international_students !== undefined && international_students !== '' ? Number(international_students) : null,
      contact_number1 || null,
      contact_number2 || null,
      established_year || null,
      email || null,
      cc || null,
      bcc || null,
      featured ? 1 : 0,
      is_local ? 1 : 0,
      is_international ? 1 : 0,
      scholarship_available ? 1 : 0,
      shortnote || null,
      approved_by || null,
      accredited_by || null,
      hostel_facility || null,
      page_content || null,
      meta_title || null,
      meta_keyword || null,
      meta_description || null,
      seo_rating !== undefined && seo_rating !== '' ? Number(seo_rating) : null,
      best_rating !== undefined && best_rating !== '' ? Number(best_rating) : null,
      review_number !== undefined && review_number !== '' ? Number(review_number) : null,
      og_image_path || null,
      status !== undefined ? Number(status) : 1,
      now,
      now
    );

    return NextResponse.json({ status: true, message: 'University created successfully' });
  } catch (error: any) {
    console.error('Error creating university:', error);
    return NextResponse.json({ status: false, message: 'Failed to create university', error: error.message }, { status: 500 });
  }
}
