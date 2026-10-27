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

## 2. Current Status: Phase 3 Authentication & RBAC Ready

Phase 3 establishes the end-to-end user authentication, registration, password security, session handling, and role-based access control (RBAC).

### Core Features Established:
- **Authentication**: Separate registration portals for Customers and Vendors, login, logout, and session lookup (`GET /api/auth/me`).
- **Security**: HttpOnly cookies with CSRF mitigation (`SameSite: Lax`), bcrypt password hashing (12 rounds), and cryptographically secure SHA-256 password reset tokens.
- **Role-Based Access Control**: Strict backend protection (`authenticate` and `authorizeRoles`) and React Router route guards (`ProtectedRoute`) covering `customer`, `vendor`, and `admin` roles.
- **Role Escalation Protection**: Public registration endpoints hardcode role assignment; administrator accounts can only be provisioned via controlled CLI (`npm run seed:admin`).
- **Automated Quality**: 39 automated tests (33 server integration tests, 6 client component navigation tests) and ESLint running with zero warnings across client and server.
- **Operational Health**: Phase 2 health checks (`/api/health` and `/api/health/db`) remain fully operational.

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

### 4. Provision Initial Administrator
```bash
npm run seed:admin
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

## 4. Key Authentication Endpoints

| Method | Route | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register/customer` | Public | Registers customer account |
| `POST` | `/api/auth/register/vendor` | Public | Registers vendor merchant account |
| `POST` | `/api/auth/login` | Public | Issues HttpOnly auth cookie & JWT |
| `POST` | `/api/auth/logout` | Authenticated | Clears HttpOnly cookie |
| `GET` | `/api/auth/me` | Authenticated | Restores authenticated session |
| `POST` | `/api/auth/forgot-password` | Public | Generates secure single-use reset token |
| `POST` | `/api/auth/reset-password/:token` | Public | Verifies token and updates password |

---

## 5. Development & Testing Commands

### Root Workspace Commands
```bash
npm run test         # Run both backend and frontend test suites (39 tests)
npm run lint         # Run both backend and frontend linters (0 errors, 0 warnings)
npm run seed:admin   # Seed initial administrator account
```

### Server Commands (`cd server`)
```bash
npm run dev          # Start server with nodemon auto-reload
npm start            # Start production server
npm test             # Run Vitest API integration tests
npm run lint         # Run ESLint on src and tests
npm run seed:admin   # Seed initial administrator account
```

### Client Commands (`cd client`)
```bash
npm run dev          # Start Vite dev server on port 5173
npm run build        # Build production bundle in client/dist
npm test             # Run Vitest component tests
npm run lint         # Run ESLint on client source
```

---

## 6. Project Documentation
- Detailed Setup and Atlas Guide: [`docs/setup-guide.md`](docs/setup-guide.md)
- Architecture and Design Decisions: [`docs/architecture-notes.md`](docs/architecture-notes.md)

---

## 7. Delivery Roadmap
- [x] **Phase 1**: Design & Architecture Planning
- [x] **Phase 2**: Project Foundation Setup
- [x] **Phase 3**: Accounts, Authentication & Roles *(Completed)*
- [ ] **Phase 4**: Vendor Profile & Product Management
- [ ] **Phase 5**: Customer Discovery & Map Navigation
- [ ] **Phase 6**: Admin Moderation & Reporting
- [ ] **Phase 7**: End-to-End Testing & Deployment
