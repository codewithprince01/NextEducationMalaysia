import { NextResponse } from 'next/server';
import { syncAllPending } from '@/lib/documentUploadQueue';
import { recordAuditLog } from '@/lib/auditLogger';

export async function POST(req: Request) {
  try {
    const res = await syncAllPending();

    await recordAuditLog({
      req,
      action: 'UPDATE',
      module: 'university-documents',
      description: `Triggered sync all pending university documents to remote storage: ${res.success ? 'Success' : 'Failed'} (${res.message || ''})`,
      newValues: res,
    });

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
