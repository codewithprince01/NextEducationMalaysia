import { NextRequest, NextResponse } from 'next/server';
import { readFile, stat } from 'fs/promises';
import path from 'path';

const MIME_TYPES: Record<string, string> = {
  pdf: 'application/pdf',
  png: 'image/png',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  webp: 'image/webp',
  svg: 'image/svg+xml',
  gif: 'image/gif',
  avif: 'image/avif',
  doc: 'application/msword',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  xls: 'application/vnd.ms-excel',
  xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  txt: 'text/plain',
};

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path: pathSegments } = await context.params;
    if (!pathSegments || pathSegments.length === 0) {
      return new NextResponse('File path not provided', { status: 400 });
    }

    const safeSegments = pathSegments.map((s) => s.replace(/[^a-zA-Z0-9._-]/g, ''));
    const cwd = process.cwd();

    // Check multiple candidate disk locations
    const candidatePaths = [
      path.join(cwd, 'public', 'storage', ...safeSegments),
      path.join(cwd, 'public', ...safeSegments),
      path.join(cwd, 'storage', ...safeSegments),
      path.join(cwd, 'public', 'storage', 'uploads', ...safeSegments),
      path.join(cwd, 'public', 'uploads', ...safeSegments),
    ];

    let targetPath: string | null = null;
    let fileStat = null;

    for (const p of candidatePaths) {
      // Security check: ensure path is inside project root
      const resolved = path.resolve(p);
      if (!resolved.startsWith(cwd)) continue;

      try {
        const s = await stat(resolved);
        if (s.isFile()) {
          targetPath = resolved;
          fileStat = s;
          break;
        }
      } catch {
        // Continue to next candidate
      }
    }

    if (!targetPath || !fileStat) {
      // Fallback: try remote CDN proxy if configured
      const subPath = safeSegments.join('/');
      const remoteCdnBase = process.env.REMOTE_STORAGE_CDN_URL || 'https://admin.educationmalaysia.in/storage';
      const remoteUrl = `${remoteCdnBase.replace(/\/+$/, '')}/${subPath}`;

      try {
        const cdnRes = await fetch(remoteUrl, { method: 'HEAD' });
        if (cdnRes.ok) {
          return NextResponse.redirect(remoteUrl, 307);
        }
      } catch {
        // Ignore fetch error
      }

      return new NextResponse('File Not Found', { status: 404 });
    }

    const ext = path.extname(targetPath).replace('.', '').toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';
    const fileBuffer = await readFile(targetPath);

    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Length': fileStat.size.toString(),
        'Cache-Control': 'public, max-age=31536000, immutable',
        'Content-Disposition': ext === 'pdf' || ['png', 'jpg', 'jpeg', 'webp', 'svg', 'gif'].includes(ext)
          ? 'inline'
          : `attachment; filename="${path.basename(targetPath)}"`,
      },
    });
  } catch (error: any) {
    console.error('[Storage Route] Error serving static file:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
