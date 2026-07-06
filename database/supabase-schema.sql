-- ALSHAYEB SHOP — Schema v3
-- شغّل هذا الملف في Supabase SQL Editor

create table if not exists stores (
  id text primary key,
  user_id uuid references auth.users(id) on delete set null,
  slug text unique not null,
  owner_name text,
  store_name text not null,
  tagline text,
  logo text,
  banner text,
  rating numeric default 5,
  sales integer default 0,
  revenue numeric default 0,
  reviews jsonb default '[]'::jsonb,
  banned boolean default false,
  ban_reason text,
  agreed_commission boolean default false,
  created_at timestamptz default now()
);

create table if not exists products (
  id text primary key,
  store_id text not null references stores(id) on delete cascade,
  title text not null,
  price numeric not null default 0,
  category text,
  featured boolean default false,
  sales integer default 0,
  image text,
  created_at timestamptz default now()
);

create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text,
  email text,
  store_id text references stores(id) on delete set null,
  role text default 'buyer',
  email_verified boolean default false,
  created_at timestamptz default now()
);

create table if not exists cart_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  store_id text not null,
  product_id text not null,
  qty integer default 1,
  unique(user_id, store_id, product_id)
);

create table if not exists orders (
  id text primary key,
  user_id uuid references auth.users(id),
  store_id text references stores(id),
  items jsonb not null default '[]'::jsonb,
  total_syp numeric not null default 0,
  commission_syp numeric not null default 0,
  seller_amount_syp numeric not null default 0,
  payment_method text default 'sham_cash',
  sham_cash_ref text,
  receipt_image text,
  buyer_name text,
  buyer_phone text,
  buyer_address text,
  status text default 'pending',
  created_at timestamptz default now()
);

create index if not exists idx_stores_slug on stores(slug);
create index if not exists idx_stores_banned on stores(banned);
create index if not exists idx_products_store on products(store_id);
create index if not exists idx_orders_status on orders(status);

create or replace function increment_product_sales(p_product_id text, p_qty int default 1)
returns void language plpgsql security definer as $$
begin update products set sales = sales + p_qty where id = p_product_id; end; $$;

create or replace function increment_store_stats(p_store_id text, p_qty int, p_amount numeric)
returns void language plpgsql security definer as $$
begin update stores set sales = sales + p_qty, revenue = revenue + p_amount where id = p_store_id; end; $$;

alter table stores enable row level security;
alter table products enable row level security;
alter table profiles enable row level security;
alter table cart_items enable row level security;
alter table orders enable row level security;

create policy "stores_public_read" on stores for select using (banned = false);
create policy "stores_insert" on stores for insert with check (auth.uid() = user_id);
create policy "stores_update" on stores for update using (auth.uid() = user_id);
create policy "stores_delete" on stores for delete using (auth.uid() = user_id);

create policy "products_public_read" on products for select using (
  exists (select 1 from stores s where s.id = store_id and s.banned = false)
);
create policy "products_insert" on products for insert
  with check (exists (select 1 from stores s where s.id = store_id and s.user_id = auth.uid()));
create policy "products_update" on products for update
  using (exists (select 1 from stores s where s.id = store_id and s.user_id = auth.uid()));
create policy "products_delete" on products for delete
  using (exists (select 1 from stores s where s.id = store_id and s.user_id = auth.uid()));

create policy "profiles_read" on profiles for select using (auth.uid() = id);
create policy "profiles_insert" on profiles for insert with check (auth.uid() = id);
create policy "profiles_update" on profiles for update using (auth.uid() = id);

create policy "cart_all" on cart_items for all using (auth.uid() = user_id);

create policy "orders_insert" on orders for insert with check (auth.uid() = user_id);
create policy "orders_read_own" on orders for select using (auth.uid() = user_id);

create or replace function handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into profiles (id, name, email, email_verified)
  values (new.id, coalesce(new.raw_user_meta_data->>'name', ''), new.email,
    coalesce(new.email_confirmed_at is not null, false));
  return new;
end; $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users for each row execute function handle_new_user();
