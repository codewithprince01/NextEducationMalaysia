# More 1 Module Documentation

**Laravel Admin Navbar Menu:** `More 1`  
**React Migration Status:** **`Partially Done`**

## Home Page Contents
**Laravel Route:** `/admin/page-contents`  
**Blade View:** `page-contents.blade.php`  
**Controller:** `PageContentC.php`  
**Laravel Model:** `App\Models\PageContent`  

### Form & Input Fields
| Field Name | Type / Source |
|---|---|
| `page_name` | Controller Input / Validation |
| `author_id` | Controller Input / Validation |
| `heading` | Controller Input / Validation |
| `description` | Controller Input / Validation |
| `success` | Controller Input / Validation |

### Database Table (`page_contents`)
*Columns managed via core table or dynamic attributes.* 

---

## University Page Contents
**Laravel Route:** `/admin/static-page-contents`  
**Blade View:** `static-page-contents.blade.php`  
**Controller:** `StaticPageContentC.php`  
**Laravel Model:** `App\Models\StaticPageContent`  

### Form & Input Fields
| Field Name | Type / Source |
|---|---|
| `page_name` | Controller Input / Validation |
| `author_id` | Controller Input / Validation |
| `heading` | Controller Input / Validation |
| `description` | Controller Input / Validation |
| `success` | Controller Input / Validation |

### Database Table (`static_page_contents`)
*Columns managed via core table or dynamic attributes.* 

---

## Services
**Laravel Route:** `/admin/services`  
**Blade View:** `services.blade.php`  
**Controller:** `ServiceC.php`  
**Laravel Model:** `App\Models\Service`  

### Form & Input Fields
| Field Name | Type / Source |
|---|---|
| `page_name` | Controller Input / Validation |
| `thumbnail` | Controller Input / Validation |
| `headline` | Controller Input / Validation |

### Database Table (`services`)
*Columns managed via core table or dynamic attributes.* 

---

### Service Content
**Blade View:** `service-content.blade.php`  
**Controller:** `ServiceContentC.php`  
**Laravel Model:** `App\Models\ServiceContent`  

### Form & Input Fields
| Field Name | Type / Source |
|---|---|
| `tab_title` | Controller Input / Validation |
| `tab_content` | Controller Input / Validation |

### Database Table (`service_contents`)
*Columns managed via core table or dynamic attributes.* 

---

## Exams
**Laravel Route:** `/admin/exams`  
**Blade View:** `exams.blade.php`  
**Controller:** `ExamC.php`  
**Laravel Model:** `App\Models\Exam`  

### Form & Input Fields
| Field Name | Type / Source |
|---|---|
| `page_name` | Controller Input / Validation |
| `thumbnail` | Controller Input / Validation |

### Database Table (`exams`)
| Column Name | Details / DataType |
|---|---|
| `seo_rating` | Migration type: `decimal` |
| `best_rating` | Migration type: `decimal` |
| `review_number` | Migration type: `integer` |
| `og_image` | Migration type: `string` |

---

### Exam Page Tabs
**Blade View:** `exam-page-tabs.blade.php`  
**Controller:** `ExamPageTabC.php`  
**Laravel Model:** `App\Models\ExamPageTab`  

### Form & Input Fields
| Field Name | Type / Source |
|---|---|
| `exam_id` | Blade Input (`hidden`) |
| `has` | Controller Input / Validation |
| `tab_name` | Controller Input / Validation |
| `tab_slug` | Controller Input / Validation |
| `heading` | Controller Input / Validation |
| `description` | Controller Input / Validation |
| `thumbnail` | Controller Input / Validation |
| `success` | Controller Input / Validation |
| `failed` | Controller Input / Validation |

### Database Table (`exam_page_tabs`)
*Columns managed via core table or dynamic attributes.* 

---

### Exam Page Tab Contents
**Blade View:** `exam-page-tab-contents.blade.php`  
**Controller:** `ExamPageTabContentC.php`  
**Laravel Model:** `App\Models\ExamTabContent`  

### Form & Input Fields
| Field Name | Type / Source |
|---|---|
| `tab_id` | Blade Input (`hidden`) |
| `has` | Controller Input / Validation |
| `heading` | Controller Input / Validation |
| `success` | Controller Input / Validation |

### Database Table (`exam_page_tab_contents`)
*Columns managed via core table or dynamic attributes.* 

---

### Exam Tab FAQs
**Blade View:** `exam-tab-faqs.blade.php`  
**Controller:** `ExamTabFaqC.php`  
**Laravel Model:** `App\Models\ExamTabFaq`  

### Form & Input Fields
| Field Name | Type / Source |
|---|---|
| `tab_id` | Blade Input (`hidden`) |
| `has` | Controller Input / Validation |
| `question` | Controller Input / Validation |
| `answer` | Controller Input / Validation |
| `success` | Controller Input / Validation |

### Database Table (`exam_tab_faqs`)
*Columns managed via core table or dynamic attributes.* 

---

### Exam FAQs
**Blade View:** `exam-faqs.blade.php`  
**Controller:** `ExamFaqC.php`  
**Laravel Model:** `App\Models\ExamFaq`  

### Form & Input Fields
| Field Name | Type / Source |
|---|---|
| `exam_id` | Blade Input (`hidden`) |
| `has` | Controller Input / Validation |
| `question` | Controller Input / Validation |
| `answer` | Controller Input / Validation |
| `success` | Controller Input / Validation |

### Database Table (`exam_faqs`)
*Columns managed via core table or dynamic attributes.* 

---

### Exam Content
**Blade View:** `exam-content.blade.php`  
**Controller:** `ExamContentC.php`  
**Laravel Model:** `App\Models\ExamContent`  

### Form & Input Fields
| Field Name | Type / Source |
|---|---|
| `title` | Controller Input / Validation |
| `description` | Controller Input / Validation |

### Database Table (`exam_contents`)
*Columns managed via core table or dynamic attributes.* 

---

## Authors & Users
**Laravel Route:** `/admin/users`  
**Blade View:** `users.blade.php`  
**Controller:** `UserC.php`  
**Laravel Model:** `App\Models\User`  

### Form & Input Fields
| Field Name | Type / Source |
|---|---|
| `limit_per_page` | Blade Input (`select`) |
| `order_by` | Blade Input (`select`) |
| `order_in` | Blade Input (`select`) |
| `search` | Blade Input (`text`) |
| `role_filter` | Blade Input (`select`) |
| `input` | Controller Input / Validation |
| `message` | Controller Input / Validation |
| `permissions` | Controller Input / Validation |
| `name` | Controller Input / Validation |
| `email` | Controller Input / Validation |
| `mobile` | Controller Input / Validation |
| `success` | Controller Input / Validation |
| `Admin` | Controller Input / Validation |
| `Author` | Controller Input / Validation |

### Database Table (`users`)
| Column Name | Details / DataType |
|---|---|
| `name` | Model Fillable Column |
| `email` | Model Fillable Column |
| `password` | Model Fillable Column |
| `permissions` | Migration type: `json` |

---

## Testimonials
**Laravel Route:** `/admin/testimonials`  
**Blade View:** `testimonials.blade.php`  
**Controller:** `TestimonialC.php`  
**Laravel Model:** `App\Models\Testimonial`  

### Form & Input Fields
| Field Name | Type / Source |
|---|---|
| `name` | Controller Input / Validation |
| `country` | Controller Input / Validation |
| `review` | Controller Input / Validation |
| `page` | Controller Input / Validation |
| `success` | Controller Input / Validation |

### Database Table (`testimonials`)
| Column Name | Details / DataType |
|---|---|
| `name` | Model Fillable Column |
| `email` | Model Fillable Column |
| `user_type` | Model Fillable Column |
| `country` | Model Fillable Column |
| `review` | Model Fillable Column |

---

