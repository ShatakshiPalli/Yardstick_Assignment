

# SaaS Notes Application

## Overview
A professional, production-ready multi-tenant SaaS Notes Application built with the MERN stack and deployed on Vercel. This app enables multiple companies (tenants) to securely manage users and notes with strict tenant isolation, role-based access, and subscription-based feature gating. The project is robust, scalable, and ready for real-world SaaS deployment.

---

## Features

- **Multi-Tenancy:** Strict tenant isolation for all users and notes (Acme, Globex, easily extensible).
- **Role-Based Access:**
  - **Admin:** Invite users, upgrade/downgrade plan, manage notes.
  - **Member:** Create, view, edit, and delete notes only.
- **Authentication:** JWT-based login and session persistence.
- **Subscription Gating:**
  - **Free Plan:** Max 3 notes per tenant.
  - **Pro Plan:** Unlimited notes.
  - **Upgrade/Downgrade:** Admins can instantly change plan status.
- **Invite Users:** Admins can invite new users (role: admin/member) to their tenant.
- **Modern UI:** Minimal, responsive React app with Material UI, professional look and feel.
- **Settings Page:** Manage plan, view invited users, and more.
- **Health Endpoint:** For monitoring and automation.
- **Vercel Deployment:** Both backend and frontend are deployed and production-ready.

---

## Technology Stack

- **Frontend:** React, Material UI
- **Backend:** Node.js, Express
- **Database:** MongoDB (Mongoose ODM)
- **Authentication:** JWT
- **Deployment:** Vercel (frontend & backend)

---

## Project Structure

```
Yardstick_Assignment/
│
├── backend/
│   ├── index.js                # Express app entrypoint
│   ├── models/                 # Mongoose models (User, Tenant, Note)
│   ├── routes/                 # API routes (auth, notes, tenants, invite)
│   ├── middleware/             # JWT auth middleware
│   ├── scripts/                # Utility scripts (reset, clear, seed)
│   ├── seed.js                 # Seed initial tenants and users
│   ├── .env                    # Backend environment variables
│   └── vercel.json             # Vercel deployment config
│
├── frontend/
│   ├── src/
│   │   ├── App.js              # Main React app (UI, logic)
│   │   └── index.js            # React entrypoint
│   ├── public/
│   │   └── index.html          # HTML root
│   ├── .env                    # Frontend environment variables
│   └── README.md               # Frontend-specific docs
│
├── README.md                   # Project documentation (this file)
└── ...
```

---

## Getting Started

### Prerequisites
- Node.js (v16+ recommended)
- MongoDB Atlas or local MongoDB

### 1. Clone the Repository
```sh
git clone <repo-url>
cd Yardstick_Assignment
```

### 2. Setup Backend
```sh
cd backend
npm install
# Configure .env (see .env.example or use provided values)
npm run dev
# or for production
npm start
```

### 3. Setup Frontend
```sh
cd ../frontend
npm install
# Set REACT_APP_API_URL in .env (default: http://localhost:4000)
npm start
```

### 4. Seed Database (Optional)
```sh
cd backend
node seed.js
```

---

## Usage

### Test Accounts
Login with any of the following (password: `password`):
- `admin@acme.test` (Admin, Acme)
- `user@acme.test` (Member, Acme)
- `admin@globex.test` (Admin, Globex)
- `user@globex.test` (Member, Globex)

### Main Flows
- **Login:** Authenticate and persist session (JWT in localStorage)
- **Notes CRUD:** Create, view, edit, and delete notes (subject to plan limits)
- **Invite Users:** Admins can invite users by email and role
- **Upgrade/Downgrade:** Admins can change plan instantly
- **Settings:** View plan, invited users, and manage account

---

## Authentication

- JWT-based authentication; token stored in localStorage
- All API requests require `Authorization: Bearer <token>`
- Role and tenant info stored in localStorage for session persistence

---

## API Endpoints (Key)

### Auth
- `POST /auth/login` – Login (returns JWT, role, tenant)

### Notes
- `POST /notes` – Create note
- `GET /notes` – List notes
- `GET /notes/:id` – Get note by ID
- `PUT /notes/:id` – Update note
- `DELETE /notes/:id` – Delete note

### Tenants
- `POST /tenants/:slug/upgrade` – Upgrade to Pro (admin)
- `POST /tenants/:slug/downgrade` – Downgrade to Free (admin)
- `GET /tenants/:slug` – Get plan status

### Invite
- `POST /invite/invite` – Invite user (admin)
- `GET /invite/invited` – List invited users (admin)

### Health
- `GET /health` – Health check

---

## Deployment

- **Vercel:** Both backend and frontend are deployed on Vercel
- **Environment Variables:** Set in Vercel dashboard for both frontend and backend

---


## Author

**Developed by: Shatakshi Palli**
