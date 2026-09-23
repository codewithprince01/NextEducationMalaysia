import { NextResponse } from 'next/server';
import { syncSingleDocument } from '@/lib/documentUploadQueue';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const docId = parseInt(id, 10);

    if (!docId || isNaN(docId)) {
      return NextResponse.json(
        { success: false, message: 'Invalid document ID' },
        { status: 400 }
      );
    }

    const res = await syncSingleDocument(docId);
    return NextResponse.json(res);
  } catch (error: any) {
    console.error('Manual sync document error:', error);
    return NextResponse.json(
      {
        success: false,
        message: error?.message || 'Failed to sync document to FTP',
        error: error?.message,
      },
      { status: 500 }
    );
  }
}
