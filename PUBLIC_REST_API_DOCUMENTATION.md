# Public REST API & Document URL Reference Guide

This document provides a comprehensive reference for the public REST APIs created for **Document Categories** and **University Documents**, along with instructions on testing endpoints and checking URLs in Next.js.

---

## 1. How to Test & Call API Endpoints

When running the Next.js server locally (default: `http://localhost:3000`), you can call these public endpoints via browser, Postman, cURL, or frontend apps.

### Base URL
- **Local**: `http://localhost:3000/api/v1`
- **Production**: `https://<your-domain>/api/v1`

---

## 2. API Endpoints Reference

### 2.1 List All University Documents
- **Endpoint**: `GET /api/v1/university-documents`
- **Description**: Returns a paginated list of public university documents with remote CDN file URLs, file size, and file type flags. Supports filtering, searching, and grouping.

#### Query Parameters
| Parameter | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `page` | `number` | `1` | Page number for pagination |
| `limit` | `number` | `20` | Items per page (max 100) |
| `university_id` | `number` | - | Filter documents by university ID |
| `university_slug` | `string` | - | Filter documents by university slug |
| `category_id` | `number` | - | Filter documents by category ID |
| `category_slug` | `string` | - | Filter documents by category slug |
| `file_type` | `string` | - | Filter by file extension/type (e.g. `pdf`, `image`, `video`, `doc`) |
| `visibility` | `string` | `public` | Filter by visibility (`public`, `private`, or `all`) |
| `search` | `string` | - | Search term in document title, category, description, or keywords |
| `group_by` | `string` | - | Set to `category` to receive documents grouped by category |

#### Example Requests
```bash
# Get page 1 with 10 documents
GET http://localhost:3000/api/v1/university-documents?page=1&limit=10

# Filter documents by category slug
GET http://localhost:3000/api/v1/university-documents?category_slug=admission-brochures

# Search documents
GET http://localhost:3000/api/v1/university-documents?search=engineering

# Group documents by category
GET http://localhost:3000/api/v1/university-documents?group_by=category
```

#### Response Structure
```json
{
  "success": true,
  "data": [
    {
      "id": 12,
      "university_id": 5,
      "university": {
        "id": 5,
        "name": "Asia Pacific University",
        "slug": "asia-pacific-university"
      },
      "category_id": 2,
      "category": {
        "id": 2,
        "name": "Brochures",
        "slug": "brochures"
      },
      "document_title": "2026 Prospectus",
      "file_path": "/uploads/university_docs/apu_prospectus.pdf",
      "file_url": "https://www.images.britannicaoverseas.com/em/uploads/university_docs/apu_prospectus.pdf",
      "file_size": 2458900,
      "formatted_file_size": "2.35 MB",
      "extension": "pdf",
      "is_image": false,
      "is_pdf": true,
      "is_video": false,
      "visibility": "public",
      "downloads_count": 42,
      "created_at": "2026-01-15T10:00:00.000Z"
    }
  ],
  "pagination": {
    "total": 45,
    "page": 1,
    "limit": 20,
    "total_pages": 3
  },
  "stats": {
    "total_documents": 45,
    "categories_count": 6,
    "public_count": 45,
    "private_count": 0
  },
  "filters": {
    "categories": [...],
    "universities": [...]
  }
}
```

---

### 2.2 Single Document Detail & Download Counter
- **Endpoint**: `GET /api/v1/university-documents/[id]`
- **Description**: Returns complete details for a single document by ID. Optionally increments download counter when downloaded.

#### Query Parameters
| Parameter | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `track_download` | `boolean` | `false` | Pass `true` to increment `downloads_count` |

#### Example Request
```bash
GET http://localhost:3000/api/v1/university-documents/12?track_download=true
```

---

### 2.3 List Document Categories
- **Endpoints**:
  - `GET /api/v1/document-categories`
  - `GET /api/v1/university-documents/categories`
- **Description**: Returns all document categories along with associated file counts.

#### Query Parameters
| Parameter | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `university_id` | `number` | - | Filter categories by documents attached to a specific university |
| `university_slug` | `string` | - | Filter categories by university slug |
| `search` | `string` | - | Search category title or slug |

#### Example Request
```bash
GET http://localhost:3000/api/v1/document-categories
```

---

## 3. Remote Storage & CDN File URLs

All file paths are stored relative to the uploads folder (e.g., `/uploads/university_docs/file.pdf`).

The API automatically resolves relative paths into full CDN URLs using the `getRemoteFileUrl` utility:
- **CDN Domain**: `https://www.images.britannicaoverseas.com`
- **Root Directory**: `/em`
- **Resulting CDN URL**: `https://www.images.britannicaoverseas.com/em/uploads/university_docs/file.pdf`

---

## 4. How to Check/Extract URLs in Next.js Code

### 4.1 In Next.js Route Handlers (`src/app/api/.../route.ts`)
```ts
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  // 1. Get complete URL string
  const fullUrl = request.url; 
  // Output: "http://localhost:3000/api/v1/university-documents?category_id=5"

  // 2. Access parsed Next.js URL object
  const { searchParams, pathname, origin, host } = request.nextUrl;

  console.log("Pathname:", pathname);                       // e.g. "/api/v1/university-documents"
  console.log("Category ID:", searchParams.get("category_id")); // e.g. "5"
  console.log("Origin:", origin);                           // e.g. "http://localhost:3000"

  return NextResponse.json({ fullUrl, pathname });
}
```

### 4.2 In Client Components (`"use client"`)
```tsx
"use client";

import { usePathname, useSearchParams } from "next/navigation";

export default function DocumentList() {
  const pathname = usePathname();           // e.g. "/university-documents"
  const searchParams = useSearchParams();     // e.g. searchParams.get("search")
  
  // Get full window URL in browser context
  const fullUrl = typeof window !== "undefined" ? window.location.href : "";

  return (
    <div>
      <p>Current Path: {pathname}</p>
      <p>Search Query: {searchParams.get("search")}</p>
      <p>Full Browser URL: {fullUrl}</p>
    </div>
  );
}
```
