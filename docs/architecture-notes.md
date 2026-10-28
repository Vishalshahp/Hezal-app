# Hezal Market — Architecture & Implementation Notes

This document records the architectural baseline established across **Phase 2 (Foundation)**, **Phase 3 (Authentication & Role-Based Access Control)**, **Phase 4 (Vendor Profile & Products)**, and **Phase 5 (Customer Discovery, Search & Interactive Maps)**, detailing design decisions, module boundaries, security policies, and implementation specifics.

---

## 1. System Overview & Technology Stack

The application adheres to the approved MERN stack architecture with deliberate scope boundaries:
- **Client Tier**: React 18 SPA built with Vite 6, styled with Tailwind CSS v3, navigated via React Router v6, with central session state maintained by `AuthContext`. Maps integrated via `leaflet` 1.9 and `react-leaflet` 4.2 with OpenStreetMap tiles.
- **Application Tier**: Node.js v24 + Express 4.21 configured with native ES Modules (`"type": "module"`), `cookie-parser`, `bcryptjs`, `jsonwebtoken`, and `multer`.
- **Media Tier**: Dual-mode image storage service supporting Cloudinary cloud storage and automatic local file storage under `server/uploads/`.
- **Data Tier**: MongoDB Atlas accessed via Mongoose 8.10 with indexed collections, 2dsphere geospatial coordinates, and schema-level security.
- **Testing & Quality**: Vitest 3 + Supertest (Server) and Vitest + React Testing Library (Client), with ESLint 9 (Flat config).

---

## 2. Directory Architecture & Responsibilities

### 2.1 Backend (`server/`)
```
server/
├── uploads/             # Local file fallback when Cloudinary credentials are not set
├── src/
│   ├── config/
│   │   ├── env.js       # Environment variable validation, defaults, and Cloudinary keys
│   │   └── db.js        # Mongoose connection management, timeouts, and event listeners
│   ├── controllers/
│   │   ├── authController.js         # Register, login, logout, me, forgot/reset password
│   │   ├── healthController.js       # API health verification and MongoDB admin ping
│   │   ├── categoryController.js     # Category taxonomy retrieval
│   │   ├── vendorProfileController.js# Vendor profile, coordinates, availability, and stats
│   │   ├── productController.js      # Product catalogue CRUD and stock availability
│   │   └── discoveryController.js    # Public search, nearby geospatial aggregation, stall profile
│   ├── middleware/
│   │   ├── authMiddleware.js         # Verifies JWT via HttpOnly cookie or Bearer header
│   │   ├── roleMiddleware.js         # Authorizes requests based on permitted roles
│   │   ├── uploadMiddleware.js       # Multer memory storage and file type/size validation
│   │   ├── errorHandler.js           # Centralized JSON error formatting
│   │   └── notFoundHandler.js        # Consistent 404 response for unmatched API routes
│   ├── models/
│   │   ├── User.js                   # User account schema with bcrypt password hashing
│   │   ├── Category.js               # Category taxonomy schema with slug and icon
│   │   ├── VendorProfile.js          # Stall profile schema with GeoJSON Point & schedule
│   │   └── Product.js                # Product catalogue schema with vendorId & optional price
│   ├── routes/
│   │   ├── authRoutes.js             # Authentication endpoints
│   │   ├── healthRoutes.js           # Health check endpoints
│   │   ├── categoryRoutes.js         # Public category endpoints
│   │   ├── vendorRoutes.js           # Protected vendor stall management endpoints
│   │   ├── productRoutes.js          # Protected product catalogue endpoints
│   │   ├── publicVendorRoutes.js     # Public vendor search, nearby, and stall profile routes
│   │   └── index.js                  # Top-level API router mounting all domain routers
│   ├── scripts/
│   │   ├── seedAdmin.js              # Provision root administrator account
│   │   ├── seedCategories.js         # Seed 8 core marketplace taxonomy categories
│   │   └── seedSampleVendors.js      # Seed realistic approved stalls in Ahmedabad
│   ├── services/
│   │   └── imageService.js           # Image storage abstraction (Cloudinary / Local)
│   ├── utils/
│   │   ├── apiResponse.js            # Standardized JSON response envelope
│   │   ├── logger.js                 # Environment-aware console logging utility
│   │   └── token.js                  # JWT signing, cookie generation, and cookie clearing
│   ├── app.js                        # Express app assembly, static uploads, and middleware
│   └── server.js                     # Server listening and graceful shutdown
└── tests/
    ├── auth.test.js                  # Auth, registration, session, and RBAC tests
    ├── vendor.test.js                # Vendor profile, products, location, and upload tests
    ├── discovery.test.js             # Public search, product matching, and $geoNear tests
    ├── health.test.js                # Health check endpoint tests
    └── errors.test.js                # 404 handler and error response tests
```

### 2.2 Frontend (`client/`)
```
client/src/
├── components/          # Reusable UI (Navbar, Footer, StatusCard, ProtectedRoute, VendorCard, InteractiveMap)
├── context/             # React AuthContext providing user state and session management
├── layouts/             # Structural wrappers (MainLayout with dynamic header/footer)
├── pages/               # Route view components
│   ├── HomePage.jsx                  # Dynamic landing page with hero search, categories, and stalls
│   ├── ExplorePage.jsx               # Unified search, radius filters, interactive map & list
│   ├── PublicVendorProfilePage.jsx   # Public stall showcase, operating hours, mini-map, products
│   ├── LoginPage.jsx
│   ├── RegisterCustomerPage.jsx
│   ├── RegisterVendorPage.jsx
│   ├── ForgotPasswordPage.jsx
│   ├── ResetPasswordPage.jsx
│   ├── UnauthorizedPage.jsx
│   ├── VendorDashboard.jsx
│   ├── VendorProfilePage.jsx
│   ├── VendorLocationPage.jsx
│   ├── VendorProductsPage.jsx
│   ├── AdminDashboardPlaceholder.jsx
│   └── NotFoundPage.jsx
├── services/            # API client layers (api.js, authService, vendorService, productService)
├── App.jsx              # React Router route hierarchy with discovery routes and guards
├── index.css            # Tailwind directives and Leaflet map CSS
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

## 4. Phase 4 Vendor Profile, Products & Stall Information Architecture

### 4.1 Schema Modeling & Data Boundaries
1. **Separation of Account vs Business Profile**:
   - `User`: Handles identity, credentials, role, and authentication status.
   - `VendorProfile`: 1-to-1 relationship with `User` via `userId` (unique index). Contains stall name, stall type, public contact information, address, GeoJSON location coordinates, opening hours, manual availability, and administrative approval status (`pending`, `approved`, `rejected`).
   - `Product`: Many-to-1 relationship with `VendorProfile` via `vendorId`. Products have an optional `price` field (allowing null for variable/weight items) and a stock availability toggle (`isAvailable`).
   - `Category`: Pre-seeded marketplace taxonomy with slug and icon.

2. **Geospatial Coordinate Representation (GeoJSON Point)**:
   - Location is stored following MongoDB GeoJSON standards:
     ```json
     {
       "type": "Point",
       "coordinates": [longitude, latitude]
     }
     ```
   - Indexed via a `2dsphere` index on `location`.
   - **Order Rule**: Longitude first (-180 to 180), Latitude second (-90 to 90).
   - `locationUpdatedAt` timestamp is explicitly updated whenever coordinates change, enabling customers to see staleness in subsequent discovery phases.

3. **Stall Types & Availability Distinctions**:
   - `stallType`: Either `'fixed'` (permanent kiosk/shop) or `'mobile'` (pushcart, temporary food truck, roaming fruit cart).
   - `openingHours`: Structured weekly schedule (`monday` through `sunday`, with `isOpen`, `open`, `close` times).
   - `availabilityStatus`: Manual real-time status (`open`, `away`, `closed`) controllable instantly by the vendor independent of their weekly schedule.

4. **Multi-Tier Media Storage Architecture**:
   - Multi-part uploads handled in-memory using `multer` with a 5MB maximum file size limit and MIME validation (`image/jpeg`, `image/png`, `image/webp`).
   - `imageService`: Checks for Cloudinary environment variables. If present, uploads via Cloudinary stream API; if missing, writes to `server/uploads/` on the local filesystem and generates full server URLs.
   - Helmet configured with `crossOriginResourcePolicy: { policy: 'cross-origin' }` to allow frontend preview of local uploads.

5. **Access Control & Public Visibility Enforcement**:
   - Vendors can only modify and delete products linked to their own vendor profile. Any attempt to modify another vendor's product returns HTTP `403 Forbidden`.
   - Vendors cannot tamper with their own `approvalStatus` or set it to `approved`.
   - **Public Profile Guard**: `GET /api/vendors/:id` returns HTTP `404 Not Found` for pending or rejected profiles to public visitors, but gracefully permits viewing for the authenticated profile owner or an administrator.

---

## 5. Phase 5 Customer Discovery, Search & Interactive Map Architecture

### 5.1 Geospatial Query Strategy (`$geoNear` on `2dsphere` Index)
- Discovery by proximity utilizes MongoDB's native aggregation pipeline operator `$geoNear` as the mandatory first pipeline stage.
- Supported by the `2dsphere` index on `VendorProfile.location`.
- Query structure:
  ```javascript
  {
    $geoNear: {
      near: { type: 'Point', coordinates: [parsedLng, parsedLat] },
      distanceField: 'distance', // calculated distance in meters
      maxDistance: radiusInKm * 1000,
      spherical: true,
      query: { approvalStatus: 'approved', userId: { $in: activeUserIds } }
    }
  }
  ```
- Longitude and latitude bounds are validated on server (-180 to 180 for longitude, -90 to 90 for latitude). Missing or invalid inputs return HTTP `400 Bad Request`.
- Output distances are converted to kilometers (`distanceKm`) for human-readable display on result cards and map pins.

### 5.2 Product-Assisted Discovery
- Public search accepts query string `q`.
- In addition to regex matching across stall names, descriptions, and address fields, the backend queries `Product` documents matching `q` (`$regex: q, $options: 'i'`) and collects distinct matching `vendorId`s.
- This ensures customers searching for "Pani Puri", "Kulhad", or "Mango" discover all nearby vendors stocking those items, even if the keyword isn't in the stall's title.
- Each vendor result card is enriched with live product count and up to 3 sample in-stock products.

### 5.3 Location Permission & Ephemeral Coordinates
- Customer location is requested strictly upon user action ("Find Stalls Near Me" / "Use My Current Location") via standard HTML5 Geolocation.
- Coordinates are never stored in the database, never linked to user accounts, and never transmitted to third-party trackers.
- If permission is denied or unavailable, the user can continue seamless discovery via text-based locality/area search.

### 5.4 Leaflet Interactive Map Architecture
- Interactive map is powered by React Leaflet v4 (`leaflet@1.9.4` and `react-leaflet@4.2.1`) using OpenStreetMap standard tile servers (`https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png`).
- Tiles are properly attributed: `&copy; OpenStreetMap contributors`.
- Leaflet markers are created using custom `L.divIcon` HTML pins (avoiding missing marker asset 404s common in Vite bundlers).
- Selecting a stall card flies the map camera to the vendor's coordinates and opens the marker popup; clicking a pin on the map synchronizes the list view.
- Provides Split, List, and Map layout modes on desktop, with mobile-responsive view switching.

### 5.5 External Directions to Published Stall Location
- Vendor cards and public stall profiles provide a direct navigation button:
  `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`
- Coordinate order `destination=lat,lng` is verified.
- Clear disclaimer is communicated: Directions guide shoppers to the vendor's self-reported coordinates and do not guarantee live physical presence outside their published operating schedule.

---

## 6. Role & Route Permission Matrix

| Route Path | Allowed Roles | Unauthenticated Behavior | Unauthorized Role Behavior |
| :--- | :--- | :--- | :--- |
| `/` | Public | Allowed | Allowed |
| `/explore` | Public | Allowed | Allowed |
| `/vendors/:id` | Public / Gated | Allowed if approved (404 if pending/suspended) | Allowed if approved |
| `/login` | Public | Allowed | Redirects to home/dashboard if already signed in |
| `/register/customer` | Public | Allowed | Redirects to home if already signed in |
| `/register/vendor` | Public | Allowed | Redirects to vendor dashboard if signed in |
| `/forgot-password` | Public | Allowed | Allowed |
| `/reset-password/:token`| Public | Allowed | Allowed |
| `/vendor/dashboard` | `vendor` | Redirects to `/login` with `state: { from }` | Redirects to `/unauthorized` (HTTP 403) |
| `/vendor/profile` | `vendor` | Redirects to `/login` with `state: { from }` | Redirects to `/unauthorized` |
| `/vendor/location` | `vendor` | Redirects to `/login` with `state: { from }` | Redirects to `/unauthorized` |
| `/vendor/products` | `vendor` | Redirects to `/login` with `state: { from }` | Redirects to `/unauthorized` |
| `/admin` | `admin` | Redirects to `/login` with `state: { from }` | Redirects to `/unauthorized` |
| `/admin/vendors` | `admin` | Redirects to `/login` with `state: { from }` | Redirects to `/unauthorized` |
| `/admin/categories` | `admin` | Redirects to `/login` with `state: { from }` | Redirects to `/unauthorized` |
| `/admin/reports` | `admin` | Redirects to `/login` with `state: { from }` | Redirects to `/unauthorized` |
| `/admin/users` | `admin` | Redirects to `/login` with `state: { from }` | Redirects to `/unauthorized` |
| `/api/categories` | Public | Allowed | Allowed |
| `/api/reports` | Public | Allowed (POST) | Allowed (POST) |
| `/api/vendors` | Public | Allowed (returns approved vendors only) | Allowed |
| `/api/vendors/nearby` | Public | Allowed (returns approved vendors within radius) | Allowed |
| `/api/vendors/:id` | Public / Gated | Returns 404 if unapproved/suspended | Returns 404 if unapproved/suspended |
| `/api/vendor/*` | `vendor` | HTTP 401 Unauthorized | HTTP 403 Forbidden |
| `/api/products/*` | `vendor` | HTTP 401 Unauthorized | HTTP 403 Forbidden |
| `/api/admin/*` | `admin` | HTTP 401 Unauthorized | HTTP 403 Forbidden |

---

## 7. Scope Boundary Compliance

Phase 6 is strictly confined to Administration, Vendor Moderation, Category Governance, User Management, and Listing Moderation:
- ❌ No online checkout, payments, or commission fee billing.
- ❌ No delivery logistics or fulfillment dispatching.
- ❌ No customer ratings or numerical reviews.
- ❌ No customer-vendor live chat or continuous background GPS tracking.
- ✅ Full administrator dashboard with real aggregated database metrics.
- ✅ Multi-status vendor review queue (`pending`, `approved`, `changes_requested`, `suspended`, `rejected`) with reason enforcement.
- ✅ Category management with usage counts and referential integrity protection.
- ✅ Public community report submission and administrator adjudication with optional vendor suspension.
- ✅ User management with suspension/restoration controls and self-lockout safeguards.
- ✅ Immutable audit logging (`AuditLog`) for all administrative actions.

---

## 8. Phase 6 Administration & Listing Moderation Architecture

### 8.1 Real Calculated Database Metrics
- The `GET /api/admin/metrics` endpoint avoids static or estimated values.
- Metrics are calculated using parallel Mongoose `countDocuments` operations across `User`, `VendorProfile`, `Product`, `Category`, and `Report` collections.
- Accurately tracks accounts by role (`customer`, `vendor`, `admin`), stall approval states (`pending`, `approved`, `changes_requested`, `suspended`), catalog items, and unresolved complaints (`open`, `under_review`).

### 8.2 Vendor Moderation Lifecycle
- Stalls default to `approvalStatus: 'pending'` upon initial creation.
- Pending stalls are excluded from public search and interactive maps.
- The administrator can transition a vendor profile to:
  - `approved`: Sets stall visible in public customer discovery.
  - `changes_requested`: Requires mandatory explanation; informs vendor to update photos or location.
  - `rejected`: Requires mandatory explanation; rejects incomplete or fraudulent applications.
  - `suspended`: Requires mandatory reason; immediately unlists an active stall following reports or infractions.
  - `restore`: Reinstates a suspended stall back to `approved`.
- All transitions are saved to `AuditLog` with admin reference, timestamp, previous status, new status, and justification.

### 8.3 Category Taxonomy Governance
- Categories feature an `isActive` boolean flag. Toggling active state hides the category from shopper filters and discovery pills without deleting documents or breaking vendor references.
- Category deletion (`DELETE /api/admin/categories/:id`) performs a hard dependency safeguard:
  `VendorProfile.countDocuments({ categories: categoryId })` and `Product.countDocuments({ categoryId })`. If either count exceeds 0, deletion is blocked with HTTP 400 and an informative error message recommending deactivation.

### 8.4 Community Report Intake & Adjudication
- Public shoppers can flag issues via `POST /api/reports` without authentication.
- Reports store target stall/product, reason code, details, reporter contact, status (`open`, `under_review`, `resolved`, `dismissed`), and admin resolution note.
- Administrators can review the complaint in `AdminReportsPage` and optionally suspend the offending stall in a single atomic action.

### 8.5 Access Control & Self-Lockout Safeguards
- The `PATCH /api/admin/users/:id/status` endpoint prevents administrators from suspending their own active session (`req.user._id.toString() === targetUser._id.toString()`).
- Prevents suspending the last active administrator on the platform.
- Suspended users are denied authentication on subsequent login attempts and blocked in `authenticate` middleware.
