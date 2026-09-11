# More 1 Module Documentation

**Laravel Admin Navbar Menu:** `More 1`  
**React Migration Status:** **`Done`**  
**React Components Implemented:**

- `src/pages/PageContents.tsx` (`/page-contents`)
- `src/pages/StaticPageContents.tsx` (`/static-page-contents`)
- `src/pages/Services.tsx` (`/services`)
- `src/pages/Exams.tsx` (`/exams`)
- `src/pages/Authors.tsx` (`/authors`)
- `src/pages/Users.tsx` (`/users`)
- `src/pages/Testimonials.tsx` (`/testimonials`)

---

## 1. Home Page Contents

**Laravel Route:** `/admin/page-contents`  
**Blade View:** `page-contents.blade.php`  
**Controller:** `PageContentC.php`  
**Laravel Model:** `App\Models\PageContent`  
**React Component:** `admin-app/src/pages/PageContents.tsx`  
**Status:** **`Done`**

### Form & Input Fields

| Field Name    | Input Type                    | Description / Notes          |
| ------------- | ----------------------------- | ---------------------------- |
| `page_name`   | `text` (Required)             | Page Name (e.g. Home, About) |
| `author_id`   | `select`                      | Selected Author ID reference |
| `heading`     | `text`                        | Content Section Heading      |
| `description` | `RichTextEditor` / `textarea` | Section HTML Body (CKEditor) |

### Database Table (`page_contents`)

| Column Name   | Data Type            | Key Constraints / Notes    |
| ------------- | -------------------- | -------------------------- |
| `id`          | `bigint` (PK)        | Auto-increment primary key |
| `page_name`   | `varchar(255)`       | Page Identifier            |
| `heading`     | `varchar(255)`       | Section Heading            |
| `description` | `longtext`           | HTML Content Body          |
| `author_id`   | `unsignedBigInteger` | Foreign key -> `users.id`  |
| `created_at`  | `timestamp`          | Creation timestamp         |
| `updated_at`  | `timestamp`          | Update timestamp           |

---

## 2. University Page Contents

**Laravel Route:** `/admin/static-page-contents`  
**Blade View:** `static-page-contents.blade.php`  
**Controller:** `StaticPageContentC.php`  
**Laravel Model:** `App\Models\StaticPageContent`  
**React Component:** `admin-app/src/pages/StaticPageContents.tsx`  
**Status:** **`Done`**

### Form & Input Fields

| Field Name    | Input Type                    | Description / Notes                |
| ------------- | ----------------------------- | ---------------------------------- |
| `title`       | `text`                        | Content Section Title / Identifier |
| `description` | `RichTextEditor` / `textarea` | Static Page HTML Content Body      |

### Database Table (`static_page_contents`)

| Column Name   | Data Type     | Key Constraints / Notes    |
| ------------- | ------------- | -------------------------- |
| `id`          | `bigint` (PK) | Auto-increment primary key |
| `description` | `longtext`    | Static Page HTML Content   |
| `created_at`  | `timestamp`   | Creation timestamp         |
| `updated_at`  | `timestamp`   | Update timestamp           |

---

## 3. Services & Service Contents

**Laravel Route:** `/admin/services` & `/admin/service-content`  
**Blade View:** `services.blade.php` & `service-content.blade.php`  
**Controller:** `ServiceC.php` & `ServiceContentC.php`  
**Laravel Model:** `App\Models\Service` & `App\Models\ServiceContent`  
**React Component:** `admin-app/src/pages/Services.tsx`  
**Status:** **`Done`**

### Form & Input Fields

| Field Name         | Input Type        | Description / Notes  |
| ------------------ | ----------------- | -------------------- |
| `title`            | `text` (Required) | Service Title        |
| `uri`              | `text`            | Custom URI / Slug    |
| `shortnote`        | `textarea`        | Short Summary Note   |
| `thumbnail_path`   | `text` / `file`   | Thumbnail Image Path |
| `banner_path`      | `text` / `file`   | Banner Image Path    |
| `meta_title`       | `text`            | SEO Title            |
| `meta_keyword`     | `text`            | SEO Keywords         |
| `meta_description` | `textarea`        | SEO Description      |

### Database Table (`services` & `service_contents`)

| Column Name        | Data Type      | Key Constraints / Notes |
| ------------------ | -------------- | ----------------------- |
| `id`               | `bigint` (PK)  | Primary key             |
| `title`            | `varchar(255)` | Service Name            |
| `uri`              | `varchar(255)` | Unique URI Slug         |
| `shortnote`        | `text`         | Summary note            |
| `thumbnail_path`   | `text`         | Thumbnail Image         |
| `banner_path`      | `text`         | Banner Image            |
| `meta_title`       | `varchar(255)` | SEO Title               |
| `meta_keyword`     | `text`         | SEO Keywords            |
| `meta_description` | `text`         | SEO Description         |
| `created_at`       | `timestamp`    | Creation timestamp      |
| `updated_at`       | `timestamp`    | Update timestamp        |

---

## 4. Exams & Exam Sub-Modules

**Laravel Route:** `/admin/exams`  
**Blade View:** `exams.blade.php`, `exam-page-tabs.blade.php`, `exam-page-tab-contents.blade.php`, `exam-tab-faqs.blade.php`, `exam-faqs.blade.php`, `exam-content.blade.php`  
**Controller:** `ExamC.php`, `ExamPageTabC.php`, `ExamPageTabContentC.php`, `ExamTabFaqC.php`, `ExamFaqC.php`, `ExamContentC.php`  
**Laravel Model:** `App\Models\Exam`  
**React Component:** `admin-app/src/pages/Exams.tsx`  
**Status:** **`Done`**

### Form & Input Fields

| Field Name          | Input Type        | Description / Notes                  |
| ------------------- | ----------------- | ------------------------------------ |
| `exam_name`         | `text` (Required) | Exam Title (e.g. IELTS, TOEFL, MUET) |
| `exam_slug`         | `text`            | URL Slug                             |
| `short_description` | `textarea`        | Short Summary                        |
| `description`       | `RichTextEditor`  | Full Exam Overview HTML Body         |
| `meta_title`        | `text`            | SEO Title                            |
| `meta_keyword`      | `text`            | SEO Keywords                         |
| `meta_description`  | `textarea`        | SEO Description                      |

### Database Table (`exams`)

| Column Name         | Data Type      | Key Constraints / Notes |
| ------------------- | -------------- | ----------------------- |
| `id`                | `bigint` (PK)  | Primary Key             |
| `exam_name`         | `varchar(255)` | Exam Name               |
| `exam_slug`         | `varchar(255)` | Unique Slug             |
| `short_description` | `text`         | Summary                 |
| `description`       | `longtext`     | Full HTML Body          |
| `meta_title`        | `varchar(255)` | SEO Title               |
| `meta_keyword`      | `text`         | SEO Keywords            |
| `meta_description`  | `text`         | SEO Description         |
| `created_at`        | `timestamp`    | Creation timestamp      |
| `updated_at`        | `timestamp`    | Update timestamp        |

---

## 5. Authors & Users

**Laravel Route:** `/admin/users`  
**Blade View:** `users.blade.php` & `authors.blade.php`  
**Controller:** `UserC.php` & `AuthorC.php`  
**Laravel Model:** `App\Models\User` & `App\Models\Author`  
**React Components:** `admin-app/src/pages/Authors.tsx` & `Users.tsx`  
**Status:** **`Done`**

### Form & Input Fields

| Field Name        | Input Type         | Description / Notes                             |
| ----------------- | ------------------ | ----------------------------------------------- |
| `name`            | `text` (Required)  | Full Name                                       |
| `email`           | `email` (Required) | User Email Address                              |
| `password`        | `password`         | User Password                                   |
| `role`            | `select`           | User Role (admin, sub-admin, author, counselor) |
| `profile_picture` | `file` / `text`    | Avatar Image Path                               |
| `bio`             | `textarea`         | Author Bio Summary                              |
| `designation`     | `text`             | Professional Designation                        |

### Database Table (`users` / `authors`)

| Column Name       | Data Type      | Key Constraints / Notes |
| ----------------- | -------------- | ----------------------- |
| `id`              | `bigint` (PK)  | Primary Key             |
| `name`            | `varchar(255)` | User Name               |
| `email`           | `varchar(255)` | Unique Email            |
| `role`            | `varchar(100)` | User Role               |
| `designation`     | `varchar(255)` | Title/Designation       |
| `bio`             | `text`         | Bio description         |
| `profile_picture` | `text`         | Profile Picture URL     |
| `created_at`      | `timestamp`    | Creation timestamp      |
| `updated_at`      | `timestamp`    | Update timestamp        |

---

## 6. Testimonials

**Laravel Route:** `/admin/testimonials`  
**Blade View:** `testimonials.blade.php`  
**Controller:** `TestimonialC.php`  
**Laravel Model:** `App\Models\Testimonial`  
**React Component:** `admin-app/src/pages/Testimonials.tsx`  
**Status:** **`Done`**

### Form & Input Fields

| Field Name                  | Input Type            | Description / Notes           |
| --------------------------- | --------------------- | ----------------------------- |
| `name`                      | `text` (Required)     | Student / Reviewer Name       |
| `designation`               | `text`                | Course / University / Country |
| `review` / `comment`        | `textarea` (Required) | Testimonial Comment Text      |
| `rating`                    | `number` (1 - 5)      | Star Rating                   |
| `profile_picture` / `image` | `file` / `text`       | Student Avatar Image          |

### Database Table (`testimonials`)

| Column Name       | Data Type      | Key Constraints / Notes |
| ----------------- | -------------- | ----------------------- |
| `id`              | `bigint` (PK)  | Primary Key             |
| `name`            | `varchar(255)` | Reviewer Name           |
| `designation`     | `varchar(255)` | Subtitle / Designation  |
| `review`          | `text`         | Review comment          |
| `rating`          | `tinyint`      | Rating score (1 - 5)    |
| `profile_picture` | `text`         | Avatar Path             |
| `created_at`      | `timestamp`    | Creation timestamp      |
| `updated_at`      | `timestamp`    | Update timestamp        |

---

## Verification & React Migration Confirmation

- [x] All 6 sub-modules of More 1 (Home Page Contents, University Page Contents, Services, Exams, Authors/Users, and Testimonials) are fully implemented in React `admin-app`.
- [x] Module status set to **`Done`** in `admin_modules_plan.md`.
