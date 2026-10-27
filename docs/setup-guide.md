# Hezal Market — Local Development & Setup Guide

Welcome to **Hezal Market**, a hyper-local vendor discovery platform engineered for small street vendors and local shoppers. This guide details everything required to configure, run, and verify the application locally for Phase 4 (Vendor Profile, Product Management, Image Uploads, and Stall Information).

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
├── client/                     # Frontend Application (React 18 + Vite + Tailwind CSS)
│   ├── public/                 # Static public assets
│   ├── src/
│   │   ├── __tests__/          # Frontend component & auth navigation tests
│   │   ├── components/         # Reusable UI components (Navbar, Footer, StatusCard, ProtectedRoute)
│   │   ├── context/            # React AuthContext providing user state and session management
│   │   ├── layouts/            # Page layouts (MainLayout)
│   │   ├── pages/              # Application pages (HomePage, LoginPage, RegisterCustomer, RegisterVendor,
│   │   │                       #  VendorDashboard, VendorProfilePage, VendorLocationPage, VendorProductsPage)
│   │   ├── services/           # HTTP API client, authService, vendorService, productService
│   │   ├── App.jsx             # React Router routing tree with role-protected route guards
│   │   ├── index.css           # Tailwind CSS directives
│   │   ├── main.jsx            # React root mount with AuthProvider
│   │   └── setupTests.js       # Vitest DOM test setup
│   ├── .env.example            # Environment template for frontend
│   ├── eslint.config.js        # ESLint flat configuration
│   ├── index.html              # HTML entry template
│   ├── package.json            # Client dependencies and scripts
│   ├── postcss.config.js       # PostCSS plugins
│   ├── tailwind.config.js      # Tailwind CSS configuration with design tokens
│   └── vite.config.js          # Vite build and test configuration
│
├── server/                     # Backend REST API (Node.js + Express + Mongoose)
│   ├── uploads/                # Local file storage for images when Cloudinary is not configured
│   ├── src/
│   │   ├── config/             # Environment validation and MongoDB connection
│   │   ├── controllers/        # Request handlers (auth, health, category, vendorProfile, product)
│   │   ├── middleware/         # Auth verification, RBAC role guard, upload middleware, error handler
│   │   ├── models/             # Mongoose schemas (User, Category, VendorProfile, Product)
│   │   ├── routes/             # Modular API routes (auth, health, categories, vendor, products, public vendors)
│   │   ├── scripts/            # Admin provisioning (seedAdmin.js) & Category taxonomy (seedCategories.js)
│   │   ├── services/           # Image upload service (Cloudinary with local filesystem fallback)
│   │   ├── utils/              # Standardized API response format, token/cookie manager, logger
│   │   ├── app.js              # Express application assembly and middleware chain
│   │   └── server.js           # Server listening and graceful shutdown
│   ├── tests/                  # Integration tests (auth, vendor/product, health, error handlers)
│   ├── .env.example            # Environment template for backend
│   ├── eslint.config.js        # ESLint flat configuration
│   ├── package.json            # Server dependencies and scripts
│   └── vitest.config.js        # Vitest server test runner configuration
│
├── docs/                       # Project documentation
│   ├── architecture-notes.md   # Architectural decisions and Phase 4 specifications
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

## 7. Phase 4 Endpoints & Manual Verification

### 1. Categories
- `GET /api/categories` — Fetch all active categories.

### 2. Vendor Profile Management (`role: vendor`)
- `GET /api/vendor/profile` — Fetch the authenticated vendor's stall profile and stats.
- `PUT /api/vendor/profile` — Create or update stall name, description, stall type, categories, and public contact.
- `PUT /api/vendor/location` — Update coordinates (`[longitude, latitude]`), stall address, landmark, and operating hours. Automatically timestamps `locationUpdatedAt`.
- `PUT /api/vendor/availability` — Toggle manual availability status (`open`, `away`, `closed`).
- `POST /api/vendor/upload` — Upload stall cover or photos (`multipart/form-data`, field: `image`, max 5MB).
- `GET /api/vendor/dashboard/stats` — Retrieve profile completion %, product counts, and stock availability metrics.

### 3. Product Catalogue Management (`role: vendor`)
- `GET /api/products/my` — Fetch all products belonging to the authenticated vendor.
- `POST /api/products` — Create a new product (`name`, `description`, `categoryId`, optional `price`, `image`).
- `PUT /api/products/:id` — Update product details (strictly verifies vendor ownership).
- `DELETE /api/products/:id` — Delete a product (strictly verifies vendor ownership).
- `PATCH /api/products/:id/availability` — Quick toggle product stock availability (`isAvailable: true/false`).
- `POST /api/products/upload` — Upload product photo (`multipart/form-data`, field: `image`).

### 4. Public Profile Endpoint
- `GET /api/vendors/:id` — Returns public stall details and available products for approved vendors. Returns `404 Not Found` if pending or unapproved (unless requested by the profile owner or an administrator).

---

## 8. Executing Tests & Linting

### Running All Tests (Root Workspace)
```bash
npm run test
```
Runs all 67 automated tests:
- **59 server integration tests** covering Health checks, Error handlers, Authentication & RBAC, Vendor Profile CRUD, Coordinates & Availability, Product Catalogue CRUD, Image Uploads, and Ownership Security guards.
- **8 client component & navigation tests** covering branding, route transitions, and role protection guards.

### Running All Linters (Root Workspace)
```bash
npm run lint
```
Runs ESLint across both frontend and backend repositories with 0 errors and 0 warnings.
