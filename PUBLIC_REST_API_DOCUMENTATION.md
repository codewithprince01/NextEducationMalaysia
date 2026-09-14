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

### Document APIs
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/v1/university-documents` | List university documents with filtering, search, pagination, and category grouping |
| `GET` | `/api/v1/university-documents/[id]` | Get single document details & track download counts |
| `GET` | `/api/v1/document-categories` | List document categories with active file counts |
| `GET` | `/api/v1/university-documents/categories` | Alias endpoint for document categories |

### Single Search & Apply APIs
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/v1/search-and-apply/countries` | Fetch all countries that have university programs |
| `GET` | `/api/v1/search-and-apply/universities` | Fetch universities having programs (optional `website` filter) |
| `GET` | `/api/v1/search-and-apply/levels` | Fetch study levels (optional `university_id`, `website` filters) |
| `GET` | `/api/v1/search-and-apply/categories` | Fetch course categories (optional `university_id`, `level` filters) |
| `GET` | `/api/v1/search-and-apply/specializations` | Fetch specializations (optional `university_id`, `level`, `course_category_id`) |
| `GET` | `/api/v1/search-and-apply/programs` | Fetch paginated university programs with filters |

### Multiple Search & Apply APIs
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/v1/multiple-search-and-apply/levels` | Fetch levels by `website` and multiple `university_id`s |
| `GET` | `/api/v1/multiple-search-and-apply/categories` | Fetch categories by `website`, multiple `university_id`s & `level`s |
| `GET` | `/api/v1/multiple-search-and-apply/specializations` | Fetch specializations by `website`, `university_id`s, `level`s & `course_category_id`s |
| `GET` | `/api/v1/multiple-search-and-apply/programs` | Fetch paginated programs supporting multiple comma-separated filters |

---

## 1. List University Documents

**Endpoint**: `GET /api/v1/university-documents`

### Query Parameters

| Parameter         | Type     | Required | Default  | Description                                                          |
| :---------------- | :------- | :------- | :------- | :------------------------------------------------------------------- |
| `university_id`   | `number` | No       | -        | Filter documents by University ID (e.g. `5`)                         |
| `university_slug` | `string` | No       | -        | Filter documents by University Slug (e.g. `asia-pacific-university`) |
| `category_id`     | `number` | No       | -        | Filter by Document Category ID (e.g. `2`)                            |
| `category_slug`   | `string` | No       | -        | Filter by Category Slug (e.g. `brochures`, `fee-structure`)          |
| `file_type`       | `string` | No       | -        | Filter by file extension type: `pdf`, `image`, `video`, `doc`        |
| `search`          | `string` | No       | -        | Search keyword across document title, category, and description      |
| `group_by`        | `string` | No       | -        | Pass `category` to receive documents grouped by category             |
| `visibility`      | `string` | No       | `public` | Filter visibility level (`public`, `agents_only`, `all`)             |
| `page`            | `number` | No       | `1`      | Page number for pagination                                           |
| `limit`           | `number` | No       | `20`     | Items per page (Pass `1000` for all items)                           |

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

| Parameter        | Type      | Required | Description                                                               |
| :--------------- | :-------- | :------- | :------------------------------------------------------------------------ |
| `track_download` | `boolean` | No       | Set to `true` to increment `downloads_count` when user downloads document |

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

| Parameter         | Type     | Required | Description                                                         |
| :---------------- | :------- | :------- | :------------------------------------------------------------------ |
| `university_id`   | `number` | No       | Filter active categories associated with a specific University ID   |
| `university_slug` | `string` | No       | Filter active categories associated with a specific University Slug |
| `search`          | `string` | No       | Search category name or slug                                        |

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

---

## 4. Search & Apply REST APIs

### 4.1 Countries
- **Endpoint**: `GET /api/v1/search-and-apply/countries`
- **Response**: List of countries with active university programs (`[{ "website": "MYS", "name": "Malaysia" }]`).

### 4.2 Universities
- **Endpoint**: `GET /api/v1/search-and-apply/universities`
- **Query Params**: `website` (optional, e.g. `MYS`)
- **Response**: List of universities having programs (`[{ "id": 5, "name": "Asia Pacific University", "uname": "asia-pacific-university" }]`).

### 4.3 Levels
- **Endpoint**: `GET /api/v1/search-and-apply/levels`
- **Query Params**: `university_id` (optional), `website` (optional)
- **Response**: List of study levels (`[{ "level": "Bachelor Degree" }, { "level": "Master" }]`).

### 4.4 Categories
- **Endpoint**: `GET /api/v1/search-and-apply/categories`
- **Query Params**: `university_id` (optional), `level` (optional)
- **Response**: Course categories (`[{ "id": 1, "name": "Engineering", "slug": "engineering" }]`).

### 4.5 Specializations
- **Endpoint**: `GET /api/v1/search-and-apply/specializations`
- **Query Params**: `university_id` (optional), `level` (optional), `course_category_id` (optional)
- **Response**: Specializations (`[{ "id": 4, "name": "Software Engineering", "slug": "software-engineering" }]`).

### 4.6 Programs (Paginated)
- **Endpoint**: `GET /api/v1/search-and-apply/programs`
- **Query Params**: `university_id`, `level`, `course_category_id`, `specialization_id`, `country` (`website`), `page` (default `1`), `per_page` (default `10`)
- **Response**:
```json
{
  "status": true,
  "message": "Programs fetched successfully",
  "pagination": {
    "current_page": 1,
    "last_page": 5,
    "per_page": 10,
    "total": 50
  },
  "data": [
    {
      "id": 101,
      "course_name": "BSc (Hons) in Software Engineering",
      "level": "Bachelor Degree",
      "tution_fee": "RM 30,000",
      "university": {
        "id": 5,
        "name": "Asia Pacific University",
        "uname": "asia-pacific-university"
      },
      "courseCategory": { "id": 1, "name": "Engineering", "slug": "engineering" },
      "courseSpecialization": { "id": 4, "name": "Software Engineering", "slug": "software-engineering" }
    }
  ]
}
```

---

## 5. Multiple Search & Apply REST APIs

Supports selecting multiple values using comma-separated strings or arrays (e.g. `university_id=1,2,3`).

### 5.1 Levels
- **Endpoint**: `GET /api/v1/multiple-search-and-apply/levels`
- **Query Params**: `website` (required, e.g. `MYS`), `university_id` (optional, e.g. `1,2,5`)

### 5.2 Categories
- **Endpoint**: `GET /api/v1/multiple-search-and-apply/categories`
- **Query Params**: `website` (required), `university_id` (optional), `level` (optional, e.g. `Bachelor Degree,Master`)

### 5.3 Specializations
- **Endpoint**: `GET /api/v1/multiple-search-and-apply/specializations`
- **Query Params**: `website` (required), `university_id` (optional), `level` (optional), `course_category_id` (optional)

### 5.4 Programs (Paginated Multiple Filters)
- **Endpoint**: `GET /api/v1/multiple-search-and-apply/programs`
- **Query Params**: `website` (e.g. `MYS`), `university_id` (`1,2`), `level` (`Bachelor Degree,Master`), `course_category_id` (`1,3`), `specialization_id` (`4,8`), `page` (`1`), `per_page` (`10`)
- **Response**:
```json
{
  "status": true,
  "message": "Programs fetched successfully",
  "pagination": {
    "current_page": 1,
    "last_page": 8,
    "per_page": 10,
    "total": 78
  },
  "data": [ ... ]
}
```

