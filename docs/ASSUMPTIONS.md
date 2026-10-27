# Architectural & Implementation Assumptions

This document records all decisions, defaults, and assumptions made during the design and development of the **BookLeaf Author Support & Communication Portal**, in accordance with operating rules.

---

## 1. Environment & Database Configuration
- **Local Dev Database**: A PostgreSQL 17 instance is available locally for development and testing. `DATABASE_URL` default in `.env.example` points to `postgresql://postgres:postgres@localhost:5433/bookleaf?schema=public` (and standard port `5432` for `docker-compose.yml`).
- **Docker Compose**: `docker-compose.yml` provides an out-of-the-box PostgreSQL 16/17 service container mapped to port 5432 for reviewers running via Docker.
- **Node.js & Workspaces**: npm workspaces are used with root `apps/api` and `apps/web`.

## 2. Authentication & Session Management
- **Token Delivery**: JWT token stored in an `httpOnly`, `SameSite=Lax` (or `Strict`), `Path=/` cookie named `bookleaf_token`. In production (`NODE_ENV=production`), `Secure` flag is enforced.
- **Frontend-Backend Boundary**: In local development and unified deployment, Next.js rewrites `/api/:path*` to the NestJS API (running on port 3001) so cookies remain strictly same-origin.
- **Passwords**: Hashed with `bcrypt` (10 rounds). Standard author demo password: `Author@123`; Admin demo password: `Admin@123`.

## 3. Data Scoping & Multi-tenancy
- **Author Isolation**: All author endpoints enforce `authorId` filter derived directly from the authenticated JWT session. Any attempt by an author to query a resource (book or ticket) belonging to another author returns a `404 Not Found` (rather than `403 Forbidden`) to eliminate resource enumeration vectors.
- **Internal Notes**: Internal notes are filtered out at the query level (`select: { internalNotes: false }` or explicit exclusion) in author-facing endpoints.

## 4. SLA Definitions & Urgency Heuristics
- **SLA Breach Thresholds** (configured in application config):
  - `CRITICAL`: 4 hours unresolved
  - `HIGH`: 24 hours unresolved
  - `MEDIUM`: 72 hours unresolved
  - `LOW`: 7 days unresolved
- **Queue Urgency Ordering**:
  1. Unresolved status (`OPEN`, `IN_PROGRESS`) prioritized over resolved/closed.
  2. SLA breached status.
  3. Priority ranking (`CRITICAL` > `HIGH` > `MEDIUM` > `LOW`).
  4. Oldest `createdAt` first (FIFO within urgency tier).

## 5. AI Triage & Cost Controls
- **Provider Abstraction**: A standardized `LlmProvider` interface abstracts Anthropic and OpenAI.
- **Async Execution**: Ticket creation persists to the DB and returns HTTP 201 immediately with `aiStatus = PENDING`. AI classification runs asynchronously via an in-memory job runner.
- **Deterministic Heuristic Safety Net**: Priority rules enforce minimum floor values (e.g. legal threats or >6 months delayed royalties elevate to CRITICAL; ISBN mismatches elevate to at least HIGH).
- **Graceful Degradation**: If the LLM provider fails, times out (15s), or returns unparseable JSON after 1 retry, `heuristics/keyword-classifier.ts` classifies the ticket and marks `aiStatus = FAILED`. The admin UI provides a visible banner and a one-click manual retry button.
- **Draft Generation**: Triggered on-demand when an admin views a ticket (with draft caching keyed by the hash of ticket content + conversation state + author book snapshot).

## 6. Royalty Cycle & Accounting Rules
- Royalties calculated quarterly: Q1 (Jan-Mar, ends Mar 31), Q2 (Apr-Jun, ends Jun 30), Q3 (Jul-Sep, ends Sep 30), Q4 (Oct-Dec, ends Dec 31).
- Payout window is 45 days post quarter end.
- Minimum payout threshold is ₹1,000. Pending royalties below ₹1,000 roll over to the subsequent quarter.
