# Website Student Dashboard Application Process Plan

## Overview
This document outlines the implementation plan for rendering dynamic **Student Application Workflows** on the `NextEducationMalaysia` student portal (`http://localhost:3000/student/`). It seamlessly integrates with the shared MySQL database managed by `britannica_crm`.

---

## Business Rules & Navigation Mapping

| Page Route | Description | Data Logic | Single / Multi Rule |
| :--- | :--- | :--- | :--- |
| `/student/unpaid-applications` | All course applications where payment is pending | Fetch `student_applications` where `stdid = currentUser` AND `app_status != 'Paid'` | **Multiple Allowed** (Student can apply to multiple courses before paying) |
| `/student/my-applications` | Confirmed/Paid application | Fetch `student_applications` where `stdid = currentUser` AND `app_status = 'Paid'` | **Single Active Paid Application Only** |
| `/student/overview` | Step-by-step progress roadmap of active paid application | Dynamically sync 6-step progress stepper with active paid application's stage from database | Driven by single paid application |
| `/student/applications/[id]` | Detailed view of any specific application | Fetch application details, program info, requirements, and document upload statuses | View individual app details |

---

## Detailed Step-by-Step Implementation Steps in NextEducationMalaysia

### Step 1: Unpaid Applications Page (`/student/unpaid-applications`)
* **File**: `src/app/student/unpaid-applications/UnpaidApplicationsClient.tsx`
* **Features**:
  * Fetch all applications with `app_status` = `Not-Paid` or null.
  * Render card components matching reference UI:
    * Program Name, University Name, Application ID (`#4359`).
    * Badges: `NOT-PAID`, `POST-GRADUATE` / `UNDER-GRADUATE`.
    * Program Metadata: Study Mode, Duration, Intake, Deadline.
    * Actions: **[View Application]** (navigates to `/student/applications/:id`), **[Cancel Application]** (triggers deletion API), **[Pay Application Fee]**.
  * Show empty state with CTA to browse courses when 0 unpaid applications exist.

### Step 2: Paid Applications Page (`/student/my-applications`)
* **File**: `src/app/student/applied-colleges/AppliedCollegesClient.tsx` & `src/app/student/my-applications/page.tsx`
* **Features**:
  * Fetch application where `app_status = 'Paid'` (or stage > Pre-Payment).
  * Enforce single active paid application display.
  * Render official application badge, university admission status, payment receipt reference, and direct link to `/student/overview`.
  * If 0 paid applications exist, render clean empty state with button: "View Unpaid Applications (X)".

### Step 3: Dynamic Progress Roadmap (`/student/overview`)
* **File**: `src/app/student/overview/OverviewClient.tsx`
* **Features**:
  * Link 6-step progress roadmap directly to the active paid application stage updated by CRM admin:
    1. **Complete Profile**: 100% profile & checklist completion.
    2. **Start Applying**: Verified when applications exist.
    3. **Review & Submit**: `In Review` / `Processing` stage set by CRM.
    4. **Get Your Results**: `Offer Letter Received` / `Accepted` status in CRM.
    5. **Apply for Visa**: `Visa Processing` / `EMGS Approval` stage in CRM.
    6. **Enrol & Settle**: `Enrolled` / `Flight Details Confirmed` status in CRM.
  * Real-time sync: Any status/stage change by CRM admin immediately advances or updates the student's stepper on the website.

### Step 4: Application Detail & Document Upload (`/student/applications/[id]`)
* **File**: `src/app/student/applications/[id]/ApplicationDetailClient.tsx`
* **Features**:
  * View program details, university info, required documents checklist.
  * Real-time doc statuses from database: `Completed` (green check), `Reviewing` (amber clock), `Not Approved` (red alert with notes).
  * Allow student to upload missing documents directly from portal.

---

## Backend Endpoint Sync Contract (`/api/v1/student/`)

1. `GET /api/v1/student/applied-college`: Returns all applications split into `paid` and `unpaid`.
2. `GET /api/v1/student/applications/:id`: Returns full details for a specific application.
3. `POST /api/v1/student/applications/:id/cancel`: Deletes an unpaid application.
4. `POST /api/v1/student/documents/upload`: Uploads applicant documents.
5. `GET /api/v1/student/profile`: Returns profile completion percentage and checklist status.

---

## Verification & Validation Plan

1. **Unpaid Applications View Test**:
   * Log into `http://localhost:3000/student/unpaid-applications`.
   * Verify all unpaid applications are displayed matching the reference design layout.
2. **Paid Application Transition Test**:
   * Once application #4359 is marked `Paid` in CRM, refresh `/student/my-applications`.
   * Verify #4359 moves from unpaid list to `/student/my-applications`.
3. **Overview Stepper Sync Test**:
   * Check `/student/overview`. Verify progress stepper reflects the exact CRM stage of #4359.
