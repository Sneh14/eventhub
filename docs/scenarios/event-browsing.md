# Test Scenarios: Event Browsing

**Feature**: Event Browsing (`/events` list page + `/events/:id` detail page)
**Generated**: 2026-04-06
**Covers**: Events list, search/filter, pagination, event detail view, seat availability display, static vs dynamic events

---

## Happy Path (TC-001 – TC-099)

### TC-001: Browse events as authenticated user
**Category**: Happy Path
**Priority**: P0
**Preconditions**: User is logged in; at least 1 event exists (seeded or user-created)
**Steps**:
1. Navigate to `/events`
2. Observe the page title and event card grid
**Expected Results**: Page shows "Upcoming Events" heading; event cards rendered in a 1–3 column responsive grid; each card shows title, category badge, city, date, price, and "Book Now" button
**Business Rule**: Flow 2 — Browse & Filter Events
**Suggested Layer**: E2E

---

### TC-002: Search events by title keyword
**Category**: Happy Path
**Priority**: P0
**Preconditions**: User is logged in; seeded events are loaded (e.g. "Tech Conference Bangalore")
**Steps**:
1. Navigate to `/events`
2. Type "Tech" in the search bar
3. Wait for results to update
**Expected Results**: Only events whose title contains "Tech" are shown (e.g. "Tech Conference Bangalore"); unrelated events disappear
**Business Rule**: Search bar searches title, description, and venue fields
**Suggested Layer**: E2E

---

### TC-003: Search events by venue keyword
**Category**: Happy Path
**Priority**: P1
**Preconditions**: User is logged in; a seeded event with a known venue exists
**Steps**:
1. Navigate to `/events`
2. Type the venue name (e.g. "Stadium") in the search bar
**Expected Results**: Events matching that venue appear in results
**Business Rule**: Search searches title, description, and venue fields
**Suggested Layer**: E2E

---

### TC-004: Search events by description keyword
**Category**: Happy Path
**Priority**: P1
**Preconditions**: User is logged in; at least one event has a description containing a unique keyword
**Steps**:
1. Navigate to `/events`
2. Enter a keyword that appears only in an event's description
**Expected Results**: That event appears in filtered results
**Business Rule**: Search bar searches title, description, and venue fields
**Suggested Layer**: API

---

### TC-005: Filter events by category
**Category**: Happy Path
**Priority**: P0
**Preconditions**: User is logged in; seeded events include multiple categories
**Steps**:
1. Navigate to `/events`
2. Select "Conference" from the category dropdown
**Expected Results**: Only events with category "Conference" shown (e.g. Tech Conference Bangalore, AI Summit Hyderabad)
**Business Rule**: Category filter — valid values: Conference, Concert, Sports, Workshop, Festival
**Suggested Layer**: E2E

---

### TC-006: Filter events by city
**Category**: Happy Path
**Priority**: P0
**Preconditions**: User is logged in; seeded events span multiple cities
**Steps**:
1. Navigate to `/events`
2. Select "Bangalore" from the city dropdown
**Expected Results**: Only events in Bangalore shown (e.g. Tech Conference Bangalore, Food Festival Bangalore)
**Business Rule**: City filter — valid values: Bangalore, Mumbai, Hyderabad, Delhi, Chennai
**Suggested Layer**: E2E

---

### TC-007: Combine search + category + city filters
**Category**: Happy Path
**Priority**: P1
**Preconditions**: User is logged in; seeded events available
**Steps**:
1. Navigate to `/events`
2. Enter "Festival" in search bar
3. Select "Festival" from category dropdown
4. Select "Bangalore" from city dropdown
**Expected Results**: Only "Food Festival Bangalore" appears; all three filters applied simultaneously; URL query params reflect all three values
**Business Rule**: All three filter params are passed as query params (`search`, `category`, `city`)
**Suggested Layer**: E2E

---

### TC-008: Paginate through events list
**Category**: Happy Path
**Priority**: P1
**Preconditions**: User is logged in; total events across static + user-created exceeds 12
**Steps**:
1. Navigate to `/events`
2. Confirm 12 event cards are visible on page 1
3. Click the "Next page" / page 2 button in the pagination controls
**Expected Results**: URL changes to include `?page=2`; a new set of events is shown; events from page 1 do not repeat
**Business Rule**: Frontend sends `limit: 12`; pagination component uses `totalPages` from API response
**Suggested Layer**: E2E

---

### TC-009: "Book Now" navigates to event detail page
**Category**: Happy Path
**Priority**: P0
**Preconditions**: User is logged in; at least one event card visible
**Steps**:
1. Navigate to `/events`
2. Click the "Book Now" button (`[data-testid="book-now-btn"]`) on any event card
**Expected Results**: Browser navigates to `/events/:id`; event detail page loads with correct event title
**Business Rule**: Flow 2 → Flow 3 transition
**Suggested Layer**: E2E

---

### TC-010: View all meta information on event detail page
**Category**: Happy Path
**Priority**: P0
**Preconditions**: User is logged in; navigate to any event detail page
**Steps**:
1. Navigate to `/events/:id` for a known event
2. Observe the detail layout
**Expected Results**: Page shows: breadcrumb (Events / Event Title), hero image or placeholder, category badge, title, date, time, venue, city, available seats (as "X / Y seats"), price per ticket, and booking panel on the right
**Business Rule**: Event data model fields: title, category, venue, city, eventDate, price, totalSeats, availableSeats
**Suggested Layer**: E2E

---

### TC-011: Static event shows "Featured" badge and informational banner
**Category**: Happy Path
**Priority**: P1
**Preconditions**: User is logged in; navigate to a seeded (static) event detail page
**Steps**:
1. Navigate to `/events`
2. Click "Book Now" on a seeded event (e.g. "Tech Conference Bangalore")
3. Observe the event detail page
**Expected Results**: Green "Featured" badge appears next to category; green info banner reads "This is a featured event — always available for practice"
**Business Rule**: `isStatic = true` for seeded events; displayed with Featured indicator
**Suggested Layer**: E2E

---

### TC-012: Breadcrumb link navigates back to events list
**Category**: Happy Path
**Priority**: P2
**Preconditions**: User is on an event detail page
**Steps**:
1. Navigate to `/events/:id`
2. Click the "Events" breadcrumb link at the top
**Expected Results**: Navigates back to `/events`
**Business Rule**: UI navigation — breadcrumb: Events / [Event Title]
**Suggested Layer**: E2E

---

### TC-013: "Add New Event" CTA navigates to admin page
**Category**: Happy Path
**Priority**: P2
**Preconditions**: User is logged in on the events list page
**Steps**:
1. Navigate to `/events`
2. Scroll to the bottom and click "Add New Event" button
**Expected Results**: Browser navigates to `/admin/events`
**Business Rule**: Events page contains a CTA link to the admin event creation form
**Suggested Layer**: E2E

---

## Business Rules (TC-100 – TC-199)

### TC-100: Sandbox warning banner appears when more than 5 events are visible
**Category**: Business Rule
**Priority**: P1
**Preconditions**: User is logged in; 6 or more events are visible in the list (e.g. all 10 seeded events visible)
**Steps**:
1. Navigate to `/events` with default filters (no search/category/city applied)
2. Observe the amber banner
**Expected Results**: Banner appears with text "Your sandbox holds up to 9 bookings and you can create up to 6 custom events. When either limit is reached, the oldest entry is automatically replaced."
**Business Rule**: Banner displayed when `events.length > 5` (frontend condition, line 75 in page.tsx)
**Suggested Layer**: E2E

---

### TC-101: Sandbox warning banner hidden when 5 or fewer events visible
**Category**: Business Rule
**Priority**: P1
**Preconditions**: User is logged in
**Steps**:
1. Navigate to `/events`
2. Apply filters so that 5 or fewer events are shown (e.g. filter by city=Chennai)
**Expected Results**: Amber sandbox warning banner is NOT visible
**Business Rule**: Banner only shown when `events.length > 5`
**Suggested Layer**: E2E

---

### TC-102: Available seats reflect per-user computed value (not raw DB value)
**Category**: Business Rule
**Priority**: P0
**Preconditions**: User is logged in; user has previously booked N tickets for a specific event
**Steps**:
1. Book 3 tickets for "Tech Conference Bangalore" (500 total seats)
2. Navigate to `/events` and find the "Tech Conference Bangalore" card
3. Navigate to `/events/:id` for the same event
**Expected Results**: Available seats displayed as `497 / 500` (500 - 3 booked by this user), not the raw DB value of 500
**Business Rule**: Per-user seat availability: `availableSeats = totalSeats - sum(user's bookings for that event)`
**Suggested Layer**: E2E

---

### TC-103: Available seats decrease after booking
**Category**: Business Rule
**Priority**: P0
**Preconditions**: User is logged in; user has no existing bookings for the target event
**Steps**:
1. Navigate to `/events/:id`
2. Note the current available seats count
3. Book 2 tickets
4. Navigate back to `/events/:id`
**Expected Results**: Available seats count is now reduced by 2
**Business Rule**: Seat count reduces immediately on booking confirmation
**Suggested Layer**: E2E

---

### TC-104: Static event seat count is database-stored (not computed per-user)
**Category**: Business Rule
**Priority**: P1
**Preconditions**: Two different users; both book tickets for the same static event
**Steps**:
1. User A books 5 tickets for "IPL Cricket Finals" (40000 seats)
2. User B logs in and checks "IPL Cricket Finals" available seats
**Expected Results**: User B sees a different remaining seat count from User A (each user sees their own adjusted count; static events still apply per-user adjustment from `withPersonalSeats`)
**Business Rule**: Per-user seat computation applies to both static and dynamic events; `availableSeats = event.availableSeats - userBooked[eventId]`
**Suggested Layer**: API

---

### TC-105: Events list page loads 12 events per page
**Category**: Business Rule
**Priority**: P1
**Preconditions**: User is logged in; more than 12 events exist in the system
**Steps**:
1. Navigate to `/events` (no filters)
2. Count event cards on the page
**Expected Results**: Exactly 12 event cards visible; pagination shows total pages based on total count ÷ 12
**Business Rule**: Frontend sends `limit: 12` in all event list requests
**Suggested Layer**: E2E

---

### TC-106: Sold-out event shows "SOLD OUT" on detail page
**Category**: Business Rule
**Priority**: P0
**Preconditions**: User has booked all available seats for an event (or event has 0 available seats)
**Steps**:
1. Book enough tickets to exhaust all seats for a user-created event with small seat count (e.g. 1 seat)
2. Navigate to `/events/:id` for that event
**Expected Results**: Available seats field shows "SOLD OUT" in red; "Confirm Booking" button replaced by disabled "Sold Out" button
**Business Rule**: `soldOut = event.availableSeats === 0`; button disabled when sold out
**Suggested Layer**: E2E

---

### TC-107: Price displayed in correct USD currency format
**Category**: Business Rule
**Priority**: P1
**Preconditions**: User is logged in; seeded events have known prices
**Steps**:
1. Navigate to `/events/:id` for "Tech Conference Bangalore" ($1499)
2. Observe price per ticket in detail page and booking panel
**Expected Results**: Price shown as "$1,499" (Intl.NumberFormat with USD, no decimal); same format in price summary (`$1,499 × 1 ticket`)
**Business Rule**: Price formatting: `Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })`
**Suggested Layer**: E2E

---

### TC-108: Seat color coding thresholds on event detail page
**Category**: Business Rule
**Priority**: P1
**Preconditions**: User is logged in
**Steps**:
1. View event with > 10 available seats
2. View event with ≤ 10 available seats (but > 0)
3. View event with 0 available seats
**Expected Results**:
- > 10 seats: emerald/green color text ("X / Y seats")
- ≤ 10 seats: amber/warning color text
- 0 seats: red bold text ("SOLD OUT")
**Business Rule**: Seat availability color coding in `EventDetailPage` MetaItem for "Available"
**Suggested Layer**: Component

---

## Security (TC-200 – TC-299)

### TC-200: Unauthenticated user cannot access events list page
**Category**: Security
**Priority**: P0
**Preconditions**: User is NOT logged in (no JWT token in localStorage)
**Steps**:
1. Navigate to `/events` without logging in
**Expected Results**: Redirected to `/login`; events page content not visible
**Business Rule**: All event API endpoints require Bearer token authentication
**Suggested Layer**: E2E

---

### TC-201: Unauthenticated user cannot access event detail page
**Category**: Security
**Priority**: P0
**Preconditions**: User is NOT logged in
**Steps**:
1. Navigate directly to `/events/1` (a known event ID)
**Expected Results**: Redirected to `/login`; event detail page content not visible
**Business Rule**: GET `/api/events/:id` requires Bearer token
**Suggested Layer**: E2E

---

### TC-202: API GET /api/events without token returns 401
**Category**: Security
**Priority**: P0
**Preconditions**: No authentication token
**Steps**:
1. Send `GET /api/events` without an `Authorization` header
**Expected Results**: HTTP 401 response; body contains "Unauthorized" message
**Business Rule**: Missing auth token → 401 Unauthorized
**Suggested Layer**: API

---

### TC-203: API GET /api/events/:id without token returns 401
**Category**: Security
**Priority**: P0
**Preconditions**: No authentication token
**Steps**:
1. Send `GET /api/events/1` without an `Authorization` header
**Expected Results**: HTTP 401 response
**Business Rule**: Missing auth token → 401 Unauthorized
**Suggested Layer**: API

---

### TC-204: User A cannot see User B's dynamic events in the list
**Category**: Security
**Priority**: P0
**Preconditions**: User A creates a private dynamic event; User B logs in
**Steps**:
1. User A logs in and creates a dynamic event via `/admin/events`
2. Note the event title
3. User B logs in and navigates to `/events`
4. Search for User A's event title
**Expected Results**: User B does NOT see User A's dynamic event; only static (seeded) events and their own dynamic events are visible
**Business Rule**: User sandbox isolation — each user only sees their own dynamic events + static events
**Suggested Layer**: E2E

---

### TC-205: User A cannot access User B's dynamic event via direct URL
**Category**: Security
**Priority**: P0
**Preconditions**: User A has created a dynamic event with a known ID
**Steps**:
1. User A creates an event; capture event ID from the URL or API response
2. User B logs in and navigates to `/events/:userA_event_id`
**Expected Results**: Event detail page shows "Event not found" state (event is not visible to User B's session)
**Business Rule**: `eventRepository.findById` filters by `userId` for dynamic events — other users' events return not found
**Suggested Layer**: E2E

---

### TC-206: Manipulated search query param does not expose protected data
**Category**: Security
**Priority**: P1
**Preconditions**: User is logged in
**Steps**:
1. Navigate to `/events?search=<script>alert(1)</script>`
2. Observe the search results and page behavior
**Expected Results**: No JavaScript executes; the search term is treated as literal text; either no results shown or sanitized display
**Business Rule**: Search parameters passed to API; input must not allow XSS
**Suggested Layer**: E2E

---

## Negative / Error (TC-300 – TC-399)

### TC-300: Search with no matching results shows empty state
**Category**: Negative
**Priority**: P1
**Preconditions**: User is logged in
**Steps**:
1. Navigate to `/events`
2. Enter a search term that matches no events (e.g. "xyznonexistent123")
**Expected Results**: Empty state component shown with title "No events found" and description "Try adjusting your filters or search terms to find what you're looking for."
**Business Rule**: Empty state rendered when `events.length === 0`
**Suggested Layer**: E2E

---

### TC-301: Category filter with no matching events shows empty state
**Category**: Negative
**Priority**: P1
**Preconditions**: User is logged in; a category exists that has no events
**Steps**:
1. Navigate to `/events`
2. Apply a category filter that matches zero events
**Expected Results**: Empty state displayed; no event cards shown
**Business Rule**: Empty state when filtered result is empty
**Suggested Layer**: E2E

---

### TC-302: Navigate to non-existent event ID shows "Event not found"
**Category**: Negative
**Priority**: P1
**Preconditions**: User is logged in
**Steps**:
1. Navigate to `/events/999999` (an ID that does not exist)
**Expected Results**: Page shows EmptyState with title "Event not found" and description "The event you're looking for doesn't exist or has been removed."; "Browse Events" button links back to `/events`
**Business Rule**: `getEventById` throws `NotFoundError` when event not found; frontend handles `isError` state
**Suggested Layer**: E2E

---

### TC-303: Network error on events list shows error state with Retry button
**Category**: Negative
**Priority**: P1
**Preconditions**: User is logged in; backend is unreachable (simulate offline or blocked request)
**Steps**:
1. Block the network request to `/api/events` (e.g. via Playwright `route.abort()`)
2. Navigate to `/events`
**Expected Results**: Error state displayed with title "Couldn't load events", description "There was a problem connecting to the server. Please try again.", and a "Retry" button
**Business Rule**: Error state rendered when `isError = true` from `useEvents` hook
**Suggested Layer**: E2E

---

### TC-304: Retry button re-fetches events after error
**Category**: Negative
**Priority**: P1
**Preconditions**: User is logged in; network was blocked causing error state
**Steps**:
1. Simulate network failure on `/api/events`
2. Observe error state
3. Restore network
4. Click the "Retry" button
**Expected Results**: Events list successfully loads and error state is replaced by event cards
**Business Rule**: `action={<Button onClick={() => refetch()}>Retry</Button>}` in error state
**Suggested Layer**: E2E

---

### TC-305: Searching with empty string returns all events
**Category**: Negative
**Priority**: P2
**Preconditions**: User is logged in; user had a search term applied
**Steps**:
1. Navigate to `/events?search=Tech`
2. Clear the search input field
3. Wait for results to update
**Expected Results**: All events are shown again (no search filter applied); pagination reflects total count
**Business Rule**: Empty `search` param treated as `undefined` (no filter)
**Suggested Layer**: E2E

---

### TC-306: Invalid event ID type in URL (non-numeric)
**Category**: Negative
**Priority**: P2
**Preconditions**: User is logged in
**Steps**:
1. Navigate to `/events/abc` (non-numeric event ID)
**Expected Results**: Error/Not Found state displayed; no crash or unhandled exception
**Business Rule**: `getEventById` expects integer ID; invalid input should be gracefully handled
**Suggested Layer**: E2E

---

## Edge Cases (TC-400 – TC-499)

### TC-400: Pagination — last page may have fewer than 12 events
**Category**: Edge Case
**Priority**: P1
**Preconditions**: User is logged in; total event count is not a multiple of 12 (e.g. 14 events)
**Steps**:
1. Navigate to `/events`
2. Click to page 2
**Expected Results**: Page 2 shows the remaining 2 events (not 12); pagination correctly indicates page 2 of 2
**Business Rule**: `totalPages = Math.ceil(total / limit)` from API
**Suggested Layer**: E2E

---

### TC-401: Exactly 12 events — no second page shown
**Category**: Edge Case
**Priority**: P2
**Preconditions**: Total events visible to user is exactly 12
**Steps**:
1. Navigate to `/events` (ensure exactly 12 events)
2. Observe pagination
**Expected Results**: All 12 events shown; pagination either not shown or shows only page 1 with no next button
**Business Rule**: `totalPages = Math.ceil(12 / 12) = 1`
**Suggested Layer**: E2E

---

### TC-402: Event with zero price (free event) displays $0
**Category**: Edge Case
**Priority**: P2
**Preconditions**: User creates an event with price = 0
**Steps**:
1. Create an event via `/admin/events` with price = 0
2. Navigate to the event detail page
**Expected Results**: Price displays as "$0" (valid currency format); booking total shown as "$0"
**Business Rule**: `price >= 0` is allowed; `Intl.NumberFormat` with maximumFractionDigits=0 renders as "$0"
**Suggested Layer**: E2E

---

### TC-403: Event with exactly 1 available seat — max ticket quantity capped at 1
**Category**: Edge Case
**Priority**: P1
**Preconditions**: User creates an event with 1 total seat and books 0 tickets so far
**Steps**:
1. Navigate to `/events/:id` for the event with 1 available seat
2. Observe the ticket quantity controls
**Expected Results**: Ticket quantity starts at 1; "+" button is disabled (cannot increment above 1); "(max 1)" label shown
**Business Rule**: `maxQty = Math.min(10, event.availableSeats)` — capped at available seats
**Suggested Layer**: E2E

---

### TC-404: Filters are reflected in URL query params and survive page refresh
**Category**: Edge Case
**Priority**: P1
**Preconditions**: User is logged in
**Steps**:
1. Navigate to `/events`
2. Apply search="Tech", category="Conference", city="Bangalore"
3. Refresh the browser page
**Expected Results**: Filters are still applied after refresh; same events shown; URL still contains `?search=Tech&category=Conference&city=Bangalore`
**Business Rule**: Filters stored in URL query params via Next.js `useSearchParams` — survive navigation and refresh
**Suggested Layer**: E2E

---

### TC-405: Navigating to page > totalPages shows empty or redirects
**Category**: Edge Case
**Priority**: P2
**Preconditions**: User is logged in; total pages = 2
**Steps**:
1. Navigate to `/events?page=999`
**Expected Results**: Either empty state or last page is shown; no unhandled error; pagination shows valid state
**Business Rule**: API returns empty `data[]` for out-of-range page; frontend shows empty state
**Suggested Layer**: E2E

---

### TC-406: Event without description hides "About this event" section
**Category**: Edge Case
**Priority**: P2
**Preconditions**: User creates an event with no description field
**Steps**:
1. Create an event with title, category, venue etc. but no description
2. Navigate to that event's detail page
**Expected Results**: "About this event" heading and paragraph are NOT rendered; no empty section or placeholder shown
**Business Rule**: `{event.description && <div>...</div>}` — conditionally rendered
**Suggested Layer**: E2E

---

### TC-407: Clearing one filter while others remain active
**Category**: Edge Case
**Priority**: P2
**Preconditions**: User has search + city filters active on events page
**Steps**:
1. Navigate to `/events?search=Festival&city=Bangalore`
2. Clear only the city filter (reset to "All Cities")
**Expected Results**: Results now show all festivals regardless of city; only `search=Festival` remains in query params
**Business Rule**: Each filter param is independently managed; removing one doesn't reset others
**Suggested Layer**: E2E

---

### TC-408: Very long event title does not break card or detail page layout
**Category**: Edge Case
**Priority**: P3
**Preconditions**: User creates an event with a very long title (100+ characters)
**Steps**:
1. Create an event with title = "A" × 100 characters
2. Navigate to `/events` and find the card
3. Navigate to `/events/:id`
**Expected Results**: Event card truncates or wraps the title gracefully; detail page breadcrumb truncates (`truncate` CSS class applied); no layout overflow
**Business Rule**: Breadcrumb uses `truncate` class on event title span
**Suggested Layer**: E2E

---

## UI State (TC-500 – TC-599)

### TC-500: Loading skeleton cards shown while events fetch
**Category**: UI State
**Priority**: P1
**Preconditions**: User is logged in; network is intentionally slowed
**Steps**:
1. Throttle network to simulate slow connection
2. Navigate to `/events`
3. Observe the page during data fetch
**Expected Results**: 12 `EventCardSkeleton` placeholder cards shown in the grid while `isLoading = true`
**Business Rule**: `if (isLoading) return <EventCardSkeleton>` grid (12 skeletons)
**Suggested Layer**: E2E

---

### TC-501: Empty state UI elements are correct
**Category**: UI State
**Priority**: P1
**Preconditions**: Filters applied that yield zero results
**Steps**:
1. Search for a term with no matching events
2. Observe the empty state component
**Expected Results**: Calendar SVG icon displayed; "No events found" heading; "Try adjusting your filters..." description; no event cards or pagination
**Business Rule**: `EmptyState` component rendered with title, description, and icon
**Suggested Layer**: E2E

---

### TC-502: Event detail page shows full-page spinner while loading
**Category**: UI State
**Priority**: P2
**Preconditions**: User navigates to event detail page with slow network
**Steps**:
1. Throttle network
2. Navigate to `/events/:id`
**Expected Results**: Large `Spinner` component centered in `min-h-[60vh]` container while `isLoading = true`
**Business Rule**: Event detail page loading state: `if (isLoading) return <Spinner size="lg">`
**Suggested Layer**: E2E

---

### TC-503: Sandbox warning banner displays correct text content
**Category**: UI State
**Priority**: P1
**Preconditions**: User is on `/events` page with > 5 events visible
**Steps**:
1. Navigate to `/events` (default, no filters)
2. Read the amber banner text
**Expected Results**: Banner shows: "Your sandbox holds up to **9 bookings** and you can create up to **6 custom events**. When either limit is reached, the oldest entry is automatically replaced."
**Business Rule**: Sandbox limits: 9 bookings, 6 events — warning banner content
**Suggested Layer**: E2E

---

### TC-504: Category badge color matches event category
**Category**: UI State
**Priority**: P2
**Preconditions**: User is on an event detail page
**Steps**:
1. View detail page for a "Conference" event
2. View detail page for a "Concert" event
3. View detail page for a "Festival" event
**Expected Results**: Conference → indigo badge; Concert → warning/yellow badge; Sports → success/green badge; Workshop → info/blue badge; Festival → danger/red badge
**Business Rule**: `CATEGORY_VARIANT` mapping in event detail page
**Suggested Layer**: Component

---

### TC-505: Sold-out event disables booking form and shows "Sold Out" button
**Category**: UI State
**Priority**: P0
**Preconditions**: Event has 0 available seats (per-user computed)
**Steps**:
1. Navigate to `/events/:id` for an event with 0 available seats
2. Observe the booking panel
**Expected Results**: "Confirm Booking" button rendered as disabled with text "Sold Out"; quantity controls may still be visible but booking cannot proceed
**Business Rule**: `soldOut = event.availableSeats === 0`; button uses `disabled={soldOut}` and conditional label
**Suggested Layer**: E2E

---

### TC-506: Pagination controls not rendered when only one page exists
**Category**: UI State
**Priority**: P2
**Preconditions**: Total events ≤ 12 (fits on one page)
**Steps**:
1. Navigate to `/events` with filters that produce ≤ 12 results
2. Observe bottom of page
**Expected Results**: Pagination component not rendered; no page navigation shown
**Business Rule**: `{pagination && <Pagination .../>}` — only rendered when `pagination` object exists and `totalPages > 1` (implied by component implementation)
**Suggested Layer**: E2E

---

### TC-507: Event card "Book Now" button present and functional for each card
**Category**: UI State
**Priority**: P0
**Preconditions**: User is logged in; events list loaded
**Steps**:
1. Navigate to `/events`
2. Verify each event card has a `[data-testid="book-now-btn"]` element
**Expected Results**: Every event card displays a "Book Now" button; button is clickable and navigates to correct event detail URL
**Business Rule**: Each card links to `/events/:id`
**Suggested Layer**: E2E

---

### TC-508: Filter controls update URL without full page reload
**Category**: UI State
**Priority**: P2
**Preconditions**: User is on events list page
**Steps**:
1. Navigate to `/events`
2. Select a category from the dropdown
3. Observe browser URL and page behavior
**Expected Results**: URL updates to include `?category=Conference` (or selected value); page does NOT full-reload; React Query re-fetches in the background; results update without navigation
**Business Rule**: `router.push()` used for filter changes — client-side navigation
**Suggested Layer**: E2E

---

### TC-509: Booking panel is sticky on large screens
**Category**: UI State
**Priority**: P3
**Preconditions**: User is on event detail page on a desktop viewport (≥ 1024px)
**Steps**:
1. Navigate to `/events/:id` in desktop viewport
2. Scroll down the page while the description is visible
**Expected Results**: The booking panel (right column) remains visible/sticky while scrolling; panel has `lg:sticky lg:top-24` styling
**Business Rule**: Booking panel uses `lg:sticky lg:top-24` to stay in view on desktop
**Suggested Layer**: E2E

---

### TC-510: Events page shows "Upcoming Events" heading
**Category**: UI State
**Priority**: P2
**Preconditions**: User is logged in
**Steps**:
1. Navigate to `/events`
**Expected Results**: Page heading reads "Upcoming Events" with subtitle "Find your next unforgettable experience"
**Business Rule**: Static page header content
**Suggested Layer**: E2E

---
