import { NextRequest, NextResponse } from 'next/server';
import { 
  withMiddleware, checkApiKey, requireAuth, apiSuccess, apiError, studentProfileService } from '@/backend';
import { DOMAIN } from '@/backend/utils/constants';
import { mkdir, writeFile } from 'fs/promises';
import path from 'path';

export const POST = withMiddleware(checkApiKey)(async (request: Request) => {
  const authResult = await requireAuth(request);
  if (authResult instanceof NextResponse) return authResult;

  try {
    const formData = await request.formData();
    const docName = ((formData.get('doc_name') || formData.get('document_name')) as string)?.trim();
    const docFile = (formData.get('doc') || formData.get('document')) as File;

    if (!docName || !docFile) {
      return apiError('Document name and file are required', 422);
    }

    if (!/^[a-zA-Z0-9\s.\-]+$/.test(docName)) {
      return apiError('Document name contains invalid characters', 422);
    }

    const allowedExtensions = ['png', 'jpg', 'jpeg', 'pdf'];
    const extension = docFile.name.split('.').pop()?.toLowerCase() || '';
    if (!allowedExtensions.includes(extension)) {
      return apiError('Only .PNG, .JPG, .JPEG, .PDF files are allowed', 422);
    }

    // 2MB like old backend max:2048 (KB)
    if (docFile.size > 2 * 1024 * 1024) {
      return apiError('File size must be less than 2MB', 422);
    }

    const safeOriginalName = docFile.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const fileName = `${Date.now()}-${safeOriginalName}`;

    // Save in Next public dir so it is directly reachable:
    // http://localhost:3000/storage/uploads/documents/<file>
    const relativeDir = path.join('storage', 'uploads', 'documents');
    const uploadDir = path.join(process.cwd(), 'public', relativeDir);
    await mkdir(uploadDir, { recursive: true });

    const fileBuffer = Buffer.from(await docFile.arrayBuffer());
    await writeFile(path.join(uploadDir, fileName), fileBuffer);

    // Persist path shape compatible with old project
    const filePath = `${relativeDir}/${fileName}`;
    
    const requestOrigin = (() => {
      try {
        const host = request.headers.get('host') || '';
        const forwardedProto = request.headers.get('x-forwarded-proto') || 'https';
        return host ? `${forwardedProto}://${host}` : DOMAIN;
      } catch {
        return DOMAIN;
      }
    })();

    const result = await studentProfileService.addDocument(
      authResult.student.sub,
      docName,
      fileName,
      filePath,
      requestOrigin
    );

    if (!result.status) return apiError(result.message, 400);

    return apiSuccess(null, result.message);
  } catch (error: any) {
    return apiError(error.message || 'Failed to upload document', 500);
  }
});
