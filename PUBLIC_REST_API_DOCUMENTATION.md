# Public REST API Documentation & Usage Guide

This documentation provides an overview, endpoint reference, query parameters, usage patterns, and JSON response formats for the **University Documents & Categories REST API**.

---

## 🟢 Compatibility & Integration Notice

**Are these REST APIs compatible with other projects & different databases?**

**YES, 100% Compatible.**

- **Database Agnostic**: Consuming applications (Laravel, WordPress, React Native, Flutter, Vue, PHP, Node, Mobile Apps) do **NOT** need access to the underlying database.
- **Pure HTTP/JSON Protocol**: Any frontend or backend system across any server, serverless environment, or programming language can consume these endpoints via standard `GET` requests.
- **Pre-formatted CDN Media**: All document file paths are pre-resolved into absolute public CDN URLs (e.g., `https://www.images.britannicaoverseas.com/em/uploads/...`), eliminating the need for client applications to calculate storage paths or format file sizes.

---

## 📌 API Endpoints Overview

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/v1/university-documents` | List university documents with filtering, search, pagination, and category grouping |
| `GET` | `/api/v1/university-documents/[id]` | Get single document details & track download counts |
| `GET` | `/api/v1/document-categories` | List document categories with active file counts |
| `GET` | `/api/v1/university-documents/categories` | Alias endpoint for document categories |

---

## 1. List University Documents

**Endpoint**: `GET /api/v1/university-documents`

### Query Parameters

| Parameter | Type | Required | Default | Description |
| :--- | :--- | :--- | :--- | :--- |
| `university_id` | `number` | No | - | Filter documents by University ID (e.g. `5`) |
| `university_slug` | `string` | No | - | Filter documents by University Slug (e.g. `asia-pacific-university`) |
| `category_id` | `number` | No | - | Filter by Document Category ID (e.g. `2`) |
| `category_slug` | `string` | No | - | Filter by Category Slug (e.g. `brochures`, `fee-structure`) |
| `file_type` | `string` | No | - | Filter by file extension type: `pdf`, `image`, `video`, `doc` |
| `search` | `string` | No | - | Search keyword across document title, category, and description |
| `group_by` | `string` | No | - | Pass `category` to receive documents grouped by category |
| `visibility` | `string` | No | `public` | Filter visibility level (`public`, `agents_only`, `all`) |
| `page` | `number` | No | `1` | Page number for pagination |
| `limit` | `number` | No | `20` | Items per page (Pass `1000` for all items) |

---

### Common Usage Scenarios & HTTP Examples

#### Scenario A: Get ALL Documents of a Selected University
```http
GET /api/v1/university-documents?university_slug=asia-pacific-university&limit=1000
```
```bash
curl -X GET "https://<your-domain>/api/v1/university-documents?university_slug=asia-pacific-university&limit=1000"
```

#### Scenario B: Get Documents of a University GROUPED BY CATEGORY
```http
GET /api/v1/university-documents?university_slug=asia-pacific-university&group_by=category&limit=1000
```
```bash
curl -X GET "https://<your-domain>/api/v1/university-documents?university_slug=asia-pacific-university&group_by=category"
```

#### Scenario C: Get Documents of a University for a SINGLE CATEGORY
```http
GET /api/v1/university-documents?university_slug=asia-pacific-university&category_slug=brochures
```

#### Scenario D: Search Documents Across All Universities
```http
GET /api/v1/university-documents?search=engineering&file_type=pdf
```

---

### JSON Response Format

```json
{
  "success": true,
  "message": "University documents fetched successfully",
  "data": [
    {
      "id": 12,
      "title": "2026 Prospectus & Course Guide",
      "description": "Official 2026 prospectus including course fees and admission entry requirements.",
      "file_path": "/uploads/university_docs/apu_prospectus.pdf",
      "file_url": "https://www.images.britannicaoverseas.com/em/uploads/university_docs/apu_prospectus.pdf",
      "original_name": "apu_prospectus.pdf",
      "extension": "pdf",
      "file_size": 2458900,
      "formatted_file_size": "2.35 MB",
      "mime_type": "application/pdf",
      "visibility": "public",
      "downloads_count": 42,
      "is_image": false,
      "is_pdf": true,
      "is_video": false,
      "created_at": "2026-01-15T10:00:00.000Z",
      "university": {
        "id": 5,
        "name": "Asia Pacific University",
        "slug": "asia-pacific-university",
        "logo_path": "/uploads/logos/apu.png"
      },
      "category": {
        "id": 2,
        "name": "Brochures & Prospectus",
        "slug": "brochures",
        "icon": "ri-book-open-line",
        "description": "University prospectus, course guides, and brochures"
      }
    }
  ],
  "grouped_by_category": [
    {
      "category": {
        "id": 2,
        "name": "Brochures & Prospectus",
        "slug": "brochures",
        "icon": "ri-book-open-line"
      },
      "documents": [
        {
          "id": 12,
          "title": "2026 Prospectus & Course Guide",
          "file_url": "https://www.images.britannicaoverseas.com/em/uploads/university_docs/apu_prospectus.pdf",
          "formatted_file_size": "2.35 MB",
          "is_pdf": true
        }
      ]
    }
  ],
  "pagination": {
    "total": 45,
    "page": 1,
    "limit": 20,
    "totalPages": 3
  },
  "stats": {
    "total_documents": 45,
    "brochures_count": 12,
    "videos_count": 5,
    "total_storage_size": 104857600,
    "formatted_total_size": "100.00 MB"
  },
  "filters": {
    "categories": [
      {
        "id": 2,
        "name": "Brochures & Prospectus",
        "slug": "brochures",
        "documents_count": 12
      }
    ],
    "universities": [
      {
        "id": 5,
        "name": "Asia Pacific University",
        "uname": "asia-pacific-university"
      }
    ]
  }
}
```

---

## 2. Get Single Document Details & Track Downloads

**Endpoint**: `GET /api/v1/university-documents/[id]`

### Query Parameters

| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `track_download` | `boolean` | No | Set to `true` to increment `downloads_count` when user downloads document |

### HTTP Example
```http
GET /api/v1/university-documents/12?track_download=true
```
```bash
curl -X GET "https://<your-domain>/api/v1/university-documents/12?track_download=true"
```

### JSON Response Format
```json
{
  "success": true,
  "data": {
    "id": 12,
    "title": "2026 Prospectus & Course Guide",
    "description": "Official 2026 prospectus",
    "file_url": "https://www.images.britannicaoverseas.com/em/uploads/university_docs/apu_prospectus.pdf",
    "formatted_file_size": "2.35 MB",
    "downloads_count": 43,
    "is_pdf": true,
    "university": {
      "id": 5,
      "name": "Asia Pacific University",
      "slug": "asia-pacific-university"
    },
    "category": {
      "id": 2,
      "name": "Brochures & Prospectus",
      "slug": "brochures"
    }
  }
}
```

---

## 3. List Document Categories

**Endpoints**:
- `GET /api/v1/document-categories`
- `GET /api/v1/university-documents/categories`

### Query Parameters

| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `university_id` | `number` | No | Filter active categories associated with a specific University ID |
| `university_slug` | `string` | No | Filter active categories associated with a specific University Slug |
| `search` | `string` | No | Search category name or slug |

### HTTP Example
```http
GET /api/v1/document-categories?university_slug=asia-pacific-university
```
```bash
curl -X GET "https://<your-domain>/api/v1/document-categories?university_slug=asia-pacific-university"
```

### JSON Response Format
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Application Forms",
      "slug": "application-forms",
      "icon": "ri-file-list-line",
      "description": "Official admission application forms",
      "documents_count": 8
    },
    {
      "id": 2,
      "name": "Brochures & Prospectus",
      "slug": "brochures",
      "icon": "ri-book-open-line",
      "description": "University prospectus and brochures",
      "documents_count": 12
    }
  ]
}
```
