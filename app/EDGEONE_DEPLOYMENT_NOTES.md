# EdgeOne Deployment Notes — Smesh AI

Smesh AI — Multi-Agent Workforce for Indonesian UMKM.

Verified against Tencent EdgeOne Pages/Makers documentation (Next.js
framework guide, Node Functions guide, full-stack deployment update).
Rewritten for Batch 2.1 — the previous version predated Supabase, Document
AI, and Warehouse and described them as deferred/mock; they are now live.

## 1. Stack

- Next.js (App Router, TypeScript)
- OpenAI API (Business Partner tool-calling, `/api/agent`)
- Supabase (Postgres — products/sales/inventory, authoritative business data)
- EdgeOne Pages/Makers (hosting)
- Gemini — reserved provider slot only, not implemented (see §7)
- No Laravel, no separate backend — Next.js Route Handlers are the API layer.

## 2. Project type

**Default SSR mode** — not static export. EdgeOne Pages/Makers officially
supports Next.js with SSR, ISR, SSG, CSR, React Server Components,
streaming, middleware, and Route Handlers in one deployment.

**Important:** the Next.js app lives in the `app/` subdirectory of the repo
(`auliaadeen/smesh-ai`), not the repo root. Set the project **root directory
to `app/`** when importing the Git repo in the EdgeOne dashboard.

## 3. Architecture

Business Partner (AI):

```
User
 -> EdgeOne
 -> Next.js application
 -> AI Orchestrator (classifyAgents)
 -> Sales / Inventory / Product Agents
 -> Business Tools (src/tools)
 -> BusinessRepository (Supabase-backed)
 -> Supabase
 -> grounded response
```

Document AI:

```
Document upload
 -> Extraction (/api/extract — OpenAI Vision or deterministic fallback)
 -> Review / Edit (transaction type + date, user-controlled)
 -> Confirmation
 -> /api/documents/commit
 -> record_smesh_transaction (controlled Postgres RPC)
 -> Supabase (sales + inventory)
```

Active business pages (`/`, `/sales`, `/inventory`, `/products`,
`/warehouse`) all read through the same `getBusinessRepository()` — Supabase
when configured, `MockBusinessRepository` as a local/dev fallback when it
isn't. Never both at once.

## 4. Build command

```
npm run build
```

Output: default `.next` (SSR mode). `next.config.ts` is unmodified from the
Next.js default (no `output: 'export'`), which matches EdgeOne's SSR mode.

## 5. Required EdgeOne environment variables

| Variable | Required | Notes |
|---|---|---|
| `OPENAI_API_KEY` | **Yes** | Business Partner (`/api/agent`) tool-calling and Document AI Vision extraction. Without it, `/api/agent` returns a graceful error and Document AI falls back to deterministic mock extraction — dashboard/sales/inventory/products/warehouse still work fully since those read the repository directly. |
| `OPENAI_MODEL` | No | Defaults to `gpt-4o-mini`. |
| `NEXT_PUBLIC_SUPABASE_URL` | **Yes** (for live data) | Supabase project URL. Without it (and the anon key), the app runs on `MockBusinessRepository` instead. |
| `SUPABASE_ANON_KEY` | **Yes** (for live data) | Supabase anon/publishable key, read server-side only — never `NEXT_PUBLIC_*`, never sent to the browser. |
| `GEMINI_API_KEY` | No | Reserved for `GeminiProvider`, which is a stub today — see §7. |
| `AI_PROVIDER` | No | `openai` (default) or `gemini`. Selecting `gemini` fails loudly (not silently) since it isn't implemented. |
| `SMESH_DEMO_DATE` | No | Pins "today" to a fixed date instead of the latest Supabase sales date. Leave unset for the dynamic demo-date behavior described in the SDD. |
| `OPENROUTER_API_KEY`, `OPENROUTER_MODEL`, `LLAMA_CLOUD_API_KEY`, `MINDEE_API_KEY` | No | Optional Document AI extraction providers (`/api/extract`). Without them, extraction uses OpenAI Vision (if `OPENAI_API_KEY` is set and an image is uploaded) or deterministic mock fields. |

Never put actual secret values in this file or any committed doc.

## 6. Supabase

Tables: `products`, `sales`, `inventory` (columns per `docs/SMESH-AI-SDD.md`
§6). Repositories select explicit columns only — no `select *`.

Access policy (`supabase/grants.sql`):
- RLS enabled on all three tables.
- `anon` has **SELECT-only** policies on `products`, `sales`, `inventory`.
- `anon` has **EXECUTE** on `record_smesh_transaction` (SECURITY DEFINER),
  the only path that mutates business data. It validates the product,
  quantity and amount, and updates sales/inventory atomically.
- No unrestricted `anon` INSERT/UPDATE/DELETE grants on any table.

Run `app/supabase/grants.sql` in the Supabase SQL Editor whenever it
changes — re-running it is required after this batch, since it now also
creates/updates the transaction RPC.

## 7. Runtime requirements

All Smesh routes run on the **Node.js runtime** (EdgeOne's "Node Functions"),
not Edge Runtime. No route sets `export const runtime = "edge"`; the
`openai` and `@supabase/supabase-js` npm clients are Node-targeted. A
repo-wide scan found no `fs`, `child_process`, `net`, or `tls` usage in
`src/`.

## 8. Deployment steps

1. In the EdgeOne Pages/Makers console, choose **Import Git repository** and
   select `auliaadeen/smesh-ai`.
2. Set the project root directory to `app/`.
3. Framework should auto-detect as Next.js; build command `npm run build`.
4. Set the required environment variables from §5 in the project's
   environment variable settings.
5. Deploy. EdgeOne handles SSR routing, the Route Handlers
   (`/api/agent`, `/api/extract`, `/api/documents/commit`), and static
   assets in one deployment — no separate backend needed.
6. **Environment variable changes require a new deployment** to take
   effect — EdgeOne (like most platforms in this class) does not hot-reload
   env vars into a running deployment.

## 9. Known limitations

- `GeminiProvider` (`src/lib/ai/gemini-provider.ts`) is a stub — setting
  `AI_PROVIDER=gemini` fails every `/api/agent` request with a clear error
  rather than silently falling back to OpenAI.
- No persistent chat memory: Business Partner history is passed per-request
  from the client; nothing is stored server-side between requests.
- Demo data: the deterministic August 2026 baseline stays until a confirmed
  Document AI transaction is written; the business "today" then follows the
  newest transaction date unless `SMESH_DEMO_DATE` is set (see §5).
- EdgeOne's Next.js support does not currently handle `redirects` /
  `rewrites` configured in `next.config.ts` — it requires `edgeone.json`
  instead. Smesh doesn't use either today, so this isn't a blocker, but
  don't add `next.config` redirects/rewrites later without checking this.
- Exact environment-variable-setting UI on the EdgeOne dashboard wasn't
  verified from documentation — confirm directly in the console at deploy
  time rather than assuming a specific flow.
