import * as ftp from 'basic-ftp';
import { Readable } from 'stream';
import path from 'path';
import { prisma } from './db';

export interface RemoteUploadResult {
  file_path: string;
  file_url: string;
  original_name: string;
  extension: string;
  file_size: number;
  mime_type: string;
  storage_driver: string;
}

export interface StorageConfig {
  sftp_host: string;
  sftp_port: number;
  sftp_username: string;
  sftp_password: string;
  sftp_root: string;
  remote_storage_cdn_url: string;
}

let cachedConfig: StorageConfig | null = null;
let cacheExpiresAt = 0;

/**
 * Retrieves storage config dynamically from `system_settings` table.
 * Caches in memory for 20 seconds.
 */
export async function getStorageConfig(forceFresh = false): Promise<StorageConfig> {
  const now = Date.now();
  if (!forceFresh && cachedConfig && now < cacheExpiresAt) {
    return cachedConfig;
  }

  const fallback: StorageConfig = {
    sftp_host: process.env.SFTP_HOST || '103.212.121.117',
    sftp_port: parseInt(process.env.SFTP_PORT || '21', 10),
    sftp_username: process.env.SFTP_USERNAME || 'ftpimages@images.britannicaoverseas.com',
    sftp_password: process.env.SFTP_PASSWORD || 'GZHAV=#3e~lS49i%',
    sftp_root: (process.env.SFTP_ROOT || '/em/').replace(/\/+$/, ''),
    remote_storage_cdn_url: (process.env.REMOTE_STORAGE_CDN_URL || 'https://www.images.britannicaoverseas.com/em').replace(/\/+$/, ''),
  };

  try {
    const rows: any[] = await prisma.$queryRawUnsafe(
      'SELECT `key`, `value` FROM system_settings WHERE `key` IN (?, ?, ?, ?, ?, ?)',
      'sftp_host',
      'sftp_port',
      'sftp_username',
      'sftp_password',
      'sftp_root',
      'remote_storage_cdn_url'
    );

    const map: Record<string, string> = {};
    for (const r of rows) {
      if (r.key && r.value !== null && r.value !== undefined) {
        map[r.key] = String(r.value).trim();
      }
    }

    cachedConfig = {
      sftp_host: map['sftp_host'] || fallback.sftp_host,
      sftp_port: map['sftp_port'] ? parseInt(map['sftp_port'], 10) : fallback.sftp_port,
      sftp_username: map['sftp_username'] || fallback.sftp_username,
      sftp_password: map['sftp_password'] || fallback.sftp_password,
      sftp_root: (map['sftp_root'] || fallback.sftp_root).replace(/\/+$/, ''),
      remote_storage_cdn_url: (map['remote_storage_cdn_url'] || fallback.remote_storage_cdn_url).replace(/\/+$/, ''),
    };
    cacheExpiresAt = now + 20000;
    return cachedConfig;
  } catch (err) {
    console.warn('Could not read storage config from system_settings, using fallback:', err);
    cachedConfig = fallback;
    cacheExpiresAt = now + 5000;
    return fallback;
  }
}

/**
 * Updates storage config in system_settings table and clears in-memory cache.
 */
export async function updateStorageConfig(dto: Partial<StorageConfig>): Promise<{ success: boolean; message: string; config: StorageConfig }> {
  const keys: Array<{ key: string; value: string; type: string; desc: string }> = [];

  if (dto.sftp_host !== undefined) {
    keys.push({ key: 'sftp_host', value: String(dto.sftp_host).trim(), type: 'string', desc: 'FTP / SFTP Host IP or Domain' });
  }
  if (dto.sftp_port !== undefined) {
    keys.push({ key: 'sftp_port', value: String(dto.sftp_port).trim(), type: 'number', desc: 'FTP Port' });
  }
  if (dto.sftp_username !== undefined) {
    keys.push({ key: 'sftp_username', value: String(dto.sftp_username).trim(), type: 'string', desc: 'FTP Username' });
  }
  if (dto.sftp_password !== undefined && dto.sftp_password !== '') {
    keys.push({ key: 'sftp_password', value: String(dto.sftp_password).trim(), type: 'string', desc: 'FTP Password' });
  }
  if (dto.sftp_root !== undefined) {
    keys.push({ key: 'sftp_root', value: String(dto.sftp_root).trim(), type: 'string', desc: 'FTP Root Directory' });
  }
  if (dto.remote_storage_cdn_url !== undefined) {
    keys.push({ key: 'remote_storage_cdn_url', value: String(dto.remote_storage_cdn_url).trim().replace(/\/+$/, ''), type: 'string', desc: 'Remote Storage CDN Base URL' });
  }

  for (const item of keys) {
    await prisma.$executeRawUnsafe(
      'INSERT INTO system_settings (`key`, `value`, `type`, `description`, created_at, updated_at) VALUES (?, ?, ?, ?, NOW(), NOW()) ON DUPLICATE KEY UPDATE `value` = VALUES(`value`), updated_at = NOW()',
      item.key,
      item.value,
      item.type,
      item.desc
    );
  }

  // Clear cache
  cachedConfig = null;
  cacheExpiresAt = 0;
  const fresh = await getStorageConfig(true);

  return {
    success: true,
    message: 'FTP Storage settings updated successfully! All future uploads and URL resolutions will use the updated settings.',
    config: fresh,
  };
}

/**
 * Tests FTP connection using basic-ftp.
 */
export async function testRemoteStorageConnection(customConfig?: Partial<StorageConfig>): Promise<{ success: boolean; message: string }> {
  const current = await getStorageConfig();
  const target: StorageConfig = {
    sftp_host: customConfig?.sftp_host || current.sftp_host,
    sftp_port: customConfig?.sftp_port ? Number(customConfig.sftp_port) : current.sftp_port,
    sftp_username: customConfig?.sftp_username || current.sftp_username,
    sftp_password: customConfig?.sftp_password || current.sftp_password,
    sftp_root: customConfig?.sftp_root || current.sftp_root,
    remote_storage_cdn_url: customConfig?.remote_storage_cdn_url || current.remote_storage_cdn_url,
  };

  const client = new ftp.Client(8000);
  client.ftp.verbose = false;

  try {
    await client.access({
      host: target.sftp_host,
      port: target.sftp_port,
      user: target.sftp_username,
      password: target.sftp_password,
      secure: false,
    });

    return {
      success: true,
      message: `Successfully connected to FTP server at ${target.sftp_host}:${target.sftp_port}!`,
    };
  } catch (err: any) {
    return {
      success: false,
      message: `FTP Connection Failed: ${err.message || err}`,
    };
  } finally {
    client.close();
  }
}

export function getRemoteFileUrl(filePath: string | null | undefined): string {
  if (!filePath) {
    return '';
  }

  if (filePath.startsWith('http://') || filePath.startsWith('https://')) {
    return filePath;
  }

  const cleanPath = filePath.startsWith('/') ? filePath : `/${filePath}`;
  const baseUrl = (
    cachedConfig?.remote_storage_cdn_url ||
    process.env.REMOTE_STORAGE_CDN_URL ||
    'https://www.images.britannicaoverseas.com/em'
  ).replace(/\/+$/, '');

  return `${baseUrl}${cleanPath}`;
}

export async function uploadToRemoteStorage(
  buffer: Buffer,
  subFolder: string = 'university_docs',
  originalName: string,
  mimeType?: string
): Promise<RemoteUploadResult> {
  const conf = await getStorageConfig();
  const client = new ftp.Client(10000);
  client.ftp.verbose = false;

  try {
    await client.access({
      host: conf.sftp_host,
      port: conf.sftp_port,
      user: conf.sftp_username,
      password: conf.sftp_password,
      secure: false,
    });

    const ext = path.extname(originalName).replace('.', '').toLowerCase();
    const rawFileName = path.basename(originalName, path.extname(originalName));
    const slugName = rawFileName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'file';
    const randomSuffix = Math.random().toString(36).substring(2, 7);
    const fileName = `${slugName}-${Date.now()}-${randomSuffix}.${ext}`;

    const cleanSubFolder = subFolder.replace(/^\/+|\/+$/g, '');
    const remoteDir = `${conf.sftp_root}/uploads/${cleanSubFolder}`;

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

  const conf = await getStorageConfig();
  const client = new ftp.Client(10000);
  try {
    await client.access({
      host: conf.sftp_host,
      port: conf.sftp_port,
      user: conf.sftp_username,
      password: conf.sftp_password,
      secure: false,
    });

    const cleanPath = filePath.replace(/^\/+/, '');
    const remoteFullPath = `${conf.sftp_root}/${cleanPath}`;

    await client.remove(remoteFullPath);
    return true;
  } catch (error) {
    console.warn(`Could not delete remote file ${filePath}:`, error);
    return false;
  } finally {
    client.close();
  }
}
