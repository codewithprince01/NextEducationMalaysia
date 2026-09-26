import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { serializeBigInt, slugify } from '@/lib/utils';
import { recordAuditLog } from '@/lib/auditLogger';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const universities: any[] = await prisma.$queryRawUnsafe(
      `SELECT * FROM universities WHERE id = ? AND website = 'MYS' LIMIT 1`,
      Number(id)
    );

    if (universities.length === 0) {
      return NextResponse.json({ status: false, message: 'University not found' }, { status: 404 });
    }

    return NextResponse.json({
      status: true,
      data: serializeBigInt(universities[0]),
    });
  } catch (error: any) {
    console.error('Error fetching university:', error);
    return NextResponse.json({ status: false, message: 'Failed to fetch university', error: error.message }, { status: 500 });
  }
}

async function handleQuickPermissionUpdate(id: number, body: any, req: Request) {
  const existingRows: any[] = await prisma.$queryRawUnsafe(
    `SELECT id, name, status, homeview, featured FROM universities WHERE id = ? LIMIT 1`,
    id
  );
  if (!existingRows || existingRows.length === 0) {
    return NextResponse.json({ status: false, message: 'University not found' }, { status: 404 });
  }
  const existing = existingRows[0];

  const setClauses: string[] = [];
  const params: any[] = [];
  const newValues: Record<string, any> = {};
  const oldValues: Record<string, any> = {};

  if (body.status !== undefined) {
    const val = Number(body.status) ? 1 : 0;
    setClauses.push('status = ?');
    params.push(val);
    oldValues.status = existing.status;
    newValues.status = val;
  }

  if (body.homeview !== undefined) {
    const val = Number(body.homeview) ? 1 : 0;
    setClauses.push('homeview = ?');
    params.push(val);
    oldValues.homeview = existing.homeview;
    newValues.homeview = val;
  }

  if (body.featured !== undefined) {
    const val = Number(body.featured) ? 1 : 0;
    setClauses.push('featured = ?');
    params.push(val);
    oldValues.featured = existing.featured;
    newValues.featured = val;
  }

  if (setClauses.length === 0) {
    return NextResponse.json({ status: false, message: 'No valid permission fields provided' }, { status: 400 });
  }

  setClauses.push('updated_at = ?');
  params.push(new Date());
  params.push(id);

  await prisma.$executeRawUnsafe(
    `UPDATE universities SET ${setClauses.join(', ')} WHERE id = ?`,
    ...params
  );

  const changesDesc = Object.entries(newValues)
    .map(([k, v]) => `${k} -> ${v}`)
    .join(', ');

  await recordAuditLog({
    req,
    action: 'UPDATE',
    module: 'universities',
    recordId: id,
    description: `Quick updated permissions for university #${id} (${existing.name}): ${changesDesc}`,
    oldValues,
    newValues,
  });

  return NextResponse.json({
    status: true,
    message: 'University updated successfully',
    data: { id, ...newValues },
  });
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    return await handleQuickPermissionUpdate(Number(id), body, req);
  } catch (error: any) {
    console.error('Error in PATCH university:', error);
    return NextResponse.json({ status: false, message: 'Failed to update university', error: error.message }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();

    // Support quick toggle when full name is not provided
    if (!body.name && (body.status !== undefined || body.homeview !== undefined || body.featured !== undefined)) {
      return await handleQuickPermissionUpdate(Number(id), body, req);
    }

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
      homeview,
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

    // Fetch existing for audit diff
    const existing: any[] = await prisma.$queryRawUnsafe(
      `SELECT * FROM universities WHERE id = ? LIMIT 1`,
      Number(id)
    );
    const oldValues = existing?.[0] || null;

    const uname = customUname ? slugify(customUname) : slugify(name);
    const now = new Date();

    // Get institute type name
    let inst_type: string | null = null;
    if (institute_type) {
      const itRes: any[] = await prisma.$queryRawUnsafe(
        `SELECT type FROM institute_types WHERE id = ? LIMIT 1`,
        Number(institute_type)
      );
      if (itRes.length > 0) inst_type = itRes[0].type;
    }

    const effectiveHomeview = homeview !== undefined ? (Number(homeview) ? 1 : 0) : (oldValues?.homeview ?? 0);

    await prisma.$executeRawUnsafe(
      `UPDATE universities 
       SET name = ?, uname = ?, views = ?, city = ?, state = ?, inst_type = ?, institute_type = ?,
           rating = ?, qs_rank = ?, qs_asia_rank = ?, times_rank = ?, author_id = ?,
           logo_path = ?, banner_path = ?, latitude_longitude = ?, local_students = ?, international_students = ?,
           contact_number1 = ?, contact_number2 = ?, established_year = ?, email = ?, cc = ?, bcc = ?,
           featured = ?, homeview = ?, is_local = ?, is_international = ?, scholarship_available = ?,
           shortnote = ?, approved_by = ?, accredited_by = ?, hostel_facility = ?, page_content = ?,
           meta_title = ?, meta_keyword = ?, meta_description = ?, seo_rating = ?, best_rating = ?,
           review_number = ?, og_image_path = ?, status = ?, updated_at = ?
       WHERE id = ? AND website = 'MYS'`,
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
      effectiveHomeview,
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
      Number(id)
    );

    await recordAuditLog({
      req,
      action: 'UPDATE',
      module: 'universities',
      recordId: Number(id),
      description: `Updated university '${name}' (ID: ${id})`,
      oldValues,
      newValues: { id: Number(id), name, uname, city, state, rating, status, homeview: effectiveHomeview, featured: featured ? 1 : 0 },
    });

    return NextResponse.json({ status: true, message: 'University updated successfully' });
  } catch (error: any) {
    console.error('Error updating university:', error);
    return NextResponse.json({ status: false, message: 'Failed to update university', error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const existing: any[] = await prisma.$queryRawUnsafe(
      `SELECT * FROM universities WHERE id = ? LIMIT 1`,
      Number(id)
    );
    const oldValues = existing?.[0] || null;

    await prisma.$executeRawUnsafe(`DELETE FROM universities WHERE id = ? AND website = 'MYS'`, Number(id));

    await recordAuditLog({
      req,
      action: 'DELETE',
      module: 'universities',
      recordId: Number(id),
      description: `Deleted university '${oldValues?.name || id}' (ID: ${id})`,
      oldValues,
    });

    return NextResponse.json({ status: true, message: 'University deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting university:', error);
    return NextResponse.json({ status: false, message: 'Failed to delete university', error: error.message }, { status: 500 });
  }
}
