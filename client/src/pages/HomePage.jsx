import React from 'react';
import { ShieldCheck } from 'lucide-react';
import StatusCard from '../components/StatusCard';

export default function HomePage() {
  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-primary-100 text-primary-700 text-xs font-semibold">
          <ShieldCheck className="h-4 w-4" />
          <span>Phase 2: Project Foundation Ready</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight font-display">
          Hezal Market
        </h1>

        <p className="text-lg sm:text-xl text-primary-600 font-medium">
          Discover Local. Shop Nearby.
        </p>

        <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
          A hyper-local vendor discovery platform engineered to help customers discover nearby street vendors,
          stalls, and seasonal sellers through verified published locations and direct navigation.
        </p>
      </section>

      {/* Live System & Foundation Status Check */}
      <section className="space-y-4">
        <StatusCard />
      </section>

      {/* Architectural Principles & Non-Scope Boundaries Box */}
      <section className="max-w-3xl mx-auto bg-slate-100/70 border border-slate-200 rounded-xl p-6">
        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-3">
          Phase 2 Foundation Architectural Baseline
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-slate-600">
          <div className="bg-white p-3 rounded-lg border border-slate-200">
            <span className="font-semibold text-slate-900 block mb-1">Architecture</span>
            MERN stack (Vite + React, Express REST API, MongoDB Atlas, Tailwind CSS).
          </div>
          <div className="bg-white p-3 rounded-lg border border-slate-200">
            <span className="font-semibold text-slate-900 block mb-1">Core Mission</span>
            Local vendor stall discovery, published coordinates, and external navigation.
          </div>
          <div className="bg-white p-3 rounded-lg border border-slate-200">
            <span className="font-semibold text-slate-900 block mb-1">Strict Boundaries</span>
            No payment gateways, no checkout, and no continuous background GPS tracking.
          </div>
        </div>
      </section>

      {/* Roadmap Preview */}
      <section className="max-w-3xl mx-auto">
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 text-center">
          Delivery Roadmap Progress
        </h3>
        <div className="flex flex-wrap items-center justify-center gap-2 text-xs">
          <span className="px-3 py-1 rounded-full bg-slate-200 text-slate-700 line-through">
            Phase 1: Architecture & Planning
          </span>
          <span className="px-3 py-1 rounded-full bg-primary-600 text-white font-medium shadow-sm">
            Phase 2: Foundation Setup (Active)
          </span>
          <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-500">
            Phase 3: Accounts & Roles
          </span>
          <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-500">
            Phase 4: Vendor & Products
          </span>
          <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-500">
            Phase 5: Discovery & Maps
          </span>
        </div>
      </section>
    </div>
  );
}
