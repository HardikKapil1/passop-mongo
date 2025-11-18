# PassOp (passop-mongo)

Lightweight password manager (Express + MongoDB backend, React + Vite frontend).

This README explains local setup, how the repository is structured, and deployment details for the frontend (Vercel) and backend (Render). It also documents environment variables and quick redeploy steps.

---

## Repo layout

- `backend/` — Node/Express API and MongoDB integration. `server.js` is the entrypoint.
- `frontend/` — Vite + React SPA. Built static assets are placed in `frontend/dist` during build.

---

## Quick local setup

Prerequisites: Node.js (LTS), npm, Git.

1. Install frontend deps and run dev server (PowerShell):
```
cd "c:\Users\kapil\OneDrive\Desktop\Password Manager Project\passop-mongo\frontend"
npm install
# set backend URL for dev (PowerShell):
$env:VITE_BACKEND_URL='https://passop-mongo-1-283r.onrender.com'
npm run dev
```

2. Install and run backend (PowerShell):
```
cd "c:\Users\kapil\OneDrive\Desktop\Password Manager Project\passop-mongo\backend"
npm install
npm run dev    # uses nodemon, or `npm start` to run once
```

Notes:
- `frontend` reads `VITE_BACKEND_URL` at build time. For dev you can set it in your shell as shown above.
- The frontend contains a `vercel.json` rewrite so SPA direct-route navigations are served correctly when deployed to Vercel.

---

## Environment variables

Backend (Render service environment variables):
- `MONGO_URI` : MongoDB connection string (required)
- `DB_NAME` : (optional) database name; defaults to `passwordmanager`
- JWT secret(s), any other secrets you require for production

Frontend (Vercel environment variables; set these in Vercel project settings):
- `VITE_BACKEND_URL` : e.g. `https://passop-mongo-1-283r.onrender.com`

Important: Do NOT put sensitive server secrets (DB credentials, JWT signing secrets) into `VITE_` variables — these are embedded into client bundles and are public.

The repo currently has `frontend/.env` with `VITE_BACKEND_URL` for local convenience; Vercel uses environment variables set in the dashboard during build.

---

## Deploy configuration (what I recommend)

Frontend (Vercel):
- Root: connect the `frontend` folder or set the project root to `frontend` when creating the Vercel project.
- Build Command: `npm run build` (Vercel will run this inside the `frontend` directory if that folder is the project root). If your Vercel project points to the repo root, set Build Command: `cd frontend && npm install && npm run build` and Output Directory: `frontend/dist`.
- Environment Variables: set `VITE_BACKEND_URL` in the Vercel dashboard (Production).
- `vercel.json` in `frontend/` contains a rewrite to serve `index.html` for SPA routes — this prevents 404s on direct navigation.

Backend (Render):
- Root Directory: set to `backend`.
- Build Command: `npm ci --only=production` (or `npm install --production` if you prefer).
- Start Command: `npm start` (your `backend/package.json` already defines `start: node server.js`).
- Environment Variables: set `MONGO_URI`, `DB_NAME`, JWT secrets, etc. in Render service settings.

Note: If you prefer separate services, create two services — one for frontend (Vercel or static hosting) and one for backend (Render or other host).

---

## Redeploy steps (Frontend on Vercel)

1. Make sure `VITE_BACKEND_URL` is set in Vercel Project Settings → Environment Variables.
2. Trigger a redeploy by either pushing a commit to the connected branch (e.g., `main`) or clicking the **Redeploy** button in the Vercel dashboard.
3. After build completes, visit your Vercel URL and test flows (try Login → Register link, login/register with deployed backend).

If you see a 404 on direct route navigation, ensure `frontend/vercel.json` is present in the repo and that Vercel rebuild picked it up.

---

## Troubleshooting

- If the frontend is connecting to the wrong backend, confirm the built bundle contains the correct `VITE_BACKEND_URL` (Vite reads `VITE_` variables at build time only).
- If CORS errors appear: verify backend's CORS configuration and that the frontend origin is allowed.
- If the backend fails to start on Render: check `MONGO_URI`, and confirm `process.env.PORT` is available (Render provides it automatically).

---

## Security notes

- Remove or rotate any sensitive keys accidentally committed to the repository (for example, `VITE_SECRET_KEY` in the frontend is public — consider moving encryption secrets to the backend or derive per-user secrets at runtime).
- Do not expose DB credentials or JWT signing secrets in client-side env vars.

---

## What I changed for you

- Replaced anchor tags with React Router `Link` to prevent full page reloads.
- Added `frontend/vercel.json` with a rewrite to serve `index.html` for SPA routes.
- Replaced hardcoded `localhost` URLs in frontend pages with `import.meta.env.VITE_BACKEND_URL` (fallback to `http://localhost:3000`).
- Added UI features: dark mode toggle, sign out button in `Navbar.jsx`, and password visibility toggles for Login/Register.

---

If you want, I can also:
- Remove `VITE_SECRET_KEY` from the repo and add guidance for safe secret management.
- Add a `render.yaml` or deployment automation snippets.
- Provide a minimal `Dockerfile` for the backend if you want container deployment.

If you'd like any of those, reply which and I'll implement it.
