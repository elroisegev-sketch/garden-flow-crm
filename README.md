# GardenFlow CRM

A lightweight CRM for landscaping and garden-care businesses. Track clients,
manage jobs through a simple pipeline (Lead → Scheduled → In Progress →
Completed), and see everything on a dashboard and schedule view.

Built with **Vite + React + TypeScript + Tailwind CSS**. Data is persisted in
the browser via `localStorage`, so the app runs entirely on the front end with
no backend or database to configure.

## Features

- **Dashboard** — client count, active jobs, pipeline value, and upcoming work.
- **Clients** — create, edit, and delete clients with contact details and notes.
- **Jobs** — full CRUD with status pipeline, scheduled date, price, and status
  filters.
- **Schedule** — jobs grouped by date.
- Seed data is loaded on first run so the app is immediately explorable.

## Getting started

Requires Node.js 20+ (developed on Node 22).

```bash
npm install      # install dependencies
npm run dev      # start the dev server on http://localhost:5173
```

## Scripts

| Command             | Description                                  |
| ------------------- | -------------------------------------------- |
| `npm run dev`       | Start the Vite dev server (port 5173).       |
| `npm run build`     | Type-check and build the production bundle.  |
| `npm run preview`   | Preview the production build (port 4173).    |
| `npm run lint`      | Run ESLint.                                  |
| `npm run typecheck` | Type-check without emitting.                 |

## Project structure

```
src/
  components/   Reusable UI (Layout, Modal, StatusBadge)
  context/      DataContext — app state + localStorage persistence
  lib/          storage + formatting helpers
  pages/        Dashboard, Clients, Jobs, Schedule
  types.ts      Shared domain types
```
