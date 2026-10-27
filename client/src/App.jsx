import React from 'react';
import { Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import HomePage from './pages/HomePage';
import NotFoundPage from './pages/NotFoundPage';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<MainLayout />}>
        {/* Foundation Landing / Health Dashboard */}
        <Route index element={<HomePage />} />

        {/* Future routes placeholder structure for planned phases */}
        {/* <Route path="explore" element={<ExplorePage />} /> */}
        {/* <Route path="vendors/:id" element={<VendorDetailPage />} /> */}
        {/* <Route path="login" element={<LoginPage />} /> */}
        {/* <Route path="vendor/*" element={<VendorPortal />} /> */}
        {/* <Route path="admin/*" element={<AdminPortal />} /> */}

        {/* Catch-all 404 handler */}
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
