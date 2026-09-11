# Blog Module Documentation

**Laravel Admin Navbar Menu:** `Blog`  
**React Migration Status:** **`Done`**

## Blog Categories
**Laravel Route:** `/admin/blog-category`  
**Blade View:** `blog-category.blade.php`  
**Controller:** `BlogCategoryC.php`  
**Laravel Model:** `App\Models\BlogCategory`  

### Form & Input Fields
| Field Name | Type / Source |
|---|---|
| `merge` | Controller Input / Validation |
| `category_name` | Controller Input / Validation |
| `category_slug` | Controller Input / Validation |

### Database Table (`blog_categories`)
| Column Name | Details / DataType |
|---|---|
| `og_image_path` | Migration type: `text` |
| `seo_rating` | Migration type: `decimal` |
| `review_number` | Migration type: `integer` |
| `best_rating` | Migration type: `decimal` |
| `schema` | Migration type: `longText` |

---

## Blogs
**Laravel Route:** `/admin/blogs`  
**Blade View:** `blogs.blade.php`  
**Controller:** `BlogC.php`  
**Laravel Model:** `App\Models\Blog`  

### Form & Input Fields
| Field Name | Type / Source |
|---|---|
| `merge` | Controller Input / Validation |
| `val` | Controller Input / Validation |
| `category_id` | Controller Input / Validation |
| `headline` | Controller Input / Validation |
| `slug` | Controller Input / Validation |
| `message` | Controller Input / Validation |

### Database Table (`blogs`)
| Column Name | Details / DataType |
|---|---|
| `og_image_path` | Migration type: `text` |
| `seo_rating` | Migration type: `decimal` |
| `review_number` | Migration type: `integer` |
| `best_rating` | Migration type: `decimal` |
| `schema` | Migration type: `longText` |
| `created_by` | Migration type: `unsignedBigInteger` |
| `updated_by` | Migration type: `unsignedBigInteger` |
| `approved_by` | Migration type: `unsignedBigInteger` |

---

### Blog Form (Add/Edit)
**Blade View:** `blogs-form.blade.php`  
**Controller:** `BlogC.php`  
**Laravel Model:** `App\Models\Blog`  

### Form & Input Fields
| Field Name | Type / Source |
|---|---|
| `merge` | Controller Input / Validation |
| `val` | Controller Input / Validation |
| `category_id` | Controller Input / Validation |
| `headline` | Controller Input / Validation |
| `slug` | Controller Input / Validation |
| `message` | Controller Input / Validation |

### Database Table (`blogs`)
| Column Name | Details / DataType |
|---|---|
| `og_image_path` | Migration type: `text` |
| `seo_rating` | Migration type: `decimal` |
| `review_number` | Migration type: `integer` |
| `best_rating` | Migration type: `decimal` |
| `schema` | Migration type: `longText` |
| `created_by` | Migration type: `unsignedBigInteger` |
| `updated_by` | Migration type: `unsignedBigInteger` |
| `approved_by` | Migration type: `unsignedBigInteger` |

---

### Blog Contents
**Blade View:** `blog-content.blade.php`  
**Controller:** `BlogContentC.php`  
**Laravel Model:** `App\Models\BlogContent`  

### Form & Input Fields
| Field Name | Type / Source |
|---|---|
| `blog_id` | Blade Input (`hidden`) |
| `title` | Controller Input / Validation |
| `description` | Controller Input / Validation |
| `success` | Controller Input / Validation |

### Database Table (`blog_contents`)
*Columns managed via core table or dynamic attributes.* 

---

### Blog FAQs
**Blade View:** `blog-faqs.blade.php`  
**Controller:** `BlogFaqC.php`  
**Laravel Model:** `App\Models\BlogFaq`  

### Form & Input Fields
| Field Name | Type / Source |
|---|---|
| `blog_id` | Blade Input (`hidden`) |
| `question` | Controller Input / Validation |
| `answer` | Controller Input / Validation |
| `success` | Controller Input / Validation |

### Database Table (`blog_faqs`)
| Column Name | Details / DataType |
|---|---|
| `question` | Migration type: `text` |
| `answer` | Migration type: `longText` |
| `blog_id` | Migration type: `unsignedBigInteger` |

---

