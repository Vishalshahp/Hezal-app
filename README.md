# Hezal Market — Discover Local. Shop Nearby.

> A location-based web platform connecting customers with nearby street vendors, temporary stalls, and local sellers through self-reported coordinates and direct physical navigation.

---

## 1. Project Overview

Hezal Market is designed to make roadside sellers, pushcart vendors, and temporary stall operators digitally discoverable without the burden of e-commerce checkout systems, transaction commissions, or delivery logistics.

- **Frontend**: React 18 with Vite, Tailwind CSS, and React Router.
- **Backend**: Node.js & Express REST API (ES Modules).
- **Database**: MongoDB Atlas with Mongoose ODM & GeoJSON spatial queries.
- **Scope Discipline**: Vendor discovery, published locations, and navigation links. No payments, checkout, or continuous background GPS tracking.

---

## 2. Current Status: Phase 2 Foundation Ready

Phase 2 establishes the core application skeletons, environment configurations, security headers, standardized health checks, automated test runners, and developer documentation.

### Core Features Established:
- **Client**: Vite + React 18 SPA with Tailwind CSS, design tokens, responsive layout, React Router foundation, and a live runtime system health dashboard (`StatusCard.jsx`).
- **Server**: Express REST API with modular routers, helmet, CORS, JSON limits, centralized error handling, 404 handler, and clean startup/shutdown lifecycle.
- **Database Health**: `GET /api/health/db` with real MongoDB admin ping and safe disconnected fallbacks.
- **Automated Quality**: Vitest test suites and ESLint configurations running with zero warnings across client and server.

---

## 3. Quick Start

### 1. Prerequisites
- Node.js (v18+)
- npm (v9+)
- MongoDB Atlas account OR local MongoDB running on port 27017

### 2. Clone and Setup Environment Files
```bash
# Clone the repository
git clone <repo-url> hezal-market
cd hezal-market

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

### 4. Run the Development Servers
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

## 4. Health Check Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/health` | Verifies Express API server status and uptime |
| `GET` | `/api/health/db` | Performs real round-trip admin ping against MongoDB |

Try them in your browser or terminal:
```bash
curl http://localhost:5000/api/health
curl http://localhost:5000/api/health/db
```

---

## 5. Development & Testing Commands

### Root Workspace Commands
```bash
npm run test         # Run both backend and frontend test suites
npm run lint         # Run both backend and frontend linters
```

### Server Commands (`cd server`)
```bash
npm run dev          # Start server with nodemon auto-reload
npm start            # Start production server
npm test             # Run Vitest API integration tests
npm run lint         # Run ESLint on src and tests
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
- [x] **Phase 2**: Project Foundation Setup *(Completed)*
- [ ] **Phase 3**: Accounts, Authentication & Roles
- [ ] **Phase 4**: Vendor Profile & Product Management
- [ ] **Phase 5**: Customer Discovery & Map Navigation
- [ ] **Phase 6**: Admin Moderation & Reporting
- [ ] **Phase 7**: End-to-End Testing & Deployment
