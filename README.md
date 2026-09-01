# Smesh AI

**Multi-Agent Workforce for Indonesian UMKM** — built for DevHandal 2026
Batch 2 (Tencent EdgeOne Makers track).

> Don't just ask AI. Let AI understand your business and help you run it.

## What is Smesh?

Most UMKM (small/medium business) owners in Indonesia already have sales and
inventory data somewhere — the problem isn't a lack of data, it's that
turning that data into a decision still depends entirely on the owner
manually checking dashboards, comparing numbers, and figuring out what to
do next.

Smesh AI is not a generic chatbot bolted onto a dashboard. It's a small
**AI workforce**: a Business Partner that delegates to specialized agents
(Sales, Inventory, Product), each of which calls deterministic business
tools grounded in real business data, then synthesizes one coherent,
actionable answer — in Bahasa Indonesia, by default.

```text
Owner asks: "Apa yang harus saya lakukan hari ini?"
      ↓
Smesh checks sales, inventory, and product performance
      ↓
Smesh explains what's happening, why, and what to do about it
```

## Architecture

```text
                    UMKM OWNER
                        │
                        ↓
                 Smesh AI Interface  (Next.js App Router)
                        │
                        ↓
            Business Partner / Orchestrator   (agents/business-partner.ts)
                        │
        classifies intent → scopes tools to the relevant agent(s)
                        │
        ┌───────────────┼───────────────┐
        ↓               ↓               ↓
   Sales Agent    Inventory Agent   Product Agent
        │               │               │
        └───────────────┼───────────────┘
                        ↓
                Business Tools          (tools/index.ts — OpenAI function-calling)
                        │
                        ↓
              BusinessRepository        (interface, swappable)
                        │
                        ↓
           MockBusinessRepository       (deterministic demo data)
                        │
                        ↓
        data/{products,sales,inventory}.ts  — "Toko Sejahtera", Aug 2026
```

AI providers sit behind a thin abstraction (`lib/ai/`):

```text
AIProvider (interface)
  ├── OpenAIProvider   — primary, implemented
  └── GeminiProvider   — reserved stub, not implemented yet
```

`AI_PROVIDER=openai` (default) or `gemini`. Selecting `gemini` today fails
with a clear error rather than silently falling back — no unpredictable
provider switching.

**Supabase is not integrated.** The repository layer exists specifically so
a future `SupabaseBusinessRepository` can replace `MockBusinessRepository`
without touching agents, tools, or UI — but that swap hasn't happened. All
business data in this submission is deterministic, seeded demo data.

## Tech stack

Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS v4 ·
Framer Motion · Recharts · Lucide icons · OpenAI SDK (tool-calling) ·
Vitest

## How the AI agents work

`agents/orchestrator.ts` does deterministic keyword routing (Bahasa
Indonesia) to classify which agent(s) a question needs — sales question →
Sales Agent only; inventory question → Inventory Agent only; broad
questions ("apa yang harus saya lakukan hari ini?") → all three. The
Business Partner (`agents/business-partner.ts`) then makes **one** OpenAI
tool-calling call scoped to just that agent's tools, executes whatever
tools the model calls against `MockBusinessRepository`, and returns a
grounded answer plus `agentsUsed` (shown in the UI as "Berdasarkan: ✓ Sales
Agent") so the owner can see which part of the business Smesh actually
checked — without exposing the system prompt, raw tool JSON, or model
reasoning.

The model never computes business numbers itself — growth, sales velocity,
reorder quantities, and rankings are all deterministic TypeScript in
`lib/analytics.ts` and `lib/recommendations.ts`. If a question asks for
data no tool provides (e.g. last year's revenue), the system prompt
requires the model to say so rather than fabricate a number.

## How EdgeOne is used

Deployment target is Tencent EdgeOne Pages/Makers, in its default **SSR**
mode (not static export) — the app uses server components and a Route
Handler (`/api/agent`), both natively supported. Full details, the exact
environment variables, build command, and known EdgeOne-specific
limitations are in [`app/EDGEONE_DEPLOYMENT_NOTES.md`](app/EDGEONE_DEPLOYMENT_NOTES.md).

## Running locally

```bash
cd app
npm install
cp .env.local.example .env.local   # fill in OPENAI_API_KEY
npm run dev
# open http://localhost:3000
```

The dashboard (`/`, `/sales`, `/inventory`, `/products`) works with **zero**
API keys — it reads straight from the deterministic repository. Only
`/assistant` (Smesh Business Partner) needs `OPENAI_API_KEY`; without it,
it degrades gracefully to a friendly error message instead of crashing.

### Environment variables

| Variable | Required | Purpose |
|---|---|---|
| `OPENAI_API_KEY` | For AI chat | Business Partner tool-calling |
| `OPENAI_MODEL` | No | Defaults to `gpt-4o-mini` |
| `AI_PROVIDER` | No | `openai` (default) or `gemini` (not implemented yet) |
| `GEMINI_API_KEY` | No | Reserved for `GeminiProvider` |

Never `NEXT_PUBLIC_*` — every AI call happens server-side in a Route
Handler; the key is never sent to the browser.

## Testing

```bash
cd app
npm run lint
npm run build
npx vitest run
```

31 unit tests cover deterministic analytics (growth, sales velocity, low
stock, reorder quantity, ranking, div-by-zero safety), the repository
(deterministic data, alert filtering, best-seller ordering), the tool
executor (structured output, invalid-input handling), the recommendation
priority engine, and agent routing (sales/inventory/product/multi-domain
classification).

## Deployment

See [`app/EDGEONE_DEPLOYMENT_NOTES.md`](app/EDGEONE_DEPLOYMENT_NOTES.md) for
the verified EdgeOne Pages/Makers deployment model, build configuration,
required environment variables, runtime notes, and known limitations.

## Project history

This repository was migrated from an earlier internal PoC (`hti-poc-demo`)
whose reusable Next.js shell, layout, and UI primitives were kept and
rebranded; its business-specific modules (payroll, document OCR, email
setup) are unlinked from navigation but not deleted, in case they're useful
scaffolding for a later batch.
