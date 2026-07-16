# Weather App — PM Accelerator Technical Assessment

Built by **Siddharth Uppala** for the PM Accelerator AI Engineer Intern technical assessment (Full Stack: Assessment #1 + #2).

A weather app where users enter a location (city, zip, landmark, or their current GPS position)
and get real-time current conditions, a 5-day forecast, and a map — plus a backend that persists
location + date-range weather lookups with full CRUD and data export.

## Tech stack

- **Next.js 15 (App Router) + TypeScript + Tailwind CSS** — single project covers both the
  frontend (React-based, no Python/Java) and the backend (Next.js API routes act as the RESTful
  API layer).
- **Open-Meteo** — free, keyless weather + geocoding API (current conditions, 5-day forecast,
  historical/forecast ranges).
- **Nominatim (OpenStreetMap)** — free, keyless reverse geocoding for "use my location".
- **SQLite (better-sqlite3)** — zero-setup file-based persistence for the CRUD requirement.
- **Leaflet + OpenStreetMap tiles** — map of the resolved location (bonus API integration, no key
  needed).

No API keys or `.env` setup required — everything above is free and keyless.

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). A `data.sqlite` file is created automatically
on first run.

## Features

### Assessment #1 — Frontend

- Location search accepts city, zip/postal code, landmark, or coordinates (via Open-Meteo
  geocoding), plus a "📍 My location" button using the browser Geolocation API + reverse
  geocoding.
- Current conditions: temperature, feels-like, humidity, wind, and a weather icon.
- **5-day forecast** grid (`1.1`).
- **Error handling** (`1.2`): invalid/not-found locations, and upstream API failures, both surface
  a clear inline message instead of crashing.
- Responsive layout (Tailwind flex/grid + breakpoints): stacks to a single column on mobile,
  multi-column on desktop; the saved-searches table scrolls horizontally instead of breaking
  layout on small screens.
- Map of the resolved location (Leaflet/OpenStreetMap, bonus `2.2`-style integration).

### Assessment #2 — Backend

- **CRUD (`2.1`)** over a `searches` table (SQLite):
  - `POST /api/searches` — create: takes a location + date range, validates the date range
    (valid dates, start ≤ end, ≤92 days span), fuzzy-matches the location via geocoding, fetches
    weather for the range, and stores it.
  - `GET /api/searches` — read all saved searches (no row-level security, per the spec).
  - `PUT /api/searches/:id` — update the date range on an existing record (re-validated,
    re-fetches weather); location/coordinates are intentionally immutable on update — a new
    location is a new search.
  - `DELETE /api/searches/:id` — delete a record.
- **Data export (`2.3`)**: `GET /api/searches/export?format=csv|json`.
- Supporting endpoints: `GET /api/geocode?q=`, `GET /api/weather?lat=&lon=`,
  `GET /api/reverse-geocode?lat=&lon=`.

## Project structure

```
src/lib/weather.ts        # Open-Meteo + Nominatim client (geocoding, current+forecast, date-range weather)
src/lib/db.ts             # SQLite schema + CRUD queries
src/app/api/**            # REST API routes
src/components/Dashboard.tsx      # Search, current weather, 5-day forecast, map
src/components/SearchManager.tsx  # CRUD UI for saved searches + export
```
