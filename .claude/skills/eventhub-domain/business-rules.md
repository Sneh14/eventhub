# EventHub Business Rules

## 1. User Journey
- User signs up or signs in -> browses events -> selects an event -> books tickets
- On booking: seat count reduces immediately, booking reference is generated
- Booking reference first character MUST match the event title's first character (e.g., Event "Tech Summit" -> Ref starts with "T")
- After booking, user can view bookings via "View My Bookings" link or "View Details"
- User can cancel (delete) individual bookings or "Clear All Bookings" in one action
- Users can also create events from the Admin UI or via API

## 2. User Sandbox Isolation
- Each user only sees their own dynamic events and bookings
- Static events (seeded) are shared across all users
- Cross-user access to bookings returns 403 Forbidden ("Access Denied")
- Deleting a user cascades to their events and bookings

## 3. Event Limits (FIFO Pruning)
- Max **6 user-created events** per account
- When limit reached, the OLDEST event is automatically deleted (FIFO replacement)
- Static events are not counted toward this limit
- Static events cannot be edited or deleted
- Events page shows max 9 events at a time with pagination

## 4. Booking Limits (FIFO Pruning)
- Max **9 bookings** per user
- When limit reached, the OLDEST booking is automatically deleted (FIFO replacement)
- Bookings page shows max 9 bookings at a time
- Booking deletion (cancellation) immediately frees seats
- "Clear All Bookings" button removes all bookings in one go

## 5. Sandbox Warning Banners
- **Events page**: Banner appears when user has close to or more than 6 events displayed, warning about sandbox limits ("sandbox holds up to 6 events and 9 bookings")
- **Bookings page**: Conditional banner also appears giving heads-up about booking limits
- Banners are hidden when counts are low (e.g., fewer than 5 events)

## 6. Per-User Seat Availability
- For static events: `availableSeats` is a fixed DB field
- For dynamic (user-created) events: computed as `totalSeats - sum(user's booking quantities for that event)`
- This allows the same user to book the same event multiple times for testing
- Seat count reduces immediately on booking confirmation

## 7. Booking Reference Format
- Pattern: `[FIRST_LETTER]-[6_RANDOM_ALPHANUMERIC]`
- **First letter comes from the event title (uppercase)** - this is a key business rule to validate
- Example: Event "Tech Summit" -> Ref: `T-A3B2C1`
- Guaranteed unique via collision retry

## 8. Refund Eligibility (Client-Side Logic)
- **Single ticket bookings (quantity = 1) -> Eligible for refund** with message "Single-ticket bookings qualify for a full refund"
- **Multi-ticket bookings (quantity > 1) -> NOT eligible for refund** with message "Group bookings (N tickets) are non-refundable"
- Displays a **4-second spinner** animation before revealing the result
- This is frontend-only logic (no backend API for refund)
- Accessible via "Check Refund Eligibility" button on booking detail page

## 9. Price Calculation
- `totalPrice = event.price x quantity`
- Price is per-ticket in the Event model
