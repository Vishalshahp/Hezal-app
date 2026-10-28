# Hezal Market — Production Deployment & Operations Guide

This guide provides end-to-end operational instructions for deploying, configuring, monitoring, and maintaining **Hezal Market** in production environments.

---

## 1. Production Architecture Overview

```
               [ Shopper / Vendor / Admin Browser ]
                                |
                 HTTPS (Port 443 / SSL Termination)
                                |
             +------------------+------------------+
             |                                     |
   [ Static Frontend SPA ]                [ Express REST API ]
   • React 18 + Vite                      • Node.js 20+ (ES Modules)
   • Nginx / Vercel CDN                   • Helmet + CORS + Rate Limit
   • OpenStreetMap Tiles                  • JWT + HttpOnly / Bearer
             |                                     |
             +------------------+------------------+
                                |
                   [ MongoDB Atlas Cluster ]
                   • GeoJSON 2dsphere Index
                   • Mongoose ODM with Strict Validation
                   • Automated Daily Backups
```

---

## 2. Production Environment Configurations

### Backend Environment Variables (`server/.env.production`)
| Variable | Description | Example / Recommendation |
| :--- | :--- | :--- |
| `NODE_ENV` | Application environment mode | `production` |
| `PORT` | HTTP port for the Node process | `5000` |
| `MONGODB_URI` | MongoDB Atlas cluster connection string | `mongodb+srv://<user>:<pwd>@cluster0.mongodb.net/hezal_market?retryWrites=true&w=majority` |
| `FRONTEND_URL` | Allowed CORS origins (comma-separated for multi-domain) | `https://hezalmarket.com,https://www.hezalmarket.com` |
| `JWT_SECRET` | 64+ char cryptographically secure random string | `crypto.randomBytes(32).toString('hex')` |
| `JWT_EXPIRES_IN` | Token lifetime | `7d` |
| `ADMIN_NAME` | Super admin user name for seeding | `Super Administrator` |
| `ADMIN_EMAIL` | Super admin email for initial provisioning | `admin@hezalmarket.com` |
| `ADMIN_PASSWORD` | Strong administrative initial password | `SecureAdminPassword2026!` |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary account cloud name | `hezal-prod` |
| `CLOUDINARY_API_KEY` | Cloudinary API Key | `123456789012345` |
| `CLOUDINARY_API_SECRET` | Cloudinary API Secret | `your_cloudinary_api_secret` |
| `COOKIE_SAME_SITE` | Cookie SameSite policy (`none` for cross-site, `lax` for same-site) | `none` |
| `COOKIE_SECURE` | Enforce HTTPS-only transmission for cookies | `true` |

### Frontend Environment Variables (`client/.env.production`)
| Variable | Description | Example / Recommendation |
| :--- | :--- | :--- |
| `VITE_API_BASE_URL` | Absolute URL to production backend API | `https://api.hezalmarket.com/api` |

---

## 3. Deployment Option 1: Docker Compose (Recommended for Containerized Hosts)

### Step 1: Clone and Prepare
```bash
git clone https://github.com/your-org/hezal-market.git /opt/hezal-market
cd /opt/hezal-market
```

### Step 2: Configure Environment
Copy and edit the production environment files:
```bash
cp server/.env.production.example server/.env
cp client/.env.production.example client/.env
```

### Step 3: Launch Services
```bash
docker compose up -d --build
```
This starts:
- `hezal_mongodb`: MongoDB 7.0 with persistent storage volume (`mongo_data`).
- `hezal_server`: Node.js 20 production container with dumb-init and non-root execution.
- `hezal_client`: Nginx Alpine serving the optimized React SPA with gzip and security headers.

### Step 4: Verify Containers
```bash
docker compose ps
docker compose logs -f server
```

---

## 4. Deployment Option 2: Cloud PaaS (Vercel + Render)

### Frontend on Vercel
1. Import repository into Vercel.
2. Set Root Directory to `client`.
3. Framework Preset: `Vite`.
4. Add Environment Variable:
   - `VITE_API_BASE_URL`: `https://your-api.onrender.com/api`
5. Deploy.

### Backend on Render (Web Service)
1. Create new Web Service connected to your repository.
2. Root Directory: `server`.
3. Runtime: `Node`.
4. Build Command: `npm ci --omit=dev`.
5. Start Command: `node src/server.js`.
6. Add all environment variables listed in Section 2.
7. Set `COOKIE_SAME_SITE=none` and `COOKIE_SECURE=true`.

---

## 5. Deployment Option 3: Traditional Linux VPS (Ubuntu 22.04 LTS)

### Step 1: Install System Dependencies
```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y curl git nginx
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
sudo npm install -g pm2
```

### Step 2: Deploy Backend with PM2
```bash
cd /var/www/hezal-market/server
npm ci --omit=dev
pm2 start src/server.js --name "hezal-api" --time
pm2 save
pm2 startup
```

### Step 3: Build and Deploy Frontend
```bash
cd /var/www/hezal-market/client
npm ci
VITE_API_BASE_URL=https://api.yourdomain.com/api npm run build
sudo cp -r dist/* /var/www/html/
```

### Step 4: Configure Nginx & SSL
Create `/etc/nginx/sites-available/hezalmarket`:
```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    root /var/www/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|webp|woff2)$ {
        expires 1y;
        add_header Cache-Control "public, max-age=31536000, immutable";
    }
}

server {
    listen 80;
    server_name api.yourdomain.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```
Enable site and install SSL via Let's Encrypt:
```bash
sudo ln -s /etc/nginx/sites-available/hezalmarket /etc/nginx/sites-enabled/
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com -d api.yourdomain.com
```

---

## 6. Database Seeding & Initial Administrator Provisioning

To securely provision the initial administrator account on a fresh database:
```bash
cd /opt/hezal-market/server
npm run seed:admin
```
To seed initial system categories:
```bash
npm run seed:categories
```

---

## 7. Database Backups & Disaster Recovery

### MongoDB Automated Backups
When using MongoDB Atlas:
- Enable Continuous Cloud Backups (Daily snapshots retained for 7 days minimum).
- Test Point-in-Time Restore (PITR) semi-annually.

### Manual Backup (`mongodump`)
```bash
# Create timestamped dump
mongodump --uri="$MONGODB_URI" --gzip --archive=/backups/hezal_backup_$(date +%Y%m%d_%H%M%S).gz
```

### Manual Restore (`mongorestore`)
```bash
mongorestore --uri="$MONGODB_URI" --gzip --archive=/backups/hezal_backup_20261028_120000.gz --drop
```

---

## 8. Health Checks, Monitoring & Rollback Strategy

### Health Verification
The backend exposes a public health check endpoint:
```bash
curl -I https://api.yourdomain.com/api/health
```
Response:
```json
{
  "success": true,
  "status": "healthy",
  "database": "connected",
  "uptime": 1284.5
}
```

### Rollback Strategy
1. **Frontend**: In Vercel / Netlify, click "Promote to Production" on the previous deployment. For Nginx, revert the `dist/` symlink.
2. **Backend**: 
   ```bash
   git revert <bad-commit-hash>
   npm ci --omit=dev
   pm2 restart hezal-api
   ```
3. **Database**: In the event of schema/data corruption, restore the pre-deployment snapshot using `mongorestore` or Atlas snapshot restore.
