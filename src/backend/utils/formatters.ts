// ============================================================
// FORMATTERS
// Ports Laravel helper.php formatting functions to TypeScript.
// j2s, jsonToList, pipeToJson, jsonToPipe, formatLocation, etc.
// ============================================================

/**
 * Converts a JSON string or array to a comma-separated string.
 * Port of PHP j2s() / json_to_string().
 */
export function jsonToString(data: string | unknown[] | null | undefined): string {
  if (!data) return 'N/A';
  const arr = typeof data === 'string' ? tryParse<unknown[]>(data) : data;
  return Array.isArray(arr) ? arr.join(', ') : 'N/A';
}

/**
 * Converts a JSON string/array to an HTML <ul> list.
 * Port of PHP json_to_list().
 */
export function jsonToHtmlList(data: string | unknown[] | null | undefined): string {
  if (!data) return 'N/A';
  const arr = typeof data === 'string' ? tryParse<unknown[]>(data) : data;
  if (!Array.isArray(arr) || arr.length === 0) return 'N/A';
  return `<ul>${arr.map((item) => `<li>${item}</li>`).join('')}</ul>`;
}

/**
 * Converts a pipe-separated string into a JSON array string.
 * Port of PHP pipeToJson().
 * @example pipeToJson('MBA | BBA | BE') → '["MBA","BBA","BE"]'
 */
export function pipeToJson(str: string | null | undefined): string | null {
  if (!str) return null;
  const arr = str.split('|').map((s) => s.trim()).filter(Boolean);
  return JSON.stringify(arr);
}

/**
 * Converts a JSON array string into a pipe-separated string.
 * Port of PHP jsonToPipe().
 * @example jsonToPipe('["MBA","BBA"]') → 'MBA | BBA'
 */
export function jsonToPipe(json: string | null | undefined): string | null {
  if (!json) return null;
  const arr = tryParse<string[]>(json);
  return Array.isArray(arr) ? arr.join(' | ') : null;
}

/**
 * Converts an array to pipe-separated string.
 * Port of PHP arrayToPipe().
 */
export function arrayToPipe(arr: string[] | null | undefined): string | null {
  if (!arr || arr.length === 0) return null;
  return arr.join(' | ');
}

/**
 * Converts comma/pipe string to array.
 * Port of PHP stringToArray().
 */
export function stringToArray(str: string | null | undefined): string[] | null {
  if (!str) return null;
  return str
    .split(/[,|]/)
    .map((s) => s.trim())
    .filter(Boolean);
}

/**
 * Formats a city/state/country location string.
 * Port of PHP formatLocation().
 */
export function formatLocation(
  city?: string | null,
  state?: string | null,
  country?: string | null
): string {
  return [city, state, country].filter(Boolean).join(', ');
}

/**
 * Converts snake_case column to human-readable label.
 * Port of PHP colToStr().
 * @example colToStr('course_level') → 'Course Level'
 */
export function colToStr(value: string): string {
  return value
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

/**
 * Generates a CDN/FTP image URL.
 * Port of PHP ftpFile().
 */
export function ftpFile(path: string, imageDomain: string): string {
  return `${imageDomain}${path}`;
}

// ─── Internal helper ──────────────────────────────────────────────────────────

function tryParse<T>(str: string): T | null {
  try {
    return JSON.parse(str) as T;
  } catch {
    return null;
  }
}

/**
 * Recursively converts BigInt and Prisma Decimal values to numbers in an object.
 * Necessary for JSON.stringify() which doesn't support BigInt or custom Decimal objects.
 */
export function serializeBigInt(obj: any): any {
  if (obj === null || obj === undefined) return obj;
  
  if (typeof obj === 'bigint') return Number(obj);
  
  if (Array.isArray(obj)) return obj.map(serializeBigInt);
  
  if (typeof obj === 'object') {
    // Handle Prisma Decimal (Decimal.js structure: { d, e, s })
    if ('d' in obj && 'e' in obj && 's' in obj && 'constructor' in obj) {
      if (typeof obj.toNumber === 'function') {
        return obj.toNumber();
      }
    }

    // Handle Date objects (keep as is, Next.js supports them)
    if (obj instanceof Date) return obj;

    return Object.fromEntries(
      Object.entries(obj).map(([k, v]) => [k, serializeBigInt(v)])
    );
  }
  
  return obj;
}
