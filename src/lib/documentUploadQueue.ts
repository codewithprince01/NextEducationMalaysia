import { prisma } from '@/lib/db';
import { uploadToRemoteStorage } from '@/lib/remoteStorage';
import { deleteUploadedFile } from '@/lib/fileStorage';
import { readFile } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';

export interface BackgroundUploadJob {
  docId: number;
  universityId: number;
  categorySlug: string;
  relativePath: string;
  originalName: string;
  mimeType: string;
}

// Global in-memory queue
const queue: BackgroundUploadJob[] = [];
let isProcessingQueue = false;
let sweepIntervalInitialized = false;

/**
 * Enqueue a document for background FTP upload and trigger the queue processor
 */
export function enqueueDocumentUpload(job: BackgroundUploadJob) {
  const exists = queue.some((q) => q.docId === job.docId);
  if (!exists) {
    queue.push(job);
  }

  initQueueSweeper();

  processQueue().catch((err) =>
    console.error('[DocumentQueue] Error in background upload queue:', err)
  );
}

/**
 * Process queued files sequentially and upload to FTP
 */
export async function processQueue() {
  if (isProcessingQueue) return;
  isProcessingQueue = true;

  try {
    while (queue.length > 0) {
      const job = queue.shift();
      if (!job) continue;

      try {
        console.log(`[DocumentQueue] Starting background FTP upload for Document #${job.docId}...`);

        const root = (process as any)['cwd']();
        const cleanSubPath = job.relativePath.replace(/^\/+/, '').replace(/^storage[\\/]/, '');
        let absolutePath = path.join(root, 'public', 'storage', ...cleanSubPath.split(/[\\/]/).filter(Boolean));

        if (!existsSync(absolutePath)) {
          absolutePath = path.join(root, 'public', ...job.relativePath.split(/[\\/]/).filter(Boolean));
        }

        if (!existsSync(absolutePath)) {
          console.warn(`[DocumentQueue] Local file not found for Doc #${job.docId}: ${job.relativePath}`);
          continue;
        }

        const buffer = await readFile(absolutePath);
        const subFolder = `university_docs/${job.universityId}/${job.categorySlug}`;

        const remoteRes = await uploadToRemoteStorage(
          buffer,
          subFolder,
          job.originalName,
          job.mimeType
        );

        const now = new Date();
        await prisma.$executeRawUnsafe(
          `UPDATE university_documents
           SET file_path = ?,
               extension = ?,
               file_size = ?,
               mime_type = ?,
               storage_driver = ?,
               updated_at = ?
           WHERE id = ?`,
          remoteRes.file_path,
          remoteRes.extension,
          remoteRes.file_size,
          remoteRes.mime_type,
          remoteRes.storage_driver,
          now,
          job.docId
        );

        // Remove temp local file once FTP upload succeeds
        await deleteUploadedFile(job.relativePath);
        console.log(`[DocumentQueue] Background FTP upload completed for Document #${job.docId}`);
      } catch (err: any) {
        console.error(`[DocumentQueue] Background FTP upload error for Doc #${job.docId}:`, err?.message || err);
      }
    }
  } finally {
    isProcessingQueue = false;
  }
}

/**
 * Manually sync a single pending document to remote FTP
 */
export async function syncSingleDocument(docId: number): Promise<{ success: boolean; message: string }> {
  const [doc]: any[] = await prisma.$queryRawUnsafe(
    `SELECT d.id, d.university_id, d.file_path, d.original_name, d.mime_type, c.slug AS category_slug
     FROM university_documents d
     LEFT JOIN university_document_categories c ON d.category_id = c.id
     WHERE d.id = ?`,
    docId
  );

  if (!doc) {
    throw new Error('Document not found');
  }

  if (!doc.file_path) {
    throw new Error('Document file path is missing');
  }

  const root = (process as any)['cwd']();
  const cleanSubPath = doc.file_path.replace(/^\/+/, '').replace(/^storage[\\/]/, '');
  let absolutePath = path.join(root, 'public', 'storage', ...cleanSubPath.split(/[\\/]/).filter(Boolean));

  if (!existsSync(absolutePath)) {
    absolutePath = path.join(root, 'public', ...doc.file_path.split(/[\\/]/).filter(Boolean));
  }

  if (!existsSync(absolutePath)) {
    throw new Error(`Local file not found on disk (${doc.file_path}). File may have already been moved or deleted.`);
  }

  const buffer = await readFile(absolutePath);
  const subFolder = `university_docs/${doc.university_id}/${doc.category_slug || 'general'}`;

  const remoteRes = await uploadToRemoteStorage(
    buffer,
    subFolder,
    doc.original_name || 'document',
    doc.mime_type || 'application/octet-stream'
  );

  const now = new Date();
  await prisma.$executeRawUnsafe(
    `UPDATE university_documents
     SET file_path = ?,
         extension = ?,
         file_size = ?,
         mime_type = ?,
         storage_driver = ?,
         updated_at = ?
     WHERE id = ?`,
    remoteRes.file_path,
    remoteRes.extension,
    remoteRes.file_size,
    remoteRes.mime_type,
    remoteRes.storage_driver,
    now,
    docId
  );

  await deleteUploadedFile(doc.file_path);
  console.log(`[DocumentQueue] Manual FTP sync completed for Document #${docId}`);

  return {
    success: true,
    message: 'Document synced to FTP storage successfully!',
  };
}

/**
 * Manually sync all pending documents to remote FTP
 */
export async function syncAllPending(): Promise<{ success: boolean; synced: number; failed: number; message: string }> {
  const pendingDocs: any[] = await prisma.$queryRawUnsafe(
    `SELECT id FROM university_documents WHERE storage_driver = 'local' OR storage_driver = 'pending_remote_ftp'`
  );

  let synced = 0;
  let failed = 0;
  for (const d of pendingDocs) {
    try {
      await syncSingleDocument(Number(d.id));
      synced++;
    } catch (e: any) {
      console.error(`[DocumentQueue] Failed manual sync for doc #${d.id}:`, e?.message || e);
      failed++;
    }
  }

  return {
    success: true,
    synced,
    failed,
    message: `Sync completed: ${synced} file(s) uploaded to FTP${failed > 0 ? `, ${failed} failed` : ''}`,
  };
}

/**
 * Sweeper worker to pick up any local files that haven't synced to FTP
 */
export async function sweepLocalPendingUploads() {
  try {
    const pendingDocs: any[] = await prisma.$queryRawUnsafe(
      `SELECT d.id, d.university_id, d.file_path, d.original_name, d.mime_type, c.slug AS category_slug
       FROM university_documents d
       LEFT JOIN university_document_categories c ON d.category_id = c.id
       WHERE (d.storage_driver = 'local' OR d.storage_driver = 'pending_remote_ftp')
         AND d.file_path IS NOT NULL
       LIMIT 20`
    );

    for (const doc of pendingDocs) {
      if (!doc.file_path) continue;
      const exists = queue.some((q) => q.docId === Number(doc.id));
      if (!exists) {
        queue.push({
          docId: Number(doc.id),
          universityId: Number(doc.university_id),
          categorySlug: doc.category_slug || 'general',
          relativePath: doc.file_path,
          originalName: doc.original_name || 'document',
          mimeType: doc.mime_type || 'application/octet-stream',
        });
      }
    }

    if (queue.length > 0) {
      processQueue().catch((err) =>
        console.error('[DocumentQueue] Failed to process queue in sweep:', err)
      );
    }
  } catch (err: any) {
    console.error('[DocumentQueue] Failed to sweep local pending uploads:', err);
  }
}

/**
 * Initialize queue sweeper interval (every 2 minutes)
 */
export function initQueueSweeper() {
  if (sweepIntervalInitialized) return;
  sweepIntervalInitialized = true;

  // Run sweep on initial load
  sweepLocalPendingUploads().catch(console.error);

  // Periodically sweep every 2 minutes
  const interval = setInterval(() => {
    sweepLocalPendingUploads().catch(console.error);
  }, 2 * 60 * 1000);

  // Prevent interval from blocking process shutdown if supported
  if (interval && typeof interval.unref === 'function') {
    interval.unref();
  }
}
