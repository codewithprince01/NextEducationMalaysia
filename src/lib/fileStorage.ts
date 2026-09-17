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
// Runtime path resolution to prevent Next.js / Webpack from treating public/storage as dynamic module bundles
function getStorageRoot(): string {
  const cwd = process.cwd();
  return path.resolve(cwd, "public", "storage");
}

function getPublicRoot(): string {
  const cwd = process.cwd();
  return path.resolve(cwd, "public");
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

  const storageRoot = getStorageRoot();
  const absoluteDir = path.resolve(storageRoot, relativeSubDir);
  await mkdir(absoluteDir, { recursive: true });

  const absoluteFilePath = path.resolve(absoluteDir, fileName);
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
    const storageRoot = getStorageRoot();
    let absolutePath = path.resolve(storageRoot, subPath);

    if (!existsSync(absolutePath)) {
      const publicRoot = getPublicRoot();
      absolutePath = path.resolve(publicRoot, cleanPath);
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
