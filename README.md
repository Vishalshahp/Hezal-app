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

## 2. Current Status: Phase 5 Customer Discovery & Interactive Maps Ready

Phase 5 establishes a complete, full-stack customer discovery experience: public keyword search, product-assisted stall matching, category browsing, ephemeral browser geolocation, manual locality search, geospatial radial querying using MongoDB `$geoNear`, interactive map exploration via React Leaflet with OpenStreetMap tiles, and walking directions to published stall locations.

### Core Features Established:
- **Public Homepage**: Dynamic hero search, popular categories grid, featured verified stalls with live backend data, quick "Near Me" detection, and vendor recruitment banner.
- **Unified Explore Page (`/explore`)**: Debounced keyword and area search, category pills, radius selector (1km–25km), view layout toggles (Split, List, Map), and live synchronization between list cards and map pins.
- **Geospatial Discovery (`GET /api/vendors/nearby`)**: Bounded radial search using MongoDB `$geoNear` aggregation on the `2dsphere` index with spherical distance calculation in meters.
- **Product-Assisted Search**: Customers searching for product keywords (e.g. "Pani Puri" or "Clay Pot") discover all stalls selling those items, with sample products previewed directly on the stall card.
- **Interactive Maps (React Leaflet)**: OpenStreetMap tile integration, custom DivIcon HTML pins with pulse/highlight effects, stall popups with thumbnail, badges, address, and profile links.
- **External Walking Directions**: Directions buttons format coordinates `lat,lng` straight to Google Maps / navigation apps with explicit disclaimers regarding published schedules.
- **Public Stall Profiles (`/vendors/:id`)**: Comprehensive stall presentation with banner photo, category badges, operating hours table, mini-map, and full searchable product catalogue.
- **Automated Quality**: **91 automated tests** (76 server integration tests, 15 client component and discovery tests) and ESLint running with zero warnings across client and server.

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

# Seed realistic approved sample stalls in Ahmedabad (for dev & testing)
npm run seed:vendors
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
| `GET` | `/api/vendors` | Public | Search approved stalls by keyword, area, or category |
| `GET` | `/api/vendors/nearby` | Public | Geospatial radius discovery (`$geoNear`) with distance |
| `GET` | `/api/vendors/:id` | Public / Gated | Public stall profile with active products (404 if pending) |
| `GET` | `/api/categories` | Public | Returns marketplace taxonomy categories |
| `POST` | `/api/auth/register/customer` | Public | Registers customer account |
| `POST` | `/api/auth/register/vendor` | Public | Registers vendor merchant account |
| `POST` | `/api/auth/login` | Public | Issues HttpOnly auth cookie & JWT |
| `POST` | `/api/auth/logout` | Authenticated | Clears HttpOnly cookie |
| `GET` | `/api/auth/me` | Authenticated | Restores authenticated session |
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

---

## 5. Development & Testing Commands

### Root Workspace Commands
```bash
npm run test            # Run both backend and frontend test suites (91 tests)
npm run lint            # Run both backend and frontend linters (0 errors, 0 warnings)
npm run seed:admin      # Seed initial administrator account
npm run seed:categories # Seed marketplace category taxonomy
npm run seed:vendors    # Seed sample approved vendors
```

### Server Commands (`cd server`)
```bash
npm run dev             # Start server with nodemon auto-reload
npm start               # Start production server
npm test                # Run Vitest API integration tests (76 tests)
npm run lint            # Run ESLint on src and tests
npm run seed:admin      # Seed initial administrator account
npm run seed:categories # Seed marketplace category taxonomy
npm run seed:vendors    # Seed sample approved vendors
```

### Client Commands (`cd client`)
```bash
npm run dev             # Start Vite dev server on port 5173
npm run build           # Build production bundle in client/dist
npm test                # Run Vitest component tests (15 tests)
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
- [x] **Phase 4**: Vendor Profile & Product Management
- [x] **Phase 5**: Customer Discovery & Map Navigation *(Completed)*
- [ ] **Phase 6**: Admin Moderation & Reporting
- [ ] **Phase 7**: End-to-End Testing & Deployment
