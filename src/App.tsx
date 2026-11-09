import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from '@/src/contexts/AuthContext';
import { Navbar } from '@/src/components/layout/Navbar';
import { Footer } from '@/src/components/layout/Footer';
import { ProtectedRoute } from '@/src/components/common/ProtectedRoute';
import { AdminRoute } from '@/src/components/common/AdminRoute';

// Public & User Pages
import { HomePage } from '@/src/pages/Home/HomePage';
import { LoginPage } from '@/src/pages/Login/LoginPage';
import { FindBloodPage } from '@/src/pages/FindBlood/FindBloodPage';
import { DonorRegistrationPage } from '@/src/pages/DonorRegistration/DonorRegistrationPage';
import { BloodRequestPage } from '@/src/pages/BloodRequest/BloodRequestPage';
import { AboutPage } from '@/src/pages/About/AboutPage';
import { PrivacyPage } from '@/src/pages/Privacy/PrivacyPage';
import { TermsPage } from '@/src/pages/Terms/TermsPage';
import { DashboardPage } from '@/src/pages/Dashboard/DashboardPage';
import { NotificationsPage } from '@/src/pages/Notifications/NotificationsPage';
import { MyRequestsPage } from '@/src/pages/MyRequests/MyRequestsPage';

// Admin Dashboard Pages
import { AdminLayout } from '@/src/pages/Admin/AdminLayout';
import { AdminOverviewPage } from '@/src/pages/Admin/AdminOverviewPage';
import { AdminUsersPage } from '@/src/pages/Admin/AdminUsersPage';
import { AdminDonorsPage } from '@/src/pages/Admin/AdminDonorsPage';
import { AdminRequestsPage } from '@/src/pages/Admin/AdminRequestsPage';
import { AdminBlueVerificationPage } from '@/src/pages/Admin/AdminBlueVerificationPage';
import { AdminDonationsPage } from '@/src/pages/Admin/AdminDonationsPage';
import { AdminReportsPage } from '@/src/pages/Admin/AdminReportsPage';
import { AdminAuditLogsPage } from '@/src/pages/Admin/AdminAuditLogsPage';
import { AdminSettingsPage } from '@/src/pages/Admin/AdminSettingsPage';

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

function MainAppLayout() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <div className="min-h-screen flex flex-col bg-white text-[#252525] font-sans antialiased selection:bg-[#FCE8E8] selection:text-[#C62828]">
      {!isAdminRoute && <Navbar />}
      
      <main className="flex-1 flex flex-col">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/find-blood" element={<FindBloodPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/terms" element={<TermsPage />} />

          {/* Protected Routes requiring authentication */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/my-requests" 
            element={
              <ProtectedRoute>
                <MyRequestsPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/notifications" 
            element={
              <ProtectedRoute>
                <NotificationsPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/donor-registration" 
            element={
              <ProtectedRoute>
                <DonorRegistrationPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/blood-request" 
            element={
              <ProtectedRoute>
                <BloodRequestPage />
              </ProtectedRoute>
            } 
          />

          {/* Admin Command Console Nested Routes */}
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminLayout />
              </AdminRoute>
            }
          >
            <Route index element={<AdminOverviewPage />} />
            <Route path="users" element={<AdminUsersPage />} />
            <Route path="donors" element={<AdminDonorsPage />} />
            <Route path="requests" element={<AdminRequestsPage />} />
            <Route path="blue-verification" element={<AdminBlueVerificationPage />} />
            <Route path="donations" element={<AdminDonationsPage />} />
            <Route path="reports" element={<AdminReportsPage />} />
            <Route path="audit-logs" element={<AdminAuditLogsPage />} />
            <Route path="settings" element={<AdminSettingsPage />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<HomePage />} />
        </Routes>
      </main>

      {!isAdminRoute && <Footer />}
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ScrollToTop />
        <MainAppLayout />
      </AuthProvider>
    </BrowserRouter>
  );
}
