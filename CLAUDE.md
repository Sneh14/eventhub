# EventHub - Project Conventions for Claude Code

## Project Overview
EventHub is a full-stack event ticket booking platform built for QA training. Users can browse events, book tickets, manage bookings, and create events. Each user operates in an isolated sandbox.

## Tech Stack
- **Frontend**: Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS, React Query v5
- **Backend**: Express.js, Prisma ORM, MySQL 8+
- **Auth**: JWT (7-day expiry), bcryptjs
- **Testing**: Playwright E2E (Chromium only)

## Project Structure
```
eventhub/
├── frontend/          # Next.js 14 app (port 3000)
│   ├── app/           # Pages (App Router)
│   ├── components/    # React components
│   ├── lib/           # API clients, hooks, providers
│   └── types/         # TypeScript interfaces
├── backend/           # Express API (port 3001)
│   ├── src/
│   │   ├── routes/        # HTTP endpoints
│   │   ├── controllers/   # Request handlers
│   │   ├── services/      # Business logic
│   │   ├── repositories/  # Data access (Prisma)
│   │   ├── validators/    # Input validation
│   │   └── middleware/     # Auth, error handling
│   └── prisma/            # Schema + seed
├── tests/             # Playwright E2E tests
├── .claude/
│   ├── commands/      # Custom slash commands (agents)
│   └── docs/          # Skill documents (reference guides)
└── playwright.config.ts
```

## Architecture Pattern
Backend follows layered architecture: Routes → Controllers → Services → Repositories → Database

## Commands to Run
```bash
npm run dev          # Start frontend + backend concurrently
npm run seed         # Seed 10 static events
npm run test         # Run all Playwright tests
npm run test:ui      # Playwright with UI mode
npx playwright test tests/<file>.spec.js --reporter=line  # Run single test
```

## Testing Conventions
- Test files go in `tests/` as `<feature-name>.spec.js`
- Follow guidelines in `.claude/docs/playwright-best-practices.md`
- Locator priority: data-testid > role > label/placeholder > ID > CSS class
- No `page.waitForTimeout()` — use `expect().toBeVisible()`
- Tests must be self-contained (login → action → assert)
- Use test accounts: `rahulshetty1@gmail.com` / `Magiclife1!`

## Key Business Rules
- Max 6 user-created events (FIFO pruning on overflow)
- Max 9 bookings per user (FIFO pruning on overflow)
- Booking ref first character = event title first character (uppercase)
- Seat count reduces on booking, restores on cancellation
- Refund eligibility: 1 ticket = eligible, >1 ticket = not eligible (client-side)
- Cross-user booking access returns "Access Denied"
- Static events (seeded) are immutable

## Custom Slash Commands (Agents)
- `/generate-tests <feature>` — AI Test Automation Engineer: generates Playwright tests
- `/review-tests <file>` — AI Code Reviewer: reviews test code quality
- `/create-scenarios <area>` — AI Functional Tester: creates test scenario documents
- `/test-strategy <scenarios>` — AI Test Architect: assigns tests to optimal pyramid layers

## Skill Documents
- `.claude/docs/playwright-best-practices.md` — Playwright testing standards
- `.claude/docs/eventhub-domain.md` — Domain knowledge and business rules

## Code Style
- Backend: JavaScript with JSDoc, Express patterns
- Frontend: TypeScript, React hooks, Tailwind utility classes
- Tests: JavaScript with Playwright test runner
- Use meaningful variable names, add step comments in tests
- Keep functions focused and single-responsibility
