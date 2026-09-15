# Smesh AI — Software Design Document (SDD)
## Multi-Agent Workforce for Indonesian UMKM

Status: Active implementation spec
Target: DevHandal 2026 Batch 2 / EdgeOne Makers
Architecture: Next.js App Router + EdgeOne Makers + Supabase + OpenAI (Gemini P2)

## 1. SMART objective

**Specific:** Build Smesh as an AI-powered UMKM workspace combining Business Intelligence, a multi-agent Business Partner, Warehouse/Inventory visibility, Document AI, Mini Slack, and Business Email capability.

**Measurable:** All active business views and AI tools use the same BusinessRepository; revenue, transactions, units, product names, stock and reorder values are derived from Supabase when configured. Document AI supports upload → extraction → review/edit → confirm → database update.

**Achievable:** Reuse proven HTI UI capabilities, but transform them into Smesh terminology and connect them to Smesh business state.

**Relevant:** Demonstrates EdgeOne deployment plus a real AI workforce operating on business state rather than a standalone chatbot.

**Time-bound:** Implement incrementally on main, validate locally, then use EdgeOne Git auto-deployment.

## 2. Product promise

Smesh is not a chatbot. It is a digital AI workforce that reads business state, delegates analysis to specialized agents, and turns business events into actionable decisions.

Core loop:
BUSINESS DATA → UNDERSTANDING → SPECIALIZED AGENTS → RECOMMENDATION → ACTION → UPDATED BUSINESS DATA

## 3. Source-of-truth rule

Supabase is authoritative for products, sales and inventory.

Mock data is only a local/dev fallback when Supabase is not configured.

Active business pages MUST use getBusinessRepository(). AI tools MUST use the same provider. No page may hardcode business KPIs.

## 4. HTI → Smesh mapping

| HTI capability | Smesh capability | Decision |
|---|---|---|
| Command Center | Business Command Center | Transform |
| Warehouse Visibility | Warehouse | Transform and ground in Smesh inventory |
| Document AI | Document AI | Transform and connect to business mutation |
| Mini Slack | Workspace / Activity | Reuse UI + Smesh branding |
| Email Setup | Business Email | Reuse UI + Smesh branding |
| AI Assistant | AI Business Partner | Replace with multi-agent architecture |
| Payroll/internal HR | Out of scope | Do not expose in primary Smesh navigation |

HTI company identifiers and HTI-specific numbers must not remain in active Smesh UX.

## 5. Navigation

Primary modules: Overview, Sales, Inventory, Products, Warehouse, Document AI, Workspace, Business Email, AI Business Partner.

Global: Command Palette, Mini Slack floating panel, Account/theme controls.

## 6. Business data model

Existing Supabase tables:
- products(id,name,category,price,created_at,cost,active)
- sales(id,product_id,quantity,revenue,sold_at)
- inventory(product_id,stock,minimum_stock,target_stock,updated_at)

Extra columns are harmless because repositories select explicit columns.

Canonical demo date: SMESH_DEMO_DATE, fallback 2026-08-31.

## 7. Repository contract

BusinessRepository exposes:
- getTodaySales
- getTodayProductSales
- getSalesComparison
- getBestSellers
- getInventoryAlerts
- getInventorySnapshot
- getProducts
- getProductPerformance
- getDailyRevenueSeries

Pages and agents never know whether the implementation is Supabase or mock.

## 8. Document AI workflow

UPLOAD → EXTRACT → REVIEW / EDIT → CONFIRM → DATABASE MUTATION → ANALYTICS REFRESH → AI sees updated state.

Demo transaction types:
- sale: inserts sales and decrements inventory
- purchase: increases inventory

Confirmation is mandatory. AI never silently mutates business state.

## 9. Controlled database mutation

Do NOT grant unrestricted table writes to anon.

Use a Postgres SECURITY DEFINER function named record_smesh_transaction.

The function validates the product, quantity and amount, updates sales/inventory atomically, and is callable only through an explicit function grant.

## 10. Demo data strategy

Keep the deterministic August 2026 baseline. New confirmed Document AI transactions use SMESH_DEMO_DATE.

No Math.random() for business KPIs.

A confirmed transaction changes Supabase state; subsequent pages and AI questions use that updated state.

## 11. Consistency acceptance criteria

- Overview revenue == Sales revenue == AI get_today_sales
- Overview units == Sales units
- Product names shown in UI exist in products
- Inventory names resolve from products
- Reorder quantity derives from target/current stock
- Best seller derives from sales
- AI and UI never mix mock and Supabase data

## 12. AI architecture

Owner → /api/agent → Business Partner / Orchestrator → Sales/Inventory/Product Agents → tools → BusinessRepository → Supabase.

Guardrails:
- never fabricate business figures
- figures must originate from tools
- separate facts, interpretation and recommendation
- say when data is unavailable

## 13. EdgeOne

Production branch: main
Root directory: app/
Build: npm run build

Expected environment variables:
- OPENAI_API_KEY
- OPENAI_MODEL
- NEXT_PUBLIC_SUPABASE_URL
- SUPABASE_ANON_KEY
- GEMINI_API_KEY
- SMESH_DEMO_DATE=2026-08-31

Environment changes require a new deployment.

## 14. Security

- Never commit .env*.
- Keep API keys server-side.
- No service-role key is required for the demo mutation path.
- Mutation access is constrained to a database function.

## 15. Definition of done

P0:
- business pages use repository provider
- Warehouse available
- Document AI review/confirm flow available
- Mini Slack and Business Email reachable
- Smesh branding consistent
- controlled transaction mutation documented

P1:
- data consistency tests
- responsive/error/loading states
- activity events after confirmation

P2:
- Gemini fallback
- persistent workspace messages
- richer warehouse history

## 16. Non-goals

No Laravel, CRM, payment/billing, WhatsApp, unrestricted database writes, fake random KPI updates, enterprise auth redesign, Hermes/Caveman dependency unless later proven necessary.

## 17. Demo story

Overview → ask AI for today's sales → inspect Inventory → upload receipt in Document AI → review/edit → confirm → database changes → reopen Sales/Inventory → ask AI again and receive updated grounded numbers.
