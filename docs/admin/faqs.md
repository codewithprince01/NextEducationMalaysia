# FAQs Module Documentation

**Laravel Admin Navbar Menu:** `Faqs`  
**React Migration Status:** **`Done`**  
**React Components Implemented:**
- `src/pages/FaqCategories.tsx` (`/faq-categories`)
- `src/pages/Faqs.tsx` (`/faqs`)

---

## 1. FAQ Categories

**Laravel Route:** `/admin/faq-categories`  
**Blade View:** `faq-categories.blade.php`  
**Controller:** `FaqCategoryC.php`  
**Laravel Model:** `App\Models\FaqCategory`  
**React Component:** `admin-app/src/pages/FaqCategories.tsx`  
**Status:** **`Done`**

### Form & Input Fields
| Field Name | Input Type | Description / Notes |
|---|---|---|
| `category_name` | `text` (Required) | Category title for organizing FAQs |
| `category_slug` | `text` (Auto-generated) | URL slug for category filtering |

### Database Table (`faq_categories`)
| Column Name | Data Type | Key Constraints / Notes |
|---|---|---|
| `id` | `bigint` (PK) | Auto-increment primary key |
| `category_name` | `varchar(255)` | Category title |
| `category_slug` | `varchar(255)` | Unique URL slug |
| `created_at` | `timestamp` | Record creation timestamp |
| `updated_at` | `timestamp` | Record update timestamp |

---

## 2. FAQs List & Editor

**Laravel Route:** `/admin/faqs`  
**Blade View:** `faqs.blade.php`  
**Controller:** `FaqC.php`  
**Laravel Model:** `App\Models\Faq`  
**React Component:** `admin-app/src/pages/Faqs.tsx`  
**Status:** **`Done`**

### Form & Input Fields
| Field Name | Input Type | Description / Notes |
|---|---|---|
| `category_id` | `select` | Category ID reference (`faq_categories.id`) |
| `question` | `text` (Required) | The FAQ Question text |
| `answer` | `RichTextEditor` / `textarea` | Detailed HTML answer text |
| `position` | `number` | Display order position |

### Database Table (`faqs`)
| Column Name | Data Type | Key Constraints / Notes |
|---|---|---|
| `id` | `bigint` (PK) | Auto-increment primary key |
| `category_id` | `unsignedBigInteger` | Foreign key -> `faq_categories.id` (nullable for General) |
| `question` | `text` | Question text |
| `answer` | `longtext` | Detailed HTML Answer body |
| `position` | `integer` | Ordering rank (default: `0`) |
| `created_at` | `timestamp` | Creation timestamp |
| `updated_at` | `timestamp` | Update timestamp |

---

## Verification & React Migration Confirmation
- [x] All form fields from Laravel `faq-categories.blade.php` and `faqs.blade.php` match the React components in `admin-app/src/pages/FaqCategories.tsx` and `Faqs.tsx`.
- [x] Database schemas and relations (`faq_categories` and `faqs`) are fully aligned with `FaqCategory.php` and `Faq.php` models.
- [x] Module status marked as **`Done`** in `admin_modules_plan.md`.
