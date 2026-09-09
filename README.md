# 🚆 Sanket — Smart Indian Railways Traffic & Maintenance Planning System

> **Next-Generation Intelligent Corridor Monitoring, Multi-Department Asset Management & Automated Maintenance Block Planning System.**  
> *Developed for Smart India Hackathon (SIH).*

---

[![Next.js](https://img.shields.io/badge/Next.js-16.3.4-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2.8-blue?style=for-the-badge&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![TanStack Query](https://img.shields.io/badge/TanStack_Query-v5-FF4154?style=for-the-badge&logo=react-query)](https://tanstack.com/query/latest)
[![Leaflet](https://img.shields.io/badge/Leaflet-GIS-199900?style=for-the-badge&logo=leaflet)](https://leafletjs.com/)

---

## 📖 Overview

**Sanket** is a mission-critical operations cockpit engineered for Indian Railways section controllers, station masters, and maintenance engineers. Operating railway networks requires coordinating fast-moving high-priority trains with vital civil, electrical, and signaling maintenance tasks.

Sanket bridges real-time timetable operations, infrastructure condition monitoring, and intelligent corridor block allocation to **minimize train delays while ensuring timely, safe maintenance**.

---

## ✨ Core Modules & Features

### 1. 🗺️ Corridor GIS & Real-Time Railway Map
- **Interactive Geospatial View**: Powered by Leaflet & React-Leaflet with optimized CartoDB Dark Matter / Mapbox tile layers.
- **Corridor & Section Selector**: Switch between railway divisions, sections, and routes dynamically.
- **Visual Corridor Occupancy**: Real-time rendering of train positions, scheduled corridors, active block windows, and track status.

### 2. 🚆 Train Operations & Traffic Management (`/trains`)
- **Multi-Category Fleet Support**: Priority-aware scheduling and movement tracking for:
  - **Vande Bharat** (Priority 10)
  - **Rajdhani Express** (Priority 10)
  - **Shatabdi Express** (Priority 10)
  - **Express / Superfast** (Priority 6–9)
  - **Passenger & Freight** (Priority 5)
- **Timetable & Schedule Management**: Full pagination, searching, and filtering of train schedules.
- **7-Day Running Bitmask**: Native handling of weekly recurring schedules via standard railway 7-digit binary patterns (`1111111` for daily, `1111100` for weekdays, etc.).
- **Operations & Movements Tracking**: Live delays, arrival/departure comparisons, and conflict checks.

### 3. 🏗️ Infrastructure Asset Management (`/assets`)
- **Multi-Department Categorization**:
  - **Engineering**: Tracks, rails, sleepers, ballast, civil structures, bridges.
  - **Signal & Telecom (S&T)**: Interlocking, points, signal units, communication nodes.
  - **Traction**: Overhead Electrification (OHE), power substations, mast poles.
- **Risk Assessment & Condition Scoring**: Risk levels ranging from Low (1) to Extreme (5) with status indicators.
- **Full Asset Lifecycle CRUD**: Create, edit, inspect, and retire assets with optimistic cache updates.

### 4. 🛠️ Intelligent Maintenance & Block Planning (`/maintenance`)
- **Automated Recommendation Engine**: Dedicated AI recommendations banner highlighting optimal, conflict-free block windows.
- **Task Prioritization**: Support for `CRITICAL`, `HIGH`, `MEDIUM`, and `LOW` urgency tasks with weighted scheduling scores.
- **End-to-End Plan Lifecycle**:
  ```text
  [DRAFT] ──> [PENDING_APPROVAL] ──> [APPROVED] ──> [IN_PROGRESS] ──> [COMPLETED]
       │               │                 │
       └──> [CANCELLED] └──> [REJECTED]   └──> [CANCELLED]
  ```
- **Corridor Conflict Prevention**: Automatically cross-references planned maintenance against scheduled trains and block windows to prevent traffic bottlenecks.

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Framework** | [Next.js 16](https://nextjs.org/) (App Router, Server Actions, React Compiler) |
| **Language & Runtime** | [TypeScript 5](https://www.typescriptlang.org/), [React 19](https://react.dev/), [Bun](https://bun.sh/) / Node.js 20+ |
| **Styling & UI** | [Tailwind CSS v4](https://tailwindcss.com/), [shadcn/ui](https://ui.shadcn.com/) / Base-UI, [Lucide React](https://lucide.dev/), CVA |
| **Data Fetching & Cache** | [TanStack React Query v5](https://tanstack.com/query/latest), [Axios](https://axios-http.com/) |
| **GIS & Mapping** | [Leaflet](https://leafletjs.com/), [React-Leaflet](https://react-leaflet.js.org/), CartoDB Dark Matter / Mapbox |
| **Charts & Analytics** | [Recharts](https://recharts.org/) |
| **Validation & Dates** | [Zod](https://zod.dev/), [date-fns](https://date-fns.org/) |

---

## 📁 Project Directory Structure

```text
frontend/
├── public/                     # Static assets, railway logos, and icons
├── src/
│   ├── actions/                # Next.js Server Actions for API mutations
│   │   ├── assets.ts           # Asset CRUD actions
│   │   ├── blocks.ts           # Block window allocation actions
│   │   ├── maintenance.ts      # Maintenance task & plan actions
│   │   ├── schedules.ts        # Train schedule actions
│   │   ├── sections.ts         # Section query actions
│   │   └── trains.ts           # Train fleet actions
│   ├── app/                    # Next.js App Router
│   │   ├── assets/             # Asset management page & skeletons
│   │   ├── maintenance/        # Maintenance planning & approval cockpit
│   │   ├── trains/             # Train operations & timetable page
│   │   ├── globals.css         # Tailwind CSS v4 theme variables
│   │   ├── layout.tsx          # Root layout & query client provider
│   │   └── page.tsx            # Main dashboard with GIS railway map
│   ├── components/
│   │   ├── dashboard/          # Dashboard components & recommendation banners
│   │   ├── map/                # Leaflet India railway map & corridor overlays
│   │   ├── navigation/         # Responsive sidebar & mobile drawer navbar
│   │   ├── notifications/      # Real-time notification drawer & alerts
│   │   ├── route-selector/     # Section & route selector controls
│   │   └── ui/                 # Reusable UI primitives (Dialog, Select, Table, etc.)
│   ├── hooks/                  # TanStack Query custom hooks (useRailwayQueries)
│   ├── lib/                    # Axios client, date parsing, and theme helpers
│   └── types/                  # TypeScript interfaces matching backend models
├── .env.example                # Sample environment configuration
├── components.json             # shadcn/ui configuration
├── ENUMS.md                    # Comprehensive reference of backend choices/enums
├── package.json                # Dependencies and npm scripts
└── tsconfig.json               # TypeScript configuration
```

---

## 🚀 Getting Started

### Prerequisites

Make sure you have installed:
- [Bun](https://bun.sh/) (Recommended) or [Node.js](https://nodejs.org/) (v20 or higher)
- [Git](https://git-scm.com/)

### 1. Clone the Repository

```bash
git clone <repository-url>
cd frontend
```

### 2. Install Dependencies

Using Bun (fastest):
```bash
bun install
```

Or using npm / pnpm:
```bash
npm install
# or
pnpm install
```

### 3. Configure Environment Variables

Create a `.env.local` or `.env` file by copying `.env.example`:

```bash
cp .env.example .env.local
```

Configure the following variables:

```env
# Backend API URLs (Django REST Framework)
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000
NEXT_PUBLIC_API_URL=http://localhost:8000/railways

# Map Configuration (Optional)
# Leave empty for free CartoDB Dark Matter tiles, or paste your CARTO / Mapbox API key:
NEXT_PUBLIC_CARTO_API_KEY=
# NEXT_PUBLIC_MAP_TILE_URL=https://api.mapbox.com/styles/v1/mapbox/dark-v11/tiles/{z}/{x}/{y}?access_token=YOUR_MAPBOX_TOKEN
```

> **Note:** The API client automatically normalizes endpoint URLs with DRF-compatible trailing slashes (e.g. `/railways/tasks/`).

### 4. Run the Development Server

```bash
bun dev
# or
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to view the application.

---

## 📜 Available Scripts

In the project directory, you can run:

| Command | Description |
| :--- | :--- |
| `bun dev` / `npm run dev` | Starts the development server on port 3000 with Hot Module Replacement (HMR). |
| `bun run build` / `npm run build` | Compiles and builds the production application. |
| `bun run start` / `npm start` | Starts the Next.js production server. |
| `bun run lint` / `npm run lint` | Runs ESLint to check for code quality and syntax issues. |

---

## 🔌 API & Enums Reference

The frontend tightly pairs with the Django REST Framework backend models. For a complete dictionary of database choices, weights, status lifecycles, and sample API payloads, refer to:

👉 **[`ENUMS.md`](./ENUMS.md)**

Key Enums Covered:
- **Asset Department**: `ENGINEERING`, `SNT`, `TRACTION`
- **Maintenance Priority**: `CRITICAL` (Weight 40.0), `HIGH` (30.0), `MEDIUM` (20.0), `LOW` (10.0)
- **Task Statuses**: `PENDING`, `SCHEDULED`, `COMPLETED`, `CANCELLED`, `DELAYED`
- **Plan Lifecycle**: `DRAFT` ➔ `PENDING_APPROVAL` ➔ `APPROVED` ➔ `IN_PROGRESS` ➔ `COMPLETED`
- **Train Categories**: `VB`, `SHATABDI`, `RAJDHANI`, `EXPRESS`, `PASSENGER`, `FREIGHT`
- **Running Days Pattern**: 7-character string (Monday–Sunday, e.g. `1111111`)

---

## 🛡️ Best Practices & Architecture Highlights

- **Hydration Safety**: Map and route selectors use client hydration skeletons to prevent SSR mismatches with Leaflet browser APIs.
- **Optimistic UI Updates**: TanStack Query mutations invalidate and optimistically update asset and task caches immediately upon user actions.
- **Mobile Responsive Drawer**: Sticky mobile header with drawer overlay that prevents backdrop scroll and layout bleed.
- **Dark Cockpit Theme**: Tailored for 24/7 operations control centers with high-contrast status pills and accessible indicators.

---

## 👥 Authors & Acknowledgements

- Built for the **Smart India Hackathon (SIH)**.
- Designed and engineered for Indian Railways operational excellence.
