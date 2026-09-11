# Internships Module Documentation

**Laravel Admin Navbar Menu:** `Internships`  
**React Migration Status:** **`Done`**  
**React Component Implemented:** `src/pages/Internships.tsx` (`/internships`)

---

## 1. Internships (Main Module)

**Laravel Route:** `/admin/internships`  
**Blade View:** `internships.blade.php`  
**Controller:** `InternshipC.php`  
**Laravel Model:** `App\Models\Internship`  
**React Component:** `admin-app/src/pages/Internships.tsx`  
**Status:** **`Done`**

### Form & Input Fields
| Field Name | Input Type | Description / Notes |
|---|---|---|
| `title` | `text` (Required) | Internship Program Title |
| `slug` | `text` (Required) | URL Slug (e.g. `medical-internship-malaysia`) |
| `active_status` | `select` (`1`: Active, `0`: Inactive) | Publication / Active Status |
| `thumbnail` / `thumbnail_path` | `file` / `text` | Upload Thumbnail Image URL / Path |
| `shortnote` | `RichTextEditor` / `textarea` | Short Summary / Note |
| `meta_title` | `text` (via `<x-SeoField />`) | SEO Title |
| `meta_keyword` | `text` (via `<x-SeoField />`) | SEO Keywords |
| `meta_description` | `textarea` (via `<x-SeoField />`) | SEO Description |
| `seo_rating` | `number` (via `<x-SeoField />`) | SEO Rating |
| `best_rating` | `number` (via `<x-SeoField />`) | Best Rating |
| `review_number` | `number` (via `<x-SeoField />`) | Review Count |
| `og_image` / `og_image_path` | `file` / `text` (via `<x-SeoField />`) | OpenGraph Sharing Image Path |

### Database Table (`internships`)
| Column Name | Data Type | Key Constraints / Notes |
|---|---|---|
| `id` | `bigint` (PK) | Auto-increment primary key |
| `title` | `varchar(255)` | Program Title |
| `slug` | `varchar(255)` | Unique URL Slug |
| `thumbnail` | `text` | Thumbnail Image Path |
| `shortnote` | `text` | Short note |
| `active_status` | `tinyint` | `1` = Active, `0` = Inactive |
| `meta_title` | `varchar(255)` | SEO Meta Title |
| `meta_keyword` | `text` | SEO Meta Keywords |
| `meta_description` | `text` | SEO Meta Description |
| `seo_rating` | `decimal(2,1)` | SEO Rating |
| `best_rating` | `decimal(2,1)` | Best Rating |
| `review_number` | `integer` | Review Count |
| `og_image` | `text` | OG Image Path |
| `website` | `varchar(255)` | Site domain filter |
| `created_at` | `timestamp` | Creation timestamp |
| `updated_at` | `timestamp` | Update timestamp |

---

## 2. Internship Contents (Sub-Module)

**Laravel Route:** `/admin/internship-contents`  
**Blade View:** `internship-contents.blade.php`  
**Controller:** `InternshipContentC.php`  
**Laravel Model:** `App\Models\InternshipContent`  
**Status:** **`Done`**

### Form & Input Fields
| Field Name | Input Type | Description / Notes |
|---|---|---|
| `internship_id` | `hidden` | Parent Internship ID |
| `tab` | `text` | Tab / Section Header Title |
| `description` | `RichTextEditor` / `textarea` | Detailed Tab Content Body (CKEditor) |
| `position` | `number` | Display order rank |

### Database Table (`internship_contents`)
| Column Name | Data Type | Key Constraints / Notes |
|---|---|---|
| `id` | `bigint` (PK) | Auto-increment primary key |
| `internship_id` | `unsignedBigInteger` | Foreign key -> `internships.id` |
| `tab` | `varchar(255)` | Tab Title |
| `description` | `longtext` | Tab HTML Body |
| `position` | `integer` | Display order rank |
| `created_at` | `timestamp` | Creation timestamp |
| `updated_at` | `timestamp` | Update timestamp |

---

## 3. Internship FAQs (Sub-Module)

**Laravel Route:** `/admin/internship-faqs`  
**Blade View:** `internship-faqs.blade.php`  
**Controller:** `InternshipFaqC.php`  
**Laravel Model:** `App\Models\InternshipFaq`  
**Status:** **`Done`**

### Form & Input Fields
| Field Name | Input Type | Description / Notes |
|---|---|---|
| `internship_id` | `hidden` | Parent Internship ID |
| `question` | `text` (Required) | FAQ Question text |
| `answer` | `textarea` (Required) | FAQ Answer text |

### Database Table (`internship_faqs`)
| Column Name | Data Type | Key Constraints / Notes |
|---|---|---|
| `id` | `bigint` (PK) | Auto-increment primary key |
| `internship_id` | `unsignedBigInteger` | Foreign key -> `internships.id` |
| `question` | `text` | FAQ Question |
| `answer` | `longtext` | FAQ Answer |
| `created_at` | `timestamp` | Creation timestamp |
| `updated_at` | `timestamp` | Update timestamp |

---

## Verification & React Migration Confirmation
- [x] Implemented `src/pages/Internships.tsx` in React `admin-app`.
- [x] Added route `/internships` in `App.tsx` and sidebar navigation item under Content & Media.
- [x] Configured forms for main details, thumbnail upload, shortnote RichTextEditor, and SEO metadata.
- [x] Module status marked as **`Done`** in `admin_modules_plan.md`.
