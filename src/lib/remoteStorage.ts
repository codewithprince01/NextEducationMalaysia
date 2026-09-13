import * as ftp from 'basic-ftp';
import { Readable } from 'stream';
import path from 'path';

export interface RemoteUploadResult {
  file_path: string;
  file_url: string;
  original_name: string;
  extension: string;
  file_size: number;
  mime_type: string;
  storage_driver: string;
}

export function getRemoteFileUrl(filePath: string | null | undefined): string {
  if (!filePath) {
    return '';
  }

  if (filePath.startsWith('http://') || filePath.startsWith('https://')) {
    return filePath;
  }

  const cleanPath = filePath.startsWith('/') ? filePath : `/${filePath}`;
  const baseUrl = (process.env.REMOTE_STORAGE_CDN_URL || 'https://www.images.britannicaoverseas.com/em').replace(/\/+$/, '');

  return `${baseUrl}${cleanPath}`;
}

export async function uploadToRemoteStorage(
  buffer: Buffer,
  subFolder: string = 'university_docs',
  originalName: string,
  mimeType?: string
): Promise<RemoteUploadResult> {
  const client = new ftp.Client();
  client.ftp.verbose = false;

  try {
    const host = process.env.SFTP_HOST || '96.30.198.41';
    const port = parseInt(process.env.SFTP_PORT || '21', 10);
    const user = process.env.SFTP_USERNAME || 'ftpimages@images.britannicaoverseas.com';
    const password = process.env.SFTP_PASSWORD || 'GZHAV=#3e~lS49i%';
    const root = (process.env.SFTP_ROOT || '/em/').replace(/\/+$/, '');

    await client.access({
      host,
      port,
      user,
      password,
      secure: false,
    });

    const ext = path.extname(originalName).replace('.', '').toLowerCase();
    const rawFileName = path.basename(originalName, path.extname(originalName));
    const slugName = rawFileName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'file';
    const randomSuffix = Math.random().toString(36).substring(2, 7);
    const fileName = `${slugName}-${Date.now()}-${randomSuffix}.${ext}`;

    const cleanSubFolder = subFolder.replace(/^\/+|\/+$/g, '');
    const remoteDir = `${root}/uploads/${cleanSubFolder}`;

    await client.ensureDir(remoteDir);

    const stream = Readable.from(buffer);
    await client.uploadFrom(stream, fileName);

    const dbFilePath = `/uploads/${cleanSubFolder}/${fileName}`;
    const fileUrl = getRemoteFileUrl(dbFilePath);

    return {
      file_path: dbFilePath,
      file_url: fileUrl,
      original_name: originalName,
      extension: ext,
      file_size: buffer.length,
      mime_type: mimeType || 'application/octet-stream',
      storage_driver: 'remote_ftp',
    };
  } catch (error: any) {
    console.error('Remote FTP Upload Error:', error);
    throw new Error(`Remote FTP Upload Failed: ${error.message || error}`);
  } finally {
    client.close();
  }
}

export async function deleteFromRemoteStorage(filePath: string): Promise<boolean> {
  if (!filePath) return false;

  const client = new ftp.Client();
  try {
    const host = process.env.SFTP_HOST || '96.30.198.41';
    const port = parseInt(process.env.SFTP_PORT || '21', 10);
    const user = process.env.SFTP_USERNAME || 'ftpimages@images.britannicaoverseas.com';
    const password = process.env.SFTP_PASSWORD || 'GZHAV=#3e~lS49i%';
    const root = (process.env.SFTP_ROOT || '/em/').replace(/\/+$/, '');

    await client.access({ host, port, user, password, secure: false });

    const cleanPath = filePath.replace(/^\/+/, '');
    const remoteFullPath = `${root}/${cleanPath}`;

    await client.remove(remoteFullPath);
    return true;
  } catch (error) {
    console.warn(`Could not delete remote file ${filePath}:`, error);
    return false;
  } finally {
    client.close();
  }
}
