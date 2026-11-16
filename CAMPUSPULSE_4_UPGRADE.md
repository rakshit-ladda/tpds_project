# CampusPulse 4 — Analytics & UI Upgrade

## What changed
- Original split-screen sign-in page with prominent Student and Administration choices.
- Redesigned application palette, sidebar and chart panels.
- Admin-only Analytics studio navigation with 6 live visualizations: report trend, categories, status, priority, hotspots and resolution effectiveness.
- Charts use existing `/api/analytics/summary` and `/api/issues` data; no fabricated values.
- Existing backend, schema, reporting and login logic are unchanged.

## Safest upgrade (preserves existing 50-student demo data)
1. Back up your existing project folder.
2. Copy ONLY `frontend/src/main.jsx` and `frontend/src/style.css` from this archive to the existing working `campuspulse/frontend/src/`.
3. In the existing working `campuspulse` folder run `docker compose up -d --build frontend`.
4. Open http://localhost:8080 and hard refresh (Ctrl+Shift+R).
5. Sign in as admin to see the Analytics studio menu. Student accounts do not see it.

## New installation
1. Copy `.env.example` to `.env` in the SAME folder as `docker-compose.yml` and set secure non-placeholder values.
2. Run `docker compose up -d --build` from that folder. Ensure port 8080 is free.
3. This creates a separate database from earlier versions. Run the seed command only if you intend to populate that separate database: `docker compose exec backend node src/seed-demo.js`.

## Verification
The ZIP archive was validated. A frontend production build and browser end-to-end tests could not be completed in this environment; please run the Docker build and verify the login and charts locally before presenting.

## Design attribution
Original CampusPulse interface informed by general SaaS dashboard design patterns and Dribbble inspiration, not copied third-party assets.
