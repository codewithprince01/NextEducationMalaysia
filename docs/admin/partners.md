# Partners Module Documentation

**Laravel Admin Navbar Menu:** `Partners`  
**React Migration Status:** **`Pending`**

## Our Partners
**Laravel Route:** `/admin/our-partners`  
**Blade View:** `our-partners.blade.php`  
**Controller:** `OurPartnerC.php`  
**Laravel Model:** `App\Models\OurPartner`  

### Form & Input Fields
| Field Name | Type / Source |
|---|---|
| `boolean` | Controller Input / Validation |
| `filled` | Controller Input / Validation |
| `specializations` | Controller Input / Validation |
| `has` | Controller Input / Validation |
| `name` | Controller Input / Validation |
| `designation` | Controller Input / Validation |
| `company` | Controller Input / Validation |
| `profile_image` | Controller Input / Validation |
| `is_verified` | Controller Input / Validation |
| `rating` | Controller Input / Validation |
| `phone` | Controller Input / Validation |
| `email` | Controller Input / Validation |
| `city` | Controller Input / Validation |
| `state` | Controller Input / Validation |
| `country` | Controller Input / Validation |
| `experience_years` | Controller Input / Validation |
| `students_placed` | Controller Input / Validation |
| `is_active` | Controller Input / Validation |
| `success` | Controller Input / Validation |

### Database Table (`our_partners`)
| Column Name | Details / DataType |
|---|---|
| `name` | Migration type: `string` |
| `designation` | Migration type: `string` |
| `company` | Migration type: `string` |
| `profile_image` | Migration type: `string` |
| `is_verified` | Migration type: `boolean` |
| `rating` | Migration type: `decimal` |
| `phone` | Migration type: `string` |
| `email` | Migration type: `string` |
| `city` | Migration type: `string` |
| `state` | Migration type: `string` |
| `country` | Migration type: `string` |
| `experience_years` | Migration type: `unsignedInteger` |
| `students_placed` | Migration type: `unsignedInteger` |
| `specializations` | Migration type: `json` |
| `is_active` | Migration type: `boolean` |

---

