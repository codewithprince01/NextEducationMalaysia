# Programs Module Documentation

**Laravel Admin Navbar Menu:** `Programs`  
**React Migration Status:** **`Done`**

## Levels
**Laravel Route:** `/admin/Levels`  
**Blade View:** `level.blade.php`  
**Controller:** `LevelC.php`  
**Laravel Model:** `App\Models\Level`  

### Form & Input Fields
| Field Name | Type / Source |
|---|---|
| `level` | Controller Input / Validation |
| `file` | Controller Input / Validation |

### Database Table (`levels`)
| Column Name | Details / DataType |
|---|---|
| `short_name_slug` | Migration type: `string` |
| `seo_name_slug` | Migration type: `string` |
| `level` | Migration type: `string` |
| `level_slug` | Migration type: `string` |
| `duration` | Migration type: `string` |
| `tuition_fees` | Migration type: `string` |
| `intake` | Migration type: `string` |
| `accreditation` | Migration type: `string` |
| `specialization_id` | Migration type: `unsignedBigInteger` |
| `courses_description` | Migration type: `string` |
| `meta_title` | Migration type: `string` |
| `meta_description` | Migration type: `string` |
| `meta_keyword` | Migration type: `string` |
| `og_image_path` | Migration type: `string` |
| `seo_rating` | Migration type: `decimal` |
| `best_rating` | Migration type: `decimal` |
| `review_number` | Migration type: `integer` |

---

## Course Category
**Laravel Route:** `/admin/Course-Category`  
**Blade View:** `course-category.blade.php`  
**Controller:** `CourseCategoryC.php`  
**Laravel Model:** `App\Models\CourseCategory`  

### Form & Input Fields
| Field Name | Type / Source |
|---|---|
| `file` | Blade Input (`file`) |
| `author_id` | Controller Input / Validation |
| `shortnote` | Controller Input / Validation |
| `icon_class` | Controller Input / Validation |
| `courses_description` | Controller Input / Validation |
| `thumbnail` | Controller Input / Validation |
| `banner` | Controller Input / Validation |
| `content_image` | Controller Input / Validation |
| `og_image` | Controller Input / Validation |

### Database Table (`course_categories`)
| Column Name | Details / DataType |
|---|---|
| `thumbnail_path` | Migration type: `text` |
| `banner_path` | Migration type: `text` |
| `og_image_path` | Migration type: `text` |
| `review_number` | Migration type: `integer` |
| `best_rating` | Migration type: `decimal` |
| `schema` | Migration type: `longText` |
| `icon_class` | Migration type: `string` |
| `courses_description` | Migration type: `text` |

---

### Course Category Contents
**Blade View:** `course-category-contents.blade.php`  
**Controller:** `CourseCategoryContentC.php`  
**Laravel Model:** `App\Models\CourseCategoryContent`  

### Form & Input Fields
| Field Name | Type / Source |
|---|---|
| `course_category_id` | Blade Input (`hidden`) |
| `tab` | Controller Input / Validation |
| `position` | Controller Input / Validation |
| `description` | Controller Input / Validation |
| `success` | Controller Input / Validation |

### Database Table (`course_category_contents`)
*Columns managed via core table or dynamic attributes.* 

---

### Course Category FAQs
**Blade View:** `course-category-faqs.blade.php`  
**Controller:** `CourseCategoryFaqC.php`  
**Laravel Model:** `App\Models\CourseCategoryFaq`  

### Form & Input Fields
| Field Name | Type / Source |
|---|---|
| `course_category_id` | Blade Input (`hidden`) |
| `question` | Controller Input / Validation |
| `answer` | Controller Input / Validation |
| `success` | Controller Input / Validation |

### Database Table (`course_category_faqs`)
*Columns managed via core table or dynamic attributes.* 

---

## Course Specializations
**Laravel Route:** `/admin/Course-Specializations`  
**Blade View:** `course-specialization.blade.php`  
**Controller:** `CourseSpecializationC.php`  
**Laravel Model:** `App\Models\CourseSpecialization`  

### Form & Input Fields
| Field Name | Type / Source |
|---|---|
| `keyword` | Blade Input (`text`) |
| `file` | Blade Input (`file`) |
| `has` | Controller Input / Validation |
| `author_id` | Controller Input / Validation |
| `shortnote` | Controller Input / Validation |
| `icon_class` | Controller Input / Validation |
| `courses_description` | Controller Input / Validation |
| `course_category_id` | Controller Input / Validation |
| `thumbnail` | Controller Input / Validation |
| `banner` | Controller Input / Validation |
| `content_image` | Controller Input / Validation |
| `og_image` | Controller Input / Validation |

### Database Table (`course_specializations`)
| Column Name | Details / DataType |
|---|---|
| `courses_description` | Migration type: `text` |

---

### Course Specialization Contents
**Blade View:** `course-specialization-contents.blade.php`  
**Controller:** `CourseSpecializationContentC.php`  
**Laravel Model:** `App\Models\SpecializationContent`  

### Form & Input Fields
| Field Name | Type / Source |
|---|---|
| `specialization_id` | Blade Input (`hidden`) |
| `tab` | Controller Input / Validation |
| `position` | Controller Input / Validation |
| `description` | Controller Input / Validation |
| `success` | Controller Input / Validation |

### Database Table (`course_specialization_contents`)
*Columns managed via core table or dynamic attributes.* 

---

### Course Specialization FAQs
**Blade View:** `course-specialization-faqs.blade.php`  
**Controller:** `CourseSpecializationFaqC.php`  
**Laravel Model:** `App\Models\CourseSpecializationFaq`  

### Form & Input Fields
| Field Name | Type / Source |
|---|---|
| `specialization_id` | Blade Input (`hidden`) |
| `question` | Controller Input / Validation |
| `answer` | Controller Input / Validation |
| `success` | Controller Input / Validation |

### Database Table (`course_specialization_faqs`)
*Columns managed via core table or dynamic attributes.* 

---

## Specialization Levels
**Laravel Route:** `/admin/course-specialization-levels`  
**Blade View:** `specialization-levels.blade.php`  
**Controller:** `SpecializationLevelC.php`  
**Laravel Model:** `App\Models\SpecializationLevel`  

### Form & Input Fields
| Field Name | Type / Source |
|---|---|
| `specialization_id` | Blade Input (`hidden`) |
| `level` | Controller Input / Validation |
| `success` | Controller Input / Validation |

### Database Table (`specialization_levels`)
| Column Name | Details / DataType |
|---|---|
| `level` | Migration type: `string` |
| `level_slug` | Migration type: `string` |
| `duration` | Migration type: `string` |
| `tuition_fees` | Migration type: `string` |
| `intake` | Migration type: `string` |
| `accreditation` | Migration type: `string` |
| `specialization_id` | Migration type: `unsignedBigInteger` |
| `meta_title` | Migration type: `string` |
| `meta_description` | Migration type: `string` |
| `meta_keyword` | Migration type: `string` |
| `og_image_path` | Migration type: `string` |
| `seo_rating` | Migration type: `decimal` |
| `best_rating` | Migration type: `decimal` |
| `review_number` | Migration type: `integer` |

---

### Specialization Level Contents
**Blade View:** `specialization-level-contents.blade.php`  
**Controller:** `SpecializationLevelContentC.php`  
**Laravel Model:** `App\Models\SpecializationLevelContent`  

### Form & Input Fields
| Field Name | Type / Source |
|---|---|
| `specialization_level_id` | Blade Input (`hidden`) |
| `title` | Controller Input / Validation |
| `success` | Controller Input / Validation |

### Database Table (`specialization_level_contents`)
| Column Name | Details / DataType |
|---|---|
| `title` | Migration type: `string` |
| `slug` | Migration type: `string` |
| `description` | Migration type: `longText` |
| `position` | Migration type: `integer` |
| `specialization_level_id` | Migration type: `unsignedBigInteger` |

---

