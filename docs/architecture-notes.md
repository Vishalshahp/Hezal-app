# Hezal Market — Architecture & Implementation Notes

This document records the architectural baseline established during **Phase 2 (Foundation)** and **Phase 3 (Authentication & Role-Based Access Control)**, detailing design decisions, module boundaries, security policies, and implementation specifics.

---

## 1. System Overview & Technology Stack

The application adheres to the approved MERN stack architecture with deliberate scope boundaries:
- **Client Tier**: React 18 SPA built with Vite 6, styled with Tailwind CSS v3, navigated via React Router v6, with central session state maintained by `AuthContext`.
- **Application Tier**: Node.js v24 + Express 4.21 configured with native ES Modules (`"type": "module"`), `cookie-parser`, `bcryptjs`, and `jsonwebtoken`.
- **Data Tier**: MongoDB Atlas accessed via Mongoose 8.10 with indexed collections, schema-level password redaction (`select: false`), and GeoJSON preparation.
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
│   ├── authController.js# Registration, login, logout, me, forgot/reset password
│   └── healthController.js # API health verification and real MongoDB admin ping
├── middleware/
│   ├── authMiddleware.js# Verifies JWT via HttpOnly cookie or Bearer header; checks accountStatus
│   ├── roleMiddleware.js# Authorizes requests based on permitted roles (customer, vendor, admin)
│   ├── errorHandler.js  # Centralized JSON error formatting (hides stacks in production)
│   └── notFoundHandler.js # Consistent 404 response for unmatched API routes
├── models/
│   └── User.js          # User schema with bcrypt password hashing and field-level security
├── routes/
│   ├── authRoutes.js    # Authentication and password recovery endpoints
│   ├── healthRoutes.js  # Routes for /api/health and /api/health/db
│   └── index.js         # Top-level API router mounting domain routers
├── scripts/
│   └── seedAdmin.js     # Controlled CLI utility for provisioning the first administrator
├── utils/
│   ├── apiResponse.js   # Standardized JSON response envelope
│   ├── logger.js        # Environment-aware console logging utility
│   └── token.js         # JWT signing, HttpOnly cookie generation, and cookie clearing
├── app.js               # Express application initialization and middleware chain
└── server.js            # Server listening and graceful shutdown (SIGINT/SIGTERM)
```

### 2.2 Frontend (`client/`)
```
client/src/
├── components/          # Reusable UI components (Navbar, Footer, StatusCard, ProtectedRoute)
├── context/             # React AuthContext providing user state and session management
├── layouts/             # Structural wrappers (MainLayout with dynamic header/footer)
├── pages/               # Route view components
│   ├── HomePage.jsx
│   ├── LoginPage.jsx
│   ├── RegisterCustomerPage.jsx
│   ├── RegisterVendorPage.jsx
│   ├── ForgotPasswordPage.jsx
│   ├── ResetPasswordPage.jsx
│   ├── UnauthorizedPage.jsx
│   ├── VendorDashboardPlaceholder.jsx
│   ├── AdminDashboardPlaceholder.jsx
│   └── NotFoundPage.jsx
├── services/            # Backend communication layer (fetchJson wrapper, authService, healthService)
├── App.jsx              # React Router route hierarchy with ProtectedRoute guards
├── index.css            # Tailwind directives and base layer styles
├── main.jsx             # React root mount with AuthProvider and BrowserRouter
└── setupTests.js        # DOM matchers setup for Vitest
```

---

## 3. Phase 3 Authentication Architecture & Security Details

### 3.1 Authentication Strategy (HttpOnly Cookies + JWT Bearer Fallback)
1. **Cookie Security**:
   - Authentication tokens are issued as signed JSON Web Tokens (`jwt.sign`) and sent in an `HttpOnly` cookie (`hezal_auth_token`).
   - `httpOnly: true`: Prevents client-side JavaScript (e.g. XSS attacks) from reading the authentication token.
   - `sameSite: 'lax'` (or `'strict'` in production): Mitigates Cross-Site Request Forgery (CSRF).
   - `secure: true`: Enforced automatically in production environments so cookies are transmitted strictly over HTTPS.
2. **Dual-Extraction Middleware (`authMiddleware.js`)**:
   - Inspects `req.cookies.hezal_auth_token` first.
   - Falls back to `req.headers.authorization` (`Bearer <token>`). This ensures seamless compatibility with automated API integration tests (Supertest) and developer tools (curl, Postman).
3. **Session Restoration (`GET /api/auth/me`)**:
   - The React application does not store sensitive tokens in `localStorage`.
   - On application startup or browser refresh, `AuthContext` calls `GET /api/auth/me`. The browser automatically includes the HttpOnly cookie, restoring the authenticated user session reliably.

### 3.2 Role-Based Access Control (RBAC) & Escalation Prevention
1. **Server-Enforced Roles**:
   - Registration endpoints strictly control role assignment:
     - `POST /api/auth/register/customer`: Hardcodes `role: 'customer'`.
     - `POST /api/auth/register/vendor`: Hardcodes `role: 'vendor'`.
   - Any client-submitted `role: "admin"` is ignored or rejected by the backend.
2. **Administrator Provisioning**:
   - Administrator accounts cannot be created via public registration.
   - The platform provides a secure script (`npm run seed:admin`) reading environment credentials to provision the root administrator.
3. **Authorization Middleware (`roleMiddleware.js`)**:
   - Routes specify allowed roles via `authorizeRoles('vendor')` or `authorizeRoles('admin')`.
   - If an authenticated customer accesses a vendor-only endpoint, the server returns HTTP `403 Forbidden` (`{ success: false, status: 'forbidden', message: 'Forbidden. Access requires...' }`).

### 3.3 Password Security & Hashing
- Passwords must be at least 8 characters long.
- Passwords are hashed using `bcryptjs` with **12 salt rounds** prior to storage.
- The `passwordHash` field has `select: false` in the Mongoose schema, preventing accidental leakage in JSON serialization or general queries.

### 3.4 Cryptographically Secure Password Recovery Flow
1. **Generic Responses**:
   - `POST /api/auth/forgot-password` returns a generic success message regardless of whether the email exists, preventing user enumeration attacks.
2. **Token Security**:
   - Generates a 32-byte cryptographic random token using `crypto.randomBytes(32).toString('hex')`.
   - The raw token is sent to the user via the reset URL (`/reset-password/:token`).
   - **Only the SHA-256 hash of the token** (`crypto.createHash('sha256').update(rawToken).digest('hex')`) is stored in the database alongside a 1-hour expiration timestamp.
3. **Token Invalidation**:
   - Once a password reset completes successfully, `resetPasswordToken` and `resetPasswordExpires` are deleted from the user document, ensuring single-use enforcement.

### 3.5 Account Status Enforcement
- If an account has `accountStatus: 'suspended'`, both `login` and `authMiddleware` immediately return HTTP `403 Forbidden` (`Your account has been suspended. Please contact platform moderation.`).

---

## 4. Role & Route Permission Matrix

| Route Path | Allowed Roles | Unauthenticated Behavior | Unauthorized Role Behavior |
| :--- | :--- | :--- | :--- |
| `/` | Public | Allowed | Allowed |
| `/login` | Public | Allowed | Redirects to home/dashboard if already signed in |
| `/register/customer` | Public | Allowed | Redirects to home if already signed in |
| `/register/vendor` | Public | Allowed | Redirects to vendor dashboard if signed in |
| `/forgot-password` | Public | Allowed | Allowed |
| `/reset-password/:token`| Public | Allowed | Allowed |
| `/vendor/dashboard` | `vendor` | Redirects to `/login` with `state: { from }` | Redirects to `/unauthorized` (HTTP 403 equivalent) |
| `/admin` | `admin` | Redirects to `/login` with `state: { from }` | Redirects to `/unauthorized` |
| `/api/auth/me` | Authenticated | HTTP 401 Unauthorized | Allowed |
| `/api/vendor/*` | `vendor` | HTTP 401 Unauthorized | HTTP 403 Forbidden |
| `/api/admin/*` | `admin` | HTTP 401 Unauthorized | HTTP 403 Forbidden |

---

## 5. Scope Boundary Compliance

Phase 3 is strictly confined to Authentication and Role-Based Access Control:
- ❌ No vendor business profile creation, stall details, or photos.
- ❌ No product catalog CRUD or category management.
- ❌ No Leaflet map pins, coordinates updates, or geospatial queries.
- ❌ No vendor approval queues or user report processing screens.
- ❌ No checkout, payments, or continuous GPS tracking.
- ✅ Full user authentication, registration, password hashing, HttpOnly cookies, RBAC route guards, and automated test coverage established.
