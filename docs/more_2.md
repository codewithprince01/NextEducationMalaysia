# More 2 Module Documentation

**Laravel Admin Navbar Menu:** `More 2`  
**React Migration Status:** **`Pending`**

## Upload Files
**Laravel Route:** `/admin/upload-files`  
**Blade View:** `upload-files.blade.php`  
**Controller:** `UploadFilesC.php`  
**Laravel Model:** `App\Models\UploadFiles`  

### Form & Input Fields
| Field Name | Type / Source |
|---|---|
| `title` | Blade Input (`text`) |
| `file` | Blade Input (`file`) |
| `success` | Controller Input / Validation |

### Database Table (`upload_files`)
*Columns managed via core table or dynamic attributes.* 

---

## URL Redirections
**Laravel Route:** `/admin/url-redirections`  
**Blade View:** `url-redirections.blade.php`  
**Controller:** `UrlRedirectionC.php`  
**Laravel Model:** `App\Models\UrlRedirection`  

### Form & Input Fields
| Field Name | Type / Source |
|---|---|
| `old_url` | Controller Input / Validation |
| `new_url` | Controller Input / Validation |
| `success` | Controller Input / Validation |

### Database Table (`url_redirections`)
| Column Name | Details / DataType |
|---|---|
| `old_url` | Migration type: `text` |
| `new_url` | Migration type: `text` |

---

## Addresses
**Laravel Route:** `/admin/addresses`  
**Blade View:** `addresses.blade.php`  
**Controller:** `AddressC.php`  
**Laravel Model:** `App\Models\Address`  

### Form & Input Fields
| Field Name | Type / Source |
|---|---|
| `country` | Controller Input / Validation |
| `city` | Controller Input / Validation |
| `mobile` | Controller Input / Validation |
| `email` | Controller Input / Validation |
| `address` | Controller Input / Validation |
| `success` | Controller Input / Validation |

### Database Table (`addresses`)
*Columns managed via core table or dynamic attributes.* 

---

## Email & System Settings
**Laravel Route:** `/admin/system-settings`  
**Blade View:** `system-settings/index.blade.php`  
**Controller:** `SystemSettingC.php`  
**Laravel Model:** `App\Models\SystemSetting`  

### Form & Input Fields
| Field Name | Type / Source |
|---|---|
| `email_mode` | Controller Input / Validation |
| `main_to_email` | Controller Input / Validation |
| `main_to_name` | Controller Input / Validation |
| `main_cc_email` | Controller Input / Validation |
| `main_cc_name` | Controller Input / Validation |
| `main_bcc_email` | Controller Input / Validation |
| `main_bcc_name` | Controller Input / Validation |
| `testing_to_email` | Controller Input / Validation |
| `testing_to_name` | Controller Input / Validation |
| `testing_cc_email` | Controller Input / Validation |
| `testing_cc_name` | Controller Input / Validation |
| `testing_bcc_email` | Controller Input / Validation |
| `testing_bcc_name` | Controller Input / Validation |

### Database Table (`system_settings`)
| Column Name | Details / DataType |
|---|---|
| `key` | Migration type: `string` |
| `value` | Migration type: `longText` |
| `type` | Migration type: `string` |
| `description` | Migration type: `text` |

---

## Landing Pages
**Laravel Route:** `/admin/landing-pages`  
**Blade View:** `landing-pages.blade.php`  
**Controller:** `LandingPageC.php`  
**Laravel Model:** `App\Models\LandingPage`  

### Form & Input Fields
| Field Name | Type / Source |
|---|---|
| `success` | Controller Input / Validation |

### Database Table (`landing_pages`)
*Columns managed via core table or dynamic attributes.* 

---

### Landing Page Banners
**Blade View:** `landing-page-banners.blade.php`  
**Controller:** `LandingPageBannerC.php`  
**Laravel Model:** `App\Models\LandingPageBanner`  

### Form & Input Fields
| Field Name | Type / Source |
|---|---|
| `landing_page_id` | Blade Input (`hidden`) |
| `alt_text` | Controller Input / Validation |
| `success` | Controller Input / Validation |
| `photo` | Controller Input / Validation |

### Database Table (`landing_page_banners`)
*Columns managed via core table or dynamic attributes.* 

---

### Landing Page FAQs
**Blade View:** `landing-page-faqs.blade.php`  
**Controller:** `LandingPageFaqC.php`  
**Laravel Model:** `App\Models\LandingPageFaq`  

### Form & Input Fields
| Field Name | Type / Source |
|---|---|
| `landing_page_id` | Blade Input (`hidden`) |
| `question` | Controller Input / Validation |
| `answer` | Controller Input / Validation |
| `success` | Controller Input / Validation |

### Database Table (`landing_page_faqs`)
*Columns managed via core table or dynamic attributes.* 

---

### Landing Page Universities
**Blade View:** `landing-page-universities.blade.php`  
**Controller:** `LandingPageUniversityC.php`  
**Laravel Model:** `App\Models\LandingPageUniversity`  

### Form & Input Fields
| Field Name | Type / Source |
|---|---|
| `landing_page_id` | Blade Input (`hidden`) |
| `university_id` | Controller Input / Validation |
| `booth_no` | Controller Input / Validation |
| `success` | Controller Input / Validation |

### Database Table (`landing_page_universities`)
*Columns managed via core table or dynamic attributes.* 

---

## Scholarships
**Laravel Route:** `/admin/scholarships`  
**Blade View:** `scholarships.blade.php`  
**Controller:** `ScholarshipC.php`  
**Laravel Model:** `App\Models\Scholarship`  

### Form & Input Fields
| Field Name | Type / Source |
|---|---|
| `page_type` | Blade Input (`select`) |
| `title` | Controller Input / Validation |
| `thumbnail` | Controller Input / Validation |
| `og_image` | Controller Input / Validation |
| `success` | Controller Input / Validation |

### Database Table (`scholarships`)
*Columns managed via core table or dynamic attributes.* 

---

### Scholarship Contents
**Blade View:** `scholarship-contents.blade.php`  
**Controller:** `ScholarshipContentC.php`  
**Laravel Model:** `App\Models\ScholarshipContent`  

### Form & Input Fields
| Field Name | Type / Source |
|---|---|
| `scholarship_id` | Blade Input (`hidden`) |
| `tab` | Controller Input / Validation |
| `description` | Controller Input / Validation |
| `success` | Controller Input / Validation |

### Database Table (`scholarship_contents`)
*Columns managed via core table or dynamic attributes.* 

---

### Scholarship FAQs
**Blade View:** `scholarship-faqs.blade.php`  
**Controller:** `ScholarshipFaqC.php`  
**Laravel Model:** `App\Models\ScholarshipFaq`  

### Form & Input Fields
| Field Name | Type / Source |
|---|---|
| `scholarship_id` | Blade Input (`hidden`) |
| `question` | Controller Input / Validation |
| `answer` | Controller Input / Validation |
| `success` | Controller Input / Validation |

### Database Table (`scholarship_faqs`)
*Columns managed via core table or dynamic attributes.* 

---

## Page Banners
**Laravel Route:** `/admin/page-banners`  
**Blade View:** `page-banners.blade.php`  
**Controller:** `PageBannerC.php`  
**Laravel Model:** `App\Models\PageBanner`  

### Form & Input Fields
| Field Name | Type / Source |
|---|---|
| `alt_text` | Controller Input / Validation |
| `banner` | Controller Input / Validation |
| `success` | Controller Input / Validation |

### Database Table (`page_banners`)
| Column Name | Details / DataType |
|---|---|
| `page` | Migration type: `after` |
| `alt_text` | Migration type: `string` |
| `title` | Migration type: `string` |
| `description` | Migration type: `string` |
| `bannername` | Migration type: `renameColumn` |
| `bannerpath` | Migration type: `renameColumn` |
| `banner_name` | Migration type: `renameColumn` |
| `banner_path` | Migration type: `renameColumn` |

---

