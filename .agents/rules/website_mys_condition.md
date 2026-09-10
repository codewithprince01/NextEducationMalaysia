# Mandatory Rule: Global Condition `website = 'MYS'`

In the Education Malaysia database (`laravel-educationmalaysia.in`), all core modules (`course_categories`, `course_specializations`, `specialization_levels`, `levels`, `programs`, `universities`, `blogs`, `faqs`, etc.) share a multi-site structure.

### Requirements:
1. **SELECT / GET Queries**:
   - MUST ALWAYS filter queries by `WHERE website = 'MYS'` (or `AND cc.website = 'MYS'`).
   - Example: `SELECT cc.* FROM course_categories cc WHERE cc.website = 'MYS' ORDER BY cc.id DESC`.

2. **INSERT / POST Queries**:
   - MUST ALWAYS include `website` column set to `'MYS'`.

3. **UPDATE & DELETE Queries**:
   - Ensure operations apply to records matching `website = 'MYS'`.
