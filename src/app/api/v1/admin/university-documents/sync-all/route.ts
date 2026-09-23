import { NextResponse } from 'next/server';
import { syncAllPending } from '@/lib/documentUploadQueue';

export async function POST() {
  try {
    const res = await syncAllPending();
    return NextResponse.json(res);
  } catch (error: any) {
    console.error('Manual sync all documents error:', error);
    return NextResponse.json(
      {
        success: false,
        message: error?.message || 'Failed to sync pending documents',
        error: error?.message,
      },
      { status: 500 }
    );
  }
}
