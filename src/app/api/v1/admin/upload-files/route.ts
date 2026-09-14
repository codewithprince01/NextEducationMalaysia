import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { serializeBigInt } from '@/lib/utils';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

export async function GET() {
  try {
    const rows: any[] = await prisma.$queryRawUnsafe(
      `SELECT * FROM upload_files ORDER BY id DESC`
    );

    const data = rows.map((item) => ({
      ...item,
      file_path: item.file_path
        ? item.file_path.startsWith('/')
          ? item.file_path
          : `/${item.file_path}`
        : '',
    }));

    return NextResponse.json({
      status: true,
      data: serializeBigInt(data),
    });
  } catch (error: any) {
    console.error('Error fetching upload_files:', error);
    return NextResponse.json({ status: false, message: 'Failed to fetch upload files', error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const title = formData.get('title') as string;
    const file = formData.get('file') as File | null;
    const manualFilePath = formData.get('file_path') as string | null;

    if (!title) {
      return NextResponse.json({ status: false, message: 'Title is required' }, { status: 400 });
    }

    let fileName = '';
    let filePath = '';

    if (file && typeof file === 'object' && file.name) {
      const buffer = Buffer.from(await file.arrayBuffer());
      const ext = path.extname(file.name);
      const baseName = path.basename(file.name, ext).replace(/[^a-zA-Z0-9_-]/g, '_');
      fileName = `${Date.now()}_${baseName}${ext}`;

      const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'files');
      await mkdir(uploadDir, { recursive: true });
      await writeFile(path.join(uploadDir, fileName), buffer);

      filePath = `uploads/files/${fileName}`;
    } else if (manualFilePath) {
      filePath = manualFilePath.startsWith('/') ? manualFilePath.slice(1) : manualFilePath;
      fileName = filePath.split('/').pop() || filePath;
    } else {
      return NextResponse.json({ status: false, message: 'File is required' }, { status: 400 });
    }

    const now = new Date();

    await prisma.$executeRawUnsafe(
      `INSERT INTO upload_files (title, file_name, file_path, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?)`,
      title,
      fileName,
      filePath,
      now,
      now
    );

    return NextResponse.json({ status: true, message: 'File uploaded successfully' });
  } catch (error: any) {
    console.error('Error uploading file:', error);
    return NextResponse.json({ status: false, message: 'Failed to upload file', error: error.message }, { status: 500 });
  }
}

