# SEOS Module Documentation

**Laravel Admin Navbar Menu:** `SEOS`  
**React Migration Status:** **`Done`**

## Static Page SEO
**Laravel Route:** `/admin/static-page-seos`  
**Blade View:** `static-page-seos.blade.php`  
**Controller:** `StaticPageSeoC.php`  
**Laravel Model:** `App\Models\StaticPageSeo`  

### Form & Input Fields
| Field Name | Type / Source |
|---|---|
| `meta_title` | Blade Input (`text`) |
| `meta_keyword` | Blade Input (`text`) |
| `meta_description` | Blade Input (`textarea`) |
| `seo_rating` | Blade Input (`number`) |
| `best_rating` | Blade Input (`number`) |
| `review_number` | Blade Input (`number`) |
| `og_image` | Blade Input (`file`) |

### Database Table (`static_page_seos`)
*Columns managed via core table or dynamic attributes.* 

---

## Dynamic Page SEO
**Laravel Route:** `/admin/dynamic-page-seos`  
**Blade View:** `dynamic-page-seos.blade.php`  
**Controller:** `DynamicPageSeoC.php`  
**Laravel Model:** `App\Models\DynamicPageSeo`  

### Form & Input Fields
| Field Name | Type / Source |
|---|---|
| `meta_title` | Blade Input (`text`) |
| `meta_keyword` | Blade Input (`text`) |
| `meta_description` | Blade Input (`textarea`) |
| `page_content` | Blade Input (`text`) |
| `seo_rating` | Blade Input (`number`) |
| `best_rating` | Blade Input (`number`) |
| `review_number` | Blade Input (`number`) |
| `og_image` | Blade Input (`file`) |

### Database Table (`dynamic_page_seos`)
*Columns managed via core table or dynamic attributes.* 

---

## Default OG Image
**Laravel Route:** `/admin/default-og-image`  
**Blade View:** `default-og-image.blade.php`  
**Controller:** `DefaultOgImageC.php`  
**Laravel Model:** `App\Models\DefaultOgImage`  

### Form & Input Fields
| Field Name | Type / Source |
|---|---|
| `page` | Controller Input / Validation |
| `file` | Controller Input / Validation |

### Database Table (`default_og_images`)
*Columns managed via core table or dynamic attributes.* 

---

