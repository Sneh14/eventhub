# Test Strategy: Event Browsing

**Input**: `docs/scenarios/event-browsing.md` (40 scenarios)
**Feature**: Event list (`/events`) + Event detail (`/events/:id`)
**Generated**: 2026-04-06

---

## Distribution Summary

| Layer | Count | Focus | Estimated Run Time |
|---|---|---|---|
| **Unit** | 5 | Pure functions (price formatting, seat calc, maxQty) | < 1s |
| **API** | 6 | Backend query contracts, auth enforcement, cross-user isolation | ~5s |
| **Component** | 7 | UI state rendering with mocked data (skeleton, badges, seat colors) | ~10s |
| **E2E** | 22 | Full-stack user journeys, navigation, filter interactions | ~3–5 min |
| **Total** | **40** | | |

**Pyramid shape**: Unit (5) < API (6) < Component (7) < E2E (22) — acceptable. The E2E count is higher than ideal because most browsing logic is full-stack (filter → API query → UI render). Push-down opportunities are called out per decision.

---

## Layer Assignments

### Unit (5 implicit, no dedicated TCs)

These are not standalone TCs in the scenario file but are **testable units discovered in source** that underpin multiple E2E scenarios. They should have dedicated unit tests before the E2E layer is built.

| Function | File | Underpins | Test |
|---|---|---|---|
| `fmt_price(n)` — `en-IN` locale, USD, 0 decimals | `frontend/components/events/EventCard.jsx:21` | TC-107 | Unit: assert `fmt_price(1499)` → `"$1,499"` |
| `fmt_price(n)` — `en-US` locale on detail page | `frontend/app/events/[id]/page.tsx:24` | TC-107 | Unit: verify **different** formatter from card formatter |
| `withPersonalSeats(events, userId)` | `backend/src/services/eventService.js:6` | TC-102, TC-103 | Unit: mock `bookingRepository.getBookedQuantitiesForEvents` → assert adjusted seats |
| `maxQty = Math.min(10, event.availableSeats)` | `frontend/app/events/[id]/page.tsx:81` | TC-403 | Unit: assert min(10, 1) = 1, min(10, 15) = 10 |
| `totalPages = Math.ceil(total / limit)` | `backend/src/services/eventService.js:35` | TC-400, TC-401 | Unit: assert ceil(14/12) = 2, ceil(12/12) = 1 |

> **Critical finding**: `EventCard.jsx` uses `en-IN` locale; `EventDetailPage` uses `en-US` locale — both format as USD with 0 decimals but locale affects digit grouping separator. TC-107 must assert against the correct locale per page. This inconsistency warrants a bug report.

---

### API / Integration (6 TCs)

Tests at this layer hit `http://localhost:3001/api/...` directly. No browser required.

| TC | Title | Endpoint | Rationale for API layer |
|---|---|---|---|
| **TC-004** | Search by description keyword | `GET /api/events?search=<keyword>` | The search filter is a Prisma query in `eventRepository.findAll()` (line 18–30). Whether `description` is searched is a backend contract — no UI interaction needed to verify this. |
| **TC-104** | Per-user seat isolation (cross-user, static events) | `GET /api/events/:id` (two tokens) | Tests `withPersonalSeats()` integration with `bookingRepository.getBookedQuantitiesForEvents()`. Requires two JWT tokens but no browser. More reliable than E2E for data isolation verification. |
| **TC-202** | GET /api/events without token → 401 | `GET /api/events` | Pure API contract enforcement. Auth middleware is in the backend. Testing in E2E would add unnecessary browser overhead. |
| **TC-203** | GET /api/events/:id without token → 401 | `GET /api/events/:id` | Same rationale as TC-202. |
| **TC-205** _(partial)_ | User B's token cannot fetch User A's dynamic event | `GET /api/events/:id` | `eventRepository.findById()` (line 46–53) uses `OR: [{ isStatic: true }, { userId }]`. Cross-user access returning null → 404 is a backend data-access contract, verifiable at API without browser. |
| **TC-405** | Out-of-range page returns empty data array | `GET /api/events?page=999` | API must return `data: []` with correct `totalPages`. Frontend then renders empty state. API layer owns the pagination contract. |

---

### Component (7 TCs)

Tests render individual React components in isolation (or with mocked API routes). Recommended tool: React Testing Library or Playwright component testing.

| TC | Title | Component | Rationale for Component layer |
|---|---|---|---|
| **TC-108** | Seat color coding thresholds | `EventCard.jsx → SeatsIndicator` (line 26–32) | `SeatsIndicator` is a pure component: 0 = red "SOLD OUT", ≤10 = amber "{n} seats left!", >10 = green "{n} seats available". Three branches, no API call, perfect for component test. |
| **TC-504** | Category badge color matches category | `EventCard.jsx:6` & `EventDetailPage:15` | `CATEGORY_VARIANT` is a static mapping. Asserting badge CSS variant for each category requires rendering the component with `event.category` props — no backend needed. |
| **TC-500** | Loading skeleton cards shown while fetching | `EventCard.jsx → EventCardSkeleton` (line 35–50) | `EventCardSkeleton` is an exported pure component. Render 12 of them and assert `animate-pulse` divs. No network required. |
| **TC-502** | Event detail page spinner while loading | `EventDetailPage:165` | `isLoading` branch renders `<Spinner size="lg">`. Component test with `isLoading=true` prop/mock is faster than throttling a real browser. |
| **TC-506** | Pagination not rendered for single page | `EventsContent` in `events/page.tsx:88` | `{pagination && <Pagination>}` condition. Mock API to return `totalPages: 1`; assert pagination is absent. Avoids needing exactly 12 real events in DB. |
| **TC-507** | Every card has a "Book Now" button | `EventCard.jsx:108–121` | `data-testid="book-now-btn"` is always rendered (even when `soldOut`, it shows "Sold Out"). Component test with varied event fixtures is more deterministic than counting cards in E2E. |
| **TC-510** | Page shows "Upcoming Events" heading | `events/page.tsx:104` | Static heading text in the page wrapper. Snapshot or heading assertion at component level. No API call needed. |

---

### E2E (22 TCs)

Full browser, against `http://localhost:3000`, using Playwright Chromium. All tests must login first using the documented test account.

#### Happy Path (9 E2E)

| TC | Title | Priority | Key Assertions |
|---|---|---|---|
| **TC-001** | Browse events as authenticated user | P0 | "Upcoming Events" heading visible; `[data-testid="event-card"]` count > 0 |
| **TC-002** | Search by title keyword | P0 | Type "Tech" → only "Tech Conference Bangalore" and "Tech..." cards remain |
| **TC-003** | Search by venue keyword | P1 | Type a known venue → matching card visible; non-matching hidden |
| **TC-005** | Filter by category | P0 | Select "Conference" → all cards have Conference badge; count = 2 (seeded) |
| **TC-006** | Filter by city | P0 | Select "Bangalore" → all cards show Bangalore; non-Bangalore hidden |
| **TC-007** | Combined search + category + city | P1 | 3 filters → single result "Food Festival Bangalore" |
| **TC-009** | "Book Now" navigates to detail page | P0 | Click `[data-testid="book-now-btn"]` → URL matches `/events/\d+`; title matches card |
| **TC-010** | View all meta on event detail page | P0 | Date, time, venue, city, seats, price all visible as MetaItem blocks |
| **TC-011** | Static event shows Featured badge | P1 | `isStatic=true` event → "Featured" badge + green banner text |

#### Business Rules (6 E2E)

| TC | Title | Priority | Key Assertions |
|---|---|---|---|
| **TC-100** | Sandbox banner appears when > 5 events visible | P1 | Default load (10 seeded) → amber banner with `/sandbox holds up to/i` text |
| **TC-101** | Sandbox banner hidden at ≤ 5 events | P1 | Filter to Chennai (1 event) → banner NOT visible |
| **TC-102** | Per-user seat computation reflects user's bookings | P0 | Book 3 tickets for 500-seat event → seat display shows 497/500 |
| **TC-103** | Available seats decrease after booking | P0 | Record seats before → book N → record after → assert delta = N |
| **TC-105** | Events list shows 12 per page | P1 | Count `[data-testid="event-card"]` on page 1 = 12 (requires > 12 total events) |
| **TC-106** | Sold-out event — SOLD OUT display + disabled button | P0 | Create 1-seat event → book it → return to detail → "SOLD OUT" text + disabled button |

#### Security (4 E2E)

| TC | Title | Priority | Key Assertions |
|---|---|---|---|
| **TC-200** | Unauthenticated user redirected from /events | P0 | No localStorage token → navigate to `/events` → redirect to `/login` |
| **TC-201** | Unauthenticated user redirected from /events/:id | P0 | Navigate to `/events/1` without auth → redirect to `/login` |
| **TC-204** | User B cannot see User A's dynamic event | P0 | User A creates event; User B searches for it → not found in results |
| **TC-206** | XSS in search param does not execute | P1 | Navigate to `?search=<script>alert(1)</script>` → no alert dialog; text treated literally |

#### Negative / Error (4 E2E)

| TC | Title | Priority | Key Assertions |
|---|---|---|---|
| **TC-302** | Non-existent event ID → "Event not found" | P1 | `/events/999999` → "Event not found" heading + "Browse Events" link |
| **TC-303** | Network error → error state + Retry | P1 | `page.route('**/api/events**', r => r.abort())` → "Couldn't load events" + Retry button |
| **TC-304** | Retry button re-fetches after error | P1 | Abort route → error state → unroute → click Retry → cards appear |
| **TC-305** | Clear search restores all events | P2 | `/events?search=Tech` → clear input → all events return |

#### Edge Cases (5 E2E)

| TC | Title | Priority | Key Assertions |
|---|---|---|---|
| **TC-008** | Pagination — navigate to page 2 | P1 | Click page 2 → URL has `?page=2` → different cards than page 1 |
| **TC-403** | 1 available seat caps quantity at 1 | P1 | Create 1-seat event → detail page → "+" button disabled; "(max 1)" label |
| **TC-404** | Filters survive page refresh | P1 | Apply 3 filters → F5 → same filters in URL + same results visible |
| **TC-406** | No description hides "About this event" | P2 | Create event without description → detail page → "About this event" section absent |
| **TC-407** | Clear one filter preserves others | P2 | Apply search+city → clear city dropdown → only search param remains in URL |

#### UI State (4 E2E — only those requiring real browser context)

| TC | Title | Priority | Key Assertions |
|---|---|---|---|
| **TC-100/TC-503** | Sandbox banner text content | P1 | (merged with TC-100 above) — verify exact bold values "9 bookings", "6 custom events" |
| **TC-300** | Empty state when no search results | P1 | Search "xyznonexistent123" → "No events found" heading + description |
| **TC-505** | Sold Out button state in booking panel | P0 | (merged with TC-106 above) — `disabled` attribute on "Sold Out" button |
| **TC-508** | Filter update changes URL, no full reload | P2 | Select category → URL changes → no `beforeunload` navigation event fired |

> **Note — merged scenarios**: TC-100 + TC-503 test the same trigger (banner when >5 events) and should be a single test. TC-505 + TC-106 both assert the sold-out state. Merge duplicates when implementing to reduce test count.

---

## Contested Assignments — Decision Rationale

### TC-002 & TC-003: Search (originally suggested E2E, kept E2E)

The search results are rendered in the browser, and the UX interaction (type → wait for debounce → cards update) is the behaviour under test. The debounce in `EventFilters.jsx:37` (300ms) is a client-side concern. While the database query lives in `eventRepository.findAll()`, testing the full UI feedback loop requires a browser. **Verdict: E2E**.

### TC-004: Search by description (originally E2E, downgraded to API)

The only thing being verified is that the Prisma `WHERE` clause includes `description: { contains: search }` (line 24–27 in `eventRepository.js`). There is no UI-specific behaviour for description search vs. title search. **Verdict: API**.

### TC-100/TC-101: Sandbox banner threshold (suggested E2E, kept E2E but flagged for Component)

The banner condition `events.length > 5` is a frontend branch in `EventsContent`. This could be a Component test with a mocked route returning 6 events. However, since the seeded data reliably provides 10 events, E2E is straightforward. **Alternative**: use `page.route()` mock to inject exactly 5 vs 6 events — this makes the test deterministic without relying on seed state. Document this in the test file.

### TC-108: Seat color thresholds (suggested Component, confirmed Component)

`SeatsIndicator` in `EventCard.jsx` has three branches with no side effects. This is a textbook pure component unit test — render with `available=0`, `available=5`, `available=100` and assert text content and CSS class. Running this at E2E would require managing DB state to hit each threshold. **Verdict: Component**.

### TC-104: Cross-user seat isolation (suggested API, confirmed API)

The scenario requires two authenticated users. At E2E this means two browser sessions or `localStorage` manipulation. At API level it is two `fetch()` calls with different JWT tokens — simpler, faster, more reliable. `withPersonalSeats()` returns different values per `userId`; the API response is the ground truth. **Verdict: API**.

### TC-205: Cross-user event access via direct URL (suggested E2E, split to API + E2E)

- **API**: `GET /api/events/:userA_id` with User B's token → expect `null` / 404 from `eventRepository.findById()` (line 46–53: ownership clause). This is the authoritative test.
- **E2E**: User B navigates to `/events/:userA_id` in the browser → "Event not found" UI state. This tests the frontend error handling.
- Run the API test as the primary gate; E2E is supplementary UI validation.

### TC-509: Sticky booking panel (suggested E2E, downgraded to Skip/Manual)

CSS sticky positioning (`lg:sticky lg:top-24`) cannot be meaningfully asserted in Playwright headless Chromium without visual diffing. `getBoundingClientRect()` while scrolling is brittle. **Verdict: Skip from automation; add to manual regression checklist or visual regression tool (e.g., Percy/Argos)**.

---

## Anti-Patterns Found in Existing Tests

Inspected: `tests/booking-management.spec.js`

| # | Anti-Pattern | Location | Impact | Fix |
|---|---|---|---|---|
| 🔴 **CRITICAL** | `BASE_URL = 'https://eventhub.rahulshettyacademy.com'` | Line 3 | Tests run against an external production environment, not localhost. Results are non-deterministic and may pollute shared data. | Change to `http://localhost:3000` per CLAUDE.md |
| 🔴 **CRITICAL** | Hardcoded credentials `rahulshetty1@gmail.com` / `Magiclife1!` | Lines 4–5 | These do not match any documented test account. Tests will fail against the local environment. | Use `snehal1415.patil@gmail.com` / `Passport1$` from the test data table |
| 🟡 **WARNING** | No cleanup **after** tests — only `clearBookings()` before | All tests | Bookings left in DB between runs can cause FIFO pruning to fire unexpectedly, affecting unrelated tests. | Add `test.afterEach(() => clearBookings(page))` or use `test.afterAll` |
| 🟡 **WARNING** | `page.once('dialog', ...)` registered before `goto` in `clearBookings` | Lines 61–62 | If the dialog doesn't appear (e.g., "No bookings yet" path already taken), the handler persists and fires on the next unexpected dialog. | Register the handler immediately before the action that triggers the dialog, not before the goto |

---

## Defense-in-Depth: Critical Rules Covered at Multiple Layers

| Business Rule | Unit | API | E2E |
|---|---|---|---|
| Per-user seat computation | `withPersonalSeats()` function | TC-104 | TC-102, TC-103 |
| Auth enforcement | — | TC-202, TC-203 | TC-200, TC-201 |
| Cross-user event isolation | — | TC-205 | TC-204, TC-205 |
| Price formatting | `fmt_price()` unit | — | TC-107 |
| maxQty capped at availableSeats | `Math.min(10, seats)` unit | — | TC-403 |

---

## Implementation Order (by risk × priority)

1. **Fix existing test file** — correct `BASE_URL` and credentials before running anything (Anti-patterns 1 & 2)
2. **Unit tests** — `withPersonalSeats`, `fmt_price`, `maxQty`, `totalPages` — fast feedback, no infrastructure
3. **API tests** — TC-202, TC-203, TC-205, TC-004, TC-104, TC-405 — verify backend contracts
4. **Component tests** — TC-108, TC-504, TC-500, TC-502, TC-506, TC-507, TC-510
5. **E2E P0** — TC-001, TC-002, TC-005, TC-006, TC-009, TC-010, TC-102, TC-103, TC-106, TC-200, TC-201, TC-505
6. **E2E P1+** — remaining E2E scenarios in priority order

---
