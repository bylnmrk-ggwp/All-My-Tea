# AllmyTea brand redesign, routing, and Messenger ordering

Date: 2026-10-04
Status: draft for review
Path: architectural (brainstorming → spec → plan → implementation)

## 1. Intent

AllmyTea is a burger and milk tea house at 105 Yanga St., Maysilo, Malabon City, open 4:00 PM to 1:00 AM daily. This app is its public menu page plus the in-store staff portal (POS register, kitchen display, stock, order history, reports). It will run live on a public URL: customers open the landing page on their phones; staff run the portal on the shop tablet.

Goals, in priority order:

1. Landing page that looks like the real brand (Facebook logo, "Burger & Milktea House") and lets a customer order through Messenger or by phone.
2. Staff portal with one consistent, professional visual system and the same brand.
3. Working URLs for staff screens (`/staff/kds` survives refresh, back button works) behind a light PIN gate.
4. Production build that actually ships its images.
5. Remove dead legacy code.

Explicitly out of scope: backend or real-time order sync, user accounts, photography, menu content changes, printing.

## 2. Decisions already made

| Question | Decision |
|---|---|
| UI scope | Landing page plus full staff portal |
| Routing | Path routes via a small hook, no new runtime dependency |
| Deployment | Live for the real store on a public URL |
| Staff visual direction | Neutral warm-stone dashboard with brand accents |
| Dead code | Delete the 17 orphaned legacy files |
| Customer ordering | Hand off to Messenger or phone; no in-browser fake orders |
| Approach | Restyle in place; extract shared primitives from repeated markup |

## 3. Problems in the current code this spec fixes

- All six `<img src="/src/assets/images/...">` are string paths. Vite serves them in dev only; `npm run build` emits no images, so production shows a broken logo, hero, and cafe photo.
- Tab state lives in `useState<AppTab>` in `App.tsx`. Refresh returns to landing; staff cannot bookmark the kitchen display.
- The landing page "Place order" writes to the customer's own `localStorage`. The store never sees it.
- The repo logo is an AI-generated badge that does not match the real brand. The real logo is the Facebook profile picture (545×545, mustard disc, brown script).
- `CustomerLandingPage.tsx` is 969 lines mixing layout, cart, checkout form, and confirmation.
- 17 files from an earlier generic inventory app are never imported.
- No favicon, no `og:image`.

## 4. Visual system

### 4.1 Tokens (Tailwind v4 `@theme` in `src/index.css`)

Color, taken from the logo:

| Token | Hex | Use |
|---|---|---|
| `brand-500` | `#F2B64B` | Mustard. Hero field, pending status, highlights. Solid, never a gradient wash. |
| `brand-700` | `#C98A2E` | Hover on mustard, borders on mustard. |
| `brown-700` | `#7A3E12` | Primary buttons, headlines on mustard, links. |
| `brown-900` | `#2B1B10` | Body text, landing footer ground. |
| `cream-50` | `#FFF8EC` | Secondary landing bands only. Never the page background. |
| `stone-100` | `#F4F2EE` | Staff portal page ground. |
| `stone-300` | `#E4DFD6` | All 1px borders. |

Status colors stay semantic and are the only non-brand hues: pending `brand-500`, preparing `#2563EB`, ready `#15803D`, completed neutral grey, cancelled and waste `#B91C1C`.

shadcn CSS variables in `:root` are remapped so existing `ui/*` components pick up the brand: `--primary` → `brown-700`, `--ring` → `brown-700`, `--border` and `--input` → `stone-300`, `--background` → white, `--muted` → `stone-100`. The unused `.dark` block is removed.

`ui/button.tsx` variants change to: `default` brown-700 solid; `outline` stone-300 border with brown-900 text; `secondary` stone-100; `destructive` unchanged; `ghost` and `link` unchanged. One new variant `brand` = brand-500 fill with brown-900 text, used only for the landing page "Order on Messenger" button where it sits on white.

Typography:

| Role | Family | Notes |
|---|---|---|
| Display | Fraunces (Google Fonts, variable, `opsz`, `SOFT` 50–100) | Landing headlines, menu item names, prices on landing. Weight 600–700. Letter-spacing −0.02em above 30px. |
| Text and staff UI | Plus Jakarta Sans (already loaded) | Everything else. `font-variant-numeric: tabular-nums` set globally. |
| Mono | JetBrains Mono (already loaded) | Order numbers and receipt body only. |

Scale in px: 13, 15, 17, 22, 30, 44, 64. Landing body 15px, staff body 13px. Line length ≤ 70ch.

Shape: panel radius 10px, control radius 6px, status pill 999px. Elevation is a 1px `stone-300` border. Shadow only on dialogs, drawers, and the mobile sticky cart bar.

Motion: one load moment on the landing hero (logo disc scales from 0.96 to 1, status chip fades in, 400ms). Disabled under `prefers-reduced-motion`. No hover lift on cards. Transitions only on user-triggered state (drawer open, button press).

Copy rules: sentence case everywhere; no all-caps labels; no `A · B · C` strings; no arrows in button text; buttons say what happens ("Order on Messenger", "Mark ready", "Add stock").

### 4.2 Fonts

`index.html` adds Fraunces to the existing Google Fonts link: `family=Fraunces:opsz,wght,SOFT@9..144,400..700,0..100`. Fallback stack `Georgia, serif`.

## 5. Assets

- Commit the Facebook profile picture (already fetched, 545×545, 30 KB) as `src/assets/images/allmytea-logo.jpg`.
- Copy the same file to `public/favicon.jpg` and reference it as `og:image` too. No image tooling is available here, so no 1200×630 variant; Facebook accepts a square image and crops it.
- Delete `allmytea_logo_badge_1791083133659.jpg`, `allmytea_hero_spread_1791083118808.jpg`, `allmytea_cafe_dining_1791083640193.jpg`. Nothing references them after this spec.
- New `src/assets/images/index.ts`: `export { default as logo } from './allmytea-logo.jpg'`. Every image usage imports from here. `vite/client` types already cover `*.jpg` modules.
- `index.html`: `<link rel="icon" href="/favicon.jpg">` and `og:image="/og-image.jpg"` (same bytes as the favicon, copied to `public/og-image.jpg`).

## 6. Routing

New `src/hooks/useRoute.ts`, roughly 40 lines, no dependency:

```ts
export type StaffTab = 'pos' | 'kds' | 'inventory' | 'orders' | 'analytics';
export type Route =
  | { kind: 'landing' }
  | { kind: 'staff'; tab: StaffTab };

export function parsePath(pathname: string): Route;     // pure, tested
export function pathFor(route: Route): string;           // pure, tested
export function useRoute(): [Route, (r: Route) => void]; // pushState + popstate
```

Paths: `/` landing; `/staff/pos`, `/staff/kds`, `/staff/inventory`, `/staff/orders`, `/staff/analytics`. `/staff` and `/staff/<unknown>` resolve to `pos`. Any other path resolves to landing; the hook calls `history.replaceState` so the address bar matches what is shown.

`App.tsx` replaces `useState<AppTab>` with `useRoute()`. The `AppTab` type is deleted; `StaffTab` replaces it. In-page anchors on the landing page (`#menu`, `#find-us`) keep working because routing reads `pathname` only.

Deploy note: the production host must serve `index.html` for unknown paths (SPA fallback). Vite dev and `vite preview` already do.

## 7. Staff PIN gate

- `STORE_INFO.staffPin: '2023'` in `src/data/allMyTeaData.ts`, editable by the owner.
- New `src/components/staff/PinGate.tsx`: four-digit input plus on-screen numeric keypad for tablet use, error text "Wrong PIN" on mismatch, no lockout.
- On success set `sessionStorage['allmytea.staff'] = '1'`. The gate checks that flag; it clears when the tab closes.
- `App.tsx` renders `PinGate` for any `staff` route when the flag is absent. "Sign out" in the staff header clears the flag and navigates to `/`.
- This is a convenience lock against customers tapping into the register. It is client-side and not a security control; the PIN screen says only "Staff only".

## 8. Landing page

`src/components/customer/CustomerLandingPage.tsx` becomes a thin parent (cart state, drawer open state, selected category, search query) that composes sections from `src/components/customer/sections/`:

| File | Content |
|---|---|
| `TopNav.tsx` | White sticky bar: logo 36px plus "AllmyTea", links Menu / Find us / Facebook, "Order" button that opens the cart drawer and shows the item count. |
| `Hero.tsx` | Solid `brand-500` field. Left: `StoreStatusChip`, headline "Burger & Milktea House in Malabon." (Fraunces 44px mobile, 64px desktop), one supporting sentence, two buttons: "Order on Messenger" (brown solid; opens the cart drawer, or Messenger directly when the cart is empty) and "Call 0920 293 9976" (brown outline, `tel:`). Right: logo disc 220–260px. On mobile the disc sits above the headline at 140px. |
| `MenuBrowser.tsx` | Category rail (sticky, left, ≥ md) or horizontal chip row (mobile), search input, then items grouped by category as rows: name (Fraunces 17px), one-line description, right-aligned tabular price, "Add" button. Unavailable items show "Sold out" and no button. "Add" opens the existing `ItemCustomizerModal` when the item has options, otherwise adds directly. |
| `HowToOrder.tsx` | `cream-50` band. Three numbered steps: 1 Pick your items, 2 Send the order on Messenger, 3 Pick up or get it delivered in Malabon. The numbers are earned: it is a sequence. |
| `FindUs.tsx` | Address with a Google Maps link (`https://maps.google.com/?q=105+Yanga+St.,+Maysilo,+Malabon+City`), phone, Facebook, hours table rendered from `STORE_INFO.schedule`, services line. |
| `Footer.tsx` | `brown-900` ground: logo 32px, address, Facebook link, "Staff sign in" link to `/staff/pos`. |
| `CartDrawer.tsx` | Right sheet on desktop, full-height sheet on mobile, built on the existing `ui/dialog`. Item list with quantity controls, subtotal, order type (Pick-up / Delivery), name, phone, address when delivery, note. Primary button "Send order on Messenger". Secondary "Call instead". |
| `StickyCartBar.tsx` | Mobile only, bottom, with shadow: "3 items · ₱347" and "Review order". Hidden when the cart is empty. |
| `StoreStatusChip.tsx` | Dot plus "Open now, closes 1:00 AM" or "Closed, opens 4:00 PM". |

Removed: hero photo, cafe photo, checkout modal, order confirmation modal, `onPlaceCustomerOrder` prop, `onOpenStaffPortal` prop (replaced by `navigate`), the "Staff POS" button in the customer header (footer only now), the hardcoded schedule duplicate, the emoji pin, the `Sparkles` kicker.

### 8.1 Store hours

New `src/lib/storeHours.ts` (pure, tested):

```ts
export function getStoreStatus(
  now: Date,
  schedule = STORE_INFO.schedule,
  timeZone = 'Asia/Manila',
): { open: boolean; label: string }
```

Parses `"4:00 PM - 1:00 AM"`, handles the span across midnight (1:00 AM belongs to the previous day's service), and evaluates in `Asia/Manila` via `Intl.DateTimeFormat`. The chip re-evaluates every 60 seconds.

### 8.2 Messenger handoff

New `src/lib/messengerOrder.ts` (pure, tested):

```ts
export function buildOrderMessage(cart: CartItem[], details: OrderDetails): string
export function messengerUrl(message: string): string
// https://m.me/AllMyTeaBurgerMilktea?text=<encoded>
```

Message format, plain text, one item per line:

```
Hi AllmyTea! I'd like to order:
2x Classic Cheeseburger — ₱178
1x Wintermelon Milk Tea (22oz, 50% sugar, less ice) — ₱95
Total: ₱273
Delivery to <address>   (or: Pick-up)
Name: <name>, Phone: <phone>
Note: <note>             (omitted when empty)
```

"Send order on Messenger" copies the message to the clipboard (`navigator.clipboard.writeText`, failure ignored) and then opens the `m.me` URL in a new tab. The `text` parameter is best effort: Messenger prefills it on most mobile clients and ignores it on some desktop clients, so the drawer shows "Order copied. Paste it if Messenger opens empty." for 4 seconds. "Call instead" opens `tel:09202939976`. The cart stays until the customer clears it.

## 9. Staff portal

### 9.1 Shared primitives in `src/components/staff/`

Extracted from markup already repeated across views:

| Component | Props | Replaces |
|---|---|---|
| `StaffHeader.tsx` | `tab`, `onNavigate`, `pendingCount`, `lowStockCount`, `cashierName`, `onReset`, `onSignOut` | `AllMyTeaHeader.tsx` (deleted). Logo 32px plus "AllmyTea Staff"; tabs POS, Kitchen, Stock, Orders, Reports with count pills; cashier name and live clock; reset and sign out behind an overflow button, reset confirmed with `ui/dialog` instead of `window.confirm`. |
| `PageHeader.tsx` | `title`, `description?`, `actions?` | Ad-hoc `<h2>` blocks in all five views |
| `KpiCard.tsx` | `label`, `value`, `hint?`, `tone?: 'default' \| 'warn' \| 'good'` | Three different KPI card markups in inventory and analytics |
| `StatusBadge.tsx` | `status: OrderStatus \| StockMovement['type']` | Inline status class strings in KDS, orders, inventory |
| `EmptyState.tsx` | `title`, `hint?`, `action?` | "No orders" and similar placeholders |
| `Panel.tsx` | `children`, `padded?` | White bordered container used for tables, kanban columns, cart |

### 9.2 Per view

Logic, state, and handlers in every view stay as they are. Only markup and classes change.

- **POS** (`PosView.tsx`): hero photo banner removed. Layout stays an 8/4 grid; menu tiles become compact rows under `md`; the ticket panel is `sticky top-[72px]`. Order type becomes a segmented control. Totals use tabular numbers. Checkout and receipt modals restyled with tokens only.
- **Kitchen** (`KitchenDisplayView.tsx`): `PageHeader` with the station filter as actions. Three columns in `Panel`s; each column heading carries its status color as a 4px top border; ticket cards have a 4px left border in status color, the order number in mono at 22px, and elapsed minutes since `timestamp`. Buttons: "Start preparing", "Mark ready", "Complete".
- **Stock** (`StoreInventoryView.tsx`): `PageHeader` with "Export CSV" and "Add item" actions. Three `KpiCard`s. Table rows at or below threshold tinted `brand-500/10` with a "Low" pill. Movements log below in a `Panel`. Both modals restyled.
- **Orders** (`OrderHistoryView.tsx`): `PageHeader`, filter bar, table with `StatusBadge`, receipt modal restyled.
- **Reports** (`SalesAnalyticsView.tsx`): `PageHeader`, three `KpiCard`s, two breakdown `Panel`s, best-sellers table. Breakdown bars use `brown-700`; no gradients.
- `App.tsx` staff footer: one line with address and hours. The "Customer landing page" link goes; the header logo already navigates to `/`.

The toast stays in `App.tsx`, restyled: `brown-900` ground, white text, green check icon.

## 10. Dead code removal

Delete, all confirmed unreferenced by the live import graph:

```
src/components/AnalyticsView.tsx
src/components/BarcodeSvg.tsx
src/components/ImportCsvModal.tsx
src/components/InventoryTable.tsx
src/components/ItemDetailModal.tsx
src/components/ItemFormModal.tsx
src/components/LowStockView.tsx
src/components/MovementsLogView.tsx
src/components/StatSummaryCards.tsx
src/components/StockAdjustmentModal.tsx
src/components/TopBar.tsx
src/components/ui/badge.tsx
src/components/ui/tabs.tsx
src/types/inventory.ts
src/utils/storage.ts
src/utils/csv.ts
src/data/initialData.ts
```

Plus `src/components/AllMyTeaHeader.tsx` (replaced by `staff/StaffHeader.tsx`) and the three old JPGs. After deletion `npm run lint` must pass and `grep -r "types/inventory\|initialData\|utils/storage" src` must return nothing.

## 11. Testing

Add `vitest` as a devDependency and `"test": "vitest run"`. No DOM testing library; tests cover the pure modules only:

- `src/hooks/useRoute.test.ts`: `parsePath` for `/`, `/staff`, `/staff/kds`, `/staff/nope`, `/anything`; `pathFor` round-trips every route.
- `src/lib/storeHours.test.ts`: 3:59 PM closed, 4:00 PM open, 11:30 PM open, 12:30 AM open, 1:00 AM closed, 1:01 AM closed; label text for each; time zone fixed to `Asia/Manila`.
- `src/lib/messengerOrder.test.ts`: message lines for size, sugar, ice, and add-on customizations; totals; delivery versus pick-up; note omitted when empty; `messengerUrl` encodes newlines and `₱`.

Manual verification, recorded in the plan as the final task:

1. `npm run lint`, `npm test`, `npm run build` all pass.
2. `ls dist/assets` contains exactly one `.jpg` (the logo); `dist/favicon.jpg` exists.
3. `npm run preview`, then `curl -s -o /dev/null -w "%{http_code}" http://localhost:4173/staff/kds` returns 200.
4. Open `/`, then `/staff/pos` (PIN prompt), enter the PIN, refresh on `/staff/kds` stays on the kitchen view, browser back returns to POS.
5. Add two items on the landing page, open the drawer, press "Send order on Messenger": the clipboard holds the message and a new tab opens `m.me/AllMyTeaBurgerMilktea`.
6. Resize to 375px: the sticky cart bar appears when the cart has items; the hero stacks; category chips scroll.

Screenshots are not available in this environment (Chrome extension disconnected); visual review is the owner's step after the plan completes, using the dev server at `http://localhost:3000`.

## 12. Files touched

New: `src/hooks/useRoute.ts` (+ test), `src/lib/storeHours.ts` (+ test), `src/lib/messengerOrder.ts` (+ test), `src/assets/images/index.ts`, `src/assets/images/allmytea-logo.jpg`, `public/favicon.jpg`, `public/og-image.jpg`, `src/components/staff/{StaffHeader,PinGate,PageHeader,KpiCard,StatusBadge,EmptyState,Panel}.tsx`, `src/components/customer/sections/{TopNav,Hero,MenuBrowser,HowToOrder,FindUs,Footer,CartDrawer,StickyCartBar,StoreStatusChip}.tsx`.

Modified: `index.html`, `src/index.css`, `src/App.tsx`, `src/types/allmytea.ts`, `src/data/allMyTeaData.ts`, `src/components/ui/button.tsx`, `src/components/customer/CustomerLandingPage.tsx`, `src/components/pos/{PosView,CheckoutModal,ReceiptModal,ItemCustomizerModal}.tsx`, `src/components/kds/KitchenDisplayView.tsx`, `src/components/inventory/StoreInventoryView.tsx`, `src/components/orders/OrderHistoryView.tsx`, `src/components/analytics/SalesAnalyticsView.tsx`, `package.json`.

Deleted: the 17 files in section 10, `AllMyTeaHeader.tsx`, three old JPGs.

## 13. Risks and notes

- `m.me?text=` prefill is not guaranteed on every client; clipboard copy is the fallback and the UI says so.
- The client-side PIN is a convenience lock only.
- All store data still lives in the shop tablet's `localStorage`. Clearing browser data wipes orders and stock. A backend is a separate project.
- SPA fallback must be configured on the production host.
- `.env.example` and `metadata.json` are AI Studio scaffold files that mention `GEMINI_API_KEY`; nothing reads them. Left untouched; removable in a later cleanup.

## 14. Verification (2026-10-04, branch `redesign`)

Automated, all passing at the final commit:

- `npm run lint` (tsc) clean; `npm test` 27/27 (routing, store hours, Messenger message, token file); `npm run build` succeeds.
- `dist/assets` contains exactly one `.jpg` (the logo); `dist/favicon.jpg` and `dist/og-image.jpg` present.
- `vite preview`: `/`, `/staff/pos`, `/staff/kds`, `/staff/inventory`, `/staff/orders`, `/staff/analytics`, `/nope` all return 200 (SPA fallback works under preview).
- `grep Diffun src` returns nothing; no `amber-`, `neutral-`, `emerald-`, `rose-` utility classes remain in `src`.

Deferred to the owner (no browser automation was available in the build session): the manual walk in section 11, items 4–6 — PIN entry and refresh on `/staff/kds`, the Messenger hand-off opening `m.me/AllMyTeaBurgerMilktea` with the order text on the clipboard, the 375 px layout with the sticky cart bar, and keyboard focus rings. Dev server: `npm run dev`, then `http://localhost:3000`.

Still open: set `og:image` to an absolute URL once the production domain exists; configure SPA fallback on the host.
