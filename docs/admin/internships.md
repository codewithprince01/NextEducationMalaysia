# Internships Module Documentation

**Laravel Admin Navbar Menu:** `Internships`  
**React Migration Status:** **`Pending`**

## Internships
**Laravel Route:** `/admin/internships`  
**Blade View:** `internships.blade.php`  
**Controller:** `InternshipC.php`  
**Laravel Model:** `App\Models\Internship`  

### Form & Input Fields
| Field Name | Type / Source |
|---|---|
| `title` | Controller Input / Validation |
| `slug` | Controller Input / Validation |
| `thumbnail` | Controller Input / Validation |
| `og_image` | Controller Input / Validation |
| `success` | Controller Input / Validation |

### Database Table (`internships`)
| Column Name | Details / DataType |
|---|---|
| `title` | Migration type: `string` |
| `slug` | Migration type: `string` |
| `active_status` | Migration type: `string` |
| `thumbnail_name` | Migration type: `string` |
| `thumbnail_path` | Migration type: `string` |
| `shortnote` | Migration type: `text` |
| `website` | Migration type: `string` |
| `meta_title` | Migration type: `text` |
| `meta_keyword` | Migration type: `text` |
| `meta_description` | Migration type: `text` |
| `seo_rating` | Migration type: `decimal` |
| `best_rating` | Migration type: `decimal` |
| `review_number` | Migration type: `integer` |
| `og_image_name` | Migration type: `string` |
| `og_image_path` | Migration type: `string` |

---

### Internship Contents
**Blade View:** `internship-contents.blade.php`  
**Controller:** `InternshipContentC.php`  
**Laravel Model:** `App\Models\InternshipContent`  

### Form & Input Fields
| Field Name | Type / Source |
|---|---|
| `internship_id` | Blade Input (`hidden`) |
| `tab` | Controller Input / Validation |
| `description` | Controller Input / Validation |
| `success` | Controller Input / Validation |

### Database Table (`internship_contents`)
| Column Name | Details / DataType |
|---|---|
| `tab` | Migration type: `string` |
| `description` | Migration type: `longText` |
| `position` | Migration type: `integer` |
| `internship_id` | Migration type: `foreignId` |

---

### Internship FAQs
**Blade View:** `internship-faqs.blade.php`  
**Controller:** `InternshipFaqC.php`  
**Laravel Model:** `App\Models\InternshipFaq`  

### Form & Input Fields
| Field Name | Type / Source |
|---|---|
| `internship_id` | Blade Input (`hidden`) |
| `question` | Controller Input / Validation |
| `answer` | Controller Input / Validation |
| `success` | Controller Input / Validation |

### Database Table (`internship_faqs`)
| Column Name | Details / DataType |
|---|---|
| `question` | Migration type: `text` |
| `answer` | Migration type: `longText` |
| `internship_id` | Migration type: `foreignId` |

---

