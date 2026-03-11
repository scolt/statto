# CLAUDE.md — Project Intelligence for Statto

> This file is the definitive reference for AI assistants (Claude, Copilot, etc.) working on this codebase.
> It captures architecture decisions, naming conventions, and patterns that are **not obvious from the code alone**.

---

## Project Overview

**Statto** is a real-time sports stat tracker built with **Next.js 16 (App Router)** and **React 19**.
Users create groups, invite players, start matches, report individual games with scores/marks, and view leaderboards.
An optional OpenAI integration generates humorous match summaries.

- **Live URL pattern**: `https://statto.app` (or local `http://localhost:3000`)
- **Primary use case**: Casual sports tracking between friends (squash, table tennis, darts, etc.)

---

## Tech Stack

| Layer            | Technology                                             |
| ---------------- | ------------------------------------------------------ |
| Framework        | Next.js 16.1 (App Router, React Server Components)    |
| React            | 19.2 (with `useOptimistic`, `useTransition`)           |
| Language         | TypeScript 5 (strict mode)                             |
| Styling          | Tailwind CSS 4 + shadcn/ui (new-york style)            |
| Database         | MySQL (via `mysql2`) + Drizzle ORM 0.45                |
| Auth             | Auth0 (`@auth0/nextjs-auth0` v4, server-side)          |
| i18n             | `next-intl` 4 (cookie-based locale, no URL prefix)     |
| Forms            | `react-hook-form` 7                                    |
| Icons            | `lucide-react`                                         |
| AI               | OpenAI (GPT-3.5-turbo) for match comments              |
| Bundler          | Next.js built-in (Turbopack in dev)                    |

---

## Directory Structure

```
statto/
├── app/                          # Next.js App Router pages & layouts
│   ├── layout.tsx                # Root layout (fonts, NextIntlClientProvider)
│   ├── page.tsx                  # Home — landing (unauth) / group list (auth)
│   ├── globals.css               # Tailwind config, CSS custom properties, utilities
│   ├── loading.tsx               # Root-level loading skeleton
│   ├── create-group/             # /create-group route
│   ├── profile/                  # /profile route
│   └── groups/
│       └── [groupId]/
│           ├── page.tsx          # Group detail (leaderboard + match list)
│           ├── edit/             # Group edit page
│           └── matches/
│               └── [matchId]/
│                   ├── page.tsx           # Match detail (server component)
│                   ├── MatchPageClient.tsx # Client wrapper (optimistic UI)
│                   └── select-players/    # Player selection step
│
├── features/                     # Feature-sliced modules (domain logic)
│   ├── groups/
│   │   ├── actions/              # Server actions ("use server")
│   │   ├── components/           # React components (server & client)
│   │   ├── queries/              # Data fetching functions ("use server")
│   │   ├── repository/           # Raw Drizzle DB queries (no auth checks)
│   │   └── index.ts              # Public barrel export
│   ├── matches/                  # Same structure
│   ├── players/                  # Same structure
│   └── sports/                   # Same structure
│
├── components/
│   ├── ui/                       # shadcn/ui primitives (button, card, dialog, etc.)
│   └── LocaleSwitcher/           # Shared app component
│
├── lib/
│   ├── auth0.ts                  # Auth0 client singleton + getCurrentUser helper
│   ├── auth/user-management.ts   # User/player provisioning on first login
│   ├── utils.ts                  # `cn()` utility (clsx + twMerge)
│   ├── services/
│   │   └── openai.service.ts     # OpenAI integration (match comment generation)
│   └── db/
│       ├── index.ts              # Drizzle client + MySQL pool (singleton)
│       ├── schema.ts             # Barrel re-export of all table schemas
│       ├── relations.ts          # Drizzle relation definitions
│       ├── schemas/              # Individual table definitions
│       │   ├── users.ts
│       │   ├── players.ts
│       │   ├── groups.ts
│       │   ├── sports.ts
│       │   ├── matches.ts
│       │   ├── games.ts
│       │   ├── game-scores.ts
│       │   ├── marks.ts
│       │   ├── game-marks.ts
│       │   ├── match-players.ts
│       │   └── players-groups.ts
│       └── migrations/           # Drizzle Kit SQL migrations
│
├── i18n/
│   ├── config.ts                 # Locale list (en, ru, nl), default locale
│   ├── request.ts                # next-intl server config (reads cookie)
│   ├── actions.ts                # setLocaleCookie server action
│   └── index.ts                  # Barrel export
│
├── messages/                     # Translation JSON files
│   ├── en.json                   # English (source of truth)
│   ├── ru.json                   # Russian
│   └── nl.json                   # Dutch
│
├── proxy.ts                      # Auth0 middleware proxy
├── global.d.ts                   # IntlMessages type declaration
├── drizzle.config.ts             # Drizzle Kit config (MySQL)
├── components.json               # shadcn/ui config
└── .env-example                  # Required environment variables
```

---

## Architecture Patterns

### Feature Modules (`features/`)

Each feature follows a **layered architecture**:

```
features/<domain>/
├── repository/     # Direct DB access via Drizzle. No auth checks, no redirects.
│                   # Functions are pure data access: findXxx, insertXxx, updateXxx, deleteXxx
├── queries/        # "use server" data-fetching functions. Called from server components.
│                   # Thin wrappers around repository; may transform/aggregate data.
├── actions/        # "use server" mutation functions. Called from client components/forms.
│                   # Always check auth (auth0.getSession), may redirect.
├── components/     # React components scoped to this feature.
│                   # Each component gets its own folder with index.ts barrel.
└── index.ts        # Public API — the ONLY import path other features should use.
```

**Import rules:**
- Pages (`app/`) import from `@/features/<domain>` (barrel) or `@/features/<domain>/components/<X>` for components not in barrel.
- Features import from other features **only via their barrel** `@/features/<other>/index.ts`.
- Repository functions are **private** to their feature — never imported cross-feature.

### Component Organization

```
features/<domain>/components/<ComponentName>/
├── <ComponentName>.component.tsx   # Implementation (named export, NOT default)
└── index.ts                        # Re-export: export { ComponentName } from "./ComponentName.component";
```

- **Server components** are `async function` (no `"use client"` directive). They can use `getTranslations()`.
- **Client components** have `"use client"` at top. They use `useTranslations()`.
- Props types are defined inline as `type Props = { ... }` at the top of the component file.
- Components use **named exports**, never default exports.

### Server vs Client Component Split

The project follows a strict RSC-first approach:
- **Pages** (`page.tsx`) are always server components. They fetch data and pass it as props.
- **Client wrappers** (e.g., `MatchPageClient.tsx`) are co-located in the same `app/` directory when needed.
- **Interactive components** (forms, modals, timers) are `"use client"`.
- Data is fetched at the page level and drilled down — no client-side fetching (no `useEffect` + fetch).

### Optimistic Updates (React 19)

The project uses React 19's `useOptimistic` pattern for real-time feel:
- `MatchPageClient.tsx` demonstrates the canonical pattern
- Server actions are called inside `startTransition()`
- `router.refresh()` is called after mutation to sync server state

---

## Database

### ORM: Drizzle

- **Schema location**: `lib/db/schemas/<table>.ts` — each table in its own file
- **Relations**: `lib/db/relations.ts` — all relation definitions in one file
- **Barrel**: `lib/db/schema.ts` — re-exports all tables
- **MySQL quirk**: `.returning()` is not supported — use `result[0].insertId` after inserts

### Data Model (simplified)

```
users (1:1) → players
players (M:N) → groups         [via players_groups]
groups (1:N) → matches
matches (M:N) → players        [via match_players]
matches (1:N) → games
games (1:N) → game_scores      [per player]
games (M:N) → marks            [via game_marks]
sports (1:N) → groups
```

### Key Design Decisions
- **Users vs Players**: A `user` is the Auth0 identity; a `player` is the in-app profile (with nickname). 1:1 relationship.
- **Serial IDs**: All tables use `serial()` (auto-increment bigint unsigned) as primary keys.
- **Join tables** (`match_players`, `players_groups`, `game_marks`) use composite primary keys.
- **Cascade deletes**: Games cascade from matches, scores cascade from games, etc.
- **Match status**: enum `'new' | 'in_progress' | 'paused' | 'done'`
- **Timer**: `duration` stores accumulated seconds; `timerStartedAt` tracks the current running segment.

### Migration Commands

```bash
npm run db:generate   # Generate migration SQL from schema changes
npm run db:push       # Push schema directly (dev only)
npm run db:migrate    # Run pending migrations
npm run db:studio     # Open Drizzle Studio GUI
```

---

## Authentication

- **Auth0** (server-side only via `@auth0/nextjs-auth0`)
- Auth routes are handled by Auth0 middleware: `/auth/login`, `/auth/logout`, `/auth/callback`
- `proxy.ts` acts as the middleware entry point
- `auth0.getSession()` — used in server components & actions to get the session
- `getCurrentUser()` — convenience wrapper in `lib/auth0.ts`
- **User provisioning**: On first login callback, `ensureUserAndPlayer()` creates both `user` and `player` records

---

## Internationalization (i18n)

- **Library**: `next-intl` v4
- **Strategy**: Cookie-based (`locale` cookie), no URL prefix
- **Supported locales**: `en` (default), `ru`, `nl`
- **Message files**: `messages/<locale>.json`
- **Type safety**: `global.d.ts` declares `IntlMessages` from `en.json`
- **Server**: `getTranslations()` from `next-intl/server`
- **Client**: `useTranslations()` from `next-intl`

### Adding a new locale:
1. Add locale code to `i18n/config.ts` → `locales` array
2. Create `messages/<locale>.json` (copy structure from `en.json`)

---

## Styling

- **Tailwind CSS 4** with `@tailwindcss/postcss`
- **shadcn/ui** (new-york style, RSC-compatible)
- **Design tokens** in `app/globals.css` using CSS custom properties (oklch color space)
- **Dark mode**: Supported via `.dark` class variant (not system-preference by default)
- **Custom utilities**:
  - `.text-gradient` — brand gradient text
  - `.card-hover` — subtle card lift on hover
  - `.glass` — frosted glass surface (used for sticky headers)
  - `.safe-top` / `.safe-bottom` — mobile safe area insets
- **Layout pattern**: `max-w-2xl mx-auto` container, `px-4 sm:px-6` horizontal padding
- **Brand color**: Violet/indigo (`oklch 270° hue`)

### Adding shadcn components:
```bash
npx shadcn@latest add <component>
```
Components land in `components/ui/`.

---

## Conventions & Rules

### Naming
- **Files**: kebab-case for directories, PascalCase for component files (`ComponentName.component.tsx`)
- **Barrel exports**: Every component folder has `index.ts`
- **Repository functions**: `findXxx`, `insertXxx`, `updateXxx`, `deleteXxx`
- **Action functions**: Verb-first (`createGroup`, `reportGame`, `deleteMatch`)
- **Query functions**: `getXxx` (e.g., `getGroupsForUser`, `getMatchDetail`)

### TypeScript
- Strict mode enabled
- Path alias `@/*` maps to project root
- Types exported from barrel `index.ts` alongside functions
- Prefer `type` over `interface` for props and data shapes

### Pages
- All pages are async server components
- Auth check at the top: `const session = await auth0.getSession(); if (!session) redirect("/auth/login");`
- Use `Promise.all` for parallel data fetching
- Dynamic params typed as `Promise<{ paramName: string }>` (Next.js 16 convention)
- Loading states in co-located `loading.tsx` with skeleton UI (Tailwind `animate-pulse`)

### Forms
- `react-hook-form` for client-side form state
- Server actions for mutations (via `startTransition`)
- Error display via `serverError` state or `FormMessage` component

### Imports Order (convention)
1. React / Next.js
2. Third-party libraries (`next-intl`, `lucide-react`)
3. Internal features (`@/features/...`)
4. Shared components (`@/components/...`)
5. Lib utilities (`@/lib/...`)
6. Relative imports

---

## Environment Variables

Required (see `.env-example`):

```
APP_BASE_URL          # e.g. http://localhost:3000
AUTH0_DOMAIN          # Auth0 tenant domain
AUTH0_CLIENT_ID       # Auth0 app client ID
AUTH0_CLIENT_SECRET   # Auth0 app client secret
AUTH0_SECRET          # Random secret for session encryption
MYSQL_PUBLIC_URL      # MySQL connection string
OPENAI_API_KEY        # OpenAI API key (optional — degrades gracefully)
```

---

## Common Tasks

### Run development server
```bash
npm run dev
```

### Add a new feature module
1. Create `features/<name>/` with `repository/`, `queries/`, `actions/`, `components/`, `index.ts`
2. Define DB schema in `lib/db/schemas/<table>.ts`
3. Add table export to `lib/db/schema.ts`
4. Add relations to `lib/db/relations.ts`
5. Update drizzle config if needed, run `npm run db:generate`

### Add a new page
1. Create `app/<route>/page.tsx` (async server component)
2. Create `app/<route>/loading.tsx` (skeleton)
3. Auth check at top, data fetching with `Promise.all`
4. Import components from feature barrels

### Add a new component
1. Create `features/<domain>/components/<Name>/<Name>.component.tsx`
2. Create `features/<domain>/components/<Name>/index.ts` with barrel export
3. Add to feature barrel `features/<domain>/index.ts` if it's part of the public API
4. Use `"use client"` only if the component needs interactivity

---

## Gotchas & Important Notes

1. **MySQL, not Postgres** — No `.returning()`, use `insertId`. Drizzle dialect is `mysql`.
2. **No API routes** — All mutations happen via server actions (`"use server"`).
3. **No client-side data fetching** — All data is fetched in server components and passed down.
4. **`proxy.ts` is the middleware** — Not named `middleware.ts` because Auth0 SDK requires this pattern.
5. **Locale is cookie-based** — Changing locale uses a server action that sets a cookie and revalidates.
6. **React 19 optimistic UI** — The `MatchPageClient` is the most complex client component; study it before modifying match behavior.
7. **OpenAI is optional** — If `OPENAI_API_KEY` is missing, the client is `null` and the feature degrades gracefully.
8. **Timer logic** — Duration is accumulated on pause/complete. `timerStartedAt` tracks the current running segment start time.
