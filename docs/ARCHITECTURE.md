# TEMPORA — System Architecture & Product Blueprint

## 1. Executive Summary
**TEMPORA** is a hyperlocal temporary-ownership marketplace built on the philosophy:
> *"Why buy something you only need temporarily? Own less. Live more."*

It bridges citizens and businesses with excess high-grade physical goods (furniture, studio cameras, party gear, appliances, occasion apparel) and individuals needing them for days, weeks, or months.

---

## 2. Core Architecture

```
                    ┌──────────────────────────────────────────┐
                    │               CLIENT LAYER               │
                    │   React 19 + TypeScript + Vite + Tailwind│
                    │         Vercel Edge Hosting / CDN        │
                    └─────────────────────┬────────────────────┘
                                          │  HTTPS / REST / JWT
                                          ▼
                    ┌──────────────────────────────────────────┐
                    │               API GATEWAY                │
                    │             FastAPI Backend              │
                    │     Uvicorn / Pydantic V2 / Security     │
                    └──────┬──────────────┬──────────────┬─────┘
                           │              │              │
              SQLAlchemy   │              │ Python SDK   │ REST
              Connection   ▼              ▼              ▼
    ┌────────────────────────┐  ┌──────────────────┐  ┌────────────────┐
    │     DATABASE LAYER     │  │    AI ENGINE     │  │  GOOGLE MAPS   │
    │    Neon PostgreSQL     │  │ Intent Parser,   │  │ JavaScript,    │
    │  Serverless Connection │  │ Bundle Generator,│  │ Places, Routes,│
    │  Pooling & Keepalives  │  │ Defect Inspector │  │ Distance Matrix│
    └────────────────────────┘  └──────────────────┘  └────────────────┘
```

---

## 3. Technology Stack

| Layer | Technologies | Justification |
| :--- | :--- | :--- |
| **Frontend** | React 19, TypeScript, Vite, Tailwind CSS, Framer Motion, Lucide Icons | Instant rendering, micro-interactions, responsive luxury design |
| **Backend** | Python 3.13, FastAPI, Pydantic V2, SQLAlchemy 2.x | High-throughput async REST API, auto OpenAPI docs, strict validation |
| **Database** | Neon Serverless PostgreSQL | Auto-scaling relational storage, connection pooling, zero-downtime |
| **Auth** | JWT (Access + Refresh), Bcrypt, Role-Based Access Control | Secure multi-role permission matrix (Customer, Owner, Admin) |
| **Geospatial** | Google Maps JavaScript, Places Autocomplete, Haversine Engine | Hyperlocal distance calculation, radius filtering, split-screen map |
| **AI Engine** | Multi-Provider Engine (Gemini / OpenAI / Semantic Parser) | Natural language setup generator & vision defect scoring (0-100) |
| **Deploy** | Vercel (Frontend) + Container/Serverless (FastAPI) | Globally distributed low-latency edge deployment |

---

## 4. Database Schema Structure
The Neon PostgreSQL schema encompasses 22 relational models:
1. `users` — Authentication, roles, trust scores (0-100), verification flags
2. `user_preferences` — Categories, budget, radius, style
3. `addresses` — Geocoded coordinates, postal code, default status
4. `categories` — Furniture, Clothing, Electronics, Cameras, Appliances, etc.
5. `listings` — Hyperlocal inventory with daily, weekly, monthly rates & deposit
6. `listing_images` — Multi-image gallery with sort order
7. `availability` — Blackout dates and calendar windows
8. `bookings` — Multi-step lease orders with calculated platform and protection fees
9. `payments` — Transaction IDs, escrow status, and provider records
10. `reviews` — Dual-party ratings influencing listing rating & owner trust score
11. `wishlists` & `wishlist_items` — User collections ("Dream Room", "Interview Kit")
12. `conversations` & `messages` — User-to-user escrow chat with dispute auditability
13. `notifications` — Real-time event notifications
14. `disputes` — Claim arbitration with before/after photo evidence & deposit allocation
15. `reports` — Community safety moderation queue
16. `admin_logs` — Immutable audit trail of all staff and moderator actions
17. `subscriptions` — Pro Host and Fleet tier memberships
18. `coupons` — Promotional discount codes
19. `delivery_orders` — Courier tracking status, ETA, and distance
20. `item_inspections` — AI condition scoring (0-100) and defect detection before/after rental
