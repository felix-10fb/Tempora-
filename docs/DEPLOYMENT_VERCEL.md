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
- **Root Directory**: `./` (or `frontend` if deploying frontend repo directly)
  * The included `vercel.json` automatically handles building:
    ```json
    {
      "version": 2,
      "framework": "vite",
      "buildCommand": "cd frontend && npm install && npm run build",
      "outputDirectory": "frontend/dist",
      "rewrites": [
        { "source": "/(.*)", "destination": "/index.html" }
      ]
    }
    ```

### Step 3: Environment Variables
Add the following in Vercel **Project Settings > Environment Variables**:

| Variable | Recommended Value / Description |
| :--- | :--- |
| `VITE_API_URL` | URL of your deployed FastAPI backend (e.g. `https://tempora-api.onrender.com/api` or `http://localhost:8000/api` for local) |
| `VITE_GOOGLE_MAPS_API_KEY` | Your Google Maps JavaScript API Key (with HTTP referrer restriction to your Vercel domain) |

### Step 4: Deploy
Click **Deploy**. Vercel will bundle the React application and deploy it across the global edge network.

---

## 3. Deploying FastAPI Backend
The backend can be hosted on any Python-compatible serverless or container platform (e.g., Render, Railway, AWS ECS, Fly.io, or Vercel Serverless Functions):
1. Set the working directory to `backend/`.
2. Start command:
   ```bash
   uvicorn backend.app.main:app --host 0.0.0.0 --port 8000
   ```
3. Set Backend Environment Variables:
   - `DATABASE_URL`: Your Neon PostgreSQL connection string
   - `JWT_SECRET`: Random 32+ character key
   - `BACKEND_CORS_ORIGINS`: Include your Vercel domain (e.g. `https://tempora.vercel.app`)
