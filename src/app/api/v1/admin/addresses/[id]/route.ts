import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { serializeBigInt } from '@/lib/utils';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: rawId } = await params;
    const id = parseInt(rawId, 10);
    const rows: any[] = await prisma.$queryRawUnsafe(
      `SELECT * FROM addresses WHERE id = ? LIMIT 1`,
      id
    );

    if (!rows || rows.length === 0) {
      return NextResponse.json({ status: false, message: 'Record not found' }, { status: 404 });
    }

    return NextResponse.json({
      status: true,
      data: serializeBigInt(rows[0]),
    });
  } catch (error: any) {
    return NextResponse.json({ status: false, message: 'Failed to fetch record', error: error.message }, { status: 500 });
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: rawId } = await params;
    const id = parseInt(rawId, 10);
    const body = await req.json();
    const { country, city, mobile, email, address } = body;

    if (!country || !city || !mobile || !email || !address) {
      return NextResponse.json({ status: false, message: 'All fields are required' }, { status: 400 });
    }

    const now = new Date();

    await prisma.$executeRawUnsafe(
      `UPDATE addresses 
       SET country = ?, city = ?, mobile = ?, email = ?, address = ?, updated_at = ?
       WHERE id = ?`,
      country,
      city,
      mobile,
      email,
      address,
      now,
      id
    );

    return NextResponse.json({ status: true, message: 'Record has been updated successfully.' });
  } catch (error: any) {
    console.error('Error updating address:', error);
    return NextResponse.json({ status: false, message: 'Failed to update record', error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: rawId } = await params;
    const id = parseInt(rawId, 10);
    await prisma.$executeRawUnsafe(`DELETE FROM addresses WHERE id = ?`, id);
    return NextResponse.json({ status: true, message: 'Record deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting address:', error);
    return NextResponse.json({ status: false, message: 'Failed to delete record', error: error.message }, { status: 500 });
  }
}
