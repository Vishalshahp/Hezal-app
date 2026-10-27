# Hezal Market — Local Development & Setup Guide

Welcome to **Hezal Market**, a hyper-local vendor discovery platform engineered for small street vendors and local shoppers. This guide details everything required to configure, run, and verify the application locally for Phase 2 (Foundation Setup).

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
│   │   ├── __tests__/          # Frontend component tests
│   │   ├── components/         # Reusable UI components (Navbar, Footer, StatusCard)
│   │   ├── layouts/            # Page layouts (MainLayout)
│   │   ├── pages/              # Application pages (HomePage, NotFoundPage)
│   │   ├── services/           # HTTP API client and health service
│   │   ├── App.jsx             # React Router routing tree
│   │   ├── index.css           # Tailwind CSS directives
│   │   ├── main.jsx            # React root mount
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
│   │   ├── controllers/        # Request handlers (Health controller)
│   │   ├── middleware/         # Centralized error handler and 404 router
│   │   ├── routes/             # Modular API routes
│   │   ├── utils/              # Standardized API response format and logger
│   │   ├── app.js              # Express application assembly and middleware
│   │   └── server.js           # Server listening and graceful shutdown
│   ├── tests/                  # Integration tests (Health endpoints, 404 handler)
│   ├── .env.example            # Environment template for backend
│   ├── eslint.config.js        # ESLint flat configuration
│   ├── package.json            # Server dependencies and scripts
│   └── vitest.config.js        # Vitest server test runner configuration
│
├── docs/                       # Project documentation
│   ├── architecture-notes.md   # Architectural decisions and deviations
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

### Frontend (`client/.env`)
Copy `client/.env.example` to `client/.env`:
```bash
cp client/.env.example client/.env
```
| Variable | Description | Default / Example |
| :--- | :--- | :--- |
| `VITE_API_BASE_URL` | Base URL of the backend Express API | `http://localhost:5000/api` |

---

## 4. MongoDB Atlas Setup Guide

To use a cloud-hosted MongoDB Atlas database:

1. **Create an Account:** Visit [mongodb.com/atlas](https://www.mongodb.com/atlas) and register a free account.
2. **Deploy a Free Cluster:** Select the **M0 Shared (Free)** tier in your preferred region.
3. **Database Access (User):**
   - In Security > Database Access, click **Add New Database User**.
   - Select **Password Authentication**. Set a username (e.g., `hezal_admin`) and a strong password.
   - Assign the user role **Read and write to any database**.
4. **Network Access (IP Whitelist):**
   - In Security > Network Access, click **Add IP Address**.
   - For development, select **Allow Access from Anywhere (`0.0.0.0/0`)** or add your current IP.
5. **Retrieve Connection String:**
   - In Database > Clusters, click **Connect**.
   - Choose **Drivers** (Node.js).
   - Copy the SRV URI:
     ```
     mongodb+srv://<username>:<password>@cluster0.abcde.mongodb.net/hezal_market?retryWrites=true&w=majority
     ```
   - Replace `<username>` and `<password>` with your credentials, and append the database name `/hezal_market`.
6. **Set in `.env`:** Paste this connection string into `server/.env` under `MONGODB_URI`.

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
The server will start at `http://localhost:5000`. You should see the startup banner in your console:
```
[INFO] Hezal Market API Server Running
[INFO] Environment: development
[INFO] Port:        5000
[INFO] Base URL:    http://localhost:5000
[INFO] Health API:  http://localhost:5000/api/health
[INFO] DB Health:   http://localhost:5000/api/health/db
```

### Starting the Frontend Development Server
In a new terminal window:
```bash
cd client
npm run dev
```
The client will start at `http://localhost:5173`. Open your browser to view the application.

---

## 7. Verifying Health & Connectivity

### Verification 1: Express API Health
Open your browser or run curl:
```bash
curl http://localhost:5000/api/health
```
Expected response:
```json
{
  "success": true,
  "message": "Hezal Market API is running",
  "status": "ok",
  "environment": "development",
  "uptimeSeconds": 12,
  "timestamp": "2026-10-27T10:55:00.000Z"
}
```

### Verification 2: Database Connectivity Check
```bash
curl http://localhost:5000/api/health/db
```
- **When MongoDB is connected:** Returns HTTP `200 OK` with `{ "success": true, "status": "connected", "message": "MongoDB Atlas is connected and responsive" }`.
- **When MongoDB is disconnected/offline:** Returns HTTP `503 Service Unavailable` with `{ "success": false, "status": "disconnected", "message": "Database is not connected..." }`. Note that credentials and stack traces are never leaked.

### Verification 3: Frontend Status Dashboard
Visit `http://localhost:5173`. The homepage displays a real-time **System & Foundation Status** card verifying both the Express API and MongoDB Atlas connection status live.

---

## 8. Executing Tests & Linting

### Running Backend Tests
```bash
cd server
npm test
```
Runs Vitest against server health endpoints, root route, and error handlers.

### Running Backend Linter
```bash
cd server
npm run lint
```

### Running Frontend Tests
```bash
cd client
npm test
```
Runs Vitest with React Testing Library to verify application rendering.

### Running Frontend Linter
```bash
cd client
npm run lint
```

---

## 9. Common Setup Issues & Solutions

| Issue | Cause | Solution |
| :--- | :--- | :--- |
| `CORS blocked request` in browser console | Frontend port does not match server `FRONTEND_URL` | Verify `FRONTEND_URL` in `server/.env` matches `http://localhost:5173`. |
| `Database is not connected` in `/api/health/db` | MongoDB service is not running or Atlas IP is blocked | If using local MongoDB, ensure MongoDB service is active. If using Atlas, confirm your current IP is whitelisted in Atlas Network Access. |
| `EADDRINUSE: address already in use :::5000` | Another process is using port 5000 | Kill the process using port 5000 or change `PORT=5001` in `server/.env` and `VITE_API_BASE_URL` in `client/.env`. |
| `VITE_API_BASE_URL` not updating in frontend | Vite caches environment variables on startup | Restart the Vite development server (`npm run dev`) after modifying `client/.env`. |
