# CampusPulse 3 — UI and access update

## What's changed
- Original editorial green/ivory visual system: navigation, dashboard, reports, charts, issue details and login.
- Explicit Student portal / Administration selector on the sign-in screen.
- The login response role is checked against the selected portal. Administrators can no longer accidentally appear to sign into the student portal, and vice versa.
- Clearer admin workspace labels and student-facing labels.
- Preserves existing API, database schema, seed scripts, analytics, issue workflow and Docker Compose setup.

## Local demo accounts (after running seed-demo.js on a fresh database)
- Admin: demo.admin@campuspulse.local / CampusDemo@123
- Student: demo.student01@campuspulse.local / CampusDemo@123
These accounts are only for local demonstration. Never expose them publicly.

## Run from the folder containing docker-compose.yml
1. Copy `.env.example` to `.env` and set a long random JWT_SECRET. Keep `.env` private.
2. Start Docker Desktop.
3. Run `docker compose up --build -d`.
4. Run `docker compose ps`; frontend should publish `0.0.0.0:8080->80/tcp`.
5. Open `http://localhost:8080`.
6. For a fresh empty database ONLY, run `docker compose exec backend node src/seed-demo.js`.

## Upgrading an existing CampusPulse 2 installation without losing demo data
Back up your current folder and database first. The Docker Compose project name derives from the folder name, so launching the ZIP from a NEW folder can create a NEW database volume. To keep the existing data, replace only `frontend/src/main.jsx` and `frontend/src/style.css` in your existing `campuspulse` folder, then run `docker compose up -d --build frontend` from that same folder. Your backend, schema and existing database are unchanged.

## Validation notes
- Source-level backend tests (`node --test src/logic.test.js`) passed: priority range, critical electrical escalation, title similarity.
- Browser end-to-end and Docker runtime testing are still required on your computer.
- Dependency installation and frontend build could not be completed in the artifact environment; run the Docker build locally and report errors if any.

## Scope
This release is a focused UI and role-entry redesign. It does not add machine-learning models or claim complete penetration/security testing.
