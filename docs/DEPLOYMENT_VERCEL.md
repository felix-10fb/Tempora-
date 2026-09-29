# Deploying TEMPORA to Vercel

This guide documents deploying the **full-stack TEMPORA application** (React Frontend + FastAPI Backend) to **Vercel** with a **Neon PostgreSQL Database**.

---

## 1. Prerequisites
- A GitHub account with access to [https://github.com/felix-10fb/Tempora-.git](https://github.com/felix-10fb/Tempora-.git)
- A [Vercel Account](https://vercel.com)
- Active Neon PostgreSQL Database URL

---

## 2. Architecture

- **Frontend**: React + Vite → built as static files and served by Vercel CDN
- **Backend**: FastAPI → deployed as a Vercel Python Serverless Function at `/api/*`
- **Database**: Neon PostgreSQL (cloud-hosted, serverless-compatible)

The `vercel.json` at the project root rewrites all `/api/*` requests to the Python serverless function at `api/index.py`, while all other routes fall back to the SPA (`index.html`).

---

## 3. Step-by-Step Vercel Deployment

### Step 1: Import Project
1. Go to your [Vercel Dashboard](https://vercel.com/dashboard).
2. Click **Add New...** > **Project**.
3. Select the repository: `felix-10fb/Tempora-`.

### Step 2: Configure Project Settings
- **Framework Preset**: `Vite`
- **Root Directory**: repository root (`./`); do **not** deploy only `frontend/`.
- Build Command: `cd frontend && npm install && npm run build`
- Output Directory: `frontend/dist`

### Step 3: Environment Variables
Add these in Vercel **Project Settings > Environment Variables**:

| Variable | Description |
| :--- | :--- |
| `DATABASE_URL` | Neon PostgreSQL connection string (include `?sslmode=require`) |
| `ENVIRONMENT` | `production` (prevents fallback to ephemeral SQLite) |
| `JWT_SECRET` | Random secret, at least 32 characters |
| `JWT_REFRESH_SECRET` | Different random secret, at least 32 characters |
| `VITE_GOOGLE_MAPS_API_KEY` | Google Maps JavaScript API Key (optional) |
| `AI_API_KEY` | Gemini / OpenAI API key for AI features (optional) |
| `GOOGLE_CLIENT_ID` | Google OAuth Client ID (optional) |
| `GOOGLE_CLIENT_SECRET` | Google OAuth Client Secret (optional) |

The frontend uses same-origin `/api` routes by default; do **not** set `VITE_API_URL` to `localhost` in a Vercel deployment.

### Step 4: Deploy
Click **Deploy**. Vercel will:
1. Build the frontend (`cd frontend && npm install && npm run build`)
2. Detect `api/index.py` and `requirements.txt` at the project root
3. Install Python dependencies and deploy the serverless function
4. Serve everything under your Vercel domain

### Step 5: Verify
Open `https://<your-vercel-domain>/api/health`. Confirm the response reports:
- `status: "healthy"`
- `database.healthy: true`
- `database.type: "postgresql"`

A `sqlite` result means `DATABASE_URL` is not set or the PostgreSQL host is unreachable.

---

## 4. Running Locally

```bash
# Backend (from backend/ directory)
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000

# Frontend (from frontend/ directory)
npm run dev
```

The Vite dev server proxies `/api/*` to `http://127.0.0.1:8000` automatically.
