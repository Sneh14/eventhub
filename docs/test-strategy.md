# EventHub — Booking Management Test Strategy

Generated: 2026-03-06
Input: `docs/test-scenarios.md` (53 scenarios, TC-001 to TC-510)

---

## 1. Layer Distribution Summary

| Layer | TC Count | Focus | Approx. Run Time |
|---|---|---|---|
| **Unit** | 5 | Pure functions with no I/O (`randomRef`, `generateUniqueRef`, price calc) | < 1s total |
| **API / Integration** | 22 | Backend contract, auth enforcement, business rule execution, DB state | 10–30s total |
| **Component** | 14 | Client-side UI states, conditional rendering, mocked API responses | 5–15s total |
| **E2E** | 12 | Critical user journeys, multi-page flows, cross-session security | 2–5 min total |
| **Total** | **53** | | |

**Pyramid shape**: Unit (5) → API (22) → Component (14) → E2E (12) ✓

> **Note on multi-layer coverage**: TC-102 (booking ref prefix) and TC-106 (price calculation) are intentionally tested at Unit + API for defense-in-depth. The E2E layer confirms only the critical happy path end-to-end.

---

## 2. Layer Assignments

### Unit Tests
_Criteria: Pure function, no I/O, no DB. Source: `backend/src/services/bookingService.js`_

| TC | Title | Function Under Test | File:Line |
|---|---|---|---|
| TC-102 | Booking ref prefix matches event title first character | `randomRef(eventTitle)` | `bookingService.js:11` |
| TC-405 | Booking ref uniqueness — collision retry mechanism | `generateUniqueRef(eventTitle)` with mocked `findByRef` | `bookingService.js:21` |
| TC-406 | Price calculation: totalPrice = price × quantity | inline expression `parseFloat(event.price) * data.quantity` | `bookingService.js:99` |
| TC-408 | Event title starting with digit — prefix is digit char | `randomRef('100 Days Festival')` | `bookingService.js:12` |

**Rationale**: `randomRef()` and `generateUniqueRef()` are pure/near-pure functions requiring only a mocked `bookingRepository.findByRef`. Testing them at API or E2E adds overhead with no added confidence. The price formula is a one-liner with no branching — unit is the correct and only layer needed.

---

### API / Integration Tests
_Criteria: Backend business rule, API contract, or requires real DB state. Auth enforced via JWT. Source: `bookingController.js`, `bookingService.js`, `bookingValidator.js`_

#### Happy Path — API contracts
| TC | Title | Endpoint | Service Function |
|---|---|---|---|
| TC-007 | Lookup booking by reference | `GET /api/bookings/ref/:ref` | `bookingService.getBookingByRef` |
| TC-107 | Bookings list pagination response shape | `GET /api/bookings?page=1&limit=10` | `bookingService.getBookings` |
| TC-407 | Page 2 pagination with partial results | `GET /api/bookings?page=2&limit=5` | `bookingService.getBookings` |

#### Business Rules — DB-dependent
| TC | Title | Service Function | Key Code |
|---|---|---|---|
| TC-100 / TC-400 | FIFO pruning — 10th booking deletes oldest from different event | `bookingService.createBooking` | `findOldestUserBookingExcludingEvent` at `bookingService.js:73` |
| TC-101 / TC-401 | FIFO same-event fallback — seat permanently burned | `bookingService.createBooking` | `sameEventFallback` + `eventRepository.decrementSeats` at `bookingService.js:95` |
| TC-108 | Seat release after cancel (dynamic event, computed availability) | `bookingService.cancelBooking` | `bookingRepository.delete(id)` at `bookingService.js:133` |
| TC-406 | Clear all with 1 booking — `deleted` count = 1 | `bookingService.clearAllBookings` | `bookingRepository.deleteAllForUser` at `bookingService.js:122` |

#### Security — Auth Enforcement
| TC | Title | Endpoint | Enforcement Point |
|---|---|---|---|
| TC-201 | Cross-user GET booking returns 403 | `GET /api/bookings/:id` | `bookingService.js:57`: `booking.userId !== userId` |
| TC-202 | Cross-user DELETE booking returns 403 | `DELETE /api/bookings/:id` | `bookingService.js:129`: `booking.userId !== userId` |
| TC-206 | Cross-user ref lookup returns 403 | `GET /api/bookings/ref/:ref` | `bookingService.js:64`: `booking.userId !== userId` |
| TC-203 | Unauthenticated GET /api/bookings returns 401 | `GET /api/bookings` | Auth middleware (no token) |
| TC-204 | Unauthenticated GET /api/bookings/:id returns 401 | `GET /api/bookings/:id` | Auth middleware |
| TC-205 | Unauthenticated DELETE /api/bookings returns 401 | `DELETE /api/bookings` | Auth middleware |

#### Negative / Validation
| TC | Title | Validator / Service | Validation Rule |
|---|---|---|---|
| TC-301 | GET non-existent booking returns 404 | `bookingService.getBookingById` | `NotFoundError` at `bookingService.js:56` |
| TC-302 | Create booking with insufficient seats returns 400 | `bookingService.createBooking` | `InsufficientSeatsError` at `bookingService.js:89` |
| TC-303 | Create booking for non-existent event returns 404 | `bookingService.createBooking` | `NotFoundError` at `bookingService.js:83` |
| TC-304 | Missing required fields returns 400 | `bookingValidator.validateCreateBooking` | `bookingValidator.js:22-44` |
| TC-305 | Quantity = 0 or negative returns 400 | `bookingValidator.validateCreateBooking` | `isInt({ min: 1, max: 10 })` at `bookingValidator.js:39` |
| TC-306 | Quantity > 10 returns 400 | `bookingValidator.validateCreateBooking` | `isInt({ min: 1, max: 10 })` at `bookingValidator.js:39` |
| TC-307 | Cancel already-cancelled booking returns 404 | `bookingService.cancelBooking` | `bookingRepository.findById` returns null → `NotFoundError` |

---

### Component Tests
_Criteria: Single component renders correctly for a given prop or mocked state. No real network calls. Source: `frontend/app/bookings/page.tsx`, `frontend/app/bookings/[id]/page.tsx`_

#### Refund Eligibility — `RefundEligibility` component (`[id]/page.tsx:21`)
| TC | Title | Props / State | Assertion |
|---|---|---|---|
| TC-103 | quantity=1 → "Eligible for refund" result | `quantity={1}`, click check, wait 4s | `#refund-result` contains "Eligible for refund." |
| TC-104 | quantity=3 → "Not eligible" with correct count | `quantity={3}`, click check, wait 4s | `#refund-result` contains "Group bookings (3 tickets) are non-refundable" |
| TC-404 | quantity=2 boundary → NOT eligible | `quantity={2}`, click check, wait 4s | `#refund-result` shows ineligible message |
| TC-105 | Spinner shows during the 4-second check | `quantity={1}`, click check | `#refund-spinner` visible immediately; disappears after 4s (`timeout: 6000`) |
| TC-508 | Full state machine: idle → checking → result | `quantity={1}` | Button hidden after click; spinner visible then replaced by result |

#### Bookings List — `BookingsContent` component (`page.tsx:14`)
| TC | Title | Mocked State | Assertion |
|---|---|---|---|
| TC-500 | Loading skeleton renders while fetching | `isLoading = true` (mock) | 5 `BookingCardSkeleton` elements visible |
| TC-501 | Empty state when no bookings | `data.data = []` (mock empty response) | "No bookings yet" heading + "Browse Events" link |
| TC-308 | Error state when server unreachable | `isError = true` (mock) | "Couldn't load bookings" + "Retry" button visible |
| TC-109 | "Clear all bookings" button always visible with bookings | `data.data = [booking]` | "Clear all bookings" link in DOM |
| TC-507 | Button shows "Clearing…" during in-flight API call | `clearing = true` state | Button text = "Clearing…", `disabled` attribute set |
| TC-510 | Pagination renders when totalPages > 1 | Mock `pagination.totalPages = 3` | Pagination component visible with correct page |

#### Booking Detail — `BookingDetailPage` component (`[id]/page.tsx:91`)
| TC | Title | Mocked State | Assertion |
|---|---|---|---|
| TC-502 | Full-screen spinner while loading | `isLoading = true` (mock) | `Spinner size="lg"` visible |
| TC-300 | "Booking not found" renders on 404 | `isError = true`, `error.status = 404` | EmptyState title = "Booking not found" |

---

### E2E Tests
_Criteria: Multi-page user journey, full-stack data flow, cross-session security requiring real browser state. Source: Playwright, `playwright.config.ts`_

#### Critical Happy Paths (must have green before shipping)
| TC | Title | Precondition | Journey Scope |
|---|---|---|---|
| TC-001 | View bookings list with existing bookings | 1+ bookings in DB | Login → `/bookings` → assert cards rendered |
| TC-002 | View single booking detail page | 1+ bookings | Login → `/bookings` → "View Details" → `/bookings/:id` → assert all sections |
| TC-003 | Cancel a single booking from detail page | 1+ bookings | Login → detail → "Cancel Booking" → confirm → assert redirect + toast |
| TC-004 | Clear all bookings | 1+ bookings | Login → `/bookings` → "Clear all bookings" → confirm → assert empty state |
| TC-006 | Navigate to bookings after completing a booking | Fresh account | Login → book event → "View My Bookings" → assert booking in list |

#### Business Rule Validation (E2E confirms end-to-end rule enforcement)
| TC | Title | What E2E Adds Over API Test |
|---|---|---|
| TC-102 | Booking ref prefix matches event title first character | Validates the confirmation card UI displays the correct ref, not just API response |

#### Security (requires two browser sessions)
| TC | Title | Why Must Be E2E |
|---|---|---|
| TC-200 | Cross-user access shows "Access Denied" UI | Requires login as User A, capture booking ID, logout, login as User B, navigate — multi-session flow |
| TC-509 | Access Denied vs Booking Not Found — correct state rendered | Validates `error.status === 403` branch in `[id]/page.tsx:119` renders "Access Denied" not "not found" |

#### Edge Case UI Behaviors (requires real UI interaction)
| TC | Title | Why Must Be E2E |
|---|---|---|
| TC-402 | Quantity = 1 minimum — decrement button disabled at 1 | UI button disabling requires real DOM interaction |
| TC-403 | Quantity = 10 maximum — increment button disabled at 10 | UI button disabling requires real DOM interaction |
| TC-404* | Refund eligibility at qty=2 | *Preferred as Component; E2E only if Component tests don't exist |

#### UI State Requiring Real Navigation
| TC | Title | Why Must Be E2E |
|---|---|---|
| TC-503 | Cancel booking confirmation dialog appears | Requires real booking ID + navigation to detail page; dialog needs live DOM |
| TC-504 | Dismiss cancel dialog — booking NOT cancelled | Same as TC-503; must verify no API call was made after dismiss |
| TC-505 | Breadcrumb shows booking ref | Part of TC-002; verify `booking.bookingRef` rendered in breadcrumb nav |
| TC-506 | Cancel success — toast + redirect to `/bookings` | Validates `onSuccess` callback: toast visible + `router.push('/bookings')` |

---

## 3. Decision Rationale — Contested Assignments

### TC-103 / TC-104 / TC-105 — Refund Eligibility → Component (not E2E)
**Original suggestion**: E2E / Component
**Decision**: Component only

**Rationale**: The `RefundEligibility` component at `[id]/page.tsx:21` is 100% client-side. The logic is:
```javascript
setTimeout(() => {
  setStatus(quantity === 1 ? 'eligible' : 'ineligible');
}, 4000);
```
There is no backend API call. No database. No network. This makes E2E testing this rule wasteful — it adds login overhead, navigation to a real booking, and 4+ seconds of waiting per test. A component test with `quantity={1}` and `quantity={2}` covers all branches in milliseconds. The 4-second spinner is also best validated at Component level using Playwright's `timeout` assertion, as documented in `playwright-best-practices.md:134`.

---

### TC-304 / TC-305 / TC-306 — Validation Errors → API (not E2E)
**Original suggestion**: API
**Decision**: API confirmed — do NOT add E2E coverage

**Rationale**: Input validation lives entirely in `bookingValidator.validateCreateBooking` (`bookingValidator.js:15`). The validator runs before the service layer is even reached. Testing `quantity: 0` at E2E would require filling a form, submitting, and checking an error toast — but the same rule is proven more precisely with a direct `POST /api/bookings` returning `400`. E2E for validation errors is the **ice cream cone anti-pattern**: slow, brittle, and testing at the wrong level.

---

### TC-100 / TC-101 / TC-400 / TC-401 — FIFO Pruning → API (not E2E)
**Original suggestion**: API
**Decision**: API confirmed — do NOT add E2E coverage for FIFO

**Rationale**: FIFO pruning is orchestrated entirely in `bookingService.createBooking` (`bookingService.js:70-97`). It involves:
1. `bookingRepository.countUserBookings(userId)` — count check
2. `bookingRepository.findOldestUserBookingExcludingEvent(userId, eventId)` — FIFO selection
3. `bookingRepository.delete(oldest.id)` — pruning
4. `eventRepository.decrementSeats(eventId, quantity)` — seat burn for same-event fallback

None of these are observable in the UI without checking booking counts before and after. An API test can precisely set up 9 bookings, issue the 10th, and assert DB state. E2E would be fragile (requires pre-seeding 9 bookings, timing-sensitive).

---

### TC-200 / TC-509 — Cross-User Security → E2E (not just API)
**Original suggestion**: E2E (Security)
**Decision**: Both API and E2E required

**Rationale**: TC-201 covers the API-level 403. But TC-200 and TC-509 test the **frontend handling** of the 403 response:
```typescript
// [id]/page.tsx:119
const is403 = (error as any)?.status === 403;
return <EmptyState title={is403 ? 'Access Denied' : 'Booking not found'} ... />
```
This branch is only exercised by navigating to a real cross-user URL in a real browser. The correct EmptyState variant being rendered is a UI-layer assertion that API tests cannot make.

---

### TC-500 / TC-501 / TC-308 — Loading/Error/Empty States → Component (not E2E)
**Original suggestion**: E2E / Component
**Decision**: Component with mocked API responses

**Rationale**: All three states (loading, error, empty) are driven by React Query flags (`isLoading`, `isError`, empty `data.data`). These are testable via `page.route()` interception as documented in `playwright-best-practices.md:241`:
```javascript
await page.route('**/api/bookings**', async (route) => {
  await route.fulfill({ status: 500, body: JSON.stringify({ error: 'Server error' }) });
});
```
Running a full E2E test just to verify skeleton rendering is wasteful. Component tests with route interception isolate the frontend logic from backend availability.

---

## 4. Anti-Patterns to Avoid

These anti-patterns were identified from the suggested layers in `test-scenarios.md` and must NOT be implemented:

| Anti-Pattern | Affected TCs | Correct Approach |
|---|---|---|
| Testing `quantity` boundary (0, 11) at E2E | TC-305, TC-306 | API test: `POST /api/bookings` with invalid quantity → verify 400 response from `bookingValidator.js:39` |
| Testing 4-second refund spinner at E2E (login + navigate + wait) | TC-103, TC-104, TC-105 | Component test: render `<RefundEligibility quantity={1} />`, click, assert spinner then result |
| Testing FIFO pruning at E2E (requires 9+ bookings pre-seeded) | TC-100, TC-101 | API test: use direct `POST /api/bookings` calls to set up state precisely |
| Testing "Booking not found" by navigating to `/bookings/99999` at E2E | TC-300 | Component test: mock `isError=true` with `error.status=404` via route interception |
| Testing auth 401 responses by manipulating UI session at E2E | TC-203, TC-204, TC-205 | API test: send requests without `Authorization` header, assert 401 |
| No E2E coverage for the cancel booking flow | — | TC-003 and TC-506 must have E2E — cancellation is a destructive action visible to users |

---

## 5. Defense-in-Depth Coverage Map

Critical rules covered at multiple layers for maximum confidence:

| Rule | Unit | API | Component | E2E |
|---|---|---|---|---|
| Booking ref prefix = event title first char | TC-102 | TC-102 | — | TC-102 |
| Price = price × quantity | TC-106 | TC-106 | — | TC-006 (implicit) |
| Refund: qty=1 eligible, qty>1 not eligible | — | — | TC-103, TC-104, TC-404 | — |
| Cross-user access denied | — | TC-201 | — | TC-200, TC-509 |
| Cancel booking — data deleted, redirect shown | — | TC-307 | — | TC-003, TC-506 |
| FIFO pruning at 9 bookings | — | TC-100, TC-101, TC-400, TC-401 | — | — |
| Auth required (401 on all endpoints) | — | TC-203, TC-204, TC-205 | — | — |

---

## 6. Implementation Priority Order

Ship in this order — each tier unblocks the next:

**Tier 1 — P0, must pass before any release**
- `TC-001, TC-002, TC-003, TC-004` (E2E happy paths)
- `TC-102` (booking ref rule — Unit + API)
- `TC-201, TC-202` (security — API)
- `TC-200` (cross-user access — E2E)
- `TC-302` (insufficient seats — API)

**Tier 2 — P1, run in CI on every PR**
- `TC-100, TC-101` (FIFO pruning — API)
- `TC-103, TC-104, TC-105` (refund eligibility — Component)
- `TC-203, TC-204, TC-205` (auth enforcement — API)
- `TC-304, TC-305, TC-306` (validation — API)
- `TC-500, TC-501, TC-308` (UI states — Component)
- `TC-503, TC-506` (cancel dialog + success — E2E)

**Tier 3 — P2, run nightly or pre-release**
- `TC-405, TC-408` (edge cases — Unit)
- `TC-107, TC-407` (pagination — API)
- `TC-402, TC-403` (quantity UI boundaries — E2E)
- `TC-507, TC-508, TC-510` (UI micro-states — Component)

---

## 7. Source File Map for Test Generation

| Layer | Test File Location | Key Source Files |
|---|---|---|
| Unit | `tests/unit/bookingService.test.js` | `backend/src/services/bookingService.js` |
| API | `tests/api/bookings.api.spec.js` | `backend/src/routes/`, `backend/src/validators/bookingValidator.js` |
| Component | `tests/components/booking-ui.spec.js` | `frontend/app/bookings/page.tsx`, `frontend/app/bookings/[id]/page.tsx` |
| E2E | `tests/booking-management.spec.js` | Full stack; use `rahulshetty1@gmail.com` / `rahulshetty1@yahoo.com` |
