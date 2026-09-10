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
import UniversityReviews from '@/pages/UniversityReviews';
import InstituteTypes from '@/pages/InstituteTypes';
import StudyModes from '@/pages/StudyModes';
import Programs from '@/pages/Programs';
import Profile from '@/pages/Profile';
import NotFound from '@/pages/NotFound';

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

export default function App() {
  return (
    <AdminAuthProvider>
      <SidebarProvider>
        <BrowserRouter>
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
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/university" element={<Universities />} />
              <Route path="/university/add" element={<AddUniversity />} />
              <Route path="/university/edit/:id" element={<AddUniversity />} />
              <Route path="/universities" element={<Universities />} />
              <Route path="/university-reviews" element={<UniversityReviews />} />
              <Route path="/institute-types" element={<InstituteTypes />} />
              <Route path="/study-modes" element={<StudyModes />} />
              <Route path="/levels" element={<Levels />} />
              <Route path="/course-category" element={<CourseCategories />} />
              <Route path="/course-categories" element={<CourseCategories />} />
              <Route path="/course-category-contents" element={<CourseCategoryContents />} />
              <Route path="/course-category-contents/:id" element={<CourseCategoryContents />} />
              <Route path="/course-specializations" element={<CourseSpecializations />} />
              <Route path="/course-specialization-contents" element={<CourseSpecializationContents />} />
              <Route path="/course-specialization-contents/:id" element={<CourseSpecializationContents />} />
              <Route path="/course-specialization-levels" element={<SpecializationLevels />} />
              <Route path="/course-specialization-levels/:id" element={<SpecializationLevels />} />
              <Route path="/specialization-levels" element={<SpecializationLevels />} />
              <Route path="/specialization-levels/:id" element={<SpecializationLevels />} />
              <Route path="/specialization-level-contents" element={<SpecializationLevelContents />} />
              <Route path="/specialization-level-contents/:id" element={<SpecializationLevelContents />} />
              <Route path="/programs" element={<Programs />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </SidebarProvider>
    </AdminAuthProvider>
  );
}
