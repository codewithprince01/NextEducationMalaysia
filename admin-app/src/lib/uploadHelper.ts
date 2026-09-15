/**
 * Centralized upload helper for admin app.
 * Uploads a file to /api/v1/admin/upload-files with target folder.
 * Files are physically saved to C:\projects\NextEducationMalaysia\public\storage\uploads\{folder}\...
 */
export async function uploadFileToStorage(
  file: File,
  folder: string = 'files'
): Promise<{ file_path: string; file_url: string }> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('folder', folder);
  formData.append('title', file.name);

  const res = await fetch('/api/v1/admin/upload-files', {
    method: 'POST',
    body: formData,
  });

  const json = await res.json();
  if (res.ok && (json.status || json.success)) {
    return {
      file_path: json.file_path,
      file_url: json.file_url,
    };
  }

  throw new Error(json.message || json.error || 'Failed to upload file');
}
