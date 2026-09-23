import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { serializeBigInt } from '@/lib/utils';
import { recordAuditLog } from '@/lib/auditLogger';

export async function GET() {
  try {
    const rows: any[] = await prisma.$queryRawUnsafe(
      `SELECT * FROM addresses WHERE website = 'MYS' ORDER BY id DESC`
    );

    return NextResponse.json({
      status: true,
      data: serializeBigInt(rows),
    });
  } catch (error: any) {
    console.error('Error fetching addresses:', error);
    return NextResponse.json({ status: false, message: 'Failed to fetch addresses', error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { country, city, mobile, email, address } = body;

    if (!country || !city || !mobile || !email || !address) {
      return NextResponse.json({ status: false, message: 'All fields (country, city, mobile, email, address) are required' }, { status: 400 });
    }

    const now = new Date();

    await prisma.$executeRawUnsafe(
      `INSERT INTO addresses (website, country, city, mobile, email, address, created_at, updated_at)
       VALUES ('MYS', ?, ?, ?, ?, ?, ?, ?)`,
      country,
      city,
      mobile,
      email,
      address,
      now,
      now
    );

    const [lastInsert]: any[] = await prisma.$queryRawUnsafe(`SELECT LAST_INSERT_ID() as id`);
    const newId = lastInsert?.id ? Number(lastInsert.id) : undefined;

    await recordAuditLog({
      req,
      action: 'CREATE',
      module: 'addresses',
      recordId: newId,
      description: `Created office address for '${city}, ${country}'`,
      newValues: body,
    });

    return NextResponse.json({ status: true, message: 'Record has been added successfully.' });
  } catch (error: any) {
    console.error('Error creating address:', error);
    return NextResponse.json({ status: false, message: 'Failed to create address', error: error.message }, { status: 500 });
  }
}

