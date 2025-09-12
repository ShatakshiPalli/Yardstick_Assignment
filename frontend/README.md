# SaaS Notes Frontend

## Setup

1. Install dependencies:
   npm install

2. Set API URL in `.env` (default: http://localhost:4000 for local dev, or your Vercel backend URL).

3. Start dev server:
   npm start

## Features
- Login with test accounts
- List, create, delete notes
- Shows "Upgrade to Pro" for Admin when Free plan limit is hit

## Deployment
- Deploy to Vercel as a React app
- Set `REACT_APP_API_URL` in Vercel dashboard to your backend URL
