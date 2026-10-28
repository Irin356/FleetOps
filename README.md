# FleetOps

A responsive fleet-management application and public product experience built with React + TypeScript, Vite ,Supabase Auth + Postgres.

## Project Overview

FleetOps gives operations teams one view of vehicles, drivers, trips, alerts, and fleet health. The experience includes:

- A full-width public landing page with product, solution, industry, outcome, resource, and company sections.
- A connected fleet dashboard with live vehicle markers, filtering, route breadcrumbs, trip history, telemetry details, and alert acknowledgment.
- Demo data that works without a configured backend.
- Supabase-backed authentication, fleet records, and updates when the database is connected.
- Operator sign-in, account creation, and Google OAuth as an alternative secure authentication method.

### Main product decisions

- **Landing-first public experience:** operators encounter the product before entering the dashboard.
- **Demo-first resilience:** the interface remains usable with local sample data when Supabase is not configured.
- **Operations-oriented hierarchy:** vehicles, status, location, trips, and exceptions are immediately accessible.
- **Calm visual language:** restrained blue tones, smooth reveal motion, lightweight hover effects, and reduced-motion support.
- **Responsive workflows:** dashboard controls and authentication layouts adapt between desktop and mobile screens.

### Intended operations-user workflow

1. Review FleetOps on the landing page or start the demo.
2. Sign in with email/password, create an operator account, or use configured Google OAuth.
3. Review fleet totals and current vehicle status on the overview dashboard.
4. Filter the map by status and select a vehicle to inspect telemetry.
5. View trips and route breadcrumbs.
6. Review alerts and acknowledge resolved exceptions.
7. Continue monitoring live map positions and simulated telemetry in demo mode.

## Live Demo

- **Public preview during local development:** http://127.0.0.1:5173
- **Deployed application URL:** 
- **Walkthrough/video:** The supplied reference video is available at `public/fleetmanage.mp4`. Add a hosted walkthrough URL if one is produced.

### Demo access



For Supabase authentication, create a user with **Create Account** or enter an operator account registered in Supabase. Project owners should provide any required deployed demo credentials separately.

No fixed demo login credentials are bundled.
> Never commit real passwords, Supabase service-role keys, OAuth secrets, or private API keys.

## Local Setup

### Requirements

- Node.js 18 or newer
- npm
- A modern browser
- Optional: a Supabase project for authentication and live database data

### Install and run

```bash
npm install
npm run dev
```

The Vite development server normally runs at http://127.0.0.1:5173.

### Other commands

```bash
npm run build
npm run lint
npm run preview
```

### Environment variables

Copy the sample file:

```bash
cp .env.example .env
```

Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

Configure:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key
```

Find these values in **Supabase Project Settings → API**. Use only the anon/public key in the browser. Restart Vite after changing environment variables.

The app can also use temporary browser-local overrides named:

- `fleetops_custom_supabase_url`
- `fleetops_custom_supabase_anon_key`

Environment configuration is preferred.

## Supabase Setup

Run the supplied SQL files from the Supabase **SQL Editor** in order:

1. `supabase/migrations/01_initial_schema.sql`
2. `supabase/migrations/02_seed_data.sql`

`supabase/schema_and_seed.sql` is also provided as a combined setup file. Re-running the seed migration is destructive because it truncates demo operational records.

### Main tables

- `drivers` — driver name, phone, email, license, and avatar.
- `vehicles` — vehicle details, assigned driver, coordinates, status, telemetry, and last ping.
- `trips` — vehicle, driver, origin, destination, distance, duration, status, and timestamps.
- `trip_points` — ordered GPS breadcrumbs for a trip.
- `vehicle_alerts` — exception title, description, category, severity, vehicle, and acknowledgment state.

### Relationships

- `vehicles.driver_id` → `drivers.id`, with `ON DELETE SET NULL`.
- `trips.vehicle_id` → `vehicles.id`, with `ON DELETE CASCADE`.
- `trips.driver_id` → `drivers.id`, with `ON DELETE SET NULL`.
- `trip_points.trip_id` → `trips.id`, with `ON DELETE CASCADE`.
- `vehicle_alerts.vehicle_id` → `vehicles.id`, with `ON DELETE CASCADE`.
- `trip_points.sequence_order` is unique per trip.

The migration enables Row Level Security and defines authenticated read/update/insert policies. Optional anonymous preview policies are included for local development.

Before production use, narrow anonymous policies, add tenant/organization ownership if required, and review which authenticated roles may insert or update each table.

### Authentication setup

1. Enable **Email/Password** under **Supabase Dashboard → Authentication → Providers**.
2. Create users manually or allow registration through the application.
3. Configure confirmation and email settings according to deployment policy.
4. For Google login, create an OAuth 2.0 Client ID in Google Cloud Console.
5. In Google Cloud Console, add the Supabase callback as an authorized redirect URI:
   `https://<project-ref>.supabase.co/auth/v1/callback`
6. Enable **Google** in Supabase and save the Google Client ID and Client Secret.
7. In Supabase under **Authentication → URL Configuration**, add the app origins FleetOps returns to, for example:
   `http://localhost:5173/**` and `http://127.0.0.1:5173/**` locally, plus the deployed production URL.
8. The frontend redirects OAuth users to `window.location.origin`. These redirect URLs must be allow-listed in Supabase; Google redirects to Supabase's callback, not directly to the Vite origin.
9. Restart the Vite server after changing `.env`, then retry Google sign-in in an incognito window.

### Seed data and demo behavior

The seed migration adds ten drivers, vehicles, trips, ordered route points, and alerts. The frontend also contains matching local sample data in `src/data/mockFleetData.ts`.

In demo mode, coordinates and speeds are simulated locally every four seconds. Supabase is not required for the public product preview.

## Technical Decisions

- **Architecture:** React 19 components, TypeScript interfaces, conditional page views, and Vite.
- **Routing:** Focused application state switches between landing, setup, authentication, demo, and dashboard views; this keeps the prototype small and avoids unnecessary routing infrastructure.
- **Styling:** Tailwind CSS utilities plus a shared stylesheet for landing layouts, motion, responsive breakpoints, auth presentation, and reduced-motion support.
- **Backend:** Supabase provides PostgreSQL, authentication, session persistence, RLS, and browser database access.
- **Data mapping:** `src/services/fleetService.ts` converts database rows into typed frontend models.
- **Map choice:** React Leaflet and Leaflet provide markers, popups, status filters, route polylines, and smooth recentering.
- **Map provider:** OpenStreetMap-style client-side tiles require attribution and should be reviewed for production rate, privacy, and availability requirements.
- **Tradeoffs:** Local simulation is reliable for demonstrations but is not source-of-truth fleet telemetry. Supabase policies are suitable for recreation and evaluation; a production multi-tenant fleet deployment needs stronger ownership authorization.
- **Build:** The bundle may emit a large-chunk warning because mapping and dashboard dependencies share the initial bundle. Code splitting can be introduced as the application grows.

## AI Usage

AI tools used:

- **Claude and Google Antigravity* for React and TypeScript implementation, responsive design, animations, debugging, and documentation.

Review performed:

- TypeScript compilation with `npm run build`.
- Browser testing at desktop and mobile viewport sizes.
- Verification of navigation, authentication tabs, Google OAuth integration, contact scrolling, page transitions, and landing-page reveal effects.
- Review of SQL table names, joins, relationships, and frontend field mappings.
- Manual replacement of generated implementation details that conflicted with the actual project behavior.
- Secrets were kept out of source documentation; only environment variable names and public configuration concepts are recorded.

## Exported Chat and Walkthrough Links



- Development chat export: `TODO — add shareable session/chat link`
- Walkthrough/demo video: `TODO — add shareable walkthrough URL`


