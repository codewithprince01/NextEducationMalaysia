import { writeFile, mkdir, unlink } from "fs/promises";
import { existsSync } from "fs";
import path from "path";
import { slugify } from "@/lib/utils";

export interface UploadedFileResult {
  file_name: string;
  file_path: string;
}

/**
 * Save an uploaded file to `public/storage/uploads/{folder}`.
 * Returns relative path `uploads/{folder}/{fileName}` (or with YYYY/MM/DD).
 */
// Dynamic path builder to prevent Turbopack from scanning and bundling public/storage static assets
function getFilePath(baseSubDir: string, relativePath: string): string {
  const root = (process as any)["cwd"]();
  const sep = path.sep;
  const parts = [root, "public", baseSubDir, ...relativePath.split(/[\\/]/).filter(Boolean)];
  return parts.join(sep);
}

export async function saveUploadedFile(
  file: File | Blob,
  originalName: string,
  folder: string,
  oldFilePath?: string | null,
  useDateFolders: boolean = false,
): Promise<UploadedFileResult> {
  if (oldFilePath) {
    await deleteUploadedFile(oldFilePath);
  }

  const ext = path.extname(originalName) || ".bin";
  const rawBase = path.basename(originalName, ext);
  const fileSlug = slugify(rawBase) || "file";
  const fileName = `${fileSlug}_${Date.now()}${ext.toLowerCase()}`;

  const cleanFolder = folder.replace(/^\/+|\/+$/g, "");

  let relativeSubDir = `uploads/${cleanFolder}`;
  if (useDateFolders) {
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, "0");
    const dd = String(now.getDate()).padStart(2, "0");
    relativeSubDir = `uploads/${cleanFolder}/${yyyy}/${mm}/${dd}`;
  }

  const absoluteDir = getFilePath("storage", relativeSubDir);
  await mkdir(absoluteDir, { recursive: true });

  const absoluteFilePath = [absoluteDir, fileName].join(path.sep);
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  await writeFile(absoluteFilePath, buffer);

  const dbFilePath = `${relativeSubDir}/${fileName}`;

  return {
    file_name: fileName,
    file_path: dbFilePath,
  };
}

/**
 * Delete a file from local `public/storage` if it exists.
 */
export async function deleteUploadedFile(
  filePath?: string | null,
): Promise<boolean> {
  if (!filePath) return false;
  try {
    const cleanPath = filePath.replace(/^\/+/, "");
    const subPath = cleanPath.replace(/^storage[\\/]/, "");
    let absolutePath = getFilePath("storage", subPath);

    if (!existsSync(absolutePath)) {
      const root = (process as any)["cwd"]();
      absolutePath = [root, "public", ...cleanPath.split(/[\\/]/).filter(Boolean)].join(path.sep);
    }

    if (existsSync(absolutePath)) {
      await unlink(absolutePath);
      return true;
    }
  } catch (err) {
    console.warn("Could not delete file:", filePath, err);
  }
  return false;
}
