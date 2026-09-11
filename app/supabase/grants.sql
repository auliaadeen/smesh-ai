-- Smesh AI — Supabase read access for the Business Partner agent.
-- Run this once in the Supabase SQL Editor (project: pjqhxotxfcacynmsgyah).
--
-- Root cause: SupabaseBusinessRepository queries products/sales/inventory
-- using the anon/publishable key (server-side only — never exposed to the
-- browser). Postgres returned 42501 "permission denied for table X" because
-- the anon role has never been granted SELECT on these tables. This is a
-- privilege grant, separate from and prior to RLS policy evaluation.
--
-- This script grants read-only access. It does NOT grant INSERT/UPDATE/
-- DELETE to anon, and does NOT disable RLS.

grant usage on schema public to anon;

grant select on public.products to anon;
grant select on public.sales to anon;
grant select on public.inventory to anon;

alter table public.products enable row level security;
alter table public.sales enable row level security;
alter table public.inventory enable row level security;

drop policy if exists "anon read products" on public.products;
create policy "anon read products" on public.products
  for select to anon using (true);

drop policy if exists "anon read sales" on public.sales;
create policy "anon read sales" on public.sales
  for select to anon using (true);

drop policy if exists "anon read inventory" on public.inventory;
create policy "anon read inventory" on public.inventory
  for select to anon using (true);
