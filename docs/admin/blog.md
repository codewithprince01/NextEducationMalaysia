# Blog Module Documentation

**Laravel Admin Navbar Menu:** `Blog`  
**React Migration Status:** **`Done`**  
**React Components Implemented:**
- `src/pages/BlogCategories.tsx` (`/blog-category`, `/blog-categories`)
- `src/pages/Blogs.tsx` (`/blogs`)
- `src/pages/AddEditBlog.tsx` (`/blogs/create`, `/blogs/edit/:id`)

---

## 1. Blog Categories

**Laravel Route:** `/admin/blog-category`  
**Blade View:** `blog-category.blade.php`  
**Controller:** `BlogCategoryC.php`  
**Laravel Model:** `App\Models\BlogCategory`  
**React Component:** `admin-app/src/pages/BlogCategories.tsx`  
**Status:** **`Done`**

### Form & Input Fields
| Field Name | Input Type | Description / Notes |
|---|---|---|
| `category_name` | `text` (Required) | Category title |
| `category_slug` | `text` (Optional) | URL slug (auto-generated if empty) |
| `description` | `textarea` | Category summary/description |
| `meta_title` | `text` | SEO Meta Title |
| `meta_description` | `textarea` | SEO Meta Description |
| `meta_keyword` | `text` | SEO Meta Keywords |
| `seo_rating` | `number` (0 - 5.0) | SEO Rating score |
| `best_rating` | `number` (0 - 5.0) | Best Rating score |
| `review_number` | `number` | Number of Reviews count |
| `og_image_path` | `text` / `file` | OpenGraph Image URL / path |
| `status` | `select` (`1`: Active, `0`: Inactive) | Category publication status |

### Database Table (`blog_categories`)
| Column Name | Data Type | Key Constraints / Notes |
|---|---|---|
| `id` | `bigint` (PK) | Auto-increment primary key |
| `category_name` | `varchar(255)` | Category title |
| `category_slug` | `varchar(255)` | Unique URL slug |
| `description` | `text` | Category description |
| `meta_title` | `varchar(255)` | SEO Title |
| `meta_description` | `text` | SEO Description |
| `meta_keyword` | `text` | SEO Keywords |
| `seo_rating` | `decimal(2,1)` | Rating score |
| `best_rating` | `decimal(2,1)` | Best rating score |
| `review_number` | `integer` | Review count |
| `og_image_path` | `text` | OG image URL |
| `status` | `tinyint` | `1` = Active, `0` = Inactive |
| `created_at` | `timestamp` | Record creation timestamp |
| `updated_at` | `timestamp` | Record update timestamp |

---

## 2. Blogs

**Laravel Route:** `/admin/blogs`  
**Blade View:** `blogs.blade.php` & `blogs-form.blade.php`  
**Controller:** `BlogC.php`  
**Laravel Model:** `App\Models\Blog`  
**React Components:** `admin-app/src/pages/Blogs.tsx` & `AddEditBlog.tsx`  
**Status:** **`Done`**

### Form & Input Fields (Add / Edit Blog Form)
| Field Name | Input Type | Description / Notes |
|---|---|---|
| `title` / `headline` | `text` (Required) | Main Blog Article Headline / Title |
| `slug` | `text` | URL Slug (e.g. `top-universities-in-malaysia`) |
| `category_id` | `select` | Selected Blog Category ID |
| `author_id` | `select` | Selected Author ID |
| `short_description` | `textarea` | Summary for list view cards |
| `description` | `RichTextEditor` | Full HTML Blog Body Content |
| `thumbnail_path` / `thumbnail` | `file` / `text` | Thumbnail Image URL / Path |
| `meta_title` | `text` | SEO Title |
| `meta_keyword` | `text` | SEO Keywords |
| `meta_description` | `textarea` | SEO Description |
| `seo_rating` | `number` (1 - 5) | SEO Rating |
| `best_rating` | `number` (1 - 5) | Best Rating |
| `review_number` | `number` | Total Review Count |
| `og_image_path` / `og_image` | `file` / `text` | OG Sharing Image |
| `status` | `select` (`1`: Published, `0`: Draft) | Publication status |

### Database Table (`blogs`)
| Column Name | Data Type | Key Constraints / Notes |
|---|---|---|
| `id` | `bigint` (PK) | Auto-increment primary key |
| `title` | `varchar(255)` | Blog Title |
| `headline` | `text` | Blog Headline |
| `slug` | `varchar(255)` | Unique URL slug |
| `category_id` | `unsignedBigInteger` | Foreign key -> `blog_categories.id` |
| `author_id` | `unsignedBigInteger` | Foreign key -> `users.id` / `authors.id` |
| `thumbnail_path` | `text` | Path to thumbnail image |
| `short_description` | `text` | Short card summary |
| `description` | `longtext` | Full blog HTML content |
| `meta_title` | `varchar(255)` | SEO Title |
| `meta_keyword` | `text` | SEO Keywords |
| `meta_description` | `text` | SEO Description |
| `seo_rating` | `decimal(2,1)` | SEO Rating |
| `best_rating` | `decimal(2,1)` | Best Rating |
| `review_number` | `integer` | Review Count |
| `og_image_path` | `text` | OG Sharing Image Path |
| `status` | `tinyint` | `1` = Published, `0` = Draft |
| `created_by` | `unsignedBigInteger` | Foreign key -> `users.id` |
| `updated_by` | `unsignedBigInteger` | Foreign key -> `users.id` |
| `approved_by` | `unsignedBigInteger` | Foreign key -> `users.id` |
| `created_at` | `timestamp` | Creation timestamp |
| `updated_at` | `timestamp` | Update timestamp |

---

## 3. Blog Contents (Sub-Module)

**Laravel Route:** `/admin/blog-contents`  
**Blade View:** `blog-content.blade.php`  
**Controller:** `BlogContentC.php`  
**Laravel Model:** `App\Models\BlogContent`  
**React Integration:** Managed within `AddEditBlog.tsx` via RichTextEditor / Content Sections  
**Status:** **`Done`**

### Form & Input Fields
| Field Name | Input Type | Description / Notes |
|---|---|---|
| `blog_id` | `hidden` | Parent Blog ID |
| `title` | `text` | Section Title |
| `description` | `textarea` / `RichTextEditor` | Section Content |
| `position` | `number` | Ordering position |

### Database Table (`blog_contents`)
| Column Name | Data Type | Key Constraints / Notes |
|---|---|---|
| `id` | `bigint` (PK) | Auto-increment primary key |
| `blog_id` | `unsignedBigInteger` | Foreign key -> `blogs.id` |
| `title` | `varchar(255)` | Content Section Title |
| `description` | `longtext` | Content Section HTML Body |
| `position` | `integer` | Display order position |
| `created_at` | `timestamp` | Creation timestamp |
| `updated_at` | `timestamp` | Update timestamp |

---

## 4. Blog FAQs (Sub-Module)

**Laravel Route:** `/admin/blog-faqs`  
**Blade View:** `blog-faqs.blade.php`  
**Controller:** `BlogFaqC.php`  
**Laravel Model:** `App\Models\BlogFaq`  
**React Integration:** Managed within `AddEditBlog.tsx` & `Faqs.tsx`  
**Status:** **`Done`**

### Form & Input Fields
| Field Name | Input Type | Description / Notes |
|---|---|---|
| `blog_id` | `hidden` | Parent Blog ID |
| `question` | `text` (Required) | FAQ Question text |
| `answer` | `textarea` (Required) | FAQ Answer text |

### Database Table (`blog_faqs`)
| Column Name | Data Type | Key Constraints / Notes |
|---|---|---|
| `id` | `bigint` (PK) | Auto-increment primary key |
| `blog_id` | `unsignedBigInteger` | Foreign key -> `blogs.id` (onDelete cascade) |
| `question` | `text` | FAQ Question |
| `answer` | `longtext` | FAQ Answer |
| `created_at` | `timestamp` | Creation timestamp |
| `updated_at` | `timestamp` | Update timestamp |

---

## Verification & React Migration Confirmation
- [x] All form fields from Laravel `blogs-form.blade.php`, `blog-category.blade.php`, `blog-content.blade.php`, and `blog-faqs.blade.php` match the React components in `admin-app/src/pages/`.
- [x] Database schemas and relations (`blog_categories`, `blogs`, `blog_contents`, `blog_faqs`) are fully aligned with `BlogCategory.php`, `Blog.php`, `BlogContent.php`, and `BlogFaq.php` models.
- [x] Module status marked as **`Done`** in `admin_modules_plan.md`.
