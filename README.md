# Arashi OPS

> Agency operating system. Built to run a real B2B outreach agency — not a demo, not a template.

---

## What it does

Arashi OPS is the internal OS for running a B2B revenue operations agency. It handles everything from client onboarding to AI-generated outreach to invoicing — in one platform.

Clients get a portal. You get the command center.

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        ARASHI OPS                           │
│                                                             │
│   ADMIN                          CLIENT PORTAL              │
│   ─────                          ──────────────             │
│   Overview · Metrics             Onboarding                 │
│   Clients · Projects             Deliverables               │
│   Deals · Proposals              Approvals                  │
│   Contracts · Invoices           Revenue Dashboard          │
│   AI Leads · Lead Scoring        Billing & Plans            │
│   Integrations · Health          Reports · Lead Tracker     │
│                                                             │
└──────────────────┬──────────────────────────────────────────┘
                   │
        ┌──────────▼──────────┐
        │   Neon PostgreSQL    │
        │   (production DB)    │
        └──────────┬──────────┘
                   │
    ┌──────────────▼──────────────────────────┐
    │           n8n OUTREACH PIPELINE          │
    │                                          │
    │  Google Sheets (Apollo export)           │
    │       ↓                                  │
    │  Filter unprocessed leads                │
    │       ↓                                  │
    │  Jina AI  →  scrape company website      │
    │       ↓                                  │
    │  Gemini / Claude  →  research + email    │
    │       ↓                                  │
    │  Parse JSON output                       │
    │       ↓                     ↓            │
    │  Google Sheet          Arashi OPS        │
    │  (AI results)          /api/n8n/leads    │
    └──────────────────────────────────────────┘
```

---

## Stack

| Layer | Tech |
|---|---|
| Framework | Next.js App Router |
| Database | Neon PostgreSQL |
| Auth | JWT sessions via `jose` |
| Email | Nodemailer (Gmail SMTP) |
| Payments | PayPal.me |
| Automation | n8n Cloud |
| AI | Google Gemini (free) → Claude (paid) |
| Scraping | Jina AI (`r.jina.ai`) |
| Hosting | Vercel |

---

## Tiers

| Tier | Price | Unlocks |
|---|---|---|
| Silver | $1,500/mo | Outbound foundation, 2 campaigns |
| Gold | $4,500/mo | Full RevOps, 5 campaigns, Revenue Dashboard |
| Enterprise | Custom | Multi-workflow, dedicated strategy, everything |

---

## Outreach Pipeline

One n8n workflow. Swap the AI node to change models.

```
Apollo CSV → Jina scrape → AI research → JSON parse → Sheet + DB
```

Output per lead: company summary, main problem, opportunity, personalized email, subject line, confidence score.

No duplicate inserts. Unique constraint on `(name, company)`. Rate-limited with 6s delay between leads.

---

## Env vars

```
DATABASE_URL
SESSION_SECRET
SMTP_HOST / SMTP_USER / SMTP_PASS
N8N_API_KEY
ANTHROPIC_API_KEY       # when you get credits
INSTANTLY_API_KEY       # when you get the sub
```

---

## What activates next

- [ ] Cold email domains + warming (Instantly/Smartlead)
- [ ] Swap Gemini → Claude when credits land
- [ ] Instantly API key → campaigns go live

Everything else is live.

---

Built by [Arashi OPS](https://arashiops.vercel.app)
