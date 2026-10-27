# Hezal Market — Local Development & Setup Guide

Welcome to **Hezal Market**, a hyper-local vendor discovery platform engineered for small street vendors and local shoppers. This guide details everything required to configure, run, and verify the application locally for Phase 3 (Authentication & Role-Based Access Control).

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
│   │   ├── pages/              # Application pages (HomePage, LoginPage, RegisterCustomer, RegisterVendor, etc.)
│   │   ├── services/           # HTTP API client and authentication service
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
│   ├── src/
│   │   ├── config/             # Environment validation and MongoDB connection
│   │   ├── controllers/        # Request handlers (Health controller, Auth controller)
│   │   ├── middleware/         # Auth verification, RBAC role guard, error handler, 404 router
│   │   ├── models/             # Mongoose schemas (User model with bcrypt hashing)
│   │   ├── routes/             # Modular API routes (health, auth, role-protected demo checks)
│   │   ├── scripts/            # Admin provisioning script (seedAdmin.js)
│   │   ├── utils/              # Standardized API response format, token/cookie manager, logger
│   │   ├── app.js              # Express application assembly and middleware chain
│   │   └── server.js           # Server listening and graceful shutdown
│   ├── tests/                  # Integration tests (Health endpoints, 404 handler, Auth & RBAC)
│   ├── .env.example            # Environment template for backend
│   ├── eslint.config.js        # ESLint flat configuration
│   ├── package.json            # Server dependencies and scripts
│   └── vitest.config.js        # Vitest server test runner configuration
│
├── docs/                       # Project documentation
│   ├── architecture-notes.md   # Architectural decisions and Phase 3 specifications
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

### Frontend (`client/.env`)
Copy `client/.env.example` to `client/.env`:
```bash
cp client/.env.example client/.env
```
| Variable | Description | Default / Example |
| :--- | :--- | :--- |
| `VITE_API_BASE_URL` | Base URL of the backend Express API | `http://localhost:5000/api` |

---

## 4. Administrator Provisioning

Hezal Market strictly prevents public registration of administrators. To provision the initial platform administrator:

```bash
# Run administrator seed script
cd server
npm run seed:admin
# Alternatively from the project root:
npm run seed:admin
```

This reads credentials from your `server/.env` (`ADMIN_NAME`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`), hashes the password using bcrypt (12 salt rounds), and creates an active user with `role: 'admin'`. If an admin account with that email already exists, it safely prevents duplicates.

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

## 7. Authentication Endpoints & Manual Verification

### 1. Customer Registration
```bash
curl -X POST http://localhost:5000/api/auth/register/customer \
  -H "Content-Type: application/json" \
  -d '{"name":"Aarav Patel","email":"aarav@example.com","password":"Password123!","confirmPassword":"Password123!"}'
```

### 2. Vendor Registration
```bash
curl -X POST http://localhost:5000/api/auth/register/vendor \
  -H "Content-Type: application/json" \
  -d '{"name":"Ramesh Prajapati","email":"ramesh@example.com","phone":"+919876543210","password":"VendorPassword123!","confirmPassword":"VendorPassword123!"}'
```

### 3. User Sign In
```bash
curl -i -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"aarav@example.com","password":"Password123!"}'
```
*Notice the `Set-Cookie: hezal_auth_token=...; HttpOnly; SameSite=Lax` header in the response.*

### 4. Session Lookup (`GET /api/auth/me`)
```bash
curl http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer <TOKEN_RETURNED_FROM_LOGIN>"
```

### 5. Sign Out
```bash
curl -i -X POST http://localhost:5000/api/auth/logout
```

---

## 8. Executing Tests & Linting

### Running All Tests (Root Workspace)
```bash
npm run test
```
Runs 33 backend integration tests and 6 frontend component navigation tests.

### Running All Linters (Root Workspace)
```bash
npm run lint
```
Runs ESLint across both frontend and backend repositories with 0 errors and 0 warnings.
