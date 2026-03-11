# AGENTS.md — AI Agent Instructions for Statto

> Guidelines and rules for AI coding agents (GitHub Copilot, Cursor, Windsurf, CodeMie, etc.)
> working in the Statto codebase. Follow these instructions to produce consistent,
> production-ready code that aligns with existing patterns.

---

## Quick Context

Statto is a **Next.js 16 App Router** sports stat tracking app using **React 19**, **TypeScript**,
**Tailwind CSS 4**, **shadcn/ui**, **Drizzle ORM** (MySQL), **Auth0**, and **next-intl**.

Read `CLAUDE.md` for full architecture details. This file focuses on **actionable rules**.

---

## ⚡ Critical Rules (Never Break These)

### 1. Server Components by Default
- Every `page.tsx` **must** be an `async` server component — no `"use client"`.
- Only add `"use client"` to components that need hooks, event handlers, or browser APIs.
- Data fetching happens **only** in server components and is passed as props.

### 2. Auth Check on Every Page
```tsx
const session = await auth0.getSession();
if (!session) redirect("/auth/login");
```
This must be at the **top** of every authenticated page before any data fetching.

### 3. Auth Check in Every Server Action
```tsx
const session = await auth0.getSession();
if (!session?.user) {
  redirect("/auth/login");
}
```
Every `"use server"` action that mutates data must verify auth first.

### 4. Never Import Repository Functions Cross-Feature
```tsx
// ❌ WRONG
import { findGroupById } from "@/features/groups/repository/groups.repository";

// ✅ RIGHT
import { getGroupById } from "@/features/groups";
```
Repositories are private to their feature module. Use the barrel `index.ts` exports.

### 5. Named Exports Only
```tsx
// ❌ WRONG
export default function MyComponent() { ... }

// ✅ RIGHT
export function MyComponent() { ... }
```
Exception: `page.tsx`, `layout.tsx`, `loading.tsx` use default exports (Next.js requirement).

---

## 📁 File Creation Rules

### New Component
```
features/<domain>/components/<ComponentName>/
├── <ComponentName>.component.tsx    # Named export, PascalCase
└── index.ts                         # export { ComponentName } from "./ComponentName.component";
```

### New Server Action
- File: `features/<domain>/actions/<action-name>.ts`
- Must start with `"use server";`
- Must check auth before mutations
- Export types alongside the function in the feature barrel

### New Query
- File: `features/<domain>/queries/<query-name>.ts`
- May use `"use server";` directive
- Calls repository functions, may aggregate/transform data
- No auth checks (caller is responsible)

### New Repository Function
- File: `features/<domain>/repository/<domain>.repository.ts`
- Pure Drizzle queries — no auth, no redirects, no `"use server"`
- Naming: `findXxx`, `insertXxx`, `updateXxx`, `deleteXxxById`

### New Page
```
app/<route>/
├── page.tsx       # Async server component with auth check
└── loading.tsx    # Skeleton with animate-pulse
```

### New DB Schema Table
1. Create `lib/db/schemas/<table-name>.ts`
2. Export from `lib/db/schema.ts`
3. Add relations in `lib/db/relations.ts`
4. Run `npm run db:generate`

---

## 🎨 Styling Rules

### Layout
- Container: `mx-auto w-full max-w-2xl`
- Horizontal padding: `px-4 sm:px-6`
- Vertical page padding: `py-6 sm:py-8`
- Section spacing: `mb-6` or `mb-8`

### Headers (Sticky Glass Pattern)
```tsx
<header className="sticky top-0 z-30 glass border-b safe-top">
  <div className="mx-auto flex h-14 max-w-2xl items-center px-4 sm:px-6">
    {/* Back button + title + actions */}
  </div>
</header>
```

### Cards
- Use `rounded-2xl border bg-card p-4` for card containers
- Add `card-hover` class for clickable cards (links)
- Use `rounded-xl` for inner elements, `rounded-lg` for smaller ones

### Typography
- Page title: `text-2xl font-bold tracking-tight sm:text-3xl`
- Section heading: `text-lg font-semibold`
- Sub-label: `text-xs font-semibold uppercase tracking-wider text-muted-foreground`
- Body text: `text-sm text-muted-foreground`

### Icons
- Use `lucide-react` exclusively
- Standard sizes: `size-4` (inline), `size-4.5` (header nav), `size-5` (emphasis), `size-10` (empty states)
- Always add `aria-label` on icon-only buttons

### Colors
- Primary actions: `bg-primary text-primary-foreground`
- Destructive: `text-destructive` or `variant="destructive"`
- Muted text: `text-muted-foreground`
- Subtle backgrounds: `bg-primary/10`, `bg-muted`
- Brand gradient: use `.text-gradient` utility class

### Loading Skeletons
- Use `animate-pulse rounded bg-muted` for skeleton blocks
- Match the layout of the actual page content
- Keep it simple — no Skeleton component needed, just divs

---

## 🌐 Internationalization Rules

### Adding New Text
1. Add the key to `messages/en.json` first (this is the source of truth)
2. Add translations to `messages/ru.json` and `messages/nl.json`
3. Type safety is automatic via `global.d.ts`

### Using Translations
```tsx
// Server component
import { getTranslations } from "next-intl/server";
const t = await getTranslations();
t('groups.title')

// Client component
import { useTranslations } from "next-intl";
const t = useTranslations();
t('groups.title')
```

### Translation Key Structure
```
<domain>.<key>          → groups.title, matches.match
<domain>.<nested>.<key> → matches.status.new, matches.statusLabel.done
```

---

## 🗄️ Database Rules

### Drizzle Conventions
- Always destructure the result: `const [result] = await db.insert(...).values(...)`;
- Get ID after insert: `result.insertId` (MySQL — no `.returning()`)
- Use `eq()`, `and()`, `or()`, `inArray()` from `drizzle-orm`
- Batch queries to avoid N+1: use `findXxxByIds()` patterns

### Foreign Keys
- Use `bigint('column_name', { mode: 'number', unsigned: true })` for FK columns
- Column names in DB: snake_case (e.g., `group_id`, `player_id`)
- Column names in code: camelCase (Drizzle mapping)

### Join Tables
- Use composite primary keys: `primaryKey({ columns: [table.col1, table.col2] })`
- Always add `onDelete: 'cascade'` on both FK references

---

## ⚛️ React Patterns

### Parallel Data Fetching
```tsx
// ✅ Always parallelize independent queries
const [data1, data2, t] = await Promise.all([
  fetchData1(),
  fetchData2(),
  getTranslations(),
]);
```

### Optimistic Updates
```tsx
const [optimisticState, setOptimistic] = useOptimistic(serverState, reducer);

startTransition(async () => {
  setOptimistic(newValue);
  await serverAction();
  router.refresh();
});
```

### Form Pattern (Client Components)
```tsx
const [isPending, startTransition] = useTransition();
const [serverError, setServerError] = useState<string>();
const form = useForm<FormValues>({ defaultValues: { ... } });

function onSubmit(values: FormValues) {
  startTransition(async () => {
    const result = await serverAction(values);
    if (result?.error) setServerError(result.error);
  });
}
```

### Button Loading State
```tsx
<Button type="submit" disabled={isPending}>
  {isPending && <Loader2 className="animate-spin" />}
  {isPending ? t('common.saving') : t('common.save')}
</Button>
```

---

## 🧪 Testing Considerations

Currently no test setup. If adding tests:
- Unit tests for repository functions (mock `db`)
- Integration tests for server actions
- Component tests with React Testing Library
- E2E tests with Playwright

---

## 🚫 Anti-Patterns to Avoid

| ❌ Don't                                              | ✅ Do Instead                                           |
| ------------------------------------------------------ | ------------------------------------------------------- |
| `useEffect` + `fetch` for data                         | Fetch in server component, pass as props                |
| Import from `repository/` across features              | Import from feature barrel `index.ts`                   |
| `export default` for components                        | `export function ComponentName`                         |
| Inline styles or CSS modules                           | Tailwind utility classes                                |
| `interface` for props                                  | `type Props = { ... }`                                  |
| Fetch data sequentially when independent               | `Promise.all([...])` for parallel                       |
| Add `"use client"` to components that don't need it    | Keep as server components                               |
| Create API route handlers                              | Use server actions (`"use server"`)                     |
| Use `any` type                                         | Proper TypeScript types                                 |
| Hardcode user-facing strings                           | Use `t('key')` from next-intl                           |
| Use Postgres-specific features (`.returning()`)        | Use MySQL `insertId` pattern                            |

---

## 📋 Checklist Before Submitting Changes

- [ ] Auth check present on new pages and server actions
- [ ] New user-facing strings added to **all 3** message files (en, ru, nl)
- [ ] New components follow `ComponentName.component.tsx` + `index.ts` pattern
- [ ] New exports added to feature barrel `index.ts`
- [ ] Loading skeleton created for new pages (`loading.tsx`)
- [ ] `Promise.all` used for parallel data fetching
- [ ] No `"use client"` on components that don't need interactivity
- [ ] Proper TypeScript types (no `any`)
- [ ] Accessible: `aria-label` on icon buttons, semantic HTML
- [ ] Mobile-first responsive design (test at 375px width)
- [ ] Dark mode works (check custom properties in `globals.css`)
