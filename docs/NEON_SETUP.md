# Neon PostgreSQL Setup & Migrations Guide

## 1. Database Connection
TEMPORA connects directly to serverless **Neon PostgreSQL** via connection-pooled URLs with SSL mode enabled.

```
postgresql://neondb_owner:npg_PnofHuBjd3U2@ep-late-rice-b3tznt7s-pooler.c-4.ap-southeast-1.aws.neon.tech/neondb?sslmode=require
```

### Connection Pool Configuration
To prevent pooler idle timeouts from severing connections during traffic lulls, SQLAlchemy is configured with:
- `pool_pre_ping=True`: Verifies connection liveness before checkout
- `pool_recycle=300`: Refreshes connections every 5 minutes
- `keepalives=1, keepalives_idle=30`: Maintains TCP socket health with Neon poolers

---

## 2. Running Migrations
Alembic manages all schema revisions:

```bash
# Apply migrations to head
python -m alembic upgrade head

# Rollback one migration
python -m alembic downgrade -1
```

---

## 3. Database Seeding Script
To seed realistic development data (20 users, 10 owners, 50 listings across all 9 categories, bookings, reviews, disputes, notifications):

```bash
python -m backend.app.seed.seed_data
```

### Default Demo Accounts Seeded:
| Role | Email | Password | Trust Score |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@tempora.io` | `admin123` | 99/100 |
| **Owner (Host)** | `owner@tempora.io` | `owner123` | 96/100 |
| **Customer (Renter)** | `customer@tempora.io` | `customer123` | 91/100 |
