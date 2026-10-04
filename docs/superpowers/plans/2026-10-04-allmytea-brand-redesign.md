# AllmyTea Brand Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebrand the AllmyTea landing page and staff portal with the real Facebook logo and a single visual system, add path routing with a PIN gate for `/staff/*`, replace fake in-browser customer ordering with a Messenger/phone handoff, make the production build ship its images, and delete the dead legacy inventory code.

**Architecture:** Restyle in place. Every view keeps its state and handlers; only markup, classes, and copy change. Shared staff primitives (`Panel`, `PageHeader`, `KpiCard`, `StatusBadge`, `EmptyState`) are extracted from markup already repeated across views. The landing page is split into section components under `customer/sections/` with cart state staying in the parent. Three pure modules (`useRoute` parsing, `storeHours`, `messengerOrder`) carry the only non-visual logic and are unit tested with vitest.

**Tech Stack:** React 19, Vite 8, Tailwind CSS 4 (`@theme` tokens), TypeScript 7, Radix dialog/label/separator/slot (already installed), lucide-react, vitest (added). No router library.

**Spec:** `docs/superpowers/specs/2026-10-04-allmytea-brand-redesign-design.md`

## Global Constraints

- No new runtime dependencies. Only `vitest` is added, as a devDependency.
- Color tokens exactly: `brand-500 #F2B64B`, `brand-700 #C98A2E`, `brown-700 #7A3E12`, `brown-900 #2B1B10`, `cream-50 #FFF8EC`, `stone-100 #F4F2EE`, `stone-300 #E4DFD6`. Status: preparing `#2563EB`, ready `#15803D`, cancelled/waste `#B91C1C`, pending = `brand-500`.
- Fonts: Fraunces (display, landing only), Plus Jakarta Sans (everything else), JetBrains Mono (order numbers and receipts only).
- Radius: panels 10px (`rounded-panel`), controls 6px (`rounded-control`), status pills `rounded-full`. No card shadows; shadows only on dialogs, drawers, and the mobile sticky cart bar.
- Copy: sentence case; no all-caps labels; no `A · B · C` strings; no arrows in button text; buttons name the action ("Order on Messenger", "Mark ready", "Add stock").
- The store is in Malabon City. Any remaining "Diffun" string is a bug.
- Routes: `/`, `/staff/pos`, `/staff/kds`, `/staff/inventory`, `/staff/orders`, `/staff/analytics`. Unknown staff tab → `pos`. Any other path → landing.
- PIN: `STORE_INFO.staffPin = '2023'`; unlocked flag in `sessionStorage['allmytea.staff']`.
- Messenger page handle: `AllMyTeaBurgerMilktea`. Phone: `0920 293 9976`, `tel:09202939976`.
- Every task ends with `npm run lint` passing. Tasks that add tests end with `npm test` passing.
- Commit messages are plain prose. Co-author trailer: `Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>`.
- Windows host, Git Bash shell. Use forward slashes; `rm`, `mkdir -p`, `cp` work.

## Review Focus

1. **1:00 AM boundary and the previous day's overnight service.** At 12:30 AM the store is still open on yesterday's 4 PM–1 AM window; at exactly 1:00 AM it is closed. Pinned in Task 5 tests.
2. **Malformed hours string** (owner edits `schedule` to `"Closed"` or `"4PM-1AM"`). Expected: chip shows "Hours unavailable", nothing throws. Pinned in Task 5.
3. **Special instructions containing `&`, `#`, or a newline** must survive the Messenger URL. Pinned in Task 6.
4. **Trailing slash and uppercase paths** (`/staff/kds/`, `/Staff/KDS`) should land on the kitchen view, not the landing page. Pinned in Task 4.
5. **Empty cart "Order on Messenger"** opens Messenger with a greeting only, never `Total: ₱0`. Pinned in Task 6.

---

### Task 1: Test tooling, brand tokens, fonts, button variants

**Files:**
- Modify: `package.json`
- Modify: `src/index.css`
- Modify: `index.html`
- Modify: `src/components/ui/button.tsx`
- Create: `src/lib/tokens.test.ts`

**Interfaces:**
- Produces: Tailwind utilities `bg-brand-500`, `bg-brand-700`, `bg-brown-700`, `bg-brown-900`, `bg-cream-50`, `bg-stone-100`, `border-stone-300`, `text-stone-500`, `text-stone-700`, `bg-status-preparing`, `bg-status-ready`, `bg-status-danger`, `font-display`, `rounded-panel`, `rounded-control`, CSS class `hero-enter`. Button variants `default | brand | outline | secondary | ghost | link | destructive`.

- [ ] **Step 1: Add vitest and the test script**

Run:
```bash
npm install --save-dev vitest@^3.2.0
```
Then edit `package.json` scripts to add `"test": "vitest run"` after `"lint"`. Confirm `package.json` now has no `esbuild`, `express`, `dotenv`, `tsx`, `@google/genai`, `motion`, `autoprefixer`, `@radix-ui/react-select`, `@radix-ui/react-dropdown-menu` (pruned earlier; this task commits that prune).

- [ ] **Step 2: Write a failing smoke test**

Create `src/lib/tokens.test.ts`:
```ts
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

describe('brand tokens', () => {
  const css = readFileSync(resolve(__dirname, '../index.css'), 'utf8');

  it('defines the brand palette exactly', () => {
    expect(css).toContain('--color-brand-500: #F2B64B');
    expect(css).toContain('--color-brand-700: #C98A2E');
    expect(css).toContain('--color-brown-700: #7A3E12');
    expect(css).toContain('--color-brown-900: #2B1B10');
    expect(css).toContain('--color-cream-50: #FFF8EC');
    expect(css).toContain('--color-stone-100: #F4F2EE');
    expect(css).toContain('--color-stone-300: #E4DFD6');
  });

  it('defines radius and font tokens', () => {
    expect(css).toContain('--radius-panel: 10px');
    expect(css).toContain('--radius-control: 6px');
    expect(css).toContain("--font-display: 'Fraunces'");
  });

  it('no longer carries the unused shadcn variable block', () => {
    expect(css).not.toContain('--popover-foreground');
    expect(css).not.toContain('.dark');
  });
});
```

- [ ] **Step 3: Run test to verify it fails**

Run: `npm test -- src/lib/tokens.test.ts`
Expected: FAIL on `--color-brand-500`.

- [ ] **Step 4: Replace `src/index.css`**

Overwrite the whole file:
```css
@import "tailwindcss";

@theme {
  /* Brand, taken from the Facebook logo */
  --color-brand-500: #F2B64B;
  --color-brand-700: #C98A2E;
  --color-brown-700: #7A3E12;
  --color-brown-900: #2B1B10;
  --color-cream-50: #FFF8EC;

  /* Warm neutrals for the staff portal (override Tailwind's cool stone) */
  --color-stone-100: #F4F2EE;
  --color-stone-200: #ECE8E1;
  --color-stone-300: #E4DFD6;
  --color-stone-500: #8A8178;
  --color-stone-700: #5C544D;

  /* Order and stock status */
  --color-status-pending: #F2B64B;
  --color-status-preparing: #2563EB;
  --color-status-ready: #15803D;
  --color-status-danger: #B91C1C;

  --font-sans: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;
  --font-display: 'Fraunces', Georgia, 'Times New Roman', serif;
  --font-mono: 'JetBrains Mono', ui-monospace, SFMono-Regular, monospace;

  --radius-panel: 10px;
  --radius-control: 6px;
}

@layer base {
  html {
    font-variant-numeric: tabular-nums;
  }

  body {
    @apply bg-white text-brown-900 font-sans antialiased;
  }

  .font-display {
    font-variation-settings: 'SOFT' 80, 'opsz' 72;
    letter-spacing: -0.02em;
  }
}

/* Single landing-page load moment: the hero logo disc settles into place. */
@keyframes hero-enter {
  from { opacity: 0; transform: scale(0.96); }
  to   { opacity: 1; transform: scale(1); }
}

.hero-enter {
  animation: hero-enter 400ms ease-out both;
}

@media (prefers-reduced-motion: reduce) {
  .hero-enter {
    animation: none;
  }
}
```

- [ ] **Step 5: Update `index.html`**

Replace the `<title>`, description, OG tags, font link, and body tag so the head reads:
```html
<title>AllmyTea — Burger & Milktea House, Malabon</title>
<meta name="description" content="AllmyTea Burger & Milktea House, 105 Yanga St., Maysilo, Malabon City. Burgers, milk tea, ramen overload, sushi and sizzling meals. Open 4:00 PM to 1:00 AM daily. Order on Messenger." />
<meta property="og:title" content="AllmyTea — Burger & Milktea House, Malabon" />
<meta property="og:description" content="Burgers, milk tea, ramen overload, sushi and sizzling meals. Open 4:00 PM to 1:00 AM daily. Order on Messenger." />
<meta property="og:type" content="website" />
<meta property="og:image" content="/og-image.jpg" />
<meta name="twitter:card" content="summary" />
<link rel="icon" type="image/jpeg" href="/favicon.jpg" />
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght,SOFT@9..144,400..700,0..100&family=JetBrains+Mono:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
```
and the body tag becomes `<body>` (no classes; `index.css` styles it).

- [ ] **Step 6: Rewrite button variants in `src/components/ui/button.tsx`**

Replace the `cva(...)` call (lines 6–35) with:
```ts
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-control text-sm font-semibold transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-brown-700 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-brown-700 text-white hover:bg-brown-900 active:bg-brown-900",
        brand: "bg-brand-500 text-brown-900 hover:bg-brand-700 active:bg-brand-700",
        destructive: "bg-status-danger text-white hover:bg-red-800 active:bg-red-900",
        outline: "border border-stone-300 bg-white text-brown-900 hover:bg-stone-100",
        secondary: "bg-stone-100 text-brown-900 hover:bg-stone-200",
        ghost: "text-stone-700 hover:bg-stone-100 hover:text-brown-900",
        link: "text-brown-700 underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 px-3 text-xs",
        lg: "h-11 px-6 text-base",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);
```

- [ ] **Step 7: Run tests and lint**

Run: `npm test && npm run lint`
Expected: 3 tests pass; tsc clean.

- [ ] **Step 8: Start the dev server and eyeball**

Run: `npm run dev` (background). Open `http://localhost:3000`. Buttons that use `<Button>` default now render brown. Nothing else changes yet. Stop the server.

- [ ] **Step 9: Commit**

```bash
git add package.json package-lock.json src/index.css index.html src/components/ui/button.tsx src/lib/tokens.test.ts
git commit -m "feat: add brand tokens, Fraunces display font, vitest, and brand button variants

Also commits the earlier dependency prune (removed esbuild pin, express, dotenv, tsx, genai, motion, autoprefixer, unused radix packages).

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---

### Task 2: Real logo asset, image module, favicon, delete old JPGs

**Files:**
- Create: `src/assets/images/allmytea-logo.jpg` (copy of the Facebook profile picture)
- Create: `src/assets/images/index.ts`
- Create: `public/favicon.jpg`, `public/og-image.jpg`
- Modify: `src/components/AllMyTeaHeader.tsx:33`
- Modify: `src/components/customer/CustomerLandingPage.tsx:185,260,615,631`
- Modify: `src/components/pos/PosView.tsx:134`
- Delete: `src/assets/images/allmytea_logo_badge_1791083133659.jpg`, `allmytea_hero_spread_1791083118808.jpg`, `allmytea_cafe_dining_1791083640193.jpg`

**Interfaces:**
- Produces: `import { logo } from '@/src/assets/images'` → hashed URL string.

- [ ] **Step 1: Fetch the logo**

The Facebook Graph picture endpoint redirects to the CDN file without a token:
```bash
curl -sL --max-time 30 "https://graph.facebook.com/AllMyTeaBurgerMilktea/picture?width=1080&height=1080" -o src/assets/images/allmytea-logo.jpg
file src/assets/images/allmytea-logo.jpg
```
Expected: `JPEG image data ... 545x545`. If the scratchpad copy from the design session still exists at `%TEMP%/claude/.../scratchpad/fb_logo_large.jpg`, copying it is equivalent.

- [ ] **Step 2: Create the public copies**

```bash
mkdir -p public
cp src/assets/images/allmytea-logo.jpg public/favicon.jpg
cp src/assets/images/allmytea-logo.jpg public/og-image.jpg
```

- [ ] **Step 3: Create the image module**

`src/assets/images/index.ts`:
```ts
// Import images as modules so Vite hashes and copies them into dist/.
// Never reference /src/assets/... by string path: that only works in dev.
export { default as logo } from './allmytea-logo.jpg';
```

- [ ] **Step 4: Replace the six string-path usages**

In `src/components/AllMyTeaHeader.tsx` add `import { logo } from '@/src/assets/images';` and change line 33 to `src={logo}`.

In `src/components/customer/CustomerLandingPage.tsx` add the same import; change lines 185 and 631 to `src={logo}`. Delete the hero `<img>` block at lines 258–264 (the `<div className="absolute inset-0 z-0">` wrapper and its gradient child stay for now; they go in Task 11). Delete the cafe photo `<div className="lg:col-span-5">…</div>` at lines 612–620.

In `src/components/pos/PosView.tsx` delete the `<img … />` at lines 133–138 (the banner is removed entirely in Task 12; for now only the broken image goes).

- [ ] **Step 5: Delete the old JPGs**

```bash
git rm -q src/assets/images/allmytea_logo_badge_1791083133659.jpg src/assets/images/allmytea_hero_spread_1791083118808.jpg src/assets/images/allmytea_cafe_dining_1791083640193.jpg
grep -rn "allmytea_" src || echo "no references left"
```
Expected: `no references left`.

- [ ] **Step 6: Verify build ships the logo**

Run: `npm run lint && npm run build && ls dist/assets/*.jpg && ls dist/favicon.jpg dist/og-image.jpg`
Expected: exactly one `allmytea-logo-<hash>.jpg` in `dist/assets`; both public files present.

- [ ] **Step 7: Commit**

```bash
git add -A src/assets public src/components/AllMyTeaHeader.tsx src/components/customer/CustomerLandingPage.tsx src/components/pos/PosView.tsx
git commit -m "fix: ship the real AllmyTea logo through Vite imports and add favicon

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---

### Task 3: Delete the dead legacy inventory code

**Files:**
- Delete: 17 files listed below

- [ ] **Step 1: Confirm nothing live imports them**

```bash
for n in AnalyticsView BarcodeSvg ImportCsvModal InventoryTable ItemDetailModal ItemFormModal LowStockView MovementsLogView StatSummaryCards StockAdjustmentModal TopBar; do
  grep -rln "/$n'" src --include="*.ts" --include="*.tsx" | grep -v "src/components/$n.tsx" | grep -vE "src/components/(AnalyticsView|BarcodeSvg|ImportCsvModal|InventoryTable|ItemDetailModal|ItemFormModal|LowStockView|MovementsLogView|StatSummaryCards|StockAdjustmentModal|TopBar).tsx" && echo "LIVE IMPORT OF $n" || true
done
grep -rn "ui/badge\|ui/tabs\|types/inventory\|utils/storage'\|utils/csv\|data/initialData" src | grep -vE "src/components/(AnalyticsView|BarcodeSvg|ImportCsvModal|InventoryTable|ItemDetailModal|ItemFormModal|LowStockView|MovementsLogView|StatSummaryCards|StockAdjustmentModal|TopBar).tsx|src/(types/inventory|utils/storage|utils/csv|data/initialData).ts" || echo "only dead files import dead files"
```
Expected: no `LIVE IMPORT` lines; final echo prints.

- [ ] **Step 2: Delete**

```bash
git rm -q src/components/AnalyticsView.tsx src/components/BarcodeSvg.tsx src/components/ImportCsvModal.tsx src/components/InventoryTable.tsx src/components/ItemDetailModal.tsx src/components/ItemFormModal.tsx src/components/LowStockView.tsx src/components/MovementsLogView.tsx src/components/StatSummaryCards.tsx src/components/StockAdjustmentModal.tsx src/components/TopBar.tsx src/components/ui/badge.tsx src/components/ui/tabs.tsx src/types/inventory.ts src/utils/storage.ts src/utils/csv.ts src/data/initialData.ts
```

- [ ] **Step 3: Verify**

Run: `npm run lint && npm run build && grep -r "types/inventory\|initialData\|utils/storage" src || echo clean`
Expected: lint and build pass; `clean`.

- [ ] **Step 4: Commit**

```bash
git commit -m "chore: remove unused legacy inventory components, types, and utilities

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---

### Task 4: Path routing hook

**Files:**
- Create: `src/hooks/useRoute.ts`
- Create: `src/hooks/useRoute.test.ts`

**Interfaces:**
- Produces:
  ```ts
  export const STAFF_TABS: readonly ['pos','kds','inventory','orders','analytics'];
  export type StaffTab = 'pos' | 'kds' | 'inventory' | 'orders' | 'analytics';
  export type Route = { kind: 'landing' } | { kind: 'staff'; tab: StaffTab };
  export function parsePath(pathname: string): Route;
  export function pathFor(route: Route): string;
  export function useRoute(): [Route, (route: Route) => void];
  ```

- [ ] **Step 1: Write failing tests**

`src/hooks/useRoute.test.ts`:
```ts
import { describe, it, expect } from 'vitest';
import { parsePath, pathFor, STAFF_TABS } from './useRoute';

describe('parsePath', () => {
  it('maps / to landing', () => {
    expect(parsePath('/')).toEqual({ kind: 'landing' });
  });

  it('maps every staff tab', () => {
    for (const tab of STAFF_TABS) {
      expect(parsePath(`/staff/${tab}`)).toEqual({ kind: 'staff', tab });
    }
  });

  it('defaults /staff and unknown staff tabs to pos', () => {
    expect(parsePath('/staff')).toEqual({ kind: 'staff', tab: 'pos' });
    expect(parsePath('/staff/nope')).toEqual({ kind: 'staff', tab: 'pos' });
  });

  it('tolerates trailing slashes and uppercase', () => {
    expect(parsePath('/staff/kds/')).toEqual({ kind: 'staff', tab: 'kds' });
    expect(parsePath('/Staff/KDS')).toEqual({ kind: 'staff', tab: 'kds' });
  });

  it('sends any other path to landing', () => {
    expect(parsePath('/anything')).toEqual({ kind: 'landing' });
    expect(parsePath('/menu/burgers')).toEqual({ kind: 'landing' });
  });
});

describe('pathFor', () => {
  it('round-trips every route', () => {
    const routes = [{ kind: 'landing' as const }, ...STAFF_TABS.map((tab) => ({ kind: 'staff' as const, tab }))];
    for (const route of routes) {
      expect(parsePath(pathFor(route))).toEqual(route);
    }
  });

  it('produces canonical paths', () => {
    expect(pathFor({ kind: 'landing' })).toBe('/');
    expect(pathFor({ kind: 'staff', tab: 'orders' })).toBe('/staff/orders');
  });
});
```

- [ ] **Step 2: Run to verify failure**

Run: `npm test -- src/hooks/useRoute.test.ts`
Expected: FAIL, cannot resolve `./useRoute`.

- [ ] **Step 3: Implement**

`src/hooks/useRoute.ts`:
```ts
import { useCallback, useEffect, useState } from 'react';

export const STAFF_TABS = ['pos', 'kds', 'inventory', 'orders', 'analytics'] as const;
export type StaffTab = (typeof STAFF_TABS)[number];

export type Route = { kind: 'landing' } | { kind: 'staff'; tab: StaffTab };

function isStaffTab(value: string): value is StaffTab {
  return (STAFF_TABS as readonly string[]).includes(value);
}

export function parsePath(pathname: string): Route {
  const parts = pathname.toLowerCase().split('/').filter(Boolean);
  if (parts[0] !== 'staff') return { kind: 'landing' };
  const tab = parts[1] ?? '';
  return { kind: 'staff', tab: isStaffTab(tab) ? tab : 'pos' };
}

export function pathFor(route: Route): string {
  return route.kind === 'landing' ? '/' : `/staff/${route.tab}`;
}

/**
 * Minimal history routing. Reads window.location.pathname once, keeps the
 * address bar canonical, and follows the back/forward buttons.
 */
export function useRoute(): [Route, (route: Route) => void] {
  const [route, setRoute] = useState<Route>(() => parsePath(window.location.pathname));

  useEffect(() => {
    const canonical = pathFor(parsePath(window.location.pathname));
    if (window.location.pathname !== canonical) {
      window.history.replaceState(null, '', canonical);
    }
    const onPopState = () => setRoute(parsePath(window.location.pathname));
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  const navigate = useCallback((next: Route) => {
    const path = pathFor(next);
    if (path !== window.location.pathname) {
      window.history.pushState(null, '', path);
    }
    setRoute(next);
    window.scrollTo({ top: 0 });
  }, []);

  return [route, navigate];
}
```

- [ ] **Step 4: Run tests**

Run: `npm test -- src/hooks/useRoute.test.ts && npm run lint`
Expected: 7 tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/hooks
git commit -m "feat: add dependency-free path routing hook for staff screens

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---

### Task 5: Store hours status

**Files:**
- Create: `src/lib/storeHours.ts`
- Create: `src/lib/storeHours.test.ts`
- Modify: `src/data/allMyTeaData.ts:3-22` (add `staffPin`, typed schedule)

**Interfaces:**
- Produces:
  ```ts
  export interface DaySchedule { day: string; hours: string }
  export interface StoreStatus { open: boolean; label: string }
  export function parseClock(text: string): number | null;          // "4:00 PM" → 960
  export function parseHours(text: string): { opens: number; closes: number } | null;
  export function getStoreStatus(now: Date, schedule: DaySchedule[], timeZone?: string): StoreStatus;
  ```
- Also: `STORE_INFO.staffPin: string`.

- [ ] **Step 1: Write failing tests**

`src/lib/storeHours.test.ts`. Manila is UTC+8 with no DST, so `HH:MMZ` + 8 h is Manila wall time.
```ts
import { describe, it, expect } from 'vitest';
import { getStoreStatus, parseClock, parseHours, type DaySchedule } from './storeHours';

const DAILY: DaySchedule[] = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday']
  .map((day) => ({ day, hours: '4:00 PM - 1:00 AM' }));

// 2026-10-05 is a Monday. Manila = UTC+8.
const manila = (hhmm: string, dayOffset = 0) => {
  const [h, m] = hhmm.split(':').map(Number);
  const utcHour = h - 8;
  return new Date(Date.UTC(2026, 9, 5 + dayOffset, utcHour, m, 0));
};

describe('parseClock', () => {
  it('parses 12-hour clock text to minutes since midnight', () => {
    expect(parseClock('4:00 PM')).toBe(16 * 60);
    expect(parseClock('1:00 AM')).toBe(60);
    expect(parseClock('12:00 AM')).toBe(0);
    expect(parseClock('12:30 PM')).toBe(12 * 60 + 30);
  });

  it('returns null for garbage', () => {
    expect(parseClock('4PM')).toBeNull();
    expect(parseClock('Closed')).toBeNull();
  });
});

describe('parseHours', () => {
  it('splits an opening range', () => {
    expect(parseHours('4:00 PM - 1:00 AM')).toEqual({ opens: 960, closes: 60 });
  });
  it('returns null when either side is unreadable', () => {
    expect(parseHours('Closed')).toBeNull();
    expect(parseHours('4PM-1AM')).toBeNull();
  });
});

describe('getStoreStatus with a 4:00 PM to 1:00 AM day', () => {
  it('is closed at 3:59 PM and opens at 4:00 PM', () => {
    expect(getStoreStatus(manila('15:59'), DAILY)).toEqual({ open: false, label: 'Closed, opens 4:00 PM' });
    expect(getStoreStatus(manila('16:00'), DAILY)).toEqual({ open: true, label: 'Open now, closes 1:00 AM' });
  });

  it('stays open late in the evening', () => {
    expect(getStoreStatus(manila('23:30'), DAILY).open).toBe(true);
  });

  it('is still open after midnight on the previous day\'s service', () => {
    expect(getStoreStatus(manila('00:30', 1), DAILY)).toEqual({ open: true, label: 'Open now, closes 1:00 AM' });
  });

  it('closes at exactly 1:00 AM', () => {
    expect(getStoreStatus(manila('01:00', 1), DAILY).open).toBe(false);
    expect(getStoreStatus(manila('01:01', 1), DAILY)).toEqual({ open: false, label: 'Closed, opens 4:00 PM' });
  });

  it('reports unavailable hours instead of throwing on a malformed entry', () => {
    const broken = DAILY.map((d) => ({ ...d, hours: 'Closed' }));
    expect(getStoreStatus(manila('18:00'), broken)).toEqual({ open: false, label: 'Hours unavailable' });
  });

  it('respects the time zone argument', () => {
    // 16:00 Manila is 08:00 UTC; evaluated in UTC the store is closed.
    expect(getStoreStatus(manila('16:00'), DAILY, 'UTC').open).toBe(false);
  });
});
```

- [ ] **Step 2: Run to verify failure**

Run: `npm test -- src/lib/storeHours.test.ts`
Expected: FAIL, module not found.

- [ ] **Step 3: Implement**

`src/lib/storeHours.ts`:
```ts
export interface DaySchedule {
  day: string;
  hours: string;
}

export interface StoreStatus {
  open: boolean;
  label: string;
}

const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

/** "4:00 PM" → 960 (minutes since midnight). null when unreadable. */
export function parseClock(text: string): number | null {
  const match = /^\s*(\d{1,2}):(\d{2})\s*(AM|PM)\s*$/i.exec(text);
  if (!match) return null;
  let hours = Number(match[1]);
  const minutes = Number(match[2]);
  const meridiem = match[3].toUpperCase();
  if (hours < 1 || hours > 12 || minutes > 59) return null;
  if (hours === 12) hours = 0;
  if (meridiem === 'PM') hours += 12;
  return hours * 60 + minutes;
}

/** "4:00 PM - 1:00 AM" → { opens: 960, closes: 60 }. null when unreadable. */
export function parseHours(text: string): { opens: number; closes: number } | null {
  const parts = text.split('-');
  if (parts.length !== 2) return null;
  const opens = parseClock(parts[0]);
  const closes = parseClock(parts[1]);
  if (opens === null || closes === null) return null;
  return { opens, closes };
}

function formatClock(minutes: number): string {
  const h24 = Math.floor(minutes / 60) % 24;
  const m = minutes % 60;
  const meridiem = h24 >= 12 ? 'PM' : 'AM';
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
  return `${h12}:${String(m).padStart(2, '0')} ${meridiem}`;
}

function localParts(now: Date, timeZone: string): { weekday: string; minutes: number } {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    weekday: 'long',
    hour: 'numeric',
    minute: 'numeric',
    hourCycle: 'h23',
  }).formatToParts(now);
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? '';
  return { weekday: get('weekday'), minutes: Number(get('hour')) * 60 + Number(get('minute')) };
}

function scheduleFor(schedule: DaySchedule[], weekday: string) {
  const entry = schedule.find((d) => d.day === weekday);
  return entry ? parseHours(entry.hours) : null;
}

/**
 * Open/closed status at `now`, evaluated in the store's time zone.
 * A range whose close is at or before its open (4:00 PM - 1:00 AM) runs past midnight,
 * so the early hours of a day belong to the previous day's service.
 */
export function getStoreStatus(
  now: Date,
  schedule: DaySchedule[],
  timeZone = 'Asia/Manila',
): StoreStatus {
  const { weekday, minutes } = localParts(now, timeZone);
  const today = scheduleFor(schedule, weekday);
  if (!today) return { open: false, label: 'Hours unavailable' };

  const overnight = today.closes <= today.opens;

  // Still inside yesterday's overnight window?
  const yesterdayName = WEEKDAYS[(WEEKDAYS.indexOf(weekday) + 6) % 7];
  const yesterday = scheduleFor(schedule, yesterdayName);
  if (yesterday && yesterday.closes <= yesterday.opens && minutes < yesterday.closes) {
    return { open: true, label: `Open now, closes ${formatClock(yesterday.closes)}` };
  }

  const openNow = overnight
    ? minutes >= today.opens
    : minutes >= today.opens && minutes < today.closes;

  return openNow
    ? { open: true, label: `Open now, closes ${formatClock(today.closes)}` }
    : { open: false, label: `Closed, opens ${formatClock(today.opens)}` };
}
```

- [ ] **Step 4: Add `staffPin` and type the schedule in `src/data/allMyTeaData.ts`**

Add at the top of the file: `import type { DaySchedule } from '../lib/storeHours';`
Change `schedule: [` to `schedule: [` with the array typed by adding after the closing `]`: ` as DaySchedule[]`. Add `staffPin: '2023',` directly after `taxRate: 0,`.

- [ ] **Step 5: Run tests and lint**

Run: `npm test && npm run lint`
Expected: all pass.

- [ ] **Step 6: Commit**

```bash
git add src/lib/storeHours.ts src/lib/storeHours.test.ts src/data/allMyTeaData.ts
git commit -m "feat: compute live store open status from the schedule in Manila time

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---

### Task 6: Messenger order message

**Files:**
- Create: `src/lib/messengerOrder.ts`
- Create: `src/lib/messengerOrder.test.ts`

**Interfaces:**
- Produces:
  ```ts
  export const MESSENGER_PAGE = 'AllMyTeaBurgerMilktea';
  export type CustomerOrderType = 'pick-up' | 'delivery';
  export interface OrderDetails { orderType: CustomerOrderType; name: string; phone: string; address?: string; note?: string }
  export function describeCustomization(c: OrderCustomization): string;
  export function buildOrderMessage(cart: CartItem[], details: OrderDetails): string;
  export function messengerUrl(message: string): string;
  ```

- [ ] **Step 1: Write failing tests**

`src/lib/messengerOrder.test.ts`:
```ts
import { describe, it, expect } from 'vitest';
import type { CartItem } from '../types/allmytea';
import { buildOrderMessage, describeCustomization, messengerUrl, MESSENGER_PAGE } from './messengerOrder';

const burger: CartItem = {
  cartItemId: 'c1', menuItemId: 'bgr-1', name: 'Classic Cheeseburger', category: 'Burgers',
  unitPrice: 89, quantity: 2, subtotal: 178, customization: {},
};
const milkTea: CartItem = {
  cartItemId: 'c2', menuItemId: 'mt-1', name: 'Wintermelon Milk Tea', category: 'Milk Tea & Coffee',
  unitPrice: 95, quantity: 1, subtotal: 95,
  customization: { size: '22oz', sugarLevel: '50%', iceLevel: 'Less Ice', addons: [{ name: 'Black Pearl (Boba)', price: 15 }] },
};

describe('describeCustomization', () => {
  it('lists size, sugar, ice, add-ons, spice, and note in that order', () => {
    expect(describeCustomization({
      size: '16oz', sugarLevel: '25%', iceLevel: 'No Ice',
      addons: [{ name: 'Egg Pudding', price: 15 }, { name: 'Crushed Oreo', price: 15 }],
      spiciness: 'Extra Spicy', specialInstructions: 'no straw',
    })).toBe('16oz, 25% sugar, No Ice, + Egg Pudding, + Crushed Oreo, Extra Spicy, note: no straw');
  });
  it('is empty when nothing is customised', () => {
    expect(describeCustomization({})).toBe('');
  });
});

describe('buildOrderMessage', () => {
  it('formats a pick-up order', () => {
    const msg = buildOrderMessage([burger, milkTea], { orderType: 'pick-up', name: 'Ana', phone: '0917 000 0000' });
    expect(msg).toBe([
      "Hi AllmyTea! I'd like to order:",
      '2x Classic Cheeseburger — ₱178',
      '1x Wintermelon Milk Tea (22oz, 50% sugar, Less Ice, + Black Pearl (Boba)) — ₱95',
      'Total: ₱273',
      'Pick-up',
      'Name: Ana, Phone: 0917 000 0000',
    ].join('\n'));
  });

  it('formats delivery with address and note', () => {
    const msg = buildOrderMessage([burger], {
      orderType: 'delivery', name: 'Ben', phone: '0918 111 2222',
      address: '12 Yanga St., Maysilo', note: 'Gate is blue & has a #3',
    });
    expect(msg).toContain('Delivery to 12 Yanga St., Maysilo');
    expect(msg.endsWith('Note: Gate is blue & has a #3')).toBe(true);
  });

  it('omits the note line when empty or whitespace', () => {
    const msg = buildOrderMessage([burger], { orderType: 'pick-up', name: 'Cy', phone: '0', note: '   ' });
    expect(msg).not.toContain('Note:');
  });

  it('sends a greeting only for an empty cart', () => {
    expect(buildOrderMessage([], { orderType: 'pick-up', name: '', phone: '' })).toBe(
      "Hi AllmyTea! I'd like to place an order.",
    );
  });
});

describe('messengerUrl', () => {
  it('targets the page and encodes the message', () => {
    const url = messengerUrl('Line 1\nTotal: ₱273 & more #tag');
    expect(url.startsWith(`https://m.me/${MESSENGER_PAGE}?text=`)).toBe(true);
    expect(url).toContain('%0A');
    expect(url).toContain('%E2%82%B1');
    expect(url).toContain('%26');
    expect(url).toContain('%23');
    expect(url).not.toContain(' ');
  });
});
```

- [ ] **Step 2: Run to verify failure**

Run: `npm test -- src/lib/messengerOrder.test.ts`
Expected: FAIL, module not found.

- [ ] **Step 3: Implement**

`src/lib/messengerOrder.ts`:
```ts
import type { CartItem, OrderCustomization } from '../types/allmytea';

export const MESSENGER_PAGE = 'AllMyTeaBurgerMilktea';

export type CustomerOrderType = 'pick-up' | 'delivery';

export interface OrderDetails {
  orderType: CustomerOrderType;
  name: string;
  phone: string;
  address?: string;
  note?: string;
}

const peso = (n: number) => `₱${n.toLocaleString('en-PH')}`;

export function describeCustomization(c: OrderCustomization): string {
  const parts: string[] = [];
  if (c.size) parts.push(c.size);
  if (c.sugarLevel) parts.push(`${c.sugarLevel} sugar`);
  if (c.iceLevel) parts.push(c.iceLevel);
  for (const addon of c.addons ?? []) parts.push(`+ ${addon.name}`);
  if (c.spiciness) parts.push(c.spiciness);
  if (c.specialInstructions?.trim()) parts.push(`note: ${c.specialInstructions.trim()}`);
  return parts.join(', ');
}

export function buildOrderMessage(cart: CartItem[], details: OrderDetails): string {
  if (cart.length === 0) return "Hi AllmyTea! I'd like to place an order.";

  const lines = ["Hi AllmyTea! I'd like to order:"];
  for (const item of cart) {
    const detail = describeCustomization(item.customization);
    lines.push(`${item.quantity}x ${item.name}${detail ? ` (${detail})` : ''} — ${peso(item.subtotal)}`);
  }
  const total = cart.reduce((sum, item) => sum + item.subtotal, 0);
  lines.push(`Total: ${peso(total)}`);
  lines.push(details.orderType === 'delivery' ? `Delivery to ${details.address?.trim() ?? ''}` : 'Pick-up');
  lines.push(`Name: ${details.name.trim()}, Phone: ${details.phone.trim()}`);
  if (details.note?.trim()) lines.push(`Note: ${details.note.trim()}`);
  return lines.join('\n');
}

export function messengerUrl(message: string): string {
  return `https://m.me/${MESSENGER_PAGE}?text=${encodeURIComponent(message)}`;
}
```

- [ ] **Step 4: Run tests and lint**

Run: `npm test && npm run lint`
Expected: all pass. (`toLocaleString('en-PH')` renders 178 as `178`; thousands get commas, which is what the receipt shows too.)

- [ ] **Step 5: Commit**

```bash
git add src/lib/messengerOrder.ts src/lib/messengerOrder.test.ts
git commit -m "feat: build Messenger order text and deep link from the customer cart

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---

### Task 7: Staff primitives

**Files:**
- Create: `src/components/staff/Panel.tsx`
- Create: `src/components/staff/PageHeader.tsx`
- Create: `src/components/staff/KpiCard.tsx`
- Create: `src/components/staff/StatusBadge.tsx`
- Create: `src/components/staff/EmptyState.tsx`

**Interfaces:**
- Produces:
  ```tsx
  <Panel padded? className?>children</Panel>
  <PageHeader title description? actions? />
  <KpiCard label value hint? tone?: 'default'|'warn'|'good' />
  <StatusBadge status: OrderStatus | StockMovement['type'] | 'low' />
  <EmptyState title hint? action? />
  ```

- [ ] **Step 1: Panel**

`src/components/staff/Panel.tsx`:
```tsx
import React from 'react';
import { cn } from '@/src/lib/utils';

interface PanelProps extends React.HTMLAttributes<HTMLDivElement> {
  padded?: boolean;
}

/** White bordered surface. The only container staff views use. */
export const Panel: React.FC<PanelProps> = ({ padded = false, className, children, ...rest }) => (
  <div
    className={cn('bg-white border border-stone-300 rounded-panel overflow-hidden', padded && 'p-4', className)}
    {...rest}
  >
    {children}
  </div>
);
```

- [ ] **Step 2: PageHeader**

`src/components/staff/PageHeader.tsx`:
```tsx
import React from 'react';

interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
}

export const PageHeader: React.FC<PageHeaderProps> = ({ title, description, actions }) => (
  <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
    <div>
      <h1 className="text-[22px] font-bold leading-tight text-brown-900">{title}</h1>
      {description && <p className="mt-1 text-[13px] text-stone-700">{description}</p>}
    </div>
    {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
  </div>
);
```

- [ ] **Step 3: KpiCard**

`src/components/staff/KpiCard.tsx`:
```tsx
import React from 'react';
import { cn } from '@/src/lib/utils';
import { Panel } from './Panel';

interface KpiCardProps {
  label: string;
  value: React.ReactNode;
  hint?: string;
  tone?: 'default' | 'warn' | 'good';
}

const toneClass: Record<NonNullable<KpiCardProps['tone']>, string> = {
  default: 'text-brown-900',
  warn: 'text-brown-700',
  good: 'text-status-ready',
};

export const KpiCard: React.FC<KpiCardProps> = ({ label, value, hint, tone = 'default' }) => (
  <Panel padded>
    <p className="text-[13px] text-stone-700">{label}</p>
    <p className={cn('mt-1 text-[30px] font-bold leading-none', toneClass[tone])}>{value}</p>
    {hint && <p className="mt-2 text-[13px] text-stone-500">{hint}</p>}
  </Panel>
);
```

- [ ] **Step 4: StatusBadge**

`src/components/staff/StatusBadge.tsx`:
```tsx
import React from 'react';
import type { OrderStatus, StockMovement } from '../../types/allmytea';

type Status = OrderStatus | StockMovement['type'] | 'low';

const STYLES: Record<Status, { label: string; className: string }> = {
  pending:    { label: 'Pending',    className: 'bg-brand-500/20 text-brown-700' },
  preparing:  { label: 'Preparing',  className: 'bg-blue-100 text-blue-800' },
  ready:      { label: 'Ready',      className: 'bg-green-100 text-green-800' },
  completed:  { label: 'Completed',  className: 'bg-stone-100 text-stone-700' },
  cancelled:  { label: 'Cancelled',  className: 'bg-red-100 text-red-800' },
  in:         { label: 'Stock in',   className: 'bg-green-100 text-green-800' },
  out:        { label: 'Used',       className: 'bg-stone-100 text-stone-700' },
  spoilage:   { label: 'Waste',      className: 'bg-red-100 text-red-800' },
  adjustment: { label: 'Adjusted',   className: 'bg-blue-100 text-blue-800' },
  low:        { label: 'Low',        className: 'bg-brand-500/20 text-brown-700' },
};

export const StatusBadge: React.FC<{ status: Status }> = ({ status }) => {
  const s = STYLES[status];
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[12px] font-semibold ${s.className}`}>
      {s.label}
    </span>
  );
};
```

- [ ] **Step 5: EmptyState**

`src/components/staff/EmptyState.tsx`:
```tsx
import React from 'react';

interface EmptyStateProps {
  title: string;
  hint?: string;
  action?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ title, hint, action }) => (
  <div className="flex flex-col items-center justify-center gap-2 px-6 py-10 text-center">
    <p className="text-[15px] font-semibold text-brown-900">{title}</p>
    {hint && <p className="max-w-xs text-[13px] text-stone-700">{hint}</p>}
    {action && <div className="mt-2">{action}</div>}
  </div>
);
```

- [ ] **Step 6: Lint and commit**

Run: `npm run lint`
```bash
git add src/components/staff
git commit -m "feat: add shared staff portal primitives

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---

### Task 8: StaffHeader and PinGate

**Files:**
- Create: `src/components/staff/StaffHeader.tsx`
- Create: `src/components/staff/PinGate.tsx`

**Interfaces:**
- Consumes: `StaffTab` from Task 4; `logo` from Task 2; `STORE_INFO.staffPin` from Task 5.
- Produces:
  ```tsx
  <StaffHeader tab onNavigate(tab: StaffTab) onGoHome() pendingCount lowStockCount cashierName onReset() onSignOut() />
  <PinGate onUnlock() />
  export function isStaffUnlocked(): boolean; export function unlockStaff(): void; export function lockStaff(): void;
  ```

- [ ] **Step 1: PinGate with session helpers**

`src/components/staff/PinGate.tsx`:
```tsx
import React, { useEffect, useState } from 'react';
import { Delete } from 'lucide-react';
import { STORE_INFO } from '../../data/allMyTeaData';
import { logo } from '@/src/assets/images';

const KEY = 'allmytea.staff';

export function isStaffUnlocked(): boolean {
  try { return sessionStorage.getItem(KEY) === '1'; } catch { return false; }
}
export function unlockStaff(): void {
  try { sessionStorage.setItem(KEY, '1'); } catch { /* private mode: stay unlocked for this render only */ }
}
export function lockStaff(): void {
  try { sessionStorage.removeItem(KEY); } catch { /* nothing to clear */ }
}

const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'back'] as const;

export const PinGate: React.FC<{ onUnlock: () => void }> = ({ onUnlock }) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);

  const press = (key: string) => {
    setError(false);
    if (key === 'back') return setPin((p) => p.slice(0, -1));
    if (!/^\d$/.test(key) || pin.length >= 4) return;
    setPin((p) => p + key);
  };

  useEffect(() => {
    if (pin.length !== 4) return;
    if (pin === STORE_INFO.staffPin) {
      unlockStaff();
      onUnlock();
    } else {
      setError(true);
      setPin('');
    }
  }, [pin, onUnlock]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Backspace') press('back');
      else if (/^\d$/.test(e.key)) press(e.key);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  return (
    <main className="min-h-screen bg-stone-100 flex items-center justify-center p-6">
      <div className="w-full max-w-xs bg-white border border-stone-300 rounded-panel p-6 text-center">
        <img src={logo} alt="" className="mx-auto h-16 w-16 rounded-full" />
        <h1 className="mt-4 text-[22px] font-bold text-brown-900">Staff only</h1>
        <p className="mt-1 text-[13px] text-stone-700">Enter the 4-digit PIN.</p>

        <div className="mt-5 flex justify-center gap-3" aria-label="PIN entry" role="status">
          {[0, 1, 2, 3].map((i) => (
            <span
              key={i}
              className={`h-3 w-3 rounded-full border ${i < pin.length ? 'bg-brown-700 border-brown-700' : 'border-stone-300'}`}
            />
          ))}
        </div>
        <p className={`mt-2 h-4 text-[13px] text-status-danger ${error ? '' : 'invisible'}`}>Wrong PIN</p>

        <div className="mt-3 grid grid-cols-3 gap-2">
          {KEYS.map((k, i) =>
            k === '' ? (
              <span key={i} />
            ) : (
              <button
                key={i}
                type="button"
                onClick={() => press(k)}
                aria-label={k === 'back' ? 'Delete last digit' : k}
                className="h-12 rounded-control border border-stone-300 bg-white text-[17px] font-semibold text-brown-900 hover:bg-stone-100 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-brown-700"
              >
                {k === 'back' ? <Delete className="mx-auto h-5 w-5" /> : k}
              </button>
            ),
          )}
        </div>
      </div>
    </main>
  );
};
```

- [ ] **Step 2: StaffHeader**

`src/components/staff/StaffHeader.tsx`:
```tsx
import React, { useEffect, useState } from 'react';
import { MoreHorizontal } from 'lucide-react';
import type { StaffTab } from '../../hooks/useRoute';
import { logo } from '@/src/assets/images';
import { Button } from '../ui/button';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '../ui/dialog';

interface StaffHeaderProps {
  tab: StaffTab;
  onNavigate: (tab: StaffTab) => void;
  onGoHome: () => void;
  pendingCount: number;
  lowStockCount: number;
  cashierName: string;
  onReset: () => void;
  onSignOut: () => void;
}

const TABS: { id: StaffTab; label: string }[] = [
  { id: 'pos', label: 'POS' },
  { id: 'kds', label: 'Kitchen' },
  { id: 'inventory', label: 'Stock' },
  { id: 'orders', label: 'Orders' },
  { id: 'analytics', label: 'Reports' },
];

function useClock() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 30_000);
    return () => window.clearInterval(id);
  }, []);
  return now.toLocaleTimeString('en-PH', { hour: 'numeric', minute: '2-digit' });
}

export const StaffHeader: React.FC<StaffHeaderProps> = ({
  tab, onNavigate, onGoHome, pendingCount, lowStockCount, cashierName, onReset, onSignOut,
}) => {
  const time = useClock();
  const [menuOpen, setMenuOpen] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);

  const countFor = (id: StaffTab) => (id === 'kds' ? pendingCount : id === 'inventory' ? lowStockCount : 0);

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-stone-300">
      <div className="mx-auto flex h-14 max-w-7xl items-center gap-4 px-4 sm:px-6 lg:px-8">
        <button type="button" onClick={onGoHome} className="flex items-center gap-2.5 shrink-0" title="Open the customer page">
          <img src={logo} alt="" className="h-8 w-8 rounded-full" />
          <span className="text-[15px] font-bold text-brown-900">AllmyTea <span className="font-medium text-stone-700">Staff</span></span>
        </button>

        <nav className="flex flex-1 items-center gap-1 overflow-x-auto" aria-label="Staff screens">
          {TABS.map(({ id, label }) => {
            const active = tab === id;
            const count = countFor(id);
            return (
              <button
                key={id}
                type="button"
                onClick={() => onNavigate(id)}
                aria-current={active ? 'page' : undefined}
                className={`flex items-center gap-1.5 whitespace-nowrap rounded-control px-3 py-1.5 text-[13px] font-semibold transition-colors ${
                  active ? 'bg-brown-700 text-white' : 'text-stone-700 hover:bg-stone-100 hover:text-brown-900'
                }`}
              >
                {label}
                {count > 0 && (
                  <span className={`rounded-full px-1.5 text-[11px] font-bold ${active ? 'bg-white/20 text-white' : id === 'kds' ? 'bg-brand-500 text-brown-900' : 'bg-status-danger text-white'}`}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        <div className="hidden text-right text-[12px] leading-tight sm:block">
          <div className="font-semibold text-brown-900">{cashierName}</div>
          <div className="text-stone-500">{time}</div>
        </div>

        <div className="relative">
          <Button variant="ghost" size="icon" aria-label="More" onClick={() => setMenuOpen((o) => !o)}>
            <MoreHorizontal className="h-5 w-5" />
          </Button>
          {menuOpen && (
            <div className="absolute right-0 mt-1 w-44 rounded-control border border-stone-300 bg-white py-1 shadow-lg" onMouseLeave={() => setMenuOpen(false)}>
              <button type="button" className="block w-full px-3 py-2 text-left text-[13px] hover:bg-stone-100" onClick={() => { setMenuOpen(false); setConfirmReset(true); }}>
                Reset demo data
              </button>
              <button type="button" className="block w-full px-3 py-2 text-left text-[13px] hover:bg-stone-100" onClick={() => { setMenuOpen(false); onSignOut(); }}>
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>

      <Dialog open={confirmReset} onOpenChange={setConfirmReset}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Reset demo data?</DialogTitle>
            <DialogDescription>Menu, stock, orders, and movements go back to the sample set. This cannot be undone.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmReset(false)}>Keep my data</Button>
            <Button variant="destructive" onClick={() => { setConfirmReset(false); onReset(); }}>Reset</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </header>
  );
};
```

- [ ] **Step 3: Lint and commit**

Run: `npm run lint`
```bash
git add src/components/staff/StaffHeader.tsx src/components/staff/PinGate.tsx
git commit -m "feat: add staff header with live clock and a PIN gate for staff screens

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---

### Task 9: Wire routing, PIN gate, and staff shell in App.tsx

**Files:**
- Modify: `src/App.tsx`
- Modify: `src/types/allmytea.ts:94` (delete `AppTab`)
- Delete: `src/components/AllMyTeaHeader.tsx`
- Modify: `src/components/customer/CustomerLandingPage.tsx:34-38` (props, temporary)

**Interfaces:**
- Consumes: `useRoute`, `Route`, `StaffTab`; `StaffHeader`, `PinGate`, `isStaffUnlocked`, `lockStaff`.
- Produces: `CustomerLandingPage` props become `{ menuItems: MenuItem[]; onOpenStaff: () => void }` (temporary until Task 11 drops `onOpenStaff` in favour of a plain link; keep this prop name until then).

- [ ] **Step 1: Remove `AppTab`**

Delete line 94 of `src/types/allmytea.ts` (`export type AppTab = ...`).

- [ ] **Step 2: Rewrite `src/App.tsx`**

Keep the handlers `showToast`, the initial-load `useEffect`, `updateOrdersAndSave`, `updateIngredientsAndSave`, `updateMovementsAndSave`, `handleOrderCreated`, `handleUpdateOrderStatus`, `handleUpdateStock`, `handleAddIngredient` exactly as they are today (current lines 32–207). Replace everything else so the file reads:

```tsx
import React, { useState, useEffect } from 'react';
import { MenuItem, StoreIngredient, Order, StockMovement, OrderStatus } from './types/allmytea';
import {
  loadMenuItems, saveMenuItems, loadIngredients, saveIngredients,
  loadOrders, saveOrders, loadMovements, saveMovements, resetStoreData,
} from './utils/allMyTeaStorage';
import { STORE_INFO } from './data/allMyTeaData';
import { useRoute } from './hooks/useRoute';
import { StaffHeader } from './components/staff/StaffHeader';
import { PinGate, isStaffUnlocked, lockStaff } from './components/staff/PinGate';
import { CustomerLandingPage } from './components/customer/CustomerLandingPage';
import { PosView } from './components/pos/PosView';
import { KitchenDisplayView } from './components/kds/KitchenDisplayView';
import { StoreInventoryView } from './components/inventory/StoreInventoryView';
import { OrderHistoryView } from './components/orders/OrderHistoryView';
import { SalesAnalyticsView } from './components/analytics/SalesAnalyticsView';
import { Check } from 'lucide-react';

export default function App() {
  const [route, navigate] = useRoute();
  const [unlocked, setUnlocked] = useState(isStaffUnlocked);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [ingredients, setIngredients] = useState<StoreIngredient[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [cashierName] = useState('Maria Santos');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // ... showToast, initial load effect, save helpers, handleOrderCreated,
  // ... handleUpdateOrderStatus, handleUpdateStock, handleAddIngredient: UNCHANGED

  const handleResetData = () => {
    const reset = resetStoreData();
    setMenuItems(reset.menu);
    setIngredients(reset.ingredients);
    setOrders(reset.orders);
    setMovements(reset.movements);
    showToast('Demo data reset');
  };

  const handleSignOut = () => {
    lockStaff();
    setUnlocked(false);
    navigate({ kind: 'landing' });
  };

  const pendingOrdersCount = orders.filter((o) => o.status === 'pending' || o.status === 'preparing').length;
  const lowIngredientsCount = ingredients.filter((i) => i.stock <= i.reorderThreshold).length;

  const toast = toastMessage && (
    <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2 rounded-control bg-brown-900 px-4 py-2.5 text-[13px] font-semibold text-white shadow-lg">
      <Check className="h-4 w-4 shrink-0 text-green-400" />
      <span>{toastMessage}</span>
    </div>
  );

  if (route.kind === 'landing') {
    return (
      <>
        <CustomerLandingPage menuItems={menuItems} onOpenStaff={() => navigate({ kind: 'staff', tab: 'pos' })} />
        {toast}
      </>
    );
  }

  if (!unlocked) {
    return <PinGate onUnlock={() => setUnlocked(true)} />;
  }

  const tab = route.tab;

  return (
    <div className="flex min-h-screen flex-col bg-stone-100 text-brown-900">
      <StaffHeader
        tab={tab}
        onNavigate={(next) => navigate({ kind: 'staff', tab: next })}
        onGoHome={() => navigate({ kind: 'landing' })}
        pendingCount={pendingOrdersCount}
        lowStockCount={lowIngredientsCount}
        cashierName={cashierName}
        onReset={handleResetData}
        onSignOut={handleSignOut}
      />

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 lg:px-8">
        {tab === 'pos' && <PosView menuItems={menuItems} cashierName={cashierName} onOrderCreated={handleOrderCreated} />}
        {tab === 'kds' && <KitchenDisplayView orders={orders} onUpdateOrderStatus={handleUpdateOrderStatus} />}
        {tab === 'inventory' && (
          <StoreInventoryView
            ingredients={ingredients}
            movements={movements}
            onUpdateStock={handleUpdateStock}
            onAddIngredient={handleAddIngredient}
          />
        )}
        {tab === 'orders' && <OrderHistoryView orders={orders} />}
        {tab === 'analytics' && <SalesAnalyticsView orders={orders} />}
      </main>

      <footer className="border-t border-stone-300 bg-white py-3">
        <p className="mx-auto max-w-7xl px-4 text-[12px] text-stone-500 sm:px-6 lg:px-8">
          {STORE_INFO.name}, {STORE_INFO.address}. Open {STORE_INFO.operatingHours}.
        </p>
      </footer>

      {toast}
    </div>
  );
}
```

- [ ] **Step 3: Temporary landing props**

In `CustomerLandingPage.tsx` change the props interface to:
```ts
interface CustomerLandingPageProps {
  menuItems: MenuItem[];
  onOpenStaff: () => void;
}
```
Rename every `onOpenStaffPortal` usage in that file to `onOpenStaff`. Replace the body of `handleCustomerSubmitOrder` so it only closes the modal and clears the cart (the fake order no longer goes anywhere):
```ts
const handleCustomerSubmitOrder = (e: React.FormEvent) => {
  e.preventDefault();
  setCustomerCart([]);
  setIsCheckoutModalOpen(false);
  setIsCartDrawerOpen(false);
};
```
Delete the `orderConfirmed` state and its confirmation `<Dialog>` block, and remove the `Order` import. Task 11 replaces this whole file, so do the minimum that compiles.

- [ ] **Step 4: Delete the old header and verify**

```bash
git rm -q src/components/AllMyTeaHeader.tsx
npm run lint && npm test
```
Then `npm run dev`, open `http://localhost:3000/staff/kds` → PIN screen → `2023` → kitchen view; refresh stays on kitchen; click POS then browser back returns to kitchen; "Sign out" returns to `/`. Stop the server.

- [ ] **Step 5: Commit**

```bash
git add -A src/App.tsx src/types/allmytea.ts src/components/customer/CustomerLandingPage.tsx src/components/AllMyTeaHeader.tsx
git commit -m "feat: route staff screens by path behind a PIN gate and drop the fake customer checkout

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---

### Task 10: Landing sections — TopNav, Hero, StoreStatusChip, HowToOrder, FindUs, Footer

**Files:**
- Create: `src/components/customer/sections/StoreStatusChip.tsx`
- Create: `src/components/customer/sections/TopNav.tsx`
- Create: `src/components/customer/sections/Hero.tsx`
- Create: `src/components/customer/sections/HowToOrder.tsx`
- Create: `src/components/customer/sections/FindUs.tsx`
- Create: `src/components/customer/sections/Footer.tsx`

**Interfaces:**
- Consumes: `getStoreStatus`, `STORE_INFO`, `logo`, `messengerUrl`, `MESSENGER_PAGE`.
- Produces:
  ```tsx
  <StoreStatusChip />                                   // self-updating every 60 s
  <TopNav cartCount onOpenCart() />
  <Hero onOrder() />
  <HowToOrder />
  <FindUs />
  <Footer onOpenStaff() />
  ```
  Shared constants: `export const FACEBOOK_URL = 'https://www.facebook.com/AllMyTeaBurgerMilktea/'`, `export const PHONE_HREF = 'tel:09202939976'`, `export const MAPS_URL = 'https://maps.google.com/?q=105+Yanga+St.,+Maysilo,+Malabon+City'` in `FindUs.tsx`.

- [ ] **Step 1: StoreStatusChip**

```tsx
import React, { useEffect, useState } from 'react';
import { STORE_INFO } from '../../../data/allMyTeaData';
import { getStoreStatus } from '../../../lib/storeHours';

export const StoreStatusChip: React.FC = () => {
  const [status, setStatus] = useState(() => getStoreStatus(new Date(), STORE_INFO.schedule));
  useEffect(() => {
    const id = window.setInterval(() => setStatus(getStoreStatus(new Date(), STORE_INFO.schedule)), 60_000);
    return () => window.clearInterval(id);
  }, []);
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-brown-700/30 bg-white/60 px-3 py-1 text-[13px] font-semibold text-brown-900">
      <span className={`h-2 w-2 rounded-full ${status.open ? 'bg-status-ready' : 'bg-status-danger'}`} aria-hidden />
      {status.label}
    </span>
  );
};
```

- [ ] **Step 2: FindUs with shared constants**

```tsx
import React from 'react';
import { MapPin, Phone, Clock } from 'lucide-react';
import { STORE_INFO } from '../../../data/allMyTeaData';

export const FACEBOOK_URL = 'https://www.facebook.com/AllMyTeaBurgerMilktea/';
export const PHONE_HREF = 'tel:09202939976';
export const MAPS_URL = 'https://maps.google.com/?q=105+Yanga+St.,+Maysilo,+Malabon+City';

export const FindUs: React.FC = () => (
  <section id="find-us" className="border-t border-stone-300 bg-white py-14">
    <div className="mx-auto grid max-w-[1120px] gap-10 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
      <div>
        <h2 className="font-display text-[30px] font-semibold text-brown-900">Find us</h2>
        <ul className="mt-6 space-y-4 text-[15px]">
          <li className="flex gap-3">
            <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-brown-700" />
            <div>
              <div className="font-semibold">{STORE_INFO.address}</div>
              <a href={MAPS_URL} target="_blank" rel="noreferrer" className="text-brown-700 underline underline-offset-4">Open in Google Maps</a>
            </div>
          </li>
          <li className="flex gap-3">
            <Phone className="mt-0.5 h-5 w-5 shrink-0 text-brown-700" />
            <a href={PHONE_HREF} className="font-semibold">{STORE_INFO.contact}</a>
          </li>
          <li className="flex gap-3">
            <Clock className="mt-0.5 h-5 w-5 shrink-0 text-brown-700" />
            <div>{STORE_INFO.services}</div>
          </li>
        </ul>
        <a href={FACEBOOK_URL} target="_blank" rel="noreferrer" className="mt-6 inline-block text-[15px] font-semibold text-brown-700 underline underline-offset-4">
          Message us on Facebook
        </a>
      </div>

      <div className="rounded-panel border border-stone-300 p-5">
        <h3 className="text-[17px] font-semibold text-brown-900">Opening hours</h3>
        <table className="mt-3 w-full text-[15px]">
          <tbody>
            {STORE_INFO.schedule.map((d) => (
              <tr key={d.day} className="border-b border-stone-300/60 last:border-0">
                <td className="py-2 text-stone-700">{d.day}</td>
                <td className="py-2 text-right font-semibold text-brown-900">{d.hours}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  </section>
);
```

- [ ] **Step 3: TopNav**

```tsx
import React from 'react';
import { ShoppingBag } from 'lucide-react';
import { logo } from '@/src/assets/images';
import { Button } from '../../ui/button';
import { FACEBOOK_URL } from './FindUs';

interface TopNavProps {
  cartCount: number;
  onOpenCart: () => void;
}

export const TopNav: React.FC<TopNavProps> = ({ cartCount, onOpenCart }) => (
  <header className="sticky top-0 z-40 border-b border-stone-300 bg-white/95 backdrop-blur">
    <div className="mx-auto flex h-16 max-w-[1120px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
      <a href="/" className="flex items-center gap-3" onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>
        <img src={logo} alt="AllmyTea" className="h-9 w-9 rounded-full" />
        <span className="font-display text-[22px] font-semibold text-brown-900">AllmyTea</span>
      </a>

      <nav className="hidden items-center gap-6 text-[15px] font-medium text-brown-900 md:flex" aria-label="Page sections">
        <a href="#menu" className="hover:text-brown-700">Menu</a>
        <a href="#find-us" className="hover:text-brown-700">Find us</a>
        <a href={FACEBOOK_URL} target="_blank" rel="noreferrer" className="hover:text-brown-700">Facebook</a>
      </nav>

      <Button onClick={onOpenCart} aria-label={cartCount > 0 ? `Review order, ${cartCount} items` : 'Start an order'}>
        <ShoppingBag className="h-4 w-4" />
        {cartCount > 0 ? `Order (${cartCount})` : 'Order'}
      </Button>
    </div>
  </header>
);
```

- [ ] **Step 4: Hero**

```tsx
import React from 'react';
import { Phone } from 'lucide-react';
import { logo } from '@/src/assets/images';
import { Button } from '../../ui/button';
import { StoreStatusChip } from './StoreStatusChip';
import { PHONE_HREF } from './FindUs';
import { STORE_INFO } from '../../../data/allMyTeaData';

export const Hero: React.FC<{ onOrder: () => void }> = ({ onOrder }) => (
  <section className="bg-brand-500 text-brown-900">
    <div className="mx-auto grid max-w-[1120px] items-center gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[1fr_auto] lg:gap-16 lg:px-8 lg:py-20">
      <img
        src={logo}
        alt="AllmyTea Burger & Milktea House logo"
        className="hero-enter h-36 w-36 rounded-full shadow-[0_12px_40px_rgba(43,27,16,0.18)] lg:order-2 lg:h-64 lg:w-64"
      />
      <div className="max-w-[34rem] lg:order-1">
        <StoreStatusChip />
        <h1 className="font-display mt-5 text-[44px] font-semibold leading-[1.02] lg:text-[64px]">
          Burger &amp; Milktea House in Malabon.
        </h1>
        <p className="mt-5 max-w-[30rem] text-[17px] leading-relaxed">
          Grilled burgers, boba milk tea, ramen overload, sushi and sizzling plates at {STORE_INFO.address}. Open till 1 AM every night.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Button size="lg" onClick={onOrder}>Order on Messenger</Button>
          <Button size="lg" variant="outline" asChild className="border-brown-700/40 bg-transparent hover:bg-brown-700/10">
            <a href={PHONE_HREF}><Phone className="h-4 w-4" />Call {STORE_INFO.contact}</a>
          </Button>
        </div>
      </div>
    </div>
  </section>
);
```

- [ ] **Step 5: HowToOrder**

```tsx
import React from 'react';

const STEPS = [
  { title: 'Pick your items', body: 'Browse the menu below and add what you want. Choose size, sugar, ice, and add-ons.' },
  { title: 'Send the order on Messenger', body: 'Tap "Send order on Messenger". Your order text is ready to send; we confirm the total and timing in chat.' },
  { title: 'Pick up or get it delivered', body: 'Pick up at 105 Yanga St., or ask for delivery within Malabon City. Pay cash, GCash, or Maya.' },
];

export const HowToOrder: React.FC = () => (
  <section className="bg-cream-50 py-14">
    <div className="mx-auto max-w-[1120px] px-4 sm:px-6 lg:px-8">
      <h2 className="font-display text-[30px] font-semibold text-brown-900">How ordering works</h2>
      <ol className="mt-8 grid gap-8 md:grid-cols-3">
        {STEPS.map((step, i) => (
          <li key={step.title} className="flex gap-4">
            <span className="font-display flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-500 text-[22px] font-semibold text-brown-900">{i + 1}</span>
            <div>
              <h3 className="text-[17px] font-semibold text-brown-900">{step.title}</h3>
              <p className="mt-1 text-[15px] leading-relaxed text-stone-700">{step.body}</p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  </section>
);
```

- [ ] **Step 6: Footer**

```tsx
import React from 'react';
import { logo } from '@/src/assets/images';
import { STORE_INFO } from '../../../data/allMyTeaData';
import { FACEBOOK_URL } from './FindUs';

export const Footer: React.FC<{ onOpenStaff: () => void }> = ({ onOpenStaff }) => (
  <footer className="bg-brown-900 py-10 text-[13px] text-stone-300">
    <div className="mx-auto flex max-w-[1120px] flex-col gap-6 px-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
      <div className="flex items-center gap-3">
        <img src={logo} alt="" className="h-8 w-8 rounded-full" />
        <div>
          <div className="font-semibold text-white">{STORE_INFO.name} Burger &amp; Milktea House</div>
          <div>{STORE_INFO.address}</div>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-5">
        <a href={FACEBOOK_URL} target="_blank" rel="noreferrer" className="hover:text-white">Facebook</a>
        <a href="/staff/pos" onClick={(e) => { e.preventDefault(); onOpenStaff(); }} className="hover:text-white">Staff sign in</a>
      </div>
    </div>
  </footer>
);
```

- [ ] **Step 7: Lint and commit**

Run: `npm run lint`
```bash
git add src/components/customer/sections
git commit -m "feat: add landing page hero, navigation, hours, how-to-order, and footer sections

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---

### Task 11: Landing sections — MenuBrowser, CartDrawer, StickyCartBar, parent rewrite

**Files:**
- Create: `src/components/customer/sections/MenuBrowser.tsx`
- Create: `src/components/customer/sections/CartDrawer.tsx`
- Create: `src/components/customer/sections/StickyCartBar.tsx`
- Rewrite: `src/components/customer/CustomerLandingPage.tsx`

**Interfaces:**
- Consumes: `ItemCustomizerModal` (`item`, `onClose`, `onAddToCart`), `buildOrderMessage`, `messengerUrl`, `CustomerOrderType`, `OrderDetails`, Task 10 sections.
- Produces: `CustomerLandingPage` props `{ menuItems: MenuItem[]; onOpenStaff: () => void }` (unchanged from Task 9).

- [ ] **Step 1: MenuBrowser**

```tsx
import React from 'react';
import { Search, Plus } from 'lucide-react';
import type { MenuCategory, MenuItem } from '../../../types/allmytea';
import { Input } from '../../ui/input';
import { Button } from '../../ui/button';

export const MENU_CATEGORIES: MenuCategory[] = [
  'All', 'Ramen Overload', 'Sushi & Rolls', 'Burgers', 'Sizzling & Chao Fan', 'Wings & Snacks', 'Milk Tea & Coffee',
];

const OPTION_CATEGORIES: MenuCategory[] = ['Milk Tea & Coffee', 'Burgers', 'Ramen Overload', 'Sushi & Rolls'];

/** True when ItemCustomizerModal has something to ask for this item. */
export function hasOptions(item: MenuItem): boolean {
  return OPTION_CATEGORIES.includes(item.category) || Boolean(item.sizes?.length);
}

interface MenuBrowserProps {
  items: MenuItem[];
  category: MenuCategory;
  onCategory: (c: MenuCategory) => void;
  query: string;
  onQuery: (q: string) => void;
  onAdd: (item: MenuItem) => void;
}

export const MenuBrowser: React.FC<MenuBrowserProps> = ({ items, category, onCategory, query, onQuery, onAdd }) => {
  const q = query.trim().toLowerCase();
  const visible = items.filter((item) =>
    (category === 'All' || item.category === category) &&
    (!q || item.name.toLowerCase().includes(q) || item.description.toLowerCase().includes(q)),
  );
  const groups = MENU_CATEGORIES.filter((c) => c !== 'All' && visible.some((i) => i.category === c));

  const chip = (c: MenuCategory) => (
    <button
      key={c}
      type="button"
      onClick={() => onCategory(c)}
      aria-pressed={category === c}
      className={`whitespace-nowrap rounded-full px-3.5 py-1.5 text-[13px] font-semibold transition-colors ${
        category === c ? 'bg-brown-700 text-white' : 'bg-stone-100 text-brown-900 hover:bg-stone-200'
      }`}
    >
      {c}
    </button>
  );

  return (
    <section id="menu" className="mx-auto max-w-[1120px] px-4 py-14 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <h2 className="font-display text-[30px] font-semibold text-brown-900">Menu</h2>
        <div className="relative w-full sm:w-72">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-500" />
          <Input value={query} onChange={(e) => onQuery(e.target.value)} placeholder="Search the menu" className="pl-9" aria-label="Search the menu" />
        </div>
      </div>

      <div className="mt-6 lg:grid lg:grid-cols-[200px_1fr] lg:gap-10">
        <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-2 lg:sticky lg:top-20 lg:mx-0 lg:flex-col lg:self-start lg:overflow-visible lg:px-0">
          {MENU_CATEGORIES.map(chip)}
        </div>

        <div className="mt-4 lg:mt-0">
          {groups.length === 0 && (
            <p className="py-10 text-center text-[15px] text-stone-700">Nothing matches "{query}". Try another word.</p>
          )}
          {groups.map((group) => (
            <div key={group} className="mb-10">
              <h3 className="font-display text-[22px] font-semibold text-brown-900">{group}</h3>
              <ul className="mt-3 divide-y divide-stone-300 border-y border-stone-300">
                {visible.filter((i) => i.category === group).map((item) => (
                  <li key={item.id} className="flex items-start gap-4 py-4">
                    <div className="min-w-0 flex-1">
                      <div className="font-display text-[17px] font-semibold text-brown-900">{item.name}</div>
                      <p className="mt-0.5 text-[13px] leading-relaxed text-stone-700">{item.description}</p>
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-2">
                      <span className="text-[17px] font-semibold text-brown-900">
                        ₱{item.basePrice}{item.sizes && <span className="text-[13px] font-normal text-stone-500"> 16oz</span>}
                      </span>
                      {item.available ? (
                        <Button size="sm" variant="outline" onClick={() => onAdd(item)} aria-label={`Add ${item.name}`}>
                          <Plus className="h-3.5 w-3.5" />Add
                        </Button>
                      ) : (
                        <span className="text-[13px] font-semibold text-stone-500">Sold out</span>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
```

- [ ] **Step 2: CartDrawer**

```tsx
import React, { useState } from 'react';
import { Minus, Plus, Trash2 } from 'lucide-react';
import type { CartItem } from '../../../types/allmytea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../../ui/dialog';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { buildOrderMessage, describeCustomization, messengerUrl, type CustomerOrderType } from '../../../lib/messengerOrder';
import { PHONE_HREF } from './FindUs';

interface CartDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cart: CartItem[];
  onUpdateQty: (cartItemId: string, delta: number) => void;
  onRemove: (cartItemId: string) => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ open, onOpenChange, cart, onUpdateQty, onRemove }) => {
  const [orderType, setOrderType] = useState<CustomerOrderType>('pick-up');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [note, setNote] = useState('');
  const [copied, setCopied] = useState(false);

  const total = cart.reduce((sum, i) => sum + i.subtotal, 0);
  const missing =
    !name.trim() ? 'Add your name' :
    !phone.trim() ? 'Add your phone number' :
    orderType === 'delivery' && !address.trim() ? 'Add your delivery address' : null;

  const send = async () => {
    const message = buildOrderMessage(cart, { orderType, name, phone, address, note });
    try { await navigator.clipboard.writeText(message); } catch { /* clipboard blocked: the URL still carries the text */ }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 4000);
    window.open(messengerUrl(message), '_blank', 'noopener');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="left-auto right-0 top-0 flex h-dvh max-h-dvh w-full max-w-full translate-x-0 translate-y-0 flex-col gap-0 rounded-none border-l border-stone-300 p-0 sm:max-w-md">
        <DialogHeader className="border-b border-stone-300 px-5 py-4 text-left">
          <DialogTitle className="font-display text-[22px] font-semibold">Your order</DialogTitle>
          <DialogDescription>We confirm the total and timing with you on Messenger.</DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {cart.length === 0 ? (
            <p className="py-10 text-center text-[15px] text-stone-700">Nothing here yet. Add items from the menu.</p>
          ) : (
            <ul className="divide-y divide-stone-300">
              {cart.map((item) => {
                const detail = describeCustomization(item.customization);
                return (
                  <li key={item.cartItemId} className="flex items-start gap-3 py-3">
                    <div className="min-w-0 flex-1">
                      <div className="text-[15px] font-semibold text-brown-900">{item.name}</div>
                      {detail && <div className="text-[13px] text-stone-700">{detail}</div>}
                      <div className="mt-1 text-[13px] text-stone-700">₱{item.unitPrice} each</div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button size="icon" variant="outline" className="h-8 w-8" aria-label="Remove one" onClick={() => onUpdateQty(item.cartItemId, -1)}><Minus className="h-3.5 w-3.5" /></Button>
                      <span className="w-6 text-center text-[15px] font-semibold">{item.quantity}</span>
                      <Button size="icon" variant="outline" className="h-8 w-8" aria-label="Add one" onClick={() => onUpdateQty(item.cartItemId, 1)}><Plus className="h-3.5 w-3.5" /></Button>
                      <Button size="icon" variant="ghost" className="h-8 w-8" aria-label={`Remove ${item.name}`} onClick={() => onRemove(item.cartItemId)}><Trash2 className="h-3.5 w-3.5" /></Button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}

          <div className="mt-6 space-y-4">
            <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label="Order type">
              {(['pick-up', 'delivery'] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  role="radio"
                  aria-checked={orderType === t}
                  onClick={() => setOrderType(t)}
                  className={`rounded-control border px-3 py-2 text-[13px] font-semibold ${orderType === t ? 'border-brown-700 bg-brown-700 text-white' : 'border-stone-300 bg-white text-brown-900'}`}
                >
                  {t === 'pick-up' ? 'Pick up' : 'Delivery in Malabon'}
                </button>
              ))}
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div><Label htmlFor="c-name">Name</Label><Input id="c-name" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" /></div>
              <div><Label htmlFor="c-phone">Phone</Label><Input id="c-phone" value={phone} onChange={(e) => setPhone(e.target.value)} inputMode="tel" autoComplete="tel" /></div>
            </div>
            {orderType === 'delivery' && (
              <div><Label htmlFor="c-address">Delivery address</Label><Input id="c-address" value={address} onChange={(e) => setAddress(e.target.value)} autoComplete="street-address" /></div>
            )}
            <div><Label htmlFor="c-note">Note (optional)</Label><Input id="c-note" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Landmark, allergies, less spicy" /></div>
          </div>
        </div>

        <div className="space-y-3 border-t border-stone-300 px-5 py-4">
          <div className="flex items-center justify-between text-[17px] font-semibold text-brown-900">
            <span>Total</span><span>₱{total.toLocaleString('en-PH')}</span>
          </div>
          <Button size="lg" className="w-full" disabled={cart.length === 0 || Boolean(missing)} onClick={send} title={missing ?? undefined}>
            {missing && cart.length > 0 ? missing : 'Send order on Messenger'}
          </Button>
          <Button size="lg" variant="outline" className="w-full" asChild>
            <a href={PHONE_HREF}>Call instead</a>
          </Button>
          <p className={`text-center text-[13px] text-stone-700 ${copied ? '' : 'invisible'}`} aria-live="polite">
            Order copied. Paste it if Messenger opens empty.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};
```
`DialogContent` in `ui/dialog.tsx` centres with `left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%]`; `cn()` runs `tailwind-merge`, so the classes above replace them.

- [ ] **Step 3: StickyCartBar**

```tsx
import React from 'react';
import { Button } from '../../ui/button';

interface StickyCartBarProps {
  count: number;
  total: number;
  onReview: () => void;
}

export const StickyCartBar: React.FC<StickyCartBarProps> = ({ count, total, onReview }) => {
  if (count === 0) return null;
  return (
    <div className="fixed inset-x-0 bottom-0 z-30 border-t border-stone-300 bg-white p-3 shadow-[0_-8px_24px_rgba(43,27,16,0.12)] md:hidden">
      <div className="mx-auto flex max-w-[1120px] items-center justify-between gap-3">
        <span className="text-[15px] font-semibold text-brown-900">
          {count} {count === 1 ? 'item' : 'items'}, ₱{total.toLocaleString('en-PH')}
        </span>
        <Button onClick={onReview}>Review order</Button>
      </div>
    </div>
  );
};
```

- [ ] **Step 4: Rewrite `CustomerLandingPage.tsx`**

Replace the entire file:
```tsx
import React, { useState } from 'react';
import type { MenuItem, MenuCategory, CartItem } from '../../types/allmytea';
import { ItemCustomizerModal } from '../pos/ItemCustomizerModal';
import { TopNav } from './sections/TopNav';
import { Hero } from './sections/Hero';
import { MenuBrowser, hasOptions } from './sections/MenuBrowser';
import { HowToOrder } from './sections/HowToOrder';
import { FindUs } from './sections/FindUs';
import { Footer } from './sections/Footer';
import { CartDrawer } from './sections/CartDrawer';
import { StickyCartBar } from './sections/StickyCartBar';

interface CustomerLandingPageProps {
  menuItems: MenuItem[];
  onOpenStaff: () => void;
}

export const CustomerLandingPage: React.FC<CustomerLandingPageProps> = ({ menuItems, onOpenStaff }) => {
  const [category, setCategory] = useState<MenuCategory>('All');
  const [query, setQuery] = useState('');
  const [customizing, setCustomizing] = useState<MenuItem | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const cartCount = cart.reduce((n, i) => n + i.quantity, 0);
  const cartTotal = cart.reduce((n, i) => n + i.subtotal, 0);

  const addToCart = (item: CartItem) => {
    setCart((prev) => {
      const idx = prev.findIndex(
        (i) => i.menuItemId === item.menuItemId && JSON.stringify(i.customization) === JSON.stringify(item.customization),
      );
      if (idx === -1) return [...prev, item];
      const next = [...prev];
      const qty = next[idx].quantity + item.quantity;
      next[idx] = { ...next[idx], quantity: qty, subtotal: qty * next[idx].unitPrice };
      return next;
    });
  };

  const handleAdd = (item: MenuItem) => {
    if (hasOptions(item)) {
      setCustomizing(item);
      return;
    }
    addToCart({
      cartItemId: `cart-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      menuItemId: item.id,
      name: item.name,
      category: item.category,
      unitPrice: item.basePrice,
      quantity: 1,
      subtotal: item.basePrice,
      customization: {},
    });
  };

  const updateQty = (cartItemId: string, delta: number) =>
    setCart((prev) =>
      prev
        .map((i) => (i.cartItemId === cartItemId ? { ...i, quantity: i.quantity + delta, subtotal: (i.quantity + delta) * i.unitPrice } : i))
        .filter((i) => i.quantity > 0),
    );

  const remove = (cartItemId: string) => setCart((prev) => prev.filter((i) => i.cartItemId !== cartItemId));

  return (
    <div className="min-h-screen bg-white text-brown-900">
      <TopNav cartCount={cartCount} onOpenCart={() => setDrawerOpen(true)} />
      <Hero onOrder={() => setDrawerOpen(true)} />
      <MenuBrowser items={menuItems} category={category} onCategory={setCategory} query={query} onQuery={setQuery} onAdd={handleAdd} />
      <HowToOrder />
      <FindUs />
      <Footer onOpenStaff={onOpenStaff} />

      <StickyCartBar count={cartCount} total={cartTotal} onReview={() => setDrawerOpen(true)} />
      <CartDrawer open={drawerOpen} onOpenChange={setDrawerOpen} cart={cart} onUpdateQty={updateQty} onRemove={remove} />
      <ItemCustomizerModal item={customizing} onClose={() => setCustomizing(null)} onAddToCart={(ci) => { addToCart(ci); setDrawerOpen(true); }} />
    </div>
  );
};
```
Add `pb-20 md:pb-0` to the outer `div` so the sticky bar never covers the footer on mobile.

- [ ] **Step 5: Verify**

Run: `npm run lint && npm test && npm run build`
Then `npm run dev`; at `http://localhost:3000`: hero is mustard with the logo disc and status chip; menu lists rows grouped by category; "Add" on a burger opens the customizer, "Add" on wings adds directly and the "Order (1)" count updates; at 375px width the sticky bar appears; drawer "Send order on Messenger" is disabled until name and phone are filled, then opens a new `m.me` tab. Stop the server.

- [ ] **Step 6: Commit**

```bash
git add src/components/customer
git commit -m "feat: rebuild the customer landing page with menu rows and Messenger ordering

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---

### Task 12: POS restyle

**Files:**
- Modify: `src/components/pos/PosView.tsx`

**Interfaces:**
- Consumes: `Panel`, `Button` variants.
- Produces: no interface change; props stay `{ menuItems, cashierName, onOrderCreated }`.

Class mapping applied to every remaining occurrence in this file after the explicit edits below:

| Old | New |
|---|---|
| `bg-amber-800 hover:bg-amber-900 text-white` | remove (Button `default` is already brown) |
| `text-amber-800`, `text-amber-900` | `text-brown-700` |
| `border-amber-200/80`, `hover:border-amber-600/70` | `border-stone-300`, `hover:border-brown-700` |
| `bg-neutral-50/80`, `bg-neutral-50/50`, `bg-neutral-100` | `bg-stone-100` |
| `border-neutral-200`, `border-neutral-100`, `border-neutral-300` | `border-stone-300` |
| `text-neutral-900` | `text-brown-900` |
| `text-neutral-500`, `text-neutral-600`, `text-neutral-400` | `text-stone-700` / `text-stone-500` |
| `rounded-lg` | `rounded-panel` |
| `rounded-md`, `rounded` | `rounded-control` |
| `shadow-xs`, `shadow-sm`, `hover:shadow-sm` | remove |
| `font-mono` on prices and counts | remove (keep on nothing in this file) |
| `uppercase` | remove |

- [ ] **Step 1: Remove the banner and unused icons**

Delete the whole `{/* Banner with All My Tea hero photography */}` block (the `div.relative.rounded-lg…min-h-[140px]` and its children). Change the lucide import to `import { Search, Plus, Minus, Trash2, ShoppingBag } from 'lucide-react';`.

- [ ] **Step 2: Filter bar and menu grid**

Replace the filter `div` opening tag with `<Panel padded className="space-y-3">` (and its closing `</div>` with `</Panel>`; add `import { Panel } from '../staff/Panel';`). Search placeholder becomes `"Search the menu"`. Category buttons: active `bg-brown-700 text-white`, inactive `bg-stone-100 text-brown-900 hover:bg-stone-200`, both `rounded-full px-3.5 py-1.5 text-[13px] font-semibold`.

Menu tile becomes:
```tsx
<button
  type="button"
  key={item.id}
  onClick={() => setSelectedItemForCustom(item)}
  disabled={!item.available}
  className="flex flex-col justify-between rounded-panel border border-stone-300 bg-white p-3.5 text-left transition-colors hover:border-brown-700 disabled:opacity-50 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-brown-700"
>
  <div>
    <div className="flex items-start justify-between gap-2 text-[12px] text-stone-500">
      <span className="font-mono">{item.code}</span>
      <span>{item.category}</span>
    </div>
    <h3 className="mt-1 text-[15px] font-semibold leading-snug text-brown-900">{item.name}</h3>
    <p className="mt-1 line-clamp-2 text-[12px] leading-relaxed text-stone-700">{item.description}</p>
  </div>
  <div className="mt-3 flex items-center justify-between border-t border-stone-300 pt-2.5">
    <span className="text-[15px] font-semibold text-brown-900">
      ₱{item.basePrice}{item.sizes && <span className="text-[12px] font-normal text-stone-500"> 16oz</span>}
    </span>
    <span className="inline-flex items-center gap-1 rounded-control bg-brown-700 px-2.5 py-1 text-[12px] font-semibold text-white"><Plus className="h-3.5 w-3.5" />Add</span>
  </div>
</button>
```
(`font-mono` stays on the item code only; it is an identifier like an order number.)

- [ ] **Step 3: Ticket panel**

Outer cart `div` → `<Panel className="lg:col-span-4 lg:sticky lg:top-[72px] flex flex-col">`. Header `div` → `className="border-b border-stone-300 bg-stone-100 p-4"`, title `<h2 className="text-[15px] font-semibold text-brown-900">Current ticket</h2>`, "Clear Cart" → "Clear ticket" with `text-[12px] text-stone-500 hover:text-status-danger`. Order-type segmented control:
```tsx
<div className="mt-3 grid grid-cols-4 gap-1 rounded-control bg-stone-200 p-1 text-[12px]">
  {(['dine-in', 'take-out', 'pick-up', 'delivery'] as const).map((type) => (
    <button key={type} type="button" onClick={() => setOrderType(type)}
      className={`rounded-control py-1 font-semibold capitalize ${orderType === type ? 'bg-white text-brown-900' : 'text-stone-700 hover:text-brown-900'}`}>
      {type.replace('-', ' ')}
    </button>
  ))}
</div>
```
Footer: "Items Count:" → "Items", "Total:" → "Total" with total `text-[22px] font-bold text-brown-900`; button text "Proceed to Payment" → "Take payment".

- [ ] **Step 4: Apply the mapping to the rest of the file, lint, verify**

Run: `npm run lint`. Dev server: `/staff/pos` has no banner; tiles are bordered white; ticket sticks on scroll; add an item, "Take payment" opens checkout. Stop.

- [ ] **Step 5: Commit**

```bash
git add src/components/pos/PosView.tsx
git commit -m "feat: restyle the POS register with brand tokens and remove the banner

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---

### Task 13: Kitchen display restyle

**Files:**
- Modify: `src/components/kds/KitchenDisplayView.tsx`

**Interfaces:**
- Consumes: `PageHeader`, `Panel`, `EmptyState`, `StatusBadge`.

- [ ] **Step 1: Header**

Replace the `{/* KDS Header & Station Filter */}` panel with:
```tsx
<PageHeader
  title="Kitchen display"
  description="Live queue for drinks, kitchen, and dispatch."
  actions={
    <div className="flex gap-1 rounded-control bg-stone-200 p-1 text-[12px]">
      {(['All', 'Drinks', 'Kitchen'] as const).map((s) => (
        <button key={s} type="button" onClick={() => setStationFilter(s)}
          className={`rounded-control px-3 py-1 font-semibold ${stationFilter === s ? 'bg-white text-brown-900' : 'text-stone-700 hover:text-brown-900'}`}>
          {s}
        </button>
      ))}
    </div>
  }
/>
```
Imports: `import { PageHeader } from '../staff/PageHeader'; import { Panel } from '../staff/Panel'; import { EmptyState } from '../staff/EmptyState'; import { StatusBadge } from '../staff/StatusBadge';`. Lucide import shrinks to `{ Clock }`.

- [ ] **Step 2: Column shell, one pattern for all three columns**

Add above the return:
```tsx
const COLUMNS: { status: OrderStatus; title: string; hint: string; topBorder: string; emptyTitle: string }[] = [
  { status: 'pending',   title: 'New',       hint: 'Waiting to start',  topBorder: 'border-t-status-pending',   emptyTitle: 'No new tickets' },
  { status: 'preparing', title: 'Preparing', hint: 'On the line',       topBorder: 'border-t-status-preparing', emptyTitle: 'Nothing in progress' },
  { status: 'ready',     title: 'Ready',     hint: 'Serve or dispatch', topBorder: 'border-t-status-ready',     emptyTitle: 'Nothing waiting for pickup' },
];
const ordersFor = (status: OrderStatus) => orders.filter((o) => o.status === status);
const nextFor: Record<'pending' | 'preparing' | 'ready', { status: OrderStatus; label: string; variant: 'default' | 'brand' }> = {
  pending:   { status: 'preparing', label: 'Start preparing', variant: 'default' },
  preparing: { status: 'ready',     label: 'Mark ready',      variant: 'default' },
  ready:     { status: 'completed', label: 'Complete',        variant: 'brand' },
};
const leftBorder: Record<string, string> = { pending: 'border-l-status-pending', preparing: 'border-l-status-preparing', ready: 'border-l-status-ready' };
```
Remove the old `pendingOrders`, `preparingOrders`, `readyOrders`, `completedOrders` constants.

Replace the whole `{/* 3-Column Kanban Board */}` grid with:
```tsx
<div className="grid grid-cols-1 gap-4 md:grid-cols-3 items-start">
  {COLUMNS.map((col) => {
    const list = ordersFor(col.status);
    const next = nextFor[col.status as 'pending' | 'preparing' | 'ready'];
    return (
      <Panel key={col.status} className={`border-t-4 ${col.topBorder}`}>
        <div className="flex items-baseline justify-between border-b border-stone-300 px-4 py-3">
          <h2 className="text-[15px] font-semibold text-brown-900">{col.title} <span className="text-stone-500">({list.length})</span></h2>
          <span className="text-[12px] text-stone-500">{col.hint}</span>
        </div>
        <div className="space-y-3 p-3">
          {list.length === 0 && <EmptyState title={col.emptyTitle} />}
          {list.map((order) => {
            const visibleItems = getFilteredItems(order);
            if (visibleItems.length === 0) return null;
            return (
              <article key={order.id} className={`space-y-3 rounded-control border border-stone-300 border-l-4 ${leftBorder[col.status]} bg-white p-3`}>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="font-mono text-[22px] font-bold leading-none text-brown-900">{order.orderNumber}</div>
                    <div className="mt-1 text-[12px] text-stone-700 capitalize">{order.type.replace('-', ' ')} · {order.tableNumber || order.customerName || 'Walk-in'}</div>
                    {order.deliveryAddress && <div className="text-[12px] text-stone-700">Deliver to {order.deliveryAddress}</div>}
                  </div>
                  <span className="inline-flex items-center gap-1 text-[12px] text-stone-500"><Clock className="h-3 w-3" />{getElapsedTime(order.timestamp)}</span>
                </div>

                <ul className="divide-y divide-stone-300 text-[13px]">
                  {visibleItems.map((item, idx) => (
                    <li key={idx} className="py-1.5 first:pt-0 last:pb-0">
                      <div className="flex justify-between font-semibold text-brown-900">
                        <span>{item.quantity}x {item.name}</span>
                        <span className="text-[11px] font-normal text-stone-500">{item.category}</span>
                      </div>
                      <div className="mt-0.5 space-y-0.5 pl-2 text-[12px] text-stone-700">
                        {item.customization.size && <span className="font-semibold text-brown-900">{item.customization.size} </span>}
                        {item.customization.sugarLevel && <span>{item.customization.sugarLevel} sugar, {item.customization.iceLevel}</span>}
                        {item.customization.spiciness && <span className="block font-semibold text-status-danger">{item.customization.spiciness}</span>}
                        {item.customization.addons && item.customization.addons.length > 0 && (
                          <span className="block font-semibold text-brown-700">+ {item.customization.addons.map((a) => a.name).join(', ')}</span>
                        )}
                        {item.customization.specialInstructions && (
                          <span className="mt-0.5 block rounded-control bg-brand-500/20 px-1.5 py-0.5 italic text-brown-900">Note: {item.customization.specialInstructions}</span>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>

                <Button size="sm" variant={next.variant} className="w-full" onClick={() => onUpdateOrderStatus(order.id, next.status)}>
                  {next.label}
                </Button>
              </article>
            );
          })}
        </div>
      </Panel>
    );
  })}
</div>
```
Tailwind generates `border-t-status-pending`, `border-l-status-ready`, etc. from the `@theme` colors because the full class strings appear literally in `COLUMNS` and `leftBorder`.

- [ ] **Step 3: Lint, verify, commit**

Run: `npm run lint`. Dev: `/staff/kds` shows three bordered columns; create an order in POS, it appears under "New"; "Start preparing" moves it. Stop.
```bash
git add src/components/kds/KitchenDisplayView.tsx
git commit -m "feat: restyle the kitchen display into status-coloured columns

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---

### Task 14: Stock restyle

**Files:**
- Modify: `src/components/inventory/StoreInventoryView.tsx`

**Interfaces:**
- Consumes: `PageHeader`, `Panel`, `KpiCard`, `StatusBadge`, `EmptyState`.

- [ ] **Step 1: Header, alert, KPIs**

Delete the `{/* Low Stock Alert Notice Banner */}` block. Replace the `{/* Top Banner & KPI Cards */}` grid with:
```tsx
<PageHeader
  title="Stock"
  description="Ingredients and packaging on hand."
  actions={
    <>
      <Button variant="outline" size="sm" onClick={handleExportCsv}><Download className="h-3.5 w-3.5" />Export CSV</Button>
      <Button size="sm" onClick={() => setIsAddModalOpen(true)}><Plus className="h-3.5 w-3.5" />Add item</Button>
    </>
  }
/>

<div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
  <KpiCard label="Stock value" value={`₱${totalValuation.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} hint={`${ingredients.length} items`} />
  <KpiCard label="Low stock" value={lowStockCount} hint="At or below the reorder level" tone={lowStockCount > 0 ? 'warn' : 'good'} />
  <KpiCard label="Movements today" value={movements.filter((m) => m.timestamp.slice(0, 10) === new Date().toISOString().slice(0, 10)).length} hint="Receipts, use, waste, adjustments" />
</div>
```
Imports: `PageHeader`, `Panel`, `KpiCard`, `StatusBadge`, `EmptyState` from `../staff/*`. Lucide shrinks to `{ Plus, Minus, Download }`.

- [ ] **Step 2: Table**

Outer table `div` → `<Panel>`. Its heading block → `<div className="border-b border-stone-300 px-4 py-3"><h2 className="text-[15px] font-semibold text-brown-900">Ingredients and packaging</h2></div>`. Header row class → `text-[12px] font-semibold text-stone-700` (remove `uppercase tracking-wider`); header labels: Item, Category, On hand, Reorder at, Unit cost, Value, Supplier, Actions. Row: `className={isLow ? 'bg-brand-500/10' : ''}`; next to the stock number render `{isLow && <StatusBadge status="low" />}`. Action buttons: "Receive" (`variant="outline"`, icon `Plus`) and "Waste" (`variant="ghost"`, icon `Minus`), both `size="sm"`.

- [ ] **Step 3: Movements log**

Wrap in `<Panel>`; heading "Recent stock activity"; each row shows `<StatusBadge status={m.type} />`, name, signed delta in `text-status-ready` / `text-status-danger`, reason, and on the right time plus `Balance {m.resultingStock}` in `text-[12px] text-stone-500` (no `font-mono`). When `movements.length === 0` render `<EmptyState title="No stock activity yet" hint="Receipts and waste you record show up here." />` instead of hiding the panel.

- [ ] **Step 4: Modals and copy**

Dialog titles: "Receive stock" / "Record waste"; confirm buttons "Add stock" / "Record waste" (`variant="destructive"` for waste). Add-item dialog: title "Add stock item", button "Add item"; supplier default `'Local supplier'` (replaces `'Diffun Local Vendor'`); placeholder `"e.g. Malabon Market"`. Apply the Task 12 class mapping to the rest of the file.

- [ ] **Step 5: Lint, verify, commit**

Run: `npm run lint`. Dev: `/staff/inventory` KPIs render; low rows tinted; "Receive" updates balance. Stop.
```bash
git add src/components/inventory/StoreInventoryView.tsx
git commit -m "feat: restyle the stock view with shared KPI cards and status badges

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---

### Task 15: Orders restyle

**Files:**
- Modify: `src/components/orders/OrderHistoryView.tsx`

- [ ] **Step 1: Header and filters**

Replace the `{/* Header and Controls */}` panel with `<PageHeader title="Orders" description="Every ticket and receipt." actions={<Button variant="outline" size="sm" onClick={handleExportCsv}><Download className="h-3.5 w-3.5" />Export CSV</Button>} />`. Filter bar `div` → `<Panel padded className="flex flex-col gap-3 sm:flex-row sm:items-center">`; search placeholder "Search order number, name, phone, or item"; `<select>` class `h-9 rounded-control border border-stone-300 bg-white px-2.5 text-[13px]`; option labels sentence case ("All channels", "Dine in", "Take out", "Delivery", "Pick up", "All statuses", …).

- [ ] **Step 2: Table**

Outer `div` → `<Panel>`. Header row class `text-[12px] font-semibold text-stone-700`; labels: Order, Date, Channel, Customer, Items, Total, Payment, Status, Receipt. Order number cell keeps `font-mono font-semibold`. Status cell → `<StatusBadge status={o.status} />`. Total cell `font-semibold text-brown-900` (no mono). Receipt button `variant="ghost" size="sm"` labelled "View". When `filteredOrders.length === 0` render a single full-width cell containing `<EmptyState title="No orders match" hint="Change the filters or search for something else." />`. Apply the Task 12 class mapping to the rest.

- [ ] **Step 3: Lint, verify, commit**

Run: `npm run lint`. Dev: `/staff/orders` filters work; status pills coloured; "View" opens receipt. Stop.
```bash
git add src/components/orders/OrderHistoryView.tsx
git commit -m "feat: restyle order history with status badges and an empty state

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---

### Task 16: Reports restyle

**Files:**
- Modify: `src/components/analytics/SalesAnalyticsView.tsx`

- [ ] **Step 1: Header and KPIs**

Replace the header panel with `<PageHeader title="Reports" description="Sales by channel, payment, and item." />`. Replace the three `<Card>` KPIs with:
```tsx
<div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
  <KpiCard label="Gross sales" value={`₱${totalSales.toLocaleString('en-PH')}`} hint="All recorded orders" />
  <KpiCard label="Orders" value={totalOrdersCount} hint="Tickets processed" />
  <KpiCard label="Average ticket" value={`₱${avgOrderValue.toLocaleString('en-PH')}`} hint="Per receipt" />
</div>
```
Remove the `Card` import and the unused lucide icons.

- [ ] **Step 2: Breakdown panels**

Each `<Card>` → `<Panel padded className="space-y-3">`; headings `<h2 className="text-[15px] font-semibold text-brown-900">Sales by channel</h2>` / `Sales by payment method`. Bars: track `h-2 rounded-full bg-stone-100`, fill `h-full rounded-full bg-brown-700` for both panels (payment colours go). Row text: `text-[13px]`, channel label `capitalize`, numbers `font-semibold` (no mono).

- [ ] **Step 3: Best sellers**

Outer `div` → `<Panel>`; heading "Best sellers"; header row `text-[12px] font-semibold text-stone-700`; columns Item, Category, Sold, Revenue; drop the `#1` rank prefix (the list is ordered; the row position says it). Sold cell `{item.qty}`; revenue `font-semibold text-brown-900`. When `topItems.length === 0` render `<EmptyState title="No sales yet" hint="Best sellers appear after the first order." />`. Change the description copy "Diffun branch" is gone with the header; confirm with `grep -n Diffun src/components/analytics/SalesAnalyticsView.tsx` returning nothing.

- [ ] **Step 4: Lint, verify, commit**

Run: `npm run lint`. Dev: `/staff/analytics` renders three KPIs, two bar panels, best sellers. Stop.
```bash
git add src/components/analytics/SalesAnalyticsView.tsx
git commit -m "feat: restyle the reports view with shared KPI cards and panels

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---

### Task 17: Modals, ui primitives, and remaining copy

**Files:**
- Modify: `src/components/pos/ItemCustomizerModal.tsx`, `src/components/pos/CheckoutModal.tsx`, `src/components/pos/ReceiptModal.tsx`
- Modify: `src/components/ui/input.tsx`, `src/components/ui/dialog.tsx`, `src/components/ui/table.tsx`, `src/components/ui/label.tsx`
- Modify: `src/data/allMyTeaData.ts` (supplier and sample address strings)

- [ ] **Step 1: ui primitives**

`input.tsx` class string → `"flex h-9 w-full rounded-control border border-stone-300 bg-white px-3 py-1 text-[13px] text-brown-900 placeholder:text-stone-500 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-brown-700 disabled:cursor-not-allowed disabled:opacity-50"`.
`dialog.tsx` content: replace `rounded-lg`/`rounded-md` with `rounded-panel`, `border-neutral-200` with `border-stone-300`, overlay `bg-black/80` → `bg-brown-900/60`; close button ring colours → `focus:ring-brown-700`.
`table.tsx`: `TableHead` → `h-10 px-3 text-left align-middle text-[12px] font-semibold text-stone-700`; `TableRow` → `border-b border-stone-300 transition-colors hover:bg-stone-100/60`; `TableCell` → `px-3 py-2.5 align-middle text-[13px]`.
`label.tsx` variant → `text-[13px] font-semibold text-brown-900`.

- [ ] **Step 2: ItemCustomizerModal**

Header: drop the `code · category` line; keep `DialogTitle` and `DialogDescription`. Section labels (Size, Sugar, Ice, Add-ons, Spice, Special instructions, Quantity) → `text-[13px] font-semibold text-brown-900` (remove any `uppercase`/`tracking`). Option chips: selected `border-brown-700 bg-brown-700 text-white`, unselected `border-stone-300 bg-white text-brown-900 hover:bg-stone-100`, all `rounded-control`. Confirm button text → `Add to order, ₱{subtotal}`. Apply the Task 12 class mapping to the rest.

- [ ] **Step 3: CheckoutModal**

Title "Take payment"; payment method buttons same chip style as above; discount checkbox label "Senior / PWD 20% discount"; cash tendered label "Cash received"; change line "Change"; confirm button "Complete order". Apply the mapping.

- [ ] **Step 4: ReceiptModal**

Keep `font-mono` for the receipt body (it is the only place besides order numbers). Header line "Order complete" in `text-status-ready`; buttons "Print" (`variant="outline"`) and "Done". Apply the mapping.

- [ ] **Step 5: Copy fixes in data**

In `src/data/allMyTeaData.ts` replace supplier strings: `'Diffun Meat Market Butchery'` → `'Malabon Public Market'`, `'Diffun Grocery Mart'` → `'Malabon Grocery'`, `'Diffun Asian Supply'` → `'Asian Supply, Malabon'`; sample delivery address `'Purok 3, Near Diffun Central School, Andres Bonifacio'` → `'Block 3, Maysilo, Malabon City'`.

- [ ] **Step 6: Verify no stray strings or styles**

```bash
grep -rn "Diffun" src && echo "FIX" || echo "no Diffun"
grep -rnE "amber-|neutral-|emerald-|rose-" src --include="*.tsx" | head
```
Expected: `no Diffun`; second grep prints nothing (any hits left are leftovers to convert with the mapping).

- [ ] **Step 7: Lint, test, build, commit**

Run: `npm run lint && npm test && npm run build`
```bash
git add src/components/pos src/components/ui src/data/allMyTeaData.ts
git commit -m "feat: restyle POS modals and ui primitives, fix leftover Diffun copy

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---

### Task 18: Final verification

**Files:** none modified unless a check fails.

- [ ] **Step 1: Full gate**

```bash
npm run lint && npm test && npm run build
ls dist/assets/*.jpg | wc -l      # expected 1
ls dist/favicon.jpg dist/og-image.jpg
```

- [ ] **Step 2: SPA fallback and routes under preview**

```bash
npm run preview &  # port 4173
sleep 3
for p in / /staff/pos /staff/kds /staff/inventory /staff/orders /staff/analytics /nope; do
  printf "%s " "$p"; curl -s -o /dev/null -w "%{http_code}\n" "http://localhost:4173$p"
done
```
Expected: all `200`. Stop the preview server (`netstat -ano | grep :4173` → `taskkill //F //PID <pid>`).

- [ ] **Step 3: Manual walk (dev server, owner can repeat)**

1. `/` — mustard hero, logo disc, status chip text matches the current Manila time, "Order on Messenger" and "Call" buttons.
2. Add a burger (customizer opens), add wings (direct); nav shows "Order (2)"; at 375px the sticky bar shows "2 items, ₱…".
3. Drawer: button disabled with "Add your name" until name and phone are filled; "Send order on Messenger" opens `m.me/AllMyTeaBurgerMilktea`; paste into any text field shows the order text.
4. Footer "Staff sign in" → PIN screen; `2023` → `/staff/pos`; refresh on `/staff/kds` stays; back button returns; "Sign out" returns to `/`.
5. POS: take an order with cash; receipt shows; KDS shows it under New; Stock deducts cups.
6. Keyboard: Tab through the landing page; every focused control shows the brown ring.

- [ ] **Step 4: Record outcome**

Append a dated "Verification" section to the bottom of the spec listing which checks passed and anything deferred (for example an absolute `og:image` URL once the domain exists). Commit:
```bash
git add docs/superpowers/specs/2026-10-04-allmytea-brand-redesign-design.md
git commit -m "docs: record redesign verification results

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```
