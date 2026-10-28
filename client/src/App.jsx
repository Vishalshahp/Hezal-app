import React from 'react';
import { Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import HomePage from './pages/HomePage';
import ExplorePage from './pages/ExplorePage';
import PublicVendorProfilePage from './pages/PublicVendorProfilePage';
import LoginPage from './pages/LoginPage';
import RegisterCustomerPage from './pages/RegisterCustomerPage';
import RegisterVendorPage from './pages/RegisterVendorPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import UnauthorizedPage from './pages/UnauthorizedPage';
import VendorDashboard from './pages/VendorDashboard';
import VendorProfilePage from './pages/VendorProfilePage';
import VendorLocationPage from './pages/VendorLocationPage';
import VendorProductsPage from './pages/VendorProductsPage';
import AdminDashboard from './pages/AdminDashboard';
import AdminVendorsPage from './pages/AdminVendorsPage';
import AdminCategoriesPage from './pages/AdminCategoriesPage';
import AdminReportsPage from './pages/AdminReportsPage';
import AdminUsersPage from './pages/AdminUsersPage';
import NotFoundPage from './pages/NotFoundPage';
import ProtectedRoute from './components/ProtectedRoute';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<MainLayout />}>
        {/* Public Routes */}
        <Route index element={<HomePage />} />
        <Route path="explore" element={<ExplorePage />} />
        <Route path="vendors/:id" element={<PublicVendorProfilePage />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="register/customer" element={<RegisterCustomerPage />} />
        <Route path="register/vendor" element={<RegisterVendorPage />} />
        <Route path="forgot-password" element={<ForgotPasswordPage />} />
        <Route path="reset-password/:token" element={<ResetPasswordPage />} />
        <Route path="unauthorized" element={<UnauthorizedPage />} />

        {/* Vendor Protected Management Routes */}
        <Route
          path="vendor/dashboard"
          element={
            <ProtectedRoute allowedRoles={['vendor']}>
              <VendorDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="vendor/profile"
          element={
            <ProtectedRoute allowedRoles={['vendor']}>
              <VendorProfilePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="vendor/location"
          element={
            <ProtectedRoute allowedRoles={['vendor']}>
              <VendorLocationPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="vendor/products"
          element={
            <ProtectedRoute allowedRoles={['vendor']}>
              <VendorProductsPage />
            </ProtectedRoute>
          }
        />

        {/* Administrator Protected Routes */}
        <Route
          path="admin"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="admin/vendors"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminVendorsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="admin/categories"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminCategoriesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="admin/reports"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminReportsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="admin/users"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminUsersPage />
            </ProtectedRoute>
          }
        />

        {/* Catch-all 404 handler */}
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
