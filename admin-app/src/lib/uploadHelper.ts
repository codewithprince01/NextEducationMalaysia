/**
 * Centralized upload helper for admin app.
 * Uploads a file to /api/v1/admin/upload-files with target folder.
 * Files are physically saved to C:\projects\NextEducationMalaysia\public\storage\uploads\{folder}\...
 */
export async function uploadFileToStorage(
  file: File,
  folder: string = "files",
): Promise<{ file_path: string; file_url: string }> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("folder", folder);
  formData.append("title", file.name);

  const res = await fetch("/api/v1/admin/upload-files", {
    method: "POST",
    body: formData,
  });

  const json = await res.json();
  if (res.ok && (json.status || json.success)) {
    return {
      file_path: json.file_path,
      file_url: json.file_url,
    };
  }

  throw new Error(json.message || json.error || "Failed to upload file");
}

/**
 * Helper to convert any DB image/file path into a clean, working URL.
 * Handles relative paths like "uploads/blogs/..." -> "/storage/uploads/blogs/...".
 */
export function getStorageUrl(path?: string | null): string {
  if (!path) return '';
  const cleaned = String(path).trim();
  if (!cleaned) return '';
  if (/^(https?:\/\/|data:)/i.test(cleaned)) return cleaned;

  const relative = cleaned
    .replace(/^\/+/, '')
    .replace(/^(public\/|storage\/)+/, '');

  return `/storage/${relative}`;
}

