# Hezal Market — Discover Local. Shop Nearby.

> A location-based web platform connecting customers with nearby street vendors, temporary stalls, and local sellers through self-reported coordinates and direct physical navigation.

---

## 1. Project Overview

Hezal Market is designed to make roadside sellers, pushcart vendors, and temporary stall operators digitally discoverable without the burden of e-commerce checkout systems, transaction commissions, or delivery logistics.

- **Frontend**: React 18 with Vite, Tailwind CSS, and React Router.
- **Backend**: Node.js & Express REST API (ES Modules) with HttpOnly cookies & JWT.
- **Database**: MongoDB Atlas with Mongoose ODM & GeoJSON spatial queries.
- **Scope Discipline**: Vendor discovery, published locations, and navigation links. No payments, checkout, or continuous background GPS tracking.

---

## 2. Current Status: Phase 4 Vendor Profile & Product Management Ready

Phase 4 establishes complete stall profile management, GeoJSON Point coordinates with update timestamping, weekly operating schedules, real-time availability toggling, product catalogue CRUD with optional pricing, category taxonomy, and a multi-tier image upload service.

### Core Features Established:
- **Vendor Stall Management**: Full CRUD for business details, fixed vs mobile stall types, public contact info, address, and category assignment.
- **Geospatial Tracking**: GeoJSON `Point` coordinate storage `[longitude, latitude]` with a `2dsphere` index and explicit `locationUpdatedAt` timestamp.
- **Operating Schedule vs Availability**: Distinct separation of weekly operating schedule (Mon-Sun hours) and real-time operational status (`open`, `away`, `closed`).
- **Product Catalogue**: Full CRUD for vendor products, optional pricing for weight/seasonal items, and real-time stock availability toggling.
- **Media Upload Pipeline**: In-memory validation (5MB, JPEG/PNG/WebP) with dual-mode storage (Cloudinary cloud storage with automatic local `/uploads/` fallback).
- **Public Visibility Boundary**: Profiles default to `pending` status. Public endpoints return HTTP 404 for unapproved stalls, while allowing owners and administrators to preview drafts.
- **Automated Quality**: 67 automated tests (59 server integration tests, 8 client component navigation tests) and ESLint running with zero warnings across client and server.
- **Operational Health**: Phase 2 health checks (`/api/health` and `/api/health/db`) and Phase 3 auth checks remain 100% operational.

---

## 3. Quick Start

### 1. Prerequisites
- Node.js (v18+)
- npm (v9+)
- MongoDB Atlas account OR local MongoDB running on port 27017

### 2. Setup Environment Files
```bash
# Setup Backend Environment
cp server/.env.example server/.env

# Setup Frontend Environment
cp client/.env.example client/.env
```

### 3. Install Dependencies
```bash
# Install Server Dependencies
cd server && npm install

# Install Client Dependencies
cd ../client && npm install
```

### 4. Seed Initial Data
```bash
# Provision initial platform administrator
npm run seed:admin

# Seed 8 core marketplace categories
npm run seed:categories
```

### 5. Run the Development Servers
In Terminal 1 (Backend):
```bash
cd server
npm run dev
# Server runs at http://localhost:5000
```

In Terminal 2 (Frontend):
```bash
cd client
npm run dev
# Client runs at http://localhost:5173
```

---

## 4. Key Endpoints

| Method | Route | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register/customer` | Public | Registers customer account |
| `POST` | `/api/auth/register/vendor` | Public | Registers vendor merchant account |
| `POST` | `/api/auth/login` | Public | Issues HttpOnly auth cookie & JWT |
| `POST` | `/api/auth/logout` | Authenticated | Clears HttpOnly cookie |
| `GET` | `/api/auth/me` | Authenticated | Restores authenticated session |
| `GET` | `/api/categories` | Public | Returns marketplace taxonomy categories |
| `GET` | `/api/vendor/profile` | Vendor | Fetches vendor stall profile & stats |
| `PUT` | `/api/vendor/profile` | Vendor | Updates stall profile details |
| `PUT` | `/api/vendor/location` | Vendor | Updates stall coordinates & operating schedule |
| `PUT` | `/api/vendor/availability` | Vendor | Updates manual status (`open`, `away`, `closed`) |
| `POST` | `/api/vendor/upload` | Vendor | Uploads stall cover/gallery images |
| `GET` | `/api/vendor/dashboard/stats` | Vendor | Returns profile completeness & catalogue metrics |
| `GET` | `/api/products/my` | Vendor | Lists all products belonging to the vendor |
| `POST` | `/api/products` | Vendor | Adds new product to catalogue |
| `PUT` | `/api/products/:id` | Vendor | Updates existing product (ownership enforced) |
| `DELETE`| `/api/products/:id` | Vendor | Removes product from catalogue |
| `PATCH`| `/api/products/:id/availability` | Vendor | Toggles product stock availability |
| `POST` | `/api/products/upload` | Vendor | Uploads product image |
| `GET` | `/api/vendors/:id` | Public / Gated | Returns stall profile (404 if pending/rejected) |

---

## 5. Development & Testing Commands

### Root Workspace Commands
```bash
npm run test            # Run both backend and frontend test suites (67 tests)
npm run lint            # Run both backend and frontend linters (0 errors, 0 warnings)
npm run seed:admin      # Seed initial administrator account
npm run seed:categories # Seed marketplace category taxonomy
```

### Server Commands (`cd server`)
```bash
npm run dev             # Start server with nodemon auto-reload
npm start               # Start production server
npm test                # Run Vitest API integration tests (59 tests)
npm run lint            # Run ESLint on src and tests
npm run seed:admin      # Seed initial administrator account
npm run seed:categories # Seed marketplace category taxonomy
```

### Client Commands (`cd client`)
```bash
npm run dev             # Start Vite dev server on port 5173
npm run build           # Build production bundle in client/dist
npm test                # Run Vitest component tests (8 tests)
npm run lint            # Run ESLint on client source
```

---

## 6. Project Documentation
- Detailed Setup and Atlas Guide: [`docs/setup-guide.md`](docs/setup-guide.md)
- Architecture and Design Decisions: [`docs/architecture-notes.md`](docs/architecture-notes.md)

---

## 7. Delivery Roadmap
- [x] **Phase 1**: Design & Architecture Planning
- [x] **Phase 2**: Project Foundation Setup
- [x] **Phase 3**: Accounts, Authentication & Roles
- [x] **Phase 4**: Vendor Profile & Product Management *(Completed)*
- [ ] **Phase 5**: Customer Discovery & Map Navigation
- [ ] **Phase 6**: Admin Moderation & Reporting
- [ ] **Phase 7**: End-to-End Testing & Deployment
