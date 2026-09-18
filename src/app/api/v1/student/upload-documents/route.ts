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
    const docFile = (formData.get('doc') || formData.get('document') || formData.get('document_file')) as File;

    if (!docName || !docFile) {
      return apiError('Document name and file are required', 422);
    }

    if (!/^[a-zA-Z0-9\s.\-\/&(),_':;]+$/.test(docName)) {
      return apiError('Document name contains invalid characters', 422);
    }

    const allowedExtensions = ['png', 'jpg', 'jpeg', 'pdf'];
    const extension = docFile.name?.split('.').pop()?.toLowerCase() || '';
    if (!allowedExtensions.includes(extension)) {
      return apiError('Only .PNG, .JPG, .JPEG, .PDF files are allowed', 422);
    }

    // Up to 10MB
    if (docFile.size > 10 * 1024 * 1024) {
      return apiError('File size must be less than 10MB', 422);
    }

    const safeOriginalName = docFile.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const fileName = `${Date.now()}-${safeOriginalName}`;

    const rootDir = (process as any)['cwd']();
    const uploadDir = [rootDir, 'public', 'storage', 'uploads', 'documents'].join(path.sep);
    await mkdir(uploadDir, { recursive: true });

    const fileBuffer = Buffer.from(await docFile.arrayBuffer());
    await writeFile([uploadDir, fileName].join(path.sep), fileBuffer);

    // Persist path shape compatible with old project
    const filePath = `storage/uploads/documents/${fileName}`;
    
    const requestOrigin = (() => {
      try {
        const envSiteUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL || process.env.DOMAIN_URL;
        if (envSiteUrl && /^https?:\/\//i.test(envSiteUrl) && !/localhost|127\.0\.0\.1/i.test(envSiteUrl)) {
          return envSiteUrl.replace(/\/+$/, '');
        }
        const host = request.headers.get('x-forwarded-host') || request.headers.get('host') || '';
        const forwardedProto = request.headers.get('x-forwarded-proto') || 'https';
        if (host && !/localhost|127\.0\.0\.1/i.test(host)) {
          return `${forwardedProto}://${host}`.replace(/\/+$/, '');
        }
        return 'https://www.educationmalaysia.in';
      } catch {
        return 'https://www.educationmalaysia.in';
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
