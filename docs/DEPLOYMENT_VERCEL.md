# Deploying TEMPORA to Vercel

This guide documents deploying the **TEMPORA Frontend** to **Vercel** and linking it with the **FastAPI Backend** and **Neon PostgreSQL Database**.

---

## 1. Prerequisites
- A GitHub account with access to [https://github.com/felix-10fb/Tempora-.git](https://github.com/felix-10fb/Tempora-.git)
- A [Vercel Account](https://vercel.com)
- Active Neon PostgreSQL Database URL

---

## 2. Step-by-Step Vercel Deployment

### Step 1: Import Project
1. Go to your [Vercel Dashboard](https://vercel.com/dashboard).
2. Click **Add New...** > **Project**.
3. Select the repository: `felix-10fb/Tempora-`.

### Step 2: Configure Project Settings
- **Framework Preset**: `Vite`
- **Root Directory**: repository root (`./`); do not deploy only `frontend/`.
- The root `vercel.json` proxies `/api/*` and `/uploads/*` to `https://tempora-api.onrender.com` before applying the frontend SPA fallback. If the backend host changes, update these rewrite destinations.

### Step 3: Environment Variables
Add the frontend-specific values in Vercel **Project Settings > Environment Variables**:

| Variable | Recommended Value / Description |
| :--- | :--- |
| `VITE_GOOGLE_MAPS_API_KEY` | Your Google Maps JavaScript API Key (with HTTP referrer restriction to your Vercel domain) |

The frontend uses same-origin `/api` routes by default; do not set `VITE_API_URL` to `localhost` in a Vercel deployment.

### Step 4: Configure and deploy the backend
Configure these environment variables on the backend host (currently Render):

- `DATABASE_URL`: Neon PostgreSQL connection string, including `sslmode=require`
- `ENVIRONMENT`: `production` (prevents silent fallback to ephemeral SQLite)
- `JWT_SECRET` and `JWT_REFRESH_SECRET`: separate random secrets of at least 32 characters
- Optional integrations: `AI_API_KEY`, Google OAuth credentials, and payment credentials as needed

Deploy both services, then open `https://<your-vercel-domain>/api/health`. Confirm the response reports `status: "healthy"`, `database.healthy: true`, and `database.type: "postgresql"`. A `sqlite` result is not a production-ready database connection.
