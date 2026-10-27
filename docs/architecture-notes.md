# Hezal Market — Architecture & Implementation Notes

This document records the architectural baseline established during **Phase 2: Project Foundation Setup**, detailing design decisions, module boundaries, security policies, and any refinements relative to the Phase 1 blueprint.

---

## 1. System Overview & Technology Stack

The application adheres to the approved MERN stack architecture with deliberate scope boundaries:
- **Client Tier**: React 18 SPA built with Vite 6, styled with Tailwind CSS v3, and navigated via React Router v6.
- **Application Tier**: Node.js v24 + Express 4.21 configured with native ES Modules (`"type": "module"`).
- **Data Tier**: MongoDB Atlas accessed via Mongoose 8.10 with connection resilience and GeoJSON indexing support.
- **Testing & Quality**: Vitest 3 + Supertest (Server) and Vitest + React Testing Library (Client), with ESLint 9 (Flat config).

---

## 2. Directory Architecture & Responsibilities

### 2.1 Backend (`server/`)
```
server/src/
├── config/
│   ├── env.js           # Environment variable loading, validation, and safe defaults
│   └── db.js            # Mongoose connection management, timeouts, and event listeners
├── controllers/
│   └── healthController.js # API health verification and real MongoDB admin ping
├── middleware/
│   ├── errorHandler.js  # Centralized JSON error formatting (hides stacks in production)
│   └── notFoundHandler.js # Consistent 404 response for unmatched API routes
├── routes/
│   ├── healthRoutes.js  # Routes for /api/health and /api/health/db
│   └── index.js         # Top-level API router for modular route mounting
├── utils/
│   ├── apiResponse.js   # Standardized JSON response envelope
│   └── logger.js        # Environment-aware console logging utility
├── app.js               # Express application initialization and middleware chain
└── server.js            # Server listening and graceful shutdown (SIGINT/SIGTERM)
```

### 2.2 Frontend (`client/`)
```
client/src/
├── components/          # Reusable presentation and utility components (Navbar, Footer, StatusCard)
├── layouts/             # Structural wrappers (MainLayout with header/footer)
├── pages/               # Route view components (HomePage, NotFoundPage)
├── services/            # Backend communication layer (fetchJson wrapper, healthService)
├── App.jsx              # React Router route hierarchy
├── index.css            # Tailwind directives and base layer styles
├── main.jsx             # React entry point with BrowserRouter
└── setupTests.js        # DOM matchers setup for Vitest
```

---

## 3. Key Design Decisions & Implementation Mechanics

### 3.1 Separation of `app.js` and `server.js`
In the backend, application assembly (`app.js`) is decoupled from network binding and database connection (`server.js`). This enables Supertest integration tests to import and query `app` without binding to a physical port or initiating external network calls.

### 3.2 Real Database Connectivity Check (`/api/health/db`)
A common architectural pitfall is reporting a healthy database simply because the Mongoose driver object exists. Hezal Market's health check implements a two-tier verification:
1. **Connection State Check**: Validates that `mongoose.connection.readyState === 1` (connected). If not connected, it immediately responds with `503 Service Unavailable`.
2. **Round-Trip Admin Ping**: When connected, it executes an actual round-trip command:
   ```javascript
   await mongoose.connection.db.admin().ping();
   ```
If MongoDB is unreachable, the endpoint returns a clean `503` without leaking credentials, connection URIs, or internal stack traces.

### 3.3 Non-Blocking Server Initialization
If the database connection fails on startup (e.g. invalid Atlas credentials or offline local daemon), the server logs an actionable development error and continues running. This ensures that frontend developers can still use and test API routes and see exact status indicators on the client dashboard.

### 3.4 Strict CORS and Security Policy
- `helmet` is active on all Express routes.
- `cors` allows requests from the configured `FRONTEND_URL` (`http://localhost:5173` by default) with support for credentials.
- Request body sizes are capped at `10kb` to protect against payload flooding attacks.

### 3.5 Design System Tokens in Tailwind CSS
The client's `tailwind.config.js` implements the Phase 1 color system:
- **Brand Green (Primary)**: `#16a34a` (500), `#15803d` (600), `#166534` (700)
- **Market Amber (Secondary)**: `#f59e0b` (500)
- **Background Slate**: `#f8fafc`

---

## 4. Phase 1 Design Alignment & Justified Deviations

| Planned Item | Phase 2 Implementation | Status | Justification / Notes |
| :--- | :--- | :--- | :--- |
| ES Modules | Used `"type": "module"` across both client and server | Aligned | Modern Node.js standard; seamless compatibility with Vite and Vitest. |
| Health Endpoints | `GET /api/health` and `GET /api/health/db` | Aligned | Fully matches Phase 1 contract with database ping verification. |
| Status Card | `StatusCard.jsx` embedded on placeholder homepage | Aligned | Live health poller verifying Express and MongoDB connectivity. |
| Flat ESLint | ESLint 9 Flat Config (`eslint.config.js`) | Refinement | Updated from legacy `.eslintrc.json` to modern standard supported by ESLint v9+. |
| Route Placeholders | Modular route structure in `client/src/App.jsx` and `server/src/routes/index.js` | Aligned | Ready for Phase 3 (Auth & Roles) without pre-implementing future logic. |

---

## 5. Scope Boundary Compliance

Phase 2 remains strictly confined to foundational architecture:
- ❌ No customer/vendor registration or login logic.
- ❌ No JWT issuance or password hashing.
- ❌ No vendor profile or product schemas.
- ❌ No map tiles or Leaflet components.
- ❌ No checkout, cart, or payment features.
- ✅ Full foundation, testing, linting, and health verification established.
