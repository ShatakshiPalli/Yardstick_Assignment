# SaaS Notes Application

## Multi-Tenancy Approach
We use a **shared schema** in MongoDB with a `tenantId` field on all user and note documents. This ensures strict data isolation at the application level, while keeping deployment and scaling simple. All queries are always filtered by `tenantId`.

## Tech Stack
- Backend: Node.js, Express, MongoDB, JWT
- Frontend: React
- Deployment: Vercel (both frontend and backend)

## Features
- Multi-tenant: Acme, Globex (strict isolation)
- JWT Auth, Admin/Member roles
- Free/Pro subscription gating (3 notes limit for Free)
- CRUD Notes API
- Health endpoint
- Minimal frontend

## Test Accounts (all passwords: `password`)
- admin@acme.test (Admin, Acme)
- user@acme.test (Member, Acme)
- admin@globex.test (Admin, Globex)
- user@globex.test (Member, Globex)

## Endpoints
- POST /auth/login
- POST /notes
- GET /notes
- GET /notes/:id
- PUT /notes/:id
- DELETE /notes/:id
- POST /tenants/:slug/upgrade
- GET /health

## Deployment
- Both backend and frontend are deployed to Vercel.
- CORS enabled for API access.
