# Deployment Guide

## Deploy to Render (Free Tier)

### Option 1: Deploy Both (Backend + Frontend) on Render

Create `render.yaml` in project root:

```yaml
services:
  - type: web
    name: vams-backend
    env: node
    region: oregon
    buildCommand: cd Backend && npm install
    startCommand: cd Backend && npm start
    envVars:
      - key: NODE_ENV
        value: production
      - key: DB_HOST
        value: ${DATABASE_HOST}
      - key: DB_USER
        value: ${DATABASE_USER}
      - key: DB_PASSWORD
        value: ${DATABASE_PASSWORD}
      - key: DB_NAME
        value: ${DATABASE_NAME}
      - key: DB_PORT
        value: "3306"
    database:
      databaseName: vams_db
      plan: free

  - type: web
    name: vams-frontend
    env: node
    region: oregon
    buildCommand: cd Frontend && npm install && npm run build
    startCommand: cd Frontend && npx serve dist -l 5173
    envVars:
      - key: VITE_API_URL
        value: https://vams-backend.onrender.com
```

---

## Option 2: Deploy Separately

### Backend → Render
1. Push code to GitHub
2. Create new Web Service on Render
3. Settings:
   - Build Command: `cd Backend && npm install`
   - Start Command: `cd Backend && npm start`
4. Add environment variables:
   - `DB_HOST` - MySQL host
   - `DB_USER` - MySQL user
   - `DB_PASSWORD` - MySQL password
   - `DB_NAME` - Database name
5. Create free MySQL database on Render

### Frontend → Vercel
1. Push code to GitHub
2. Import project on Vercel
3. Framework: Vite
4. Build Command: `npm run build`
5. Output Directory: `dist`
6. Add environment variable:
   - `VITE_API_URL` = your-render-backend-url

---

## Option 3: Deploy Backend Only (Use existing frontend)

### Render Steps
1. Push Backend to GitHub
2. Create Web Service on Render
3. Build: `npm install`
4. Start: `npm start`
5. Add MySQL environment variables
6. Connect free MySQL database
7. Deploy gives you URL like: `https://your-app.onrender.com`

### Update Frontend API
Edit `Frontend/src/services/api.js`:
```javascript
const API_BASE_URL = 'https://your-backend.onrender.com/api';
```

Then deploy frontend to any static hosting (Vercel, Netlify, GitHub Pages)

---

## Database Options (Free Tier)

| Provider | Free | MySQL | Notes |
|----------|------|------|-------|
| Render | 750 hrs | Yes | Spin down after 15 min |
| Railway | $5 credit | Yes | Pay for usage |
| PlanetScale | Unlimited | No | Use libSQL |
| Neon | Unlimited | No | PostgreSQL |
| Supabase | Unlimited | No | PostgreSQL |

---

## Quick Deploy (Render)

```bash
# 1. Install Render CLI
npm install -g render-cli

# 2. Login
render login

# 3. Deploy
render deploy --service-type web --name vams-backend --env node
```

---

## Production Checklist

- [ ] Update CORS in `Backend/src/app.js` for production domain
- [ ] Set NODE_ENV=production
- [ ] Use environment variables for all secrets
- [ ] Enable auto-sdeploy (optional in Render)
- [ ] Test API endpoints with production database
- [ ] Update frontend API base URL

---

## Useful Commands

```bash
# Backend
cd Backend
npm start

# Frontend (dev)
cd Frontend
npm run dev

# Frontend (build)
cd Frontend
npm run build

# Preview built frontend
npx serve dist
```

---

## Troubleshooting Render

| Issue | Solution |
|-------|----------|
| Service crashed | Check logs in Render dashboard |
| Database connection | Verify env vars in dashboard |
| 502 Bad Gateway | Add `package.json` type: "commonjs" remains |
| Slow response | Enable pro for better performance |