# CampusPulse — Smart Campus Issue Intelligence

A working full-stack student/admin campus maintenance reporting platform built for TPDS-III. React + Bootstrap + Chart.js + Express + MySQL + Docker.

## Features
- Student registration and login; admin role with protected operations
- Location-based issue reporting, filtering, and status timeline
- Duplicate suggestions (same location + Dice keyword similarity) and one confirmation per student
- Explainable priority score (severity 40%, impact 25%, waiting 20%, confirmations 15%)
- Emergency escalation for severity-5 electrical issues
- Admin status updates, assignment, resolution notes, and history
- Live database-backed KPI cards, category/status/trend charts, and building hotspots
- Responsive layout and Docker Compose deployment

## Fastest setup: Docker Desktop
1. Install Docker Desktop and ensure it is running.
2. Copy `.env.example` to `.env`. Change ALL passwords and `JWT_SECRET`.
3. In the project directory run `docker compose up --build -d`.
4. Open **http://localhost:8080**.
5. Create an admin account by running (after containers start):
   ```bash
   docker compose exec -e SEED_ADMIN_EMAIL=admin@campuspulse.local -e SEED_ADMIN_PASSWORD=YourStrongPassword123 backend node src/seed.js
   ```
   Use a different password in real use. Sign in with that email/password. Students register through the UI.
6. For logs run `docker compose logs -f`. To stop run `docker compose down`. **Do not** run `docker compose down -v` unless you want to delete the database.

## Local development (without Docker for the app)
1. Start MySQL 8 and run `backend/sql/schema.sql` against a `campuspulse` database. Create a database user with access.
2. In `backend/`, install packages with `npm install`; set environment variables `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `JWT_SECRET` (see `.env.example`); run `npm run dev`.
3. In `frontend/`, run `npm install` then `npm run dev`. Open http://localhost:5173.
4. For admin provisioning run `SEED_ADMIN_PASSWORD=... node src/seed.js` in a terminal with backend database env configured. On Windows PowerShell use `$env:SEED_ADMIN_PASSWORD="..."; node src/seed.js`.

## Test
Run `cd backend && npm test` for priority and similarity unit tests. Perform API integration tests with Postman and the browser after Docker startup.

## Example walkthrough
1. Student signs up, selects Block A / Floor 2 / Room 204, and reports a broken projector.
2. Another student signs up and enters a similar issue title in the same location; the form suggests the existing ticket. They can confirm it instead of creating a duplicate.
3. Admin signs in, reviews issue score and explanation, assigns an administrator, changes status to in progress, then resolves it with a note.
4. Dashboard KPIs and charts update after refresh; student can inspect status history.

## API overview
- `POST /api/auth/register`, `POST /api/auth/login`
- `GET /api/locations`
- `GET /api/issues`, `GET /api/issues/:id`, `POST /api/issues`
- `GET /api/issues/similar?location_id=3&title=broken%20projector`
- `POST /api/issues/:id/confirm`
- Admin only: `PATCH /api/issues/:id`, `GET /api/analytics/summary`, `GET /api/admin/users`
- `GET /api/health`

## Security and deployment notes
- Passwords are bcrypt-hashed; JWTs expire after 12 hours; admin authorization is checked server-side.
- Registration creates students only; administrator must be provisioned using the seed script.
- Demo-grade application: add HTTPS, production origin configuration, secrets management, automated database backups, stronger session management, audit review, and security testing before use with real campus personal data.
- The Docker Compose setup serves on localhost:8080. For cloud hosting, set the correct external origin and HTTPS reverse proxy. Cloud hosting and actual uptime are **not** included in this repository.
- The app uses the database as the source of truth; no fabricated sample statistics. It starts with an empty issue list.
- The current MVP uses text fields, not image upload. Priority is rule-based and not trained AI. The location view is a building hotspot chart, not an architectural floor-plan heatmap.

## TPDS-III mapping
| Module | Implementation |
|---|---|
| M1 BI | KPI dashboard, category/status/trend charts, building hotspots |
| M2 Frontend | Responsive React/Bootstrap forms, navigation, issue views |
| M3 Backend | Node.js/Express REST APIs, MySQL tables, joins, transactions, validation |
| M4 DevOps | Git-ready source, Dockerfiles, Docker Compose, nginx reverse proxy |

## Testing scenarios for report
Normal: register/login, report, confirm, update, resolve, analytics. Invalid: missing location, weak password, invalid category, non-admin PATCH. Boundary: same user confirms twice, reporter confirms own ticket, empty dashboard, critical electrical issue, 100+ confirmations. Record actual test outcomes and screenshots; do not claim unexecuted tests passed.

## Originality and attribution
Project-specific integration of duplicate-aware reporting, transparent priority explanation, and building hotspot analytics. Standard open-source libraries are listed in package.json. Document any AI assistance and third-party code in your submission.

## CampusPulse 2.0 — 50-student interactive demo

This edition adds a polished command center, urgent-issue watchlist, resolution progress visualization, searchable and filterable issue explorer, student community highlights, and a repeatable **database-backed** demonstration dataset. The demo records are fictional, explicitly marked `[CampusPulse DEMO]`, and must not be presented as real campus statistics.

### Upgrade an existing installation (Windows / VS Code)

1. **Back up your existing project** and your `.env` file. Extract this new ZIP to a separate folder, then copy your existing `.env` into the new project root. Do not overwrite your old `.env` with the sample.
2. From the **new** project root run `docker compose up --build -d`.
3. Wait for MySQL to be healthy, then run `docker compose exec backend node src/seed-demo.js` **once**. This creates/updates 50 fictional students and 1 demo administrator, and recreates 145 clearly marked demo issues with historical statuses, confirmations, and timestamps. It **does not delete genuine user reports**. Re-running replaces only marked demo issues; don't run it while demo data is being actively edited.
4. Visit `http://localhost:8080` and sign in as `demo.admin@campuspulse.local` with password `CampusDemo@123`. For the student experience, use `demo.student01@campuspulse.local` with the same password.
5. Use the admin **Overview** to see the watchlist, resolution performance, four analytics panels, and recent reports. Use **All issues** to search and filter. Open a ticket, change status and add a note; refresh to see the dashboard update. Sign in as a student to report an issue and confirm another student's report.

**Security:** Demo credentials are intentionally public and insecure. They are suitable for **local development only**. Do not expose this seeded deployment to the public internet. Before a public deployment, remove the demo accounts or rotate their passwords, disable public demo access, and replace all placeholder secrets.

### Database persistence and safety

The `mysql_data` Docker volume persists across `docker compose down` and rebuilds. **Never run `docker compose down -v` on a database you want to keep.** The demo seeder deletes and recreates only issues whose description contains `[CampusPulse DEMO]`; it preserves regular student reports. Back up the database before seeding if you have modified demo records you need to keep.

### What the demo includes

- 50 fictional student accounts, one fictional admin account, and 145 issue records across 12 campus locations
- Multiple categories, severities, impacts, statuses, age ranges, confirmations, and status-history entries
- Real database-backed admin analytics and priority scores; no hardcoded KPI values
- Urgent issue watchlist, resolution rate ring, searchable/filterable issue explorer, building hotspots, and student community highlights
- Existing REST API, MySQL, React/Bootstrap, Git-ready source, and Docker Compose

### Known limitations

- Data is simulated, not measured from a real campus.
- The duplicate suggestion engine is keyword-based, not an ML model.
- Hotspots are building-level bars rather than an interactive floor-plan map.
- Photos, notifications, and a public cloud deployment are not included.
- Full Docker end-to-end verification should be performed on the user's machine.
