# Admin Dashboard Modules Plan - NextEducationMalaysia

This document tracks the step-by-step migration and development of the Admin Dashboard in Next.js (`NextEducationMalaysia`), built as a React application under the `/admin` path based on reference functionality from `laravel-educationmalaysia.in`.

---

## 📋 Module Checklist

### 🔐 Phase 1: Authentication & Core Infrastructure (DONE ✅)
- [x] `User` model mapping in `prisma/schema.prisma`
- [x] Admin Auth API Routes (`/api/v1/admin/auth/login`, `logout`, `me`, `forgot-password`, `reset-password`)
- [x] Admin Root Layout (`src/app/admin/layout.tsx`) & `AdminAuthContext`
- [x] Admin Login Page (`/admin/login`)
- [x] Forgot Password Page (`/admin/account/password/reset`)
- [x] Forgot Password Email Sent Page (`/admin/forget-password/email-sent`)
- [x] Magic Email Login Handler (`/admin/email-login`)
- [x] Reset Password Page (`/admin/password/reset`)
- [x] Invalid / Expired Link Page (`/admin/account/invalid-link`)
- [x] Profile View & Edit (`/admin/profile`)

---

### 📊 Phase 2: Dashboard Overview & Navigation Header
- [ ] Admin Top Navigation Header & Sidebar Menu
- [ ] Dashboard Main Page (`/admin/dashboard`)
- [ ] Key Performance Indicators (Universities count, Programs count, Active Students count, Leads count, Blogs count)
- [ ] Quick Action Shortcuts & System Quick Stats

---

### 🎓 Phase 3: Programs & Course Structure
- [ ] Levels Management (`/admin/levels`)
- [ ] Course Categories (`/admin/course-category`) - CRUD, Import, Export, Bulk Update
- [ ] Course Category Contents (`/admin/course-category-contents`)
- [ ] Course Category FAQs (`/admin/course-category-faqs`)
- [ ] Course Specializations (`/admin/course-specializations`) - CRUD, Category Filter, Import, Export
- [ ] Course Specialization Contents & FAQs
- [ ] Course Specialization Levels & Contents
- [ ] Programs List (`/admin/programs`)

---

### 🏛️ Phase 4: University Management
- [ ] Institute Types (`/admin/institute-types`)
- [ ] Study Modes (`/admin/study-modes`)
- [ ] Universities List (`/admin/university`) - Filtering, Search, Pagination, Export, Import, Bulk Update
- [ ] Add / Edit University (`/admin/university/add` & `/admin/university/update/[id]`) - Form with logo, banner, rating, ranks, `scholarship_available`, `is_local`, `is_international`
- [ ] University Overviews (`/admin/university-overview/[id]`)
- [ ] University Programs (`/admin/university-programs/[id]`) - CRUD, Import, Fee Export
- [ ] University Program Contents
- [ ] University Photo Gallery & Video Gallery
- [ ] University Facilities
- [ ] University Rankings & University Reviews (`/admin/university-reviews`)
- [ ] University Scholarships & Other Content

---

### 📝 Phase 5: Blog & Articles Management
- [ ] Blog Categories (`/admin/blog-category`)
- [ ] Blogs List & Form (`/admin/blogs`, `/admin/blogs/create`, `/admin/blogs/update/[id]`) - WYSIWYG Editor, Approval workflow
- [ ] Blog Contents & Blog FAQs

---

### 🔍 Phase 6: SEO Management
- [ ] Static Page SEOs (`/admin/static-page-seos`)
- [ ] Dynamic Page SEOs (`/admin/dynamic-page-seos`)
- [ ] Default OG Image Manager (`/admin/default-og-image`)

---

### ❓ Phase 7: FAQs & Content Modules
- [ ] FAQ Categories (`/admin/faq-categories`)
- [ ] FAQs List (`/admin/faqs`)
- [ ] Services & Service Content (`/admin/services`)
- [ ] Exams, Exam Tabs, Tab Contents, Exam FAQs (`/admin/exams`)
- [ ] Internships & Internship Contents/FAQs (`/admin/internships`)
- [ ] Partners Management (`/admin/our-partners`)

---

### 👨‍🎓 Phase 8: Student Applications & Lead Management
- [ ] Malaysia Application Categories (`/admin/malaysia-application-categories`)
- [ ] Malaysia Course Applications (`/admin/malaysia-applications`) - Search, Filter, Export
- [ ] International Student Countries (`/admin/international-student-data-countries`)
- [ ] International Student Applications (`/admin/international-student-data`)
- [ ] Student Leads & Lead Status Management (`/admin/leads`)

---

### ⚙️ Phase 9: System Settings & Sub-Admin Administration
- [ ] Sub-Admin Users & Staff (`/admin/users`) - Role assignment, Granular module permission checkboxes
- [ ] Authors Management (`/admin/authors`)
- [ ] Testimonials Management (`/admin/testimonials`)
- [ ] Home Page Contents (`/admin/page-contents`)
- [ ] Page Banners (`/admin/page-banners`)
- [ ] URL Redirections (`/admin/url-redirections`)
- [ ] Addresses Management (`/admin/addresses`)
- [ ] Email SMTP Settings (`/admin/email-settings`)
- [ ] Uploaded Files / Media Asset Manager (`/admin/upload-files`)
