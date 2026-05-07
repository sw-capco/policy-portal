# policy-portal

Canadian Policyholder Portal MVP scaffold implementing PRD-010 selected issues:

- #55 Backend authentication flow with MFA (TOTP)
- #56 Backend policy details retrieval API
- #59 Frontend policy details page (React)

## Local development

### Backend (Express)

- Install deps (first time): `cd server && npm i`
- Run server: `cd server && npm run dev`
- Health check: `GET http://localhost:4000/health`

Demo policyholder (in-memory seed):
- email: `demo@example.com`
- password: `Password123!`
- policy number: `ON-123-456-789`

### Frontend (React + Vite)

- Install deps (first time): `cd client && npm i`
- Run dev server: `cd client && npm run dev`
- Open: `http://localhost:3000/policy/ON-123-456-789`

The Vite dev server proxies `/auth` and `/policy` to `http://localhost:4000`.

## AI context files

This repo uses `.genai/context/<PRD-ID>/` as stable, file-based context for an AI coding agent.

- Create a new context folder with placeholders: `./scripts/genai/create_context.sh PRD-XXX`
- Expected files:
  - `prd.json` (approved PRD JSON)
  - `issues.json` (selected GitHub issues list)
  - `wireframes.txt` (wireframe export references / links)
  - `instructions.md` (short description of the above)
