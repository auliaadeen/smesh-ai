-- Smesh AI — Supabase access policy
-- Run this in the Supabase SQL Editor before testing Document AI confirmation.

grant usage on schema public to anon;

grant select on public.products to anon;
grant select on public.sales to anon;
grant select on public.inventory to anon;

alter table public.products enable row level security;
alter table public.sales enable row level security;
alter table public.inventory enable row level security;

drop policy if exists "anon read products" on public.products;
create policy "anon read products" on public.products for select to anon using (true);

drop policy if exists "anon read sales" on public.sales;
create policy "anon read sales" on public.sales for select to anon using (true);

drop policy if exists "anon read inventory" on public.inventory;
create policy "anon read inventory" on public.inventory for select to anon using (true);

-- Keep table writes closed to anon. The application calls this narrow RPC instead.
create or replace function public.record_smesh_transaction(
  p_product_id text,
  p_quantity integer,
  p_revenue numeric,
  p_transaction_date date,
  p_transaction_type text default 'sale'
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_product_exists boolean;
  v_stock integer;
  v_new_stock integer;
  v_sale_id uuid;
begin
  if p_quantity <= 0 then
    raise exception 'quantity must be greater than zero';
  end if;

  if p_revenue <= 0 then
    raise exception 'revenue must be greater than zero';
  end if;

  if p_transaction_type not in ('sale', 'purchase') then
    raise exception 'unsupported transaction type';
  end if;

  select exists(select 1 from public.products where id = p_product_id and active = true)
    into v_product_exists;

  if not v_product_exists then
    raise exception 'unknown active product: %', p_product_id;
  end if;

  select stock into v_stock
  from public.inventory
  where product_id = p_product_id
  for update;

  if v_stock is null then
    raise exception 'inventory row not found: %', p_product_id;
  end if;

  if p_transaction_type = 'sale' then
    v_new_stock := v_stock - p_quantity;
    if v_new_stock < 0 then
      raise exception 'insufficient stock for product: %', p_product_id;
    end if;
  else
    v_new_stock := v_stock + p_quantity;
  end if;

  if p_transaction_type = 'sale' then
    insert into public.sales (product_id, quantity, revenue, sold_at)
    values (p_product_id, p_quantity, p_revenue, p_transaction_date)
    returning id into v_sale_id;
  end if;

  update public.inventory
  set stock = v_new_stock, updated_at = now()
  where product_id = p_product_id;

  return jsonb_build_object(
    'sale_id', v_sale_id,
    'product_id', p_product_id,
    'quantity', p_quantity,
    'revenue', p_revenue,
    'transaction_type', p_transaction_type,
    'date', p_transaction_date,
    'new_stock', v_new_stock
  );
end;
$$;

revoke all on function public.record_smesh_transaction(text, integer, numeric, date, text) from public;
grant execute on function public.record_smesh_transaction(text, integer, numeric, date, text) to anon;
