# Student Data Module Documentation

**Laravel Admin Navbar Menu:** `Student Data`  
**React Migration Status:** **`Done`**

## Malaysia Application Categories
**Laravel Route:** `/admin/malaysia-application-categories`  
**Blade View:** `malaysia-application-categories.blade.php`  
**Controller:** `MalaysiaApplicationCategoryC.php`  
**Laravel Model:** `App\Models\MalaysiaApplicationCategory`  

### Form & Input Fields
| Field Name | Type / Source |
|---|---|
| `category_name` | Controller Input / Validation |
| `color_class` | Controller Input / Validation |
| `success` | Controller Input / Validation |

### Database Table (`malaysia_application_categories`)
| Column Name | Details / DataType |
|---|---|
| `category_name` | Migration type: `string` |
| `category_slug` | Migration type: `string` |
| `color_class` | Migration type: `string` |

---

## Malaysia Applications (Course)
**Laravel Route:** `/admin/malaysia-applications`  
**Blade View:** `malaysia-applications.blade.php`  
**Controller:** `MalaysiaApplicationC.php`  
**Laravel Model:** `App\Models\MalaysiaApplication`  

### Form & Input Fields
| Field Name | Type / Source |
|---|---|
| `search` | Blade Input (`text`) |
| `category` | Blade Input (`select`) |
| `year` | Blade Input (`select`) |
| `limit_per_page` | Blade Input (`select`) |
| `order_by` | Blade Input (`select`) |
| `order_in` | Blade Input (`select`) |
| `file` | Blade Input (`file`) |
| `has` | Controller Input / Validation |
| `total_applications` | Controller Input / Validation |
| `accepted_students` | Controller Input / Validation |
| `university_id` | Controller Input / Validation |
| `trend` | Controller Input / Validation |
| `yoy_change` | Controller Input / Validation |
| `Year` | Controller Input / Validation |
| `Date` | Controller Input / Validation |
| `success` | Controller Input / Validation |

### Database Table (`malaysia_applications`)
| Column Name | Details / DataType |
|---|---|
| `year` | Migration type: `unsignedSmallInteger` |
| `category_id` | Migration type: `unsignedBigInteger` |
| `count` | Migration type: `unsignedInteger` |

---

## International Student Data Countries
**Laravel Route:** `/admin/international-student-data-countries`  
**Blade View:** `international-student-data-countries.blade.php`  
**Controller:** `InternationalStudentDataCountryC.php`  
**Laravel Model:** `App\Models\InternationalStudentDataCountry`  

### Form & Input Fields
| Field Name | Type / Source |
|---|---|
| `country_name` | Controller Input / Validation |
| `color_class` | Controller Input / Validation |
| `success` | Controller Input / Validation |

### Database Table (`international_student_data_countries`)
| Column Name | Details / DataType |
|---|---|
| `country_name` | Migration type: `string` |
| `country_slug` | Migration type: `string` |
| `color_class` | Migration type: `string` |

---

## International Student Applications (Country)
**Laravel Route:** `/admin/international-student-data`  
**Blade View:** `international-student-datas.blade.php`  
**Controller:** `InternationalStudentDataC.php`  
**Laravel Model:** `App\Models\InternationalStudentData`  

### Form & Input Fields
| Field Name | Type / Source |
|---|---|
| `search` | Blade Input (`text`) |
| `country` | Blade Input (`select`) |
| `year` | Blade Input (`select`) |
| `limit_per_page` | Blade Input (`select`) |
| `order_by` | Blade Input (`select`) |
| `order_in` | Blade Input (`select`) |
| `file` | Blade Input (`file`) |
| `has` | Controller Input / Validation |
| `total_applications` | Controller Input / Validation |
| `accepted_students` | Controller Input / Validation |
| `country_id` | Controller Input / Validation |
| `trend` | Controller Input / Validation |
| `yoy_change` | Controller Input / Validation |
| `Year` | Controller Input / Validation |
| `Date` | Controller Input / Validation |
| `success` | Controller Input / Validation |

### Database Table (`international_student_data`)
| Column Name | Details / DataType |
|---|---|
| `country_name` | Migration type: `string` |
| `country_slug` | Migration type: `string` |
| `color_class` | Migration type: `string` |
| `year` | Migration type: `unsignedSmallInteger` |
| `country_id` | Migration type: `unsignedBigInteger` |
| `count` | Migration type: `unsignedInteger` |

---

