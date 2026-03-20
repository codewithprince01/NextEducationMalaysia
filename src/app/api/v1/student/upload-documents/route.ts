import { NextRequest, NextResponse } from 'next/server';
import { 
  withMiddleware, checkApiKey, requireAuth, apiSuccess, apiError, studentProfileService } from '@/backend';
import { DOMAIN } from '@/backend/utils/constants';

export const POST = withMiddleware(checkApiKey)(async (request: Request) => {
  const authResult = await requireAuth(request);
  if (authResult instanceof NextResponse) return authResult;

  try {
    const formData = await request.formData();
    const docName = formData.get('doc_name') as string;
    const docFile = formData.get('doc') as File;

    if (!docName || !docFile) {
      return apiError('Document name and file are required', 422);
    }

    // In a real production app, we would use a storage service (S3, etc.)
    // or a local upload utility. For this migration, we'll simulate the save
    // as we don't have the storage adapter set up yet.
    
    // Placeholder implementation for demo/migration purposes:
    const fileName = `${Date.now()}-${docFile.name}`;
    const filePath = `/uploads/documents/${fileName}`;
    
    const result = await studentProfileService.addDocument(
      authResult.student.sub,
      docName,
      fileName,
      filePath,
      DOMAIN
    );

    if (!result.status) return apiError(result.message, 400);

    return apiSuccess(null, result.message);
  } catch (error: any) {
    return apiError(error.message || 'Failed to upload document', 500);
  }
});
