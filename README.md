# Build by: Malak Nashwan

# Ridgeline — Hiking Dashboard

A multi-page hiking dashboard built with **React, TypeScript and Vite**. Explore alpine trails on a live map, follow a route by hovering its elevation profile, check live weather, and track a year of hiking stats — in **English and Arabic (full RTL)**, light and dark.

## Features

| Page | What it shows |
|---|---|
| **Login / Sign up** | Cinematic full-bleed photo (+ optional video loop) with rotating headline slides, validated form, password reveal, remember-me, sign-up mode, demo "Continue with Google", protected routes |
| **Dashboard** | KPI tiles with trends + sparklines, monthly activity chart (6M / 12M), live weather with 5-day forecast, yearly goal ring, 18-week activity heatmap, recent hikes table |
| **Explore** | Interactive Leaflet map with all trails, search (synced to the URL), difficulty filters, sorting, list ↔ map hover highlighting |
| **Trail detail** | Route drawn on a topographic map, **elevation chart synced with the map** (hover the chart, a marker follows the route), live weather for the trail, reviews, save trail |
| **My hikes** | Full activity log: period filter, search, totals, monthly chart, pace, pagination, **log a hike** modal (persisted) |
| **Planner** | Month calendar with planned and completed hikes, plan form (pre-filled from a trail page), upcoming list with countdowns, packing checklist |
| **Saved** | Saved trails grid with quick plan / remove |
| **Notifications** | Topbar panel: upcoming plan, goal progress, achievements, seasonal tip, unread badge |
| **Profile** | Editable details, language / theme / units / yearly goal preferences, achievements with progress |

**Also:**
- **Languages:** Arabic ⇄ English with real RTL layout, using CSS logical properties throughout.
- **Units:** metric ⇄ imperial everywhere, including charts and weather.
- **Theme:** dark mode (manual or following the system), with a dark map basemap.
- **Performance:** route-level code splitting, so the map and chart libraries only load on the pages that use them.
- **Loading and error handling:** skeletons, plus an error state with a retry button for the weather.
- **Accessibility:** focus styles, ARIA roles on segmented controls and tabs, and support for `prefers-reduced-motion`.
- **Responsive:** sidebar on desktop, an icon rail on tablets and a bottom tab bar on phones.

## Tech

React 18 · TypeScript (strict) · React Router 6 · Recharts · Leaflet / react-leaflet · lucide-react · Open-Meteo API (free, no key) · plain CSS with design tokens

## Run

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # type-check + production build
```

## Your media

Put your own files in `public/media/` (full list and sources in `public/media/PUT-YOUR-MEDIA-HERE.txt`):

| File | Used for |
|---|---|
| `login.jpg` | Login background |
| `login.mp4` | Optional login video loop |
| `hero.jpg` | Lauberhorn Ridge cover, featured card |
| `hiker.jpg` | Trail gallery |
| `trails/<trail-id>.jpg` | Optional cover per trail |

Anything missing falls back to a demo photo or a generated illustrated cover.

## Fonts

General Sans (Fontshare) for Latin, Alexandria for Arabic, JetBrains Mono for labels.

## Project structure

```
src/
  pages/            Login, Dashboard, Explore, TrailDetail, Saved, Hikes, Planner, Profile, NotFound
  components/
    layout/         AppShell (sidebar, topbar, page loader)
    charts/         ActivityChart, ElevationChart, Sparkline, Heatmap, GoalRing
    map/            ExploreMap, RouteMap, shared tiles/pins
    weather/        WeatherCard (live Open-Meteo data)
    ui/             Card, Segmented, TrailCover, SmartImg, Brand
  context/          AuthContext (session + protected routes), SettingsContext (lang, theme, units, i18n),
                    UserDataContext (logged hikes, plans, saved trails, checklist — persisted)
  data/             trails, generated hike history, types
  i18n/             en.ts, ar.ts (typed — a missing Arabic key is a compile error)
  lib/              formatting, weather API, geo + seeded random helpers
  styles/           global.css (tokens, light/dark, RTL, responsive)
```

## Notes

- **Mock data:** authentication and hike history are simulated, and the history is generated from a seeded random so it is identical on every load. Swap `AuthContext` and `data/activity.ts` for a real API.
- **Trails:** start points are real Swiss locations; the routes and elevation profiles are generated for the demo.
- **Map tiles:** © OpenStreetMap contributors, OpenTopoMap, CARTO.

## Deploy

- **Vercel:** works as-is (`vercel.json` includes the SPA rewrite).
- **Netlify:** works as-is (`public/_redirects` handles routing).
