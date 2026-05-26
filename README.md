# WorkLink — Frontend (`sepfe_G31`)

[![CI](https://github.com/he170794kieudinhdoan-lang/sepfe_G31/actions/workflows/ci.yml/badge.svg)](https://github.com/he170794kieudinhdoan-lang/sepfe_G31/actions/workflows/ci.yml)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)
![Vite](https://img.shields.io/badge/Vite-7-646CFF?logo=vite)
![TailwindCSS](https://img.shields.io/badge/Tailwind-4-06B6D4?logo=tailwindcss)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript)

Frontend for **WorkLink** — an AI-powered job matching platform for the Vietnamese labor market.

> Built as the Software Engineering Project (SEP) — Group 31.

**Live demo**: connected to the backend's AI matching engine — candidates receive ranked job recommendations based on semantic vector similarity, not keyword filtering.

---

## Tech Stack

| Category | Technology |
|---|---|
| Framework | React 19 (concurrent features) |
| Build tool | Vite 7 |
| Styling | Tailwind CSS 4 + Shadcn/UI (Radix primitives) |
| Routing | React Router v7 |
| Server state | TanStack Query v5 (caching, background refetch) |
| Forms | React Hook Form + Zod validation |
| Rich text editor | TipTap (job description editor with formatting toolbar) |
| Calendar | FullCalendar (interview schedule management) |
| Charts | Recharts (employer dashboard analytics) |
| Real-time | Supabase Realtime (live notifications) |
| HTTP client | Axios |
| Image upload | react-easy-crop |
| Carousel | Embla Carousel |
| Toast | Sonner |
| Testing | Vitest + Testing Library + MSW (API mocking) |
| Linting | ESLint 9 + TypeScript-ESLint |
| Deploy | Vercel / Railway |

---

## Key Features

| Feature | Implementation |
|---|---|
| AI Job Matching | Calls backend vector-search API — results ranked by Gemini embedding similarity |
| Real-time Notifications | Supabase Realtime subscriptions — zero-polling |
| Interview Scheduling | FullCalendar with drag-and-drop, employer invite flow |
| Rich Job Descriptions | TipTap editor — bold, italic, lists, images, text alignment |
| Employer Dashboard | Recharts graphs — application trends, view counts, wallet balance |
| Point Wallet | SePay QR payment integration, real-time order status |
| Profile Setup | Multi-step form with image crop, occupation picker, shift preferences |

---

## Project Structure

```
src/
  app/            # route definitions, global providers
  assets/         # static assets (images, fonts)
  components/     # shared generic UI components (Button, Input, etc.)
  features/       # feature modules — collocated components + hooks + api calls
  lib/            # axios instance, cn() utility, constants
  pages/          # page-level components (routed)
  shared/         # shared layouts, types, guards
  main.jsx        # entry point
```

Each feature in `src/features/` is self-contained:

```
features/jobs/
  components/   # UI specific to job feature
  hooks/        # data-fetching hooks (useQuery wrappers)
  api/          # axios calls + query key factories
```

---

## Prerequisites

- Node.js 18+
- npm or pnpm

## Setup & Run

```bash
# Install dependencies
pnpm install       # or: npm install

# Copy environment file
cp .env.example .env
```

Required `.env` variables:

```env
VITE_API_URL=http://localhost:4000/api
VITE_APP_TITLE=WORKLINK
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
VITE_AUTH_SOCIAL_GOOGLE_CLIENT_ID=
VITE_PROVINCES_API_URL=https://provinces.open-api.vn/api/v2
```

```bash
pnpm dev          # development server → http://localhost:3000
pnpm build        # production build → dist/
pnpm preview      # preview production build locally
```

## Testing

```bash
pnpm test                  # run all unit tests
pnpm test -- --coverage    # with coverage report
```

Tests use **MSW** to mock API responses at the network level — no manual fetch mocking required.

## Linting

```bash
pnpm lint          # ESLint check
```

---

## Backend

This frontend requires the [WorkLink Backend](https://github.com/minhtt22-26/sepbe_G31) for all data APIs including the AI matching engine.
