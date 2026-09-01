# EdgeOne Deployment Notes — Smesh AI

Verified against Tencent EdgeOne Pages/Makers documentation (Next.js framework
guide, Node Functions guide, full-stack deployment update) as of this batch.
Nothing here is invented — where the docs didn't specify something, it's
called out explicitly below instead of guessed.

## 1. Project type

Next.js 16 App Router, **default SSR mode** — not static export. EdgeOne
Pages/Makers officially supports Next.js 13.5+/14/15/16 with SSR, ISR, SSG,
CSR, React Server Components, streaming, middleware, and Route Handlers in
one deployment. Smesh uses server components (`/`, `/sales`, `/inventory`,
`/products`) and a Route Handler (`/api/agent`), so this is the correct mode
— static export (`output: 'export'`) is neither required nor desired here.

**Important:** the Next.js app lives in the `app/` subdirectory of the repo
(`auliaadeen/smesh-ai`), not the repo root. When importing the Git repo in
the EdgeOne dashboard, set the project **root directory to `app/`**.

## 2. Build command

```
npm run build
```

## 3. Output configuration

Default — `.next` (SSR mode). `next.config.ts` in this repo is unmodified
from the Next.js default (no `output: 'export'`, no custom `images` config),
which matches what EdgeOne's SSR mode expects out of the box.

## 4. Required environment variables

| Variable | Required | Notes |
|---|---|---|
| `OPENAI_API_KEY` | **Yes** | Smesh Business Partner (`/api/agent`). Without it, `/api/agent` returns the graceful "Smesh sedang mengalami kendala..." error — the rest of the app (dashboard, sales, inventory, products) still works fully, since those read directly from the deterministic repository, not the AI. |
| `OPENAI_MODEL` | No | Defaults to `gpt-4o-mini`. |
| `AI_PROVIDER` | No | `openai` (default) or `gemini`. Gemini is a reserved stub (`src/lib/ai/gemini-provider.ts`) — selecting it fails loudly with a clear error rather than silently falling back, per spec. |
| `GEMINI_API_KEY` | No | Reserved for when `GeminiProvider` is implemented. Unused today. |
| `OPENROUTER_API_KEY`, `OPENROUTER_MODEL`, `LLAMA_CLOUD_API_KEY`, `MINDEE_API_KEY` | No | Only used by the deferred `/api/extract` (Document AI) module, which is unlinked from navigation in this batch. |

None of these are ever `NEXT_PUBLIC_*` — all AI calls happen server-side in
Route Handlers.

The EdgeOne docs consulted for this note don't specify the exact dashboard
UI for setting environment variables on a Pages/Makers project — set them
through the project's environment variable settings in the EdgeOne console
when connecting the repo (standard for this class of platform); this file
intentionally doesn't guess at UI details it can't verify.

## 5. Runtime requirements

All Smesh routes run on the **Node.js runtime** (EdgeOne's "Node Functions"),
not Edge Runtime. Reasons:

- `/api/agent` uses the `openai` npm package's Node client.
- A repo-wide scan found no `fs`, `child_process`, `net`, or `tls` usage in
  `src/`, so nothing here is *incompatible* with Edge Runtime — but nothing
  requires it either, and Node Functions is the default/safest choice with
  full npm ecosystem compatibility. No route sets `export const runtime = "edge"`.

## 6. Deployment steps

1. In the EdgeOne Pages/Makers console, choose **Import Git repository** and
   select `auliaadeen/smesh-ai`.
2. Set the project root directory to `app/`.
3. Framework should auto-detect as Next.js; build command `npm run build`.
4. Set `OPENAI_API_KEY` (required) and any optional vars from the table
   above in the project's environment variable settings.
5. Deploy. EdgeOne handles SSR routing, the `/api/agent` Route Handler, and
   the static assets in one deployment — no separate backend needed.

## 7. Known limitations

- EdgeOne's Next.js support does **not** currently handle `redirects` /
  `rewrites` configured in `next.config.ts` — it requires an `edgeone.json`
  instead. Smesh doesn't use either today, so this isn't a blocker, but
  don't add `next.config` redirects/rewrites later without checking this.
- `GeminiProvider` is a stub — `AI_PROVIDER=gemini` will fail every request
  until it's implemented.
- Exact environment-variable-setting UI on the EdgeOne dashboard wasn't
  verified from documentation (see §4) — confirm directly in the console at
  deploy time rather than assuming a specific flow.
