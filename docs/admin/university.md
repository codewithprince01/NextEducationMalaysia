# University Module Documentation

**Laravel Admin Navbar Menu:** `University`  
**React Migration Status:** **`Done`**

## Institute Types
**Laravel Route:** `/admin/Institute-Types`  
**Blade View:** `institute-types.blade.php`  
**Controller:** `InstituteTypeC.php`  
**Laravel Model:** `App\Models\InstituteType`  

### Form & Input Fields
| Field Name | Type / Source |
|---|---|
| `type` | Controller Input / Validation |
| `seo_title` | Controller Input / Validation |

### Database Table (`institute_types`)
*Columns managed via core table or dynamic attributes.* 

---

## Study Modes
**Laravel Route:** `/admin/study-modes`  
**Blade View:** `study-modes.blade.php`  
**Controller:** `StudyModeC.php`  
**Laravel Model:** `App\Models\StudyMode`  

### Form & Input Fields
| Field Name | Type / Source |
|---|---|
| `study_mode` | Controller Input / Validation |

### Database Table (`study_modes`)
*Columns managed via core table or dynamic attributes.* 

---

## Universities (Main & Add/Edit)
**Laravel Route:** `/admin/university`  
**Blade View:** `university.blade.php`  
**Controller:** `UniversityC.php`  
**Laravel Model:** `App\Models\University`  

### Form & Input Fields
| Field Name | Type / Source |
|---|---|
| `search` | Blade Input (`text`) |
| `state` | Blade Input (`select`) |
| `city` | Blade Input (`select`) |
| `limit_per_page` | Blade Input (`select`) |
| `order_by` | Blade Input (`select`) |
| `order_in` | Blade Input (`select`) |
| `check_all` | Blade Input (`checkbox`) |
| `selected_id[]` | Blade Input (`checkbox`) |
| `file` | Blade Input (`file`) |
| `has` | Controller Input / Validation |
| `boolean` | Controller Input / Validation |
| `country` | Controller Input / Validation |
| `Name` | Controller Input / Validation |
| `Date` | Controller Input / Validation |
| `City` | Controller Input / Validation |
| `State` | Controller Input / Validation |
| `Country` | Controller Input / Validation |
| `seo_rating` | Controller Input / Validation |
| `logo` | Controller Input / Validation |
| `banner` | Controller Input / Validation |

### Database Table (`universities`)
| Column Name | Details / DataType |
|---|---|
| `featured` | Migration type: `boolean` |
| `latitude_longitude` | Migration type: `string` |
| `approved_by` | Migration type: `json` |
| `accredited_by` | Migration type: `json` |
| `hostel_facility` | Migration type: `json` |
| `malaysia_rank` | Migration type: `string` |
| `qs_asia_rank` | Migration type: `string` |
| `local_students` | Migration type: `integer` |
| `international_students` | Migration type: `integer` |
| `contact_number1` | Migration type: `string` |
| `contact_number2` | Migration type: `string` |
| `is_local` | Migration type: `boolean` |
| `is_international` | Migration type: `boolean` |
| `study_options` | Migration type: `json` |
| `bcc` | Migration type: `string` |
| `scholarship_available` | Migration type: `boolean` |

---

### Add/Edit University Form
**Blade View:** `add-university.blade.php`  
**Controller:** `UniversityC.php`  
**Laravel Model:** `App\Models\University`  

### Form & Input Fields
| Field Name | Type / Source |
|---|---|
| `limit_per_page` | Controller Input / Validation |
| `order_by` | Controller Input / Validation |
| `order_in` | Controller Input / Validation |
| `has` | Controller Input / Validation |
| `search` | Controller Input / Validation |
| `state` | Controller Input / Validation |
| `city` | Controller Input / Validation |
| `boolean` | Controller Input / Validation |
| `country` | Controller Input / Validation |
| `Name` | Controller Input / Validation |
| `Date` | Controller Input / Validation |
| `City` | Controller Input / Validation |
| `State` | Controller Input / Validation |
| `Country` | Controller Input / Validation |
| `seo_rating` | Controller Input / Validation |
| `logo` | Controller Input / Validation |
| `banner` | Controller Input / Validation |
| `file` | Controller Input / Validation |

### Database Table (`universities`)
| Column Name | Details / DataType |
|---|---|
| `featured` | Migration type: `boolean` |
| `latitude_longitude` | Migration type: `string` |
| `approved_by` | Migration type: `json` |
| `accredited_by` | Migration type: `json` |
| `hostel_facility` | Migration type: `json` |
| `malaysia_rank` | Migration type: `string` |
| `qs_asia_rank` | Migration type: `string` |
| `local_students` | Migration type: `integer` |
| `international_students` | Migration type: `integer` |
| `contact_number1` | Migration type: `string` |
| `contact_number2` | Migration type: `string` |
| `is_local` | Migration type: `boolean` |
| `is_international` | Migration type: `boolean` |
| `study_options` | Migration type: `json` |
| `bcc` | Migration type: `string` |
| `scholarship_available` | Migration type: `boolean` |

---

### University Overview
**Blade View:** `university-overview.blade.php`  
**Controller:** `UniversityOverviewC.php`  
**Laravel Model:** `App\Models\UniversityOverview`  

### Form & Input Fields
| Field Name | Type / Source |
|---|---|
| `title` | Controller Input / Validation |
| `description` | Controller Input / Validation |

### Database Table (`university_overviews`)
| Column Name | Details / DataType |
|---|---|
| `position` | Migration type: `integer` |

---

### University Programs
**Blade View:** `university-programs.blade.php`  
**Controller:** `UniversityProgramC.php`  
**Laravel Model:** `App\Models\UniversityProgram`  

### Form & Input Fields
| Field Name | Type / Source |
|---|---|
| `file` | Blade Input (`file`) |
| `search` | Blade Input (`text`) |
| `course_category_id` | Blade Input (`select`) |
| `specialization_id` | Blade Input (`select`) |
| `limit_per_page` | Blade Input (`select`) |
| `order_by` | Blade Input (`select`) |
| `order_in` | Blade Input (`select`) |
| `has` | Controller Input / Validation |
| `boolean` | Controller Input / Validation |
| `university_id` | Controller Input / Validation |
| `Name` | Controller Input / Validation |
| `Date` | Controller Input / Validation |
| `course_name` | Controller Input / Validation |
| `level` | Controller Input / Validation |
| `duration` | Controller Input / Validation |
| `study_mode` | Controller Input / Validation |

### Database Table (`university_programs`)
| Column Name | Details / DataType |
|---|---|
| `nri_discount` | Migration type: `after` |
| `total_fee` | Migration type: `decimal` |
| `total_tuition_fee` | Migration type: `decimal` |
| `annual_tuition_fee` | Migration type: `decimal` |
| `registration_fee` | Migration type: `decimal` |
| `laboratory_fee` | Migration type: `decimal` |
| `technology_fee` | Migration type: `decimal` |
| `student_activity_fee` | Migration type: `decimal` |
| `insurance_fee` | Migration type: `decimal` |
| `examination_fee` | Migration type: `decimal` |
| `emgs_processing_fee` | Migration type: `decimal` |
| `international_security_deposit` | Migration type: `decimal` |
| `international_student_charge` | Migration type: `decimal` |
| `international_administration_fee` | Migration type: `decimal` |
| `resources_fee` | Migration type: `decimal` |
| `commitment_fee` | Migration type: `decimal` |
| `facilities_fee` | Migration type: `decimal` |
| `other_fee` | Migration type: `decimal` |
| `last_update` | Migration type: `timestamp` |
| `currency` | Migration type: `string` |
| `additional_note` | Migration type: `text` |
| `scholarship_amount` | Migration type: `decimal` |
| `tution_fee_after_scholarship` | Migration type: `decimal` |
| `year1_tuition_fee` | Migration type: `decimal` |
| `year2_tuition_fee` | Migration type: `decimal` |
| `year3_tuition_fee` | Migration type: `decimal` |
| `year4_tuition_fee` | Migration type: `decimal` |
| `accommodation_fee` | Migration type: `decimal` |
| `airport_pickup_fee` | Migration type: `decimal` |
| `anual_tuition_fee_local` | Migration type: `decimal` |
| `year1_tuition_fee_local` | Migration type: `decimal` |
| `year2_tuition_fee_local` | Migration type: `decimal` |
| `year3_tuition_fee_local` | Migration type: `decimal` |
| `year4_tuition_fee_local` | Migration type: `decimal` |
| `total_tuition_fee_local` | Migration type: `decimal` |
| `campus` | Migration type: `text` |
| `is_local` | Migration type: `boolean` |
| `is_international` | Migration type: `boolean` |
| `accreditations` | Migration type: `json` |

---

#### University Program Contents
**Blade View:** `university-program-contents.blade.php`  
**Controller:** `UniversityProgramContentC.php`  
**Laravel Model:** `App\Models\UniversityProgramContent`  

### Form & Input Fields
| Field Name | Type / Source |
|---|---|
| `c_id` | Blade Input (`hidden`) |
| `tab_title` | Controller Input / Validation |
| `description` | Controller Input / Validation |
| `success` | Controller Input / Validation |

### Database Table (`university_program_contents`)
*Columns managed via core table or dynamic attributes.* 

---

### University Photos
**Blade View:** `university-photos.blade.php`  
**Controller:** `UniversityGalleryC.php`  
**Laravel Model:** `App\Models\UniversityPhoto`  

### Form & Input Fields
| Field Name | Type / Source |
|---|---|
| `boolean` | Controller Input / Validation |
| `title` | Controller Input / Validation |
| `photo` | Controller Input / Validation |

### Database Table (`university_photos`)
| Column Name | Details / DataType |
|---|---|
| `is_featured` | Migration type: `boolean` |

---

### University Videos
**Blade View:** `university-videos.blade.php`  
**Controller:** `UniversityVideoGalleryC.php`  
**Laravel Model:** `App\Models\UniversityVideoGallery`  

### Form & Input Fields
| Field Name | Type / Source |
|---|---|
| `title` | Controller Input / Validation |
| `video_link` | Controller Input / Validation |

### Database Table (`university_videos`)
*Columns managed via core table or dynamic attributes.* 

---

### University Facilities
**Blade View:** `university-facilities.blade.php`  
**Controller:** `UniversityFacilityC.php`  
**Laravel Model:** `App\Models\UniversityFacility`  

### Form & Input Fields
| Field Name | Type / Source |
|---|---|
| `u_id` | Blade Input (`hidden`) |
| `title` | Controller Input / Validation |
| `description` | Controller Input / Validation |
| `success` | Controller Input / Validation |

### Database Table (`university_facilities`)
*Columns managed via core table or dynamic attributes.* 

---

### Other Content
**Blade View:** `other-content.blade.php`  
**Controller:** `UniversityOtherContentC.php`  
**Laravel Model:** `App\Models\UniversityOtherContent`  

### Form & Input Fields
| Field Name | Type / Source |
|---|---|
| `university_id` | Blade Input (`hidden`) |
| `has` | Controller Input / Validation |
| `tab_name` | Controller Input / Validation |
| `description` | Controller Input / Validation |
| `success` | Controller Input / Validation |

### Database Table (`other_contents`)
*Columns managed via core table or dynamic attributes.* 

---

### University Rankings
**Blade View:** `university-rankings.blade.php`  
**Controller:** `UniversityRankingC.php`  
**Laravel Model:** `App\Models\UniversityRanking`  

### Form & Input Fields
| Field Name | Type / Source |
|---|---|
| `university_id` | Controller Input / Validation |
| `title` | Controller Input / Validation |
| `description` | Controller Input / Validation |
| `position` | Controller Input / Validation |

### Database Table (`university_rankings`)
| Column Name | Details / DataType |
|---|---|
| `title` | Migration type: `text` |
| `description` | Migration type: `longText` |
| `position` | Migration type: `integer` |
| `university_id` | Migration type: `unsignedBigInteger` |

---

### University Scholarships
**Blade View:** `university-scholarships.blade.php`  
**Controller:** `UniversityScholarshipC.php`  
**Laravel Model:** `App\Models\UniversityScholarship`  

### Form & Input Fields
| Field Name | Type / Source |
|---|---|
| `university_id` | Blade Input (`hidden`) |
| `international_student_eligible` | Blade Input (`select`) |
| `has` | Controller Input / Validation |
| `scholarship_name` | Controller Input / Validation |
| `success` | Controller Input / Validation |
| `failed` | Controller Input / Validation |

### Database Table (`university_scholarships`)
*Columns managed via core table or dynamic attributes.* 

---

#### University Scholarship Contents
**Blade View:** `university-scholarship-contents.blade.php`  
**Controller:** `UniversityScholarshipContentC.php`  
**Laravel Model:** `App\Models\UniversityScholarshipContent`  

### Form & Input Fields
| Field Name | Type / Source |
|---|---|
| `scholarship_id` | Blade Input (`hidden`) |
| `has` | Controller Input / Validation |
| `title` | Controller Input / Validation |
| `description` | Controller Input / Validation |
| `success` | Controller Input / Validation |

### Database Table (`university_scholarship_contents`)
*Columns managed via core table or dynamic attributes.* 

---

## University Reviews
**Laravel Route:** `/admin/university-reviews`  
**Blade View:** `university-reviews.blade.php`  
**Controller:** `UniversityReviewC.php`  
**Laravel Model:** `App\Models\UniversityReviews`  

### Form & Input Fields
| Field Name | Type / Source |
|---|---|
| `has` | Controller Input / Validation |
| `status` | Controller Input / Validation |

### Database Table (`university_reviews`)
*Columns managed via core table or dynamic attributes.* 

---

