# FAQs Module Documentation

**Laravel Admin Navbar Menu:** `Faqs`  
**React Migration Status:** **`Done`**

## FAQ Categories
**Laravel Route:** `/admin/faq-categories`  
**Blade View:** `faq-categories.blade.php`  
**Controller:** `FaqCategoryC.php`  
**Laravel Model:** `App\Models\FaqCategory`  

### Form & Input Fields
| Field Name | Type / Source |
|---|---|
| `category_name` | Controller Input / Validation |
| `success` | Controller Input / Validation |

### Database Table (`faq_categories`)
*Columns managed via core table or dynamic attributes.* 

---

## FAQs
**Laravel Route:** `/admin/faqs`  
**Blade View:** `faqs.blade.php`  
**Controller:** `FaqC.php`  
**Laravel Model:** `App\Models\Faq`  

### Form & Input Fields
| Field Name | Type / Source |
|---|---|
| `category_id` | Controller Input / Validation |
| `question` | Controller Input / Validation |
| `answer` | Controller Input / Validation |
| `success` | Controller Input / Validation |

### Database Table (`faqs`)
| Column Name | Details / DataType |
|---|---|
| `question` | Migration type: `text` |
| `answer` | Migration type: `longText` |
| `blog_id` | Migration type: `unsignedBigInteger` |
| `internship_id` | Migration type: `foreignId` |

---

