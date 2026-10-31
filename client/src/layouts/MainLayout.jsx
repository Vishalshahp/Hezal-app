import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import MobileBottomNav from '../components/MobileBottomNav';

export default function MainLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <Navbar />
      <main className="flex-1 py-6 sm:py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full pb-24 md:pb-12">
        <Outlet />
      </main>
      <Footer />
      {/* Dynamic Native-style Mobile Bottom Navigation Bar */}
      <MobileBottomNav />
    </div>
  );
}
