# Student Data & Applications Module Documentation

**Laravel Admin Navbar Menu:** `Student Data`  
**React Migration Status:** **`Done`**  
**React Routes:**
- `/malaysia-applications` -> Component: [`MalaysiaApplications.tsx`](file:///c:/projects/NextEducationMalaysia/admin-app/src/pages/MalaysiaApplications.tsx)
- `/international-student-data` -> Component: [`InternationalStudentData.tsx`](file:///c:/projects/NextEducationMalaysia/admin-app/src/pages/InternationalStudentData.tsx)

---

## Malaysia Application Categories
**Laravel Route:** `/admin/malaysia-application-categories`  
**Blade View:** `malaysia-application-categories.blade.php`  
**Controller:** `MalaysiaApplicationCategoryC.php`  
**Laravel Model:** `App\Models\MalaysiaApplicationCategory`  

### Form & Input Fields
| Field Name | Type / Source | Validation Rules | Description |
|---|---|---|---|
| `category_name` | Blade Input (`text`) | `required\|string\|max:255` | Name of course application category |
| `color_class` | Blade Input (`text`) | `nullable\|string\|max:50` | UI badge styling class |

### Database Table (`malaysia_application_categories`)
| Column Name | Details / DataType | Description |
|---|---|---|
| `id` | `bigint(20) unsigned` | Primary Key |
| `category_name` | `varchar(255)` | Application category name |
| `category_slug` | `varchar(255)` | URL slug |
| `color_class` | `varchar(50)` | UI badge color |

---

## Malaysia Applications (Course Statistics)
**Laravel Route:** `/admin/malaysia-applications`  
**Blade View:** `malaysia-applications.blade.php`  
**Controller:** `MalaysiaApplicationC.php`  
**Laravel Model:** `App\Models\MalaysiaApplication`  

### Form & Input Fields
| Field Name | Type / Source | Validation Rules | Description |
|---|---|---|---|
| `year` | Blade Input (`number`/`select`) | `required\|integer` | Academic application year (e.g. 2024, 2025) |
| `category_id` | Blade Input (`select`) | `required\|exists:malaysia_application_categories,id` | Foreign Key to application category |
| `count` | Blade Input (`number`) | `required\|integer\|min:0` | Total applications count recorded |

### Database Table (`malaysia_applications`)
| Column Name | Details / DataType | Description |
|---|---|---|
| `id` | `bigint(20) unsigned` | Primary Key |
| `year` | `smallint(5) unsigned` | Academic year |
| `category_id` | `bigint(20) unsigned` | Category FK |
| `count` | `int(10) unsigned` | Total applications count |

---

## International Student Data Countries
**Laravel Route:** `/admin/international-student-data-countries`  
**Blade View:** `international-student-data-countries.blade.php`  
**Controller:** `InternationalStudentDataCountryC.php`  
**Laravel Model:** `App\Models\InternationalStudentDataCountry`  

### Form & Input Fields
| Field Name | Type / Source | Validation Rules | Description |
|---|---|---|---|
| `country_name` | Blade Input (`text`) | `required\|string\|max:255` | Name of origin country |
| `color_class` | Blade Input (`text`) | `nullable\|string\|max:50` | UI badge styling class |

### Database Table (`international_student_data_countries`)
| Column Name | Details / DataType | Description |
|---|---|---|
| `id` | `bigint(20) unsigned` | Primary Key |
| `country_name` | `varchar(255)` | Country name |
| `country_slug` | `varchar(255)` | Country URL slug |
| `color_class` | `varchar(50)` | UI badge color |

---

## International Student Applications (Country Statistics)
**Laravel Route:** `/admin/international-student-data`  
**Blade View:** `international-student-datas.blade.php`  
**Controller:** `InternationalStudentDataC.php`  
**Laravel Model:** `App\Models\InternationalStudentData`  

### Form & Input Fields
| Field Name | Type / Source | Validation Rules | Description |
|---|---|---|---|
| `year` | Blade Input (`number`/`select`) | `required\|integer` | Application year |
| `country_id` | Blade Input (`select`) | `required\|exists:international_student_data_countries,id` | Foreign Key to origin country |
| `count` | Blade Input (`number`) | `required\|integer\|min:0` | Total international application count |

### Database Table (`international_student_data`)
| Column Name | Details / DataType | Description |
|---|---|---|
| `id` | `bigint(20) unsigned` | Primary Key |
| `year` | `smallint(5) unsigned` | Academic year |
| `country_id` | `bigint(20) unsigned` | Country FK |
| `count` | `int(10) unsigned` | Total application count |

---

### React Implementation Details
- **SPA Pages:** `admin-app/src/pages/MalaysiaApplications.tsx` and `admin-app/src/pages/InternationalStudentData.tsx`
- **Sidebar Group:** `STUDENT DATA & APPLICATIONS`
- **Features Implemented:**
  - Annual stats breakdown tables.
  - Interactive Search & Filter by Year or Category/Country.
  - Category dropdown selectors populated dynamically.
  - Form validation and SweetAlert2 delete dialogs.
  - Graceful silent network fallback for standalone mode.
