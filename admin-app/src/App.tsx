import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AdminAuthProvider, useAdminAuth } from '@/context/AdminAuthContext';
import { SidebarProvider } from '@/context/SidebarContext';
import AdminLayout from '@/components/layout/AdminLayout';
import Login from '@/pages/Login';
import Dashboard from '@/pages/Dashboard';
import Levels from '@/pages/Levels';
import CourseCategories from '@/pages/CourseCategories';
import CourseCategoryContents from '@/pages/CourseCategoryContents';
import CourseSpecializations from '@/pages/CourseSpecializations';
import CourseSpecializationContents from '@/pages/CourseSpecializationContents';
import SpecializationLevels from '@/pages/SpecializationLevels';
import SpecializationLevelContents from '@/pages/SpecializationLevelContents';
import Universities from '@/pages/Universities';
import AddUniversity from '@/pages/AddUniversity';
import UniversityOverviews from '@/pages/UniversityOverviews';
import UniversityGallery from '@/pages/UniversityGallery';
import UniversityFacilities from '@/pages/UniversityFacilities';
import UniversityReviews from '@/pages/UniversityReviews';
import UniversityRankings from '@/pages/UniversityRankings';
import InstituteTypes from '@/pages/InstituteTypes';
import StudyModes from '@/pages/StudyModes';
import UniversityDocuments from '@/pages/UniversityDocuments';
import DocumentCategories from '@/pages/DocumentCategories';
import Programs from '@/pages/Programs';
import UniversityProgramContents from '@/pages/UniversityProgramContents';
import BlogCategories from '@/pages/BlogCategories';
import Blogs from '@/pages/Blogs';
import AddEditBlog from '@/pages/AddEditBlog';
import BlogContents from '@/pages/BlogContents';
import BlogFaqs from '@/pages/BlogFaqs';
import PageContents from '@/pages/PageContents';
import StaticPageContents from '@/pages/StaticPageContents';
import StaticPageSeos from '@/pages/StaticPageSeos';
import DynamicPageSeos from '@/pages/DynamicPageSeos';
import DefaultOgImage from '@/pages/DefaultOgImage';
import FaqCategories from '@/pages/FaqCategories';
import Faqs from '@/pages/Faqs';
import Services from '@/pages/Services';
import ServiceContents from '@/pages/ServiceContents';
import Exams from '@/pages/Exams';
import Internships from '@/pages/Internships';
import OurPartners from '@/pages/OurPartners';
import MalaysiaApplications from '@/pages/MalaysiaApplications';
import MalaysiaApplicationCategories from '@/pages/MalaysiaApplicationCategories';
import InternationalStudentData from '@/pages/InternationalStudentData';
import InternationalStudentDataCountries from '@/pages/InternationalStudentDataCountries';
import Authors from '@/pages/Authors';
import Testimonials from '@/pages/Testimonials';
import Users from '@/pages/Users';
import Profile from '@/pages/Profile';
import UploadFiles from '@/pages/UploadFiles';
import UrlRedirections from '@/pages/UrlRedirections';
import Addresses from '@/pages/Addresses';
import SystemSettings from '@/pages/SystemSettings';
import LandingPages from '@/pages/LandingPages';
import Scholarships from '@/pages/Scholarships';
import PageBanners from '@/pages/PageBanners';
import AuditLogs from '@/pages/AuditLogs';
import NotFound from '@/pages/NotFound';
import AccessDenied from '@/components/common/AccessDenied';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading } = useAdminAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f4f7fe] flex flex-col items-center justify-center text-slate-700">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-slate-500 text-xs font-semibold tracking-wide animate-pulse">Loading Admin Portal...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

function PermissionRoute({
  module,
  moduleName,
  children,
}: {
  module?: string | string[];
  moduleName?: string;
  children: React.ReactNode;
}) {
  const { canAccess, loading } = useAdminAuth();

  if (loading) {
    return null;
  }

  if (module && !canAccess(module)) {
    return <AccessDenied moduleName={moduleName || (Array.isArray(module) ? module.join(', ') : module)} />;
  }

  return <>{children}</>;
}

export default function App() {
  return (
    <AdminAuthProvider>
      <SidebarProvider>
        {/* import.meta.env.BASE_URL is vite.config's `base` ("/admin/"), so the
            routes below stay written as plain paths while the panel lives under
            /admin on the main site. */}
        <BrowserRouter basename={import.meta.env.BASE_URL}>
          <Routes>
            {/* Public Auth Routes */}
            <Route path="/login" element={<Login />} />

            {/* Protected Admin Routes */}
            <Route
              element={
                <ProtectedRoute>
                  <AdminLayout />
                </ProtectedRoute>
              }
            >
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<PermissionRoute module="dashboard" moduleName="Dashboard"><Dashboard /></PermissionRoute>} />
              <Route path="/university" element={<PermissionRoute module="university" moduleName="Universities"><Universities /></PermissionRoute>} />
              <Route path="/university/add" element={<PermissionRoute module="university" moduleName="Add University"><AddUniversity /></PermissionRoute>} />
              <Route path="/university/edit/:id" element={<PermissionRoute module="university" moduleName="Edit University"><AddUniversity /></PermissionRoute>} />
              <Route path="/universities" element={<PermissionRoute module="university" moduleName="Universities"><Universities /></PermissionRoute>} />
              <Route path="/university-overviews" element={<PermissionRoute module="university-overview" moduleName="University Overviews"><UniversityOverviews /></PermissionRoute>} />
              <Route path="/university-overviews/:id" element={<PermissionRoute module="university-overview" moduleName="University Overviews"><UniversityOverviews /></PermissionRoute>} />
              <Route path="/university-gallery" element={<PermissionRoute module={['university-photos', 'university-videos']} moduleName="University Gallery"><UniversityGallery /></PermissionRoute>} />
              <Route path="/university-gallery/:id" element={<PermissionRoute module={['university-photos', 'university-videos']} moduleName="University Gallery"><UniversityGallery /></PermissionRoute>} />
              <Route path="/university-facilities" element={<PermissionRoute module="university-facilities" moduleName="University Facilities"><UniversityFacilities /></PermissionRoute>} />
              <Route path="/university-facilities/:id" element={<PermissionRoute module="university-facilities" moduleName="University Facilities"><UniversityFacilities /></PermissionRoute>} />
              <Route path="/university-reviews" element={<PermissionRoute module="university-reviews" moduleName="University Reviews"><UniversityReviews /></PermissionRoute>} />
              <Route path="/university-rankings" element={<PermissionRoute module="university-ranking" moduleName="University Rankings"><UniversityRankings /></PermissionRoute>} />
              <Route path="/university-rankings/:id" element={<PermissionRoute module="university-ranking" moduleName="University Rankings"><UniversityRankings /></PermissionRoute>} />
              <Route path="/institute-types" element={<PermissionRoute module="institute-types" moduleName="Institute Types"><InstituteTypes /></PermissionRoute>} />
              <Route path="/study-modes" element={<PermissionRoute module="study-modes" moduleName="Study Modes"><StudyModes /></PermissionRoute>} />
              <Route path="/university-documents" element={<PermissionRoute module="university-documents" moduleName="University Documents"><UniversityDocuments /></PermissionRoute>} />
              <Route path="/university-documents/:university_id" element={<PermissionRoute module="university-documents" moduleName="University Documents"><UniversityDocuments /></PermissionRoute>} />
              <Route path="/document-categories" element={<PermissionRoute module="document-categories" moduleName="Document Categories"><DocumentCategories /></PermissionRoute>} />
              <Route path="/levels" element={<PermissionRoute module="levels" moduleName="Levels"><Levels /></PermissionRoute>} />
              <Route path="/course-category" element={<PermissionRoute module="course-category" moduleName="Course Categories"><CourseCategories /></PermissionRoute>} />
              <Route path="/course-categories" element={<PermissionRoute module="course-category" moduleName="Course Categories"><CourseCategories /></PermissionRoute>} />
              <Route path="/course-category-contents" element={<PermissionRoute module="course-category-contents" moduleName="Course Category Contents"><CourseCategoryContents /></PermissionRoute>} />
              <Route path="/course-category-contents/:id" element={<PermissionRoute module="course-category-contents" moduleName="Course Category Contents"><CourseCategoryContents /></PermissionRoute>} />
              <Route path="/course-specializations" element={<PermissionRoute module="course-specializations" moduleName="Course Specializations"><CourseSpecializations /></PermissionRoute>} />
              <Route path="/course-specialization-contents" element={<PermissionRoute module="course-specialization-contents" moduleName="Course Specialization Contents"><CourseSpecializationContents /></PermissionRoute>} />
              <Route path="/course-specialization-contents/:id" element={<PermissionRoute module="course-specialization-contents" moduleName="Course Specialization Contents"><CourseSpecializationContents /></PermissionRoute>} />
              <Route path="/course-specialization-levels" element={<PermissionRoute module="specialization-levels" moduleName="Specialization Levels"><SpecializationLevels /></PermissionRoute>} />
              <Route path="/course-specialization-levels/:id" element={<PermissionRoute module="specialization-levels" moduleName="Specialization Levels"><SpecializationLevels /></PermissionRoute>} />
              <Route path="/specialization-levels" element={<PermissionRoute module="specialization-levels" moduleName="Specialization Levels"><SpecializationLevels /></PermissionRoute>} />
              <Route path="/specialization-levels/:id" element={<PermissionRoute module="specialization-levels" moduleName="Specialization Levels"><SpecializationLevels /></PermissionRoute>} />
              <Route path="/specialization-level-contents" element={<PermissionRoute module="specialization-level-contents" moduleName="Specialization Level Contents"><SpecializationLevelContents /></PermissionRoute>} />
              <Route path="/specialization-level-contents/:id" element={<PermissionRoute module="specialization-level-contents" moduleName="Specialization Level Contents"><SpecializationLevelContents /></PermissionRoute>} />
              <Route path="/programs" element={<PermissionRoute module="programs" moduleName="Programs"><Programs /></PermissionRoute>} />
              <Route path="/university-program-contents" element={<PermissionRoute module="university-program-contents" moduleName="University Program Contents"><UniversityProgramContents /></PermissionRoute>} />
              <Route path="/university-program-contents/:id" element={<PermissionRoute module="university-program-contents" moduleName="University Program Contents"><UniversityProgramContents /></PermissionRoute>} />
              <Route path="/blog-category" element={<PermissionRoute module="blog-category" moduleName="Blog Categories"><BlogCategories /></PermissionRoute>} />
              <Route path="/blog-categories" element={<PermissionRoute module="blog-category" moduleName="Blog Categories"><BlogCategories /></PermissionRoute>} />
              <Route path="/blogs" element={<PermissionRoute module="blogs" moduleName="Blogs"><Blogs /></PermissionRoute>} />
              <Route path="/blogs/create" element={<PermissionRoute module="blogs" moduleName="Create Blog"><AddEditBlog /></PermissionRoute>} />
              <Route path="/blogs/edit/:id" element={<PermissionRoute module="blogs" moduleName="Edit Blog"><AddEditBlog /></PermissionRoute>} />
              <Route path="/blog-contents" element={<PermissionRoute module="blog-contents" moduleName="Blog Contents"><BlogContents /></PermissionRoute>} />
              <Route path="/blog-content" element={<PermissionRoute module="blog-contents" moduleName="Blog Contents"><BlogContents /></PermissionRoute>} />
              <Route path="/blog-faqs" element={<PermissionRoute module="blog-faqs" moduleName="Blog FAQs"><BlogFaqs /></PermissionRoute>} />
              <Route path="/static-page-seos" element={<PermissionRoute module="static-page-seos" moduleName="Static Page SEOs"><StaticPageSeos /></PermissionRoute>} />
              <Route path="/dynamic-page-seos" element={<PermissionRoute module="dynamic-page-seos" moduleName="Dynamic Page SEOs"><DynamicPageSeos /></PermissionRoute>} />
              <Route path="/default-og-image" element={<PermissionRoute module="default-og-image" moduleName="Default OG Image"><DefaultOgImage /></PermissionRoute>} />
              <Route path="/faq-categories" element={<PermissionRoute module="faq-categories" moduleName="FAQ Categories"><FaqCategories /></PermissionRoute>} />
              <Route path="/faqs" element={<PermissionRoute module="faqs" moduleName="FAQs"><Faqs /></PermissionRoute>} />
              <Route path="/services" element={<PermissionRoute module="services" moduleName="Services"><Services /></PermissionRoute>} />
              <Route path="/service-contents" element={<PermissionRoute module="service-content" moduleName="Service Contents"><ServiceContents /></PermissionRoute>} />
              <Route path="/service-contents/:id" element={<PermissionRoute module="service-content" moduleName="Service Contents"><ServiceContents /></PermissionRoute>} />
              <Route path="/service-content" element={<PermissionRoute module="service-content" moduleName="Service Content"><ServiceContents /></PermissionRoute>} />
              <Route path="/service-content/:id" element={<PermissionRoute module="service-content" moduleName="Service Content"><ServiceContents /></PermissionRoute>} />
              <Route path="/exams" element={<PermissionRoute module="exams" moduleName="Exams"><Exams /></PermissionRoute>} />
              <Route path="/page-contents" element={<PermissionRoute module="page-contents" moduleName="Page Contents"><PageContents /></PermissionRoute>} />
              <Route path="/static-page-contents" element={<PermissionRoute module="static-page-contents" moduleName="Static Page Contents"><StaticPageContents /></PermissionRoute>} />
              <Route path="/internships" element={<PermissionRoute module="internships" moduleName="Internships"><Internships /></PermissionRoute>} />
              <Route path="/our-partners" element={<PermissionRoute module="our-partners" moduleName="Partners"><OurPartners /></PermissionRoute>} />
              <Route path="/malaysia-applications" element={<PermissionRoute module="malaysia-applications" moduleName="Malaysia Applications"><MalaysiaApplications /></PermissionRoute>} />
              <Route path="/malaysia-application-categories" element={<PermissionRoute module="malaysia-application-categories" moduleName="Malaysia Application Categories"><MalaysiaApplicationCategories /></PermissionRoute>} />
              <Route path="/international-student-data" element={<PermissionRoute module="international-student-data" moduleName="International Student Data"><InternationalStudentData /></PermissionRoute>} />
              <Route path="/international-student-data-countries" element={<PermissionRoute module="international-student-data-countries" moduleName="International Student Data Countries"><InternationalStudentDataCountries /></PermissionRoute>} />
              <Route path="/authors" element={<PermissionRoute module="authors" moduleName="Authors"><Authors /></PermissionRoute>} />
              <Route path="/testimonials" element={<PermissionRoute module="testimonials" moduleName="Testimonials"><Testimonials /></PermissionRoute>} />
              <Route path="/users" element={<PermissionRoute module="users" moduleName="Admin Users"><Users /></PermissionRoute>} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/upload-files" element={<PermissionRoute module="upload-files" moduleName="Upload Files"><UploadFiles /></PermissionRoute>} />
              <Route path="/url-redirections" element={<PermissionRoute module="url-redirections" moduleName="URL Redirections"><UrlRedirections /></PermissionRoute>} />
              <Route path="/addresses" element={<PermissionRoute module="addresses" moduleName="Addresses"><Addresses /></PermissionRoute>} />
              <Route path="/system-settings" element={<PermissionRoute module="email-settings" moduleName="Email & System Settings"><SystemSettings /></PermissionRoute>} />
              <Route path="/landing-pages" element={<PermissionRoute module="landing-pages" moduleName="Landing Pages"><LandingPages /></PermissionRoute>} />
              <Route path="/scholarships" element={<PermissionRoute module="scholarships" moduleName="Scholarships"><Scholarships /></PermissionRoute>} />
              <Route path="/page-banners" element={<PermissionRoute module="page-banners" moduleName="Page Banners"><PageBanners /></PermissionRoute>} />
              <Route path="/audit-logs" element={<PermissionRoute module="users" moduleName="Audit Trail"><AuditLogs /></PermissionRoute>} />
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </SidebarProvider>
    </AdminAuthProvider>
  );
}
