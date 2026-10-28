# BookLeaf Author Support & Communication Portal

> **Technical Assignment — Full-Stack Implementation**  
> End-to-end full-stack web application with AI-assisted triage, priority enforcement, automated response drafting, and real-time operations desk for **BookLeaf Publishing**.

---

## 1. Executive Summary & Capabilities

BookLeaf Publishing is a leading self-publishing house (operating across India and the US) processing over 1,200 titles per month across a 22,000+ title catalog. This portal solves author inquiry backlogs and inconsistent replies by providing two dedicated interfaces:

1. **Author Portal (`/author/*`):**
   - **My Books:** Live published titles catalog, production stage stepper (9 stages from Manuscript to Distribution), quarterly royalty breakdown (earned, paid, and pending in Indian Rupee format), and rollover alerts for pending balances below ₹1,000.
   - **New Query:** Support submission linking specific book metadata, character counters, file attachment dropzone with client-side validation, and sticky KB guidance.
   - **Ticket Thread:** Chat-style correspondence with "Team BookLeaf" support representatives, day separators, and real-time reply updates.
   - **Author Self-Registration (`/register`):** New authors can sign up, automatically provisioning their profile, unique author code (`AUTH011+`), and debut book in the catalog.
2. **Admin Operations Desk (`/admin/*`):**
   - **Urgency-Sorted Queue:** Triage table ordered by urgency (unresolved first, Critical to Low priority, oldest first) with SLA breach timers, category tags with icons, assignee filters, and live ticket arrival banners.
   - **AI Response Assistant:** On-demand response drafting powered by **Google Gemini 3.5 Flash** incorporating live book numbers and computed payout dates, editable response textarea, verification flags, and manual fallback templates.
   - **Triage Controls & Overrides:** Category and priority selection showing AI suggestions and persisting audited admin overrides.
   - **Internal Staff Notes:** Private staff commentary strictly shielded from author endpoints.
   - **AI Telemetry Card:** Live dashboard tracking daily LLM calls, token usage, estimated costs, and failure rates.

---

## 2. Architecture Diagram

```mermaid
graph TD
    subgraph Clients["Frontend Clients (apps/web - Next.js 14)"]
        Landing["Landing Page (/)"]
        Register["Author Registration (/register)"]
        AuthorUI["Author Portal (/author/books, /author/tickets)"]
        AdminUI["Admin Operations Console (/admin/tickets)"]
    end

    subgraph Gateway["Next.js Reverse Proxy"]
        Rewrite["/api/* -> http://localhost:3001/api/v1/* (or Render URL)"]
    end

    subgraph Backend["API Backend (apps/api - NestJS)"]
        AuthModule["JWT Cookie Auth Guard<br/>(httpOnly, SameSite=Lax, Bearer fallback)"]
        SSEModule["SSE Stream Engine<br/>(/api/v1/events/stream)"]
        AiModule["AI Orchestrator<br/>(Google Gemini 3.5 Flash / Claude / OpenAI)"]
        Rules["Deterministic Priority Rules<br/>& Keyword Fallback"]
        Facts["Computed Facts Engine<br/>(Quarterly Dates & Thresholds)"]
    end

    subgraph Storage["Cloud Data Tier"]
        Prisma["Prisma ORM Client"]
        Supabase[("Supabase PostgreSQL (PgBouncer Pooler)")]
    end

    Landing --> Rewrite
    Register --> Rewrite
    AuthorUI --> Rewrite
    AdminUI --> Rewrite
    Rewrite --> AuthModule
    AuthModule --> SSEModule
    AuthModule --> AiModule
    AiModule --> Rules
    AiModule --> Facts
    AuthModule --> Prisma
    Prisma --> Supabase
    SSEModule -.->|Real-Time Push| AuthorUI
    SSEModule -.->|Real-Time Push| AdminUI
```

---

## 3. Tech Stack

| Layer | Choice | Rationale |
|---|---|---|
| **Monorepo** | npm workspaces (`apps/api`, `apps/web`, `docs/`) | Single repository coordination, shared scripts, zero package duplication. |
| **Backend** | NestJS (TypeScript), REST, `@nestjs/swagger`, `helmet`, `@nestjs/throttler` | Enterprise modularity, strict DTO validation, uniform error envelope. |
| **Database** | PostgreSQL 16 (Supabase cloud pooler) + Prisma ORM | Relational integrity, composite indexing, immutable audit logs, PgBouncer pooling on port 6543. |
| **Frontend** | Next.js 14 App Router, TypeScript, Tailwind CSS | High-performance server rendering, same-origin proxy rewrites. |
| **Design System** | shadcn/ui, React Bits, GSAP motion orchestration | "Editorial Publishing House" aesthetic: Fraunces serif, Jakarta Sans, JetBrains Mono. |
| **Real-Time** | Server-Sent Events (SSE) with 5s polling fallback | Lightweight unidirectional event stream; zero WebSocket overhead. |
| **AI Integration** | **Google Gemini 3.5 Flash** (default), Anthropic Claude, OpenAI | Sub-second latency, structured JSON schemas, versioned draft caching, circuit breakers. |

---

## 4. Quickstart & Local Setup

### Prerequisites
- Node.js `v18.18+` or `v20+`
- npm `v9+` or `v10+`

### 1. Clone & Configure Environment
```bash
git clone <repository_url>
cd BookLeaf
cp .env.example .env
```

Your `.env` is pre-configured with Supabase PostgreSQL and Google Gemini 3.5 Flash:
```env
DATABASE_URL="postgresql://postgres.gwvcniyonisaucxdodlx:bookleaf123%40@aws-0-eu-west-1.pooler.supabase.com:6543/postgres?pgbouncer=true&sslmode=require"
AI_PROVIDER=gemini
AI_MODEL=gemini-3.5-flash
GEMINI_API_KEY="your_api_key_here"
```

### 2. Run Database Migrations & Seed
```bash
npm run prisma:generate --workspace=apps/api
npm run prisma:migrate --workspace=apps/api
npm run prisma:seed --workspace=apps/api
```
*(Seeds 10 authors, 18 books, and 14 support tickets covering all edge cases).*

### 3. Run Both Applications Locally
In separate terminals:
```bash
# Terminal 1: Backend API (port 3001)
npm run dev --workspace=apps/api

# Terminal 2: Web Portal (port 3000)
npm run dev --workspace=apps/web
```
- Open **Web Application:** `http://localhost:3000`
- Open **Swagger API Documentation:** `http://localhost:3001/api/docs`
- Health Check: `http://localhost:3001/api/v1/health`

---

## 5. Demo Credentials

All accounts are pre-seeded and idempotent. A 1-click credential selector is available directly on the login screen.

### Operations Staff (Admins)
> *Note: In accordance with the assignment specifications (Pages 2 & 8), admin accounts cannot be publicly registered to protect author privacy and royalty confidentiality.*

| Role | Email | Password | Responsibility |
|---|---|---|---|
| **Support Lead** | `admin@bookleaf.test` | `Admin@123` | Queue supervisor, triage overrides, AI usage monitoring |
| **Operations Desk** | `ops@bookleaf.test` | `Admin@123` | Direct author correspondence, response drafting |

### Authors (Sample from 10 Seeded Accounts)
| Author Code | Author Name | Email | Password | Scenario / Edge Case |
|---|---|---|---|---|
| `AUTH001` | Priya Sharma | `priya.sharma@email.com` | `Author@123` | 2 published books, ₹3,570 pending royalty |
| `AUTH002` | Rohit Kapoor | `rohit.kapoor@email.com` | `Author@123` | 2 books (*Code & Karma*, *Startup Sutra*), ₹7,744 pending |
| `AUTH003` | Ananya Reddy | `ananya.reddy@email.com` | `Author@123` | 1 book (*Between Two Temples*), 0 payouts to date |
| `AUTH004` | Vikram Joshi | `vikram.joshi@email.com` | `Author@123` | 2 books (*Debugging Life*, *The Last Monsoon*), ₹3,350 pending |
| `AUTH007` | Sneha Kulkarni | `sneha.kulkarni@email.com` | `Author@123` | 3 books, title in production (*Midnight in Mysore* - Cover Design) |
| `AUTH009` | Kavita Deshmukh | `kavita.deshmukh@email.com` | `Author@123` | ₹850 pending royalty (below ₹1,000 threshold - rolls over) |

---

## 6. How to Test AI Services

The application uses **Google Gemini 3.5 Flash** for two core workflows:

### A. AI Draft Response Generator (Admin Console)
1. Sign in as Admin (`admin@bookleaf.test` / `Admin@123`).
2. Click any ticket in the queue (e.g. **BL-1002** — *“Royalty payment delayed for Q3”*).
3. Under the **AI Triage & Copilot** panel, click **Generate AI Draft**.
4. **Expected Result:** Gemini analyzes the author's royalty balance, payout dates, and ticket context to produce an empathetic, policy-compliant draft ready for review.

### B. Automatic AI Classification (Author Portal)
1. Sign in as Priya Sharma (`priya.sharma@email.com` / `Author@123`).
2. Navigate to **New Query** (`/author/tickets/new`).
3. Enter a ticket description (e.g. *“Spine text is misaligned by 5mm on proof copies”*).
4. Submit the ticket.
5. **Expected Result:** The AI categorizes the ticket as `PRINT_QUALITY` with high confidence and assigns the priority level automatically.

### C. System Health & AI Verification Endpoint
Visit `http://localhost:3001/api/v1/health` (or your live Render API URL) to check:
```json
{
  "status": "ok",
  "database": { "status": "connected", "latencyMs": 42 },
  "ai": {
    "provider": "gemini",
    "model": "gemini-3.5-flash",
    "configured": true
  }
}
```

---

## 7. Production Deployment (Render + Vercel)

This project is optimized for deployment using **Render** (Backend API) and **Vercel** (Frontend Next.js):

### Step 1: Deploy Backend on Render
1. Go to [dashboard.render.com](https://dashboard.render.com/) → **New Web Service** → Connect your GitHub repo.
2. Settings:
   - **Runtime:** `Node`
   - **Region:** `Frankfurt` (closest to Supabase `eu-west-1`)
   - **Build Command:** `npm install && npm run prisma:generate && npm run build:api`
   - **Start Command:** `npm run start:api`
3. Set Environment Variables:
   - `NODE_ENV`: `production`
   - `DATABASE_URL`: `postgresql://postgres.gwvcniyonisaucxdodlx:bookleaf123%40@aws-0-eu-west-1.pooler.supabase.com:6543/postgres?pgbouncer=true&sslmode=require`
   - `JWT_SECRET`: `e6b9f298c4d21e84a27538b368140db7f94e223b9f36b694b77f9e8a75e3c734`
   - `COOKIE_SECRET`: `72d4a6f238914b7e923e1f584e03f90bc89e32a68c07e324ef6e885b51a9a832`
   - `AI_PROVIDER`: `gemini`
   - `AI_MODEL`: `gemini-3.5-flash`
   - `GEMINI_API_KEY`: *(your Gemini API key)*
   - `CORS_ORIGIN`: `https://*.vercel.app`
4. Deploy and copy your backend URL (e.g. `https://bookleaf-api.onrender.com`).

*(A `render.yaml` blueprint is also included in the repository for 1-click infrastructure-as-code deployment).*

### Step 2: Deploy Frontend on Vercel
1. Go to [vercel.com](https://vercel.com/) → **Add New... Project** → Import your repo.
2. In **Configure Project**:
   - **Framework Preset:** `Next.js`
   - **Root Directory:** Edit to `apps/web`.
3. Set Environment Variables:
   - `API_INTERNAL_URL`: `https://bookleaf-api.onrender.com` *(your Render backend URL)*
   - `NEXT_PUBLIC_APP_NAME`: `BookLeaf Author Portal`
4. Click **Deploy**. Vercel will build and assign your live domain with zero CORS issues via server-to-server proxy rewrites.

---

## 8. Automated Testing & Evaluation Commands

```bash
# 1. Run full E2E security, multi-tenant isolation, and secret leak tests:
npm run test:e2e --workspace=apps/api

# 2. Run unit tests for royalty cycle math and deterministic priority safety net:
npx jest src/ai/context/royalty-cycle.spec.ts src/ai/heuristics/priority-rules.spec.ts --workspace=apps/api

# 3. Run AI classification evaluation suite (21 labelled ground-truth queries):
npm run eval:classify --workspace=apps/api

# 4. Verify Next.js production build:
npm run build:web
```

---

## 9. Known Limitations & Production Roadmap

1. **Distributed Job Queue:** Transition in-process `setImmediate` triage jobs to **BullMQ** with Redis to handle sudden bursts of 10,000+ simultaneous queries with dead-letter queue retry policies.
2. **Cloud Object Storage:** Replace the attachment metadata placeholder with presigned URL uploads directly to **AWS S3** or **Cloudflare R2** accompanied by asynchronous antivirus scanning.
3. **Redis Pub/Sub SSE Scaling:** Replace in-memory RxJS event subjects with **Redis Pub/Sub** to allow seamless multi-node backend scaling.
4. **Email & WhatsApp Integration:** Integrate transactional notification webhooks (SendGrid or Resend) to alert authors when an operations specialist replies.
5. **Human-in-the-Loop AI Feedback:** Add thumbs-up/thumbs-down ratings and diff logging on AI-drafted responses to automatically collect fine-tuning and prompt-improvement datasets.
