# CareerForm Panel Study

Independent survey comparing completed task count (A), progress bar (B), and remaining task count (C). The same mascot, fields and timing are shared. UI preserved from CareerForm CF-132. This repository does not connect to CareerForm production or Sites.

## Setup
Node 22+, `npm ci`. Copy `.env.example` to `.env.local`. Set DATABASE_URL to a **separate Neon database**, ADMIN_PASSWORD to a unique random secret of at least 20 characters, SESSION_SECRET to a different random secret of at least 32 characters. Never commit credentials.

Run `node --env-file=.env.local scripts/migrate.mjs`, `npm run build`, then `npm start`. `/` opens the experiment; `/admin` requires the administrator password.

## Vercel
Import as a Next.js project. Create a separate Neon database through Storage/Marketplace and connect to this project. Set DATABASE_URL, ADMIN_PASSWORD, SESSION_SECRET in production. Apply `migrations/001_responses.sql` once before collecting responses. Do not connect preview deployments to the production response database. Build: `npm run build`.

Participants need no account. Final completed responses contain random response ID, version, trial order, ratings, duration, reduced-motion preference, final preference and server receive time. Example application values and participant account data are not stored. Duplicate IDs are idempotent; conflicting payloads are rejected. UUIDs do not enforce one response per person.

Admin authentication uses an HTTP-only signed 8-hour cookie. `/admin` provides variant means, preference counts, response list and CSV. Higher wait scores mean a longer perceived wait.

## Checks
`npm test` covers response validation and administrator authentication. `npm run build` builds the experiment and Next.js app. End-to-end persistence verification requires a connected Neon database.
