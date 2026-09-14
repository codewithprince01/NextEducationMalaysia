# Partners Module Documentation

**Laravel Admin Navbar Menu:** `Partners`  
**React Migration Status:** **`Done`**  
**React Route:** `/our-partners`  
**React Component:** [`OurPartners.tsx`](file:///c:/projects/NextEducationMalaysia/admin-app/src/pages/OurPartners.tsx)

---

## Our Partners

**Laravel Route:** `/admin/our-partners`  
**Blade View:** `our-partners.blade.php`  
**Controller:** `OurPartnerC.php`  
**Laravel Model:** `App\Models\OurPartner`

### Overview & Description

The Partners module manages institutional affiliates, study abroad agency partner profiles, university representatives, and counselor cards displayed across the public portal. Each partner profile supports contact info, verification badges, star ratings, experience tracking, student placement metrics, and specialization tags.

---

### Form & Input Fields

| Field Name         | Type / Source                     | Validation Rules                                  | Description                                                      |
| ------------------ | --------------------------------- | ------------------------------------------------- | ---------------------------------------------------------------- |
| `name`             | Blade Input (`text`)              | `required\|string\|max:255`                       | Full name of the partner or representative                       |
| `designation`      | Blade Input (`text`)              | `required\|string\|max:255`                       | Job title or designation (e.g. Senior Admissions Representative) |
| `company`          | Blade Input (`text`)              | `nullable\|string\|max:255`                       | Partner institution or company name                              |
| `profile_image`    | Blade Input (`file`)              | `nullable\|max:5000\|mimes:jpg,jpeg,png,gif,webp` | Profile avatar / company logo image                              |
| `is_verified`      | Blade Input (`checkbox`)          | `nullable\|boolean`                               | Verification badge flag                                          |
| `rating`           | Blade Input (`number`)            | `nullable\|numeric\|min:0\|max:5`                 | Star rating score (0.0 - 5.0)                                    |
| `phone`            | Blade Input (`text`)              | `nullable\|string\|max:50`                        | Direct contact telephone number                                  |
| `email`            | Blade Input (`email`)             | `nullable\|email\|max:255`                        | Direct email address                                             |
| `city`             | Blade Input (`text`)              | `nullable\|string\|max:100`                       | City location                                                    |
| `state`            | Blade Input (`text`)              | `nullable\|string\|max:100`                       | State / Province                                                 |
| `country`          | Blade Input (`text`)              | `nullable\|string\|max:100`                       | Country location                                                 |
| `experience_years` | Blade Input (`number`)            | `nullable\|integer\|min:0`                        | Total years of study counselling experience                      |
| `students_placed`  | Blade Input (`number`)            | `nullable\|integer\|min:0`                        | Total count of students successfully placed                      |
| `specializations`  | Blade Input (`textarea`)          | `nullable\|string`                                | Comma-separated list of specialization topics/countries          |
| `is_active`        | Blade Input (`select`/`checkbox`) | `nullable\|boolean`                               | Public visibility status (1 = Active, 0 = Inactive)              |

---

### Database Table Schema (`our_partners`)

| Column Name        | Data Type             | Nullable | Default        | Description                        |
| ------------------ | --------------------- | -------- | -------------- | ---------------------------------- |
| `id`               | `bigint(20) unsigned` | No       | Auto-Increment | Primary Key                        |
| `name`             | `varchar(255)`        | No       | None           | Partner / Representative full name |
| `designation`      | `varchar(255)`        | No       | None           | Professional title                 |
| `company`          | `varchar(255)`        | Yes      | `NULL`         | Organization / Agency name         |
| `profile_image`    | `varchar(255)`        | Yes      | `NULL`         | File path to stored avatar logo    |
| `is_verified`      | `tinyint(1)`          | No       | `0`            | Verification check flag            |
| `rating`           | `decimal(3,2)`        | No       | `0.00`         | Star rating score                  |
| `phone`            | `varchar(50)`         | Yes      | `NULL`         | Mobile / Phone number              |
| `email`            | `varchar(255)`        | Yes      | `NULL`         | Email address                      |
| `city`             | `varchar(100)`        | Yes      | `NULL`         | Office city                        |
| `state`            | `varchar(100)`        | Yes      | `NULL`         | Office state                       |
| `country`          | `varchar(100)`        | Yes      | `NULL`         | Office country                     |
| `experience_years` | `int(10) unsigned`    | No       | `0`            | Experience duration in years       |
| `students_placed`  | `int(10) unsigned`    | No       | `0`            | Total student recruitments         |
| `specializations`  | `longtext` / `json`   | Yes      | `NULL`         | JSON array of specialization tags  |
| `is_active`        | `tinyint(1)`          | No       | `1`            | Active / Inactive status flag      |
| `created_at`       | `timestamp`           | Yes      | `NULL`         | Record creation timestamp          |
| `updated_at`       | `timestamp`           | Yes      | `NULL`         | Last update timestamp              |

---

### React Implementation Details

- **SPA Page File:** `admin-app/src/pages/OurPartners.tsx`
- **Route URL:** `/our-partners`
- **Sidebar Position:** `CONTENT & MEDIA -> Partners`
- **Features Implemented:**
  - Responsive DataTable with search filter & pagination.
  - Active / Inactive badge toggling.
  - Add / Edit Partner modal with full profile fields.
  - SweetAlert2 delete confirmation dialogs.
  - Graceful fallback for offline / standalone dev environments.
