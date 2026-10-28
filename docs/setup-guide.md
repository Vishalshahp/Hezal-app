# Hezal Market — Local Development & Setup Guide

Welcome to **Hezal Market**, a hyper-local vendor discovery platform engineered for small street vendors and local shoppers. This guide details everything required to configure, run, and verify the application locally for Phase 6 (Administrator Dashboard, Vendor Approvals & Listing Moderation).

---

## 1. Prerequisites

Ensure your development machine has the following tools installed:

- **Node.js**: v18.0.0 or later (v24+ recommended)
- **npm**: v9.0.0 or later
- **Git**: v2.30+
- **MongoDB**: MongoDB Community Server locally (port 27017) OR a free [MongoDB Atlas Cluster](https://www.mongodb.com/atlas/database)

Verify installations in your terminal:
```bash
node -v
npm -v
git --version
```

---

## 2. Repository Structure

```
hezal-market/
├── client/                     # Frontend Application (React 18 + Vite + Tailwind CSS + Leaflet)
│   ├── public/                 # Static public assets
│   ├── src/
│   │   ├── __tests__/          # Frontend integration tests (App.test.jsx, Discovery.test.jsx, Admin.test.jsx)
│   │   ├── components/         # Reusable UI (Navbar, Footer, AdminNav, StatusCard, ProtectedRoute,
│   │   │                       #  VendorCard, InteractiveMap, ReportModal)
│   │   ├── context/            # React AuthContext providing user state and session management
│   │   ├── layouts/            # Page layouts (MainLayout)
│   │   ├── pages/              # Application pages (HomePage, ExplorePage, PublicVendorProfilePage,
│   │   │                       #  AdminDashboard, AdminVendorsPage, AdminCategoriesPage, AdminReportsPage, AdminUsersPage, etc.)
│   │   ├── services/           # HTTP API client, authService, vendorService, productService, adminService
│   │   ├── App.jsx             # React Router routing tree with public discovery, vendor, and admin portal routes
│   │   ├── index.css           # Tailwind CSS directives & Leaflet map styling
│   │   ├── main.jsx            # React root mount with AuthProvider
│   │   └── setupTests.js       # Vitest DOM test setup
│   ├── .env.example            # Environment template for frontend
│   ├── eslint.config.js        # ESLint flat configuration
│   ├── index.html              # HTML entry template
│   ├── package.json            # Client dependencies (including leaflet & react-leaflet)
│   ├── postcss.config.js       # PostCSS plugins
│   ├── tailwind.config.js      # Tailwind CSS configuration with design tokens
│   └── vite.config.js          # Vite build and test configuration
│
├── server/                     # Backend REST API (Node.js + Express + Mongoose)
│   ├── uploads/                # Local file fallback when Cloudinary credentials are not set
│   ├── src/
│   │   ├── config/             # Environment validation and MongoDB connection
│   │   ├── controllers/        # Request handlers (auth, health, category, vendorProfile, product, discovery, admin)
│   │   ├── middleware/         # Auth verification, RBAC role guard, upload middleware, error handler
│   │   ├── models/             # Mongoose schemas (User, Category, VendorProfile, Product, Report, AuditLog)
│   │   ├── routes/             # Modular API routes (auth, health, categories, vendor, products, public vendors, admin, reports)
│   │   ├── scripts/            # Admin provisioning (seedAdmin.js), Category taxonomy (seedCategories.js),
│   │   │                       #  and sample vendor seed (seedSampleVendors.js)
│   │   ├── services/           # Image upload service (Cloudinary / Local fallback)
│   │   ├── utils/              # Standardized API response format, token/cookie manager, logger
│   │   ├── app.js              # Express application assembly, static uploads, and middleware chain
│   │   └── server.js           # Server listening and graceful shutdown
│   ├── tests/                  # Integration tests (auth, vendor, discovery, admin, health, error handlers)
│   ├── .env.example            # Environment template for backend
│   ├── eslint.config.js        # ESLint flat configuration
│   ├── package.json            # Server dependencies and scripts
│   └── vitest.config.js        # Vitest server test runner configuration
│
├── docs/                       # Project documentation
│   ├── architecture-notes.md   # Architectural decisions and Phase 6 specifications
│   └── setup-guide.md          # This setup and verification guide
│
├── .gitignore                  # Git exclusion rules
├── package.json                # Root convenience scripts
└── README.md                   # Project overview and quickstart
```

---

## 3. Environment Variable Configuration

Both client and server include `.env.example` templates. Create your actual `.env` files from these templates.

### Backend (`server/.env`)
Copy `server/.env.example` to `server/.env`:
```bash
cp server/.env.example server/.env
```
Key configuration parameters:
| Variable | Description | Default / Example |
| :--- | :--- | :--- |
| `NODE_ENV` | Application environment (`development`, `test`, `production`) | `development` |
| `PORT` | Local port for Express API | `5000` |
| `MONGODB_URI` | MongoDB connection string (Local or Atlas) | `mongodb://127.0.0.1:27017/hezal_market` |
| `FRONTEND_URL` | Allowed origin for Cross-Origin Resource Sharing (CORS) | `http://localhost:5173` |
| `JWT_SECRET` | Secret key used to sign and verify JSON Web Tokens | `hezal_dev_jwt_secret_key_...` |
| `JWT_EXPIRES_IN` | Token validity duration | `7d` |
| `ADMIN_NAME` | Name for administrator provisioning script | `Platform Administrator` |
| `ADMIN_EMAIL` | Email for administrator provisioning script | `admin@hezalmarket.com` |
| `ADMIN_PASSWORD`| Initial password for administrator provisioning | `AdminPassword123!` |
| `CLOUDINARY_CLOUD_NAME` | (Optional) Cloudinary account cloud name | `your_cloud_name` |
| `CLOUDINARY_API_KEY` | (Optional) Cloudinary account API key | `your_api_key` |
| `CLOUDINARY_API_SECRET` | (Optional) Cloudinary account API secret | `your_api_secret` |

> *Note: If Cloudinary keys are omitted, the server automatically defaults to local image storage under `server/uploads/`.*

### Frontend (`client/.env`)
Copy `client/.env.example` to `client/.env`:
```bash
cp client/.env.example client/.env
```
| Variable | Description | Default / Example |
| :--- | :--- | :--- |
| `VITE_API_BASE_URL` | Base URL of the backend Express API | `http://localhost:5000/api` |

---

## 4. Seeding Initial Data

### 4.1 Administrator Provisioning
Hezal Market strictly prevents public registration of administrators. To provision the initial platform administrator:
```bash
npm run seed:admin
```
This reads credentials from `server/.env` (`ADMIN_NAME`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`), hashes the password using bcrypt (12 salt rounds), and creates an active user with `role: 'admin'`.

### 4.2 Category Taxonomy Seeding
To seed the 8 core marketplace categories (Street Food, Fresh Produce, Beverages & Juices, Flowers & Plants, Handcrafts, Clothing, Household Essentials, Repair & Services):
```bash
npm run seed:categories
```

### 4.3 Sample Approved Vendors Seeding (Development & Demonstration)
To populate 5 realistic approved stalls in Ahmedabad (Law Garden, Vastrapur Lake, CG Road, Navrangpura) with real coordinates, menus, and operating hours:
```bash
npm run seed:vendors
```

---

## 5. Installing Dependencies

Run `npm install` inside both `server` and `client` directories:

```bash
# Install Server Dependencies
cd server
npm install

# Install Client Dependencies
cd ../client
npm install
```

---

## 6. Running the Applications

### Starting the Backend Server
```bash
cd server
npm run dev
```
The server will start at `http://localhost:5000`.

### Starting the Frontend Development Server
In a new terminal window:
```bash
cd client
npm run dev
```
The client will start at `http://localhost:5173`.

---

## 7. Phase 5 Endpoints & Manual Verification

### 1. Categories
- `GET /api/categories` — Fetch all active marketplace taxonomy categories.

### 2. Public Vendor Discovery & Search
- `GET /api/vendors` — Public keyword and filter search.
  - Query parameters:
    - `q`: Product or stall name/description search (e.g. `q=Pani Puri`).
    - `category`: Category slug (e.g. `category=street-food`) or ObjectId.
    - `area`: Locality / city filter (e.g. `area=Ellisbridge`).
    - `stallType`: `fixed` | `mobile`.
    - `availabilityStatus`: `open` | `away` | `closed`.
    - `sort`: `newest` | `name_asc` | `name_desc` | `updated`.
    - `page`, `limit` (default 12, max 50).

### 3. Geospatial Nearby Discovery
- `GET /api/vendors/nearby` — Bounded radial search using MongoDB `$geoNear` aggregation.
  - Query parameters:
    - `longitude`: -180 to 180 (required, float).
    - `latitude`: -90 to 90 (required, float).
    - `radius`: Distance in kilometers (default 5, min 0.1, max 50).
    - `q`: Text search query.
    - `category`: Category slug or ObjectId.
    - `page`, `limit`.

### 4. Public Stall Profile & Community Reports
- `GET /api/vendors/:id` — Returns approved public stall details, operating hours, coordinates, and full active product catalogue. Returns `404 Not Found` for unapproved or suspended profiles.
- `POST /api/reports` — Public endpoint allowing shoppers to report inaccurate locations, permanently closed stalls, or misleading listings.

### 5. Vendor Management (`role: vendor`)
- `GET /api/vendor/profile`, `PUT /api/vendor/profile`
- `PUT /api/vendor/location`, `PUT /api/vendor/availability`
- `POST /api/vendor/upload`
- `GET /api/products/my`, `POST /api/products`, `PUT /api/products/:id`, `DELETE /api/products/:id`

### 6. Administration & Moderation (`role: admin`)
- `GET /api/admin/metrics` — Dashboard counts calculated directly from MongoDB collections.
- `GET /api/admin/vendors` — Review queue with filters (`pending`, `approved`, `changes_requested`, `suspended`, `rejected`).
- `GET /api/admin/vendors/:id` — Vendor inspection dossier including products and audit history.
- `PATCH /api/admin/vendors/:id/status` — Lifecycle transitions (`approve`, `reject`, `request_corrections`, `suspend`, `restore`).
- `GET /api/admin/categories`, `POST /api/admin/categories`, `PUT /api/admin/categories/:id`
- `PATCH /api/admin/categories/:id/toggle-status`, `DELETE /api/admin/categories/:id` (dependency-protected)
- `GET /api/admin/reports`, `PATCH /api/admin/reports/:id` (with optional vendor suspension)
- `GET /api/admin/users`, `PATCH /api/admin/users/:id/status` (self-lockout and last-admin protection)
- `GET /api/admin/audit-logs` — Immutable audit trail of administrative moderation actions.

---

## 8. Executing Tests & Linting

### Running All Tests (Root Workspace)
```bash
npm run test
```
Runs all **123 automated tests**:
- **101 server integration tests** covering Health checks, Error handlers, Authentication & RBAC, Vendor Profile CRUD, Coordinates & Availability, Product Catalogue CRUD, Image Uploads, Public Search & Product Querying, Geospatial `$geoNear` radius discovery, Admin Dashboard Metrics, Vendor Application Lifecycle, Category Governance & Deletion Safeguards, Public Report Intake & Moderation, User Account Access Controls, and Audit Trail persistence.
- **22 client component & navigation tests** covering branding, route transitions, role protection guards, search & category filtering, view toggles (List/Map/Split), public stall views, Admin Dashboard KPI rendering, Vendor Review actions with reason modals, Category taxonomy management & active toggles, Listing Report resolution, and User Account suspension safeguards.

### Running All Linters (Root Workspace)
```bash
npm run lint
```
Runs ESLint across both frontend and backend repositories with 0 errors and 0 warnings.
