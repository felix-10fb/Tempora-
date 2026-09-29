# TEMPORA

> ### *"Own Less. Live More."*
> **A Hyperlocal Temporary-Ownership Marketplace**

TEMPORA connects people who temporarily need products with people and businesses that already own those products. Built on the core philosophy: **"Why buy something you only need temporarily?"**

---

## 🌟 Key Features

1. **"Tell Us What You Need" (Signature AI Feature)**:
   - Natural language search parsing prompts like *"I'm moving to Chennai for 8 months and need a bed, study table and office chair under ₹4,000/month within 5 km"*.
   - Instantly synthesizes **"YOUR TEMPORARY SETUP"** with compatibility scores (98%), radius filtering, and 1-click turnkey bundle checkout.
2. **Interactive Split-Screen Search (`/search`)**:
   - Left side: real-time filtered listings with category chips, price sliders, condition flags, and delivery options.
   - Right side: Google Map with custom price markers, interactive cluster projection, and popup detail preview.
3. **Multi-Step Booking Flow**:
   - Automated date calculation, Doorstep Delivery vs Self Pickup, transparent price breakdown (rental, 3% protection, 5% platform, refundable security deposit), and simulated escrow payment.
4. **AI Item Inspection & Trust System**:
   - Condition score generation (0-100, e.g. 94/100 *"Very Good"*) and defect scanner.
   - Before vs After scan comparison for dispute evidence.
   - Dual-party TEMPORA Trust Scores and badges.
5. **Dedicated Owner Platform (`/owner`)**:
   - Real-time revenue analytics, asset utilization rates, category distributions, incoming rental requests, and a 5-step listing wizard.
6. **SaaS Operations Admin Portal (`/admin`)**:
   - Live PostgreSQL aggregation metrics (Users, Listings, GMV, Escrow, Disputes).
   - User identity verification & suspension controls.
   - Listing moderation queue (Approve, Reject, Suspend).
   - Dispute Center with escrow deposit disbursement actions and immutable audit logging.
   - Admin Operations Map (`/admin/map`) tracking live fleet markers.
7. **Specialized Experiences**:
   - **Clothing Mode (`/clothing-mode`)**: "BUILD MY LOOK" outfit builder for interviews, weddings, and galas with certified dry-cleaning.
   - **Furniture Mode (`/furniture-mode`)**: "MY TEMPORARY HOME" turnkey room packages for Studio, 1BHK, 2BHK, PG, and Office spaces.
8. **Real-Time Communication**:
   - Escrow-linked chat between renter and host with listing context.
   - Notification Center for instant rental updates.

---

## 🏗️ Architecture & Tech Stack

```
TEMPORA Monorepo
├── frontend/             # React 19 + TypeScript + Vite + Tailwind CSS + Lucide
└── backend/              # Python 3.13 + FastAPI + SQLAlchemy 2.x + Alembic + Pydantic V2
```

- **Frontend**: React 19, Vite, TypeScript, Tailwind CSS, Framer Motion, Lucide Icons, Recharts, Canvas-Confetti.
- **Backend**: FastAPI, Uvicorn, SQLAlchemy 2.x ORM, Pydantic V2, Alembic, Bcrypt, PyJWT.
- **Database**: Serverless Neon PostgreSQL (SSL-enabled pooled connection).
- **Deployment**: Vercel (Frontend SPA) + Separately deployable Python backend service.

---

## 🗄️ Database Setup & Neon Connection

Connection URL:
```
postgresql://neondb_owner:npg_PnofHuBjd3U2@ep-late-rice-b3tznt7s-pooler.c-4.ap-southeast-1.aws.neon.tech/neondb?sslmode=require
```

### Seeding Development Data
Populates 20 users, 10 owners, 50 listings across all 9 categories, bookings, reviews, disputes, and notifications:
```bash
python -m backend.app.seed.seed_data
```

### Demo Accounts:
| Role | Email | Password | Trust Score |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@tempora.io` | `admin123` | 99/100 |
| **Owner (Host)** | `owner@tempora.io` | `owner123` | 96/100 |
| **Customer (Renter)** | `customer@tempora.io` | `customer123` | 91/100 |

---

## 🚀 Local Development

### 1. Backend
```bash
# Install dependencies
pip install -r backend/requirements.txt

# Run FastAPI server
uvicorn backend.app.main:app --reload --host 0.0.0.0 --port 8000
```
- API Docs: `http://localhost:8000/docs`
- Health Check: `http://localhost:8000/api/health`

### 2. Frontend
```bash
cd frontend

# Install dependencies
npm install

# Start Vite dev server
npm run dev
```
Open `http://localhost:5173` in your browser.

### 3. Run Backend Tests
```bash
python -m pytest backend/app/tests/test_api.py -v
```

---

## 🌐 Vercel Deployment

1. Push this repository to GitHub: `https://github.com/felix-10fb/Tempora-.git`
2. In Vercel, import the repository.
3. Root `vercel.json` automatically builds `frontend/` and handles SPA client-side routing.
4. Set environment variables:
   - `VITE_API_URL`: Your deployed backend URL.
   - `VITE_GOOGLE_MAPS_API_KEY`: Your Google Maps JavaScript API Key.

---

## 📄 License
MIT © TEMPORA Technologies Inc.
