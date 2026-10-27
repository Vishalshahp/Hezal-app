import React from 'react';
import { Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import HomePage from './pages/HomePage';
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
import AdminDashboardPlaceholder from './pages/AdminDashboardPlaceholder';
import NotFoundPage from './pages/NotFoundPage';
import ProtectedRoute from './components/ProtectedRoute';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<MainLayout />}>
        {/* Public Routes */}
        <Route index element={<HomePage />} />
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
              <AdminDashboardPlaceholder />
            </ProtectedRoute>
          }
        />

        {/* Catch-all 404 handler */}
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
